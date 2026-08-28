package http

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"arch-base-deploy/internal/core/domain"
	"github.com/go-chi/chi/v5"
)

func TestQuestHandlers(t *testing.T) {
	r := chi.NewRouter()
	r.Get("/designer/q/surveys", ListQuestSurveysHandler)
	r.Post("/designer/q/surveys", CreateQuestSurveyHandler)
	r.Get("/designer/q/surveys/{id}", GetQuestSurveyHandler)
	r.Put("/designer/q/surveys/{id}", UpdateQuestSurveyHandler)
	r.Delete("/designer/q/surveys/{id}", DeleteQuestSurveyHandler)
	r.Get("/designer/q/question-bank", ListQuestQuestionBankHandler)
	r.Get("/designer/q/reference-data", ListQuestReferenceDataHandler)
	r.Get("/designer/q/submissions", ListQuestSubmissionsHandler)

	// 1. List Surveys
	req, _ := http.NewRequest("GET", "/designer/q/surveys", nil)
	rr := httptest.NewRecorder()
	r.ServeHTTP(rr, req)
	if rr.Code != http.StatusOK {
		t.Fatalf("Expected status 200, got %d", rr.Code)
	}

	var surveys []domain.QuestSurvey
	if err := json.Unmarshal(rr.Body.Bytes(), &surveys); err != nil {
		t.Fatalf("Failed to decode surveys: %v", err)
	}
	if len(surveys) == 0 {
		t.Fatal("Expected seeded surveys, got 0")
	}

	// 2. Create New Survey
	newSurvey := domain.QuestSurvey{
		Title:       "Test Ingestion Questionnaire",
		Description: "Testing autosave and persistence",
		Status:      "draft",
	}
	body, _ := json.Marshal(newSurvey)
	req2, _ := http.NewRequest("POST", "/designer/q/surveys", bytes.NewBuffer(body))
	req2.Header.Set("Content-Type", "application/json")
	rr2 := httptest.NewRecorder()
	r.ServeHTTP(rr2, req2)
	if rr2.Code != http.StatusCreated {
		t.Fatalf("Expected status 201, got %d", rr2.Code)
	}

	var created domain.QuestSurvey
	json.Unmarshal(rr2.Body.Bytes(), &created)
	if created.ID == "" {
		t.Fatal("Expected generated survey ID")
	}

	// 3. Question Bank List
	req3, _ := http.NewRequest("GET", "/designer/q/question-bank", nil)
	rr3 := httptest.NewRecorder()
	r.ServeHTTP(rr3, req3)
	if rr3.Code != http.StatusOK {
		t.Fatalf("Expected status 200, got %d", rr3.Code)
	}

	// 4. Submissions List
	req4, _ := http.NewRequest("GET", "/designer/q/submissions", nil)
	rr4 := httptest.NewRecorder()
	r.ServeHTTP(rr4, req4)
	if rr4.Code != http.StatusOK {
		t.Fatalf("Expected status 200, got %d", rr4.Code)
	}
}
