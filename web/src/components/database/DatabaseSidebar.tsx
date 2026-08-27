import React, { useMemo, useState, useEffect, useRef, useCallback } from 'react';
import {
  ChevronDown,
  ChevronRight,
  Database,
  Table2,
  Key,
  Search,
  Layers,
  Filter,
  Link2,
  Hash,
  Type,
  Calendar,
  Code,
  CheckCircle2,
  ChevronsUpDown,
  ChevronsDown,
  ChevronsUp
} from 'lucide-react';
import clsx from 'clsx';
import { useDatabaseStore } from '../../store/database';
import { DatabaseColumnInfo } from '../../services/database/design';

function getColumnTypeIcon(type: string, isPk: boolean, hasFk: boolean) {
  if (isPk) return <Key className="h-3 w-3 text-amber-500 shrink-0" />;
  if (hasFk) return <Link2 className="h-3 w-3 text-cyan-500 shrink-0" />;
  const t = type.toUpperCase();
  if (t.includes('INT') || t.includes('NUMERIC') || t.includes('SERIAL') || t.includes('FLOAT') || t.includes('DOUBLE')) {
    return <Hash className="h-3 w-3 text-indigo-400 shrink-0" />;
  }
  if (t.includes('TIME') || t.includes('DATE')) {
    return <Calendar className="h-3 w-3 text-emerald-400 shrink-0" />;
  }
  if (t.includes('JSON')) {
    return <Code className="h-3 w-3 text-purple-400 shrink-0" />;
  }
  return <Type className="h-3 w-3 text-muted-foreground shrink-0" />;
}

