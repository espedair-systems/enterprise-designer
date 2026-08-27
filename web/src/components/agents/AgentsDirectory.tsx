import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { ArtistHealthStatus } from '../../types';
import {
  Bot,
  Binary,
  ArrowUpRight,
  ChevronRight,
  RefreshCw,
  Activity,
  ExternalLink,
  Terminal,
  Server,
  Layers,
  Database
} from 'lucide-react';

interface AgentCard {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  badge: string;
  tags: string[];
  defaultPort: number;
  hasUI: boolean;
  transport: string;
  storageEngine: string;
}

const AGENT_CARDS: AgentCard[] = [
  {
    id: 'enterprise-agent',
    title: 'Enterprise Agent',
    subtitle: 'Autonomous Multi-Agent Architecture Engine',
    description: 'Multi-agent cognitive orchestration, LanceDB vector storage, OmniGraph Rust backend (gRPC :50051), and automated architecture artifact generation.',
    icon: Bot,
    color: 'from-purple-500/20 via-purple-500/5 to-transparent text-purple-500 border-purple-500/30',
    badge: 'Port 8090',
    tags: ['Multi-Agent Systems', 'LanceDB Vectors', 'OmniGraph Engine', 'Gemini 2.0 Flash', 'Artifact Synthesis'],
    defaultPort: 8090,
    hasUI: true,
    transport: 'HTTP / Web SPA',
    storageEngine: 'LanceDB + PostgreSQL',
  },
  {
    id: 'artifact-indexer',
    title: 'Artifact Indexer',
    subtitle: 'Rust High-Performance Hexagonal Vector & AST Indexer',
    description: 'Hexagonal AST code and data parser, LanceDB embeddings, OpenLineage metadata graph export, and real-time Model Context Protocol (MCP) transport.',
    icon: Binary,
    color: 'from-cyan-500/20 via-cyan-500/5 to-transparent text-cyan-500 border-cyan-500/30',
    badge: 'Port 8095 (Headless MCP)',
    tags: ['Rust Hexagonal Core', 'LanceDB Vectors', 'AST Parser', 'OpenLineage Graph', 'MCP Headless Server'],
    defaultPort: 8095,
    hasUI: false,
    transport: 'MCP stdio / SSE',
    storageEngine: 'LanceDB + Ort Embedder',
  },
];

