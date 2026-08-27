import React, { useState } from 'react';
import {
  ZoomIn,
  ZoomOut,
  Grid,
} from 'lucide-react';
import { useLayout } from './LayoutContext';
import { VisualCanvasGrid } from '../canvas/VisualCanvasGrid';
import { ERModelerCanvas, ERTableDef } from '../datamodel/ERModelerCanvas';
import { LineageDAGView } from '../lineage/LineageDAGView';
import { SqlEditorView } from '../sqleditor/SqlEditorView';
import { MigrationPlannerModal } from '../datamodel/MigrationPlannerModal';

export const CanvasSlot: React.FC = () => {
  const {
    slots,
    canvasMode,
    setCanvasMode,
    currentApp,
    selectedWidgetId,
    setSelectedWidgetId,
  } = useLayout();
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [showGrid, setShowGrid] = useState<boolean>(true);
  const [showMigrationModal, setShowMigrationModal] = useState<boolean>(false);
  const [migrationTables, setMigrationTables] = useState<ERTableDef[]>([]);

  const handleOpenMigrationPlanner = (tables: ERTableDef[]) => {
    setMigrationTables(tables);
    setShowMigrationModal(true);
  };

  return (
    <main
      className="flex-1 flex flex-col bg-background text-foreground overflow-hidden relative select-none"
      aria-label="Center Canvas Slot"
    >
      {/* Canvas Viewport Floating Controls */}
      {canvasMode === 'visual_canvas' && (
        <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-card/90 border border-border rounded-xl p-1.5 shadow-xl backdrop-blur-md z-20">
          <button
            type="button"
            onClick={() => setZoomLevel((z) => Math.max(50, z - 10))}
            className="p-1 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors"
            title="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <span className="text-[11px] font-mono font-medium text-foreground px-1.5">{zoomLevel}%</span>
          <button
            type="button"
            onClick={() => setZoomLevel((z) => Math.min(200, z + 10))}
            className="p-1 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors"
            title="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <div className="w-px h-3.5 bg-border mx-0.5" />
          <button
            type="button"
            onClick={() => setShowGrid((g) => !g)}
            className={`p-1 rounded-md transition-colors ${showGrid ? 'text-primary bg-muted shadow-xs' : 'text-muted-foreground hover:text-foreground'}`}
            title="Toggle Canvas Grid"
          >
            <Grid className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Main Canvas Multi-Mode Viewport */}
      <div className="flex-1 overflow-auto relative transition-all h-full bg-background">
        {/* MODE 1: VISUAL APP CANVAS (DRAG & DROP GRID) */}
        {canvasMode === 'visual_canvas' && (
          <div
            className="h-full p-4"
            style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'top left' }}
          >
            <VisualCanvasGrid
              selectedWidgetId={selectedWidgetId}
              onSelectWidget={setSelectedWidgetId}
              showGrid={showGrid}
            />
          </div>
        )}

        {/* MODE 2: ER MODELER */}
        {canvasMode === 'er_modeler' && (
          <ERModelerCanvas onOpenMigrationPlanner={handleOpenMigrationPlanner} />
        )}

        {/* MODE 3: COLUMN-LEVEL LINEAGE (CLL) DAG */}
        {canvasMode === 'lineage_dag' && (
          <LineageDAGView />
        )}

        {/* MODE 4: AST SQL CONSOLE */}
        {canvasMode === 'sql_editor' && (
          <SqlEditorView />
        )}

        {/* MODE 5: WORKFLOW / AGENT GRAPH */}
        {canvasMode === 'workflow_graph' && (
          <LineageDAGView />
        )}
      </div>

      {/* Migration Planner Centered Modal */}
      <MigrationPlannerModal
        isOpen={showMigrationModal}
        onClose={() => setShowMigrationModal(false)}
        tables={migrationTables}
      />
    </main>
  );
};
