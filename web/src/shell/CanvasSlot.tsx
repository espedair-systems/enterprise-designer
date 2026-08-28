import React, { useState } from 'react';
import {
  ZoomIn,
  ZoomOut,
  Grid,
} from 'lucide-react';
import { useLayout } from './LayoutContext';
import { ExecutiveDashboardCanvas } from '../canvas/ExecutiveDashboardCanvas';
import { ProjectsDashboardCanvas } from '../canvas/ProjectsDashboardCanvas';
import { PageRegistryCanvas } from '../canvas/PageRegistryCanvas';
import { EntityRegistryCanvas } from '../canvas/EntityRegistryCanvas';
import { RecentActivityCanvas } from '../canvas/RecentActivityCanvas';
import { GlobalSearchCanvas } from '../canvas/GlobalSearchCanvas';
import { VisualCanvasGrid } from '../canvas/VisualCanvasGrid';
import { WireframeSketchCanvas } from '../canvas/WireframeSketchCanvas';
import { ProjectScaffoldCanvas } from '../canvas/ProjectScaffoldCanvas';
import { UseCaseDiagramCanvas } from '../canvas/UseCaseDiagramCanvas';
import { ActivityDiagramCanvas } from '../canvas/ActivityDiagramCanvas';
import { StateMachineCanvas } from '../canvas/StateMachineCanvas';
import { SequenceDiagramCanvas } from '../canvas/SequenceDiagramCanvas';
import { BehavioralDiagramsCanvas } from '../canvas/BehavioralDiagramsCanvas';
import { StructuralDiagramsCanvas } from '../canvas/StructuralDiagramsCanvas';
import { QRegistryCanvas } from '../canvas/q/QRegistryCanvas';
import { VisualSurveyDesignerCanvas } from '../canvas/q/VisualSurveyDesignerCanvas';
import { QuestionBankCanvas } from '../canvas/q/QuestionBankCanvas';
import { ReferenceDataCanvas } from '../canvas/q/ReferenceDataCanvas';
import { AuditSubmissionsCanvas } from '../canvas/q/AuditSubmissionsCanvas';
import { GuidanceDocsCanvas } from '../canvas/q/GuidanceDocsCanvas';
import { SchemaRegistryCanvas } from '../canvas/schema/SchemaRegistryCanvas';
import { VisualSchemaDesignerCanvas } from '../canvas/schema/VisualSchemaDesignerCanvas';
import { SchemaGraphVisualizerCanvas } from '../canvas/schema/SchemaGraphVisualizerCanvas';
import { OpenAPIManagerCanvas } from '../canvas/schema/OpenAPIManagerCanvas';
import { InteractiveAPIConsoleCanvas } from '../canvas/schema/InteractiveAPIConsoleCanvas';
import { DialectCatalogCanvas } from '../canvas/schema/DialectCatalogCanvas';
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
        {/* MODE 0: EXECUTIVE 4-LAYER DASHBOARD */}
        {canvasMode === 'executive_dashboard' && (
          <ExecutiveDashboardCanvas />
        )}

        {/* MODE 0.1: PROJECT REGISTRY TABLE */}
        {canvasMode === 'dashboard_projects' && (
          <ProjectsDashboardCanvas />
        )}

        {/* MODE 0.2: RECENT ACTIVITY & AUDIT LOG */}
        {canvasMode === 'recent_activity' && (
          <RecentActivityCanvas />
        )}

        {/* MODE 0.3: GLOBAL SEARCH */}
        {canvasMode === 'global_search' && (
          <GlobalSearchCanvas />
        )}

        {/* MODE 0.4: PAGE & ROUTE REGISTRY TABLE */}
        {canvasMode === 'page_registry' && (
          <PageRegistryCanvas />
        )}

        {/* MODE 0.4.1: ENTITY & SCHEMA REGISTRY TABLE */}
        {canvasMode === 'entity_registry' && (
          <EntityRegistryCanvas />
        )}

        {/* BEHAVIORAL DIAGRAMS (7) */}
        {canvasMode === 'use_case' && (
          <UseCaseDiagramCanvas />
        )}

        {canvasMode === 'activity_diagram' && (
          <ActivityDiagramCanvas />
        )}

        {canvasMode === 'state_machine' && (
          <StateMachineCanvas />
        )}

        {canvasMode === 'sequence_diagram' && (
          <SequenceDiagramCanvas />
        )}

        {(canvasMode === 'communication_diagram' ||
          canvasMode === 'interaction_overview_diagram' ||
          canvasMode === 'timing_diagram') && (
          <BehavioralDiagramsCanvas />
        )}

        {/* STRUCTURAL DIAGRAMS (7) */}
        {(canvasMode === 'class_diagram' ||
          canvasMode === 'object_diagram' ||
          canvasMode === 'component_diagram' ||
          canvasMode === 'deployment_diagram' ||
          canvasMode === 'package_diagram' ||
          canvasMode === 'composite_structure_diagram' ||
          canvasMode === 'profile_diagram') && (
          <StructuralDiagramsCanvas />
        )}

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

        {/* MODE 1.1: FIGMA / PENPOT WIREFRAME & SKETCH */}
        {canvasMode === 'ui_sketch' && (
          <WireframeSketchCanvas />
        )}

        {/* MODE 1.2: PROJECT SCAFFOLDING & BUILD PIPELINE */}
        {canvasMode === 'project_scaffold' && (
          <ProjectScaffoldCanvas />
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

        {/* Q DESIGNER SUBSYSTEM (DES_BASE.quest_*) */}
        {canvasMode === 'q_registry' && (
          <QRegistryCanvas />
        )}

        {canvasMode === 'q_designer' && (
          <VisualSurveyDesignerCanvas />
        )}

        {canvasMode === 'q_bank' && (
          <QuestionBankCanvas />
        )}

        {canvasMode === 'q_reference' && (
          <ReferenceDataCanvas />
        )}

        {canvasMode === 'q_responses' && (
          <AuditSubmissionsCanvas />
        )}

        {canvasMode === 'q_guidance' && (
          <GuidanceDocsCanvas />
        )}

        {/* SCHEMA & OPENAPI DESIGNER SUBSYSTEM (DES_BASE.schema_*) */}
        {canvasMode === 'schema_registry' && (
          <SchemaRegistryCanvas />
        )}

        {canvasMode === 'schema_designer' && (
          <VisualSchemaDesignerCanvas />
        )}

        {canvasMode === 'schema_graph' && (
          <SchemaGraphVisualizerCanvas />
        )}

        {canvasMode === 'openapi_manager' && (
          <OpenAPIManagerCanvas />
        )}

        {canvasMode === 'api_console' && (
          <InteractiveAPIConsoleCanvas />
        )}

        {canvasMode === 'dialect_catalog' && (
          <DialectCatalogCanvas />
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
