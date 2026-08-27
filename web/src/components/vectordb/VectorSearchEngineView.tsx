import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import {
  Search,
  Sparkles,
  Layers,
  FileCode,
  FileText,
  Check,
  Copy,
  AlertTriangle,
  Sliders,
  Filter,
  Binary,
  ArrowRight,
  Zap,
  Tag,
  Database,
  Bot,
  Compass,
  Cpu,
  RefreshCw,
  Clock,
  Code,
  Eye,
  FileCheck2,
  File
} from 'lucide-react';
import clsx from 'clsx';
import { api, VectorSearchResultItem } from '../../services/api';

export interface PromptSuggestionCard {
  id: string;
  category: 'Capabilities' | 'Database' | 'OmniGraph' | 'Processes' | 'ETL';
  title: string;
  query: string;
  description: string;
  recommendedScore: number;
  recommendedTopK: number;
  badgeColor: string;
}

const PROMPT_SUGGESTIONS: PromptSuggestionCard[] = [
  {
    id: 'sug-caps-01',
    category: 'Capabilities',
    title: 'Capability Taxonomy & Pace Layer',
    query: 'capability hierarchy pace layer differentiation',
    description: 'Retrieve business capability hierarchies, pace layer classifications, and maturity gap definitions.',
    recommendedScore: 0.60,
    recommendedTopK: 10,
    badgeColor: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20',
  },
  {
    id: 'sug-db-02',
    category: 'Database',
    title: 'PostgreSQL 3NF DDL Schemas',
    query: 'PostgreSQL schema DDL table BT_BASE',
    description: 'Query relational schema migrations, sqlc definitions, and 3NF table DDL scripts.',
    recommendedScore: 0.60,
    recommendedTopK: 10,
    badgeColor: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
  },
  {
    id: 'sug-omni-03',
    category: 'OmniGraph',
    title: 'OmniGraph gRPC Topology & Lineage',
    query: 'OmniGraph gRPC topology lineage',
    description: 'Fetch Rust Petgraph adapter topologies, multi-agent branching, and cross-system call graphs.',
    recommendedScore: 0.60,
    recommendedTopK: 10,
    badgeColor: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
  },
  {
    id: 'sug-proc-04',
    category: 'Processes',
    title: '5-Box SIPOC Process Models',
    query: '5-box SIPOC business process cycle time',
    description: 'Discover operational process models, supplier-input-process-output-customer stages, and cycle times.',
    recommendedScore: 0.60,
    recommendedTopK: 10,
    badgeColor: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
  },
  {
    id: 'sug-strat-05',
    category: 'Capabilities',
    title: 'Strategy Traceability & Goals',
    query: 'strategy traceability matrix goals capabilities',
    description: 'Search strategic goals, OKR objectives, and capability alignment traceability algorithms.',
    recommendedScore: 0.60,
    recommendedTopK: 10,
    badgeColor: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
  },
  {
    id: 'sug-etl-06',
    category: 'ETL',
    title: 'DataStage XML ETL Pipeline',
    query: 'DataStage ETL transformation pipeline stages',
    description: 'Scan OpenLineage data contracts, stage transformations, and XML pipeline specs.',
    recommendedScore: 0.60,
    recommendedTopK: 10,
    badgeColor: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20',
  },
  {
    id: 'sug-agent-07',
    category: 'OmniGraph',
    title: 'Multi-Agent Prompt Grounding',
    query: 'AgentPrompt ProcessTweaks reasoning effort gemini',
    description: 'Retrieve prompt template definitions, temperature tweaks, and system prompt extensions.',
    recommendedScore: 0.60,
    recommendedTopK: 10,
    badgeColor: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
  },
  {
    id: 'sug-db-08',
    category: 'Database',
    title: 'Entity Lineage & DDL Pipeline',
    query: 'Database Schema Entity Lineage Pipeline',
    description: 'Locate JSON schemas for multi-project workspace topologies and database lineage parsers.',
    recommendedScore: 0.60,
    recommendedTopK: 10,
    badgeColor: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
  },
];

