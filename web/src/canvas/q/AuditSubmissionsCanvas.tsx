import React, { useState, useEffect } from 'react';
import {
  Activity,
  Search,
  CheckCircle2,
  Eye,
  FileText,
  Calendar,
  X,
  User,
  ShieldCheck,
} from 'lucide-react';
import { api } from '../../services/api';

export interface SubmissionItem {
  id: string;
  survey_id: string;
  respondent_id: string;
  status: string;
  answers: Record<string, any>;
  submitted_at: string;
}

export const AuditSubmissionsCanvas: React.FC = () => {
  const [submissions, setSubmissions] = useState<SubmissionItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [inspectItem, setInspectItem] = useState<SubmissionItem | null>(null);

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      const res = await api.listQuestSubmissions();
      if (res) {
        setSubmissions(res);
      }
    } catch (err) {
      console.warn('Failed to load submissions', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredSubmissions = submissions.filter((s) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      s.id.toLowerCase().includes(q) ||
      s.respondent_id.toLowerCase().includes(q) ||
      s.survey_id.toLowerCase().includes(q)
    );
  });

  return (
    <div className="flex-1 flex flex-col h-full bg-background select-none overflow-hidden">
      {/* Header */}
      <div className="h-14 border-b border-border bg-card/80 backdrop-blur-md px-6 flex items-center justify-between shrink-0 z-10">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-primary/10 text-primary border border-primary/20">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-foreground">Audit Submissions & Responses</h2>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-muted text-muted-foreground border border-border">
                DES_BASE.quest_submissions
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/30">
                {submissions.length} Completed
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Authoritative Survey Response Records, Inspection Results & Integrity Logs
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by respondent, ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-background border border-border rounded-xl text-xs text-foreground focus:outline-hidden focus:ring-1 focus:ring-primary"
            />
          </div>
        </div>
      </div>

      {/* Pure Table */}
      <div className="flex-1 overflow-auto p-6">
        <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-border bg-muted/40 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                <th className="py-3 px-4">Submission ID</th>
                <th className="py-3 px-4">Survey Reference</th>
                <th className="py-3 px-4">Respondent Identity</th>
                <th className="py-3 px-4">Answer Payload</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Submitted Timestamp</th>
                <th className="py-3 px-4 text-right">Inspect</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-muted-foreground font-mono text-xs">
                    Loading audit records from PostgreSQL DES_BASE...
                  </td>
                </tr>
              ) : filteredSubmissions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-muted-foreground">
                    <Activity className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    <p className="font-semibold">No audit submissions recorded</p>
                  </td>
                </tr>
              ) : (
                filteredSubmissions.map((sub) => (
                  <tr key={sub.id} className="hover:bg-muted/30 transition-colors">
                    <td className="py-3.5 px-4 font-mono text-[11px] font-bold text-primary">
                      {sub.id}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[10px] text-muted-foreground">
                      {sub.survey_id}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5 font-semibold text-xs text-foreground">
                        <User className="w-3.5 h-3.5 text-muted-foreground" />
                        <span>{sub.respondent_id}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[11px] text-foreground">
                      {Object.keys(sub.answers || {}).length} fields verified
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                        {sub.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[10px] text-muted-foreground">
                      {new Date(sub.submitted_at).toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => setInspectItem(sub)}
                        className="p-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground transition-all cursor-pointer"
                        title="View Full Answers"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Centered Answers Inspector Modal */}
      {inspectItem && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl shadow-2xl max-w-xl w-full max-h-[80vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-4 border-b border-border flex items-center justify-between bg-muted/40 shrink-0">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-foreground">Submission Audit Payload</h3>
                  <p className="text-[10px] font-mono text-muted-foreground">
                    Record ID: <strong className="text-primary">{inspectItem.id}</strong>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setInspectItem(null)}
                className="p-1 text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 flex-1">
              <div className="grid grid-cols-2 gap-3 text-xs bg-muted/30 p-3 rounded-xl border border-border">
                <div>
                  <span className="text-muted-foreground block text-[10px]">Respondent</span>
                  <strong className="text-foreground">{inspectItem.respondent_id}</strong>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[10px]">Submitted At</span>
                  <strong className="text-foreground">
                    {new Date(inspectItem.submitted_at).toLocaleString()}
                  </strong>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-2">
                  Answer Data (JSON)
                </label>
                <pre className="p-4 rounded-xl bg-background border border-border text-[11px] font-mono text-cyan-400 overflow-x-auto">
                  {JSON.stringify(inspectItem.answers, null, 2)}
                </pre>
              </div>
            </div>

            <div className="p-4 border-t border-border flex justify-end bg-muted/20 shrink-0">
              <button
                type="button"
                onClick={() => setInspectItem(null)}
                className="px-4 py-2 bg-primary text-primary-foreground text-xs font-bold rounded-xl shadow-xs cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuditSubmissionsCanvas;
