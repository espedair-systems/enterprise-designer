import React, { useState, useEffect } from 'react';
import {
  Share2,
  Layers,
  Compass,
  CheckCircle2,
  Save,
  Plus,
  Trash2,
  Edit3,
  X,
  Link,
  Sparkles,
  Clock,
  Activity,
} from 'lucide-react';
import { useLayout } from '../shell/LayoutContext';

export interface BehavioralNode {
  id: string;
  type: string;
  title: string;
  subTitle?: string;
  attributes?: string[];
  x: number;
  y: number;
  width: number;
  height: number;
  color?: string;
}

export interface BehavioralEdge {
  id: string;
  sourceId: string;
  targetId: string;
  label?: string;
  sequenceNumber?: string;
}

const DEFAULT_BEHAVIORAL_MODELS: Record<string, { nodes: BehavioralNode[]; edges: BehavioralEdge[]; title: string; desc: string }> = {
  communication_diagram: {
    title: 'Communication Diagram',
    desc: 'Object collaboration network with numbered chronological messages passing across links.',
    nodes: [
      {
        id: 'comm-1',
        type: 'object',
        title: ':FleetOperator',
        attributes: ['Role: Controller'],
        x: 80,
        y: 120,
        width: 200,
        height: 90,
        color: 'border-primary/60 bg-card',
      },
      {
        id: 'comm-2',
        type: 'object',
        title: ':ApiGateway',
        attributes: ['Port 8088 Router'],
        x: 440,
        y: 120,
        width: 220,
        height: 90,
        color: 'border-cyan-500/60 bg-card',
      },
      {
        id: 'comm-3',
        type: 'object',
        title: ':PostgresRepo',
        attributes: ['schema: DES_BASE'],
        x: 800,
        y: 120,
        width: 220,
        height: 90,
        color: 'border-emerald-500/60 bg-card',
      },
    ],
    edges: [
      { id: 'ce-1', sourceId: 'comm-1', targetId: 'comm-2', sequenceNumber: '1.0', label: '1.0: login(jwt) ➔' },
      { id: 'ce-2', sourceId: 'comm-2', targetId: 'comm-3', sequenceNumber: '1.1', label: '1.1: queryApps() ➔' },
      { id: 'ce-3', sourceId: 'comm-3', targetId: 'comm-2', sequenceNumber: '1.2', label: '1.2: return 200 OK ➔' },
    ],
  },
  interaction_overview_diagram: {
    title: 'Interaction Overview Diagram',
    desc: 'High-level macro control flow combining decision nodes and encapsulated sequence diagram frames.',
    nodes: [
      {
        id: 'io-1',
        type: 'frame',
        title: 'sd IngestTelematicsStream',
        subTitle: 'Sequence Frame 1',
        attributes: ['Lifelines: [Operator, EdgeBroker]', 'Ref: TelematicsIngestionFlow'],
        x: 100,
        y: 80,
        width: 340,
        height: 160,
        color: 'border-purple-500/60 bg-card',
      },
      {
        id: 'io-2',
        type: 'frame',
        title: 'sd PersistToPostgreSQL',
        subTitle: 'Sequence Frame 2',
        attributes: ['Lifelines: [Worker, DES_BASE]', 'Ref: BatchPersistFlow'],
        x: 580,
        y: 80,
        width: 340,
        height: 160,
        color: 'border-emerald-500/60 bg-card',
      },
    ],
    edges: [{ id: 'ioe-1', sourceId: 'io-1', targetId: 'io-2', label: '[buffer_ready]' }],
  },
  timing_diagram: {
    title: 'Timing Diagram',
    desc: 'Waveform timeline transitions, state durations, and clock execution constraints.',
    nodes: [
      {
        id: 'tm-1',
        type: 'timeline',
        title: 'Vehicle CAN Bus Connection',
        subTitle: 'State Waveform',
        attributes: ['State: Disconnected (0ms - 20ms)', 'State: Handshake (20ms - 45ms)', 'State: Streaming (45ms - 100ms)'],
        x: 100,
        y: 80,
        width: 820,
        height: 160,
        color: 'border-cyan-500/60 bg-card',
      },
      {
        id: 'tm-2',
        type: 'timeline',
        title: 'PostgreSQL DES_BASE Buffer',
        subTitle: 'State Waveform',
        attributes: ['State: Idle (0ms - 45ms)', 'State: Ingesting (45ms - 80ms)', 'State: Commit TX (80ms - 100ms)'],
        x: 100,
        y: 280,
        width: 820,
        height: 160,
        color: 'border-emerald-500/60 bg-card',
      },
    ],
    edges: [],
  },
};

export const BehavioralDiagramsCanvas: React.FC = () => {
  const { currentApp, canvasMode } = useLayout();
  const activeConfig = DEFAULT_BEHAVIORAL_MODELS[canvasMode] || DEFAULT_BEHAVIORAL_MODELS.communication_diagram;

  const [nodes, setNodes] = useState<BehavioralNode[]>(activeConfig.nodes);
  const [edges, setEdges] = useState<BehavioralEdge[]>(activeConfig.edges);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  useEffect(() => {
    const cfg = DEFAULT_BEHAVIORAL_MODELS[canvasMode] || DEFAULT_BEHAVIORAL_MODELS.communication_diagram;
    setNodes(cfg.nodes);
    setEdges(cfg.edges);
    setSelectedNodeId(null);
  }, [canvasMode]);

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-background select-none overflow-hidden relative">
      {/* Top Header Toolbar */}
      <div className="h-14 border-b border-border bg-card/80 backdrop-blur-md px-4 flex items-center justify-between shrink-0 z-20">
        <div className="flex items-center gap-3">
          <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
            <Share2 className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-foreground">
                {currentApp ? currentApp.name : 'Fleet Logistics Studio'} • {activeConfig.title}
              </span>
              <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-muted text-muted-foreground border border-border">
                Behavioral Diagram
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
            <marker id="beh-arrow" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
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

            return (
              <g key={edge.id}>
                <line
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke="var(--primary)"
                  strokeWidth="2"
                  markerEnd="url(#beh-arrow)"
                />
                {edge.label && (
                  <text
                    x={(x1 + x2) / 2}
                    y={(y1 + y2) / 2 - 8}
                    fill="var(--primary)"
                    fontSize="11"
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
              style={{
                transform: `translate3d(${node.x}px, ${node.y}px, 0)`,
                width: `${node.width}px`,
                height: `${node.height}px`,
              }}
              className={`absolute rounded-xl border-2 p-3 overflow-hidden shadow-md flex flex-col justify-between transition-all cursor-pointer z-10 ${
                node.color || 'border-primary bg-card'
              } ${isSelected ? 'ring-2 ring-primary scale-105 shadow-xl' : 'hover:scale-102'}`}
            >
              <div className="flex items-center justify-between border-b border-border/50 pb-1">
                <span className="font-bold text-xs text-foreground">{node.title}</span>
                {node.subTitle && (
                  <span className="text-[9px] font-mono text-muted-foreground">{node.subTitle}</span>
                )}
              </div>

              {node.attributes && (
                <div className="space-y-1 text-[10px] font-mono text-muted-foreground pt-2">
                  {node.attributes.map((attr, idx) => (
                    <div key={idx} className="truncate">
                      {attr}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default BehavioralDiagramsCanvas;
