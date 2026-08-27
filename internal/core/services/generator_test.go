package services

import (
	"context"
	"os"
	"path/filepath"
	"testing"
	"time"

	"arch-base-deploy/internal/core/domain"
)

func TestCodeGeneratorService_GenerateFullProjectAndZip(t *testing.T) {
	tempDir, err := os.MkdirTemp("", "generator-test-*")
	if err != nil {
		t.Fatalf("failed to create temp dir: %v", err)
	}
	defer os.RemoveAll(tempDir)

	gen := NewCodeGeneratorService(nil)

	app := &domain.DesignerApp{
		ID:          "app-test-1",
		WorkspaceID: "ws-test",
		Name:        "Fleet Telemetry Studio",
		Slug:        "fleet-telemetry",
		AppType:     domain.AppTypeStudio,
		Description: "Autonomous fleet tracking studio",
		Status:      domain.AppStatusDraft,
		CreatedAt:   time.Now(),
		UpdatedAt:   time.Now(),
	}

	layout := &domain.DesignerLayout{
		ID:            "layout-test-1",
		AppID:         "app-test-1",
		LayoutVersion: "1.0.0",
		Theme:         "dark_modern",
		Slots: domain.LayoutSlotGroup{
			MenuBar: domain.MenuBarSlotConfig{
				Menus:   []string{"File", "Edit", "Tools"},
				Actions: []string{"Save", "Export"},
			},
		},
	}

	projectDir, err := gen.GenerateFullProject(context.Background(), app, layout, tempDir)
	if err != nil {
		t.Fatalf("GenerateFullProject failed: %v", err)
	}

	// Verify generated files exist
	if _, err := os.Stat(filepath.Join(projectDir, "go.mod")); os.IsNotExist(err) {
		t.Errorf("go.mod was not generated")
	}
	if _, err := os.Stat(filepath.Join(projectDir, "cmd", "fleet-telemetry", "main.go")); os.IsNotExist(err) {
		t.Errorf("cmd/fleet-telemetry/main.go was not generated")
	}
	if _, err := os.Stat(filepath.Join(projectDir, "config.yaml")); os.IsNotExist(err) {
		t.Errorf("config.yaml was not generated")
	}
	if _, err := os.Stat(filepath.Join(projectDir, "Makefile")); os.IsNotExist(err) {
		t.Errorf("Makefile was not generated")
	}
	if _, err := os.Stat(filepath.Join(projectDir, "layout_dsl.json")); os.IsNotExist(err) {
		t.Errorf("layout_dsl.json was not generated")
	}

	// Test Zip Archive Generation
	zipPath := filepath.Join(tempDir, "fleet-telemetry.zip")
	if err := gen.CreateZipArchive(projectDir, zipPath); err != nil {
		t.Fatalf("CreateZipArchive failed: %v", err)
	}

	if fi, err := os.Stat(zipPath); os.IsNotExist(err) || fi.Size() == 0 {
		t.Errorf("zip archive was not created or is empty")
	}
}

func TestBinaryBuilderService(t *testing.T) {
	tempDir, err := os.MkdirTemp("", "builder-test-*")
	if err != nil {
		t.Fatalf("failed to create temp dir: %v", err)
	}
	defer os.RemoveAll(tempDir)

	builder := NewBinaryBuilderService(tempDir)

	app := &domain.DesignerApp{
		ID:   "app-test-2",
		Name: "EA Agent",
		Slug: "ea-agent",
	}

	binPath, err := builder.BuildSingleExecutable(context.Background(), tempDir, app)
	if err != nil {
		t.Fatalf("BuildSingleExecutable failed: %v", err)
	}

	if _, err := os.Stat(binPath); os.IsNotExist(err) {
		t.Errorf("compiled binary does not exist at %s", binPath)
	}
}