export const AgentsDirectory: React.FC = () => {
  const [healthMap, setHealthMap] = useState<Record<string, ArtistHealthStatus>>({});
  const [checkingMap, setCheckingMap] = useState<Record<string, boolean>>({});
  const [isCheckingAll, setIsCheckingAll] = useState(false);

  const runAllHealthChecks = async () => {
    setIsCheckingAll(true);
    try {
      const res = await api.checkAgentsHealth();
      const nextMap: Record<string, ArtistHealthStatus> = {};
      if (res?.agents) {
        res.agents.forEach((a) => {
          nextMap[a.id] = a;
        });
      }
      setHealthMap(nextMap);
    } catch (e) {
      console.error('Failed to run batch agents health checks:', e);
    } finally {
      setIsCheckingAll(false);
    }
  };

  useEffect(() => {
    void runAllHealthChecks();
  }, []);

  const handleSingleHealthCheck = async (e: React.MouseEvent, agentId: string) => {
    e.stopPropagation();
    setCheckingMap((prev) => ({ ...prev, [agentId]: true }));
    try {
      const res = await api.checkSingleAgentHealth(agentId);
      setHealthMap((prev) => ({ ...prev, [agentId]: res }));
    } catch (err) {
      console.error(`Failed to healthcheck agent ${agentId}:`, err);
      setHealthMap((prev) => ({
        ...prev,
        [agentId]: {
          id: agentId,
          name: agentId,
          url: '',
          status: 'offline',
          status_code: 0,
          latency_ms: 0,
          message: 'Healthcheck error',
          last_checked: new Date().toISOString(),
        },
      }));
    } finally {
      setCheckingMap((prev) => ({ ...prev, [agentId]: false }));
    }
  };

  const handleCardAction = (card: AgentCard) => {
    if (card.hasUI) {
      const targetUrl = healthMap[card.id]?.url || `http://localhost:${card.defaultPort}`;
      window.open(targetUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const healthyCount = Object.values(healthMap).filter((h) => h.status === 'healthy').length;

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto animate-in fade-in duration-300">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <div className="flex items-center gap-2.5 mb-1.5">
            <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold uppercase tracking-wider bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
              Agents & Indexers
            </span>
            <span className="text-xs text-muted-foreground font-mono">Autonomous AI & Vector Tools</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-foreground">
            Enterprise Agents & Vector Indexers
          </h1>
          <p className="text-xs md:text-sm text-muted-foreground mt-1">
            Real-time agentic toolchains, vector embeddings, AST indexing, and cognitive architecture generation.
          </p>
        </div>

        {/* Global Health Probe Control */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-card border border-border text-xs font-mono">
            <Activity className="w-3.5 h-3.5 text-primary" />
            <span className="text-muted-foreground">Agents Online:</span>
            <span className={`font-bold ${healthyCount > 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
              {healthyCount} / {AGENT_CARDS.length}
            </span>
          </div>

          <button
            onClick={() => void runAllHealthChecks()}
            disabled={isCheckingAll}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 shadow-xs transition-all cursor-pointer disabled:opacity-50"
            title="Perform live HTTP/TCP healthcheck across all agent systems"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isCheckingAll ? 'animate-spin' : ''}`} />
            <span>{isCheckingAll ? 'Probing Agents...' : 'Check All Health'}</span>
          </button>
        </div>
      </div>

      {/* ── Cards for Enterprise Agent and Artifact Indexer ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {AGENT_CARDS.map((card) => {
          const Icon = card.icon;
          const health = healthMap[card.id];
          const isChecking = checkingMap[card.id] || isCheckingAll;
          const isHealthy = health?.status === 'healthy';

          return (
            <div
              key={card.id}
              onClick={() => handleCardAction(card)}
              className={`group relative rounded-2xl bg-card border border-border p-7 flex flex-col justify-between transition-all duration-200 overflow-hidden ${
                card.hasUI ? 'hover:border-primary/50 hover:shadow-md cursor-pointer' : 'hover:border-border cursor-default'
              }`}
            >
              {/* Accent Background Gradient */}
              <div className={`absolute inset-0 bg-gradient-to-br ${card.color} opacity-30 group-hover:opacity-50 transition-opacity pointer-events-none`} />

              <div className="relative space-y-4">
                {/* Card Header: Icon & Health Button */}
                <div className="flex items-start justify-between gap-2">
                  <div className="w-12 h-12 rounded-xl bg-card border border-border flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
                    <Icon className="w-6 h-6" />
                  </div>

                  {/* 🟢/🔴 Live Healthcheck Button */}
                  <button
                    onClick={(e) => void handleSingleHealthCheck(e, card.id)}
                    disabled={isChecking}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold border transition-all cursor-pointer shadow-2xs ${
                      isChecking
                        ? 'bg-amber-500/10 text-amber-500 border-amber-500/30 animate-pulse'
                        : isHealthy
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20 hover:scale-105'
                        : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30 hover:bg-rose-500/20 hover:scale-105'
                    }`}
                    title={`Click to probe live status for ${card.title}`}
                  >
                    {isChecking ? (
                      <>
                        <RefreshCw className="w-3 h-3 animate-spin text-amber-500" />
                        <span>PROBING</span>
                      </>
                    ) : isHealthy ? (
                      <>
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span>ONLINE {health?.latency_ms ? `• ${health.latency_ms.toFixed(1)}ms` : ''}</span>
                      </>
                    ) : (
                      <>
                        <span className="w-2 h-2 rounded-full bg-rose-500" />
                        <span>OFFLINE • RETRY</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Titles & Badge */}
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="text-[9px] font-semibold font-mono px-1.5 py-0.5 rounded bg-muted text-muted-foreground border border-border/60">
                      {card.transport}
                    </span>
                    <span className="text-[10px] font-semibold font-mono text-muted-foreground">
                      {card.badge}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors flex items-center gap-1.5">
                    <span>{card.title}</span>
                    {card.hasUI && (
                      <ArrowUpRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                    )}
                  </h3>
                  <div className="text-xs font-medium text-muted-foreground mt-0.5">{card.subtitle}</div>
                </div>

                <p className="text-xs text-muted-foreground leading-relaxed">
                  {card.description}
                </p>

                {/* Technical Specifications Grid */}
                <div className="grid grid-cols-2 gap-2 pt-1 text-[11px] font-mono">
                  <div className="p-2 rounded-lg bg-muted/40 border border-border/60">
                    <div className="text-[9px] uppercase tracking-wider text-muted-foreground font-semibold">Storage Engine</div>
                    <div className="text-foreground font-bold truncate mt-0.5">{card.storageEngine}</div>
                  </div>
                  <div className="p-2 rounded-lg bg-muted/40 border border-border/60">
                    <div className="text-[9px] uppercase tracking-wider text-muted-foreground font-semibold">Daemon Transport</div>
                    <div className="text-foreground font-bold truncate mt-0.5">{card.transport}</div>
                  </div>
                </div>

                {/* Taxonomy Tags */}
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
              <div className="relative pt-4 mt-4 border-t border-border/50 flex items-center justify-between text-xs font-semibold">
                {card.hasUI ? (
                  <>
                    <div className="flex items-center gap-1.5 text-primary">
                      <span>Launch Studio</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </div>
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform text-primary" />
                  </>
                ) : (
                  <div className="flex items-center justify-between w-full text-muted-foreground">
                    <div className="flex items-center gap-1.5 text-xs font-mono">
                      <Terminal className="w-3.5 h-3.5 text-cyan-500" />
                      <span>Headless MCP Daemon</span>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-muted border border-border">
                      stdio / SSE
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
