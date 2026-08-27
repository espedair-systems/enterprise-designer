import React, { useState } from 'react';
import { Table, BarChart3, Code, List, ChevronLeft, ChevronRight, Copy, Check } from 'lucide-react';
import { WidgetRenderProps } from '../types';

// 1. Data Table Widget
export const DataTableWidget: React.FC<WidgetRenderProps> = ({ id, title, props }) => {
  const [page, setPage] = useState<number>(1);
  const rowsPerPage = props.rowsPerPage || 5;

  const defaultData = [
    { id: '1', app_name: 'Fleet Logistics Studio', slug: 'fleet-logistics', type: 'studio', status: 'scaffolded', memory: '128 MB' },
    { id: '2', app_name: 'EA Governance Agent', slug: 'ea-governance-agent', type: 'agent', status: 'published', memory: '256 MB' },
    { id: '3', app_name: 'Data Modeler Studio', slug: 'data-modeler', type: 'datamodeler', status: 'scaffolded', memory: '96 MB' },
    { id: '4', app_name: 'Capability Tracker', slug: 'cap-tracker', type: 'studio', status: 'draft', memory: '64 MB' },
    { id: '5', app_name: 'Telemetry Aggregator', slug: 'telemetry-agg', type: 'agent', status: 'scaffolded', memory: '192 MB' },
    { id: '6', app_name: 'PostgreSQL Schema Migrator', slug: 'pg-migrator', type: 'datamodeler', status: 'published', memory: '80 MB' },
  ];

  const data = Array.isArray(props.data) && props.data.length > 0 ? props.data : defaultData;
  const totalPages = Math.ceil(data.length / rowsPerPage);
  const paginatedData = data.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  return (
    <div className="flex flex-col h-full bg-card border border-border rounded-xl overflow-hidden shadow-xs">
      {/* Header */}
      <div className="px-4 py-2.5 bg-muted/40 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Table className="w-4 h-4 text-primary" />
          <h4 className="text-xs font-bold text-foreground">{title || 'Data Table'}</h4>
        </div>
        <span className="text-[10px] font-mono bg-card px-2 py-0.5 rounded text-muted-foreground border border-border">
          {data.length} total rows
        </span>
      </div>

      {/* Table Content */}
      <div className="flex-1 overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead className="bg-muted/20 text-muted-foreground text-[11px] border-b border-border">
            <tr>
              <th className="p-2.5 font-semibold">Name</th>
              <th className="p-2.5 font-semibold">Slug</th>
              <th className="p-2.5 font-semibold">Type</th>
              <th className="p-2.5 font-semibold">Status</th>
              <th className="p-2.5 font-semibold">Memory</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border text-foreground">
            {paginatedData.map((row: any, idx: number) => (
              <tr key={row.id || idx} className="hover:bg-muted/30 transition-colors">
                <td className="p-2.5 font-medium text-foreground">{row.app_name || row.name || `Item ${idx + 1}`}</td>
                <td className="p-2.5 font-mono text-[11px] text-muted-foreground">{row.slug || '-'}</td>
                <td className="p-2.5">
                  <span className="px-2 py-0.5 rounded bg-primary/10 text-primary text-[10px] border border-primary/20 font-medium">
                    {row.type || 'standard'}
                  </span>
                </td>
                <td className="p-2.5">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                    row.status === 'published'
                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                      : row.status === 'scaffolded'
                      ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20'
                      : 'bg-muted text-muted-foreground border-border'
                  }`}>
                    {row.status || 'active'}
                  </span>
                </td>
                <td className="p-2.5 font-mono text-[11px] text-muted-foreground">{row.memory || '128 MB'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="px-4 py-2 bg-muted/30 border-t border-border flex items-center justify-between text-[11px] text-muted-foreground">
        <span>Page {page} of {totalPages || 1}</span>
        <div className="flex items-center gap-1">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="p-1 rounded bg-muted hover:bg-muted/80 disabled:opacity-30 text-foreground transition-colors"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            className="p-1 rounded bg-muted hover:bg-muted/80 disabled:opacity-30 text-foreground transition-colors"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

// 2. Metric / Stat Card Widget
export const MetricCardWidget: React.FC<WidgetRenderProps> = ({ title, props }) => {
  const metric = props.metric || '99.98%';
  const subtitle = props.subtitle || 'PostgreSQL Authoritative Persistence';
  const trend = props.trend || '+4.2%';
  const isPositive = !trend.startsWith('-');

  return (
    <div className="flex flex-col justify-between h-full bg-card border border-border rounded-xl p-4 shadow-xs">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-muted-foreground">{title || 'KPI Metric'}</span>
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
          isPositive ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20'
        }`}>
          {trend}
        </span>
      </div>

      <div className="my-2">
        <p className="text-3xl font-extrabold text-primary font-mono tracking-tight">{metric}</p>
        <p className="text-[11px] text-muted-foreground mt-1">{subtitle}</p>
      </div>

      <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
        <div className="h-full bg-gradient-to-r from-primary to-purple-500 rounded-full w-4/5" />
      </div>
    </div>
  );
};

// 3. JSON Tree Widget
export const JsonTreeWidget: React.FC<WidgetRenderProps> = ({ title, props }) => {
  const [copied, setCopied] = useState<boolean>(false);
  const jsonContent = props.data || {
    app_id: 'app-928fa',
    schema_namespace: 'DES_BASE',
    database_url: 'postgres://base:base_secret@localhost:5432/base',
    slots_active: ['rail', 'menu_bar', 'sidebar_left', 'sidebar_right', 'canvas', 'bottom_tray'],
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(JSON.stringify(jsonContent, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col h-full bg-card border border-border rounded-xl overflow-hidden shadow-xs font-mono">
      <div className="px-3 py-2 bg-muted/40 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Code className="w-4 h-4 text-emerald-500" />
          <span className="text-xs font-bold text-foreground">{title || 'JSON Tree'}</span>
        </div>
        <button
          type="button"
          onClick={copyToClipboard}
          className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground bg-muted px-2 py-0.5 rounded"
        >
          {copied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
          <span>{copied ? 'Copied' : 'Copy'}</span>
        </button>
      </div>

      <div className="flex-1 p-3 overflow-auto text-[11px] text-emerald-600 dark:text-emerald-400 bg-background">
        <pre>{JSON.stringify(jsonContent, null, 2)}</pre>
      </div>
    </div>
  );
};

// 4. Key-Value List Widget
export const KeyValueListWidget: React.FC<WidgetRenderProps> = ({ title, props }) => {
  const items = props.items || [
    { label: 'Application Name', value: 'Fleet Logistics Studio' },
    { label: 'Authoritative Store', value: 'PostgreSQL (DES_BASE)' },
    { label: 'Deployment Port', value: '8088' },
    { label: 'Scaffold Engine', value: 'enterprise-template' },
  ];

  return (
    <div className="flex flex-col h-full bg-card border border-border rounded-xl p-4 shadow-xs">
      <div className="flex items-center gap-2 pb-2 mb-3 border-b border-border">
        <List className="w-4 h-4 text-primary" />
        <h4 className="text-xs font-bold text-foreground">{title || 'Key-Value Properties'}</h4>
      </div>

      <div className="flex-1 overflow-auto space-y-2 text-xs">
        {items.map((item: any, idx: number) => (
          <div key={idx} className="flex items-center justify-between p-2 bg-muted/30 rounded-lg border border-border">
            <span className="text-muted-foreground text-[11px]">{item.label}</span>
            <span className="font-semibold text-foreground font-mono text-[11px]">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
