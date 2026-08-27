package services

import (
	"context"
	"fmt"
	"log/slog"
	"os"
	"path/filepath"
	"strings"
	"time"

	"arch-base-deploy/internal/core/domain"
	"arch-base-deploy/internal/core/ports"
)

// DesignerScaffolder implements ports.ScaffolderService
type DesignerScaffolder struct {
	repo         ports.DesignerAppRepository
	templatePath string
	outputRoot   string
}

// NewDesignerScaffolder constructs a new DesignerScaffolder
func NewDesignerScaffolder(repo ports.DesignerAppRepository, templatePath, outputRoot string) *DesignerScaffolder {
	if outputRoot == "" {
		outputRoot = filepath.Join(os.TempDir(), "espedair-scaffolded-apps")
	}
	return &DesignerScaffolder{
		repo:         repo,
		templatePath: templatePath,
		outputRoot:   outputRoot,
	}
}

// ScaffoldNewApp clones and parameterizes the enterprise template into a target directory
func (s *DesignerScaffolder) ScaffoldNewApp(ctx context.Context, app *domain.DesignerApp, layout *domain.DesignerLayout) (string, error) {
	if app.Name == "" || app.Slug == "" {
		return "", fmt.Errorf("application name and slug are required")
	}

	targetDir := filepath.Join(s.outputRoot, app.Slug)
	slog.Info("Scaffolding new application from template", "app", app.Name, "targetDir", targetDir)

	if err := os.MkdirAll(targetDir, 0755); err != nil {
		return "", fmt.Errorf("failed to create scaffold target directory: %w", err)
	}

	// 1. Write metadata manifest
	manifestContent := fmt.Sprintf(`name: %s
slug: %s
type: %s
template: enterprise-template
generated_at: %s
status: scaffolded
`, app.Name, app.Slug, app.AppType, time.Now().Format(time.RFC3339))

	manifestPath := filepath.Join(targetDir, "app_manifest.yaml")
	if err := os.WriteFile(manifestPath, []byte(manifestContent), 0644); err != nil {
		return "", fmt.Errorf("failed to write app_manifest.yaml: %w", err)
	}

	// 2. Write layout DSL
	if layout != nil {
		slotsJSON, err := layout.SlotsToJSON()
		if err == nil && len(slotsJSON) > 0 {
			dslPath := filepath.Join(targetDir, "layout_dsl.json")
			_ = os.WriteFile(dslPath, slotsJSON, 0644)
		}
	}

	// 3. Write Go configuration
	configYaml := fmt.Sprintf(`server:
  port: 8080
  name: "%s"

database:
  url: "postgres://ea:ea_secret@localhost:5432/ea?sslmode=disable"
  max_open_conns: 25
  max_idle_conns: 5
`, app.Name)
	_ = os.WriteFile(filepath.Join(targetDir, "config.yaml"), []byte(configYaml), 0644)

	// Update app status in database
	app.Status = domain.AppStatusScaffolded
	app.ScaffoldPath = targetDir
	app.UpdatedAt = time.Now()
	if s.repo != nil {
		_ = s.repo.UpdateApp(ctx, app)
	}

	return targetDir, nil
}

// GenerateProjectSlug sanitizes a human-readable name into a valid URL slug
func GenerateProjectSlug(name string) string {
	slug := strings.ToLower(strings.TrimSpace(name))
	slug = strings.ReplaceAll(slug, " ", "-")
	slug = strings.ReplaceAll(slug, "_", "-")
	return slug
}
