import React, { useState, useRef } from 'react';
import {
  PenTool,
  Square,
  Type,
  Layout,
  Table,
  FormInput,
  MousePointer,
  Trash2,
  Plus,
  ArrowRight,
  Download,
  Upload,
  Sparkles,
  Move,
  Layers,
  Check,
  CreditCard,
  Terminal,
  Monitor,
  FolderCode,
  Copy,
  RotateCcw,
  FileJson,
} from 'lucide-react';
import { useLayout } from '../shell/LayoutContext';

export interface SketchElement {
  id: string;
  type: 'frame' | 'card' | 'button' | 'input' | 'table' | 'text' | 'badge' | 'nav_list' | 'tui_box' | 'status_bar';
  title: string;
  x: number;
  y: number;
  width: number;
  height: number;
  color?: string;
  props?: Record<string, any>;
}

export type SketchLayoutTarget = 'react_web' | 'bubbletea_tui' | 'custom';

// ── Layout Preset 1: Enterprise Designer React App (5-Slot Workbench) ──
const REACT_WEB_PRESET_ELEMENTS: SketchElement[] = [
  {
    id: 'elem-rw-window',
    type: 'frame',
    title: 'Enterprise Designer Web SPA Window (1240 × 740)',
    x: 40,
    y: 20,
    width: 1200,
    height: 720,
    color: 'border-primary/50 bg-background/80',
  },
  {
    id: 'elem-rw-rail',
    type: 'card',
    title: 'Slot 1: Full-Height Activity Rail (ED)',
    x: 60,
    y: 40,
    width: 70,
    height: 680,
    color: 'border-border bg-card/90 text-primary',
    props: { items: ['Dashboard', 'Projects', 'UI Designer', 'Data Designer', 'Agent Designer', 'ED Badge'] },
  },
  {
    id: 'elem-rw-leftpanel',
    type: 'card',
    title: 'Slot 2: Left Tool Panel / Concertina Toolbox (w-72)',
    x: 140,
    y: 40,
    width: 250,
    height: 680,
    color: 'border-border bg-card/70',
    props: { sections: ['Display', 'Input', 'Visual', 'Container', 'Actions'] },
  },
  {
    id: 'elem-rw-topbar',
    type: 'card',
    title: 'Slot 3: Top Menu Bar (5 Domain Modes + DES_BASE:8088)',
    x: 400,
    y: 40,
    width: 820,
    height: 54,
    color: 'border-border bg-card/90',
    props: { modes: ['Dashboard', 'Projects', 'UI Designer', 'Data Designer', 'Agent Designer'] },
  },
  {
    id: 'elem-rw-canvas',
    type: 'card',
    title: 'Slot 4: Center Visual Canvas Grid (Multi-Mode Viewport)',
    x: 400,
    y: 104,
    width: 580,
    height: 440,
    color: 'border-primary/40 bg-primary/5',
    props: { mode: 'visual_canvas' },
  },
  {
    id: 'elem-rw-grid-table',
    type: 'table',
    title: 'Data Grid (PostgreSQL DES_BASE.designer_apps)',
    x: 420,
    y: 130,
    width: 540,
    height: 380,
    color: 'border-cyan-500/40 bg-cyan-500/5',
  },
  {
    id: 'elem-rw-inspector',
    type: 'card',
    title: 'Slot 5: Resizable Properties Inspector (240px - 600px)',
    x: 990,
    y: 104,
    width: 230,
    height: 440,
    color: 'border-border bg-card/80',
    props: { tabs: ['Inspector', 'Bindings', 'Validation', 'Events'] },
  },
  {
    id: 'elem-rw-bottomtray',
    type: 'card',
    title: 'Slot 6: Bottom Console Tray (Query Runner, AST Logs, Telemetry)',
    x: 400,
    y: 554,
    width: 820,
    height: 166,
    color: 'border-border bg-card/90 font-mono',
    props: { tabs: ['Query Runner', 'SQL Logs', 'Test Runner', 'Terminal'] },
  },
];

