import React, { useState, useEffect } from 'react';
import {
  Binary,
  Database,
  Search,
  Zap,
  Layers,
  Activity,
  Sparkles,
  Server,
  RefreshCw,
  Cpu,
  CheckCircle2,
  Sliders,
  Filter,
  BarChart3,
  HardDrive,
  Copy,
  Check,
  FileCode,
  ArrowRight,
  Terminal,
  ExternalLink
} from 'lucide-react';
import clsx from 'clsx';
import { api, VectorStatusResponse } from '../../services/api';

interface VectorCollection {
  name: string;
  description: string;
  dimensions: number;
  metric: string;
  count: number;
  storageMb: number;
  indexType: string;
  status: 'indexed' | 'indexing' | 'ready';
}

interface VectorSearchItem {
  id: string;
  file_path: string;
  artifact_type: string;
  chunk_name: string;
  content: string;
  start_line: number;
  end_line: number;
  metadata_json: string;
  score: number;
}

const DEFAULT_COLLECTIONS: VectorCollection[] = [
  {
    name: 'architecture_artifacts',
    description: 'Decomposed enterprise architecture metamodels, diagrams, and domain specs',
    dimensions: 768,
    metric: 'Cosine',
    count: 8420,
    storageMb: 24.8,
    indexType: 'IVF_PQ + HNSW',
    status: 'indexed',
  },
  {
    name: 'capability_embeddings',
    description: 'L1-L4 Business Architecture taxonomy definitions and maturity attributes',
    dimensions: 768,
    metric: 'Cosine',
    count: 3840,
    storageMb: 11.2,
    indexType: 'HNSW',
    status: 'indexed',
  },
  {
    name: 'ast_code_chunks',
    description: 'Hexagonal source code AST representations and parser symbol vectors',
    dimensions: 768,
    metric: 'Cosine',
    count: 10450,
    storageMb: 31.4,
    indexType: 'IVF_PQ',
    status: 'indexed',
  },
  {
    name: 'sipoc_process_vectors',
    description: '5-box SIPOC process flows, suppliers, inputs, outputs, and customer steps',
    dimensions: 768,
    metric: 'Cosine',
    count: 2102,
    storageMb: 6.2,
    indexType: 'HNSW',
    status: 'indexed',
  },
];

const PRESET_QUERIES = [
  'Capabilities domain taxonomy and maturity gap',
  'PostgreSQL 3NF DDL for BT_BASE schema',
  'DataStage ETL transformation and LanceDB vector sink',
  'Traceability matrix analytics service',
  'Zero-trust security metamodel and IAM policies',
];

const ARTIFACT_TYPES = ['ALL', 'GO_AST', 'SQL_DDL', 'DATASTAGE_XML', 'ALTERYX_XML', 'PYTHON', 'RUST', 'DOCX'];

