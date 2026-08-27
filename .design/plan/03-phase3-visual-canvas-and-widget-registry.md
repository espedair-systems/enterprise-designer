# Phase 3 Implementation Plan: Visual Canvas & Tool Registry

> **Subsystem**: ESPEDAIR Designer (`designer` / `ea-designer`)  
> **Phase**: 3 of 5  
> **Goal**: Deliver the drag-and-drop low-code application builder canvas, pre-built component toolbox (inspired by Appsmith and ToolJet), and bidirectional property inspector.  

---

## 1. Objectives & Deliverables

1. **Visual Drag & Drop Grid Canvas (`web/src/canvas/`)**:
   - 12/24-column responsive grid layout engine with sub-pixel snapping, collision detection, and multi-widget selection.
   - Zoom/pan viewport controls with mini-map navigator.
2. **Comprehensive Widget Library (`web/src/widgets/`)**:
   - **Data Display**: Data Table (sorting, pagination, inline edits), Key-Value List, Stat / Metric Cards, JSON Tree.
   - **Data Entry**: Text Input, Number Input, Date Picker, Select / Multi-Select Dropdown, Switch, Checkbox Group, File Uploader.
   - **Visualizations**: Time-Series Line Chart, Bar Chart, Donut / Pie Chart, Heatmap.
   - **Containers & Navigation**: Tabs Container, Modal Dialog, Accordion, Card, Split View.
   - **Actions**: Button, Icon Button, Dropdown Menu, Floating Action Button.
3. **Toolbox Panel (`web/src/toolbox/ToolboxPanel.tsx`)**:
   - Categorized component drawer on the left sidebar with search, previews, and drag handles.
4. **Bidirectional Property Inspector (`web/src/inspector/PropertyInspector.tsx`)**:
   - Live configuration for:
     - **Properties & Data Bindings**: Mustache template bindings (`{{ query_sales.data }}`).
     - **Styles**: Colors, typography, borders, shadows, alignment.
     - **Validation Rules**: Required, regex pattern, min/max length.
     - **Events**: `onClick`, `onRowSelect`, `onValueChange` triggering queries, modals, or toasts.
5. **Client-Side Reactive JavaScript Evaluator**:
   - AST-based dependency parser in Web Worker evaluating expressions with zero main-thread UI jank.

---

## 2. Step-by-Step Task Checklist

- [x] **Task 3.1**: Implement drag-and-drop grid engine in [`web/src/canvas/VisualCanvasGrid.tsx`](file:///home/jonk/workspace/ESPEDAIR/designer/web/src/canvas/VisualCanvasGrid.tsx).
- [x] **Task 3.2**: Create base `WidgetDefinition` interface and registry in [`web/src/widgets/types.ts`](file:///home/jonk/workspace/ESPEDAIR/designer/web/src/widgets/types.ts) & [`web/src/widgets/registry.ts`](file:///home/jonk/workspace/ESPEDAIR/designer/web/src/widgets/registry.ts).
- [x] **Task 3.3**: Implement core Data Display widgets in [`web/src/widgets/definitions/DataDisplayWidgets.tsx`](file:///home/jonk/workspace/ESPEDAIR/designer/web/src/widgets/definitions/DataDisplayWidgets.tsx).
- [x] **Task 3.4**: Implement core Data Entry widgets in [`web/src/widgets/definitions/DataEntryWidgets.tsx`](file:///home/jonk/workspace/ESPEDAIR/designer/web/src/widgets/definitions/DataEntryWidgets.tsx).
- [x] **Task 3.5**: Implement Visualization, Container & Action widgets in [`VisualizationWidgets.tsx`](file:///home/jonk/workspace/ESPEDAIR/designer/web/src/widgets/definitions/VisualizationWidgets.tsx), [`ContainerWidgets.tsx`](file:///home/jonk/workspace/ESPEDAIR/designer/web/src/widgets/definitions/ContainerWidgets.tsx) & [`ActionWidgets.tsx`](file:///home/jonk/workspace/ESPEDAIR/designer/web/src/widgets/definitions/ActionWidgets.tsx).
- [x] **Task 3.6**: Build [`PropertyInspector.tsx`](file:///home/jonk/workspace/ESPEDAIR/designer/web/src/inspector/PropertyInspector.tsx) supporting data bindings, layout dimensions, styles, and event triggers.
- [x] **Task 3.7**: Implement reactive evaluation engine for dynamic expressions (`{{ ... }}`) in [`web/src/evaluator/evaluator.ts`](file:///home/jonk/workspace/ESPEDAIR/designer/web/src/evaluator/evaluator.ts).

---

## 3. Verification Plan

```bash
# 1. Run widget unit and snapshot tests
cd web && npm test

# 2. Test canvas interactions
# Drag Table widget onto canvas, bind to sample dataset, configure column formatting, and preview live updates.
```
