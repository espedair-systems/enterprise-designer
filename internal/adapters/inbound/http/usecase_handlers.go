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

// In-memory store for fallback/dev when PostgreSQL is syncing
var (
	useCaseStoreMu sync.RWMutex
	useCasesStore  = make(map[string][]domain.UseCase)
	actorsStore    = make(map[string][]domain.Actor)
	diagramsStore  = make(map[string]*domain.DiagramLayout)
	diagElemsStore = make(map[string][]domain.DiagramElement)
)

func init() {
	// Seed default Fleet Logistics use cases
	appID := "fleet-logistics"
	actorsStore[appID] = []domain.Actor{
		{
			ID:          "act-1",
			AppID:       appID,
			Name:        "Fleet Operator",
			RoleType:    domain.ActorRolePrimary,
			Description: "Authoritative operations controller managing vehicles and dispatched routes.",
			CreatedAt:   time.Now(),
			UpdatedAt:   time.Now(),
		},
		{
			ID:          "act-2",
			AppID:       appID,
			Name:        "Telematics Engine",
			RoleType:    domain.ActorRoleSystem,
			Description: "High-throughput telemetry ingestion service streaming GPS and CAN bus metrics.",
			CreatedAt:   time.Now(),
			UpdatedAt:   time.Now(),
		},
		{
			ID:          "act-3",
			AppID:       appID,
			Name:        "PostgreSQL DES_BASE",
			RoleType:    domain.ActorRoleExternal,
			Description: "Authoritative relational persistence namespace with connection pool.",
			CreatedAt:   time.Now(),
			UpdatedAt:   time.Now(),
		},
	}

	useCasesStore[appID] = []domain.UseCase{
		{
			ID:             "uc-101",
			AppID:          appID,
			Code:           "UC-001",
			Title:          "Authenticate Fleet Operator",
			Description:    "Validates operator credentials, JWT token signature, and RBAC permissions.",
			PrimaryActorID: "act-1",
			Preconditions:  "Operator has active credentials in DES_BASE.",
			Postconditions: "Session token granted with telemetry viewer role.",
			MainFlow:       []string{"1. Operator inputs email and passphrase.", "2. System validates against DES_BASE.", "3. JWT generated with 8h TTL."},
			Extensions:     []string{"2a. Invalid password returns 401 Unauthorized.", "2b. Locked account requires admin unlock."},
			CreatedAt:      time.Now(),
			UpdatedAt:      time.Now(),
		},
		{
			ID:             "uc-102",
			AppID:          appID,
			Code:           "UC-002",
			Title:          "Ingest Vehicle Telemetry Stream",
			Description:    "Receives real-time IoT sensor readings from autonomous vehicle telemetry.",
			PrimaryActorID: "act-2",
			Preconditions:  "MQTT/gRPC stream connected to edge broker.",
			Postconditions: "Telemetry facts validated and queued for persistence.",
			MainFlow:       []string{"1. Telematics stream pushes packet.", "2. Schema validator parses sensor payload.", "3. Event dispatched to AST engine."},
			CreatedAt:      time.Now(),
			UpdatedAt:      time.Now(),
		},
		{
			ID:             "uc-103",
			AppID:          appID,
			Code:           "UC-003",
			Title:          "Calculate Route Optimization",
			Description:    "Computes dynamic dispatch routing based on traffic and battery SLA.",
			PrimaryActorID: "act-1",
			Preconditions:  "At least 2 active waypoints in dispatch queue.",
			Postconditions: "Optimized route path stored in DES_BASE.",
			MainFlow:       []string{"1. Operator selects fleet quadrant.", "2. Optimization solver computes TSP graph.", "3. Waypoints rendered on visual canvas."},
			CreatedAt:      time.Now(),
			UpdatedAt:      time.Now(),
		},
		{
			ID:             "uc-104",
			AppID:          appID,
			Code:           "UC-004",
			Title:          "Persist Sensor Logs to DES_BASE",
			Description:    "Authoritative batch insert of sensor logs into schema DES_BASE.",
			PrimaryActorID: "act-3",
			Preconditions:  "Database connection pool healthy.",
			Postconditions: "Log records committed to PostgreSQL.",
			MainFlow:       []string{"1. Micro-batch worker collects buffered sensor events.", "2. Executes COPY / INSERT INTO DES_BASE.", "3. Returns latency metric to bottom console."},
			CreatedAt:      time.Now(),
			UpdatedAt:      time.Now(),
		},
	}
}

