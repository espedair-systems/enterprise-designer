import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { Capability, CapabilityHeatmapCell } from '../../types';
import { useStore } from '../../store/useStore';
import {
  Target,
  Plus,
  Layers,
  ChevronRight,
  ChevronDown,
  Edit2,
  Trash2,
  Grid,
  List,
  Database
} from 'lucide-react';

export const CapabilityStudio: React.FC = () => {
  const { searchQuery, openModal, setActiveView } = useStore();
  const [capabilities, setCapabilities] = useState<Capability[]>([]);
  const [heatmap, setHeatmap] = useState<CapabilityHeatmapCell[]>([]);
  const [viewMode, setViewMode] = useState<'tree' | 'heatmap'>('tree');
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const [caps, heat] = await Promise.all([
        api.listCapabilities(),
        api.getHeatmap(),
      ]);
      setCapabilities(caps);
      setHeatmap(heat);
      // Auto expand L1 nodes
      const exp: Record<string, boolean> = {};
      caps.forEach((c) => {
        if (!c.parent_id) exp[c.id] = true;
      });
      setExpanded(exp);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const toggleExpand = (id: string) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this capability?')) {
      await api.deleteCapability(id);
      loadData();
    }
  };

  // Build hierarchical tree
  const buildTree = (items: Capability[]) => {
    const map = new Map<string, Capability>();
    const roots: Capability[] = [];

    items.forEach((item) => {
      map.set(item.id, { ...item, children: [] });
    });

    items.forEach((item) => {
      const node = map.get(item.id)!;
      if (item.parent_id && map.has(item.parent_id)) {
        map.get(item.parent_id)!.children!.push(node);
      } else {
        roots.push(node);
      }
    });

    return roots;
  };

  const filteredCaps = capabilities.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.pace_layer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const tree = buildTree(filteredCaps);

  const renderTreeNode = (node: Capability, depth = 0) => {
    const isExpanded = expanded[node.id];
    const hasChildren = node.children && node.children.length > 0;
    const gap = node.target_maturity - node.current_maturity;

    return (
      <div key={node.id} className="space-y-2">
        <div
          className={`flex items-center justify-between p-3.5 rounded-xl border transition-all ${
            depth === 0
              ? 'bg-card border-border hover:border-primary/40 shadow-xs'
              : 'bg-muted/30 border-border hover:border-primary/30 ml-6'
          }`}
        >
          <div className="flex items-center gap-3">
            {hasChildren ? (
              <button
                onClick={() => toggleExpand(node.id)}
                className="p-1 rounded hover:bg-muted text-muted-foreground cursor-pointer"
              >
                {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              </button>
            ) : (
              <div className="w-6" />
            )}

            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-indigo-500">{node.code}</span>
                <span className="text-xs font-bold text-foreground">{node.name}</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground font-medium">
                  Level {node.level}
                </span>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                    node.pace_layer === 'System of Innovation'
                      ? 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20'
                      : node.pace_layer === 'System of Differentiation'
                      ? 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20'
                      : 'bg-muted text-muted-foreground border border-border'
                  }`}
                >
                  {node.pace_layer}
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground line-clamp-1">{node.description}</p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="text-right font-mono text-xs">
              <span className="text-muted-foreground">Maturity: </span>
              <strong className="text-foreground">{node.current_maturity.toFixed(1)}</strong>
              <span className="text-muted-foreground"> / {node.target_maturity.toFixed(1)}</span>
              {gap > 0 && <span className="text-amber-500 ml-1.5 font-semibold">(+{gap.toFixed(1)})</span>}
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => openModal('capability', node)}
                className="p-1.5 rounded-lg bg-card border border-border hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                title="Edit Capability"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => handleDelete(node.id)}
                className="p-1.5 rounded-lg bg-card border border-border hover:bg-rose-500/10 text-muted-foreground hover:text-rose-500 transition-colors cursor-pointer"
                title="Delete Capability"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {isExpanded && hasChildren && (
          <div className="space-y-2 border-l border-border ml-4 pl-2">
            {node.children!.map((child) => renderTreeNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground flex items-center gap-2.5">
            <Target className="w-6 h-6 text-indigo-500" />
            Capability Studio (L1 - L4 Decomposition)
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Hierarchical business capability mapping, Gartner PACE categorization, and maturity assessments.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex bg-card border border-border p-1 rounded-xl shadow-xs">
            <button
              onClick={() => setViewMode('tree')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                viewMode === 'tree' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>Hierarchy</span>
            </button>
            <button
              onClick={() => setViewMode('heatmap')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                viewMode === 'heatmap' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Grid className="w-3.5 h-3.5" />
              <span>Heatmap Matrix</span>
            </button>
          </div>

          <button
            onClick={() => openModal('capability')}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-primary hover:bg-primary/90 text-primary-foreground shadow-xs transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Capability</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center text-xs text-muted-foreground font-mono">Loading capabilities from PostgreSQL...</div>
      ) : capabilities.length === 0 ? (
        <div className="p-8 rounded-2xl bg-card border border-border text-center space-y-4 shadow-xs">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/20 flex items-center justify-center mx-auto">
            <Database className="w-6 h-6" />
          </div>
          <div className="space-y-1 max-w-md mx-auto">
            <h3 className="text-sm font-bold text-foreground">No Capabilities Found in Schema</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              No business capabilities exist in the active schema. Add your first L1 capability or import architecture metamodels.
            </p>
          </div>
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={() => openModal('capability')}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-all cursor-pointer shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Create Capability</span>
            </button>
            <button
              onClick={() => setActiveView('imports')}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-muted hover:bg-muted/80 text-foreground border border-border transition-all cursor-pointer"
            >
              <Layers className="w-4 h-4" />
              <span>Import Metamodels</span>
            </button>
          </div>
        </div>
      ) : viewMode === 'tree' ? (
        <div className="space-y-3">
          {tree.map((node) => renderTreeNode(node))}
        </div>
      ) : (
        /* Heatmap Grid View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {heatmap.map((cell) => {
            const healthBg =
              cell.health_color === 'red'
                ? 'border-rose-500/40 bg-rose-500/5'
                : cell.health_color === 'yellow'
                ? 'border-amber-500/40 bg-amber-500/5'
                : 'border-emerald-500/40 bg-emerald-500/5';

            return (
              <div
                key={cell.capability_id}
                className={`rounded-2xl p-4 border bg-card ${healthBg} space-y-3 shadow-xs`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-indigo-500">{cell.code}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded font-mono font-semibold bg-muted text-foreground border border-border">
                    {cell.pace_layer}
                  </span>
                </div>
                <h3 className="text-xs font-bold text-foreground">{cell.name}</h3>
                <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-border font-mono">
                  <div>
                    <span className="text-[10px] text-muted-foreground block">Current Maturity</span>
                    <strong className="text-foreground">{cell.current_maturity.toFixed(1)} / 5.0</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-muted-foreground block">Target Maturity</span>
                    <strong className="text-emerald-600 dark:text-emerald-400">{cell.target_maturity.toFixed(1)} / 5.0</strong>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
