import React, { useState } from 'react';
import { useStore } from '../../store/useStore';
import {
  Eye,
  Copy,
  Check,
  X,
  MapPin,
  FileCode,
  Layers,
  Server,
  Terminal,
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const VIEW_METADATA_MAP: Record<
  string,
  {
    title: string;
    componentFile: string;
    backendHandler: string;
    description: string;
  }
> = {
  dashboard: {
    title: 'Executive Base Architecture Dashboard',
    componentFile: 'web/src/components/dashboard/ExecutiveDashboard.tsx',
    backendHandler: 'internal/adapters/inbound/http/handlers.go',
    description: 'Enterprise baseline metrics, capability mapping, value stream topology, and strategic OKR alignment.',
  },
  capabilities: {
    title: 'Business Capabilities Map & Hierarchy',
    componentFile: 'web/src/components/business/CapabilitiesView.tsx',
    backendHandler: 'internal/adapters/inbound/http/handlers.go',
    description: 'Level 1-4 business capability hierarchy, maturity scoring, and investment prioritization.',
  },
  'value-streams': {
    title: 'Value Streams & Customer Journeys',
    componentFile: 'web/src/components/business/ValueStreamsView.tsx',
    backendHandler: 'internal/adapters/inbound/http/handlers.go',
    description: 'End-to-end value stream stages, capability cross-mapping, and process velocity analysis.',
  },
  organization: {
    title: 'Organization Units & Business Functions',
    componentFile: 'web/src/components/business/OrganizationView.tsx',
    backendHandler: 'internal/adapters/inbound/http/handlers.go',
    description: 'Org structure hierarchy, RACI assignments, and business function boundaries.',
  },
  strategy: {
    title: 'Strategic Goals & OKR Tracking',
    componentFile: 'web/src/components/business/StrategyView.tsx',
    backendHandler: 'internal/adapters/inbound/http/handlers.go',
    description: 'Enterprise objectives, key results, strategic drivers, and capability enablement mapping.',
  },
  'platforms-overview': {
    title: 'Platforms & Integration Gateway Hub',
    componentFile: 'web/src/components/platform/PlatformStudio.tsx',
    backendHandler: 'internal/adapters/inbound/http/handlers.go',
    description: 'Platform connectors, enterprise integration buses, and Workday HCM cloud connectors.',
  },
  settings: {
    title: 'System Settings & Access Governance',
    componentFile: 'web/src/components/settings/SettingsView.tsx',
    backendHandler: 'internal/adapters/inbound/http/handlers.go',
    description: 'Multi-tenant database configuration, user permissions, and audit trail preferences.',
  },
  'help-ea': {
    title: 'Enterprise Architecture Knowledge Base',
    componentFile: 'web/src/components/help/HelpView.tsx',
    backendHandler: 'internal/adapters/inbound/http/handlers.go',
    description: 'BIZBOK® and TOGAF metamodel guides, best practices, and architecture principles.',
  },
};

export const UILocationInspectorModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const { appMode, activeView } = useStore();
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const currentMeta = VIEW_METADATA_MAP[activeView] || {
    title: `Active View: ${activeView}`,
    componentFile: `web/src/components/${appMode}/${activeView}.tsx`,
    backendHandler: 'internal/adapters/inbound/http/handlers.go',
    description: 'Base Artist Component View.',
  };

  const formattedPromptSnippet = `### UI Location Reference (Template / Base Artist)
- **Application**: Base Artist (\`template-artist\`)
- **Workspace Path**: \`/run/media/jonk/Workspace/ESPEDAIR/template-artist\`
- **Domain Mode**: \`${appMode}\`
- **Active View ID**: \`${activeView}\`
- **Page Title**: ${currentMeta.title}
- **Component File**: \`${currentMeta.componentFile}\`
- **Backend Handler**: \`${currentMeta.backendHandler}\`
- **Database Schema**: PostgreSQL \`BASE_BASE\` (Port 8088)

**Requested UI / Feature Change**:
[Please describe your requested changes or bug report here]`;

  const handleCopy = () => {
    navigator.clipboard.writeText(formattedPromptSnippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="bg-card border border-border rounded-2xl shadow-2xl max-w-2xl w-full p-6 space-y-6 animate-in zoom-in-95 duration-200 text-foreground"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-primary/10 text-primary border border-primary/20">
              <Eye className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                  Antigravity Context Inspector
                </span>
                <span className="text-[11px] font-mono text-muted-foreground">ID: {activeView}</span>
              </div>
              <h2 className="text-lg font-bold text-foreground mt-0.5">UI Location & Architecture Inspector</h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer border border-transparent hover:border-border"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Location Breakdown Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-muted/40 border border-border space-y-1">
            <div className="flex items-center gap-1.5 text-muted-foreground font-semibold">
              <Layers className="w-3.5 h-3.5 text-primary" />
              <span>Domain Mode</span>
            </div>
            <p className="font-mono font-bold text-foreground capitalize">{appMode}</p>
          </div>

          <div className="p-3 rounded-xl bg-muted/40 border border-border space-y-1">
            <div className="flex items-center gap-1.5 text-muted-foreground font-semibold">
              <MapPin className="w-3.5 h-3.5 text-cyan-400" />
              <span>Active View ID</span>
            </div>
            <p className="font-mono font-bold text-cyan-400">{activeView}</p>
          </div>

          <div className="p-3 rounded-xl bg-muted/40 border border-border space-y-1 sm:col-span-2">
            <div className="flex items-center gap-1.5 text-muted-foreground font-semibold">
              <FileCode className="w-3.5 h-3.5 text-emerald-400" />
              <span>Primary React Component Source File</span>
            </div>
            <p className="font-mono text-emerald-400 select-all break-all">{currentMeta.componentFile}</p>
          </div>

          <div className="p-3 rounded-xl bg-muted/40 border border-border space-y-1 sm:col-span-2">
            <div className="flex items-center gap-1.5 text-muted-foreground font-semibold">
              <Server className="w-3.5 h-3.5 text-purple-400" />
              <span>Backend Handler & DB</span>
            </div>
            <p className="font-mono text-purple-300 select-all break-all">{currentMeta.backendHandler} (Schema: BASE_BASE)</p>
          </div>
        </div>

        {/* Antigravity Prompt Markdown Preview */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5 text-primary" />
              <span>Formatted Antigravity Prompt Snippet</span>
            </label>
            <span className="text-[10px] text-muted-foreground font-mono">Ready to paste into chat</span>
          </div>

          <div className="relative rounded-xl bg-background border border-border p-3 font-mono text-[11px] text-muted-foreground overflow-x-auto max-h-36 select-all">
            <pre className="leading-relaxed text-foreground whitespace-pre-wrap">{formattedPromptSnippet}</pre>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-border">
          <span className="text-[11px] text-muted-foreground">
            Copy this snippet to identify the exact UI component for Antigravity.
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
            >
              Close
            </button>

            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-primary text-primary-foreground hover:bg-primary/90 transition-all shadow-xs cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied to Clipboard!' : 'Copy Location to Clipboard'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UILocationInspectorModal;
