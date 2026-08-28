import React, { useState } from 'react';
import {
  User,
  Cpu,
  Database,
  Circle,
  Square,
  ArrowRight,
  GitBranch,
  FileText,
  Search,
  Plus,
  GripVertical,
  ChevronDown,
  ChevronRight,
  Sparkles,
  Layers,
  Boxes,
  Network,
  FolderCode,
  Sliders,
  Layout,
} from 'lucide-react';
import { useLayout } from '../shell/LayoutContext';

export interface UMLComponentDef {
  id: string;
  category: 'behavioral' | 'structural';
  type: string;
  subType: string;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  defaultWidth: number;
  defaultHeight: number;
  defaultProps: Record<string, any>;
}

export const UML_COMPONENTS: UMLComponentDef[] = [
  // ── BEHAVIORAL COMPONENTS ──
  {
    id: 'uml-actor-primary',
    category: 'behavioral',
    type: 'actor',
    subType: 'primary',
    label: 'Primary Actor',
    description: 'Human user or operational role initiating use cases',
    icon: User,
    color: 'text-primary border-primary/40 bg-primary/10',
    defaultWidth: 100,
    defaultHeight: 120,
    defaultProps: { roleType: 'primary', name: 'Fleet Operator' },
  },
  {
    id: 'uml-actor-system',
    category: 'behavioral',
    type: 'actor',
    subType: 'system',
    label: 'System / Service Actor',
    description: 'Internal autonomous background engine or scheduler',
    icon: Cpu,
    color: 'text-purple-400 border-purple-500/40 bg-purple-500/10',
    defaultWidth: 100,
    defaultHeight: 120,
    defaultProps: { roleType: 'system', name: 'Telematics Engine' },
  },
  {
    id: 'uml-actor-external',
    category: 'behavioral',
    type: 'actor',
    subType: 'external',
    label: 'External System Actor',
    description: 'Third-party API, external boundary, or database sink',
    icon: Database,
    color: 'text-emerald-400 border-emerald-500/40 bg-emerald-500/10',
    defaultWidth: 100,
    defaultHeight: 120,
    defaultProps: { roleType: 'external', name: 'PostgreSQL DES_BASE' },
  },
  {
    id: 'uml-uc-standard',
    category: 'behavioral',
    type: 'use_case',
    subType: 'standard',
    label: 'Use Case Bubble',
    description: 'Discrete business requirement or functional goal',
    icon: Circle,
    color: 'text-cyan-400 border-cyan-500/40 bg-cyan-500/10',
    defaultWidth: 220,
    defaultHeight: 90,
    defaultProps: { code: 'UC-001', title: 'Authenticate Operator' },
  },
  {
    id: 'uml-boundary',
    category: 'behavioral',
    type: 'boundary',
    subType: 'system_box',
    label: 'System Boundary Box',
    description: 'Scope container delineating system vs external actors',
    icon: Square,
    color: 'text-foreground border-border bg-card/40',
    defaultWidth: 540,
    defaultHeight: 460,
    defaultProps: { title: 'Fleet Logistics System' },
  },

  // ── STRUCTURAL COMPONENTS ──
  {
    id: 'uml-struct-class',
    category: 'structural',
    type: 'class',
    subType: 'entity_class',
    label: 'Domain Entity Class',
    description: 'Structural class with attributes, operations, and visibility',
    icon: Layout,
    color: 'text-primary border-primary/40 bg-primary/10',
    defaultWidth: 260,
    defaultHeight: 180,
    defaultProps: { stereotype: '«Entity»', name: 'VehicleAsset' },
  },
  {
    id: 'uml-struct-interface',
    category: 'structural',
    type: 'interface',
    subType: 'port_interface',
    label: 'Repository Port Interface',
    description: 'Hexagonal port contract with abstract method signatures',
    icon: Network,
    color: 'text-cyan-400 border-cyan-500/40 bg-cyan-500/10',
    defaultWidth: 260,
    defaultHeight: 130,
    defaultProps: { stereotype: '«Interface»', name: 'VehicleRepositoryPort' },
  },
  {
    id: 'uml-struct-component',
    category: 'structural',
    type: 'component',
    subType: 'software_component',
    label: 'Software Component',
    description: 'Autonomous deployment component with provided/required ports',
    icon: Boxes,
    color: 'text-purple-400 border-purple-500/40 bg-purple-500/10',
    defaultWidth: 240,
    defaultHeight: 120,
    defaultProps: { stereotype: '«component»', name: 'TelematicsAdapter' },
  },
  {
    id: 'uml-struct-node',
    category: 'structural',
    type: 'node',
    subType: 'deployment_node',
    label: 'Execution Node / Host',
    description: 'Physical server, container runtime, or hardware device',
    icon: Cpu,
    color: 'text-emerald-400 border-emerald-500/40 bg-emerald-500/10',
    defaultWidth: 300,
    defaultHeight: 160,
    defaultProps: { stereotype: '«device»', name: 'EdgeHost Server' },
  },
  {
    id: 'uml-struct-package',
    category: 'structural',
    type: 'package',
    subType: 'namespace_package',
    label: 'Package Namespace',
    description: 'Logical architectural grouping of related domain artifacts',
    icon: FolderCode,
    color: 'text-amber-400 border-amber-500/40 bg-amber-500/10',
    defaultWidth: 220,
    defaultHeight: 120,
    defaultProps: { stereotype: '«package»', name: 'internal/core/domain' },
  },
  {
    id: 'uml-struct-stereotype',
    category: 'structural',
    type: 'stereotype',
    subType: 'profile_extension',
    label: 'Custom Stereotype Profile',
    description: 'Metamodel extension tag for PostgreSQL DES_BASE bindings',
    icon: Sliders,
    color: 'text-rose-400 border-rose-500/40 bg-rose-500/10',
    defaultWidth: 240,
    defaultHeight: 120,
    defaultProps: { stereotype: '«stereotype»', name: 'PostgreSQLEntity' },
  },
];

