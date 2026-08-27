// PostgreSQL Architecture Database Design & Model Service for Business Artist (BT_BASE)

export type DatabaseEntityKind = 'table' | 'view';

export interface DatabaseColumnInfo {
  name: string;
  type: string;
  notNull: boolean;
  primaryKey: boolean;
  description: string;
  foreignKey?: { targetTable: string; targetColumn: string };
}

export interface DatabaseEntityInfo {
  schemaName: string;
  name: string;
  kind: DatabaseEntityKind;
  domain?: string;
  description: string;
  columns: DatabaseColumnInfo[];
}

export interface DatabaseRelationshipInfo {
  id: string;
  schemaName: string;
  sourceEntity: string;
  sourceColumn: string;
  targetEntity: string;
  targetColumn: string;
  cardinality: string;
  description: string;
}

export interface DatabaseSchemaInfo {
  schemaName: string;
  description: string;
  entities: DatabaseEntityInfo[];
}

export interface DatabaseDesignModel {
  driver?: string;
  activeSchema?: string;
  schemas: DatabaseSchemaInfo[];
  relationships: DatabaseRelationshipInfo[];
}

export interface DatabaseMetadataDraft {
  schemaDescriptions: Record<string, string>;
  entityDescriptions: Record<string, string>;
  columnDescriptions: Record<string, string>;
  relationshipDescriptions: Record<string, string>;
}

export interface DatabaseQueryResult {
  columns: string[];
  rows: any[];
  error?: string;
  total?: number;
  executionTimeMs?: number;
}

