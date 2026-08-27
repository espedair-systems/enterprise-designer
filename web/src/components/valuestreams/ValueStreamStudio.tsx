import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { ValueStream, ValueStage } from '../../types';
import { useStore } from '../../store/useStore';
import {
  Workflow,
  Plus,
  Clock,
  Zap,
  ArrowRight,
  ShieldAlert,
  Layers,
  Sparkles,
  Database
} from 'lucide-react';

export const ValueStreamStudio: React.FC = () => {
  const { openModal, setActiveView } = useStore();
  const [valueStreams, setValueStreams] = useState<ValueStream[]>([]);
  const [selectedStream, setSelectedStream] = useState<ValueStream | null>(null);
  const [selectedStage, setSelectedStage] = useState<ValueStage | null>(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const data = await api.listValueStreams();
      setValueStreams(data);
      if (data.length > 0) {
        setSelectedStream(data[0]);
        if (data[0].stages && data[0].stages.length > 0) {
          setSelectedStage(data[0].stages[0]);
        }
      }
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
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground flex items-center gap-2.5">
            <Workflow className="w-6 h-6 text-indigo-500" />
            Value Stream & Customer Flow Studio
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            End-to-end value delivery modeling, stage gating criteria, flow efficiency, and enabling capabilities.
          </p>
        </div>

        <button
          onClick={() => openModal('valuestream')}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-primary hover:bg-primary/90 text-primary-foreground shadow-xs transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>New Value Stream</span>
        </button>
      </div>

      {loading ? (
        <div className="p-12 text-center text-xs text-muted-foreground font-mono">Loading value streams from PostgreSQL...</div>
      ) : valueStreams.length === 0 ? (
        <div className="p-8 rounded-2xl bg-card border border-border text-center space-y-4 shadow-xs">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-500 border border-indigo-500/20 flex items-center justify-center mx-auto">
            <Database className="w-6 h-6" />
          </div>
          <div className="space-y-1 max-w-md mx-auto">
            <h3 className="text-sm font-bold text-foreground">No Value Streams in Schema</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              No core customer or internal value streams exist in the active schema. Define your first value stream or import standard value stream patterns.
            </p>
          </div>
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={() => openModal('valuestream')}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-all cursor-pointer shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Create Value Stream</span>
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
        <div className="space-y-6">
          {/* Stream Selector Tabs */}
          <div className="flex items-center gap-2 border-b border-border pb-3 overflow-x-auto">
            {valueStreams.map((vs) => (
              <button
                key={vs.id}
                onClick={() => {
                  setSelectedStream(vs);
                  if (vs.stages && vs.stages.length > 0) setSelectedStage(vs.stages[0]);
                }}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer ${
                  selectedStream?.id === vs.id
                    ? 'bg-primary text-primary-foreground shadow-xs'
                    : 'bg-card border border-border text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
              >
                <span className="font-mono text-[11px] opacity-75">{vs.code}</span>
                <span>{vs.name}</span>
              </button>
            ))}
          </div>

          {selectedStream && (
            <div className="space-y-6">
              {/* Metadata Card */}
              <div className="rounded-2xl p-6 bg-card border border-border grid grid-cols-1 md:grid-cols-4 gap-4 text-xs shadow-xs">
                <div>
                  <span className="text-[10px] uppercase font-bold text-muted-foreground block mb-1">Trigger</span>
                  <p className="text-foreground font-medium">{selectedStream.trigger}</p>
                </div>
                <div className="md:col-span-2">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground block mb-1">Value Proposition</span>
                  <p className="text-primary font-medium">{selectedStream.value_proposition}</p>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-muted-foreground block mb-1">Stakeholder / Owner</span>
                  <p className="text-foreground font-medium">{selectedStream.stakeholder} ({selectedStream.owner})</p>
                </div>
              </div>

              {/* Chevron Stage Flow Pipeline */}
              <div className="space-y-3">
                <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Sequential Stage Progression</h2>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  {selectedStream.stages?.map((stage, idx) => {
                    const isSelected = selectedStage?.id === stage.id;
                    return (
                      <div
                        key={stage.id}
                        onClick={() => setSelectedStage(stage)}
                        className={`cursor-pointer rounded-xl p-4 border transition-all relative ${
                          isSelected
                            ? 'bg-primary/10 border-primary ring-1 ring-primary/40 shadow-xs'
                            : 'bg-card border border-border hover:border-primary/40'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-muted text-primary">
                            Stage {idx + 1}
                          </span>
                          <span className="text-[11px] font-mono font-bold text-emerald-600 dark:text-emerald-400">
                            {stage.flow_efficiency_pct.toFixed(0)}% Eff
                          </span>
                        </div>
                        <h3 className="text-xs font-bold text-foreground mb-2">{stage.name}</h3>
                        <div className="flex items-center justify-between text-[11px] font-mono text-muted-foreground border-t border-border pt-2">
                          <span>Lead: {stage.lead_time_hours}h</span>
                          <span>Proc: {stage.processing_time_hours}h</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Selected Stage Detail Inspector */}
              {selectedStage && (
                <div className="rounded-2xl p-6 bg-card border border-border space-y-6 shadow-xs animate-in fade-in duration-200">
                  <div className="flex items-center justify-between border-b border-border pb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-primary">STAGE {selectedStage.order_index}</span>
                        <h2 className="text-base font-bold text-foreground">{selectedStage.name}</h2>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{selectedStage.description}</p>
                    </div>
                    <div className="flex items-center gap-4 text-xs font-mono">
                      <div className="p-2.5 rounded-xl bg-muted/40 border border-border text-right">
                        <span className="text-[10px] text-muted-foreground block">Processing Time</span>
                        <strong className="text-cyan-600 dark:text-cyan-400">{selectedStage.processing_time_hours} Hours</strong>
                      </div>
                      <div className="p-2.5 rounded-xl bg-muted/40 border border-border text-right">
                        <span className="text-[10px] text-muted-foreground block">Total Lead Time</span>
                        <strong className="text-amber-600 dark:text-amber-400">{selectedStage.lead_time_hours} Hours</strong>
                      </div>
                    </div>
                  </div>

                  {/* Gating Criteria & Value Produced */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                    <div className="p-4 rounded-xl bg-muted/20 border border-border space-y-1">
                      <span className="font-bold text-foreground flex items-center gap-1.5 text-[11px] uppercase tracking-wider">
                        Entrance Criteria
                      </span>
                      <p className="text-muted-foreground">{selectedStage.entrance_criteria}</p>
                    </div>

                    <div className="p-4 rounded-xl bg-muted/20 border border-border space-y-1">
                      <span className="font-bold text-foreground flex items-center gap-1.5 text-[11px] uppercase tracking-wider">
                        Exit Criteria
                      </span>
                      <p className="text-muted-foreground">{selectedStage.exit_criteria}</p>
                    </div>

                    <div className="p-4 rounded-xl bg-muted/20 border border-border space-y-1">
                      <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 text-[11px] uppercase tracking-wider">
                        Value Produced
                      </span>
                      <p className="text-foreground font-medium">{selectedStage.value_produced}</p>
                    </div>
                  </div>

                  {/* Enabling Capabilities */}
                  <div className="space-y-3">
                    <h3 className="text-xs font-bold text-foreground flex items-center gap-2">
                      <Layers className="w-4 h-4 text-primary" />
                      <span>Enabling Business Capabilities</span>
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedStage.enabling_capabilities && selectedStage.enabling_capabilities.length > 0 ? (
                        selectedStage.enabling_capabilities.map((cap) => (
                          <div
                            key={cap.id}
                            className="px-3 py-2 rounded-xl bg-muted/30 border border-border flex items-center gap-2 text-xs"
                          >
                            <span className="font-mono text-primary font-bold">{cap.code}</span>
                            <span className="text-foreground font-medium">{cap.name}</span>
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
                              {cap.pace_layer}
                            </span>
                          </div>
                        ))
                      ) : (
                        <span className="text-xs text-muted-foreground italic">No specific capability mapping configured</span>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
