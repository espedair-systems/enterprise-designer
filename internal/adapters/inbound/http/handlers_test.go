package http

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"arch-base-deploy/internal/adapters/outbound/exporters"
	"arch-base-deploy/internal/adapters/outbound/memory"
	"arch-base-deploy/internal/core/domain"
	"arch-base-deploy/internal/core/services"

	"github.com/stretchr/testify/assert"
)

func setupTestRouter() http.Handler {
	repo := memory.NewMemoryRepository()
	svc := services.NewBusinessArchitectureService(repo)
	exp := exporters.NewExporter(repo)
	h := NewHandler(repo, svc, exp)
	return SetupRouter(h, nil)
}

func TestHTTPHealthCheck(t *testing.T) {
	router := setupTestRouter()

	req, _ := http.NewRequest(http.MethodGet, "/api/v1/health", nil)
	rr := httptest.NewRecorder()
	router.ServeHTTP(rr, req)

	assert.Equal(t, http.StatusOK, rr.Code)
	var resp map[string]any
	_ = json.Unmarshal(rr.Body.Bytes(), &resp)
	assert.Equal(t, "healthy", resp["status"])
}

func TestHTTPListCapabilities(t *testing.T) {
	router := setupTestRouter()

	req, _ := http.NewRequest(http.MethodGet, "/api/v1/capabilities?workspace_id=ws-default", nil)
	rr := httptest.NewRecorder()
	router.ServeHTTP(rr, req)

	assert.Equal(t, http.StatusOK, rr.Code)
	var list []domain.Capability
	_ = json.Unmarshal(rr.Body.Bytes(), &list)
	assert.NotEmpty(t, list)
}

func TestHTTPSaveCapabilityValidation(t *testing.T) {
	router := setupTestRouter()

	// Invalid: Empty name
	invalidCap := map[string]any{
		"code":             "CAP-ERR",
		"name":             "",
		"level":            1,
		"current_maturity": 3.0,
	}
	body, _ := json.Marshal(invalidCap)
	req, _ := http.NewRequest(http.MethodPost, "/api/v1/capabilities?workspace_id=ws-default", bytes.NewReader(body))
	req.Header.Set("Content-Type", "application/json")
	rr := httptest.NewRecorder()
	router.ServeHTTP(rr, req)

	assert.Equal(t, http.StatusBadRequest, rr.Code)

	// Valid Capability
	validCap := domain.Capability{
		Code:            "CAP-VAL-01",
		Name:            "Valid Testing Capability",
		Level:           domain.Level2,
		CurrentMaturity: 3.5,
		TargetMaturity:  4.5,
	}
	validBody, _ := json.Marshal(validCap)
	reqValid, _ := http.NewRequest(http.MethodPost, "/api/v1/capabilities?workspace_id=ws-default", bytes.NewReader(validBody))
	reqValid.Header.Set("Content-Type", "application/json")
	rrValid := httptest.NewRecorder()
	router.ServeHTTP(rrValid, reqValid)

	assert.Equal(t, http.StatusOK, rrValid.Code)
}

func TestHTTPGetCapabilityNotFound(t *testing.T) {
	router := setupTestRouter()

	req, _ := http.NewRequest(http.MethodGet, "/api/v1/capabilities/non-existent-cap-id?workspace_id=ws-default", nil)
	rr := httptest.NewRecorder()
	router.ServeHTTP(rr, req)

	assert.Equal(t, http.StatusNotFound, rr.Code)
}
