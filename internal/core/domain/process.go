package domain

import (
	"time"
)

// ProcessCategory categorizes business processes according to APQC / TOGAF standards.
type ProcessCategory string

const (
	ProcessCore       ProcessCategory = "Core Operating Process"
	ProcessManagement ProcessCategory = "Management & Governance"
	ProcessSupport    ProcessCategory = "Supporting Process"
)

// ProcessClassification indicates the level of automation and standardization.
type ProcessClassification string

const (
	ProcessAutomated    ProcessClassification = "Fully Automated"
	ProcessSemiAutomated ProcessClassification = "Semi-Automated"
	ProcessManual       ProcessClassification = "Manual"
)

// RACIRole defines a role's accountability in a RACI matrix.
type RACIRole string

const (
	RACIResponsible RACIRole = "Responsible" // The doer
	RACIAccountable  RACIRole = "Accountable"  // The buck stops here
	RACIConsulted    RACIRole = "Consulted"    // In the loop / provides input
	RACIInformed     RACIRole = "Informed"     // Kept updated
)

// RACIAssignment maps a Workday business role / person to a RACI code.
type RACIAssignment struct {
	RoleID   string   `json:"role_id"`
	RoleName string   `json:"role_name"`
	Type     RACIRole `json:"type"`
}

// SIPOC represents Suppliers, Inputs, Process Steps, Outputs, Customers.
type SIPOC struct {
	Suppliers []string `json:"suppliers"`
	Inputs    []string `json:"inputs"`
	Outputs   []string `json:"outputs"`
	Customers []string `json:"customers"`
}

// ProcessStep represents a discrete activity or task within a business process.
type ProcessStep struct {
	ID                 string           `json:"id"`
	ProcessID          string           `json:"process_id"`
	OrderIndex         int              `json:"order_index"`
	Name               string           `json:"name"`
	Description        string           `json:"description"`
	StepType           string           `json:"step_type"` // Task, SubProcess, Gateway, Event
	CycleTimeMinutes   float64          `json:"cycle_time_minutes"`
	AutomationScorePct float64          `json:"automation_score_pct"`
	RACIAssignments    []RACIAssignment `json:"raci_assignments,omitempty"`
}

// BusinessProcess represents a structured, measured set of activities designed to produce a specific business output.
type BusinessProcess struct {
	ID                   string                `json:"id"`
	WorkspaceID          string                `json:"workspace_id"`
	Code                 string                `json:"code"` // e.g. "PROC-FIN-01"
	Name                 string                `json:"name"`
	Description          string                `json:"description"`
	Category             ProcessCategory       `json:"category"`
	Classification       ProcessClassification `json:"classification"`
	ParentProcessID      *string               `json:"parent_process_id,omitempty"`
	AssociatedCapabilityID *string             `json:"associated_capability_id,omitempty"`
	AssociatedValueStageID *string             `json:"associated_value_stage_id,omitempty"`
	OwnerRole            string                `json:"owner_role"` // Workday Role
	SIPOC                SIPOC                 `json:"sipoc"`
	Steps                []ProcessStep         `json:"steps,omitempty"`
	AvgCycleTimeMinutes  float64               `json:"avg_cycle_time_minutes"`
	OverallAutomationPct float64               `json:"overall_automation_pct"`
	PainPoints           []string              `json:"pain_points,omitempty"`
	Tags                 []string              `json:"tags,omitempty"`
	CreatedAt            time.Time             `json:"created_at"`
	UpdatedAt            time.Time             `json:"updated_at"`
}

// Validate checks that the business process properties are valid.
func (p *BusinessProcess) Validate() error {
	if p.Name == "" {
		return ErrInvalidInput
	}
	if p.AvgCycleTimeMinutes < 0 {
		return ErrInvalidInput
	}
	if p.OverallAutomationPct < 0.0 || p.OverallAutomationPct > 100.0 {
		return ErrInvalidInput
	}
	return nil
}
