import React, { useState } from 'react';
import { useStore } from '../../store/useStore';
import { useSafeLayout } from '../../shell/LayoutContext';
import { api } from '../../services/api';
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
  Cpu,
  FilePlus,
  FileText,
  CheckCircle2,
  FolderOpen,
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
  // Shell Canvas Modes
  dashboard_projects: {
    title: 'Enterprise Projects & Executive Dashboard',
    componentFile: 'web/src/canvas/ProjectsDashboardCanvas.tsx',
    backendHandler: 'internal/adapters/inbound/http/handlers.go',
    description: 'Executive KPI metrics and authoritative PostgreSQL DES_BASE.designer_apps projects registry table.',
  },
  recent_activity: {
    title: 'Recent Studio Activity & Audit Log',
    componentFile: 'web/src/canvas/RecentActivityCanvas.tsx',
    backendHandler: 'internal/adapters/inbound/http/handlers.go',
    description: 'Authoritative chronological record of layout saves, change requests, and schema revisions.',
  },
  global_search: {
    title: 'Global Artifact & Schema Search',
    componentFile: 'web/src/canvas/GlobalSearchCanvas.tsx',
    backendHandler: 'internal/adapters/inbound/http/handlers.go',
    description: 'Search applications, PostgreSQL DES_BASE schema tables, UI widgets, SQL queries, and autonomous agents.',
  },
  visual_canvas: {
    title: 'App Builder Visual Canvas Grid',
    componentFile: 'web/src/canvas/VisualCanvasGrid.tsx',
    backendHandler: 'internal/adapters/inbound/http/handlers.go',
    description: 'Interactive drag-and-drop widget layout canvas, live preview mode, and responsive grid layout.',
  },
  ui_sketch: {
    title: 'Figma / Penpot Wireframe & Sketch Canvas',
    componentFile: 'web/src/canvas/WireframeSketchCanvas.tsx',
    backendHandler: 'internal/adapters/inbound/http/handlers.go',
    description: 'Interactive UI mockup and wireframe sketch canvas with automatic export bridge to Visual Canvas Grid.',
  },
  project_scaffold: {
    title: 'Project Scaffolding & Build Pipeline',
    componentFile: 'web/src/canvas/ProjectScaffoldCanvas.tsx',
    backendHandler: 'internal/adapters/inbound/http/handlers.go',
    description: 'Hexagonal Go code generator, PostgreSQL DES_BASE schema provisioning, and single-executable asset embedding.',
  },
  er_modeler: {
    title: 'Relational ER Modeler & DDL Studio',
    componentFile: 'web/src/datamodel/ERModelerCanvas.tsx',
    backendHandler: 'internal/adapters/inbound/http/handlers.go',
    description: 'PostgreSQL entity relationship diagramming, foreign key linking, and automated migration DDL generator.',
  },
  lineage_dag: {
    title: 'Column-Level Lineage (CLL) DAG',
    componentFile: 'web/src/lineage/LineageDAGView.tsx',
    backendHandler: 'internal/adapters/inbound/http/handlers.go',
    description: 'End-to-end data transformation DAG with column-level tracing, pipeline stages, and blast radius impact.',
  },
  sql_editor: {
    title: 'AST SQL Console & Query Workspace',
    componentFile: 'web/src/sqleditor/SqlEditorView.tsx',
    backendHandler: 'internal/adapters/inbound/http/handlers.go',
    description: 'Syntax-highlighted SQL editor with AST parse tree inspection, EXPLAIN visualizer, and live query execution.',
  },
  workflow_graph: {
    title: 'Autonomous Agent Workflow Graph',
    componentFile: 'web/src/lineage/LineageDAGView.tsx',
    backendHandler: 'internal/adapters/inbound/http/handlers.go',
    description: 'Autonomous agent decision graph, step sequences, retry logic, and tool dispatch topologies.',
  },

  // Navigation & Sub-views
  dashboard: {
    title: 'Executive Enterprise Architecture Dashboard',
    componentFile: 'web/src/components/dashboard/ExecutiveDashboard.tsx',
    backendHandler: 'internal/adapters/inbound/http/handlers.go',
    description: 'Enterprise baseline metrics, capability mapping, value stream topology, and strategic OKR alignment.',
  },
  'arch-directory': {
    title: 'Architecture Cross-Studio Directory',
    componentFile: 'web/src/components/architecture/ArchitectureDirectory.tsx',
    backendHandler: 'internal/adapters/inbound/http/handlers.go',
    description: 'Cross-domain navigation hub for enterprise capability models, value streams, strategy, and services.',
  },
  capabilities: {
    title: 'Business Capabilities Map & Hierarchy',
    componentFile: 'web/src/components/capabilities/CapabilityStudio.tsx',
    backendHandler: 'internal/adapters/inbound/http/handlers.go',
    description: 'Level 1-4 business capability hierarchy, maturity scoring, and investment prioritization.',
  },
  'value-streams': {
    title: 'Value Streams & Customer Journeys',
    componentFile: 'web/src/components/valuestreams/ValueStreamStudio.tsx',
    backendHandler: 'internal/adapters/inbound/http/handlers.go',
    description: 'End-to-end value stream stages, capability cross-mapping, and process velocity analysis.',
  },
  organization: {
    title: 'Organization Units & RACI Studio',
    componentFile: 'web/src/components/organization/RaciStudio.tsx',
    backendHandler: 'internal/adapters/inbound/http/handlers.go',
    description: 'Org structure hierarchy, RACI assignments, and business function boundaries.',
  },
  strategy: {
    title: 'Strategic Goals & OKR Tracking',
    componentFile: 'web/src/components/strategy/StrategyStudio.tsx',
    backendHandler: 'internal/adapters/inbound/http/handlers.go',
    description: 'Enterprise objectives, key results, strategic drivers, and capability enablement mapping.',
  },
  'database-directory': {
    title: 'Database Directory & DDL Schematics',
    componentFile: 'web/src/components/database/DatabaseDirectory.tsx',
    backendHandler: 'internal/adapters/inbound/http/handlers.go',
    description: 'Relational database schema explorer, table constraints, indexes, and authoritative DES_BASE tables.',
  },
  'vector-directory': {
    title: 'Vector Knowledge Store & Prompt Studio',
    componentFile: 'web/src/components/vectordb/VectorDirectory.tsx',
    backendHandler: 'internal/adapters/inbound/http/handlers.go',
    description: 'Dense vector embeddings, RAG contextual search engine, and semantic knowledge graph.',
  },
  'integration-directory': {
    title: 'API Endpoints & Integration Gateway',
    componentFile: 'web/src/components/integration/IntegrationDirectory.tsx',
    backendHandler: 'internal/adapters/inbound/http/handlers.go',
    description: 'OpenAPI REST endpoints, event streaming topics, and platform connector middleware.',
  },
  'agents-directory': {
    title: 'Autonomous Enterprise Agents Directory',
    componentFile: 'web/src/components/agents/AgentsDirectory.tsx',
    backendHandler: 'internal/adapters/inbound/http/handlers.go',
    description: 'Autonomous agents, workflow orchestrators, and AI-driven automation workers.',
  },
  'portfolio-directory': {
    title: 'Application Portfolio & Systems CMDB',
    componentFile: 'web/src/components/portfolio/PortfolioDirectory.tsx',
    backendHandler: 'internal/adapters/inbound/http/handlers.go',
    description: 'Enterprise application inventory, lifecycle status, technology stack dependencies, and risk.',
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
  const layout = useSafeLayout();
  const [copied, setCopied] = useState(false);
  const [userNotes, setUserNotes] = useState('');
  const [isCreatingCR, setIsCreatingCR] = useState(false);
  const [crSuccessResult, setCrSuccessResult] = useState<{ filename: string; filePath: string } | null>(null);
  const [crError, setCrError] = useState<string | null>(null);

  // Close modal on Escape key press
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Determine current active mode & view ID based on LayoutContext or useStore
  const activeKey = layout ? layout.canvasMode : activeView;
  const currentMeta = VIEW_METADATA_MAP[activeKey] || VIEW_METADATA_MAP[activeView] || {
    title: layout ? `Studio Canvas (${layout.canvasMode})` : `Active View: ${activeView}`,
    componentFile: layout ? `web/src/canvas/VisualCanvasGrid.tsx` : `web/src/components/${appMode}/${activeView}.tsx`,
    backendHandler: 'internal/adapters/inbound/http/handlers.go',
    description: 'Enterprise Designer Component View.',
  };

  const domainModeText = layout ? `Studio Shell (${layout.canvasMode})` : appMode;
  const activeViewIdText = layout ? layout.canvasMode : activeView;
  const activeAppName = layout?.currentApp?.name || 'Fleet Logistics Studio';
  const activeAppSlug = layout?.currentApp?.slug || 'fleet-logistics';
  const activeEnvironment = layout?.environment || 'DEV';
  const leftPanelText = layout?.activeLeftPanel || 'widget_toolbox';
  const rightPanelText = layout?.activeRightPanel || 'properties_inspector';
  const bottomPanelText = layout?.activeBottomTab || 'query_runner';
  const selectedWidget = layout?.selectedWidgetId || 'None';

  const formattedPromptSnippet = `### UI Location Reference (Enterprise Designer)
- **Application**: Enterprise Designer (\`enterprise-designer\`)
- **Workspace Path**: \`/run/media/jonk/Workspace/ESPEDAIR/designer/enterprise-designer\`
- **Active App**: ${activeAppName} (\`${activeAppSlug}\`)
- **Canvas Mode / View ID**: \`${activeViewIdText}\`
- **Environment**: \`${activeEnvironment}\`
- **Active Left Tool Panel**: \`${leftPanelText}\`
- **Active Right Inspector Panel**: \`${rightPanelText}\`
- **Active Console Panel**: \`${bottomPanelText}\`
- **Selected Widget ID**: \`${selectedWidget}\`
- **Page / Canvas Title**: ${currentMeta.title}
- **Primary React Component**: \`${currentMeta.componentFile}\`
- **Backend Handler**: \`${currentMeta.backendHandler}\`
- **Authoritative Database Schema**: PostgreSQL \`DES_BASE\` (Port 8088)`;

  const handleCopy = () => {
    const fullSnippetWithNotes = userNotes.trim()
      ? `${formattedPromptSnippet}\n\n**Requested UI / Feature Change**:\n${userNotes.trim()}`
      : `${formattedPromptSnippet}\n\n**Requested UI / Feature Change**:\n[Please describe your requested changes or bug report here]`;
    navigator.clipboard.writeText(fullSnippetWithNotes);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleCreateCR = async () => {
    setIsCreatingCR(true);
    setCrError(null);
    try {
      const res = await api.createCR({
        title: currentMeta.title,
        content: formattedPromptSnippet,
        description: userNotes.trim() || undefined,
        view_id: activeViewIdText,
        app_name: activeAppName,
      });
      setCrSuccessResult({
        filename: res.filename,
        filePath: res.file_path,
      });
    } catch (err: any) {
      setCrError(err.message || 'Failed to create Change Request file.');
    } finally {
      setIsCreatingCR(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="ui-inspector-title"
      onClick={onClose}
    >
      <div
        className="bg-card border border-border rounded-2xl shadow-2xl max-w-2xl w-full p-6 space-y-5 animate-in zoom-in-95 duration-200 text-foreground max-h-[90vh] flex flex-col my-auto mx-auto relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border pb-4 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-primary/10 text-primary border border-primary/20 shadow-xs">
              <Eye className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                  Antigravity Context Inspector
                </span>
                <span className="text-[11px] font-mono text-muted-foreground">ID: {activeViewIdText}</span>
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

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-1">
          {/* Location Breakdown Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-muted/40 border border-border space-y-1">
              <div className="flex items-center gap-1.5 text-muted-foreground font-semibold">
                <Layers className="w-3.5 h-3.5 text-primary" />
                <span>Domain / Shell Mode</span>
              </div>
              <p className="font-mono font-bold text-foreground capitalize">{domainModeText}</p>
            </div>

            <div className="p-3 rounded-xl bg-muted/40 border border-border space-y-1">
              <div className="flex items-center gap-1.5 text-muted-foreground font-semibold">
                <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                <span>Active View / Canvas ID</span>
              </div>
              <p className="font-mono font-bold text-cyan-400">{activeViewIdText}</p>
            </div>

            {layout?.currentApp && (
              <div className="p-3 rounded-xl bg-muted/40 border border-border space-y-1 sm:col-span-2">
                <div className="flex items-center gap-1.5 text-muted-foreground font-semibold">
                  <Cpu className="w-3.5 h-3.5 text-amber-400" />
                  <span>Active Studio Application</span>
                </div>
                <p className="font-mono text-amber-300 font-semibold">
                  {activeAppName} <span className="text-muted-foreground text-[11px]">({activeAppSlug} • ENV: {activeEnvironment})</span>
                </p>
              </div>
            )}

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
              <p className="font-mono text-purple-300 select-all break-all">{currentMeta.backendHandler} (Authoritative Schema: DES_BASE, Port: 8088)</p>
            </div>
          </div>

          {/* User Requested Changes / Notes Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-primary" />
                <span>Requested Changes & Specification (Optional)</span>
              </div>
              <span className="text-[10px] text-muted-foreground">Will be saved inside CR document</span>
            </label>
            <textarea
              value={userNotes}
              onChange={(e) => setUserNotes(e.target.value)}
              placeholder="Describe your desired feature, UI changes, bug fix, or instructions for Antigravity pair programmer..."
              rows={3}
              className="w-full bg-background border border-border rounded-xl p-3 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary font-mono"
            />
          </div>

          {/* CR Success Banner */}
          {crSuccessResult && (
            <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center justify-between animate-in fade-in duration-150">
              <div className="flex items-center gap-2.5 min-w-0">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <div className="truncate">
                  <p className="font-bold">Created {crSuccessResult.filename}</p>
                  <p className="text-[11px] font-mono text-emerald-300/80 truncate">{crSuccessResult.filePath}</p>
                </div>
              </div>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shrink-0">
                SAVED TO DISK
              </span>
            </div>
          )}

          {/* CR Error Banner */}
          {crError && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-semibold">
              {crError}
            </div>
          )}

          {/* Antigravity Prompt Markdown Preview */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-primary" />
                <span>Formatted Antigravity Prompt Snippet</span>
              </label>
              <span className="text-[10px] text-muted-foreground font-mono">Ready to paste into chat</span>
            </div>

            <div className="relative rounded-xl bg-background border border-border p-3 font-mono text-[11px] text-muted-foreground overflow-x-auto max-h-28 select-all">
              <pre className="leading-relaxed text-foreground whitespace-pre-wrap">{formattedPromptSnippet}</pre>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-border shrink-0">
          <span className="text-[11px] text-muted-foreground">
            Configurable CR path: <code className="font-mono text-foreground font-bold">.design/CR</code>
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
            >
              Close
            </button>

            {/* Create CR File Button */}
            <button
              onClick={handleCreateCR}
              disabled={isCreatingCR}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-muted hover:bg-muted/80 text-foreground border border-border hover:border-primary/40 transition-all shadow-xs cursor-pointer disabled:opacity-50"
              title="Create sequentially numbered cr-000x.md in .design/CR"
            >
              {isCreatingCR ? (
                <FileText className="w-3.5 h-3.5 animate-pulse text-primary" />
              ) : crSuccessResult ? (
                <Check className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <FilePlus className="w-3.5 h-3.5 text-primary" />
              )}
              <span>{isCreatingCR ? 'Creating...' : crSuccessResult ? `Created ${crSuccessResult.filename}` : 'Create CR (cr-000x.md)'}</span>
            </button>

            {/* Copy Location to Clipboard Button */}
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-primary text-primary-foreground hover:bg-primary/90 transition-all shadow-xs cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied to Clipboard!' : 'Copy to Clipboard'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UILocationInspectorModal;
