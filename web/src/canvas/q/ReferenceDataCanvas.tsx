import React, { useState, useEffect } from 'react';
import {
  Layers,
  Search,
  Plus,
  Edit3,
  Trash2,
  CheckCircle2,
  X,
  List,
} from 'lucide-react';
import { api } from '../../services/api';

export interface ReferenceItem {
  id: string;
  list_key: string;
  list_name: string;
  description: string;
  items: Array<{ id: string; label: string; value: string; score?: number }>;
  updated_at: string;
}

export const ReferenceDataCanvas: React.FC = () => {
  const [datasets, setDatasets] = useState<ReferenceItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [notification, setNotification] = useState<string | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [formKey, setFormKey] = useState<string>('');
  const [formName, setFormName] = useState<string>('');
  const [formDesc, setFormDesc] = useState<string>('');
  const [formItemsText, setFormItemsText] = useState<string>('');

  useEffect(() => {
    fetchDatasets();
  }, []);

  const fetchDatasets = async () => {
    try {
      setLoading(true);
      const res = await api.listQuestReferenceData();
      if (res) {
        setDatasets(res);
      }
    } catch (err) {
      console.warn('Failed to load reference datasets', err);
    } finally {
      setLoading(false);
    }
  };

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleSaveDataset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formKey.trim() || !formName.trim()) return;

    const lines = formItemsText.split('\n').filter((l) => l.trim() !== '');
    const items = lines.map((line, idx) => {
      const parts = line.split('|');
      const label = parts[0]?.trim() || line;
      const value = parts[1]?.trim() || label.toLowerCase().replace(/[^a-z0-9]+/g, '_');
      return { id: `opt-${idx + 1}`, label, value };
    });

    const payload = {
      list_key: formKey.trim(),
      list_name: formName.trim(),
      description: formDesc.trim(),
      items: items,
    };

    try {
      await api.createQuestReferenceData(payload);
      showToast(`Reference dataset "${formName}" saved to DES_BASE.`);
      setIsModalOpen(false);
      fetchDatasets();
    } catch (err) {
      console.error('Save failed', err);
    }
  };

  const filteredDatasets = datasets.filter((d) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      d.list_name.toLowerCase().includes(q) ||
      d.list_key.toLowerCase().includes(q) ||
      d.description.toLowerCase().includes(q)
    );
  });

  return (
    <div className="flex-1 flex flex-col h-full bg-background select-none overflow-hidden">
      {/* Header */}
      <div className="h-14 border-b border-border bg-card/80 backdrop-blur-md px-6 flex items-center justify-between shrink-0 z-10">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-primary/10 text-primary border border-primary/20">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-foreground">Reference Data & Choice Lists</h2>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-muted text-muted-foreground border border-border">
                DES_BASE.quest_reference_data
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-primary/10 text-primary font-bold">
                {datasets.length} Lists
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Pre-configured lookup option tables, Likert scales, ISO vehicle taxonomies & rating scales
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

          <div className="relative w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search reference lists..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-background border border-border rounded-xl text-xs text-foreground focus:outline-hidden focus:ring-1 focus:ring-primary"
            />
          </div>

          <button
            type="button"
            onClick={() => {
              setFormKey('');
              setFormName('');
              setFormDesc('');
              setFormItemsText('1 - Low | 1\n2 - Medium | 2\n3 - High | 3');
              setIsModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-primary text-primary-foreground text-xs font-bold rounded-xl shadow-xs hover:bg-primary/90 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Reference List</span>
          </button>
        </div>
      </div>

      {/* Pure Table */}
      <div className="flex-1 overflow-auto p-6">
        <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-border bg-muted/40 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                <th className="py-3 px-4">List Name & Key</th>
                <th className="py-3 px-4">Description</th>
                <th className="py-3 px-4">Total Options</th>
                <th className="py-3 px-4">Items Preview</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-muted-foreground font-mono text-xs">
                    Loading reference lists from PostgreSQL DES_BASE...
                  </td>
                </tr>
              ) : filteredDatasets.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-muted-foreground">
                    <List className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    <p className="font-semibold">No reference datasets found</p>
                  </td>
                </tr>
              ) : (
                filteredDatasets.map((d) => (
                  <tr key={d.id} className="hover:bg-muted/30 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-foreground text-xs">{d.list_name}</div>
                      <div className="text-[10px] font-mono text-primary">{d.list_key}</div>
                    </td>
                    <td className="py-3.5 px-4 max-w-xs">
                      <p className="text-[11px] text-muted-foreground truncate">{d.description}</p>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[11px] text-foreground font-semibold">
                      {d.items ? d.items.length : 0} items
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex flex-wrap gap-1 max-w-md">
                        {d.items?.slice(0, 4).map((item) => (
                          <span
                            key={item.id}
                            className="text-[10px] px-2 py-0.5 rounded-md bg-muted border border-border text-foreground"
                          >
                            {item.label}
                          </span>
                        ))}
                        {d.items && d.items.length > 4 && (
                          <span className="text-[9px] font-mono text-muted-foreground py-0.5">
                            +{d.items.length - 4} more
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => {
                          setFormKey(d.list_key);
                          setFormName(d.list_name);
                          setFormDesc(d.description);
                          setFormItemsText(
                            d.items ? d.items.map((i) => `${i.label} | ${i.value}`).join('\n') : ''
                          );
                          setIsModalOpen(true);
                        }}
                        className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-all cursor-pointer"
                        title="Edit Reference List"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Centered Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-4 border-b border-border flex items-center justify-between bg-muted/40">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
                  <Layers className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-foreground">Save Reference Choice List</h3>
                  <p className="text-[10px] font-mono text-muted-foreground">
                    Authoritative PostgreSQL: <strong className="text-primary">DES_BASE.quest_reference_data</strong>
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

            <form onSubmit={handleSaveDataset} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">List Name *</label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="e.g. EU Emission Standard"
                    className="w-full px-3 py-2 bg-background border border-border rounded-xl text-xs text-foreground focus:outline-hidden focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">Key Code *</label>
                  <input
                    type="text"
                    required
                    value={formKey}
                    onChange={(e) => setFormKey(e.target.value)}
                    placeholder="e.g. eu_emission_level"
                    className="w-full px-3 py-2 bg-background border border-border rounded-xl text-xs font-mono text-foreground focus:outline-hidden focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">Description</label>
                <input
                  type="text"
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  placeholder="Usage context across forms..."
                  className="w-full px-3 py-2 bg-background border border-border rounded-xl text-xs text-foreground focus:outline-hidden focus:ring-1 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  Options (format: "Label | value", one per line)
                </label>
                <textarea
                  required
                  value={formItemsText}
                  onChange={(e) => setFormItemsText(e.target.value)}
                  rows={5}
                  placeholder={'Euro VI-D | euro_6d\nEuro VI-E | euro_6e\nZero Emission (EV) | zero_ev'}
                  className="w-full px-3 py-2 bg-background border border-border rounded-xl text-xs font-mono text-foreground focus:outline-hidden focus:ring-1 focus:ring-primary resize-none"
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

export default ReferenceDataCanvas;
