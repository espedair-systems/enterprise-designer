import React, { useState } from 'react';
import {
  Table,
  BarChart3,
  Code,
  List,
  FormInput,
  CheckSquare,
  ToggleLeft,
  Calendar,
  Hash,
  TrendingUp,
  PieChart,
  Grid,
  Layers,
  Layout,
  CreditCard,
  ExternalLink,
  Play,
  MoreHorizontal,
  ChevronDown,
  ChevronRight,
  GripVertical,
  ChevronsDownUp,
  Plus,
  Monitor,
  Terminal,
  Compass,
  FileCode,
  AppWindow,
  AlertCircle,
  Sliders,
  Sparkles,
  ArrowRight,
  Database,
  GitBranch,
  Search,
  Activity,
  Boxes,
  Eye,
  Settings,
} from 'lucide-react';
import { WIDGET_REGISTRY } from '../widgets/registry';
import { WidgetDefinition } from '../widgets/types';
import { useLayout } from '../shell/LayoutContext';
import { CanvasMode } from '../shell/types';

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Table,
  BarChart3,
  Code,
  List,
  FormInput,
  CheckSquare,
  ToggleLeft,
  Calendar,
  Hash,
  TrendingUp,
  PieChart,
  Grid,
  Layers,
  CreditCard,
  ExternalLink,
  Play,
  MoreHorizontal,
  Monitor,
  Terminal,
};

interface HierarchySection {
  id: string;
  label: string;
  category: 'layouts' | 'display' | 'input' | 'visual' | 'container' | 'action';
  badgeColor: string;
}

