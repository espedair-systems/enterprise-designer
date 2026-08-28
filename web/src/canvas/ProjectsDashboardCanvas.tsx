import React, { useState } from 'react';
import {
  Layout,
  Plus,
  Search,
  ExternalLink,
  Trash2,
  FolderCode,
  Database,
  Bot,
  Sparkles,
  ShieldCheck,
  Server,
  CheckCircle2,
  X,
  RefreshCw,
  Edit3,
  Check,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { useLayout } from '../shell/LayoutContext';
import { DesignerApp } from '../shell/types';

export const ProjectsDashboardCanvas: React.FC = () => {
  const {
    appsList,
    currentApp,
    selectApp,
    activateProject,
    setCanvasMode,
    setDomainMode,
    createApp,
    updateApp,
    deleteApp,
    refreshApps,
  } = useLayout();

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [editingApp, setEditingApp] = useState<DesignerApp | null>(null);

  // Create Form State
  const [newName, setNewName] = useState<string>('');
  const [newSlug, setNewSlug] = useState<string>('');
  const [newType, setNewType] = useState<'studio' | 'agent' | 'datamodeler'>('studio');
  const [newDescription, setNewDescription] = useState<string>('');

  // Edit Form State
  const [editName, setEditName] = useState<string>('');
  const [editSlug, setEditSlug] = useState<string>('');
  const [editType, setEditType] = useState<'studio' | 'agent' | 'datamodeler'>('studio');
  const [editDescription, setEditDescription] = useState<string>('');

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [actionMessage, setActionMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const filteredApps = appsList.filter((app) => {
    const q = searchQuery.toLowerCase();
    return (
      app.name.toLowerCase().includes(q) ||
      app.slug.toLowerCase().includes(q) ||
      app.app_type.toLowerCase().includes(q) ||
      app.status.toLowerCase().includes(q)
    );
  });

  const handleOpenEditModal = (app: DesignerApp) => {
    setEditingApp(app);
    setEditName(app.name);
    setEditSlug(app.slug);
    setEditType(app.app_type);
    setEditDescription(app.description || '');
  };

  const handleSaveEditProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingApp || !editName.trim()) return;

    setIsSubmitting(true);
    try {
      await updateApp(editingApp.id, {
        name: editName.trim(),
        slug: editSlug.trim() || editName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        app_type: editType,
        description: editDescription.trim(),
      });
      setEditingApp(null);
      setActionMessage({ type: 'success', text: `Project "${editName}" updated in PostgreSQL schema DES_BASE!` });
      setTimeout(() => setActionMessage(null), 3500);
    } catch (err: any) {
      setActionMessage({ type: 'error', text: err.message || 'Failed to update project' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    setIsSubmitting(true);
    try {
      const generatedSlug =
        newSlug.trim() || newName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      const created = await createApp({
        name: newName.trim(),
        slug: generatedSlug,
        app_type: newType,
        description: newDescription.trim(),
      });
      setShowCreateModal(false);
      setNewName('');
      setNewSlug('');
      setNewDescription('');
      setActionMessage({
        type: 'success',
        text: `Project "${created.name}" registered in PostgreSQL schema DES_BASE!`,
      });
      setTimeout(() => setActionMessage(null), 4000);
      activateProject(created);
    } catch (err: any) {
      setActionMessage({ type: 'error', text: err.message || 'Failed to create project' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteProject = async (app: DesignerApp) => {
    if (!window.confirm(`Are you sure you want to delete project "${app.name}" from PostgreSQL DES_BASE?`)) {
      return;
    }
    try {
      await deleteApp(app.id);
      setActionMessage({ type: 'success', text: `Project "${app.name}" removed from DES_BASE.` });
      setTimeout(() => setActionMessage(null), 3000);
    } catch (err: any) {
      setActionMessage({ type: 'error', text: err.message || 'Failed to delete project' });
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-background text-foreground overflow-y-auto p-6 space-y-6 select-none">
      {/* 1. Header Banner & Registry Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">
              Project Registry
            </span>
            <span className="text-xs text-muted-foreground font-mono">Schema: DES_BASE (Port 8088)</span>
          </div>
          <h1 className="text-2xl font-bold text-foreground mt-1 flex items-center gap-2">
            <FolderCode className="w-6 h-6 text-primary" />
            <span>Enterprise Project List</span>
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Authoritative registry of enterprise applications, autonomous agents, and multi-model studios stored in PostgreSQL{' '}
            <code className="font-mono text-primary font-semibold">DES_BASE.designer_apps</code>.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => refreshApps()}
            className="p-2 bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground rounded-xl border border-border transition-colors cursor-pointer"
            title="Refresh Projects List"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Enterprise Project</span>
          </button>
        </div>
      </div>

      {/* Notification Toast */}
      {actionMessage && (
        <div
          className={`p-3 rounded-xl text-xs font-medium flex items-center justify-between animate-in fade-in duration-200 border ${
            actionMessage.type === 'success'
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
              : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
          }`}
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>{actionMessage.text}</span>
          </div>
          <button onClick={() => setActionMessage(null)} className="p-1 hover:bg-muted rounded">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 2. Interactive Projects Table */}
      <div className="bg-card border border-border rounded-2xl shadow-xs overflow-hidden flex flex-col">
        {/* Table Toolbar */}
        <div className="p-4 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-muted/20">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-foreground">Registered Enterprise Projects</h2>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-muted text-muted-foreground border border-border">
              {filteredApps.length} projects
            </span>
          </div>

          <div className="relative max-w-xs w-full">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search projects by name, slug or type..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-background border border-border rounded-xl text-xs text-foreground placeholder:text-muted-foreground focus:outline-hidden focus:ring-1 focus:ring-primary"
            />
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-muted/40 border-b border-border text-[10px] uppercase font-bold text-muted-foreground">
                <th className="p-3 pl-4">Project Name & Slug</th>
                <th className="p-3">App Type</th>
                <th className="p-3">Status</th>
                <th className="p-3">Authoritative Schema</th>
                <th className="p-3">Last Updated</th>
                <th className="p-3 pr-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredApps.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-muted-foreground">
                    <div className="flex flex-col items-center gap-2">
                      <FolderCode className="w-8 h-8 text-muted-foreground/50" />
                      <p className="font-semibold text-foreground">No projects found in DES_BASE</p>
                      <p className="text-xs">Create your first enterprise studio application using the button above.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredApps.map((app) => {
                  const isCurrent = currentApp?.id === app.id;
                  return (
                    <tr
                      key={app.id}
                      className={`hover:bg-muted/30 transition-colors ${
                        isCurrent ? 'bg-primary/10' : ''
                      }`}
                    >
                      <td className="p-3 pl-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
                            {app.app_type === 'agent' ? <Bot className="w-4 h-4" /> : <Layout className="w-4 h-4" />}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-foreground">{app.name}</span>
                              {isCurrent && (
                                <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-primary text-primary-foreground">
                                  ACTIVE
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] font-mono text-muted-foreground">{app.slug}</span>
                          </div>
                        </div>
                      </td>

                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-muted text-muted-foreground border border-border">
                          {app.app_type}
                        </span>
                      </td>

                      <td className="p-3">
                        <span
                          className={`px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-wider border ${
                            app.status === 'published'
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                              : 'bg-primary/10 text-primary border-primary/20'
                          }`}
                        >
                          {app.status}
                        </span>
                      </td>

                      <td className="p-3">
                        <span className="font-mono text-xs font-bold text-primary">
                          DES_BASE
                        </span>
                      </td>

                      <td className="p-3 text-muted-foreground font-mono text-[11px]">
                        {app.updated_at ? new Date(app.updated_at).toLocaleDateString() : 'Active'}
                      </td>

                      <td className="p-3 pr-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Activate Project Button */}
                          <button
                            type="button"
                            onClick={() => activateProject(app)}
                            className={`flex items-center gap-1 px-3 py-1.5 text-xs font-bold rounded-lg shadow-xs transition-all cursor-pointer ${
                              isCurrent
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                                : 'bg-primary hover:bg-primary/90 text-primary-foreground'
                            }`}
                            title={isCurrent ? 'Project is currently active' : 'Activate and load this project into Studio'}
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>{isCurrent ? 'Activated' : 'Activate Project'}</span>
                          </button>

                          {/* Edit Details Button */}
                          <button
                            type="button"
                            onClick={() => handleOpenEditModal(app)}
                            className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors cursor-pointer border border-border/60"
                            title="Edit Project Details (Centered Modal)"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete Button */}
                          <button
                            type="button"
                            onClick={() => handleDeleteProject(app)}
                            className="p-1.5 text-muted-foreground hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
                            title="Delete Project from DES_BASE"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── 4. Centered Modal: Create New Project ── */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-4 border-b border-border flex items-center justify-between bg-muted/40">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
                  <Plus className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-sm text-foreground">Register New Enterprise Project</h3>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1 text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateProject} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">Project Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Fleet Logistics Studio"
                  value={newName}
                  onChange={(e) => {
                    setNewName(e.target.value);
                    if (!newSlug) {
                      setNewSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-'));
                    }
                  }}
                  className="w-full px-3 py-2 bg-background border border-border rounded-xl text-xs text-foreground focus:outline-hidden focus:ring-1 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">Slug Identifier</label>
                <input
                  type="text"
                  placeholder="e.g. fleet-logistics"
                  value={newSlug}
                  onChange={(e) => setNewSlug(e.target.value)}
                  className="w-full px-3 py-2 bg-background border border-border rounded-xl text-xs font-mono text-foreground focus:outline-hidden focus:ring-1 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">Application Type</label>
                <select
                  value={newType}
                  onChange={(e: any) => setNewType(e.target.value)}
                  className="w-full px-3 py-2 bg-background border border-border rounded-xl text-xs text-foreground focus:outline-hidden focus:ring-1 focus:ring-primary"
                >
                  <option value="studio">Enterprise Studio (Hexagonal SPA + REST)</option>
                  <option value="agent">Autonomous Agent Graph Service</option>
                  <option value="datamodeler">Relational Data Modeler & Schematics</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">Description</label>
                <textarea
                  placeholder="Brief summary of domain objectives..."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 bg-background border border-border rounded-xl text-xs text-foreground focus:outline-hidden focus:ring-1 focus:ring-primary resize-none"
                />
              </div>

              <div className="p-3 bg-muted/40 rounded-xl border border-border/80 text-[11px] text-muted-foreground flex items-center gap-2">
                <Database className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>
                  Project metadata and layout slots will persist authoritatively to PostgreSQL schema{' '}
                  <strong className="text-foreground">DES_BASE</strong>.
                </span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground rounded-xl hover:bg-muted cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !newName.trim()}
                  className="px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? 'Registering...' : 'Register Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── 5. Centered Modal: Edit Project Details ── */}
      {editingApp && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-4 border-b border-border flex items-center justify-between bg-muted/40">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
                  <Edit3 className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-sm text-foreground">Edit Project Details</h3>
              </div>
              <button
                onClick={() => setEditingApp(null)}
                className="p-1 text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEditProject} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">Project Name *</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3 py-2 bg-background border border-border rounded-xl text-xs text-foreground focus:outline-hidden focus:ring-1 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">Slug Identifier</label>
                <input
                  type="text"
                  value={editSlug}
                  onChange={(e) => setEditSlug(e.target.value)}
                  className="w-full px-3 py-2 bg-background border border-border rounded-xl text-xs font-mono text-foreground focus:outline-hidden focus:ring-1 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">Application Type</label>
                <select
                  value={editType}
                  onChange={(e: any) => setEditType(e.target.value)}
                  className="w-full px-3 py-2 bg-background border border-border rounded-xl text-xs text-foreground focus:outline-hidden focus:ring-1 focus:ring-primary"
                >
                  <option value="studio">Enterprise Studio (Hexagonal SPA + REST)</option>
                  <option value="agent">Autonomous Agent Graph Service</option>
                  <option value="datamodeler">Relational Data Modeler & Schematics</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">Description</label>
                <textarea
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 bg-background border border-border rounded-xl text-xs text-foreground focus:outline-hidden focus:ring-1 focus:ring-primary resize-none"
                />
              </div>

              <div className="p-3 bg-muted/40 rounded-xl border border-border/80 text-[11px] text-muted-foreground flex items-center justify-between">
                <span>Authoritative Persistence Schema:</span>
                <strong className="text-primary font-mono font-bold">DES_BASE</strong>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingApp(null)}
                  className="px-4 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground rounded-xl hover:bg-muted cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !editName.trim()}
                  className="px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectsDashboardCanvas;
