import React, { useState } from 'react';
import {
  Layers,
  Plus,
  Search,
  ExternalLink,
  Trash2,
  Edit3,
  CheckCircle2,
  X,
  RefreshCw,
  Layout,
  Terminal,
  Monitor,
  Check,
  ShieldCheck,
  Globe,
  FileCode,
} from 'lucide-react';
import { useLayout } from '../shell/LayoutContext';

export interface PageDef {
  id: string;
  name: string;
  slug: string;
  path: string;
  componentPath: string;
  layoutType: 'spa' | 'tui' | 'modal' | 'panel';
  status: 'active' | 'draft' | 'deprecated';
  authRequired: boolean;
  description: string;
  isEntry: boolean;
}

const DEFAULT_PAGES: PageDef[] = [
  {
    id: 'page-1',
    name: 'Executive Operations Dashboard',
    slug: 'executive-dashboard',
    path: '/',
    componentPath: 'web/src/pages/ExecutiveDashboard.tsx',
    layoutType: 'spa',
    status: 'active',
    authRequired: true,
    description: 'Fleet operational overview with KPIs and telematic status summary.',
    isEntry: true,
  },
  {
    id: 'page-2',
    name: 'Live Vehicle Dispatch Canvas',
    slug: 'live-dispatch',
    path: '/dispatch',
    componentPath: 'web/src/canvas/VisualCanvasGrid.tsx',
    layoutType: 'spa',
    status: 'active',
    authRequired: true,
    description: 'Interactive real-time fleet map, waypoint solver, and asset grid.',
    isEntry: false,
  },
  {
    id: 'page-3',
    name: 'Telematics Ingestion Worker Console',
    slug: 'telematics-worker',
    path: '/worker/telematics',
    componentPath: 'internal/adapters/inbound/tui/worker_tui.go',
    layoutType: 'tui',
    status: 'active',
    authRequired: false,
    description: 'Bubbletea terminal UI monitoring high-frequency gRPC sensor packets.',
    isEntry: false,
  },
  {
    id: 'page-4',
    name: 'Schematics ER Studio',
    slug: 'er-schematics',
    path: '/data/er-studio',
    componentPath: 'web/src/datamodel/ERModelerCanvas.tsx',
    layoutType: 'spa',
    status: 'active',
    authRequired: true,
    description: 'Relational data modeling with PostgreSQL DES_BASE schema authoring.',
    isEntry: false,
  },
  {
    id: 'page-5',
    name: 'Column-Level Lineage DAG',
    slug: 'column-lineage',
    path: '/data/lineage',
    componentPath: 'web/src/lineage/LineageDAGView.tsx',
    layoutType: 'spa',
    status: 'active',
    authRequired: true,
    description: 'End-to-end data transformation pipeline and AST dependency graphs.',
    isEntry: false,
  },
  {
    id: 'page-6',
    name: 'AST SQL Query Console',
    slug: 'sql-editor',
    path: '/data/sql',
    componentPath: 'web/src/sqleditor/SqlEditorView.tsx',
    layoutType: 'spa',
    status: 'active',
    authRequired: true,
    description: 'Interactive SQL query editor targeting schema DES_BASE with EXPLAIN plans.',
    isEntry: false,
  },
];

