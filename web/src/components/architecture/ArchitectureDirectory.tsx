import React, { useEffect, useState } from 'react';
import { useStore, NavView, AppMode } from '../../store/useStore';
import { api } from '../../services/api';
import { ArtistHealthStatus } from '../../types';
import {
  Compass,
  Target,
  Database,
  Sparkles,
  ShieldCheck,
  Cpu,
  Layers,
  ArrowUpRight,
  ChevronRight,
  RefreshCw,
  Activity,
  CheckCircle2,
  XCircle,
  Clock,
  ExternalLink
} from 'lucide-react';

interface ArtistCard {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  badge: string;
  tags: string[];
  defaultPort: number;
  routeMode: AppMode;
  routeView: NavView;
}

const ARTIST_CARDS: ArtistCard[] = [
  {
    id: 'enterprise-artist',
    title: 'Enterprise Artist',
    subtitle: 'Holistic Architecture & Strategy Metamodel',
    description: 'Unified enterprise architecture governance, TOGAF & ArchiMate metamodels, and strategic portfolio alignment in schema BT_BASE.',
    icon: Compass,
    color: 'from-indigo-500/20 via-indigo-500/5 to-transparent text-indigo-500 border-indigo-500/30',
    badge: 'Authoritative Metamodel',
    tags: ['TOGAF 10', 'ArchiMate', 'Strategic OKRs', 'Architecture Governance'],
    defaultPort: 8080,
    routeMode: 'architect',
    routeView: 'arch-dashboard',
  },
  {
    id: 'business-artist',
    title: 'Business Artist',
    subtitle: 'Capabilities, Value Streams & SIPOC',
    description: 'L1-L4 business capability decomposition, customer value stream flow efficiency %, and 5-box SIPOC process governance.',
    icon: Target,
    color: 'from-cyan-500/20 via-cyan-500/5 to-transparent text-cyan-500 border-cyan-500/30',
    badge: 'L1-L4 Taxonomy',
    tags: ['Capabilities', 'Value Streams', 'SIPOC Processes', 'RACI Matrix'],
    defaultPort: 8088,
    routeMode: 'architect',
    routeView: 'arch-capabilities',
  },
  {
    id: 'data-artist',
    title: 'Data Artist',
    subtitle: 'Information Concepts & Canonical Schemas',
    description: 'Enterprise business information concepts, glossary taxonomies, semantic entity models, and 30 canonical PostgreSQL tables.',
    icon: Database,
    color: 'from-emerald-500/20 via-emerald-500/5 to-transparent text-emerald-500 border-emerald-500/30',
    badge: 'Schema BT_BASE',
    tags: ['Information Concepts', 'Business Glossary', 'PostgreSQL 3NF', 'Data Lineage'],
    defaultPort: 8084,
    routeMode: 'ba',
    routeView: 'ba-glossary',
  },
  {
    id: 'ai-artist',
    title: 'AI Artist',
    subtitle: 'Agentic Workflows & Cognitive Toolchains',
    description: 'Autonomous multi-agent orchestration, prompt graphs, generative architecture assistants, and MCP indexer integrations.',
    icon: Sparkles,
    color: 'from-purple-500/20 via-purple-500/5 to-transparent text-purple-500 border-purple-500/30',
    badge: 'Agentic MCP',
    tags: ['Multi-Agent Systems', 'Prompt Graphs', 'MCP Indexer', 'LLM Toolchains'],
    defaultPort: 8083,
    routeMode: 'platforms',
    routeView: 'platforms-overview',
  },
  {
    id: 'security-artist',
    title: 'Security Artist',
    subtitle: 'Zero-Trust Posture & IAM Governance',
    description: 'STRIDE threat vector modeling, role-based authorization (RBAC), SSO identity integrations, and immutable audit logs.',
    icon: ShieldCheck,
    color: 'from-amber-500/20 via-amber-500/5 to-transparent text-amber-500 border-amber-500/30',
    badge: 'Zero-Trust Posture',
    tags: ['Threat Modeling', 'RBAC Entitlements', 'SAML 2.0 / OIDC', 'Audit Governance'],
    defaultPort: 8085,
    routeMode: 'settings',
    routeView: 'admin-roles',
  },
  {
    id: 'technology-artist',
    title: 'Technology Artist',
    subtitle: 'Multi-Cloud Platforms & Infrastructure Topology',
    description: 'AWS / Azure / GCP cloud infrastructure topology, Kubernetes cluster orchestration, service runtimes, and live telemetry.',
    icon: Cpu,
    color: 'from-blue-500/20 via-blue-500/5 to-transparent text-blue-500 border-blue-500/30',
    badge: 'Multi-Cloud Stack',
    tags: ['AWS / Azure / GCP', 'Kubernetes Runtimes', 'Service Mesh', 'Telemetry Streaming'],
    defaultPort: 8086,
    routeMode: 'platforms',
    routeView: 'plat-cloud',
  },
  {
    id: 'application-artist',
    title: 'Application Artist',
    subtitle: 'Microservices, APIs & C4 Architecture',
    description: 'Enterprise microservices portfolio, REST & GraphQL integration contracts, C4 container models, and service SLA management.',
    icon: Layers,
    color: 'from-fuchsia-500/20 via-fuchsia-500/5 to-transparent text-fuchsia-500 border-fuchsia-500/30',
    badge: 'C4 & Microservices',
    tags: ['Microservices Catalog', 'API Contracts', 'C4 Diagrams', 'Service SLAs'],
    defaultPort: 8087,
    routeMode: 'architect',
    routeView: 'arch-services',
  },
];

