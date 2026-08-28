package domain

import (
	"time"
)

// ActorRoleType represents the classification of a UML Actor.
type ActorRoleType string

const (
	ActorRolePrimary  ActorRoleType = "primary"
	ActorRoleSystem   ActorRoleType = "system"
	ActorRoleExternal ActorRoleType = "external"
)

// UseCaseRelType represents UML Use Case relationship types.
type UseCaseRelType string

const (
	RelAssociation    UseCaseRelType = "association"
	RelInclude        UseCaseRelType = "include"
	RelExtend         UseCaseRelType = "extend"
	RelGeneralization UseCaseRelType = "generalization"
)

// Actor represents a participant or system interacting with use cases (stored in uc_actors).
type Actor struct {
	ID          string        `json:"id"`
	AppID       string        `json:"app_id"`
	Name        string        `json:"name"`
	RoleType    ActorRoleType `json:"role_type"`
	Description string        `json:"description"`
	CreatedAt   time.Time     `json:"created_at"`
	UpdatedAt   time.Time     `json:"updated_at"`
}

// UseCase represents a discrete capability or functional goal (stored in uc_use_cases).
type UseCase struct {
	ID             string    `json:"id"`
	AppID          string    `json:"app_id"`
	Code           string    `json:"code"`
	Title          string    `json:"title"`
	Description    string    `json:"description"`
	PrimaryActorID string    `json:"primary_actor_id,omitempty"`
	Preconditions  string    `json:"preconditions,omitempty"`
	Postconditions string    `json:"postconditions,omitempty"`
	MainFlow       []string  `json:"main_flow,omitempty"`
	Extensions     []string  `json:"extensions,omitempty"`
	CreatedAt      time.Time `json:"created_at"`
	UpdatedAt      time.Time `json:"updated_at"`
}

// UseCaseRelationship represents links between actors and use cases (stored in uc_relationships).
type UseCaseRelationship struct {
	ID        string         `json:"id"`
	AppID     string         `json:"app_id"`
	SourceID  string         `json:"source_id"`
	TargetID  string         `json:"target_id"`
	RelType   UseCaseRelType `json:"rel_type"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
}

// DiagramLayout represents a visual canvas layout metadata (stored in diag_layouts).
type DiagramLayout struct {
	ID           string    `json:"id"`
	AppID        string    `json:"app_id"`
	DiagramType  string    `json:"diagram_type"`
	Name         string    `json:"name"`
	ViewportZoom float64   `json:"viewport_zoom"`
	ViewportPanX float64   `json:"viewport_pan_x"`
	ViewportPanY float64   `json:"viewport_pan_y"`
	CreatedAt    time.Time `json:"created_at"`
	UpdatedAt    time.Time `json:"updated_at"`
}

// DiagramElement represents visual placement and styling of nodes (stored in diag_elements).
type DiagramElement struct {
	ID         string                 `json:"id"`
	DiagramID  string                 `json:"diagram_id"`
	EntityID   string                 `json:"entity_id"`
	EntityType string                 `json:"entity_type"`
	PosX       float64                `json:"pos_x"`
	PosY       float64                `json:"pos_y"`
	Width      float64                `json:"width"`
	Height     float64                `json:"height"`
	StyleProps map[string]interface{} `json:"style_props,omitempty"`
	CreatedAt  time.Time              `json:"created_at"`
	UpdatedAt  time.Time              `json:"updated_at"`
}