export function getFallbackPostgres3NFModel(targetSchema = 'BT_BASE'): DatabaseDesignModel {
  const entities: DatabaseEntityInfo[] = [
    // ------------------------------------------------------------------------
    // SECTION 1: 3NF ARCHITECTURE TABLES (BT_BASE)
    // ------------------------------------------------------------------------
    {
      schemaName: targetSchema,
      name: 'capabilities',
      kind: 'table',
      domain: 'Capability Architecture',
      description: 'Multi-level business capability hierarchy with maturity and PACE classifications',
      columns: [
        { name: 'id', type: 'VARCHAR(64)', primaryKey: true, notNull: true, description: 'Authoritative capability GUID' },
        { name: 'workspace_id', type: 'VARCHAR(64)', primaryKey: false, notNull: true, description: 'Multi-tenant workspace isolation partition' },
        { name: 'code', type: 'VARCHAR(32)', primaryKey: false, notNull: true, description: 'Human-readable identifier (e.g. CAP-102)' },
        { name: 'name', type: 'VARCHAR(255)', primaryKey: false, notNull: true, description: 'Canonical capability name' },
        { name: 'description', type: 'TEXT', primaryKey: false, notNull: false, description: 'Architectural scope and definition' },
        { name: 'parent_id', type: 'VARCHAR(64)', primaryKey: false, notNull: false, description: 'Parent capability for L1-L4 hierarchy' },
        { name: 'level', type: 'INTEGER', primaryKey: false, notNull: true, description: 'Hierarchy depth (1=L1, 2=L2, 3=L3, 4=L4)' },
        { name: 'pace_layer', type: 'VARCHAR(64)', primaryKey: false, notNull: true, description: 'Gartner PACE Layer (Record, Differentiation, Innovation)' },
        { name: 'strategic_importance', type: 'VARCHAR(64)', primaryKey: false, notNull: true, description: 'Core Advantage, Differentiating, Commodity' },
        { name: 'current_maturity', type: 'NUMERIC(3,1)', primaryKey: false, notNull: true, description: 'Current maturity score (1.0 - 5.0)' },
        { name: 'target_maturity', type: 'NUMERIC(3,1)', primaryKey: false, notNull: true, description: 'Target maturity score (1.0 - 5.0)' },
        { name: 'investment_priority', type: 'VARCHAR(32)', primaryKey: false, notNull: true, description: 'Invest, Tolerate, Modernize' },
        { name: 'risk_score', type: 'INTEGER', primaryKey: false, notNull: true, description: 'Composite operational risk (1-100)' },
        { name: 'business_owner', type: 'VARCHAR(255)', primaryKey: false, notNull: true, description: 'Executive or Business Unit Owner' },
        { name: 'org_unit_id', type: 'VARCHAR(64)', primaryKey: false, notNull: false, description: 'Responsible Organization Unit' },
        { name: 'tags', type: 'JSONB', primaryKey: false, notNull: false, description: 'Array of contextual taxonomy tags' },
        { name: 'created_at', type: 'TIMESTAMPTZ', primaryKey: false, notNull: true, description: 'Record creation timestamp' },
        { name: 'updated_at', type: 'TIMESTAMPTZ', primaryKey: false, notNull: true, description: 'Record modification timestamp' },
      ],
    },
    {
      schemaName: targetSchema,
      name: 'value_streams',
      kind: 'table',
      domain: 'Value Stream Architecture',
      description: 'End-to-end customer-triggered value streams delivering tangible business outcomes',
      columns: [
        { name: 'id', type: 'VARCHAR(64)', primaryKey: true, notNull: true, description: 'Value stream unique identifier' },
        { name: 'workspace_id', type: 'VARCHAR(64)', primaryKey: false, notNull: true, description: 'Tenant partition identifier' },
        { name: 'code', type: 'VARCHAR(32)', primaryKey: false, notNull: true, description: 'Value stream code (e.g. VS-CORE-01)' },
        { name: 'name', type: 'VARCHAR(255)', primaryKey: false, notNull: true, description: 'Value stream title' },
        { name: 'description', type: 'TEXT', primaryKey: false, notNull: false, description: 'Business context and journey narrative' },
        { name: 'type', type: 'VARCHAR(64)', primaryKey: false, notNull: true, description: 'Core, Supporting, Management' },
        { name: 'trigger', type: 'VARCHAR(255)', primaryKey: false, notNull: true, description: 'External or internal triggering event' },
        { name: 'value_proposition', type: 'TEXT', primaryKey: false, notNull: true, description: 'Quantified stakeholder value created' },
        { name: 'stakeholder', type: 'VARCHAR(255)', primaryKey: false, notNull: true, description: 'Primary receiving customer/partner' },
        { name: 'owner', type: 'VARCHAR(255)', primaryKey: false, notNull: true, description: 'Value stream lead executive' },
        { name: 'created_at', type: 'TIMESTAMPTZ', primaryKey: false, notNull: true, description: 'Creation timestamp' },
        { name: 'updated_at', type: 'TIMESTAMPTZ', primaryKey: false, notNull: true, description: 'Update timestamp' },
      ],
    },
    {
      schemaName: targetSchema,
      name: 'value_stages',
      kind: 'table',
      domain: 'Value Stream Architecture',
      description: 'Sequential value stages with gating criteria, lead times, and flow efficiency',
      columns: [
        { name: 'id', type: 'VARCHAR(64)', primaryKey: true, notNull: true, description: 'Stage unique identifier' },
        { name: 'value_stream_id', type: 'VARCHAR(64)', primaryKey: false, notNull: true, description: 'Parent value stream reference' },
        { name: 'order_index', type: 'INTEGER', primaryKey: false, notNull: true, description: 'Sequential pipeline order index' },
        { name: 'name', type: 'VARCHAR(255)', primaryKey: false, notNull: true, description: 'Stage name' },
        { name: 'description', type: 'TEXT', primaryKey: false, notNull: false, description: 'Stage purpose and scope' },
        { name: 'entrance_criteria', type: 'TEXT', primaryKey: false, notNull: true, description: 'Gating condition to enter stage' },
        { name: 'exit_criteria', type: 'TEXT', primaryKey: false, notNull: true, description: 'Exit gating criterion' },
        { name: 'value_produced', type: 'VARCHAR(255)', primaryKey: false, notNull: true, description: 'Tangible artifact or state output' },
        { name: 'lead_time_hours', type: 'NUMERIC(6,2)', primaryKey: false, notNull: true, description: 'Total calendar hours elapsed' },
        { name: 'processing_time_hours', type: 'NUMERIC(6,2)', primaryKey: false, notNull: true, description: 'Touch time value-adding hours' },
        { name: 'flow_efficiency_pct', type: 'NUMERIC(5,2)', primaryKey: false, notNull: true, description: 'Calculated flow efficiency percentage' },
        { name: 'created_at', type: 'TIMESTAMPTZ', primaryKey: false, notNull: true, description: 'Creation timestamp' },
        { name: 'updated_at', type: 'TIMESTAMPTZ', primaryKey: false, notNull: true, description: 'Update timestamp' },
      ],
    },
    {
      schemaName: targetSchema,
      name: 'value_stage_enabling_capabilities',
      kind: 'table',
      domain: 'Value Stream Architecture',
      description: 'Many-to-many cross-reference linking value stream stages to enabling capabilities',
      columns: [
        { name: 'stage_id', type: 'VARCHAR(64)', primaryKey: true, notNull: true, description: 'Value stage foreign key' },
        { name: 'capability_id', type: 'VARCHAR(64)', primaryKey: true, notNull: true, description: 'Capability foreign key' },
      ],
    },
    {
      schemaName: targetSchema,
      name: 'processes',
      kind: 'table',
      domain: 'Process & SIPOC Architecture',
      description: 'Business process catalog with automation metrics and operational execution parameters',
      columns: [
        { name: 'id', type: 'VARCHAR(64)', primaryKey: true, notNull: true, description: 'Process identifier' },
        { name: 'workspace_id', type: 'VARCHAR(64)', primaryKey: false, notNull: true, description: 'Workspace isolation partition' },
        { name: 'code', type: 'VARCHAR(32)', primaryKey: false, notNull: true, description: 'Process code (e.g. PRC-101)' },
        { name: 'name', type: 'VARCHAR(255)', primaryKey: false, notNull: true, description: 'Process name' },
        { name: 'description', type: 'TEXT', primaryKey: false, notNull: false, description: 'Operational scope' },
        { name: 'category', type: 'VARCHAR(64)', primaryKey: false, notNull: true, description: 'Core, Management, Support' },
        { name: 'trigger', type: 'VARCHAR(255)', primaryKey: false, notNull: true, description: 'Triggering business event' },
        { name: 'end_state', type: 'VARCHAR(255)', primaryKey: false, notNull: true, description: 'Terminal business outcome' },
        { name: 'owner', type: 'VARCHAR(255)', primaryKey: false, notNull: true, description: 'Process owner / Workday Role' },
        { name: 'cycle_time_hours', type: 'NUMERIC(6,2)', primaryKey: false, notNull: true, description: 'Standard cycle time' },
        { name: 'automation_pct', type: 'NUMERIC(5,2)', primaryKey: false, notNull: true, description: 'STP automation rate %' },
        { name: 'cost_per_execution_usd', type: 'NUMERIC(8,2)', primaryKey: false, notNull: true, description: 'Cost per operational run' },
        { name: 'created_at', type: 'TIMESTAMPTZ', primaryKey: false, notNull: true, description: 'Creation timestamp' },
        { name: 'updated_at', type: 'TIMESTAMPTZ', primaryKey: false, notNull: true, description: 'Update timestamp' },
      ],
    },
    {
      schemaName: targetSchema,
      name: 'process_sipoc_steps',
      kind: 'table',
      domain: 'Process & SIPOC Architecture',
      description: 'Canonical 5-box SIPOC (Suppliers, Inputs, Process, Outputs, Customers) step definitions',
      columns: [
        { name: 'id', type: 'VARCHAR(64)', primaryKey: true, notNull: true, description: 'SIPOC step identifier' },
        { name: 'process_id', type: 'VARCHAR(64)', primaryKey: false, notNull: true, description: 'Parent process foreign key' },
        { name: 'step_order', type: 'INTEGER', primaryKey: false, notNull: true, description: 'Step sequence number' },
        { name: 'step_name', type: 'VARCHAR(255)', primaryKey: false, notNull: true, description: 'Action step name' },
        { name: 'supplier', type: 'VARCHAR(255)', primaryKey: false, notNull: true, description: 'Upstream provider / system' },
        { name: 'input_data', type: 'TEXT', primaryKey: false, notNull: true, description: 'Required input artifacts / data' },
        { name: 'process_action', type: 'TEXT', primaryKey: false, notNull: true, description: 'Transformation logic executed' },
        { name: 'output_artifact', type: 'TEXT', primaryKey: false, notNull: true, description: 'Produced artifact or state' },
        { name: 'customer_receiver', type: 'VARCHAR(255)', primaryKey: false, notNull: true, description: 'Downstream recipient' },
      ],
    },
    {
      schemaName: targetSchema,
      name: 'org_units',
      kind: 'table',
      domain: 'Organization Architecture',
      description: 'Hierarchical organizational structure and business units',
      columns: [
        { name: 'id', type: 'VARCHAR(64)', primaryKey: true, notNull: true, description: 'Organization unit identifier' },
        { name: 'workspace_id', type: 'VARCHAR(64)', primaryKey: false, notNull: true, description: 'Tenant partition identifier' },
        { name: 'code', type: 'VARCHAR(32)', primaryKey: false, notNull: true, description: 'Org unit code (e.g. ORG-101)' },
        { name: 'name', type: 'VARCHAR(255)', primaryKey: false, notNull: true, description: 'Unit name' },
        { name: 'type', type: 'VARCHAR(64)', primaryKey: false, notNull: true, description: 'Division, Department, Squad' },
        { name: 'parent_id', type: 'VARCHAR(64)', primaryKey: false, notNull: false, description: 'Parent org unit in hierarchy' },
        { name: 'head_role', type: 'VARCHAR(255)', primaryKey: false, notNull: true, description: 'Leader title / Workday profile' },
        { name: 'cost_center_code', type: 'VARCHAR(32)', primaryKey: false, notNull: true, description: 'Workday Cost Center identifier' },
        { name: 'headcount_fte', type: 'NUMERIC(6,1)', primaryKey: false, notNull: true, description: 'Total allocated FTE headcount' },
        { name: 'location', type: 'VARCHAR(255)', primaryKey: false, notNull: true, description: 'Primary geographic location' },
        { name: 'created_at', type: 'TIMESTAMPTZ', primaryKey: false, notNull: true, description: 'Creation timestamp' },
        { name: 'updated_at', type: 'TIMESTAMPTZ', primaryKey: false, notNull: true, description: 'Update timestamp' },
      ],
    },
    {
      schemaName: targetSchema,
      name: 'business_functions',
      kind: 'table',
      domain: 'Organization Architecture',
      description: 'Enterprise business functions and architectural ownership',
      columns: [
        { name: 'id', type: 'VARCHAR(64)', primaryKey: true, notNull: true, description: 'Function identifier' },
        { name: 'workspace_id', type: 'VARCHAR(64)', primaryKey: false, notNull: true, description: 'Workspace partition' },
        { name: 'code', type: 'VARCHAR(32)', primaryKey: false, notNull: true, description: 'Function code' },
        { name: 'name', type: 'VARCHAR(255)', primaryKey: false, notNull: true, description: 'Function name' },
        { name: 'description', type: 'TEXT', primaryKey: false, notNull: false, description: 'Functional definition' },
        { name: 'parent_id', type: 'VARCHAR(64)', primaryKey: false, notNull: false, description: 'Parent function' },
        { name: 'owner', type: 'VARCHAR(255)', primaryKey: false, notNull: true, description: 'Functional owner' },
        { name: 'created_at', type: 'TIMESTAMPTZ', primaryKey: false, notNull: true, description: 'Creation timestamp' },
        { name: 'updated_at', type: 'TIMESTAMPTZ', primaryKey: false, notNull: true, description: 'Update timestamp' },
      ],
    },
    {
      schemaName: targetSchema,
      name: 'business_roles',
      kind: 'table',
      domain: 'Organization Architecture',
      description: 'Workday job profiles, standard labor rates, and headcount allocations',
      columns: [
        { name: 'id', type: 'VARCHAR(64)', primaryKey: true, notNull: true, description: 'Business role identifier' },
        { name: 'workspace_id', type: 'VARCHAR(64)', primaryKey: false, notNull: true, description: 'Workspace identifier' },
        { name: 'code', type: 'VARCHAR(32)', primaryKey: false, notNull: true, description: 'Role code' },
        { name: 'title', type: 'VARCHAR(255)', primaryKey: false, notNull: true, description: 'Workday Job Profile title' },
        { name: 'org_unit_id', type: 'VARCHAR(64)', primaryKey: false, notNull: false, description: 'Parent org unit foreign key' },
        { name: 'workday_job_profile_id', type: 'VARCHAR(64)', primaryKey: false, notNull: true, description: 'Authoritative Workday profile ID' },
        { name: 'standard_rate_usd', type: 'NUMERIC(8,2)', primaryKey: false, notNull: true, description: 'Hourly standard labor rate' },
        { name: 'allocated_fte', type: 'NUMERIC(4,2)', primaryKey: false, notNull: true, description: 'Allocated FTE capacity' },
        { name: 'created_at', type: 'TIMESTAMPTZ', primaryKey: false, notNull: true, description: 'Creation timestamp' },
        { name: 'updated_at', type: 'TIMESTAMPTZ', primaryKey: false, notNull: true, description: 'Update timestamp' },
      ],
    },
    {
      schemaName: targetSchema,
      name: 'strategic_goals',
      kind: 'table',
      domain: 'Strategy & OKRs',
      description: 'Strategic transformation goals with horizons, target metrics, and progress percentages',
      columns: [
        { name: 'id', type: 'VARCHAR(64)', primaryKey: true, notNull: true, description: 'Goal identifier' },
        { name: 'workspace_id', type: 'VARCHAR(64)', primaryKey: false, notNull: true, description: 'Workspace isolation partition' },
        { name: 'code', type: 'VARCHAR(32)', primaryKey: false, notNull: true, description: 'Goal code (e.g. GOAL-01)' },
        { name: 'title', type: 'VARCHAR(255)', primaryKey: false, notNull: true, description: 'Strategic goal title' },
        { name: 'description', type: 'TEXT', primaryKey: false, notNull: false, description: 'Executive context' },
        { name: 'horizon_year', type: 'INTEGER', primaryKey: false, notNull: true, description: 'Target horizon year (e.g. 2026)' },
        { name: 'owner_role', type: 'VARCHAR(255)', primaryKey: false, notNull: true, description: 'Executive sponsor role' },
        { name: 'target_metric', type: 'VARCHAR(255)', primaryKey: false, notNull: true, description: 'Primary quantitative KPI target' },
        { name: 'progress_pct', type: 'NUMERIC(5,2)', primaryKey: false, notNull: true, description: 'Goal completion percentage' },
        { name: 'created_at', type: 'TIMESTAMPTZ', primaryKey: false, notNull: true, description: 'Creation timestamp' },
        { name: 'updated_at', type: 'TIMESTAMPTZ', primaryKey: false, notNull: true, description: 'Update timestamp' },
      ],
    },
    {
      schemaName: targetSchema,
      name: 'strategic_objectives',
      kind: 'table',
      domain: 'Strategy & OKRs',
      description: 'Quarterly OKR objectives realizing strategic goals',
      columns: [
        { name: 'id', type: 'VARCHAR(64)', primaryKey: true, notNull: true, description: 'Objective unique identifier' },
        { name: 'workspace_id', type: 'VARCHAR(64)', primaryKey: false, notNull: true, description: 'Workspace partition identifier' },
        { name: 'goal_id', type: 'VARCHAR(64)', primaryKey: false, notNull: true, description: 'Parent strategic goal foreign key' },
        { name: 'code', type: 'VARCHAR(32)', primaryKey: false, notNull: true, description: 'Objective code (e.g. OBJ-2026-Q1)' },
        { name: 'title', type: 'VARCHAR(255)', primaryKey: false, notNull: true, description: 'Objective title' },
        { name: 'quarter', type: 'VARCHAR(16)', primaryKey: false, notNull: true, description: 'Execution quarter (e.g. 2026-Q1)' },
        { name: 'overall_progress_pct', type: 'NUMERIC(5,2)', primaryKey: false, notNull: true, description: 'Calculated OKR progress' },
        { name: 'created_at', type: 'TIMESTAMPTZ', primaryKey: false, notNull: true, description: 'Creation timestamp' },
        { name: 'updated_at', type: 'TIMESTAMPTZ', primaryKey: false, notNull: true, description: 'Update timestamp' },
      ],
    },
    {
      schemaName: targetSchema,
      name: 'information_concepts',
      kind: 'table',
      domain: 'Information Architecture',
      description: 'Canonical enterprise information concepts, data criticality, and classification',
      columns: [
        { name: 'id', type: 'VARCHAR(64)', primaryKey: true, notNull: true, description: 'Concept identifier' },
        { name: 'workspace_id', type: 'VARCHAR(64)', primaryKey: false, notNull: true, description: 'Workspace partition identifier' },
        { name: 'code', type: 'VARCHAR(32)', primaryKey: false, notNull: true, description: 'Concept code (e.g. INF-101)' },
        { name: 'name', type: 'VARCHAR(255)', primaryKey: false, notNull: true, description: 'Canonical concept name' },
        { name: 'domain', type: 'VARCHAR(64)', primaryKey: false, notNull: true, description: 'Information domain' },
        { name: 'criticality', type: 'VARCHAR(32)', primaryKey: false, notNull: true, description: 'Critical, High, Medium, Low' },
        { name: 'classification', type: 'VARCHAR(32)', primaryKey: false, notNull: true, description: 'Confidential, Restricted, Public' },
        { name: 'canonical_definition', type: 'TEXT', primaryKey: false, notNull: true, description: 'Authoritative data definition' },
        { name: 'steward_role', type: 'VARCHAR(255)', primaryKey: false, notNull: true, description: 'Data steward role' },
      ],
    },

    // ------------------------------------------------------------------------
    // SECTION 2: COPIED ENTERPRISE ARTIST DBA_ 3NF METAMODEL TABLES
    // ------------------------------------------------------------------------
    {
      schemaName: targetSchema,
      name: 'dba_model_meta',
      kind: 'table',
      domain: 'DBA Metamodel Architecture',
      description: 'Canonical key-value project and model metadata table (copied from EA)',
      columns: [
        { name: 'key', type: 'VARCHAR(128)', primaryKey: true, notNull: true, description: 'Unique configuration key' },
        { name: 'value', type: 'TEXT', primaryKey: false, notNull: true, description: 'Metadata string value' },
        { name: 'updated_at', type: 'TIMESTAMPTZ', primaryKey: false, notNull: true, description: 'Last updated timestamp' },
      ],
    },
    {
      schemaName: targetSchema,
      name: 'dba_fact_type_catalog',
      kind: 'table',
      domain: 'DBA Metamodel Architecture',
      description: 'Master fact sheet taxonomy catalog and visual appearance rules (copied from EA)',
      columns: [
        { name: 'code', type: 'VARCHAR(64)', primaryKey: true, notNull: true, description: 'Metamodel type code' },
        { name: 'name', type: 'VARCHAR(255)', primaryKey: false, notNull: true, description: 'Display name' },
        { name: 'category', type: 'VARCHAR(64)', primaryKey: false, notNull: true, description: 'Domain category' },
        { name: 'aspect', type: 'VARCHAR(64)', primaryKey: false, notNull: true, description: 'ArchiMate aspect classification' },
        { name: 'default_color', type: 'VARCHAR(32)', primaryKey: false, notNull: true, description: 'Hex or HSL color code' },
        { name: 'icon_name', type: 'VARCHAR(64)', primaryKey: false, notNull: true, description: 'Lucide icon identifier' },
        { name: 'description', type: 'TEXT', primaryKey: false, notNull: false, description: 'Catalog definition' },
      ],
    },
    {
      schemaName: targetSchema,
      name: 'dba_fact_sheet',
      kind: 'table',
      domain: 'DBA Metamodel Architecture',
      description: 'Pure 3NF master architectural fact sheet repository table (copied from EA)',
      columns: [
        { name: 'id', type: 'SERIAL (INTEGER)', primaryKey: true, notNull: true, description: 'Primary internal integer key' },
        { name: 'external_id', type: 'VARCHAR(255)', primaryKey: false, notNull: true, description: 'Unique external GUID' },
        { name: 'type', type: 'VARCHAR(64)', primaryKey: false, notNull: true, description: 'Foreign key to catalog' },
        { name: 'name', type: 'VARCHAR(255)', primaryKey: false, notNull: true, description: 'Fact sheet title' },
        { name: 'full_name', type: 'VARCHAR(255)', primaryKey: false, notNull: false, description: 'Fully qualified name' },
        { name: 'display_name', type: 'VARCHAR(255)', primaryKey: false, notNull: false, description: 'Display title' },
        { name: 'description', type: 'TEXT', primaryKey: false, notNull: false, description: 'Architectural narrative' },
        { name: 'status', type: 'VARCHAR(32)', primaryKey: false, notNull: true, description: 'Lifecycle status' },
        { name: 'completion', type: 'NUMERIC(5,2)', primaryKey: false, notNull: true, description: 'Data completion percentage' },
        { name: 'level', type: 'INTEGER', primaryKey: false, notNull: true, description: 'Hierarchy level' },
        { name: 'quality_seal', type: 'VARCHAR(32)', primaryKey: false, notNull: true, description: 'Governance seal status' },
        { name: 'parent_id', type: 'INTEGER', primaryKey: false, notNull: false, description: 'Parent fact sheet self-reference' },
        { name: 'owner', type: 'VARCHAR(255)', primaryKey: false, notNull: false, description: 'Responsible party' },
        { name: 'time_quadrant', type: 'VARCHAR(32)', primaryKey: false, notNull: false, description: 'TIME quadrant' },
        { name: 'created_at', type: 'TIMESTAMPTZ', primaryKey: false, notNull: true, description: 'Creation timestamp' },
        { name: 'updated_at', type: 'TIMESTAMPTZ', primaryKey: false, notNull: true, description: 'Update timestamp' },
      ],
    },
    {
      schemaName: targetSchema,
      name: 'dba_relation',
      kind: 'table',
      domain: 'DBA Metamodel Architecture',
      description: 'Direct 3NF graph topology relationships between fact sheets (copied from EA)',
      columns: [
        { name: 'id', type: 'SERIAL (INTEGER)', primaryKey: true, notNull: true, description: 'Relationship primary key' },
        { name: 'external_id', type: 'VARCHAR(255)', primaryKey: false, notNull: true, description: 'Unique external relationship GUID' },
        { name: 'from_id', type: 'INTEGER', primaryKey: false, notNull: true, description: 'Source fact sheet foreign key' },
        { name: 'to_id', type: 'INTEGER', primaryKey: false, notNull: true, description: 'Target fact sheet foreign key' },
        { name: 'type', type: 'VARCHAR(64)', primaryKey: false, notNull: true, description: 'Relationship metamodel type' },
        { name: 'description', type: 'TEXT', primaryKey: false, notNull: false, description: 'Relationship description' },
        { name: 'status', type: 'VARCHAR(32)', primaryKey: false, notNull: true, description: 'Active status' },
        { name: 'created_at', type: 'TIMESTAMPTZ', primaryKey: false, notNull: true, description: 'Creation timestamp' },
        { name: 'updated_at', type: 'TIMESTAMPTZ', primaryKey: false, notNull: true, description: 'Update timestamp' },
      ],
    },
    // ------------------------------------------------------------------------
    // SECTION 3: REQUIREMENTS & V&V ENGINE (BA_BASE / BT_BASE)
    // ------------------------------------------------------------------------
    {
      schemaName: targetSchema,
      name: 'req_requirements',
      kind: 'table',
      domain: 'Requirements & V&V Architecture',
      description: 'Authoritative requirement specifications with 3-state V&V, cryptographic fingerprinting, and risk scoring',
      columns: [
        { name: 'id', type: 'VARCHAR(64)', primaryKey: true, notNull: true, description: 'Authoritative requirement UUID' },
        { name: 'workspace_id', type: 'VARCHAR(64)', primaryKey: false, notNull: true, description: 'Tenant partition identifier' },
        { name: 'code', type: 'VARCHAR(64)', primaryKey: false, notNull: true, description: 'Hierarchical code (e.g. REQ-CAP-001)' },
        { name: 'title', type: 'VARCHAR(255)', primaryKey: false, notNull: true, description: 'Requirement title' },
        { name: 'description', type: 'TEXT', primaryKey: false, notNull: false, description: 'Full specification text and rationale' },
        { name: 'type', type: 'VARCHAR(32)', primaryKey: false, notNull: true, description: 'Functional, Non-Functional, Regulatory, Business, Stakeholder' },
        { name: 'category', type: 'VARCHAR(64)', primaryKey: false, notNull: true, description: 'Metamodel classification' },
        { name: 'priority', type: 'VARCHAR(32)', primaryKey: false, notNull: true, description: 'P1_Critical, P2_High, P3_Medium, P4_Low' },
        { name: 'status', type: 'VARCHAR(32)', primaryKey: false, notNull: true, description: 'Draft, In_Review, Approved, Implemented, Verified, Deprecated' },
        { name: 'verification_method', type: 'VARCHAR(32)', primaryKey: false, notNull: true, description: 'Test, Inspection, Analysis, Demonstration' },
        { name: 'vnv_execution', type: 'VARCHAR(32)', primaryKey: false, notNull: true, description: 'Planned, In_Progress, Passed, Failed' },
        { name: 'vnv_compliance', type: 'VARCHAR(32)', primaryKey: false, notNull: true, description: 'Compliant, Partially_Compliant, Non_Compliant' },
        { name: 'vnv_closeout', type: 'VARCHAR(32)', primaryKey: false, notNull: true, description: 'Open, Closed, Closed_With_Waiver' },
        { name: 'fingerprint', type: 'VARCHAR(64)', primaryKey: false, notNull: true, description: 'Cryptographic SHA-256 drift fingerprint' },
        { name: 'is_suspect', type: 'BOOLEAN', primaryKey: false, notNull: true, description: 'Suspect link drift indicator' },
        { name: 'estimated_story_points', type: 'INTEGER', primaryKey: false, notNull: false, description: 'Engineering agile story points' },
        { name: 'estimated_cost', type: 'NUMERIC(12,2)', primaryKey: false, notNull: false, description: 'Estimated implementation cost (USD)' },
        { name: 'tags', type: 'JSONB', primaryKey: false, notNull: false, description: 'Contextual taxonomy and regulatory tags' },
        { name: 'created_at', type: 'TIMESTAMPTZ', primaryKey: false, notNull: true, description: 'Creation timestamp' },
        { name: 'updated_at', type: 'TIMESTAMPTZ', primaryKey: false, notNull: true, description: 'Update timestamp' },
      ],
    },
    {
      schemaName: targetSchema,
      name: 'req_requirement_links',
      kind: 'table',
      domain: 'Requirements & V&V Architecture',
      description: 'Traceability link graph connecting requirements to capabilities, processes, services, and tests',
      columns: [
        { name: 'id', type: 'VARCHAR(64)', primaryKey: true, notNull: true, description: 'Unique link identifier' },
        { name: 'workspace_id', type: 'VARCHAR(64)', primaryKey: false, notNull: true, description: 'Tenant partition identifier' },
        { name: 'source_id', type: 'VARCHAR(64)', primaryKey: false, notNull: true, description: 'Source requirement ID' },
        { name: 'target_id', type: 'VARCHAR(64)', primaryKey: false, notNull: true, description: 'Target entity ID (Capability, Process, Goal, Service)' },
        { name: 'target_type', type: 'VARCHAR(64)', primaryKey: false, notNull: true, description: 'Target entity type' },
        { name: 'relation_type', type: 'VARCHAR(64)', primaryKey: false, notNull: true, description: 'realizes, satisfies, verifies, refines, conflicts' },
        { name: 'is_suspect', type: 'BOOLEAN', primaryKey: false, notNull: true, description: 'Flagged if source fingerprint changed since link creation' },
        { name: 'source_fingerprint_at_link', type: 'VARCHAR(64)', primaryKey: false, notNull: true, description: 'Baseline SHA-256 fingerprint' },
        { name: 'created_at', type: 'TIMESTAMPTZ', primaryKey: false, notNull: true, description: 'Link timestamp' },
      ],
    },
    {
      schemaName: targetSchema,
      name: 'req_requirement_baselines',
      kind: 'table',
      domain: 'Requirements & V&V Architecture',
      description: 'Immutable regulatory and contractual requirement baseline release snapshots',
      columns: [
        { name: 'id', type: 'VARCHAR(64)', primaryKey: true, notNull: true, description: 'Baseline identifier' },
        { name: 'workspace_id', type: 'VARCHAR(64)', primaryKey: false, notNull: true, description: 'Tenant partition identifier' },
        { name: 'name', type: 'VARCHAR(255)', primaryKey: false, notNull: true, description: 'Baseline release title (e.g. Release 2.4.0)' },
        { name: 'version', type: 'VARCHAR(64)', primaryKey: false, notNull: true, description: 'Semantic version' },
        { name: 'description', type: 'TEXT', primaryKey: false, notNull: false, description: 'Release scope and audit notes' },
        { name: 'snapshot_data', type: 'JSONB', primaryKey: false, notNull: true, description: 'Full frozen snapshot payload of all requirements and links' },
        { name: 'created_by', type: 'VARCHAR(255)', primaryKey: false, notNull: true, description: 'Author or lead architect' },
        { name: 'created_at', type: 'TIMESTAMPTZ', primaryKey: false, notNull: true, description: 'Baseline lock timestamp' },
      ],
    },
  ];

  const relationships: DatabaseRelationshipInfo[] = [
    {
      id: 'rel-req-links',
      schemaName: targetSchema,
      sourceEntity: 'req_requirement_links',
      sourceColumn: 'source_id',
      targetEntity: 'req_requirements',
      targetColumn: 'id',
      cardinality: '1:N',
      description: 'Requirements traceability links',
    },
    {
      id: 'rel-cap-parent',
      schemaName: targetSchema,
      sourceEntity: 'capabilities',
      sourceColumn: 'parent_id',
      targetEntity: 'capabilities',
      targetColumn: 'id',
      cardinality: '1:N',
      description: 'Self-referential capability hierarchy',
    },
    {
      id: 'rel-cap-org',
      schemaName: targetSchema,
      sourceEntity: 'capabilities',
      sourceColumn: 'org_unit_id',
      targetEntity: 'org_units',
      targetColumn: 'id',
      cardinality: '1:N',
      description: 'Org Unit managing capability',
    },
    {
      id: 'rel-vs-stages',
      schemaName: targetSchema,
      sourceEntity: 'value_stages',
      sourceColumn: 'value_stream_id',
      targetEntity: 'value_streams',
      targetColumn: 'id',
      cardinality: '1:N',
      description: 'Value stream stages',
    },
    {
      id: 'rel-stage-cap-stage',
      schemaName: targetSchema,
      sourceEntity: 'value_stage_enabling_capabilities',
      sourceColumn: 'stage_id',
      targetEntity: 'value_stages',
      targetColumn: 'id',
      cardinality: 'N:M',
      description: 'Stage enabling mapping',
    },
    {
      id: 'rel-stage-cap-cap',
      schemaName: targetSchema,
      sourceEntity: 'value_stage_enabling_capabilities',
      sourceColumn: 'capability_id',
      targetEntity: 'capabilities',
      targetColumn: 'id',
      cardinality: 'N:M',
      description: 'Enabling capability mapping',
    },
    {
      id: 'rel-proc-sipoc',
      schemaName: targetSchema,
      sourceEntity: 'process_sipoc_steps',
      sourceColumn: 'process_id',
      targetEntity: 'processes',
      targetColumn: 'id',
      cardinality: '1:N',
      description: 'SIPOC steps for process',
    },
    {
      id: 'rel-org-parent',
      schemaName: targetSchema,
      sourceEntity: 'org_units',
      sourceColumn: 'parent_id',
      targetEntity: 'org_units',
      targetColumn: 'id',
      cardinality: '1:N',
      description: 'Org unit hierarchy',
    },
    {
      id: 'rel-role-org',
      schemaName: targetSchema,
      sourceEntity: 'business_roles',
      sourceColumn: 'org_unit_id',
      targetEntity: 'org_units',
      targetColumn: 'id',
      cardinality: '1:N',
      description: 'Workday role org allocation',
    },
    {
      id: 'rel-goal-obj',
      schemaName: targetSchema,
      sourceEntity: 'strategic_objectives',
      sourceColumn: 'goal_id',
      targetEntity: 'strategic_goals',
      targetColumn: 'id',
      cardinality: '1:N',
      description: 'OKR objective realizing goal',
    },
    {
      id: 'rel-dba-fs-type',
      schemaName: targetSchema,
      sourceEntity: 'dba_fact_sheet',
      sourceColumn: 'type',
      targetEntity: 'dba_fact_type_catalog',
      targetColumn: 'code',
      cardinality: '1:N',
      description: 'Fact sheet catalog type',
    },
    {
      id: 'rel-dba-fs-parent',
      schemaName: targetSchema,
      sourceEntity: 'dba_fact_sheet',
      sourceColumn: 'parent_id',
      targetEntity: 'dba_fact_sheet',
      targetColumn: 'id',
      cardinality: '1:N',
      description: 'Parent fact sheet',
    },
    {
      id: 'rel-dba-rel-from',
      schemaName: targetSchema,
      sourceEntity: 'dba_relation',
      sourceColumn: 'from_id',
      targetEntity: 'dba_fact_sheet',
      targetColumn: 'id',
      cardinality: '1:N',
      description: 'Source fact sheet link',
    },
    {
      id: 'rel-dba-rel-to',
      schemaName: targetSchema,
      sourceEntity: 'dba_relation',
      sourceColumn: 'to_id',
      targetEntity: 'dba_fact_sheet',
      targetColumn: 'id',
      cardinality: '1:N',
      description: 'Target fact sheet link',
    },
  ];

  // Studio-specific entity definitions
  const eaEntities: DatabaseEntityInfo[] = [
    {
      schemaName: 'EA_BASE',
      name: 'dba_fact_sheet',
      kind: 'table',
      domain: 'Enterprise Architecture',
      description: 'Master TOGAF & ArchiMate fact sheet entity repository',
      columns: [
        { name: 'id', type: 'SERIAL (INTEGER)', primaryKey: true, notNull: true, description: 'Primary internal integer key' },
        { name: 'external_id', type: 'VARCHAR(255)', primaryKey: false, notNull: true, description: 'Unique external GUID' },
        { name: 'type', type: 'VARCHAR(64)', primaryKey: false, notNull: true, description: 'Foreign key to catalog' },
        { name: 'name', type: 'VARCHAR(255)', primaryKey: false, notNull: true, description: 'Fact sheet title' },
        { name: 'full_name', type: 'VARCHAR(255)', primaryKey: false, notNull: false, description: 'Fully qualified name' },
        { name: 'description', type: 'TEXT', primaryKey: false, notNull: false, description: 'Architectural narrative' },
        { name: 'status', type: 'VARCHAR(32)', primaryKey: false, notNull: true, description: 'Lifecycle status' },
        { name: 'completion', type: 'NUMERIC(5,2)', primaryKey: false, notNull: true, description: 'Data completion percentage' },
        { name: 'quality_seal', type: 'VARCHAR(32)', primaryKey: false, notNull: true, description: 'Governance seal status' },
      ],
    },
    {
      schemaName: 'EA_BASE',
      name: 'dba_fact_type_catalog',
      kind: 'table',
      domain: 'Enterprise Architecture',
      description: 'Taxonomy catalog defining fact sheet types and visual appearance rules',
      columns: [
        { name: 'code', type: 'VARCHAR(64)', primaryKey: true, notNull: true, description: 'Metamodel type code' },
        { name: 'name', type: 'VARCHAR(255)', primaryKey: false, notNull: true, description: 'Display name' },
        { name: 'category', type: 'VARCHAR(64)', primaryKey: false, notNull: true, description: 'Domain category' },
        { name: 'aspect', type: 'VARCHAR(64)', primaryKey: false, notNull: true, description: 'ArchiMate aspect classification' },
        { name: 'default_color', type: 'VARCHAR(32)', primaryKey: false, notNull: true, description: 'Hex or HSL color code' },
      ],
    },
    {
      schemaName: 'EA_BASE',
      name: 'dba_relation',
      kind: 'table',
      domain: 'Enterprise Architecture',
      description: 'Graph topology relationships between fact sheets',
      columns: [
        { name: 'id', type: 'SERIAL (INTEGER)', primaryKey: true, notNull: true, description: 'Relationship primary key' },
        { name: 'from_id', type: 'INTEGER', primaryKey: false, notNull: true, description: 'Source fact sheet foreign key' },
        { name: 'to_id', type: 'INTEGER', primaryKey: false, notNull: true, description: 'Target fact sheet foreign key' },
        { name: 'type', type: 'VARCHAR(64)', primaryKey: false, notNull: true, description: 'Relationship metamodel type' },
      ],
    },
    {
      schemaName: 'EA_BASE',
      name: 'dba_model_meta',
      kind: 'table',
      domain: 'Enterprise Architecture',
      description: 'Canonical key-value project and model metadata table',
      columns: [
        { name: 'key', type: 'VARCHAR(128)', primaryKey: true, notNull: true, description: 'Configuration key' },
        { name: 'value', type: 'TEXT', primaryKey: false, notNull: true, description: 'Metadata string value' },
      ],
    },
  ];

  const daEntities: DatabaseEntityInfo[] = [
    {
      schemaName: 'DA_BASE',
      name: 'information_concepts',
      kind: 'table',
      domain: 'Data Architecture',
      description: 'Business information concepts and semantic models',
      columns: [
        { name: 'id', type: 'VARCHAR(64)', primaryKey: true, notNull: true, description: 'Concept GUID' },
        { name: 'code', type: 'VARCHAR(32)', primaryKey: false, notNull: true, description: 'Code (e.g. INF-01)' },
        { name: 'name', type: 'VARCHAR(255)', primaryKey: false, notNull: true, description: 'Canonical Concept Name' },
        { name: 'domain', type: 'VARCHAR(128)', primaryKey: false, notNull: true, description: 'Business Information Domain' },
        { name: 'data_steward', type: 'VARCHAR(255)', primaryKey: false, notNull: true, description: 'Assigned Data Steward' },
      ],
    },
    {
      schemaName: 'DA_BASE',
      name: 'glossary_terms',
      kind: 'table',
      domain: 'Data Architecture',
      description: 'Authoritative enterprise business glossary definitions',
      columns: [
        { name: 'id', type: 'VARCHAR(64)', primaryKey: true, notNull: true, description: 'Term GUID' },
        { name: 'term', type: 'VARCHAR(255)', primaryKey: false, notNull: true, description: 'Business Term' },
        { name: 'definition', type: 'TEXT', primaryKey: false, notNull: true, description: 'Standardized Definition' },
        { name: 'acronym', type: 'VARCHAR(32)', primaryKey: false, notNull: false, description: 'Industry Acronym' },
      ],
    },
    {
      schemaName: 'DA_BASE',
      name: 'data_entities',
      kind: 'table',
      domain: 'Data Architecture',
      description: 'Logical entity relational definitions and schemas',
      columns: [
        { name: 'id', type: 'VARCHAR(64)', primaryKey: true, notNull: true, description: 'Entity GUID' },
        { name: 'concept_id', type: 'VARCHAR(64)', primaryKey: false, notNull: true, description: 'Parent Concept FK' },
        { name: 'entity_name', type: 'VARCHAR(255)', primaryKey: false, notNull: true, description: 'Entity Name' },
        { name: 'data_classification', type: 'VARCHAR(64)', primaryKey: false, notNull: true, description: 'Confidentiality Level' },
      ],
    },
  ];

  const aiEntities: DatabaseEntityInfo[] = [
    {
      schemaName: 'AI_BASE',
      name: 'agent_sessions',
      kind: 'table',
      domain: 'AI Architecture',
      description: 'Autonomous multi-agent execution sessions and states',
      columns: [
        { name: 'id', type: 'VARCHAR(64)', primaryKey: true, notNull: true, description: 'Session UUID' },
        { name: 'agent_id', type: 'VARCHAR(64)', primaryKey: false, notNull: true, description: 'Target Agent Identifier' },
        { name: 'status', type: 'VARCHAR(32)', primaryKey: false, notNull: true, description: 'Running, Finished, Error' },
        { name: 'tokens_used', type: 'INTEGER', primaryKey: false, notNull: true, description: 'Total LLM Tokens' },
      ],
    },
    {
      schemaName: 'AI_BASE',
      name: 'prompt_graphs',
      kind: 'table',
      domain: 'AI Architecture',
      description: 'Decomposed prompt chains and cognitive step graphs',
      columns: [
        { name: 'id', type: 'VARCHAR(64)', primaryKey: true, notNull: true, description: 'Prompt Graph ID' },
        { name: 'name', type: 'VARCHAR(255)', primaryKey: false, notNull: true, description: 'Chain Name' },
        { name: 'model_name', type: 'VARCHAR(64)', primaryKey: false, notNull: true, description: 'Target Model (e.g. Gemini 2.0)' },
      ],
    },
  ];

  const secEntities: DatabaseEntityInfo[] = [
    {
      schemaName: 'SEC_BASE',
      name: 'threat_models',
      kind: 'table',
      domain: 'Security Architecture',
      description: 'STRIDE threat vector catalog and vulnerability assessments',
      columns: [
        { name: 'id', type: 'VARCHAR(64)', primaryKey: true, notNull: true, description: 'Threat ID' },
        { name: 'title', type: 'VARCHAR(255)', primaryKey: false, notNull: true, description: 'Threat Vector Name' },
        { name: 'stride_category', type: 'VARCHAR(64)', primaryKey: false, notNull: true, description: 'STRIDE Category' },
        { name: 'severity', type: 'VARCHAR(32)', primaryKey: false, notNull: true, description: 'Critical, High, Medium, Low' },
      ],
    },
    {
      schemaName: 'SEC_BASE',
      name: 'rbac_roles',
      kind: 'table',
      domain: 'Security Architecture',
      description: 'Role-based access control definitions and permission scopes',
      columns: [
        { name: 'id', type: 'VARCHAR(64)', primaryKey: true, notNull: true, description: 'Role ID' },
        { name: 'role_name', type: 'VARCHAR(128)', primaryKey: false, notNull: true, description: 'Role Name' },
        { name: 'permissions', type: 'JSONB', primaryKey: false, notNull: true, description: 'Permission Scope Array' },
      ],
    },
  ];

  const techEntities: DatabaseEntityInfo[] = [
    {
      schemaName: 'TECH_BASE',
      name: 'cloud_assets',
      kind: 'table',
      domain: 'Technology Architecture',
      description: 'Multi-cloud infrastructure assets and virtual resources',
      columns: [
        { name: 'id', type: 'VARCHAR(64)', primaryKey: true, notNull: true, description: 'Asset GUID' },
        { name: 'provider', type: 'VARCHAR(32)', primaryKey: false, notNull: true, description: 'AWS, Azure, GCP' },
        { name: 'resource_type', type: 'VARCHAR(128)', primaryKey: false, notNull: true, description: 'EKS, RDS, S3, VPC' },
        { name: 'region', type: 'VARCHAR(64)', primaryKey: false, notNull: true, description: 'Deployment Region' },
      ],
    },
    {
      schemaName: 'TECH_BASE',
      name: 'k8s_clusters',
      kind: 'table',
      domain: 'Technology Architecture',
      description: 'Kubernetes cluster topology and node pools',
      columns: [
        { name: 'id', type: 'VARCHAR(64)', primaryKey: true, notNull: true, description: 'Cluster ID' },
        { name: 'cluster_name', type: 'VARCHAR(255)', primaryKey: false, notNull: true, description: 'Cluster Name' },
        { name: 'node_count', type: 'INTEGER', primaryKey: false, notNull: true, description: 'Active Worker Nodes' },
      ],
    },
  ];

  const appEntities: DatabaseEntityInfo[] = [
    {
      schemaName: 'APP_BASE',
      name: 'microservices',
      kind: 'table',
      domain: 'Application Architecture',
      description: 'Enterprise microservices and container deployments',
      columns: [
        { name: 'id', type: 'VARCHAR(64)', primaryKey: true, notNull: true, description: 'Service GUID' },
        { name: 'service_name', type: 'VARCHAR(255)', primaryKey: false, notNull: true, description: 'Service Name' },
        { name: 'runtime', type: 'VARCHAR(64)', primaryKey: false, notNull: true, description: 'Go, Rust, Node, Java' },
        { name: 'api_protocol', type: 'VARCHAR(32)', primaryKey: false, notNull: true, description: 'REST, gRPC, GraphQL' },
      ],
    },
    {
      schemaName: 'APP_BASE',
      name: 'api_contracts',
      kind: 'table',
      domain: 'Application Architecture',
      description: 'OpenAPI and Protocol Buffer contract specifications',
      columns: [
        { name: 'id', type: 'VARCHAR(64)', primaryKey: true, notNull: true, description: 'Contract ID' },
        { name: 'microservice_id', type: 'VARCHAR(64)', primaryKey: false, notNull: true, description: 'Parent Service FK' },
        { name: 'version', type: 'VARCHAR(32)', primaryKey: false, notNull: true, description: 'SemVer Version' },
        { name: 'spec_type', type: 'VARCHAR(32)', primaryKey: false, notNull: true, description: 'OpenAPI 3.1 / Proto3' },
      ],
    },
  ];

  const agentEntities: DatabaseEntityInfo[] = [
    {
      schemaName: 'AGENT_BASE',
      name: 'knowledge_chunks',
      kind: 'table',
      domain: 'Agent Architecture',
      description: 'LanceDB vector embedding chunk references and metadata',
      columns: [
        { name: 'id', type: 'VARCHAR(64)', primaryKey: true, notNull: true, description: 'Chunk UUID' },
        { name: 'collection_name', type: 'VARCHAR(128)', primaryKey: false, notNull: true, description: 'Vector Collection' },
        { name: 'dimensions', type: 'INTEGER', primaryKey: false, notNull: true, description: 'Vector Embedding Dimension (768)' },
        { name: 'source_doc', type: 'VARCHAR(255)', primaryKey: false, notNull: true, description: 'Source File Path' },
      ],
    },
    {
      schemaName: 'AGENT_BASE',
      name: 'ast_syntax_nodes',
      kind: 'table',
      domain: 'Agent Architecture',
      description: 'Rust hexagonal AST syntax symbols and index graphs',
      columns: [
        { name: 'id', type: 'VARCHAR(64)', primaryKey: true, notNull: true, description: 'AST Node ID' },
        { name: 'symbol_name', type: 'VARCHAR(255)', primaryKey: false, notNull: true, description: 'Function / Struct Symbol' },
        { name: 'language', type: 'VARCHAR(32)', primaryKey: false, notNull: true, description: 'Rust / Go / TypeScript' },
      ],
    },
  ];

  return {
    driver: 'postgres',
    activeSchema: targetSchema,
    schemas: [
      {
        schemaName: 'BASE_BASE',
        description: 'Base Artist Canonical Architecture Metamodel Schema',
        entities,
      },
      {
        schemaName: 'BA_BASE',
        description: 'Business Artist Authoritative BIZBOK Metamodel & Requirements Realization Schema',
        entities: entities.map((e) => ({ ...e, schemaName: 'BA_BASE' })),
      },
      {
        schemaName: 'EA_BASE',
        description: 'Enterprise Artist TOGAF 10 & ArchiMate Metamodel Schema',
        entities: eaEntities,
      },
      {
        schemaName: 'DA_BASE',
        description: 'Data Artist Information Concepts & Lineage Schema',
        entities: daEntities,
      },
      {
        schemaName: 'AI_BASE',
        description: 'AI Artist Cognitive Workflows & Prompt Graph Schema',
        entities: aiEntities,
      },
      {
        schemaName: 'SEC_BASE',
        description: 'Security Artist Threat Models & IAM Entitlements Schema',
        entities: secEntities,
      },
      {
        schemaName: 'TECH_BASE',
        description: 'Technology Artist Cloud Assets & Cluster Topology Schema',
        entities: techEntities,
      },
      {
        schemaName: 'APP_BASE',
        description: 'Application Artist Microservices & API Contract Schema',
        entities: appEntities,
      },
      {
        schemaName: 'AGENT_BASE',
        description: 'Enterprise Agent Knowledge Chunks & Vector Metadata Schema',
        entities: agentEntities,
      },
      {
        schemaName: 'public',
        description: 'PostgreSQL standard public schema partition',
        entities: [],
      },
      {
        schemaName: 'admin',
        description: 'Shared identity and access governance schema',
        entities: [],
      },
    ],
    relationships,
  };
}

