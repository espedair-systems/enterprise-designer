import React, { useState } from 'react';
import {
  LayoutDashboard,
  Layout,
  Database,
  GitBranch,
  Terminal,
  Bot,
  Layers,
  Sliders,
  Eye,
  PanelLeftClose,
  PanelLeftOpen,
  ShieldCheck,
  Plus,
  Compass,
  Briefcase,
  Network,
  Share2,
} from 'lucide-react';
import { useLayout } from './LayoutContext';
import { RailItem } from './types';
import { SlotConfigModal } from './SlotConfigModal';
import { UILocationInspectorModal } from '../components/common/UILocationInspectorModal';

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  LayoutDashboardIcon: LayoutDashboard,
  LayoutDashboard: LayoutDashboard,
  LayoutIcon: Layout,
  Layout: Layout,
  DatabaseIcon: Database,
  Database: Database,
  GitBranchIcon: GitBranch,
  GitBranch: GitBranch,
  TerminalIcon: Terminal,
  Terminal: Terminal,
  BotIcon: Bot,
  Bot: Bot,
  LayersIcon: Layers,
  Layers: Layers,
  CompassIcon: Compass,
  BriefcaseIcon: Briefcase,
  NetworkIcon: Network,
  Share2Icon: Share2,
  WorkflowIcon: Network,
  Workflow: Network,
  FolderCodeIcon: Briefcase,
  FolderCode: Briefcase,
  BoxesIcon: Layers,
  Boxes: Layers,
  ActivityIcon: Network,
  Activity: Network,
  SearchIcon: Compass,
  Search: Compass,
  PenToolIcon: Layout,
  PenTool: Layout,
  SlidersIcon: Sliders,
  Sliders: Sliders,
};

export const ActivityRail: React.FC = () => {
  const {
    slots,
    activeRailId,
    selectRailItem,
    isConfigModalOpen,
    setIsConfigModalOpen,
    canvasMode,
  } = useLayout();

  const [isInspectorOpen, setIsInspectorOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <aside
      className={`h-full bg-sidebar border-r border-sidebar-border flex flex-col justify-between select-none z-20 shrink-0 shadow-sm transition-all duration-300 ${
        isExpanded ? 'w-56 p-2.5' : 'w-14 p-1.5'
      }`}
      aria-label="Activity Rail Navigation"
    >
      {/* ── 1. Top Section: Header & Collapse Button ── */}
      <div className="flex flex-col gap-2">
        <div
          className={`flex items-center justify-between pb-2 border-b border-sidebar-border ${
            isExpanded ? 'px-2' : 'justify-center'
          }`}
        >
          {isExpanded ? (
            <>
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-6 h-6 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-bold text-[10px] shadow-xs">
                  ED
                </div>
                <div className="truncate">
                  <h1 className="font-bold text-xs text-sidebar-foreground truncate leading-tight">
                    Enterprise Designer
                  </h1>
                  <p className="text-[9px] font-mono text-muted-foreground truncate">Studio Architecture</p>
                </div>
              </div>

              {/* Top Collapse Button */}
              <button
                type="button"
                onClick={() => setIsExpanded(false)}
                className="p-1 rounded-lg text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-colors cursor-pointer"
                title="Collapse Activity Rail"
              >
                <PanelLeftClose className="w-4 h-4" />
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => setIsExpanded(true)}
              className="w-10 h-10 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary flex items-center justify-center font-bold text-xs transition-colors cursor-pointer"
              title="Click to Expand Enterprise Designer Rail"
            >
              ED
            </button>
          )}
        </div>

        {/* ── 2. Primary Rail Items List ── */}
        <div className="space-y-1 mt-1">
          {slots.rail.items.map((item, index) => {
            const Icon = ICON_MAP[item.icon] || Layout;
            const isActive = activeRailId === item.id;

            const prevItem = index > 0 ? slots.rail.items[index - 1] : null;
            const isNewSection = item.section && (!prevItem || prevItem.section !== item.section);

            return (
              <React.Fragment key={item.id}>
                {/* Section Header */}
                {isNewSection && (
                  isExpanded ? (
                    <div className="pt-3 pb-1 px-3 flex items-center justify-between">
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-muted-foreground">
                        {item.section}
                      </span>
                      <span className="text-[9px] font-mono text-primary font-bold px-1.5 py-0.2 rounded bg-primary/10">
                        {slots.rail.items.filter((i) => i.section === item.section).length}
                      </span>
                    </div>
                  ) : (
                    <div className="my-2 mx-2 border-t border-sidebar-border/60" />
                  )
                )}

                <div className="relative group">
                  <button
                    type="button"
                    onClick={() => selectRailItem(item)}
                    className={`w-full flex items-center rounded-xl text-xs font-medium transition-all cursor-pointer relative ${
                      isExpanded
                        ? item.alignRight
                          ? 'px-2.5 py-2 justify-between bg-sidebar-accent/30 border border-sidebar-border/40'
                          : 'gap-2.5 px-3 py-2 text-left'
                        : 'justify-center h-10 w-10 mx-auto'
                    } ${
                      isActive
                        ? 'bg-primary text-primary-foreground shadow-xs font-bold'
                        : 'text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent'
                    }`}
                  >
                  {isExpanded ? (
                    item.alignRight ? (
                      <>
                        <div className="min-w-0 flex-1 text-right mr-2">
                          <div className="text-xs font-semibold truncate leading-tight flex items-center justify-end gap-1">
                            <span className="text-[10px] text-primary font-mono">↳</span>
                            <span>{item.label}</span>
                          </div>
                          {item.description && (
                            <div
                              className={`text-[9px] truncate leading-tight ${
                                isActive ? 'text-primary-foreground/80' : 'text-muted-foreground'
                              }`}
                            >
                              {item.description}
                            </div>
                          )}
                        </div>
                        <Icon
                          className={`w-4 h-4 shrink-0 transition-transform ${
                            isActive ? 'text-primary-foreground scale-105' : 'text-primary'
                          }`}
                        />
                      </>
                    ) : (
                      <>
                        <Icon
                          className={`w-4 h-4 shrink-0 transition-transform ${
                            isActive ? 'text-primary-foreground scale-105' : 'text-sidebar-foreground/70'
                          }`}
                        />
                        <div className="min-w-0 flex-1">
                          <div className="text-xs font-semibold truncate leading-tight">{item.label}</div>
                          {item.description && (
                            <div
                              className={`text-[10px] truncate leading-tight ${
                                isActive ? 'text-primary-foreground/80' : 'text-muted-foreground'
                              }`}
                            >
                              {item.description}
                            </div>
                          )}
                        </div>
                      </>
                    )
                  ) : (
                    <Icon
                      className={`w-4 h-4 shrink-0 transition-transform ${
                        isActive ? 'text-primary-foreground scale-105' : 'text-sidebar-foreground/70'
                      }`}
                    />
                  )}

                  {/* Badge Counter */}
                  {item.badge !== undefined && (
                    <span
                      className={`${
                        isExpanded ? 'ml-auto' : 'absolute -top-1 -right-1'
                      } bg-primary text-primary-foreground text-[10px] font-bold px-1.5 py-0.2 rounded-full min-w-[16px] text-center border border-sidebar-border`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>

                {/* Floating Tooltip (Only when collapsed) */}
                {!isExpanded && (
                  <div className="absolute left-14 top-1/2 -translate-y-1/2 ml-2 px-2.5 py-1.5 bg-card border border-border text-foreground text-xs rounded-xl shadow-xl whitespace-nowrap pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-50">
                    <p className="font-bold">{item.label}</p>
                    {item.description && <p className="text-[10px] text-muted-foreground">{item.description}</p>}
                    {item.targetCanvas && (
                      <p className="text-[10px] text-primary capitalize mt-0.5 font-mono">
                        Canvas: {item.targetCanvas.replace('_', ' ')}
                      </p>
                    )}
                    {item.targetSidebar && (
                      <p className="text-[9px] text-muted-foreground font-mono">
                        Panel: {item.targetSidebar.replace('_', ' ')}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </React.Fragment>
          );
        })}

          {/* Add / Slot Customizer Button */}
          <button
            type="button"
            onClick={() => setIsConfigModalOpen(true)}
            className={`rounded-xl text-muted-foreground hover:text-primary hover:bg-sidebar-accent border border-dashed border-sidebar-border hover:border-primary/50 transition-all mt-1 cursor-pointer flex items-center ${
              isExpanded ? 'gap-2 px-2.5 py-1.5 w-full text-xs font-medium' : 'justify-center h-10 w-10 mx-auto'
            }`}
            title="Configure Activity Rail Slots"
          >
            <Plus className="w-4 h-4 shrink-0" />
            {isExpanded && <span>Add Custom Slot...</span>}
          </button>
        </div>
      </div>

      {/* ── 3. Bottom of Rail: Inspector, Settings & ED Expand Badge ── */}
      <div className="flex flex-col gap-1.5 w-full pt-2 border-t border-sidebar-border">
        {/* Antigravity UI Location Inspector Button */}
        <button
          type="button"
          onClick={() => setIsInspectorOpen(true)}
          className={`rounded-xl text-sidebar-foreground/70 hover:text-primary hover:bg-sidebar-accent transition-all cursor-pointer flex items-center ${
            isExpanded ? 'gap-2.5 px-2.5 py-2 w-full text-xs font-medium' : 'justify-center h-10 w-10 mx-auto'
          }`}
          title="Inspect UI Location (Eye Tool - Copy context or create CR)"
        >
          <Eye className="w-4 h-4 shrink-0" />
          {isExpanded && <span>UI Context Inspector</span>}
        </button>

        {/* Settings & Ingestion Button */}
        <button
          type="button"
          onClick={() => setIsConfigModalOpen(true)}
          className={`rounded-xl text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-all cursor-pointer flex items-center ${
            isExpanded ? 'gap-2.5 px-2.5 py-2 w-full text-xs font-medium' : 'justify-center h-10 w-10 mx-auto'
          }`}
          title="EA Designer & System Settings"
        >
          <Sliders className="w-4 h-4 shrink-0" />
          {isExpanded && <span>Settings & Ingestion</span>}
        </button>

        {/* Bottom Expand Toggle Button (When Collapsed) */}
        {!isExpanded && (
          <button
            type="button"
            onClick={() => setIsExpanded(true)}
            className="w-10 h-10 mx-auto rounded-xl flex items-center justify-center text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-all cursor-pointer"
            title="Expand Activity Rail"
          >
            <PanelLeftOpen className="w-4 h-4" />
          </button>
        )}

        {/* ── 4. Authoritative ED Provenance Badge ── */}
        <div
          onClick={() => !isExpanded && setIsExpanded(true)}
          className={`rounded-xl bg-sidebar-accent/60 border border-border/80 flex items-center cursor-pointer hover:border-primary/40 transition-all ${
            isExpanded ? 'gap-2.5 p-2 w-full' : 'justify-center h-9 w-9 mx-auto'
          }`}
          title="Authoritative PostgreSQL Storage (DES_BASE:8088) — Click to Expand"
        >
          <div className="w-6 h-6 rounded-lg bg-primary/20 text-primary border border-primary/30 flex items-center justify-center font-bold text-[10px] shrink-0">
            ED
          </div>
          {isExpanded && (
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-foreground truncate">DES_BASE</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              </div>
              <p className="text-[9px] font-mono text-muted-foreground truncate">Port 8088 • Authoritative</p>
            </div>
          )}
        </div>
      </div>

      {/* Settings Modal */}
      <SlotConfigModal />

      {/* Centered UI Context & CR Inspector Modal */}
      <UILocationInspectorModal
        isOpen={isInspectorOpen}
        onClose={() => setIsInspectorOpen(false)}
      />
    </aside>
  );
};

export default ActivityRail;
