package domain

import (
	"encoding/json"
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
)

func TestDesignerApp_DomainSerialization(t *testing.T) {
	app := DesignerApp{
		ID:          "app-101",
		WorkspaceID: "ws-default",
		Name:        "Fleet Logistics Studio",
		Slug:        "fleet-logistics",
		AppType:     AppTypeStudio,
		Description: "Real-time dispatch and fleet telemetry",
		Status:      AppStatusDraft,
		CreatedAt:   time.Now(),
		UpdatedAt:   time.Now(),
	}

	assert.Equal(t, "fleet-logistics", app.Slug)
	assert.Equal(t, AppTypeStudio, app.AppType)
	assert.Equal(t, AppStatusDraft, app.Status)

	bytes, err := json.Marshal(app)
	assert.NoError(t, err)

	var decoded DesignerApp
	err = json.Unmarshal(bytes, &decoded)
	assert.NoError(t, err)
	assert.Equal(t, app.ID, decoded.ID)
	assert.Equal(t, app.Name, decoded.Name)
}

func TestDesignerLayout_SlotsJSONSerialization(t *testing.T) {
	layout := DesignerLayout{
		ID:            "layout-101",
		AppID:         "app-101",
		LayoutVersion: "1.0.0",
		Theme:         "dark_modern",
		Slots: LayoutSlotGroup{
			Rail: RailSlotConfig{
				Items: []RailItem{
					{ID: "explorer", Icon: "Folder", Label: "Explorer"},
					{ID: "designer", Icon: "Layout", Label: "Canvas"},
				},
			},
			MenuBar: MenuBarSlotConfig{
				Menus:   []string{"File", "Edit", "Schema"},
				Actions: []string{"Save", "Deploy"},
			},
			SidebarLeft: SidebarSlotConfig{
				DefaultPanel: "Navigator Tree",
				Panels:       []string{"Navigator Tree", "Toolbox"},
			},
			Canvas: CanvasSlotConfig{
				Mode: "visual_builder",
				Widgets: []CanvasWidgetInstance{
					{ID: "table-1", Type: "table", X: 100, Y: 100, Width: 400, Height: 300, Title: "Dispatches"},
				},
			},
		},
	}

	jsonBytes, err := layout.SlotsToJSON()
	assert.NoError(t, err)
	assert.NotEmpty(t, jsonBytes)

	var newLayout DesignerLayout
	err = newLayout.ParseSlotsFromJSON(jsonBytes)
	assert.NoError(t, err)
	assert.Equal(t, 2, len(newLayout.Slots.Rail.Items))
	assert.Equal(t, "explorer", newLayout.Slots.Rail.Items[0].ID)
	assert.Equal(t, 1, len(newLayout.Slots.Canvas.Widgets))
	assert.Equal(t, "Dispatches", newLayout.Slots.Canvas.Widgets[0].Title)
}
