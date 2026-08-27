package domain

import (
	"encoding/json"
	"time"
)

// AppType represents the target application archetype.
type AppType string

const (
	AppTypeStudio      AppType = "studio"
	AppTypeAgent       AppType = "agent"
	AppTypeDataModeler AppType = "datamodeler"
)

// AppStatus represents the lifecycle state of a designed application.
type AppStatus string

const (
	AppStatusDraft      AppStatus = "draft"
	AppStatusScaffolded AppStatus = "scaffolded"
	AppStatusPublished  AppStatus = "published"
)

// DesignerApp represents a custom Studio or Agent application defined in the designer.
type DesignerApp struct {
	ID           string    `json:"id"`
	WorkspaceID  string    `json:"workspace_id"`
	Name         string    `json:"name"`
	Slug         string    `json:"slug"`
	AppType      AppType   `json:"app_type"`
	Description  string    `json:"description"`
	Status       AppStatus `json:"status"`
	ScaffoldPath string    `json:"scaffold_path,omitempty"`
	CreatedAt    time.Time `json:"created_at"`
	UpdatedAt    time.Time `json:"updated_at"`
}

// DesignerLayout represents the layout and slot placement DSL for an application.
type DesignerLayout struct {
	ID            string          `json:"id"`
	AppID         string          `json:"app_id"`
	LayoutVersion string          `json:"layout_version"`
	Theme         string          `json:"theme"`
	Slots         LayoutSlotGroup `json:"slots"`
	CreatedAt     time.Time       `json:"created_at"`
	UpdatedAt     time.Time       `json:"updated_at"`
}

// LayoutSlotGroup maps the 5 primary customizable shell regions.
type LayoutSlotGroup struct {
	Rail         RailSlotConfig         `json:"rail"`
	MenuBar      MenuBarSlotConfig      `json:"menu_bar"`
	SidebarLeft  SidebarSlotConfig      `json:"sidebar_left"`
	SidebarRight SidebarSlotConfig      `json:"sidebar_right"`
	Canvas       CanvasSlotConfig       `json:"canvas"`
	BottomTray   BottomTraySlotConfig   `json:"bottom_tray"`
	RawJSON      map[string]interface{} `json:"raw_json,omitempty"`
}

// RailSlotConfig defines tools pinned to the left-most Activity Rail.
type RailSlotConfig struct {
	Items []RailItem `json:"items"`
}

// RailItem is an icon/tool entry in the Activity Rail.
type RailItem struct {
	ID            string `json:"id"`
	Icon          string `json:"icon"`
	Label         string `json:"label"`
	TargetSidebar string `json:"target_sidebar,omitempty"`
	TargetCanvas  string `json:"target_canvas,omitempty"`
}

// MenuBarSlotConfig defines global dropdowns and action triggers.
type MenuBarSlotConfig struct {
	Menus   []string `json:"menus"`
	Actions []string `json:"actions"`
}

// SidebarSlotConfig defines panels in the left or right collapsible drawers.
type SidebarSlotConfig struct {
	DefaultPanel string   `json:"default_panel"`
	Panels       []string `json:"panels"`
}

// CanvasSlotConfig defines the central multi-mode canvas.
type CanvasSlotConfig struct {
	Mode    string                 `json:"mode"`
	Widgets []CanvasWidgetInstance `json:"widgets"`
}

// CanvasWidgetInstance represents a placed low-code component on the canvas.
type CanvasWidgetInstance struct {
	ID     string                 `json:"id"`
	Type   string                 `json:"type"`
	X      int                    `json:"x"`
	Y      int                    `json:"y"`
	Width  int                    `json:"width"`
	Height int                    `json:"height"`
	Title  string                 `json:"title"`
	Props  map[string]interface{} `json:"props,omitempty"`
}

// BottomTraySlotConfig defines panels in the footer console.
type BottomTraySlotConfig struct {
	Panels []string `json:"panels"`
}

// DesignerDatasource represents an external or embedded database connection.
type DesignerDatasource struct {
	ID            string    `json:"id"`
	WorkspaceID   string    `json:"workspace_id"`
	Name          string    `json:"name"`
	DBType        string    `json:"db_type"` // postgres, snowflake, bigquery, mysql
	ConnectionURI string    `json:"connection_uri"`
	SchemaName    string    `json:"schema_name"`
	CreatedAt     time.Time `json:"created_at"`
	UpdatedAt     time.Time `json:"updated_at"`
}

// ParseSlotsFromJSON unmarshals raw JSONB into structured LayoutSlotGroup.
func (l *DesignerLayout) ParseSlotsFromJSON(data []byte) error {
	if len(data) == 0 {
		return nil
	}
	return json.Unmarshal(data, &l.Slots)
}

// ToJSON serializes LayoutSlotGroup to JSONB bytes.
func (l *DesignerLayout) SlotsToJSON() ([]byte, error) {
	return json.Marshal(l.Slots)
}
