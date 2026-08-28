import React, { useState } from 'react';
import {
  X,
  Sliders,
  Plus,
  Trash2,
  Check,
  Layout,
  Database,
  Terminal,
  Bot,
  Layers,
  Sparkles,
  GitBranch,
  Palette,
  HardDrive,
  Cpu,
  Download,
  Upload,
  Lock,
  Moon,
  Sun,
  Monitor,
  Shield,
  FileCheck2,
  RotateCcw,
  Users,
  Key,
  FileText,
  Activity,
  CheckCircle2,
} from 'lucide-react';
import { useLayout } from './LayoutContext';
import { RailItem, CanvasMode } from './types';
import { useTheme } from '../components/theme/ThemeProvider';

type SettingsSection = 'ui' | 'database' | 'users' | 'roles' | 'imports' | 'slots' | 'pipeline';

export const SlotConfigModal: React.FC = () => {
  const {
    slots,
    isConfigModalOpen,
    setIsConfigModalOpen,
    updateSlots,
    addRailItem,
    removeRailItem,
    saveLayoutToBackend,
    environment,
    setEnvironment,
    autosaveEnabled,
    setAutosaveEnabled,
    autosaveInterval,
    setAutosaveInterval,
  } = useLayout();

  const { theme, setTheme } = useTheme();

  const [activeSection, setActiveSection] = useState<SettingsSection>('ui');
  const [newItemLabel, setNewItemLabel] = useState<string>('');
  const [newItemIcon, setNewItemIcon] = useState<string>('LayersIcon');
  const [newItemCanvas, setNewItemCanvas] = useState<CanvasMode>('visual_canvas');
  const [gridSnap, setGridSnap] = useState<boolean>(true);
  const [selectedAccent, setSelectedAccent] = useState<string>('indigo');
  const [selectedDensity, setSelectedDensity] = useState<'compact' | 'normal' | 'relaxed'>('normal');

  // Import / Ingestion State
  const [importType, setImportType] = useState<'json' | 'ddl' | 'csv'>('json');
  const [importContent, setImportContent] = useState<string>('{\n  "schema": "DES_BASE",\n  "version": "1.0.0",\n  "entities": []\n}');
  const [importStatus, setImportStatus] = useState<string | null>(null);

  if (!isConfigModalOpen) return null;

  const handleAddTool = () => {
    if (!newItemLabel.trim()) return;
    const item: RailItem = {
      id: `tool-${Date.now().toString().slice(-4)}`,
      label: newItemLabel.trim(),
      icon: newItemIcon,
      targetCanvas: newItemCanvas,
      targetSidebar: 'model_tree',
    };
    addRailItem(item);
    setNewItemLabel('');
  };

  const handleSimulateImport = () => {
    setImportStatus('Validating and ingesting into PostgreSQL DES_BASE...');
    setTimeout(() => {
      setImportStatus('Successfully ingested artifacts into schema DES_BASE.');
      setTimeout(() => setImportStatus(null), 3000);
    }, 1200);
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-card border border-border rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col h-[700px] max-h-[90vh] animate-in fade-in zoom-in-95 duration-150 text-foreground">
        {/* Top Dialog Header */}
        <div className="p-4 border-b border-border flex items-center justify-between bg-muted/40 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary/10 border border-primary/20 text-primary">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-foreground">System Settings & EA Workbench Configuration</h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20 font-bold">
                  DES_BASE:8088
                </span>
              </div>
              <p className="text-xs text-muted-foreground">Manage UI preferences, PostgreSQL DES_BASE storage, IAM, Ingestion, and EA Designer Slots</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsConfigModalOpen(false)}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Master Body with Left Settings Navigation */}
        <div className="flex flex-1 overflow-hidden">
          {/* Left Settings Sidebar */}
          <aside className="w-60 bg-muted/20 border-r border-border p-3 flex flex-col justify-between shrink-0 select-none">
            <div className="space-y-1">
              <div className="px-3 py-1.5 text-[10px] uppercase font-bold tracking-wider text-muted-foreground">
                Settings & Governance
              </div>

              <button
                type="button"
                onClick={() => setActiveSection('ui')}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all text-left cursor-pointer ${
                  activeSection === 'ui'
                    ? 'bg-primary text-primary-foreground shadow-xs'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                }`}
              >
                <Palette className="w-4 h-4" />
                <span>UI & Appearance</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveSection('database')}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all text-left cursor-pointer ${
                  activeSection === 'database'
                    ? 'bg-primary text-primary-foreground shadow-xs'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                }`}
              >
                <Database className="w-4 h-4" />
                <span>Database (DES_BASE)</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveSection('users')}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all text-left cursor-pointer ${
                  activeSection === 'users'
                    ? 'bg-primary text-primary-foreground shadow-xs'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                }`}
              >
                <Users className="w-4 h-4" />
                <span>User Management (IAM)</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveSection('roles')}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all text-left cursor-pointer ${
                  activeSection === 'roles'
                    ? 'bg-primary text-primary-foreground shadow-xs'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                }`}
              >
                <Key className="w-4 h-4" />
                <span>Roles & Entitlements</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveSection('imports')}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all text-left cursor-pointer ${
                  activeSection === 'imports'
                    ? 'bg-primary text-primary-foreground shadow-xs'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                }`}
              >
                <Upload className="w-4 h-4" />
                <span>Imports & Ingestion</span>
              </button>

              <div className="pt-2 border-t border-border/60">
                <div className="px-3 py-1.5 text-[10px] uppercase font-bold tracking-wider text-muted-foreground">
                  EA Designer Workbench
                </div>

                <button
                  type="button"
                  onClick={() => setActiveSection('slots')}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all text-left cursor-pointer ${
                    activeSection === 'slots'
                      ? 'bg-primary text-primary-foreground shadow-xs'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                  }`}
                >
                  <Layers className="w-4 h-4" />
                  <span>EA Designer Slots</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveSection('pipeline')}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all text-left cursor-pointer ${
                    activeSection === 'pipeline'
                      ? 'bg-primary text-primary-foreground shadow-xs'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                  }`}
                >
                  <Download className="w-4 h-4" />
                  <span>Build & Binary Release</span>
                </button>
              </div>
            </div>

            {/* Bottom Meta */}
            <div className="p-2 rounded-xl bg-card border border-border text-[11px] text-muted-foreground space-y-1">
              <div className="flex justify-between">
                <span>Active Theme:</span>
                <span className="font-semibold text-foreground capitalize">{theme}</span>
              </div>
              <div className="flex justify-between">
                <span>Schema:</span>
                <span className="font-mono font-bold text-primary">DES_BASE</span>
              </div>
            </div>
          </aside>

          {/* Right Section Content */}
          <main className="flex-1 p-6 overflow-y-auto bg-card text-foreground space-y-6 text-xs">
            {/* 1. UI & Appearance */}
            {activeSection === 'ui' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-bold text-foreground">Theme & Visual Appearance</h3>
                  <p className="text-xs text-muted-foreground">Select color mode, density, and interface palette matching Data Artist.</p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <button
                    type="button"
                    onClick={() => setTheme('light')}
                    className={`p-3.5 rounded-xl border text-left transition-all flex flex-col justify-between h-28 relative cursor-pointer ${
                      theme === 'light'
                        ? 'border-primary bg-primary/5 ring-2 ring-primary/30 shadow-xs'
                        : 'border-border bg-card hover:bg-muted/40'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <Sun className="w-5 h-5 text-amber-500" />
                      {theme === 'light' && <Check className="w-4 h-4 text-primary" />}
                    </div>
                    <div>
                      <span className="font-bold text-xs text-foreground block">Light Mode</span>
                      <span className="text-[10px] text-muted-foreground">Clean daylight canvas</span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setTheme('dark')}
                    className={`p-3.5 rounded-xl border text-left transition-all flex flex-col justify-between h-28 relative cursor-pointer ${
                      theme === 'dark'
                        ? 'border-primary bg-primary/5 ring-2 ring-primary/30 shadow-xs'
                        : 'border-border bg-card hover:bg-muted/40'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <Moon className="w-5 h-5 text-indigo-400" />
                      {theme === 'dark' && <Check className="w-4 h-4 text-primary" />}
                    </div>
                    <div>
                      <span className="font-bold text-xs text-foreground block">Dark Modern</span>
                      <span className="text-[10px] text-muted-foreground">Default high contrast</span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setTheme('midnight')}
                    className={`p-3.5 rounded-xl border text-left transition-all flex flex-col justify-between h-28 relative cursor-pointer ${
                      theme === 'midnight'
                        ? 'border-primary bg-primary/5 ring-2 ring-primary/30 shadow-xs'
                        : 'border-border bg-card hover:bg-muted/40'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <Sparkles className="w-5 h-5 text-cyan-400" />
                      {theme === 'midnight' && <Check className="w-4 h-4 text-primary" />}
                    </div>
                    <div>
                      <span className="font-bold text-xs text-foreground block">Midnight Deep</span>
                      <span className="text-[10px] text-muted-foreground">Deep sapphire navy</span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setTheme('slate')}
                    className={`p-3.5 rounded-xl border text-left transition-all flex flex-col justify-between h-28 relative cursor-pointer ${
                      theme === 'slate'
                        ? 'border-primary bg-primary/5 ring-2 ring-primary/30 shadow-xs'
                        : 'border-border bg-card hover:bg-muted/40'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <Monitor className="w-5 h-5 text-emerald-400" />
                      {theme === 'slate' && <Check className="w-4 h-4 text-primary" />}
                    </div>
                    <div>
                      <span className="font-bold text-xs text-foreground block">Slate Stealth</span>
                      <span className="text-[10px] text-muted-foreground">Emerald charcoal</span>
                    </div>
                  </button>
                </div>

                {/* Accent Color Palette */}
                <div className="space-y-3 pt-2 border-t border-border">
                  <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">Visual Accent Palette</h4>
                  <div className="flex items-center gap-2.5">
                    {[
                      { id: 'indigo', name: 'Indigo', bg: 'bg-indigo-500' },
                      { id: 'emerald', name: 'Emerald', bg: 'bg-emerald-500' },
                      { id: 'purple', name: 'Purple', bg: 'bg-purple-500' },
                      { id: 'cyan', name: 'Cyan', bg: 'bg-cyan-500' },
                      { id: 'amber', name: 'Amber', bg: 'bg-amber-500' },
                      { id: 'rose', name: 'Rose', bg: 'bg-rose-500' },
                    ].map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => setSelectedAccent(c.id)}
                        className={`w-8 h-8 rounded-full ${c.bg} flex items-center justify-center transition-all cursor-pointer ${
                          selectedAccent === c.id ? 'ring-4 ring-primary/30 scale-110 shadow-md' : 'opacity-80 hover:opacity-100'
                        }`}
                        title={c.name}
                      >
                        {selectedAccent === c.id && <Check className="w-4 h-4 text-white" />}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Density Options */}
                <div className="p-4 rounded-xl border border-border bg-muted/20 flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-xs text-foreground block">UI Canvas Density</span>
                    <span className="text-[11px] text-muted-foreground">Adjust padding, spacing, and typography scale</span>
                  </div>
                  <div className="flex items-center gap-1 bg-card border border-border p-1 rounded-lg">
                    {(['compact', 'normal', 'relaxed'] as const).map((d) => (
                      <button
                        key={d}
                        type="button"
                        onClick={() => setSelectedDensity(d)}
                        className={`px-2.5 py-1 rounded text-xs font-semibold capitalize transition-all cursor-pointer ${
                          selectedDensity === d
                            ? 'bg-primary text-primary-foreground shadow-xs'
                            : 'text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        {d}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* 2. Database (DES_BASE) */}
            {activeSection === 'database' && (
              <div className="space-y-5">
                <div>
                  <h3 className="text-sm font-bold text-foreground">PostgreSQL Database Storage</h3>
                  <p className="text-xs text-muted-foreground">Authoritative persistence and multi-tenant schema isolation in PostgreSQL.</p>
                </div>

                <div className="p-4 rounded-xl border border-border bg-muted/20 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Lock className="w-4 h-4 text-emerald-500" />
                      <span className="font-bold text-xs text-foreground">Authoritative Schema: DES_BASE</span>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-500 font-semibold border border-emerald-500/20">
                      Connected (Port 5432 / API 8088)
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <span className="text-muted-foreground text-[11px] block">Authoritative Schema:</span>
                      <span className="font-mono text-primary font-bold">DES_BASE (PostgreSQL 16)</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground text-[11px] block">Connection String:</span>
                      <span className="font-mono text-foreground truncate block">postgres://base:base_secret@localhost:5432/base</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground text-[11px] block">Connection Pooling:</span>
                      <span className="text-foreground">25 Max Open • 5 Idle • 15m Lifetime</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground text-[11px] block">Dialect & Driver:</span>
                      <span className="text-foreground">PostgreSQL (pgx driver / AST Parser)</span>
                    </div>
                  </div>
                </div>

                {/* Autosave to DES_BASE Configuration */}
                <div className="p-4 rounded-xl border border-border bg-muted/20 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-bold text-xs text-foreground block">Autosave to PostgreSQL (DES_BASE)</span>
                      <span className="text-[11px] text-muted-foreground">Automatically synchronize changes and layout state in the background</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={autosaveEnabled}
                      onChange={(e) => setAutosaveEnabled(e.target.checked)}
                      className="w-4 h-4 rounded text-primary bg-background border-border focus:ring-primary cursor-pointer"
                    />
                  </div>

                  {autosaveEnabled && (
                    <div className="flex items-center justify-between pt-2 border-t border-border/60">
                      <span className="text-[11px] text-muted-foreground">Sync Debounce Interval:</span>
                      <div className="flex items-center gap-1">
                        {[5, 10, 30, 60].map((sec) => (
                          <button
                            key={sec}
                            type="button"
                            onClick={() => setAutosaveInterval(sec)}
                            className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold transition-all cursor-pointer ${
                              autosaveInterval === sec
                                ? 'bg-primary text-primary-foreground shadow-xs'
                                : 'bg-card text-muted-foreground hover:text-foreground border border-border'
                            }`}
                          >
                            {sec}s
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">Synchronized DES_BASE Tables</h4>
                  <div className="rounded-xl border border-border overflow-hidden">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-muted/50 border-b border-border text-[10px] uppercase font-bold text-muted-foreground">
                          <th className="p-2.5">Table Name</th>
                          <th className="p-2.5">Columns</th>
                          <th className="p-2.5">Primary Key</th>
                          <th className="p-2.5">Row Count</th>
                          <th className="p-2.5">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border bg-card">
                        {[
                          { name: 'designer_apps', cols: 7, pk: 'id', rows: 'Dynamic' },
                          { name: 'designer_layouts', cols: 6, pk: 'id', rows: 'Dynamic' },
                          { name: 'designer_workspaces', cols: 4, pk: 'id', rows: 1 },
                          { name: 'designer_widgets', cols: 8, pk: 'id', rows: 18 },
                          { name: 'designer_datasources', cols: 7, pk: 'id', rows: 3 },
                          { name: 'designer_lineage_nodes', cols: 6, pk: 'id', rows: 5 },
                        ].map((t) => (
                          <tr key={t.name} className="hover:bg-muted/20 transition-colors">
                            <td className="p-2.5 font-mono font-bold text-foreground">{t.name}</td>
                            <td className="p-2.5 text-muted-foreground">{t.cols} cols</td>
                            <td className="p-2.5 font-mono text-muted-foreground">{t.pk}</td>
                            <td className="p-2.5 font-bold text-primary">{t.rows}</td>
                            <td className="p-2.5"><span className="text-emerald-500 font-bold text-[10px]">● Authoritative</span></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* 3. User Management (IAM) */}
            {activeSection === 'users' && (
              <div className="space-y-5">
                <div>
                  <h3 className="text-sm font-bold text-foreground">User Management & IAM</h3>
                  <p className="text-xs text-muted-foreground">Authoritative user accounts, authentication tokens, and profile tenancy.</p>
                </div>

                <div className="rounded-xl border border-border overflow-hidden">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-muted/50 border-b border-border text-[10px] uppercase font-bold text-muted-foreground">
                        <th className="p-3">User ID</th>
                        <th className="p-3">Full Name</th>
                        <th className="p-3">Email</th>
                        <th className="p-3">Assigned Role</th>
                        <th className="p-3">Schema Access</th>
                        <th className="p-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border bg-card">
                      <tr className="hover:bg-muted/20 transition-colors">
                        <td className="p-3 font-mono font-bold text-foreground">EMP-892401</td>
                        <td className="p-3 font-semibold text-foreground">Lead Architect</td>
                        <td className="p-3 text-muted-foreground font-mono">lead.architect@enterprise.internal</td>
                        <td className="p-3"><span className="px-2 py-0.5 rounded bg-primary/10 text-primary font-bold text-[10px]">Lead Architect</span></td>
                        <td className="p-3 font-mono text-muted-foreground">DES_BASE, public</td>
                        <td className="p-3"><span className="text-emerald-500 font-bold text-[10px]">● Active</span></td>
                      </tr>
                      <tr className="hover:bg-muted/20 transition-colors">
                        <td className="p-3 font-mono font-bold text-foreground">EMP-774120</td>
                        <td className="p-3 font-semibold text-foreground">Enterprise Modeler</td>
                        <td className="p-3 text-muted-foreground font-mono">modeler@enterprise.internal</td>
                        <td className="p-3"><span className="px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 font-bold text-[10px]">Data Engineer</span></td>
                        <td className="p-3 font-mono text-muted-foreground">DES_BASE</td>
                        <td className="p-3"><span className="text-emerald-500 font-bold text-[10px]">● Active</span></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* 4. Roles & Entitlements */}
            {activeSection === 'roles' && (
              <div className="space-y-5">
                <div>
                  <h3 className="text-sm font-bold text-foreground">Roles & Access Entitlements</h3>
                  <p className="text-xs text-muted-foreground">Role-Based Access Control (RBAC) definitions and schema permissions.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    { role: 'Lead Architect', desc: 'Full administrative access to all schema tables, DDL execution, and deployment pipelines in DES_BASE.', tag: 'Full Control' },
                    { role: 'Enterprise Modeler', desc: 'Can design ER models, edit widgets, and execute AST queries on DES_BASE.', tag: 'Editor' },
                    { role: 'Autonomous Agent Worker', desc: 'Read/write telemetry, dispatch events, and update decision workflow graphs.', tag: 'Service Account' },
                    { role: 'Viewer / Stakeholder', desc: 'Read-only access to Dashboards, CLL DAG, and published applications.', tag: 'Read Only' },
                  ].map((r) => (
                    <div key={r.role} className="p-4 rounded-xl border border-border bg-muted/20 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-foreground">{r.role}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-primary/10 text-primary font-mono font-bold border border-primary/20">{r.tag}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">{r.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 5. Imports & Ingestion */}
            {activeSection === 'imports' && (
              <div className="space-y-5">
                <div>
                  <h3 className="text-sm font-bold text-foreground">Data Ingestion & Schema Imports</h3>
                  <p className="text-xs text-muted-foreground">Ingest external JSON models, PostgreSQL DDL scripts, and CSV datasets directly into DES_BASE.</p>
                </div>

                <div className="flex items-center gap-2">
                  {(['json', 'ddl', 'csv'] as const).map((fmt) => (
                    <button
                      key={fmt}
                      type="button"
                      onClick={() => setImportType(fmt)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase transition-all cursor-pointer ${
                        importType === fmt
                          ? 'bg-primary text-primary-foreground shadow-xs'
                          : 'bg-muted text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      {fmt} Ingestion
                    </button>
                  ))}
                </div>

                <div className="space-y-2">
                  <label className="font-semibold text-foreground text-xs">Payload / Script Input</label>
                  <textarea
                    rows={8}
                    value={importContent}
                    onChange={(e) => setImportContent(e.target.value)}
                    className="w-full p-3 bg-background border border-border rounded-xl font-mono text-xs text-foreground focus:outline-hidden focus:ring-1 focus:ring-primary"
                  />
                </div>

                {importStatus && (
                  <div className="p-3 rounded-xl bg-primary/10 text-primary border border-primary/20 text-xs font-semibold flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{importStatus}</span>
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleSimulateImport}
                  className="flex items-center gap-1.5 px-4 py-2 bg-primary text-primary-foreground text-xs font-bold rounded-xl shadow-xs hover:bg-primary/90 transition-all cursor-pointer"
                >
                  <Upload className="w-4 h-4" />
                  <span>Execute Ingestion into DES_BASE</span>
                </button>
              </div>
            )}

            {/* 6. EA Designer Slots & Workbench */}
            {activeSection === 'slots' && (
              <div className="space-y-5">
                <div>
                  <h3 className="text-sm font-bold text-foreground">EA Designer Activity Rail & Slot Architecture</h3>
                  <p className="text-xs text-muted-foreground">Customize activity rail tools, default workbench panels, and layout DSL slots.</p>
                </div>

                <div className="space-y-2">
                  {slots.rail.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-3 bg-muted/20 border border-border rounded-xl"
                    >
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-[10px] text-muted-foreground px-2 py-0.5 rounded bg-muted">
                          {item.icon}
                        </span>
                        <span className="font-bold text-foreground">{item.label}</span>
                        {item.targetCanvas && (
                          <span className="text-[10px] bg-primary/10 text-primary font-mono px-2 py-0.5 rounded border border-primary/20">
                            Canvas: {item.targetCanvas}
                          </span>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => removeRailItem(item.id)}
                        className="text-muted-foreground hover:text-destructive p-1 rounded transition-colors cursor-pointer"
                        title="Remove Slot"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Add Tool Slot */}
                <div className="p-4 rounded-xl border border-dashed border-border bg-muted/10 space-y-3">
                  <h4 className="text-xs font-bold text-foreground">Add Custom Rail Tool Slot</h4>
                  <div className="grid grid-cols-3 gap-2">
                    <input
                      type="text"
                      placeholder="Slot Label (e.g. Analytics)"
                      value={newItemLabel}
                      onChange={(e) => setNewItemLabel(e.target.value)}
                      className="px-3 py-1.5 bg-background border border-border rounded-lg text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary"
                    />
                    <select
                      value={newItemIcon}
                      onChange={(e) => setNewItemIcon(e.target.value)}
                      className="px-3 py-1.5 bg-background border border-border rounded-lg text-xs text-foreground focus:outline-none focus:border-primary"
                    >
                      <option value="LayersIcon">Layers Icon</option>
                      <option value="LayoutIcon">Layout Icon</option>
                      <option value="DatabaseIcon">Database Icon</option>
                      <option value="TerminalIcon">Terminal Icon</option>
                      <option value="BotIcon">Bot Icon</option>
                      <option value="GitBranchIcon">GitBranch Icon</option>
                    </select>
                    <select
                      value={newItemCanvas}
                      onChange={(e) => setNewItemCanvas(e.target.value as CanvasMode)}
                      className="px-3 py-1.5 bg-background border border-border rounded-lg text-xs text-foreground focus:outline-none focus:border-primary"
                    >
                      <option value="visual_canvas">Visual Canvas Grid</option>
                      <option value="er_modeler">Schematics ER Modeler</option>
                      <option value="lineage_dag">Lineage DAG</option>
                      <option value="sql_editor">AST SQL Console</option>
                      <option value="workflow_graph">Agent Workflow Graph</option>
                    </select>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddTool}
                    className="px-3.5 py-1.5 bg-primary text-primary-foreground rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Slot to Activity Rail</span>
                  </button>
                </div>
              </div>
            )}

            {/* 7. Build & Binary Release */}
            {activeSection === 'pipeline' && (
              <div className="space-y-5">
                <div>
                  <h3 className="text-sm font-bold text-foreground">Single Executable Release Pipeline</h3>
                  <p className="text-xs text-muted-foreground">React 19 SPA frontend assets are compiled and embedded directly into the Go binary.</p>
                </div>

                <div className="p-4 rounded-xl border border-border bg-muted/20 space-y-3 font-mono text-xs">
                  <div className="flex justify-between py-1 border-b border-border/60">
                    <span className="text-muted-foreground">Compiled Binary:</span>
                    <span className="text-emerald-500 font-bold">bin/base</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-border/60">
                    <span className="text-muted-foreground">Embedded Asset Directive:</span>
                    <span className="text-primary font-bold">//go:embed all:dist</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-border/60">
                    <span className="text-muted-foreground">Target Port:</span>
                    <span className="text-foreground font-bold">8088</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-muted-foreground">Authoritative Schema:</span>
                    <span className="text-purple-400 font-bold">DES_BASE</span>
                  </div>
                </div>
              </div>
            )}
          </main>
        </div>

        {/* Bottom Dialog Actions */}
        <div className="p-4 border-t border-border flex items-center justify-between bg-muted/40 shrink-0">
          <button
            type="button"
            onClick={() => setIsConfigModalOpen(false)}
            className="px-4 py-2 bg-muted hover:bg-muted/80 text-foreground rounded-xl text-xs font-semibold transition-colors cursor-pointer"
          >
            Close
          </button>
          <button
            type="button"
            onClick={async () => {
              await saveLayoutToBackend();
              setIsConfigModalOpen(false);
            }}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs hover:bg-primary/90 transition-colors cursor-pointer"
          >
            <Check className="w-4 h-4" />
            <span>Apply & Save Settings to DES_BASE</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default SlotConfigModal;
