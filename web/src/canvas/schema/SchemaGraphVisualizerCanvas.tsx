import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  Workflow,
  Search,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Box,
  RotateCcw,
  Move,
  GripHorizontal,
  Hand,
} from 'lucide-react';

interface GraphNode {
  id: string;
  title: string;
  type: string;
  x: number;
  y: number;
  properties: Array<{ name: string; type: string; required?: boolean; format?: string }>;
}

const INITIAL_NODES: GraphNode[] = [
  {
    id: 'root',
    title: 'TelematicsEvent (Root)',
    type: 'object',
    x: 60,
    y: 120,
    properties: [
      { name: 'event_id', type: 'string', format: 'uuid', required: true },
      { name: 'vin', type: 'string', required: true },
      { name: 'odometer_km', type: 'number', required: true },
      { name: 'status', type: 'enum', required: true },
      { name: 'telemetry_packet', type: 'object' },
      { name: 'active_dtc_codes', type: 'array' },
    ],
  },
  {
    id: 'telemetry_packet',
    title: 'TelemetryPacket',
    type: 'object',
    x: 480,
    y: 60,
    properties: [
      { name: 'latitude', type: 'number', required: true },
      { name: 'longitude', type: 'number', required: true },
      { name: 'battery_soc_pct', type: 'integer' },
      { name: 'speed_kmh', type: 'number' },
    ],
  },
  {
    id: 'active_dtc_codes',
    title: 'ActiveDTCCodes (List)',
    type: 'array',
    x: 480,
    y: 340,
    properties: [
      { name: 'items', type: 'string', format: 'dtc-code' },
      { name: 'minItems', type: '0' },
      { name: 'uniqueItems', type: 'true' },
    ],
  },
  {
    id: 'vehicle_profile',
    title: 'VehicleProfile ($defs)',
    type: '$defs',
    x: 880,
    y: 140,
    properties: [
      { name: 'make', type: 'string' },
      { name: 'model', type: 'string' },
      { name: 'powertrain', type: 'enum' },
      { name: 'gross_weight_kg', type: 'number' },
    ],
  },
];

