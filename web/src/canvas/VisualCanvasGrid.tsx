import React, { useState, useRef, useEffect } from 'react';
import {
  Maximize2,
  Trash2,
  Copy,
  Move,
  Eye,
  Edit3,
  Sparkles,
} from 'lucide-react';
import { useLayout } from '../shell/LayoutContext';
import { WIDGET_REGISTRY } from '../widgets/registry';
import { ExpressionEvaluator } from '../evaluator/evaluator';
import { CanvasWidgetInstance } from '../shell/types';

interface VisualCanvasGridProps {
  selectedWidgetId: string | null;
  onSelectWidget: (id: string | null) => void;
  showGrid?: boolean;
}

export const VisualCanvasGrid: React.FC<VisualCanvasGridProps> = ({
  selectedWidgetId,
  onSelectWidget,
  showGrid = true,
}) => {
  const { slots, updateSlots, currentApp } = useLayout();
  const [isLivePreview, setIsLivePreview] = useState<boolean>(false);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [resizingId, setResizingId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [resizeStart, setResizeStart] = useState<{ x: number; y: number; w: number; h: number }>({
    x: 0,
    y: 0,
    w: 0,
    h: 0,
  });

  const canvasRef = useRef<HTMLDivElement>(null);
  const widgets: CanvasWidgetInstance[] = slots.canvas?.widgets || [];

  const evaluationContext = {
    app: currentApp || { name: 'Fleet Logistics Studio', slug: 'fleet-logistics' },
    workspace: { id: 'ws-designer-default', name: 'Default Workspace' },
    datasources: {
      postgres: { status: 'CONNECTED', schema: 'DES_BASE', pool: 25 },
    },
    user: { role: 'Enterprise Architect' },
  };

  const snapToGrid = (val: number, step = 20): number => {
    return Math.round(val / step) * step;
  };

  const handleMouseDownDrag = (e: React.MouseEvent, widget: CanvasWidgetInstance) => {
    if (isLivePreview) return;
    e.stopPropagation();
    onSelectWidget(widget.id);
    setDraggingId(widget.id);
    setDragOffset({
      x: e.clientX - widget.x,
      y: e.clientY - widget.y,
    });
  };

  const handleMouseDownResize = (e: React.MouseEvent, widget: CanvasWidgetInstance) => {
    if (isLivePreview) return;
    e.stopPropagation();
    onSelectWidget(widget.id);
    setResizingId(widget.id);
    setResizeStart({
      x: e.clientX,
      y: e.clientY,
      w: widget.width,
      h: widget.height,
    });
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (draggingId) {
        const newX = snapToGrid(Math.max(0, e.clientX - dragOffset.x));
        const newY = snapToGrid(Math.max(0, e.clientY - dragOffset.y));

        const updated = widgets.map((w) => {
          if (w.id === draggingId) {
            return { ...w, x: newX, y: newY };
          }
          return w;
        });

        updateSlots({
          canvas: {
            ...slots.canvas,
            widgets: updated,
          },
        });
      } else if (resizingId) {
        const deltaX = e.clientX - resizeStart.x;
        const deltaY = e.clientY - resizeStart.y;
        const newW = snapToGrid(Math.max(120, resizeStart.w + deltaX));
        const newH = snapToGrid(Math.max(60, resizeStart.h + deltaY));

        const updated = widgets.map((w) => {
          if (w.id === resizingId) {
            return { ...w, width: newW, height: newH };
          }
          return w;
        });

        updateSlots({
          canvas: {
            ...slots.canvas,
            widgets: updated,
          },
        });
      }
    };

    const handleMouseUp = () => {
      setDraggingId(null);
      setResizingId(null);
    };

    if (draggingId || resizingId) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [draggingId, resizingId, dragOffset, resizeStart, widgets, slots.canvas, updateSlots]);

  return (
    <div
      ref={canvasRef}
      onClick={() => onSelectWidget(null)}
      className={`w-full h-full min-w-[1200px] min-h-[900px] relative transition-colors bg-background ${
        showGrid
          ? 'bg-[radial-gradient(hsl(var(--border))_1px,transparent_1px)] [background-size:20px_20px]'
          : 'bg-background'
      }`}
    >
      {/* Top Banner: Mode Indicator */}
      <div className="absolute top-3 left-4 z-10 flex items-center gap-2">
        <button
          type="button"
          onClick={() => setIsLivePreview(!isLivePreview)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold shadow-xs backdrop-blur-md border transition-all ${
            isLivePreview
              ? 'bg-emerald-600 text-white border-emerald-500 shadow-sm'
              : 'bg-card/90 text-foreground border-border hover:bg-muted'
          }`}
        >
          {isLivePreview ? <Eye className="w-3.5 h-3.5" /> : <Edit3 className="w-3.5 h-3.5" />}
          <span>{isLivePreview ? 'Live Preview Mode' : 'Edit Grid Mode'}</span>
        </button>

        <span className="text-[10px] text-muted-foreground font-mono px-2 py-1 bg-card/70 rounded-md border border-border">
          20px Snap Grid • {widgets.length} Widgets Placed
        </span>
      </div>

      {/* Placed Widgets */}
      {widgets.map((widget) => {
        const isSelected = selectedWidgetId === widget.id;
        const widgetDef = WIDGET_REGISTRY[widget.type];
        const evaluatedProps = ExpressionEvaluator.evaluateWidgetProps(widget.props || {}, evaluationContext);
        const WidgetComponent = widgetDef?.render;

        return (
          <div
            key={widget.id}
            onClick={(e) => {
              e.stopPropagation();
              onSelectWidget(widget.id);
            }}
            style={{
              position: 'absolute',
              left: `${widget.x}px`,
              top: `${widget.y}px`,
              width: `${widget.width}px`,
              height: `${widget.height}px`,
            }}
            className={`group transition-shadow ${
              isSelected && !isLivePreview
                ? 'ring-2 ring-primary shadow-xl shadow-primary/10 rounded-xl z-20'
                : 'hover:ring-1 hover:ring-border rounded-xl z-10'
            }`}
          >
            {/* Widget Selection Bounding Controls */}
            {isSelected && !isLivePreview && (
              <div className="absolute -top-7 left-0 right-0 flex items-center justify-between pointer-events-none">
                <div className="bg-primary text-primary-foreground text-[10px] font-bold px-2 py-0.5 rounded shadow pointer-events-auto flex items-center gap-1.5">
                  <Move
                    className="w-3 h-3 cursor-grab"
                    onMouseDown={(e) => handleMouseDownDrag(e, widget)}
                  />
                  <span>{widget.title}</span>
                  <span className="font-mono text-[9px] opacity-80">
                    ({widget.x}, {widget.y})
                  </span>
                </div>
              </div>
            )}

            {/* Render Component */}
            <div className="w-full h-full">
              {WidgetComponent ? (
                <WidgetComponent
                  id={widget.id}
                  title={widget.title}
                  props={evaluatedProps}
                  isSelected={isSelected}
                  isEditing={!isLivePreview}
                  onSelect={() => onSelectWidget(widget.id)}
                />
              ) : (
                <div className="w-full h-full bg-card border border-border rounded-xl p-4 flex flex-col items-center justify-center text-muted-foreground">
                  <p className="text-xs font-semibold">{widget.title}</p>
                  <p className="text-[10px]">Unknown Widget: {widget.type}</p>
                </div>
              )}
            </div>

            {/* Resize Handle on Bottom Right */}
            {isSelected && !isLivePreview && (
              <div
                onMouseDown={(e) => handleMouseDownResize(e, widget)}
                className="absolute -bottom-1 -right-1 w-4 h-4 bg-primary rounded-br cursor-se-resize flex items-center justify-center text-primary-foreground z-30 shadow"
                title="Resize Component"
              >
                <div className="w-1.5 h-1.5 bg-primary-foreground rounded-full" />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
