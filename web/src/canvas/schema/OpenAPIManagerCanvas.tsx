import React, { useState, useEffect } from 'react';
import {
  Globe,
  Plus,
  Trash2,
  CheckCircle2,
  RefreshCw,
  Search,
  ExternalLink,
  Code,
  Tag,
  Shield,
  Layers,
  X,
} from 'lucide-react';
import { api } from '../../services/api';

interface NormalizedParam {
  name: string;
  in: string;
  required: boolean;
  schema_type: string;
  description: string;
}

interface NormalizedResp {
  status_code: string;
  description: string;
  content_type: string;
  schema?: any;
}

interface OpenAPIEndpointItem {
  id: string;
  app_id: string;
  path: string;
  method: string;
  summary: string;
  description: string;
  tags?: string[];
  parameters?: any;
  request_body_schema?: any;
  request_body?: any;
  responses?: any;
  security?: any;
}

const normalizeParameters = (params: any): NormalizedParam[] => {
  if (!params) return [];
  if (Array.isArray(params)) {
    return params.map((p) => ({
      name: p.name || '',
      in: p.in || 'query',
      required: Boolean(p.required),
      schema_type: p.schema_type || p.schema?.type || (typeof p.schema === 'string' ? p.schema : 'string'),
      description: p.description || '',
    }));
  }
  if (typeof params === 'object') {
    return Object.entries(params).map(([name, val]: [string, any]) => ({
      name,
      in: val?.in || 'query',
      required: Boolean(val?.required),
      schema_type: val?.schema_type || val?.schema?.type || 'string',
      description: val?.description || '',
    }));
  }
  return [];
};

const normalizeResponses = (resps: any): NormalizedResp[] => {
  if (!resps) return [];
  if (Array.isArray(resps)) {
    return resps.map((r, idx) => ({
      status_code: r.status_code || r.statusCode || String(idx),
      description: r.description || 'Response',
      content_type: r.content_type || r.contentType || 'application/json',
      schema: r.schema,
    }));
  }
  if (typeof resps === 'object') {
    return Object.entries(resps).map(([code, val]: [string, any]) => {
      const contentKeys = val?.content ? Object.keys(val.content) : [];
      const primaryContent = contentKeys.length > 0 ? contentKeys[0] : 'application/json';
      const schema = val?.schema || (val?.content && val.content[primaryContent]?.schema);
      return {
        status_code: code,
        description: typeof val === 'string' ? val : val?.description || 'Response',
        content_type: primaryContent,
        schema,
      };
    });
  }
  return [];
};