// ── Layout Preset 2: Enterprise Designer Bubbletea Terminal TUI ──
const BUBBLETEA_TUI_PRESET_ELEMENTS: SketchElement[] = [
  {
    id: 'elem-tui-frame',
    type: 'tui_box',
    title: 'Terminal TUI Window: base tui (1100 × 620)',
    x: 60,
    y: 30,
    width: 1080,
    height: 600,
    color: 'border-emerald-500/60 bg-zinc-950 text-emerald-400 font-mono',
  },
  {
    id: 'elem-tui-header',
    type: 'status_bar',
    title: '┌─ ENTERPRISE DESIGNER TUI v1.0.0 [DES_BASE:8088] ──────────────────────┐',
    x: 80,
    y: 50,
    width: 1040,
    height: 36,
    color: 'border-emerald-500/40 bg-zinc-900 text-emerald-400 font-mono font-bold',
  },
  {
    id: 'elem-tui-nav',
    type: 'nav_list',
    title: 'Navigation Menu Pane',
    x: 80,
    y: 96,
    width: 240,
    height: 450,
    color: 'border-emerald-500/30 bg-zinc-900/80 font-mono',
    props: {
      items: [
        '❯ [1] Apps Directory (DES_BASE)',
        '  [2] Layouts & Slots',
        '  [3] Schema Entities & DDL',
        '  [4] Column Lineage DAG',
        '  [5] AST SQL Console',
        '  [6] Telemetry & Logs',
      ],
    },
  },
  {
    id: 'elem-tui-viewport',
    type: 'tui_box',
    title: 'Center Viewport: Active Applications Table',
    x: 330,
    y: 96,
    width: 790,
    height: 320,
    color: 'border-emerald-500/30 bg-zinc-900/60 font-mono',
    props: {
      columns: ['APP ID', 'NAME', 'SLUG', 'TYPE', 'STATUS'],
      rows: [
        ['app-101', 'Fleet Logistics Studio', 'fleet-logistics', 'studio', 'DRAFT'],
        ['app-102', 'Enterprise Data Hub', 'data-artist', 'datamodeler', 'PUBLISHED'],
        ['app-103', 'Architecture Agent Graph', 'agent-graph', 'agent', 'SCAFFOLDED'],
      ],
    },
  },
  {
    id: 'elem-tui-logs',
    type: 'tui_box',
    title: 'Live SQL Query Trace & Telemetry Stream',
    x: 330,
    y: 426,
    width: 790,
    height: 120,
    color: 'border-emerald-500/20 bg-zinc-900/40 font-mono text-[10px] text-zinc-400',
    props: {
      logs: [
        '[2026-08-28 10:30:01] SELECT * FROM DES_BASE.designer_apps ORDER BY created_at DESC;',
        '[2026-08-28 10:30:02] Query executed in 1.42ms (pgx connection pool: 25 max).',
      ],
    },
  },
  {
    id: 'elem-tui-footer',
    type: 'status_bar',
    title: '└─ [q] Quit  [tab] Switch Pane  [/] Filter  [Enter] Select  [s] Sync DDL ─┘',
    x: 80,
    y: 556,
    width: 1040,
    height: 34,
    color: 'border-emerald-500/40 bg-zinc-900 text-emerald-400 font-mono text-xs',
  },
];

