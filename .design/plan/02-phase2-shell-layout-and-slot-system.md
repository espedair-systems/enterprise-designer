# Phase 2 Implementation Plan: Shell Layout & Dynamic Slot System

> **Subsystem**: ESPEDAIR Designer (`designer` / `ea-designer`)  
> **Phase**: 2 of 5  
> **Goal**: Construct the React 19 / Tailwind CSS single-page shell layout featuring customizable dynamic slots for the Activity Rail, Top Menu Bar, Left/Right Sidebars, Center Canvas, and Bottom Console.  

---

## 1. Objectives & Deliverables

1. **React 19 + Tailwind CSS Modern Frontend (`web/src/shell/`)**:
   - Built on Vite + React 19 with rich dark-mode aesthetics, subtle glassmorphism, and responsive CSS grid/flexbox.
2. **Activity Rail Slot Component (`web/src/shell/ActivityRail.tsx`)**:
   - Left-most vertical icon dock allowing users to add/reorder tool icons (Explorer, Visual Designer, ER Modeler, Agent Workflows, Settings).
   - Tooltips, badge counts, active state indicators, and bottom user profile anchor.
3. **Top Menu Bar Slot Component (`web/src/shell/TopMenuBar.tsx`)**:
   - Header with customizable dropdown menus (`File`, `Edit`, `Schema`, `Tools`, `Help`).
   - Center breadcrumbs and environment selector (`DEV`, `TEST`, `STAGING`, `PROD`).
   - Quick action buttons: `Save DSL`, `Sync Schematics`, `Test Run`, `Export Go Binary`.
4. **Collapsible Left & Right Sidebar Slots (`web/src/shell/SidebarSlot.tsx`)**:
   - Resizable drawers with panel tabs:
     - **Left**: Object Navigator, Model Tree, Widget Toolbox, Datasource Catalog.
     - **Right**: Property Inspector, Data Bindings, Validation Rules, Event Handlers.
5. **Multi-Mode Center Canvas Area (`web/src/shell/CanvasSlot.tsx`)**:
   - Viewport supporting seamless mode transitions between Visual App Canvas, ER Modeler, Lineage DAG, and SQL Editor.
6. **Collapsible Bottom Console Tray (`web/src/shell/BottomTray.tsx`)**:
   - Tabbed console for Query Runner, SQL Logs, Test Results, and Terminal Output.

---

## 2. Step-by-Step Task Checklist

- [x] **Task 2.1**: Initialize React 19 frontend project in `web/` with Tailwind CSS and Lucide icons.
- [x] **Task 2.2**: Implement [`LayoutContext.tsx`](file:///home/jonk/workspace/ESPEDAIR/designer/web/src/shell/LayoutContext.tsx) and state management for dynamic slot registration and visibility toggles.
- [x] **Task 2.3**: Build [`ActivityRail.tsx`](file:///home/jonk/workspace/ESPEDAIR/designer/web/src/shell/ActivityRail.tsx) component with customizable tool icon actions.
- [x] **Task 2.4**: Build [`TopMenuBar.tsx`](file:///home/jonk/workspace/ESPEDAIR/designer/web/src/shell/TopMenuBar.tsx) with global actions, environment switchers, and menus.
- [x] **Task 2.5**: Implement resizable split-pane containers for Left & Right [`SidebarSlot.tsx`](file:///home/jonk/workspace/ESPEDAIR/designer/web/src/shell/SidebarSlot.tsx).
- [x] **Task 2.6**: Build [`BottomTray.tsx`](file:///home/jonk/workspace/ESPEDAIR/designer/web/src/shell/BottomTray.tsx) console with tabbed log viewers and query terminals.
- [x] **Task 2.7**: Integrate frontend with backend layout DSL REST API in [`web/src/services/api.ts`](file:///home/jonk/workspace/ESPEDAIR/designer/web/src/services/api.ts) & [`StudioShell.tsx`](file:///home/jonk/workspace/ESPEDAIR/designer/web/src/shell/StudioShell.tsx).

---

## 3. Verification Plan

```bash
# 1. Launch Vite development server
cd web && npm run dev

# 2. Verify interactive slot layout in browser
# Check responsiveness, sidebar collapse/expand, rail perspective switching, and bottom tray toggles.
```
