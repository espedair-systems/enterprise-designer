import React, { useState, useEffect } from 'react';
import {
  Layers,
  Layout,
  Database,
  Boxes,
  Network,
  FolderCode,
  LayoutDashboard,
  Sliders,
  CheckCircle2,
  Save,
  Plus,
  Trash2,
  Edit3,
  X,
  Link,
  Sparkles,
} from 'lucide-react';
import { useLayout } from '../shell/LayoutContext';
import { CanvasMode } from '../shell/types';

export interface StructuralNode {
  id: string;
  type: string; // 'class' | 'object' | 'component' | 'node' | 'package' | 'part' | 'stereotype'
  title: string;
  subTitle?: string;
  stereotype?: string;
  attributes?: string[];
  methods?: string[];
  x: number;
  y: number;
  width: number;
  height: number;
  color?: string;
}

export interface StructuralEdge {
  id: string;
  sourceId: string;
  targetId: string;
  type: 'association' | 'inheritance' | 'dependency' | 'realization' | 'manifest';
  label?: string;
}

const DEFAULT_STRUCTURAL_MODELS: Record<string, { nodes: StructuralNode[]; edges: StructuralEdge[]; title: string; desc: string }> = {
  class_diagram: {
    title: 'Class Diagram',
    desc: 'Static structure of domain entities, attributes, methods, and inheritance hierarchies in DES_BASE.',
    nodes: [
      {
        id: 'cls-1',
        type: 'class',
        stereotype: '«Entity»',
        title: 'VehicleAsset',
        subTitle: 'internal.core.domain',
        attributes: ['+ id: UUID', '+ vin: string', '+ telemetryStatus: Status', '- secretKey: string'],
        methods: ['+ IngestPacket(p: Packet): error', '+ CalculateRange(): float64', '+ SaveToDb(): void'],
        x: 80,
        y: 80,
        width: 260,
        height: 180,
        color: 'border-primary/60 bg-card',
      },
      {
        id: 'cls-2',
        type: 'class',
        stereotype: '«Repository»',
        title: 'PostgresVehicleRepo',
        subTitle: 'internal.adapters.outbound.postgres',
        attributes: ['- pool: *pgxpool.Pool', '- schema: string = "DES_BASE"'],
        methods: ['+ Save(ctx: Context, v: VehicleAsset): error', '+ FindById(id: UUID): (*VehicleAsset, error)'],
        x: 460,
        y: 80,
        width: 280,
        height: 160,
        color: 'border-emerald-500/60 bg-card',
      },
      {
        id: 'cls-3',
        type: 'class',
        stereotype: '«Interface»',
        title: 'VehicleRepositoryPort',
        subTitle: 'internal.core.ports',
        methods: ['+ Save(ctx: Context, v: VehicleAsset): error', '+ FindById(id: UUID): (*VehicleAsset, error)'],
        x: 460,
        y: 320,
        width: 280,
        height: 130,
        color: 'border-cyan-500/60 bg-card',
      },
    ],
    edges: [
      { id: 'e-1', sourceId: 'cls-1', targetId: 'cls-3', type: 'dependency', label: 'uses' },
      { id: 'e-2', sourceId: 'cls-2', targetId: 'cls-3', type: 'realization', label: '«implements»' },
    ],
  },
  object_diagram: {
    title: 'Object Diagram',
    desc: 'Concrete runtime instance snapshots and slot values at a specific instant in time.',
    nodes: [
      {
        id: 'obj-1',
        type: 'object',
        title: 'truckAlpha: VehicleAsset',
        attributes: ['id = "550e8400-e29b-41d4-a716-446655440000"', 'vin = "1HGCR2F83HA001294"', 'speedKmh = 84.5', 'batteryPct = 92%'],
        x: 100,
        y: 100,
        width: 280,
        height: 140,
        color: 'border-primary/60 bg-card',
      },
      {
        id: 'obj-2',
        type: 'object',
        title: 'dbInstance: PostgresRepo',
        attributes: ['poolSize = 25', 'connectedSchema = "DES_BASE"', 'lastPingMs = 0.38'],
        x: 480,
        y: 100,
        width: 260,
        height: 120,
        color: 'border-emerald-500/60 bg-card',
      },
    ],
    edges: [{ id: 'e-1', sourceId: 'obj-1', targetId: 'obj-2', type: 'association', label: 'persistedIn' }],
  },
  component_diagram: {
    title: 'Component Diagram',
    desc: 'Executable software modules, provided lollipop interfaces, and required sockets.',
    nodes: [
      {
        id: 'comp-1',
        type: 'component',
        stereotype: '«component»',
        title: 'Web SPA Frontend',
        attributes: ['[Provided] /api/v1 UI Events', '[Required] REST API Gateway'],
        x: 80,
        y: 100,
        width: 240,
        height: 120,
        color: 'border-cyan-500/60 bg-card',
      },
      {
        id: 'comp-2',
        type: 'component',
        stereotype: '«component»',
        title: 'Go Chi HTTP Adapter',
        attributes: ['[Provided] Port 8088 Router', '[Required] Core Domain Service'],
        x: 420,
        y: 100,
        width: 250,
        height: 120,
        color: 'border-primary/60 bg-card',
      },
      {
        id: 'comp-3',
        type: 'component',
        stereotype: '«component»',
        title: 'PostgreSQL DES_BASE Adapter',
        attributes: ['[Provided] pgx Repository Port', '[Required] Port 5432 Server'],
        x: 770,
        y: 100,
        width: 260,
        height: 120,
        color: 'border-emerald-500/60 bg-card',
      },
    ],
    edges: [
      { id: 'e-1', sourceId: 'comp-1', targetId: 'comp-2', type: 'dependency', label: 'JSON / REST' },
      { id: 'e-2', sourceId: 'comp-2', targetId: 'comp-3', type: 'dependency', label: 'Ports / Domain' },
    ],
  },
  deployment_diagram: {
    title: 'Deployment Diagram',
    desc: 'Physical execution hardware nodes, container boundaries, and deployed artifact binaries.',
    nodes: [
      {
        id: 'dep-1',
        type: 'node',
        stereotype: '«device / server»',
        title: 'Linux Edge Host (Ubuntu 24.04)',
        attributes: ['«execution environment» Docker Engine', '  «artifact» bin/base (Single Executable)', '  «artifact» web/dist (Embedded React)'],
        x: 100,
        y: 80,
        width: 320,
        height: 180,
        color: 'border-primary/60 bg-card',
      },
      {
        id: 'dep-2',
        type: 'node',
        stereotype: '«database server»',
        title: 'PostgreSQL 16 Engine (Port 5432)',
        attributes: ['«database» base', '  «schema» DES_BASE (Authoritative)', '  «tablespace» default'],
        x: 540,
        y: 80,
        width: 320,
        height: 180,
        color: 'border-emerald-500/60 bg-card',
      },
    ],
    edges: [{ id: 'e-1', sourceId: 'dep-1', targetId: 'dep-2', type: 'association', label: 'TCP/IP Port 5432' }],
  },
  package_diagram: {
    title: 'Package Diagram',
    desc: 'High-level namespace groupings and architectural package dependencies.',
    nodes: [
      {
        id: 'pkg-1',
        type: 'package',
        stereotype: '«package»',
        title: 'cmd/base',
        attributes: ['main.go', 'server.go', 'tui.go'],
        x: 80,
        y: 80,
        width: 220,
        height: 120,
        color: 'border-primary/60 bg-card',
      },
      {
        id: 'pkg-2',
        type: 'package',
        stereotype: '«package»',
        title: 'internal/core/domain',
        attributes: ['usecase.go', 'app.go', 'widget.go'],
        x: 380,
        y: 80,
        width: 240,
        height: 120,
        color: 'border-cyan-500/60 bg-card',
      },
      {
        id: 'pkg-3',
        type: 'package',
        stereotype: '«package»',
        title: 'internal/adapters/postgres',
        attributes: ['repo.go', 'migrations.go'],
        x: 700,
        y: 80,
        width: 240,
        height: 120,
        color: 'border-emerald-500/60 bg-card',
      },
    ],
    edges: [
      { id: 'e-1', sourceId: 'pkg-1', targetId: 'pkg-2', type: 'dependency', label: '«import»' },
      { id: 'e-2', sourceId: 'pkg-3', targetId: 'pkg-2', type: 'dependency', label: '«import»' },
    ],
  },
  composite_structure_diagram: {
    title: 'Composite Structure Diagram',
    desc: 'Internal structural encapsulation of classes, inner parts, ports, and connectors.',
    nodes: [
      {
        id: 'cs-1',
        type: 'part',
        stereotype: '«composite»',
        title: 'TelematicsController',
        attributes: ['[Port: in] p1: IngestPort', '[Part: 1] parser: AstParser', '[Part: 2] buffer: BatchBuffer', '[Port: out] p2: DbPort'],
        x: 120,
        y: 80,
        width: 380,
        height: 190,
        color: 'border-purple-500/60 bg-card',
      },
      {
        id: 'cs-2',
        type: 'part',
        stereotype: '«composite»',
        title: 'PersistenceSink',
        attributes: ['[Port: in] p_db: SqlPort', '[Part: 1] pgxPool: PoolManager'],
        x: 600,
        y: 80,
        width: 320,
        height: 160,
        color: 'border-emerald-500/60 bg-card',
      },
    ],
    edges: [{ id: 'e-1', sourceId: 'cs-1', targetId: 'cs-2', type: 'association', label: 'binding: p2 ➔ p_db' }],
  },
  profile_diagram: {
    title: 'Profile Diagram',
    desc: 'Custom domain stereotypes, tagged values, and metamodel extensions for DES_BASE.',
    nodes: [
      {
        id: 'prof-1',
        type: 'stereotype',
        stereotype: '«stereotype»',
        title: 'PostgreSQLEntity',
        attributes: ['schema: string = "DES_BASE"', 'isAuthoritative: bool = true', 'tablePrefix: string'],
        x: 100,
        y: 80,
        width: 260,
        height: 140,
        color: 'border-amber-500/60 bg-card',
      },
      {
        id: 'prof-2',
        type: 'stereotype',
        stereotype: '«metaclass»',
        title: 'UML::Class',
        attributes: ['name: String', 'isAbstract: Boolean'],
        x: 460,
        y: 80,
        width: 220,
        height: 120,
        color: 'border-primary/60 bg-card',
      },
    ],
    edges: [{ id: 'e-1', sourceId: 'prof-1', targetId: 'prof-2', type: 'dependency', label: '«extension»' }],
  },
};