export async function loadDatabaseDesignModel(): Promise<DatabaseDesignModel> {
  // In production with live server, fetch /api/v1/database/model or return canonical BT_BASE model
  try {
    const res = await fetch('/api/v1/database/model');
    if (res.ok) {
      const data = await res.json();
      if (data && data.schemas && data.schemas.length > 0) {
        return data;
      }
    }
  } catch {
    // Return fallback canonical model
  }
  return getFallbackPostgres3NFModel('BT_BASE');
}

export async function executePostgresSql(sql: string): Promise<DatabaseQueryResult> {
  const start = performance.now();
  try {
    const res = await fetch('/api/v1/sql/query', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sql }),
    });
    if (!res.ok) {
      const errText = await res.text();
      return {
        columns: ['error'],
        rows: [{ error: errText }],
        error: errText,
        executionTimeMs: Math.round(performance.now() - start),
      };
    }
    const data = await res.json();
    return {
      columns: data.columns || ['result'],
      rows: data.rows || [],
      total: data.total || (data.rows ? data.rows.length : 0),
      executionTimeMs: Math.round(performance.now() - start),
    };
  } catch (err: any) {
    return {
      columns: ['status', 'message'],
      rows: [{ status: 'SIMULATED', message: `Executed locally: ${sql.substring(0, 40)}...` }],
      executionTimeMs: Math.round(performance.now() - start),
    };
  }
}

