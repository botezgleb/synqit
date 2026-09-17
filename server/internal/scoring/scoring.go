package scoring

import (
	"math"
)

type ScoreBreakdown struct {
	SpeedScore       int   `json:"speedScore"`
	CleanlinessScore int   `json:"cleanlinessScore"`
	TimePenalty      int   `json:"timePenalty"`
	TotalScore       int   `json:"totalScore"`
	ExecutionMs      int64 `json:"executionMs"`
}

func CalculateScore(isCorrect bool, cleanliness int, executionUs int64, completionTimeSec int, difficulty string) ScoreBreakdown {
	if !isCorrect {
		return ScoreBreakdown{
			SpeedScore:       0,
			CleanlinessScore: 0,
			TimePenalty:      0,
			TotalScore:       0,
			ExecutionMs:      executionUs / 1000,
		}
	}

	speedScore := 1

	switch {
	case executionUs <= 60:
		speedScore = 10
	case executionUs <= 150:
		speedScore = 7
	case executionUs <= 350:
		speedScore = 4
	case executionUs <= 700:
		speedScore = 2
	default:
		speedScore = 1
	}

	if difficulty == "medium" && speedScore < 10 {
		speedScore += 2
	} else if difficulty == "hard" && speedScore < 10 {
		speedScore += 4
		if speedScore > 10 {
			speedScore = 10
		}
	}

	timePenalty := 0
	if completionTimeSec > 120 {
		extraTime := completionTimeSec - 120
		timePenalty = extraTime / 30
		if timePenalty > 5 {
			timePenalty = 5
		}
	}

	difficultyBonus := 1.0
	switch difficulty {
	case "medium":
		difficultyBonus = 1.2
	case "hard":
		difficultyBonus = 1.5
	}

	basePoints := float64(cleanliness + speedScore)
	finalPoints := int(math.Round(basePoints*difficultyBonus)) - timePenalty
	if finalPoints < 0 {
		finalPoints = 0
	}

	return ScoreBreakdown{
		SpeedScore:       speedScore,
		CleanlinessScore: cleanliness,
		TimePenalty:      timePenalty,
		TotalScore:       finalPoints,
		ExecutionMs:      executionUs / 1000,
	}
}