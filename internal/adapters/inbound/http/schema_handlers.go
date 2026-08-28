package http

import (
	"encoding/json"
	"net/http"
	"sync"
	"time"

	"arch-base-deploy/internal/core/domain"
	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"
)

var (
	schemaMu        sync.RWMutex
	schemaRegistry  = make(map[string]domain.SchemaRegistryItem)
	schemaEndpoints = make(map[string]domain.OpenAPIEndpoint)
)

func init() {
	// Seed Schema Registry Items
	s1ID := "schema-questionnaire-v2"
	schemaRegistry[s1ID] = domain.SchemaRegistryItem{
		ID:          s1ID,
		AppID:       "fleet-logistics",
		Title:       "Enterprise Q Questionnaire & Logic Schema",
		Slug:        "questionnaire-schema",
		SchemaType:  "json_schema",
		Dialect:     "draft-2020-12",
		Version:     "2.0.0",
		Description: "Authoritative JSON Schema for Surveys, Question Banks, and Dynamic Branching Logic Rules.",
		Status:      "published",
		RawPayloadJSON: map[string]interface{}{
			"$schema": "https://json-schema.org/draft/2020-12/schema",
			"title":   "Enterprise Q Questionnaire Schema",
			"type":    "object",
			"required": []string{"title", "slug", "sections"},
			"properties": map[string]interface{}{
				"id":          map[string]interface{}{"type": "string"},
				"title":       map[string]interface{}{"type": "string"},
				"slug":        map[string]interface{}{"type": "string"},
				"version":     map[string]interface{}{"type": "string"},
				"description": map[string]interface{}{"type": "string"},
			},
		},
		CreatedAt: time.Now().Add(-72 * time.Hour),
		UpdatedAt: time.Now().Add(-2 * time.Hour),
	}

	s2ID := "schema-openapi-fleet-v1"
	schemaRegistry[s2ID] = domain.SchemaRegistryItem{
		ID:          s2ID,
		AppID:       "fleet-logistics",
		Title:       "Fleet Telematics & Ingestion OpenAPI 3.1 Spec",
		Slug:        "fleet-telematics-api",
		SchemaType:  "openapi_spec",
		Dialect:     "openapi-3.1",
		Version:     "1.4.0",
		Description: "REST API specification for GPS telematics, driver assignments, and vehicle health metrics.",
		Status:      "published",
		RawPayloadJSON: map[string]interface{}{
			"openapi": "3.1.0",
			"info": map[string]interface{}{
				"title":   "Fleet Telematics API",
				"version": "1.4.0",
			},
		},
		CreatedAt: time.Now().Add(-48 * time.Hour),
		UpdatedAt: time.Now().Add(-1 * time.Hour),
	}

	// Seed OpenAPI Endpoints
	ep1ID := "ep-vehicles-get"
	schemaEndpoints[ep1ID] = domain.OpenAPIEndpoint{
		ID:          ep1ID,
		SchemaID:    s2ID,
		Path:        "/api/v1/vehicles",
		Method:      "GET",
		OperationID: "listVehicles",
		Summary:     "List all registered commercial fleet vehicles",
		Description: "Returns active vehicles with CAN-bus sensor status and current coordinates.",
		Tags:        []string{"Vehicles", "Telematics"},
		Parameters: []domain.OpenAPIParameter{
			{Name: "status", In: "query", Required: false, SchemaType: "string", Description: "Filter by status: active, maintenance, grounded"},
			{Name: "limit", In: "query", Required: false, SchemaType: "integer", Description: "Max records to return"},
		},
		Responses: map[string]interface{}{
			"200": map[string]interface{}{"description": "Successful retrieval of fleet vehicle list"},
			"401": map[string]interface{}{"description": "Unauthorized access token"},
		},
		Security:  []string{"BearerAuth"},
		CreatedAt: time.Now().Add(-48 * time.Hour),
		UpdatedAt: time.Now().Add(-1 * time.Hour),
	}

	ep2ID := "ep-vehicles-post"
	schemaEndpoints[ep2ID] = domain.OpenAPIEndpoint{
		ID:          ep2ID,
		SchemaID:    s2ID,
		Path:        "/api/v1/vehicles",
		Method:      "POST",
		OperationID: "registerVehicle",
		Summary:     "Register a new commercial vehicle unit",
		Description: "Registers VIN, telemetry device IMEI, and assigned depot location.",
		Tags:        []string{"Vehicles"},
		RequestBody: map[string]interface{}{
			"required": true,
			"content": map[string]interface{}{
				"application/json": map[string]interface{}{
					"schema": map[string]interface{}{
						"type":     "object",
						"required": []string{"vin", "model", "depot_id"},
					},
				},
			},
		},
		Responses: map[string]interface{}{
			"201": map[string]interface{}{"description": "Vehicle registered successfully"},
			"400": map[string]interface{}{"description": "Invalid VIN format or missing required fields"},
		},
		Security:  []string{"BearerAuth"},
		CreatedAt: time.Now().Add(-48 * time.Hour),
		UpdatedAt: time.Now().Add(-1 * time.Hour),
	}
}

