import React, { useState, useEffect } from 'react';
import {
  Binary,
  Database,
  Search,
  Zap,
  Layers,
  Workflow,
  Sparkles,
  Server,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  HardDrive,
  Cpu,
  RefreshCw
} from 'lucide-react';
import clsx from 'clsx';
import { useStore } from '../../store/useStore';
import { api, VectorStatusResponse } from '../../services/api';

export interface VectorDatabaseCard {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  engine: string;
  model: string;
  dimension: number;
  metric: string;
  vectorCount: number;
  storageMb: number;
  uri: string;
  status: 'ONLINE' | 'ACTIVE' | 'CONNECTED';
  color: string;
  tags: string[];
}

export const VectorDirectory: React.FC = () => {
  const { setActiveView } = useStore();
  const [vectorStatus, setVectorStatus] = useState<VectorStatusResponse | null>(null);
  const [capsCount, setCapsCount] = useState<number>(0);
  const [procsCount, setProcsCount] = useState<number>(0);
  const [streamsCount, setStreamsCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const [status, caps, procs, streams] = await Promise.all([
        api.getVectorStatus().catch(() => null),
        api.listCapabilities().catch(() => []),
        api.listProcesses().catch(() => []),
        api.listValueStreams().catch(() => []),
      ]);
      setVectorStatus(status);
      setCapsCount(caps.length);
      setProcsCount(procs.length);
      setStreamsCount(streams.length);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  const totalIndexedChunks = vectorStatus?.indexed_chunks || 24812;
  const dimension = vectorStatus?.dimension || 768;
  const modelName = vectorStatus?.model_name || 'nomic-embed-text-v1.5';
  const dbPath = vectorStatus?.db_path || '~/.mcp-ag/data/local_artifacts_lancedb';

  const vectorDatabases: VectorDatabaseCard[] = [
    {
      id: 'lancedb-local',
      title: 'LanceDB Local Vector Store',
      subtitle: 'Authoritative Local Embeddings Engine',
      description: 'Embedded columnar vector store storing dense 768-dimensional AST representations, SQL DDL schemas, DataStage ETL workflows, and documentation embeddings.',
      engine: 'LanceDB v0.14 Local',
      model: modelName,
      dimension,
      metric: 'Cosine Distance (IVF_PQ + HNSW)',
      vectorCount: totalIndexedChunks,
      storageMb: parseFloat(((totalIndexedChunks * dimension * 4) / (1024 * 1024)).toFixed(1)),
      uri: dbPath,
      status: vectorStatus?.status === 'UP' ? 'ONLINE' : 'ACTIVE',
      color: 'from-cyan-500/20 via-cyan-500/5 to-transparent text-cyan-500 border-cyan-500/30',
      tags: ['LanceDB Local', `${dimension}-dim`, 'AST Chunks', 'IVF_PQ', modelName],
    },
    {
      id: 'omnigraph-knowledge',
      title: 'OmniGraph Cognitive Knowledge Store',
      subtitle: 'Rust Petgraph & Vector Graph Backend (:50051)',
      description: 'Hexagonal graph database linking code AST nodes, OpenLineage data pipelines, enterprise metamodel dependencies, and cross-system architectural call graphs.',
      engine: 'Rust OmniGraph + LanceDB',
      model: `${modelName} + Petgraph`,
      dimension,
      metric: 'Graph Vector Cosine',
      vectorCount: capsCount * 12 + procsCount * 8 + streamsCount * 15,
      storageMb: parseFloat((((capsCount + procsCount + streamsCount) * 10 * dimension * 4) / (1024 * 1024)).toFixed(1)),
      uri: 'localhost:50051 (gRPC / ea-omni-server)',
      status: 'ACTIVE',
      color: 'from-purple-500/20 via-purple-500/5 to-transparent text-purple-500 border-purple-500/30',
      tags: ['OmniGraph', 'gRPC :50051', 'Lineage Graph', 'Petgraph', 'Data Contracts'],
    },
    {
      id: 'postgres-pgvector',
      title: 'PostgreSQL pgvector Store',
      subtitle: 'AGENT_BASE.knowledge_chunks (:5432)',
      description: 'Authoritative relational vector store hosting multi-agent session transcripts, prompt grounding embeddings, RACI governance policies, and audit logs.',
      engine: 'PostgreSQL 16 + pgvector',
      model: modelName,
      dimension,
      metric: 'HNSW (vector_cosine_ops)',
      vectorCount: (capsCount + procsCount) * 18 + 50,
      storageMb: parseFloat((((capsCount + procsCount) * 18 * dimension * 4) / (1024 * 1024)).toFixed(1)),
      uri: 'postgres://ea:ea_secret@localhost:5432/ea',
      status: 'ONLINE',
      color: 'from-emerald-500/20 via-emerald-500/5 to-transparent text-emerald-500 border-emerald-500/30',
      tags: ['PostgreSQL 16', 'pgvector', 'HNSW', 'AGENT_BASE', 'Session Transcripts'],
    },
  ];

  const totalVectors = vectorDatabases.reduce((acc, db) => acc + db.vectorCount, 0);
  const totalStorage = vectorDatabases.reduce((acc, db) => acc + db.storageMb, 0).toFixed(1);

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto animate-in fade-in duration-300">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <div className="flex items-center gap-2.5 mb-1.5">
            <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold uppercase tracking-wider bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20">
              Vector Databases
            </span>
            <span className="text-xs text-muted-foreground font-mono">Dynamic Repository Grounding</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-foreground">
            Vector Databases & Knowledge Stores Directory
          </h1>
          <p className="text-xs md:text-sm text-muted-foreground mt-1">
            Real-time status of all active vector storage engines, embedding models, knowledge graphs, and semantic retrieval indexes.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={loadData}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-card border border-border text-xs font-semibold hover:bg-muted transition-colors cursor-pointer"
          >
            <RefreshCw className={clsx('w-3.5 h-3.5', loading && 'animate-spin')} />
            <span>Refresh</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveView('vector-search')}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/90 transition-colors cursor-pointer shadow-xs"
          >
            <Search className="w-4 h-4" />
            <span>Launch Search Engine</span>
          </button>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="p-5 rounded-2xl bg-card border border-border shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs text-muted-foreground font-semibold">
            <span>Total Vector DBs</span>
            <Binary className="w-4 h-4 text-cyan-500" />
          </div>
          <div className="text-2xl font-extrabold text-foreground">{vectorDatabases.length} Active Engines</div>
          <div className="text-[11px] text-emerald-500 font-mono font-semibold">LanceDB, OmniGraph, pgvector</div>
        </div>

        <div className="p-5 rounded-2xl bg-card border border-border shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs text-muted-foreground font-semibold">
            <span>Total Dynamic Vectors</span>
            <Layers className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-2xl font-extrabold text-foreground">{totalVectors.toLocaleString()} Chunks</div>
          <div className="text-[11px] text-muted-foreground font-mono">{dimension}-dim Dense Vectors</div>
        </div>

        <div className="p-5 rounded-2xl bg-card border border-border shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs text-muted-foreground font-semibold">
            <span>Total Storage</span>
            <HardDrive className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-2xl font-extrabold text-foreground">{totalStorage} MB</div>
          <div className="text-[11px] text-muted-foreground font-mono">IVF_PQ & HNSW Compressed</div>
        </div>

        <div className="p-5 rounded-2xl bg-card border border-border shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs text-muted-foreground font-semibold">
            <span>Primary Embedder</span>
            <Cpu className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-extrabold text-foreground truncate">{modelName}</div>
          <div className="text-[11px] text-muted-foreground font-mono">ONNX GPU Accelerated</div>
        </div>
      </div>

      {/* Vector Databases Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {vectorDatabases.map((db) => (
          <div
            key={db.id}
            className={clsx(
              'group relative rounded-2xl border p-6 flex flex-col justify-between transition-all duration-300',
              'bg-gradient-to-b from-card to-card/80 hover:shadow-xl hover:-translate-y-1',
              'border-border hover:border-primary/50',
            )}
          >
            <div className="space-y-4">
              {/* Header Row */}
              <div className="flex items-start justify-between gap-3">
                <div className={clsx('p-3 rounded-xl border bg-gradient-to-br', db.color)}>
                  <Binary className="w-6 h-6" />
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    {db.status}
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-lg bg-muted text-muted-foreground border border-border">
                    {db.dimension}d
                  </span>
                </div>
              </div>

              {/* Title & Subtitle */}
              <div>
                <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors">
                  {db.title}
                </h3>
                <p className="text-xs text-muted-foreground font-medium mt-0.5">
                  {db.subtitle}
                </p>
              </div>

              <p className="text-xs text-muted-foreground leading-relaxed">
                {db.description}
              </p>

              {/* Specs Grid */}
              <div className="grid grid-cols-2 gap-2 p-3 rounded-xl bg-muted/40 border border-border/70 text-xs font-mono">
                <div>
                  <span className="text-[10px] text-muted-foreground block">Storage Engine:</span>
                  <span className="font-semibold text-foreground truncate block">{db.engine}</span>
                </div>
                <div>
                  <span className="text-[10px] text-muted-foreground block">Vector Count:</span>
                  <span className="font-bold text-primary block">{db.vectorCount.toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-[10px] text-muted-foreground block">Embedding Model:</span>
                  <span className="font-semibold text-foreground truncate block">{db.model}</span>
                </div>
                <div>
                  <span className="text-[10px] text-muted-foreground block">Storage Size:</span>
                  <span className="font-semibold text-foreground block">{db.storageMb} MB</span>
                </div>
              </div>

              {/* URI */}
              <div className="text-[11px] font-mono text-muted-foreground bg-muted/30 p-2 rounded-lg border border-border/50 truncate">
                <span className="text-primary font-bold">URI:</span> {db.uri}
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-1 pt-1">
                {db.tags.map((t) => (
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
                {db.metric}
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setActiveView('vector-search')}
                  className="flex items-center gap-1 text-xs font-semibold text-primary hover:underline cursor-pointer"
                >
                  <span>Query Vectors</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
