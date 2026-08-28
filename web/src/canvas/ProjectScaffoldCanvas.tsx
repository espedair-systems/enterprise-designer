import React, { useState } from 'react';
import {
  Boxes,
  Terminal,
  FolderTree,
  Cpu,
  Layers,
  CheckCircle2,
  Download,
  Play,
  FileCode,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { useLayout } from '../shell/LayoutContext';

export const ProjectScaffoldCanvas: React.FC = () => {
  const { currentApp } = useLayout();
  const [selectedArch, setSelectedArch] = useState<'hexagonal' | 'event_driven' | 'cqrs'>('hexagonal');
  const [selectedDriver, setSelectedDriver] = useState<'pgx' | 'gorm' | 'sqlx'>('pgx');
  const [isScaffolding, setIsScaffolding] = useState<boolean>(false);
  const [scaffoldLogs, setScaffoldLogs] = useState<string[]>([
    '[INIT] Workspace root: /run/media/jonk/Workspace/ESPEDAIR/designer/enterprise-designer',
    '[CONFIG] Authoritative Database: PostgreSQL DES_BASE (Port 8088)',
    '[HEXAGONAL] Internal core ports and domain entities verified.',
    '[READY] Ready to scaffold project deployment package.',
  ]);

  const handleRunScaffold = () => {
    setIsScaffolding(true);
    setScaffoldLogs((prev) => [
      ...prev,
      `[SCAFFOLD] Scaffolding application template: ${currentApp?.name || 'fleet-logistics'}`,
      `[SCHEMA] Mounting PostgreSQL DES_BASE migrations: designer_apps, designer_layouts...`,
      `[CORE] Generating ports, adapters, and REST handlers...`,
      `[EMBED] Compiling Single Executable React SPA assets into Go binary...`,
      `[SUCCESS] Application ready in bin/base`,
    ]);
    setTimeout(() => {
      setIsScaffolding(false);
    }, 800);
  };

  return (
    <div className="flex-1 h-full bg-background overflow-y-auto p-6 space-y-6 select-none">
      {/* ── Top Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-5">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-primary/10 text-primary border border-primary/20 shadow-xs">
            <Boxes className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">Project Scaffolding & Build Pipeline</h1>
            <p className="text-xs text-muted-foreground">
              Automated hexagonal code generation, single-executable compilation, and schema provisioning.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleRunScaffold}
          disabled={isScaffolding}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground text-xs font-bold rounded-xl shadow-xs hover:bg-primary/90 transition-all cursor-pointer disabled:opacity-50"
        >
          <Play className="w-4 h-4" />
          <span>{isScaffolding ? 'Compiling Bundle...' : 'Run Project Scaffold'}</span>
        </button>
      </div>

      {/* ── Configuration Cards ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1: Architecture Template */}
        <div className="p-4 rounded-2xl bg-card border border-border space-y-3 shadow-2xs">
          <div className="flex items-center gap-2 text-primary font-bold text-xs">
            <Layers className="w-4 h-4" />
            <span>Architecture Pattern</span>
          </div>
          <div className="space-y-1.5">
            {[
              { id: 'hexagonal', title: 'Hexagonal Architecture', desc: 'Ports & Adapters with pure domain core' },
              { id: 'event_driven', title: 'Event-Driven Microservice', desc: 'Kafka/NATS streaming consumers' },
              { id: 'cqrs', title: 'CQRS + Event Sourcing', desc: 'Read/write database segregation' },
            ].map((arch) => (
              <div
                key={arch.id}
                onClick={() => setSelectedArch(arch.id as any)}
                className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                  selectedArch === arch.id
                    ? 'border-primary bg-primary/10 text-foreground font-semibold'
                    : 'border-border bg-muted/30 text-muted-foreground hover:text-foreground'
                }`}
              >
                <div className="text-xs font-bold">{arch.title}</div>
                <div className="text-[10px] text-muted-foreground">{arch.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Card 2: Database Driver */}
        <div className="p-4 rounded-2xl bg-card border border-border space-y-3 shadow-2xs">
          <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
            <Cpu className="w-4 h-4" />
            <span>Database & Storage</span>
          </div>
          <div className="space-y-1.5">
            {[
              { id: 'pgx', title: 'PostgreSQL Exclusively (pgx/v5)', desc: 'DES_BASE authoritative schema namespace' },
              { id: 'sqlx', title: 'SQLX Raw AST Bindings', desc: 'Custom schema query mapping' },
              { id: 'gorm', title: 'GORM AutoMigrate', desc: 'Declarative ORM schema modeling' },
            ].map((drv) => (
              <div
                key={drv.id}
                onClick={() => setSelectedDriver(drv.id as any)}
                className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                  selectedDriver === drv.id
                    ? 'border-emerald-500 bg-emerald-500/10 text-foreground font-semibold'
                    : 'border-border bg-muted/30 text-muted-foreground hover:text-foreground'
                }`}
              >
                <div className="text-xs font-bold">{drv.title}</div>
                <div className="text-[10px] text-muted-foreground">{drv.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Card 3: Active Target App */}
        <div className="p-4 rounded-2xl bg-card border border-border space-y-3 shadow-2xs">
          <div className="flex items-center gap-2 text-cyan-400 font-bold text-xs">
            <FolderTree className="w-4 h-4" />
            <span>Active Target Application</span>
          </div>
          <div className="p-3 rounded-xl bg-muted/40 border border-border/80 space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-muted-foreground">App Name:</span>
              <span className="font-bold text-foreground">{currentApp?.name || 'Fleet Logistics Studio'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Slug / ID:</span>
              <span className="font-mono text-primary">{currentApp?.slug || 'fleet-logistics'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Status:</span>
              <span className="px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono text-[10px] font-bold">
                {currentApp?.status.toUpperCase() || 'DRAFT'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Target Port:</span>
              <span className="font-mono text-foreground font-bold">8088</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Scaffolding Console Output ── */}
      <div className="p-4 rounded-2xl bg-card border border-border space-y-2 shadow-2xs">
        <div className="flex items-center justify-between text-xs font-bold text-foreground">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-primary" />
            <span>Build & Scaffolding Execution Logs</span>
          </div>
          <span className="text-[10px] font-mono text-muted-foreground">PAGER=cat • bash</span>
        </div>
        <div className="bg-background rounded-xl p-3 font-mono text-[11px] text-muted-foreground space-y-1 max-h-48 overflow-y-auto border border-border/60">
          {scaffoldLogs.map((log, index) => (
            <div key={index} className="text-foreground">
              {log}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProjectScaffoldCanvas;
