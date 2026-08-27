package domain

// ExecutiveDashboardKPIs provides high-level business architecture health and execution statistics.
type ExecutiveDashboardKPIs struct {
	TotalCapabilities         int     `json:"total_capabilities"`
	AverageCapabilityMaturity float64 `json:"average_capability_maturity"`
	TotalMaturityGap          float64 `json:"total_maturity_gap"`
	TotalValueStreams         int     `json:"total_value_streams"`
	AvgFlowEfficiencyPct      float64 `json:"avg_flow_efficiency_pct"`
	TotalBusinessProcesses    int     `json:"total_business_processes"`
	AvgProcessAutomationPct   float64 `json:"avg_process_automation_pct"`
	StrategicAlignmentScore   float64 `json:"strategic_alignment_score"` // 0 to 100
	TotalInitiativeBudgetUSD  float64 `json:"total_initiative_budget_usd"`
	TotalActiveInitiatives    int     `json:"total_active_initiatives"`
	TotalInformationConcepts  int     `json:"total_information_concepts"`
	TotalOrgHeadcountFTE      float64 `json:"total_org_headcount_fte"`
}

// CapabilityPaceBreakdown summarizes capabilities by PACE classification.
type CapabilityPaceBreakdown struct {
	InnovationCount      int     `json:"innovation_count"`
	DifferentiationCount int     `json:"differentiation_count"`
	RecordCount          int     `json:"record_count"`
	InnovationAvgMaturity float64 `json:"innovation_avg_maturity"`
	DiffAvgMaturity      float64 `json:"diff_avg_maturity"`
	RecordAvgMaturity    float64 `json:"record_avg_maturity"`
}

// HorizonBudgetSummary breaks down investment across Three Horizons.
type HorizonBudgetSummary struct {
	Horizon1BudgetUSD float64 `json:"horizon_1_budget_usd"`
	Horizon2BudgetUSD float64 `json:"horizon_2_budget_usd"`
	Horizon3BudgetUSD float64 `json:"horizon_3_budget_usd"`
	Horizon1Count     int     `json:"horizon_1_count"`
	Horizon2Count     int     `json:"horizon_2_count"`
	Horizon3Count     int     `json:"horizon_3_count"`
}
