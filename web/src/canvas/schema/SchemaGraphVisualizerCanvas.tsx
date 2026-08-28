import React, { useState, useRef, useEffect } from 'react';
import {
  Workflow,
  Search,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Box,
  RotateCcw,
  GripHorizontal,
  RefreshCw,
  FileCode2,
} from 'lucide-react';
import { api } from '../../services/api';

interface GraphNode {
  id: string;
  title: string;
  type: string;
  x: number;
  y: number;
  parentId?: string;
  properties: Array<{ name: string; type: string; required?: boolean; format?: string }>;
}

const parseSchemaToGraphNodes = (schemaPayload: any): GraphNode[] => {
  if (!schemaPayload || typeof schemaPayload !== 'object') {
    return [
      {
        id: 'root',
        title: 'Empty Schema',
        type: 'object',
        x: 60,
        y: 120,
        properties: [{ name: 'id', type: 'string', required: true }],
      },
    ];
  }

  const nodes: GraphNode[] = [];
  const rootTitle = schemaPayload.title || 'RootSchema';
  const rootProps: Array<{ name: string; type: string; required?: boolean; format?: string }> = [];
  const requiredList: string[] = Array.isArray(schemaPayload.required) ? schemaPayload.required : [];

  const rawProps = schemaPayload.properties || {};
  let childIndex = 0;

  Object.entries(rawProps).forEach(([propName, propDef]: [string, any]) => {
    const pType = propDef?.type || (propDef?.$ref ? '$ref' : 'any');
    const pFormat = propDef?.format;
    const isReq = requiredList.includes(propName);

    rootProps.push({
      name: propName,
      type: pType,
      required: isReq,
      format: pFormat,
    });

    // If property is a nested object with properties, create a child node
    if (pType === 'object' && propDef?.properties) {
      const childProps: Array<{ name: string; type: string; required?: boolean; format?: string }> = [];
      const childReq = Array.isArray(propDef.required) ? propDef.required : [];
      Object.entries(propDef.properties).forEach(([cName, cDef]: [string, any]) => {
        childProps.push({
          name: cName,
          type: cDef?.type || 'any',
          required: childReq.includes(cName),
          format: cDef?.format,
        });
      });

      nodes.push({
        id: `node-${propName}`,
        title: propDef.title || propName,
        type: 'object',
        x: 480,
        y: 60 + childIndex * 260,
        parentId: 'root',
        properties: childProps.length > 0 ? childProps : [{ name: 'data', type: 'object' }],
      });
      childIndex++;
    } else if (pType === 'array' && propDef?.items) {
      nodes.push({
        id: `node-${propName}`,
        title: `${propName} (List)`,
        type: 'array',
        x: 480,
        y: 60 + childIndex * 260,
        parentId: 'root',
        properties: [
          { name: 'items', type: propDef.items.type || 'string', format: propDef.items.format },
          { name: 'minItems', type: String(propDef.minItems ?? 0) },
        ],
      });
      childIndex++;
    }
  });

  // Check for $defs or definitions
  const defs = schemaPayload.$defs || schemaPayload.definitions || {};
  let defIndex = 0;
  Object.entries(defs).forEach(([defName, defObj]: [string, any]) => {
    const defProps: Array<{ name: string; type: string; required?: boolean; format?: string }> = [];
    const defReq = Array.isArray(defObj?.required) ? defObj.required : [];
    if (defObj?.properties) {
      Object.entries(defObj.properties).forEach(([pName, pObj]: [string, any]) => {
        defProps.push({
          name: pName,
          type: pObj?.type || 'string',
          required: defReq.includes(pName),
          format: pObj?.format,
        });
      });
    }

    nodes.push({
      id: `def-${defName}`,
      title: `${defName} ($defs)`,
      type: '$defs',
      x: 900,
      y: 100 + defIndex * 240,
      parentId: nodes.length > 0 ? nodes[0].id : 'root',
      properties: defProps.length > 0 ? defProps : [{ name: 'id', type: 'string' }],
    });
    defIndex++;
  });

  // Always put root node first
  nodes.unshift({
    id: 'root',
    title: `${rootTitle} (Root)`,
    type: schemaPayload.type || 'object',
    x: 60,
    y: 120,
    properties: rootProps.length > 0 ? rootProps : [{ name: 'id', type: 'string', required: true }],
  });

  return nodes;
};

