import React, { useState } from 'react';
import { useStore } from '../../store/useStore';
import {
  Users,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Search,
  Filter,
  Layers,
  GitFork,
  Briefcase
} from 'lucide-react';

interface RaciRow {
  id: string;
  activity: string;
  type: 'Capability' | 'Process';
  executiveSponsor: 'A' | 'R' | 'C' | 'I' | '-';
  principalArchitect: 'A' | 'R' | 'C' | 'I' | '-';
  operationsLead: 'A' | 'R' | 'C' | 'I' | '-';
  riskOfficer: 'A' | 'R' | 'C' | 'I' | '-';
  treasuryLead: 'A' | 'R' | 'C' | 'I' | '-';
}

const INITIAL_RACI: RaciRow[] = [
  {
    id: 'raci-1',
    activity: 'Payment & Settlement Engine (cap-102)',
    type: 'Capability',
    executiveSponsor: 'A',
    principalArchitect: 'R',
    operationsLead: 'C',
    riskOfficer: 'C',
    treasuryLead: 'I',
  },
  {
    id: 'raci-2',
    activity: 'Merchant Onboarding & KYC (prc-101)',
    type: 'Process',
    executiveSponsor: 'I',
    principalArchitect: 'C',
    operationsLead: 'A',
    riskOfficer: 'R',
    treasuryLead: 'I',
  },
  {
    id: 'raci-3',
    activity: 'Trade Clearing & Settlement (prc-102)',
    type: 'Process',
    executiveSponsor: 'I',
    principalArchitect: 'C',
    operationsLead: 'R',
    riskOfficer: 'C',
    treasuryLead: 'A',
  },
  {
    id: 'raci-4',
    activity: 'Credit Assessment & Underwriting (cap-103)',
    type: 'Capability',
    executiveSponsor: 'A',
    principalArchitect: 'R',
    operationsLead: 'C',
    riskOfficer: 'R',
    treasuryLead: 'I',
  },
  {
    id: 'raci-5',
    activity: 'Liquidity & Collateral Rebalancing (prc-201)',
    type: 'Process',
    executiveSponsor: 'I',
    principalArchitect: 'C',
    operationsLead: 'R',
    riskOfficer: 'C',
    treasuryLead: 'A',
  },
];

export const RaciStudio: React.FC = () => {
  const [raciList, setRaciList] = useState<RaciRow[]>(INITIAL_RACI);
  const [search, setSearch] = useState('');

  const filtered = raciList.filter((r) =>
    r.activity.toLowerCase().includes(search.toLowerCase()) ||
    r.type.toLowerCase().includes(search.toLowerCase())
  );

  const getRaciBadge = (val: string) => {
    switch (val) {
      case 'A':
        return 'bg-primary text-primary-foreground font-bold border-primary shadow-xs';
      case 'R':
        return 'bg-cyan-600 text-white font-bold border-cyan-500 shadow-xs';
      case 'C':
        return 'bg-amber-600 text-white font-bold border-amber-500 shadow-xs';
      case 'I':
        return 'bg-muted text-muted-foreground font-bold border-border';
      default:
        return 'bg-muted/40 text-muted-foreground border-border';
    }
  };

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground flex items-center gap-2.5">
            <Users className="w-6 h-6 text-indigo-500" />
            RACI Governance & Responsibility Matrix
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Accountable, Responsible, Consulted, and Informed role assignments across Business Capabilities and SIPOC Processes.
          </p>
        </div>
      </div>

      {/* Legend Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
        <div className="p-3.5 rounded-xl bg-card border border-border flex items-center gap-3 shadow-xs">
          <span className="w-7 h-7 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">
            A
          </span>
          <div>
            <strong className="text-foreground block">Accountable</strong>
            <span className="text-[10px] text-muted-foreground">Single decision maker</span>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-card border border-border flex items-center gap-3 shadow-xs">
          <span className="w-7 h-7 rounded-lg bg-cyan-600 text-white flex items-center justify-center font-bold text-sm">
            R
          </span>
          <div>
            <strong className="text-foreground block">Responsible</strong>
            <span className="text-[10px] text-muted-foreground">Executes the activity</span>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-card border border-border flex items-center gap-3 shadow-xs">
          <span className="w-7 h-7 rounded-lg bg-amber-600 text-white flex items-center justify-center font-bold text-sm">
            C
          </span>
          <div>
            <strong className="text-foreground block">Consulted</strong>
            <span className="text-[10px] text-muted-foreground">Two-way feedback</span>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-card border border-border flex items-center gap-3 shadow-xs">
          <span className="w-7 h-7 rounded-lg bg-muted text-muted-foreground flex items-center justify-center font-bold text-sm border border-border">
            I
          </span>
          <div>
            <strong className="text-foreground block">Informed</strong>
            <span className="text-[10px] text-muted-foreground">Kept up-to-date</span>
          </div>
        </div>
      </div>

      {/* Search Filter */}
      <div className="relative">
        <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Filter activities or processes..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-card border border-border rounded-xl pl-9 pr-4 py-2 text-xs text-foreground placeholder-muted-foreground outline-none focus:border-primary shadow-xs"
        />
      </div>

      {/* RACI Grid Table */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-muted/50 border-b border-border text-muted-foreground font-semibold">
              <tr>
                <th className="py-3.5 px-4">Business Architecture Activity</th>
                <th className="py-3.5 px-3">Type</th>
                <th className="py-3.5 px-3 text-center">Executive Sponsor</th>
                <th className="py-3.5 px-3 text-center">Principal Architect</th>
                <th className="py-3.5 px-3 text-center">Operations Lead</th>
                <th className="py-3.5 px-3 text-center">Risk Officer</th>
                <th className="py-3.5 px-3 text-center">Treasury Lead</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((row) => (
                <tr key={row.id} className="hover:bg-muted/20 transition-colors">
                  <td className="py-3 px-4 font-semibold text-foreground">
                    {row.activity}
                  </td>
                  <td className="py-3 px-3">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-muted text-muted-foreground border border-border">
                      {row.type}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-center">
                    <span className={`inline-block w-6 h-6 rounded-lg text-center leading-6 border text-xs ${getRaciBadge(row.executiveSponsor)}`}>
                      {row.executiveSponsor}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-center">
                    <span className={`inline-block w-6 h-6 rounded-lg text-center leading-6 border text-xs ${getRaciBadge(row.principalArchitect)}`}>
                      {row.principalArchitect}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-center">
                    <span className={`inline-block w-6 h-6 rounded-lg text-center leading-6 border text-xs ${getRaciBadge(row.operationsLead)}`}>
                      {row.operationsLead}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-center">
                    <span className={`inline-block w-6 h-6 rounded-lg text-center leading-6 border text-xs ${getRaciBadge(row.riskOfficer)}`}>
                      {row.riskOfficer}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-center">
                    <span className={`inline-block w-6 h-6 rounded-lg text-center leading-6 border text-xs ${getRaciBadge(row.treasuryLead)}`}>
                      {row.treasuryLead}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
