package ai

import "net/http"

func RegisterRoutes(mux *http.ServeMux, handler *AIHandler) {
	mux.HandleFunc("POST /api/check", handler.Check)
}