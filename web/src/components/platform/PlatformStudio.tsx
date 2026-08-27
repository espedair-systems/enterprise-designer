import React, { useState } from 'react';
import { useStore } from '../../store/useStore';
import {
  Layers,
  Briefcase,
  GitBranch,
  FileText,
  Server,
  Cloud,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  ExternalLink,
  Shield,
  Clock,
  Radio
} from 'lucide-react';

interface PlatformConnector {
  id: string;
  name: string;
  category: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  status: 'Connected' | 'Syncing' | 'Degraded' | 'Configured';
  lastSync: string;
  recordsSynced: number;
  health: number;
}

const PLATFORMS: PlatformConnector[] = [
  {
    id: 'plat-hcm',
    name: 'Enterprise HCM & Org Hierarchy',
    category: 'Human Capital & Org',
    description: 'Authoritative sync for Organizational Units, Business Functions, Job Profiles, and Worker Cost Rates.',
    icon: Briefcase,
    status: 'Connected',
    lastSync: '12 mins ago',
    recordsSynced: 1240,
    health: 99.8,
  },
  {
    id: 'plat-jira',
    name: 'Jira Software & Jira Align',
    category: 'Agile Delivery',
    description: 'Bi-directional synchronization of Strategic Initiatives, Epics, Sprints, and Program Milestones.',
    icon: GitBranch,
    status: 'Connected',
    lastSync: '5 mins ago',
    recordsSynced: 480,
    health: 98.5,
  },
  {
    id: 'plat-confluence',
    name: 'Confluence Architecture ADRs',
    category: 'Knowledge Base',
    description: 'Automated publishing of capability definitions and Architecture Decision Records (ADRs).',
    icon: FileText,
    status: 'Connected',
    lastSync: '1 hour ago',
    recordsSynced: 92,
    health: 100.0,
  },
  {
    id: 'plat-servicenow',
    name: 'ServiceNow SPM & CMDB',
    category: 'ITSM & Service Catalog',
    description: 'Bi-directional link between Business Services, CMDB Configuration Items, and SLA performance.',
    icon: Server,
    status: 'Connected',
    lastSync: '22 mins ago',
    recordsSynced: 310,
    health: 97.4,
  },
  {
    id: 'plat-cloud',
    name: 'AWS & Azure Cloud Cost Hub',
    category: 'Cloud Infrastructure',
    description: 'Multi-cloud infrastructure cost allocation mapped directly to Business Capabilities and Value Streams.',
    icon: Cloud,
    status: 'Configured',
    lastSync: '3 hours ago',
    recordsSynced: 15400,
    health: 99.1,
  },
];

export const PlatformStudio: React.FC = () => {
  const { activeView } = useStore();
  const [platforms, setPlatforms] = useState<PlatformConnector[]>(PLATFORMS);
  const [syncingId, setSyncingId] = useState<string | null>(null);

  const handleSyncNow = (id: string) => {
    setSyncingId(id);
    setTimeout(() => {
      setPlatforms((prev) =>
        prev.map((p) => (p.id === id ? { ...p, lastSync: 'Just now', status: 'Connected' } : p))
      );
      setSyncingId(null);
    }, 1200);
  };

  return (
    <div className="p-8 space-y-8 max-w-6xl mx-auto animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground flex items-center gap-2.5">
            <Layers className="w-6 h-6 text-indigo-500" />
            Enterprise Platforms & Integration Hub
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Authoritative bi-directional connectors for Enterprise HCM, Jira Align, ServiceNow SPM, and Cloud Infrastructure.
          </p>
        </div>

        <button
          onClick={() => handleSyncNow('all')}
          disabled={Boolean(syncingId)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold shadow-xs transition-all disabled:opacity-50 cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${syncingId ? 'animate-spin' : ''}`} />
          <span>{syncingId ? 'Syncing Integrations...' : 'Sync All Integrations'}</span>
        </button>
      </div>

      {/* Grid of Connectors */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {platforms.map((p) => {
          const Icon = p.icon;
          const isSyncing = syncingId === p.id || syncingId === 'all';
          return (
            <div
              key={p.id}
              className="p-6 rounded-2xl bg-card border border-border hover:border-primary/40 transition-all space-y-4 flex flex-col justify-between shadow-xs"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="p-2.5 rounded-xl bg-muted text-primary border border-border">
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="flex items-center gap-1.5 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    {p.status}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{p.category}</span>
                  <h3 className="text-sm font-bold text-foreground mt-0.5">{p.name}</h3>
                </div>

                <p className="text-xs text-muted-foreground leading-relaxed">
                  {p.description}
                </p>
              </div>

              <div className="pt-4 border-t border-border space-y-3">
                <div className="flex items-center justify-between text-[11px] text-muted-foreground font-mono">
                  <span>Last Sync: <strong className="text-foreground">{p.lastSync}</strong></span>
                  <span><strong className="text-foreground">{p.recordsSynced.toLocaleString()}</strong> CIs</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleSyncNow(p.id)}
                    disabled={isSyncing}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-muted hover:bg-muted/80 text-foreground text-xs font-semibold border border-border transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin text-primary' : ''}`} />
                    <span>{isSyncing ? 'Syncing...' : 'Sync Now'}</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
