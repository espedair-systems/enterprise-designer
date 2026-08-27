-- PostgreSQL DDL for Business Artist (arch-ba-deploy)
-- BIZBOK & TOGAF Business Architecture Metamodel Tables

CREATE TABLE IF NOT EXISTS ba_workspaces (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    industry VARCHAR(128),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS ba_capabilities (
    id VARCHAR(64) PRIMARY KEY,
    workspace_id VARCHAR(64) NOT NULL REFERENCES ba_workspaces(id) ON DELETE CASCADE,
    code VARCHAR(64) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    parent_id VARCHAR(64) REFERENCES ba_capabilities(id) ON DELETE SET NULL,
    level INTEGER NOT NULL DEFAULT 1,
    pace_layer VARCHAR(64) NOT NULL,
    strategic_importance VARCHAR(64) NOT NULL,
    current_maturity NUMERIC(3,2) NOT NULL DEFAULT 1.0,
    target_maturity NUMERIC(3,2) NOT NULL DEFAULT 1.0,
    investment_priority VARCHAR(32) NOT NULL DEFAULT 'Maintain',
    risk_score NUMERIC(3,2) NOT NULL DEFAULT 1.0,
    business_owner VARCHAR(255),
    org_unit_id VARCHAR(64),
    tags TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_ba_cap_ws ON ba_capabilities(workspace_id);
CREATE INDEX IF NOT EXISTS idx_ba_cap_parent ON ba_capabilities(parent_id);

CREATE TABLE IF NOT EXISTS ba_value_streams (
    id VARCHAR(64) PRIMARY KEY,
    workspace_id VARCHAR(64) NOT NULL REFERENCES ba_workspaces(id) ON DELETE CASCADE,
    code VARCHAR(64) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    type VARCHAR(64) NOT NULL,
    trigger TEXT,
    value_proposition TEXT,
    stakeholder VARCHAR(255),
    owner VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS ba_value_stages (
    id VARCHAR(64) PRIMARY KEY,
    value_stream_id VARCHAR(64) NOT NULL REFERENCES ba_value_streams(id) ON DELETE CASCADE,
    order_index INTEGER NOT NULL DEFAULT 0,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    entrance_criteria TEXT,
    exit_criteria TEXT,
    value_produced TEXT,
    lead_time_hours NUMERIC(8,2) DEFAULT 0,
    processing_time_hours NUMERIC(8,2) DEFAULT 0,
    flow_efficiency_pct NUMERIC(5,2) DEFAULT 0,
    enabling_capability_ids TEXT[],
    participating_org_unit_ids TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS ba_processes (
    id VARCHAR(64) PRIMARY KEY,
    workspace_id VARCHAR(64) NOT NULL REFERENCES ba_workspaces(id) ON DELETE CASCADE,
    code VARCHAR(64) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(64) NOT NULL,
    classification VARCHAR(64) NOT NULL,
    parent_process_id VARCHAR(64) REFERENCES ba_processes(id) ON DELETE SET NULL,
    associated_capability_id VARCHAR(64) REFERENCES ba_capabilities(id) ON DELETE SET NULL,
    associated_value_stage_id VARCHAR(64) REFERENCES ba_value_stages(id) ON DELETE SET NULL,
    owner_role VARCHAR(255),
    sipoc_json JSONB,
    steps_json JSONB,
    avg_cycle_time_minutes NUMERIC(8,2) DEFAULT 0,
    overall_automation_pct NUMERIC(5,2) DEFAULT 0,
    pain_points TEXT[],
    tags TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS ba_org_units (
    id VARCHAR(64) PRIMARY KEY,
    workspace_id VARCHAR(64) NOT NULL REFERENCES ba_workspaces(id) ON DELETE CASCADE,
    code VARCHAR(64) NOT NULL,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(64) NOT NULL,
    parent_id VARCHAR(64) REFERENCES ba_org_units(id) ON DELETE SET NULL,
    head_role VARCHAR(255),
    cost_center_code VARCHAR(64),
    headcount_fte NUMERIC(8,2) DEFAULT 0,
    location VARCHAR(255),
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS ba_business_functions (
    id VARCHAR(64) PRIMARY KEY,
    workspace_id VARCHAR(64) NOT NULL REFERENCES ba_workspaces(id) ON DELETE CASCADE,
    code VARCHAR(64) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    parent_id VARCHAR(64) REFERENCES ba_business_functions(id) ON DELETE SET NULL,
    owner VARCHAR(255),
    org_unit_ids TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS ba_business_roles (
    id VARCHAR(64) PRIMARY KEY,
    workspace_id VARCHAR(64) NOT NULL REFERENCES ba_workspaces(id) ON DELETE CASCADE,
    code VARCHAR(64) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    org_unit_id VARCHAR(64) REFERENCES ba_org_units(id) ON DELETE SET NULL,
    workday_job_profile_id VARCHAR(64),
    standard_rate_usd NUMERIC(10,2) DEFAULT 0,
    allocated_fte NUMERIC(8,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS ba_business_services (
    id VARCHAR(64) PRIMARY KEY,
    workspace_id VARCHAR(64) NOT NULL REFERENCES ba_workspaces(id) ON DELETE CASCADE,
    code VARCHAR(64) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    nature VARCHAR(64) NOT NULL,
    status VARCHAR(32) NOT NULL,
    owner_org_unit_id VARCHAR(64) REFERENCES ba_org_units(id) ON DELETE SET NULL,
    owner_role VARCHAR(255),
    sla_availability_pct NUMERIC(5,2) DEFAULT 99.9,
    sla_response_time_hours NUMERIC(8,4) DEFAULT 0,
    supported_channels TEXT[],
    target_customer_segments TEXT[],
    realizing_capability_ids TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS ba_products (
    id VARCHAR(64) PRIMARY KEY,
    workspace_id VARCHAR(64) NOT NULL REFERENCES ba_workspaces(id) ON DELETE CASCADE,
    code VARCHAR(64) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    market_segment VARCHAR(128),
    pricing_model VARCHAR(64),
    lifecycle_stage VARCHAR(64),
    product_manager VARCHAR(255),
    business_service_ids TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS ba_strategic_drivers (
    id VARCHAR(64) PRIMARY KEY,
    workspace_id VARCHAR(64) NOT NULL REFERENCES ba_workspaces(id) ON DELETE CASCADE,
    code VARCHAR(64) NOT NULL,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(64) NOT NULL,
    impact_level VARCHAR(32) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS ba_strategic_goals (
    id VARCHAR(64) PRIMARY KEY,
    workspace_id VARCHAR(64) NOT NULL REFERENCES ba_workspaces(id) ON DELETE CASCADE,
    code VARCHAR(64) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    driver_ids TEXT[],
    horizon_year INTEGER NOT NULL,
    owner_role VARCHAR(255),
    target_metric VARCHAR(255),
    progress_pct NUMERIC(5,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS ba_strategic_objectives (
    id VARCHAR(64) PRIMARY KEY,
    workspace_id VARCHAR(64) NOT NULL REFERENCES ba_workspaces(id) ON DELETE CASCADE,
    goal_id VARCHAR(64) NOT NULL REFERENCES ba_strategic_goals(id) ON DELETE CASCADE,
    code VARCHAR(64) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    quarter VARCHAR(32) NOT NULL,
    key_results_json JSONB,
    impacted_capability_ids TEXT[],
    overall_progress_pct NUMERIC(5,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS ba_business_model_canvases (
    id VARCHAR(64) PRIMARY KEY,
    workspace_id VARCHAR(64) NOT NULL REFERENCES ba_workspaces(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    version VARCHAR(32) NOT NULL,
    key_partners TEXT[],
    key_activities TEXT[],
    key_resources TEXT[],
    value_propositions TEXT[],
    customer_relationships TEXT[],
    channels TEXT[],
    customer_segments TEXT[],
    cost_structure TEXT[],
    revenue_streams TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS ba_information_concepts (
    id VARCHAR(64) PRIMARY KEY,
    workspace_id VARCHAR(64) NOT NULL REFERENCES ba_workspaces(id) ON DELETE CASCADE,
    code VARCHAR(64) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    classification VARCHAR(64) NOT NULL,
    domain_owner_role VARCHAR(255),
    authoritative_source VARCHAR(255),
    related_capability_ids TEXT[],
    attributes_json JSONB,
    parent_concept_id VARCHAR(64) REFERENCES ba_information_concepts(id) ON DELETE SET NULL,
    tags TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS ba_business_terms (
    id VARCHAR(64) PRIMARY KEY,
    workspace_id VARCHAR(64) NOT NULL REFERENCES ba_workspaces(id) ON DELETE CASCADE,
    term VARCHAR(255) NOT NULL,
    definition TEXT NOT NULL,
    acronym VARCHAR(32),
    domain_category VARCHAR(128) NOT NULL,
    steward VARCHAR(255),
    synonyms TEXT[],
    concept_id VARCHAR(64) REFERENCES ba_information_concepts(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS ba_initiatives (
    id VARCHAR(64) PRIMARY KEY,
    workspace_id VARCHAR(64) NOT NULL REFERENCES ba_workspaces(id) ON DELETE CASCADE,
    code VARCHAR(64) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    horizon VARCHAR(64) NOT NULL,
    status VARCHAR(32) NOT NULL,
    budget_usd NUMERIC(12,2) DEFAULT 0,
    expected_roi TEXT,
    start_date VARCHAR(32),
    target_completion_date VARCHAR(32),
    sponsor_role VARCHAR(255),
    lead_architect VARCHAR(255),
    milestones_json JSONB,
    impacted_capability_ids TEXT[],
    target_objective_ids TEXT[],
    target_value_stream_ids TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS ba_audit_logs (
    id VARCHAR(64) PRIMARY KEY,
    workspace_id VARCHAR(64) NOT NULL REFERENCES ba_workspaces(id) ON DELETE CASCADE,
    entity_type VARCHAR(64) NOT NULL,
    entity_id VARCHAR(64) NOT NULL,
    action VARCHAR(32) NOT NULL,
    performed_by VARCHAR(255) NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    details TEXT
);
