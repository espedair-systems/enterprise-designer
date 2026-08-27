import React from 'react';
import {
  Plug,
  Database,
  Server,
  Code,
  Layers,
  Compass,
  Bot,
  Binary,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  FileCode,
  Sparkles,
  Zap,
  Globe
} from 'lucide-react';
import clsx from 'clsx';
import { useStore } from '../../store/useStore';

export interface RestInterfaceCard {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  baseUrl: string;
  port: number | string;
  protocol: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  methods: Array<'GET' | 'POST' | 'PUT' | 'DELETE'>;
  endpoints: string[];
  status: 'ONLINE' | 'ACTIVE' | 'CONNECTED';
  tags: string[];
}

export const REST_INTERFACES: RestInterfaceCard[] = [
  {
    id: 'business-artist-api',
    title: 'Business Architecture REST API',
    subtitle: 'Business Artist (:8082 / :8088) Core Engine',
    description: 'Authoritative REST CRUD and analytics for Business Capabilities (L1-L4), Value Streams, 5-Box SIPOC Processes, Strategic Goals, and Strategy Traceability Matrices.',
    baseUrl: 'http://localhost:8088/api/v1',
    port: 8088,
    protocol: 'REST / JSON (OpenAPI 3.1)',
    icon: Compass,
    color: 'from-cyan-500/20 via-cyan-500/5 to-transparent text-cyan-500 border-cyan-500/30',
    methods: ['GET', 'POST', 'DELETE'],
    endpoints: [
      '/api/v1/capabilities',
      '/api/v1/valuestreams',
      '/api/v1/processes',
      '/api/v1/goals',
      '/api/v1/analytics/dashboard',
      '/api/v1/analytics/heatmap',
      '/api/v1/analytics/traceability',
    ],
    status: 'ONLINE',
    tags: ['Capabilities', 'Value Streams', 'SIPOC', 'Traceability', 'PostgreSQL BT_BASE'],
  },
  {
    id: 'enterprise-artist-api',
    title: 'Enterprise Architecture REST API',
    subtitle: 'Enterprise Artist (:8080) Metamodel Service',
    description: 'Central TOGAF/ArchiMate fact sheet repository, metamodel aspect hierarchy, dynamic relations, and cross-studio architecture graph persistence.',
    baseUrl: 'http://localhost:8080/api/v1',
    port: 8080,
    protocol: 'REST / JSON (OpenAPI 3.1)',
    icon: Globe,
    color: 'from-indigo-500/20 via-indigo-500/5 to-transparent text-indigo-500 border-indigo-500/30',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    endpoints: [
      '/api/v1/factsheets',
      '/api/v1/metamodels',
      '/api/v1/relations',
      '/api/v1/catalogs',
      '/api/v1/health',
    ],
    status: 'ONLINE',
    tags: ['ArchiMate', 'TOGAF', 'Fact Sheets', 'Metamodel', 'PostgreSQL EA_BASE'],
  },
  {
    id: 'data-artist-api',
    title: 'Data Architecture REST API',
    subtitle: 'Data Artist (:8084) Information Catalog',
    description: 'Canonical Information Concepts, Logical Data Entities, Data Products, Schema Contracts, and OpenLineage data pipeline graphs.',
    baseUrl: 'http://localhost:8084/api/v1',
    port: 8084,
    protocol: 'REST / JSON (OpenAPI 3.1)',
    icon: Database,
    color: 'from-amber-500/20 via-amber-500/5 to-transparent text-amber-500 border-amber-500/30',
    methods: ['GET', 'POST'],
    endpoints: [
      '/api/v1/information/concepts',
      '/api/v1/data-products',
      '/api/v1/schemas',
      '/api/v1/lineage/contracts',
      '/api/v1/health',
    ],
    status: 'ONLINE',
    tags: ['Information Concepts', 'Data Products', 'OpenLineage', 'PostgreSQL DA_BASE'],
  },
  {
    id: 'enterprise-agent-api',
    title: 'Autonomous Agents & OmniGraph API',
    subtitle: 'Enterprise Agent (:8090) Multi-Agent Engine',
    description: 'Cognitive multi-agent session lifecycle, gRPC OmniGraph orchestration (:50051), automated architecture artifact synthesis, and Gemini 2.0 Flash reasoning.',
    baseUrl: 'http://localhost:8090/api/v1',
    port: 8090,
    protocol: 'REST / SSE / gRPC',
    icon: Bot,
    color: 'from-purple-500/20 via-purple-500/5 to-transparent text-purple-500 border-purple-500/30',
    methods: ['GET', 'POST'],
    endpoints: [
      '/api/v1/sessions',
      '/api/v1/omnigraph/status',
      '/api/v1/synthesis/artifacts',
      '/api/v1/agents/health',
    ],
    status: 'ONLINE',
    tags: ['Multi-Agent', 'OmniGraph', 'gRPC :50051', 'Gemini 2.0', 'Artifacts'],
  },
  {
    id: 'artifact-indexer-api',
    title: 'Artifact Vector Indexer REST API',
    subtitle: 'Artifact Indexer (:8095) Hexagonal Core',
    description: 'High-performance Rust AST vector embedding engine, multi-format parsers (SQL, DataStage, Alteryx, DOCX, PDF), and real-time LanceDB semantic search.',
    baseUrl: 'http://localhost:8095/api/v1',
    port: 8095,
    protocol: 'REST / JSON-RPC / MCP',
    icon: Binary,
    color: 'from-cyan-500/20 via-cyan-500/5 to-transparent text-cyan-500 border-cyan-500/30',
    methods: ['GET', 'POST'],
    endpoints: [
      '/health',
      '/api/v1/search',
      '/api/v1/status',
      '/api/v1/index/batch',
    ],
    status: 'ONLINE',
    tags: ['Rust Hexagonal', 'LanceDB Vectors', 'AST Parser', 'OpenLineage', 'nomic-embed-v1.5'],
  },
  {
    id: 'postgres-sql-api',
    title: 'PostgreSQL 3NF Metamodel & Explain API',
    subtitle: 'Database Schema & Query Engine (:8088)',
    description: 'Direct 3NF metamodel SQL execution, execution plan inspector (EXPLAIN & ANALYZE), live pg_stat_activity connection monitoring, and pg_statio table storage metrics.',
    baseUrl: 'http://localhost:8088/api/v1',
    port: 8088,
    protocol: 'REST / JSON',
    icon: Code,
    color: 'from-emerald-500/20 via-emerald-500/5 to-transparent text-emerald-500 border-emerald-500/30',
    methods: ['GET', 'POST'],
    endpoints: [
      '/api/v1/sql/query',
      '/api/v1/sql/explain',
      '/api/v1/database/activity',
      '/api/v1/database/table-stats',
    ],
    status: 'ONLINE',
    tags: ['PostgreSQL 3NF', 'EXPLAIN ANALYZE', 'pg_stat_activity', 'Storage Stats'],
  },
  {
    id: 'lancedb-vector-api',
    title: 'LanceDB Vector Search & RAG API',
    subtitle: 'Dense Vector Embeddings Service (:8088 / :8095)',
    description: 'Dense vector embeddings similarity search, Cosine distance ranking, top-K nearest neighbours retrieval, and authoritative grounded RAG synthesis.',
    baseUrl: 'http://localhost:8088/api/v1',
    port: 8088,
    protocol: 'REST / JSON',
    icon: Sparkles,
    color: 'from-rose-500/20 via-rose-500/5 to-transparent text-rose-500 border-rose-500/30',
    methods: ['GET', 'POST'],
    endpoints: [
      '/api/v1/vector/search',
      '/api/v1/vector/status',
      '/api/v1/vector/synthesize',
    ],
    status: 'ONLINE',
    tags: ['LanceDB', '768-dim', 'Cosine Similarity', 'IVF_PQ + HNSW', 'Semantic RAG'],
  },
];