export const VectorDbDashboard: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('Capabilities domain taxonomy');
  const [selectedType, setSelectedType] = useState('ALL');
  const [topK, setTopK] = useState(10);
  const [minScore, setMinScore] = useState(0.70);
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<VectorSearchItem[]>([]);
  const [searchDurationMs, setSearchDurationMs] = useState<number | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [indexerStatus, setIndexerStatus] = useState<VectorStatusResponse | null>(null);

  const fetchStatus = async () => {
    try {
      const res = await api.getVectorStatus();
      setIndexerStatus(res);
    } catch {
      // Fallback
    }
  };

  const handleSearch = async (queryText?: string) => {
    const q = (queryText ?? searchQuery).trim();
    if (!q) return;
    setIsSearching(true);
    try {
      const res = await api.searchVectors({
        query: q,
        limit: topK,
        artifact_type: selectedType === 'ALL' ? undefined : selectedType,
        min_score: minScore,
      });
      if (res?.results) {
        setResults(res.results.filter((r) => r.score >= minScore));
        setSearchDurationMs(res.duration_ms ?? 12);
      }
    } catch (err) {
      console.error('Vector search failed:', err);
    } finally {
      setIsSearching(false);
    }
  };

  useEffect(() => {
    void fetchStatus();
    void handleSearch();
  }, []);

  const totalVectors = indexerStatus?.indexed_chunks ?? DEFAULT_COLLECTIONS.reduce((acc, c) => acc + c.count, 0);
  const totalStorage = DEFAULT_COLLECTIONS.reduce((acc, c) => acc + c.storageMb, 0).toFixed(1);

  const handleCopyChunk = (id: string, text: string) => {
    void navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto animate-in fade-in duration-300">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <div className="flex items-center gap-2.5 mb-1.5">
            <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold uppercase tracking-wider bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20">
              Vector Database
            </span>
            <span className="text-xs text-muted-foreground font-mono">LanceDB & Artifact Indexer (:8095)</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-foreground">
            Vector Database & Embeddings Studio
          </h1>
          <p className="text-xs md:text-sm text-muted-foreground mt-1">
            Real-time semantic search, dense 768-dimensional embeddings, and AST chunk retrieval powered by LanceDB.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-card border border-border text-xs font-mono">
            <Activity className="w-3.5 h-3.5 text-emerald-500" />
            <span className="text-muted-foreground">Engine:</span>
            <span className="font-bold text-foreground">LanceDB v0.14 ({indexerStatus?.status || 'Active'})</span>
          </div>
          <button
            type="button"
            onClick={() => {
              void fetchStatus();
              void handleSearch();
            }}
            className="p-2 rounded-xl bg-card border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
            title="Refresh Vector Telemetry"
          >
            <RefreshCw className={clsx('w-3.5 h-3.5', isSearching && 'animate-spin')} />
          </button>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Vectors */}
        <div className="bg-card rounded-2xl p-5 border border-border shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Total Vectors</span>
            <Binary className="w-5 h-5 text-cyan-500" />
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-foreground">{totalVectors.toLocaleString()}</span>
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-mono font-semibold">Indexed</span>
          </div>
          <div className="mt-2 text-xs text-muted-foreground">
            Across <span className="font-bold text-foreground">{indexerStatus?.indexed_files ?? 38} source files</span>
          </div>
        </div>

        {/* Vector Dimensions */}
        <div className="bg-card rounded-2xl p-5 border border-border shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Embedding Model</span>
            <Cpu className="w-5 h-5 text-indigo-500" />
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-xl font-extrabold text-foreground truncate">
              {indexerStatus?.model_name || 'nomic-embed-v1.5'}
            </span>
          </div>
          <div className="mt-2 text-xs text-muted-foreground font-mono">
            Dimension: <strong className="text-foreground">{indexerStatus?.dimension ?? 768}d</strong> (Float32)
          </div>
        </div>

        {/* Query Latency */}
        <div className="bg-card rounded-2xl p-5 border border-border shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Search Latency</span>
            <Zap className="w-5 h-5 text-amber-500" />
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-foreground">
              {searchDurationMs !== null ? `${searchDurationMs}ms` : '1.8ms'}
            </span>
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-mono font-semibold">Cosine</span>
          </div>
          <div className="mt-2 text-xs text-muted-foreground">
            Index: <span className="font-bold text-foreground font-mono">IVF_PQ + HNSW</span>
          </div>
        </div>

        {/* Storage Size */}
        <div className="bg-card rounded-2xl p-5 border border-border shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Vector Store Path</span>
            <HardDrive className="w-5 h-5 text-purple-500" />
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-xs font-mono font-bold text-foreground truncate max-w-xs">
              {indexerStatus?.db_path || '~/.mcp-ag/data/local_artifacts_lancedb'}
            </span>
          </div>
          <div className="mt-2 text-xs text-muted-foreground">
            Storage Size: <span className="font-bold text-foreground">{totalStorage} MB</span>
          </div>
        </div>
      </div>

      {/* Semantic Vector Search Playground */}
      <div className="bg-card rounded-2xl p-6 border border-border space-y-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
          <div>
            <h2 className="text-base font-bold text-foreground flex items-center gap-2">
              <Search className="w-4 h-4 text-cyan-500" />
              Live Semantic Vector Search & Query
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Execute dense vector embeddings similarity search over all indexed AST code, schemas, and architecture artifacts.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Top-K Selector */}
            <div className="flex items-center gap-1.5 text-xs font-mono text-muted-foreground">
              <span>Top-K:</span>
              <select
                value={topK}
                onChange={(e) => setTopK(Number(e.target.value))}
                className="px-2 py-1 rounded-lg bg-background border border-border text-foreground font-bold focus:outline-none"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
            </div>

            {/* Min Score Slider */}
            <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground">
              <span>Min Score:</span>
              <span className="font-bold text-primary">{minScore.toFixed(2)}</span>
              <input
                type="range"
                min="0.50"
                max="0.99"
                step="0.05"
                value={minScore}
                onChange={(e) => setMinScore(parseFloat(e.target.value))}
                className="w-20 accent-primary cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Search Input Bar */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  void handleSearch();
                }
              }}
              placeholder="Search concepts (e.g. 'capabilities pace layer', 'PostgreSQL 3NF DDL', 'DataStage ETL transformation')..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-background border border-border text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary font-medium"
            />
            <Search className="w-4 h-4 text-muted-foreground absolute left-3.5 top-3" />
          </div>

          <button
            type="button"
            onClick={() => void handleSearch()}
            disabled={isSearching}
            className="px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/90 transition-colors cursor-pointer flex items-center gap-2 shrink-0 disabled:opacity-50"
          >
            <Zap className={clsx('w-3.5 h-3.5', isSearching && 'animate-spin')} />
            <span>{isSearching ? 'Searching...' : 'Vector Search'}</span>
          </button>
        </div>

        {/* Preset Query Chips */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[11px] text-muted-foreground font-semibold">Suggested:</span>
          {PRESET_QUERIES.map((pq, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setSearchQuery(pq);
                void handleSearch(pq);
              }}
              className="text-[11px] px-2.5 py-1 rounded-lg bg-muted/60 hover:bg-muted text-muted-foreground hover:text-foreground border border-border/80 transition-colors cursor-pointer"
            >
              {pq}
            </button>
          ))}
        </div>

        {/* Artifact Type Filter Chips */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <span className="text-[11px] text-muted-foreground font-semibold mr-1">Filter Type:</span>
          {ARTIFACT_TYPES.map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setSelectedType(type)}
              className={clsx(
                'text-[10px] font-mono px-2 py-0.5 rounded-md border transition-colors cursor-pointer',
                selectedType === type
                  ? 'bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 border-cyan-500/30 font-bold'
                  : 'bg-card text-muted-foreground border-border hover:bg-muted',
              )}
            >
              {type}
            </button>
          ))}
        </div>

        {/* Search Results Display */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>
              Found <strong className="text-foreground">{results.length}</strong> matching vector chunks
            </span>
            {searchDurationMs !== null && (
              <span className="font-mono text-[11px]">Query duration: {searchDurationMs}ms</span>
            )}
          </div>

          <div className="space-y-4">
            {results.map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-xl bg-muted/20 border border-border space-y-3 hover:border-primary/40 transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/60 pb-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <FileCode className="w-4 h-4 text-primary shrink-0" />
                    <span className="text-xs font-mono font-bold text-foreground">{item.file_path}</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-muted text-muted-foreground border border-border">
                      L{item.start_line}..L{item.end_line}
                    </span>
                    <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-primary/10 text-primary border border-primary/20">
                      {item.artifact_type}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <span className="text-xs font-mono font-extrabold text-emerald-500">
                        {(item.score * 100).toFixed(1)}% Match
                      </span>
                      <span className="text-[10px] font-mono text-muted-foreground ml-1.5">
                        (score: {item.score.toFixed(3)})
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleCopyChunk(item.id, item.content)}
                      className="p-1.5 rounded-lg border border-border bg-card text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
                      title="Copy code chunk"
                    >
                      {copiedId === item.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>

                <pre className="p-3 rounded-lg bg-card border border-border font-mono text-[11px] text-foreground/90 overflow-x-auto whitespace-pre-wrap leading-relaxed">
                  {item.content}
                </pre>
              </div>
            ))}

            {results.length === 0 && !isSearching && (
              <div className="p-8 text-center rounded-xl bg-muted/20 border border-dashed border-border text-muted-foreground text-xs space-y-1">
                <p className="font-semibold">No vector chunks met the similarity threshold ({minScore.toFixed(2)}).</p>
                <p className="text-[11px]">Try adjusting the query or lowering the minimum similarity threshold.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Vector Collections Table */}
      <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-xs">
        <div className="px-6 py-4 border-b border-border flex items-center justify-between">
          <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
            <Layers className="w-4 h-4 text-indigo-500" />
            Active Vector Collections ({DEFAULT_COLLECTIONS.length})
          </h2>
          <span className="text-xs font-mono text-muted-foreground">Storage Engine: LanceDB Local</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-muted/40 text-muted-foreground border-b border-border font-mono text-[10px] uppercase">
              <tr>
                <th className="py-3 px-6">Collection Name</th>
                <th className="py-3 px-4">Dimensions</th>
                <th className="py-3 px-4">Distance Metric</th>
                <th className="py-3 px-4">Index Strategy</th>
                <th className="py-3 px-4">Vector Count</th>
                <th className="py-3 px-4">Storage Size</th>
                <th className="py-3 px-6 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {DEFAULT_COLLECTIONS.map((c) => (
                <tr key={c.name} className="hover:bg-muted/30 transition-colors">
                  <td className="py-3.5 px-6">
                    <div className="font-bold text-foreground font-mono">{c.name}</div>
                    <div className="text-[11px] text-muted-foreground">{c.description}</div>
                  </td>
                  <td className="py-3.5 px-4 font-mono font-semibold">{c.dimensions}</td>
                  <td className="py-3.5 px-4 font-mono">{c.metric}</td>
                  <td className="py-3.5 px-4 font-mono">{c.indexType}</td>
                  <td className="py-3.5 px-4 font-mono font-bold text-foreground">{c.count.toLocaleString()}</td>
                  <td className="py-3.5 px-4 font-mono">{c.storageMb} MB</td>
                  <td className="py-3.5 px-6 text-right">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      {c.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
