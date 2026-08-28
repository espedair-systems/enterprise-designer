import React, { useState } from 'react';
import {
  Activity,
  Play,
  CheckCircle2,
  GitBranch,
  Split,
  Square,
  Trash2,
  Edit3,
  Plus,
  Save,
  X,
  Sparkles,
  Link,
} from 'lucide-react';
import { useLayout } from '../shell/LayoutContext';

export interface ActivityNode {
  id: string;
  type: 'start' | 'action' | 'decision' | 'fork' | 'join' | 'end';
  title: string;
  description?: string;
  guard?: string;
  x: number;
  y: number;
  width: number;
  height: number;
  lane: string;
  color?: string;
}

export interface ActivityEdge {
  id: string;
  sourceId: string;
  targetId: string;
  label?: string;
}

const DEFAULT_ACTIVITY_NODES: ActivityNode[] = [
  { id: 'act-start', type: 'start', title: 'Start', x: 80, y: 120, width: 36, height: 36, lane: 'Operator Lane', color: 'bg-emerald-500' },
  { id: 'act-1', type: 'action', title: 'Authenticate Operator Credentials', description: 'Validate JWT against DES_BASE', x: 160, y: 105, width: 220, height: 64, lane: 'Operator Lane', color: 'border-primary bg-primary/10' },
  { id: 'act-dec-1', type: 'decision', title: 'Valid Token?', guard: '[is_valid == true]', x: 430, y: 110, width: 54, height: 54, lane: 'Operator Lane', color: 'border-amber-500 bg-amber-500/10' },
  { id: 'act-2', type: 'action', title: 'Stream IoT Telemetry Packets', description: 'gRPC stream at 100Hz', x: 540, y: 105, width: 220, height: 64, lane: 'Telematics Lane', color: 'border-purple-500 bg-purple-500/10' },
  { id: 'act-3', type: 'action', title: 'Batch Write to DES_BASE', description: 'COPY INTO DES_BASE.sensor_logs', x: 820, y: 105, width: 220, height: 64, lane: 'Database Lane', color: 'border-emerald-500 bg-emerald-500/10' },
  { id: 'act-end', type: 'end', title: 'End', x: 1100, y: 120, width: 36, height: 36, lane: 'Database Lane', color: 'border-rose-500 bg-rose-500' },
];

const DEFAULT_ACTIVITY_EDGES: ActivityEdge[] = [
  { id: 'ae-1', sourceId: 'act-start', targetId: 'act-1' },
  { id: 'ae-2', sourceId: 'act-1', targetId: 'act-dec-1' },
  { id: 'ae-3', sourceId: 'act-dec-1', targetId: 'act-2', label: '[valid]' },
  { id: 'ae-4', sourceId: 'act-2', targetId: 'act-3' },
  { id: 'ae-5', sourceId: 'act-3', targetId: 'act-end' },
];

export const ActivityDiagramCanvas: React.FC = () => {
  const { currentApp } = useLayout();
  const [nodes, setNodes] = useState<ActivityNode[]>(DEFAULT_ACTIVITY_NODES);
  const [edges, setEdges] = useState<ActivityEdge[]>(DEFAULT_ACTIVITY_EDGES);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

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
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-foreground">
                {currentApp ? currentApp.name : 'Fleet Logistics Studio'} • UML Activity Diagram
              </span>
              <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-muted text-muted-foreground border border-border">
                Control Flow & Swimlanes
              </span>
            </div>
            <p className="text-[10px] text-muted-foreground">
              Actions, Decision nodes, Fork/Join synchronization bars, and execution flows.
            </p>
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
            onClick={() => showToast('Activity diagram saved to PostgreSQL DES_BASE!')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-primary-foreground text-xs font-bold rounded-xl shadow-xs hover:bg-primary/90 transition-all cursor-pointer"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Activity Diagram</span>
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
            <marker id="act-arrow" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
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
                  markerEnd="url(#act-arrow)"
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

          if (node.type === 'start') {
            return (
              <div
                key={node.id}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedNodeId(node.id);
                }}
                style={{ transform: `translate3d(${node.x}px, ${node.y}px, 0)` }}
                className="absolute w-9 h-9 rounded-full bg-emerald-500 shadow-md flex items-center justify-center cursor-pointer hover:scale-110 transition-transform z-10"
                title="Start Initial Node"
              >
                <div className="w-4 h-4 rounded-full bg-background" />
              </div>
            );
          }

          if (node.type === 'end') {
            return (
              <div
                key={node.id}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedNodeId(node.id);
                }}
                style={{ transform: `translate3d(${node.x}px, ${node.y}px, 0)` }}
                className="absolute w-9 h-9 rounded-full border-2 border-rose-500 bg-background shadow-md flex items-center justify-center cursor-pointer hover:scale-110 transition-transform z-10"
                title="Final End Node"
              >
                <div className="w-5 h-5 rounded-full bg-rose-500" />
              </div>
            );
          }

          if (node.type === 'decision') {
            return (
              <div
                key={node.id}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedNodeId(node.id);
                }}
                style={{
                  transform: `translate3d(${node.x}px, ${node.y}px, 0) rotate(45deg)`,
                  width: `${node.width}px`,
                  height: `${node.height}px`,
                }}
                className={`absolute border-2 border-amber-500 bg-amber-500/20 shadow-md flex items-center justify-center cursor-pointer transition-all z-10 ${
                  isSelected ? 'ring-2 ring-primary scale-110' : 'hover:scale-105'
                }`}
                title={node.title}
              />
            );
          }

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
              className={`absolute rounded-2xl border-2 p-3 flex flex-col justify-center transition-all cursor-pointer shadow-md z-10 ${
                node.color || 'border-primary bg-card'
              } ${isSelected ? 'ring-2 ring-primary scale-105 shadow-xl' : 'hover:scale-102'}`}
            >
              <div className="font-bold text-xs text-foreground leading-tight">{node.title}</div>
              {node.description && (
                <div className="text-[10px] text-muted-foreground mt-0.5">{node.description}</div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ActivityDiagramCanvas;
