package models

import (
	"time"
)

type Task struct {
	ID 					uint 			 `gorm:"primaryKey" json:"id"`
	Title 			string 		 `gorm:"not null" json:"title"`
	Description string 		 `gorm:"not null" json:"description"`
	Difficulty 	string 		 `gorm:"type:varchar(20);default:'easy'" json:"difficulty"`
	StarterCode string 		 `gorm:"type:text" json:"starter_code"`
	TestCases   []TestCase `gorm:"foreignKey:TaskID;constraint:OnDelete:CASCADE;" json:"test_cases,omitempty"`
	CreatedAt 	time.Time  `json:"created_at"`
}

type TestCase struct {
	ID             uint   `gorm:"primaryKey" json:"id"`
	TaskID         uint   `gorm:"not null;index" json:"task_id"`
	Input          string `gorm:"type:jsonb;not null" json:"input"`
	ExpectedOutput string `gorm:"type:jsonb;not null" json:"expected_output"`
	IsHidden       bool   `gorm:"default:false" json:"is_hidden"`
}