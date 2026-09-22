package db

import (
	"fmt"
	"log"
	"os"

	"server/internal/models"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

var DB *gorm.DB

func InitDB() *gorm.DB {
	host := getEnv("DB_HOST", "localhost")
	user := getEnv("DB_USER", "synqit")
	password := os.Getenv("DB_PASSWORD")
	dbname := getEnv("DB_NAME", "synqit_db")
	port := getEnv("DB_PORT", "5432")

	if password == "" {
		log.Fatal("[DB Fatal Error] Переменная окружения DB_PASSWORD не установлена")
	}

	dsn := fmt.Sprintf(
		"host=%s user=%s password=%s dbname=%s port=%s sslmode=disable TimeZone=UTC",
		host, user, password, dbname, port,
	)

	database, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatalf("[DB Error] Не удалось подключиться к PostgreSQL: %v", err)
	}

	log.Println("[DB] Успешное подключение к PostgreSQL")

	err = database.AutoMigrate(
		&models.User{},
		&models.Task{},
		&models.TestCase{},
	)
	if err != nil {
		log.Fatalf("[DB Error] Ошибка автомиграции: %v", err)
	}

	log.Println("[DB] Автомиграция таблиц завершена")

	DB = database
	return database
}

func getEnv(key, defaultValue string) string {
	if value, exists := os.LookupEnv(key); exists {
		return value
	}
	return defaultValue
}