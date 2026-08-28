import React, { useState, useEffect, useRef } from 'react';
import {
  User,
  Cpu,
  Database,
  Circle,
  Square,
  ArrowRight,
  GitBranch,
  FileText,
  Trash2,
  Edit3,
  Plus,
  Save,
  RefreshCw,
  Sparkles,
  Move,
  CheckCircle2,
  X,
  Layers,
  Info,
  ExternalLink,
  Link,
  MousePointer,
  RotateCcw,
} from 'lucide-react';
import { useLayout } from '../shell/LayoutContext';
import { api } from '../services/api';

export interface UseCaseNode {
  id: string;
  type: 'actor' | 'use_case' | 'boundary' | 'note';
  subType?: string;
  code?: string;
  title: string;
  description: string;
  x: number;
  y: number;
  width: number;
  height: number;
  primaryActorId?: string;
  preconditions?: string;
  postconditions?: string;
  mainFlow?: string[];
  extensions?: string[];
  roleType?: string;
  color?: string;
}

export interface UseCaseEdge {
  id: string;
  sourceId: string;
  targetId: string;
  relType: 'association' | 'include' | 'extend' | 'generalization';
  label?: string;
}

const DEFAULT_FLEET_NODES: UseCaseNode[] = [
  // 1. Boundary
  {
    id: 'elem-boundary-1',
    type: 'boundary',
    title: 'Fleet Logistics Core Subsystem Boundary',
    description: 'Autonomous dispatch, real-time telematic processing, and sensor persistence',
    x: 280,
    y: 40,
    width: 680,
    height: 520,
    color: 'border-border/80 bg-card/40',
  },
  // 2. Actors
  {
    id: 'act-1',
    type: 'actor',
    subType: 'primary',
    title: 'Fleet Operator',
    roleType: 'primary',
    description: 'Human operations controller managing active vehicle dispatch and safety constraints.',
    x: 60,
    y: 120,
    width: 140,
    height: 140,
    color: 'border-primary/50 bg-primary/10 text-primary',
  },
  {
    id: 'act-2',
    type: 'actor',
    subType: 'system',
    title: 'Telematics Ingestion Engine',
    roleType: 'system',
    description: 'High-throughput edge stream ingesting GPS coordinates, speed, and battery health.',
    x: 60,
    y: 340,
    width: 140,
    height: 140,
    color: 'border-purple-500/50 bg-purple-500/10 text-purple-400',
  },
  {
    id: 'act-3',
    type: 'actor',
    subType: 'external',
    title: 'PostgreSQL DES_BASE',
    roleType: 'external',
    description: 'Authoritative relational database persistence schema storing state facts and telemetry.',
    x: 1040,
    y: 220,
    width: 150,
    height: 140,
    color: 'border-emerald-500/50 bg-emerald-500/10 text-emerald-400',
  },
  // 3. Use Cases (Inside Boundary)
  {
    id: 'uc-101',
    type: 'use_case',
    code: 'UC-001',
    title: 'Authenticate Operator',
    description: 'Validates operator credentials, JWT token signature, and RBAC permissions in DES_BASE.',
    x: 340,
    y: 100,
    width: 250,
    height: 84,
    primaryActorId: 'act-1',
    preconditions: 'Operator has active profile in PostgreSQL schema DES_BASE.',
    postconditions: 'Session token granted with telemetry viewer role.',
    mainFlow: [
      '1. Operator inputs email and passphrase.',
      '2. System validates credentials against DES_BASE.designer_apps.',
      '3. JWT session token generated with 8-hour expiry.',
    ],
    extensions: ['2a. Invalid password returns 401 Unauthorized.'],
    color: 'border-cyan-500/40 bg-cyan-500/10 text-cyan-300',
  },
  {
    id: 'uc-102',
    type: 'use_case',
    code: 'UC-002',
    title: 'Ingest Vehicle Telemetry Stream',
    description: 'Receives real-time IoT sensor readings from autonomous vehicle telemetry stream.',
    x: 340,
    y: 350,
    width: 250,
    height: 84,
    primaryActorId: 'act-2',
    preconditions: 'MQTT/gRPC stream connected to edge gateway.',
    postconditions: 'Telemetry packets parsed and queued for persistence.',
    mainFlow: [
      '1. Telematics stream pushes 100Hz binary packet.',
      '2. Schema validator parses sensor payload.',
      '3. Event dispatched to AST processing queue.',
    ],
    color: 'border-purple-500/40 bg-purple-500/10 text-purple-300',
  },
  {
    id: 'uc-103',
    type: 'use_case',
    code: 'UC-003',
    title: 'Calculate Route Optimization',
    description: 'Computes dynamic vehicle dispatch routing based on live traffic and SLA battery reserves.',
    x: 650,
    y: 180,
    width: 250,
    height: 84,
    primaryActorId: 'act-1',
    preconditions: 'At least 2 active dispatch destinations in route queue.',
    postconditions: 'Optimized waypoint trajectory rendered on Visual Canvas Grid.',
    mainFlow: [
      '1. Operator selects fleet dispatch quadrant.',
      '2. Optimization solver computes TSP trajectory graph.',
      '3. Waypoint coordinates dispatched to vehicle CAN bus.',
    ],
    color: 'border-amber-500/40 bg-amber-500/10 text-amber-300',
  },
  {
    id: 'uc-104',
    type: 'use_case',
    code: 'UC-004',
    title: 'Persist Sensor Logs to DES_BASE',
    description: 'Authoritative batch insert of validated sensor telemetry into schema DES_BASE.',
    x: 650,
    y: 340,
    width: 250,
    height: 84,
    primaryActorId: 'act-3',
    preconditions: 'pgx connection pool healthy (25 max connections).',
    postconditions: 'Log records committed to PostgreSQL DES_BASE.',
    mainFlow: [
      '1. Micro-batch worker collects buffered sensor events.',
      '2. Executes COPY / INSERT INTO DES_BASE.',
      '3. Returns execution telemetry to bottom console.',
    ],
    color: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300',
  },
];

