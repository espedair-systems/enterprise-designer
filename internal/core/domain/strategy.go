package domain

import (
	"time"
)

// DriverCategory categorizes strategic motivators.
type DriverCategory string

const (
	DriverMarketDemand    DriverCategory = "Market Demand"
	DriverTechInnovation  DriverCategory = "Technological Innovation"
	DriverRegulatory      DriverCategory = "Regulatory & Compliance"
	DriverCostEfficiency  DriverCategory = "Cost & Operational Efficiency"
	DriverCustomerExpect  DriverCategory = "Customer Expectations"
)

// StrategicDriver represents an internal or external condition motivating strategic action.
type StrategicDriver struct {
	ID          string         `json:"id"`
	WorkspaceID string         `json:"workspace_id"`
	Code        string         `json:"code"` // e.g. "DRV-AI-FIRST"
	Name        string         `json:"name"`
	Category    DriverCategory `json:"category"`
	ImpactLevel string         `json:"impact_level"` // High, Medium, Low
	Description string         `json:"description"`
	CreatedAt   time.Time      `json:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at"`
}

// StrategicGoal represents a high-level strategic outcome an enterprise aims to achieve.
type StrategicGoal struct {
	ID          string    `json:"id"`
	WorkspaceID string    `json:"workspace_id"`
	Code        string    `json:"code"` // e.g. "GOAL-EXPAND-EMEA"
	Title       string    `json:"title"`
	Description string    `json:"description"`
	DriverIDs   []string  `json:"driver_ids,omitempty"`
	HorizonYear int       `json:"horizon_year"` // Target completion year e.g. 2027
	OwnerRole   string    `json:"owner_role"`   // Workday Executive Role
	TargetMetric string   `json:"target_metric"`
	ProgressPct float64   `json:"progress_pct"` // 0.0 to 100.0
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

// KeyResult represents a measurable outcome tracking progress toward an Objective.
type KeyResult struct {
	ID           string    `json:"id"`
	ObjectiveID  string    `json:"objective_id"`
	Title        string    `json:"title"`
	MetricName   string    `json:"metric_name"`
	StartValue   float64   `json:"start_value"`
	CurrentValue float64   `json:"current_value"`
	TargetValue  float64   `json:"target_value"`
	Unit         string    `json:"unit"` // %, USD, Hours, Count
	ProgressPct  float64   `json:"progress_pct"`
	Owner        string    `json:"owner"`
	UpdatedAt    time.Time `json:"updated_at"`
}

// StrategicObjective represents an OKR Objective linking Goals to Business Capabilities.
type StrategicObjective struct {
	ID                  string      `json:"id"`
	WorkspaceID         string      `json:"workspace_id"`
	GoalID              string      `json:"goal_id"`
	Code                string      `json:"code"` // e.g. "OBJ-2026-Q3-01"
	Title               string      `json:"title"`
	Description         string      `json:"description"`
	Quarter             string      `json:"quarter"` // e.g. "2026-Q3"
	KeyResults          []KeyResult `json:"key_results,omitempty"`
	ImpactedCapabilityIDs []string  `json:"impacted_capability_ids,omitempty"`
	OverallProgressPct  float64     `json:"overall_progress_pct"`
	CreatedAt           time.Time   `json:"created_at"`
	UpdatedAt           time.Time   `json:"updated_at"`
}

// BusinessModelCanvas represents Osterwalder's 9 building blocks.
type BusinessModelCanvas struct {
	ID                    string    `json:"id"`
	WorkspaceID           string    `json:"workspace_id"`
	Name                  string    `json:"name"`
	Version               string    `json:"version"`
	KeyPartners           []string  `json:"key_partners"`
	KeyActivities         []string  `json:"key_activities"`
	KeyResources          []string  `json:"key_resources"`
	ValuePropositions     []string  `json:"value_propositions"`
	CustomerRelationships []string  `json:"customer_relationships"`
	Channels              []string  `json:"channels"`
	CustomerSegments      []string  `json:"customer_segments"`
	CostStructure         []string  `json:"cost_structure"`
	RevenueStreams        []string  `json:"revenue_streams"`
	CreatedAt             time.Time `json:"created_at"`
	UpdatedAt             time.Time `json:"updated_at"`
}

// StrategyTraceabilityItem traces strategy down through capabilities, value stages, and transformation initiatives.
type StrategyTraceabilityItem struct {
	DriverName     string   `json:"driver_name"`
	GoalTitle      string   `json:"goal_title"`
	ObjectiveTitle string   `json:"objective_title"`
	CapabilityCode string   `json:"capability_code"`
	CapabilityName string   `json:"capability_name"`
	CurrentMaturity float64 `json:"current_maturity"`
	TargetMaturity  float64 `json:"target_maturity"`
	ValueStreamName string  `json:"value_stream_name"`
	InitiativeName string   `json:"initiative_name"`
	Horizon        string   `json:"horizon"`
	AlignmentScore float64  `json:"alignment_score"` // 0.0 to 100.0
}
