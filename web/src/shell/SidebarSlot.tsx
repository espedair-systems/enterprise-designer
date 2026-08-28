import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Folder,
  Layers,
  Database,
  GitBranch,
  Sliders,
  Link,
  ShieldCheck,
  Zap,
  ChevronRight,
  ChevronDown,
  Search,
  Plus,
  Table,
  FormInput,
  BarChart3,
  CreditCard,
  ToggleLeft,
  Calendar,
  CheckCircle2,
  FileCode,
  FileText,
  Terminal,
  Bot,
  Layout,
  Cpu,
  Share2,
  Sparkles,
  LayoutDashboard,
  Server,
  Activity,
  GripVertical,
  PanelLeftClose,
  PanelLeftOpen,
  Maximize2,
  RotateCcw,
} from 'lucide-react';
import { useLayout } from './LayoutContext';
import { ToolboxPanel } from '../toolbox/ToolboxPanel';
import { UMLToolboxPanel } from '../toolbox/UMLToolboxPanel';
import { QToolboxPanel } from '../toolbox/QToolboxPanel';
import { SchemaToolboxPanel } from '../toolbox/SchemaToolboxPanel';
import { OpenAPIToolboxPanel } from '../toolbox/OpenAPIToolboxPanel';
import { PropertyInspector } from '../inspector/PropertyInspector';
import { CanvasMode } from './types';

interface SidebarSlotProps {
  position: 'left' | 'right';
}

const DEFAULT_LEFT_WIDTH = 288;
const MIN_WIDTH = 220;
const MAX_WIDTH = 580;

