package domain

import (
	"time"
)

// CapabilityLevel represents the hierarchical depth of a business capability (L1 to L4).
type CapabilityLevel int

const (
	Level1 CapabilityLevel = 1
	Level2 CapabilityLevel = 2
	Level3 CapabilityLevel = 3
	Level4 CapabilityLevel = 4
)

// PaceLayer represents the Gartner PACE classification.
type PaceLayer string

const (
	PaceInnovation      PaceLayer = "System of Innovation"
	PaceDifferentiation PaceLayer = "System of Differentiation"
	PaceRecord          PaceLayer = "System of Record"
)

// StrategicImportance represents how critical the capability is to market differentiation.
type StrategicImportance string

const (
	StrategicCore            StrategicImportance = "Core Advantage"
	StrategicDifferentiating StrategicImportance = "Differentiating"
	StrategicParity          StrategicImportance = "Market Parity"
	StrategicCommodity       StrategicImportance = "Commodity"
)

// Capability represents an enterprise business capability defining "what" a business does.
type Capability struct {
	ID                  string              `json:"id"`
	WorkspaceID         string              `json:"workspace_id"`
	Code                string              `json:"code"` // e.g. "CAP-01.02"
	Name                string              `json:"name"`
	Description         string              `json:"description"`
	ParentID            *string             `json:"parent_id,omitempty"`
	Level               CapabilityLevel     `json:"level"`
	PaceLayer           PaceLayer           `json:"pace_layer"`
	StrategicImportance StrategicImportance `json:"strategic_importance"`
	CurrentMaturity     float64             `json:"current_maturity"` // 1.0 to 5.0
	TargetMaturity      float64             `json:"target_maturity"`  // 1.0 to 5.0
	InvestmentPriority  string              `json:"investment_priority"` // High, Medium, Low, Maintain
	RiskScore           float64             `json:"risk_score"`          // 1.0 to 5.0
	BusinessOwner       string              `json:"business_owner"`      // Workday Role / Person
	OrgUnitID           *string             `json:"org_unit_id,omitempty"`
	Tags                []string            `json:"tags"`
	CreatedAt           time.Time           `json:"created_at"`
	UpdatedAt           time.Time           `json:"updated_at"`

	// Derived / populated hierarchically
	Children []Capability `json:"children,omitempty"`
}

// Validate checks that the capability adheres to enterprise architecture guidelines.
func (c *Capability) Validate() error {
	if c.Name == "" {
		return ErrInvalidInput
	}
	if c.Level < 1 || c.Level > 4 {
		return ErrInvalidInput
	}
	if c.CurrentMaturity < 0.0 || c.CurrentMaturity > 5.0 {
		return ErrInvalidInput
	}
	if c.TargetMaturity < 0.0 || c.TargetMaturity > 5.0 {
		return ErrInvalidInput
	}
	return nil
}

// CapabilityGap represents a maturity gap requiring transformation investment.
type CapabilityGap struct {
	CapabilityID   string  `json:"capability_id"`
	CapabilityCode string  `json:"capability_code"`
	CapabilityName string  `json:"capability_name"`
	CurrentMaturity float64 `json:"current_maturity"`
	TargetMaturity  float64 `json:"target_maturity"`
	GapDelta        float64 `json:"gap_delta"`
	UrgencyScore    float64 `json:"urgency_score"`
	RecommendedAction string `json:"recommended_action"`
}

// CapabilityHeatmapCell represents a cell in a capability heatmap matrix.
type CapabilityHeatmapCell struct {
	CapabilityID        string              `json:"capability_id"`
	Code                string              `json:"code"`
	Name                string              `json:"name"`
	Level               CapabilityLevel     `json:"level"`
	CurrentMaturity     float64             `json:"current_maturity"`
	TargetMaturity      float64             `json:"target_maturity"`
	StrategicImportance StrategicImportance `json:"strategic_importance"`
	PaceLayer           PaceLayer           `json:"pace_layer"`
	InvestmentPriority  string              `json:"investment_priority"`
	HealthColor         string              `json:"health_color"` // green, yellow, red, blue
}
