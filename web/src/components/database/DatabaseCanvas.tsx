/**
 * PostgreSQL 3NF Metamodel Schema & Relational ERD Studio for Business Artist (BT_BASE).
 * Exactly matches Enterprise Artist with @xyflow/react interactive nodes, bezier edges,
 * 6 ribbon view modes, live SQL console, and domain filters.
 */

import React, { useEffect, useMemo, useState } from 'react';
import {
  Database,
  Eye,
  Key,
  Table2,
  X,
  Play,
  AlertTriangle,
  Layers,
  CheckCircle,
  Code,
  Copy,
  Check,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Filter,
  History,
  Bookmark,
  Zap,
  Clock,
  Sparkles,
  ChevronDown,
  ChevronRight,
  Terminal,
  Activity,
  BarChart3,
  Search,
} from 'lucide-react';
import clsx from 'clsx';
import { useDatabaseStore } from '../../store/database';
import { MarkdownDescriptionEditor } from '../forms/MarkdownDescriptionEditor';
import {
  BaseEdge,
  Background,
  ConnectionMode,
  Controls,
  EdgeLabelRenderer,
  Handle,
  MarkerType,
  MiniMap,
  Position,
  ReactFlow,
  ReactFlowProvider,
  getBezierPath,
  type Edge,
  type EdgeProps,
  type Node,
  type NodeProps,
  useEdgesState,
  useNodesState,
  useReactFlow,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { DatabaseRibbon } from './DatabaseRibbon';
import { DatabaseSidebar } from './DatabaseSidebar';
import { DatabaseActivityView } from './DatabaseActivityView';
import { DatabaseStatsView } from './DatabaseStatsView';
import { executePostgresSql, DatabaseEntityInfo } from '../../services/database/design';

function EntityBadge({ kind }: { kind: 'table' | 'view' }) {
  return (
    <span
      className={clsx(
        'rounded-md px-1.5 py-0.5 text-[10px] uppercase font-bold tracking-wide border',
        kind === 'view'
          ? 'bg-purple-500/10 text-purple-500 border-purple-500/30'
          : 'bg-primary/10 text-primary border-primary/30',
      )}
    >
      {kind}
    </span>
  );
}

interface DatabaseEntityNodeData {
  entityName: string;
  schemaName: string;
  kind: 'table' | 'view';
  domain?: string;
  description: string;
  columns?: Array<{
    name: string;
    type: string;
    notNull: boolean;
    primaryKey: boolean;
    description: string;
  }>;
  [key: string]: unknown;
}

function DatabaseEntityNode({ data, selected }: NodeProps) {
  const { entityName, schemaName, kind, domain, description, columns = [] } =
    data as unknown as DatabaseEntityNodeData;
  const Icon = kind === 'view' ? Eye : Table2;
  const accentColor = domain?.includes('DBA') ? '#9333ea' : '#3b82f6';
  const handleClass =
    '!h-2.5 !w-2.5 !rounded-full !border-2 !border-background !bg-primary opacity-0 transition-opacity group-hover:opacity-100';

  return (
    <div
      className={clsx(
        'group relative flex min-w-[250px] max-w-[320px] flex-col rounded-2xl border bg-card text-foreground shadow-md transition-all',
        selected ? 'border-primary ring-2 ring-primary/40 shadow-lg' : 'border-border hover:border-primary/50',
      )}
      style={{ borderTopColor: accentColor, borderTopWidth: 4 }}
    >
      {/* Bidirectional Handles on all 4 sides */}
      <Handle id="top-target" type="target" position={Position.Top} className={handleClass} />
      <Handle id="top-source" type="source" position={Position.Top} className={handleClass} />
      <Handle id="right-target" type="target" position={Position.Right} className={handleClass} />
      <Handle id="right-source" type="source" position={Position.Right} className={handleClass} />
      <Handle id="bottom-target" type="target" position={Position.Bottom} className={handleClass} />
      <Handle id="bottom-source" type="source" position={Position.Bottom} className={handleClass} />
      <Handle id="left-target" type="target" position={Position.Left} className={handleClass} />
      <Handle id="left-source" type="source" position={Position.Left} className={handleClass} />

      {/* Table Header */}
      <div className="flex items-center gap-2 border-b border-border bg-muted/30 px-3.5 py-2.5 rounded-t-xl">
        <Icon className="h-4 w-4 shrink-0" style={{ color: accentColor }} />
        <div className="min-w-0 flex-1">
          <div className="truncate font-bold text-xs text-foreground">{entityName}</div>
          <div className="text-[10px] text-muted-foreground font-mono">{schemaName}</div>
        </div>
        <EntityBadge kind={kind} />
      </div>

      {/* Description */}
      {description && (
        <div className="border-b border-border px-3.5 py-1.5 text-[11px] italic text-muted-foreground line-clamp-2">
          {description}
        </div>
      )}

      {/* Columns */}
      {columns.length > 0 && (
        <div className="max-h-60 overflow-y-auto divide-y divide-border/40 p-1">
          {columns.map((col) => (
            <div
              key={col.name}
              className="flex items-center justify-between px-2 py-1 text-xs hover:bg-muted/40 rounded-lg transition-colors font-mono"
              title={`${col.name} ${col.type ? `(${col.type})` : ''}`}
            >
              <div className="flex items-center gap-1.5 min-w-0 flex-1 truncate">
                {col.primaryKey ? (
                  <Key className="h-3 w-3 text-amber-500 shrink-0" />
                ) : (
                  <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40 shrink-0 ml-1" />
                )}
                <span className={clsx('truncate', col.primaryKey ? 'font-semibold text-foreground' : 'text-muted-foreground')}>
                  {col.name}
                </span>
              </div>
              <span className="ml-2 font-mono text-[10px] text-muted-foreground shrink-0">{col.type || 'TEXT'}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function DatabaseRelationshipEdge(props: EdgeProps) {
  const { id, sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, data, selected, markerEnd } = props;
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const label = (data as { label?: string } | undefined)?.label;

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        markerEnd={markerEnd}
        style={{
          stroke: selected ? '#38bdf8' : '#3b82f6',
          strokeWidth: selected ? 2.5 : 2,
          strokeOpacity: selected ? 1 : 0.85,
        }}
      />
      {label && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              pointerEvents: 'all',
            }}
            className={clsx(
              'rounded-md px-2 py-0.5 text-[10px] font-mono font-bold shadow-md border transition-all select-none',
              selected
                ? 'bg-primary text-primary-foreground border-primary ring-2 ring-primary/30'
                : 'bg-card text-foreground border-blue-500/40 hover:border-blue-500',
            )}
          >
            {label}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
}

function AutoFitVisibleGraph({ fitToken }: { fitToken: string }) {
  const { fitView } = useReactFlow();
  useEffect(() => {
    const timer = setTimeout(() => {
      void fitView({ padding: 0.2, duration: 400 });
    }, 50);
    return () => clearTimeout(timer);
  }, [fitToken, fitView]);
  return null;
}

export function DatabaseCanvas() {
  const state = useDatabaseStore();
  const { viewMode, load, loaded, loading } = state;

  useEffect(() => {
    if (!loaded && !loading) {
      void load();
    }
  }, [loaded, loading, load]);

  return (
    <div className="flex h-full w-full bg-background text-foreground overflow-hidden">
      {/* Left Database Schema Hierarchy Sidebar */}
      <DatabaseSidebar />

      {/* Main Canvas Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <DatabaseRibbon />

        <div className="flex-1 overflow-hidden relative">
          {viewMode === 'erd' && <DatabaseErdView />}
          {viewMode === 'schema' && <DatabaseSchemaView />}
          {viewMode === 'table' && <DatabaseTableView />}
          {viewMode === 'column' && <DatabaseColumnView />}
          {viewMode === 'relationship' && <DatabaseRelationshipView />}
          {viewMode === 'editor' && <DatabaseSqlConsoleView />}
          {viewMode === 'activity' && <DatabaseActivityView />}
          {viewMode === 'stats' && <DatabaseStatsView />}
        </div>
      </div>
    </div>
  );
}

function DatabaseErdView() {
  const state = useDatabaseStore();
  const {
    model,
    focusedEntityKey,
    setFocusedEntity,
    clearFocusedEntity,
    selectEntity,
    selectedDomain,
    setSelectedDomain,
    setViewMode,
  } = state;

  const [modalEntity, setModalEntity] = useState<DatabaseEntityInfo | null>(null);
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    type: 'node' | 'pane';
    entity?: DatabaseEntityInfo;
  } | null>(null);
  const [copiedMessage, setCopiedMessage] = useState<string | null>(null);

  // Close context menu on outside click or escape
  useEffect(() => {
    const handleClick = () => setContextMenu(null);
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setContextMenu(null);
    };
    window.addEventListener('click', handleClick);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('click', handleClick);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const focusInfo = useMemo(() => {
    if (!focusedEntityKey) return null;
    const parts = focusedEntityKey.split('.');
    if (parts.length < 3) return null;
    return {
      schemaName: parts[0],
      kind: parts[1] as 'table' | 'view',
      entityName: parts.slice(2).join('.'),
    };
  }, [focusedEntityKey]);

  // Collect available domains
  const domains = useMemo(() => {
    const set = new Set<string>();
    model.schemas.forEach((s) => {
      s.entities.forEach((e) => {
        if (e.domain) set.add(e.domain);
      });
    });
    return ['all', ...Array.from(set)];
  }, [model.schemas]);

  // Derive Nodes & Layout
  const derivedNodes = useMemo(() => {
    let allEntities = model.schemas.flatMap((s) => s.entities);
    if (selectedDomain !== 'all') {
      allEntities = allEntities.filter((e) => e.domain === selectedDomain);
    }

    const visibleEntities = focusInfo
      ? allEntities.filter((e) => {
          if (e.name === focusInfo.entityName) return true;
          return model.relationships.some(
            (r) =>
              (r.sourceEntity === focusInfo.entityName && r.targetEntity === e.name) ||
              (r.targetEntity === focusInfo.entityName && r.sourceEntity === e.name),
          );
        })
      : allEntities;

    const cols = Math.max(1, Math.ceil(Math.sqrt(visibleEntities.length)));
    return visibleEntities.map((entity, idx) => {
      const col = idx % cols;
      const row = Math.floor(idx / cols);
      return {
        id: `node-${entity.name}`,
        type: 'database-entity',
        position: { x: col * 360 + 60, y: row * 400 + 60 },
        data: {
          schemaName: entity.schemaName,
          entityName: entity.name,
          kind: entity.kind,
          domain: entity.domain,
          description: entity.description,
          columns: entity.columns,
        },
      } as Node;
    });
  }, [model, focusInfo, selectedDomain]);

  // Derive Edges
  const derivedEdges = useMemo(() => {
    const nodeIds = new Set(derivedNodes.map((n) => (n.data as any).entityName));
    return model.relationships
      .filter((r) => nodeIds.has(r.sourceEntity) && nodeIds.has(r.targetEntity))
      .map((r) => ({
        id: r.id,
        source: `node-${r.sourceEntity}`,
        target: `node-${r.targetEntity}`,
        type: 'database-relationship',
        animated: false,
        markerEnd: {
          type: MarkerType.ArrowClosed,
          width: 14,
          height: 14,
          color: '#3b82f6',
        },
        data: {
          label: r.cardinality || r.description || 'FK',
          sourceColumn: r.sourceColumn,
          targetColumn: r.targetColumn,
        },
      })) as Edge[];
  }, [model.relationships, derivedNodes]);

  const [nodes, setNodes, onNodesChange] = useNodesState(derivedNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(derivedEdges);

  useEffect(() => setNodes(derivedNodes), [derivedNodes, setNodes]);
  useEffect(() => setEdges(derivedEdges), [derivedEdges, setEdges]);

  const fitToken = useMemo(
    () => (focusInfo ? `focus:${focusInfo.entityName}:${derivedNodes.length}` : `all:${derivedNodes.length}`),
    [focusInfo, derivedNodes.length],
  );

  const handleCopyText = (text: string, msg: string) => {
    navigator.clipboard.writeText(text);
    setCopiedMessage(msg);
    setTimeout(() => setCopiedMessage(null), 2000);
    setContextMenu(null);
  };

  const generateEntityDdl = (entity: DatabaseEntityInfo) => {
    const cols = entity.columns.map((c) => {
      let def = `    ${c.name} ${c.type}`;
      if (c.primaryKey) def += ' PRIMARY KEY';
      else if (c.notNull) def += ' NOT NULL';
      return def;
    });
    return `CREATE TABLE IF NOT EXISTS "${entity.schemaName}".${entity.name} (\n${cols.join(',\n')}\n);`;
  };

  return (
    <div className="relative flex h-full w-full flex-col overflow-hidden bg-background text-foreground">
      {/* Header Bar */}
      <div className="flex items-center justify-between border-b border-border bg-card px-4 py-2.5 shadow-xs shrink-0">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xs font-bold uppercase tracking-wider text-foreground">PostgreSQL 3NF Metamodel Schema</h2>
            <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-primary/10 text-primary border border-primary/20">
              SCHEMA: {model.activeSchema || 'BT_BASE'}
            </span>
          </div>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            Interactive PostgreSQL Relational Graph. Right-click any table for context menu or double-click to inspect.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Domain Filter Dropdown */}
          <div className="flex items-center gap-2">
            <Filter className="h-3.5 w-3.5 text-muted-foreground" />
            <select
              value={selectedDomain}
              onChange={(e) => setSelectedDomain(e.target.value)}
              className="px-2.5 py-1 text-xs rounded-xl border border-border bg-background text-foreground font-medium outline-none cursor-pointer"
            >
              {domains.map((d) => (
                <option key={d} value={d}>
                  {d === 'all' ? `All Domains (${model.schemas.flatMap((s) => s.entities).length} Tables)` : d}
                </option>
              ))}
            </select>
          </div>

          {focusInfo && (
            <button
              type="button"
              className="flex items-center gap-1 px-3 py-1 rounded-xl text-xs font-semibold bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-colors cursor-pointer"
              onClick={clearFocusedEntity}
            >
              <X className="h-3.5 w-3.5" />
              Clear Focus ({focusInfo.entityName})
            </button>
          )}

          {copiedMessage && (
            <span className="px-2.5 py-1 rounded-xl text-xs font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 animate-in fade-in">
              {copiedMessage}
            </span>
          )}
        </div>
      </div>

      <div className="relative min-h-0 flex-1 h-full w-full">
        <ReactFlowProvider>
          <ReactFlow
            connectionMode={ConnectionMode.Loose}
            nodeTypes={{ 'database-entity': DatabaseEntityNode }}
            edgeTypes={{ 'database-relationship': DatabaseRelationshipEdge }}
            defaultEdgeOptions={{ type: 'database-relationship' }}
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onNodeClick={(_, node) => {
              const d = node.data as any;
              selectEntity(d.schemaName, d.kind, d.entityName);
              setContextMenu(null);
            }}
            onNodeDoubleClick={(_, node) => {
              const d = node.data as any;
              setFocusedEntity(d.schemaName, d.kind, d.entityName);
              const found = model.schemas.flatMap((s) => s.entities).find((e) => e.name === d.entityName);
              if (found) setModalEntity(found);
              setContextMenu(null);
            }}
            onNodeContextMenu={(event, node) => {
              event.preventDefault();
              event.stopPropagation();
              const d = node.data as any;
              const found = model.schemas.flatMap((s) => s.entities).find((e) => e.name === d.entityName);
              if (found) {
                selectEntity(found.schemaName, found.kind, found.name);
                setContextMenu({
                  x: event.clientX,
                  y: event.clientY,
                  type: 'node',
                  entity: found,
                });
              }
            }}
            onPaneContextMenu={(event) => {
              event.preventDefault();
              setContextMenu({
                x: event.clientX,
                y: event.clientY,
                type: 'pane',
              });
            }}
            onPaneClick={() => setContextMenu(null)}
            proOptions={{ hideAttribution: true }}
          >
            <Background gap={16} size={1} color="#64748b" />
            <MiniMap pannable zoomable />
            <Controls />
            <AutoFitVisibleGraph fitToken={fitToken} />
          </ReactFlow>
        </ReactFlowProvider>

        {/* Right-Click Context Menu */}
        {contextMenu && (
          <div
            style={{
              left: `${Math.min(contextMenu.x, window.innerWidth - 260)}px`,
              top: `${Math.min(contextMenu.y, window.innerHeight - 300)}px`,
            }}
            onClick={(e) => e.stopPropagation()}
            className="fixed z-50 w-60 rounded-2xl border border-border bg-card/95 p-1.5 shadow-2xl backdrop-blur-md animate-in fade-in zoom-in-95 duration-150 text-foreground"
          >
            {contextMenu.type === 'node' && contextMenu.entity ? (
              <div className="space-y-1">
                {/* Header */}
                <div className="px-2.5 py-1.5 border-b border-border mb-1">
                  <div className="flex items-center gap-1.5">
                    <Table2 className="h-3.5 w-3.5 text-primary" />
                    <span className="text-xs font-mono font-bold truncate">{contextMenu.entity.name}</span>
                  </div>
                  <span className="text-[10px] text-muted-foreground font-mono">
                    {contextMenu.entity.schemaName} • {contextMenu.entity.domain || 'Metamodel'}
                  </span>
                </div>

                {/* Inspect Details */}
                <button
                  type="button"
                  onClick={() => {
                    if (contextMenu.entity) setModalEntity(contextMenu.entity);
                    setContextMenu(null);
                  }}
                  className="flex w-full items-center gap-2 px-2.5 py-1.5 text-xs font-medium text-foreground rounded-xl hover:bg-muted/80 transition-colors cursor-pointer"
                >
                  <Eye className="h-3.5 w-3.5 text-cyan-500" />
                  <span>Inspect Details & Columns</span>
                </button>

                {/* Focus / Isolate */}
                <button
                  type="button"
                  onClick={() => {
                    if (contextMenu.entity) {
                      setFocusedEntity(
                        contextMenu.entity.schemaName,
                        contextMenu.entity.kind,
                        contextMenu.entity.name,
                      );
                    }
                    setContextMenu(null);
                  }}
                  className="flex w-full items-center gap-2 px-2.5 py-1.5 text-xs font-medium text-foreground rounded-xl hover:bg-muted/80 transition-colors cursor-pointer"
                >
                  <Maximize2 className="h-3.5 w-3.5 text-primary" />
                  <span>Focus Table & Relations</span>
                </button>

                {/* Copy DDL */}
                <button
                  type="button"
                  onClick={() => {
                    if (contextMenu.entity) {
                      handleCopyText(generateEntityDdl(contextMenu.entity), `Copied DDL for ${contextMenu.entity.name}!`);
                    }
                  }}
                  className="flex w-full items-center gap-2 px-2.5 py-1.5 text-xs font-medium text-foreground rounded-xl hover:bg-muted/80 transition-colors cursor-pointer"
                >
                  <Code className="h-3.5 w-3.5 text-purple-500" />
                  <span>Copy Table DDL</span>
                </button>

                {/* Copy Table Name */}
                <button
                  type="button"
                  onClick={() => {
                    if (contextMenu.entity) {
                      handleCopyText(contextMenu.entity.name, `Copied table name!`);
                    }
                  }}
                  className="flex w-full items-center gap-2 px-2.5 py-1.5 text-xs font-medium text-foreground rounded-xl hover:bg-muted/80 transition-colors cursor-pointer"
                >
                  <Copy className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>Copy Table Name</span>
                </button>

                <div className="h-px bg-border my-1" />

                {/* View in Table Catalog */}
                <button
                  type="button"
                  onClick={() => {
                    setViewMode('table');
                    setContextMenu(null);
                  }}
                  className="flex w-full items-center gap-2 px-2.5 py-1.5 text-xs font-medium text-foreground rounded-xl hover:bg-muted/80 transition-colors cursor-pointer"
                >
                  <Table2 className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>View in Tables Catalog</span>
                </button>

                {/* Query in SQL Console */}
                <button
                  type="button"
                  onClick={() => {
                    setViewMode('editor');
                    setContextMenu(null);
                  }}
                  className="flex w-full items-center gap-2 px-2.5 py-1.5 text-xs font-medium text-foreground rounded-xl hover:bg-muted/80 transition-colors cursor-pointer"
                >
                  <Play className="h-3.5 w-3.5 text-emerald-500" />
                  <span>Query in SQL Console</span>
                </button>
              </div>
            ) : (
              <div className="space-y-1">
                <div className="px-2.5 py-1 text-[10px] uppercase font-bold text-muted-foreground border-b border-border mb-1">
                  Canvas Actions
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setSelectedDomain('all');
                    clearFocusedEntity();
                    setContextMenu(null);
                  }}
                  className="flex w-full items-center gap-2 px-2.5 py-1.5 text-xs font-medium text-foreground rounded-xl hover:bg-muted/80 transition-colors cursor-pointer"
                >
                  <Maximize2 className="h-3.5 w-3.5 text-primary" />
                  <span>Show All Domains ({model.schemas.flatMap((s) => s.entities).length} Tables)</span>
                </button>

                {focusInfo && (
                  <button
                    type="button"
                    onClick={() => {
                      clearFocusedEntity();
                      setContextMenu(null);
                    }}
                    className="flex w-full items-center gap-2 px-2.5 py-1.5 text-xs font-medium text-foreground rounded-xl hover:bg-muted/80 transition-colors cursor-pointer"
                  >
                    <X className="h-3.5 w-3.5 text-destructive" />
                    <span>Clear Focus Filter</span>
                  </button>
                )}

                <div className="h-px bg-border my-1" />

                <button
                  type="button"
                  onClick={() => {
                    setViewMode('schema');
                    setContextMenu(null);
                  }}
                  className="flex w-full items-center gap-2 px-2.5 py-1.5 text-xs font-medium text-foreground rounded-xl hover:bg-muted/80 transition-colors cursor-pointer"
                >
                  <Database className="h-3.5 w-3.5 text-primary" />
                  <span>Schema Overview</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setViewMode('editor');
                    setContextMenu(null);
                  }}
                  className="flex w-full items-center gap-2 px-2.5 py-1.5 text-xs font-medium text-foreground rounded-xl hover:bg-muted/80 transition-colors cursor-pointer"
                >
                  <Code className="h-3.5 w-3.5 text-purple-500" />
                  <span>Open SQL Console</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Centered Table Detail Modal */}
      {modalEntity && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-2xl bg-card border border-border rounded-2xl shadow-2xl p-6 space-y-4 animate-in zoom-in-95 duration-200 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-border pb-3 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-primary/10 text-primary">
                  <Table2 className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-mono font-bold text-foreground">{modalEntity.name}</h3>
                  <span className="text-xs text-muted-foreground">{modalEntity.domain || 'Domain'} ({modalEntity.schemaName})</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setModalEntity(null)}
                className="p-1 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed shrink-0">
              {modalEntity.description}
            </p>

            <div className="flex-1 overflow-y-auto rounded-xl border border-border">
              <table className="w-full text-left text-xs border-collapse font-mono">
                <thead>
                  <tr className="bg-muted/50 border-b border-border text-[10px] uppercase font-bold text-muted-foreground">
                    <th className="p-3">Column</th>
                    <th className="p-3">Type</th>
                    <th className="p-3">Key</th>
                    <th className="p-3">Null</th>
                    <th className="p-3 font-sans">Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border bg-card">
                  {modalEntity.columns.map((c) => (
                    <tr key={c.name} className="hover:bg-muted/20 transition-colors">
                      <td className="p-3 font-bold text-foreground">{c.name}</td>
                      <td className="p-3 text-primary">{c.type}</td>
                      <td className="p-3">
                        {c.primaryKey ? (
                          <span className="px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold text-[9px]">PK</span>
                        ) : (
                          '-'
                        )}
                      </td>
                      <td className="p-3 text-muted-foreground">{c.notNull ? 'NO' : 'YES'}</td>
                      <td className="p-3 font-sans text-muted-foreground text-[11px]">{c.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end pt-3 border-t border-border shrink-0">
              <button
                type="button"
                onClick={() => setModalEntity(null)}
                className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 cursor-pointer"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function DatabaseSchemaView() {
  const state = useDatabaseStore();
  const schema = state.model.schemas[0];

  return (
    <div className="p-6 h-full overflow-y-auto space-y-4 bg-background text-foreground">
      <div className="bg-card rounded-2xl border border-border p-6 shadow-xs">
        <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
          <Database className="h-5 w-5 text-primary" />
          Schema: {schema?.schemaName || 'BT_BASE'}
        </h2>
        <p className="text-xs text-muted-foreground mt-1">
          PostgreSQL 3NF relational schema backing all Enterprise Architecture models, taxonomies, and relationships.
        </p>

        <div className="mt-4">
          <label className="block text-xs font-semibold text-muted-foreground mb-1">Schema Description & Architecture Notes</label>
          <MarkdownDescriptionEditor
            value={schema?.description || ''}
            onChange={(val) => state.updateSchemaDescription(schema?.schemaName || 'BT_BASE', val)}
            placeholder="Add schema level notes, business rules, and 3NF normalization context..."
          />
        </div>
      </div>
    </div>
  );
}

function DatabaseTableView() {
  const state = useDatabaseStore();
  const entities = state.model.schemas.flatMap((s) => s.entities);

  return (
    <div className="p-6 h-full overflow-y-auto space-y-4 bg-background text-foreground">
      <div className="bg-card rounded-2xl border border-border p-6 shadow-xs">
        <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
          <Table2 className="h-5 w-5 text-primary" />
          Tables & Views ({entities.length})
        </h2>

        <div className="overflow-x-auto border border-border rounded-xl">
          <table className="min-w-full divide-y divide-border text-xs text-left">
            <thead className="bg-muted/40 text-muted-foreground uppercase font-semibold">
              <tr>
                <th className="px-4 py-2.5">Table Name</th>
                <th className="px-4 py-2.5">Kind</th>
                <th className="px-4 py-2.5">Domain</th>
                <th className="px-4 py-2.5">Columns</th>
                <th className="px-4 py-2.5">Primary Key</th>
                <th className="px-4 py-2.5">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border bg-card">
              {entities.map((e) => {
                const pkCol = e.columns.find((c) => c.primaryKey);
                return (
                  <tr key={e.name} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-2 font-mono font-semibold text-primary">{e.name}</td>
                    <td className="px-4 py-2"><EntityBadge kind={e.kind} /></td>
                    <td className="px-4 py-2 text-xs text-muted-foreground">{e.domain || '-'}</td>
                    <td className="px-4 py-2 text-foreground">{e.columns.length} columns</td>
                    <td className="px-4 py-2 font-mono text-muted-foreground">{pkCol?.name || '-'}</td>
                    <td className="px-4 py-2 text-muted-foreground">{e.description || '-'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function DatabaseColumnView() {
  const state = useDatabaseStore();
  const entities = state.model.schemas.flatMap((s) => s.entities);

  return (
    <div className="p-6 h-full overflow-y-auto space-y-4 bg-background text-foreground">
      <div className="bg-card rounded-2xl border border-border p-6 shadow-xs">
        <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
          <Layers className="h-5 w-5 text-primary" />
          Columns Catalog
        </h2>

        <div className="overflow-x-auto border border-border rounded-xl max-h-[70vh]">
          <table className="min-w-full divide-y divide-border text-xs text-left">
            <thead className="bg-muted/40 text-muted-foreground uppercase font-semibold sticky top-0">
              <tr>
                <th className="px-3 py-2">Table</th>
                <th className="px-3 py-2">Column</th>
                <th className="px-3 py-2">Type</th>
                <th className="px-3 py-2">PK</th>
                <th className="px-3 py-2">Not Null</th>
                <th className="px-3 py-2">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border bg-card">
              {entities.flatMap((e) =>
                e.columns.map((c) => (
                  <tr key={`${e.name}.${c.name}`} className="hover:bg-muted/30 transition-colors">
                    <td className="px-3 py-1.5 font-mono text-muted-foreground">{e.name}</td>
                    <td className="px-3 py-1.5 font-medium text-foreground">{c.name}</td>
                    <td className="px-3 py-1.5 font-mono text-muted-foreground">{c.type || 'TEXT'}</td>
                    <td className="px-3 py-1.5">{c.primaryKey ? <Key className="h-3 w-3 text-amber-500" /> : '-'}</td>
                    <td className="px-3 py-1.5 text-foreground">{c.notNull ? '✓' : '-'}</td>
                    <td className="px-3 py-1.5 text-muted-foreground">{c.description || '-'}</td>
                  </tr>
                )),
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function DatabaseRelationshipView() {
  const state = useDatabaseStore();
  const rels = state.model.relationships;

  return (
    <div className="p-6 h-full overflow-y-auto space-y-4 bg-background text-foreground">
      <div className="bg-card rounded-2xl border border-border p-6 shadow-xs">
        <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-emerald-500" />
          Relationships & Foreign Keys ({rels.length})
        </h2>

        <div className="overflow-x-auto border border-border rounded-xl">
          <table className="min-w-full divide-y divide-border text-xs text-left">
            <thead className="bg-muted/40 text-muted-foreground uppercase font-semibold">
              <tr>
                <th className="px-4 py-2.5">Source Table</th>
                <th className="px-4 py-2.5">Source Column</th>
                <th className="px-4 py-2.5">Target Table</th>
                <th className="px-4 py-2.5">Target Column</th>
                <th className="px-4 py-2.5">Cardinality</th>
                <th className="px-4 py-2.5">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border bg-card">
              {rels.map((r) => (
                <tr key={r.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-2 font-mono font-medium text-primary">{r.sourceEntity}</td>
                  <td className="px-4 py-2 font-mono text-muted-foreground">{r.sourceColumn}</td>
                  <td className="px-4 py-2 font-mono font-medium text-purple-500">{r.targetEntity}</td>
                  <td className="px-4 py-2 font-mono text-muted-foreground">{r.targetColumn}</td>
                  <td className="px-4 py-2 font-semibold text-foreground">{r.cardinality}</td>
                  <td className="px-4 py-2 text-muted-foreground">{r.description || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function DatabaseSqlConsoleView() {
  const queryHistory = useDatabaseStore((s) => s.queryHistory);
  const addHistoryItem = useDatabaseStore((s) => s.addHistoryItem);
  const bookmarks = useDatabaseStore((s) => s.bookmarks);
  const explainResult = useDatabaseStore((s) => s.explainResult);
  const loadingExplain = useDatabaseStore((s) => s.loadingExplain);
  const runExplain = useDatabaseStore((s) => s.runExplain);
  const clearExplainResult = useDatabaseStore((s) => s.clearExplainResult);

  const [sqlQuery, setSqlQuery] = useState<string>(
    'SELECT id, code, name, pace_layer, strategic_importance, current_maturity FROM "BT_BASE".capabilities LIMIT 25;',
  );
  const [queryResult, setQueryResult] = useState<{ columns: string[]; rows: any[]; error?: string } | null>(null);
  const [queryExecutionTime, setQueryExecutionTime] = useState<number | null>(null);
  const [executing, setExecuting] = useState(false);
  const [copiedDdl, setCopiedDdl] = useState(false);
  const [activeConsoleTab, setActiveConsoleTab] = useState<'results' | 'explain' | 'history' | 'bookmarks'>('results');
  const [showRawExplain, setShowRawExplain] = useState(false);
  const [historySearch, setHistorySearch] = useState('');

  const handleRunSql = async () => {
    if (!sqlQuery.trim()) return;
    setExecuting(true);
    clearExplainResult();
    setActiveConsoleTab('results');
    try {
      const result = await executePostgresSql(sqlQuery);
      setQueryResult(result);
      const execTime = result.executionTimeMs || 12;
      setQueryExecutionTime(execTime);
      addHistoryItem({
        query: sqlQuery,
        durationMs: execTime,
        rowsCount: result.rows?.length || 0,
        status: result.error ? 'ERROR' : 'SUCCESS',
        error: result.error,
      });
    } catch (err: any) {
      addHistoryItem({
        query: sqlQuery,
        durationMs: 0,
        rowsCount: 0,
        status: 'ERROR',
        error: String(err),
      });
    } finally {
      setExecuting(false);
    }
  };

  const handleExplain = async (analyze = false) => {
    if (!sqlQuery.trim()) return;
    setActiveConsoleTab('explain');
    try {
      await runExplain(sqlQuery, analyze);
    } catch {
      // Handled in store
    }
  };

  const sampleDdl = `-- PostgreSQL 3NF DDL for Schema "BT_BASE"
CREATE SCHEMA IF NOT EXISTS "BT_BASE";

CREATE TABLE IF NOT EXISTS "BT_BASE".capabilities (
    id VARCHAR(64) PRIMARY KEY,
    workspace_id VARCHAR(64) NOT NULL,
    code VARCHAR(32) NOT NULL,
    name VARCHAR(255) NOT NULL,
    level INTEGER NOT NULL,
    pace_layer VARCHAR(64) NOT NULL,
    strategic_importance VARCHAR(64) NOT NULL,
    current_maturity NUMERIC(3,1) NOT NULL,
    target_maturity NUMERIC(3,1) NOT NULL,
    investment_priority VARCHAR(32) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);`;

  const filteredHistory = queryHistory.filter((h) =>
    h.query.toLowerCase().includes(historySearch.toLowerCase()),
  );

  return (
    <div className="flex h-full flex-col p-6 space-y-4 bg-background text-foreground overflow-y-auto">
      {/* Editor Card */}
      <div className="bg-card rounded-2xl border border-border p-5 space-y-4 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Code className="h-5 w-5 text-primary" />
            <h2 className="text-sm font-bold text-foreground">PostgreSQL SQL Query & Explain Console</h2>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
              BT_BASE 3NF
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => {
                navigator.clipboard.writeText(sampleDdl);
                setCopiedDdl(true);
                setTimeout(() => setCopiedDdl(false), 2000);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border bg-card text-xs font-semibold hover:bg-muted text-foreground transition-colors cursor-pointer"
            >
              {copiedDdl ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
              <span>{copiedDdl ? 'Copied DDL' : 'Copy DDL'}</span>
            </button>

            {/* Explain Plan Button */}
            <button
              type="button"
              onClick={() => void handleExplain(false)}
              disabled={loadingExplain || executing}
              title="Shortcut: Cmd+E"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-indigo-500/30 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-xs font-semibold hover:bg-indigo-500/20 transition-colors cursor-pointer disabled:opacity-50"
            >
              <Zap className={clsx('h-3.5 w-3.5', loadingExplain && 'animate-spin')} />
              <span>Explain Plan</span>
            </button>

            {/* Explain Analyze Button */}
            <button
              type="button"
              onClick={() => void handleExplain(true)}
              disabled={loadingExplain || executing}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-purple-500/30 bg-purple-500/10 text-purple-600 dark:text-purple-400 text-xs font-semibold hover:bg-purple-500/20 transition-colors cursor-pointer disabled:opacity-50"
            >
              <Sparkles className={clsx('h-3.5 w-3.5', loadingExplain && 'animate-spin')} />
              <span>Explain Analyze</span>
            </button>

            {/* Run Query Button */}
            <button
              type="button"
              onClick={handleRunSql}
              disabled={executing || loadingExplain}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-colors cursor-pointer disabled:opacity-50 shadow-xs"
            >
              <Play className="h-3.5 w-3.5 fill-current" />
              <span>{executing ? 'Executing...' : 'Run Query (Cmd+Enter)'}</span>
            </button>
          </div>
        </div>

        <textarea
          value={sqlQuery}
          onChange={(e) => setSqlQuery(e.target.value)}
          onKeyDown={(e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
              e.preventDefault();
              void handleRunSql();
            } else if ((e.metaKey || e.ctrlKey) && (e.key === 'e' || e.key === 'E')) {
              e.preventDefault();
              void handleExplain(false);
            }
          }}
          rows={5}
          className="w-full font-mono text-xs p-3 rounded-xl border border-border bg-background text-foreground placeholder-muted-foreground focus:ring-2 focus:ring-primary focus:outline-none"
          placeholder="Enter PostgreSQL query (e.g. SELECT * FROM &quot;BT_BASE&quot;.capabilities)..."
        />
      </div>

      {/* Tabs for Results, Explain Plan, History, and Bookmarks */}
      <div className="flex items-center gap-1 border-b border-border pb-1">
        <button
          type="button"
          onClick={() => setActiveConsoleTab('results')}
          className={clsx(
            'flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-t-xl transition-colors cursor-pointer border-b-2',
            activeConsoleTab === 'results'
              ? 'border-primary text-primary bg-card'
              : 'border-transparent text-muted-foreground hover:text-foreground',
          )}
        >
          <Table2 className="w-3.5 h-3.5" />
          <span>Results {queryResult?.rows ? `(${queryResult.rows.length})` : ''}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveConsoleTab('explain')}
          className={clsx(
            'flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-t-xl transition-colors cursor-pointer border-b-2',
            activeConsoleTab === 'explain'
              ? 'border-indigo-500 text-indigo-500 bg-card'
              : 'border-transparent text-muted-foreground hover:text-foreground',
          )}
        >
          <Zap className="w-3.5 h-3.5" />
          <span>Explain Plan {explainResult ? '✓' : ''}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveConsoleTab('history')}
          className={clsx(
            'flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-t-xl transition-colors cursor-pointer border-b-2',
            activeConsoleTab === 'history'
              ? 'border-primary text-primary bg-card'
              : 'border-transparent text-muted-foreground hover:text-foreground',
          )}
        >
          <History className="w-3.5 h-3.5" />
          <span>History ({queryHistory.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveConsoleTab('bookmarks')}
          className={clsx(
            'flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-t-xl transition-colors cursor-pointer border-b-2',
            activeConsoleTab === 'bookmarks'
              ? 'border-primary text-primary bg-card'
              : 'border-transparent text-muted-foreground hover:text-foreground',
          )}
        >
          <Bookmark className="w-3.5 h-3.5" />
          <span>Bookmarks ({bookmarks.length})</span>
        </button>
      </div>

      {/* 1. Results View */}
      {activeConsoleTab === 'results' && queryResult && (
        <div className="bg-card rounded-2xl border border-border p-5 space-y-3 shadow-xs animate-in fade-in duration-150">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-foreground">
              Query Results ({queryResult.rows?.length || 0} rows)
            </h3>
            {queryExecutionTime !== null && (
              <span className="text-[10px] font-mono text-muted-foreground">
                Execution time: <strong className="text-emerald-500">{queryExecutionTime} ms</strong>
              </span>
            )}
          </div>

          {queryResult.error ? (
            <div className="flex items-center gap-2 text-xs text-destructive bg-destructive/10 p-3 rounded-xl border border-destructive/20 font-mono">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              <span>{queryResult.error}</span>
            </div>
          ) : (
            <div className="overflow-x-auto border border-border rounded-xl max-h-80">
              <table className="min-w-full divide-y divide-border text-xs text-left font-mono">
                <thead className="bg-muted/40 text-muted-foreground uppercase font-semibold">
                  <tr>
                    {queryResult.columns?.map((col) => (
                      <th key={col} className="px-3 py-2">
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border bg-card">
                  {queryResult.rows?.map((row, idx) => (
                    <tr key={idx} className="hover:bg-muted/30 transition-colors">
                      {queryResult.columns?.map((col) => (
                        <td key={col} className="px-3 py-1.5 text-foreground truncate max-w-xs">
                          {typeof row[col] === 'object' ? JSON.stringify(row[col]) : String(row[col] ?? '')}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* 2. Explain Plan View */}
      {activeConsoleTab === 'explain' && explainResult && (
        <div className="bg-card rounded-2xl border border-border p-5 space-y-4 shadow-xs animate-in fade-in duration-150">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-3">
            <div>
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-indigo-500" />
                <h3 className="text-sm font-bold text-foreground">PostgreSQL Execution Plan</h3>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-500 border border-indigo-500/20">
                  {explainResult.plan_type}
                </span>
              </div>
              <div className="text-xs text-muted-foreground font-mono mt-0.5">
                Planning Time: <strong className="text-foreground">{explainResult.planning_time_ms} ms</strong> | Execution Time: <strong className="text-emerald-500">{explainResult.execution_time} ms</strong> | Est. Cost: <strong className="text-foreground">{explainResult.total_cost}</strong>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowRawExplain(!showRawExplain)}
              className="text-xs font-mono px-3 py-1 rounded-xl bg-muted border border-border text-foreground hover:bg-muted/80 cursor-pointer"
            >
              {showRawExplain ? 'Show Visual Tree' : 'Show Raw Output'}
            </button>
          </div>

          {showRawExplain ? (
            <pre className="p-4 rounded-xl bg-muted/40 border border-border font-mono text-xs text-foreground overflow-x-auto whitespace-pre-wrap">
              {explainResult.raw_output.join('\n')}
            </pre>
          ) : (
            <div className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 font-mono text-xs">
                {explainResult.plan_nodes.map((node, i) => (
                  <div
                    key={i}
                    className="p-4 rounded-xl bg-muted/30 border border-border space-y-2 hover:border-primary/40 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-indigo-500 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-indigo-500" />
                        {node.node_type}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-card border border-border text-muted-foreground">
                        Cost: {node.startup_cost}..{node.total_cost}
                      </span>
                    </div>

                    <div className="text-xs text-foreground font-semibold">
                      Target: <span className="font-mono text-primary">{node.schema ? `${node.schema}.${node.relation_name}` : node.relation_name}</span>
                      {node.index_name && <span className="text-muted-foreground text-[10px] block">Using index: {node.index_name}</span>}
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[10px] text-muted-foreground pt-1 border-t border-border/50">
                      <div>Plan Rows: <strong className="text-foreground">{node.plan_rows}</strong></div>
                      <div>Actual Rows: <strong className="text-emerald-500">{node.actual_rows ?? '-'}</strong></div>
                      <div>Actual Time: <strong className="text-foreground">{node.actual_startup ?? 0}..{node.actual_total ?? 0}ms</strong></div>
                      <div>Loops: <strong className="text-foreground">{node.actual_loops ?? 1}</strong></div>
                    </div>

                    {node.filter && (
                      <div className="text-[10px] text-muted-foreground bg-muted/50 p-1.5 rounded border border-border/50 truncate">
                        Filter: <span className="text-foreground">{node.filter}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 3. History View */}
      {activeConsoleTab === 'history' && (
        <div className="bg-card rounded-2xl border border-border p-5 space-y-3 shadow-xs animate-in fade-in duration-150">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-xs font-bold text-foreground flex items-center gap-2">
              <History className="w-4 h-4 text-primary" />
              Session Query History ({queryHistory.length})
            </h3>
            <div className="relative w-64">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-2 text-muted-foreground" />
              <input
                type="text"
                value={historySearch}
                onChange={(e) => setHistorySearch(e.target.value)}
                placeholder="Search history..."
                className="w-full pl-8 pr-3 py-1 text-xs rounded-xl bg-background border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>

          <div className="space-y-2">
            {filteredHistory.map((item) => (
              <div
                key={item.id}
                className="p-3 rounded-xl bg-muted/30 border border-border/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-primary/40 transition-colors"
              >
                <div className="space-y-1 min-w-0 flex-1">
                  <pre className="text-xs font-mono text-foreground truncate">{item.query}</pre>
                  <div className="flex items-center gap-2 text-[10px] font-mono text-muted-foreground">
                    <span
                      className={clsx(
                        'px-1.5 py-0.2 rounded font-bold',
                        item.status === 'SUCCESS'
                          ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                          : 'bg-destructive/10 text-destructive border border-destructive/20',
                      )}
                    >
                      {item.status}
                    </span>
                    <span>{new Date(item.timestamp).toLocaleTimeString()}</span>
                    <span>{item.durationMs}ms</span>
                    <span>{item.rowsCount} rows</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setSqlQuery(item.query);
                    setActiveConsoleTab('results');
                  }}
                  className="px-3 py-1 rounded-xl bg-primary/10 text-primary hover:bg-primary/20 text-xs font-semibold transition-colors cursor-pointer shrink-0"
                >
                  Load into Console
                </button>
              </div>
            ))}
            {filteredHistory.length === 0 && (
              <p className="text-xs text-muted-foreground py-4 text-center">No queries in history match.</p>
            )}
          </div>
        </div>
      )}

      {/* 4. Bookmarks View */}
      {activeConsoleTab === 'bookmarks' && (
        <div className="bg-card rounded-2xl border border-border p-5 space-y-4 shadow-xs animate-in fade-in duration-150">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-foreground flex items-center gap-2">
              <Bookmark className="w-4 h-4 text-primary" />
              Pre-Canned Architecture SQL Bookmarks ({bookmarks.length})
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {bookmarks.map((bm) => (
              <div
                key={bm.id}
                className="p-4 rounded-xl bg-muted/30 border border-border flex flex-col justify-between space-y-3 hover:border-primary/40 transition-colors"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-foreground">{bm.title}</span>
                    <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-muted text-muted-foreground border border-border">
                      {bm.category}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{bm.description}</p>
                </div>

                <pre className="p-2 rounded-lg bg-card border border-border font-mono text-[11px] text-primary/90 overflow-x-auto max-h-20 whitespace-pre-wrap">
                  {bm.query}
                </pre>

                <div className="flex justify-end pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setSqlQuery(bm.query);
                      setActiveConsoleTab('results');
                    }}
                    className="px-3 py-1.5 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-colors cursor-pointer"
                  >
                    Load into Console
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