interface UMLToolboxPanelProps {
  searchQuery?: string;
  onSelectComponent?: (comp: UMLComponentDef) => void;
}

export const UMLToolboxPanel: React.FC<UMLToolboxPanelProps> = ({
  searchQuery = '',
  onSelectComponent,
}) => {
  const { canvasMode } = useLayout();
  const [activeCategory, setActiveCategory] = useState<'all' | 'behavioral' | 'structural'>('all');

  const isStructuralMode =
    canvasMode === 'class_diagram' ||
    canvasMode === 'object_diagram' ||
    canvasMode === 'component_diagram' ||
    canvasMode === 'deployment_diagram' ||
    canvasMode === 'package_diagram' ||
    canvasMode === 'composite_structure_diagram' ||
    canvasMode === 'profile_diagram';

  const handleDragStart = (e: React.DragEvent, comp: UMLComponentDef) => {
    e.dataTransfer.setData('application/json', JSON.stringify(comp));
    e.dataTransfer.setData('text/plain', comp.id);
    e.dataTransfer.effectAllowed = 'copy';
  };

  const filteredComponents = UML_COMPONENTS.filter((comp) => {
    if (activeCategory !== 'all' && comp.category !== activeCategory) return false;
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      comp.label.toLowerCase().includes(q) ||
      comp.description.toLowerCase().includes(q) ||
      comp.type.toLowerCase().includes(q)
    );
  });

  const behavioralList = filteredComponents.filter((c) => c.category === 'behavioral');
  const structuralList = filteredComponents.filter((c) => c.category === 'structural');

  return (
    <div className="flex flex-col h-full space-y-3 select-none">
      {/* Segmented Category Filter */}
      <div className="flex rounded-xl bg-muted/60 p-1 border border-border">
        <button
          type="button"
          onClick={() => setActiveCategory('all')}
          className={`flex-1 py-1 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${
            activeCategory === 'all'
              ? 'bg-card text-foreground shadow-xs'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          All (14)
        </button>
        <button
          type="button"
          onClick={() => setActiveCategory('behavioral')}
          className={`flex-1 py-1 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${
            activeCategory === 'behavioral' || (!isStructuralMode && activeCategory === 'all')
              ? 'bg-primary text-primary-foreground shadow-xs'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Behavioral
        </button>
        <button
          type="button"
          onClick={() => setActiveCategory('structural')}
          className={`flex-1 py-1 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${
            activeCategory === 'structural' || (isStructuralMode && activeCategory === 'all')
              ? 'bg-primary text-primary-foreground shadow-xs'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Structural
        </button>
      </div>

      {/* 1. Behavioral Palette */}
      {(activeCategory === 'all' || activeCategory === 'behavioral') && (
        <div className="rounded-xl border border-border/80 bg-card overflow-hidden">
          <div className="p-2.5 bg-muted/30 flex items-center justify-between border-b border-border/50">
            <div className="flex items-center gap-1.5 font-bold text-xs text-foreground">
              <User className="w-3.5 h-3.5 text-primary" />
              <span>Behavioral Components ({behavioralList.length})</span>
            </div>
          </div>
          <div className="p-2 space-y-1.5">
            {behavioralList.map((comp) => {
              const Icon = comp.icon;
              return (
                <div
                  key={comp.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, comp)}
                  onClick={() => onSelectComponent?.(comp)}
                  className="p-2 bg-background border border-border/70 hover:border-primary/60 rounded-xl flex items-center justify-between gap-2 group transition-all cursor-grab active:cursor-grabbing shadow-2xs hover:shadow-sm"
                  title="Click or drag onto UML canvas"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <GripVertical className="w-3.5 h-3.5 text-muted-foreground/40 group-hover:text-primary shrink-0" />
                    <div className={`w-7 h-7 rounded-lg border flex items-center justify-center ${comp.color} shrink-0`}>
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0">
                      <div className="font-semibold text-xs text-foreground truncate">{comp.label}</div>
                      <div className="text-[10px] text-muted-foreground truncate">{comp.description}</div>
                    </div>
                  </div>
                  <Plus className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary opacity-0 group-hover:opacity-100 shrink-0" />
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 2. Structural Palette */}
      {(activeCategory === 'all' || activeCategory === 'structural') && (
        <div className="rounded-xl border border-border/80 bg-card overflow-hidden">
          <div className="p-2.5 bg-muted/30 flex items-center justify-between border-b border-border/50">
            <div className="flex items-center gap-1.5 font-bold text-xs text-foreground">
              <Boxes className="w-3.5 h-3.5 text-cyan-400" />
              <span>Structural Components ({structuralList.length})</span>
            </div>
          </div>
          <div className="p-2 space-y-1.5">
            {structuralList.map((comp) => {
              const Icon = comp.icon;
              return (
                <div
                  key={comp.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, comp)}
                  onClick={() => onSelectComponent?.(comp)}
                  className="p-2 bg-background border border-border/70 hover:border-cyan-500/60 rounded-xl flex items-center justify-between gap-2 group transition-all cursor-grab active:cursor-grabbing shadow-2xs hover:shadow-sm"
                  title="Click or drag onto UML canvas"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <GripVertical className="w-3.5 h-3.5 text-muted-foreground/40 group-hover:text-cyan-400 shrink-0" />
                    <div className={`w-7 h-7 rounded-lg border flex items-center justify-center ${comp.color} shrink-0`}>
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0">
                      <div className="font-semibold text-xs text-foreground truncate">{comp.label}</div>
                      <div className="text-[10px] text-muted-foreground truncate">{comp.description}</div>
                    </div>
                  </div>
                  <Plus className="w-3.5 h-3.5 text-muted-foreground group-hover:text-cyan-400 opacity-0 group-hover:opacity-100 shrink-0" />
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default UMLToolboxPanel;
