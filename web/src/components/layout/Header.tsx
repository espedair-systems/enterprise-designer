import React, { useState } from 'react';
import {
  LayoutDashboard,
  Compass,
  Bot,
  Briefcase,
  Database,
  Binary,
  Users,
  FileSpreadsheet,
  Plug,
  Settings,
  HelpCircle,
  Sun,
  Moon,
  ShieldCheck,
  Search,
  Eye,
} from 'lucide-react';
import { useStore, AppMode, NavView } from '../../store/useStore';
import { useTheme } from '../theme/ThemeProvider';
import { UILocationInspectorModal } from '../common/UILocationInspectorModal';

interface ModeTab {
  id: AppMode;
  defaultView: NavView;
  label: string;
  subLabel: string;
  icon: React.ReactNode;
}

const TOP_MODES: ModeTab[] = [
  {
    id: 'dashboard',
    defaultView: 'dashboard',
    label: 'Dashboard',
    subLabel: 'Base Overview',
    icon: <LayoutDashboard className="w-4 h-4" />,
  },
];

export const Header: React.FC = () => {
  const { appMode, setAppMode, setActiveView, currentUser, openModal } = useStore();
  const { theme, toggleTheme } = useTheme();
  const [inspectorOpen, setInspectorOpen] = useState(false);

  const handleSelectMode = (tab: ModeTab) => {
    setAppMode(tab.id);
    setActiveView(tab.defaultView);
  };

  return (
    <>
      <header className="h-14 bg-card border-b border-border px-4 flex items-center justify-between select-none z-30 shrink-0 shadow-xs transition-colors">
        {/* Left / Center: Top Mode Tabs (Dashboard, Architect, HR, BA) */}
        <div className="flex items-center gap-1.5">
          {TOP_MODES.map((tab) => {
            const isActive = appMode === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleSelectMode(tab)}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-xs font-bold'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                <span className="shrink-0">{tab.icon}</span>
                <div className="text-left">
                  <span className="block leading-tight">{tab.label}</span>
                  <span className={`text-[9px] block leading-none ${isActive ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>
                    {tab.subLabel}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Right Controls: Inspector, Quick Search (Cmd+K), Platforms, Settings, Help, Theme Toggle & Profile */}
        <div className="flex items-center gap-2 shrink-0 pl-3 border-l border-border">
          {/* Antigravity UI Location Inspector Button */}
          <button
            onClick={() => setInspectorOpen(true)}
            className="p-1.5 rounded-xl bg-muted/50 hover:bg-primary/10 text-muted-foreground hover:text-primary border border-border/60 hover:border-primary/30 transition-all cursor-pointer shadow-2xs"
            title="Inspect UI Location (Copy component context for Antigravity prompt)"
          >
            <Eye className="w-4 h-4" />
          </button>

          {/* Quick Search Button (Cmd+K) */}
          <button
            onClick={() => {
              const event = new KeyboardEvent('keydown', { key: 'k', metaKey: true, ctrlKey: true });
              window.dispatchEvent(event);
            }}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-muted/60 hover:bg-muted border border-border text-xs text-muted-foreground hover:text-foreground transition-all cursor-pointer shadow-2xs"
            title="Open Command Palette (Ctrl+K or Cmd+K)"
          >
            <Search className="w-3.5 h-3.5 text-primary" />
            <span className="hidden xl:inline text-[11px] font-medium">Quick Search</span>
            <kbd className="px-1.5 py-0.2 text-[9px] font-mono font-bold bg-card border border-border rounded text-muted-foreground">
              ⌘K
            </kbd>
          </button>

          {/* Platforms Hub */}
          <button
            onClick={() => {
              setAppMode('platforms');
              setActiveView('platforms-overview');
            }}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
              appMode === 'platforms'
                ? 'bg-primary text-primary-foreground font-semibold shadow-xs'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            }`}
            title="Platforms & Integrations Hub"
          >
            <Plug className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Platforms</span>
          </button>

          {/* Settings */}
          <button
            onClick={() => {
              setAppMode('settings');
              setActiveView('settings');
            }}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
              appMode === 'settings'
                ? 'bg-primary text-primary-foreground font-semibold shadow-xs'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            }`}
            title="System Settings & Access Governance"
          >
            <Settings className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Settings</span>
          </button>

          {/* Help */}
          <button
            onClick={() => {
              setAppMode('help');
              setActiveView('help-ea');
            }}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
              appMode === 'help'
                ? 'bg-primary text-primary-foreground font-semibold shadow-xs'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            }`}
            title="Enterprise Architecture Knowledge Base"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Help</span>
          </button>

          {/* Theme Toggle Button (Light / Dark) */}
          <button
            onClick={toggleTheme}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
            title={`Switch theme (Current: ${theme})`}
          >
            {theme === 'light' ? <Moon className="w-4 h-4 text-indigo-500" /> : <Sun className="w-4 h-4 text-amber-400" />}
          </button>

          {/* Profile Avatar Badge */}
          <button
            onClick={() => openModal('profile')}
            className="flex items-center gap-2 pl-2 pr-2.5 py-1 rounded-xl border border-border hover:bg-muted text-foreground transition-all cursor-pointer"
            title="Architect Session & Entitlements"
          >
            <div className="w-6 h-6 rounded-lg bg-primary/20 text-primary border border-primary/30 flex items-center justify-center font-bold text-[10px]">
              {currentUser.initials || 'BA'}
            </div>
            <div className="hidden lg:block max-w-[130px] text-left">
              <span className="text-[11px] font-semibold text-foreground block leading-tight truncate">
                {currentUser.name}
              </span>
            </div>
          </button>
        </div>
      </header>

      {/* Centered Modal: UI Location & Architecture Inspector */}
      <UILocationInspectorModal
        isOpen={inspectorOpen}
        onClose={() => setInspectorOpen(false)}
      />
    </>
  );
};