export const ArchitectureDirectory: React.FC = () => {
  const { setActiveView, setAppMode } = useStore();
  const [healthMap, setHealthMap] = useState<Record<string, ArtistHealthStatus>>({});
  const [checkingMap, setCheckingMap] = useState<Record<string, boolean>>({});
  const [isCheckingAll, setIsCheckingAll] = useState(false);
  const [lastCheckedTime, setLastCheckedTime] = useState<Date | null>(null);

  const runAllHealthChecks = async () => {
    setIsCheckingAll(true);
    try {
      const res = await api.checkArtistsHealth();
      const nextMap: Record<string, ArtistHealthStatus> = {};
      if (res?.artists) {
        res.artists.forEach((a) => {
          nextMap[a.id] = a;
        });
      }
      setHealthMap(nextMap);
      setLastCheckedTime(new Date());
    } catch (e) {
      console.error('Failed to run batch health checks:', e);
    } finally {
      setIsCheckingAll(false);
    }
  };

  useEffect(() => {
    void runAllHealthChecks();
  }, []);

  const handleSingleHealthCheck = async (e: React.MouseEvent, artistId: string) => {
    e.stopPropagation(); // prevent opening the card
    setCheckingMap((prev) => ({ ...prev, [artistId]: true }));
    try {
      const res = await api.checkSingleArtistHealth(artistId);
      setHealthMap((prev) => ({ ...prev, [artistId]: res }));
    } catch (err) {
      console.error(`Failed to healthcheck artist ${artistId}:`, err);
      setHealthMap((prev) => ({
        ...prev,
        [artistId]: {
          id: artistId,
          name: artistId,
          url: '',
          status: 'offline',
          status_code: 0,
          latency_ms: 0,
          message: 'Healthcheck error',
          last_checked: new Date().toISOString(),
        },
      }));
    } finally {
      setCheckingMap((prev) => ({ ...prev, [artistId]: false }));
    }
  };

  const handleLaunchArtist = (card: ArtistCard) => {
    const targetUrl = healthMap[card.id]?.url || `http://localhost:${card.defaultPort}`;
    window.open(targetUrl, '_blank', 'noopener,noreferrer');
  };

  const healthyCount = Object.values(healthMap).filter((h) => h.status === 'healthy').length;

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto animate-in fade-in duration-300">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <div className="flex items-center gap-2.5 mb-1.5">
            <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">
              Architecture Directory
            </span>
            <span className="text-xs text-muted-foreground font-mono">7 Canonical Artists</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-foreground">
            Architecture Operating System Studios
          </h1>
          <p className="text-xs md:text-sm text-muted-foreground mt-1">
            Real-time health status, live system probes, and interactive discipline studios.
          </p>
        </div>

        {/* Global Health Probe Control */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-card border border-border text-xs font-mono">
            <Activity className="w-3.5 h-3.5 text-primary" />
            <span className="text-muted-foreground">Systems Online:</span>
            <span className={`font-bold ${healthyCount > 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
              {healthyCount} / {ARTIST_CARDS.length}
            </span>
          </div>

          <button
            onClick={() => void runAllHealthChecks()}
            disabled={isCheckingAll}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 shadow-xs transition-all cursor-pointer disabled:opacity-50"
            title="Perform live HTTP healthcheck across all 7 architecture systems"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isCheckingAll ? 'animate-spin' : ''}`} />
            <span>{isCheckingAll ? 'Probing Systems...' : 'Check All Health'}</span>
          </button>
        </div>
      </div>

      {/* ── Cards for each of the Artists and ONLY the cards ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {ARTIST_CARDS.map((card) => {
          const Icon = card.icon;
          const health = healthMap[card.id];
          const isChecking = checkingMap[card.id] || isCheckingAll;
          const isHealthy = health?.status === 'healthy';

          return (
            <div
              key={card.id}
              onClick={() => handleLaunchArtist(card)}
              className="group relative rounded-2xl bg-card border border-border hover:border-primary/50 p-6 flex flex-col justify-between transition-all duration-200 hover:shadow-md cursor-pointer overflow-hidden"
            >
              {/* Accent Background Gradient */}
              <div className={`absolute inset-0 bg-gradient-to-br ${card.color} opacity-30 group-hover:opacity-60 transition-opacity pointer-events-none`} />

              <div className="relative space-y-4">
                {/* Card Header: Icon & Health Button */}
                <div className="flex items-start justify-between gap-2">
                  <div className="w-11 h-11 rounded-xl bg-card border border-border flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
                    <Icon className="w-5 h-5" />
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
                    title={`Click to test health for ${card.title} (${health?.url || `port ${card.defaultPort}`})`}
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
                      :{card.defaultPort}
                    </span>
                    <span className="text-[10px] font-semibold font-mono text-muted-foreground">
                      {card.badge}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-foreground group-hover:text-primary transition-colors flex items-center gap-1.5">
                    <span>{card.title}</span>
                    <ArrowUpRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </h3>
                  <div className="text-xs font-medium text-muted-foreground mt-0.5">{card.subtitle}</div>
                </div>

                <p className="text-xs text-muted-foreground leading-relaxed">
                  {card.description}
                </p>

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
              <div className="relative pt-4 mt-4 border-t border-border/50 flex items-center justify-between text-xs font-semibold text-primary">
                <div className="flex items-center gap-1.5">
                  <span>Launch Studio</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </div>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
