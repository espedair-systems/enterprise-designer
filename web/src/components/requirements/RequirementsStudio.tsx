import React, { useState } from 'react';
import { useStore } from '../../store/useStore';
import { MarkdownDescriptionEditor } from '../forms/MarkdownDescriptionEditor';
import {
  FileText,
  Search,
  Plus,
  Filter,
  CheckCircle2,
  Clock,
  AlertCircle,
  Tag,
  Target,
  ArrowRight,
  GitFork,
  Layers
} from 'lucide-react';

interface RequirementItem {
  id: string;
  code: string;
  title: string;
  description: string;
  type: 'Functional' | 'Non-Functional' | 'Regulatory' | 'User Story';
  priority: 'P1 - Critical' | 'P2 - High' | 'P3 - Medium' | 'P4 - Low';
  status: 'Approved' | 'In Analysis' | 'Draft' | 'Implemented';
  realizedByCapability: string;
  realizedByProcess: string;
  owner: string;
}

const INITIAL_REQUIREMENTS: RequirementItem[] = [
  {
    id: 'req-001',
    code: 'REQ-CORE-01',
    title: 'Real-Time Cross-Border FX Rate Streaming',
    description: 'The platform must stream sub-second multi-currency spot rates to liquidity providers and treasury settlement engines.',
    type: 'Functional',
    priority: 'P1 - Critical',
    status: 'Approved',
    realizedByCapability: 'Payment & Settlement Engine (cap-102)',
    realizedByProcess: 'Liquidity & Collateral Rebalancing (prc-201)',
    owner: 'Treasury Operations Lead',
  },
  {
    id: 'req-002',
    code: 'REQ-SEC-02',
    title: 'Zero-Trust mTLS Inter-Service Authentication',
    description: 'All inter-domain business service communication must enforce mutual TLS with dynamic ephemeral certificate rotation.',
    type: 'Non-Functional',
    priority: 'P1 - Critical',
    status: 'Approved',
    realizedByCapability: 'Security & Access Control (cap-106)',
    realizedByProcess: 'Merchant Onboarding & KYC (prc-101)',
    owner: 'Information Security Officer',
  },
  {
    id: 'req-003',
    code: 'REQ-REG-03',
    title: 'CPS 230 Operational Risk Gating & Critical Operations Registry',
    description: 'Maintain end-to-end operational tolerance thresholds for critical operations with automated breach alerting.',
    type: 'Regulatory',
    priority: 'P1 - Critical',
    status: 'In Analysis',
    realizedByCapability: 'Compliance & Audit Assurance (cap-107)',
    realizedByProcess: 'Trade Clearing & Settlement (prc-102)',
    owner: 'Regulatory Compliance Director',
  },
  {
    id: 'req-004',
    code: 'REQ-US-04',
    title: 'Customer Self-Service Limit Adjustment',
    description: 'As a corporate treasurer, I want to adjust intraday disbursement limits with two-person approval authorization.',
    type: 'User Story',
    priority: 'P2 - High',
    status: 'Approved',
    realizedByCapability: 'Account & Ledger Management (cap-104)',
    realizedByProcess: 'Credit Assessment & Underwriting (prc-301)',
    owner: 'Commercial Banking BA',
  },
  {
    id: 'req-005',
    code: 'REQ-DAT-05',
    title: 'Canonical Product Schema Event Publishing',
    description: 'Publish change-data-capture events for all product catalog modifications across Kafka topic stream.',
    type: 'Functional',
    priority: 'P2 - High',
    status: 'Draft',
    realizedByCapability: 'Product Catalog & Pricing (cap-105)',
    realizedByProcess: 'Policy Formulation & Governance (prc-401)',
    owner: 'Enterprise Data Architect',
  },
];