export const SchemaGraphVisualizerCanvas: React.FC = () => {
  const [schemasList, setSchemasList] = useState<any[]>([]);
  const [selectedSchemaId, setSelectedSchemaId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>('root');
  const [nodes, setNodes] = useState<GraphNode[]>([]);

  // Dragging state for nodes
  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);
  const dragStartPos = useRef<{ mouseX: number; mouseY: number; nodeX: number; nodeY: number } | null>(null);

  // Panning state for canvas background
  const [isPanning, setIsPanning] = useState(false);
  const panStartPos = useRef<{ mouseX: number; mouseY: number; panX: number; panY: number } | null>(null);

  const fetchSchemas = async () => {
    try {
      setLoading(true);
      const res = await api.listSchemas();
      const list = Array.isArray(res)
        ? res
        : res && typeof res === 'object' && Array.isArray((res as any).schemas)
        ? (res as any).schemas
        : [];
      setSchemasList(list);

      if (list.length > 0) {
        const active = list[0];
        setSelectedSchemaId(active.id);
        const parsed = parseSchemaToGraphNodes(active.raw_payload_json);
        setNodes(parsed);
      } else {
        setNodes(
          parseSchemaToGraphNodes({
            title: 'Enterprise Schema',
            type: 'object',
            properties: { id: { type: 'string' }, name: { type: 'string' } },
          })
        );
      }
    } catch (err) {
      console.error('Failed to load schema graph AST:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchemas();
  }, []);

  const handleSelectSchema = (id: string) => {
    setSelectedSchemaId(id);
    const target = schemasList.find((s) => s.id === id);
    if (target) {
      const parsed = parseSchemaToGraphNodes(target.raw_payload_json);
      setNodes(parsed);
      setPan({ x: 0, y: 0 });
      setZoom(1);
    }
  };

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

  const getNodeBounds = (id: string) => {
    const node = nodes.find((n) => n.id === id);
    if (!node) return { rightX: 0, centerY: 0, leftX: 0 };
    return {
      rightX: node.x + 288,
      leftX: node.x,
      centerY: node.y + 60,
    };
  };

  const handleResetLayout = () => {
    const target = schemasList.find((s) => s.id === selectedSchemaId);
    if (target) {
      setNodes(parseSchemaToGraphNodes(target.raw_payload_json));
    }
    setPan({ x: 0, y: 0 });
    setZoom(1);
  };

  const safeNodes = Array.isArray(nodes) ? nodes : [];

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
                Dynamic AST Topology
              </span>
            </h1>
            <p className="text-[11px] text-muted-foreground">
              Dynamic 2D node graphs parsed in real-time from active JSON Schema definitions and AST models.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Active Schema Switcher */}
          {schemasList.length > 0 && (
            <div className="flex items-center gap-1.5 bg-card border border-border rounded-xl px-2.5 py-1 text-xs">
              <FileCode2 className="w-3.5 h-3.5 text-primary" />
              <select
                value={selectedSchemaId}
                onChange={(e) => handleSelectSchema(e.target.value)}
                className="bg-transparent text-foreground font-semibold text-xs focus:outline-none cursor-pointer"
              >
                {schemasList.map((s) => (
                  <option key={s.id} value={s.id} className="bg-card text-foreground">
                    {s.title} ({s.dialect || 'Draft 2020-12'})
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="relative w-48">
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

          <button
            onClick={fetchSchemas}
            title="Refresh Schema Registry"
            className="p-1.5 rounded-xl bg-card hover:bg-muted text-muted-foreground hover:text-foreground border border-border transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
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
            {safeNodes
              .filter((n) => n.parentId)
              .map((n) => {
                const parent = getNodeBounds(n.parentId!);
                const child = getNodeBounds(n.id);
                return (
                  <path
                    key={`edge-${n.parentId}-${n.id}`}
                    d={`M ${parent.rightX} ${parent.centerY} C ${parent.rightX + 80} ${parent.centerY}, ${child.leftX - 80} ${child.centerY}, ${child.leftX} ${child.centerY}`}
                    fill="none"
                    stroke="hsl(var(--primary))"
                    strokeWidth="2.5"
                    strokeDasharray={n.type === '$defs' ? '4 2' : undefined}
                  />
                );
              })}
          </svg>

          {/* Draggable Node Cards */}
          {safeNodes.map((node) => {
            const isSelected = selectedNodeId === node.id;
            const properties = Array.isArray(node.properties) ? node.properties : [];
            const matchesSearch =
              !searchQuery ||
              node.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
              properties.some((p) => p.name.toLowerCase().includes(searchQuery.toLowerCase()));

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
                  {properties.map((p, idx) => (
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
