package ai

import (
	"bytes"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"strings"
	"time"
)

type EvaluationResult struct {
	Cleanliness int    `json:"cleanliness"`
	Feedback    string `json:"feedback"`
}

type AIService struct {
	httpClient *http.Client
}

func NewAIService() *AIService {
	return &AIService{
		httpClient: &http.Client{Timeout: 30 * time.Second},
	}
}

func (s *AIService) EvaluateCode(task, userCode string) (*EvaluationResult, error) {
	log.Println("[AI Service] Пробуем проверить чистоту кода через основного провайдера (Gemini)...")
	result, err := s.tryGemini(task, userCode)
	if err == nil {
		return result, nil
	}

	log.Printf("[AI Service] Ошибка Gemini: %v. Переключаемся на Cohere...\n", err)

	cohereResult, cohereErr := s.tryCohere(task, userCode)
	if cohereErr == nil {
		return cohereResult, nil
	}

	return nil, fmt.Errorf("все ИИ-сервисы недоступны. Gemini: %v; Cohere: %v", err, cohereErr)
}

// Gemini
func (s *AIService) tryGemini(task, userCode string) (*EvaluationResult, error) {
	apiKey := os.Getenv("GEMINI_API_KEY")
	if apiKey == "" {
		return nil, errors.New("GEMINI_API_KEY отсутствует в env")
	}

	url := "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent?key=" + apiKey

	prompt := fmt.Sprintf(`
Ты — Senior JavaScript ментор, проверяющий код на чистый стиль и читаемость.
ЗАДАЧА: "%s"
КОД УЧАСТНИКА: "%s"

ТВОЯ ЗАДАЧА:
1. Оцени чистоту и стиль кода (cleanliness) по шкале от 1 до 10:
   - Использование понятных имен переменных
   - Отсутствие мусорного/дублирующегося кода
   - Лаконичность и соблюдение JS-стандартов

2. Напиши краткий отзыв (feedback):
   - НЕ давай готовый код и не называй напрямую точные исправления.
   - Дай наводящий совет по улучшению стиля, читаемости или логики.
   - Максимум 2 коротких предложения на русском языке.

Верни ответ СТРОГО в формате JSON:
{
  "cleanliness": number,
  "feedback": "string"
}`, task, userCode)

	reqBody := map[string]any{
		"contents": []map[string]any{
			{"parts": []map[string]string{{"text": prompt}}},
		},
		"generationConfig": map[string]any{
			"responseMimeType": "application/json",
			"temperature":      0.0,
		},
	}

	jsonBytes, _ := json.Marshal(reqBody)
	resp, err := s.httpClient.Post(url, "application/json", bytes.NewBuffer(jsonBytes))
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		return nil, fmt.Errorf("статус %d: %s", resp.StatusCode, string(body))
	}

	var geminiResp struct {
		Candidates []struct {
			Content struct {
				Parts []struct {
					Text string `json:"text"`
				} `json:"parts"`
			} `json:"content"`
		} `json:"candidates"`
	}

	if err := json.NewDecoder(resp.Body).Decode(&geminiResp); err != nil {
		return nil, err
	}

	if len(geminiResp.Candidates) == 0 || len(geminiResp.Candidates[0].Content.Parts) == 0 {
		return nil, errors.New("Gemini вернул пустой ответ")
	}

	return parseJSONResponse(geminiResp.Candidates[0].Content.Parts[0].Text)
}

// Cohere
func (s *AIService) tryCohere(task, userCode string) (*EvaluationResult, error) {
	apiKey := os.Getenv("AI_API_KEY")
	if apiKey == "" {
		return nil, errors.New("AI_API_KEY отсутствует в env")
	}

	prompt := fmt.Sprintf(`
Ты — Senior JavaScript ментор, проверяющий код на чистый стиль и читаемость.
ЗАДАЧА: "%s"
КОД УЧАСТНИКА: "%s"

ТВОЯ ЗАДАЧА:
1. Оцени чистоту и стиль кода (cleanliness) по шкале от 1 до 10. Если код написан идеально в плане читаемости, то смело ставь 10, не надо снижать баллы за отсутствие JSDoc или за названия переменных, если они не мешают читаемости кода.
2. Напиши краткий наводящий отзыв (feedback) без готового кода (максимум 2 предложения на русском языке).

Верни ответ СТРОГО в формате JSON без разметки markdown:
{
  "cleanliness": number,
  "feedback": "string"
}`, task, userCode)

	reqBody := map[string]any{
		"model": "command-a-plus-05-2026",
		"messages": []map[string]string{
			{"role": "user", "content": prompt},
		},
		"temperature": 0.0,
		"response_format": map[string]string{
			"type": "json_object",
		},
	}

	jsonBytes, _ := json.Marshal(reqBody)
	req, err := http.NewRequest("POST", "https://api.cohere.com/v2/chat", bytes.NewBuffer(jsonBytes))
	if err != nil {
		return nil, err
	}

	req.Header.Set("Authorization", "Bearer "+apiKey)
	req.Header.Set("Content-Type", "application/json")

	resp, err := s.httpClient.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		return nil, fmt.Errorf("статус %d: %s", resp.StatusCode, string(body))
	}

	var cohereResp struct {
		Message struct {
			Content []struct {
				Type string `json:"type"`
				Text string `json:"text"`
			} `json:"content"`
		} `json:"message"`
	}

	if err := json.NewDecoder(resp.Body).Decode(&cohereResp); err != nil {
		return nil, err
	}

	var text string
	for _, block := range cohereResp.Message.Content {
		if block.Type == "text" {
			text = block.Text
			break
		}
	}

	return parseJSONResponse(text)
}

func parseJSONResponse(raw string) (*EvaluationResult, error) {
	clean := strings.TrimSpace(raw)
	clean = strings.TrimPrefix(clean, "```json")
	clean = strings.TrimPrefix(clean, "```")
	clean = strings.TrimSuffix(clean, "```")
	clean = strings.TrimSpace(clean)

	var res EvaluationResult
	if err := json.Unmarshal([]byte(clean), &res); err != nil {
		return nil, fmt.Errorf("ошибка парсинга JSON: %v. Сырой ответ: %s", err, raw)
	}

	return &res, nil
}