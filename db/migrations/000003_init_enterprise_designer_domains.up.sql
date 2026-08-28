-- ============================================================================
-- Migration 000003: Enterprise Designer Domain Models & Metamodels
-- Authoritative Schema Namespace: DES_BASE (PostgreSQL 16+)
-- Domains: quest_*, schema_*, openapi_*, usecase_*, cr_*
-- ============================================================================

-- 1. Questionnaire & Survey Domain (quest_*)
CREATE TABLE IF NOT EXISTS quest_surveys (
    id VARCHAR(64) PRIMARY KEY,
    app_id VARCHAR(64) NOT NULL REFERENCES designer_apps(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(128) NOT NULL,
    version VARCHAR(32) NOT NULL DEFAULT '1.0.0',
    description TEXT,
    category VARCHAR(64) NOT NULL DEFAULT 'General',
    tags TEXT[],
    scoring_model VARCHAR(64) DEFAULT 'weighted_points',
    sections_json JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT uq_app_survey_slug UNIQUE(app_id, slug)
);

CREATE TABLE IF NOT EXISTS quest_question_bank (
    id VARCHAR(64) PRIMARY KEY,
    app_id VARCHAR(64) NOT NULL REFERENCES designer_apps(id) ON DELETE CASCADE,
    category VARCHAR(64) NOT NULL,
    question_text TEXT NOT NULL,
    question_type VARCHAR(64) NOT NULL,
    weight NUMERIC(5,2) DEFAULT 1.0,
    tags TEXT[],
    options_json JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS quest_reference_data (
    id VARCHAR(64) PRIMARY KEY,
    app_id VARCHAR(64) NOT NULL REFERENCES designer_apps(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(128) NOT NULL,
    description TEXT,
    items_json JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT uq_app_refdata_slug UNIQUE(app_id, slug)
);

CREATE TABLE IF NOT EXISTS quest_submissions (
    id VARCHAR(64) PRIMARY KEY,
    survey_id VARCHAR(64) NOT NULL REFERENCES quest_surveys(id) ON DELETE CASCADE,
    respondent_id VARCHAR(128) NOT NULL,
    respondent_name VARCHAR(255),
    respondent_role VARCHAR(128),
    status VARCHAR(32) NOT NULL DEFAULT 'submitted', -- 'in_progress', 'submitted', 'verified'
    answers_json JSONB NOT NULL DEFAULT '{}'::jsonb,
    score_pct NUMERIC(5,2) DEFAULT 0.0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Schema Registry Domain (schema_*)
CREATE TABLE IF NOT EXISTS schema_registries (
    id VARCHAR(64) PRIMARY KEY,
    app_id VARCHAR(64) NOT NULL REFERENCES designer_apps(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(128) NOT NULL,
    schema_type VARCHAR(32) NOT NULL DEFAULT 'json_schema', -- 'json_schema', 'openapi_spec'
    dialect VARCHAR(64) NOT NULL DEFAULT 'draft-2020-12',
    version VARCHAR(32) NOT NULL DEFAULT '1.0.0',
    description TEXT,
    status VARCHAR(32) NOT NULL DEFAULT 'published', -- 'draft', 'published', 'deprecated'
    raw_payload_json JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT uq_app_schema_slug UNIQUE(app_id, slug)
);

-- 3. OpenAPI Endpoints Domain (openapi_*)
CREATE TABLE IF NOT EXISTS openapi_endpoints (
    id VARCHAR(64) PRIMARY KEY,
    schema_id VARCHAR(64) REFERENCES schema_registries(id) ON DELETE SET NULL,
    app_id VARCHAR(64) NOT NULL REFERENCES designer_apps(id) ON DELETE CASCADE,
    path VARCHAR(255) NOT NULL,
    method VARCHAR(16) NOT NULL, -- 'GET', 'POST', 'PUT', 'PATCH', 'DELETE'
    operation_id VARCHAR(128),
    summary VARCHAR(255) NOT NULL,
    description TEXT,
    tags TEXT[],
    parameters_json JSONB DEFAULT '[]'::jsonb,
    request_body_json JSONB,
    responses_json JSONB NOT NULL DEFAULT '{}'::jsonb,
    security_json JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT uq_endpoint_path_method UNIQUE(app_id, path, method)
);

-- 4. UML Use Case Modeling Domain (usecase_*)
CREATE TABLE IF NOT EXISTS usecase_models (
    id VARCHAR(64) PRIMARY KEY,
    app_id VARCHAR(64) NOT NULL REFERENCES designer_apps(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    system_boundary_json JSONB,
    actors_json JSONB NOT NULL DEFAULT '[]'::jsonb,
    use_cases_json JSONB NOT NULL DEFAULT '[]'::jsonb,
    relationships_json JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Change Requests & Audit Domain (cr_*)
CREATE TABLE IF NOT EXISTS cr_requests (
    id VARCHAR(64) PRIMARY KEY,
    app_id VARCHAR(64) NOT NULL REFERENCES designer_apps(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    file_path VARCHAR(255) NOT NULL,
    active_view_id VARCHAR(64),
    requested_changes TEXT NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'pending', -- 'pending', 'in_progress', 'completed'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for high-throughput queries
CREATE INDEX IF NOT EXISTS idx_quest_surveys_app ON quest_surveys(app_id);
CREATE INDEX IF NOT EXISTS idx_quest_submissions_survey ON quest_submissions(survey_id);
CREATE INDEX IF NOT EXISTS idx_schema_registries_app ON schema_registries(app_id);
CREATE INDEX IF NOT EXISTS idx_openapi_endpoints_app ON openapi_endpoints(app_id);
CREATE INDEX IF NOT EXISTS idx_usecase_models_app ON usecase_models(app_id);
CREATE INDEX IF NOT EXISTS idx_cr_requests_app ON cr_requests(app_id);