const DEFAULT_FLEET_EDGES: UseCaseEdge[] = [
  { id: 'edge-1', sourceId: 'act-1', targetId: 'uc-101', relType: 'association' },
  { id: 'edge-2', sourceId: 'act-1', targetId: 'uc-103', relType: 'association' },
  { id: 'edge-3', sourceId: 'act-2', targetId: 'uc-102', relType: 'association' },
  { id: 'edge-4', sourceId: 'uc-101', targetId: 'uc-103', relType: 'include', label: '<<include>>' },
  { id: 'edge-5', sourceId: 'uc-102', targetId: 'uc-104', relType: 'include', label: '<<include>>' },
  { id: 'edge-6', sourceId: 'uc-104', targetId: 'act-3', relType: 'association' },
];

export const UseCaseDiagramCanvas: React.FC = () => {
  const { currentApp } = useLayout();
  const [nodes, setNodes] = useState<UseCaseNode[]>(DEFAULT_FLEET_NODES);
  const [edges, setEdges] = useState<UseCaseEdge[]>(DEFAULT_FLEET_EDGES);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [notification, setNotification] = useState<string | null>(null);

  // Connector Creation State
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const [connectingSourceId, setConnectingSourceId] = useState<string | null>(null);
  const [connectorType, setConnectorType] = useState<'association' | 'include' | 'extend' | 'generalization'>('association');

  // Node Dragging State
  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Context Menu State
  const [contextMenu, setContextMenu] = useState<{
    visible: boolean;
    x: number;
    y: number;
    node: UseCaseNode | null;
  }>({ visible: false, x: 0, y: 0, node: null });

  // Centered Details Modal State
  const [detailModalNode, setDetailModalNode] = useState<UseCaseNode | null>(null);
  const [editTitle, setEditTitle] = useState<string>('');
  const [editCode, setEditCode] = useState<string>('');
  const [editDescription, setEditDescription] = useState<string>('');
  const [editPreconditions, setEditPreconditions] = useState<string>('');
  const [editPostconditions, setEditPostconditions] = useState<string>('');
  const [editMainFlow, setEditMainFlow] = useState<string>('');
  const [editExtensions, setEditExtensions] = useState<string>('');

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  // Close context menu on click outside
  useEffect(() => {
    const handleClickOutside = () => {
      if (contextMenu.visible) {
        setContextMenu({ visible: false, x: 0, y: 0, node: null });
      }
    };
    window.addEventListener('click', handleClickOutside);
    return () => window.removeEventListener('click', handleClickOutside);
  }, [contextMenu.visible]);

  // Load from backend on mount or app change
  useEffect(() => {
    const loadData = async () => {
      const appId = currentApp?.id || 'fleet-logistics';
      try {
        const [ucRes, actRes, diagRes] = await Promise.all([
          api.listUseCases(appId).catch(() => []),
          api.listActors(appId).catch(() => []),
          api.getDiagramLayout(appId).catch(() => null),
        ]);

        if (ucRes && ucRes.length > 0) {
          const loadedNodes: UseCaseNode[] = [];
          loadedNodes.push({
            id: 'elem-boundary-1',
            type: 'boundary',
            title: `${currentApp?.name || 'Fleet Logistics'} System Boundary`,
            description: 'Encapsulating primary use cases and system actors',
            x: 280,
            y: 40,
            width: 680,
            height: 520,
            color: 'border-border/80 bg-card/40',
          });

          actRes.forEach((a: any, idx: number) => {
            loadedNodes.push({
              id: a.id,
              type: 'actor',
              subType: a.role_type,
              roleType: a.role_type,
              title: a.name,
              description: a.description || '',
              x: a.role_type === 'external' ? 1040 : 60,
              y: 120 + idx * 180,
              width: 140,
              height: 140,
              color:
                a.role_type === 'external'
                  ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-400'
                  : a.role_type === 'system'
                  ? 'border-purple-500/50 bg-purple-500/10 text-purple-400'
                  : 'border-primary/50 bg-primary/10 text-primary',
            });
          });

          ucRes.forEach((u: any, idx: number) => {
            loadedNodes.push({
              id: u.id,
              type: 'use_case',
              code: u.code || `UC-00${idx + 1}`,
              title: u.title,
              description: u.description || '',
              primaryActorId: u.primary_actor_id,
              preconditions: u.preconditions,
              postconditions: u.postconditions,
              mainFlow: u.main_flow || [],
              extensions: u.extensions || [],
              x: idx % 2 === 0 ? 340 : 650,
              y: 100 + Math.floor(idx / 2) * 240,
              width: 250,
              height: 84,
              color:
                idx % 3 === 0
                  ? 'border-cyan-500/40 bg-cyan-500/10 text-cyan-300'
                  : idx % 3 === 1
                  ? 'border-purple-500/40 bg-purple-500/10 text-purple-300'
                  : 'border-amber-500/40 bg-amber-500/10 text-amber-300',
            });
          });

          setNodes(loadedNodes);
        }
      } catch (err) {
        console.error('Failed to load use case data', err);
      }
    };
    loadData();
  }, [currentApp]);

  // Handle Right Click Context Menu
  const handleContextMenu = (e: React.MouseEvent, node: UseCaseNode) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedNodeId(node.id);
    setContextMenu({
      visible: true,
      x: e.clientX,
      y: e.clientY,
      node,
    });
  };

  // Open Centered Details Modal
  const handleOpenDetails = (node: UseCaseNode) => {
    setDetailModalNode(node);
    setEditTitle(node.title);
    setEditCode(node.code || '');
    setEditDescription(node.description || '');
    setEditPreconditions(node.preconditions || '');
    setEditPostconditions(node.postconditions || '');
    setEditMainFlow(node.mainFlow ? node.mainFlow.join('\n') : '');
    setEditExtensions(node.extensions ? node.extensions.join('\n') : '');
    setContextMenu({ visible: false, x: 0, y: 0, node: null });
  };

  // Save Modal Changes
  const handleSaveDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!detailModalNode) return;

    const updatedNode: UseCaseNode = {
      ...detailModalNode,
      title: editTitle.trim(),
      code: editCode.trim(),
      description: editDescription.trim(),
      preconditions: editPreconditions.trim(),
      postconditions: editPostconditions.trim(),
      mainFlow: editMainFlow ? editMainFlow.split('\n').filter((l) => l.trim() !== '') : [],
      extensions: editExtensions ? editExtensions.split('\n').filter((l) => l.trim() !== '') : [],
    };

    setNodes((prev) => prev.map((n) => (n.id === updatedNode.id ? updatedNode : n)));
    setDetailModalNode(null);

    // Persist to PostgreSQL uc_ tables
    const appId = currentApp?.id || 'fleet-logistics';
    if (updatedNode.type === 'use_case') {
      await api.saveUseCase(appId, {
        id: updatedNode.id,
        code: updatedNode.code,
        title: updatedNode.title,
        description: updatedNode.description,
        preconditions: updatedNode.preconditions,
        postconditions: updatedNode.postconditions,
        main_flow: updatedNode.mainFlow,
        extensions: updatedNode.extensions,
      });
      showToast(`Saved ${updatedNode.code || 'Use Case'} to uc_use_cases in DES_BASE!`);
    } else if (updatedNode.type === 'actor') {
      await api.saveActor(appId, {
        id: updatedNode.id,
        name: updatedNode.title,
        role_type: updatedNode.roleType || 'primary',
        description: updatedNode.description,
      });
      showToast(`Saved Actor to uc_actors in DES_BASE!`);
    }
  };

  // ── Node Click & Connector Creation ──
  const handleNodeClick = (node: UseCaseNode) => {
    if (isConnecting && connectingSourceId) {
      if (connectingSourceId !== node.id) {
        // Create new connector line
        const newEdge: UseCaseEdge = {
          id: `edge-${Date.now().toString().slice(-5)}`,
          sourceId: connectingSourceId,
          targetId: node.id,
          relType: connectorType,
          label:
            connectorType === 'include'
              ? '<<include>>'
              : connectorType === 'extend'
              ? '<<extend>>'
              : undefined,
        };
        setEdges((prev) => [...prev, newEdge]);
        showToast(`Connected ${connectingSourceId} ➔ ${node.id} (${connectorType})`);
      }
      setIsConnecting(false);
      setConnectingSourceId(null);
    } else {
      setSelectedNodeId(node.id);
      setSelectedEdgeId(null);
    }
  };

  const handleStartConnector = (e: React.MouseEvent, node: UseCaseNode) => {
    e.stopPropagation();
    setIsConnecting(true);
    setConnectingSourceId(node.id);
    showToast(`Click any target node to create a ${connectorType} connector!`);
  };

  const handleDeleteSelectedEdge = () => {
    if (!selectedEdgeId) return;
    setEdges((prev) => prev.filter((edge) => edge.id !== selectedEdgeId));
    setSelectedEdgeId(null);
    showToast('Connector line deleted.');
  };

  // Node Dragging Mouse Handlers
  const handleMouseDownNode = (e: React.MouseEvent, node: UseCaseNode) => {
    if (isConnecting) return;
    e.stopPropagation();
    setSelectedNodeId(node.id);
    setSelectedEdgeId(null);
    setDraggingNodeId(node.id);
    setDragOffset({
      x: e.clientX - node.x,
      y: e.clientY - node.y,
    });
  };

  const handleMouseMoveCanvas = (e: React.MouseEvent) => {
    if (!draggingNodeId) return;
    const newX = Math.max(20, Math.round((e.clientX - dragOffset.x) / 20) * 20);
    const newY = Math.max(20, Math.round((e.clientY - dragOffset.y) / 20) * 20);

    setNodes((prev) =>
      prev.map((n) => (n.id === draggingNodeId ? { ...n, x: newX, y: newY } : n))
    );
  };

  const handleMouseUpCanvas = () => {
    if (draggingNodeId) {
      setDraggingNodeId(null);
    }
  };

  // Save Diagram Layout Coordinates & Edges to diag_ tables
  const handleSaveDiagram = async () => {
    setIsSaving(true);
    const appId = currentApp?.id || 'fleet-logistics';
    try {
      const diagElements = nodes.map((n) => ({
        id: `elem-${n.id}`,
        diagram_id: `diag-${appId}`,
        entity_id: n.id,
        entity_type: n.type,
        pos_x: n.x,
        pos_y: n.y,
        width: n.width,
        height: n.height,
        style_props: { color: n.color },
      }));

      await api.saveDiagramLayout(appId, {
        layout: {
          id: `diag-${appId}`,
          app_id: appId,
          diagram_type: 'use_case',
          name: `${currentApp?.name || 'Fleet Logistics'} Use Case Diagram`,
          viewport_zoom: 1.0,
          viewport_pan_x: 0,
          viewport_pan_y: 0,
        },
        elements: diagElements,
      });

      showToast(`Diagram and ${edges.length} connectors saved to PostgreSQL DES_BASE!`);
    } catch (err: any) {
      showToast(`Error saving diagram: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  // Handle Drag & Drop of new UML components from toolbox
  const handleDropCanvas = (e: React.DragEvent) => {
    e.preventDefault();
    const dataStr = e.dataTransfer.getData('application/json');
    if (!dataStr) return;

    try {
      const comp = JSON.parse(dataStr);
      const rect = e.currentTarget.getBoundingClientRect();
      const dropX = Math.round((e.clientX - rect.left) / 20) * 20;
      const dropY = Math.round((e.clientY - rect.top) / 20) * 20;

      const newNode: UseCaseNode = {
        id: `node-${Date.now().toString().slice(-5)}`,
        type: comp.type,
        subType: comp.subType,
        title: comp.defaultProps?.name || comp.defaultProps?.title || comp.label,
        code: comp.defaultProps?.code,
        roleType: comp.defaultProps?.roleType,
        description: comp.description || '',
        x: Math.max(20, dropX),
        y: Math.max(20, dropY),
        width: comp.defaultWidth || 200,
        height: comp.defaultHeight || 80,
        color: comp.color,
      };

      setNodes((prev) => [...prev, newNode]);
      showToast(`Added ${newNode.title} to Use Case canvas!`);
    } catch (err) {
      console.error('Failed to parse dropped UML component', err);
    }
  };

  return (
    <div
      className="flex-1 flex flex-col h-full bg-background select-none overflow-hidden relative"
      onMouseMove={handleMouseMoveCanvas}
      onMouseUp={handleMouseUpCanvas}
    >
      {/* ── 1. Top Toolbar: Use Case Actions & Connector Selector ── */}
      <div className="h-14 border-b border-border bg-card/80 backdrop-blur-md px-4 flex items-center justify-between shrink-0 z-20 gap-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-primary/10 text-primary">
              <GitBranch className="w-4 h-4" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-foreground">
                  {currentApp ? currentApp.name : 'Fleet Logistics Studio'} • Use Case Diagram
                </span>
                <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-muted text-muted-foreground border border-border">
                  uc_ & diag_ tables
                </span>
              </div>
              <p className="text-[10px] text-muted-foreground">
                Drag nodes to reposition. Click connector handle to link nodes. Right-click for specs modal.
              </p>
            </div>
          </div>

          <div className="w-px h-6 bg-border mx-1" />

          {/* Connector Toolbar */}
          <div className="flex items-center gap-1 bg-muted/60 p-1 rounded-xl border border-border">
            <span className="text-[10px] font-bold text-muted-foreground px-1 uppercase tracking-wider">
              Connector:
            </span>
            <select
              value={connectorType}
              onChange={(e: any) => setConnectorType(e.target.value)}
              className="bg-card border border-border rounded-lg px-2 py-0.5 text-xs text-foreground font-semibold focus:outline-hidden"
            >
              <option value="association">Association (Solid)</option>
              <option value="include">&lt;&lt;include&gt;&gt; (Dashed + Arrow)</option>
              <option value="extend">&lt;&lt;extend&gt;&gt; (Dashed + Extension)</option>
              <option value="generalization">Generalization (Inherits)</option>
            </select>

            {isConnecting && (
              <button
                type="button"
                onClick={() => {
                  setIsConnecting(false);
                  setConnectingSourceId(null);
                }}
                className="px-2 py-0.5 bg-rose-500/20 text-rose-300 border border-rose-500/40 rounded-lg text-xs font-bold transition-all cursor-pointer animate-pulse"
              >
                Cancel Linking
              </button>
            )}
          </div>

          {selectedEdgeId && (
            <button
              type="button"
              onClick={handleDeleteSelectedEdge}
              className="flex items-center gap-1 px-2.5 py-1 text-xs text-destructive hover:bg-destructive/10 rounded-lg transition-colors cursor-pointer"
              title="Delete Selected Connector Line"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete Connector</span>
            </button>
          )}
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
            onClick={handleSaveDiagram}
            disabled={isSaving}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-primary-foreground text-xs font-bold rounded-xl shadow-xs hover:bg-primary/90 transition-all cursor-pointer disabled:opacity-50"
            title="Save diagram coordinates & connectors to PostgreSQL diag_ tables"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{isSaving ? 'Saving...' : 'Save Diagram (diag_)'}</span>
          </button>
        </div>
      </div>

      {/* ── 2. Interactive SVG Canvas with Dot Grid ── */}
      <div
        className="flex-1 overflow-auto p-12 relative bg-background"
        style={{
          backgroundImage: 'radial-gradient(circle, var(--border) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDropCanvas}
        onClick={() => {
          setSelectedNodeId(null);
          setSelectedEdgeId(null);
        }}
      >
        {/* SVG Connector Lines */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
          <defs>
            <marker
              id="arrowhead-include"
              markerWidth="10"
              markerHeight="7"
              refX="9"
              refY="3.5"
              orient="auto"
            >
              <polygon points="0 0, 10 3.5, 0 7" fill="var(--primary)" />
            </marker>
            <marker
              id="arrowhead-extend"
              markerWidth="10"
              markerHeight="7"
              refX="9"
              refY="3.5"
              orient="auto"
            >
              <polygon points="0 0, 10 3.5, 0 7" fill="#a855f7" />
            </marker>
          </defs>
          {edges.map((edge) => {
            const src = nodes.find((n) => n.id === edge.sourceId);
            const tgt = nodes.find((n) => n.id === edge.targetId);
            if (!src || !tgt) return null;

            const x1 = src.x + src.width / 2;
            const y1 = src.y + src.height / 2;
            const x2 = tgt.x + tgt.width / 2;
            const y2 = tgt.y + tgt.height / 2;

            const isEdgeSelected = selectedEdgeId === edge.id;

            return (
              <g
                key={edge.id}
                className="cursor-pointer pointer-events-auto group"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedEdgeId(edge.id);
                  setSelectedNodeId(null);
                }}
              >
                {/* Wider invisible stroke for easy click hit test */}
                <line
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke="transparent"
                  strokeWidth="14"
                />
                <line
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke={
                    isEdgeSelected
                      ? 'var(--primary)'
                      : edge.relType === 'include'
                      ? 'var(--primary)'
                      : edge.relType === 'extend'
                      ? '#a855f7'
                      : 'var(--muted-foreground)'
                  }
                  strokeWidth={isEdgeSelected ? '3' : '2'}
                  strokeDasharray={
                    edge.relType === 'include' || edge.relType === 'extend' ? '5,5' : 'none'
                  }
                  strokeOpacity={isEdgeSelected ? '1' : '0.75'}
                  markerEnd={
                    edge.relType === 'include'
                      ? 'url(#arrowhead-include)'
                      : edge.relType === 'extend'
                      ? 'url(#arrowhead-extend)'
                      : undefined
                  }
                />
                {edge.label && (
                  <text
                    x={(x1 + x2) / 2}
                    y={(y1 + y2) / 2 - 8}
                    fill={edge.relType === 'extend' ? '#c084fc' : 'var(--primary)'}
                    fontSize="10"
                    fontWeight="bold"
                    fontFamily="monospace"
                    textAnchor="middle"
                    className="select-none"
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
          const isConnectingSource = connectingSourceId === node.id;

          // Boundary Node
          if (node.type === 'boundary') {
            return (
              <div
                key={node.id}
                onContextMenu={(e) => handleContextMenu(e, node)}
                onMouseDown={(e) => handleMouseDownNode(e, node)}
                style={{
                  transform: `translate3d(${node.x}px, ${node.y}px, 0)`,
                  width: `${node.width}px`,
                  height: `${node.height}px`,
                }}
                className={`absolute rounded-3xl border-2 border-dashed border-border/80 bg-card/30 p-4 transition-all z-0 cursor-move ${
                  isSelected ? 'ring-2 ring-primary border-primary' : ''
                }`}
              >
                <div className="flex items-center justify-between border-b border-border/50 pb-2">
                  <span className="text-xs font-bold font-mono uppercase tracking-widest text-muted-foreground">
                    {node.title}
                  </span>
                  <span className="text-[10px] font-mono text-primary font-bold">
                    SYSTEM BOUNDARY
                  </span>
                </div>
              </div>
            );
          }

          // Actor Node
          if (node.type === 'actor') {
            const Icon = node.roleType === 'system' ? Cpu : node.roleType === 'external' ? Database : User;
            return (
              <div
                key={node.id}
                onContextMenu={(e) => handleContextMenu(e, node)}
                onDoubleClick={() => handleOpenDetails(node)}
                onMouseDown={(e) => handleMouseDownNode(e, node)}
                onClick={(e) => {
                  e.stopPropagation();
                  handleNodeClick(node);
                }}
                style={{
                  transform: `translate3d(${node.x}px, ${node.y}px, 0)`,
                  width: `${node.width}px`,
                  height: `${node.height}px`,
                }}
                className={`absolute rounded-2xl border p-3 flex flex-col items-center justify-between text-center transition-all cursor-move shadow-md z-10 group ${
                  node.color || 'border-primary bg-primary/10'
                } ${
                  isConnectingSource
                    ? 'ring-4 ring-primary animate-pulse'
                    : isSelected
                    ? 'ring-2 ring-primary scale-105 shadow-xl'
                    : 'hover:border-primary'
                }`}
              >
                {/* Connector Anchor Handle */}
                <button
                  type="button"
                  onClick={(e) => handleStartConnector(e, node)}
                  className="absolute -right-2.5 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 hover:scale-125 transition-all shadow-md cursor-pointer z-30"
                  title="Click to draw connector from this actor"
                >
                  <Link className="w-3 h-3" />
                </button>

                <div className="w-10 h-10 rounded-full bg-background/80 border border-border flex items-center justify-center shadow-xs">
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-xs leading-tight text-foreground">{node.title}</div>
                  <div className="text-[9px] font-mono uppercase tracking-wider text-muted-foreground mt-0.5">
                    «{node.roleType || 'actor'}»
                  </div>
                </div>
                <div className="text-[9px] text-muted-foreground/80 truncate max-w-full">
                  uc_actors
                </div>
              </div>
            );
          }

          // Use Case Bubble Node
          return (
            <div
              key={node.id}
              onContextMenu={(e) => handleContextMenu(e, node)}
              onDoubleClick={() => handleOpenDetails(node)}
              onMouseDown={(e) => handleMouseDownNode(e, node)}
              onClick={(e) => {
                e.stopPropagation();
                handleNodeClick(node);
              }}
              style={{
                transform: `translate3d(${node.x}px, ${node.y}px, 0)`,
                width: `${node.width}px`,
                height: `${node.height}px`,
                borderRadius: '50px',
              }}
              className={`absolute border-2 px-5 py-2 flex flex-col items-center justify-center text-center transition-all cursor-move shadow-sm z-10 group ${
                node.color || 'border-cyan-500/40 bg-cyan-500/10 text-cyan-300'
              } ${
                isConnectingSource
                  ? 'ring-4 ring-primary animate-pulse'
                  : isSelected
                  ? 'ring-2 ring-primary border-primary scale-105 shadow-lg'
                  : 'hover:scale-102'
              }`}
            >
              {/* Connector Anchor Handles (Left and Right) */}
              <button
                type="button"
                onClick={(e) => handleStartConnector(e, node)}
                className="absolute -right-2 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-[10px] opacity-0 group-hover:opacity-100 hover:scale-125 transition-all shadow-md cursor-pointer z-30"
                title="Click to draw connector from this use case"
              >
                <Link className="w-2.5 h-2.5" />
              </button>

              <button
                type="button"
                onClick={(e) => handleStartConnector(e, node)}
                className="absolute -left-2 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-[10px] opacity-0 group-hover:opacity-100 hover:scale-125 transition-all shadow-md cursor-pointer z-30"
                title="Click to draw connector from this use case"
              >
                <Link className="w-2.5 h-2.5" />
              </button>

              {node.code && (
                <span className="text-[9px] font-mono font-bold uppercase tracking-wider opacity-80">
                  {node.code}
                </span>
              )}
              <span className="text-xs font-bold text-foreground leading-tight">{node.title}</span>
              <span className="text-[8px] font-mono text-muted-foreground opacity-70">
                uc_use_cases
              </span>
            </div>
          );
        })}
      </div>

      {/* ── 3. Custom Right-Click Context Menu ── */}
      {contextMenu.visible && contextMenu.node && (
        <div
          style={{ top: `${contextMenu.y}px`, left: `${contextMenu.x}px` }}
          className="fixed bg-card/95 backdrop-blur-md border border-border rounded-xl shadow-2xl p-1.5 z-50 min-w-[200px] text-xs animate-in fade-in zoom-in-95 duration-100"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="px-2.5 py-1 text-[10px] font-bold text-muted-foreground uppercase border-b border-border/60 mb-1">
            {contextMenu.node.title}
          </div>

          <button
            type="button"
            onClick={() => handleOpenDetails(contextMenu.node!)}
            className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-primary/10 hover:text-primary transition-colors cursor-pointer text-left font-semibold"
          >
            <Edit3 className="w-3.5 h-3.5 text-primary" />
            <span>Edit Specifications (Modal)</span>
          </button>

          <button
            type="button"
            onClick={(e) => {
              handleStartConnector(e, contextMenu.node!);
              setContextMenu({ visible: false, x: 0, y: 0, node: null });
            }}
            className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-muted transition-colors cursor-pointer text-left font-semibold text-foreground"
          >
            <Link className="w-3.5 h-3.5 text-primary" />
            <span>Draw Connector From Node</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setNodes((prev) => prev.filter((n) => n.id !== contextMenu.node!.id));
              setEdges((prev) =>
                prev.filter(
                  (ed) => ed.sourceId !== contextMenu.node!.id && ed.targetId !== contextMenu.node!.id
                )
              );
              setContextMenu({ visible: false, x: 0, y: 0, node: null });
              showToast(`Removed element from canvas.`);
            }}
            className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-destructive/10 text-destructive transition-colors cursor-pointer text-left font-semibold"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete Element</span>
          </button>
        </div>
      )}

      {/* ── 4. Centered Modal: Use Case & Actor Specifications ── */}
      {detailModalNode && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-4 border-b border-border flex items-center justify-between bg-muted/40 shrink-0">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
                  {detailModalNode.type === 'actor' ? <User className="w-4 h-4" /> : <Circle className="w-4 h-4" />}
                </div>
                <div>
                  <h3 className="font-bold text-sm text-foreground">
                    {detailModalNode.type === 'actor' ? 'Actor Specifications' : 'Use Case Details & Flow'}
                  </h3>
                  <p className="text-[10px] font-mono text-muted-foreground">
                    Authoritative PostgreSQL Table:{' '}
                    <strong className="text-primary">
                      {detailModalNode.type === 'actor' ? 'DES_BASE.uc_actors' : 'DES_BASE.uc_use_cases'}
                    </strong>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setDetailModalNode(null)}
                className="p-1 text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form Content */}
            <form onSubmit={handleSaveDetails} className="p-6 space-y-4 overflow-y-auto flex-1">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-foreground mb-1">
                    {detailModalNode.type === 'actor' ? 'Actor Name *' : 'Use Case Title *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="w-full px-3 py-2 bg-background border border-border rounded-xl text-xs text-foreground focus:outline-hidden focus:ring-1 focus:ring-primary"
                  />
                </div>

                {detailModalNode.type === 'use_case' && (
                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1">Code / Ref</label>
                    <input
                      type="text"
                      value={editCode}
                      onChange={(e) => setEditCode(e.target.value)}
                      placeholder="e.g. UC-001"
                      className="w-full px-3 py-2 bg-background border border-border rounded-xl text-xs font-mono text-foreground focus:outline-hidden focus:ring-1 focus:ring-primary"
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">Description & Scope</label>
                <textarea
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 bg-background border border-border rounded-xl text-xs text-foreground focus:outline-hidden focus:ring-1 focus:ring-primary resize-none"
                />
              </div>

              {detailModalNode.type === 'use_case' && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-foreground mb-1">Preconditions</label>
                      <textarea
                        value={editPreconditions}
                        onChange={(e) => setEditPreconditions(e.target.value)}
                        rows={2}
                        placeholder="State requirements prior to execution..."
                        className="w-full px-3 py-2 bg-background border border-border rounded-xl text-xs text-foreground focus:outline-hidden focus:ring-1 focus:ring-primary resize-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-foreground mb-1">Postconditions</label>
                      <textarea
                        value={editPostconditions}
                        onChange={(e) => setEditPostconditions(e.target.value)}
                        rows={2}
                        placeholder="State changes committed after execution..."
                        className="w-full px-3 py-2 bg-background border border-border rounded-xl text-xs text-foreground focus:outline-hidden focus:ring-1 focus:ring-primary resize-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1">
                      Main Scenario (Step-by-Step Flow, one per line)
                    </label>
                    <textarea
                      value={editMainFlow}
                      onChange={(e) => setEditMainFlow(e.target.value)}
                      rows={3}
                      placeholder="1. Operator inputs email..."
                      className="w-full px-3 py-2 bg-background border border-border rounded-xl text-xs font-mono text-foreground focus:outline-hidden focus:ring-1 focus:ring-primary resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1">
                      Exception / Alternative Flows (one per line)
                    </label>
                    <textarea
                      value={editExtensions}
                      onChange={(e) => setEditExtensions(e.target.value)}
                      rows={2}
                      placeholder="2a. Invalid password returns 401..."
                      className="w-full px-3 py-2 bg-background border border-border rounded-xl text-xs font-mono text-foreground focus:outline-hidden focus:ring-1 focus:ring-primary resize-none"
                    />
                  </div>
                </>
              )}

              {/* Persistence Notice */}
              <div className="p-3 bg-muted/40 rounded-xl border border-border/80 text-[11px] text-muted-foreground flex items-center justify-between">
                <span>Database persistence:</span>
                <strong className="font-mono text-primary">
                  {detailModalNode.type === 'actor' ? 'DES_BASE.uc_actors' : 'DES_BASE.uc_use_cases'}
                </strong>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setDetailModalNode(null)}
                  className="px-4 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground rounded-xl hover:bg-muted cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer"
                >
                  Save to PostgreSQL (uc_)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UseCaseDiagramCanvas;
