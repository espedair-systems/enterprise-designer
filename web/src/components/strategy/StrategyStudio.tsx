import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import {
  StrategicDriver,
  StrategicGoal,
  StrategicObjective,
  BusinessModelCanvas,
  StrategyTraceabilityItem
} from '../../types';
import { useStore } from '../../store/useStore';
import {
  Compass,
  Target,
  Layers,
  Plus,
  TrendingUp,
  Table,
  LayoutGrid,
  CheckCircle2,
  Database
} from 'lucide-react';

export const StrategyStudio: React.FC = () => {
  const { openModal, setActiveView } = useStore();
  const [goals, setGoals] = useState<StrategicGoal[]>([]);
  const [drivers, setDrivers] = useState<StrategicDriver[]>([]);
  const [canvas, setCanvas] = useState<BusinessModelCanvas | null>(null);
  const [traceability, setTraceability] = useState<StrategyTraceabilityItem[]>([]);
  const [activeTab, setActiveTab] = useState<'canvas' | 'goals' | 'traceability'>('canvas');
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const [g, d, c, t] = await Promise.all([
        api.listGoals(),
        api.listDrivers(),
        api.getCanvas().catch(() => null),
        api.getStrategyTraceability(),
      ]);
      setGoals(g);
      setDrivers(d);
      setCanvas(c);
      setTraceability(t);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto animate-in fade-in duration-300">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground flex items-center gap-2.5">
            <Compass className="w-6 h-6 text-indigo-500" />
            Strategy, OKRs & Business Model Canvas
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Strategic drivers, 9-box Business Model Canvas, OKR progress, and end-to-end strategy-to-execution traceability.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex bg-card border border-border p-1 rounded-xl shadow-xs">
            <button
              onClick={() => setActiveTab('canvas')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                activeTab === 'canvas' ? 'bg-primary text-primary-foreground shadow-xs' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              9-Box Canvas
            </button>
            <button
              onClick={() => setActiveTab('goals')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                activeTab === 'goals' ? 'bg-primary text-primary-foreground shadow-xs' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Goals & OKRs
            </button>
            <button
              onClick={() => setActiveTab('traceability')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                activeTab === 'traceability' ? 'bg-primary text-primary-foreground shadow-xs' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Traceability Matrix
            </button>
          </div>

          <button
            onClick={() => openModal('goal')}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-primary hover:bg-primary/90 text-primary-foreground shadow-xs transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Goal</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center text-xs text-muted-foreground font-mono">Loading strategic models from PostgreSQL...</div>
      ) : activeTab === 'canvas' && canvas ? (
        /* Osterwalder's 9-Box Business Model Canvas */
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Canvas: <strong className="text-foreground">{canvas.name}</strong> ({canvas.version})</span>
          </div>

          <div className="grid grid-cols-5 gap-3">
            {/* Key Partners */}
            <div className="rounded-2xl p-4 bg-card border border-border space-y-2 shadow-xs">
              <span className="text-[11px] font-bold text-indigo-500 uppercase tracking-wider block">
                Key Partners
              </span>
              <ul className="space-y-1 text-xs text-foreground">
                {canvas.key_partners?.map((item, i) => (
                  <li key={i} className="p-2 rounded-lg bg-muted/30 border border-border/60">• {item}</li>
                ))}
              </ul>
            </div>

            {/* Key Activities & Resources */}
            <div className="space-y-3">
              <div className="rounded-2xl p-4 bg-card border border-border space-y-2 shadow-xs">
                <span className="text-[11px] font-bold text-cyan-500 uppercase tracking-wider block">
                  Key Activities
                </span>
                <ul className="space-y-1 text-xs text-foreground">
                  {canvas.key_activities?.map((item, i) => (
                    <li key={i} className="p-2 rounded-lg bg-muted/30 border border-border/60">• {item}</li>
                  ))}
                </ul>
              </div>
              <div className="rounded-2xl p-4 bg-card border border-border space-y-2 shadow-xs">
                <span className="text-[11px] font-bold text-cyan-500 uppercase tracking-wider block">
                  Key Resources
                </span>
                <ul className="space-y-1 text-xs text-foreground">
                  {canvas.key_resources?.map((item, i) => (
                    <li key={i} className="p-2 rounded-lg bg-muted/30 border border-border/60">• {item}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Value Propositions */}
            <div className="rounded-2xl p-4 bg-card border border-border space-y-2 shadow-xs">
              <span className="text-[11px] font-bold text-primary uppercase tracking-wider block">
                Value Propositions
              </span>
              <ul className="space-y-1 text-xs text-foreground">
                {canvas.value_propositions?.map((item, i) => (
                  <li key={i} className="p-2 rounded-lg bg-primary/5 border border-primary/20 text-primary font-medium">• {item}</li>
                ))}
              </ul>
            </div>

            {/* Customer Relationships & Channels */}
            <div className="space-y-3">
              <div className="rounded-2xl p-4 bg-card border border-border space-y-2 shadow-xs">
                <span className="text-[11px] font-bold text-amber-500 uppercase tracking-wider block">
                  Customer Relationships
                </span>
                <ul className="space-y-1 text-xs text-foreground">
                  {canvas.customer_relationships?.map((item, i) => (
                    <li key={i} className="p-2 rounded-lg bg-muted/30 border border-border/60">• {item}</li>
                  ))}
                </ul>
              </div>
              <div className="rounded-2xl p-4 bg-card border border-border space-y-2 shadow-xs">
                <span className="text-[11px] font-bold text-amber-500 uppercase tracking-wider block">
                  Channels
                </span>
                <ul className="space-y-1 text-xs text-foreground">
                  {canvas.channels?.map((item, i) => (
                    <li key={i} className="p-2 rounded-lg bg-muted/30 border border-border/60">• {item}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Customer Segments */}
            <div className="rounded-2xl p-4 bg-card border border-border space-y-2 shadow-xs">
              <span className="text-[11px] font-bold text-emerald-500 uppercase tracking-wider block">
                Customer Segments
              </span>
              <ul className="space-y-1 text-xs text-foreground">
                {canvas.customer_segments?.map((item, i) => (
                  <li key={i} className="p-2 rounded-lg bg-muted/30 border border-border/60">• {item}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Cost Structure & Revenue Streams */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl p-4 bg-card border border-border space-y-2 shadow-xs">
              <span className="text-[11px] font-bold text-rose-500 uppercase tracking-wider block">
                Cost Structure
              </span>
              <ul className="space-y-1 text-xs text-foreground">
                {canvas.cost_structure?.map((item, i) => (
                  <li key={i} className="p-2 rounded-lg bg-muted/30 border border-border/60">• {item}</li>
                ))}
              </ul>
            </div>

            <div className="rounded-2xl p-4 bg-card border border-border space-y-2 shadow-xs">
              <span className="text-[11px] font-bold text-emerald-500 uppercase tracking-wider block">
                Revenue Streams
              </span>
              <ul className="space-y-1 text-xs text-foreground">
                {canvas.revenue_streams?.map((item, i) => (
                  <li key={i} className="p-2 rounded-lg bg-muted/30 border border-border/60">• {item}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      ) : activeTab === 'goals' ? (
        /* Goals & OKRs View */
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {goals.map((g) => (
              <div key={g.id} className="rounded-2xl p-6 bg-card border border-border space-y-4 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-indigo-500">{g.code}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-mono bg-muted text-muted-foreground">
                    Horizon {g.horizon_year}
                  </span>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-foreground">{g.title}</h3>
                  <p className="text-xs text-muted-foreground mt-1">{g.description}</p>
                </div>

                <div className="space-y-2 pt-2 border-t border-border">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Overall Goal Progress</span>
                    <strong className="text-foreground font-mono">{g.progress_pct}%</strong>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-primary h-2 rounded-full transition-all"
                      style={{ width: `${g.progress_pct}%` }}
                    />
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between text-xs text-muted-foreground font-mono">
                  <span>Target Metric: <strong className="text-foreground">{g.target_metric}</strong></span>
                  <span>Owner: <strong className="text-foreground">{g.owner_role}</strong></span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Strategy-to-Execution Traceability Matrix */
        <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-muted/50 border-b border-border text-muted-foreground font-semibold">
                <tr>
                  <th className="p-3.5">Strategic Driver</th>
                  <th className="p-3.5">Strategic Goal & OKR</th>
                  <th className="p-3.5">Target Business Capability</th>
                  <th className="p-3.5">Initiative & Value Stream</th>
                  <th className="p-3.5">Horizon</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {traceability.map((item, idx) => (
                  <tr key={idx} className="hover:bg-muted/20 transition-colors">
                    <td className="p-3.5 font-semibold text-foreground">{item.driver_name}</td>
                    <td className="p-3.5 text-primary font-medium">{item.goal_title}</td>
                    <td className="p-3.5 font-mono text-cyan-600 dark:text-cyan-400">{item.capability_name || item.capability_code}</td>
                    <td className="p-3.5 text-muted-foreground">{item.initiative_name || item.value_stream_name}</td>
                    <td className="p-3.5 font-mono font-bold text-foreground">{item.horizon || 'H1'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
