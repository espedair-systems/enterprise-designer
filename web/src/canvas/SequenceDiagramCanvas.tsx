import React, { useState } from 'react';
import {
  GitBranch,
  User,
  Cpu,
  Database,
  CheckCircle2,
  Save,
  Plus,
  Trash2,
  Sparkles,
} from 'lucide-react';
import { useLayout } from '../shell/LayoutContext';

export interface SequenceParticipant {
  id: string;
  name: string;
  type: 'actor' | 'service' | 'database';
  color: string;
  x: number;
}

export interface SequenceMessage {
  id: string;
  sourceId: string;
  targetId: string;
  label: string;
  type: 'sync' | 'async' | 'reply' | 'self';
  y: number;
}

const DEFAULT_PARTICIPANTS: SequenceParticipant[] = [
  { id: 'part-operator', name: 'Fleet Operator', type: 'actor', color: 'border-primary bg-primary/10 text-primary', x: 120 },
  { id: 'part-gateway', name: 'API Gateway (Chi)', type: 'service', color: 'border-cyan-500/50 bg-cyan-500/10 text-cyan-300', x: 380 },
  { id: 'part-stream', name: 'Telematics Worker', type: 'service', color: 'border-purple-500/50 bg-purple-500/10 text-purple-300', x: 680 },
  { id: 'part-db', name: 'PostgreSQL DES_BASE', type: 'database', color: 'border-emerald-500/50 bg-emerald-500/10 text-emerald-300', x: 980 },
];

const DEFAULT_MESSAGES: SequenceMessage[] = [
  { id: 'msg-1', sourceId: 'part-operator', targetId: 'part-gateway', label: '1. POST /api/v1/auth/login', type: 'sync', y: 140 },
  { id: 'msg-2', sourceId: 'part-gateway', targetId: 'part-db', label: '2. SELECT * FROM DES_BASE.designer_apps', type: 'sync', y: 190 },
  { id: 'msg-3', sourceId: 'part-db', targetId: 'part-gateway', label: '3. Return 200 OK + JWT', type: 'reply', y: 240 },
  { id: 'msg-4', sourceId: 'part-gateway', targetId: 'part-operator', label: '4. Set Authorization Bearer Token', type: 'reply', y: 290 },
  { id: 'msg-5', sourceId: 'part-operator', targetId: 'part-stream', label: '5. Subscribe to Vehicle Telemetry Stream', type: 'async', y: 350 },
  { id: 'msg-6', sourceId: 'part-stream', targetId: 'part-db', label: '6. Batch COPY INTO sensor_logs', type: 'sync', y: 410 },
  { id: 'msg-7', sourceId: 'part-db', targetId: 'part-stream', label: '7. Commit ACK (25ms)', type: 'reply', y: 460 },
];

export const SequenceDiagramCanvas: React.FC = () => {
  const { currentApp } = useLayout();
  const [participants, setParticipants] = useState<SequenceParticipant[]>(DEFAULT_PARTICIPANTS);
  const [messages, setMessages] = useState<SequenceMessage[]>(DEFAULT_MESSAGES);
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
            <GitBranch className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-foreground">
                {currentApp ? currentApp.name : 'Fleet Logistics Studio'} • UML Sequence Diagram
              </span>
              <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-muted text-muted-foreground border border-border">
                Lifelines & Synchronous Message Exchange
              </span>
            </div>
            <p className="text-[10px] text-muted-foreground">
              Actors, services, activation focus boxes, synchronous calls, and return replies.
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
            onClick={() => showToast('Sequence diagram saved to PostgreSQL DES_BASE!')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-primary-foreground text-xs font-bold rounded-xl shadow-xs hover:bg-primary/90 transition-all cursor-pointer"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Sequence Diagram</span>
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
      >
        {/* Lifeline Headers */}
        <div className="relative min-w-[1100px] h-[640px]">
          {participants.map((part) => {
            const Icon = part.type === 'actor' ? User : part.type === 'database' ? Database : Cpu;
            return (
              <div key={part.id} style={{ left: `${part.x}px` }} className="absolute top-0 flex flex-col items-center">
                {/* Header Card */}
                <div
                  className={`w-40 p-2.5 rounded-xl border-2 shadow-md flex items-center gap-2 justify-center text-center z-10 ${part.color}`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <div className="font-bold text-xs leading-tight truncate">{part.name}</div>
                </div>

                {/* Vertical Lifeline Cord */}
                <div
                  className="w-0.5 h-[520px] border-l-2 border-dashed border-border/80 mt-1 relative"
                >
                  {/* Activation boxes */}
                  <div className="absolute top-24 -left-1.5 w-3.5 h-32 bg-card border-2 border-primary rounded-xs shadow-xs" />
                  <div className="absolute top-72 -left-1.5 w-3.5 h-36 bg-card border-2 border-primary rounded-xs shadow-xs" />
                </div>
              </div>
            );
          })}

          {/* SVG Message Arrows */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-20">
            <defs>
              <marker id="seq-arrow-sync" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
                <polygon points="0 0, 8 3, 0 6" fill="var(--primary)" />
              </marker>
              <marker id="seq-arrow-reply" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
                <polyline points="0 0, 8 3, 0 6" fill="none" stroke="var(--primary)" strokeWidth="1.5" />
              </marker>
            </defs>

            {messages.map((msg) => {
              const src = participants.find((p) => p.id === msg.sourceId);
              const tgt = participants.find((p) => p.id === msg.targetId);
              if (!src || !tgt) return null;

              const x1 = src.x + 80;
              const x2 = tgt.x + 80;
              const y = msg.y;

              const isReply = msg.type === 'reply';

              return (
                <g key={msg.id}>
                  <line
                    x1={x1}
                    y1={y}
                    x2={x2}
                    y2={y}
                    stroke="var(--primary)"
                    strokeWidth="2"
                    strokeDasharray={isReply ? '4,4' : 'none'}
                    markerEnd={isReply ? 'url(#seq-arrow-reply)' : 'url(#seq-arrow-sync)'}
                  />
                  <text
                    x={(x1 + x2) / 2}
                    y={y - 8}
                    fill="var(--primary)"
                    fontSize="11"
                    fontFamily="monospace"
                    fontWeight="bold"
                    textAnchor="middle"
                    className="select-none bg-card px-1"
                  >
                    {msg.label}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </div>
    </div>
  );
};

export default SequenceDiagramCanvas;