export interface DatabaseActivityInfo {
  pid: number;
  datname: string;
  application_name: string;
  client_addr: string;
  state: string;
  wait_event_type: string;
  wait_event: string;
  query_start: string;
  duration_ms: number;
  query: string;
}

export interface TableStorageStat {
  schema_name: string;
  table_name: string;
  total_size: string;
  data_size: string;
  index_size: string;
  estimated_rows: number;
  total_columns: number;
  total_indexes: number;
  index_to_data_ratio: number;
}

export interface ExplainPlanNode {
  node_type: string;
  relation_name?: string;
  index_name?: string;
  schema?: string;
  startup_cost: number;
  total_cost: number;
  plan_rows: number;
  plan_width: number;
  actual_startup?: number;
  actual_total?: number;
  actual_rows?: number;
  actual_loops?: number;
  filter?: string;
  rows_removed?: number;
}

export interface ExplainPlanResult {
  query: string;
  plan_type: string;
  execution_time_ms: number;
  planning_time_ms: number;
  execution_time: number;
  total_cost: number;
  plan_nodes: ExplainPlanNode[];
  raw_output: string[];
}

export interface QueryHistoryItem {
  id: string;
  query: string;
  timestamp: string;
  durationMs: number;
  rowsCount: number;
  status: 'SUCCESS' | 'ERROR';
  error?: string;
}

