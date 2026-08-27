package http

import (
	"fmt"
	"net/http"
	"os"
	"path/filepath"
	"time"

	"arch-base-deploy/internal/core/services"

	"github.com/go-chi/chi/v5"
)

// ExportAppSource generates the complete Go backend + React project and packages a .zip archive
func (h *Handler) ExportAppSource(w http.ResponseWriter, r *http.Request) {
	appID := chi.URLParam(r, "id")
	if h.designerRepo == nil {
		writeError(w, http.StatusNotFound, "designer repository not configured")
		return
	}

	app, err := h.designerRepo.GetAppByID(r.Context(), appID)
	if err != nil {
		writeError(w, http.StatusNotFound, "application not found: "+err.Error())
		return
	}

	layout, _ := h.designerRepo.GetLayoutByAppID(r.Context(), appID)

	generator := services.NewCodeGeneratorService(h.designerRepo)

	outputRoot := filepath.Join(os.TempDir(), "espedair-exports", app.Slug)
	_ = os.MkdirAll(outputRoot, 0755)

	projectDir, err := generator.GenerateFullProject(r.Context(), app, layout, outputRoot)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "code generation failed: "+err.Error())
		return
	}

	zipPath := filepath.Join(outputRoot, app.Slug+".zip")
	if err := generator.CreateZipArchive(projectDir, zipPath); err != nil {
		writeError(w, http.StatusInternalServerError, "zip packaging failed: "+err.Error())
		return
	}

	writeJSON(w, http.StatusOK, map[string]interface{}{
		"app_id":        app.ID,
		"app_name":      app.Name,
		"slug":          app.Slug,
		"project_dir":   projectDir,
		"zip_path":      zipPath,
		"status":        "packaged",
		"generated_at":  time.Now().UTC().Format(time.RFC3339),
	})
}

// ExportAppBinary compiles the application into a standalone release binary
func (h *Handler) ExportAppBinary(w http.ResponseWriter, r *http.Request) {
	appID := chi.URLParam(r, "id")
	if h.designerRepo == nil {
		writeError(w, http.StatusNotFound, "designer repository not configured")
		return
	}

	app, err := h.designerRepo.GetAppByID(r.Context(), appID)
	if err != nil {
		writeError(w, http.StatusNotFound, "application not found: "+err.Error())
		return
	}

	layout, _ := h.designerRepo.GetLayoutByAppID(r.Context(), appID)

	generator := services.NewCodeGeneratorService(h.designerRepo)
	builder := services.NewBinaryBuilderService("")

	outputRoot := filepath.Join(os.TempDir(), "espedair-builds", app.Slug)
	_ = os.MkdirAll(outputRoot, 0755)

	projectDir, err := generator.GenerateFullProject(r.Context(), app, layout, outputRoot)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "code generation failed: "+err.Error())
		return
	}

	binPath, err := builder.BuildSingleExecutable(r.Context(), projectDir, app)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "binary compilation failed: "+err.Error())
		return
	}

	writeJSON(w, http.StatusOK, map[string]interface{}{
		"app_id":       app.ID,
		"app_name":     app.Name,
		"slug":         app.Slug,
		"binary_path":  binPath,
		"status":       "compiled",
		"target_arch":  "linux/amd64",
		"instructions": fmt.Sprintf("chmod +x %s && %s", binPath, binPath),
		"generated_at": time.Now().UTC().Format(time.RFC3339),
	})
}
