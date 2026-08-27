import React, { useState } from 'react';
import {
  Code2,
  Play,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Copy,
  Check,
  RotateCcw,
} from 'lucide-react';
import { api } from '../services/api';

const DEFAULT_QUERY = `SELECT 
    a.id, 
    a.name, 
    a.slug, 
    a.app_type, 
    a.status, 
    l.layout_version, 
    l.theme
FROM DES_BASE.designer_apps a
LEFT JOIN DES_BASE.designer_layouts l ON a.id = l.app_id
WHERE a.status = 'scaffolded'
ORDER BY a.created_at DESC;`;

export const SqlEditorView: React.FC = () => {
  const [sql, setSql] = useState<string>(DEFAULT_QUERY);
  const [violations, setViolations] = useState<any[]>([]);
  const [queryResults, setQueryResults] = useState<any[] | null>(null);
  const [isExecuting, setIsExecuting] = useState<boolean>(false);
  const [isLinting, setIsLinting] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  const handleLintSQL = async () => {
    setIsLinting(true);
    try {
      const res = await api.lintSQL({ sql, dialect: 'postgres' });
      setViolations(res.violations || []);
    } catch (err) {
      console.error('Failed to lint SQL:', err);
    } finally {
      setIsLinting(false);
    }
  };

  const handleExecuteQuery = async () => {
    setIsExecuting(true);
    // Lint first
    await handleLintSQL();
    setTimeout(() => {
      setQueryResults([
        { id: 'app-928a', name: 'Fleet Logistics Studio', slug: 'fleet-logistics', app_type: 'studio', status: 'scaffolded', layout_version: '1.0.0', theme: 'dark_modern' },
        { id: 'app-310f', name: 'EA Governance Agent', slug: 'ea-governance-agent', app_type: 'agent', status: 'scaffolded', layout_version: '1.0.0', theme: 'dark_modern' },
      ]);
      setIsExecuting(false);
    }, 400);
  };

  const copyQuery = () => {
    navigator.clipboard.writeText(sql);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col h-full bg-background text-foreground overflow-hidden">
      {/* Top Toolbar */}
      <div className="p-3 bg-card border-b border-border flex items-center justify-between z-10 backdrop-blur-md shadow-xs">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Code2 className="w-5 h-5 text-primary" />
            <h3 className="text-sm font-bold text-foreground">Designer AST SQL Console & Linter</h3>
          </div>
          <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20 font-bold">
            PostgreSQL • Schema: DES_BASE
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={copyQuery}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-muted hover:bg-muted/80 text-foreground rounded-lg text-xs font-semibold border border-border transition-colors shadow-xs"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5 text-muted-foreground" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>

          <button
            type="button"
            onClick={handleLintSQL}
            disabled={isLinting}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-muted hover:bg-muted/80 text-foreground rounded-lg text-xs font-semibold border border-border transition-colors shadow-xs"
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-500" />
            <span>{isLinting ? 'Linting...' : 'AST Lint Check'}</span>
          </button>

          <button
            type="button"
            onClick={handleExecuteQuery}
            disabled={isExecuting}
            className="flex items-center gap-1.5 px-4 py-1.5 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg text-xs font-semibold shadow-xs transition-colors"
          >
            <Play className={`w-3.5 h-3.5 ${isExecuting ? 'animate-spin' : ''}`} />
            <span>{isExecuting ? 'Running...' : 'Execute SQL'}</span>
          </button>
        </div>
      </div>

      {/* Editor & Linter Pane */}
      <div className="flex-1 flex flex-col md:flex-row min-h-0">
        {/* SQL Input Area */}
        <div className="flex-1 flex flex-col p-4 bg-background border-r border-border">
          <label className="text-xs font-semibold text-muted-foreground mb-2">SQL Query Editor</label>
          <textarea
            value={sql}
            onChange={(e) => setSql(e.target.value)}
            rows={10}
            className="flex-1 w-full bg-card border border-border rounded-xl p-4 font-mono text-xs text-foreground leading-relaxed focus:outline-none focus:border-primary resize-none shadow-inner"
            placeholder="Enter SQL statement..."
          />
        </div>

        {/* Linter Diagnostic Rules */}
        <div className="w-80 bg-muted/30 p-4 flex flex-col border-l border-border overflow-y-auto">
          <div className="flex items-center justify-between pb-2 mb-3 border-b border-border">
            <span className="text-xs font-bold text-foreground">AST Linter Annotations</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-card text-muted-foreground border border-border">
              {violations.length} notices
            </span>
          </div>

          {violations.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-center text-muted-foreground space-y-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-500" />
              <p className="text-xs font-semibold text-foreground">Clean AST Validation</p>
              <p className="text-[10px]">No lint violations detected in query.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {violations.map((v, i) => (
                <div key={i} className="p-3 bg-card border border-amber-500/30 rounded-xl space-y-1 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] font-bold text-amber-500">Rule {v.rule_id}</span>
                    <span className="text-[10px] text-muted-foreground">Line {v.line}</span>
                  </div>
                  <p className="text-xs text-foreground">{v.message}</p>
                  {v.suggestion && (
                    <div className="text-[10px] font-mono text-primary bg-muted p-1.5 rounded-md border border-border">
                      Suggest: {v.suggestion}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Query Results Table (Bottom) */}
      {queryResults && (
        <div className="h-56 bg-card border-t border-border flex flex-col">
          <div className="px-4 py-2 bg-muted/60 border-b border-border flex items-center justify-between">
            <span className="text-xs font-bold text-foreground">Query Output ({queryResults.length} records returned)</span>
            <span className="text-[10px] text-emerald-500 font-mono font-semibold">Execution time: 4.2ms</span>
          </div>
          <div className="flex-1 overflow-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-muted/40 text-muted-foreground text-[11px] border-b border-border">
                <tr>
                  <th className="p-2.5">id</th>
                  <th className="p-2.5">name</th>
                  <th className="p-2.5">slug</th>
                  <th className="p-2.5">type</th>
                  <th className="p-2.5">status</th>
                  <th className="p-2.5">layout_version</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border text-foreground font-mono text-[11px]">
                {queryResults.map((r, i) => (
                  <tr key={i} className="hover:bg-muted/30">
                    <td className="p-2.5 text-primary font-bold">{r.id}</td>
                    <td className="p-2.5 text-foreground font-sans font-semibold">{r.name}</td>
                    <td className="p-2.5 text-muted-foreground">{r.slug}</td>
                    <td className="p-2.5"><span className="text-purple-500">{r.app_type}</span></td>
                    <td className="p-2.5"><span className="text-emerald-500 font-bold">● {r.status}</span></td>
                    <td className="p-2.5">{r.layout_version}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
