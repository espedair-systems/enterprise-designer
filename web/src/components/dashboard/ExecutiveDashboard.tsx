import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { ExecutiveDashboardKPIs, CapabilityGap, CapabilityHeatmapCell } from '../../types';
import { useStore } from '../../store/useStore';
import {
  TrendingUp,
  Target,
  Zap,
  Activity,
  AlertCircle,
  Plus,
  ArrowUpRight,
  PieChart,
  CheckCircle2,
  DollarSign,
  Layers,
  Database
} from 'lucide-react';

export const ExecutiveDashboard: React.FC = () => {
  const { openModal, setActiveView, setAppMode } = useStore();
  const [kpis, setKpis] = useState<ExecutiveDashboardKPIs | null>(null);
  const [gaps, setGaps] = useState<CapabilityGap[]>([]);
  const [heatmap, setHeatmap] = useState<CapabilityHeatmapCell[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [dashData, gapData, heatData] = await Promise.all([
          api.getDashboard(),
          api.getGaps(),
          api.getHeatmap(),
        ]);
        setKpis(dashData);
        setGaps(gapData);
        setHeatmap(heatData);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-muted-foreground font-mono">Computing Architecture KPIs from PostgreSQL schema BT_BASE...</p>
        </div>
      </div>
    );
  }

  // Handle missing data state (No Mock Data rule)
  if (!kpis || kpis.total_capabilities === 0) {
    return (
      <div className="p-8 max-w-5xl mx-auto space-y-6 animate-in fade-in duration-300">
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-foreground">
              Enterprise Architecture Dashboard
            </h1>
            <p className="text-xs text-muted-foreground mt-1">
              Authoritative architecture repository stored in PostgreSQL schema BT_BASE.
            </p>
          </div>
        </div>

        <div className="p-8 rounded-2xl bg-card border border-border text-center space-y-4 shadow-xs">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/20 flex items-center justify-center mx-auto">
            <Database className="w-6 h-6" />
          </div>
          <div className="space-y-1 max-w-md mx-auto">
            <h3 className="text-sm font-bold text-foreground">No Architecture Models in Active Schema</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              The active PostgreSQL schema is currently empty. Design your capabilities schema or import initial architecture metamodels to generate live heatmaps and KPIs.
            </p>
          </div>
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={() => openModal('capability')}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-all cursor-pointer shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Create First Capability</span>
            </button>
            <button
              onClick={() => {
                setAppMode('settings');
                setActiveView('imports');
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-muted hover:bg-muted/80 text-foreground border border-border transition-all cursor-pointer"
            >
              <Layers className="w-4 h-4" />
              <span>Import Metamodels</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  const redCount = heatmap.filter((h) => h.health_color === 'red').length;
  const yellowCount = heatmap.filter((h) => h.health_color === 'yellow').length;
  const greenCount = heatmap.filter((h) => h.health_color === 'green' || h.health_color === 'blue').length;

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto animate-in fade-in duration-300">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <div className="flex items-center gap-2.5 mb-1.5">
            <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">
              Executive Dashboard
            </span>
            <span className="text-xs text-muted-foreground font-mono">Schema: BT_BASE</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-foreground">
            Enterprise Architecture Dashboard
          </h1>
          <p className="text-xs md:text-sm text-muted-foreground mt-1">
            Authoritative capability health, value stream efficiency, and strategy-to-execution alignment.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => openModal('capability')}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 shadow-xs transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Capability</span>
          </button>
          <button
            onClick={() => openModal('initiative')}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-muted hover:bg-muted/80 text-foreground border border-border transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Initiative</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Capability Health */}
        <div className="bg-card rounded-2xl p-5 border border-border shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Capability Maturity</span>
            <Target className="w-5 h-5 text-indigo-500" />
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-foreground">{kpis.average_capability_maturity.toFixed(1)}</span>
            <span className="text-xs text-muted-foreground font-mono">/ 5.0 Target</span>
          </div>
          <div className="mt-2 text-xs text-muted-foreground flex items-center gap-1.5">
            <span className="text-emerald-600 dark:text-emerald-400 font-bold">{kpis.total_capabilities} L1-L4</span>
            <span>Capabilities registered</span>
          </div>
        </div>

        {/* Value Stream Flow */}
        <div className="bg-card rounded-2xl p-5 border border-border shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Flow Efficiency</span>
            <Activity className="w-5 h-5 text-cyan-500" />
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-foreground">{kpis.avg_flow_efficiency_pct.toFixed(0)}%</span>
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold font-mono">Target &gt; 40%</span>
          </div>
          <div className="mt-2 text-xs text-muted-foreground flex items-center gap-1.5">
            <span className="text-cyan-600 dark:text-cyan-400 font-bold">{kpis.total_value_streams} Streams</span>
            <span>Customer value delivery</span>
          </div>
        </div>

        {/* Strategic Alignment */}
        <div className="bg-card rounded-2xl p-5 border border-border shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Strategic Alignment</span>
            <TrendingUp className="w-5 h-5 text-emerald-500" />
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-foreground">{kpis.strategic_alignment_score.toFixed(0)}%</span>
            <span className="text-xs text-muted-foreground font-mono">Score</span>
          </div>
          <div className="mt-2 text-xs text-muted-foreground flex items-center gap-1.5">
            <span className="text-emerald-600 dark:text-emerald-400 font-bold">Goal Realized</span>
            <span>via mapped initiatives</span>
          </div>
        </div>

        {/* Transformation Investment */}
        <div className="bg-card rounded-2xl p-5 border border-border shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Initiatives Budget</span>
            <DollarSign className="w-5 h-5 text-amber-500" />
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-foreground">
              ${(kpis.total_initiative_budget_usd / 1_000_000).toFixed(1)}M
            </span>
            <span className="text-xs text-muted-foreground font-mono">USD</span>
          </div>
          <div className="mt-2 text-xs text-muted-foreground flex items-center gap-1.5">
            <span className="text-amber-600 dark:text-amber-400 font-bold">{kpis.total_active_initiatives} Active</span>
            <span>Programs funded</span>
          </div>
        </div>
      </div>

      {/* Analytics & Transformation Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Capability Maturity Heatmap Summary */}
        <div className="bg-card rounded-2xl p-6 border border-border space-y-4 shadow-xs">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
              <PieChart className="w-4 h-4 text-indigo-500" />
              Maturity & Health Distribution
            </h2>
            <span className="text-xs text-muted-foreground font-mono">{heatmap.length} Measured</span>
          </div>

          <div className="space-y-3 pt-2">
            {/* Green */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" /> On Target (Level 4-5)
                </span>
                <span className="font-mono text-muted-foreground">{greenCount} ({Math.round((greenCount / heatmap.length) * 100 || 0)}%)</span>
              </div>
              <div className="w-full bg-muted h-2 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${(greenCount / heatmap.length) * 100 || 0}%` }} />
              </div>
            </div>

            {/* Yellow */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-amber-600 dark:text-amber-400 font-medium flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-500" /> Developing (Level 3)
                </span>
                <span className="font-mono text-muted-foreground">{yellowCount} ({Math.round((yellowCount / heatmap.length) * 100 || 0)}%)</span>
              </div>
              <div className="w-full bg-muted h-2 rounded-full overflow-hidden">
                <div className="bg-amber-500 h-full rounded-full" style={{ width: `${(yellowCount / heatmap.length) * 100 || 0}%` }} />
              </div>
            </div>

            {/* Red */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-rose-600 dark:text-rose-400 font-medium flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-rose-500" /> Critical Gap (Level 1-2)
                </span>
                <span className="font-mono text-muted-foreground">{redCount} ({Math.round((redCount / heatmap.length) * 100 || 0)}%)</span>
              </div>
              <div className="w-full bg-muted h-2 rounded-full overflow-hidden">
                <div className="bg-rose-500 h-full rounded-full" style={{ width: `${(redCount / heatmap.length) * 100 || 0}%` }} />
              </div>
            </div>
          </div>
        </div>

        {/* Strategic Capability Gaps */}
        <div className="bg-card rounded-2xl p-6 border border-border space-y-4 shadow-xs lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-500" />
              Top Strategic Capability Gaps
            </h2>
            <button
              onClick={() => {
                setAppMode('architect');
                setActiveView('arch-capabilities');
              }}
              className="text-xs text-primary hover:underline font-medium"
            >
              View Full Metamodel &rarr;
            </button>
          </div>

          <div className="space-y-2.5">
            {gaps.slice(0, 4).map((gap) => (
              <div
                key={gap.capability_id}
                className="p-3.5 rounded-xl bg-muted/40 border border-border/70 flex items-center justify-between gap-3 text-xs"
              >
                <div className="min-w-0">
                  <div className="font-bold text-foreground truncate">{gap.capability_name}</div>
                  <div className="text-[11px] text-muted-foreground">
                    Current Maturity: <span className="font-mono font-bold text-rose-500">{gap.current_maturity.toFixed(1)}</span> / Target:{' '}
                    <span className="font-mono font-bold text-emerald-500">{gap.target_maturity.toFixed(1)}</span>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded font-mono text-[10px] font-bold bg-rose-500/10 text-rose-500 border border-rose-500/20 shrink-0">
                  Gap -{gap.gap_delta.toFixed(1)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
