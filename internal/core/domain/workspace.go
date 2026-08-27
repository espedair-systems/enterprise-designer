package domain

import (
	"time"
)

// Workspace represents an isolated multi-tenant architecture repository.
type Workspace struct {
	ID          string    `json:"id"`
	Name        string    `json:"name"`
	Description string    `json:"description"`
	Industry    string    `json:"industry"` // e.g. Banking, Retail, Healthcare
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

// AuditEntry tracks business architecture mutations.
type AuditEntry struct {
	ID          string    `json:"id"`
	WorkspaceID string    `json:"workspace_id"`
	EntityType  string    `json:"entity_type"`
	EntityID    string    `json:"entity_id"`
	Action      string    `json:"action"` // CREATE, UPDATE, DELETE
	PerformedBy string    `json:"performed_by"`
	Timestamp   time.Time `json:"timestamp"`
	Details     string    `json:"details"`
}

// SchemaInfo represents dynamic PostgreSQL schema metadata with table count.
type SchemaInfo struct {
	Name        string `json:"name"`
	Description string `json:"description"`
	TablesCount int    `json:"tables_count"`
	Status      string `json:"status"`
	IsActive    bool   `json:"is_active"`
}
