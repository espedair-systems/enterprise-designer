import React, { useState } from 'react';
import {
  Sliders,
  Sparkles,
  Link,
  Layers,
  Database,
  Trash2,
  Copy,
  Eye,
} from 'lucide-react';
import { useLayout } from '../shell/LayoutContext';
import { WIDGET_REGISTRY } from '../widgets/registry';

interface PropertyInspectorProps {
  selectedWidgetId: string | null;
  onSelectWidget: (id: string | null) => void;
}

export const PropertyInspector: React.FC<PropertyInspectorProps> = ({
  selectedWidgetId,
  onSelectWidget,
}) => {
  const { slots, updateSlots } = useLayout();
  const [activeTab, setActiveTab] = useState<'props' | 'layout' | 'events'>('props');

  const widgets = slots.canvas?.widgets || [];
  const selectedWidget = widgets.find((w) => w.id === selectedWidgetId);
  const widgetDef = selectedWidget ? WIDGET_REGISTRY[selectedWidget.type] : null;

  if (!selectedWidget) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center p-4 border border-dashed border-border rounded-xl">
        <Sliders className="w-8 h-8 text-muted-foreground/50 mb-2" />
        <p className="text-xs font-semibold text-foreground">No Component Selected</p>
        <p className="text-[10px] text-muted-foreground mt-1">
          Click any widget on the canvas to inspect and edit its dynamic properties.
        </p>
      </div>
    );
  }

  const handleUpdateField = (field: string, value: any) => {
    const updated = widgets.map((w) => {
      if (w.id === selectedWidget.id) {
        if (field === 'title') {
          return { ...w, title: value };
        }
        return {
          ...w,
          props: {
            ...w.props,
            [field]: value,
          },
        };
      }
      return w;
    });

    updateSlots({
      canvas: {
        ...slots.canvas,
        widgets: updated,
      },
    });
  };

  const handleUpdateGeometry = (field: 'x' | 'y' | 'width' | 'height', val: number) => {
    const updated = widgets.map((w) => {
      if (w.id === selectedWidget.id) {
        return { ...w, [field]: Math.max(0, val) };
      }
      return w;
    });

    updateSlots({
      canvas: {
        ...slots.canvas,
        widgets: updated,
      },
    });
  };

  const handleDeleteWidget = () => {
    const updated = widgets.filter((w) => w.id !== selectedWidget.id);
    updateSlots({
      canvas: {
        ...slots.canvas,
        widgets: updated,
      },
    });
    onSelectWidget(null);
  };

  const handleDuplicateWidget = () => {
    const clone = {
      ...selectedWidget,
      id: `widget-${Date.now().toString().slice(-5)}`,
      x: selectedWidget.x + 20,
      y: selectedWidget.y + 20,
      title: `${selectedWidget.title} (Copy)`,
    };
    updateSlots({
      canvas: {
        ...slots.canvas,
        widgets: [...widgets, clone],
      },
    });
    onSelectWidget(clone.id);
  };

  return (
    <div className="flex flex-col h-full space-y-4">
      {/* Component Header & Actions */}
      <div className="flex items-center justify-between p-3 bg-card border border-border rounded-xl shadow-xs">
        <div>
          <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20 font-bold">
            {selectedWidget.type}
          </span>
          <h4 className="text-xs font-bold text-foreground mt-1 truncate max-w-[140px]">
            {selectedWidget.title}
          </h4>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={handleDuplicateWidget}
            className="p-1.5 rounded-lg bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground transition-colors"
            title="Duplicate Widget"
          >
            <Copy className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={handleDeleteWidget}
            className="p-1.5 rounded-lg bg-muted hover:bg-rose-500/10 text-muted-foreground hover:text-rose-500 transition-colors"
            title="Delete Widget"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="flex items-center border border-border bg-muted/40 rounded-lg p-0.5">
        {(['props', 'layout', 'events'] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-1 text-xs font-semibold rounded-md capitalize transition-colors ${
              activeTab === tab
                ? 'bg-card text-primary shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab 1: Properties & Data Bindings */}
      {activeTab === 'props' && (
        <div className="space-y-3">
          {/* Title Field */}
          <div>
            <label className="block text-[11px] font-semibold text-foreground mb-1">Component Title</label>
            <input
              type="text"
              value={selectedWidget.title}
              onChange={(e) => handleUpdateField('title', e.target.value)}
              className="w-full bg-background border border-border rounded-lg px-2.5 py-1.5 text-xs text-foreground focus:outline-none focus:border-primary"
            />
          </div>

          {/* Dynamic Schema Fields from Widget Definition */}
          {widgetDef &&
            widgetDef.schema.map((field) => {
              const currentVal = selectedWidget.props?.[field.name] ?? field.defaultValue;
              return (
                <div key={field.name} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-semibold text-foreground">{field.label}</label>
                    <span className="text-[10px] font-mono text-muted-foreground">{field.type}</span>
                  </div>
                  {field.type === 'string' && (
                    <input
                      type="text"
                      value={currentVal || ''}
                      onChange={(e) => handleUpdateField(field.name, e.target.value)}
                      className="w-full bg-background border border-border rounded-lg px-2.5 py-1.5 text-xs text-foreground focus:outline-none focus:border-primary"
                    />
                  )}
                  {field.type === 'number' && (
                    <input
                      type="number"
                      value={currentVal ?? 0}
                      onChange={(e) => handleUpdateField(field.name, Number(e.target.value))}
                      className="w-full bg-background border border-border rounded-lg px-2.5 py-1.5 text-xs text-foreground focus:outline-none focus:border-primary"
                    />
                  )}
                  {field.type === 'select' && (
                    <select
                      value={currentVal}
                      onChange={(e) => handleUpdateField(field.name, e.target.value)}
                      className="w-full bg-background border border-border rounded-lg px-2.5 py-1.5 text-xs text-foreground focus:outline-none focus:border-primary"
                    >
                      {field.options?.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              );
            })}

          {/* Reactive Expression Helper */}
          <div className="p-2.5 bg-card border border-border rounded-xl space-y-1">
            <div className="flex items-center gap-1 text-[11px] font-bold text-primary">
              <Sparkles className="w-3 h-3" />
              <span>Reactive Expression Support</span>
            </div>
            <p className="text-[10px] text-muted-foreground">
              Use <code className="font-mono text-primary font-bold">{'{{app.name}}'}</code> or <code className="font-mono text-primary font-bold">{'{{datasources.postgres.status}}'}</code> for runtime binding.
            </p>
          </div>
        </div>
      )}

      {/* Tab 2: Layout & Geometry */}
      {activeTab === 'layout' && (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] uppercase font-bold text-muted-foreground">X Position (px)</label>
              <input
                type="number"
                value={selectedWidget.x}
                onChange={(e) => handleUpdateGeometry('x', Number(e.target.value))}
                className="w-full bg-background border border-border rounded-lg px-2.5 py-1.5 text-xs text-foreground focus:outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="text-[10px] uppercase font-bold text-muted-foreground">Y Position (px)</label>
              <input
                type="number"
                value={selectedWidget.y}
                onChange={(e) => handleUpdateGeometry('y', Number(e.target.value))}
                className="w-full bg-background border border-border rounded-lg px-2.5 py-1.5 text-xs text-foreground focus:outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="text-[10px] uppercase font-bold text-muted-foreground">Width (px)</label>
              <input
                type="number"
                value={selectedWidget.width}
                onChange={(e) => handleUpdateGeometry('width', Number(e.target.value))}
                className="w-full bg-background border border-border rounded-lg px-2.5 py-1.5 text-xs text-foreground focus:outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="text-[10px] uppercase font-bold text-muted-foreground">Height (px)</label>
              <input
                type="number"
                value={selectedWidget.height}
                onChange={(e) => handleUpdateGeometry('height', Number(e.target.value))}
                className="w-full bg-background border border-border rounded-lg px-2.5 py-1.5 text-xs text-foreground focus:outline-none focus:border-primary"
              />
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Event Handlers */}
      {activeTab === 'events' && (
        <div className="space-y-3">
          <div className="p-3 bg-card border border-border rounded-xl space-y-2">
            <label className="text-xs font-bold text-foreground block">On-Click Action</label>
            <select className="w-full bg-background border border-border rounded-lg px-2.5 py-1.5 text-xs text-foreground focus:outline-none focus:border-primary">
              <option value="none">None (Passive)</option>
              <option value="navigate_view">Navigate to Studio View...</option>
              <option value="trigger_workflow">Execute Autonomous Agent Workflow...</option>
              <option value="run_query">Execute PostgreSQL Query (DES_BASE)...</option>
            </select>
          </div>
        </div>
      )}
    </div>
  );
};