export const WireframeSketchCanvas: React.FC = () => {
  const { setCanvasMode, setActiveLeftPanel, updateSlots, currentApp } = useLayout();
  const [elements, setElements] = useState<SketchElement[]>(REACT_WEB_PRESET_ELEMENTS);
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const [activeTool, setActiveTool] = useState<string>('select');
  const [activeTarget, setActiveTarget] = useState<SketchLayoutTarget>('react_web');
  const [notification, setNotification] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 2500);
  };

  const handleApplyPreset = (target: SketchLayoutTarget) => {
    setActiveTarget(target);
    if (target === 'react_web') {
      setElements(REACT_WEB_PRESET_ELEMENTS);
      showNotification('Loaded React Web SPA (5-Slot Workbench) Layout!');
    } else if (target === 'bubbletea_tui') {
      setElements(BUBBLETEA_TUI_PRESET_ELEMENTS);
      showNotification('Loaded Bubbletea Terminal TUI (base tui) Layout!');
    } else {
      setElements([]);
      showNotification('Canvas cleared.');
    }
    setSelectedElementId(null);
  };

  const handleAddElement = (type: SketchElement['type']) => {
    const id = `elem-${Date.now().toString().slice(-4)}`;
    const newElement: SketchElement = {
      id,
      type,
      title: `New ${type.charAt(0).toUpperCase() + type.slice(1)} Component`,
      x: 120 + (elements.length % 5) * 30,
      y: 120 + (elements.length % 5) * 30,
      width: type === 'button' ? 140 : type === 'input' ? 220 : type === 'table' ? 440 : 260,
      height: type === 'button' ? 36 : type === 'input' ? 42 : type === 'table' ? 240 : 160,
      color:
        type === 'button'
          ? 'border-primary bg-primary text-primary-foreground'
          : 'border-border bg-card/80',
    };
    setElements([...elements, newElement]);
    setSelectedElementId(id);
  };

  const handleDeleteSelected = () => {
    if (!selectedElementId) return;
    setElements(elements.filter((e) => e.id !== selectedElementId));
    setSelectedElementId(null);
  };

  // ── Export JSON Schema Definition ──
  const handleExportJSON = () => {
    const sketchDocument = {
      $schema: 'https://espedair.systems/schemas/designer/sketch-schema.json',
      version: '1.0.0',
      title: `${currentApp?.name || 'Fleet Logistics'} - Wireframe Sketch`,
      description: 'Enterprise Designer visual wireframe sketch data schema',
      target: activeTarget,
      canvas: { width: 1400, height: 900, gridSize: 20 },
      elements,
      metadata: {
        author: 'Lead Architect',
        app_id: currentApp?.id || 'fleet-logistics',
        database_schema: 'DES_BASE',
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const jsonString = JSON.stringify(sketchDocument, null, 2);

    // Trigger Download
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sketch-${activeTarget}-${Date.now().toString().slice(-6)}.json`;
    a.click();
    URL.revokeObjectURL(url);

    // Also Copy to Clipboard
    navigator.clipboard.writeText(jsonString);
    showNotification('Exported sketch JSON (Downloaded & Copied to clipboard)!');
  };

  // ── Import JSON Schema Definition ──
  const handleImportJSONClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed && Array.isArray(parsed.elements)) {
          setElements(parsed.elements);
          if (parsed.target) {
            setActiveTarget(parsed.target);
          }
          showNotification(`Imported ${parsed.elements.length} sketch elements successfully!`);
        } else {
          showNotification('Invalid sketch JSON schema: missing elements array.');
        }
      } catch (err) {
        showNotification('Error parsing JSON file.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // ── Bridge to Visual Canvas Grid ──
  const handleConvertBridgeToUIDesigner = () => {
    const convertedWidgets = elements
      .filter((e) => e.type !== 'frame' && e.type !== 'tui_box' && e.type !== 'status_bar')
      .map((e, idx) => ({
        id: `widget-${idx + 1}`,
        type: e.type === 'table' ? 'DataTable' : e.type === 'button' ? 'ActionForm' : 'HeaderCard',
        x: e.x,
        y: e.y,
        width: e.width,
        height: e.height,
        title: e.title,
        props: {
          generatedFrom: 'Penpot/Figma Wireframe Sketch',
          dataSource: 'DES_BASE.designer_apps',
        },
      }));

    updateSlots({
      canvas: {
        mode: 'visual_canvas',
        widgets: convertedWidgets,
      },
    });

    showNotification('Wireframe exported to Visual Canvas Grid!');
    setTimeout(() => {
      setCanvasMode('visual_canvas');
      setActiveLeftPanel('widget_toolbox');
    }, 1000);
  };

  const selectedElement = elements.find((e) => e.id === selectedElementId);

  return (
    <div className="flex-1 h-full bg-background flex flex-col overflow-hidden select-none relative">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".json,application/json"
        className="hidden"
      />

      {/* ── Top Sketch Toolbar ── */}
      <div className="h-14 border-b border-border bg-card/80 backdrop-blur-md px-4 flex items-center justify-between shrink-0 z-20 gap-3">
        {/* Left: Tool Selection */}
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-1">
          {/* Drawing Tools */}
          <div className="flex items-center gap-1 bg-muted/60 p-1 rounded-xl border border-border">
            <button
              type="button"
              onClick={() => setActiveTool('select')}
              className={`p-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTool === 'select'
                  ? 'bg-primary text-primary-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              title="Select / Move Tool"
            >
              <MousePointer className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={() => handleAddElement('card')}
              className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
              title="Add Card Container"
            >
              <Square className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={() => handleAddElement('table')}
              className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
              title="Add Data Table Mockup"
            >
              <Table className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={() => handleAddElement('input')}
              className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
              title="Add Form Input"
            >
              <FormInput className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={() => handleAddElement('button')}
              className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
              title="Add Action Button"
            >
              <CreditCard className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={() => handleAddElement('text')}
              className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
              title="Add Text Annotation"
            >
              <Type className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="w-px h-5 bg-border mx-1" />

          {/* Layout Presets (React Web SPA vs Bubbletea TUI) */}
          <div className="flex items-center gap-1 bg-muted/60 p-1 rounded-xl border border-border">
            <span className="text-[10px] font-bold text-muted-foreground px-1 uppercase tracking-wider">
              Layout:
            </span>
            <button
              type="button"
              onClick={() => handleApplyPreset('react_web')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTarget === 'react_web'
                  ? 'bg-card text-primary shadow-xs border border-border'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              title="Load Enterprise Designer React App 5-Slot Layout"
            >
              <Monitor className="w-3.5 h-3.5 text-primary" />
              <span>React Web SPA</span>
            </button>

            <button
              type="button"
              onClick={() => handleApplyPreset('bubbletea_tui')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTarget === 'bubbletea_tui'
                  ? 'bg-card text-emerald-400 shadow-xs border border-border'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              title="Load Enterprise Designer Bubbletea Terminal TUI Layout"
            >
              <Terminal className="w-3.5 h-3.5 text-emerald-400" />
              <span>Bubbletea TUI</span>
            </button>

            <button
              type="button"
              onClick={() => handleApplyPreset('custom')}
              className="p-1 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
              title="Clear to Blank Canvas"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>

          {selectedElement && (
            <button
              type="button"
              onClick={handleDeleteSelected}
              className="flex items-center gap-1 px-2.5 py-1 text-xs text-destructive hover:bg-destructive/10 rounded-lg transition-colors cursor-pointer ml-1"
              title="Delete Selected Element"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete</span>
            </button>
          )}
        </div>

        {/* Right Actions: Import, Export, & Bridge */}
        <div className="flex items-center gap-2 shrink-0">
          {notification && (
            <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1.5 animate-in fade-in">
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              {notification}
            </span>
          )}

          {/* Import JSON */}
          <button
            type="button"
            onClick={handleImportJSONClick}
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-muted/60 hover:bg-muted text-foreground border border-border text-xs font-semibold rounded-xl shadow-2xs transition-all cursor-pointer"
            title="Import sketch JSON schema definition"
          >
            <Upload className="w-3.5 h-3.5 text-muted-foreground" />
            <span>Import JSON</span>
          </button>

          {/* Export JSON */}
          <button
            type="button"
            onClick={handleExportJSON}
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-muted/60 hover:bg-muted text-foreground border border-border text-xs font-semibold rounded-xl shadow-2xs transition-all cursor-pointer"
            title="Export sketch data matching schema/sketch-schema.json"
          >
            <FileJson className="w-3.5 h-3.5 text-primary" />
            <span>Export JSON</span>
          </button>

          {/* Bridge to UI Designer */}
          <button
            type="button"
            onClick={handleConvertBridgeToUIDesigner}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-primary-foreground text-xs font-bold rounded-xl shadow-xs hover:bg-primary/90 transition-all cursor-pointer"
            title="Convert wireframe into live Visual Canvas Grid"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Generate UI Designer Layout</span>
          </button>
        </div>
      </div>

      {/* ── Main Wireframe Canvas (Dot Matrix Grid) ── */}
      <div
        className="flex-1 overflow-auto p-8 relative bg-background"
        style={{
          backgroundImage: 'radial-gradient(circle, var(--border) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
        onClick={() => setSelectedElementId(null)}
      >
        {elements.map((elem) => {
          const isSelected = selectedElementId === elem.id;

          return (
            <div
              key={elem.id}
              onClick={(e) => {
                e.stopPropagation();
                setSelectedElementId(elem.id);
              }}
              style={{
                transform: `translate3d(${elem.x}px, ${elem.y}px, 0)`,
                width: `${elem.width}px`,
                height: `${elem.height}px`,
              }}
              className={`absolute rounded-xl border p-3 flex flex-col justify-between transition-shadow shadow-xs cursor-move ${
                elem.color || 'border-border bg-card'
              } ${
                isSelected
                  ? 'ring-2 ring-primary border-primary shadow-lg z-30'
                  : 'hover:border-primary/50 z-10'
              }`}
            >
              {/* Header */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold truncate">{elem.title}</span>
                <span className="text-[9px] font-mono uppercase px-1.5 py-0.2 rounded bg-muted/60 text-muted-foreground">
                  {elem.type}
                </span>
              </div>

              {/* TUI Navigation List */}
              {elem.type === 'nav_list' && elem.props?.items && (
                <div className="my-auto space-y-1.5 text-[11px] font-mono">
                  {elem.props.items.map((it: string, i: number) => (
                    <div
                      key={i}
                      className={`p-1 rounded ${
                        i === 0 ? 'bg-emerald-500/20 text-emerald-300 font-bold' : 'text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      {it}
                    </div>
                  ))}
                </div>
              )}

              {/* TUI Box Viewport with Table */}
              {elem.type === 'tui_box' && elem.props?.columns && (
                <div className="my-auto border border-emerald-500/30 rounded-lg overflow-hidden text-[10px] font-mono">
                  <div className="bg-zinc-900 p-1.5 font-bold flex justify-between border-b border-emerald-500/30 text-emerald-400">
                    {elem.props.columns.map((c: string) => (
                      <span key={c}>{c}</span>
                    ))}
                  </div>
                  <div className="p-1.5 space-y-1 text-zinc-300">
                    {elem.props.rows?.map((row: string[], ri: number) => (
                      <div key={ri} className="flex justify-between hover:bg-zinc-800/60 p-0.5 rounded">
                        {row.map((cell: string, ci: number) => (
                          <span key={ci}>{cell}</span>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TUI Logs Stream */}
              {elem.type === 'tui_box' && elem.props?.logs && (
                <div className="my-auto space-y-1 font-mono text-[10px] text-zinc-400">
                  {elem.props.logs.map((l: string, li: number) => (
                    <div key={li}>{l}</div>
                  ))}
                </div>
              )}

              {/* Standard Web Table Mockup */}
              {elem.type === 'table' && !elem.props?.columns && (
                <div className="my-auto border border-border/60 rounded-lg overflow-hidden text-[10px]">
                  <div className="bg-muted/40 p-1.5 font-bold flex justify-between border-b border-border/60">
                    <span>APP ID</span>
                    <span>NAME</span>
                    <span>STATUS</span>
                  </div>
                  <div className="p-1.5 space-y-1 text-muted-foreground">
                    <div className="flex justify-between">
                      <span>#app-1</span>
                      <span>Fleet Logistics Studio</span>
                      <span className="text-emerald-500 font-bold">DRAFT</span>
                    </div>
                    <div className="flex justify-between">
                      <span>#app-2</span>
                      <span>PostgreSQL Sink Engine</span>
                      <span className="text-primary font-bold">ACTIVE</span>
                    </div>
                  </div>
                </div>
              )}

              {/* React Web SPA Props Indicators */}
              {elem.props?.modes && (
                <div className="flex items-center gap-1.5 my-auto overflow-x-auto text-[10px]">
                  {elem.props.modes.map((m: string) => (
                    <span key={m} className="px-2 py-0.5 rounded bg-muted/60 font-semibold text-foreground">
                      {m}
                    </span>
                  ))}
                </div>
              )}

              {elem.type === 'button' && (
                <div className="flex items-center justify-center text-xs font-bold my-auto">
                  {elem.title}
                </div>
              )}

              {elem.type === 'input' && (
                <div className="p-2 rounded-lg bg-background border border-border text-[10px] text-muted-foreground font-mono my-auto">
                  Input Placeholder Value...
                </div>
              )}

              <div className="text-[9px] text-muted-foreground/80 font-mono flex justify-between">
                <span>{elem.width} × {elem.height}px</span>
                <span>({elem.x}, {elem.y})</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default WireframeSketchCanvas;
