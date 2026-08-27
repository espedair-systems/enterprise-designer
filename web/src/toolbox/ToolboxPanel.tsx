import React, { useState } from 'react';
import {
  Plus,
  Table,
  BarChart3,
  Code,
  List,
  FormInput,
  CheckSquare,
  ToggleLeft,
  Calendar,
  Hash,
  TrendingUp,
  PieChart,
  Grid,
  Layers,
  CreditCard,
  ExternalLink,
  Play,
  MoreHorizontal,
} from 'lucide-react';
import { WIDGET_REGISTRY } from '../widgets/registry';
import { WidgetDefinition } from '../widgets/types';
import { useLayout } from '../shell/LayoutContext';

const ICON_MAP: Record<string, React.FC<{ className?: string }>> = {
  Table,
  BarChart3,
  Code,
  List,
  FormInput,
  CheckSquare,
  ToggleLeft,
  Calendar,
  Hash,
  TrendingUp,
  PieChart,
  Grid,
  Layers,
  CreditCard,
  ExternalLink,
  Play,
  MoreHorizontal,
};

export const ToolboxPanel: React.FC = () => {
  const { slots, updateSlots } = useLayout();
  const [search, setSearch] = useState<string>('');
  const [selectedCat, setSelectedCat] = useState<string>('all');

  const categories = [
    { id: 'all', label: 'All' },
    { id: 'display', label: 'Display' },
    { id: 'input', label: 'Input' },
    { id: 'visual', label: 'Visual' },
    { id: 'container', label: 'Containers' },
    { id: 'action', label: 'Actions' },
  ];

  const widgetsList = Object.values(WIDGET_REGISTRY).filter((w) => {
    const matchesCat = selectedCat === 'all' || w.category === selectedCat;
    const matchesSearch =
      w.label.toLowerCase().includes(search.toLowerCase()) ||
      w.description.toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const handleAddWidget = (widgetDef: WidgetDefinition) => {
    const currentWidgets = slots.canvas?.widgets || [];
    const newWidget = {
      id: `widget-${Date.now().toString().slice(-5)}`,
      type: widgetDef.type,
      x: 30 + (currentWidgets.length % 3) * 40,
      y: 30 + Math.floor(currentWidgets.length / 3) * 60,
      width: widgetDef.defaultWidth,
      height: widgetDef.defaultHeight,
      title: widgetDef.label,
      props: { ...widgetDef.defaultProps },
    };

    updateSlots({
      canvas: {
        ...slots.canvas,
        widgets: [...currentWidgets, newWidget],
      },
    });
  };

  return (
    <div className="flex flex-col h-full space-y-3">
      {/* Category Pills */}
      <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none">
        {categories.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => setSelectedCat(cat.id)}
            className={`px-2 py-1 rounded-lg text-[11px] font-semibold whitespace-nowrap transition-all ${
              selectedCat === cat.id
                ? 'bg-primary text-primary-foreground shadow-xs'
                : 'bg-muted text-muted-foreground hover:text-foreground border border-border'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Widget Grid */}
      <div className="flex-1 overflow-y-auto space-y-2 pr-1">
        {widgetsList.map((w) => {
          const Icon = ICON_MAP[w.icon] || Layers;
          return (
            <div
              key={w.type}
              className="p-2.5 bg-card border border-border hover:border-primary/60 rounded-xl flex items-center justify-between gap-3 group transition-all cursor-pointer shadow-xs hover:shadow-md"
              onClick={() => handleAddWidget(w)}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary group-hover:scale-105 transition-transform shrink-0">
                  <Icon className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <h5 className="text-xs font-bold text-foreground truncate group-hover:text-primary transition-colors">
                    {w.label}
                  </h5>
                  <p className="text-[10px] text-muted-foreground truncate">{w.description}</p>
                </div>
              </div>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleAddWidget(w);
                }}
                className="w-6 h-6 rounded-md bg-muted group-hover:bg-primary text-muted-foreground group-hover:text-primary-foreground flex items-center justify-center transition-colors shrink-0"
                title="Add to Canvas"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