export function DatabaseSidebar() {
  const loading = useDatabaseStore((s) => s.loading);
  const loaded = useDatabaseStore((s) => s.loaded);
  const error = useDatabaseStore((s) => s.error);
  const model = useDatabaseStore((s) => s.model);
  const selectEntity = useDatabaseStore((s) => s.selectEntity);
  const setFocusedEntity = useDatabaseStore((s) => s.setFocusedEntity);
  const selectedEntityKey = useDatabaseStore((s) => s.selectedEntityKey);
  const selectedSchemaName = useDatabaseStore((s) => s.selectedSchemaName) || 'BT_BASE';
  const setSelectedSchemaName = useDatabaseStore((s) => s.setSelectedSchemaName);
  const load = useDatabaseStore((s) => s.load);
  const search = useDatabaseStore((s) => s.filterQuery);
  const setSearch = useDatabaseStore((s) => s.setFilterQuery);

  // Resize State
  const [sidebarWidth, setSidebarWidth] = useState<number>(310);
  const [isResizing, setIsResizing] = useState<boolean>(false);
  const sidebarRef = useRef<HTMLElement>(null);

  // Hierarchy expand/collapse state
  const [isSchemaExpanded, setIsSchemaExpanded] = useState<boolean>(true);
  const [openEntities, setOpenEntities] = useState<Set<string>>(new Set());
  const [selectedColumnKey, setSelectedColumnKey] = useState<string | null>(null);

  // Find the single active schema object
  const activeSchema = useMemo(() => {
    return model.schemas.find((s) => s.schemaName === selectedSchemaName) || model.schemas[0];
  }, [model.schemas, selectedSchemaName]);

  // Whenever selectedSchemaName changes, expand it and its first 3 tables by default
  useEffect(() => {
    setIsSchemaExpanded(true);
    if (activeSchema && activeSchema.entities.length > 0) {
      const initialOpen = new Set(
        activeSchema.entities.slice(0, 3).map((e) => `${activeSchema.schemaName}.${e.kind}.${e.name}`)
      );
      setOpenEntities(initialOpen);
    }
  }, [selectedSchemaName, activeSchema]);

  // Auto-expand tables when user types in search filter
  useEffect(() => {
    if (search.trim() && activeSchema) {
      const allOpen = new Set(activeSchema.entities.map((e) => `${activeSchema.schemaName}.${e.kind}.${e.name}`));
      setOpenEntities(allOpen);
    }
  }, [search, activeSchema]);

  // Handle Drag Resizing
  const startResizing = useCallback((mouseDownEvent: React.MouseEvent) => {
    mouseDownEvent.preventDefault();
    setIsResizing(true);
  }, []);

  useEffect(() => {
    const handleMouseMove = (mouseMoveEvent: MouseEvent) => {
      if (!isResizing) return;
      const newWidth = mouseMoveEvent.clientX;
      if (newWidth >= 240 && newWidth <= 640) {
        setSidebarWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isResizing]);

  // Filter entities in the selected schema based on search
  const filteredEntities = useMemo(() => {
    if (!activeSchema) return [];
    const term = search.trim().toLowerCase();
    if (!term) return activeSchema.entities;

    return activeSchema.entities.filter((entity) => {
      if (entity.name.toLowerCase().includes(term)) return true;
      return entity.columns.some((column) => column.name.toLowerCase().includes(term));
    });
  }, [activeSchema, search]);

  const totalColumnsInSchema = useMemo(() => {
    if (!activeSchema) return 0;
    return activeSchema.entities.reduce((acc, e) => acc + e.columns.length, 0);
  }, [activeSchema]);

  const areAllTablesExpanded = useMemo(() => {
    if (!activeSchema || activeSchema.entities.length === 0) return false;
    return activeSchema.entities.every((e) =>
      openEntities.has(`${activeSchema.schemaName}.${e.kind}.${e.name}`)
    );
  }, [activeSchema, openEntities]);

  const toggleExpandAllTables = () => {
    if (!activeSchema) return;
    if (areAllTablesExpanded) {
      setOpenEntities(new Set());
    } else {
      const all = new Set(activeSchema.entities.map((e) => `${activeSchema.schemaName}.${e.kind}.${e.name}`));
      setOpenEntities(all);
    }
  };

  return (
    <aside
      ref={sidebarRef}
      style={{ width: `${sidebarWidth}px` }}
      className="relative border-r border-border bg-card text-foreground flex flex-col h-full select-none shrink-0 transition-all ease-out duration-75"
    >
      {/* Header with Active Schema Selector */}
      <div className="p-3.5 border-b border-border bg-muted/20 space-y-2.5">
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
            <Database className="h-3.5 w-3.5 text-primary" />
            <span>Studio Schema</span>
          </h2>
          <span className="text-[9px] font-mono font-bold bg-primary/10 text-primary px-1.5 py-0.5 rounded border border-primary/20">
            {selectedSchemaName}
          </span>
        </div>

        {/* Schema Switcher Dropdown */}
        {model.schemas.length > 1 && (
          <div className="relative">
            <select
              value={selectedSchemaName}
              onChange={(e) => setSelectedSchemaName(e.target.value)}
              className="w-full text-xs font-mono font-bold px-2.5 py-1.5 rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer truncate shadow-2xs"
            >
              {model.schemas.map((s) => (
                <option key={s.schemaName} value={s.schemaName}>
                  Schema: {s.schemaName} ({s.entities.length} tables)
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Search filter */}
        <div className="relative">
          <Search className="h-3.5 w-3.5 absolute left-2.5 top-2 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search tables & columns..."
            className="w-full pl-8 pr-2.5 py-1 text-xs rounded-xl border border-border bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      {/* Drill-down Quick Actions Toolbar */}
      {activeSchema && (
        <div className="px-3.5 py-2 border-b border-border/70 bg-muted/10 flex items-center justify-between text-[11px] font-mono shrink-0">
          <div className="text-muted-foreground truncate">
            <strong className="text-foreground">{activeSchema.entities.length}</strong> tables • <strong className="text-foreground">{totalColumnsInSchema}</strong> cols
          </div>

          <button
            type="button"
            onClick={toggleExpandAllTables}
            className="flex items-center gap-1 text-[10px] font-sans font-semibold text-primary hover:text-primary/80 transition-colors cursor-pointer px-1.5 py-0.5 rounded hover:bg-muted"
            title={areAllTablesExpanded ? 'Collapse all tables' : 'Expand all tables to view all columns'}
          >
            {areAllTablesExpanded ? (
              <>
                <ChevronsUp className="w-3 h-3" />
                <span>Collapse All</span>
              </>
            ) : (
              <>
                <ChevronsDown className="w-3 h-3" />
                <span>Expand All</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* Hierarchy: Displays ONLY the Selected Schema and its Tables with Full Column Drilldown */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {loading && <p className="p-3 text-xs text-muted-foreground italic">Loading schema...</p>}
        {!loading && error && (
          <div className="p-3 space-y-2">
            <p className="text-xs text-destructive">{error}</p>
            <button
              type="button"
              onClick={() => void load()}
              className="px-2.5 py-1 text-xs border border-border rounded-xl bg-card hover:bg-muted text-foreground transition-colors cursor-pointer"
            >
              Retry
            </button>
          </div>
        )}

        {!loading && !error && loaded && activeSchema && (
          <div className="space-y-1">
            {/* Selected Schema Root Accordion Header */}
            <button
              type="button"
              onClick={() => setIsSchemaExpanded(!isSchemaExpanded)}
              className="flex w-full items-center gap-1.5 px-2.5 py-1.5 text-left text-xs font-bold rounded-xl transition-colors cursor-pointer bg-primary/10 text-primary border border-primary/20 shadow-2xs"
            >
              {isSchemaExpanded ? (
                <ChevronDown className="h-3.5 w-3.5 text-primary shrink-0 transition-transform" />
              ) : (
                <ChevronRight className="h-3.5 w-3.5 text-primary shrink-0 transition-transform" />
              )}
              <Database className="h-3.5 w-3.5 text-primary shrink-0" />
              <span className="truncate">{activeSchema.schemaName}</span>
              <span className="ml-auto text-[10px] text-primary/80 font-mono font-normal">
                {activeSchema.entities.length} tables
              </span>
            </button>

            {/* Expanded Table & Column Hierarchy */}
            {isSchemaExpanded && (
              <div className="space-y-1 pl-2.5 border-l border-border ml-3 mt-1">
                {filteredEntities.map((entity) => {
                  const tableKey = `${activeSchema.schemaName}.${entity.kind}.${entity.name}`;
                  const isEntitySelected = selectedEntityKey === tableKey;
                  const isOpen = openEntities.has(tableKey);

                  const pkCount = entity.columns.filter((c) => c.primaryKey).length;
                  const fkCount = entity.columns.filter((c) => c.foreignKey).length;

                  return (
                    <div key={entity.name} className="space-y-0.5">
                      {/* Table Item Row */}
                      <div
                        className={clsx(
                          'group flex items-center justify-between rounded-xl px-2 py-1.5 text-xs transition-colors cursor-pointer',
                          isEntitySelected
                            ? 'bg-primary/15 text-primary font-bold border border-primary/30 shadow-2xs'
                            : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground border border-transparent',
                        )}
                        onClick={() => {
                          selectEntity(activeSchema.schemaName, entity.kind, entity.name);
                        }}
                      >
                        <div className="flex items-center gap-1.5 min-w-0 flex-1 truncate">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenEntities((prev) => {
                                const next = new Set(prev);
                                if (next.has(tableKey)) next.delete(tableKey);
                                else next.add(tableKey);
                                return next;
                              });
                            }}
                            className="p-0.5 text-muted-foreground hover:text-foreground cursor-pointer shrink-0 transition-transform"
                            title={isOpen ? 'Collapse columns' : 'Expand columns'}
                          >
                            {isOpen ? (
                              <ChevronDown className="h-3.5 w-3.5 text-primary" />
                            ) : (
                              <ChevronRight className="h-3.5 w-3.5" />
                            )}
                          </button>

                          <Table2 className="h-3.5 w-3.5 shrink-0 text-primary/80 group-hover:text-primary" />
                          <span className="truncate font-semibold">{entity.name}</span>
                        </div>

                        {/* Table Badges */}
                        <div className="flex items-center gap-1 text-[10px] font-mono shrink-0">
                          {pkCount > 0 && (
                            <span className="px-1 py-0.2 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold" title="Primary Key defined">
                              PK
                            </span>
                          )}
                          {fkCount > 0 && (
                            <span className="px-1 py-0.2 rounded bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 font-bold" title={`${fkCount} Foreign Keys`}>
                              {fkCount}FK
                            </span>
                          )}
                          <span className="text-muted-foreground">
                            {entity.columns.length}
                          </span>
                        </div>
                      </div>

                      {/* Detailed Column Sub-items Drilldown */}
                      {isOpen && (
                        <div className="pl-3.5 py-0.5 space-y-0.5 border-l border-border/60 ml-2 animate-in fade-in duration-100">
                          {entity.columns.map((column) => {
                            const colKey = `${tableKey}.${column.name}`;
                            const isColSelected = selectedColumnKey === colKey;
                            const isPk = column.primaryKey;
                            const hasFk = Boolean(column.foreignKey);

                            return (
                              <div
                                key={column.name}
                                onClick={() => {
                                  setSelectedColumnKey(colKey);
                                  selectEntity(activeSchema.schemaName, entity.kind, entity.name);
                                }}
                                className={clsx(
                                  'group/col flex items-center justify-between text-[11px] px-2 py-1 rounded-lg transition-colors cursor-pointer font-mono',
                                  isColSelected
                                    ? 'bg-primary/20 text-primary font-bold border border-primary/40'
                                    : 'text-muted-foreground hover:bg-muted/40 hover:text-foreground',
                                )}
                                title={column.description || `${column.name} (${column.type})`}
                              >
                                <div className="flex items-center gap-1.5 min-w-0 flex-1 truncate">
                                  {getColumnTypeIcon(column.type, isPk, hasFk)}
                                  <span className={clsx('truncate', isPk && 'text-foreground font-bold')}>
                                    {column.name}
                                  </span>
                                  {hasFk && column.foreignKey && (
                                    <span className="text-[9px] text-cyan-600 dark:text-cyan-400 truncate opacity-80 font-normal">
                                      → {column.foreignKey.targetTable}
                                    </span>
                                  )}
                                </div>

                                <div className="flex items-center gap-1 shrink-0 text-[9px]">
                                  {isPk ? (
                                    <span className="px-1 py-0.2 rounded bg-amber-500/15 text-amber-600 dark:text-amber-400 font-bold">
                                      PK
                                    </span>
                                  ) : column.notNull ? (
                                    <span className="text-muted-foreground/60">REQ</span>
                                  ) : (
                                    <span className="text-muted-foreground/40">OPT</span>
                                  )}
                                  <span className="text-muted-foreground/80 font-normal truncate max-w-[80px]">
                                    {column.type}
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}

                {filteredEntities.length === 0 && (
                  <p className="p-2 text-xs text-muted-foreground italic">No matching tables or columns.</p>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Draggable Resizer Handle on Right Edge */}
      <div
        onMouseDown={startResizing}
        className={clsx(
          'absolute right-0 top-0 bottom-0 w-1.5 cursor-col-resize hover:bg-primary/60 transition-colors z-20 group flex items-center justify-center',
          isResizing && 'bg-primary w-2',
        )}
        title="Drag to resize sidebar width"
      >
        <div className="w-0.5 h-6 rounded-full bg-border group-hover:bg-primary opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
    </aside>
  );
}
