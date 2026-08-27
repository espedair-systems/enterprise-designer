# ESPEDAIR Designer — Master Implementation Plan

> **Subsystem**: ESPEDAIR Designer (`designer` / `ea-designer`)  
> **Base Template**: `/home/jonk/workspace/ESPEDAIR/studio/enterprise-template` & `enterprise-artist`  
> **Data Modeling Engine**: ESPEDAIR Schematics (`schematics`)  
> **Inspiration**: Appsmith, ToolJet, Penpot, Quant-UX & Open-Pencil (`INSPIRE/LOWCODE`)  
> **Target Delivery**: 6 Phased Milestones (Phase 0 through Phase 5)  

---

## 1. Plan Overview & Conceptualization Workflow

ESPEDAIR Designer enables users to **conceptually sketch, visually construct, and automatically generate** production-ready **Studio (SPA)** and **Autonomous Agent** applications.

### The "Sketch-to-App" Lifecycle
```
 [ Phase 0: Conceptual Sketch ]  ──> Rapid freeform wireframing & tool slot placement (Open-Pencil style)
                │ (1-Click 'Promote to App')
                v
 [ Phase 1: Core Foundation ]    ──> Go backend scaffolding & PostgreSQL metadata schema (enterprise-template)
                │
                v
 [ Phase 2: Shell Layout ]       ──> Dynamic 5-slot React 19 shell (Rail, Header, Sidebars, Canvas, Console)
                │
                v
 [ Phase 3: Visual Canvas ]      ──> Drag-and-drop grid builder & 25+ widget toolbox with reactive evaluator
                │
                v
 [ Phase 4: Data Modeling ]      ──> Schematics ER modeler, AST SQL editor & column-level lineage DAG
                │
                v
 [ Phase 5: Code Gen & Embed ]   ──> //go:embed single binary compilation (bin/<app-name>)
```

---

## 2. Phased Milestone Breakdown

### Phase 0: Conceptual Sketch & Wireframe Designer ("Sketch-to-App")
- **Goal**: Freeform visual sketch canvas allowing developers and architects to quickly brainstorm, draft layouts, and assign tools to shell slots (Activity Rail, Menu Bar, Sidebars, Canvas, Bottom Console) before committing to code.
- **Deliverables**: Infinite 2D wireframe canvas, UI stencils, preset shell templates, and the `SketchPromoter` compiler generating `layout_dsl.json`.

### Phase 1: Core Foundation & Template Scaffolder
- **Goal**: Initialize Go / Chi backend with PostgreSQL schema migrations and implement the template cloning engine based on `enterprise-template`.
- **Deliverables**: PostgreSQL metadata schema (`designer_apps`, `designer_layouts`), `ScaffolderService`, and application lifecycle REST API.

### Phase 2: Shell Layout & Dynamic Slot System
- **Goal**: Build the React 19 frontend shell featuring dynamic slot placement for Activity Rail, Top Menu Bar, Left/Right Sidebars, Center Canvas, and Bottom Console.
- **Deliverables**: Configurable `ActivityRail`, `TopMenuBar`, collapsible `SidebarSlot`, multi-mode `CanvasSlot`, and `BottomTray`.

### Phase 3: Visual Canvas & Tool Registry
- **Goal**: Deliver the low-code drag-and-drop builder canvas inspired by Appsmith and ToolJet.
- **Deliverables**: Responsive grid layout engine with sub-pixel snapping, 25+ pre-built widgets, bidirectional property inspector, and Web Worker reactive expression evaluator.

### Phase 4: Data Modeling & Schematics Integration
- **Goal**: Embed Schematics capabilities directly into the visual designer for end-to-end data platform creation.
- **Deliverables**: Visual Entity-Relationship (ER) modeler, AST SQL editor, Column-Level Lineage (CLL) DAG viewer, and live declarative schema diff inspector.

### Phase 5: Code Generation, Go Embedding & Release Packaging
- **Goal**: Enable one-click compilation of designed applications into a self-contained single Go binary.
- **Deliverables**: AST-to-Go code generator, automated Vite production bundle builder, `//go:embed all:dist` packaging, and Makefile release pipeline producing `bin/<app-name>`.
