import React from 'react';
import { useStore } from '../../store/useStore';
import { useDatabaseStore } from '../../store/database';
import {
  Database,
  Compass,
  Target,
  FileSpreadsheet,
  Sparkles,
  ShieldCheck,
  Cpu,
  Layers,
  Bot,
  ArrowUpRight,
  ChevronRight,
  Activity,
  Table2,
  GitBranch,
  Key
} from 'lucide-react';

interface SchemaCard {
  id: string;
  studioName: string;
  schemaName: string;
  subtitle: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  tableCount: number;
  columnCount: number;
  sampleTables: string[];
  tags: string[];
}

const AVAILABLE_SCHEMAS: SchemaCard[] = [
  {
    id: 'BASE_BASE',
    studioName: 'Base Artist',
    schemaName: 'BASE_BASE',
    subtitle: 'Authoritative Universal Architecture Metamodel',
    description: 'PostgreSQL 3NF canonical schema containing capabilities, value streams, 5-box SIPOC processes, org units, and strategic OKRs.',
    icon: Target,
    color: 'from-cyan-500/20 via-cyan-500/5 to-transparent text-cyan-500 border-cyan-500/30',
    tableCount: 16,
    columnCount: 78,
    sampleTables: ['capabilities', 'value_streams', 'processes', 'strategic_goals', 'org_units'],
    tags: ['L1-L4 Capabilities', 'Value Streams', 'SIPOC Processes', 'Strategic OKRs', 'RACI Matrix'],
  },
  {
    id: 'EA_BASE',
    studioName: 'Enterprise Artist',
    schemaName: 'EA_BASE',
    subtitle: 'TOGAF 10 & ArchiMate Metamodel Repository',
    description: 'Enterprise architecture fact sheets, aspect classifications, TOGAF phase B metamodel tables, and graph relationships.',
    icon: Compass,
    color: 'from-indigo-500/20 via-indigo-500/5 to-transparent text-indigo-500 border-indigo-500/30',
    tableCount: 14,
    columnCount: 64,
    sampleTables: ['dba_fact_sheet', 'dba_fact_type_catalog', 'dba_relation', 'dba_model_meta'],
    tags: ['TOGAF 10', 'ArchiMate 3.2', 'Fact Sheets', 'Metamodel Graph'],
  },
  {
    id: 'DA_BASE',
    studioName: 'Data Artist',
    schemaName: 'DA_BASE',
    subtitle: 'Information Concepts & Data Lineage Schemas',
    description: 'Business information concepts, glossary taxonomies, semantic entity models, data ownership, and ETL lineage flows.',
    icon: Database,
    color: 'from-emerald-500/20 via-emerald-500/5 to-transparent text-emerald-500 border-emerald-500/30',
    tableCount: 12,
    columnCount: 52,
    sampleTables: ['information_concepts', 'glossary_terms', 'data_entities', 'lineage_nodes'],
    tags: ['Information Concepts', 'Business Glossary', 'Data Lineage', 'Entity Dictionary'],
  },
  {
    id: 'AI_BASE',
    studioName: 'AI Artist',
    schemaName: 'AI_BASE',
    subtitle: 'Agentic Workflows & Prompt Execution Graph',
    description: 'Cognitive toolchains, multi-agent orchestration states, prompt template graphs, and Model Context Protocol (MCP) execution logs.',
    icon: Sparkles,
    color: 'from-purple-500/20 via-purple-500/5 to-transparent text-purple-500 border-purple-500/30',
    tableCount: 10,
    columnCount: 46,
    sampleTables: ['agent_sessions', 'prompt_graphs', 'mcp_tool_registry', 'cognitive_logs'],
    tags: ['Agent Orchestration', 'Prompt Graphs', 'MCP Registry', 'Cognitive Logs'],
  },
  {
    id: 'SEC_BASE',
    studioName: 'Security Artist',
    schemaName: 'SEC_BASE',
    subtitle: 'Zero-Trust Posture & IAM Entitlements',
    description: 'STRIDE threat vector tables, role-based authorization (RBAC), SSO authentication configurations, and immutable audit logs.',
    icon: ShieldCheck,
    color: 'from-amber-500/20 via-amber-500/5 to-transparent text-amber-500 border-amber-500/30',
    tableCount: 11,
    columnCount: 44,
    sampleTables: ['threat_models', 'rbac_roles', 'identity_providers', 'security_audit_logs'],
    tags: ['STRIDE Threats', 'RBAC Entitlements', 'SAML/OIDC', 'Audit Logs'],
  },
  {
    id: 'TECH_BASE',
    studioName: 'Technology Artist',
    schemaName: 'TECH_BASE',
    subtitle: 'Multi-Cloud Infrastructure & Service Topology',
    description: 'AWS / Azure / GCP cloud infrastructure catalog, Kubernetes cluster topology, runtime nodes, and live telemetry streaming.',
    icon: Cpu,
    color: 'from-blue-500/20 via-blue-500/5 to-transparent text-blue-500 border-blue-500/30',
    tableCount: 15,
    columnCount: 68,
    sampleTables: ['cloud_assets', 'k8s_clusters', 'service_runtimes', 'telemetry_metrics'],
    tags: ['Multi-Cloud Assets', 'Kubernetes Runtimes', 'Service Mesh', 'Telemetry Streaming'],
  },
  {
    id: 'APP_BASE',
    studioName: 'Application Artist',
    schemaName: 'APP_BASE',
    subtitle: 'Microservices Portfolio & C4 API Contracts',
    description: 'Enterprise microservices registry, REST and GraphQL OpenAPI contracts, C4 container definitions, and service level agreements.',
    icon: Layers,
    color: 'from-fuchsia-500/20 via-fuchsia-500/5 to-transparent text-fuchsia-500 border-fuchsia-500/30',
    tableCount: 13,
    columnCount: 56,
    sampleTables: ['microservices', 'api_contracts', 'c4_containers', 'service_slas'],
    tags: ['Microservices Catalog', 'API Contracts', 'C4 Containers', 'Service SLAs'],
  },
  {
    id: 'AGENT_BASE',
    studioName: 'Enterprise Agent & Vector Indexer',
    schemaName: 'AGENT_BASE',
    subtitle: 'Knowledge Chunks & Vector Metadata Store',
    description: 'LanceDB vector embedding indexes, AST source syntax representations, OpenLineage metadata graphs, and document chunks.',
    icon: Bot,
    color: 'from-rose-500/20 via-rose-500/5 to-transparent text-rose-500 border-rose-500/30',
    tableCount: 9,
    columnCount: 38,
    sampleTables: ['knowledge_chunks', 'vector_collections', 'ast_syntax_nodes', 'lineage_events'],
    tags: ['LanceDB Chunks', 'AST Syntax Nodes', 'OpenLineage Events', 'Vector Indexes'],
  },
];