export const SchemaGraphVisualizerCanvas: React.FC = () => {
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>('root');
  const [nodes, setNodes] = useState<GraphNode[]>(INITIAL_NODES);

  // Dragging state for nodes
  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);
  const dragStartPos = useRef<{ mouseX: number; mouseY: number; nodeX: number; nodeY: number } | null>(null);

  // Panning state for canvas background
  const [isPanning, setIsPanning] = useState(false);
  const panStartPos = useRef<{ mouseX: number; mouseY: number; panX: number; panY: number } | null>(null);

  const handleNodeMouseDown = (e: React.MouseEvent, nodeId: string) => {
    e.stopPropagation();
    setSelectedNodeId(nodeId);
    setDraggingNodeId(nodeId);

    const node = nodes.find((n) => n.id === nodeId);
    if (node) {
      dragStartPos.current = {
        mouseX: e.clientX,
        mouseY: e.clientY,
        nodeX: node.x,
        nodeY: node.y,
      };
    }
  };

  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    // Only pan if clicking canvas background (not inside node)
    if ((e.target as HTMLElement).closest('.schema-node-card')) return;
    setIsPanning(true);
    panStartPos.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      panX: pan.x,
      panY: pan.y,
    };
  };

  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      // 1. Move dragging node
      if (draggingNodeId && dragStartPos.current) {
        const dx = (e.clientX - dragStartPos.current.mouseX) / zoom;
        const dy = (e.clientY - dragStartPos.current.mouseY) / zoom;

        setNodes((prevNodes) =>
          prevNodes.map((n) =>
            n.id === draggingNodeId
              ? {
                  ...n,
                  x: Math.max(0, dragStartPos.current!.nodeX + dx),
                  y: Math.max(0, dragStartPos.current!.nodeY + dy),
                }
              : n
          )
        );
      }

      // 2. Pan canvas
      if (isPanning && panStartPos.current) {
        const dx = e.clientX - panStartPos.current.mouseX;
        const dy = e.clientY - panStartPos.current.mouseY;
        setPan({
          x: panStartPos.current.panX + dx,
          y: panStartPos.current.panY + dy,
        });
      }
    };

    const handleGlobalMouseUp = () => {
      setDraggingNodeId(null);
      dragStartPos.current = null;
      setIsPanning(false);
      panStartPos.current = null;
    };

    window.addEventListener('mousemove', handleGlobalMouseMove);
    window.addEventListener('mouseup', handleGlobalMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleGlobalMouseMove);
      window.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [draggingNodeId, isPanning, zoom]);

  const getNodeCenter = (id: string) => {
    const node = nodes.find((n) => n.id === id);
    if (!node) return { x: 0, y: 0, rightX: 0, leftX: 0 };
    return {
      x: node.x + 144,
      y: node.y + 80,
      rightX: node.x + 288,
      leftX: node.x,
    };
  };

  const rootCenter = getNodeCenter('root');
  const telemetryCenter = getNodeCenter('telemetry_packet');
  const dtcCenter = getNodeCenter('active_dtc_codes');
  const profileCenter = getNodeCenter('vehicle_profile');

  const handleResetLayout = () => {
    setNodes(INITIAL_NODES);
    setPan({ x: 0, y: 0 });
    setZoom(1);
  };

  return (
    <div className="flex flex-col h-full bg-background text-foreground select-none overflow-hidden relative">
      {/* Top Controls Bar */}
      <div className="p-3 border-b border-border bg-card/60 backdrop-blur-md flex flex-wrap items-center justify-between gap-3 z-10">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-primary/10 border border-primary/20 text-primary">
            <Workflow className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-foreground flex items-center gap-2">
              2D Schema Graph AST Visualizer
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
                Interactive Canvas (Drag Nodes & Pan)
              </span>
            </h1>
            <p className="text-[11px] text-muted-foreground">
              Click and drag node headers to reposition elements across the canvas, or drag canvas to pan.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative w-56">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search AST nodes..."
              className="w-full bg-background border border-border rounded-xl pl-8 pr-3 py-1 text-xs text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary transition"
            />
          </div>

          <button
            onClick={handleResetLayout}
            title="Reset Node Positions and Pan"
            className="p-1.5 rounded-xl bg-card hover:bg-muted text-muted-foreground hover:text-foreground border border-border transition flex items-center gap-1 text-xs px-2.5 font-medium"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Layout</span>
          </button>

          <div className="flex items-center bg-card border border-border rounded-xl p-0.5 text-xs">
            <button
              onClick={() => setZoom((z) => Math.max(0.4, z - 0.1))}
              className="p-1.5 hover:bg-muted rounded-lg text-muted-foreground hover:text-foreground transition"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="px-2 font-mono text-[10px] text-muted-foreground">
              {Math.round(zoom * 100)}%
            </span>
            <button
              onClick={() => setZoom((z) => Math.min(2.5, z + 0.1))}
              className="p-1.5 hover:bg-muted rounded-lg text-muted-foreground hover:text-foreground transition"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => {
                setZoom(1);
                setPan({ x: 0, y: 0 });
              }}
              className="p-1.5 hover:bg-muted rounded-lg text-muted-foreground hover:text-foreground transition border-l border-border"
              title="Reset Zoom & Pan"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Interactive 2D Graph Canvas */}
      <div
        onMouseDown={handleCanvasMouseDown}
        className={`flex-1 overflow-hidden bg-muted/20 relative ${
          isPanning ? 'cursor-grabbing' : 'cursor-grab'
        }`}
      >
        <div
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: '0 0',
            transition: draggingNodeId || isPanning ? 'none' : 'transform 0.15s ease-out',
          }}
          className="relative w-[2400px] h-[1600px]"
        >
          {/* Dynamic SVG Connecting Bezier Lines */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none">
            {/* Line: root -> telemetry_packet */}
            <path
              d={`M ${rootCenter.rightX} ${rootCenter.y - 20} C ${rootCenter.rightX + 60} ${rootCenter.y - 20}, ${telemetryCenter.leftX - 60} ${telemetryCenter.y}, ${telemetryCenter.leftX} ${telemetryCenter.y}`}
              fill="none"
              stroke="hsl(var(--primary))"
              strokeWidth="2.5"
              strokeDasharray="4 2"
            />
            {/* Line: root -> active_dtc_codes */}
            <path
              d={`M ${rootCenter.rightX} ${rootCenter.y + 40} C ${rootCenter.rightX + 60} ${rootCenter.y + 40}, ${dtcCenter.leftX - 60} ${dtcCenter.y}, ${dtcCenter.leftX} ${dtcCenter.y}`}
              fill="none"
              stroke="#10b981"
              strokeWidth="2.5"
            />
            {/* Line: telemetry_packet -> vehicle_profile */}
            <path
              d={`M ${telemetryCenter.rightX} ${telemetryCenter.y} C ${telemetryCenter.rightX + 60} ${telemetryCenter.y}, ${profileCenter.leftX - 60} ${profileCenter.y}, ${profileCenter.leftX} ${profileCenter.y}`}
              fill="none"
              stroke="#a855f7"
              strokeWidth="2.5"
            />
          </svg>

          {/* Draggable Node Cards */}
          {nodes.map((node) => {
            const isSelected = selectedNodeId === node.id;
            const matchesSearch =
              !searchQuery ||
              node.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
              node.properties.some((p) => p.name.toLowerCase().includes(searchQuery.toLowerCase()));

            return (
              <div
                key={node.id}
                style={{ left: `${node.x}px`, top: `${node.y}px` }}
                className={`schema-node-card absolute w-72 rounded-2xl bg-card border shadow-xl backdrop-blur-md overflow-hidden transition-shadow ${
                  isSelected
                    ? 'border-primary ring-2 ring-primary/30 shadow-primary/10'
                    : 'border-border hover:border-primary/40'
                } ${!matchesSearch ? 'opacity-30' : 'opacity-100'}`}
              >
                {/* Draggable Header */}
                <div
                  onMouseDown={(e) => handleNodeMouseDown(e, node.id)}
                  className="p-3 border-b border-border bg-muted/50 flex items-center justify-between cursor-grab active:cursor-grabbing hover:bg-muted/70 transition select-none"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <GripHorizontal className="w-3.5 h-3.5 text-muted-foreground" />
                    <Box className="w-4 h-4 text-primary" />
                    <span className="font-bold text-xs text-foreground truncate">{node.title}</span>
                  </div>
                  <span className="font-mono text-[9px] px-1.5 py-0.5 rounded-md bg-background text-primary border border-border">
                    {node.type}
                  </span>
                </div>

                {/* Node Properties List */}
                <div className="p-2.5 space-y-1 divide-y divide-border/60 text-xs">
                  {node.properties.map((p, idx) => (
                    <div
                      key={idx}
                      className="pt-1 first:pt-0 flex items-center justify-between text-[11px]"
                    >
                      <div className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/60" />
                        <span className="font-mono text-foreground font-medium">{p.name}</span>
                        {p.required && (
                          <span className="text-[8px] font-bold text-destructive bg-destructive/10 px-1 rounded">
                            *
                          </span>
                        )}
                      </div>
                      <span className="font-mono text-[10px] text-muted-foreground bg-muted px-1.5 py-0.2 rounded">
                        {p.type}
                        {p.format ? `:${p.format}` : ''}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
