import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { Initiative } from '../../types';
import { useStore } from '../../store/useStore';
import {
  Rocket,
  Plus,
  Calendar,
  CheckCircle2,
  Clock,
  DollarSign,
  TrendingUp,
  Award,
  Database,
  Layers
} from 'lucide-react';

export const RoadmapStudio: React.FC = () => {
  const { openModal, setActiveView } = useStore();
  const [initiatives, setInitiatives] = useState<Initiative[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const data = await api.listInitiatives();
      setInitiatives(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const h1 = initiatives.filter((i) => i.horizon?.includes('Horizon 1'));
  const h2 = initiatives.filter((i) => i.horizon?.includes('Horizon 2'));
  const h3 = initiatives.filter((i) => i.horizon?.includes('Horizon 3'));

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto animate-in fade-in duration-300">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground flex items-center gap-2.5">
            <Rocket className="w-6 h-6 text-indigo-500" />
            Roadmap & Three Horizons Studio
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Transformation initiatives, investment horizons (H1/H2/H3), capability uplifts, and delivery milestones.
          </p>
        </div>

        <button
          onClick={() => openModal('initiative')}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-primary hover:bg-primary/90 text-primary-foreground shadow-xs transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>New Initiative</span>
        </button>
      </div>

      {loading ? (
        <div className="p-12 text-center text-xs text-muted-foreground font-mono">Loading roadmap initiatives from PostgreSQL...</div>
      ) : initiatives.length === 0 ? (
        <div className="p-8 rounded-2xl bg-card border border-border text-center space-y-4 shadow-xs">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-500 border border-indigo-500/20 flex items-center justify-center mx-auto">
            <Database className="w-6 h-6" />
          </div>
          <div className="space-y-1 max-w-md mx-auto">
            <h3 className="text-sm font-bold text-foreground">No Initiatives in Schema</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              No transformation initiatives or Three Horizons roadmaps exist in the active schema.
            </p>
          </div>
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={() => openModal('initiative')}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-all cursor-pointer shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Create Initiative</span>
            </button>
            <button
              onClick={() => setActiveView('imports')}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-muted hover:bg-muted/80 text-foreground border border-border transition-all cursor-pointer"
            >
              <Layers className="w-4 h-4" />
              <span>Import Metamodels</span>
            </button>
          </div>
        </div>
      ) : (
        /* 3 Horizons Columns Grid */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Horizon 1: Core Operations */}
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
              <h2 className="text-sm font-bold text-indigo-600 dark:text-indigo-400">Horizon 1: Core Business (0 - 12m)</h2>
              <p className="text-xs text-muted-foreground mt-0.5">Defend and extend core operating capabilities.</p>
            </div>

            <div className="space-y-4">
              {h1.map((init) => (
                <div key={init.id} className="rounded-2xl p-5 bg-card border border-border space-y-3 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-indigo-500">{init.code}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded font-mono bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                      {init.status}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-foreground">{init.name}</h3>
                  <p className="text-xs text-muted-foreground">{init.description}</p>
                  <div className="p-2.5 rounded-xl bg-muted/30 border border-border text-xs space-y-1">
                    <div className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1 text-[11px]">
                      <TrendingUp className="w-3.5 h-3.5" /> ROI: {init.expected_roi}
                    </div>
                    <div className="flex items-center justify-between text-muted-foreground font-mono text-[11px] pt-1">
                      <span>Budget: <strong className="text-foreground">${(init.budget_usd / 1000).toFixed(0)}k</strong></span>
                      <span>Target: <strong className="text-foreground">{init.target_completion_date}</strong></span>
                    </div>
                  </div>

                  {/* Milestones */}
                  {init.milestones && init.milestones.length > 0 && (
                    <div className="space-y-1.5 pt-2 border-t border-border">
                      <span className="text-[10px] uppercase font-bold text-muted-foreground">Key Milestones</span>
                      {init.milestones.map((m, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-xs text-foreground">
                          <CheckCircle2 className={`w-3.5 h-3.5 ${m.is_completed ? 'text-emerald-600 dark:text-emerald-400' : 'text-muted-foreground'}`} />
                          <span className={m.is_completed ? 'line-through text-muted-foreground' : ''}>{m.title}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Horizon 2: Emerging Growth */}
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/20">
              <h2 className="text-sm font-bold text-cyan-600 dark:text-cyan-400">Horizon 2: Emerging Growth (12 - 24m)</h2>
              <p className="text-xs text-muted-foreground mt-0.5">Build new revenue streams and modernize systems.</p>
            </div>

            <div className="space-y-4">
              {h2.map((init) => (
                <div key={init.id} className="rounded-2xl p-5 bg-card border border-border space-y-3 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-cyan-500">{init.code}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded font-mono bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20">
                      {init.status}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-foreground">{init.name}</h3>
                  <p className="text-xs text-muted-foreground">{init.description}</p>
                  <div className="p-2.5 rounded-xl bg-muted/30 border border-border text-xs space-y-1">
                    <div className="text-cyan-600 dark:text-cyan-400 font-semibold flex items-center gap-1 text-[11px]">
                      <TrendingUp className="w-3.5 h-3.5" /> ROI: {init.expected_roi}
                    </div>
                    <div className="flex items-center justify-between text-muted-foreground font-mono text-[11px] pt-1">
                      <span>Budget: <strong className="text-foreground">${(init.budget_usd / 1000000).toFixed(1)}M</strong></span>
                      <span>Target: <strong className="text-foreground">{init.target_completion_date}</strong></span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Horizon 3: Future Transformation */}
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/20">
              <h2 className="text-sm font-bold text-purple-600 dark:text-purple-400">Horizon 3: Future Options (24 - 36m+)</h2>
              <p className="text-xs text-muted-foreground mt-0.5">Disruptive concepts, spatial computing & long-term R&D.</p>
            </div>

            <div className="space-y-4">
              {h3.map((init) => (
                <div key={init.id} className="rounded-2xl p-5 bg-card border border-border space-y-3 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-purple-500">{init.code}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded font-mono bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                      {init.status}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-foreground">{init.name}</h3>
                  <p className="text-xs text-muted-foreground">{init.description}</p>
                  <div className="p-2.5 rounded-xl bg-muted/30 border border-border text-xs space-y-1">
                    <div className="text-purple-600 dark:text-purple-400 font-semibold flex items-center gap-1 text-[11px]">
                      <TrendingUp className="w-3.5 h-3.5" /> ROI: {init.expected_roi}
                    </div>
                    <div className="flex items-center justify-between text-muted-foreground font-mono text-[11px] pt-1">
                      <span>Budget: <strong className="text-foreground">${(init.budget_usd / 1000).toFixed(0)}k</strong></span>
                      <span>Target: <strong className="text-foreground">{init.target_completion_date}</strong></span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
