import React, { useEffect, useState } from 'react';
import {
  Activity,
  RefreshCw,
  Search,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Server,
  Terminal,
  Zap,
  Play
} from 'lucide-react';
import clsx from 'clsx';
import { useDatabaseStore } from '../../store/database';

export const DatabaseActivityView: React.FC = () => {
  const activity = useDatabaseStore((s) => s.activity);
  const loadingActivity = useDatabaseStore((s) => s.loadingActivity);
  const loadActivity = useDatabaseStore((s) => s.loadActivity);

  const [search, setSearch] = useState('');
  const [autoRefreshInterval, setAutoRefreshInterval] = useState<number>(0);

  useEffect(() => {
    void loadActivity();
  }, [loadActivity]);

  useEffect(() => {
    if (autoRefreshInterval <= 0) return;
    const interval = setInterval(() => {
      void loadActivity();
    }, autoRefreshInterval * 1000);
    return () => clearInterval(interval);
  }, [autoRefreshInterval, loadActivity]);

  const filtered = activity.filter((a) => {
    const term = search.toLowerCase();
    return (
      a.application_name.toLowerCase().includes(term) ||
      a.query.toLowerCase().includes(term) ||
      a.state.toLowerCase().includes(term) ||
      String(a.pid).includes(term)
    );
  });

  const activeCount = activity.filter((a) => a.state === 'active').length;
  const idleCount = activity.filter((a) => a.state.includes('idle')).length;

  return (
    <div className="flex-1 flex flex-col h-full bg-background overflow-hidden animate-in fade-in duration-200">
      {/* Top Banner & Control Bar */}
      <div className="p-4 border-b border-border bg-card flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-foreground">PostgreSQL Live Activity Monitor</h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 font-bold">
                pg_stat_activity
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Real-time monitoring of backend worker processes, connection pools, query runtimes, and lock events.
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Auto Refresh Selector */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-muted/50 border border-border text-xs">
            <Clock className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="text-muted-foreground text-[11px]">Auto:</span>
            <select
              value={autoRefreshInterval}
              onChange={(e) => setAutoRefreshInterval(Number(e.target.value))}
              className="bg-transparent text-xs font-mono font-bold text-foreground focus:outline-none cursor-pointer"
            >
              <option value={0}>Off</option>
              <option value={3}>3s</option>
              <option value={5}>5s</option>
              <option value={10}>10s</option>
            </select>
          </div>

          <button
            type="button"
            onClick={() => void loadActivity()}
            disabled={loadingActivity}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={clsx('w-3.5 h-3.5', loadingActivity && 'animate-spin')} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Badges */}
      <div className="px-6 py-3 border-b border-border bg-muted/20 flex flex-wrap items-center justify-between gap-4 shrink-0">
        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-muted-foreground">Active Sessions:</span>
            <span className="font-bold text-foreground">{activeCount}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            <span className="text-muted-foreground">Idle Connections:</span>
            <span className="font-bold text-foreground">{idleCount}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-indigo-500" />
            <span className="text-muted-foreground">Total Backends:</span>
            <span className="font-bold text-foreground">{activity.length}</span>
          </div>
        </div>

        <div className="relative w-72">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-2 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by PID, query, client..."
            className="w-full pl-8 pr-3 py-1 text-xs rounded-xl bg-background border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
      </div>

      {/* Main Activity Table */}
      <div className="flex-1 overflow-auto p-4">
        <div className="rounded-2xl border border-border overflow-hidden bg-card shadow-xs">
          <table className="w-full text-left text-xs">
            <thead className="bg-muted/50 text-muted-foreground border-b border-border font-mono text-[10px] uppercase">
              <tr>
                <th className="py-3 px-4">PID</th>
                <th className="py-3 px-4">Application</th>
                <th className="py-3 px-4">Client Address</th>
                <th className="py-3 px-4">State</th>
                <th className="py-3 px-4">Wait Event</th>
                <th className="py-3 px-4">Runtime</th>
                <th className="py-3 px-4">Current Query</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60 font-mono text-[11px]">
              {filtered.map((item) => {
                const isActive = item.state === 'active';
                const isIdleTx = item.state.includes('transaction');

                return (
                  <tr key={item.pid} className="hover:bg-muted/30 transition-colors">
                    <td className="py-3 px-4 font-bold text-foreground">{item.pid}</td>
                    <td className="py-3 px-4">
                      <div className="font-sans font-semibold text-foreground">{item.application_name}</div>
                      <div className="text-[10px] text-muted-foreground">db: {item.datname}</div>
                    </td>
                    <td className="py-3 px-4 text-muted-foreground">{item.client_addr}</td>
                    <td className="py-3 px-4">
                      <span
                        className={clsx(
                          'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase',
                          isActive
                            ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                            : isIdleTx
                            ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                            : 'bg-muted text-muted-foreground border border-border',
                        )}
                      >
                        <span
                          className={clsx(
                            'w-1.5 h-1.5 rounded-full',
                            isActive ? 'bg-emerald-500' : isIdleTx ? 'bg-amber-500' : 'bg-muted-foreground',
                          )}
                        />
                        {item.state}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-muted-foreground">
                        {item.wait_event !== 'None' ? `${item.wait_event_type}:${item.wait_event}` : 'None'}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-semibold text-foreground">
                      {item.duration_ms}ms
                    </td>
                    <td className="py-3 px-4 max-w-md truncate text-foreground font-mono">
                      <span className="text-primary/90">{item.query}</span>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-xs text-muted-foreground">
                    No active queries or connections match the filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
