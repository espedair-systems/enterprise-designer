import React, { useState } from 'react';
import { SketchDocument, SketchElement, SlotToolAssignment, GeneratedLayoutDSL } from './types';
import { PRESET_ANALYTICS_STUDIO, PRESET_AGENT_STUDIO, PRESET_DATA_MODELER } from './presets';
import { SketchCanvas } from './SketchCanvas';
import { SlotToolPlacer } from './SlotToolPlacer';
import { SketchPromoter } from './promoter';
import { Sparkles, Code, Database, Layout, ArrowRight, Download, RefreshCw, CheckCircle2 } from 'lucide-react';

interface SketchStudioProps {
  onPromoteToLiveApp?: (dsl: GeneratedLayoutDSL, schematicsDraft: string) => void;
}

export const SketchStudio: React.FC<SketchStudioProps> = ({ onPromoteToLiveApp }) => {
  const [currentDoc, setCurrentDoc] = useState<SketchDocument>(PRESET_ANALYTICS_STUDIO);
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const [showExportModal, setShowExportModal] = useState<boolean>(false);
  const [generatedDSL, setGeneratedDSL] = useState<GeneratedLayoutDSL | null>(null);
  const [schematicsSql, setSchematicsSql] = useState<string>('');

  const loadPreset = (preset: SketchDocument) => {
    setCurrentDoc({ ...preset, updated_at: new Date().toISOString() });
    setSelectedElementId(null);
  };

  const handleUpdateElements = (elements: SketchElement[]) => {
    setCurrentDoc((prev) => ({ ...prev, elements, updated_at: new Date().toISOString() }));
  };

  const handleUpdateAssignments = (slotAssignments: SlotToolAssignment[]) => {
    setCurrentDoc((prev) => ({ ...prev, slotAssignments, updated_at: new Date().toISOString() }));
  };

  const handlePromoteClick = () => {
    const dsl = SketchPromoter.promoteToLayoutDSL(currentDoc);
    const sql = SketchPromoter.generateSchematicsDraft(currentDoc);
    setGeneratedDSL(dsl);
    setSchematicsSql(sql);
    setShowExportModal(true);
  };

  const handleConfirmPromotion = () => {
    if (generatedDSL && onPromoteToLiveApp) {
      onPromoteToLiveApp(generatedDSL, schematicsSql);
    }
    setShowExportModal(false);
  };

  return (
    <div className="flex flex-col h-full bg-background text-foreground p-4 gap-4 overflow-y-auto">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-card border border-border rounded-xl p-4 gap-3 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-primary text-primary-foreground text-xs font-bold px-2 py-0.5 rounded">Phase 0</span>
            <h1 className="text-lg font-bold text-foreground flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              EA Conceptual Sketch & Wireframe Designer
            </h1>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Freeform wireframing and layout conceptualization inspired by Open-Pencil & Penpot. Rapidly design shells,
            slots, and tools before generating Go code.
          </p>
        </div>

        {/* Action Controls & Presets */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1 bg-muted/60 border border-border rounded-lg p-1">
            <span className="text-[10px] text-muted-foreground font-semibold uppercase px-1.5">Presets:</span>
            <button
              onClick={() => loadPreset(PRESET_ANALYTICS_STUDIO)}
              className="px-2 py-1 text-xs bg-card hover:bg-muted rounded text-foreground border border-border shadow-xs"
            >
              Analytics Studio
            </button>
            <button
              onClick={() => loadPreset(PRESET_AGENT_STUDIO)}
              className="px-2 py-1 text-xs bg-card hover:bg-muted rounded text-foreground border border-border shadow-xs"
            >
              Agent Studio
            </button>
            <button
              onClick={() => loadPreset(PRESET_DATA_MODELER)}
              className="px-2 py-1 text-xs bg-card hover:bg-muted rounded text-foreground border border-border shadow-xs"
            >
              Data Modeler
            </button>
          </div>

          <button
            onClick={handlePromoteClick}
            className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-3.5 py-2 rounded-lg text-xs font-bold shadow-xs transition-all cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>Promote to Living Studio App</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Grid: Slot Tool Placer + Sketch Canvas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left Column: Shell Slot Placer & Properties */}
        <div className="flex flex-col gap-4">
          <SlotToolPlacer
            assignments={currentDoc.slotAssignments}
            onUpdateAssignments={handleUpdateAssignments}
          />

          {/* Active App Info Card */}
          <div className="bg-card border border-border rounded-xl p-4 flex flex-col gap-2.5 text-xs shadow-xs">
            <span className="font-semibold text-foreground flex items-center gap-1.5 text-primary">
              <Code className="w-4 h-4" /> Sketch Document Metadata
            </span>
            <div className="space-y-1.5 text-muted-foreground">
              <div>
                <span className="text-muted-foreground">App Name: </span>
                <span className="font-mono text-foreground font-semibold">{currentDoc.appName}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Target Type: </span>
                <span className="font-mono text-primary uppercase font-bold">{currentDoc.appType}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Elements Count: </span>
                <span className="font-mono text-foreground">{currentDoc.elements.length} objects</span>
              </div>
              <div>
                <span className="text-muted-foreground">Database: </span>
                <span className="font-mono text-emerald-500 font-bold">PostgreSQL (DES_BASE)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Center & Right Column: Interactive Sketch Canvas */}
        <div className="lg:col-span-2 min-h-[560px]">
          <SketchCanvas
            elements={currentDoc.elements}
            onUpdateElements={handleUpdateElements}
            selectedElementId={selectedElementId}
            onSelectElement={setSelectedElementId}
          />
        </div>
      </div>

      {/* Export / Promote Preview Modal */}
      {showExportModal && generatedDSL && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl max-w-2xl w-full p-6 flex flex-col gap-4 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                Ready to Promote: {generatedDSL.app_name}
              </h2>
              <button
                onClick={() => setShowExportModal(false)}
                className="text-muted-foreground hover:text-foreground text-sm font-mono"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-muted-foreground">
              The conceptual wireframe has been compiled into standard **ESPEDAIR Layout DSL** and **Schematics Data
              Models**. Clicking promote will scaffold the Go hexagonal backend and React 19 shell.
            </p>

            {/* Generated Code Previews */}
            <div className="space-y-3">
              <div>
                <span className="text-[11px] font-semibold text-foreground block mb-1">
                  1. Generated `layout_dsl.json`:
                </span>
                <pre className="bg-background p-3 rounded-lg text-[11px] font-mono text-primary max-h-40 overflow-y-auto border border-border">
                  {JSON.stringify(generatedDSL, null, 2)}
                </pre>
              </div>

              <div>
                <span className="text-[11px] font-semibold text-foreground block mb-1">
                  2. Generated Schematics SQL Schema Draft:
                </span>
                <pre className="bg-background p-3 rounded-lg text-[11px] font-mono text-emerald-600 dark:text-emerald-400 max-h-32 overflow-y-auto border border-border">
                  {schematicsSql}
                </pre>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 border-t border-border pt-3">
              <button
                onClick={() => setShowExportModal(false)}
                className="px-4 py-2 rounded-lg text-xs font-semibold bg-muted hover:bg-muted/80 text-foreground"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmPromotion}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold bg-primary hover:bg-primary/90 text-primary-foreground shadow-xs"
              >
                <Sparkles className="w-4 h-4" />
                <span>Confirm & Scaffold Living Studio App</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
