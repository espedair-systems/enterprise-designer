import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import {
  Workflow,
  Layers,
  Search,
  Filter,
  Sparkles,
  Database,
  Code,
  FileCode,
  Binary,
  Maximize2,
  ZoomIn,
  ZoomOut,
  RefreshCw,
  Info,
  ArrowRight,
  Target,
  Share2,
  Activity,
  Zap,
  Globe,
  Sliders,
  ChevronRight,
  Move,
  Play,
  Pause,
  Compass,
  Radio,
  Eye,
  GitGraph,
  Copy,
  Check,
  ExternalLink,
  Pin,
  Flame,
  Terminal,
  Grid,
  Network
} from 'lucide-react';
import clsx from 'clsx';
import { useStore } from '../../store/useStore';
import { api } from '../../services/api';

export interface SimNode {
  id: string;
  label: string;
  category: string;
  level?: 'strategy' | 'data' | 'code' | 'system';
  language?: 'rust' | 'go' | 'typescript' | 'sql' | 'etl' | 'strategy';
  kind?: string;
  color: string;
  bgColor: string;
  borderColor: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  score?: number;
  pinned?: boolean;
  details: {
    stack: string;
    code?: string;
    description: string;
    pace_layer?: string;
    maturity?: number;
    path?: string;
    connections: string[];
    role?: string;
    level?: number;
    language?: string;
    [key: string]: any;
  };
}

export interface SimEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
  type: string;
  relation?: string;
  color: string;
}

interface ContextMenuState {
  visible: boolean;
  x: number;
  y: number;
  node: SimNode | null;
}