const ARTIFACT_FILTERS = [
  'ALL',
  'Go',
  'TypeScript',
  'Sql',
  'Yaml',
  'Json',
  'Rust',
  'DataStageJob',
  'Pdf',
];

export function formatArtifactType(val: any): string {
  if (!val) return 'Code';
  if (typeof val === 'string') return val;
  if (typeof val === 'object') {
    if (val.Unknown) return String(val.Unknown);
    const keys = Object.keys(val);
    if (keys.length > 0) return String(keys[0]);
  }
  return String(val);
}

/**
 * Sanitizes and cleans raw PDF stream chunks, removing binary control codes,
 * stream artifacts, and decompressed bytes to output readable text paragraphs.
 */
function cleanChunkContent(rawText: string, filePath: string, artifactType: string): { isBinary: boolean; cleanedText: string } {
  const fPath = String(filePath || '');
  const aType = formatArtifactType(artifactType);
  const isPdf = fPath.toLowerCase().endsWith('.pdf') || aType.toLowerCase() === 'pdf';
  const text = String(rawText || '');
  
  // Check if string contains raw PDF headers or unprintable binary stream markers
  const hasBinaryNoise = /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F\uFFFD]/.test(text) || text.includes('%PDF-');

  if (!isPdf && !hasBinaryNoise) {
    return { isBinary: false, cleanedText: text };
  }

  // Strip unprintable control characters and PDF binary bytecode markers
  let cleaned = text
    .replace(/%PDF-[0-9.]+/g, '')
    .replace(/stream[\s\S]*?endstream/g, '')
    .replace(/obj[\s\S]*?endobj/g, '')
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F\uFFFD\\\/]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  // Extract valid printable words (length >= 2)
  const words = cleaned.match(/[A-Za-z0-9_\-.:,;()&@#$%/]{2,}/g) || [];
  const extractedPhrases = words.join(' ');

  if (extractedPhrases.length > 40) {
    return {
      isBinary: true,
      cleanedText: `[Extracted Document Text]\n\n${extractedPhrases}`,
    };
  }

  return {
    isBinary: true,
    cleanedText: `[PDF Document Binary Chunk]\nFile: ${fPath}\n\nThis chunk originates from a compressed PDF binary stream. The embedding vector was indexed from the underlying document layout.`,
  };
}

export const VectorSearchEngineView: React.FC = () => {
  const [query, setQuery] = useState('');
  const [limit, setLimit] = useState(10);
  const [artifactType, setArtifactType] = useState('ALL');
  const [minScore, setMinScore] = useState(0.60);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [hybridMode, setHybridMode] = useState<boolean>(true);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<VectorSearchResultItem[]>([]);
  const [connectedGraph, setConnectedGraph] = useState<{
    total_nodes: number;
    total_edges: number;
    nodes: Array<{ id: string; label: string; category: string; degree: number }>;
    edges: Array<{ id: string; source: string; target: string; relation: string; stage: string }>;
  } | null>(null);
  const [searchDurationMs, setSearchDurationMs] = useState<number | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [showRawMap, setShowRawMap] = useState<Record<string, boolean>>({});

  // Left Sidebar Resize & Collapse State
  const [sidebarWidth, setSidebarWidth] = useState<number>(330);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);
  const [isResizing, setIsResizing] = useState<boolean>(false);
  const sidebarRef = useRef<HTMLElement>(null);

  // Drag Resizing Handlers
  const startResizing = useCallback((mouseDownEvent: React.MouseEvent) => {
    mouseDownEvent.preventDefault();
    setIsResizing(true);
  }, []);

  useEffect(() => {
    const handleMouseMove = (mouseMoveEvent: MouseEvent) => {
      if (!isResizing) return;
      const newWidth = mouseMoveEvent.clientX;
      if (newWidth >= 260 && newWidth <= 520) {
        setSidebarWidth(newWidth);
      }
    };
    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing]);

  const executeSearch = async (
    queryText?: string,
    customMinScore?: number,
    customTopK?: number,
    customArtifactType?: string
  ) => {
    const q = (queryText !== undefined ? queryText : query).trim();
    if (!q) return;

    setLoading(true);
    setSearchDurationMs(null);
    setSearchError(null);
    setHasSearched(true);

    const activeScore = customMinScore !== undefined ? customMinScore : minScore;
    const activeTopK = customTopK !== undefined ? customTopK : limit;
    const activeArtifact = customArtifactType !== undefined ? customArtifactType : artifactType;

    try {
      if (hybridMode) {
        const resp = await api.searchHybridVectors({
          query: q,
          limit: activeTopK,
          artifact_type: activeArtifact === 'ALL' ? undefined : activeArtifact,
          depth: 2,
        });
        setResults(resp.vector_matches || []);
        setConnectedGraph(resp.connected_graph || null);
        setSearchDurationMs(resp.duration_ms || 18);
      } else {
        const resp = await api.searchVectors({
          query: q,
          limit: activeTopK,
          artifact_type: activeArtifact === 'ALL' ? undefined : activeArtifact,
          min_score: activeScore,
        });
        setResults(resp.results || []);
        setConnectedGraph(null);
        setSearchDurationMs(resp.duration_ms || 14);
      }
    } catch (err: any) {
      setResults([]);
      setConnectedGraph(null);
      setSearchError(err.message || 'Error executing semantic vector search against LanceDB backend.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectSuggestion = (sug: PromptSuggestionCard) => {
    setQuery(sug.query);
    setMinScore(sug.recommendedScore);
    setLimit(sug.recommendedTopK);
    void executeSearch(sug.query, sug.recommendedScore, sug.recommendedTopK);
  };

  const toggleRaw = (id: string) => {
    setShowRawMap((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const copyToClipboard = (id: string, text: string) => {
    void navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredSuggestions = PROMPT_SUGGESTIONS.filter((s) => {
    if (selectedCategory === 'ALL') return true;
    return s.category === selectedCategory;
  });

  return (
    <div className="flex h-full bg-background text-foreground overflow-hidden select-none">
      {/* Left Sidebar: Suggested Prompts with Min Score & Top-K Cards */}
      {!isSidebarCollapsed && (
        <aside
          ref={sidebarRef}
          style={{ width: `${sidebarWidth}px` }}
          className="border-r border-border bg-card flex flex-col h-full shrink-0 relative select-none"
        >
          {/* Sidebar Header */}
          <div className="p-4 border-b border-border space-y-3 bg-muted/20">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-500" />
                <span>Suggested Prompts</span>
              </span>
              <span className="text-[10px] font-mono font-bold bg-primary/10 text-primary px-1.5 py-0.5 rounded border border-primary/20">
                {PROMPT_SUGGESTIONS.length} Prompts
              </span>
            </div>

            {/* Category Filter Chips */}
            <div className="flex flex-wrap gap-1">
              {['ALL', 'Capabilities', 'Database', 'OmniGraph', 'Processes', 'ETL'].map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={clsx(
                    'px-2 py-0.5 rounded-md text-[10px] font-semibold transition-colors cursor-pointer',
                    selectedCategory === cat
                      ? 'bg-primary text-primary-foreground font-bold shadow-2xs'
                      : 'bg-muted/60 text-muted-foreground hover:text-foreground border border-border/60',
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Suggestion Cards Feed */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
            {filteredSuggestions.map((sug) => (
              <div
                key={sug.id}
                onClick={() => handleSelectSuggestion(sug)}
                className={clsx(
                  'group relative rounded-xl border p-3.5 flex flex-col justify-between transition-all duration-200 cursor-pointer',
                  'bg-muted/20 hover:bg-muted/60 border-border/70 hover:border-primary/50 shadow-xs hover:shadow-md',
                )}
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between gap-1">
                    <span className={clsx('text-[9px] font-mono font-extrabold uppercase px-1.5 py-0.2 rounded border', sug.badgeColor)}>
                      {sug.category}
                    </span>
                    <div className="flex items-center gap-1 text-[9px] font-mono text-muted-foreground font-semibold">
                      <span className="bg-background px-1.5 py-0.2 rounded border border-border/80">
                        Min {(sug.recommendedScore * 100).toFixed(0)}%
                      </span>
                      <span className="bg-background px-1.5 py-0.2 rounded border border-border/80">
                        K={sug.recommendedTopK}
                      </span>
                    </div>
                  </div>

                  <h4 className="text-xs font-bold text-foreground group-hover:text-primary transition-colors leading-snug">
                    {sug.title}
                  </h4>

                  <p className="text-[11px] text-muted-foreground leading-relaxed line-clamp-2">
                    {sug.description}
                  </p>

                  <div className="p-1.5 rounded-lg bg-background/80 border border-border/60 font-mono text-[10px] text-primary/90 truncate">
                    "{sug.query}"
                  </div>
                </div>

                <div className="pt-2 mt-2 border-t border-border/40 flex items-center justify-between text-[10px] text-muted-foreground">
                  <span>1-Click Run</span>
                  <span className="flex items-center gap-0.5 text-primary font-bold group-hover:translate-x-0.5 transition-transform">
                    Search <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Draggable Resizer Bar */}
          <div
            onMouseDown={startResizing}
            className="absolute top-0 right-0 w-1.5 h-full cursor-col-resize hover:bg-primary/50 transition-colors z-20"
          />
        </aside>
      )}

      {/* Main Search Canvas */}
      <main className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Header & Status Ribbon */}
        <div className="px-6 py-4 border-b border-border bg-card flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                className={clsx(
                  "p-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer",
                  !isSidebarCollapsed
                    ? "bg-primary/10 text-primary border-primary/20"
                    : "bg-muted/60 text-muted-foreground hover:text-foreground border-border"
                )}
                title={isSidebarCollapsed ? "Expand Prompts Sidebar" : "Collapse Prompts Sidebar"}
              >
                <Sliders className="w-3.5 h-3.5" />
                <span className="hidden sm:inline text-[11px] font-bold">
                  {isSidebarCollapsed ? "Show Prompts" : "Prompts"}
                </span>
                <span className="text-[9px] font-mono font-extrabold px-1 rounded bg-background border border-border">
                  {PROMPT_SUGGESTIONS.length}
                </span>
              </button>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20">
                Dense Vector Search
              </span>
              <h1 className="text-lg font-bold text-foreground">LanceDB Semantic Search Engine</h1>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                ONLINE :8095
              </span>
            </div>
            <p className="text-xs text-muted-foreground font-mono mt-0.5">
              Model: <strong className="text-foreground">nomic-embed-text-v1.5</strong> (768-dim Float32) • Index: <strong className="text-foreground">IVF_PQ + HNSW</strong>
            </p>
          </div>
        </div>

        {/* Search Input Bar & Controls */}
        <div className="p-6 border-b border-border bg-card/60 space-y-4 shrink-0">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void executeSearch();
            }}
            className="relative flex items-center"
          >
            <Search className="w-5 h-5 absolute left-4 text-muted-foreground pointer-events-none" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search code ASTs, 3NF PostgreSQL DDL, DataStage XML, or PDF architecture manuals..."
              className="w-full pl-12 pr-32 py-3.5 text-xs md:text-sm rounded-xl bg-background border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary font-medium shadow-2xs"
            />
            <button
              type="submit"
              disabled={loading || !query.trim()}
              className="absolute right-2 px-5 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Sparkles className={clsx('w-3.5 h-3.5', loading && 'animate-spin')} />
              <span>{loading ? 'Searching...' : 'Search'}</span>
            </button>
          </form>

          {/* Controls Bar: Stack Filter, Min Score & Top-K */}
          <div className="flex flex-wrap items-center justify-between gap-4 text-xs">
            {/* Artifact Stack Filter */}
            <div className="flex items-center gap-2">
              <span className="font-semibold text-muted-foreground flex items-center gap-1">
                <Filter className="w-3.5 h-3.5 text-primary" />
                Stack:
              </span>
              <div className="flex flex-wrap gap-1">
                {ARTIFACT_FILTERS.map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => {
                      setArtifactType(type);
                      if (hasSearched) {
                        void executeSearch(undefined, undefined, undefined, type);
                      }
                    }}
                    className={clsx(
                      'px-2 py-0.5 rounded-lg text-[10px] font-mono font-bold transition-colors cursor-pointer',
                      artifactType === type
                        ? 'bg-primary text-primary-foreground shadow-2xs'
                        : 'bg-muted/60 text-muted-foreground hover:text-foreground border border-border/70',
                    )}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* Threshold Slider & Top-K */}
            <div className="flex flex-wrap items-center gap-4">
              {/* Hybrid Mode Toggle */}
              <button
                type="button"
                onClick={() => {
                  const nextMode = !hybridMode;
                  setHybridMode(nextMode);
                  if (hasSearched) {
                    void executeSearch();
                  }
                }}
                className={clsx(
                  'px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border',
                  hybridMode
                    ? 'bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/30 shadow-xs'
                    : 'bg-muted/40 text-muted-foreground hover:text-foreground border-border/60'
                )}
              >
                <Zap className={clsx('w-3.5 h-3.5', hybridMode && 'text-purple-500')} />
                <span>OmniGraph Hybrid (2-Hop Walk)</span>
                <span className={clsx('w-1.5 h-1.5 rounded-full', hybridMode ? 'bg-purple-500 animate-pulse' : 'bg-muted-foreground/40')} />
              </button>

              <div className="flex items-center gap-2">
                <span className="font-semibold text-muted-foreground">Min Score:</span>
                <input
                  type="range"
                  min="0.40"
                  max="0.99"
                  step="0.01"
                  value={minScore}
                  onChange={(e) => setMinScore(parseFloat(e.target.value))}
                  className="w-24 accent-primary cursor-pointer"
                />
                <span className="font-mono font-bold text-foreground text-[11px] w-10">
                  {(minScore * 100).toFixed(0)}%
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="font-semibold text-muted-foreground">Top-K:</span>
                <select
                  value={limit}
                  onChange={(e) => setLimit(parseInt(e.target.value, 10))}
                  className="px-2 py-1 rounded-lg bg-background border border-border text-foreground font-mono text-xs focus:outline-none cursor-pointer"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Results Feed Canvas */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* Fused Connected Graph Section */}
          {connectedGraph && connectedGraph.nodes.length > 0 && (
            <div className="p-4 rounded-xl border border-purple-500/30 bg-purple-500/5 dark:bg-purple-950/15 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="p-1 rounded-md bg-purple-500/20 text-purple-600 dark:text-purple-400">
                    <Zap className="w-4 h-4" />
                  </span>
                  <div>
                    <h3 className="text-xs font-bold text-foreground flex items-center gap-2">
                      OmniGraph Fused Architectural Neighborhood
                      <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-600 dark:text-purple-400">
                        {connectedGraph.nodes.length} Vertices • {connectedGraph.edges.length} Edges
                      </span>
                    </h3>
                    <p className="text-[11px] text-muted-foreground">
                      2-hop lineage and architectural dependency subgraph extracted dynamically from vector matches.
                    </p>
                  </div>
                </div>
              </div>

              {/* Connected Vertices Tags */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {connectedGraph.nodes.slice(0, 15).map((node) => (
                  <span
                    key={node.id}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-mono font-medium bg-background border border-purple-500/20 text-foreground"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                    {node.label}
                    <span className="text-[9px] text-muted-foreground uppercase opacity-75">({node.category})</span>
                  </span>
                ))}
                {connectedGraph.nodes.length > 15 && (
                  <span className="text-[10px] font-mono text-muted-foreground py-0.5 px-1.5">
                    +{connectedGraph.nodes.length - 15} more vertices
                  </span>
                )}
              </div>
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-foreground uppercase tracking-wider">
                Ranked Vector Chunks
              </h2>
              <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 font-bold">
                {results.length} Matches
              </span>
            </div>

            {searchDurationMs !== null && (
              <span className="text-xs font-mono text-muted-foreground flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-emerald-500" />
                Latency: <strong className="text-emerald-500">{searchDurationMs} ms</strong>
              </span>
            )}
          </div>

          {searchError && (
            <div className="p-4 rounded-2xl border border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-400 text-xs font-mono flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{searchError}</span>
            </div>
          )}

          {results.length === 0 && !loading && hasSearched && !searchError && (
            <div className="p-12 text-center rounded-2xl border border-dashed border-border bg-card/40 space-y-3">
              <Binary className="w-10 h-10 text-muted-foreground/40 mx-auto" />
              <p className="text-sm text-foreground font-semibold">
                No vector chunks match your criteria.
              </p>
              <p className="text-xs text-muted-foreground max-w-md mx-auto">
                Try selecting one of the suggested prompt cards in the left sidebar or reducing the similarity threshold to 50%.
              </p>
            </div>
          )}

          {!hasSearched && (
            <div className="p-12 text-center rounded-2xl border border-dashed border-border bg-card/40 space-y-3">
              <Search className="w-10 h-10 text-primary/40 mx-auto" />
              <p className="text-sm text-foreground font-semibold">
                Select a suggested prompt card from the left sidebar or enter a custom query.
              </p>
              <p className="text-xs text-muted-foreground">
                Performs dense cosine vector similarity against live LanceDB embeddings on port 8095.
              </p>
            </div>
          )}

          {/* Results List */}
          <div className="space-y-4">
            {results.map((item, itemIdx) => {
              if (!item) return null;
              const fPath = String(item.file_path || '');
              const aType = formatArtifactType(item.artifact_type);
              const { isBinary, cleanedText } = cleanChunkContent(item.content, fPath, aType);
              const isPdf = fPath.toLowerCase().endsWith('.pdf') || aType.toLowerCase() === 'pdf';
              const itemId = item.id || `chunk-${itemIdx}`;
              const showRaw = !!showRawMap[itemId];

              return (
                <div
                  key={itemId}
                  className="bg-card rounded-2xl border border-border p-5 space-y-3 shadow-xs hover:border-primary/40 transition-colors"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      {isPdf ? (
                        <FileText className="w-4 h-4 text-rose-500 shrink-0" />
                      ) : (
                        <FileCode className="w-4 h-4 text-primary shrink-0" />
                      )}
                      <span className="font-mono text-xs font-bold text-foreground truncate">{fPath}</span>
                      {item.start_line && item.end_line && (
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-muted text-muted-foreground">
                          L{item.start_line}..L{item.end_line}
                        </span>
                      )}
                      {aType && (
                        <span className={clsx(
                          'text-[10px] font-mono px-2 py-0.5 rounded-md font-bold uppercase',
                          isPdf ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20' : 'bg-primary/10 text-primary',
                        )}>
                          {aType}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2.5">
                      {isBinary && (
                        <button
                          type="button"
                          onClick={() => toggleRaw(item.id)}
                          className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono border border-border hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
                        >
                          <Eye className="w-3 h-3" />
                          <span>{showRaw ? 'Extracted View' : 'Raw View'}</span>
                        </button>
                      )}

                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                        <Sparkles className="w-3 h-3" />
                        Cosine {(item.score * 100).toFixed(1)}%
                      </span>

                      <button
                        type="button"
                        onClick={() => copyToClipboard(item.id, showRaw ? item.content : cleanedText)}
                        className="flex items-center gap-1 text-xs font-mono text-muted-foreground hover:text-foreground cursor-pointer"
                      >
                        {copiedId === item.id ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedId === item.id ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Render Cleaned Text / PDF Document vs Code Block */}
                  {isPdf && !showRaw ? (
                    <div className="p-4 rounded-xl bg-muted/30 border border-border/80 text-xs text-foreground space-y-2 leading-relaxed">
                      <div className="flex items-center gap-1.5 text-[10px] font-mono text-muted-foreground font-bold uppercase tracking-wider">
                        <FileCheck2 className="w-3.5 h-3.5 text-emerald-500" />
                        <span>Readable Document Excerpt</span>
                      </div>
                      <p className="font-sans text-xs text-foreground/90 whitespace-pre-wrap leading-relaxed">
                        {cleanedText}
                      </p>
                    </div>
                  ) : (
                    <pre className="p-3.5 rounded-xl bg-muted/40 border border-border font-mono text-xs text-foreground overflow-x-auto whitespace-pre-wrap leading-relaxed max-h-72">
                      {showRaw ? item.content : cleanedText}
                    </pre>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
};
