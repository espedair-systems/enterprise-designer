package domain

import (
	"time"
)

// HorizonType classifies initiatives in the McKinsey Three Horizons framework.
type HorizonType string

const (
	Horizon1Core        HorizonType = "Horizon 1 (Core Operations)"
	Horizon2Emerging    HorizonType = "Horizon 2 (Emerging Growth)"
	Horizon3Transform   HorizonType = "Horizon 3 (Future Transformation)"
)

// InitiativeStatus tracks the delivery lifecycle.
type InitiativeStatus string

const (
	StatusProposed  InitiativeStatus = "Proposed"
	StatusApproved  InitiativeStatus = "Approved"
	StatusActive    InitiativeStatus = "In Progress"
	StatusCompleted InitiativeStatus = "Completed"
	StatusOnHold    InitiativeStatus = "On Hold"
)

// TransformationMilestone represents a key milestone in an initiative.
type TransformationMilestone struct {
	Title        string    `json:"title"`
	TargetDate   string    `json:"target_date"` // YYYY-MM-DD
	IsCompleted  bool      `json:"is_completed"`
	Deliverable  string    `json:"deliverable"`
}

// CapabilityImpact indicates expected uplift on a target capability.
type CapabilityImpact struct {
	CapabilityID string  `json:"capability_id"`
	UpliftDelta  float64 `json:"uplift_delta"` // e.g. +1.5 maturity points
}

// Initiative represents a strategic program or business transformation investment.
type Initiative struct {
	ID                    string                    `json:"id"`
	WorkspaceID           string                    `json:"workspace_id"`
	Code                  string                    `json:"code"` // e.g. "INIT-DIGITAL-ONBOARD"
	Name                  string                    `json:"name"`
	Description           string                    `json:"description"`
	Horizon               HorizonType               `json:"horizon"`
	Status                InitiativeStatus          `json:"status"`
	BudgetUSD             float64                   `json:"budget_usd"`
	ExpectedROI           string                    `json:"expected_roi"`
	StartDate             string                    `json:"start_date"` // YYYY-MM-DD
	TargetCompletionDate  string                    `json:"target_completion_date"`
	SponsorRole           string                    `json:"sponsor_role"` // Workday Executive Role
	LeadArchitect         string                    `json:"lead_architect"`
	Milestones            []TransformationMilestone `json:"milestones,omitempty"`
	ImpactedCapabilityIDs []string                  `json:"impacted_capability_ids,omitempty"`
	TargetObjectiveIDs    []string                  `json:"target_objective_ids,omitempty"`
	TargetValueStreamIDs  []string                  `json:"target_value_stream_ids,omitempty"`
	CreatedAt             time.Time                 `json:"created_at"`
	UpdatedAt             time.Time                 `json:"updated_at"`
}