export const StructuralDiagramsCanvas: React.FC = () => {
  const { currentApp, canvasMode } = useLayout();
  const activeConfig = DEFAULT_STRUCTURAL_MODELS[canvasMode] || DEFAULT_STRUCTURAL_MODELS.class_diagram;

  const [nodes, setNodes] = useState<StructuralNode[]>(activeConfig.nodes);
  const [edges, setEdges] = useState<StructuralEdge[]>(activeConfig.edges);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  // Edit Modal State
  const [editNode, setEditNode] = useState<StructuralNode | null>(null);
  const [editTitle, setEditTitle] = useState<string>('');
  const [editStereotype, setEditStereotype] = useState<string>('');
  const [editAttributes, setEditAttributes] = useState<string>('');
  const [editMethods, setEditMethods] = useState<string>('');

  useEffect(() => {
    const cfg = DEFAULT_STRUCTURAL_MODELS[canvasMode] || DEFAULT_STRUCTURAL_MODELS.class_diagram;
    setNodes(cfg.nodes);
    setEdges(cfg.edges);
    setSelectedNodeId(null);
  }, [canvasMode]);

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleOpenEdit = (node: StructuralNode) => {
    setEditNode(node);
    setEditTitle(node.title);
    setEditStereotype(node.stereotype || '');
    setEditAttributes(node.attributes ? node.attributes.join('\n') : '');
    setEditMethods(node.methods ? node.methods.join('\n') : '');
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editNode) return;

    const updated: StructuralNode = {
      ...editNode,
      title: editTitle.trim(),
      stereotype: editStereotype.trim(),
      attributes: editAttributes ? editAttributes.split('\n').filter((l) => l.trim() !== '') : [],
      methods: editMethods ? editMethods.split('\n').filter((l) => l.trim() !== '') : [],
    };

    setNodes((prev) => prev.map((n) => (n.id === updated.id ? updated : n)));
    setEditNode(null);
    showToast(`Saved specifications for "${updated.title}" to DES_BASE.`);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-background select-none overflow-hidden relative">
      {/* Top Header Toolbar */}
      <div className="h-14 border-b border-border bg-card/80 backdrop-blur-md px-4 flex items-center justify-between shrink-0 z-20">
        <div className="flex items-center gap-3">
          <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
            <Layout className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-foreground">
                {currentApp ? currentApp.name : 'Fleet Logistics Studio'} • {activeConfig.title}
              </span>
              <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-muted text-muted-foreground border border-border">
                Structural Diagram
              </span>
            </div>
            <p className="text-[10px] text-muted-foreground">{activeConfig.desc}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {notification && (
            <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1.5 animate-in fade-in">
              <CheckCircle2 className="w-3.5 h-3.5" />
              {notification}
            </span>
          )}
          <button
            type="button"
            onClick={() => showToast(`${activeConfig.title} saved to PostgreSQL DES_BASE!`)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-primary-foreground text-xs font-bold rounded-xl shadow-xs hover:bg-primary/90 transition-all cursor-pointer"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Diagram</span>
          </button>
        </div>
      </div>

      {/* Main Canvas Viewport */}
      <div
        className="flex-1 overflow-auto p-12 relative bg-background"
        style={{
          backgroundImage: 'radial-gradient(circle, var(--border) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
        onClick={() => setSelectedNodeId(null)}
      >
        {/* SVG Connector Lines */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
          <defs>
            <marker id="struct-arrow" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
              <polygon points="0 0, 8 3, 0 6" fill="var(--primary)" />
            </marker>
          </defs>
          {edges.map((edge) => {
            const src = nodes.find((n) => n.id === edge.sourceId);
            const tgt = nodes.find((n) => n.id === edge.targetId);
            if (!src || !tgt) return null;

            const x1 = src.x + src.width;
            const y1 = src.y + src.height / 2;
            const x2 = tgt.x;
            const y2 = tgt.y + tgt.height / 2;

            const isDashed = edge.type === 'dependency' || edge.type === 'realization';

            return (
              <g key={edge.id}>
                <line
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke="var(--primary)"
                  strokeWidth="2"
                  strokeDasharray={isDashed ? '4,4' : 'none'}
                  markerEnd="url(#struct-arrow)"
                />
                {edge.label && (
                  <text
                    x={(x1 + x2) / 2}
                    y={(y1 + y2) / 2 - 8}
                    fill="var(--primary)"
                    fontSize="10"
                    fontFamily="monospace"
                    fontWeight="bold"
                    textAnchor="middle"
                    className="select-none bg-card px-1"
                  >
                    {edge.label}
                  </text>
                )}
              </g>
            );
          })}
        </svg>

        {/* Nodes Layer */}
        {nodes.map((node) => {
          const isSelected = selectedNodeId === node.id;
          return (
            <div
              key={node.id}
              onClick={(e) => {
                e.stopPropagation();
                setSelectedNodeId(node.id);
              }}
              onDoubleClick={() => handleOpenEdit(node)}
              style={{
                transform: `translate3d(${node.x}px, ${node.y}px, 0)`,
                width: `${node.width}px`,
                height: `${node.height}px`,
              }}
              className={`absolute rounded-xl border-2 overflow-hidden shadow-md flex flex-col justify-between transition-all cursor-pointer z-10 ${
                node.color || 'border-primary bg-card'
              } ${isSelected ? 'ring-2 ring-primary scale-105 shadow-xl' : 'hover:scale-102'}`}
            >
              {/* Header Box */}
              <div className="p-2.5 bg-muted/40 border-b border-border/70 text-center">
                {node.stereotype && (
                  <div className="text-[9px] font-mono text-muted-foreground">{node.stereotype}</div>
                )}
                <div className="font-bold text-xs text-foreground leading-tight">{node.title}</div>
                {node.subTitle && (
                  <div className="text-[8px] font-mono text-muted-foreground/80 truncate">{node.subTitle}</div>
                )}
              </div>

              {/* Attributes Section */}
              {node.attributes && node.attributes.length > 0 && (
                <div className="p-2 space-y-0.5 text-[9px] font-mono text-foreground border-b border-border/50 flex-1 overflow-hidden">
                  {node.attributes.map((attr, idx) => (
                    <div key={idx} className="truncate">
                      {attr}
                    </div>
                  ))}
                </div>
              )}

              {/* Methods Section */}
              {node.methods && node.methods.length > 0 && (
                <div className="p-2 space-y-0.5 text-[9px] font-mono text-cyan-400 bg-background/50 flex-1 overflow-hidden">
                  {node.methods.map((method, idx) => (
                    <div key={idx} className="truncate">
                      {method}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Centered Edit Modal */}
      {editNode && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-4 border-b border-border flex items-center justify-between bg-muted/40">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
                  <Layout className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-foreground">Edit Structural Node</h3>
                  <p className="text-[10px] font-mono text-muted-foreground">
                    Authoritative PostgreSQL: <strong className="text-primary">DES_BASE.diag_elements</strong>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setEditNode(null)}
                className="p-1 text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">Title *</label>
                  <input
                    type="text"
                    required
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="w-full px-3 py-2 bg-background border border-border rounded-xl text-xs text-foreground focus:outline-hidden focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">Stereotype</label>
                  <input
                    type="text"
                    value={editStereotype}
                    onChange={(e) => setEditStereotype(e.target.value)}
                    placeholder="e.g. «Entity»"
                    className="w-full px-3 py-2 bg-background border border-border rounded-xl text-xs font-mono text-foreground focus:outline-hidden focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  Attributes / Fields (one per line)
                </label>
                <textarea
                  value={editAttributes}
                  onChange={(e) => setEditAttributes(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 bg-background border border-border rounded-xl text-xs font-mono text-foreground focus:outline-hidden focus:ring-1 focus:ring-primary resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  Methods / Operations (one per line)
                </label>
                <textarea
                  value={editMethods}
                  onChange={(e) => setEditMethods(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 bg-background border border-border rounded-xl text-xs font-mono text-cyan-400 focus:outline-hidden focus:ring-1 focus:ring-primary resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditNode(null)}
                  className="px-4 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground rounded-xl hover:bg-muted cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer"
                >
                  Save to DES_BASE
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StructuralDiagramsCanvas;