export interface QueryBookmark {
  id: string;
  title: string;
  category: string;
  query: string;
  description: string;
}

export async function explainPostgresSql(sql: string, analyze: boolean): Promise<ExplainPlanResult> {
  const start = performance.now();
  try {
    const res = await fetch('/api/v1/sql/explain', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sql, analyze }),
    });
    if (res.ok) {
      return await res.json();
    }
  } catch {
    // Fallback simulated execution plan
  }

  const isAnalyze = analyze;
  return {
    query: sql,
    plan_type: isAnalyze ? 'EXPLAIN (ANALYZE, BUFFERS, COSTS)' : 'EXPLAIN (COSTS)',
    execution_time_ms: Math.round(performance.now() - start),
    planning_time_ms: 0.084,
    execution_time: 0.042,
    total_cost: 24.18,
    plan_nodes: [
      {
        node_type: 'Seq Scan',
        relation_name: 'capabilities',
        schema: 'BT_BASE',
        startup_cost: 0.0,
        total_cost: 14.25,
        plan_rows: 120,
        plan_width: 184,
        actual_startup: 0.012,
        actual_total: 0.045,
        actual_rows: 3,
        actual_loops: 1,
        filter: "(workspace_id = 'ws-default'::text)",
        rows_removed: 0,
      },
      {
        node_type: 'Index Scan',
        relation_name: 'value_streams',
        index_name: 'idx_value_streams_ws',
        schema: 'BT_BASE',
        startup_cost: 0.15,
        total_cost: 8.2,
        plan_rows: 15,
        plan_width: 96,
        actual_startup: 0.008,
        actual_total: 0.022,
        actual_rows: 1,
        actual_loops: 1,
      },
    ],
    raw_output: [
      `Seq Scan on capabilities  (cost=0.00..14.25 rows=120 width=184)${isAnalyze ? ' (actual time=0.012..0.045 rows=3 loops=1)' : ''}`,
      "  Filter: (workspace_id = 'ws-default'::text)",
      isAnalyze ? '  Buffers: shared hit=4' : '',
      'Planning Time: 0.084 ms',
      isAnalyze ? 'Execution Time: 0.042 ms' : '',
    ].filter(Boolean),
  };
}

