package ai

import (
	"encoding/json"
	"log"
	"net/http"

	"server/internal/runner"
	"server/internal/scoring"
)

type EvaluateRequest struct {
	TaskID            string `json:"taskId"`
	Task              string `json:"task"`
	Code              string `json:"code"`
	CompletionTimeSec int    `json:"completionTimeSec"`
}

type AIHandler struct {
	service *AIService
}

func NewAIHandler(service *AIService) *AIHandler {
	return &AIHandler{service: service}
}

func (h *AIHandler) Check(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	var req EvaluateRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		log.Printf("[ERROR] Ошибка декодирования JSON: %v", err)
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"error": "Невалидный JSON запрос"})
		return
	}

	targetTaskID := req.TaskID
	if targetTaskID == "" && req.Task != "" {
		targetTaskID = "reverse-string"
	}

	if targetTaskID == "" || req.Code == "" {
		log.Printf("[ERROR] Валидация не пройдена! TaskID/Task или Code пустые.")
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"error": "Поля taskId/task и code обязательны"})
		return
	}

	task := runner.GetMockTask(targetTaskID)
	if task == nil {
		w.WriteHeader(http.StatusNotFound)
		json.NewEncoder(w).Encode(map[string]string{"error": "Задача не найдена"})
		return
	}

	log.Printf("[Evaluate] Запуск проверки для задачи: \"%s\" (%s)", task.Title, task.ID)

	runResults, runErr := runner.RunCode(req.Code, task.FnName, task.TestCases)
	if runErr != nil {
		log.Printf("[Evaluate] Ошибка синтаксиса JS: %v", runErr)
		w.WriteHeader(http.StatusOK)
		json.NewEncoder(w).Encode(map[string]any{
			"isCorrect":   false,
			"cleanliness": 1,
			"performance": 0,
			"executionMs": 0,
			"feedback":    "Синтаксическая ошибка в JS: " + runErr.Error(),
		})
		return
	}

	allPassed := true
	var totalExecutionUs int64 = 0
	for _, res := range runResults {
		totalExecutionUs += res.ExecutionMs
		if !res.Passed {
			allPassed = false
		}
	}

	var avgExecutionUs int64 = 0
	if len(runResults) > 0 {
		avgExecutionUs = totalExecutionUs / int64(len(runResults))
	}

	aiResult, aiErr := h.service.EvaluateCode(task.Title, req.Code)
	if aiErr != nil {
		log.Printf("[AI Error]: %v", aiErr)
		aiResult = &EvaluationResult{
			Cleanliness: 5,
			Feedback:    "Тесты проверены, но сервис ИИ временно недоступен для разбора стиля.",
		}
	}

	completionSec := req.CompletionTimeSec
	if completionSec <= 0 {
		completionSec = 60
	}

	difficulty := task.Difficulty
	if difficulty == "" {
		difficulty = "easy"
	}

	scoreData := scoring.CalculateScore(
    allPassed,
    aiResult.Cleanliness,
    avgExecutionUs,
    completionSec,
    difficulty,
	)

	response := map[string]any{
    "isCorrect":   allPassed,
    "cleanliness": scoreData.CleanlinessScore,
    "performance": scoreData.SpeedScore,
    "executionMs": scoreData.ExecutionMs,
    "score":       scoreData,
    "feedback":    aiResult.Feedback,
    "testResults": runResults,
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(response)
}