export const PageRegistryCanvas: React.FC = () => {
  const { currentApp, setCanvasMode } = useLayout();
  const [pages, setPages] = useState<PageDef[]>(DEFAULT_PAGES);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activePageId, setActivePageId] = useState<string>('page-1');
  const [editingPage, setEditingPage] = useState<PageDef | null>(null);
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [notification, setNotification] = useState<string | null>(null);

  // Form State
  const [formName, setFormName] = useState<string>('');
  const [formPath, setFormPath] = useState<string>('');
  const [formComponent, setFormComponent] = useState<string>('');
  const [formLayoutType, setFormLayoutType] = useState<'spa' | 'tui' | 'modal' | 'panel'>('spa');
  const [formStatus, setFormStatus] = useState<'active' | 'draft' | 'deprecated'>('active');
  const [formAuth, setFormAuth] = useState<boolean>(true);
  const [formDescription, setFormDescription] = useState<string>('');

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const filteredPages = pages.filter((p) => {
    const q = searchQuery.toLowerCase();
    return (
      p.name.toLowerCase().includes(q) ||
      p.path.toLowerCase().includes(q) ||
      p.componentPath.toLowerCase().includes(q) ||
      p.layoutType.toLowerCase().includes(q)
    );
  });

  const handleOpenEdit = (page: PageDef) => {
    setEditingPage(page);
    setFormName(page.name);
    setFormPath(page.path);
    setFormComponent(page.componentPath);
    setFormLayoutType(page.layoutType);
    setFormStatus(page.status);
    setFormAuth(page.authRequired);
    setFormDescription(page.description);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPage) return;

    const updated: PageDef = {
      ...editingPage,
      name: formName.trim(),
      path: formPath.trim(),
      componentPath: formComponent.trim(),
      layoutType: formLayoutType,
      status: formStatus,
      authRequired: formAuth,
      description: formDescription.trim(),
    };

    setPages((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    setEditingPage(null);
    showToast(`Updated page "${updated.name}" in DES_BASE.`);
  };

  const handleCreatePage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;

    const newPage: PageDef = {
      id: `page-${Date.now().toString().slice(-4)}`,
      name: formName.trim(),
      slug: formName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      path: formPath.trim() || `/${formName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
      componentPath: formComponent.trim() || `web/src/pages/${formName.replace(/\s+/g, '')}.tsx`,
      layoutType: formLayoutType,
      status: formStatus,
      authRequired: formAuth,
      description: formDescription.trim(),
      isEntry: false,
    };

    setPages((prev) => [newPage, ...prev]);
    setShowCreateModal(false);
    showToast(`Registered page "${newPage.name}" in DES_BASE.`);
  };

  const handleDeletePage = (page: PageDef) => {
    if (!window.confirm(`Delete page "${page.name}" from registry?`)) return;
    setPages((prev) => prev.filter((p) => p.id !== page.id));
    showToast(`Deleted page "${page.name}".`);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-background text-foreground overflow-y-auto p-6 space-y-6 select-none">
      {/* 1. Header Banner & Page Registry Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">
              Page Registry
            </span>
            <span className="text-xs text-muted-foreground font-mono">
              Target Project: <strong className="text-primary">{currentApp ? currentApp.name : 'Fleet Logistics'}</strong>
            </span>
          </div>
          <h1 className="text-2xl font-bold text-foreground mt-1 flex items-center gap-2">
            <Layers className="w-6 h-6 text-primary" />
            <span>Enterprise Page & Route Registry</span>
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Authoritative registry of viewports, route bindings, and screen components for the active project.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => showToast('Page catalog refreshed from DES_BASE')}
            className="p-2 bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground rounded-xl border border-border transition-colors cursor-pointer"
            title="Refresh Page List"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => {
              setFormName('');
              setFormPath('');
              setFormComponent('');
              setFormDescription('');
              setShowCreateModal(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Page</span>
          </button>
        </div>
      </div>

      {/* Notification Toast */}
      {notification && (
        <div className="p-3 rounded-xl text-xs font-medium flex items-center justify-between animate-in fade-in duration-200 border bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>{notification}</span>
          </div>
          <button onClick={() => setNotification(null)} className="p-1 hover:bg-muted rounded">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 2. Interactive Page Table */}
      <div className="bg-card border border-border rounded-2xl shadow-xs overflow-hidden flex flex-col">
        {/* Table Toolbar */}
        <div className="p-4 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-muted/20">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-foreground">Registered Application Pages</h2>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-muted text-muted-foreground border border-border">
              {filteredPages.length} pages
            </span>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by page, path, component..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-background border border-border rounded-xl text-xs text-foreground placeholder:text-muted-foreground focus:outline-hidden focus:ring-1 focus:ring-primary transition-all"
            />
          </div>
        </div>

        {/* Table Viewport */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-border bg-muted/40 text-muted-foreground uppercase text-[10px] tracking-wider font-semibold">
                <th className="py-3 px-4">Page Title & Path</th>
                <th className="py-3 px-4">Layout Type</th>
                <th className="py-3 px-4">Component Path</th>
                <th className="py-3 px-4">Security / Auth</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredPages.map((page) => {
                const isActive = activePageId === page.id;
                return (
                  <tr
                    key={page.id}
                    className={`hover:bg-muted/30 transition-colors group ${
                      isActive ? 'bg-primary/5' : ''
                    }`}
                  >
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="p-2 rounded-xl bg-muted text-primary border border-border shrink-0">
                          {page.layoutType === 'tui' ? (
                            <Terminal className="w-4 h-4" />
                          ) : (
                            <Monitor className="w-4 h-4" />
                          )}
                        </div>
                        <div>
                          <div className="font-bold text-foreground text-xs flex items-center gap-2">
                            <span>{page.name}</span>
                            {page.isEntry && (
                              <span className="px-1.5 py-0.2 rounded bg-primary/20 text-primary text-[9px] font-mono font-bold">
                                ROOT ENTRY
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] font-mono text-muted-foreground mt-0.5">
                            {page.path}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold uppercase bg-muted text-foreground border border-border">
                        {page.layoutType === 'tui' ? 'Worker TUI' : 'Designer SPA'}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 font-mono text-[11px] text-muted-foreground">
                      {page.componentPath}
                    </td>

                    <td className="py-3.5 px-4">
                      {page.authRequired ? (
                        <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                          <ShieldCheck className="w-3 h-3" />
                          <span>JWT Auth</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground bg-muted px-2 py-0.5 rounded">
                          <Globe className="w-3 h-3" />
                          <span>Public</span>
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        <span>Active</span>
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            setActivePageId(page.id);
                            showToast(`Activated "${page.name}" in studio!`);
                            setCanvasMode('ui_sketch');
                          }}
                          className={`flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                            isActive
                              ? 'bg-primary text-primary-foreground shadow-xs'
                              : 'bg-muted hover:bg-primary/20 text-muted-foreground hover:text-primary'
                          }`}
                          title="Activate Page for Sketch / UI Design"
                        >
                          <Check className="w-3 h-3" />
                          <span>{isActive ? 'Active' : 'Open in Sketch'}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleOpenEdit(page)}
                          className="p-1.5 text-muted-foreground hover:text-primary hover:bg-muted rounded-lg transition-colors cursor-pointer"
                          title="Edit Page Specifications"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeletePage(page)}
                          className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors cursor-pointer"
                          title="Delete Page"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 3. Centered Edit / Create Modal */}
      {(editingPage || showCreateModal) && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-4 border-b border-border flex items-center justify-between bg-muted/40">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
                  <Layers className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-foreground">
                    {editingPage ? 'Edit Page Details' : 'Register New Page'}
                  </h3>
                  <p className="text-[10px] font-mono text-muted-foreground">
                    Authoritative PostgreSQL: <strong className="text-primary">DES_BASE.designer_layouts</strong>
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setEditingPage(null);
                  setShowCreateModal(false);
                }}
                className="p-1 text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={editingPage ? handleSaveEdit : handleCreatePage} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">Page Name *</label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. Telematics Monitor"
                  className="w-full px-3 py-2 bg-background border border-border rounded-xl text-xs text-foreground focus:outline-hidden focus:ring-1 focus:ring-primary"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">Route Path *</label>
                  <input
                    type="text"
                    required
                    value={formPath}
                    onChange={(e) => setFormPath(e.target.value)}
                    placeholder="e.g. /monitor"
                    className="w-full px-3 py-2 bg-background border border-border rounded-xl text-xs font-mono text-foreground focus:outline-hidden focus:ring-1 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">Layout Preset</label>
                  <select
                    value={formLayoutType}
                    onChange={(e: any) => setFormLayoutType(e.target.value)}
                    className="w-full px-3 py-2 bg-background border border-border rounded-xl text-xs text-foreground focus:outline-hidden focus:ring-1 focus:ring-primary"
                  >
                    <option value="spa">Designer SPA (React 19)</option>
                    <option value="tui">Worker TUI (Bubbletea)</option>
                    <option value="modal">Centered Modal</option>
                    <option value="panel">Drawer / Panel</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">Component File Path</label>
                <input
                  type="text"
                  value={formComponent}
                  onChange={(e) => setFormComponent(e.target.value)}
                  placeholder="e.g. web/src/pages/Monitor.tsx"
                  className="w-full px-3 py-2 bg-background border border-border rounded-xl text-xs font-mono text-foreground focus:outline-hidden focus:ring-1 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">Description</label>
                <textarea
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 bg-background border border-border rounded-xl text-xs text-foreground focus:outline-hidden focus:ring-1 focus:ring-primary resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setEditingPage(null);
                    setShowCreateModal(false);
                  }}
                  className="px-4 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground rounded-xl hover:bg-muted cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer"
                >
                  {editingPage ? 'Save Changes' : 'Register Page'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PageRegistryCanvas;