export const DatabaseDirectory: React.FC = () => {
  const { setActiveView } = useStore();
  const { setSelectedSchemaName } = useDatabaseStore();

  const handleSelectSchema = (schema: SchemaCard) => {
    setSelectedSchemaName(schema.id);
    setActiveView('database-schema');
  };

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto animate-in fade-in duration-300">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <div className="flex items-center gap-2.5 mb-1.5">
            <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold uppercase tracking-wider bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
              Database Schemas
            </span>
            <span className="text-xs text-muted-foreground font-mono">8 PostgreSQL Studio Schemas</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-foreground">
            Database Schema Directory
          </h1>
          <p className="text-xs md:text-sm text-muted-foreground mt-1">
            Select a studio database schema to launch the interactive ERD diagram, tables, columns, and relational graph.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-card border border-border text-xs font-mono">
            <Activity className="w-3.5 h-3.5 text-emerald-500" />
            <span className="text-muted-foreground">Authoritative Namespace:</span>
            <span className="font-bold text-emerald-500 font-mono">BT_BASE (PostgreSQL 3NF)</span>
          </div>
        </div>
      </div>

      {/* ── Cards for each of the available database schemas for each of the studios ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {AVAILABLE_SCHEMAS.map((card) => {
          const Icon = card.icon;

          return (
            <div
              key={card.id}
              onClick={() => handleSelectSchema(card)}
              className="group relative rounded-2xl bg-card border border-border hover:border-primary/50 p-6 flex flex-col justify-between transition-all duration-200 hover:shadow-md cursor-pointer overflow-hidden"
            >
              {/* Accent Background Gradient */}
              <div className={`absolute inset-0 bg-gradient-to-br ${card.color} opacity-30 group-hover:opacity-60 transition-opacity pointer-events-none`} />

              <div className="relative space-y-4">
                {/* Header: Icon & Schema Badge */}
                <div className="flex items-start justify-between gap-2">
                  <div className="w-11 h-11 rounded-xl bg-card border border-border flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-bold font-mono px-2.5 py-1 rounded-md bg-card/90 border border-border text-foreground shadow-2xs">
                    {card.schemaName}
                  </span>
                </div>

                {/* Studio and Schema Title */}
                <div>
                  <div className="text-[11px] font-semibold text-primary uppercase tracking-wider mb-0.5 font-mono">
                    {card.studioName}
                  </div>
                  <h3 className="text-base font-bold text-foreground group-hover:text-primary transition-colors flex items-center gap-1.5">
                    <span>{card.schemaName}</span>
                    <ArrowUpRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </h3>
                  <div className="text-xs font-medium text-muted-foreground mt-0.5">{card.subtitle}</div>
                </div>

                <p className="text-xs text-muted-foreground leading-relaxed">
                  {card.description}
                </p>

                {/* Schema Structure Metrics */}
                <div className="grid grid-cols-2 gap-2 pt-1 text-[11px] font-mono">
                  <div className="p-2 rounded-lg bg-muted/40 border border-border/60">
                    <div className="text-[9px] uppercase tracking-wider text-muted-foreground font-semibold">Tables</div>
                    <div className="text-foreground font-bold truncate mt-0.5">{card.tableCount} Entities</div>
                  </div>
                  <div className="p-2 rounded-lg bg-muted/40 border border-border/60">
                    <div className="text-[9px] uppercase tracking-wider text-muted-foreground font-semibold">Columns</div>
                    <div className="text-foreground font-bold truncate mt-0.5">{card.columnCount} Attributes</div>
                  </div>
                </div>

                {/* Taxonomy / Table Tags */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {card.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-[9px] px-2 py-0.5 rounded font-mono bg-muted/80 text-muted-foreground border border-border/50"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Bottom Action Area */}
              <div className="relative pt-4 mt-4 border-t border-border/50 flex items-center justify-between text-xs font-semibold text-primary">
                <span>Explore Schema & ERD</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
