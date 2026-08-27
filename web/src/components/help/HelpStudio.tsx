import React from 'react';
import {
  HelpCircle,
  BookOpen,
  Keyboard,
  Compass,
  Layers,
  Workflow,
  Target,
  Sliders,
  GitFork,
  Rocket,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { useStore } from '../../store/useStore';

export const HelpStudio: React.FC = () => {
  const { activeView, appMode } = useStore();

  const shortcuts = [
    { key: 'b', desc: 'Launch default browser with Business Artist Web App from TUI' },
    { key: '1', desc: 'Switch to Metrics / Executive Dashboard tab in TUI' },
    { key: '2', desc: 'Switch to Live Streaming Logs tab in TUI' },
    { key: '3', desc: 'Switch to PostgreSQL Database & Models drill-down in TUI' },
    { key: 'Tab / Shift+Tab', desc: 'Cycle forward / backward between top-level views' },
    { key: 'Enter / →', desc: 'Drill down into schema, workspace, or model view' },
    { key: 'Esc / ←', desc: 'Step back to previous navigation level' },
    { key: 'j / k / ↑ / ↓', desc: 'Scroll log buffer or navigate list items' },
    { key: 'c', desc: 'Clear log view buffer in TUI' },
    { key: 'r', desc: 'Refresh live metrics & architecture facts from PostgreSQL' },
    { key: 'q / Ctrl+C', desc: 'Gracefully shutdown TUI and background server' },
  ];

  return (
    <div className="p-8 space-y-8 max-w-5xl mx-auto animate-in fade-in duration-300">
      <div className="flex items-center justify-between border-b border-border pb-6">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground flex items-center gap-2.5">
            <HelpCircle className="w-6 h-6 text-indigo-500" />
            <span>Enterprise Architecture Knowledge & Documentation</span>
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Canonical Enterprise Architecture & TOGAF 10 reference guides, calculations, and hotkeys.
          </p>
        </div>
      </div>

      {/* Enterprise Architecture Guide View */}
      {(activeView === 'help-ea' || appMode === 'help' && !activeView.startsWith('help-')) && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-card border border-border space-y-3 shadow-xs">
            <div className="flex items-center gap-2 text-indigo-500 font-bold text-sm">
              <BookOpen className="w-5 h-5" />
              <span>Enterprise Architecture Guide</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Enterprise Architecture provides a blueprint of the enterprise that provides a common understanding of the organization and is used to align strategic objectives and tactical demands.
              The architecture defines core domains: <strong className="text-foreground">Capabilities</strong>, <strong className="text-foreground">Value Streams</strong>, <strong className="text-foreground">Organization</strong>, and <strong className="text-foreground">Information</strong>, complemented by extended domains including Strategy, Initiatives, and Products.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-5 rounded-2xl bg-card border border-border space-y-2 shadow-xs">
              <Compass className="w-5 h-5 text-indigo-500" />
              <h3 className="font-bold text-foreground">Capabilities</h3>
              <p className="text-muted-foreground text-[11px]">
                Defines <em>what</em> the business does. Multi-level hierarchy (L1-L4) with 1-5 maturity assessment.
              </p>
            </div>
            <div className="p-5 rounded-2xl bg-card border border-border space-y-2 shadow-xs">
              <Workflow className="w-5 h-5 text-cyan-500" />
              <h3 className="font-bold text-foreground">Value Streams</h3>
              <p className="text-muted-foreground text-[11px]">
                End-to-end customer stages delivering tangible business value with entry/exit gating criteria.
              </p>
            </div>
            <div className="p-5 rounded-2xl bg-card border border-border space-y-2 shadow-xs">
              <GitFork className="w-5 h-5 text-emerald-500" />
              <h3 className="font-bold text-foreground">Processes & SIPOC</h3>
              <p className="text-muted-foreground text-[11px]">
                5-box SIPOC diagrams with Workday RACI role allocations and automation metrics.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TOGAF 10 View */}
      {activeView === 'help-togaf' && (
        <div className="p-6 rounded-2xl bg-card border border-border space-y-4 text-xs text-muted-foreground shadow-xs">
          <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
            <Compass className="w-4 h-4 text-indigo-500" />
            <span>TOGAF® 10 Phase B: Business Architecture</span>
          </h2>
          <p className="leading-relaxed">
            Phase B describes the development of a Business Architecture to support an agreed Architecture Vision.
            Key inputs and outputs include Business Principles, Business Goals, Capability Assessments, Target Business Architecture, and Gap Analysis.
          </p>
        </div>
      )}

      {/* Value Streams & Flow View */}
      {activeView === 'help-valuestreams' && (
        <div className="p-6 rounded-2xl bg-card border border-border space-y-4 text-xs text-muted-foreground leading-relaxed shadow-xs">
          <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
            <Workflow className="w-4 h-4 text-cyan-500" />
            <span>Value Stream Flow Efficiency Calculations</span>
          </h2>
          <p>
            A Value Stream represents the sequence of stages through which an enterprise delivers value to a stakeholder.
          </p>
          <div className="p-4 rounded-xl bg-muted/30 border border-border space-y-2 font-mono text-[11px]">
            <span className="font-bold text-foreground block">Key Formulas:</span>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li><strong className="text-foreground">Lead Time</strong>: Elapsed calendar hours from stage trigger to stage completion.</li>
              <li><strong className="text-foreground">Processing Time</strong>: Touch-time hours where value-adding work is being performed.</li>
              <li><strong className="text-foreground">Flow Efficiency %</strong> = <code className="font-bold text-primary">(Processing Time / Lead Time) * 100</code></li>
            </ul>
          </div>
        </div>
      )}

      {/* SIPOC & RACI View */}
      {activeView === 'help-sipoc' && (
        <div className="p-6 rounded-2xl bg-card border border-border space-y-4 text-xs text-muted-foreground leading-relaxed shadow-xs">
          <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
            <GitFork className="w-4 h-4 text-emerald-500" />
            <span>5-Box SIPOC & Workday RACI Framework</span>
          </h2>
          <div className="grid grid-cols-5 gap-2 text-center font-mono text-[11px]">
            <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 font-bold">1. Suppliers</div>
            <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-600 dark:text-cyan-400 font-bold">2. Inputs</div>
            <div className="p-3 rounded-xl bg-muted border border-border text-foreground font-bold">3. Process</div>
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold">4. Outputs</div>
            <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-600 dark:text-purple-400 font-bold">5. Customers</div>
          </div>
        </div>
      )}

      {/* Gartner PACE Layering View */}
      {activeView === 'help-pace' && (
        <div className="p-6 rounded-2xl bg-card border border-border space-y-4 text-xs shadow-xs">
          <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
            <Sliders className="w-4 h-4 text-amber-500" />
            <span>Gartner PACE Layered Application & Capability Strategy</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20 space-y-1.5">
              <strong className="text-indigo-600 dark:text-indigo-400 block">Systems of Innovation</strong>
              <p className="text-muted-foreground text-[11px]">Rapid experimentation, new business models, lifecycle &lt; 12 months.</p>
            </div>
            <div className="p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/20 space-y-1.5">
              <strong className="text-cyan-600 dark:text-cyan-400 block">Systems of Differentiation</strong>
              <p className="text-muted-foreground text-[11px]">Unique company processes, competitive advantage, lifecycle 1-3 years.</p>
            </div>
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 space-y-1.5">
              <strong className="text-amber-600 dark:text-amber-400 block">Systems of Record</strong>
              <p className="text-muted-foreground text-[11px]">Standard transaction processing, core ledgers, lifecycle 5-10+ years.</p>
            </div>
          </div>
        </div>
      )}

      {/* Three Horizons View */}
      {activeView === 'help-horizons' && (
        <div className="p-6 rounded-2xl bg-card border border-border space-y-4 text-xs text-muted-foreground shadow-xs">
          <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
            <Rocket className="w-4 h-4 text-indigo-500" />
            <span>McKinsey Three Horizons Framework</span>
          </h2>
          <p className="leading-relaxed">
            Categorizes transformation initiatives by investment timeline and strategic intent:
            <strong className="text-foreground"> Horizon 1</strong> (Core Business Operations: 0-12m),
            <strong className="text-foreground"> Horizon 2</strong> (Emerging Opportunities & Growth: 12-24m), and
            <strong className="text-foreground"> Horizon 3</strong> (Future Options & Disruptive Innovation: 24-36m+).
          </p>
        </div>
      )}

      {/* Shortcuts View */}
      {activeView === 'help-shortcuts' && (
        <div className="p-6 rounded-2xl bg-card border border-border space-y-4 shadow-xs">
          <div className="flex items-center gap-2 border-b border-border pb-3">
            <Keyboard className="w-5 h-5 text-indigo-500" />
            <h2 className="text-sm font-bold text-foreground">Keyboard Navigation & Terminal Shortcuts</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {shortcuts.map((sc, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-muted/30 border border-border text-xs">
                <span className="text-muted-foreground">{sc.desc}</span>
                <kbd className="px-2.5 py-1 rounded bg-muted border border-border text-foreground font-mono text-[11px] font-bold shadow-xs">
                  {sc.key}
                </kbd>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
