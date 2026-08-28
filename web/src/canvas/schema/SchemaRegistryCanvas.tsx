import React, { useState, useEffect } from 'react';
import {
  FileCode2,
  Plus,
  Search,
  Trash2,
  CheckCircle2,
  RefreshCw,
  Code,
  Globe,
  X,
} from 'lucide-react';
import { api } from '../../services/api';
import { useLayout } from '../../shell/LayoutContext';

interface SchemaItem {
  id: string;
  app_id: string;
  title: string;
  slug: string;
  schema_type: 'json_schema' | 'openapi_spec';
  dialect: string;
  version: string;
  description: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export const SchemaRegistryCanvas: React.FC = () => {
  const { setCanvasMode } = useLayout();
  const [schemas, setSchemas] = useState<SchemaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'json_schema' | 'openapi_spec'>('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // New Schema Form State
  const [newTitle, setNewTitle] = useState('');
  const [newSlug, setNewSlug] = useState('');
  const [newSchemaType, setNewSchemaType] = useState<'json_schema' | 'openapi_spec'>('json_schema');
  const [newDialect, setNewDialect] = useState('draft-2020-12');
  const [newVersion, setNewVersion] = useState('1.0.0');
  const [newDescription, setNewDescription] = useState('');

  const fetchSchemas = async () => {
    try {
      setLoading(true);
      const res = await api.listSchemas();
      if (Array.isArray(res)) {
        setSchemas(res);
      } else if (res && typeof res === 'object' && Array.isArray((res as any).schemas)) {
        setSchemas((res as any).schemas);
      } else if (res && typeof res === 'object' && Array.isArray((res as any).items)) {
        setSchemas((res as any).items);
      } else {
        setSchemas([]);
      }
    } catch (err) {
      console.error('Failed to fetch schemas:', err);
      setSchemas([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchemas();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newSlug.trim()) return;

    try {
      const payload = {
        title: newTitle.trim(),
        slug: newSlug.trim().toLowerCase().replace(/[^a-z0-9-]/g, '-'),
        schema_type: newSchemaType,
        dialect: newDialect,
        version: newVersion,
        description: newDescription,
        status: 'draft',
        app_id: 'fleet-logistics',
        raw_payload_json:
          newSchemaType === 'json_schema'
            ? {
                $schema: 'https://json-schema.org/draft/2020-12/schema',
                title: newTitle,
                type: 'object',
                properties: {},
                required: [],
              }
            : {
                openapi: '3.1.0',
                info: { title: newTitle, version: newVersion },
                paths: {},
              },
      };

      await api.createSchema(payload);
      setIsCreateModalOpen(false);
      setNewTitle('');
      setNewSlug('');
      setNewDescription('');
      await fetchSchemas();
    } catch (err) {
      console.error('Failed to create schema:', err);
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this schema registry entry?')) return;
    try {
      await api.deleteSchema(id);
      await fetchSchemas();
    } catch (err) {
      console.error('Failed to delete schema:', err);
    }
  };

  const safeSchemas = Array.isArray(schemas) ? schemas : [];

  const filteredSchemas = safeSchemas.filter((s) => {
    if (!s) return false;
    const title = s.title || '';
    const slug = s.slug || '';
    const desc = s.description || '';
    const matchesSearch =
      title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      slug.toLowerCase().includes(searchQuery.toLowerCase()) ||
      desc.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === 'all' || s.schema_type === typeFilter;
    return matchesSearch && matchesType;
  });

  return (
    <div className="flex flex-col h-full bg-background text-foreground select-none">
      {/* Header Toolbar */}
      <div className="p-4 border-b border-border bg-card/60 backdrop-blur-md flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-primary/10 border border-primary/20 text-primary">
            <FileCode2 className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-bold text-foreground flex items-center gap-2">
              Enterprise Schema & OpenAPI Registry
              <span className="text-xs font-mono font-normal px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
                DES_BASE.schema_registries
              </span>
            </h1>
            <p className="text-xs text-muted-foreground">
              Authoritative JSON Schema definitions, OpenAPI specifications, and validation artifacts.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchSchemas}
            title="Refresh Registry"
            className="p-2 rounded-xl bg-card hover:bg-muted text-muted-foreground hover:text-foreground border border-border transition"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2 px-3 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl text-xs font-semibold shadow-lg shadow-primary/20 transition"
          >
            <Plus className="w-4 h-4" />
            <span>New Schema / OpenAPI</span>
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="px-4 py-3 border-b border-border bg-card/30 flex flex-wrap items-center justify-between gap-3">
        <div className="relative w-72">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search schemas, slugs & descriptions..."
            className="w-full bg-background border border-border rounded-xl pl-9 pr-3 py-1.5 text-xs text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary transition"
          />
        </div>

        <div className="flex items-center gap-1.5 p-1 bg-background rounded-xl border border-border text-xs">
          <button
            onClick={() => setTypeFilter('all')}
            className={`px-2.5 py-1 rounded-lg font-medium transition ${
              typeFilter === 'all'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            All Types ({safeSchemas.length})
          </button>
          <button
            onClick={() => setTypeFilter('json_schema')}
            className={`px-2.5 py-1 rounded-lg font-medium transition ${
              typeFilter === 'json_schema'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            JSON Schema ({safeSchemas.filter((s) => s.schema_type === 'json_schema').length})
          </button>
          <button
            onClick={() => setTypeFilter('openapi_spec')}
            className={`px-2.5 py-1 rounded-lg font-medium transition ${
              typeFilter === 'openapi_spec'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            OpenAPI Spec ({safeSchemas.filter((s) => s.schema_type === 'openapi_spec').length})
          </button>
        </div>
      </div>

      {/* Pure Table Registry */}
      <div className="flex-1 overflow-auto p-4">
        {loading ? (
          <div className="flex items-center justify-center h-48 text-muted-foreground text-xs">
            Loading schema registries...
          </div>
        ) : filteredSchemas.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 border border-dashed border-border rounded-2xl p-6 text-center">
            <FileCode2 className="w-10 h-10 text-muted-foreground mb-3" />
            <h3 className="text-sm font-semibold text-foreground">No schema definitions found</h3>
            <p className="text-xs text-muted-foreground mt-1 max-w-sm">
              Create your first JSON Schema or OpenAPI specification to begin visual AST modeling.
            </p>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="mt-4 px-3 py-1.5 bg-card hover:bg-muted text-foreground rounded-xl text-xs font-medium border border-border transition"
            >
              + Create Schema
            </button>
          </div>
        ) : (
          <div className="rounded-2xl border border-border overflow-hidden bg-card/60 shadow-sm">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-border bg-muted/50 text-muted-foreground font-semibold uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-4">Title & Slug</th>
                  <th className="py-3 px-3">Type</th>
                  <th className="py-3 px-3">Dialect</th>
                  <th className="py-3 px-3">Version</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-4">Description</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredSchemas.map((s) => (
                  <tr
                    key={s.id}
                    onClick={() => {
                      if (s.schema_type === 'openapi_spec') {
                        setCanvasMode('openapi_manager');
                      } else {
                        setCanvasMode('schema_designer');
                      }
                    }}
                    className="hover:bg-muted/40 cursor-pointer transition group"
                  >
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-foreground group-hover:text-primary transition">
                        {s.title}
                      </div>
                      <div className="text-[10px] font-mono text-muted-foreground">{s.slug}</div>
                    </td>
                    <td className="py-3.5 px-3">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium border ${
                          s.schema_type === 'json_schema'
                            ? 'bg-primary/10 text-primary border-primary/20'
                            : 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20'
                        }`}
                      >
                        {s.schema_type === 'json_schema' ? (
                          <Code className="w-3 h-3" />
                        ) : (
                          <Globe className="w-3 h-3" />
                        )}
                        {s.schema_type === 'json_schema' ? 'JSON Schema' : 'OpenAPI 3.1'}
                      </span>
                    </td>
                    <td className="py-3.5 px-3">
                      <span className="font-mono text-[10px] text-muted-foreground bg-background px-2 py-0.5 rounded-md border border-border">
                        {s.dialect}
                      </span>
                    </td>
                    <td className="py-3.5 px-3">
                      <span className="font-mono text-xs text-foreground font-semibold">
                        v{s.version}
                      </span>
                    </td>
                    <td className="py-3.5 px-3">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                        <CheckCircle2 className="w-2.5 h-2.5" />
                        {s.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-muted-foreground max-w-xs truncate">
                      {s.description || '—'}
                    </td>
                    <td className="py-3.5 px-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (s.schema_type === 'openapi_spec') {
                              setCanvasMode('openapi_manager');
                            } else {
                              setCanvasMode('schema_designer');
                            }
                          }}
                          className="px-2.5 py-1 rounded-lg bg-card hover:bg-muted text-foreground text-[10px] font-medium border border-border transition"
                        >
                          Open Designer
                        </button>
                        <button
                          onClick={(e) => handleDelete(s.id, e)}
                          title="Delete Schema"
                          className="p-1.5 text-muted-foreground hover:text-destructive rounded-lg hover:bg-muted transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Centered Modal: Create New Schema */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between p-4 border-b border-border bg-muted/40">
              <div className="flex items-center gap-2">
                <FileCode2 className="w-4 h-4 text-primary" />
                <h2 className="text-sm font-bold text-foreground">Create New Schema / OpenAPI Document</h2>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-muted-foreground hover:text-foreground transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="p-4 space-y-3.5 text-xs">
              <div>
                <label className="block text-foreground font-medium mb-1">Specification Type</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setNewSchemaType('json_schema');
                      setNewDialect('draft-2020-12');
                    }}
                    className={`p-2.5 rounded-xl border text-left flex items-center gap-2 transition ${
                      newSchemaType === 'json_schema'
                        ? 'bg-primary/10 border-primary text-primary'
                        : 'bg-background border-border text-muted-foreground hover:border-primary/40'
                    }`}
                  >
                    <Code className="w-4 h-4" />
                    <div>
                      <div className="font-semibold text-foreground">JSON Schema</div>
                      <div className="text-[10px] text-muted-foreground">Data models & validation</div>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setNewSchemaType('openapi_spec');
                      setNewDialect('openapi-3.1');
                    }}
                    className={`p-2.5 rounded-xl border text-left flex items-center gap-2 transition ${
                      newSchemaType === 'openapi_spec'
                        ? 'bg-primary/10 border-primary text-primary'
                        : 'bg-background border-border text-muted-foreground hover:border-primary/40'
                    }`}
                  >
                    <Globe className="w-4 h-4" />
                    <div>
                      <div className="font-semibold text-foreground">OpenAPI 3.1</div>
                      <div className="text-[10px] text-muted-foreground">REST API & endpoints</div>
                    </div>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-foreground font-medium mb-1">Title</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => {
                    setNewTitle(e.target.value);
                    if (!newSlug) {
                      setNewSlug(
                        e.target.value
                          .toLowerCase()
                          .replace(/[^a-z0-9-]/g, '-')
                          .replace(/-+/g, '-')
                      );
                    }
                  }}
                  placeholder="e.g. Telematics Event Payload Schema"
                  className="w-full bg-background border border-border rounded-xl px-3 py-2 text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary transition"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-foreground font-medium mb-1">Slug Identifier</label>
                  <input
                    type="text"
                    required
                    value={newSlug}
                    onChange={(e) => setNewSlug(e.target.value)}
                    placeholder="e.g. telematics-event"
                    className="w-full bg-background border border-border rounded-xl px-3 py-2 font-mono text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary transition"
                  />
                </div>
                <div>
                  <label className="block text-foreground font-medium mb-1">Dialect</label>
                  <select
                    value={newDialect}
                    onChange={(e) => setNewDialect(e.target.value)}
                    className="w-full bg-background border border-border rounded-xl px-3 py-2 text-foreground focus:outline-none focus:border-primary transition"
                  >
                    {newSchemaType === 'json_schema' ? (
                      <>
                        <option value="draft-2020-12">Draft 2020-12 (Authoritative)</option>
                        <option value="draft-2019-09">Draft 2019-09</option>
                        <option value="draft-07">Draft 7</option>
                        <option value="draft-04">Draft 4</option>
                      </>
                    ) : (
                      <>
                        <option value="openapi-3.1">OpenAPI 3.1.0</option>
                        <option value="openapi-3.0">OpenAPI 3.0.3</option>
                      </>
                    )}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-foreground font-medium mb-1">Description</label>
                <textarea
                  rows={2}
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Summary of this schema's purpose and validation boundaries..."
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
                  Create Schema Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
