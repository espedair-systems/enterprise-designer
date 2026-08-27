import React, { useState } from 'react';
import {
  X,
  Download,
  Terminal,
  Cpu,
  Package,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  Sparkles,
} from 'lucide-react';
import { api } from '../../services/api';
import { useLayout } from '../../shell/LayoutContext';

interface AppExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AppExportModal: React.FC<AppExportModalProps> = ({ isOpen, onClose }) => {
  const { currentApp } = useLayout();
  const [activeTab, setActiveTab] = useState<'binary' | 'source'>('binary');
  const [isCompiling, setIsCompiling] = useState<boolean>(false);
  const [binaryResult, setBinaryResult] = useState<any>(null);
  const [sourceResult, setSourceResult] = useState<any>(null);
  const [copied, setCopied] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleCompileBinary = async () => {
    if (!currentApp) return;
    setIsCompiling(true);
    try {
      const res = await api.exportAppBinary(currentApp.id);
      setBinaryResult(res);
    } catch (err) {
      console.error('Binary compilation failed:', err);
    } finally {
      setIsCompiling(false);
    }
  };

  const handleExportSource = async () => {
    if (!currentApp) return;
    setIsCompiling(true);
    try {
      const res = await api.exportAppSource(currentApp.id);
      setSourceResult(res);
    } catch (err) {
      console.error('Source archive export failed:', err);
    } finally {
      setIsCompiling(false);
    }
  };

  const copyCommand = (cmd: string) => {
    navigator.clipboard.writeText(cmd);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-card border border-border rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="p-4 border-b border-border flex items-center justify-between bg-muted/40 shrink-0">
          <div className="flex items-center gap-2">
            <Cpu className="w-5 h-5 text-primary" />
            <div>
              <h2 className="text-base font-bold text-foreground">Release & Binary Packaging Pipeline</h2>
              <p className="text-[11px] text-muted-foreground">
                Application: <span className="text-primary font-semibold">{currentApp?.name || 'Fleet Logistics Studio'}</span>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center border-b border-border bg-muted/20 px-4 pt-2">
          <button
            type="button"
            onClick={() => setActiveTab('binary')}
            className={`px-4 py-2 text-xs font-semibold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'binary'
                ? 'border-primary text-primary bg-card/60'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <Cpu className="w-4 h-4" />
            <span>Standalone Binary (//go:embed all:dist)</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('source')}
            className={`px-4 py-2 text-xs font-semibold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'source'
                ? 'border-primary text-primary bg-card/60'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Source Code Archive (.zip)</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs text-foreground flex-1">
          {activeTab === 'binary' && (
            <div className="space-y-4">
              <div className="p-4 bg-card border border-border rounded-xl space-y-2 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-foreground">Single Executable Architecture</span>
                  <span className="text-[10px] font-mono bg-primary/10 text-primary px-2 py-0.5 rounded border border-primary/20 font-bold">
                    Go 1.22+ • Chi + React 19 Embedded
                  </span>
                </div>
                <p className="text-muted-foreground text-[11px] leading-relaxed">
                  Compiles all Go backend services and embeds the minified React 19 frontend assets into a standalone
                  static executable with zero external runtime dependencies.
                </p>
              </div>

              {binaryResult ? (
                <div className="space-y-3">
                  <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl space-y-2 text-emerald-600 dark:text-emerald-400">
                    <div className="flex items-center gap-2 font-bold">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      <span>Compilation Successful: Single Binary Ready</span>
                    </div>
                    <p className="text-xs font-mono text-foreground bg-background p-2 rounded-lg border border-border truncate">
                      {binaryResult.binary_path}
                    </p>
                  </div>

                  <div className="p-4 bg-card border border-border rounded-xl space-y-2 shadow-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-semibold text-foreground flex items-center gap-1.5">
                        <Terminal className="w-3.5 h-3.5 text-primary" />
                        <span>Execution Command</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => copyCommand(binaryResult.instructions || `./bin/${currentApp?.slug}`)}
                        className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground bg-muted px-2 py-0.5 rounded"
                      >
                        {copied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                        <span>{copied ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>
                    <pre className="p-3 bg-muted/40 rounded-lg font-mono text-[11px] text-primary overflow-x-auto border border-border">
                      {binaryResult.instructions || `./bin/${currentApp?.slug}`}
                    </pre>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center p-8 border border-dashed border-border rounded-xl space-y-3 text-center bg-muted/10">
                  <Cpu className="w-10 h-10 text-primary animate-pulse" />
                  <div>
                    <h4 className="text-xs font-bold text-foreground">Compile Single Standalone Binary</h4>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      Invokes `go build` with static asset embedding (`//go:embed all:dist`).
                    </p>
                  </div>
                  <button
                    type="button"
                    disabled={isCompiling}
                    onClick={handleCompileBinary}
                    className="flex items-center gap-1.5 px-4 py-2 bg-primary hover:bg-primary/90 disabled:opacity-50 text-primary-foreground rounded-lg text-xs font-semibold shadow-xs transition-colors"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{isCompiling ? 'Compiling Release Binary...' : 'Compile Standalone Executable'}</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'source' && (
            <div className="space-y-4">
              <div className="p-4 bg-card border border-border rounded-xl space-y-2 shadow-xs">
                <span className="font-bold text-foreground">Full Source Code Archive</span>
                <p className="text-muted-foreground text-[11px] leading-relaxed">
                  Generates full clean source code including Go modules, Chi REST router, PostgreSQL models,
                  Vite React 19 frontend, `Makefile`, and configuration files packaged in a clean `.zip` archive.
                </p>
              </div>

              {sourceResult ? (
                <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl space-y-2 text-emerald-600 dark:text-emerald-400">
                  <div className="flex items-center gap-2 font-bold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    <span>Source Archive Generated Successfully</span>
                  </div>
                  <p className="text-xs font-mono text-foreground bg-background p-2 rounded-lg border border-border truncate">
                    {sourceResult.zip_path}
                  </p>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center p-8 border border-dashed border-border rounded-xl space-y-3 text-center bg-muted/10">
                  <Package className="w-10 h-10 text-primary animate-pulse" />
                  <div>
                    <h4 className="text-xs font-bold text-foreground">Package Clean Source Archive</h4>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      Produces ready-to-build `.zip` archive formatted for deployment.
                    </p>
                  </div>
                  <button
                    type="button"
                    disabled={isCompiling}
                    onClick={handleExportSource}
                    className="flex items-center gap-1.5 px-4 py-2 bg-primary hover:bg-primary/90 disabled:opacity-50 text-primary-foreground rounded-lg text-xs font-semibold shadow-xs transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>{isCompiling ? 'Packaging Archive...' : 'Generate & Download .zip'}</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-border bg-muted/40 flex items-center justify-end gap-2 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-muted hover:bg-muted/80 text-foreground text-xs font-semibold rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
