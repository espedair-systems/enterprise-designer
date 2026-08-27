-- ============================================================================
-- BUSINESS ARTIST (arch-ba-deploy) - PostgreSQL Canonical 3NF Schema (BA_BASE)
-- Architecture Frameworks: BIZBOK® Guide 12 & TOGAF Business Architecture
-- Authoritative Schema Namespace: "BA_BASE"
-- ============================================================================

CREATE SCHEMA IF NOT EXISTS "BA_BASE";
CREATE SCHEMA IF NOT EXISTS "admin";

-- ----------------------------------------------------------------------------
-- SECTION 1: BUSINESS ARTIST CANONICAL BIZBOK 3NF TABLES
-- ----------------------------------------------------------------------------

-- 1. Organization Units Hierarchy
CREATE TABLE IF NOT EXISTS "BA_BASE".org_units (
    id VARCHAR(64) PRIMARY KEY,
    workspace_id VARCHAR(64) NOT NULL,
    code VARCHAR(32) NOT NULL,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(64) NOT NULL,
    parent_id VARCHAR(64) REFERENCES "BA_BASE".org_units(id) ON DELETE SET NULL,
    head_role VARCHAR(255) NOT NULL,
    cost_center_code VARCHAR(32) NOT NULL,
    headcount_fte NUMERIC(6,1) NOT NULL DEFAULT 1.0,
    location VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_ba_org_units_ws ON "BA_BASE".org_units(workspace_id);

-- 2. Business Functions
CREATE TABLE IF NOT EXISTS "BA_BASE".business_functions (
    id VARCHAR(64) PRIMARY KEY,
    workspace_id VARCHAR(64) NOT NULL,
    code VARCHAR(32) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    parent_id VARCHAR(64) REFERENCES "BA_BASE".business_functions(id) ON DELETE SET NULL,
    owner VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_ba_functions_ws ON "BA_BASE".business_functions(workspace_id);

-- 3. Workday Business Roles & Headcount
CREATE TABLE IF NOT EXISTS "BA_BASE".business_roles (
    id VARCHAR(64) PRIMARY KEY,
    workspace_id VARCHAR(64) NOT NULL,
    code VARCHAR(32) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    org_unit_id VARCHAR(64) REFERENCES "BA_BASE".org_units(id) ON DELETE SET NULL,
    workday_job_profile_id VARCHAR(64) NOT NULL,
    standard_rate_usd NUMERIC(8,2) NOT NULL DEFAULT 150.00,
    allocated_fte NUMERIC(4,2) NOT NULL DEFAULT 1.00,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_ba_roles_ws ON "BA_BASE".business_roles(workspace_id);

-- 4. Business Capabilities (L1 - L4 Hierarchy)
CREATE TABLE IF NOT EXISTS "BA_BASE".capabilities (
    id VARCHAR(64) PRIMARY KEY,
    workspace_id VARCHAR(64) NOT NULL,
    code VARCHAR(32) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    parent_id VARCHAR(64) REFERENCES "BA_BASE".capabilities(id) ON DELETE CASCADE,
    level INTEGER NOT NULL CHECK (level BETWEEN 1 AND 4),
    pace_layer VARCHAR(64) NOT NULL,
    strategic_importance VARCHAR(64) NOT NULL,
    current_maturity NUMERIC(3,1) NOT NULL CHECK (current_maturity BETWEEN 1.0 AND 5.0),
    target_maturity NUMERIC(3,1) NOT NULL CHECK (target_maturity BETWEEN 1.0 AND 5.0),
    investment_priority VARCHAR(32) NOT NULL,
    risk_score INTEGER NOT NULL DEFAULT 0,
    business_owner VARCHAR(255) NOT NULL,
    org_unit_id VARCHAR(64) REFERENCES "BA_BASE".org_units(id) ON DELETE SET NULL,
    tags JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_ba_capabilities_ws ON "BA_BASE".capabilities(workspace_id);
CREATE INDEX IF NOT EXISTS idx_ba_capabilities_parent ON "BA_BASE".capabilities(parent_id);

-- 5. Value Streams Architecture
CREATE TABLE IF NOT EXISTS "BA_BASE".value_streams (
    id VARCHAR(64) PRIMARY KEY,
    workspace_id VARCHAR(64) NOT NULL,
    code VARCHAR(32) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    type VARCHAR(64) NOT NULL,
    trigger VARCHAR(255) NOT NULL,
    value_proposition TEXT NOT NULL,
    stakeholder VARCHAR(255) NOT NULL,
    owner VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_ba_valuestreams_ws ON "BA_BASE".value_streams(workspace_id);

-- 6. Value Stages Pipeline
CREATE TABLE IF NOT EXISTS "BA_BASE".value_stages (
    id VARCHAR(64) PRIMARY KEY,
    value_stream_id VARCHAR(64) NOT NULL REFERENCES "BA_BASE".value_streams(id) ON DELETE CASCADE,
    order_index INTEGER NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    entrance_criteria TEXT NOT NULL,
    exit_criteria TEXT NOT NULL,
    value_produced VARCHAR(255) NOT NULL,
    lead_time_hours NUMERIC(6,2) NOT NULL DEFAULT 0.0,
    processing_time_hours NUMERIC(6,2) NOT NULL DEFAULT 0.0,
    flow_efficiency_pct NUMERIC(5,2) NOT NULL DEFAULT 0.0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_ba_stages_vs ON "BA_BASE".value_stages(value_stream_id);

-- 7. Enabling Capabilities Mapping (N:M)
CREATE TABLE IF NOT EXISTS "BA_BASE".value_stage_enabling_capabilities (
    stage_id VARCHAR(64) NOT NULL REFERENCES "BA_BASE".value_stages(id) ON DELETE CASCADE,
    capability_id VARCHAR(64) NOT NULL REFERENCES "BA_BASE".capabilities(id) ON DELETE CASCADE,
    PRIMARY KEY (stage_id, capability_id)
);

-- 8. Business Processes & SIPOC Architecture
CREATE TABLE IF NOT EXISTS "BA_BASE".processes (
    id VARCHAR(64) PRIMARY KEY,
    workspace_id VARCHAR(64) NOT NULL,
    code VARCHAR(32) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(64) NOT NULL,
    trigger VARCHAR(255) NOT NULL,
    end_state VARCHAR(255) NOT NULL,
    owner VARCHAR(255) NOT NULL,
    cycle_time_hours NUMERIC(6,2) NOT NULL DEFAULT 0.0,
    automation_pct NUMERIC(5,2) NOT NULL DEFAULT 0.0,
    cost_per_execution_usd NUMERIC(8,2) NOT NULL DEFAULT 0.0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_ba_processes_ws ON "BA_BASE".processes(workspace_id);

-- 9. 5-Box SIPOC Steps
CREATE TABLE IF NOT EXISTS "BA_BASE".process_sipoc_steps (
    id VARCHAR(64) PRIMARY KEY,
    process_id VARCHAR(64) NOT NULL REFERENCES "BA_BASE".processes(id) ON DELETE CASCADE,
    step_order INTEGER NOT NULL,
    step_name VARCHAR(255) NOT NULL,
    supplier VARCHAR(255) NOT NULL,
    input_data TEXT NOT NULL,
    process_action TEXT NOT NULL,
    output_artifact TEXT NOT NULL,
    customer_receiver VARCHAR(255) NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_ba_sipoc_proc ON "BA_BASE".process_sipoc_steps(process_id);

-- 10. Process RACI Role Allocations
CREATE TABLE IF NOT EXISTS "BA_BASE".process_raci_allocations (
    id VARCHAR(64) PRIMARY KEY,
    process_id VARCHAR(64) NOT NULL REFERENCES "BA_BASE".processes(id) ON DELETE CASCADE,
    role_id VARCHAR(64) NOT NULL REFERENCES "BA_BASE".business_roles(id) ON DELETE CASCADE,
    raci_type VARCHAR(8) NOT NULL CHECK (raci_type IN ('R', 'A', 'C', 'I')),
    accountability_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 11. Business Services & Offerings
CREATE TABLE IF NOT EXISTS "BA_BASE".business_services (
    id VARCHAR(64) PRIMARY KEY,
    workspace_id VARCHAR(64) NOT NULL,
    code VARCHAR(32) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    nature VARCHAR(64) NOT NULL,
    status VARCHAR(32) NOT NULL,
    owner_org_unit_id VARCHAR(64) REFERENCES "BA_BASE".org_units(id) ON DELETE SET NULL,
    owner_role VARCHAR(255) NOT NULL,
    sla_availability_pct NUMERIC(5,2) NOT NULL DEFAULT 99.90,
    sla_response_time_hours NUMERIC(5,2) NOT NULL DEFAULT 24.0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 12. Commercial Products & Catalog
CREATE TABLE IF NOT EXISTS "BA_BASE".products (
    id VARCHAR(64) PRIMARY KEY,
    workspace_id VARCHAR(64) NOT NULL,
    code VARCHAR(32) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    market_segment VARCHAR(128) NOT NULL,
    pricing_model VARCHAR(64) NOT NULL,
    lifecycle_stage VARCHAR(64) NOT NULL,
    product_manager VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 13. Strategic Drivers
CREATE TABLE IF NOT EXISTS "BA_BASE".strategic_drivers (
    id VARCHAR(64) PRIMARY KEY,
    workspace_id VARCHAR(64) NOT NULL,
    code VARCHAR(32) NOT NULL,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(64) NOT NULL,
    impact_level VARCHAR(32) NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 14. Strategic Goals
CREATE TABLE IF NOT EXISTS "BA_BASE".strategic_goals (
    id VARCHAR(64) PRIMARY KEY,
    workspace_id VARCHAR(64) NOT NULL,
    code VARCHAR(32) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    horizon_year INTEGER NOT NULL,
    owner_role VARCHAR(255) NOT NULL,
    target_metric VARCHAR(255) NOT NULL,
    progress_pct NUMERIC(5,2) NOT NULL DEFAULT 0.0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_ba_goals_ws ON "BA_BASE".strategic_goals(workspace_id);

-- 15. Strategic Objectives & OKRs
CREATE TABLE IF NOT EXISTS "BA_BASE".strategic_objectives (
    id VARCHAR(64) PRIMARY KEY,
    workspace_id VARCHAR(64) NOT NULL,
    goal_id VARCHAR(64) NOT NULL REFERENCES "BA_BASE".strategic_goals(id) ON DELETE CASCADE,
    code VARCHAR(32) NOT NULL,
    title VARCHAR(255) NOT NULL,
    quarter VARCHAR(16) NOT NULL,
    overall_progress_pct NUMERIC(5,2) NOT NULL DEFAULT 0.0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_ba_objectives_goal ON "BA_BASE".strategic_objectives(goal_id);

-- 16. Business Model Canvases (Osterwalder 9-Box)
CREATE TABLE IF NOT EXISTS "BA_BASE".business_model_canvases (
    id VARCHAR(64) PRIMARY KEY,
    workspace_id VARCHAR(64) NOT NULL,
    name VARCHAR(255) NOT NULL,
    version VARCHAR(32) NOT NULL DEFAULT '1.0',
    key_partners JSONB DEFAULT '[]'::jsonb,
    key_activities JSONB DEFAULT '[]'::jsonb,
    key_resources JSONB DEFAULT '[]'::jsonb,
    value_propositions JSONB DEFAULT '[]'::jsonb,
    customer_relationships JSONB DEFAULT '[]'::jsonb,
    channels JSONB DEFAULT '[]'::jsonb,
    customer_segments JSONB DEFAULT '[]'::jsonb,
    cost_structure JSONB DEFAULT '[]'::jsonb,
    revenue_streams JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 17. Transformation Portfolio Initiatives
CREATE TABLE IF NOT EXISTS "BA_BASE".transformation_initiatives (
    id VARCHAR(64) PRIMARY KEY,
    workspace_id VARCHAR(64) NOT NULL,
    code VARCHAR(32) NOT NULL,
    name VARCHAR(255) NOT NULL,
    horizon VARCHAR(32) NOT NULL,
    budget_usd NUMERIC(12,2) NOT NULL DEFAULT 500000.00,
    expected_roi_multiplier NUMERIC(4,2) NOT NULL DEFAULT 2.50,
    status VARCHAR(32) NOT NULL,
    lead_owner VARCHAR(255) NOT NULL,
    start_date DATE NOT NULL,
    target_date DATE NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 18. Canonical Information Concepts
CREATE TABLE IF NOT EXISTS "BA_BASE".information_concepts (
    id VARCHAR(64) PRIMARY KEY,
    workspace_id VARCHAR(64) NOT NULL,
    code VARCHAR(32) NOT NULL,
    name VARCHAR(255) NOT NULL,
    domain VARCHAR(64) NOT NULL,
    criticality VARCHAR(32) NOT NULL,
    classification VARCHAR(32) NOT NULL,
    canonical_definition TEXT NOT NULL,
    steward_role VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- SECTION 2: COPIED ENTERPRISE ARTIST DBA_ 3NF METAMODEL TABLES
-- ----------------------------------------------------------------------------

-- 19. DBA Model Meta
CREATE TABLE IF NOT EXISTS "BA_BASE".dba_model_meta (
    key VARCHAR(128) PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 20. DBA Fact Type Catalog
CREATE TABLE IF NOT EXISTS "BA_BASE".dba_fact_type_catalog (
    code VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(64) NOT NULL,
    aspect VARCHAR(64) NOT NULL,
    default_color VARCHAR(32) NOT NULL,
    icon_name VARCHAR(64) NOT NULL,
    description TEXT
);

-- 21. DBA Master Fact Sheet Table
CREATE TABLE IF NOT EXISTS "BA_BASE".dba_fact_sheet (
    id SERIAL PRIMARY KEY,
    external_id VARCHAR(255) UNIQUE NOT NULL,
    type VARCHAR(64) NOT NULL REFERENCES "BA_BASE".dba_fact_type_catalog(code),
    name VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    display_name VARCHAR(255),
    description TEXT,
    status VARCHAR(32) NOT NULL DEFAULT 'ACTIVE',
    completion NUMERIC(5,2) NOT NULL DEFAULT 100.0,
    level INTEGER NOT NULL DEFAULT 1,
    quality_seal VARCHAR(32) NOT NULL DEFAULT 'DRAFT',
    lifecycle_state VARCHAR(32) NOT NULL DEFAULT 'LIVE',
    alias VARCHAR(255),
    parent_id INTEGER REFERENCES "BA_BASE".dba_fact_sheet(id) ON DELETE SET NULL,
    owner VARCHAR(255),
    business_fit NUMERIC(3,2) DEFAULT 0.0,
    technical_fit NUMERIC(3,2) DEFAULT 0.0,
    time_quadrant VARCHAR(32) DEFAULT 'TOLERATE',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_dba_fact_sheet_type ON "BA_BASE".dba_fact_sheet(type);
CREATE INDEX IF NOT EXISTS idx_dba_fact_sheet_parent ON "BA_BASE".dba_fact_sheet(parent_id);

-- 22. DBA Normalized Fact Sheet Properties (EAV)
CREATE TABLE IF NOT EXISTS "BA_BASE".dba_fact_property (
    id SERIAL PRIMARY KEY,
    fact_sheet_id INTEGER NOT NULL REFERENCES "BA_BASE".dba_fact_sheet(id) ON DELETE CASCADE,
    property_key VARCHAR(128) NOT NULL,
    property_type VARCHAR(32) NOT NULL DEFAULT 'text',
    text_val TEXT,
    num_val NUMERIC(12,4),
    bool_val BOOLEAN,
    unit VARCHAR(32),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (fact_sheet_id, property_key)
);
CREATE INDEX IF NOT EXISTS idx_dba_fact_property_fk ON "BA_BASE".dba_fact_property(fact_sheet_id);

-- 23. DBA Normalized Fact Sheet Tags
CREATE TABLE IF NOT EXISTS "BA_BASE".dba_fact_tag (
    id SERIAL PRIMARY KEY,
    fact_sheet_id INTEGER NOT NULL REFERENCES "BA_BASE".dba_fact_sheet(id) ON DELETE CASCADE,
    tag_name VARCHAR(128) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (fact_sheet_id, tag_name)
);
CREATE INDEX IF NOT EXISTS idx_dba_fact_tag_fk ON "BA_BASE".dba_fact_tag(fact_sheet_id);

-- 24. DBA Direct Fact-to-Fact Relationships
CREATE TABLE IF NOT EXISTS "BA_BASE".dba_relation (
    id SERIAL PRIMARY KEY,
    external_id VARCHAR(255) UNIQUE NOT NULL,
    from_id INTEGER NOT NULL REFERENCES "BA_BASE".dba_fact_sheet(id) ON DELETE CASCADE,
    to_id INTEGER NOT NULL REFERENCES "BA_BASE".dba_fact_sheet(id) ON DELETE CASCADE,
    type VARCHAR(64) NOT NULL,
    description TEXT,
    status VARCHAR(32) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (from_id, to_id, type)
);
CREATE INDEX IF NOT EXISTS idx_dba_relation_from ON "BA_BASE".dba_relation(from_id);
CREATE INDEX IF NOT EXISTS idx_dba_relation_to ON "BA_BASE".dba_relation(to_id);

-- 25. DBA Relationship EAV Properties
CREATE TABLE IF NOT EXISTS "BA_BASE".dba_relation_property (
    id SERIAL PRIMARY KEY,
    relation_id INTEGER NOT NULL REFERENCES "BA_BASE".dba_relation(id) ON DELETE CASCADE,
    property_key VARCHAR(128) NOT NULL,
    property_type VARCHAR(32) NOT NULL DEFAULT 'text',
    text_val TEXT,
    num_val NUMERIC(12,4),
    bool_val BOOLEAN,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (relation_id, property_key)
);

-- 26. DBA Visual Architecture Views
CREATE TABLE IF NOT EXISTS "BA_BASE".dba_view (
    id SERIAL PRIMARY KEY,
    external_id VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    view_type VARCHAR(64) NOT NULL,
    description TEXT,
    layout_data JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 27. DBA View Node Placement
CREATE TABLE IF NOT EXISTS "BA_BASE".dba_view_node (
    id SERIAL PRIMARY KEY,
    view_id INTEGER NOT NULL REFERENCES "BA_BASE".dba_view(id) ON DELETE CASCADE,
    fact_sheet_id INTEGER NOT NULL REFERENCES "BA_BASE".dba_fact_sheet(id) ON DELETE CASCADE,
    x NUMERIC(8,2) NOT NULL DEFAULT 0.0,
    y NUMERIC(8,2) NOT NULL DEFAULT 0.0,
    width NUMERIC(8,2) NOT NULL DEFAULT 160.0,
    height NUMERIC(8,2) NOT NULL DEFAULT 80.0,
    color VARCHAR(32),
    UNIQUE (view_id, fact_sheet_id)
);

-- 28. DBA Immutable Audit Log Trail
CREATE TABLE IF NOT EXISTS "BA_BASE".dba_audit_log (
    id SERIAL PRIMARY KEY,
    entity_type VARCHAR(64) NOT NULL,
    entity_id VARCHAR(255) NOT NULL,
    action VARCHAR(32) NOT NULL,
    actor VARCHAR(255) NOT NULL,
    delta_json JSONB,
    occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_dba_audit_entity ON "BA_BASE".dba_audit_log(entity_type, entity_id);

-- 29. DBA Transformation Scenarios
CREATE TABLE IF NOT EXISTS "BA_BASE".dba_scenario (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(32) NOT NULL DEFAULT 'DRAFT',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 30. DBA Scenario Impact Analysis
CREATE TABLE IF NOT EXISTS "BA_BASE".dba_scenario_impact (
    id SERIAL PRIMARY KEY,
    scenario_id INTEGER NOT NULL REFERENCES "BA_BASE".dba_scenario(id) ON DELETE CASCADE,
    fact_sheet_id INTEGER NOT NULL REFERENCES "BA_BASE".dba_fact_sheet(id) ON DELETE CASCADE,
    change_type VARCHAR(32) NOT NULL,
    cost_impact_usd NUMERIC(12,2) DEFAULT 0.0,
    risk_level VARCHAR(32) DEFAULT 'MEDIUM',
    notes TEXT
);
