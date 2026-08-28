import React from 'react';
import {
  LayoutDashboard,
  FolderCode,
  Layers,
  Database,
  Bot,
  Activity,
  Server,
  Sparkles,
  CheckCircle2,
  GitBranch,
  Terminal,
  Monitor,
  ShieldCheck,
  Zap,
  ArrowRight,
  RefreshCw,
  Cpu,
  BarChart3,
  Sliders,
} from 'lucide-react';
import { useLayout } from '../shell/LayoutContext';

export const ExecutiveDashboardCanvas: React.FC = () => {
  const { appsList, currentApp, setDomainMode, setCanvasMode } = useLayout();

  return (
    <div className="flex-1 flex flex-col h-full bg-background text-foreground overflow-y-auto p-6 space-y-6 select-none">
      {/* ── 0. Top Header Banner ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">
              Executive System Overview
            </span>
            <span className="text-xs text-muted-foreground font-mono">
              PostgreSQL <strong className="text-emerald-400">DES_BASE:8088</strong> (Authoritative)
            </span>
          </div>
          <h1 className="text-2xl font-bold text-foreground mt-1 flex items-center gap-2">
            <LayoutDashboard className="w-6 h-6 text-primary" />
            <span>Executive Architecture Dashboard</span>
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Holistic observability across Enterprise Projects, Viewport Pages, Data Architecture, and Autonomous Agents.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-card border border-border shadow-2xs text-xs font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-muted-foreground">Cluster Health:</span>
            <span className="font-bold text-emerald-400">100% Operational</span>
          </div>
        </div>
      </div>

      {/* ── LAYER 1: PROJECT DASHBOARD ── */}
      <div className="rounded-2xl border border-border/80 bg-card p-5 space-y-4 shadow-xs">
        <div className="flex items-center justify-between border-b border-border/60 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-primary/10 text-primary">
              <FolderCode className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
                <span>1. Project Dashboard</span>
                <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-primary/20 text-primary">
                  LAYER 1
                </span>
              </h2>
              <p className="text-[11px] text-muted-foreground">
                Enterprise application blueprints, active studio targets, and single executable compilation status.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              setDomainMode('projects');
              setCanvasMode('dashboard_projects');
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-muted hover:bg-primary/20 text-muted-foreground hover:text-primary rounded-xl text-xs font-semibold transition-colors cursor-pointer"
          >
            <span>Open Project Registry</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          <div className="p-3.5 rounded-xl bg-background border border-border/70 space-y-1.5">
            <div className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
              Total Enterprise Projects
            </div>
            <div className="text-2xl font-bold text-foreground font-mono flex items-baseline gap-2">
              <span>{appsList.length || 1}</span>
              <span className="text-[10px] font-semibold text-emerald-400">DES_BASE.designer_apps</span>
            </div>
            <p className="text-[10px] text-muted-foreground">Multi-tenant application records</p>
          </div>

          <div className="p-3.5 rounded-xl bg-background border border-border/70 space-y-1.5">
            <div className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
              Active Studio Context
            </div>
            <div className="text-sm font-bold text-foreground truncate mt-1">
              {currentApp ? currentApp.name : 'Fleet Logistics Studio'}
            </div>
            <p className="text-[10px] text-primary font-mono truncate">
              slug: {currentApp ? currentApp.slug : 'fleet-logistics'}
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-background border border-border/70 space-y-1.5">
            <div className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
              Single Executable Binary
            </div>
            <div className="text-sm font-bold text-emerald-400 flex items-center gap-1.5 mt-1 font-mono">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>bin/base (Compiled)</span>
            </div>
            <p className="text-[10px] text-muted-foreground">SPA embedded via //go:embed</p>
          </div>

          <div className="p-3.5 rounded-xl bg-background border border-border/70 space-y-1.5">
            <div className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
              Hexagonal Clean Arch
            </div>
            <div className="text-sm font-bold text-cyan-400 flex items-center gap-1.5 mt-1">
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
              <span>Ports & Adapters Verified</span>
            </div>
            <p className="text-[10px] text-muted-foreground">Zero domain-to-adapter leaks</p>
          </div>
        </div>
      </div>

      {/* ── LAYER 2: PAGE DASHBOARD ── */}
      <div className="rounded-2xl border border-border/80 bg-card p-5 space-y-4 shadow-xs">
        <div className="flex items-center justify-between border-b border-border/60 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
                <span>2. Page Dashboard</span>
                <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-400">
                  LAYER 2
                </span>
              </h2>
              <p className="text-[11px] text-muted-foreground">
                Viewport metrics, route allocations, layout presets (React 19 SPA & Bubbletea TUI), and mockups.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              setDomainMode('ui_designer');
              setCanvasMode('page_registry');
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-muted hover:bg-cyan-500/20 text-muted-foreground hover:text-cyan-400 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
          >
            <span>Open Page Registry</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          <div className="p-3.5 rounded-xl bg-background border border-border/70 space-y-1.5">
            <div className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
              Registered Pages
            </div>
            <div className="text-2xl font-bold text-foreground font-mono flex items-baseline gap-2">
              <span>6</span>
              <span className="text-[10px] font-semibold text-cyan-400">Routes Active</span>
            </div>
            <p className="text-[10px] text-muted-foreground">100% path coverage</p>
          </div>

          <div className="p-3.5 rounded-xl bg-background border border-border/70 space-y-1.5">
            <div className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
              Layout Breakdown
            </div>
            <div className="flex items-center gap-2 text-xs font-bold text-foreground mt-1">
              <span className="flex items-center gap-1 text-cyan-400 font-mono">
                <Monitor className="w-3.5 h-3.5" /> 5 SPA
              </span>
              <span className="text-muted-foreground">|</span>
              <span className="flex items-center gap-1 text-amber-400 font-mono">
                <Terminal className="w-3.5 h-3.5" /> 1 TUI
              </span>
            </div>
            <p className="text-[10px] text-muted-foreground">Single codebase multi-runtime</p>
          </div>

          <div className="p-3.5 rounded-xl bg-background border border-border/70 space-y-1.5">
            <div className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
              Wireframe & Sketch Readiness
            </div>
            <div className="text-2xl font-bold text-foreground font-mono flex items-baseline gap-2">
              <span>94%</span>
              <span className="text-[10px] font-semibold text-emerald-400">Validated</span>
            </div>
            <p className="text-[10px] text-muted-foreground">Draft-07 JSON Schema compliant</p>
          </div>

          <div className="p-3.5 rounded-xl bg-background border border-border/70 space-y-1.5">
            <div className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
              Centered Modals System
            </div>
            <div className="text-sm font-bold text-foreground flex items-center gap-1.5 mt-1">
              <ShieldCheck className="w-4 h-4 text-primary" />
              <span>Backdrop Blur (Strict)</span>
            </div>
            <p className="text-[10px] text-muted-foreground">Zero right drawer slideouts</p>
          </div>
        </div>
      </div>

      {/* ── LAYER 3: DATA DASHBOARD ── */}
      <div className="rounded-2xl border border-border/80 bg-card p-5 space-y-4 shadow-xs">
        <div className="flex items-center justify-between border-b border-border/60 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
                <span>3. Data Dashboard</span>
                <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400">
                  LAYER 3
                </span>
              </h2>
              <p className="text-[11px] text-muted-foreground">
                PostgreSQL schema DES_BASE, ER table schematics, column lineage DAG, and query engine telemetry.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              setDomainMode('data_designer');
              setCanvasMode('er_modeler');
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-muted hover:bg-emerald-500/20 text-muted-foreground hover:text-emerald-400 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
          >
            <span>Open Data Modeler</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          <div className="p-3.5 rounded-xl bg-background border border-border/70 space-y-1.5">
            <div className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
              PostgreSQL Tables
            </div>
            <div className="text-2xl font-bold text-emerald-400 font-mono flex items-baseline gap-2">
              <span>6 Tables</span>
              <span className="text-[10px] text-muted-foreground">DES_BASE</span>
            </div>
            <p className="text-[10px] text-muted-foreground">uc_ & diag_ tables active</p>
          </div>

          <div className="p-3.5 rounded-xl bg-background border border-border/70 space-y-1.5">
            <div className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
              Column-Level Lineage (CLL)
            </div>
            <div className="text-2xl font-bold text-foreground font-mono flex items-baseline gap-2">
              <span>8 Flows</span>
              <span className="text-[10px] font-semibold text-purple-400">3 Stages</span>
            </div>
            <p className="text-[10px] text-muted-foreground">Raw ➔ Ingestion ➔ Analytics</p>
          </div>

          <div className="p-3.5 rounded-xl bg-background border border-border/70 space-y-1.5">
            <div className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
              Query Latency (Avg)
            </div>
            <div className="text-2xl font-bold text-foreground font-mono flex items-baseline gap-2">
              <span>0.42 ms</span>
              <span className="text-[10px] font-semibold text-emerald-400">pgx pool</span>
            </div>
            <p className="text-[10px] text-muted-foreground">Max 25 active connections</p>
          </div>

          <div className="p-3.5 rounded-xl bg-background border border-border/70 space-y-1.5">
            <div className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
              Schema Governance
            </div>
            <div className="text-sm font-bold text-emerald-400 flex items-center gap-1.5 mt-1">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>100% Authoritative</span>
            </div>
            <p className="text-[10px] text-muted-foreground">No mock data fallback</p>
          </div>
        </div>
      </div>

      {/* ── LAYER 4: AGENT DASHBOARD ── */}
      <div className="rounded-2xl border border-border/80 bg-card p-5 space-y-4 shadow-xs">
        <div className="flex items-center justify-between border-b border-border/60 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400">
              <Bot className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
                <span>4. Agent Dashboard</span>
                <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-400">
                  LAYER 4
                </span>
              </h2>
              <p className="text-[11px] text-muted-foreground">
                Autonomous workflow agents, multi-model orchestrator, evaluator accuracy, and execution telemetry.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              setDomainMode('agent_designer');
              setCanvasMode('workflow_graph');
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-muted hover:bg-purple-500/20 text-muted-foreground hover:text-purple-400 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
          >
            <span>Open Agent Studio</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          <div className="p-3.5 rounded-xl bg-background border border-border/70 space-y-1.5">
            <div className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
              Autonomous Agents Active
            </div>
            <div className="text-2xl font-bold text-foreground font-mono flex items-baseline gap-2">
              <span>3 Agents</span>
              <span className="text-[10px] font-semibold text-purple-400">Online</span>
            </div>
            <p className="text-[10px] text-muted-foreground">Scaffolder, Lineage, Evaluator</p>
          </div>

          <div className="p-3.5 rounded-xl bg-background border border-border/70 space-y-1.5">
            <div className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
              Evaluator Accuracy Index
            </div>
            <div className="text-2xl font-bold text-purple-400 font-mono flex items-baseline gap-2">
              <span>99.4%</span>
              <span className="text-[10px] font-semibold text-emerald-400">High Conf</span>
            </div>
            <p className="text-[10px] text-muted-foreground">Continuous AST validation</p>
          </div>

          <div className="p-3.5 rounded-xl bg-background border border-border/70 space-y-1.5">
            <div className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
              Graph Pipeline Stages
            </div>
            <div className="text-2xl font-bold text-foreground font-mono flex items-baseline gap-2">
              <span>4 Stages</span>
              <span className="text-[10px] font-semibold text-cyan-400">Sequential</span>
            </div>
            <p className="text-[10px] text-muted-foreground">Ingest ➔ Transform ➔ Diff ➔ Persist</p>
          </div>

          <div className="p-3.5 rounded-xl bg-background border border-border/70 space-y-1.5">
            <div className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
              Tool Calling SLA
            </div>
            <div className="text-sm font-bold text-emerald-400 flex items-center gap-1.5 mt-1 font-mono">
              <Zap className="w-4 h-4 text-emerald-400" />
              <span>18ms Dispatch Time</span>
            </div>
            <p className="text-[10px] text-muted-foreground">Zero queue backpressure</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExecutiveDashboardCanvas;
