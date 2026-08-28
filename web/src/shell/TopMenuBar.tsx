import React, { useState } from 'react';
import {
  LayoutDashboard,
  FolderCode,
  Layout,
  Database,
  Bot,
  HelpCircle,
  FileCode2,
  PanelLeftClose,
  PanelLeftOpen,
  PanelRightClose,
  PanelRightOpen,
  PanelBottomClose,
  PanelBottomOpen,
  Eye,
  Save,
} from 'lucide-react';
import { useLayout } from './LayoutContext';
import { DesignerDomainMode } from './types';
import { UILocationInspectorModal } from '../components/common/UILocationInspectorModal';

interface DomainModeTab {
  id: DesignerDomainMode;
  label: string;
  subLabel: string;
  icon: React.ComponentType<{ className?: string }>;
}

const DOMAIN_MODE_TABS: DomainModeTab[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    subLabel: 'Overview & Metrics',
    icon: LayoutDashboard,
  },
  {
    id: 'projects',
    label: 'Project Registry',
    subLabel: 'Apps Registry & Builds',
    icon: FolderCode,
  },
  {
    id: 'ui_designer',
    label: 'UI Designer',
    subLabel: 'Grid & Wireframe Sketch',
    icon: Layout,
  },
  {
    id: 'data_designer',
    label: 'Data Designer',
    subLabel: 'ER Schemas & Lineage',
    icon: Database,
  },
  {
    id: 'agent_designer',
    label: 'Agent Designer',
    subLabel: 'Autonomous Workflows',
    icon: Bot,
  },
  {
    id: 'q_designer',
    label: 'Q Designer',
    subLabel: 'Surveys & Questionnaires',
    icon: HelpCircle,
  },
  {
    id: 'schema_designer',
    label: 'Schema & API Designer',
    subLabel: 'JSON Schema & OpenAPI 3.1',
    icon: FileCode2,
  },
];

export const TopMenuBar: React.FC = () => {
  const {
    currentApp,
    isSaving,
    autosaveEnabled,
    lastSavedTime,
    domainMode,
    setDomainMode,
    leftSidebarOpen,
    toggleLeftSidebar,
    rightSidebarOpen,
    toggleRightSidebar,
    bottomTrayOpen,
    toggleBottomTray,
  } = useLayout();

  const [showInspectorModal, setShowInspectorModal] = useState<boolean>(false);

  return (
    <header
      className="h-14 bg-card border-b border-border px-3.5 flex items-center justify-between select-none z-30 shrink-0 shadow-xs backdrop-blur-md"
      aria-label="Top Menu Bar"
    >
      {/* ── Left: 4 Domain Mode Badges (Flush Left-Aligned with Canvas) ── */}
      <div className="flex items-center gap-2 min-w-0 flex-1 overflow-x-auto scrollbar-none py-1">
        {DOMAIN_MODE_TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = domainMode === tab.id;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setDomainMode(tab.id)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                isActive
                  ? 'bg-primary text-primary-foreground shadow-xs font-bold'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              <Icon
                className={`w-4 h-4 shrink-0 transition-transform ${
                  isActive ? 'text-primary-foreground scale-105' : 'text-muted-foreground'
                }`}
              />
              <div className="text-left leading-none">
                <div
                  className={`text-xs font-semibold ${
                    isActive ? 'text-primary-foreground font-bold' : 'text-foreground'
                  }`}
                >
                  {tab.label}
                </div>
                <div
                  className={`text-[9px] mt-0.5 ${
                    isActive ? 'text-primary-foreground/80' : 'text-muted-foreground'
                  }`}
                >
                  {tab.subLabel}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* ── Right: Active Project Badge, Autosave Status, Eye Inspector & Panel Toggles ── */}
      <div className="flex items-center gap-2 shrink-0 ml-3">
        {/* Active Project & Schema Badge */}
        {currentApp && (
          <div
            onClick={() => setDomainMode('dashboard')}
            className="hidden xl:flex items-center gap-2 px-2.5 py-1 bg-muted/60 hover:bg-muted border border-border rounded-xl text-xs font-semibold text-foreground transition-all cursor-pointer shadow-2xs"
            title="Active Enterprise Project (Click to view Projects Dashboard)"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
            <span className="max-w-[140px] truncate font-bold">{currentApp.name}</span>
            <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-card text-primary border border-border font-bold">
              DES_BASE
            </span>
          </div>
        )}

        {/* Autosave Status Indicator */}
        <div
          className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 bg-muted/40 border border-border/80 rounded-xl text-[11px] font-mono"
          title={
            autosaveEnabled
              ? lastSavedTime
                ? `Autosaved to DES_BASE at ${lastSavedTime.toLocaleTimeString()}`
                : 'Autosave to DES_BASE is Active'
              : 'Autosave Disabled (Manage in Settings)'
          }
        >
          {isSaving ? (
            <>
              <Save className="w-3 h-3 text-primary animate-spin" />
              <span className="text-primary font-semibold">Saving...</span>
            </>
          ) : autosaveEnabled ? (
            <>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-muted-foreground">Autosave</span>
            </>
          ) : (
            <>
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
              <span className="text-muted-foreground">Manual</span>
            </>
          )}
        </div>

        {/* Antigravity UI Location Inspector Button */}
        <button
          type="button"
          onClick={() => setShowInspectorModal(true)}
          className="p-2 rounded-xl bg-muted/50 hover:bg-primary/10 text-muted-foreground hover:text-primary border border-border/60 hover:border-primary/30 transition-all cursor-pointer shadow-2xs"
          title="Inspect UI Location (Eye Tool - Copy context or create CR)"
        >
          <Eye className="w-4 h-4" />
        </button>

        {/* Panel Toggles */}
        <div className="flex items-center gap-0.5 bg-muted/60 border border-border p-0.5 rounded-xl">
          {domainMode !== 'dashboard' && domainMode !== 'projects' && (
            <button
              type="button"
              onClick={toggleLeftSidebar}
              className={`p-1.5 rounded-lg text-muted-foreground hover:text-foreground transition-colors cursor-pointer ${
                leftSidebarOpen ? 'text-primary bg-card shadow-xs' : ''
              }`}
              title={leftSidebarOpen ? 'Collapse Left Tool Panel' : 'Expand Left Tool Panel'}
            >
              {leftSidebarOpen ? <PanelLeftClose className="w-3.5 h-3.5" /> : <PanelLeftOpen className="w-3.5 h-3.5" />}
            </button>
          )}

          <button
            type="button"
            onClick={toggleBottomTray}
            className={`p-1.5 rounded-lg text-muted-foreground hover:text-foreground transition-colors cursor-pointer ${
              bottomTrayOpen ? 'text-primary bg-card shadow-xs' : ''
            }`}
            title={bottomTrayOpen ? 'Collapse Bottom Console' : 'Expand Bottom Console'}
          >
            {bottomTrayOpen ? <PanelBottomClose className="w-3.5 h-3.5" /> : <PanelBottomOpen className="w-3.5 h-3.5" />}
          </button>

          <button
            type="button"
            onClick={toggleRightSidebar}
            className={`p-1.5 rounded-lg text-muted-foreground hover:text-foreground transition-colors cursor-pointer ${
              rightSidebarOpen ? 'text-primary bg-card shadow-xs' : ''
            }`}
            title={rightSidebarOpen ? 'Collapse Right Inspector' : 'Expand Right Inspector'}
          >
            {rightSidebarOpen ? <PanelRightClose className="w-3.5 h-3.5" /> : <PanelRightOpen className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Centered UI Context & CR Inspector Modal */}
      <UILocationInspectorModal
        isOpen={showInspectorModal}
        onClose={() => setShowInspectorModal(false)}
      />
    </header>
  );
};

export default TopMenuBar;
