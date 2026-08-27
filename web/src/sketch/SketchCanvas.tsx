import React, { useState, useRef } from 'react';
import { SketchElement, StencilDefinition } from './types';
import { STENCIL_REGISTRY } from './stencils/registry';
import { Trash2, Move, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';

interface SketchCanvasProps {
  elements: SketchElement[];
  onUpdateElements: (elements: SketchElement[]) => void;
  selectedElementId: string | null;
  onSelectElement: (id: string | null) => void;
}

export const SketchCanvas: React.FC<SketchCanvasProps> = ({
  elements,
  onUpdateElements,
  selectedElementId,
  onSelectElement
}) => {
  const [zoom, setZoom] = useState(1);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const canvasRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = (e: React.MouseEvent, el: SketchElement) => {
    e.stopPropagation();
    onSelectElement(el.id);
    setDraggingId(el.id);
    setDragOffset({
      x: e.clientX - el.x * zoom,
      y: e.clientY - el.y * zoom
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!draggingId) return;
    const nextElements = elements.map((el) => {
      if (el.id === draggingId) {
        const rawX = (e.clientX - dragOffset.x) / zoom;
        const rawY = (e.clientY - dragOffset.y) / zoom;
        // Snap to 10px grid
        const snappedX = Math.round(rawX / 10) * 10;
        const snappedY = Math.round(rawY / 10) * 10;
        return { ...el, x: Math.max(10, snappedX), y: Math.max(10, snappedY) };
      }
      return el;
    });
    onUpdateElements(nextElements);
  };

  const handleMouseUp = () => {
    setDraggingId(null);
  };

  const addStencilToCanvas = (stencil: StencilDefinition) => {
    const newElement: SketchElement = {
      id: `el-${Date.now()}`,
      stencilId: stencil.id,
      name: stencil.name,
      x: 100 + elements.length * 15,
      y: 100 + elements.length * 15,
      width: stencil.defaultWidth,
      height: stencil.defaultHeight,
      label: stencil.name,
      category: stencil.category,
      slotTarget: stencil.slotAffinity,
      props: { ...stencil.defaultProps }
    };
    onUpdateElements([...elements, newElement]);
    onSelectElement(newElement.id);
  };

  const deleteSelected = () => {
    if (!selectedElementId) return;
    onUpdateElements(elements.filter((e) => e.id !== selectedElementId));
    onSelectElement(null);
  };

  return (
    <div className="flex flex-col h-full bg-background text-foreground rounded-xl border border-border overflow-hidden relative select-none shadow-xs">
      {/* Top Toolbar */}
      <div className="bg-card border-b border-border px-4 py-2.5 flex items-center justify-between z-10">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Stencils Palette:</span>
          <div className="flex flex-wrap gap-1.5 max-h-12 overflow-y-auto">
            {STENCIL_REGISTRY.map((s) => (
              <button
                key={s.id}
                onClick={() => addStencilToCanvas(s)}
                className="px-2 py-1 bg-muted hover:bg-primary/20 border border-border hover:border-primary rounded text-xs text-foreground transition-colors flex items-center gap-1 shadow-xs"
                title={`Add ${s.name}`}
              >
                <span>+</span>
                <span>{s.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Viewport Zoom Controls */}
        <div className="flex items-center gap-1 bg-muted/60 border border-border rounded-lg p-1">
          <button
            onClick={() => setZoom((z) => Math.max(0.5, z - 0.1))}
            className="p-1 text-muted-foreground hover:text-foreground rounded"
            title="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <span className="text-[11px] font-mono px-1 text-foreground">{Math.round(zoom * 100)}%</span>
          <button
            onClick={() => setZoom((z) => Math.min(2.0, z + 0.1))}
            className="p-1 text-muted-foreground hover:text-foreground rounded"
            title="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setZoom(1)}
            className="p-1 text-muted-foreground hover:text-foreground rounded border-l border-border ml-1"
            title="Reset Zoom"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
          {selectedElementId && (
            <button
              onClick={deleteSelected}
              className="p-1 text-destructive hover:text-destructive/80 rounded border-l border-border ml-1"
              title="Delete Selected Element"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Infinite Canvas Viewport */}
      <div
        ref={canvasRef}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onClick={() => onSelectElement(null)}
        className="flex-1 overflow-auto relative bg-background bg-[radial-gradient(hsl(var(--border))_1px,transparent_1px)] [background-size:16px_16px] cursor-crosshair min-h-[500px]"
      >
        <div
          style={{
            transform: `scale(${zoom})`,
            transformOrigin: '0 0',
            width: '2400px',
            height: '1600px',
            position: 'relative'
          }}
        >
          {elements.map((el) => {
            const isSelected = el.id === selectedElementId;
            const isShell = el.category === 'shell';
            const isWidget = el.category === 'widget';
            const isData = el.category === 'data';

            return (
              <div
                key={el.id}
                onMouseDown={(e) => handleMouseDown(e, el)}
                style={{
                  position: 'absolute',
                  left: `${el.x}px`,
                  top: `${el.y}px`,
                  width: `${el.width}px`,
                  height: `${el.height}px`
                }}
                className={`rounded-lg transition-shadow cursor-move flex flex-col justify-between p-2.5 border text-xs font-mono select-none ${
                  isSelected
                    ? 'ring-2 ring-primary border-primary shadow-lg shadow-primary/20'
                    : 'border-border hover:border-primary/50'
                } ${
                  isShell
                    ? 'bg-card border-dashed text-muted-foreground'
                    : isWidget
                    ? 'bg-card border-primary/40 text-foreground shadow-md backdrop-blur-sm'
                    : isData
                    ? 'bg-card border-emerald-500/40 text-foreground'
                    : 'bg-card border-amber-500/40 text-foreground'
                }`}
              >
                {/* Header */}
                <div className="flex items-center justify-between border-b border-border pb-1">
                  <span className="font-semibold truncate max-w-[80%] text-foreground">{el.label || el.name}</span>
                  <Move className="w-3 h-3 text-muted-foreground opacity-60" />
                </div>

                {/* Body Details */}
                <div className="flex-1 flex flex-col justify-center items-center py-2 text-center text-[10px] text-muted-foreground">
                  {el.stencilId === 'widget-metric-card' && (
                    <div className="text-emerald-500 font-bold text-sm">{el.props.value || '$240,000'}</div>
                  )}
                  {el.stencilId === 'widget-data-table' && (
                    <div className="text-muted-foreground italic">5 Columns • Multi-sort • Pagination</div>
                  )}
                  {el.stencilId === 'widget-er-table' && (
                    <div className="text-emerald-500 font-semibold">{el.name} (PostgreSQL Table)</div>
                  )}
                  {isShell && (
                    <div className="text-primary uppercase font-semibold text-[9px] tracking-wider">
                      Slot: {el.slotTarget || 'Canvas'}
                    </div>
                  )}
                </div>

                {/* Footer Meta */}
                <div className="flex items-center justify-between text-[9px] text-muted-foreground opacity-80 border-t border-border pt-1">
                  <span>{el.category}</span>
                  <span>
                    {el.width}x{el.height}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