export const SidebarSlot: React.FC<SidebarSlotProps> = ({ position }) => {
  const {
    slots,
    activeLeftPanel,
    setActiveLeftPanel,
    activeRightPanel,
    setActiveRightPanel,
    leftSidebarOpen,
    rightSidebarOpen,
    toggleLeftSidebar,
    selectedWidgetId,
    setSelectedWidgetId,
    canvasMode,
    setCanvasMode,
    currentApp,
    domainMode,
  } = useLayout();

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [width, setWidth] = useState<number>(() => {
    if (position === 'left') {
      const saved = localStorage.getItem('ed_sidebar_left_width');
      return saved ? Math.max(MIN_WIDTH, Math.min(MAX_WIDTH, parseInt(saved, 10))) : DEFAULT_LEFT_WIDTH;
    }
    const savedRight = localStorage.getItem('ed_sidebar_right_width');
    return savedRight ? Math.max(240, Math.min(600, parseInt(savedRight, 10))) : 300;
  });

  const [isResizing, setIsResizing] = useState(false);
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({
    ui_components: true,
    data_models: true,
    lineage_dag: true,
    sql_workspace: true,
    agents: true,
    stages: true,
  });

  const isOpen = position === 'left' ? leftSidebarOpen : rightSidebarOpen;
  const activePanel = position === 'left' ? activeLeftPanel : activeRightPanel;
  const setActivePanel = position === 'left' ? setActiveLeftPanel : setActiveRightPanel;
  const panels = position === 'left' ? slots.sidebar_left.panels : slots.sidebar_right.panels;

  const toggleNode = (node: string) => {
    setExpandedNodes((prev) => ({ ...prev, [node]: !prev[node] }));
  };

  const PANEL_TITLES: Record<string, string> = {
    dashboard_summary: 'Dashboard Overview',
    widget_toolbox: 'UI Component Toolbox',
    uml_toolbox: 'UML Use Case Toolkit',
    q_toolbox: 'Questionnaire Components',
    data_dictionary: 'Schema Catalog (DES_BASE)',
    lineage_stages: 'Lineage Stages',
    sql_catalog: 'SQL Workspaces',
    agent_library: 'Agent Library',
    model_tree: 'Project Explorer',
    datasource_catalog: 'Data Sources',
    properties_inspector: 'Inspector',
    data_bindings: 'Bindings',
    validation_rules: 'Validation',
    event_handlers: 'Events',
  };

  // Drag-to-resize splitter handlers (Left & Right Sidebar)
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  }, []);

  useEffect(() => {
    if (!isResizing) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (position === 'left') {
        const newWidth = Math.max(MIN_WIDTH, Math.min(MAX_WIDTH, e.clientX - 56));
        setWidth(newWidth);
      } else {
        const newWidth = Math.max(240, Math.min(600, window.innerWidth - e.clientX));
        setWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      if (position === 'left') {
        localStorage.setItem('ed_sidebar_left_width', width.toString());
      } else {
        localStorage.setItem('ed_sidebar_right_width', width.toString());
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing, width, position]);

  const isUMLCanvas =
    canvasMode === 'use_case' ||
    canvasMode === 'activity_diagram' ||
    canvasMode === 'state_machine' ||
    canvasMode === 'sequence_diagram' ||
    canvasMode === 'communication_diagram' ||
    canvasMode === 'interaction_overview_diagram' ||
    canvasMode === 'timing_diagram' ||
    canvasMode === 'class_diagram' ||
    canvasMode === 'object_diagram' ||
    canvasMode === 'component_diagram' ||
    canvasMode === 'deployment_diagram' ||
    canvasMode === 'package_diagram' ||
    canvasMode === 'composite_structure_diagram' ||
    canvasMode === 'profile_diagram';

  if (position === 'left' && (domainMode === 'dashboard' || (domainMode === 'projects' && !isUMLCanvas))) return null;

  if (!isOpen && position === 'left') {
    return (
      <div className="w-9 h-full bg-card/90 border-r border-border flex flex-col items-center py-3 z-10 shrink-0 select-none justify-between shadow-2xs backdrop-blur-md">
        <button
          type="button"
          onClick={toggleLeftSidebar}
          className="p-1.5 rounded-xl bg-muted/60 hover:bg-primary/10 text-muted-foreground hover:text-primary border border-border/80 hover:border-primary/40 transition-all cursor-pointer shadow-xs group"
          title={`Expand ${PANEL_TITLES[activePanel] || 'Tool Panel'}`}
        >
          <PanelLeftOpen className="w-4 h-4 group-hover:scale-110 transition-transform" />
        </button>

        <div
          onClick={toggleLeftSidebar}
          className="flex-1 flex items-center justify-center cursor-pointer my-4 py-2 hover:bg-muted/40 rounded-lg transition-colors w-full"
          title={`Click to expand ${PANEL_TITLES[activePanel] || 'Toolbox'}`}
        >
          <span
            className="text-[10px] font-bold text-muted-foreground hover:text-foreground tracking-widest uppercase whitespace-nowrap"
            style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
          >
            {PANEL_TITLES[activePanel] || 'TOOLBOX'}
          </span>
        </div>

        <div className="w-1.5 h-1.5 rounded-full bg-primary/40 mb-1" />
      </div>
    );
  }

  if (!isOpen) return null;

  return (
    <aside
      style={{ width: `${width}px` }}
      className={`bg-card border-${position === 'left' ? 'r' : 'l'} border-border flex flex-col select-none shrink-0 z-10 relative transition-[width] duration-75`}
      aria-label={`${position} sidebar slot`}
    >
      {/* ── Left Edge Draggable Splitter Handle (Right Sidebar) ── */}
      {position === 'right' && (
        <div
          onMouseDown={handleMouseDown}
          className={`absolute top-0 left-0 w-1.5 h-full cursor-col-resize hover:bg-primary/50 transition-colors z-30 ${
            isResizing ? 'bg-primary' : 'bg-transparent'
          }`}
          title="Drag to resize Inspector Panel (Double-click to reset)"
          onDoubleClick={() => setWidth(300)}
        />
      )}

      {/* ── Top Header / Panel Tab Strip ── */}
      <div className="flex items-center justify-between border-b border-border bg-muted/40 overflow-x-auto scrollbar-none px-2 py-1.5 shrink-0">
        <div className="flex items-center gap-1 overflow-x-auto scrollbar-none">
          <span className="text-xs font-bold text-foreground truncate">
            {PANEL_TITLES[activePanel] || activePanel}
          </span>
        </div>

        <div className="flex items-center gap-1 shrink-0 ml-1">
          <button
            type="button"
            onClick={() => setWidth(position === 'left' ? DEFAULT_LEFT_WIDTH : 300)}
            className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
            title={`Reset Width (${position === 'left' ? '288px' : '300px'})`}
          >
            <RotateCcw className="w-3 h-3" />
          </button>
          {position === 'left' && (
            <button
              type="button"
              onClick={toggleLeftSidebar}
              className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
              title="Collapse Left Tool Panel"
            >
              <PanelLeftClose className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* ── Filter / Search Bar ── */}
      <div className="p-2 border-b border-border bg-muted/20 shrink-0">
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={`Filter ${PANEL_TITLES[activePanel] || 'items'}...`}
            className="w-full bg-background border border-border rounded-lg px-2.5 py-1 pl-8 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary"
          />
        </div>
      </div>

      {/* ── Panel Body Content ── */}
      <div className="flex-1 overflow-y-auto p-3 text-xs text-foreground space-y-3">
        {/* 1. DASHBOARD SUMMARY PANEL */}
        {activePanel === 'dashboard_summary' && (
          <div className="space-y-3">
            <div className="p-3 bg-primary/10 border border-primary/20 rounded-xl space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-foreground">PostgreSQL Authoritative</span>
                <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-primary text-primary-foreground">
                  DES_BASE:8088
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground">
                All application layouts, metadata, and widgets persist directly into schema DES_BASE.
              </p>
            </div>

            <div className="space-y-1.5">
              <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider px-1">
                Studio Quick Actions
              </span>
              <button
                type="button"
                onClick={() => {
                  setCanvasMode('visual_canvas');
                  setActiveLeftPanel('widget_toolbox');
                }}
                className="w-full p-2 rounded-xl bg-card border border-border hover:border-primary/40 text-left transition-colors flex items-center justify-between cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Layout className="w-4 h-4 text-primary" />
                  <span className="font-semibold text-xs text-foreground">Open UI Designer</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
              </button>

              <button
                type="button"
                onClick={() => {
                  setCanvasMode('er_modeler');
                  setActiveLeftPanel('data_dictionary');
                }}
                className="w-full p-2 rounded-xl bg-card border border-border hover:border-primary/40 text-left transition-colors flex items-center justify-between cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Database className="w-4 h-4 text-primary" />
                  <span className="font-semibold text-xs text-foreground">Schematics ER Studio</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
              </button>

              <button
                type="button"
                onClick={() => {
                  setCanvasMode('lineage_dag');
                  setActiveLeftPanel('lineage_stages');
                }}
                className="w-full p-2 rounded-xl bg-card border border-border hover:border-primary/40 text-left transition-colors flex items-center justify-between cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <GitBranch className="w-4 h-4 text-primary" />
                  <span className="font-semibold text-xs text-foreground">Column Lineage DAG</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
              </button>
            </div>
          </div>
        )}

        {/* 2. UI DESIGNER WIDGET TOOLBOX */}
        {activePanel === 'widget_toolbox' && (
          <ToolboxPanel searchQuery={searchQuery} />
        )}

        {/* 2.1 UML USE CASE TOOLKIT */}
        {activePanel === 'uml_toolbox' && (
          <UMLToolboxPanel searchQuery={searchQuery} />
        )}

        {/* 2.2 QUESTIONNAIRE TOOLBOX */}
        {activePanel === 'q_toolbox' && (
          <QToolboxPanel searchQuery={searchQuery} />
        )}

        {/* 2.3 SCHEMA TOOLBOX */}
        {activePanel === 'schema_toolbox' && (
          <SchemaToolboxPanel />
        )}

        {/* 2.4 OPENAPI TOOLBOX */}
        {activePanel === 'openapi_toolbox' && (
          <OpenAPIToolboxPanel />
        )}

        {/* 3. SCHEMATICS DATA DICTIONARY (DES_BASE) */}
        {activePanel === 'data_dictionary' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-muted-foreground px-1">
              <span className="text-[10px] uppercase font-bold tracking-wider">Synchronized Schema Tables</span>
              <span className="text-[10px] font-mono bg-muted px-1.5 py-0.2 rounded font-bold text-primary">6 Tables</span>
            </div>

            <div className="space-y-1">
              {[
                { name: 'designer_apps', pk: 'id (uuid)', cols: 7, rows: 'Dynamic' },
                { name: 'designer_layouts', pk: 'id (uuid)', cols: 6, rows: 'Dynamic' },
                { name: 'designer_workspaces', pk: 'id (uuid)', cols: 4, rows: '1' },
                { name: 'designer_widgets', pk: 'id (uuid)', cols: 8, rows: '18' },
                { name: 'designer_datasources', pk: 'id (uuid)', cols: 7, rows: '3' },
                { name: 'designer_lineage_nodes', pk: 'id (uuid)', cols: 6, rows: '5' },
              ].map((t) => (
                <div
                  key={t.name}
                  className="p-2.5 rounded-xl bg-card border border-border hover:border-primary/40 transition-all cursor-pointer space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <Table className="w-3.5 h-3.5 text-primary" />
                      <span className="font-mono font-bold text-foreground text-xs">{t.name}</span>
                    </div>
                    <span className="text-[9px] font-mono text-emerald-500 font-semibold">PostgreSQL</span>
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                    <span>PK: <code className="font-mono">{t.pk}</code></span>
                    <span>{t.cols} columns</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 4. LINEAGE STAGES PANEL */}
        {activePanel === 'lineage_stages' && (
          <div className="space-y-3">
            <div className="p-2.5 rounded-xl bg-muted/40 border border-border space-y-1">
              <span className="font-bold text-xs text-foreground block">Lineage Pipeline Stages</span>
              <p className="text-[11px] text-muted-foreground">Column-Level Lineage (CLL) graph flow from raw sources to analytical consumption marts.</p>
            </div>

            <div className="space-y-2">
              {[
                { stage: '1. Ingestion Sources', count: 3, color: 'text-amber-400', tag: 'RAW' },
                { stage: '2. Staging & Cleaning', count: 4, color: 'text-cyan-400', tag: 'STG' },
                { stage: '3. Core Transformation', count: 6, color: 'text-indigo-400', tag: 'CORE' },
                { stage: '4. Consumption Marts', count: 2, color: 'text-emerald-400', tag: 'MART' },
              ].map((s) => (
                <div key={s.stage} className="p-2.5 rounded-xl bg-card border border-border flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <GitBranch className={`w-3.5 h-3.5 ${s.color}`} />
                    <span className="font-semibold text-xs text-foreground">{s.stage}</span>
                  </div>
                  <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-bold">
                    {s.tag} ({s.count})
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 5. SQL WORKSPACES & CATALOG */}
        {activePanel === 'sql_catalog' && (
          <div className="space-y-3">
            <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider px-1">
              Query Templates & Snippets
            </span>
            <div className="space-y-1.5">
              {[
                { name: 'Active Applications Summary', sql: 'SELECT id, name, slug, status FROM DES_BASE.designer_apps;' },
                { name: 'Layout Slot State Audit', sql: 'SELECT app_id, layout_version, updated_at FROM DES_BASE.designer_layouts;' },
                { name: 'Schema Health Probes', sql: 'SELECT table_name, row_estimate FROM information_schema.tables WHERE table_schema = \'DES_BASE\';' },
              ].map((q) => (
                <div
                  key={q.name}
                  className="p-2.5 rounded-xl bg-card border border-border hover:border-primary/40 transition-all cursor-pointer space-y-1"
                >
                  <div className="flex items-center gap-1.5">
                    <Terminal className="w-3.5 h-3.5 text-primary" />
                    <span className="font-semibold text-xs text-foreground">{q.name}</span>
                  </div>
                  <pre className="font-mono text-[10px] text-muted-foreground truncate bg-background p-1.5 rounded border border-border/60">
                    {q.sql}
                  </pre>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 6. AUTONOMOUS AGENT LIBRARY */}
        {activePanel === 'agent_library' && (
          <div className="space-y-3">
            <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider px-1">
              Autonomous Agent Workers
            </span>
            <div className="space-y-1.5">
              {[
                { name: 'Enterprise Architecture Agent', port: 8090, role: 'Autonomous Multi-Agent Synthesis' },
                { name: 'AST Artifact Indexer', port: 8095, role: 'Hexagonal AST Vector Indexer' },
                { name: 'Schema Migration Dispatcher', port: 8088, role: 'PostgreSQL DDL Validator' },
              ].map((a) => (
                <div
                  key={a.name}
                  className="p-2.5 rounded-xl bg-card border border-border hover:border-primary/40 transition-all cursor-pointer space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <Bot className="w-3.5 h-3.5 text-primary" />
                      <span className="font-semibold text-xs text-foreground">{a.name}</span>
                    </div>
                    <span className="text-[9px] font-mono text-emerald-500 font-bold">READY</span>
                  </div>
                  <p className="text-[10px] text-muted-foreground">{a.role}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 7. PROJECT EXPLORER (MODEL TREE) */}
        {activePanel === 'model_tree' && (
          <div className="space-y-3">
            {currentApp && (
              <div className="p-2.5 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-between mb-2">
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="font-bold text-foreground text-xs truncate">{currentApp.name}</span>
                  </div>
                  <span className="text-[10px] font-mono text-muted-foreground">{currentApp.slug}</span>
                </div>
                <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-primary text-primary-foreground">
                  DES_BASE
                </span>
              </div>
            )}

            <div>
              <div
                onClick={() => toggleNode('ui_components')}
                className="flex items-center justify-between text-muted-foreground hover:text-foreground cursor-pointer py-1 font-semibold"
              >
                <div className="flex items-center gap-1.5">
                  {expandedNodes.ui_components ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                  <span className="text-foreground">UI Components & Canvas</span>
                </div>
              </div>
              {expandedNodes.ui_components && (
                <div className="pl-4 space-y-1 mt-1 border-l border-border ml-2">
                  <div
                    onClick={() => {
                      setCanvasMode('visual_canvas');
                      setActiveLeftPanel('widget_toolbox');
                    }}
                    className={`flex items-center justify-between py-1.5 px-2 rounded-lg cursor-pointer transition-colors ${
                      canvasMode === 'visual_canvas' ? 'bg-primary/10 text-primary font-bold' : 'hover:bg-muted/60 text-foreground'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Layout className="w-3.5 h-3.5 text-primary" />
                      <span>Visual Canvas Grid</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* RIGHT PANEL: Property Inspector */}
        {activePanel === 'properties_inspector' && (
          <PropertyInspector
            selectedWidgetId={selectedWidgetId}
            onSelectWidget={setSelectedWidgetId}
          />
        )}
      </div>

      {/* ── Draggable Splitter Handle (Left Sidebar Only) ── */}
      {position === 'left' && (
        <div
          onMouseDown={handleMouseDown}
          className={`absolute top-0 right-0 w-1.5 h-full cursor-col-resize hover:bg-primary/50 transition-colors z-30 ${
            isResizing ? 'bg-primary' : 'bg-transparent'
          }`}
          title="Drag to resize Left Tool Panel (Double-click to reset)"
          onDoubleClick={() => setWidth(DEFAULT_LEFT_WIDTH)}
        />
      )}
    </aside>
  );
};

export default SidebarSlot;
