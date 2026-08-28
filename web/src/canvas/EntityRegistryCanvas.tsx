import React, { useState } from 'react';
import {
  Database,
  Plus,
  Search,
  ExternalLink,
  Trash2,
  Edit3,
  CheckCircle2,
  X,
  RefreshCw,
  Table,
  Key,
  ShieldCheck,
  Check,
  Layers,
  ArrowRight,
  Server,
  FileCode,
} from 'lucide-react';
import { useLayout } from '../shell/LayoutContext';

export interface EntityDef {
  id: string;
  name: string;
  tableName: string;
  schema: string;
  domain: string;
  columnCount: number;
  primaryKey: string;
  classification: 'Master Data' | 'Transactional' | 'Event Stream' | 'Audit Log' | 'Configuration';
  description: string;
  isAuthoritative: boolean;
}

const DEFAULT_ENTITIES: EntityDef[] = [
  {
    id: 'ent-1',
    name: 'Designer Applications',
    tableName: 'designer_apps',
    schema: 'DES_BASE',
    domain: 'Studio Core',
    columnCount: 7,
    primaryKey: 'id (uuid)',
    classification: 'Master Data',
    description: 'Authoritative multi-tenant application metadata and workspace configuration.',
    isAuthoritative: true,
  },
  {
    id: 'ent-2',
    name: 'Designer Layouts & Slots',
    tableName: 'designer_layouts',
    schema: 'DES_BASE',
    domain: 'Studio UI',
    columnCount: 6,
    primaryKey: 'id (uuid)',
    classification: 'Configuration',
    description: 'Dynamic 5-slot layout hierarchy and component configurations.',
    isAuthoritative: true,
  },
  {
    id: 'ent-3',
    name: 'Use Case Specifications',
    tableName: 'uc_use_cases',
    schema: 'DES_BASE',
    domain: 'Requirements Architecture',
    columnCount: 9,
    primaryKey: 'id (text)',
    classification: 'Master Data',
    description: 'UML Use Case goals, preconditions, postconditions, and scenario flows.',
    isAuthoritative: true,
  },
  {
    id: 'ent-4',
    name: 'Actor Directory',
    tableName: 'uc_actors',
    schema: 'DES_BASE',
    domain: 'Requirements Architecture',
    columnCount: 5,
    primaryKey: 'id (text)',
    classification: 'Master Data',
    description: 'Primary, system, and external actors interacting with enterprise boundary.',
    isAuthoritative: true,
  },
  {
    id: 'ent-5',
    name: 'Visual Diagram Layouts',
    tableName: 'diag_layouts',
    schema: 'DES_BASE',
    domain: 'Visual Schematics',
    columnCount: 8,
    primaryKey: 'id (text)',
    classification: 'Configuration',
    description: 'Spatial coordinate grids, zoom levels, and viewport pan offsets.',
    isAuthoritative: true,
  },
  {
    id: 'ent-6',
    name: 'Diagram Elements & Nodes',
    tableName: 'diag_elements',
    schema: 'DES_BASE',
    domain: 'Visual Schematics',
    columnCount: 9,
    primaryKey: 'id (text)',
    classification: 'Configuration',
    description: 'Visual bounds, x/y offsets, styling properties, and anchor connectors.',
    isAuthoritative: true,
  },
  {
    id: 'ent-7',
    name: 'Vehicle Fleet Telematics Logs',
    tableName: 'sensor_telemetry_logs',
    schema: 'DES_BASE',
    domain: 'Fleet Logistics',
    columnCount: 12,
    primaryKey: 'log_id (bigint)',
    classification: 'Event Stream',
    description: 'High-frequency 100Hz binary IoT telemetry packets ingested via gRPC.',
    isAuthoritative: true,
  },
];

export const EntityRegistryCanvas: React.FC = () => {
  const { currentApp, setCanvasMode } = useLayout();
  const [entities, setEntities] = useState<EntityDef[]>(DEFAULT_ENTITIES);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeEntityId, setActiveEntityId] = useState<string>('ent-1');
  const [editingEntity, setEditingEntity] = useState<EntityDef | null>(null);
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [notification, setNotification] = useState<string | null>(null);

  // Form State
  const [formName, setFormName] = useState<string>('');
  const [formTable, setFormTable] = useState<string>('');
  const [formDomain, setFormDomain] = useState<string>('Fleet Logistics');
  const [formColumns, setFormColumns] = useState<number>(6);
  const [formPK, setFormPK] = useState<string>('id (uuid)');
  const [formClassification, setFormClassification] = useState<
    'Master Data' | 'Transactional' | 'Event Stream' | 'Audit Log' | 'Configuration'
  >('Master Data');
  const [formDescription, setFormDescription] = useState<string>('');

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const filteredEntities = entities.filter((ent) => {
    const q = searchQuery.toLowerCase();
    return (
      ent.name.toLowerCase().includes(q) ||
      ent.tableName.toLowerCase().includes(q) ||
      ent.domain.toLowerCase().includes(q) ||
      ent.classification.toLowerCase().includes(q)
    );
  });

  const handleOpenEdit = (ent: EntityDef) => {
    setEditingEntity(ent);
    setFormName(ent.name);
    setFormTable(ent.tableName);
    setFormDomain(ent.domain);
    setFormColumns(ent.columnCount);
    setFormPK(ent.primaryKey);
    setFormClassification(ent.classification);
    setFormDescription(ent.description);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEntity) return;

    const updated: EntityDef = {
      ...editingEntity,
      name: formName.trim(),
      tableName: formTable.trim(),
      domain: formDomain.trim(),
      columnCount: formColumns,
      primaryKey: formPK.trim(),
      classification: formClassification,
      description: formDescription.trim(),
    };

    setEntities((prev) => prev.map((ent) => (ent.id === updated.id ? updated : ent)));
    setEditingEntity(null);
    showToast(`Updated entity "${updated.name}" in DES_BASE.`);
  };

  const handleCreateEntity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formTable.trim()) return;

    const newEnt: EntityDef = {
      id: `ent-${Date.now().toString().slice(-4)}`,
      name: formName.trim(),
      tableName: formTable.trim().toLowerCase().replace(/[^a-z0-9_]+/g, '_'),
      schema: 'DES_BASE',
      domain: formDomain.trim(),
      columnCount: formColumns,
      primaryKey: formPK.trim(),
      classification: formClassification,
      description: formDescription.trim(),
      isAuthoritative: true,
    };

    setEntities((prev) => [newEnt, ...prev]);
    setShowCreateModal(false);
    showToast(`Registered entity "${newEnt.tableName}" in PostgreSQL schema DES_BASE.`);
  };

  const handleDeleteEntity = (ent: EntityDef) => {
    if (!window.confirm(`Delete entity "${ent.tableName}" from registry?`)) return;
    setEntities((prev) => prev.filter((p) => p.id !== ent.id));
    showToast(`Deleted entity "${ent.tableName}".`);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-background text-foreground overflow-y-auto p-6 space-y-6 select-none">
      {/* 1. Header Banner & Entity Registry Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">
              Entity Registry
            </span>
            <span className="text-xs text-muted-foreground font-mono">
              Schema: <strong className="text-emerald-400">DES_BASE:8088</strong> (Authoritative)
            </span>
          </div>
          <h1 className="text-2xl font-bold text-foreground mt-1 flex items-center gap-2">
            <Database className="w-6 h-6 text-primary" />
            <span>Enterprise Entity & Schema Registry</span>
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Authoritative data dictionary of relational tables, domain boundaries, and primary key models in PostgreSQL schema{' '}
            <code className="font-mono text-primary font-semibold">DES_BASE</code>.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => showToast('Entity catalog refreshed from PostgreSQL DES_BASE')}
            className="p-2 bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground rounded-xl border border-border transition-colors cursor-pointer"
            title="Refresh Entity Catalog"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => {
              setFormName('');
              setFormTable('');
              setFormDomain('Fleet Logistics');
              setFormColumns(6);
              setFormPK('id (uuid)');
              setFormDescription('');
              setShowCreateModal(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Entity Table</span>
          </button>
        </div>
      </div>

      {/* Notification Toast */}
      {notification && (
        <div className="p-3 rounded-xl text-xs font-medium flex items-center justify-between animate-in fade-in duration-200 border bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>{notification}</span>
          </div>
          <button onClick={() => setNotification(null)} className="p-1 hover:bg-muted rounded">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 2. Interactive Entity Table */}
      <div className="bg-card border border-border rounded-2xl shadow-xs overflow-hidden flex flex-col">
        {/* Table Toolbar */}
        <div className="p-4 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-muted/20">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-foreground">Registered Data Entities</h2>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-muted text-muted-foreground border border-border">
              {filteredEntities.length} entities
            </span>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by entity, table, domain..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-background border border-border rounded-xl text-xs text-foreground placeholder:text-muted-foreground focus:outline-hidden focus:ring-1 focus:ring-primary transition-all"
            />
          </div>
        </div>

        {/* Table Viewport */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-border bg-muted/40 text-muted-foreground uppercase text-[10px] tracking-wider font-semibold">
                <th className="py-3 px-4">Entity & Table Name</th>
                <th className="py-3 px-4">Bounded Context / Domain</th>
                <th className="py-3 px-4">Primary Key</th>
                <th className="py-3 px-4">Columns</th>
                <th className="py-3 px-4">Classification</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredEntities.map((ent) => {
                const isActive = activeEntityId === ent.id;
                return (
                  <tr
                    key={ent.id}
                    className={`hover:bg-muted/30 transition-colors group ${
                      isActive ? 'bg-primary/5' : ''
                    }`}
                  >
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="p-2 rounded-xl bg-muted text-emerald-400 border border-border shrink-0">
                          <Table className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-bold text-foreground text-xs">{ent.name}</div>
                          <div className="text-[11px] font-mono text-muted-foreground mt-0.5">
                            <span className="text-emerald-500 font-semibold">{ent.schema}.</span>
                            <span>{ent.tableName}</span>
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold uppercase bg-muted text-foreground border border-border">
                        {ent.domain}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 font-mono text-[11px] text-amber-400">
                      <div className="flex items-center gap-1">
                        <Key className="w-3 h-3 text-amber-400" />
                        <span>{ent.primaryKey}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 font-mono text-[11px] text-muted-foreground">
                      {ent.columnCount} fields
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1 text-[10px] text-cyan-400 font-semibold bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                        {ent.classification}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        <span>Synchronized</span>
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            setActiveEntityId(ent.id);
                            showToast(`Activated "${ent.name}" in ER Studio!`);
                            setCanvasMode('er_modeler');
                          }}
                          className={`flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                            isActive
                              ? 'bg-primary text-primary-foreground shadow-xs'
                              : 'bg-muted hover:bg-primary/20 text-muted-foreground hover:text-primary'
                          }`}
                          title="Open in Relational ER Modeler"
                        >
                          <Check className="w-3 h-3" />
                          <span>{isActive ? 'Active' : 'Open in ER'}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleOpenEdit(ent)}
                          className="p-1.5 text-muted-foreground hover:text-primary hover:bg-muted rounded-lg transition-colors cursor-pointer"
                          title="Edit Entity Details"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeleteEntity(ent)}
                          className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors cursor-pointer"
                          title="Delete Entity"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 3. Centered Edit / Create Modal */}
      {(editingEntity || showCreateModal) && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-4 border-b border-border flex items-center justify-between bg-muted/40">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
                  <Database className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-foreground">
                    {editingEntity ? 'Edit Relational Entity' : 'Register New Entity Table'}
                  </h3>
                  <p className="text-[10px] font-mono text-muted-foreground">
                    Authoritative Schema: <strong className="text-emerald-400">DES_BASE</strong>
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setEditingEntity(null);
                  setShowCreateModal(false);
                }}
                className="p-1 text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={editingEntity ? handleSaveEdit : handleCreateEntity} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">Entity Name *</label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. Telematics Stream Log"
                  className="w-full px-3 py-2 bg-background border border-border rounded-xl text-xs text-foreground focus:outline-hidden focus:ring-1 focus:ring-primary"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">Physical Table Name *</label>
                  <input
                    type="text"
                    required
                    value={formTable}
                    onChange={(e) => setFormTable(e.target.value)}
                    placeholder="e.g. sensor_telemetry_logs"
                    className="w-full px-3 py-2 bg-background border border-border rounded-xl text-xs font-mono text-foreground focus:outline-hidden focus:ring-1 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">Bounded Context / Domain</label>
                  <input
                    type="text"
                    value={formDomain}
                    onChange={(e) => setFormDomain(e.target.value)}
                    placeholder="e.g. Fleet Logistics"
                    className="w-full px-3 py-2 bg-background border border-border rounded-xl text-xs text-foreground focus:outline-hidden focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">Primary Key</label>
                  <input
                    type="text"
                    value={formPK}
                    onChange={(e) => setFormPK(e.target.value)}
                    placeholder="e.g. id (uuid)"
                    className="w-full px-3 py-2 bg-background border border-border rounded-xl text-xs font-mono text-foreground focus:outline-hidden focus:ring-1 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">Classification</label>
                  <select
                    value={formClassification}
                    onChange={(e: any) => setFormClassification(e.target.value)}
                    className="w-full px-3 py-2 bg-background border border-border rounded-xl text-xs text-foreground focus:outline-hidden focus:ring-1 focus:ring-primary"
                  >
                    <option value="Master Data">Master Data</option>
                    <option value="Transactional">Transactional</option>
                    <option value="Event Stream">Event Stream</option>
                    <option value="Audit Log">Audit Log</option>
                    <option value="Configuration">Configuration</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">Description</label>
                <textarea
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 bg-background border border-border rounded-xl text-xs text-foreground focus:outline-hidden focus:ring-1 focus:ring-primary resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setEditingEntity(null);
                    setShowCreateModal(false);
                  }}
                  className="px-4 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground rounded-xl hover:bg-muted cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer"
                >
                  {editingEntity ? 'Save Changes' : 'Register Entity'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EntityRegistryCanvas;