// ListSchemaRegistriesHandler returns all registered JSON Schemas and OpenAPI specifications.
func ListSchemaRegistriesHandler(w http.ResponseWriter, r *http.Request) {
	schemaMu.RLock()
	defer schemaMu.RUnlock()

	items := make([]domain.SchemaRegistryItem, 0, len(schemaRegistry))
	for _, s := range schemaRegistry {
		items = append(items, s)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(items)
}

// GetSchemaRegistryHandler returns a single schema by ID.
func GetSchemaRegistryHandler(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")

	schemaMu.RLock()
	item, ok := schemaRegistry[id]
	schemaMu.RUnlock()

	if !ok {
		http.Error(w, `{"error":"schema not found"}`, http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(item)
}

// CreateSchemaRegistryHandler registers a new schema definition.
func CreateSchemaRegistryHandler(w http.ResponseWriter, r *http.Request) {
	var input domain.SchemaRegistryItem
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		http.Error(w, `{"error":"invalid request payload"}`, http.StatusBadRequest)
		return
	}

	if input.ID == "" {
		input.ID = "schema-" + uuid.New().String()[:8]
	}
	if input.Status == "" {
		input.Status = "draft"
	}
	if input.Dialect == "" {
		input.Dialect = "draft-2020-12"
	}
	input.CreatedAt = time.Now()
	input.UpdatedAt = time.Now()

	schemaMu.Lock()
	schemaRegistry[input.ID] = input
	schemaMu.Unlock()

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(input)
}

// UpdateSchemaRegistryHandler updates an existing schema definition.
func UpdateSchemaRegistryHandler(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")

	schemaMu.Lock()
	defer schemaMu.Unlock()

	item, ok := schemaRegistry[id]
	if !ok {
		http.Error(w, `{"error":"schema not found"}`, http.StatusNotFound)
		return
	}

	var input domain.SchemaRegistryItem
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		http.Error(w, `{"error":"invalid request payload"}`, http.StatusBadRequest)
		return
	}

	if input.Title != "" {
		item.Title = input.Title
	}
	if input.Slug != "" {
		item.Slug = input.Slug
	}
	if input.Version != "" {
		item.Version = input.Version
	}
	if input.Description != "" {
		item.Description = input.Description
	}
	if input.Status != "" {
		item.Status = input.Status
	}
	if input.RawPayloadJSON != nil {
		item.RawPayloadJSON = input.RawPayloadJSON
	}
	item.UpdatedAt = time.Now()

	schemaRegistry[id] = item

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(item)
}

// DeleteSchemaRegistryHandler removes a schema definition.
func DeleteSchemaRegistryHandler(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")

	schemaMu.Lock()
	defer schemaMu.Unlock()

	if _, ok := schemaRegistry[id]; !ok {
		http.Error(w, `{"error":"schema not found"}`, http.StatusNotFound)
		return
	}

	delete(schemaRegistry, id)

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{"status": "deleted", "id": id})
}

// ListOpenAPIEndpointsHandler returns all endpoints across OpenAPI specs.
func ListOpenAPIEndpointsHandler(w http.ResponseWriter, r *http.Request) {
	schemaMu.RLock()
	defer schemaMu.RUnlock()

	items := make([]domain.OpenAPIEndpoint, 0, len(schemaEndpoints))
	for _, ep := range schemaEndpoints {
		items = append(items, ep)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(items)
}

// CreateOpenAPIEndpointHandler adds a new path operation endpoint.
func CreateOpenAPIEndpointHandler(w http.ResponseWriter, r *http.Request) {
	var input domain.OpenAPIEndpoint
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		http.Error(w, `{"error":"invalid request payload"}`, http.StatusBadRequest)
		return
	}

	if input.ID == "" {
		input.ID = "ep-" + uuid.New().String()[:8]
	}
	input.CreatedAt = time.Now()
	input.UpdatedAt = time.Now()

	schemaMu.Lock()
	schemaEndpoints[input.ID] = input
	schemaMu.Unlock()

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(input)
}

// UpdateOpenAPIEndpointHandler updates an endpoint's parameters, request body, and responses.
func UpdateOpenAPIEndpointHandler(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")

	schemaMu.Lock()
	defer schemaMu.Unlock()

	ep, ok := schemaEndpoints[id]
	if !ok {
		http.Error(w, `{"error":"endpoint not found"}`, http.StatusNotFound)
		return
	}

	var input domain.OpenAPIEndpoint
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		http.Error(w, `{"error":"invalid request payload"}`, http.StatusBadRequest)
		return
	}

	if input.Path != "" {
		ep.Path = input.Path
	}
	if input.Method != "" {
		ep.Method = input.Method
	}
	if input.Summary != "" {
		ep.Summary = input.Summary
	}
	if input.Description != "" {
		ep.Description = input.Description
	}
	if input.Tags != nil {
		ep.Tags = input.Tags
	}
	if input.Parameters != nil {
		ep.Parameters = input.Parameters
	}
	if input.Responses != nil {
		ep.Responses = input.Responses
	}
	ep.UpdatedAt = time.Now()

	schemaEndpoints[id] = ep

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(ep)
}

// DeleteOpenAPIEndpointHandler deletes an endpoint.
func DeleteOpenAPIEndpointHandler(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")

	schemaMu.Lock()
	defer schemaMu.Unlock()

	if _, ok := schemaEndpoints[id]; !ok {
		http.Error(w, `{"error":"endpoint not found"}`, http.StatusNotFound)
		return
	}

	delete(schemaEndpoints, id)

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{"status": "deleted", "id": id})
}
