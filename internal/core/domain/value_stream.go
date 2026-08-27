package domain

import (
	"time"
)

// ValueStreamType distinguishes customer-facing vs internal value delivery.
type ValueStreamType string

const (
	ValueStreamCoreCustomer ValueStreamType = "Core Customer Journey"
	ValueStreamSupporting   ValueStreamType = "Supporting Operations"
	ValueStreamManagement   ValueStreamType = "Strategic Management"
)

// ValueStream represents an end-to-end collection of value-adding activities that create an overall result for a customer, stakeholder, or end user.
type ValueStream struct {
	ID               string          `json:"id"`
	WorkspaceID      string          `json:"workspace_id"`
	Code             string          `json:"code"` // e.g. "VS-ORDER-TO-CASH"
	Name             string          `json:"name"`
	Description      string          `json:"description"`
	Type             ValueStreamType `json:"type"`
	Trigger          string          `json:"trigger"`          // e.g. "Customer places order"
	ValueProposition string          `json:"value_proposition"` // e.g. "Rapid, accurate delivery of requested goods"
	Stakeholder      string          `json:"stakeholder"`      // e.g. "Retail Customer"
	Owner            string          `json:"owner"`            // Workday Role
	Stages           []ValueStage    `json:"stages,omitempty"`
	CreatedAt        time.Time       `json:"created_at"`
	UpdatedAt        time.Time       `json:"updated_at"`
}

// Validate checks that the value stream parameters are valid.
func (vs *ValueStream) Validate() error {
	if vs.Name == "" {
		return ErrInvalidInput
	}
	return nil
}

// ValueStage represents an individual sequential phase within a value stream.
type ValueStage struct {
	ID                     string                 `json:"id"`
	ValueStreamID          string                 `json:"value_stream_id"`
	OrderIndex             int                    `json:"order_index"`
	Name                   string                 `json:"name"`
	Description            string                 `json:"description"`
	EntranceCriteria       string                 `json:"entrance_criteria"`
	ExitCriteria           string                 `json:"exit_criteria"`
	ValueProduced          string                 `json:"value_produced"`
	LeadTimeHours          float64                `json:"lead_time_hours"`
	ProcessingTimeHours    float64                `json:"processing_time_hours"`
	FlowEfficiencyPct      float64                `json:"flow_efficiency_pct"`
	EnablingCapabilityIDs  []string               `json:"enabling_capability_ids,omitempty"`
	EnablingCapabilities  []CapabilitySummary    `json:"enabling_capabilities,omitempty"`
	ParticipatingOrgUnitIDs []string              `json:"participating_org_unit_ids,omitempty"`
	CreatedAt              time.Time              `json:"created_at"`
	UpdatedAt              time.Time              `json:"updated_at"`
}

// Validate checks that the value stage duration and criteria are valid.
func (s *ValueStage) Validate() error {
	if s.Name == "" {
		return ErrInvalidInput
	}
	if s.LeadTimeHours < 0 || s.ProcessingTimeHours < 0 {
		return ErrInvalidInput
	}
	return nil
}

// CapabilitySummary is a lightweight view of a capability embedded in value stages or processes.
type CapabilitySummary struct {
	ID                  string              `json:"id"`
	Code                string              `json:"code"`
	Name                string              `json:"name"`
	PaceLayer           PaceLayer           `json:"pace_layer"`
	StrategicImportance StrategicImportance `json:"strategic_importance"`
	CurrentMaturity     float64             `json:"current_maturity"`
}

// ValueStreamMetricSummary aggregates efficiency and stage performance.
type ValueStreamMetricSummary struct {
	ValueStreamID       string  `json:"value_stream_id"`
	ValueStreamName     string  `json:"value_stream_name"`
	StageCount          int     `json:"stage_count"`
	TotalLeadTimeHours  float64 `json:"total_lead_time_hours"`
	TotalProcessHours   float64 `json:"total_process_hours"`
	AvgFlowEfficiencyPct float64 `json:"avg_flow_efficiency_pct"`
	BottleneckStageName string  `json:"bottleneck_stage_name"`
}
