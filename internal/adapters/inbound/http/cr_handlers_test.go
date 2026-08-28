package http

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"os"
	"path/filepath"
	"testing"

	"arch-base-deploy/internal/adapters/outbound/exporters"
	"arch-base-deploy/internal/adapters/outbound/memory"
	"arch-base-deploy/internal/config"
	"arch-base-deploy/internal/core/services"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestCreateAndListChangeRequests(t *testing.T) {
	tempDir, err := os.MkdirTemp("", "cr_test_*")
	require.NoError(t, err)
	defer os.RemoveAll(tempDir)

	cfg := config.DefaultConfig()
	cfg.CR.Path = filepath.Join(tempDir, "CR")
	cfg.CR.Prefix = "cr-"
	cfg.CR.Digits = 4

	repo := memory.NewMemoryRepository()
	svc := services.NewBusinessArchitectureService(repo)
	exp := exporters.NewExporter(repo)
	h := NewHandler(repo, svc, exp, cfg)
	router := SetupRouter(h, nil)

	// 1. Create first CR
	cr1Payload := CreateCRRequest{
		Title:       "Test CR Visual Canvas",
		Content:     "### UI Location Reference\n- Application: Enterprise Designer",
		Description: "Please add a zoom slider to the canvas",
		ViewID:      "visual_canvas",
		AppName:     "Fleet Logistics Studio",
	}
	body1, _ := json.Marshal(cr1Payload)
	req1, _ := http.NewRequest(http.MethodPost, "/api/v1/cr", bytes.NewBuffer(body1))
	req1.Header.Set("Content-Type", "application/json")
	rr1 := httptest.NewRecorder()
	router.ServeHTTP(rr1, req1)

	assert.Equal(t, http.StatusCreated, rr1.Code)
	var resp1 CreateCRResponse
	err = json.Unmarshal(rr1.Body.Bytes(), &resp1)
	require.NoError(t, err)
	assert.Equal(t, "cr-0001.md", resp1.Filename)
	assert.Equal(t, 1, resp1.Index)

	// Verify file content on disk
	content1, err := os.ReadFile(resp1.FilePath)
	require.NoError(t, err)
	assert.Contains(t, string(content1), "# Change Request: Test CR Visual Canvas")
	assert.Contains(t, string(content1), "**CR ID**: `cr-0001`")
	assert.Contains(t, string(content1), "Please add a zoom slider to the canvas")

	// 2. Create second CR
	cr2Payload := CreateCRRequest{
		Title:       "Second CR ER Modeler",
		Content:     "### UI Location Reference\n- View: er_modeler",
		Description: "Add foreign key auto completion",
		ViewID:      "er_modeler",
	}
	body2, _ := json.Marshal(cr2Payload)
	req2, _ := http.NewRequest(http.MethodPost, "/api/v1/cr", bytes.NewBuffer(body2))
	req2.Header.Set("Content-Type", "application/json")
	rr2 := httptest.NewRecorder()
	router.ServeHTTP(rr2, req2)

	assert.Equal(t, http.StatusCreated, rr2.Code)
	var resp2 CreateCRResponse
	err = json.Unmarshal(rr2.Body.Bytes(), &resp2)
	require.NoError(t, err)
	assert.Equal(t, "cr-0002.md", resp2.Filename)
	assert.Equal(t, 2, resp2.Index)

	// 3. List CRs
	reqList, _ := http.NewRequest(http.MethodGet, "/api/v1/cr", nil)
	rrList := httptest.NewRecorder()
	router.ServeHTTP(rrList, reqList)

	assert.Equal(t, http.StatusOK, rrList.Code)
	var listResp struct {
		Data  []CRSummary `json:"data"`
		Count int         `json:"count"`
	}
	err = json.Unmarshal(rrList.Body.Bytes(), &listResp)
	require.NoError(t, err)
	assert.Equal(t, 2, listResp.Count)
	assert.Len(t, listResp.Data, 2)
}
