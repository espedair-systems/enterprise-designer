import React, { useState } from 'react';
import {
  Terminal,
  Database,
  Activity,
  Play,
  Trash2,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
} from 'lucide-react';
import { useLayout } from './LayoutContext';

export const BottomTray: React.FC = () => {
  const {
    slots,
    bottomTrayOpen,
    toggleBottomTray,
    bottomTrayHeight,
    activeBottomTab,
    setActiveBottomTab,
  } = useLayout();

  const [queryText, setQueryText] = useState<string>('SELECT * FROM DES_BASE.designer_apps LIMIT 10;');
  const [logs, setLogs] = useState<Array<{ time: string; level: string; msg: string }>>([
    { time: '01:20:00', level: 'INFO', msg: 'PostgreSQL connection pool initialized (default_schema: DES_BASE)' },
    { time: '01:20:02', level: 'INFO', msg: 'Loaded dynamic slot DSL for application "fleet-logistics"' },
    { time: '01:20:04', level: 'INFO', msg: 'Scaffolder verified enterprise-template base structure' },
  ]);

  if (!bottomTrayOpen) {
    return (
      <div className="h-7 bg-muted/80 border-t border-border px-3 flex items-center justify-between select-none z-20 shrink-0">
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <button
            type="button"
            onClick={toggleBottomTray}
            className="flex items-center gap-1 hover:text-foreground transition-colors font-medium"
          >
            <ChevronUp className="w-3.5 h-3.5" />
            <span>Console & Query Panel</span>
          </button>
          <span className="text-border">|</span>
          <span className="text-[11px] text-emerald-500 flex items-center gap-1 font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> PostgreSQL Active (Port 5432)
          </span>
        </div>
      </div>
    );
  }

  const TAB_LABELS: Record<string, { label: string; icon: React.FC<{ className?: string }> }> = {
    query_runner: { label: 'Query Runner', icon: Database },
    sql_logs: { label: 'Audit & SQL Logs', icon: Activity },
    test_runner: { label: 'Test Suite', icon: CheckCircle2 },
    terminal: { label: 'Terminal Output', icon: Terminal },
  };

  return (
    <footer
      style={{ height: `${bottomTrayHeight}px` }}
      className="bg-card border-t border-border flex flex-col select-none z-20 shrink-0 shadow-xs"
      aria-label="Bottom Tray Console"
    >
      {/* Header Tab Strip */}
      <div className="h-8 bg-muted/60 border-b border-border px-2 flex items-center justify-between">
        <div className="flex items-center gap-1">
          {slots.bottom_tray.panels.map((panel) => {
            const tabInfo = TAB_LABELS[panel] || { label: panel, icon: Terminal };
            const Icon = tabInfo.icon;
            const isActive = activeBottomTab === panel;

            return (
              <button
                key={panel}
                type="button"
                onClick={() => setActiveBottomTab(panel)}
                className={`flex items-center gap-1.5 px-3 py-1 text-xs rounded-md transition-all font-medium ${
                  isActive
                    ? 'bg-card text-primary font-semibold shadow-xs'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tabInfo.label}</span>
              </button>
            );
          })}
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setLogs([])}
            className="text-muted-foreground hover:text-foreground p-1 rounded-md"
            title="Clear Logs"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={toggleBottomTray}
            className="text-muted-foreground hover:text-foreground p-1 rounded-md"
            title="Collapse Console"
          >
            <ChevronDown className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Body Area */}
      <div className="flex-1 overflow-auto p-3 text-xs font-mono text-foreground">
        {activeBottomTab === 'query_runner' && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={queryText}
                onChange={(e) => setQueryText(e.target.value)}
                className="flex-1 bg-background border border-border rounded-lg px-2.5 py-1 text-xs font-mono text-primary focus:outline-none focus:border-primary"
              />
              <button
                type="button"
                className="flex items-center gap-1 px-3 py-1 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg text-xs font-semibold shadow-xs"
              >
                <Play className="w-3 h-3" /> Run
              </button>
            </div>

            <div className="border border-border rounded-xl overflow-hidden shadow-xs">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-muted/60 text-muted-foreground text-[11px] border-b border-border">
                  <tr>
                    <th className="p-2">id</th>
                    <th className="p-2">name</th>
                    <th className="p-2">slug</th>
                    <th className="p-2">status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border bg-card">
                  <tr>
                    <td className="p-2 text-primary font-mono font-bold">app-8291a</td>
                    <td className="p-2 font-sans font-medium text-foreground">Fleet Logistics Studio</td>
                    <td className="p-2 text-muted-foreground font-mono">fleet-logistics</td>
                    <td className="p-2"><span className="text-emerald-500 font-bold">● scaffolded</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeBottomTab === 'sql_logs' && (
          <div className="space-y-1">
            {logs.length === 0 ? (
              <p className="text-muted-foreground italic">No logs recorded.</p>
            ) : (
              logs.map((log, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="text-muted-foreground">{log.time}</span>
                  <span className="text-primary font-bold">[{log.level}]</span>
                  <span className="text-foreground">{log.msg}</span>
                </div>
              ))
            )}
          </div>
        )}

        {activeBottomTab === 'test_runner' && (
          <div className="space-y-1 text-foreground">
            <p className="text-emerald-500 font-bold">✓ Go Hexagonal Backend Test Suite: 6 / 6 PASSED</p>
            <p className="text-muted-foreground">• arch-base-deploy/internal/core/domain: 0.004s</p>
            <p className="text-muted-foreground">• arch-base-deploy/internal/core/services: 0.003s</p>
            <p className="text-emerald-500 font-bold mt-2">✓ React 19 Frontend Vite Build: PASSED (0 errors)</p>
          </div>
        )}

        {activeBottomTab === 'terminal' && (
          <div className="space-y-1">
            <p className="text-muted-foreground">$ base server --config config.yaml</p>
            <p className="text-muted-foreground">2026/08/28 01:20:00 [INFO] REST API Server listening on :8088</p>
            <p className="text-muted-foreground">2026/08/28 01:20:00 [INFO] PostgreSQL connection verified (DES_BASE)</p>
          </div>
        )}
      </div>
    </footer>
  );
};