const TOOLBOX_SECTIONS: HierarchySection[] = [
  { id: 'layouts', label: 'Layouts', category: 'layouts', badgeColor: 'bg-primary/10 text-primary border-primary/20' },
  { id: 'display', label: 'Display', category: 'display', badgeColor: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20' },
  { id: 'input', label: 'Input', category: 'input', badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
  { id: 'visual', label: 'Visual', category: 'visual', badgeColor: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' },
  { id: 'container', label: 'Containers', category: 'container', badgeColor: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
  { id: 'action', label: 'Actions', category: 'action', badgeColor: 'bg-purple-500/10 text-purple-400 border-purple-500/20' },
];

interface NavigationItem {
  id: string;
  label: string;
  subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
  canvasMode?: CanvasMode;
  targetModal?: 'eye_inspector' | 'settings_modal';
  color: string;
}

interface NavigationSection {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badgeColor: string;
  items: NavigationItem[];
}

const NAVIGATION_SECTIONS: NavigationSection[] = [
  {
    id: 'pages',
    label: 'Pages & Canvases',
    icon: FileCode,
    badgeColor: 'bg-primary/10 text-primary border-primary/20',
    items: [
      {
        id: 'nav-visual-canvas',
        label: 'Visual Canvas Grid',
        subtitle: 'Drag & Drop Component Builder (20px snap)',
        icon: Layout,
        canvasMode: 'visual_canvas',
        color: 'text-primary',
      },
      {
        id: 'nav-ui-sketch',
        label: 'Wireframe & Sketch',
        subtitle: 'Figma / Penpot Mockups & JSON Schema',
        icon: PenToolIcon,
        canvasMode: 'ui_sketch',
        color: 'text-purple-400',
      },
      {
        id: 'nav-dashboard',
        label: 'Executive Dashboard',
        subtitle: 'Operational KPIs & Fleet Metrics',
        icon: BarChart3,
        canvasMode: 'dashboard_projects',
        color: 'text-cyan-400',
      },
      {
        id: 'nav-projects-table',
        label: 'Projects Registry',
        subtitle: 'PostgreSQL DES_BASE.designer_apps table',
        icon: Table,
        canvasMode: 'dashboard_projects',
        color: 'text-emerald-400',
      },
      {
        id: 'nav-er-modeler',
        label: 'ER Modeler Studio',
        subtitle: 'Relational Schemas & Foreign Key Links',
        icon: Database,
        canvasMode: 'er_modeler',
        color: 'text-amber-400',
      },
      {
        id: 'nav-lineage-dag',
        label: 'Column Lineage DAG',
        subtitle: 'End-to-End CLL Transformation Stages',
        icon: GitBranch,
        canvasMode: 'lineage_dag',
        color: 'text-indigo-400',
      },
      {
        id: 'nav-sql-editor',
        label: 'AST SQL Console',
        subtitle: 'Query Workspace & EXPLAIN Tree',
        icon: Terminal,
        canvasMode: 'sql_editor',
        color: 'text-amber-400',
      },
      {
        id: 'nav-recent-activity',
        label: 'Recent Activity',
        subtitle: 'Audit Log & Change Requests (.design/CR)',
        icon: Activity,
        canvasMode: 'recent_activity',
        color: 'text-emerald-400',
      },
      {
        id: 'nav-global-search',
        label: 'Global Search',
        subtitle: 'Artifact, Schema Table & Agent Search',
        icon: Search,
        canvasMode: 'global_search',
        color: 'text-cyan-400',
      },
      {
        id: 'nav-project-scaffold',
        label: 'Project Scaffold',
        subtitle: 'Hexagonal Go Code Generator & Build',
        icon: Boxes,
        canvasMode: 'project_scaffold',
        color: 'text-primary',
      },
    ],
  },
  {
    id: 'modals',
    label: 'Modals & Drawers',
    icon: AppWindow,
    badgeColor: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
    items: [
      {
        id: 'nav-eye-modal',
        label: 'UI Location Inspector Modal',
        subtitle: 'Antigravity Eye Context & CR Creator',
        icon: Eye,
        targetModal: 'eye_inspector',
        color: 'text-primary',
      },
      {
        id: 'nav-settings-modal',
        label: 'Studio Settings & Autosave',
        subtitle: 'PostgreSQL DES_BASE Debounce Interval',
        icon: Settings,
        targetModal: 'settings_modal',
        color: 'text-emerald-400',
      },
      {
        id: 'nav-migration-modal',
        label: 'Schema Migration Planner',
        subtitle: 'Automated DDL Generator & Execution',
        icon: Database,
        color: 'text-purple-400',
      },
      {
        id: 'nav-create-modal',
        label: 'New Application Scaffolder',
        subtitle: 'Create App Modal in DES_BASE',
        icon: Plus,
        color: 'text-cyan-400',
      },
    ],
  },
  {
    id: 'dialogs',
    label: 'Dialogs & Alerts',
    icon: AlertCircle,
    badgeColor: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    items: [
      {
        id: 'nav-del-dialog',
        label: 'Delete Project Confirmation',
        subtitle: 'Authoritative cascade deletion dialog',
        icon: AlertCircle,
        color: 'text-destructive',
      },
      {
        id: 'nav-cr-alert',
        label: 'CR Generated Notification',
        subtitle: 'Feedback banner on .design/CR write',
        icon: Sparkles,
        color: 'text-emerald-400',
      },
      {
        id: 'nav-autosave-alert',
        label: 'Autosave Sync Acknowledgment',
        subtitle: 'Real-time DES_BASE save feedback',
        icon: Sparkles,
        color: 'text-primary',
      },
    ],
  },
  {
    id: 'trays',
    label: 'Trays & Panels',
    icon: Sliders,
    badgeColor: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    items: [
      {
        id: 'nav-tray-query',
        label: 'Bottom Console: Query Runner',
        subtitle: 'AST SQL Parser & Result Grid',
        icon: Terminal,
        color: 'text-amber-400',
      },
      {
        id: 'nav-tray-logs',
        label: 'Bottom Console: SQL Logs',
        subtitle: 'PostgreSQL pgx Connection Pool Traces',
        icon: Terminal,
        color: 'text-emerald-400',
      },
      {
        id: 'nav-tray-terminal',
        label: 'Bottom Console: Terminal',
        subtitle: 'Interactive bash subagent shell',
        icon: Terminal,
        color: 'text-primary',
      },
      {
        id: 'nav-inspector-props',
        label: 'Right Properties Inspector',
        subtitle: '240px - 600px Resizable Properties Panel',
        icon: Sliders,
        color: 'text-cyan-400',
      },
    ],
  },
];

function PenToolIcon(props: { className?: string }) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m12 19 7-7 3 3-7 7-3-3z" />
      <path d="m18 13-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" />
      <path d="m2 2 7.586 7.586" />
      <circle cx="11" cy="11" r="2" />
    </svg>
  );
}

interface ToolboxPanelProps {
  searchQuery?: string;
}

export const ToolboxPanel: React.FC<ToolboxPanelProps> = ({ searchQuery = '' }) => {
  const {
    slots,
    updateSlots,
    setSelectedWidgetId,
    setCanvasMode,
    canvasMode,
    setIsConfigModalOpen,
  } = useLayout();

  // Mode: UI Toolbox vs UI Navigation
  const [panelMode, setPanelMode] = useState<'toolbox' | 'navigation'>('toolbox');

  // Concertina accordion: only 1 active section expanded at a time
  const [activeToolboxSectionId, setActiveToolboxSectionId] = useState<string | null>('layouts');
  const [activeNavSectionId, setActiveNavSectionId] = useState<string | null>('pages');

  const toggleToolboxSection = (sectionId: string) => {
    setActiveToolboxSectionId((prev) => (prev === sectionId ? null : sectionId));
  };

  const toggleNavSection = (sectionId: string) => {
    setActiveNavSectionId((prev) => (prev === sectionId ? null : sectionId));
  };

  const handleCollapseAll = () => {
    if (panelMode === 'toolbox') {
      setActiveToolboxSectionId(null);
    } else {
      setActiveNavSectionId(null);
    }
  };

  const handleDragStart = (e: React.DragEvent, widgetDef: WidgetDefinition) => {
    e.dataTransfer.setData('application/json', JSON.stringify(widgetDef));
    e.dataTransfer.setData('text/plain', widgetDef.type);
    e.dataTransfer.effectAllowed = 'copy';
  };

  const handleAddWidget = (widgetDef: WidgetDefinition) => {
    const currentWidgets = slots.canvas?.widgets || [];
    const newWidgetId = `widget-${Date.now().toString().slice(-5)}`;
    const newWidget = {
      id: newWidgetId,
      type: widgetDef.type,
      x: 40 + (currentWidgets.length % 4) * 40,
      y: 40 + Math.floor(currentWidgets.length / 4) * 60,
      width: widgetDef.defaultWidth,
      height: widgetDef.defaultHeight,
      title: widgetDef.label,
      props: { ...widgetDef.defaultProps },
    };

    updateSlots({
      canvas: {
        ...slots.canvas,
        widgets: [...currentWidgets, newWidget],
      },
    });

    setSelectedWidgetId(newWidgetId);
  };

  const handleNavigateItem = (item: NavigationItem) => {
    if (item.canvasMode) {
      setCanvasMode(item.canvasMode);
    }
    if (item.targetModal === 'settings_modal') {
      setIsConfigModalOpen(true);
    }
  };

  const isSearchActive = searchQuery.trim() !== '';

  return (
    <div className="flex flex-col h-full space-y-2.5 select-none">
      {/* ── Very Top Header: UI Toolbox vs UI Navigation Mode Switcher ── */}
      <div className="p-1 bg-muted/70 rounded-xl border border-border flex items-center gap-1 shrink-0">
        <button
          type="button"
          onClick={() => setPanelMode('toolbox')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            panelMode === 'toolbox'
              ? 'bg-card text-primary shadow-xs border border-border'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>UI Toolbox</span>
        </button>

        <button
          type="button"
          onClick={() => setPanelMode('navigation')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            panelMode === 'navigation'
              ? 'bg-card text-primary shadow-xs border border-border'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Compass className="w-3.5 h-3.5" />
          <span>UI Navigation</span>
        </button>
      </div>

      {/* ── Sub-header: Concertina Info & Collapse All Action ── */}
      <div className="flex items-center justify-between px-1 shrink-0 text-[11px] text-muted-foreground">
        <span className="font-semibold text-foreground/80">
          {panelMode === 'toolbox' ? 'Component Palette' : 'App Tree & Hierarchy'}
        </span>
        <button
          type="button"
          onClick={handleCollapseAll}
          className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-muted/60 hover:bg-muted text-foreground transition-colors cursor-pointer border border-border/60 hover:border-primary/40 text-[10px] font-semibold"
          title="Collapse all sections"
        >
          <ChevronsDownUp className="w-3 h-3 text-primary" />
          <span>Collapse All</span>
        </button>
      </div>

      {/* ── MODE A: UI TOOLBOX (Concertina Hierarchical Palette) ── */}
      {panelMode === 'toolbox' && (
        <div className="flex-1 overflow-y-auto space-y-2 pr-1 scrollbar-thin">
          {TOOLBOX_SECTIONS.map((section) => {
            const widgetsInSection = Object.values(WIDGET_REGISTRY).filter((w) => {
              const matchesCat = w.category === section.category;
              const matchesSearch =
                !isSearchActive ||
                w.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
                w.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                w.type.toLowerCase().includes(searchQuery.toLowerCase());
              return matchesCat && matchesSearch;
            });

            if (widgetsInSection.length === 0 && isSearchActive) {
              return null;
            }

            const isExpanded = isSearchActive
              ? widgetsInSection.length > 0
              : activeToolboxSectionId === section.id;

            return (
              <div
                key={section.id}
                className={`rounded-xl border transition-all overflow-hidden ${
                  isExpanded
                    ? 'border-primary/40 bg-card shadow-2xs'
                    : 'border-border/70 bg-muted/20 hover:border-border'
                }`}
              >
                {/* Section Header */}
                <div
                  onClick={() => toggleToolboxSection(section.id)}
                  className="p-2.5 bg-muted/30 hover:bg-muted/60 flex items-center justify-between cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-2">
                    {isExpanded ? (
                      <ChevronDown className="w-3.5 h-3.5 text-primary" />
                    ) : (
                      <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
                    )}
                    <span
                      className={`font-bold text-xs ${
                        isExpanded ? 'text-foreground font-bold' : 'text-muted-foreground'
                      }`}
                    >
                      {section.label}
                    </span>
                  </div>
                  <span
                    className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded-md border ${section.badgeColor}`}
                  >
                    {widgetsInSection.length}
                  </span>
                </div>

                {/* Section Items */}
                {isExpanded && (
                  <div className="p-2 space-y-1.5 bg-card/60 border-t border-border/40">
                    {widgetsInSection.map((w) => {
                      const Icon = ICON_MAP[w.icon] || Layers;

                      return (
                        <div
                          key={w.type}
                          draggable
                          onDragStart={(e) => handleDragStart(e, w)}
                          onClick={() => handleAddWidget(w)}
                          className="p-2 bg-background border border-border/70 hover:border-primary/60 rounded-xl flex items-center justify-between gap-2 group transition-all cursor-grab active:cursor-grabbing shadow-2xs hover:shadow-sm"
                          title="Click to add or drag onto canvas grid"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <GripVertical className="w-3.5 h-3.5 text-muted-foreground/40 group-hover:text-primary shrink-0" />
                            <div className="w-7 h-7 rounded-lg bg-muted border border-border flex items-center justify-center text-primary group-hover:scale-105 transition-transform shrink-0">
                              <Icon className="w-3.5 h-3.5" />
                            </div>
                            <div className="min-w-0">
                              <div className="font-semibold text-xs text-foreground truncate">{w.label}</div>
                              <div className="text-[10px] text-muted-foreground truncate">{w.description}</div>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAddWidget(w);
                            }}
                            className="p-1 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-md transition-colors opacity-0 group-hover:opacity-100 shrink-0 cursor-pointer"
                            title="Add to canvas"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ── MODE B: UI NAVIGATION (Hierarchy: Pages, Modals, Dialogs, Trays) ── */}
      {panelMode === 'navigation' && (
        <div className="flex-1 overflow-y-auto space-y-2 pr-1 scrollbar-thin">
          {NAVIGATION_SECTIONS.map((section) => {
            const filteredItems = section.items.filter((item) => {
              if (!isSearchActive) return true;
              return (
                item.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.subtitle.toLowerCase().includes(searchQuery.toLowerCase())
              );
            });

            if (filteredItems.length === 0 && isSearchActive) {
              return null;
            }

            const SectionIcon = section.icon;
            const isExpanded = isSearchActive
              ? filteredItems.length > 0
              : activeNavSectionId === section.id;

            return (
              <div
                key={section.id}
                className={`rounded-xl border transition-all overflow-hidden ${
                  isExpanded
                    ? 'border-primary/40 bg-card shadow-2xs'
                    : 'border-border/70 bg-muted/20 hover:border-border'
                }`}
              >
                {/* Section Header */}
                <div
                  onClick={() => toggleNavSection(section.id)}
                  className="p-2.5 bg-muted/30 hover:bg-muted/60 flex items-center justify-between cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-2">
                    {isExpanded ? (
                      <ChevronDown className="w-3.5 h-3.5 text-primary" />
                    ) : (
                      <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
                    )}
                    <SectionIcon className="w-3.5 h-3.5 text-muted-foreground" />
                    <span
                      className={`font-bold text-xs ${
                        isExpanded ? 'text-foreground font-bold' : 'text-muted-foreground'
                      }`}
                    >
                      {section.label}
                    </span>
                  </div>
                  <span
                    className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded-md border ${section.badgeColor}`}
                  >
                    {filteredItems.length}
                  </span>
                </div>

                {/* Section Navigation Items */}
                {isExpanded && (
                  <div className="p-2 space-y-1.5 bg-card/60 border-t border-border/40">
                    {filteredItems.map((item) => {
                      const Icon = item.icon;
                      const isActive = item.canvasMode && canvasMode === item.canvasMode;

                      return (
                        <div
                          key={item.id}
                          onClick={() => handleNavigateItem(item)}
                          className={`p-2 rounded-xl flex items-center justify-between gap-2 transition-all cursor-pointer shadow-2xs group ${
                            isActive
                              ? 'bg-primary/10 border border-primary/40 text-primary font-semibold'
                              : 'bg-background border border-border/70 hover:border-primary/40 text-foreground'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div
                              className={`w-7 h-7 rounded-lg bg-muted border border-border flex items-center justify-center ${item.color} group-hover:scale-105 transition-transform shrink-0`}
                            >
                              <Icon className="w-3.5 h-3.5" />
                            </div>
                            <div className="min-w-0">
                              <div className="font-semibold text-xs truncate">{item.label}</div>
                              <div className="text-[10px] text-muted-foreground truncate">
                                {item.subtitle}
                              </div>
                            </div>
                          </div>

                          <ArrowRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ToolboxPanel;
