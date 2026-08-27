package domain

import (
	"time"
)

// OrgUnitType defines the structural level in the organizational hierarchy.
type OrgUnitType string

const (
	OrgEnterprise OrgUnitType = "Enterprise"
	OrgDivision   OrgUnitType = "Division"
	OrgDepartment OrgUnitType = "Department"
	OrgTeam       OrgUnitType = "Team"
	OrgTribe      OrgUnitType = "Agile Tribe"
	OrgSquad      OrgUnitType = "Agile Squad"
)

// OrgUnit represents an organizational entity, division, department, or team.
type OrgUnit struct {
	ID             string      `json:"id"`
	WorkspaceID    string      `json:"workspace_id"`
	Code           string      `json:"code"` // e.g. "ORG-ENG-01"
	Name           string      `json:"name"`
	Type           OrgUnitType `json:"type"`
	ParentID       *string     `json:"parent_id,omitempty"`
	HeadRole       string      `json:"head_role"`       // Workday Role / Person
	CostCenterCode string      `json:"cost_center_code"`// Workday Cost Center
	HeadcountFTE   float64     `json:"headcount_fte"`
	Location       string      `json:"location"`
	Description    string      `json:"description"`
	CreatedAt      time.Time   `json:"created_at"`
	UpdatedAt      time.Time   `json:"updated_at"`

	Children []OrgUnit `json:"children,omitempty"`
}

// BusinessFunction represents a logical grouping of business capabilities/activities independent of organizational structure.
type BusinessFunction struct {
	ID          string    `json:"id"`
	WorkspaceID string    `json:"workspace_id"`
	Code        string    `json:"code"` // e.g. "BF-FIN"
	Name        string    `json:"name"`
	Description string    `json:"description"`
	ParentID    *string   `json:"parent_id,omitempty"`
	Owner       string    `json:"owner"`
	OrgUnitIDs  []string  `json:"org_unit_ids,omitempty"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

// BusinessRole represents a standardized role defined in Workday HCM.
type BusinessRole struct {
	ID                 string    `json:"id"`
	WorkspaceID        string    `json:"workspace_id"`
	Code               string    `json:"code"` // e.g. "ROLE-SOL-ARCH"
	Title              string    `json:"title"`
	Description        string    `json:"description"`
	OrgUnitID          *string   `json:"org_unit_id,omitempty"`
	WorkdayJobProfileID string   `json:"workday_job_profile_id"` // Workday integration link
	StandardRateUSD    float64   `json:"standard_rate_usd"`
	AllocatedFTE       float64   `json:"allocated_fte"`
	CreatedAt          time.Time `json:"created_at"`
	UpdatedAt          time.Time `json:"updated_at"`
}

// Validate checks that the organizational unit has required fields.
func (o *OrgUnit) Validate() error {
	if o.Name == "" {
		return ErrInvalidInput
	}
	if o.HeadcountFTE < 0 {
		return ErrInvalidInput
	}
	return nil
}

// Validate checks that the business function has required fields.
func (f *BusinessFunction) Validate() error {
	if f.Name == "" {
		return ErrInvalidInput
	}
	return nil
}

// Validate checks that the business role has required fields.
func (r *BusinessRole) Validate() error {
	if r.Title == "" {
		return ErrInvalidInput
	}
	if r.AllocatedFTE < 0 {
		return ErrInvalidInput
	}
	return nil
}