export const OpenAPIManagerCanvas: React.FC = () => {
  const [endpoints, setEndpoints] = useState<OpenAPIEndpointItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [methodFilter, setMethodFilter] = useState<string>('all');
  const [selectedEndpoint, setSelectedEndpoint] = useState<OpenAPIEndpointItem | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // New Endpoint State
  const [newPath, setNewPath] = useState('/api/v1/');
  const [newMethod, setNewMethod] = useState('GET');
  const [newSummary, setNewSummary] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newTag, setNewTag] = useState('Core');

  const fetchEndpoints = async () => {
    try {
      setLoading(true);
      const res = await api.listOpenAPIEndpoints();
      const list = Array.isArray(res)
        ? res
        : res && typeof res === 'object' && Array.isArray((res as any).endpoints)
        ? (res as any).endpoints
        : res && typeof res === 'object' && Array.isArray((res as any).items)
        ? (res as any).items
        : [];
      setEndpoints(list);
      if (list.length > 0 && !selectedEndpoint) {
        setSelectedEndpoint(list[0]);
      }
    } catch (err) {
      console.error('Failed to fetch OpenAPI endpoints:', err);
      setEndpoints([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEndpoints();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPath.trim() || !newSummary.trim()) return;

    try {
      const payload = {
        app_id: 'fleet-logistics',
        path: newPath.trim(),
        method: newMethod.toUpperCase(),
        summary: newSummary.trim(),
        description: newDescription.trim(),
        tags: [newTag.trim() || 'General'],
        parameters: [
          {
            name: 'limit',
            in: 'query',
            required: false,
            schema_type: 'integer',
            description: 'Maximum items to return',
          },
        ],
        request_body_schema:
          newMethod !== 'GET'
            ? {
                type: 'object',
                properties: { id: { type: 'string' } },
                required: ['id'],
              }
            : null,
        responses: {
          '200': {
            description: 'Successful response',
            content: {
              'application/json': {
                schema: { type: 'object', properties: { status: { type: 'string' } } },
              },
            },
          },
        },
        security: ['BearerAuth'],
      };

      await api.createOpenAPIEndpoint(payload);
      setIsCreateModalOpen(false);
      setNewPath('/api/v1/');
      setNewSummary('');
      setNewDescription('');
      await fetchEndpoints();
    } catch (err) {
      console.error('Failed to create endpoint:', err);
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this OpenAPI endpoint operation?')) return;
    try {
      await api.deleteOpenAPIEndpoint(id);
      if (selectedEndpoint?.id === id) {
        setSelectedEndpoint(null);
      }
      await fetchEndpoints();
    } catch (err) {
      console.error('Failed to delete endpoint:', err);
    }
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

  const safeEndpoints = Array.isArray(endpoints) ? endpoints : [];

  const filteredEndpoints = safeEndpoints.filter((ep) => {
    if (!ep) return false;
    const path = ep.path || '';
    const summary = ep.summary || '';
    const desc = ep.description || '';
    const matchesSearch =
      path.toLowerCase().includes(searchQuery.toLowerCase()) ||
      summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      desc.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesMethod = methodFilter === 'all' || (ep.method && ep.method.toUpperCase() === methodFilter);
    return matchesSearch && matchesMethod;
  });

  const selectedParams = selectedEndpoint ? normalizeParameters(selectedEndpoint.parameters) : [];
  const selectedResponses = selectedEndpoint ? normalizeResponses(selectedEndpoint.responses) : [];

  return (
    <div className="flex flex-col h-full bg-background text-foreground select-none overflow-hidden">
      {/* Top Header */}
      <div className="p-3.5 border-b border-border bg-card/60 backdrop-blur-md flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-primary/10 border border-primary/20 text-primary">
            <Globe className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-foreground flex items-center gap-2">
              OpenAPI 3.1 Route & Endpoint Manager
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
                DES_BASE.openapi_endpoints
              </span>
            </h1>
            <p className="text-[11px] text-muted-foreground">
              Define REST API contracts, path operations, request bodies, parameter schemas, and response matrices.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchEndpoints}
            title="Refresh Endpoints"
            className="p-2 rounded-xl bg-card hover:bg-muted text-muted-foreground hover:text-foreground border border-border transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2 px-3 py-1.5 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl text-xs font-semibold shadow-lg shadow-primary/20 transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Route</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="px-4 py-2.5 border-b border-border bg-card/30 flex items-center justify-between gap-3">
        <div className="relative w-80">
          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter by path, summary or tag..."
            className="w-full bg-background border border-border rounded-xl pl-9 pr-3 py-1.5 text-xs text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary transition"
          />
        </div>

        <div className="flex items-center gap-1.5 bg-background rounded-xl border border-border p-1 text-xs">
          {['all', 'GET', 'POST', 'PUT', 'DELETE'].map((m) => (
            <button
              key={m}
              onClick={() => setMethodFilter(m)}
              className={`px-2.5 py-0.5 rounded-lg font-medium transition ${
                methodFilter === m
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {m.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Main Split: Endpoints List + Inspector Details */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Endpoints List */}
        <div className="w-1/2 border-r border-border overflow-y-auto p-4 space-y-2.5">
          {loading ? (
            <div className="text-center py-12 text-muted-foreground text-xs">Loading endpoints...</div>
          ) : filteredEndpoints.length === 0 ? (
            <div className="text-center py-16 border border-dashed border-border rounded-2xl p-6">
              <Globe className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
              <h3 className="text-xs font-semibold text-foreground">No OpenAPI endpoints registered</h3>
              <p className="text-[11px] text-muted-foreground mt-1">
                Add your first REST endpoint operation to begin defining OpenAPI 3.1 specifications.
              </p>
            </div>
          ) : (
            filteredEndpoints.map((ep) => {
              const isSelected = selectedEndpoint?.id === ep.id;
              const tags = Array.isArray(ep.tags) ? ep.tags : [];
              const paramList = normalizeParameters(ep.parameters);
              const respList = normalizeResponses(ep.responses);

              return (
                <div
                  key={ep.id}
                  onClick={() => setSelectedEndpoint(ep)}
                  className={`p-3 rounded-2xl border cursor-pointer transition space-y-2 ${
                    isSelected
                      ? 'bg-card border-primary ring-1 ring-primary/20 shadow-md'
                      : 'bg-card/60 hover:bg-card border-border hover:border-primary/40'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded-md font-mono text-[10px] font-bold border ${getMethodBadgeClass(ep.method || 'GET')}`}>
                        {ep.method || 'GET'}
                      </span>
                      <span className="font-mono text-xs font-bold text-foreground">{ep.path}</span>
                    </div>
                    <button
                      onClick={(e) => handleDelete(ep.id, e)}
                      title="Delete Endpoint"
                      className="p-1 text-muted-foreground hover:text-destructive rounded-lg hover:bg-muted transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <p className="text-xs text-muted-foreground truncate">{ep.summary}</p>

                  <div className="flex items-center gap-2 pt-1">
                    {tags.map((t, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded-md bg-muted text-muted-foreground text-[10px] border border-border"
                      >
                        <Tag className="w-2.5 h-2.5" />
                        {t}
                      </span>
                    ))}
                    <span className="text-[10px] text-muted-foreground font-mono">
                      {paramList.length} params
                    </span>
                    <span className="text-[10px] text-muted-foreground font-mono">
                      {respList.length} responses
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right: Selected Endpoint Detail Pane */}
        <div className="w-1/2 overflow-y-auto p-5 bg-card/20 space-y-4">
          {selectedEndpoint ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <span className={`px-2.5 py-1 rounded-lg font-mono text-xs font-bold border ${getMethodBadgeClass(selectedEndpoint.method || 'GET')}`}>
                  {selectedEndpoint.method || 'GET'}
                </span>
                <span className="font-mono text-sm font-bold text-foreground">
                  {selectedEndpoint.path}
                </span>
              </div>

              <div>
                <h2 className="text-sm font-bold text-foreground">{selectedEndpoint.summary}</h2>
                <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                  {selectedEndpoint.description || 'No extended description provided.'}
                </p>
              </div>

              {/* Parameters Table */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-primary" />
                  Parameters ({selectedParams.length})
                </h3>
                {selectedParams.length > 0 ? (
                  <div className="rounded-xl border border-border overflow-hidden bg-card/60">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-border bg-muted/50 text-[10px] text-muted-foreground font-semibold uppercase">
                          <th className="py-2 px-3">Name</th>
                          <th className="py-2 px-3">In</th>
                          <th className="py-2 px-3">Required</th>
                          <th className="py-2 px-3">Type</th>
                          <th className="py-2 px-3">Description</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {selectedParams.map((p, idx) => (
                          <tr key={idx}>
                            <td className="py-2 px-3 font-mono font-bold text-foreground">{p.name}</td>
                            <td className="py-2 px-3 font-mono text-[10px] text-muted-foreground">{p.in}</td>
                            <td className="py-2 px-3">
                              {p.required ? (
                                <span className="text-destructive font-bold">Yes</span>
                              ) : (
                                <span className="text-muted-foreground">No</span>
                              )}
                            </td>
                            <td className="py-2 px-3 font-mono text-[10px] text-primary">{p.schema_type}</td>
                            <td className="py-2 px-3 text-muted-foreground text-[11px]">{p.description}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-xs text-muted-foreground p-3 rounded-xl border border-border bg-card/30">
                    No query or path parameters defined.
                  </div>
                )}
              </div>

              {/* Response Matrix */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  Responses ({selectedResponses.length})
                </h3>
                <div className="space-y-2">
                  {selectedResponses.map((r, idx) => (
                    <div key={idx} className="p-3 rounded-xl border border-border bg-card/60 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                            {r.status_code}
                          </span>
                          <span className="text-xs font-semibold text-foreground">{r.description}</span>
                        </div>
                        <span className="font-mono text-[10px] text-muted-foreground">{r.content_type}</span>
                      </div>
                      {r.schema && (
                        <pre className="bg-background p-2 rounded-lg border border-border text-[10px] font-mono text-muted-foreground overflow-auto max-h-32">
                          {JSON.stringify(r.schema, null, 2)}
                        </pre>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-20 text-muted-foreground text-xs">
              Select an endpoint from the left to view its complete OpenAPI 3.1 specification.
            </div>
          )}
        </div>
      </div>

      {/* Centered Modal: Create New Route */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between p-4 border-b border-border bg-muted/40">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-primary" />
                <h2 className="text-sm font-bold text-foreground">Add OpenAPI Endpoint Route</h2>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-muted-foreground hover:text-foreground transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="p-4 space-y-3.5 text-xs">
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-foreground font-medium mb-1">HTTP Method</label>
                  <select
                    value={newMethod}
                    onChange={(e) => setNewMethod(e.target.value)}
                    className="w-full bg-background border border-border rounded-xl px-3 py-2 text-foreground font-bold focus:outline-none focus:border-primary transition"
                  >
                    <option value="GET">GET</option>
                    <option value="POST">POST</option>
                    <option value="PUT">PUT</option>
                    <option value="PATCH">PATCH</option>
                    <option value="DELETE">DELETE</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-foreground font-medium mb-1">Path</label>
                  <input
                    type="text"
                    required
                    value={newPath}
                    onChange={(e) => setNewPath(e.target.value)}
                    placeholder="/api/v1/resource/{id}"
                    className="w-full bg-background border border-border rounded-xl px-3 py-2 font-mono text-foreground focus:outline-none focus:border-primary transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-foreground font-medium mb-1">Operation Summary</label>
                <input
                  type="text"
                  required
                  value={newSummary}
                  onChange={(e) => setNewSummary(e.target.value)}
                  placeholder="e.g. List all active vehicles with live telemetry"
                  className="w-full bg-background border border-border rounded-xl px-3 py-2 text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary transition"
                />
              </div>

              <div>
                <label className="block text-foreground font-medium mb-1">Tag / Group</label>
                <input
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="e.g. Telematics, Vehicles, Audit"
                  className="w-full bg-background border border-border rounded-xl px-3 py-2 text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary transition"
                />
              </div>

              <div>
                <label className="block text-foreground font-medium mb-1">Description</label>
                <textarea
                  rows={2}
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Detailed behavior, error modes, and authorization requirements..."
                  className="w-full bg-background border border-border rounded-xl px-3 py-2 text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary transition resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-3 py-1.5 rounded-xl bg-card hover:bg-muted text-foreground transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-lg transition"
                >
                  Create Endpoint
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
