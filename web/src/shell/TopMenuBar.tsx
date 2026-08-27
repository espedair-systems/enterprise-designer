import React, { useState } from 'react';
import {
  Save,
  Download,
  Sliders,
  ChevronDown,
  PanelLeftClose,
  PanelLeftOpen,
  PanelRightClose,
  PanelRightOpen,
  PanelBottomClose,
  PanelBottomOpen,
} from 'lucide-react';
import { useLayout } from './LayoutContext';
import { AppExportModal } from '../components/export/AppExportModal';

export const TopMenuBar: React.FC = () => {
  const {
    slots,
    currentApp,
    appsList,
    selectApp,
    isSaving,
    saveLayoutToBackend,
    environment,
    setEnvironment,
    setIsConfigModalOpen,
    leftSidebarOpen,
    toggleLeftSidebar,
    rightSidebarOpen,
    toggleRightSidebar,
    bottomTrayOpen,
    toggleBottomTray,
  } = useLayout();

  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [showAppDropdown, setShowAppDropdown] = useState<boolean>(false);
  const [showExportModal, setShowExportModal] = useState<boolean>(false);

  const handleSave = async () => {
    await saveLayoutToBackend();
  };

  return (
    <header
      className="h-12 bg-card border-b border-border px-3 flex items-center justify-between select-none z-20 backdrop-blur-md shrink-0 shadow-xs"
      aria-label="Top Menu Bar"
    >
      {/* Left: App Title & Dropdown Menus */}
      <div className="flex items-center gap-3">
        {/* App Switcher */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowAppDropdown(!showAppDropdown)}
            className="flex items-center gap-2 px-2.5 py-1 bg-muted hover:bg-muted/80 border border-border rounded-lg text-xs font-semibold text-foreground transition-colors shadow-xs"
          >
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="max-w-[140px] truncate">{currentApp ? currentApp.name : 'Fleet Logistics Studio'}</span>
            <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
          </button>

          {showAppDropdown && (
            <div className="absolute left-0 top-full mt-1 w-64 bg-card border border-border rounded-xl shadow-2xl py-1 z-50">
              <div className="px-3 py-1.5 text-[10px] font-bold text-muted-foreground uppercase tracking-wider border-b border-border">
                Switch Studio / Agent App
              </div>
              <div className="max-h-60 overflow-y-auto">
                {appsList.length === 0 ? (
                  <div className="px-3 py-2 text-xs text-muted-foreground">No applications registered</div>
                ) : (
                  appsList.map((app) => (
                    <button
                      key={app.id}
                      type="button"
                      onClick={() => {
                        selectApp(app);
                        setShowAppDropdown(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-muted transition-colors ${
                        currentApp?.id === app.id ? 'text-primary bg-primary/10 font-semibold' : 'text-foreground'
                      }`}
                    >
                      <div>
                        <p className="font-medium">{app.name}</p>
                        <p className="text-[10px] text-muted-foreground">{app.app_type} • {app.slug}</p>
                      </div>
                      <span className="text-[10px] uppercase px-1.5 py-0.5 rounded bg-muted text-muted-foreground border border-border">
                        {app.status}
                      </span>
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Customizable Top Dropdown Menus */}
        <div className="hidden md:flex items-center gap-1">
          {slots.menu_bar.menus.map((menu) => (
            <div key={menu} className="relative">
              <button
                type="button"
                onClick={() => setActiveMenu(activeMenu === menu ? null : menu)}
                className={`px-2.5 py-1 text-xs rounded-lg hover:bg-muted transition-colors ${
                  activeMenu === menu ? 'bg-muted text-primary font-semibold' : 'text-muted-foreground'
                }`}
              >
                {menu}
              </button>

              {activeMenu === menu && (
                <div
                  className="absolute left-0 top-full mt-1 w-48 bg-card border border-border rounded-xl shadow-xl py-1 z-50 text-xs text-foreground"
                  onMouseLeave={() => setActiveMenu(null)}
                >
                  <div className="px-3 py-1.5 hover:bg-muted cursor-pointer flex items-center justify-between">
                    <span>New Component</span>
                    <span className="text-[10px] text-muted-foreground">⌘N</span>
                  </div>
                  <div className="px-3 py-1.5 hover:bg-muted cursor-pointer flex items-center justify-between">
                    <span>Export Schema DDL</span>
                    <span className="text-[10px] text-muted-foreground">⌘E</span>
                  </div>
                  <div className="w-full h-px bg-border my-1" />
                  <div
                    className="px-3 py-1.5 hover:bg-muted cursor-pointer flex items-center justify-between text-primary font-semibold"
                    onClick={() => {
                      setIsConfigModalOpen(true);
                      setActiveMenu(null);
                    }}
                  >
                    <span>Configure Settings...</span>
                    <Sliders className="w-3.5 h-3.5" />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Center: Active App Context, Schema & Environment Badge */}
      <div className="hidden lg:flex items-center gap-2.5 bg-muted/60 border border-border px-3 py-1.5 rounded-lg">
        <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          {currentApp ? currentApp.name : 'EA Designer Studio'}
        </span>

        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-card text-primary border border-border font-bold">
          DES_BASE
        </span>

        <div className="w-px h-3.5 bg-border" />

        {/* Environment Badge */}
        <div className="flex items-center gap-1 px-1.5 py-0.5 bg-card rounded text-[11px] font-semibold border border-border">
          <span className="text-muted-foreground text-[10px]">ENV:</span>
          {(['DEV', 'TEST', 'STAGING', 'PROD'] as const).map((env) => (
            <button
              key={env}
              type="button"
              onClick={() => setEnvironment(env)}
              className={`px-1.5 py-0.2 rounded text-[10px] font-bold transition-all ${
                environment === env
                  ? env === 'PROD'
                    ? 'bg-rose-600 text-white'
                    : 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {env}
            </button>
          ))}
        </div>
      </div>

      {/* Right: Actions & Panel Toggles */}
      <div className="flex items-center gap-2">
        {/* Export Binary / Release Pipeline */}
        <button
          type="button"
          onClick={() => setShowExportModal(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-muted hover:bg-muted/80 text-foreground text-xs font-semibold rounded-lg border border-border shadow-xs transition-colors"
          title="Compile Standalone Binary or Package Source"
        >
          <Download className="w-3.5 h-3.5 text-primary" />
          <span>Export Binary</span>
        </button>

        {/* Save Layout DSL */}
        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-primary hover:bg-primary/90 disabled:opacity-50 text-primary-foreground text-xs font-semibold rounded-lg shadow-xs transition-colors"
        >
          <Save className={`w-3.5 h-3.5 ${isSaving ? 'animate-spin' : ''}`} />
          <span>{isSaving ? 'Saving...' : 'Save DSL'}</span>
        </button>

        {/* Panel Toggles */}
        <div className="flex items-center gap-1 bg-muted border border-border p-1 rounded-lg">
          <button
            type="button"
            onClick={toggleLeftSidebar}
            className={`p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-card transition-colors ${
              leftSidebarOpen ? 'text-primary bg-card shadow-xs' : ''
            }`}
            title={leftSidebarOpen ? 'Collapse Left Sidebar' : 'Expand Left Sidebar'}
          >
            {leftSidebarOpen ? <PanelLeftClose className="w-4 h-4" /> : <PanelLeftOpen className="w-4 h-4" />}
          </button>

          <button
            type="button"
            onClick={toggleBottomTray}
            className={`p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-card transition-colors ${
              bottomTrayOpen ? 'text-primary bg-card shadow-xs' : ''
            }`}
            title={bottomTrayOpen ? 'Collapse Bottom Console' : 'Expand Bottom Console'}
          >
            {bottomTrayOpen ? <PanelBottomClose className="w-4 h-4" /> : <PanelBottomOpen className="w-4 h-4" />}
          </button>

          <button
            type="button"
            onClick={toggleRightSidebar}
            className={`p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-card transition-colors ${
              rightSidebarOpen ? 'text-primary bg-card shadow-xs' : ''
            }`}
            title={rightSidebarOpen ? 'Collapse Right Inspector' : 'Expand Right Inspector'}
          >
            {rightSidebarOpen ? <PanelRightClose className="w-4 h-4" /> : <PanelRightOpen className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Export Release Centered Modal */}
      <AppExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
      />
    </header>
  );
};
