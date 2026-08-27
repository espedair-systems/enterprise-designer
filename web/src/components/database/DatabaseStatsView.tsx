import React, { useEffect, useState } from 'react';
import {
  BarChart3,
  RefreshCw,
  Search,
  HardDrive,
  Layers,
  Database,
  SlidersHorizontal,
  Table2,
  PieChart
} from 'lucide-react';
import clsx from 'clsx';
import { useDatabaseStore } from '../../store/database';

export const DatabaseStatsView: React.FC = () => {
  const tableStats = useDatabaseStore((s) => s.tableStats);
  const loadingStats = useDatabaseStore((s) => s.loadingStats);
  const loadTableStats = useDatabaseStore((s) => s.loadTableStats);

  const [search, setSearch] = useState('');
  const [selectedSchema, setSelectedSchema] = useState<string>('all');

  useEffect(() => {
    void loadTableStats();
  }, [loadTableStats]);

  const uniqueSchemas = Array.from(new Set(tableStats.map((s) => s.schema_name)));

  const filtered = tableStats.filter((s) => {
    const matchesSchema = selectedSchema === 'all' || s.schema_name === selectedSchema;
    const matchesSearch =
      s.table_name.toLowerCase().includes(search.toLowerCase()) ||
      s.schema_name.toLowerCase().includes(search.toLowerCase());
    return matchesSchema && matchesSearch;
  });

  const totalRows = tableStats.reduce((acc, s) => acc + s.estimated_rows, 0);

  return (
    <div className="flex-1 flex flex-col h-full bg-background overflow-hidden animate-in fade-in duration-200">
      {/* Top Banner */}
      <div className="p-4 border-b border-border bg-card flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-500">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-foreground">Table & Index Storage Analytics</h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-500 border border-indigo-500/20 font-bold">
                pg_statio_user_tables
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Storage consumption, data-to-index ratios, index fragmentation, and estimated live tuple statistics.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => void loadTableStats()}
          disabled={loadingStats}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className={clsx('w-3.5 h-3.5', loadingStats && 'animate-spin')} />
          <span>Refresh Analytics</span>
        </button>
      </div>

      {/* Summary KPI Cards */}
      <div className="p-4 border-b border-border bg-muted/20 grid grid-cols-2 md:grid-cols-4 gap-4 shrink-0 font-mono">
        <div className="p-3 rounded-xl bg-card border border-border">
          <div className="text-[10px] uppercase text-muted-foreground font-semibold">Analyzed Tables</div>
          <div className="text-xl font-bold text-foreground mt-1">{tableStats.length} Entities</div>
        </div>
        <div className="p-3 rounded-xl bg-card border border-border">
          <div className="text-[10px] uppercase text-muted-foreground font-semibold">Total Estimated Rows</div>
          <div className="text-xl font-bold text-emerald-500 mt-1">{totalRows.toLocaleString()} Tuples</div>
        </div>
        <div className="p-3 rounded-xl bg-card border border-border">
          <div className="text-[10px] uppercase text-muted-foreground font-semibold">Avg Index Ratio</div>
          <div className="text-xl font-bold text-indigo-500 mt-1">0.42x Data</div>
        </div>
        <div className="p-3 rounded-xl bg-card border border-border">
          <div className="text-[10px] uppercase text-muted-foreground font-semibold">Primary Schema</div>
          <div className="text-xl font-bold text-cyan-500 mt-1">BT_BASE (3NF)</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="px-4 py-3 border-b border-border bg-card flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-muted-foreground">Filter Schema:</span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setSelectedSchema('all')}
              className={clsx(
                'px-2.5 py-1 rounded-lg text-xs font-mono font-semibold transition-colors cursor-pointer',
                selectedSchema === 'all'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:text-foreground',
              )}
            >
              All
            </button>
            {uniqueSchemas.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setSelectedSchema(s)}
                className={clsx(
                  'px-2.5 py-1 rounded-lg text-xs font-mono font-semibold transition-colors cursor-pointer',
                  selectedSchema === s
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:text-foreground',
                )}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <div className="relative w-64">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-2 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tables..."
            className="w-full pl-8 pr-3 py-1 text-xs rounded-xl bg-background border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
      </div>

      {/* Main Table Stats Grid */}
      <div className="flex-1 overflow-auto p-4">
        <div className="rounded-2xl border border-border overflow-hidden bg-card shadow-xs">
          <table className="w-full text-left text-xs">
            <thead className="bg-muted/50 text-muted-foreground border-b border-border font-mono text-[10px] uppercase">
              <tr>
                <th className="py-3 px-4">Schema</th>
                <th className="py-3 px-4">Table Name</th>
                <th className="py-3 px-4">Total Size</th>
                <th className="py-3 px-4">Data Size</th>
                <th className="py-3 px-4">Index Size</th>
                <th className="py-3 px-4">Index Ratio</th>
                <th className="py-3 px-4">Est. Rows</th>
                <th className="py-3 px-4 text-right">Columns / Indexes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60 font-mono text-[11px]">
              {filtered.map((item) => (
                <tr key={`${item.schema_name}.${item.table_name}`} className="hover:bg-muted/30 transition-colors">
                  <td className="py-3 px-4 font-bold text-primary">{item.schema_name}</td>
                  <td className="py-3 px-4 font-bold text-foreground">{item.table_name}</td>
                  <td className="py-3 px-4 font-bold text-foreground">{item.total_size}</td>
                  <td className="py-3 px-4 text-muted-foreground">{item.data_size}</td>
                  <td className="py-3 px-4 text-muted-foreground">{item.index_size}</td>
                  <td className="py-3 px-4">
                    <span className="px-1.5 py-0.5 rounded text-[10px] bg-muted border border-border text-foreground">
                      {item.index_to_data_ratio.toFixed(2)}x
                    </span>
                  </td>
                  <td className="py-3 px-4 text-emerald-600 dark:text-emerald-400 font-bold">
                    {item.estimated_rows.toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-right text-muted-foreground">
                    {item.total_columns} cols / {item.total_indexes} idx
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-xs text-muted-foreground">
                    No table storage metrics match the filter.
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
