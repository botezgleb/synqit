package runner

import (
	"fmt"
	"reflect"
	"time"

	"github.com/dop251/goja"
)

type TestCase struct {
	Input    interface{} `json:"input"`
	Expected interface{} `json:"expected"`
}

type RunResult struct {
	Passed      bool        `json:"passed"`
	Actual      interface{} `json:"actual"`
	Expected    interface{} `json:"expected"`
	ExecutionMs int64       `json:"executionMs"`
	Error       string      `json:"error,omitempty"`
}

func RunCode(userCode string, fnName string, tests []TestCase) ([]RunResult, error) {
	vm := goja.New()

	_, err := vm.RunString(userCode)
	if err != nil {
		return nil, fmt.Errorf("usercode compilation error: %w", err)
	}

	val := vm.Get(fnName)
	fn, ok := goja.AssertFunction(val)

	if !ok {
		globalObj := vm.GlobalObject()
		for _, key := range globalObj.Keys() {
			candidate := vm.Get(key)
			if candidateFn, isFn := goja.AssertFunction(candidate); isFn {
				fn = candidateFn
				ok = true
				break
			}
		}
	}

	if !ok {
		return nil, fmt.Errorf("function %s not found", fnName)
	}

	results := make([]RunResult, 0, len(tests))

	for _, test := range tests {
		jsInput := vm.ToValue(test.Input)

		start := time.Now()
		jsResult, err := fn(goja.Undefined(), jsInput)
		duration := time.Since(start)

		execTime := duration.Microseconds()

		if err != nil {
			results = append(results, RunResult{
				Passed:      false,
				Expected:    test.Expected,
				ExecutionMs: execTime,
				Error:       err.Error(),
			})
			continue
		}

		actual := jsResult.Export()
		passed := isEqual(actual, test.Expected)

		results = append(results, RunResult{
			Passed:      passed,
			Actual:      actual,
			Expected:    test.Expected,
			ExecutionMs: execTime,
		})
	}

	return results, nil
}

func isEqual(actual, expected interface{}) bool {
	if reflect.DeepEqual(actual, expected) {
		return true
	}
	return fmt.Sprintf("%v", actual) == fmt.Sprintf("%v", expected)
}