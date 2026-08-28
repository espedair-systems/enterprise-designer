import React, { useState } from 'react';
import {
  Sliders,
  Play,
  CheckCircle2,
  GitBranch,
  Trash2,
  Edit3,
  Plus,
  Save,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { useLayout } from '../shell/LayoutContext';

export interface StateNode {
  id: string;
  type: 'initial' | 'state' | 'composite' | 'final';
  title: string;
  entryAction?: string;
  doActivity?: string;
  exitAction?: string;
  x: number;
  y: number;
  width: number;
  height: number;
  color?: string;
}

export interface StateTransition {
  id: string;
  sourceId: string;
  targetId: string;
  trigger: string;
  guard?: string;
  action?: string;
}

const DEFAULT_STATES: StateNode[] = [
  { id: 'st-init', type: 'initial', title: 'Initial', x: 60, y: 140, width: 32, height: 32, color: 'bg-primary' },
  {
    id: 'st-idle',
    type: 'state',
    title: 'Idle / Standby',
    entryAction: 'entry / initializeConnection()',
    doActivity: 'do / pollHeartbeat()',
    exitAction: 'exit / clearBuffer()',
    x: 160,
    y: 100,
    width: 240,
    height: 110,
    color: 'border-cyan-500/50 bg-cyan-500/10',
  },
  {
    id: 'st-streaming',
    type: 'state',
    title: 'Active Streaming',
    entryAction: 'entry / openGrpcStream()',
    doActivity: 'do / ingestPackets()',
    exitAction: 'exit / closeStream()',
    x: 480,
    y: 100,
    width: 240,
    height: 110,
    color: 'border-purple-500/50 bg-purple-500/10',
  },
  {
    id: 'st-persisting',
    type: 'state',
    title: 'PostgreSQL Committing',
    entryAction: 'entry / beginTx(DES_BASE)',
    doActivity: 'do / batchCopyRows()',
    exitAction: 'exit / commitTx()',
    x: 800,
    y: 100,
    width: 240,
    height: 110,
    color: 'border-emerald-500/50 bg-emerald-500/10',
  },
  { id: 'st-final', type: 'final', title: 'Terminated', x: 1120, y: 140, width: 32, height: 32, color: 'border-rose-500' },
];

const DEFAULT_TRANSITIONS: StateTransition[] = [
  { id: 'tr-1', sourceId: 'st-init', targetId: 'st-idle', trigger: 'boot()' },
  { id: 'tr-2', sourceId: 'st-idle', targetId: 'st-streaming', trigger: 'START_STREAM', guard: '[is_authorized]' },
  { id: 'tr-3', sourceId: 'st-streaming', targetId: 'st-persisting', trigger: 'BUFFER_FULL', action: 'flushBuffer()' },
  { id: 'tr-4', sourceId: 'st-persisting', targetId: 'st-idle', trigger: 'TX_COMMITTED' },
  { id: 'tr-5', sourceId: 'st-idle', targetId: 'st-final', trigger: 'SHUTDOWN' },
];

export const StateMachineCanvas: React.FC = () => {
  const { currentApp } = useLayout();
  const [states, setStates] = useState<StateNode[]>(DEFAULT_STATES);
  const [transitions, setTransitions] = useState<StateTransition[]>(DEFAULT_TRANSITIONS);
  const [selectedStateId, setSelectedStateId] = useState<string | null>(null);
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
            <Sliders className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-foreground">
                {currentApp ? currentApp.name : 'Fleet Logistics Studio'} • UML State Machine
              </span>
              <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-muted text-muted-foreground border border-border">
                State Transitions & Guards
              </span>
            </div>
            <p className="text-[10px] text-muted-foreground">
              Discrete states with entry/do/exit activities and transition triggers.
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
            onClick={() => showToast('State machine saved to PostgreSQL DES_BASE!')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-primary-foreground text-xs font-bold rounded-xl shadow-xs hover:bg-primary/90 transition-all cursor-pointer"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save State Machine</span>
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
        onClick={() => setSelectedStateId(null)}
      >
        {/* SVG Transition Arcs */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
          <defs>
            <marker id="state-arrow" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
              <polygon points="0 0, 8 3, 0 6" fill="var(--primary)" />
            </marker>
          </defs>
          {transitions.map((tr) => {
            const src = states.find((s) => s.id === tr.sourceId);
            const tgt = states.find((s) => s.id === tr.targetId);
            if (!src || !tgt) return null;

            const isLoopback = tr.sourceId === 'st-persisting' && tr.targetId === 'st-idle';

            if (isLoopback) {
              const x1 = src.x + src.width / 2;
              const y1 = src.y + src.height;
              const x2 = tgt.x + tgt.width / 2;
              const y2 = tgt.y + tgt.height;

              return (
                <g key={tr.id}>
                  <path
                    d={`M ${x1} ${y1} C ${x1} ${y1 + 80}, ${x2} ${y2 + 80}, ${x2} ${y2}`}
                    fill="none"
                    stroke="var(--primary)"
                    strokeWidth="2"
                    markerEnd="url(#state-arrow)"
                  />
                  <text
                    x={(x1 + x2) / 2}
                    y={y1 + 65}
                    fill="var(--primary)"
                    fontSize="10"
                    fontFamily="monospace"
                    fontWeight="bold"
                    textAnchor="middle"
                  >
                    {tr.trigger}
                  </text>
                </g>
              );
            }

            const x1 = src.x + src.width;
            const y1 = src.y + src.height / 2;
            const x2 = tgt.x;
            const y2 = tgt.y + tgt.height / 2;

            return (
              <g key={tr.id}>
                <line
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke="var(--primary)"
                  strokeWidth="2"
                  markerEnd="url(#state-arrow)"
                />
                <text
                  x={(x1 + x2) / 2}
                  y={(y1 + y2) / 2 - 8}
                  fill="var(--primary)"
                  fontSize="10"
                  fontFamily="monospace"
                  fontWeight="bold"
                  textAnchor="middle"
                >
                  {tr.trigger} {tr.guard || ''}
                </text>
              </g>
            );
          })}
        </svg>

        {/* States Layer */}
        {states.map((st) => {
          const isSelected = selectedStateId === st.id;

          if (st.type === 'initial') {
            return (
              <div
                key={st.id}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedStateId(st.id);
                }}
                style={{ transform: `translate3d(${st.x}px, ${st.y}px, 0)` }}
                className="absolute w-8 h-8 rounded-full bg-primary shadow-md flex items-center justify-center cursor-pointer hover:scale-110 transition-transform z-10"
                title="Initial Pseudo State"
              />
            );
          }

          if (st.type === 'final') {
            return (
              <div
                key={st.id}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedStateId(st.id);
                }}
                style={{ transform: `translate3d(${st.x}px, ${st.y}px, 0)` }}
                className="absolute w-8 h-8 rounded-full border-2 border-rose-500 bg-background shadow-md flex items-center justify-center cursor-pointer hover:scale-110 transition-transform z-10"
                title="Final State"
              >
                <div className="w-4 h-4 rounded-full bg-rose-500" />
              </div>
            );
          }

          return (
            <div
              key={st.id}
              onClick={(e) => {
                e.stopPropagation();
                setSelectedStateId(st.id);
              }}
              style={{
                transform: `translate3d(${st.x}px, ${st.y}px, 0)`,
                width: `${st.width}px`,
                height: `${st.height}px`,
              }}
              className={`absolute rounded-2xl border-2 p-3 flex flex-col justify-between transition-all cursor-pointer shadow-md z-10 ${
                st.color || 'border-border bg-card'
              } ${isSelected ? 'ring-2 ring-primary scale-105 shadow-xl' : 'hover:scale-102'}`}
            >
              <div className="font-bold text-xs text-foreground border-b border-border/50 pb-1 flex items-center justify-between">
                <span>{st.title}</span>
                <span className="text-[8px] font-mono text-muted-foreground uppercase">STATE</span>
              </div>
              <div className="space-y-0.5 text-[9px] font-mono text-muted-foreground pt-1">
                {st.entryAction && <div className="text-cyan-400 truncate">{st.entryAction}</div>}
                {st.doActivity && <div className="text-amber-400 truncate">{st.doActivity}</div>}
                {st.exitAction && <div className="text-rose-400 truncate">{st.exitAction}</div>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default StateMachineCanvas;
