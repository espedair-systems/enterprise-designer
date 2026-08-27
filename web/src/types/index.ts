export type CapabilityLevel = 1 | 2 | 3 | 4;

export type PaceLayer =
  | 'System of Innovation'
  | 'System of Differentiation'
  | 'System of Record';

export type StrategicImportance =
  | 'Core Advantage'
  | 'Differentiating'
  | 'Market Parity'
  | 'Commodity';

export interface Capability {
  id: string;
  workspace_id: string;
  code: string;
  name: string;
  description: string;
  parent_id?: string;
  level: CapabilityLevel;
  pace_layer: PaceLayer;
  strategic_importance: StrategicImportance;
  current_maturity: number;
  target_maturity: number;
  investment_priority: string;
  risk_score: number;
  business_owner: string;
  org_unit_id?: string;
  tags?: string[];
  created_at: string;
  updated_at: string;
  children?: Capability[];
}

export interface CapabilityHeatmapCell {
  capability_id: string;
  code: string;
  name: string;
  level: CapabilityLevel;
  current_maturity: number;
  target_maturity: number;
  strategic_importance: StrategicImportance;
  pace_layer: PaceLayer;
  investment_priority: string;
  health_color: string;
}

export interface CapabilityGap {
  capability_id: string;
  capability_code: string;
  capability_name: string;
  current_maturity: number;
  target_maturity: number;
  gap_delta: number;
  urgency_score: number;
  recommended_action: string;
}

export interface ValueStage {
  id: string;
  value_stream_id: string;
  order_index: number;
  name: string;
  description: string;
  entrance_criteria: string;
  exit_criteria: string;
  value_produced: string;
  lead_time_hours: number;
  processing_time_hours: number;
  flow_efficiency_pct: number;
  enabling_capability_ids?: string[];
  enabling_capabilities?: {
    id: string;
    code: string;
    name: string;
    pace_layer: PaceLayer;
    current_maturity: number;
  }[];
  participating_org_unit_ids?: string[];
  created_at: string;
  updated_at: string;
}

export interface ValueStream {
  id: string;
  workspace_id: string;
  code: string;
  name: string;
  description: string;
  type: string;
  trigger: string;
  value_proposition: string;
  stakeholder: string;
  owner: string;
  stages?: ValueStage[];
  created_at: string;
  updated_at: string;
}

export interface SIPOC {
  suppliers: string[];
  inputs: string[];
  outputs: string[];
  customers: string[];
}

export interface RACIAssignment {
  role_id: string;
  role_name: string;
  type: 'Responsible' | 'Accountable' | 'Consulted' | 'Informed';
}

export interface ProcessStep {
  id: string;
  process_id: string;
  order_index: number;
  name: string;
  description: string;
  step_type: string;
  cycle_time_minutes: number;
  automation_score_pct: number;
  raci_assignments?: RACIAssignment[];
}

export interface BusinessProcess {
  id: string;
  workspace_id: string;
  code: string;
  name: string;
  description: string;
  category: string;
  classification: string;
  parent_process_id?: string;
  associated_capability_id?: string;
  associated_value_stage_id?: string;
  owner_role: string;
  sipoc: SIPOC;
  steps?: ProcessStep[];
  avg_cycle_time_minutes: number;
  overall_automation_pct: number;
  pain_points?: string[];
  tags?: string[];
  created_at: string;
  updated_at: string;
}

export interface OrgUnit {
  id: string;
  workspace_id: string;
  code: string;
  name: string;
  type: string;
  parent_id?: string;
  head_role: string;
  cost_center_code: string;
  headcount_fte: number;
  location: string;
  description: string;
  created_at: string;
  updated_at: string;
}

export interface BusinessFunction {
  id: string;
  workspace_id: string;
  code: string;
  name: string;
  description: string;
  parent_id?: string;
  owner: string;
  org_unit_ids?: string[];
  created_at: string;
  updated_at: string;
}

export interface BusinessRole {
  id: string;
  workspace_id: string;
  code: string;
  title: string;
  description: string;
  org_unit_id?: string;
  workday_job_profile_id: string;
  standard_rate_usd: number;
  allocated_fte: number;
  created_at: string;
  updated_at: string;
}

