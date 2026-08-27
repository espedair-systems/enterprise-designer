import React from 'react';
import {
  Folder,
  Layout,
  Database,
  GitBranch,
  Terminal,
  Bot,
  Settings,
  Plus,
  Sliders,
  Sparkles,
  Layers,
  Cpu,
  Workflow,
  HelpCircle,
} from 'lucide-react';
import { useLayout } from './LayoutContext';
import { RailItem } from './types';

const ICON_MAP: Record<string, React.FC<{ className?: string }>> = {
  FolderIcon: Folder,
  LayoutIcon: Layout,
  DatabaseIcon: Database,
  GitBranchIcon: GitBranch,
  TerminalIcon: Terminal,
  BotIcon: Bot,
  SettingsIcon: Settings,
  SparklesIcon: Sparkles,
  LayersIcon: Layers,
  CpuIcon: Cpu,
  WorkflowIcon: Workflow,
};

export const ActivityRail: React.FC = () => {
  const {
    slots,
    activeRailId,
    setActiveRailId,
    setActiveLeftPanel,
    setCanvasMode,
    setIsConfigModalOpen,
    leftSidebarOpen,
    toggleLeftSidebar,
  } = useLayout();

  const handleItemClick = (item: RailItem) => {
    if (activeRailId === item.id && leftSidebarOpen) {
      // Toggle sidebar if clicking already active item
      toggleLeftSidebar();
      return;
    }

    setActiveRailId(item.id);
    if (!leftSidebarOpen) {
      toggleLeftSidebar();
    }

    if (item.targetSidebar) {
      setActiveLeftPanel(item.targetSidebar);
    }
    if (item.targetCanvas) {
      setCanvasMode(item.targetCanvas);
    }
  };

  return (
    <aside
      className="w-14 bg-sidebar border-r border-sidebar-border flex flex-col items-center py-3 select-none z-30 justify-between shrink-0"
      aria-label="Activity Rail"
    >
      {/* Top Brand / Logo */}
      <div className="flex flex-col items-center gap-4 w-full">
        <div
          className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-500/20 cursor-pointer transition-transform hover:scale-105"
          title="EA Designer Studio"
        >
          <Sparkles className="w-5 h-5 text-white" />
        </div>

        <div className="w-8 h-px bg-sidebar-border" />

        {/* Customizable Tool Items */}
        <div className="flex flex-col items-center gap-2 w-full px-2">
          {slots.rail.items.map((item) => {
            const IconComponent = ICON_MAP[item.icon] || Layout;
            const isActive = activeRailId === item.id;

            return (
              <div key={item.id} className="relative group w-full flex justify-center">
                {/* Active Indicator Bar */}
                {isActive && (
                  <div className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-primary rounded-r shadow-[0_0_8px_rgba(99,102,241,0.8)]" />
                )}

                <button
                  type="button"
                  onClick={() => handleItemClick(item)}
                  className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all relative ${
                    isActive
                      ? 'bg-sidebar-accent text-primary font-semibold shadow-inner'
                      : 'text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/60'
                  }`}
                  aria-label={item.label}
                >
                  <IconComponent className="w-5 h-5" />

                  {/* Badge Counter */}
                  {item.badge !== undefined && (
                    <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-[10px] font-bold px-1.5 py-0.2 rounded-full min-w-[16px] text-center border border-sidebar-border">
                      {item.badge}
                    </span>
                  )}
                </button>

                {/* Tooltip */}
                <div className="absolute left-14 top-1/2 -translate-y-1/2 ml-2 px-2.5 py-1 bg-card border border-border text-foreground text-xs rounded-md shadow-xl whitespace-nowrap pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-50">
                  <p className="font-medium">{item.label}</p>
                  {item.targetCanvas && (
                    <p className="text-[10px] text-primary capitalize">
                      Canvas: {item.targetCanvas.replace('_', ' ')}
                    </p>
                  )}
                </div>
              </div>
            );
          })}

          {/* Add / Slot Customizer Button */}
          <button
            type="button"
            onClick={() => setIsConfigModalOpen(true)}
            className="w-10 h-10 rounded-lg flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-sidebar-accent border border-dashed border-sidebar-border hover:border-primary/50 transition-all mt-1"
            title="Configure Activity Rail Slots"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Bottom Settings & Actions */}
      <div className="flex flex-col items-center gap-2 w-full px-2">
        <button
          type="button"
          onClick={() => setIsConfigModalOpen(true)}
          className="w-10 h-10 rounded-lg flex items-center justify-center text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-all"
          title="EA Designer Settings & Slots"
        >
          <Sliders className="w-4 h-4" />
        </button>

        <div className="w-8 h-px bg-sidebar-border" />

        <div
          className="w-8 h-8 rounded-full bg-sidebar-accent border border-primary/30 flex items-center justify-center text-xs font-bold text-primary cursor-pointer hover:ring-2 hover:ring-primary/50 transition-all"
          title="Enterprise Architect (DES_BASE Authorized)"
        >
          EA
        </div>
      </div>
    </aside>
  );
};