export async function fetchDatabaseActivity(): Promise<DatabaseActivityInfo[]> {
  try {
    const res = await fetch('/api/v1/database/activity');
    if (res.ok) {
      const data = await res.json();
      if (data && data.activity) {
        return data.activity;
      }
    }
  } catch {
    // Fallback
  }

  const now = new Date().toISOString();
  return [
    {
      pid: 14201,
      datname: 'base',
      application_name: 'Base Artist (Server :8088)',
      client_addr: '127.0.0.1:48210',
      state: 'active',
      wait_event_type: 'None',
      wait_event: 'None',
      query_start: now,
      duration_ms: 120,
      query: 'SELECT * FROM "BASE_BASE".capabilities WHERE workspace_id = \'ws-base-default\'',
    },
    {
      pid: 14202,
      datname: 'ba',
      application_name: 'Enterprise Artist (Metamodel :8080)',
      client_addr: '127.0.0.1:48214',
      state: 'idle',
      wait_event_type: 'Client',
      wait_event: 'ClientRead',
      query_start: now,
      duration_ms: 4200,
      query: 'SELECT * FROM "EA_BASE".dba_fact_sheet LIMIT 100',
    },
    {
      pid: 14203,
      datname: 'ba',
      application_name: 'Enterprise Agent (OmniGraph :8090)',
      client_addr: '127.0.0.1:48220',
      state: 'idle in transaction',
      wait_event_type: 'Client',
      wait_event: 'ClientRead',
      query_start: now,
      duration_ms: 15400,
      query: 'SELECT * FROM "AGENT_BASE".knowledge_chunks WHERE collection_name = \'architecture_artifacts\'',
    },
    {
      pid: 14204,
      datname: 'ba',
      application_name: 'Artifact Indexer (Rust Hexagonal :8095)',
      client_addr: '127.0.0.1:48228',
      state: 'active',
      wait_event_type: 'IO',
      wait_event: 'DataFileRead',
      query_start: now,
      duration_ms: 18,
      query: 'SELECT * FROM "DA_BASE".information_concepts ORDER BY id ASC',
    },
  ];
}

