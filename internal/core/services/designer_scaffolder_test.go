package services

import (
	"context"
	"os"
	"path/filepath"
	"testing"
	"time"

	"arch-base-deploy/internal/core/domain"

	"github.com/stretchr/testify/assert"
)

func TestDesignerScaffolder_ScaffoldNewApp(t *testing.T) {
	tempDir, err := os.MkdirTemp("", "scaffolder-test-*")
	assert.NoError(t, err)
	defer os.RemoveAll(tempDir)

	scaffolder := NewDesignerScaffolder(nil, "", tempDir)

	app := &domain.DesignerApp{
		ID:          "app-fleet-1",
		WorkspaceID: "ws-default",
		Name:        "Fleet Telemetry Studio",
		Slug:        "fleet-telemetry",
		AppType:     domain.AppTypeStudio,
		Description: "Real-time fleet tracking and IoT sensors",
		Status:      domain.AppStatusDraft,
		CreatedAt:   time.Now(),
		UpdatedAt:   time.Now(),
	}

	layout := &domain.DesignerLayout{
		ID:            "layout-1",
		AppID:         "app-fleet-1",
		LayoutVersion: "1.0.0",
		Theme:         "dark_modern",
		Slots: domain.LayoutSlotGroup{
			Rail: domain.RailSlotConfig{
				Items: []domain.RailItem{
					{ID: "fleet_map", Icon: "Map", Label: "Fleet Map"},
				},
			},
		},
	}

	ctx := context.Background()
	targetPath, err := scaffolder.ScaffoldNewApp(ctx, app, layout)
	assert.NoError(t, err)
	assert.NotEmpty(t, targetPath)
	assert.Equal(t, domain.AppStatusScaffolded, app.Status)

	// Check created files
	manifestFile := filepath.Join(targetPath, "app_manifest.yaml")
	assert.FileExists(t, manifestFile)

	dslFile := filepath.Join(targetPath, "layout_dsl.json")
	assert.FileExists(t, dslFile)

	configFile := filepath.Join(targetPath, "config.yaml")
	assert.FileExists(t, configFile)
}

func TestGenerateProjectSlug(t *testing.T) {
	assert.Equal(t, "fleet-logistics-studio", GenerateProjectSlug("Fleet Logistics Studio"))
	assert.Equal(t, "customer-concierge-agent", GenerateProjectSlug("Customer_Concierge Agent"))
}
