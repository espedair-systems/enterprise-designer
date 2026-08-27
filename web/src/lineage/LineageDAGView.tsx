import React, { useState } from 'react';
import {
  GitBranch,
  Layers,
  ArrowRight,
  AlertTriangle,
  Database,
  CheckCircle2,
  Table,
  Zap,
  Activity,
} from 'lucide-react';

interface LineageNode {
  id: string;
  name: string;
  layer: 'source' | 'staging' | 'mart' | 'analytics';
  schema: string;
  columns: string[];
  downstream: string[];
}

const LINEAGE_NODES: LineageNode[] = [
  {
    id: 'src_apps',
    name: 'raw_designer_apps',
    layer: 'source',
    schema: 'DES_BASE',
    columns: ['id', 'name', 'slug', 'app_type', 'created_at'],
    downstream: ['stg_apps'],
  },
  {
    id: 'src_layouts',
    name: 'raw_designer_layouts',
    layer: 'source',
    schema: 'DES_BASE',
    columns: ['id', 'app_id', 'theme', 'slots_json'],
    downstream: ['stg_layouts'],
  },
  {
    id: 'stg_apps',
    name: 'stg_applications_clean',
    layer: 'staging',
    schema: 'DES_BASE',
    columns: ['app_id', 'app_title', 'slug_norm', 'is_studio'],
    downstream: ['fct_designer_apps_mart'],
  },
  {
    id: 'stg_layouts',
    name: 'stg_layouts_parsed',
    layer: 'staging',
    schema: 'DES_BASE',
    columns: ['layout_id', 'app_id', 'active_theme', 'widget_count'],
    downstream: ['fct_designer_apps_mart'],
  },
  {
    id: 'fct_designer_apps_mart',
    name: 'fct_apps_workbench',
    layer: 'mart',
    schema: 'DES_BASE',
    columns: ['app_id', 'app_title', 'widget_count', 'theme', 'status'],
    downstream: ['view_exec_telemetry'],
  },
  {
    id: 'view_exec_telemetry',
    name: 'view_executive_summary',
    layer: 'analytics',
    schema: 'DES_BASE',
    columns: ['total_studios', 'total_agents', 'uptime_pct'],
    downstream: [],
  },
];

