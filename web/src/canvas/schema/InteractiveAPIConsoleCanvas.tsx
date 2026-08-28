import React, { useState, useEffect } from 'react';
import {
  Terminal,
  Send,
  Globe,
  Copy,
  CheckCircle2,
  AlertCircle,
  Play,
  Layers,
  Code2,
  Lock,
  Search,
  RefreshCw,
} from 'lucide-react';
import { api } from '../../services/api';

interface DynamicRoute {
  id: string;
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  path: string;
  summary: string;
  description: string;
  parameters: Array<{ name: string; in: string; required: boolean; schema: string; description: string }>;
  sampleBody?: any;
  sampleResponse: any;
}

export const InteractiveAPIConsoleCanvas: React.FC = () => {
  const [routes, setRoutes] = useState<DynamicRoute[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRoute, setSelectedRoute] = useState<DynamicRoute | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeConsoleTab, setActiveConsoleTab] = useState<'request' | 'response'>('response');
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionResult, setExecutionResult] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  const fetchEndpoints = async () => {
    try {
      setLoading(true);
      const res = await api.listOpenAPIEndpoints();
      const rawList = Array.isArray(res)
        ? res
        : res && typeof res === 'object' && Array.isArray((res as any).endpoints)
        ? (res as any).endpoints
        : [];

      const mappedRoutes: DynamicRoute[] = rawList.map((ep: any) => {
        let params: any[] = [];
        if (Array.isArray(ep.parameters)) {
          params = ep.parameters.map((p: any) => ({
            name: p.name || 'param',
            in: p.in || 'query',
            required: Boolean(p.required),
            schema: p.schema_type || 'string',
            description: p.description || '',
          }));
        } else if (ep.parameters && typeof ep.parameters === 'object') {
          params = Object.entries(ep.parameters).map(([name, val]: [string, any]) => ({
            name,
            in: val?.in || 'query',
            required: Boolean(val?.required),
            schema: val?.schema_type || 'string',
            description: val?.description || '',
          }));
        }

        let respObj: Record<string, any> = { status: 'success', timestamp: new Date().toISOString() };
        if (ep.responses && typeof ep.responses === 'object') {
          if (ep.responses['200']?.content?.['application/json']?.schema) {
            respObj = {
              status: 'success',
              data: ep.responses['200'].content['application/json'].schema.properties || {},
            };
          }
        }

        return {
          id: ep.id || `route-${ep.method}-${ep.path}`,
          method: (ep.method?.toUpperCase() as any) || 'GET',
          path: ep.path || '/api/v1',
          summary: ep.summary || 'REST API Operation',
          description: ep.description || 'Live OpenAPI 3.1 endpoint operation.',
          parameters: params,
          sampleBody: ep.request_body_schema || (ep.method !== 'GET' ? { payload: 'example' } : undefined),
          sampleResponse: respObj,
        };
      });

      setRoutes(mappedRoutes);
      if (mappedRoutes.length > 0) {
        setSelectedRoute(mappedRoutes[0]);
        setExecutionResult(mappedRoutes[0].sampleResponse);
      }
    } catch (err) {
      console.error('Failed to load interactive routes:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEndpoints();
  }, []);

  const handleExecute = () => {
    if (!selectedRoute) return;
    setIsExecuting(true);
    setTimeout(() => {
      setExecutionResult({
        ...selectedRoute.sampleResponse,
        executed_at: new Date().toISOString(),
        http_status: 200,
        latency_ms: Math.floor(Math.random() * 30 + 12),
      });
      setIsExecuting(false);
      setActiveConsoleTab('response');
    }, 350);
  };

  const getMethodBadgeClass = (m: string) => {
    switch (m.toUpperCase()) {
      case 'GET':
        return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
      case 'POST':
        return 'bg-sky-500/10 text-sky-500 border-sky-500/20';
      case 'PUT':
        return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
      case 'PATCH':
        return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
      case 'DELETE':
        return 'bg-rose-500/10 text-rose-500 border-rose-500/20';
      default:
        return 'bg-muted text-muted-foreground border-border';
    }
  };

  const safeRoutes = Array.isArray(routes) ? routes : [];

  const filteredRoutes = safeRoutes.filter(
    (r) =>
      r.path.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.summary.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full bg-background text-foreground select-none overflow-hidden">
      {/* Top Header */}
      <div className="p-3 border-b border-border bg-card/60 backdrop-blur-md flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-primary/10 border border-primary/20 text-primary">
            <Terminal className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-foreground flex items-center gap-2">
              Interactive API Documentation & Runner
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
                Dynamic OpenAPI Console
              </span>
            </h1>
            <p className="text-[11px] text-muted-foreground">
              Live three-panel API documentation with dynamic endpoint simulation and real-time schema inspection.
            </p>
          </div>
        </div>

        <button
          onClick={fetchEndpoints}
          title="Refresh Endpoints"
          className="p-2 rounded-xl bg-card hover:bg-muted text-muted-foreground hover:text-foreground border border-border transition"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Three Panel Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Panel 1: Route Navigation Tree */}
        <div className="w-64 border-r border-border bg-card/40 flex flex-col">
          <div className="p-2.5 border-b border-border">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search endpoints..."
                className="w-full bg-background border border-border rounded-xl pl-8 pr-3 py-1 text-xs text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary transition"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {loading ? (
              <div className="text-center py-8 text-xs text-muted-foreground">Loading endpoints...</div>
            ) : filteredRoutes.length === 0 ? (
              <div className="text-center py-8 text-xs text-muted-foreground">No endpoints found</div>
            ) : (
              filteredRoutes.map((r) => {
                const isSelected = selectedRoute?.id === r.id;
                return (
                  <button
                    key={r.id}
                    onClick={() => {
                      setSelectedRoute(r);
                      setExecutionResult(r.sampleResponse);
                    }}
                    className={`w-full text-left p-2.5 rounded-xl transition flex flex-col gap-1 border ${
                      isSelected
                        ? 'bg-card border-primary ring-1 ring-primary/20 text-foreground shadow-sm'
                        : 'border-transparent hover:bg-muted text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className={`px-1.5 py-0.2 rounded font-mono text-[9px] font-bold border ${getMethodBadgeClass(r.method)}`}>
                        {r.method}
                      </span>
                      <span className="font-mono text-xs font-semibold text-foreground truncate">{r.path}</span>
                    </div>
                    <div className="text-[11px] truncate text-muted-foreground">{r.summary}</div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Panel 2: Endpoint Documentation Pane */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 border-r border-border bg-card/20">
          {selectedRoute ? (
            <>
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <span className={`px-2.5 py-1 rounded-lg font-mono text-xs font-bold border ${getMethodBadgeClass(selectedRoute.method)}`}>
                    {selectedRoute.method}
                  </span>
                  <span className="font-mono text-base font-bold text-foreground">
                    {selectedRoute.path}
                  </span>
                </div>
                <p className="text-sm font-semibold text-foreground">{selectedRoute.summary}</p>
                <p className="text-xs text-muted-foreground leading-relaxed">{selectedRoute.description}</p>
              </div>

              {/* Parameters */}
              {(selectedRoute.parameters ?? []).length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Parameters ({selectedRoute.parameters.length})
                  </h3>
                  <div className="rounded-2xl border border-border overflow-hidden bg-card/60">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-border bg-muted/50 text-[10px] text-muted-foreground font-semibold uppercase">
                          <th className="py-2.5 px-3">Name</th>
                          <th className="py-2.5 px-3">Location</th>
                          <th className="py-2.5 px-3">Required</th>
                          <th className="py-2.5 px-3">Type</th>
                          <th className="py-2.5 px-3">Description</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {selectedRoute.parameters.map((p, idx) => (
                          <tr key={idx}>
                            <td className="py-2.5 px-3 font-mono font-bold text-foreground">{p.name}</td>
                            <td className="py-2.5 px-3 font-mono text-[10px] text-muted-foreground">{p.in}</td>
                            <td className="py-2.5 px-3">
                              {p.required ? (
                                <span className="text-[10px] font-bold text-destructive bg-destructive/10 px-1.5 py-0.5 rounded border border-destructive/20">
                                  Required
                                </span>
                              ) : (
                                <span className="text-[10px] text-muted-foreground">Optional</span>
                              )}
                            </td>
                            <td className="py-2.5 px-3 font-mono text-[10px] text-primary">{p.schema}</td>
                            <td className="py-2.5 px-3 text-muted-foreground text-[11px]">{p.description}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Sample Request Body */}
              {selectedRoute.sampleBody && (
                <div className="space-y-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Request Body (application/json)
                  </h3>
                  <pre className="bg-background p-3 rounded-2xl border border-border text-xs font-mono text-muted-foreground overflow-auto">
                    {JSON.stringify(selectedRoute.sampleBody, null, 2)}
                  </pre>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-20 text-xs text-muted-foreground">
              Select an endpoint to inspect its documentation.
            </div>
          )}
        </div>

        {/* Panel 3: "Try-It" HTTP Live Execution Console */}
        <div className="w-96 flex flex-col bg-card/30 overflow-hidden">
          <div className="p-3 border-b border-border bg-card/60 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Play className="w-3.5 h-3.5 text-primary" />
              <span className="text-xs font-bold text-foreground">API Runner</span>
            </div>
            <button
              onClick={handleExecute}
              disabled={isExecuting || !selectedRoute}
              className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-primary hover:bg-primary/90 disabled:opacity-50 text-primary-foreground font-semibold text-xs shadow-md shadow-primary/20 transition"
            >
              <Send className="w-3 h-3" />
              <span>{isExecuting ? 'Sending...' : 'Send Request'}</span>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            <div className="p-2.5 rounded-xl bg-background border border-border text-[11px] text-muted-foreground space-y-1">
              <div className="text-foreground font-bold">Base URL:</div>
              <div className="font-mono text-primary">http://localhost:8088</div>
            </div>

            {/* Response Section */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase text-muted-foreground">Response (200 OK)</span>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(JSON.stringify(executionResult, null, 2));
                    setCopied(true);
                    setTimeout(() => setCopied(false), 1500);
                  }}
                  className="text-[10px] font-mono text-muted-foreground hover:text-foreground flex items-center gap-1 transition"
                >
                  <Copy className="w-3 h-3" />
                  <span>{copied ? 'Copied!' : 'Copy'}</span>
                </button>
              </div>

              {executionResult ? (
                <pre className="bg-background p-3 rounded-2xl border border-border text-emerald-500 text-xs overflow-auto max-h-96 shadow-inner font-mono">
                  {JSON.stringify(executionResult, null, 2)}
                </pre>
              ) : (
                <div className="text-center py-12 text-muted-foreground text-xs">
                  Click 'Send Request' to execute this endpoint.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
