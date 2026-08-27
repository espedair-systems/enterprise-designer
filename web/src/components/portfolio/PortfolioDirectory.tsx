import React from 'react';
import {
  Server,
  Ticket,
  ShieldAlert,
  ArrowUpRight,
  ChevronRight,
  Layers,
  Activity,
  AlertTriangle,
  FileCheck2,
  HardDrive,
  Cpu,
  Clock,
  CheckCircle2,
  BarChart3
} from 'lucide-react';

interface PortfolioCard {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  badge: string;
  tags: string[];
  metrics: { label: string; value: string; color?: string }[];
}

const PORTFOLIO_CARDS: PortfolioCard[] = [
  {
    id: 'cmdb',
    title: 'CMDB',
    subtitle: 'Configuration Management Database & CI Topology',
    description: 'Authoritative inventory of hardware, software, virtual machines, cloud instances, network topology, and configuration item (CI) dependencies.',
    icon: Server,
    color: 'from-blue-500/20 via-blue-500/5 to-transparent text-blue-500 border-blue-500/30',
    badge: 'ITIL v4 Service Asset',
    tags: ['Configuration Items', 'Dependency Graph', 'Cloud Topology', 'Asset Lifecycle', 'Audit Traceability'],
    metrics: [
      { label: 'Tracked CIs', value: '1,428 Active' },
      { label: 'Topology Health', value: '99.4%', color: 'text-emerald-500' },
      { label: 'Unmapped Rel', value: '0 Critical', color: 'text-emerald-500' }
    ]
  },
  {
    id: 'trouble-tickets',
    title: 'Trouble Tickets',
    subtitle: 'ITIL Incident, Problem & Service Request Queue',
    description: 'Enterprise incident management, root cause problem tracking, SLA threshold monitoring, and automated escalation workflows.',
    icon: Ticket,
    color: 'from-amber-500/20 via-amber-500/5 to-transparent text-amber-500 border-amber-500/30',
    badge: 'SLA Engine',
    tags: ['Incident Queue', 'Root Cause Analysis', 'SLA Tracking', 'Change Requests', 'MTTR 18m'],
    metrics: [
      { label: 'Open P1/P2', value: '0 Pending', color: 'text-emerald-500' },
      { label: 'SLA Compliance', value: '99.8%', color: 'text-emerald-500' },
      { label: 'Avg MTTR', value: '14.2 min' }
    ]
  },
  {
    id: 'risk-management',
    title: 'Risk Management',
    subtitle: 'Enterprise Risk Register, Heatmap & FAIR Assessment',
    description: 'ISO 31000 and FAIR quantitative risk analysis, threat likelihood scoring, loss exposure estimations, and mitigation control governance.',
    icon: ShieldAlert,
    color: 'from-rose-500/20 via-rose-500/5 to-transparent text-rose-500 border-rose-500/30',
    badge: 'ISO 31000 / FAIR',
    tags: ['Risk Register', 'Threat Vectors', 'Loss Exposure', 'Mitigation Plans', 'Residual Risk'],
    metrics: [
      { label: 'Total Assessed', value: '42 Risks' },
      { label: 'High Severity', value: '2 Mitigating', color: 'text-amber-500' },
      { label: 'Control Coverage', value: '94.2%', color: 'text-emerald-500' }
    ]
  }
];

export const PortfolioDirectory: React.FC = () => {
  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto animate-in fade-in duration-300">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <div className="flex items-center gap-2.5 mb-1.5">
            <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold uppercase tracking-wider bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
              Enterprise Portfolio
            </span>
            <span className="text-xs text-muted-foreground font-mono">Operations & Governance Studios</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-foreground">
            Enterprise Portfolio Directory
          </h1>
          <p className="text-xs md:text-sm text-muted-foreground mt-1">
            Configuration Management Database (CMDB), ITIL trouble tickets, and enterprise risk governance.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-card border border-border text-xs font-mono">
            <Activity className="w-3.5 h-3.5 text-emerald-500" />
            <span className="text-muted-foreground">Portfolio Status:</span>
            <span className="font-bold text-emerald-500">All Systems Nominal</span>
          </div>
        </div>
      </div>

      {/* ── Cards for CMDB, Trouble Tickets, Risk Management ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {PORTFOLIO_CARDS.map((card) => {
          const Icon = card.icon;

          return (
            <div
              key={card.id}
              className="group relative rounded-2xl bg-card border border-border hover:border-primary/50 p-7 flex flex-col justify-between transition-all duration-200 hover:shadow-md cursor-pointer overflow-hidden"
            >
              {/* Accent Background Gradient */}
              <div className={`absolute inset-0 bg-gradient-to-br ${card.color} opacity-30 group-hover:opacity-50 transition-opacity pointer-events-none`} />

              <div className="relative space-y-4">
                {/* Header: Icon & Badge */}
                <div className="flex items-start justify-between gap-2">
                  <div className="w-12 h-12 rounded-xl bg-card border border-border flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] font-semibold font-mono px-2.5 py-1 rounded-md bg-card/90 border border-border text-foreground shadow-2xs">
                    {card.badge}
                  </span>
                </div>

                {/* Title and Subtitle */}
                <div>
                  <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors flex items-center gap-1.5">
                    <span>{card.title}</span>
                    <ArrowUpRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </h3>
                  <div className="text-xs font-medium text-muted-foreground mt-0.5">{card.subtitle}</div>
                </div>

                <p className="text-xs text-muted-foreground leading-relaxed">
                  {card.description}
                </p>

                {/* Key Metrics Grid */}
                <div className="grid grid-cols-3 gap-2 pt-1 text-[11px] font-mono">
                  {card.metrics.map((m) => (
                    <div key={m.label} className="p-2 rounded-lg bg-muted/40 border border-border/60">
                      <div className="text-[9px] uppercase tracking-wider text-muted-foreground font-semibold truncate">{m.label}</div>
                      <div className={`font-bold truncate mt-0.5 ${m.color || 'text-foreground'}`}>{m.value}</div>
                    </div>
                  ))}
                </div>

                {/* Taxonomy Tags */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {card.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-[9px] px-2 py-0.5 rounded font-mono bg-muted/80 text-muted-foreground border border-border/50"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Bottom Action Area */}
              <div className="relative pt-4 mt-4 border-t border-border/50 flex items-center justify-between text-xs font-semibold text-primary">
                <span>View Portfolio Details</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
