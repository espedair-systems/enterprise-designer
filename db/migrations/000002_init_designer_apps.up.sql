-- ESPEDAIR Designer Schema: Applications, Layouts, and Data Sources
CREATE TABLE IF NOT EXISTS designer_workspaces (
    id VARCHAR(64) PRIMARY KEY,
    slug VARCHAR(64) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS designer_apps (
    id VARCHAR(64) PRIMARY KEY,
    workspace_id VARCHAR(64) NOT NULL REFERENCES designer_workspaces(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(64) NOT NULL,
    app_type VARCHAR(32) NOT NULL DEFAULT 'studio', -- 'studio', 'agent', 'datamodeler'
    description TEXT,
    status VARCHAR(32) NOT NULL DEFAULT 'draft', -- 'draft', 'scaffolded', 'published'
    scaffold_path VARCHAR(512),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT uq_workspace_app_slug UNIQUE(workspace_id, slug)
);

CREATE TABLE IF NOT EXISTS designer_layouts (
    id VARCHAR(64) PRIMARY KEY,
    app_id VARCHAR(64) NOT NULL REFERENCES designer_apps(id) ON DELETE CASCADE,
    layout_version VARCHAR(32) NOT NULL DEFAULT '1.0.0',
    theme VARCHAR(32) NOT NULL DEFAULT 'dark_modern',
    slots_json JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT uq_app_layout UNIQUE(app_id)
);

CREATE TABLE IF NOT EXISTS designer_datasources (
    id VARCHAR(64) PRIMARY KEY,
    workspace_id VARCHAR(64) NOT NULL REFERENCES designer_workspaces(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    db_type VARCHAR(32) NOT NULL DEFAULT 'postgres', -- 'postgres', 'snowflake', 'bigquery', 'mysql'
    connection_uri TEXT NOT NULL,
    schema_name VARCHAR(128) DEFAULT 'public',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Seed default designer workspace
INSERT INTO designer_workspaces (id, slug, name, description)
VALUES ('ws-designer-default', 'default', 'Default Designer Workspace', 'Default multi-tenant workspace for ESPEDAIR Designer')
ON CONFLICT (id) DO NOTHING;