export const LineageDAGView: React.FC = () => {
  const [selectedNodeId, setSelectedNodeId] = useState<string>('src_apps');
  const [blastRadiusActive, setBlastRadiusActive] = useState<boolean>(true);

  const selectedNode = LINEAGE_NODES.find((n) => n.id === selectedNodeId);

  // Compute blast radius downstream nodes
  const computeDownstream = (startId: string): string[] => {
    const visited = new Set<string>();
    const queue = [startId];
    while (queue.length > 0) {
      const curr = queue.shift()!;
      const node = LINEAGE_NODES.find((n) => n.id === curr);
      if (node) {
        for (const down of node.downstream) {
          if (!visited.has(down)) {
            visited.add(down);
            queue.push(down);
          }
        }
      }
    }
    return Array.from(visited);
  };

  const downstreamIds = selectedNode ? computeDownstream(selectedNode.id) : [];

  return (
    <div className="flex flex-col h-full bg-background text-foreground overflow-hidden relative">
      {/* Header */}
      <div className="p-3 bg-card border-b border-border flex items-center justify-between z-10 backdrop-blur-md shadow-xs">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <GitBranch className="w-5 h-5 text-primary" />
            <h3 className="text-sm font-bold text-foreground">EA Column-Level Lineage (CLL) DAG</h3>
          </div>
          <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20 font-bold">
            Automated Blast Radius Analyzer
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setBlastRadiusActive(!blastRadiusActive)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
              blastRadiusActive
                ? 'bg-rose-500/10 border-rose-500 text-rose-500 shadow-xs'
                : 'bg-muted border-border text-muted-foreground hover:text-foreground'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Blast Radius Analysis: {blastRadiusActive ? 'ACTIVE' : 'OFF'}</span>
          </button>
        </div>
      </div>

      {/* DAG Viewport */}
      <div className="flex-1 overflow-auto p-6 flex items-center justify-between gap-8 min-w-[1100px] relative bg-background bg-[radial-gradient(hsl(var(--border))_1px,transparent_1px)] [background-size:20px_20px]">
        {/* Layer 1: Sources */}
        <div className="flex flex-col gap-4 w-64">
          <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider">1. Ingestion Sources</div>
          {LINEAGE_NODES.filter((n) => n.layer === 'source').map((node) => {
            const isSelected = selectedNodeId === node.id;
            const isImpacted = blastRadiusActive && downstreamIds.includes(node.id);
            return (
              <div
                key={node.id}
                onClick={() => setSelectedNodeId(node.id)}
                className={`p-3 rounded-xl border cursor-pointer transition-all shadow-md ${
                  isSelected
                    ? 'ring-2 ring-primary bg-card border-primary'
                    : isImpacted
                    ? 'ring-2 ring-rose-500/80 bg-rose-500/10 border-rose-500'
                    : 'bg-card border-border hover:border-primary/50'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-xs text-amber-500">{node.name}</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-muted font-mono text-muted-foreground">SRC</span>
                </div>
                <div className="space-y-1 text-[11px] font-mono text-foreground">
                  {node.columns.map((col) => (
                    <div key={col} className="p-1 bg-muted/40 rounded flex items-center justify-between">
                      <span>{col}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        <ArrowRight className="w-6 h-6 text-muted-foreground/40 shrink-0" />

        {/* Layer 2: Staging */}
        <div className="flex flex-col gap-4 w-64">
          <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider">2. Staging Layer</div>
          {LINEAGE_NODES.filter((n) => n.layer === 'staging').map((node) => {
            const isSelected = selectedNodeId === node.id;
            const isImpacted = blastRadiusActive && downstreamIds.includes(node.id);
            return (
              <div
                key={node.id}
                onClick={() => setSelectedNodeId(node.id)}
                className={`p-3 rounded-xl border cursor-pointer transition-all shadow-md ${
                  isSelected
                    ? 'ring-2 ring-primary bg-card border-primary'
                    : isImpacted
                    ? 'ring-2 ring-rose-500/80 bg-rose-500/10 border-rose-500'
                    : 'bg-card border-border hover:border-primary/50'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-xs text-blue-500">{node.name}</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-muted font-mono text-muted-foreground">STG</span>
                </div>
                <div className="space-y-1 text-[11px] font-mono text-foreground">
                  {node.columns.map((col) => (
                    <div key={col} className="p-1 bg-muted/40 rounded flex items-center justify-between">
                      <span>{col}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        <ArrowRight className="w-6 h-6 text-muted-foreground/40 shrink-0" />

        {/* Layer 3: Analytics Marts */}
        <div className="flex flex-col gap-4 w-64">
          <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider">3. Business Marts</div>
          {LINEAGE_NODES.filter((n) => n.layer === 'mart').map((node) => {
            const isSelected = selectedNodeId === node.id;
            const isImpacted = blastRadiusActive && downstreamIds.includes(node.id);
            return (
              <div
                key={node.id}
                onClick={() => setSelectedNodeId(node.id)}
                className={`p-3 rounded-xl border cursor-pointer transition-all shadow-md ${
                  isSelected
                    ? 'ring-2 ring-primary bg-card border-primary'
                    : isImpacted
                    ? 'ring-2 ring-rose-500/80 bg-rose-500/10 border-rose-500'
                    : 'bg-card border-border hover:border-primary/50'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-xs text-primary">{node.name}</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-muted font-mono text-muted-foreground">MART</span>
                </div>
                <div className="space-y-1 text-[11px] font-mono text-foreground">
                  {node.columns.map((col) => (
                    <div key={col} className="p-1 bg-muted/40 rounded flex items-center justify-between">
                      <span>{col}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        <ArrowRight className="w-6 h-6 text-muted-foreground/40 shrink-0" />

        {/* Layer 4: Analytics Views */}
        <div className="flex flex-col gap-4 w-64">
          <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider">4. Analytics Views</div>
          {LINEAGE_NODES.filter((n) => n.layer === 'analytics').map((node) => {
            const isSelected = selectedNodeId === node.id;
            const isImpacted = blastRadiusActive && downstreamIds.includes(node.id);
            return (
              <div
                key={node.id}
                onClick={() => setSelectedNodeId(node.id)}
                className={`p-3 rounded-xl border cursor-pointer transition-all shadow-md ${
                  isSelected
                    ? 'ring-2 ring-primary bg-card border-primary'
                    : isImpacted
                    ? 'ring-2 ring-rose-500/80 bg-rose-500/10 border-rose-500'
                    : 'bg-card border-border hover:border-primary/50'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-xs text-emerald-500">{node.name}</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-muted font-mono text-muted-foreground">VIEW</span>
                </div>
                <div className="space-y-1 text-[11px] font-mono text-foreground">
                  {node.columns.map((col) => (
                    <div key={col} className="p-1 bg-muted/40 rounded flex items-center justify-between">
                      <span>{col}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom Blast Radius Impact Footer */}
      {selectedNode && (
        <div className="h-40 bg-card border-t border-border p-4 flex items-center justify-between z-20 shadow-lg">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] uppercase px-2 py-0.5 rounded bg-primary/10 text-primary font-mono font-bold">
                ROOT: {selectedNode.name}
              </span>
              <h4 className="text-xs font-bold text-foreground">Blast Radius Analyzer</h4>
            </div>
            <p className="text-xs text-muted-foreground">
              Modifying schema columns in <code className="text-primary font-mono font-bold">{selectedNode.name}</code> directly impacts{' '}
              <span className="text-rose-500 font-bold">{downstreamIds.length} downstream transformation nodes</span>.
            </p>
          </div>

          <div className="p-3 bg-muted/40 rounded-xl border border-border flex items-center gap-4">
            <div className="text-center">
              <span className="text-[10px] text-muted-foreground block">Impacted Nodes</span>
              <span className="text-base font-bold text-rose-500">{downstreamIds.length}</span>
            </div>
            <div className="w-px h-8 bg-border" />
            <div className="text-center">
              <span className="text-[10px] text-muted-foreground block">Propagation Depth</span>
              <span className="text-base font-bold text-primary">3 Tiers</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