export const IntegrationDirectory: React.FC = () => {
  const { setActiveView, setSelectedIntegrationApiId } = useStore();

  const totalEndpoints = REST_INTERFACES.reduce((acc, card) => acc + card.endpoints.length, 0);

  const handleSelectApi = (apiId: string) => {
    setSelectedIntegrationApiId(apiId);
    setActiveView('integration-schema');
  };

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto animate-in fade-in duration-300">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <div className="flex items-center gap-2.5 mb-1.5">
            <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold uppercase tracking-wider bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20">
              Enterprise Software Integration
            </span>
            <span className="text-xs text-muted-foreground font-mono">Internal REST APIs & OpenAPI 3.1</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-foreground">
            Internal REST API Interfaces Directory
          </h1>
          <p className="text-xs md:text-sm text-muted-foreground mt-1">
            Authoritative OpenAPI specifications, 3NF metamodel endpoints, and internal software integration APIs across all architecture studios.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => handleSelectApi('business-artist-api')}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/90 transition-colors cursor-pointer shadow-xs"
          >
            <Code className="w-4 h-4" />
            <span>Open API Schema Explorer</span>
          </button>
        </div>
      </div>

      {/* Metrics Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="p-5 rounded-2xl bg-card border border-border shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs text-muted-foreground font-semibold">
            <span>Internal REST Services</span>
            <Plug className="w-4 h-4 text-cyan-500" />
          </div>
          <div className="text-2xl font-extrabold text-foreground">{REST_INTERFACES.length} Software Studios</div>
          <div className="text-[11px] text-emerald-500 font-mono font-semibold">100% Operational Internal APIs</div>
        </div>

        <div className="p-5 rounded-2xl bg-card border border-border shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs text-muted-foreground font-semibold">
            <span>Total Endpoints</span>
            <Code className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-2xl font-extrabold text-foreground">{totalEndpoints} Routes</div>
          <div className="text-[11px] text-muted-foreground font-mono">OpenAPI 3.1 & JSON-RPC</div>
        </div>

        <div className="p-5 rounded-2xl bg-card border border-border shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs text-muted-foreground font-semibold">
            <span>Security Architecture</span>
            <ShieldCheck className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-2xl font-extrabold text-foreground">Internal JWT / RBAC</div>
          <div className="text-[11px] text-muted-foreground font-mono">Zero-Trust Inter-Service Auth</div>
        </div>

        <div className="p-5 rounded-2xl bg-card border border-border shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs text-muted-foreground font-semibold">
            <span>Metamodel Storage</span>
            <Database className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-extrabold text-foreground">PostgreSQL 3NF</div>
          <div className="text-[11px] text-muted-foreground font-mono">BT_BASE, EA_BASE, DA_BASE</div>
        </div>
      </div>

      {/* Internal REST API Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {REST_INTERFACES.map((apiItem) => {
          const Icon = apiItem.icon;

          return (
            <div
              key={apiItem.id}
              onClick={() => handleSelectApi(apiItem.id)}
              className={clsx(
                'group relative rounded-2xl border p-6 flex flex-col justify-between transition-all duration-300 cursor-pointer',
                'bg-gradient-to-b from-card to-card/80 hover:shadow-xl hover:-translate-y-1',
                'border-border hover:border-primary/50',
              )}
            >
              <div className="space-y-4">
                {/* Header Row */}
                <div className="flex items-start justify-between gap-3">
                  <div className={clsx('p-3 rounded-xl border bg-gradient-to-br', apiItem.color)}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      {apiItem.status}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-lg bg-muted text-muted-foreground border border-border">
                      {apiItem.port}
                    </span>
                  </div>
                </div>

                {/* Title & Subtitle */}
                <div>
                  <h3 className="text-base font-bold text-foreground group-hover:text-primary transition-colors">
                    {apiItem.title}
                  </h3>
                  <p className="text-xs text-muted-foreground font-medium mt-0.5">
                    {apiItem.subtitle}
                  </p>
                </div>

                <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
                  {apiItem.description}
                </p>

                {/* Methods & Endpoints Preview */}
                <div className="space-y-2 pt-2 border-t border-border/60">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-muted-foreground font-semibold">Methods:</span>
                    <div className="flex items-center gap-1">
                      {apiItem.methods.map((m) => (
                        <span
                          key={m}
                          className={clsx(
                            'px-1.5 py-0.2 rounded font-mono font-bold text-[9px]',
                            m === 'GET' && 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20',
                            m === 'POST' && 'bg-blue-500/10 text-blue-500 border border-blue-500/20',
                            m === 'PUT' && 'bg-amber-500/10 text-amber-500 border border-amber-500/20',
                            m === 'DELETE' && 'bg-rose-500/10 text-rose-500 border border-rose-500/20',
                          )}
                        >
                          {m}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-muted/40 border border-border/70 font-mono text-[11px] text-muted-foreground space-y-1 overflow-hidden">
                    <div className="text-[10px] text-primary/80 font-bold uppercase tracking-wider">
                      Internal Routes ({apiItem.endpoints.length})
                    </div>
                    {apiItem.endpoints.slice(0, 3).map((ep) => (
                      <div key={ep} className="truncate text-foreground/80 hover:text-foreground">
                        • {ep}
                      </div>
                    ))}
                    {apiItem.endpoints.length > 3 && (
                      <div className="text-[10px] text-muted-foreground/70 italic">
                        +{apiItem.endpoints.length - 3} more routes in schema...
                      </div>
                    )}
                  </div>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-1 pt-1">
                  {apiItem.tags.slice(0, 3).map((t) => (
                    <span
                      key={t}
                      className="px-2 py-0.5 text-[10px] font-mono rounded-md bg-muted/60 text-muted-foreground border border-border/60"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action Footer */}
              <div className="pt-4 mt-4 border-t border-border flex items-center justify-between">
                <span className="text-xs font-mono text-muted-foreground">
                  {apiItem.protocol}
                </span>
                <span className="flex items-center gap-1 text-xs font-semibold text-primary group-hover:translate-x-0.5 transition-transform">
                  View REST Schema
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