export interface BusinessService {
  id: string;
  workspace_id: string;
  code: string;
  name: string;
  description: string;
  nature: string;
  status: string;
  owner_org_unit_id?: string;
  owner_role: string;
  sla_availability_pct: number;
  sla_response_time_hours: number;
  supported_channels: string[];
  target_customer_segments: string[];
  realizing_capability_ids?: string[];
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  workspace_id: string;
  code: string;
  name: string;
  description: string;
  market_segment: string;
  pricing_model: string;
  lifecycle_stage: string;
  product_manager: string;
  business_service_ids?: string[];
  created_at: string;
  updated_at: string;
}

export interface StrategicDriver {
  id: string;
  workspace_id: string;
  code: string;
  name: string;
  category: string;
  impact_level: string;
  description: string;
  created_at: string;
  updated_at: string;
}

export interface StrategicGoal {
  id: string;
  workspace_id: string;
  code: string;
  title: string;
  description: string;
  driver_ids?: string[];
  horizon_year: number;
  owner_role: string;
  target_metric: string;
  progress_pct: number;
  created_at: string;
  updated_at: string;
}

export interface KeyResult {
  id: string;
  objective_id: string;
  title: string;
  metric_name: string;
  start_value: number;
  current_value: number;
  target_value: number;
  unit: string;
  progress_pct: number;
  owner: string;
  updated_at: string;
}

export interface StrategicObjective {
  id: string;
  workspace_id: string;
  goal_id: string;
  code: string;
  title: string;
  description: string;
  quarter: string;
  key_results?: KeyResult[];
  impacted_capability_ids?: string[];
  overall_progress_pct: number;
  created_at: string;
  updated_at: string;
}

export interface BusinessModelCanvas {
  id: string;
  workspace_id: string;
  name: string;
  version: string;
  key_partners: string[];
  key_activities: string[];
  key_resources: string[];
  value_propositions: string[];
  customer_relationships: string[];
  channels: string[];
  customer_segments: string[];
  cost_structure: string[];
  revenue_streams: string[];
  created_at: string;
  updated_at: string;
}

export interface StrategyTraceabilityItem {
  driver_name: string;
  goal_title: string;
  objective_title: string;
  capability_code: string;
  capability_name: string;
  current_maturity: number;
  target_maturity: number;
  value_stream_name: string;
  initiative_name: string;
  horizon: string;
  alignment_score: number;
}

export interface ConceptAttribute {
  name: string;
  type: string;
  description: string;
  is_pii: boolean;
  is_key: boolean;
}

export interface BusinessInformationConcept {
  id: string;
  workspace_id: string;
  code: string;
  name: string;
  description: string;
  classification: string;
  domain_owner_role: string;
  authoritative_source: string;
  related_capability_ids?: string[];
  attributes?: ConceptAttribute[];
  parent_concept_id?: string;
  tags?: string[];
  created_at: string;
  updated_at: string;
}

export interface BusinessTerm {
  id: string;
  workspace_id: string;
  term: string;
  definition: string;
  acronym?: string;
  domain_category: string;
  steward: string;
  synonyms?: string[];
  concept_id?: string;
  created_at: string;
  updated_at: string;
}

export interface TransformationMilestone {
  title: string;
  target_date: string;
  is_completed: boolean;
  deliverable: string;
}

export interface Initiative {
  id: string;
  workspace_id: string;
  code: string;
  name: string;
  description: string;
  horizon: string;
  status: string;
  budget_usd: number;
  expected_roi: string;
  start_date: string;
  target_completion_date: string;
  sponsor_role: string;
  lead_architect: string;
  milestones?: TransformationMilestone[];
  impacted_capability_ids?: string[];
  target_objective_ids?: string[];
  target_value_stream_ids?: string[];
  created_at: string;
  updated_at: string;
}

export interface ExecutiveDashboardKPIs {
  total_capabilities: number;
  average_capability_maturity: number;
  total_maturity_gap: number;
  total_value_streams: number;
  avg_flow_efficiency_pct: number;
  total_business_processes: number;
  avg_process_automation_pct: number;
  strategic_alignment_score: number;
  total_initiative_budget_usd: number;
  total_active_initiatives: number;
  total_information_concepts: number;
  total_org_headcount_fte: number;
}

export interface ArtistHealthStatus {
  id: string;
  name: string;
  url: string;
  status: 'healthy' | 'offline';
  status_code: number;
  latency_ms: number;
  message: string;
  last_checked: string;
}

export interface ArtistsHealthResponse {
  artists: ArtistHealthStatus[];
  timestamp: string;
}

