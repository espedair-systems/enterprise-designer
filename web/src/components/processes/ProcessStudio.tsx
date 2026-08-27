import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { BusinessProcess } from '../../types';
import { useStore } from '../../store/useStore';
import {
  GitFork,
  Plus,
  Play,
  CheckCircle2,
  Users,
  Activity,
  ArrowRight,
  Sparkles,
  Database,
  Layers
} from 'lucide-react';

export const ProcessStudio: React.FC = () => {
  const { searchQuery, openModal, setActiveView } = useStore();
  const [processes, setProcesses] = useState<BusinessProcess[]>([]);
  const [selectedProcess, setSelectedProcess] = useState<BusinessProcess | null>(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const data = await api.listProcesses();
      setProcesses(data);
      if (data.length > 0) setSelectedProcess(data[0]);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filtered = processes.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto animate-in fade-in duration-300">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground flex items-center gap-2.5">
            <GitFork className="w-6 h-6 text-indigo-500" />
            Process & SIPOC Studio
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Operational workflows, APQC process taxonomy, SIPOC diagrams, and Workday RACI matrices.
          </p>
        </div>

        <button
          onClick={() => openModal('process')}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-primary hover:bg-primary/90 text-primary-foreground shadow-xs transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>New Process</span>
        </button>
      </div>

      {loading ? (
        <div className="p-12 text-center text-xs text-muted-foreground font-mono">Loading processes from PostgreSQL...</div>
      ) : processes.length === 0 ? (
        <div className="p-8 rounded-2xl bg-card border border-border text-center space-y-4 shadow-xs">
          <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-500 border border-purple-500/20 flex items-center justify-center mx-auto">
            <Database className="w-6 h-6" />
          </div>
          <div className="space-y-1 max-w-md mx-auto">
            <h3 className="text-sm font-bold text-foreground">No Processes in Schema</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              No APQC or operational processes exist in the active schema. Create your first SIPOC process or import metamodels.
            </p>
          </div>
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={() => openModal('process')}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-all cursor-pointer shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Create Process</span>
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Process List */}
          <div className="rounded-2xl p-4 bg-card border border-border space-y-2 shadow-xs">
            <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider px-2">Processes</span>
            {filtered.map((proc) => {
              const isSelected = selectedProcess?.id === proc.id;
              return (
                <div
                  key={proc.id}
                  onClick={() => setSelectedProcess(proc)}
                  className={`p-3.5 rounded-xl cursor-pointer transition-all border ${
                    isSelected
                      ? 'bg-primary text-primary-foreground border-primary shadow-xs'
                      : 'bg-card border-border text-foreground hover:bg-muted'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold">{proc.code}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full ${isSelected ? 'bg-primary-foreground/20 text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                      {proc.classification}
                    </span>
                  </div>
                  <h3 className="text-xs font-bold mt-1.5 line-clamp-1">{proc.name}</h3>
                  <div className="flex items-center justify-between text-[11px] mt-2 opacity-80 font-mono">
                    <span>{proc.category}</span>
                    <span>{proc.overall_automation_pct}% Auto</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right: Selected Process SIPOC & RACI */}
          {selectedProcess && (
            <div className="lg:col-span-2 space-y-6">
              {/* Overview Card */}
              <div className="rounded-2xl p-6 bg-card border border-border space-y-4 shadow-xs">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-primary">{selectedProcess.code}</span>
                      <h2 className="text-base font-bold text-foreground">{selectedProcess.name}</h2>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{selectedProcess.description}</p>
                  </div>
                  <div className="text-right font-mono text-xs">
                    <span className="text-muted-foreground block text-[10px]">Owner Role</span>
                    <strong className="text-foreground">{selectedProcess.owner_role}</strong>
                  </div>
                </div>

                {/* SIPOC 5-Column Block */}
                <div className="space-y-2 pt-2 border-t border-border">
                  <h3 className="text-xs font-bold text-foreground">SIPOC Architecture Decomposition</h3>
                  <div className="grid grid-cols-5 gap-2 text-xs">
                    <div className="p-3 rounded-xl bg-muted/30 border border-border">
                      <span className="text-[10px] font-bold uppercase text-indigo-500 block mb-1.5">Suppliers</span>
                      <ul className="space-y-1 text-muted-foreground text-[11px]">
                        {selectedProcess.sipoc?.suppliers?.map((s, i) => (
                          <li key={i}>• {s}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="p-3 rounded-xl bg-muted/30 border border-border">
                      <span className="text-[10px] font-bold uppercase text-cyan-500 block mb-1.5">Inputs</span>
                      <ul className="space-y-1 text-muted-foreground text-[11px]">
                        {selectedProcess.sipoc?.inputs?.map((inp, i) => (
                          <li key={i}>• {inp}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="p-3 rounded-xl bg-muted/30 border border-border">
                      <span className="text-[10px] font-bold uppercase text-emerald-500 block mb-1.5">Process Steps</span>
                      <p className="text-[11px] text-foreground font-mono">{selectedProcess.steps?.length || 0} Core Steps</p>
                    </div>

                    <div className="p-3 rounded-xl bg-muted/30 border border-border">
                      <span className="text-[10px] font-bold uppercase text-amber-500 block mb-1.5">Outputs</span>
                      <ul className="space-y-1 text-muted-foreground text-[11px]">
                        {selectedProcess.sipoc?.outputs?.map((out, i) => (
                          <li key={i}>• {out}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="p-3 rounded-xl bg-muted/30 border border-border">
                      <span className="text-[10px] font-bold uppercase text-rose-500 block mb-1.5">Customers</span>
                      <ul className="space-y-1 text-muted-foreground text-[11px]">
                        {selectedProcess.sipoc?.customers?.map((c, i) => (
                          <li key={i}>• {c}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* RACI Matrix & Step Breakdown */}
              <div className="rounded-2xl p-6 bg-card border border-border space-y-4 shadow-xs">
                <h3 className="text-xs font-bold text-foreground flex items-center gap-2">
                  <Users className="w-4 h-4 text-primary" />
                  <span>Process Steps & RACI Responsibility Matrix</span>
                </h3>

                <div className="space-y-2">
                  {selectedProcess.steps?.map((step) => (
                    <div
                      key={step.id}
                      className="p-3.5 rounded-xl bg-muted/20 border border-border flex items-center justify-between text-xs"
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-primary font-bold">Step {step.order_index}</span>
                          <strong className="text-foreground">{step.name}</strong>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                            {step.step_type}
                          </span>
                        </div>
                        <p className="text-[11px] text-muted-foreground">{step.description}</p>
                      </div>

                      <div className="flex items-center gap-3 flex-shrink-0">
                        {step.raci_assignments?.map((raci, i) => (
                          <span
                            key={i}
                            className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold ${
                              raci.type === 'Responsible'
                                ? 'bg-primary/10 text-primary border border-primary/20'
                                : raci.type === 'Accountable'
                                ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                                : 'bg-muted text-muted-foreground'
                            }`}
                          >
                            {raci.type[0]}: {raci.role_name}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
