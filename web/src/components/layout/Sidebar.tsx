import React from 'react';
import {
  LayoutDashboard,
  Target,
  Workflow,
  GitFork,
  Users,
  Compass,
  Briefcase,
  Database,
  Layers,
  Settings,
  ShieldCheck,
  Shield,
  Key,
  FileCheck2,
  Sliders,
  Download,
  Upload,
  BookOpen,
  Keyboard,
  FileText,
  Package,
  FileSpreadsheet,
  PanelLeftClose,
  PanelLeftOpen,
  Bot,
  Binary,
  Table2,
  Plug,
  Search,
  Sparkles
} from 'lucide-react';
import { useStore, NavView, AppMode } from '../../store/useStore';

interface RailGroup {
  category: string;
  color: string;
  items: {
    id: NavView;
    label: string;
    description: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: string;
  }[];
}

export const Sidebar: React.FC = () => {
  const { appMode, setAppMode, activeView, setActiveView, sidebarCollapsed, toggleSidebar } = useStore();

  const getRailGroups = (): RailGroup[] => {
    switch (appMode) {
      case 'dashboard':
        return [
          {
            category: 'Overview',
            color: 'text-indigo-500',
            items: [
              {
                id: 'dashboard',
                label: 'Dashboard',
                description: 'Executive Overview & Metamodel KPIs',
                icon: LayoutDashboard,
              },
            ],
          },
        ];

      case 'architect':
        return [
          {
            category: 'Architecture',
            color: 'text-indigo-500',
            items: [
              {
                id: 'arch-directory',
                label: 'Directory',
                description: 'Architecture OS Artists Directory',
                icon: Compass,
              },
            ],
          },
        ];

      case 'agents':
        return [
          {
            category: 'Agents',
            color: 'text-purple-500',
            items: [
              {
                id: 'agents-directory',
                label: 'Directory',
                description: 'Autonomous Agents & Indexer Directory',
                icon: Bot,
              },
            ],
          },
        ];

      case 'portfolio':
        return [
          {
            category: 'Portfolio',
            color: 'text-blue-500',
            items: [
              {
                id: 'portfolio-directory',
                label: 'Directory',
                description: 'CMDB, Trouble Tickets & Risk Management',
                icon: Briefcase,
              },
            ],
          },
        ];

      case 'database':
        return [
          {
            category: 'Database & Schemas',
            color: 'text-indigo-500',
            items: [
              {
                id: 'database-directory',
                label: 'Directory',
                description: 'Studio Database Schemas Directory',
                icon: Database,
              },
              {
                id: 'database-schema',
                label: 'Schema',
                description: 'PostgreSQL 3NF Schema & ERD Studio',
                icon: Table2,
              },
            ],
          },
        ];

      case 'vectordb':
        return [
          {
            category: 'Vector Database & RAG',
            color: 'text-cyan-500',
            items: [
              {
                id: 'vector-directory',
                label: 'Directory',
                description: 'Vector Databases & Stores Directory',
                icon: Binary,
              },
              {
                id: 'vector-dashboard',
                label: 'Dashboard',
                description: 'LanceDB Performance & Storage Telemetry',
                icon: LayoutDashboard,
                badge: '768-dim',
              },
              {
                id: 'vector-search',
                label: 'Search Engine',
                description: 'Dense Semantic Vector Search Engine',
                icon: Search,
              },
              {
                id: 'vector-graph',
                label: 'Knowledge Graph',
                description: 'Vector Knowledge & Lineage Graph',
                icon: Workflow,
              },
              {
                id: 'vector-prompt',
                label: 'Prompt Studio',
                description: 'RAG Context & Prompt Engineering',
                icon: Sparkles,
              },
            ],
          },
        ];

      case 'hr':
        return [
          {
            category: 'Organisation',
            color: 'text-purple-500',
            items: [
              { id: 'hr-organization', label: 'Organisation', description: 'Org units hierarchy & reporting lines', icon: Users },
              { id: 'hr-raci', label: 'RACI Matrix', description: 'Accountability & governance matrix', icon: ShieldCheck },
            ],
          },
        ];

      case 'integration':
        return [
          {
            category: 'Integration',
            color: 'text-cyan-500',
            items: [
              {
                id: 'integration-directory',
                label: 'Directory',
                description: 'REST API Interfaces Directory',
                icon: Plug,
              },
              {
                id: 'integration-schema',
                label: 'Schema',
                description: 'REST API OpenAPI Specifications & Schemas',
                icon: Table2,
              },
            ],
          },
        ];

      case 'platforms':
        return [
          {
            category: 'Connected Platforms',
            color: 'text-indigo-500',
            items: [
              { id: 'platforms-overview', label: 'Platforms Hub', description: 'Connected enterprise platforms status', icon: Sliders },
              { id: 'plat-hcm', label: 'Workday HCM', description: 'Workday ERP & HCM integration', icon: Users, badge: 'Live' },
              { id: 'plat-cloud', label: 'AWS / Azure', description: 'Infrastructure discovery & cloud assets', icon: Database },
            ],
          },
        ];

      case 'settings':
        return [
          {
            category: 'Settings & Governance',
            color: 'text-purple-500',
            items: [
              { id: 'admin-users', label: 'Users & Identity', description: 'Account directory & identity governance', icon: Users },
              { id: 'admin-roles', label: 'Roles & RBAC', description: 'Role-based authorization & permissions', icon: Shield },
              { id: 'database', label: 'Database & Schemas', description: 'PostgreSQL BT_BASE schemas & connection', icon: Database },
              { id: 'imports', label: 'Ingestion Studio', description: 'Import JSON, CSV & ArchiMate models', icon: Upload },
              { id: 'export', label: 'Export Studio', description: 'Export JSON, ArchiMate & Markdown', icon: Download },
            ],
          },
        ];

      case 'help':
        return [
          {
            category: 'Guides & Standards',
            color: 'text-indigo-500',
            items: [
              { id: 'help-ea', label: 'Architecture Guide', description: 'Enterprise architecture body of knowledge', icon: BookOpen },
              { id: 'help-togaf', label: 'TOGAF® 10 Framework', description: 'Phase B business architecture metamodel', icon: Layers },
              { id: 'help-shortcuts', label: 'Keyboard Shortcuts', description: 'Terminal hotkeys & quick navigation', icon: Keyboard },
            ],
          },
        ];

      default:
        return [
          {
            category: 'Overview',
            color: 'text-indigo-500',
            items: [
              {
                id: 'dashboard',
                label: 'Dashboard',
                description: 'Executive Overview & Metamodel KPIs',
                icon: LayoutDashboard,
              },
            ],
          },
        ];
    }
  };

  const groups = getRailGroups();

  return (
    <aside
      className={`bg-sidebar border-r border-border flex flex-col justify-start select-none shrink-0 shadow-xs transition-all duration-200 h-screen ${
        sidebarCollapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Top Header / Branding & The Only Collapse/Expand Button */}
      {!sidebarCollapsed ? (
        <div className="h-14 px-3.5 border-b border-border flex items-center justify-between shrink-0 bg-sidebar/80">
          <div className="flex items-center gap-2.5 min-w-0">
            <button
              onClick={() => {
                setAppMode('dashboard');
                setActiveView('dashboard');
              }}
              className="w-8 h-8 rounded-xl bg-gradient-to-tr from-slate-700 to-indigo-600 flex items-center justify-center text-white shadow-xs font-bold text-xs shrink-0 cursor-pointer hover:scale-105 transition-transform"
              title="Go to Dashboard"
            >
              BASE
            </button>
            <div className="truncate">
              <span className="text-xs font-extrabold tracking-tight text-foreground block leading-tight truncate">
                Base Artist
              </span>
              <span className="text-[10px] text-muted-foreground block font-medium leading-none truncate">
                Universal Architecture OS
              </span>
            </div>
          </div>
          <button
            onClick={toggleSidebar}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors cursor-pointer shrink-0"
            title="Collapse Navigation Rail"
          >
            <PanelLeftClose className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div className="h-14 border-b border-border flex items-center justify-center shrink-0 bg-sidebar/80">
          <button
            onClick={toggleSidebar}
            className="p-1 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors cursor-pointer flex items-center justify-center group"
            title="Expand Navigation Rail"
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-slate-700 to-indigo-600 flex items-center justify-center text-white shadow-xs font-bold text-xs group-hover:scale-105 transition-transform">
              BASE
            </div>
          </button>
        </div>
      )}

      {/* Navigation Links - Pinned strictly from the top down */}
      <div className={`flex-1 overflow-y-auto space-y-4 ${sidebarCollapsed ? 'p-1.5' : 'p-3'}`}>
        {groups.map((group) => (
          <div key={group.category} className="space-y-1">
            {!sidebarCollapsed && (
              <div className={`px-3 py-1 text-[10px] font-bold uppercase tracking-wider ${group.color}`}>
                {group.category}
              </div>
            )}
            <ul className="space-y-0.5">
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = activeView === item.id;
                return (
                  <li key={item.id}>
                    <button
                      onClick={() => setActiveView(item.id)}
                      title={sidebarCollapsed ? `${item.label} — ${item.description}` : undefined}
                      className={`w-full flex items-center rounded-xl text-xs font-medium transition-all cursor-pointer ${
                        sidebarCollapsed
                          ? 'justify-center p-2.5'
                          : 'justify-between px-3 py-2'
                      } ${
                        isActive
                          ? 'bg-primary text-primary-foreground shadow-xs font-bold'
                          : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0 text-left">
                        <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-primary-foreground' : 'text-muted-foreground'}`} />
                        {!sidebarCollapsed && (
                          <div className="truncate">
                            <div className={`font-semibold text-xs ${isActive ? 'text-primary-foreground' : 'text-foreground'}`}>
                              {item.label}
                            </div>
                            <div className={`text-[10px] truncate ${isActive ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>
                              {item.description}
                            </div>
                          </div>
                        )}
                      </div>

                      {!sidebarCollapsed && item.badge && (
                        <span
                          className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-semibold shrink-0 ml-1 ${
                            isActive ? 'bg-primary-foreground/20 text-primary-foreground' : 'bg-muted text-muted-foreground'
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>

      {/* Footer Provenance Badge - Anchored to bottom */}
      {!sidebarCollapsed ? (
        <div className="p-3 border-t border-border/60 bg-sidebar/50 shrink-0">
          <div className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-card/70 border border-border/80 text-xs shadow-2xs">
            <div className="flex items-center gap-2 min-w-0">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              <span className="text-[11px] font-semibold text-foreground truncate">Strict Provenance</span>
            </div>
            <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 shrink-0">
              BT_BASE
            </span>
          </div>
        </div>
      ) : (
        <div className="p-2 border-t border-border/60 bg-sidebar/50 flex justify-center shrink-0" title="Strict Provenance: BT_BASE Schema">
          <div className="w-8 h-8 rounded-lg bg-card/70 border border-border/80 flex items-center justify-center shadow-2xs">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
          </div>
        </div>
      )}
    </aside>
  );
};
