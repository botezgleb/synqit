package runner

type TaskMock struct {
	ID          string     `json:"id"`
	Title       string     `json:"title"`
	FnName      string     `json:"fnName"`
	Difficulty  string     `json:"difficulty"`
	StarterCode string     `json:"starterCode"`
	TestCases   []TestCase `json:"testCases"`
}

func GetMockTask(id string) *TaskMock {
	switch id {
	case "reverse-string":
		return &TaskMock{
			ID:          "reverse-string",
			Title:       "Разворот строки",
			FnName:      "reverseString",
			StarterCode: "function reverseString(str) {\n  // твой код здесь\n}",
			Difficulty: "easy",
			TestCases: []TestCase{
				{Input: "hello", Expected: "olleh"},
				{Input: "i love you", Expected: "uoy evol i"},
				{Input: "mamma mia guardate ragazzi ha capito come funziona", Expected: "anoiznuf emoc otipac ah izzagar etadraug aim ammam"},
			},
		}

	case "sum-array":
		return &TaskMock{
			ID:          "sum-array",
			Title:       "Сумма элементов массива",
			FnName:      "sumArray",
			StarterCode: "function sumArray(arr) {\n  // твой код здесь\n}",
			Difficulty: "medium",
			TestCases: []TestCase{
				{Input: []interface{}{1, 2, 3, 4}, Expected: float64(10)},
				{Input: []interface{}{10, -5, 5}, Expected: float64(10)},
				{Input: []interface{}{}, Expected: float64(0)},
			},
		}

	default:
		return nil
	}
}