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

func TestSchemaHandlers(t *testing.T) {
	r := chi.NewRouter()
	r.Get("/api/v1/designer/schemas", ListSchemaRegistriesHandler)
	r.Get("/api/v1/designer/schemas/{id}", GetSchemaRegistryHandler)
	r.Post("/api/v1/designer/schemas", CreateSchemaRegistryHandler)
	r.Put("/api/v1/designer/schemas/{id}", UpdateSchemaRegistryHandler)
	r.Delete("/api/v1/designer/schemas/{id}", DeleteSchemaRegistryHandler)

	r.Get("/api/v1/designer/openapi/endpoints", ListOpenAPIEndpointsHandler)
	r.Post("/api/v1/designer/openapi/endpoints", CreateOpenAPIEndpointHandler)
	r.Put("/api/v1/designer/openapi/endpoints/{id}", UpdateOpenAPIEndpointHandler)
	r.Delete("/api/v1/designer/openapi/endpoints/{id}", DeleteOpenAPIEndpointHandler)

	// Test 1: List Schemas
	req := httptest.NewRequest("GET", "/api/v1/designer/schemas", nil)
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)
	if w.Code != http.StatusOK {
		t.Fatalf("expected status 200, got %d", w.Code)
	}

	var schemas []domain.SchemaRegistryItem
	if err := json.NewDecoder(w.Body).Decode(&schemas); err != nil {
		t.Fatalf("failed to decode schemas: %v", err)
	}
	if len(schemas) == 0 {
		t.Fatalf("expected at least 1 seeded schema, got 0")
	}

	// Test 2: Create Schema
	newSchema := domain.SchemaRegistryItem{
		Title:       "Test Device Telematics Schema",
		Slug:        "test-device-schema",
		SchemaType:  "json_schema",
		Dialect:     "draft-2020-12",
		Version:     "1.0.0",
		Description: "Unit test schema definition",
	}
	body, _ := json.Marshal(newSchema)
	req = httptest.NewRequest("POST", "/api/v1/designer/schemas", bytes.NewReader(body))
	w = httptest.NewRecorder()
	r.ServeHTTP(w, req)
	if w.Code != http.StatusCreated {
		t.Fatalf("expected status 201, got %d", w.Code)
	}

	// Test 3: List Endpoints
	req = httptest.NewRequest("GET", "/api/v1/designer/openapi/endpoints", nil)
	w = httptest.NewRecorder()
	r.ServeHTTP(w, req)
	if w.Code != http.StatusOK {
		t.Fatalf("expected status 200, got %d", w.Code)
	}
}
