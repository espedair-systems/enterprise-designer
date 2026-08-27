import React, { useState } from 'react';
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
} from 'lucide-react';
import { useLayout } from './LayoutContext';
import { ToolboxPanel } from '../toolbox/ToolboxPanel';
import { PropertyInspector } from '../inspector/PropertyInspector';

interface SidebarSlotProps {
  position: 'left' | 'right';
}

export const SidebarSlot: React.FC<SidebarSlotProps> = ({ position }) => {
  const {
    slots,
    activeLeftPanel,
    setActiveLeftPanel,
    activeRightPanel,
    setActiveRightPanel,
    leftSidebarOpen,
    rightSidebarOpen,
    selectedWidgetId,
    setSelectedWidgetId,
  } = useLayout();

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({
    data_models: true,
    views: true,
    agents: true,
  });

  const isOpen = position === 'left' ? leftSidebarOpen : rightSidebarOpen;
  const activePanel = position === 'left' ? activeLeftPanel : activeRightPanel;
  const setActivePanel = position === 'left' ? setActiveLeftPanel : setActiveRightPanel;
  const panels = position === 'left' ? slots.sidebar_left.panels : slots.sidebar_right.panels;

  if (!isOpen) return null;

  const toggleNode = (node: string) => {
    setExpandedNodes((prev) => ({ ...prev, [node]: !prev[node] }));
  };

  const PANEL_TITLES: Record<string, string> = {
    model_tree: 'Explorer',
    widget_toolbox: 'Toolbox',
    datasource_catalog: 'Data Sources',
    git_status: 'Source Control',
    properties_inspector: 'Inspector',
    data_bindings: 'Bindings',
    validation_rules: 'Validation',
    event_handlers: 'Events',
  };

  return (
    <aside
      className={`w-72 bg-card border-${position === 'left' ? 'r' : 'l'} border-border flex flex-col select-none shrink-0 z-10`}
      aria-label={`${position} sidebar slot`}
    >
      {/* Panel Tab Strip */}
      <div className="flex items-center border-b border-border bg-muted/40 overflow-x-auto scrollbar-none px-1">
        {panels.map((panel) => (
          <button
            key={panel}
            type="button"
            onClick={() => setActivePanel(panel)}
            className={`px-3 py-2 text-xs font-semibold whitespace-nowrap transition-all border-b-2 ${
              activePanel === panel
                ? 'border-primary text-primary bg-card/60'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            {PANEL_TITLES[panel] || panel}
          </button>
        ))}
      </div>

      {/* Filter / Search Bar */}
      <div className="p-2 border-b border-border bg-muted/20">
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

      {/* Panel Body Content */}
      <div className="flex-1 overflow-y-auto p-3 text-xs text-foreground">
        {/* LEFT PANEL: Model Tree */}
        {activePanel === 'model_tree' && (
          <div className="space-y-3">
            {/* Section: Data Models */}
            <div>
              <div
                onClick={() => toggleNode('data_models')}
                className="flex items-center justify-between text-muted-foreground hover:text-foreground cursor-pointer py-1 font-semibold"
              >
                <div className="flex items-center gap-1.5">
                  {expandedNodes.data_models ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                  <span>Data Models (DES_BASE)</span>
                </div>
                <span className="text-[10px] bg-muted px-1.5 py-0.2 rounded text-muted-foreground font-mono">4</span>
              </div>
              {expandedNodes.data_models && (
                <div className="pl-4 space-y-1 mt-1 border-l border-border ml-2">
                  <div className="flex items-center gap-2 py-1 px-2 hover:bg-muted/60 rounded-lg cursor-pointer text-foreground">
                    <Table className="w-3.5 h-3.5 text-primary" />
                    <span className="font-mono">fct_telemetry_events</span>
                  </div>
                  <div className="flex items-center gap-2 py-1 px-2 hover:bg-muted/60 rounded-lg cursor-pointer text-foreground">
                    <Table className="w-3.5 h-3.5 text-primary" />
                    <span className="font-mono">dim_autonomous_agents</span>
                  </div>
                  <div className="flex items-center gap-2 py-1 px-2 hover:bg-muted/60 rounded-lg cursor-pointer text-foreground">
                    <Table className="w-3.5 h-3.5 text-primary" />
                    <span className="font-mono">designer_workspaces</span>
                  </div>
                  <div className="flex items-center gap-2 py-1 px-2 hover:bg-muted/60 rounded-lg cursor-pointer text-foreground">
                    <Table className="w-3.5 h-3.5 text-primary" />
                    <span className="font-mono">designer_layouts</span>
                  </div>
                </div>
              )}
            </div>

            {/* Section: App Views */}
            <div>
              <div
                onClick={() => toggleNode('views')}
                className="flex items-center justify-between text-muted-foreground hover:text-foreground cursor-pointer py-1 font-semibold"
              >
                <div className="flex items-center gap-1.5">
                  {expandedNodes.views ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                  <span>Studio Views & Forms</span>
                </div>
                <span className="text-[10px] bg-muted px-1.5 py-0.2 rounded text-muted-foreground font-mono">3</span>
              </div>
              {expandedNodes.views && (
                <div className="pl-4 space-y-1 mt-1 border-l border-border ml-2">
                  <div className="flex items-center gap-2 py-1 px-2 hover:bg-muted/60 rounded-lg cursor-pointer text-foreground">
                    <FileText className="w-3.5 h-3.5 text-emerald-500" />
                    <span>MainDashboardView.tsx</span>
                  </div>
                  <div className="flex items-center gap-2 py-1 px-2 hover:bg-muted/60 rounded-lg cursor-pointer text-foreground">
                    <FileText className="w-3.5 h-3.5 text-emerald-500" />
                    <span>AgentInspectorModal.tsx</span>
                  </div>
                  <div className="flex items-center gap-2 py-1 px-2 hover:bg-muted/60 rounded-lg cursor-pointer text-foreground">
                    <FileText className="w-3.5 h-3.5 text-emerald-500" />
                    <span>LineageMatrixView.tsx</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* LEFT PANEL: Widget Toolbox */}
        {activePanel === 'widget_toolbox' && (
          <ToolboxPanel />
        )}

        {/* LEFT PANEL: Datasource Catalog */}
        {activePanel === 'datasource_catalog' && (
          <div className="space-y-3">
            <div className="p-3 bg-card border border-border rounded-xl shadow-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Database className="w-4 h-4 text-primary" />
                  <span className="font-semibold text-foreground">PostgreSQL Authoritative</span>
                </div>
                <span className="text-[10px] bg-emerald-500/10 text-emerald-500 px-2 py-0.5 rounded-md font-bold border border-emerald-500/20">
                  CONNECTED
                </span>
              </div>
              <p className="text-[10px] text-muted-foreground mt-1 font-mono">postgres://base:base_secret@localhost:5432/base</p>
              <div className="mt-2 text-[11px] text-foreground space-y-1">
                <p>• Schema: <span className="text-primary font-mono font-bold">DES_BASE</span></p>
                <p>• Active Pools: <span className="text-primary font-mono">25</span></p>
              </div>
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

        {/* RIGHT PANEL: Data Bindings */}
        {activePanel === 'data_bindings' && (
          <div className="space-y-3">
            <label className="block text-[11px] font-semibold text-foreground">Authoritative SQL Binding</label>
            <textarea
              defaultValue={`SELECT id, name, slug, app_type, status \nFROM DES_BASE.designer_apps \nORDER BY updated_at DESC;`}
              rows={4}
              className="w-full bg-background border border-border rounded-lg p-2.5 text-xs font-mono text-primary focus:outline-none focus:border-primary"
            />
            <p className="text-[10px] text-muted-foreground">Bindings evaluate reactively on PostgreSQL query execution.</p>
          </div>
        )}
      </div>
    </aside>
  );
};
