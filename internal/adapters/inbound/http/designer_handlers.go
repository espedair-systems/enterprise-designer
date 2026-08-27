package http

import (
	"encoding/json"
	"net/http"

	"arch-base-deploy/internal/core/domain"
	"arch-base-deploy/internal/core/services"

	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"
)

type CreateAppRequest struct {
	WorkspaceID string                 `json:"workspace_id"`
	Name        string                 `json:"name"`
	Slug        string                 `json:"slug"`
	AppType     string                 `json:"app_type"`
	Description string                 `json:"description"`
	LayoutDSL   map[string]interface{} `json:"layout_dsl,omitempty"`
}

type UpdateLayoutRequest struct {
	LayoutVersion string                 `json:"layout_version"`
	Theme         string                 `json:"theme"`
	Slots         domain.LayoutSlotGroup `json:"slots"`
}

// ListDesignerApps returns all apps in a workspace
func (h *Handler) ListDesignerApps(w http.ResponseWriter, r *http.Request) {
	workspaceID := r.URL.Query().Get("workspace_id")
	if workspaceID == "" {
		workspaceID = "ws-designer-default"
	}

	if h.designerRepo == nil {
		writeJSON(w, http.StatusOK, map[string]interface{}{
			"data": []*domain.DesignerApp{},
		})
		return
	}

	apps, err := h.designerRepo.ListApps(r.Context(), workspaceID)
	if err != nil {
		writeError(w, http.StatusInternalServerError, err.Error())
		return
	}

	writeJSON(w, http.StatusOK, map[string]interface{}{
		"data": apps,
	})
}

// CreateDesignerApp creates a new application and optionally scaffolds it
func (h *Handler) CreateDesignerApp(w http.ResponseWriter, r *http.Request) {
	var req CreateAppRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "invalid request body")
		return
	}

	if req.Name == "" {
		writeError(w, http.StatusBadRequest, "application name is required")
		return
	}

	if req.Slug == "" {
		req.Slug = services.GenerateProjectSlug(req.Name)
	}

	if req.WorkspaceID == "" {
		req.WorkspaceID = "ws-designer-default"
	}

	appType := domain.AppType(req.AppType)
	if appType == "" {
		appType = domain.AppTypeStudio
	}

	app := &domain.DesignerApp{
		ID:          "app-" + uuid.New().String()[:8],
		WorkspaceID: req.WorkspaceID,
		Name:        req.Name,
		Slug:        req.Slug,
		AppType:     appType,
		Description: req.Description,
		Status:      domain.AppStatusDraft,
	}

	if h.designerRepo != nil {
		if err := h.designerRepo.CreateApp(r.Context(), app); err != nil {
			writeError(w, http.StatusInternalServerError, err.Error())
			return
		}
	}

	// Trigger template scaffolding if scaffolder is available
	if h.scaffolder != nil {
		scaffoldPath, err := h.scaffolder.ScaffoldNewApp(r.Context(), app, nil)
		if err == nil {
			app.ScaffoldPath = scaffoldPath
			app.Status = domain.AppStatusScaffolded
		}
	}

	writeJSON(w, http.StatusCreated, map[string]interface{}{
		"message": "application created successfully",
		"data":    app,
	})
}

// GetDesignerApp returns an app and its layout by ID
func (h *Handler) GetDesignerApp(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	if h.designerRepo == nil {
		writeError(w, http.StatusNotFound, "app not found")
		return
	}

	app, err := h.designerRepo.GetAppByID(r.Context(), id)
	if err != nil {
		writeError(w, http.StatusNotFound, err.Error())
		return
	}

	layout, _ := h.designerRepo.GetLayoutByAppID(r.Context(), id)

	writeJSON(w, http.StatusOK, map[string]interface{}{
		"app":    app,
		"layout": layout,
	})
}

// UpdateDesignerLayout updates an app's layout DSL
func (h *Handler) UpdateDesignerLayout(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	var req UpdateLayoutRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "invalid layout body")
		return
	}

	if req.LayoutVersion == "" {
		req.LayoutVersion = "1.0.0"
	}
	if req.Theme == "" {
		req.Theme = "dark_modern"
	}

	layout := &domain.DesignerLayout{
		ID:            "layout-" + id,
		AppID:         id,
		LayoutVersion: req.LayoutVersion,
		Theme:         req.Theme,
		Slots:         req.Slots,
	}

	if h.designerRepo != nil {
		if err := h.designerRepo.SaveLayout(r.Context(), layout); err != nil {
			writeError(w, http.StatusInternalServerError, err.Error())
			return
		}
	}

	writeJSON(w, http.StatusOK, map[string]interface{}{
		"message": "layout updated successfully",
		"data":    layout,
	})
}

// DeleteDesignerApp deletes an application
func (h *Handler) DeleteDesignerApp(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	if h.designerRepo != nil {
		if err := h.designerRepo.DeleteApp(r.Context(), id); err != nil {
			writeError(w, http.StatusInternalServerError, err.Error())
			return
		}
	}

	writeJSON(w, http.StatusOK, map[string]interface{}{
		"message": "application deleted successfully",
	})
}
