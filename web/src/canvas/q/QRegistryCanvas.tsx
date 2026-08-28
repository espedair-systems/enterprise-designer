import React, { useState, useEffect } from 'react';
import {
  HelpCircle,
  Search,
  Plus,
  Edit3,
  Trash2,
  CheckCircle2,
  ExternalLink,
  X,
  FileText,
  Calendar,
  Layers,
  ChevronRight,
} from 'lucide-react';
import { api } from '../../services/api';
import { useLayout } from '../../shell/LayoutContext';

export interface QuestSurveyItem {
  id: string;
  app_id: string;
  title: string;
  slug: string;
  description: string;
  status: 'draft' | 'published' | 'archived';
  version: string;
  sections?: any[];
  created_at: string;
  updated_at: string;
}

export const QRegistryCanvas: React.FC = () => {
  const { currentApp, setCanvasMode } = useLayout();
  const [surveys, setSurveys] = useState<QuestSurveyItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [notification, setNotification] = useState<string | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingSurvey, setEditingSurvey] = useState<QuestSurveyItem | null>(null);
  const [formTitle, setFormTitle] = useState<string>('');
  const [formSlug, setFormSlug] = useState<string>('');
  const [formDescription, setFormDescription] = useState<string>('');
  const [formStatus, setFormStatus] = useState<'draft' | 'published' | 'archived'>('draft');
  const [formVersion, setFormVersion] = useState<string>('1.0.0');

  useEffect(() => {
    fetchSurveys();
  }, []);

  const fetchSurveys = async () => {
    try {
      setLoading(true);
      const res = await api.listQuestSurveys();
      if (res) {
        setSurveys(res);
      }
    } catch (err) {
      console.warn('Failed to load surveys from DES_BASE.quest_surveys', err);
    } finally {
      setLoading(false);
    }
  };

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleOpenCreate = () => {
    setEditingSurvey(null);
    setFormTitle('');
    setFormSlug('');
    setFormDescription('');
    setFormStatus('draft');
    setFormVersion('1.0.0');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (survey: QuestSurveyItem) => {
    setEditingSurvey(survey);
    setFormTitle(survey.title);
    setFormSlug(survey.slug);
    setFormDescription(survey.description);
    setFormStatus(survey.status);
    setFormVersion(survey.version);
    setIsModalOpen(true);
  };

  const handleSaveSurvey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) return;

    const payload = {
      app_id: currentApp ? currentApp.id : 'fleet-logistics',
      title: formTitle.trim(),
      slug: formSlug.trim() || formTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      description: formDescription.trim(),
      status: formStatus,
      version: formVersion.trim() || '1.0.0',
    };

    try {
      if (editingSurvey) {
        await api.updateQuestSurvey(editingSurvey.id, payload);
        showToast(`Survey "${formTitle}" updated in DES_BASE.`);
      } else {
        await api.createQuestSurvey(payload);
        showToast(`Survey "${formTitle}" registered in DES_BASE.`);
      }
      setIsModalOpen(false);
      fetchSurveys();
    } catch (err) {
      console.error('Failed to save survey', err);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!window.confirm(`Delete questionnaire "${title}"?`)) return;
    try {
      await api.deleteQuestSurvey(id);
      showToast(`Questionnaire "${title}" removed from DES_BASE.`);
      fetchSurveys();
    } catch (err) {
      console.error('Delete failed', err);
    }
  };

  const filteredSurveys = surveys.filter((s) => {
    if (statusFilter !== 'all' && s.status !== statusFilter) return false;
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      s.title.toLowerCase().includes(q) ||
      s.slug.toLowerCase().includes(q) ||
      s.description.toLowerCase().includes(q)
    );
  });

  return (
    <div className="flex-1 flex flex-col h-full bg-background select-none overflow-hidden">
      {/* ── 1. Header Toolbar (Pure Table Style) ── */}
      <div className="h-14 border-b border-border bg-card/80 backdrop-blur-md px-6 flex items-center justify-between shrink-0 z-10">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-primary/10 text-primary border border-primary/20">
            <HelpCircle className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-foreground">Q Registry</h2>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-muted text-muted-foreground border border-border">
                DES_BASE.quest_surveys
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-primary/10 text-primary font-bold">
                {surveys.length} Registered
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Enterprise Surveys, Inspections, Telematics Questionnaires & Audits
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {notification && (
            <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1.5 animate-in fade-in">
              <CheckCircle2 className="w-3.5 h-3.5" />
              {notification}
            </span>
          )}

          {/* Search Box */}
          <div className="relative w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search surveys, slugs, topics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-background border border-border rounded-xl text-xs text-foreground placeholder:text-muted-foreground focus:outline-hidden focus:ring-1 focus:ring-primary"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 bg-background border border-border rounded-xl text-xs text-foreground focus:outline-hidden cursor-pointer"
          >
            <option value="all">All Statuses</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
            <option value="archived">Archived</option>
          </select>

          {/* Register Button */}
          <button
            type="button"
            onClick={handleOpenCreate}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-primary text-primary-foreground text-xs font-bold rounded-xl shadow-xs hover:bg-primary/90 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Questionnaire</span>
          </button>
        </div>
      </div>

      {/* ── 2. Pure Surveys Table ── */}
      <div className="flex-1 overflow-auto p-6">
        <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-border bg-muted/40 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                <th className="py-3 px-4">Title & Slug</th>
                <th className="py-3 px-4">Description</th>
                <th className="py-3 px-4">Sections / Questions</th>
                <th className="py-3 px-4">Version</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Database Persistence</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-muted-foreground font-mono text-xs">
                    Loading questionnaires from PostgreSQL DES_BASE...
                  </td>
                </tr>
              ) : filteredSurveys.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-muted-foreground">
                    <HelpCircle className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    <p className="font-semibold">No surveys matching criteria</p>
                    <p className="text-[11px] text-muted-foreground/80 mt-1">
                      Click "New Questionnaire" to create your first survey definition.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredSurveys.map((survey) => {
                  const sectionCount = survey.sections ? survey.sections.length : 2;
                  const questionCount = survey.sections
                    ? survey.sections.reduce((acc, s) => acc + (s.questions ? s.questions.length : 0), 0)
                    : 5;

                  return (
                    <tr
                      key={survey.id}
                      className="hover:bg-muted/30 transition-colors group cursor-pointer"
                      onClick={() => setCanvasMode('q_designer')}
                    >
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-foreground text-xs">{survey.title}</div>
                        <div className="text-[10px] font-mono text-muted-foreground">{survey.slug}</div>
                      </td>
                      <td className="py-3.5 px-4 max-w-xs">
                        <p className="text-[11px] text-muted-foreground truncate">{survey.description}</p>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5 font-mono text-[11px] text-foreground">
                          <Layers className="w-3.5 h-3.5 text-primary" />
                          <span>
                            {sectionCount} Sec / {questionCount} Qs
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-[11px] text-muted-foreground">
                        v{survey.version}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                            survey.status === 'published'
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                              : survey.status === 'draft'
                              ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                              : 'bg-muted text-muted-foreground border-border'
                          }`}
                        >
                          {survey.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1 font-mono text-[10px] text-primary">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          <span>DES_BASE:8088</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div
                          className="flex items-center justify-end gap-1.5"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            type="button"
                            onClick={() => setCanvasMode('q_designer')}
                            className="p-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground transition-all"
                            title="Open in Visual Survey Designer"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(survey)}
                            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
                            title="Edit Questionnaire Properties"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(survey.id, survey.title)}
                            className="p-1.5 rounded-lg text-rose-400/80 hover:text-rose-400 hover:bg-rose-500/10 transition-all"
                            title="Delete Questionnaire"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
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

      {/* ── 3. Centered Registration & Edit Modal ── */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-4 border-b border-border flex items-center justify-between bg-muted/40">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
                  <HelpCircle className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-foreground">
                    {editingSurvey ? 'Edit Questionnaire' : 'Register New Questionnaire'}
                  </h3>
                  <p className="text-[10px] font-mono text-muted-foreground">
                    Authoritative PostgreSQL: <strong className="text-primary">DES_BASE.quest_surveys</strong>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveSurvey} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  Questionnaire Title *
                </label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="e.g. Daily Heavy Vehicle Telematics & Safety Inspection"
                  className="w-full px-3 py-2 bg-background border border-border rounded-xl text-xs text-foreground focus:outline-hidden focus:ring-1 focus:ring-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">Slug / Code</label>
                  <input
                    type="text"
                    value={formSlug}
                    onChange={(e) => setFormSlug(e.target.value)}
                    placeholder="e.g. daily-vehicle-safety"
                    className="w-full px-3 py-2 bg-background border border-border rounded-xl text-xs font-mono text-foreground focus:outline-hidden focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">Version</label>
                  <input
                    type="text"
                    value={formVersion}
                    onChange={(e) => setFormVersion(e.target.value)}
                    placeholder="1.0.0"
                    className="w-full px-3 py-2 bg-background border border-border rounded-xl text-xs font-mono text-foreground focus:outline-hidden focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">Status</label>
                <select
                  value={formStatus}
                  onChange={(e) => setFormStatus(e.target.value as any)}
                  className="w-full px-3 py-2 bg-background border border-border rounded-xl text-xs text-foreground focus:outline-hidden cursor-pointer"
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="archived">Archived</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">Description & Scope</label>
                <textarea
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  rows={3}
                  placeholder="Describe the operational purpose, target roles, and audit scope..."
                  className="w-full px-3 py-2 bg-background border border-border rounded-xl text-xs text-foreground focus:outline-hidden focus:ring-1 focus:ring-primary resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground rounded-xl hover:bg-muted cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer"
                >
                  Save to DES_BASE
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default QRegistryCanvas;