export const VectorKnowledgeGraphView: React.FC = () => {
  const { setActiveView } = useStore();
  const [nodes, setNodes] = useState<SimNode[]>([]);
  const [edges, setEdges] = useState<SimEdge[]>([]);
  const [stats, setStats] = useState<{ total_nodes: number; total_edges: number; density: string; source: string } | null>(null);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  
  // Abstraction Level & Filter State
  const [selectedLevel, setSelectedLevel] = useState<'ALL' | 'strategy' | 'data' | 'code'>('ALL');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('ALL');
  const [filterCategory, setFilterCategory] = useState<string>('ALL');
  const [searchFilter, setSearchFilter] = useState('');
  const [isolatedNodeId, setIsolatedNodeId] = useState<string | null>(null);

  // Layout & Physics Engine State
  const [layoutMode, setLayoutMode] = useState<'force' | 'radial' | 'dag' | 'grid'>('force');
  const [isPhysicsActive, setIsPhysicsActive] = useState<boolean>(false);
  const [kRepel, setKRepel] = useState<number>(4200);
  const [kSpring, setKSpring] = useState<number>(0.045);
  const [centerGravity, setCenterGravity] = useState<number>(0.008);
  const [loading, setLoading] = useState(true);

  // Left Sidebar Width & Collapse State
  const [sidebarWidth, setSidebarWidth] = useState<number>(340);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);
  const isResizingRef = useRef<boolean>(false);
  const sidebarRef = useRef<HTMLDivElement>(null);

  // Zoom & Pan Canvas State
  const [zoom, setZoom] = useState(0.85);
  const [pan, setPan] = useState({ x: 60, y: 30 });
  const [isPanning, setIsPanning] = useState(false);
  const startPanRef = useRef({ x: 0, y: 0 });

  // Dragging Node Physics State
  const [draggedNodeId, setDraggedNodeId] = useState<string | null>(null);
  const dragOffsetRef = useRef({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const animFrameRef = useRef<number | null>(null);

  // Right-Click Context Menu State
  const [contextMenu, setContextMenu] = useState<ContextMenuState>({
    visible: false,
    x: 0,
    y: 0,
    node: null,
  });
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Load authoritative topology from backend
  const loadGraphData = async () => {
    setLoading(true);
    try {
      const data = await api.getVectorGraph();
      if (data && data.nodes) {
        const simNodes: SimNode[] = data.nodes.map((n: any) => ({
          ...n,
          vx: 0,
          vy: 0,
          pinned: false,
        }));
        setNodes(simNodes);
        setEdges(data.edges as any);
        setStats(data.stats);
        if (simNodes.length > 0) {
          setSelectedNodeId(simNodes[0].id);
        }
      }
    } catch (err) {
      console.error('Failed to load authoritative graph:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadGraphData();
  }, []);

  // Close context menu on outside click or escape
  useEffect(() => {
    const handleOutside = () => setContextMenu((prev) => ({ ...prev, visible: false }));
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setContextMenu((prev) => ({ ...prev, visible: false }));
    };
    window.addEventListener('click', handleOutside);
    window.addEventListener('keydown', handleKey);
    return () => {
      window.removeEventListener('click', handleOutside);
      window.removeEventListener('keydown', handleKey);
    };
  }, []);

  // Left Sidebar Resizer
  const startResizing = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    isResizingRef.current = true;

    const handleMouseMove = (event: MouseEvent) => {
      if (!isResizingRef.current) return;
      const newWidth = Math.min(Math.max(event.clientX, 260), 520);
      setSidebarWidth(newWidth);
    };

    const handleMouseUp = () => {
      isResizingRef.current = false;
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  }, []);

  // ==========================================
  // REAL-TIME FORCE-DIRECTED PHYSICS ENGINE
  // ==========================================
  useEffect(() => {
    if (!isPhysicsActive || layoutMode !== 'force' || nodes.length === 0) return;

    let localNodes = [...nodes];
    const localEdges = [...edges];

    const tick = () => {
      const restLength = 180;
      const damping = 0.85;
      const centerX = 750;
      const centerY = 500;

      // 1. Coulomb Repulsion
      for (let i = 0; i < localNodes.length; i++) {
        for (let j = i + 1; j < localNodes.length; j++) {
          const dx = localNodes[j].x - localNodes[i].x;
          const dy = localNodes[j].y - localNodes[i].y;
          const distSq = dx * dx + dy * dy + 150;
          const dist = Math.sqrt(distSq);
          if (dist > 650) continue;

          const force = kRepel / distSq;
          const fx = (dx / dist) * force;
          const fy = (dy / dist) * force;

          if (!localNodes[i].pinned && localNodes[i].id !== draggedNodeId) {
            localNodes[i].vx -= fx;
            localNodes[i].vy -= fy;
          }
          if (!localNodes[j].pinned && localNodes[j].id !== draggedNodeId) {
            localNodes[j].vx += fx;
            localNodes[j].vy += fy;
          }
        }
      }

      // 2. Hooke's Spring Law
      for (const edge of localEdges) {
        const sNode = localNodes.find((n) => n.id === edge.source);
        const tNode = localNodes.find((n) => n.id === edge.target);
        if (!sNode || !tNode) continue;

        const dx = tNode.x - sNode.x;
        const dy = tNode.y - sNode.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        const displacement = dist - restLength;
        const force = kSpring * displacement;

        const fx = (dx / dist) * force;
        const fy = (dy / dist) * force;

        if (!sNode.pinned && sNode.id !== draggedNodeId) {
          sNode.vx += fx;
          sNode.vy += fy;
        }
        if (!tNode.pinned && tNode.id !== draggedNodeId) {
          tNode.vx -= fx;
          tNode.vy -= fy;
        }
      }

      // 3. Center Gravity Pull & Position Update
      localNodes = localNodes.map((n) => {
        if (n.pinned || n.id === draggedNodeId) return n;

        const gx = (centerX - n.x) * centerGravity;
        const gy = (centerY - n.y) * centerGravity;

        const newVx = (n.vx + gx) * damping;
        const newVy = (n.vy + gy) * damping;

        return {
          ...n,
          x: Math.min(Math.max(n.x + newVx, -200), 2000),
          y: Math.min(Math.max(n.y + newVy, -200), 1600),
          vx: newVx,
          vy: newVy,
        };
      });

      setNodes([...localNodes]);
      animFrameRef.current = requestAnimationFrame(tick);
    };

    animFrameRef.current = requestAnimationFrame(tick);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isPhysicsActive, layoutMode, draggedNodeId, kRepel, kSpring, centerGravity, edges]);

  // Layout Generator Presets
  const applyLayout = (mode: 'force' | 'radial' | 'dag' | 'grid') => {
    setLayoutMode(mode);
    setIsPhysicsActive(mode === 'force');

    setNodes((prev) => {
      if (mode === 'radial') {
        const centerX = 800;
        const centerY = 500;
        const tiers: Record<string, number> = {
          goal: 140,
          valuestream: 280,
          capability: 420,
          process: 560,
          table: 680,
          code_module: 780,
          etl_stage: 880,
        };

        const grouped: Record<string, SimNode[]> = {};
        prev.forEach((n) => {
          const cat = n.category || 'other';
          if (!grouped[cat]) grouped[cat] = [];
          grouped[cat].push(n);
        });

        const updated: SimNode[] = [];
        Object.entries(grouped).forEach(([cat, list]) => {
          const radius = tiers[cat] || 500;
          const step = (Math.PI * 2) / list.length;
          list.forEach((n, idx) => {
            const angle = idx * step;
            updated.push({
              ...n,
              x: centerX + Math.cos(angle) * radius,
              y: centerY + Math.sin(angle) * radius,
              vx: 0,
              vy: 0,
            });
          });
        });
        return updated;
      }

      if (mode === 'dag') {
        const tierY: Record<string, number> = {
          goal: 100,
          valuestream: 280,
          capability: 480,
          process: 680,
          table: 880,
          code_module: 1080,
          etl_stage: 1280,
        };

        const tierCounts: Record<string, number> = {};
        return prev.map((n) => {
          const cat = n.category || 'capability';
          const y = tierY[cat] || 600;
          const idx = tierCounts[cat] || 0;
          tierCounts[cat] = idx + 1;
          const x = 200 + idx * 240;
          return { ...n, x, y, vx: 0, vy: 0 };
        });
      }

      if (mode === 'grid') {
        const cols = 5;
        const spacingX = 240;
        const spacingY = 160;
        return prev.map((n, idx) => {
          const col = idx % cols;
          const row = Math.floor(idx / cols);
          return {
            ...n,
            x: 200 + col * spacingX,
            y: 120 + row * spacingY,
            vx: 0,
            vy: 0,
          };
        });
      }

      return prev;
    });
  };

  // Curated Preset Scenarios
  const applyCuratedPreset = (preset: 'rust' | 'go' | 'data' | 'strategy' | 'etl') => {
    if (preset === 'rust') {
      setSelectedLevel('code');
      setSelectedLanguage('rust');
      setFilterCategory('ALL');
      setSearchFilter('');
      setIsolatedNodeId(null);
    } else if (preset === 'go') {
      setSelectedLevel('code');
      setSelectedLanguage('go');
      setFilterCategory('ALL');
      setSearchFilter('');
      setIsolatedNodeId(null);
    } else if (preset === 'data') {
      setSelectedLevel('data');
      setSelectedLanguage('ALL');
      setFilterCategory('ALL');
      setSearchFilter('');
      setIsolatedNodeId(null);
    } else if (preset === 'strategy') {
      setSelectedLevel('strategy');
      setSelectedLanguage('ALL');
      setFilterCategory('ALL');
      setSearchFilter('');
      setIsolatedNodeId(null);
    } else if (preset === 'etl') {
      setSelectedLevel('data');
      setSelectedLanguage('etl');
      setFilterCategory('ALL');
      setSearchFilter('');
      setIsolatedNodeId(null);
    }
  };

  // Selected Node Reference
  const selectedNode = useMemo(() => {
    return nodes.find((n) => n.id === selectedNodeId) || null;
  }, [nodes, selectedNodeId]);

  // Compute Active Highlight Set (Neighbors of Hovered or Selected Node)
  const activeFocusId = hoveredNodeId || selectedNodeId;
  const connectedNodeIds = useMemo(() => {
    if (!activeFocusId) return new Set<string>();
    const node = nodes.find((n) => n?.id === activeFocusId);
    if (!node) return new Set<string>();
    const connList = Array.isArray(node.details?.connections) ? node.details.connections : [];
    const neighbors = new Set<string>(connList);
    neighbors.add(activeFocusId);
    return neighbors;
  }, [activeFocusId, nodes]);

  // Filter Nodes Based on Level, Language, Category, Search, and Isolated Subgraph
  const filteredNodes = useMemo(() => {
    const search = (searchFilter || '').trim().toLowerCase();

    return nodes.filter((n) => {
      if (!n) return false;

      // 1. Isolated Subgraph
      if (isolatedNodeId) {
        const isoNode = nodes.find((item) => item.id === isolatedNodeId);
        const isoConns = new Set<string>(isoNode?.details?.connections || []);
        isoConns.add(isolatedNodeId);
        if (!isoConns.has(n.id)) return false;
      }

      // 2. Abstraction Level Filter
      if (selectedLevel !== 'ALL') {
        if (selectedLevel === 'strategy') {
          if (n.level !== 'strategy' && !['goal', 'valuestream', 'capability', 'process'].includes(n.category)) {
            return false;
          }
        } else if (selectedLevel === 'data') {
          if (n.level !== 'data' && !['table', 'etl_stage'].includes(n.category)) {
            return false;
          }
        } else if (selectedLevel === 'code') {
          if (n.level !== 'code' && !['code_module', 'chunk'].includes(n.category)) {
            return false;
          }
        }
      }

      // 3. Language Filter
      if (selectedLanguage !== 'ALL') {
        const nodeLang = String(n.language || n.details?.language || '').toLowerCase();
        if (nodeLang !== selectedLanguage.toLowerCase()) return false;
      }

      // 4. Category Filter
      if (filterCategory !== 'ALL' && n.category !== filterCategory) {
        return false;
      }

      // 5. Search Text Filter
      if (!search) return true;

      const label = String(n.label || '').toLowerCase();
      const id = String(n.id || '').toLowerCase();
      const category = String(n.category || '').toLowerCase();
      const stack = String(n.details?.stack || '').toLowerCase();
      const code = String(n.details?.code || '').toLowerCase();
      const desc = String(n.details?.description || '').toLowerCase();

      return (
        label.includes(search) ||
        id.includes(search) ||
        category.includes(search) ||
        stack.includes(search) ||
        code.includes(search) ||
        desc.includes(search)
      );
    });
  }, [nodes, selectedLevel, selectedLanguage, filterCategory, searchFilter, isolatedNodeId]);

  const filteredNodeIds = useMemo(() => new Set(filteredNodes.map((n) => n.id)), [filteredNodes]);

  const filteredEdges = useMemo(() => {
    return edges.filter((e) => filteredNodeIds.has(e.source) && filteredNodeIds.has(e.target));
  }, [edges, filteredNodeIds]);

  // Canvas Pan Handlers
  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0 || draggedNodeId) return;
    setIsPanning(true);
    startPanRef.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
  };

  const handleCanvasMouseMove = (e: React.MouseEvent) => {
    if (isPanning) {
      setPan({
        x: e.clientX - startPanRef.current.x,
        y: e.clientY - startPanRef.current.y,
      });
    } else if (draggedNodeId) {
      // Direct Node Dragging in Canvas Coordinates
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;
      const mouseCanvasX = (e.clientX - rect.left - pan.x) / zoom;
      const mouseCanvasY = (e.clientY - rect.top - pan.y) / zoom;

      setNodes((prev) =>
        prev.map((n) => {
          if (n.id === draggedNodeId) {
            return {
              ...n,
              x: mouseCanvasX - dragOffsetRef.current.x,
              y: mouseCanvasY - dragOffsetRef.current.y,
              vx: 0,
              vy: 0,
            };
          }
          return n;
        })
      );
    }
  };

  const handleCanvasMouseUp = () => {
    setIsPanning(false);
    setDraggedNodeId(null);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.08 : 0.92;
    setZoom((prev) => Math.min(Math.max(prev * zoomFactor, 0.35), 2.2));
  };

  const resetView = () => {
    setZoom(0.85);
    setPan({ x: 60, y: 30 });
    setIsolatedNodeId(null);
  };

  // Node Drag Initiation
  const handleNodeMouseDown = (e: React.MouseEvent, node: SimNode) => {
    if (e.button !== 0) return; // Only left click for drag
    e.stopPropagation();
    setDraggedNodeId(node.id);
    setSelectedNodeId(node.id);

    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const mouseCanvasX = (e.clientX - rect.left - pan.x) / zoom;
    const mouseCanvasY = (e.clientY - rect.top - pan.y) / zoom;

    dragOffsetRef.current = {
      x: mouseCanvasX - node.x,
      y: mouseCanvasY - node.y,
    };
  };

  // Right-Click Context Menu Trigger
  const handleNodeContextMenu = (e: React.MouseEvent, node: SimNode) => {
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

  // Pin/Unpin Node Position
  const togglePinNode = (nodeId: string) => {
    setNodes((prev) =>
      prev.map((n) => (n.id === nodeId ? { ...n, pinned: !n.pinned } : n))
    );
  };

  // Copy Node Metadata
  const copyNodeInfo = (node: SimNode) => {
    const text = JSON.stringify(
      {
        id: node.id,
        label: node.label,
        category: node.category,
        language: node.language,
        stack: node.details?.stack,
        path: node.details?.path,
      },
      null,
      2
    );
    void navigator.clipboard.writeText(text).then(() => {
      setCopiedId(node.id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  // Open in Search Engine
  const jumpToSearch = (node: SimNode) => {
    setActiveView('vector-search');
  };

  // Language Tag Helper
  const getLanguageBadge = (node: SimNode) => {
    const lang = node.language || node.details?.language;
    if (!lang) return null;

    const map: Record<string, { label: string; cls: string }> = {
      rust: { label: 'Rust', cls: 'bg-orange-500/15 text-orange-600 dark:text-orange-400 border-orange-500/30' },
      go: { label: 'Go', cls: 'bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 border-cyan-500/30' },
      typescript: { label: 'TS', cls: 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30' },
      sql: { label: '3NF', cls: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30' },
      etl: { label: 'ETL', cls: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30' },
      strategy: { label: 'Meta', cls: 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30' },
    };

    const cfg = map[lang.toLowerCase()] || { label: lang, cls: 'bg-muted text-muted-foreground border-border' };
    return (
      <span className={clsx('text-[9px] font-mono font-bold px-1.5 py-0.2 rounded border', cfg.cls)}>
        {cfg.label}
      </span>
    );
  };

  return (
    <div className="flex h-full bg-background text-foreground overflow-hidden select-none relative">
      {/* ========================================================================= */}
      {/* LEFT SIDEBAR: Abstraction Levels, Narrowing Filters & Layout Controls     */}
      {/* ========================================================================= */}
      {!isSidebarCollapsed && (
        <aside
          ref={sidebarRef}
          style={{ width: `${sidebarWidth}px` }}
          className="border-r border-border bg-card flex flex-col h-full shrink-0 relative select-none z-20 shadow-md"
        >
          {/* Sidebar Header */}
          <div className="p-4 border-b border-border space-y-3 bg-muted/20">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Network className="w-3.5 h-3.5 text-primary" />
                <span>Knowledge Scopes</span>
              </span>
              <span className="text-[10px] font-mono font-bold bg-primary/10 text-primary px-1.5 py-0.5 rounded border border-primary/20">
                {filteredNodes.length} / {nodes.length} Vertices
              </span>
            </div>

            {/* Abstraction Level Switcher Tabs */}
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase text-muted-foreground block">
                Abstraction Level
              </span>
              <div className="grid grid-cols-2 gap-1.5">
                {[
                  { id: 'ALL', label: 'L4: OmniGraph', icon: Globe, desc: 'All 7 Tiers Fused' },
                  { id: 'code', label: 'L3: Code Artifacts', icon: Code, desc: 'Rust, Go, TS, AST' },
                  { id: 'data', label: 'L2: Data & Tables', icon: Database, desc: '3NF, ETL Stages' },
                  { id: 'strategy', label: 'L1: Strategy', icon: Target, desc: 'Goals, Capabilities' },
                ].map((lvl) => {
                  const Icon = lvl.icon;
                  const isActive = selectedLevel === lvl.id;
                  return (
                    <button
                      key={lvl.id}
                      type="button"
                      onClick={() => {
                        setSelectedLevel(lvl.id as any);
                        setIsolatedNodeId(null);
                      }}
                      className={clsx(
                        'p-2 rounded-xl text-left border transition-all cursor-pointer flex flex-col justify-between',
                        isActive
                          ? 'bg-primary/10 border-primary text-primary shadow-2xs font-bold'
                          : 'bg-muted/40 hover:bg-muted/80 border-border/70 text-muted-foreground hover:text-foreground'
                      )}
                    >
                      <div className="flex items-center gap-1.5 text-xs font-bold">
                        <Icon className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">{lvl.label}</span>
                      </div>
                      <span className="text-[9px] font-mono text-muted-foreground opacity-80 mt-0.5 block truncate">
                        {lvl.desc}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Sidebar Scrollable Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-5">
            {/* Curated 1-Click Preset Views */}
            <div className="space-y-2">
              <span className="text-[10px] font-bold uppercase text-muted-foreground flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-500" />
                <span>1-Click Curated Presets</span>
              </span>
              <div className="grid grid-cols-1 gap-1.5">
                {[
                  { id: 'rust', label: 'Rust Crates & Petgraph Engine', tag: 'Rust (rs)', color: 'text-orange-500' },
                  { id: 'go', label: 'Go Hexagonal Ports & Adapters', tag: 'Go (go)', color: 'text-cyan-500' },
                  { id: 'data', label: 'PostgreSQL 3NF Data Schemas', tag: 'SQL (3nf)', color: 'text-emerald-500' },
                  { id: 'strategy', label: 'Strategic Driver Traceability', tag: 'Strategy', color: 'text-rose-500' },
                  { id: 'etl', label: 'DataStage ETL Pipeline Lineage', tag: 'ETL (xml)', color: 'text-amber-500' },
                ].map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => applyCuratedPreset(preset.id as any)}
                    className="w-full px-3 py-2 rounded-xl text-left bg-muted/30 hover:bg-muted border border-border/60 hover:border-primary/40 transition-all flex items-center justify-between text-xs cursor-pointer group"
                  >
                    <span className="font-semibold text-foreground group-hover:text-primary transition-colors">
                      {preset.label}
                    </span>
                    <span className={clsx('text-[9px] font-mono font-bold px-1.5 py-0.2 rounded border bg-background', preset.color)}>
                      {preset.tag}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Language / Technology Filter Chips */}
            <div className="space-y-2">
              <span className="text-[10px] font-bold uppercase text-muted-foreground block">
                Filter by Language / Stack
              </span>
              <div className="flex flex-wrap gap-1.5">
                {['ALL', 'Rust', 'Go', 'TypeScript', 'SQL', 'ETL', 'Strategy'].map((lang) => (
                  <button
                    key={lang}
                    type="button"
                    onClick={() => {
                      setSelectedLanguage(lang);
                      setIsolatedNodeId(null);
                    }}
                    className={clsx(
                      'px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer border',
                      selectedLanguage.toLowerCase() === lang.toLowerCase()
                        ? 'bg-primary text-primary-foreground border-primary font-bold shadow-2xs'
                        : 'bg-muted/50 text-muted-foreground hover:text-foreground border-border/70'
                    )}
                  >
                    {lang}
                  </button>
                ))}
              </div>
            </div>

            {/* Node Category Filters */}
            <div className="space-y-2">
              <span className="text-[10px] font-bold uppercase text-muted-foreground block">
                Entity Category
              </span>
              <div className="flex flex-wrap gap-1.5">
                {['ALL', 'goal', 'valuestream', 'capability', 'process', 'table', 'code_module', 'etl_stage'].map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setFilterCategory(cat)}
                    className={clsx(
                      'px-2 py-0.5 rounded-md text-[10px] font-mono font-bold uppercase transition-colors cursor-pointer border',
                      filterCategory === cat
                        ? 'bg-foreground text-background border-foreground shadow-2xs'
                        : 'bg-muted/40 text-muted-foreground hover:text-foreground border-border/60'
                    )}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Layout Mode Presets */}
            <div className="space-y-2 pt-2 border-t border-border/60">
              <span className="text-[10px] font-bold uppercase text-muted-foreground block">
                Layout Arrangement
              </span>
              <div className="grid grid-cols-2 gap-1.5">
                {[
                  { id: 'force', label: 'Force-Directed', icon: Activity },
                  { id: 'dag', label: 'DAG Top-Down', icon: GitGraph },
                  { id: 'radial', label: 'Concentric Radial', icon: Compass },
                  { id: 'grid', label: 'Matrix Grid', icon: Grid },
                ].map((mode) => {
                  const Icon = mode.icon;
                  const isActive = layoutMode === mode.id;
                  return (
                    <button
                      key={mode.id}
                      type="button"
                      onClick={() => applyLayout(mode.id as any)}
                      className={clsx(
                        'p-2 rounded-xl text-xs font-semibold border transition-all flex items-center gap-1.5 cursor-pointer',
                        isActive
                          ? 'bg-primary/10 border-primary text-primary font-bold'
                          : 'bg-muted/40 text-muted-foreground hover:text-foreground border-border'
                      )}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{mode.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Physics Engine Fine-Tuning */}
            <div className="p-3.5 rounded-xl bg-muted/30 border border-border/80 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5 text-amber-500" />
                  <span>Physics Engine</span>
                </span>
                <button
                  type="button"
                  onClick={() => setIsPhysicsActive(!isPhysicsActive)}
                  className={clsx(
                    'px-2 py-0.5 rounded-full text-[10px] font-mono font-bold border transition-colors cursor-pointer',
                    isPhysicsActive
                      ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                      : 'bg-muted text-muted-foreground border-border'
                  )}
                >
                  {isPhysicsActive ? 'ACTIVE (Running)' : 'PAUSED (Static)'}
                </button>
              </div>

              {isPhysicsActive && (
                <div className="space-y-2 pt-1 font-mono text-[10px]">
                  <div className="space-y-1">
                    <div className="flex justify-between text-muted-foreground">
                      <span>Node Repulsion:</span>
                      <span className="text-foreground font-bold">{kRepel}</span>
                    </div>
                    <input
                      type="range"
                      min="1000"
                      max="9000"
                      step="200"
                      value={kRepel}
                      onChange={(e) => setKRepel(parseFloat(e.target.value))}
                      className="w-full accent-primary cursor-pointer"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-muted-foreground">
                      <span>Spring Tension:</span>
                      <span className="text-foreground font-bold">{kSpring.toFixed(3)}</span>
                    </div>
                    <input
                      type="range"
                      min="0.01"
                      max="0.10"
                      step="0.005"
                      value={kSpring}
                      onChange={(e) => setKSpring(parseFloat(e.target.value))}
                      className="w-full accent-primary cursor-pointer"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Isolated Subgraph Banner */}
            {isolatedNodeId && (
              <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/30 text-xs flex items-center justify-between">
                <span className="text-purple-600 dark:text-purple-400 font-semibold">
                  Sub-Graph Isolated
                </span>
                <button
                  type="button"
                  onClick={() => setIsolatedNodeId(null)}
                  className="px-2 py-0.5 rounded bg-background border border-border text-[10px] font-mono hover:bg-muted cursor-pointer"
                >
                  Clear Isolation
                </button>
              </div>
            )}
          </div>

          {/* Draggable Resizer Bar */}
          <div
            onMouseDown={startResizing}
            className="absolute top-0 right-0 w-1.5 h-full cursor-col-resize hover:bg-primary/50 transition-colors z-30"
          />
        </aside>
      )}

      {/* ========================================================================= */}
      {/* MAIN CANVAS AREA: Viewport, Canvas Physics, Minimalist Nodes, Context Menu*/}
      {/* ========================================================================= */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* Header Control Ribbon */}
        <div className="px-6 py-3.5 border-b border-border bg-card flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0 z-10 shadow-xs">
          <div className="flex items-center gap-2.5">
            {/* Sidebar Toggle Button */}
            <button
              type="button"
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className={clsx(
                'p-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer',
                !isSidebarCollapsed
                  ? 'bg-primary/10 text-primary border-primary/20'
                  : 'bg-muted/60 text-muted-foreground hover:text-foreground border-border'
              )}
              title={isSidebarCollapsed ? 'Expand Scopes Sidebar' : 'Collapse Scopes Sidebar'}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span className="hidden sm:inline text-[11px] font-bold">
                {isSidebarCollapsed ? 'Show Scopes' : 'Scopes'}
              </span>
            </button>

            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
              OmniGraph Lineage
            </span>
            <h1 className="text-base font-bold text-foreground truncate">
              Multi-Level Cognitive Knowledge Graph
            </h1>

            {/* Physics Status Pill & Instant Toggle */}
            <button
              type="button"
              onClick={() => setIsPhysicsActive(!isPhysicsActive)}
              className={clsx(
                'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold transition-colors cursor-pointer border ml-1',
                isPhysicsActive
                  ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30 shadow-2xs'
                  : 'bg-muted/80 text-muted-foreground hover:text-foreground border-border'
              )}
              title="Click to toggle continuous force physics"
            >
              {isPhysicsActive ? <Play className="w-2.5 h-2.5 fill-emerald-500" /> : <Pause className="w-2.5 h-2.5" />}
              <span>Physics: {isPhysicsActive ? 'ACTIVE' : 'PAUSED'}</span>
            </button>
          </div>

          {/* Quick Search & Canvas Zoom Controls */}
          <div className="flex items-center gap-2">
            <div className="relative w-48 sm:w-64">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search vertices, code..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-background border border-border text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary font-mono shadow-2xs"
              />
            </div>

            <button
              type="button"
              onClick={() => setZoom((z) => Math.min(z + 0.15, 2.2))}
              className="p-1.5 rounded-lg border border-border bg-background hover:bg-muted text-foreground cursor-pointer"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setZoom((z) => Math.max(z - 0.15, 0.35))}
              className="p-1.5 rounded-lg border border-border bg-background hover:bg-muted text-foreground cursor-pointer"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={resetView}
              className="p-1.5 rounded-lg border border-border bg-background hover:bg-muted text-foreground cursor-pointer"
              title="Reset View"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={loadGraphData}
              disabled={loading}
              className="p-1.5 rounded-lg border border-border bg-background hover:bg-muted text-foreground cursor-pointer"
              title="Refresh Graph"
            >
              <RefreshCw className={clsx('w-3.5 h-3.5', loading && 'animate-spin')} />
            </button>
          </div>
        </div>

        {/* Zoomable & Pannable Physics Canvas Viewport */}
        <div
          ref={containerRef}
          onMouseDown={handleCanvasMouseDown}
          onMouseMove={handleCanvasMouseMove}
          onMouseUp={handleCanvasMouseUp}
          onWheel={handleWheel}
          className={clsx(
            'flex-1 relative overflow-hidden bg-radial from-card via-background to-background select-none',
            draggedNodeId ? 'cursor-grabbing' : isPanning ? 'cursor-grabbing' : 'cursor-grab'
          )}
        >
          {/* Subtle Canvas Dot Grid */}
          <div
            className="absolute inset-0 opacity-[0.05] dark:opacity-[0.09] pointer-events-none"
            style={{
              backgroundImage: 'radial-gradient(circle, currentColor 1.2px, transparent 1.2px)',
              backgroundSize: '28px 28px',
            }}
          />

          {/* Transform Canvas Viewport */}
          <div
            style={{
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
              transformOrigin: '0 0',
              transition: isPanning || draggedNodeId || isPhysicsActive ? 'none' : 'transform 0.15s ease-out',
            }}
            className="absolute inset-0 w-[2400px] h-[1800px] pointer-events-none"
          >
            {/* SVG Connecting Directed Edges */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible">
              <defs>
                <marker
                  id="arrow-head"
                  markerWidth="8"
                  markerHeight="8"
                  refX="20"
                  refY="4"
                  orient="auto"
                >
                  <polygon points="0 0, 8 4, 0 8" fill="currentColor" opacity="0.6" />
                </marker>
              </defs>

              {filteredEdges.map((edge) => {
                const sNode = nodes.find((n) => n.id === edge.source);
                const tNode = nodes.find((n) => n.id === edge.target);
                if (!sNode || !tNode) return null;

                const isEdgeHighlighted =
                  activeFocusId === edge.source || activeFocusId === edge.target;
                const isEdgeDimmed = activeFocusId && !isEdgeHighlighted;

                return (
                  <g key={edge.id} className={clsx('transition-opacity duration-200', isEdgeDimmed && 'opacity-15')}>
                    <line
                      x1={sNode.x}
                      y1={sNode.y}
                      x2={tNode.x}
                      y2={tNode.y}
                      strokeWidth={isEdgeHighlighted ? 2.6 : 1.3}
                      className={clsx(
                        'transition-all duration-150',
                        isEdgeHighlighted ? 'stroke-cyan-400 drop-shadow-md' : edge.color
                      )}
                    />
                    {isEdgeHighlighted && (
                      <text
                        x={(sNode.x + tNode.x) / 2}
                        y={(sNode.y + tNode.y) / 2 - 5}
                        fill="currentColor"
                        textAnchor="middle"
                        className="text-[9px] font-mono font-bold fill-primary bg-background px-1"
                      >
                        {edge.relation || edge.type}
                      </text>
                    )}
                  </g>
                );
              })}
            </svg>

            {/* Clean, Non-Cluttered Canvas Nodes */}
            {filteredNodes.map((node) => {
              const isSelected = selectedNodeId === node.id;
              const isHovered = hoveredNodeId === node.id;
              const isConnected = connectedNodeIds.has(node.id);
              const isDimmed = activeFocusId && !isConnected;

              return (
                <div
                  key={node.id}
                  onMouseDown={(e) => handleNodeMouseDown(e, node)}
                  onContextMenu={(e) => handleNodeContextMenu(e, node)}
                  onMouseEnter={() => setHoveredNodeId(node.id)}
                  onMouseLeave={() => setHoveredNodeId(null)}
                  style={{
                    transform: `translate(${node.x}px, ${node.y}px) translate(-50%, -50%)`,
                  }}
                  className={clsx(
                    'absolute pointer-events-auto cursor-pointer rounded-2xl border px-3 py-2 flex items-center gap-2.5 transition-shadow duration-150 select-none shadow-xs',
                    node.bgColor,
                    node.borderColor,
                    isSelected ? 'ring-2 ring-primary ring-offset-2 ring-offset-background shadow-lg scale-105 z-30' : 'z-10',
                    isHovered && !isSelected ? 'scale-105 shadow-md z-20' : '',
                    isDimmed && 'opacity-25 blur-[0.2px]',
                    'bg-card/90 backdrop-blur-md'
                  )}
                >
                  {/* Clean Category / Language Icon */}
                  <div className="shrink-0 flex items-center justify-center">
                    {node.language === 'rust' ? (
                      <Code className="w-4 h-4 text-orange-500" />
                    ) : node.language === 'go' ? (
                      <Terminal className="w-4 h-4 text-cyan-500" />
                    ) : node.language === 'typescript' ? (
                      <FileCode className="w-4 h-4 text-blue-500" />
                    ) : node.category === 'table' ? (
                      <Database className="w-4 h-4 text-emerald-500" />
                    ) : node.category === 'goal' ? (
                      <Target className="w-4 h-4 text-rose-500" />
                    ) : node.category === 'valuestream' ? (
                      <Layers className="w-4 h-4 text-indigo-500" />
                    ) : (
                      <Workflow className="w-4 h-4 text-amber-500" />
                    )}
                  </div>

                  {/* Clean Node Label */}
                  <div className="flex flex-col min-w-0 pr-1">
                    <span className="font-bold text-xs text-foreground truncate max-w-[170px] leading-tight">
                      {node.label}
                    </span>
                    <div className="flex items-center gap-1 mt-0.5">
                      {getLanguageBadge(node)}
                      <span className="text-[9px] font-mono text-muted-foreground uppercase truncate max-w-[100px]">
                        {node.kind || node.category}
                      </span>
                    </div>
                  </div>

                  {/* Pinned Pin Indicator */}
                  {node.pinned && <Pin className="w-3 h-3 text-amber-500 fill-amber-500 shrink-0" />}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right-Click Floating Context Menu */}
        {contextMenu.visible && contextMenu.node && (
          <div
            style={{
              top: `${contextMenu.y}px`,
              left: `${contextMenu.x}px`,
            }}
            onClick={(e) => e.stopPropagation()}
            className="fixed z-50 min-w-[200px] p-1.5 rounded-2xl bg-card/95 backdrop-blur-md border border-border shadow-2xl animate-in fade-in zoom-in-95 duration-100 text-xs"
          >
            <div className="px-3 py-2 border-b border-border/60 mb-1">
              <span className="font-bold text-foreground block truncate">{contextMenu.node.label}</span>
              <span className="text-[10px] font-mono text-muted-foreground">{contextMenu.node.details?.stack}</span>
            </div>

            <button
              type="button"
              onClick={() => {
                setSelectedNodeId(contextMenu.node!.id);
                setContextMenu((prev) => ({ ...prev, visible: false }));
              }}
              className="w-full px-2.5 py-1.5 rounded-lg flex items-center gap-2 hover:bg-primary/10 hover:text-primary transition-colors cursor-pointer text-left"
            >
              <Info className="w-3.5 h-3.5" />
              <span>Inspect Details & Lineage</span>
            </button>

            <button
              type="button"
              onClick={() => {
                togglePinNode(contextMenu.node!.id);
                setContextMenu((prev) => ({ ...prev, visible: false }));
              }}
              className="w-full px-2.5 py-1.5 rounded-lg flex items-center gap-2 hover:bg-muted text-foreground transition-colors cursor-pointer text-left"
            >
              <Pin className="w-3.5 h-3.5 text-amber-500" />
              <span>{contextMenu.node.pinned ? 'Unpin Position' : 'Pin Position'}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setIsolatedNodeId(contextMenu.node!.id);
                setContextMenu((prev) => ({ ...prev, visible: false }));
              }}
              className="w-full px-2.5 py-1.5 rounded-lg flex items-center gap-2 hover:bg-muted text-foreground transition-colors cursor-pointer text-left"
            >
              <Radio className="w-3.5 h-3.5 text-purple-500" />
              <span>Isolate Sub-Graph Neighborhood</span>
            </button>

            <button
              type="button"
              onClick={() => {
                copyNodeInfo(contextMenu.node!);
                setContextMenu((prev) => ({ ...prev, visible: false }));
              }}
              className="w-full px-2.5 py-1.5 rounded-lg flex items-center gap-2 hover:bg-muted text-foreground transition-colors cursor-pointer text-left"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>Copy Node Metadata</span>
            </button>

            <div className="pt-1 mt-1 border-t border-border/60">
              <button
                type="button"
                onClick={() => {
                  jumpToSearch(contextMenu.node!);
                  setContextMenu((prev) => ({ ...prev, visible: false }));
                }}
                className="w-full px-2.5 py-1.5 rounded-lg flex items-center gap-2 hover:bg-primary text-primary-foreground font-semibold transition-colors cursor-pointer text-left"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Search in LanceDB Engine</span>
              </button>
            </div>
          </div>
        )}
      </main>

      {/* ========================================================================= */}
      {/* RIGHT SIDEBAR: Detailed Connectivity, Provenance & Code Metadata Inspector */}
      {/* ========================================================================= */}
      {selectedNode && (
        <aside className="w-96 border-l border-border bg-card p-6 flex flex-col h-full overflow-y-auto space-y-5 select-none shrink-0 shadow-lg z-20 animate-in slide-in-from-right duration-200">
          <div className="flex items-center justify-between border-b border-border pb-4">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
              <Share2 className="w-4 h-4 text-primary" />
              <span>Lineage & Connectivity</span>
            </h3>
            <div className="flex items-center gap-1.5">
              {getLanguageBadge(selectedNode)}
              <span
                className={clsx(
                  'text-[10px] font-mono uppercase font-bold px-2 py-0.5 rounded border',
                  selectedNode.color,
                  selectedNode.borderColor,
                  selectedNode.bgColor
                )}
              >
                {selectedNode.kind || selectedNode.category}
              </span>
            </div>
          </div>

          <div>
            <h2 className="text-base font-extrabold text-foreground">{selectedNode.label}</h2>
            <p className="text-xs text-primary font-mono font-semibold mt-0.5">
              {selectedNode.details?.stack || 'OmniGraph AST Node'}
            </p>
          </div>

          <p className="text-xs text-muted-foreground leading-relaxed">
            {selectedNode.details?.description || 'Structural lineage node extracted dynamically by Artifact Indexer.'}
          </p>

          {/* Code Provenance Path */}
          {selectedNode.details?.path && (
            <div className="p-3 rounded-xl bg-muted/40 border border-border space-y-1 font-mono text-xs">
              <span className="text-[10px] text-muted-foreground uppercase font-bold block">File & Module Path</span>
              <span className="text-foreground break-all text-[11px] font-bold">{selectedNode.details.path}</span>
            </div>
          )}

          {/* Pace Layer & Maturity (Strategy Tier) */}
          {selectedNode.details?.pace_layer && (
            <div className="grid grid-cols-2 gap-2 p-3 rounded-xl bg-muted/40 border border-border text-xs font-mono">
              <div>
                <span className="text-[10px] text-muted-foreground block">Pace Layer:</span>
                <span className="font-bold text-foreground">{selectedNode.details.pace_layer}</span>
              </div>
              <div>
                <span className="text-[10px] text-muted-foreground block">Maturity:</span>
                <span className="font-bold text-emerald-500">
                  {typeof selectedNode.details?.maturity === 'number'
                    ? selectedNode.details.maturity.toFixed(2)
                    : '3.50'}
                  /5.00
                </span>
              </div>
            </div>
          )}

          {/* Degree Centrality & Connected Links */}
          <div className="space-y-2.5 pt-2 border-t border-border">
            <div className="flex items-center justify-between text-xs font-mono text-muted-foreground">
              <span className="font-bold uppercase text-[10px]">Connected Neighborhood</span>
              <span className="px-1.5 py-0.5 rounded bg-primary/10 text-primary font-bold">
                {(selectedNode.details?.connections || []).length} Links
              </span>
            </div>

            <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
              {(selectedNode.details?.connections || []).map((connId) => {
                const targetNode = nodes.find((n) => n.id === connId);
                if (!targetNode) return null;
                return (
                  <button
                    key={connId}
                    type="button"
                    onClick={() => setSelectedNodeId(connId)}
                    className="w-full text-left p-2.5 rounded-xl bg-muted/30 hover:bg-muted/80 border border-border/60 transition-colors flex items-center justify-between group cursor-pointer"
                  >
                    <div className="min-w-0 pr-2">
                      <span className="font-bold text-xs text-foreground group-hover:text-primary transition-colors truncate block">
                        {targetNode.label}
                      </span>
                      <span className="text-[10px] font-mono text-muted-foreground truncate block">
                        {targetNode.category} • {targetNode.language || 'generic'}
                      </span>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all shrink-0" />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick Jump to Search Button */}
          <div className="pt-2">
            <button
              type="button"
              onClick={() => jumpToSearch(selectedNode)}
              className="w-full py-2.5 px-4 rounded-xl bg-primary text-primary-foreground font-bold text-xs flex items-center justify-center gap-2 hover:bg-primary/90 transition shadow-xs cursor-pointer"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Search Entity in LanceDB</span>
            </button>
          </div>
        </aside>
      )}
    </div>
  );
};
