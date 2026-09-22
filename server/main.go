package main

import (
	"bufio"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"strings"

	"server/internal/ai"
	"server/internal/db"
)

func main() {
	if err := loadEnv(".env"); err != nil {
		log.Println("Предупреждение: .env файл не прочитан:", err)
	}
	
	database := db.InitDB()
	_ = database

	port := os.Getenv("SERVER_PORT")
	if port == "" {
		port = "3000"
	}

	clientURL := os.Getenv("CLIENT_URL")
	if clientURL == "" {
		clientURL = "http://localhost:5173"
	}

	mux := http.NewServeMux()

	mux.HandleFunc("GET /api/health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		json.NewEncoder(w).Encode(map[string]string{
			"status":  "ok",
			"message": "server is healthy",
		})
	})

	aiService := ai.NewAIService()
	aiHandler := ai.NewAIHandler(aiService)
	ai.RegisterRoutes(mux, aiHandler)

	handlerWithCORS := enableCORS(mux, clientURL)

	fmt.Printf("Server is running on http://localhost:%s\n", port)
	err := http.ListenAndServe(":"+port, handlerWithCORS)
	if err != nil {
		log.Fatalf("Server has been crushed. Error: %v", err)
	}
}

func loadEnv(filename string) error {
	file, err := os.Open(filename)
	if err != nil {
		return err
	}
	defer file.Close()

	scanner := bufio.NewScanner(file)
	for scanner.Scan() {
		line := strings.TrimSpace(scanner.Text())

		if line == "" || strings.HasPrefix(line, "#") {
			continue
		}

		parts := strings.SplitN(line, "=", 2)
		if len(parts) == 2 {
			key := strings.TrimSpace(parts[0])
			value := strings.TrimSpace(parts[1])
			value = strings.Trim(value, `"'`)
			os.Setenv(key, value)
		}
	}
	return scanner.Err()
}

func enableCORS(next http.Handler, allowedOrigin string) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", allowedOrigin)
		w.Header().Set("Access-Control-Allow-Credentials", "true")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")

		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusOK)
			return
		}

		next.ServeHTTP(w, r)
	})
}