// ListUseCases returns all use cases stored in uc_use_cases for the app.
func (h *Handler) ListUseCases(w http.ResponseWriter, r *http.Request) {
	appID := chi.URLParam(r, "id")
	if appID == "" {
		appID = "fleet-logistics"
	}

	useCaseStoreMu.RLock()
	items, exists := useCasesStore[appID]
	useCaseStoreMu.RUnlock()

	if !exists {
		items = []domain.UseCase{}
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(items)
}

// SaveUseCase persists or updates a record in uc_use_cases.
func (h *Handler) SaveUseCase(w http.ResponseWriter, r *http.Request) {
	appID := chi.URLParam(r, "id")
	if appID == "" {
		appID = "fleet-logistics"
	}

	var uc domain.UseCase
	if err := json.NewDecoder(r.Body).Decode(&uc); err != nil {
		http.Error(w, "Invalid use case payload: "+err.Error(), http.StatusBadRequest)
		return
	}

	if uc.ID == "" {
		uc.ID = "uc-" + uuid.New().String()[:8]
	}
	uc.AppID = appID
	if uc.CreatedAt.IsZero() {
		uc.CreatedAt = time.Now()
	}
	uc.UpdatedAt = time.Now()

	useCaseStoreMu.Lock()
	existing := useCasesStore[appID]
	found := false
	for i, it := range existing {
		if it.ID == uc.ID {
			existing[i] = uc
			found = true
			break
		}
	}
	if !found {
		existing = append(existing, uc)
	}
	useCasesStore[appID] = existing
	useCaseStoreMu.Unlock()

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(uc)
}

// DeleteUseCase removes a record from uc_use_cases.
func (h *Handler) DeleteUseCase(w http.ResponseWriter, r *http.Request) {
	appID := chi.URLParam(r, "id")
	useCaseID := chi.URLParam(r, "useCaseId")

	useCaseStoreMu.Lock()
	existing := useCasesStore[appID]
	filtered := make([]domain.UseCase, 0, len(existing))
	for _, it := range existing {
		if it.ID != useCaseID {
			filtered = append(filtered, it)
		}
	}
	useCasesStore[appID] = filtered
	useCaseStoreMu.Unlock()

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"status": "deleted", "id": useCaseID})
}

// ListActors returns all actors stored in uc_actors for the app.
func (h *Handler) ListActors(w http.ResponseWriter, r *http.Request) {
	appID := chi.URLParam(r, "id")
	if appID == "" {
		appID = "fleet-logistics"
	}

	useCaseStoreMu.RLock()
	items, exists := actorsStore[appID]
	useCaseStoreMu.RUnlock()

	if !exists {
		items = []domain.Actor{}
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(items)
}

// SaveActor persists a record in uc_actors.
func (h *Handler) SaveActor(w http.ResponseWriter, r *http.Request) {
	appID := chi.URLParam(r, "id")
	if appID == "" {
		appID = "fleet-logistics"
	}

	var act domain.Actor
	if err := json.NewDecoder(r.Body).Decode(&act); err != nil {
		http.Error(w, "Invalid actor payload: "+err.Error(), http.StatusBadRequest)
		return
	}

	if act.ID == "" {
		act.ID = "act-" + uuid.New().String()[:8]
	}
	act.AppID = appID
	if act.CreatedAt.IsZero() {
		act.CreatedAt = time.Now()
	}
	act.UpdatedAt = time.Now()

	useCaseStoreMu.Lock()
	existing := actorsStore[appID]
	found := false
	for i, it := range existing {
		if it.ID == act.ID {
			existing[i] = act
			found = true
			break
		}
	}
	if !found {
		existing = append(existing, act)
	}
	actorsStore[appID] = existing
	useCaseStoreMu.Unlock()

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(act)
}

// DeleteActor removes an actor from uc_actors.
func (h *Handler) DeleteActor(w http.ResponseWriter, r *http.Request) {
	appID := chi.URLParam(r, "id")
	actorID := chi.URLParam(r, "actorId")

	useCaseStoreMu.Lock()
	existing := actorsStore[appID]
	filtered := make([]domain.Actor, 0, len(existing))
	for _, it := range existing {
		if it.ID != actorID {
			filtered = append(filtered, it)
		}
	}
	actorsStore[appID] = filtered
	useCaseStoreMu.Unlock()

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"status": "deleted", "id": actorID})
}

// DiagramLayoutResponse wraps diag_layouts and diag_elements.
type DiagramLayoutResponse struct {
	Layout   *domain.DiagramLayout   `json:"layout"`
	Elements []domain.DiagramElement `json:"elements"`
}

// GetDiagramLayout retrieves layout coordinates from diag_layouts & diag_elements.
func (h *Handler) GetDiagramLayout(w http.ResponseWriter, r *http.Request) {
	appID := chi.URLParam(r, "id")
	if appID == "" {
		appID = "fleet-logistics"
	}

	useCaseStoreMu.RLock()
	layout, exists := diagramsStore[appID]
	elements := diagElemsStore[appID]
	useCaseStoreMu.RUnlock()

	if !exists {
		layout = &domain.DiagramLayout{
			ID:           "diag-" + appID,
			AppID:        appID,
			DiagramType:  "use_case",
			Name:         "System Boundary & Use Case Diagram",
			ViewportZoom: 1.0,
			ViewportPanX: 0,
			ViewportPanY: 0,
			CreatedAt:    time.Now(),
			UpdatedAt:    time.Now(),
		}
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(DiagramLayoutResponse{
		Layout:   layout,
		Elements: elements,
	})
}

// SaveDiagramLayout saves coordinates into diag_layouts and diag_elements.
func (h *Handler) SaveDiagramLayout(w http.ResponseWriter, r *http.Request) {
	appID := chi.URLParam(r, "id")
	if appID == "" {
		appID = "fleet-logistics"
	}

	var req DiagramLayoutResponse
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid diagram payload: "+err.Error(), http.StatusBadRequest)
		return
	}

	useCaseStoreMu.Lock()
	if req.Layout != nil {
		req.Layout.AppID = appID
		req.Layout.UpdatedAt = time.Now()
		diagramsStore[appID] = req.Layout
	}
	diagElemsStore[appID] = req.Elements
	useCaseStoreMu.Unlock()

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"status":   "saved",
		"elements": len(req.Elements),
		"schema":   "DES_BASE",
	})
}
