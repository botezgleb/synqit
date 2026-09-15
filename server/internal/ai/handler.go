package ai

import (
	"encoding/json"
	"log"
	"net/http"
)

type EvaluateRequest struct {
	Task string `json:"task"`
	Code string `json:"code"`
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
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"error": "Невалидный JSON запрос"})
		return
	}

	if req.Task == "" || req.Code == "" {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"error": "Поля task и code обязательны"})
		return
	}

	taskLog := req.Task
	if len(taskLog) > 30 {
		taskLog = taskLog[:30] + "..."
	}
	log.Printf("[AI] Получен код на проверку для задачи: \"%s\"", taskLog)

	result, err := h.service.EvaluateCode(req.Task, req.Code)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{"error": err.Error()})
		return
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(result)
}