export const RequirementsStudio: React.FC = () => {
  const [requirements, setRequirements] = useState<RequirementItem[]>(INITIAL_REQUIREMENTS);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);

  const [newReq, setNewReq] = useState<Partial<RequirementItem>>({
    code: 'REQ-NEW-01',
    title: '',
    description: '',
    type: 'Functional',
    priority: 'P2 - High',
    status: 'Draft',
    realizedByCapability: 'Payment & Settlement Engine (cap-102)',
    realizedByProcess: 'Merchant Onboarding & KYC (prc-101)',
    owner: 'Business Analyst',
  });

  const filtered = requirements.filter((r) => {
    const matchesSearch =
      r.title.toLowerCase().includes(search.toLowerCase()) ||
      r.code.toLowerCase().includes(search.toLowerCase()) ||
      r.realizedByCapability.toLowerCase().includes(search.toLowerCase()) ||
      r.description.toLowerCase().includes(search.toLowerCase());
    const matchesType = filterType === 'all' || r.type === filterType;
    const matchesPriority = filterPriority === 'all' || r.priority.startsWith(filterPriority);
    return matchesSearch && matchesType && matchesPriority;
  });

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReq.title) return;
    const item: RequirementItem = {
      id: `req-${Date.now()}`,
      code: newReq.code || `REQ-${Date.now().toString().slice(-4)}`,
      title: newReq.title,
      description: newReq.description || '',
      type: (newReq.type as any) || 'Functional',
      priority: (newReq.priority as any) || 'P2 - High',
      status: (newReq.status as any) || 'Draft',
      realizedByCapability: newReq.realizedByCapability || 'Unassigned',
      realizedByProcess: newReq.realizedByProcess || 'Unassigned',
      owner: newReq.owner || 'Business Analyst',
    };
    setRequirements([item, ...requirements]);
    setShowAddModal(false);
    setNewReq({
      code: `REQ-NEW-${requirements.length + 2}`,
      title: '',
      description: '',
      type: 'Functional',
      priority: 'P2 - High',
      status: 'Draft',
      realizedByCapability: 'Payment & Settlement Engine (cap-102)',
      realizedByProcess: 'Merchant Onboarding & KYC (prc-101)',
      owner: 'Business Analyst',
    });
  };

  const approvedCount = requirements.filter((r) => r.status === 'Approved').length;
  const criticalCount = requirements.filter((r) => r.priority.includes('P1')).length;
  const coveragePct = Math.round((requirements.filter((r) => r.realizedByCapability !== 'Unassigned').length / requirements.length) * 100);

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground flex items-center gap-2.5">
            <FileText className="w-6 h-6 text-indigo-500" />
            Requirements & User Stories Catalog
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Business requirements, functional specifications, and user stories mapped to Business Capabilities and SIPOC Processes.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold shadow-xs transition-all self-start md:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>New Requirement</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-card border border-border space-y-1 shadow-xs">
          <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Total Requirements</span>
          <div className="text-2xl font-bold text-foreground">{requirements.length}</div>
          <span className="text-[10px] text-muted-foreground">Documented in Repository</span>
        </div>

        <div className="p-4 rounded-2xl bg-card border border-border space-y-1 shadow-xs">
          <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Approved & Signed-off</span>
          <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{approvedCount}</div>
          <span className="text-[10px] text-muted-foreground">Ready for Sprint Intake</span>
        </div>

        <div className="p-4 rounded-2xl bg-card border border-border space-y-1 shadow-xs">
          <span className="text-[11px] font-medium text-rose-600 dark:text-rose-400 uppercase tracking-wider">P1 Critical Items</span>
          <div className="text-2xl font-bold text-rose-600 dark:text-rose-400">{criticalCount}</div>
          <span className="text-[10px] text-muted-foreground">Architecture Gates</span>
        </div>

        <div className="p-4 rounded-2xl bg-card border border-border space-y-1 shadow-xs">
          <span className="text-[11px] font-medium text-cyan-600 dark:text-cyan-400 uppercase tracking-wider">Capability Realization</span>
          <div className="text-2xl font-bold text-cyan-600 dark:text-cyan-400">{coveragePct}%</div>
          <span className="text-[10px] text-muted-foreground">Traceability Coverage</span>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search requirements, code, capability realization, or description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-card border border-border rounded-xl pl-9 pr-4 py-2 text-xs text-foreground placeholder-muted-foreground outline-none focus:border-primary transition-all shadow-xs"
          />
        </div>

        <div className="flex gap-2">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="bg-card border border-border rounded-xl px-3 py-2 text-xs text-foreground outline-none shadow-xs cursor-pointer"
          >
            <option value="all">All Types</option>
            <option value="Functional">Functional</option>
            <option value="Non-Functional">Non-Functional</option>
            <option value="Regulatory">Regulatory</option>
            <option value="User Story">User Story</option>
          </select>

          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="bg-card border border-border rounded-xl px-3 py-2 text-xs text-foreground outline-none shadow-xs cursor-pointer"
          >
            <option value="all">All Priorities</option>
            <option value="P1">P1 - Critical</option>
            <option value="P2">P2 - High</option>
            <option value="P3">P3 - Medium</option>
          </select>
        </div>
      </div>

      {/* Requirements List */}
      <div className="space-y-3">
        {filtered.map((req) => (
          <div
            key={req.id}
            className="p-5 rounded-2xl bg-card border border-border hover:border-primary/40 transition-all space-y-3 group shadow-xs"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-3">
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
                  {req.code}
                </span>
                <h3 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">
                  {req.title}
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                  req.priority.includes('P1')
                    ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20'
                    : req.priority.includes('P2')
                    ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
                    : 'bg-muted text-muted-foreground border-border'
                }`}>
                  {req.priority}
                </span>

                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                  req.status === 'Approved'
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                    : req.status === 'In Analysis'
                    ? 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20'
                    : 'bg-muted text-muted-foreground border-border'
                }`}>
                  {req.status}
                </span>

                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-muted text-muted-foreground border border-border">
                  {req.type}
                </span>
              </div>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed">
              {req.description}
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2 border-t border-border text-[11px] text-muted-foreground font-mono">
              <div className="flex items-center gap-1.5 text-indigo-500">
                <Target className="w-3.5 h-3.5" />
                <span>Realizes: <strong className="text-foreground">{req.realizedByCapability}</strong></span>
              </div>
              <div className="flex items-center gap-1.5 text-cyan-500">
                <GitFork className="w-3.5 h-3.5" />
                <span>Process: <strong className="text-foreground">{req.realizedByProcess}</strong></span>
              </div>
              <div className="flex items-center gap-1.5 text-muted-foreground ml-auto">
                <span>Owner: {req.owner}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Requirement Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowAddModal(false)} />
          <div className="relative w-full max-w-lg bg-card rounded-2xl border border-border p-6 shadow-2xl space-y-4 z-10 animate-in zoom-in-95 duration-200 text-xs">
            <h2 className="text-base font-bold text-foreground flex items-center gap-2">
              <FileText className="w-4 h-4 text-primary" />
              <span>Add Business Requirement</span>
            </h2>

            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <label className="block text-foreground font-medium mb-1">Requirement Code</label>
                <input
                  type="text"
                  required
                  value={newReq.code}
                  onChange={(e) => setNewReq({ ...newReq, code: e.target.value })}
                  className="w-full bg-background border border-border rounded-xl px-3 py-2 text-foreground font-mono outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-foreground font-medium mb-1">Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Automated Collateral Margin Call Settlement"
                  value={newReq.title}
                  onChange={(e) => setNewReq({ ...newReq, title: e.target.value })}
                  className="w-full bg-background border border-border rounded-xl px-3 py-2 text-foreground outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-foreground font-medium mb-1">Functional Description & Scope</label>
                <MarkdownDescriptionEditor
                  placeholder="Detailed functional specification or user story acceptance criteria..."
                  value={newReq.description}
                  onChange={(val) => setNewReq({ ...newReq, description: val })}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-foreground font-medium mb-1">Type</label>
                  <select
                    value={newReq.type}
                    onChange={(e) => setNewReq({ ...newReq, type: e.target.value as any })}
                    className="w-full bg-background border border-border rounded-xl px-3 py-2 text-foreground outline-none cursor-pointer"
                  >
                    <option value="Functional">Functional</option>
                    <option value="Non-Functional">Non-Functional</option>
                    <option value="Regulatory">Regulatory</option>
                    <option value="User Story">User Story</option>
                  </select>
                </div>

                <div>
                  <label className="block text-foreground font-medium mb-1">Priority</label>
                  <select
                    value={newReq.priority}
                    onChange={(e) => setNewReq({ ...newReq, priority: e.target.value as any })}
                    className="w-full bg-background border border-border rounded-xl px-3 py-2 text-foreground outline-none cursor-pointer"
                  >
                    <option value="P1 - Critical">P1 - Critical</option>
                    <option value="P2 - High">P2 - High</option>
                    <option value="P3 - Medium">P3 - Medium</option>
                    <option value="P4 - Low">P4 - Low</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-xs cursor-pointer"
                >
                  Create Requirement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
