import React, { useState } from 'react';
import {
  Moon,
  Sun,
  Sliders,
  Terminal,
  FileCheck2,
  HardDrive,
  CheckCircle2,
  Layers,
  Palette,
  Sparkles,
  LayoutGrid,
  Monitor,
  Check,
} from 'lucide-react';
import { useTheme } from '../theme/ThemeProvider';
import clsx from 'clsx';

const ACCENT_COLORS = [
  { name: 'Indigo / Cyan (Default)', value: 'indigo', class: 'bg-indigo-500' },
  { name: 'Emerald / Mint', value: 'emerald', class: 'bg-emerald-500' },
  { name: 'Violet / Purple', value: 'violet', class: 'bg-purple-500' },
  { name: 'Amber / Gold', value: 'amber', class: 'bg-amber-500' },
  { name: 'Rose / Crimson', value: 'rose', class: 'bg-rose-500' },
  { name: 'Sky / Ocean', value: 'sky', class: 'bg-sky-500' },
];

export function UISettingsView() {
  const { theme, setTheme } = useTheme();

  // Page size & density state
  const [pageSize, setPageSize] = useState<number>(25);
  const [uiDensity, setUiDensity] = useState<'compact' | 'normal' | 'relaxed'>('normal');

  // Diagram & Canvas configuration state
  const [diagramConfig, setDiagramConfig] = useState({
    nodeLimit: 100,
    warnOnLimitExceeded: true,
    canvasGrid: true,
    snapToGrid: true,
    showMinimap: true,
  });

  // Logging configuration state
  const [loggingConfig, setLoggingConfig] = useState({
    browserConsoleEnabled: true,
    terminalLoggingEnabled: true,
    logLevel: 'INFO',
  });

  // UI preferences state
  const [selectedAccent, setSelectedAccent] = useState('indigo');

  return (
    <div className="flex-1 flex flex-col h-full bg-background text-foreground overflow-y-auto">
      {/* Header */}
      <header className="bg-card border-b border-border px-8 py-5 flex items-center justify-between shrink-0 shadow-xs">
        <div className="flex items-center gap-3.5">
          <div className="p-2.5 rounded-2xl bg-primary/10 border border-primary/20 text-primary">
            <Sliders className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-foreground">UI Settings & Preferences</h1>
              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-primary/10 text-primary border border-primary/20">
                APPEARANCE
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Customize interface themes, visual accent palettes, canvas diagram defaults, and frontend behaviors.
            </p>
          </div>
        </div>
      </header>

      {/* Main Settings Body */}
      <main className="p-8 max-w-5xl space-y-8">
        {/* 1. Theme & Appearance */}
        <section className="bg-card rounded-2xl border border-border p-6 shadow-xs space-y-5">
          <div className="flex items-center justify-between border-b border-border pb-4">
            <div className="flex items-center gap-2.5">
              <Palette className="h-5 w-5 text-primary" />
              <div>
                <h2 className="text-sm font-bold text-foreground">Theme & Visual Appearance</h2>
                <p className="text-xs text-muted-foreground">Select color mode and interface styling for optimal contrast.</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Dark Theme Card */}
            <button
              type="button"
              onClick={() => setTheme('dark')}
              className={clsx(
                'p-4 rounded-xl border text-left transition-all relative cursor-pointer flex flex-col justify-between h-28',
                theme === 'dark'
                  ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                  : 'border-border bg-card/60 hover:bg-muted/40'
              )}
            >
              <div className="flex items-center justify-between">
                <div className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-100">
                  <Moon className="h-4 w-4" />
                </div>
                {theme === 'dark' && <CheckCircle2 className="h-4 w-4 text-primary" />}
              </div>
              <div>
                <span className="text-xs font-bold text-foreground block">Dark Mode</span>
                <span className="text-[11px] text-muted-foreground">Sleek obsidian palette with high contrast</span>
              </div>
            </button>

            {/* Light Theme Card */}
            <button
              type="button"
              onClick={() => setTheme('light')}
              className={clsx(
                'p-4 rounded-xl border text-left transition-all relative cursor-pointer flex flex-col justify-between h-28',
                theme === 'light'
                  ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                  : 'border-border bg-card/60 hover:bg-muted/40'
              )}
            >
              <div className="flex items-center justify-between">
                <div className="p-2 rounded-lg bg-zinc-100 border border-zinc-200 text-zinc-900">
                  <Sun className="h-4 w-4" />
                </div>
                {theme === 'light' && <CheckCircle2 className="h-4 w-4 text-primary" />}
              </div>
              <div>
                <span className="text-xs font-bold text-foreground block">Light Mode</span>
                <span className="text-[11px] text-muted-foreground">Clean, daylight-optimized presentation</span>
              </div>
            </button>

            {/* Cyber Charcoal / Midnight Theme Card */}
            <button
              type="button"
              onClick={() => setTheme('midnight')}
              className={clsx(
                'p-4 rounded-xl border text-left transition-all relative cursor-pointer flex flex-col justify-between h-28',
                theme === 'midnight'
                  ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                  : 'border-border bg-card/60 hover:bg-muted/40'
              )}
            >
              <div className="flex items-center justify-between">
                <div className="p-2 rounded-lg bg-cyan-950 border border-cyan-800 text-cyan-400">
                  <Sparkles className="h-4 w-4" />
                </div>
                {theme === 'midnight' && <CheckCircle2 className="h-4 w-4 text-primary" />}
              </div>
              <div>
                <span className="text-xs font-bold text-foreground block">Obsidian / Cyber Mode</span>
                <span className="text-[11px] text-muted-foreground">Deep indigo & cyan futuristic aesthetic</span>
              </div>
            </button>
          </div>

          {/* Accent Color Palette */}
          <div className="pt-2 border-t border-border/60">
            <label className="text-xs font-bold text-foreground block mb-2.5">
              Theme Accent Color
            </label>
            <div className="flex flex-wrap gap-3">
              {ACCENT_COLORS.map((acc) => (
                <button
                  key={acc.value}
                  type="button"
                  onClick={() => setSelectedAccent(acc.value)}
                  className={clsx(
                    'flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-medium transition-all cursor-pointer',
                    selectedAccent === acc.value
                      ? 'border-foreground/30 bg-muted/60 text-foreground font-semibold ring-1 ring-border'
                      : 'border-border bg-background text-muted-foreground hover:text-foreground'
                  )}
                >
                  <span className={clsx('w-3 h-3 rounded-full', acc.class)} />
                  <span>{acc.name}</span>
                  {selectedAccent === acc.value && <Check className="h-3 w-3 text-primary ml-1" />}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* 2. Canvas & Diagram Modeler Defaults */}
        <section className="bg-card rounded-2xl border border-border p-6 shadow-xs space-y-5">
          <div className="flex items-center justify-between border-b border-border pb-4">
            <div className="flex items-center gap-2.5">
              <LayoutGrid className="h-5 w-5 text-cyan-500" />
              <div>
                <h2 className="text-sm font-bold text-foreground">Canvas & Diagram Modeler</h2>
                <p className="text-xs text-muted-foreground">Configure ArchiMate, Fact Sheet, and visual diagram node thresholds and behaviors.</p>
              </div>
            </div>
          </div>

          {/* Node Threshold & Performance Warning */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 rounded-xl bg-muted/20 border border-border">
            <div className="space-y-1.5">
              <label htmlFor="diagramNodeLimit" className="text-xs font-semibold text-foreground block">
                Diagram Node Threshold Limit
              </label>
              <select
                id="diagramNodeLimit"
                value={diagramConfig.nodeLimit}
                onChange={(e) => setDiagramConfig((prev) => ({ ...prev, nodeLimit: Number(e.target.value) || 100 }))}
                className="w-full px-3 py-2 text-xs rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
              >
                <option value={50}>50 nodes (Strict / High Performance)</option>
                <option value={100}>100 nodes (Default Recommended)</option>
                <option value={150}>150 nodes</option>
                <option value={200}>200 nodes (Dense Models)</option>
                <option value={500}>500 nodes (Large Ecosystems)</option>
              </select>
              <p className="text-[11px] text-muted-foreground">
                Diagrams containing more than {diagramConfig.nodeLimit} nodes will prompt a confirmation warning before rendering.
              </p>
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-xl border border-border bg-background">
              <div>
                <span className="text-xs font-semibold text-foreground block">Warn on Exceeding Node Limit</span>
                <span className="text-[10px] text-muted-foreground">
                  Prompt confirmation warning before loading dense graphs
                </span>
              </div>
              <input
                type="checkbox"
                checked={diagramConfig.warnOnLimitExceeded}
                onChange={(e) => setDiagramConfig((prev) => ({ ...prev, warnOnLimitExceeded: e.target.checked }))}
                className="h-4 w-4 rounded border-border text-primary focus:ring-primary cursor-pointer"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <label className="flex items-center justify-between p-3.5 rounded-xl border border-border bg-background cursor-pointer hover:bg-muted/30 transition-colors">
              <div>
                <span className="text-xs font-semibold text-foreground block">Background Grid</span>
                <span className="text-[10px] text-muted-foreground">Show dot / mesh grid on canvases</span>
              </div>
              <input
                type="checkbox"
                checked={diagramConfig.canvasGrid}
                onChange={(e) => setDiagramConfig((prev) => ({ ...prev, canvasGrid: e.target.checked }))}
                className="h-4 w-4 rounded border-border text-primary focus:ring-primary cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between p-3.5 rounded-xl border border-border bg-background cursor-pointer hover:bg-muted/30 transition-colors">
              <div>
                <span className="text-xs font-semibold text-foreground block">Snap to Grid</span>
                <span className="text-[10px] text-muted-foreground">Align elements to 16px raster</span>
              </div>
              <input
                type="checkbox"
                checked={diagramConfig.snapToGrid}
                onChange={(e) => setDiagramConfig((prev) => ({ ...prev, snapToGrid: e.target.checked }))}
                className="h-4 w-4 rounded border-border text-primary focus:ring-primary cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between p-3.5 rounded-xl border border-border bg-background cursor-pointer hover:bg-muted/30 transition-colors">
              <div>
                <span className="text-xs font-semibold text-foreground block">Canvas Minimap</span>
                <span className="text-[10px] text-muted-foreground">Display visual overview radar</span>
              </div>
              <input
                type="checkbox"
                checked={diagramConfig.showMinimap}
                onChange={(e) => setDiagramConfig((prev) => ({ ...prev, showMinimap: e.target.checked }))}
                className="h-4 w-4 rounded border-border text-primary focus:ring-primary cursor-pointer"
              />
            </label>
          </div>
        </section>

        {/* 3. Pagination & Layout Density */}
        <section className="bg-card rounded-2xl border border-border p-6 shadow-xs space-y-5">
          <div className="flex items-center justify-between border-b border-border pb-4">
            <div className="flex items-center gap-2.5">
              <Layers className="h-5 w-5 text-purple-500" />
              <div>
                <h2 className="text-sm font-bold text-foreground">Pagination & Data Grid Density</h2>
                <p className="text-xs text-muted-foreground">Set page sizes and table record density across the workspace.</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label htmlFor="pageSizeSelect" className="text-xs font-semibold text-foreground block">
                Default Fact Sheets Per Page (Data Entities & Tables)
              </label>
              <select
                id="pageSizeSelect"
                value={pageSize}
                onChange={(e) => setPageSize(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
              >
                <option value={10}>10 records / page (Compact)</option>
                <option value={25}>25 records / page (Standard)</option>
                <option value={50}>50 records / page</option>
                <option value={100}>100 records / page (Bulk Analysis)</option>
                <option value={250}>250 records / page (High Throughput)</option>
              </select>
              <p className="text-[11px] text-muted-foreground">
                Applies to Capabilities inventory, SIPOC tables, and entity catalogs.
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground block">
                Interface Layout Density
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['compact', 'normal', 'relaxed'] as const).map((density) => (
                  <button
                    key={density}
                    type="button"
                    onClick={() => setUiDensity(density)}
                    className={clsx(
                      'py-2 px-3 rounded-xl border text-xs font-medium capitalize transition-all cursor-pointer',
                      uiDensity === density
                        ? 'border-primary bg-primary/10 text-primary font-bold'
                        : 'border-border bg-background text-muted-foreground hover:text-foreground'
                    )}
                  >
                    {density}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* 4. Logging & Diagnostics */}
        <section className="bg-card rounded-2xl border border-border p-6 shadow-xs space-y-5">
          <div className="flex items-center justify-between border-b border-border pb-4">
            <div className="flex items-center gap-2.5">
              <Terminal className="h-5 w-5 text-amber-500" />
              <div>
                <h2 className="text-sm font-bold text-foreground">Logging & Diagnostics</h2>
                <p className="text-xs text-muted-foreground">Configure client-side telemetry and logging outputs.</p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-foreground block">Browser Console Logging</span>
                <span className="text-[10px] text-muted-foreground">Emit state and mutation logs to browser console</span>
              </div>
              <input
                type="checkbox"
                checked={loggingConfig.browserConsoleEnabled}
                onChange={(e) => setLoggingConfig((prev) => ({ ...prev, browserConsoleEnabled: e.target.checked }))}
                className="h-4 w-4 rounded border-border text-primary focus:ring-primary cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-foreground block">Terminal User Interface (TUI) Telemetry</span>
                <span className="text-[10px] text-muted-foreground">Forward execution logs to Bubbletea TUI and stdout</span>
              </div>
              <input
                type="checkbox"
                checked={loggingConfig.terminalLoggingEnabled}
                onChange={(e) => setLoggingConfig((prev) => ({ ...prev, terminalLoggingEnabled: e.target.checked }))}
                className="h-4 w-4 rounded border-border text-primary focus:ring-primary cursor-pointer"
              />
            </div>

            <div className="pt-2 border-t border-border/60 flex items-center justify-between">
              <label htmlFor="logLevelSelect" className="text-xs font-semibold text-foreground">
                Minimum Log Severity Level
              </label>
              <select
                id="logLevelSelect"
                value={loggingConfig.logLevel}
                onChange={(e) => setLoggingConfig((prev) => ({ ...prev, logLevel: e.target.value }))}
                className="px-3 py-1.5 text-xs rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
              >
                <option value="DEBUG">DEBUG (Verbose)</option>
                <option value="INFO">INFO (Standard)</option>
                <option value="WARN">WARN (Warnings Only)</option>
                <option value="ERROR">ERROR (Critical Only)</option>
              </select>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
