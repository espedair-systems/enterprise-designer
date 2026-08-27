import React from 'react';
import { useStore } from '../../store/useStore';
import { UISettingsView } from './UISettingsView';
import { DataSettingsView } from './DataSettingsView';
import { ImportsExportsCanvas } from '../imports/ImportsExportsCanvas';
import { Users, Shield, Key, FileCheck2, Lock, Upload, Download } from 'lucide-react';

import { DatabaseCanvas } from '../database/DatabaseCanvas';

export const SettingsStudio: React.FC = () => {
  const { activeView } = useStore();

  if (activeView === 'database') {
    return <DatabaseCanvas />;
  }

  if (activeView === 'data-settings') {
    return <DataSettingsView />;
  }

  if (activeView === 'imports' || activeView === 'export') {
    return <ImportsExportsCanvas />;
  }

  if (activeView === 'admin-users') {
    return (
      <div className="flex-1 flex flex-col h-full bg-background text-foreground overflow-y-auto">
        <header className="bg-card border-b border-border px-8 py-5 flex items-center justify-between shrink-0 shadow-xs">
          <div className="flex items-center gap-3.5">
            <div className="p-2.5 rounded-2xl bg-primary/10 border border-primary/20 text-primary">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-foreground">User Management & IAM</h1>
                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-primary/10 text-primary border border-primary/20">
                  ADMIN SCHEMA
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Authoritative user profiles and entitlements stored in <code className="font-mono text-primary font-bold">admin.users</code>.
              </p>
            </div>
          </div>
        </header>

        <main className="p-8 max-w-5xl space-y-6">
          <div className="p-6 rounded-2xl bg-card border border-border space-y-4 shadow-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-emerald-500" />
                <span className="text-xs font-bold text-foreground">PostgreSQL Authoritative Schema: admin.users</span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold border border-emerald-500/20">
                Connected
              </span>
            </div>

            <div className="overflow-x-auto rounded-xl border border-border">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-muted/50 border-b border-border text-[10px] uppercase font-bold text-muted-foreground">
                    <th className="p-3">User ID</th>
                    <th className="p-3">Full Name</th>
                    <th className="p-3">Corporate Email</th>
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
                    <td className="p-3 font-mono text-muted-foreground">public, BA-*</td>
                    <td className="p-3"><span className="text-emerald-600 dark:text-emerald-400 font-bold text-[10px]">● Active</span></td>
                  </tr>
                  <tr className="hover:bg-muted/20 transition-colors">
                    <td className="p-3 font-mono font-bold text-foreground">EMP-774120</td>
                    <td className="p-3 font-semibold text-foreground">Value Stream Lead</td>
                    <td className="p-3 text-muted-foreground font-mono">valuestream.lead@enterprise.internal</td>
                    <td className="p-3"><span className="px-2 py-0.5 rounded bg-purple-500/10 text-purple-600 dark:text-purple-400 font-bold text-[10px]">Value Stream Architect</span></td>
                    <td className="p-3 font-mono text-muted-foreground">public, BA-RETAIL-BANKING</td>
                    <td className="p-3"><span className="text-emerald-600 dark:text-emerald-400 font-bold text-[10px]">● Active</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (activeView === 'admin-roles') {
    return (
      <div className="flex-1 flex flex-col h-full bg-background text-foreground overflow-y-auto">
        <header className="bg-card border-b border-border px-8 py-5 flex items-center justify-between shrink-0 shadow-xs">
          <div className="flex items-center gap-3.5">
            <div className="p-2.5 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-500">
              <Shield className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-foreground">Roles & Entitlements Governance</h1>
                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-purple-500/10 text-purple-500 border border-purple-500/20">
                  RBAC SECURITY
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Role-based permissions and access policies stored in <code className="font-mono text-purple-500 font-bold">admin.roles</code>.
              </p>
            </div>
          </div>
        </header>

        <main className="p-8 max-w-5xl space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="p-5 rounded-2xl bg-card border border-border space-y-3 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-foreground">Principal Architect</span>
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-primary/10 text-primary font-bold">Superadmin</span>
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Full read/write/delete permissions across all metamodels, PostgreSQL schemas, and tenancies.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-card border border-border space-y-3 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-foreground">Business Architect</span>
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-500 font-bold">BA Schemas</span>
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Full modeling authority over capabilities, value streams, strategy, and business processes.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-card border border-border space-y-3 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-foreground">Executive Stakeholder</span>
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-bold">Viewer</span>
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Read-only visibility for executive dashboards, maturity radars, and export reports.
              </p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (activeView === 'admin-sso') {
    return (
      <div className="flex-1 flex flex-col h-full bg-background text-foreground overflow-y-auto">
        <header className="bg-card border-b border-border px-8 py-5 flex items-center justify-between shrink-0 shadow-xs">
          <div className="flex items-center gap-3.5">
            <div className="p-2.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-500">
              <Key className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-foreground">Single Sign-On (SSO) & Directory IAM</h1>
                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20">
                  OIDC / SAML2
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Corporate IAM federation and SAML 2.0 / OpenID Connect identity provider federation.
              </p>
            </div>
          </div>
        </header>

        <main className="p-8 max-w-5xl space-y-6">
          <div className="p-6 rounded-2xl bg-card border border-border space-y-4 shadow-xs">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <span className="text-xs font-bold text-foreground">Identity Provider Federation</span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-500/20">
                SSO Enabled
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-xl bg-muted/20 border border-border space-y-1">
                <span className="text-muted-foreground font-semibold text-[10px] uppercase">Protocol</span>
                <span className="font-mono font-bold text-foreground block">OpenID Connect (OIDC) / SAML 2.0</span>
              </div>
              <div className="p-4 rounded-xl bg-muted/20 border border-border space-y-1">
                <span className="text-muted-foreground font-semibold text-[10px] uppercase">Directory Issuer</span>
                <span className="font-mono font-bold text-foreground block">https://identity.enterprise.internal</span>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (activeView === 'admin-audit') {
    return (
      <div className="flex-1 flex flex-col h-full bg-background text-foreground overflow-y-auto">
        <header className="bg-card border-b border-border px-8 py-5 flex items-center justify-between shrink-0 shadow-xs">
          <div className="flex items-center gap-3.5">
            <div className="p-2.5 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-500">
              <FileCheck2 className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-foreground">Compliance Audit Trail & Event Log</h1>
                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-cyan-500/10 text-cyan-500 border border-cyan-500/20">
                  AUDIT
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Immutable security and mutation records stored in <code className="font-mono text-cyan-500 font-bold">admin.audit_logs</code>.
              </p>
            </div>
          </div>
        </header>

        <main className="p-8 max-w-5xl space-y-6">
          <div className="p-6 rounded-2xl bg-card border border-border space-y-4 shadow-xs">
            <div className="overflow-x-auto rounded-xl border border-border">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-muted/50 border-b border-border text-[10px] uppercase font-bold text-muted-foreground">
                    <th className="p-3">Timestamp</th>
                    <th className="p-3">Actor</th>
                    <th className="p-3">Action</th>
                    <th className="p-3">Target Schema</th>
                    <th className="p-3">Event Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border bg-card">
                  <tr className="hover:bg-muted/20 transition-colors">
                    <td className="p-3 font-mono text-muted-foreground">2026-08-22 13:45:00</td>
                    <td className="p-3 font-mono font-bold text-foreground">EMP-892401</td>
                    <td className="p-3 font-semibold text-foreground">AUTH_SESSION_ESTABLISHED</td>
                    <td className="p-3 font-mono text-muted-foreground">public</td>
                    <td className="p-3"><span className="text-emerald-600 dark:text-emerald-400 font-bold text-[10px]">SUCCESS</span></td>
                  </tr>
                  <tr className="hover:bg-muted/20 transition-colors">
                    <td className="p-3 font-mono text-muted-foreground">2026-08-22 13:40:12</td>
                    <td className="p-3 font-mono font-bold text-foreground">SYSTEM_DAEMON</td>
                    <td className="p-3 font-semibold text-foreground">SCHEMA_INTEGRITY_CHECK</td>
                    <td className="p-3 font-mono text-muted-foreground">public, BA-*</td>
                    <td className="p-3"><span className="text-emerald-600 dark:text-emerald-400 font-bold text-[10px]">SUCCESS</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Default: UI & Display Settings
  return <UISettingsView />;
};
