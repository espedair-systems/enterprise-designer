import React, { useState } from 'react';
import { useStore } from '../../store/useStore';
import { api } from '../../services/api';
import { X, Save, Building2 } from 'lucide-react';
import { MarkdownDescriptionEditor } from '../forms/MarkdownDescriptionEditor';

export const EntityModal: React.FC = () => {
  const { modal, closeModal } = useStore();
  const [formData, setFormData] = useState<any>(modal.data || {});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!modal.isOpen || !modal.type) return null;

  const type = modal.type;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      if (type === 'capability') {
        await api.saveCapability({
          ...formData,
          level: Number(formData.level) || 1,
          current_maturity: Number(formData.current_maturity) || 3.0,
          target_maturity: Number(formData.target_maturity) || 4.0,
        });
      } else if (type === 'valuestream') {
        await api.saveValueStream(formData);
      } else if (type === 'process') {
        await api.saveProcess(formData);
      } else if (type === 'org_unit') {
        await api.saveOrgUnit({
          ...formData,
          headcount_fte: Number(formData.headcount_fte) || 1,
        });
      } else if (type === 'role') {
        await api.saveBusinessRole({
          ...formData,
          standard_rate_usd: Number(formData.standard_rate_usd) || 150,
          allocated_fte: Number(formData.allocated_fte) || 1.0,
        });
      } else if (type === 'service') {
        await api.saveService({
          ...formData,
          sla_availability_pct: Number(formData.sla_availability_pct) || 99.9,
        });
      } else if (type === 'goal') {
        await api.saveGoal({
          ...formData,
          progress_pct: Number(formData.progress_pct) || 0,
        });
      } else if (type === 'initiative') {
        await api.saveInitiative({
          ...formData,
          budget_usd: Number(formData.budget_usd) || 500000,
        });
      } else if (type === 'concept') {
        await api.saveConcept(formData);
      }
      closeModal();
      window.location.reload();
    } catch (err: any) {
      setError(err.message || 'Failed to save entity');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop Blur */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={closeModal}
      />

      {/* Centered Modal Content */}
      <div className="relative w-full max-w-xl bg-card rounded-2xl border border-border p-6 shadow-2xl space-y-6 z-10 animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-foreground capitalize">
                {formData.id ? 'Edit' : 'Create'} {type.replace('_', ' ')}
              </h2>
              <p className="text-xs text-muted-foreground">Authoritative Architecture Entity</p>
            </div>
          </div>
          <button
            onClick={closeModal}
            className="p-1 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-600 dark:text-rose-400">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-foreground font-medium mb-1">Code / Identifier</label>
              <input
                type="text"
                required
                value={formData.code || ''}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                placeholder="e.g. CAP-04, PROC-01"
                className="w-full bg-background border border-border rounded-xl px-3 py-2 text-foreground focus:border-primary outline-none"
              />
            </div>
            <div>
              <label className="block text-foreground font-medium mb-1">Name / Title</label>
              <input
                type="text"
                required
                value={formData.name || formData.title || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    name: e.target.value,
                    title: e.target.value,
                  })
                }
                placeholder="Entity name"
                className="w-full bg-background border border-border rounded-xl px-3 py-2 text-foreground focus:border-primary outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-foreground font-medium mb-1">Business Description & Scope</label>
            <MarkdownDescriptionEditor
              value={formData.description || ''}
              onChange={(val) => setFormData({ ...formData, description: val })}
              placeholder="Describe business purpose, strategic goals, architectural scope, and deliverables..."
            />
          </div>

          {type === 'capability' && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-foreground font-medium mb-1">PACE Layer</label>
                <select
                  value={formData.pace_layer || 'System of Differentiation'}
                  onChange={(e) => setFormData({ ...formData, pace_layer: e.target.value })}
                  className="w-full bg-background border border-border rounded-xl px-3 py-2 text-foreground outline-none"
                >
                  <option value="System of Innovation">System of Innovation</option>
                  <option value="System of Differentiation">System of Differentiation</option>
                  <option value="System of Record">System of Record</option>
                </select>
              </div>
              <div>
                <label className="block text-foreground font-medium mb-1">Strategic Importance</label>
                <select
                  value={formData.strategic_importance || 'Core Advantage'}
                  onChange={(e) => setFormData({ ...formData, strategic_importance: e.target.value })}
                  className="w-full bg-background border border-border rounded-xl px-3 py-2 text-foreground outline-none"
                >
                  <option value="Core Advantage">Core Advantage</option>
                  <option value="Differentiating">Differentiating</option>
                  <option value="Market Parity">Market Parity</option>
                  <option value="Commodity">Commodity</option>
                </select>
              </div>
              <div>
                <label className="block text-foreground font-medium mb-1">Current Maturity (1-5)</label>
                <input
                  type="number"
                  step="0.1"
                  min="1"
                  max="5"
                  value={formData.current_maturity || 3.0}
                  onChange={(e) => setFormData({ ...formData, current_maturity: e.target.value })}
                  className="w-full bg-background border border-border rounded-xl px-3 py-2 text-foreground outline-none"
                />
              </div>
              <div>
                <label className="block text-foreground font-medium mb-1">Target Maturity (1-5)</label>
                <input
                  type="number"
                  step="0.1"
                  min="1"
                  max="5"
                  value={formData.target_maturity || 4.5}
                  onChange={(e) => setFormData({ ...formData, target_maturity: e.target.value })}
                  className="w-full bg-background border border-border rounded-xl px-3 py-2 text-foreground outline-none"
                />
              </div>
            </div>
          )}

          {type === 'initiative' && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-foreground font-medium mb-1">Horizon</label>
                <select
                  value={formData.horizon || 'Horizon 1 (Core Operations)'}
                  onChange={(e) => setFormData({ ...formData, horizon: e.target.value })}
                  className="w-full bg-background border border-border rounded-xl px-3 py-2 text-foreground outline-none"
                >
                  <option value="Horizon 1 (Core Operations)">Horizon 1 (Core Operations)</option>
                  <option value="Horizon 2 (Emerging Growth)">Horizon 2 (Emerging Growth)</option>
                  <option value="Horizon 3 (Future Transformation)">Horizon 3 (Future Transformation)</option>
                </select>
              </div>
              <div>
                <label className="block text-foreground font-medium mb-1">Budget (USD)</label>
                <input
                  type="number"
                  value={formData.budget_usd || 500000}
                  onChange={(e) => setFormData({ ...formData, budget_usd: e.target.value })}
                  className="w-full bg-background border border-border rounded-xl px-3 py-2 text-foreground outline-none"
                />
              </div>
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
            <button
              type="button"
              onClick={closeModal}
              className="px-4 py-2 rounded-xl text-muted-foreground hover:text-foreground font-medium transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-xs transition-all disabled:opacity-50 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