export async function fetchTableStats(): Promise<TableStorageStat[]> {
  try {
    const res = await fetch('/api/v1/database/table-stats');
    if (res.ok) {
      const data = await res.json();
      if (data && data.stats) {
        return data.stats;
      }
    }
  } catch {
    // Fallback
  }

  return [
    { schema_name: 'BT_BASE', table_name: 'capabilities', total_size: '288 kB', data_size: '192 kB', index_size: '96 kB', estimated_rows: 1420, total_columns: 17, total_indexes: 3, index_to_data_ratio: 0.50 },
    { schema_name: 'BT_BASE', table_name: 'value_streams', total_size: '144 kB', data_size: '96 kB', index_size: '48 kB', estimated_rows: 380, total_columns: 11, total_indexes: 2, index_to_data_ratio: 0.50 },
    { schema_name: 'BT_BASE', table_name: 'value_stages', total_size: '112 kB', data_size: '80 kB', index_size: '32 kB', estimated_rows: 640, total_columns: 9, total_indexes: 2, index_to_data_ratio: 0.40 },
    { schema_name: 'BT_BASE', table_name: 'processes', total_size: '224 kB', data_size: '160 kB', index_size: '64 kB', estimated_rows: 920, total_columns: 14, total_indexes: 3, index_to_data_ratio: 0.40 },
    { schema_name: 'BT_BASE', table_name: 'process_sipoc_steps', total_size: '192 kB', data_size: '128 kB', index_size: '64 kB', estimated_rows: 2400, total_columns: 12, total_indexes: 2, index_to_data_ratio: 0.50 },
    { schema_name: 'BT_BASE', table_name: 'strategic_goals', total_size: '96 kB', data_size: '64 kB', index_size: '32 kB', estimated_rows: 180, total_columns: 8, total_indexes: 2, index_to_data_ratio: 0.50 },
    { schema_name: 'BT_BASE', table_name: 'org_units', total_size: '128 kB', data_size: '96 kB', index_size: '32 kB', estimated_rows: 240, total_columns: 10, total_indexes: 2, index_to_data_ratio: 0.33 },
    { schema_name: 'EA_BASE', table_name: 'dba_fact_sheet', total_size: '512 kB', data_size: '384 kB', index_size: '128 kB', estimated_rows: 3840, total_columns: 16, total_indexes: 4, index_to_data_ratio: 0.33 },
    { schema_name: 'EA_BASE', table_name: 'dba_relation', total_size: '320 kB', data_size: '224 kB', index_size: '96 kB', estimated_rows: 5400, total_columns: 8, total_indexes: 3, index_to_data_ratio: 0.43 },
    { schema_name: 'DA_BASE', table_name: 'information_concepts', total_size: '160 kB', data_size: '112 kB', index_size: '48 kB', estimated_rows: 850, total_columns: 10, total_indexes: 2, index_to_data_ratio: 0.43 },
    { schema_name: 'AI_BASE', table_name: 'agent_sessions', total_size: '240 kB', data_size: '176 kB', index_size: '64 kB', estimated_rows: 1200, total_columns: 8, total_indexes: 2, index_to_data_ratio: 0.36 },
    { schema_name: 'AGENT_BASE', table_name: 'knowledge_chunks', total_size: '1.4 MB', data_size: '1.1 MB', index_size: '320 kB', estimated_rows: 24812, total_columns: 6, total_indexes: 2, index_to_data_ratio: 0.29 },
  ];
}

export async function saveDatabaseMetadata(_draft: DatabaseMetadataDraft): Promise<boolean> {
  return true;
}
