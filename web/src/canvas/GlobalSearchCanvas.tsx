import React, { useState } from 'react';
import {
  Search,
  Layout,
  Database,
  GitBranch,
  Terminal,
  Bot,
  Table,
  Layers,
  ArrowRight,
  Filter,
  Sparkles,
} from 'lucide-react';
import { useLayout } from '../shell/LayoutContext';
import { CanvasMode } from '../shell/types';

interface SearchResultItem {
  id: string;
  category: 'App' | 'Schema Table' | 'UI Component' | 'SQL Query' | 'Agent';
  title: string;
  subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
  targetCanvas: CanvasMode;
  targetSidebar: string;
  color: string;
}

const SEARCH_CATALOG: SearchResultItem[] = [
  {
    id: 'app-fleet',
    category: 'App',
    title: 'Fleet Logistics Studio',
    subtitle: 'Primary autonomous fleet tracking and telemetry builder app',
    icon: Layout,
    targetCanvas: 'visual_canvas',
    targetSidebar: 'widget_toolbox',
    color: 'text-primary',
  },
  {
    id: 'table-designer-apps',
    category: 'Schema Table',
    title: 'DES_BASE.designer_apps',
    subtitle: 'Authoritative PostgreSQL registry of designer applications and status',
    icon: Database,
    targetCanvas: 'er_modeler',
    targetSidebar: 'data_dictionary',
    color: 'text-emerald-400',
  },
  {
    id: 'table-designer-layouts',
    category: 'Schema Table',
    title: 'DES_BASE.designer_layouts',
    subtitle: '5-Slot layout configuration DSL and dynamic workbench slots',
    icon: Database,
    targetCanvas: 'er_modeler',
    targetSidebar: 'data_dictionary',
    color: 'text-emerald-400',
  },
  {
    id: 'widget-header',
    category: 'UI Component',
    title: 'HeaderCard (Operational Metrics)',
    subtitle: 'Metrics summary banner with live SLA calculations and status tags',
    icon: Layers,
    targetCanvas: 'visual_canvas',
    targetSidebar: 'widget_toolbox',
    color: 'text-cyan-400',
  },
  {
    id: 'widget-table',
    category: 'UI Component',
    title: 'DataTable (PostgreSQL DES_BASE Grid)',
    subtitle: 'Multi-column sortable relational data table bound to DES_BASE',
    icon: Table,
    targetCanvas: 'visual_canvas',
    targetSidebar: 'widget_toolbox',
    color: 'text-cyan-400',
  },
  {
    id: 'lineage-cll',
    category: 'UI Component',
    title: 'Column-Level Lineage DAG',
    subtitle: 'End-to-end transformation tracing and blast radius calculation',
    icon: GitBranch,
    targetCanvas: 'lineage_dag',
    targetSidebar: 'lineage_stages',
    color: 'text-indigo-400',
  },
  {
    id: 'sql-apps',
    category: 'SQL Query',
    title: 'SELECT id, name, slug FROM DES_BASE.designer_apps;',
    subtitle: 'Fetch active application metadata and current deployment state',
    icon: Terminal,
    targetCanvas: 'sql_editor',
    targetSidebar: 'sql_catalog',
    color: 'text-amber-400',
  },
  {
    id: 'agent-ea',
    category: 'Agent',
    title: 'Enterprise Architecture Synthesis Agent',
    subtitle: 'Port 8090 • Autonomous multi-agent knowledge graph generator',
    icon: Bot,
    targetCanvas: 'workflow_graph',
    targetSidebar: 'agent_library',
    color: 'text-purple-400',
  },
];

export const GlobalSearchCanvas: React.FC = () => {
  const { setCanvasMode, setActiveLeftPanel } = useLayout();
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const filteredResults = SEARCH_CATALOG.filter((item) => {
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesQuery =
      item.title.toLowerCase().includes(query.toLowerCase()) ||
      item.subtitle.toLowerCase().includes(query.toLowerCase()) ||
      item.category.toLowerCase().includes(query.toLowerCase());
    return matchesCategory && matchesQuery;
  });

  const handleNavigate = (item: SearchResultItem) => {
    setCanvasMode(item.targetCanvas);
    setActiveLeftPanel(item.targetSidebar);
  };

  return (
    <div className="flex-1 h-full bg-background overflow-y-auto p-6 space-y-6 select-none">
      {/* ── Header ── */}
      <div className="border-b border-border pb-5 space-y-1">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-primary/10 text-primary border border-primary/20 shadow-xs">
            <Search className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">Global Artifact & Schema Search</h1>
            <p className="text-xs text-muted-foreground">
              Search applications, PostgreSQL DES_BASE schema tables, UI widgets, SQL queries, and autonomous agents.
            </p>
          </div>
        </div>
      </div>

      {/* ── Search Input ── */}
      <div className="relative">
        <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by entity name, table, column, widget type, query or agent role..."
          className="w-full bg-card border border-border rounded-2xl px-4 py-3 pl-11 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary shadow-xs"
        />
      </div>

      {/* ── Category Filter Buttons ── */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {['All', 'App', 'Schema Table', 'UI Component', 'SQL Query', 'Agent'].map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
              selectedCategory === cat
                ? 'bg-primary text-primary-foreground shadow-xs'
                : 'bg-muted/60 text-muted-foreground hover:text-foreground hover:bg-muted'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* ── Results List ── */}
      <div className="space-y-2.5">
        <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider px-1">
          Results ({filteredResults.length})
        </div>

        {filteredResults.length === 0 ? (
          <div className="p-12 text-center rounded-2xl border border-dashed border-border bg-muted/10 text-muted-foreground text-xs">
            No enterprise artifacts matched your search query.
          </div>
        ) : (
          filteredResults.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.id}
                onClick={() => handleNavigate(item)}
                className="p-3.5 rounded-2xl bg-card border border-border hover:border-primary/50 transition-all shadow-2xs flex items-center justify-between cursor-pointer group"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className={`p-2.5 rounded-xl bg-muted border border-border/80 ${item.color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-foreground truncate">{item.title}</span>
                      <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-muted text-muted-foreground font-semibold">
                        {item.category}
                      </span>
                    </div>
                    <p className="text-[11px] text-muted-foreground truncate mt-0.5">{item.subtitle}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-primary opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-2">
                  <span className="text-xs font-semibold hidden sm:inline">Open in Canvas</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default GlobalSearchCanvas;
