# Universal Artist Template App Architecture Plan

Transform [`baseline-template`](file:///run/media/jonk/Workspace/ESPEDAIR/baseline-template) into the canonical, modular template application that serves as the reusable blueprint for all ESPEDAIR Artist applications (`enterprise-artist`, `ai-artist`, `business-artist`, `data-artist`, `cloud-artist`, etc.).

## 1. Overview & Architecture Strategy

Every ESPEDAIR Artist application shares a common foundation:
1. **Go Single Binary Hexagonal Backend**:
   - Chi router with PostgreSQL authoritative persistence (`config.yaml`).
   - Embedded React 19 SPA frontend (`web/dist` via `//go:embed all:dist`).
   - Terminal User Interface (Bubbletea TUI) + REST API endpoints.
2. **React 19 Frontend Shell**:
   - Modern dark/light theme engine with HSL CSS design tokens.
   - Dynamic Navigation & Layout (`Header`, `Sidebar`, `Breadcrumbs`, `StatusBar`).
   - Command Palette (`Ctrl+K` / `Cmd+K`) and Quick Search (`GotoAnything`).
   - Centered Modal Inspector Dialogs with backdrop blur.
   - ReactFlow canvas, matrix grids, and Hexagonal visualizers.

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                          ESPEDAIR BASELINE TEMPLATE SHELL                              │
├────────────────────────────────────────────────────────────────────────────────────────┤
│  [ Header Bar: Workspace Switcher | Search (Cmd+K) | Role Mode Selector | Theme | Profile ]│
├───────────────────┬────────────────────────────────────────────────────────────────────┤
│  SIDEBAR          │  MAIN WORKBENCH VIEWPORT                                           │
│                   │                                                                    │
│  • Dashboard      │  ┌──────────────────────────────────────────────────────────────┐  │
│  • Studios & Views│  │ Pluggable Studio / Canvas / Matrix / Fact Sheet View         │  │
│  • Visualizers    │  │                                                              │  │
│  • Integrations   │  │                                                              │  │
│  • Platform & DB  │  └──────────────────────────────────────────────────────────────┘  │
│  • Settings       │                                                                    │
├───────────────────┴────────────────────────────────────────────────────────────────────┤
│  COMMON MODALS: [Command Palette] [Entity Inspector] [Database Config] [Export/Import] │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Proposed Changes

### A. Frontend Component Library Consolidation (in [`baseline-template/web`](file:///run/media/jonk/Workspace/ESPEDAIR/baseline-template/web))

#### [NEW] Reusable UI & Shell Components (from [`enterprise-artist`](file:///run/media/jonk/Workspace/ESPEDAIR/enterprise-artist/web/src/components))
- **`components/ui/CommandPalette.tsx`**: Universal `Cmd+K` / `Ctrl+K` quick switcher for navigation, actions, entities, and views.
- **`components/ui/GotoAnything.tsx`**: Quick fuzzy search dialog across fact sheets, architecture models, and views.
- **`components/ui/AppErrorBoundary.tsx`**: Robust crash prevention with graceful retry and error logging.
- **`components/ui/NodeListView.tsx`**: Reusable entity grid / cards / list browser with search, tag filters, sorting, and inline status badges.
- **`components/ui/CodeManager.tsx`**: In-browser code, SQL, and Markdown previewer / editor.
- **`components/modals/CenteredModal.tsx`**: Universal centered modal dialog with backdrop blur, keyboard ESC dismissal, and animations.

#### [NEW] Advanced Visualizer & Diagram Engines
- **`components/diagram/Hex2DiagramView.tsx`**: True SVG geometric hexagonal architecture visualizer with slotted domain bars and call graph connectivity.
- **`components/diagram/MatrixTable.tsx`**: Universal 2D traceability / coupling / heat-map matrix for mapping any two entity domains (e.g. Capabilities $\times$ Applications, Processes $\times$ Roles).
- **`components/diagram/SunburstVisualizer.tsx` / `TreemapVisualizer.tsx`**: Multi-level hierarchy visualizer for capabilities, portfolios, and cost allocations.

#### [NEW] Modular Studio Registry & Manifest System
- **`src/config/studios.ts`**: Pluggable registry where an Artist app defines its active modules, role navigation trees, and studio components:
  ```ts
  export interface StudioDefinition {
    id: string;
    label: string;
    icon: LucideIcon;
    category: 'architecture' | 'governance' | 'analytics' | 'platform' | 'settings';
    component: React.LazyExoticComponent<React.FC>;
    roles?: string[];
  }
  ```

---

### B. Backend Hexagonal Architecture Standardization (in [`baseline-template`](file:///run/media/jonk/Workspace/ESPEDAIR/baseline-template))

#### [MODIFY] [`internal/adapters/inbound/http/server.go`](file:///run/media/jonk/Workspace/ESPEDAIR/baseline-template/internal/adapters/inbound/http/server.go)
- Mount universal API endpoints across all template instances:
  - `GET /api/health` & `GET /api/version`
  - `GET /api/workspace` & `POST /api/workspace/switch`
  - `GET /api/entities` & `POST /api/entities` (generic fact sheet CRUD with PostgreSQL JSONB attribute extensibility)
  - `GET /api/hexagonal` & `GET /api/callgraph` (live AST extraction for Hex 2 diagrams)
  - `GET /api/database/status` & `POST /api/database/test`

#### [MODIFY] [`internal/database/database.go`](file:///run/media/jonk/Workspace/ESPEDAIR/baseline-template/internal/database/database.go)
- PostgreSQL connection pooling via `pgxpool` with automated schema migrations.
- Extensible fact sheet tables with JSONB payload support for domain-specific attributes.

---

## 3. Verification Plan

### Automated Tests
1. **Go Test Suite**: Run `go test -v -cover ./...` in `/run/media/jonk/Workspace/ESPEDAIR/baseline-template`.
2. **Frontend Compilation**: Run `npm run build` in `/run/media/jonk/Workspace/ESPEDAIR/baseline-template/web`.
3. **Full Binary Packaging**: Run `make all` to verify single-executable embedding (`bin/ba`).

### Manual Verification
1. Verify `CommandPalette` (`Cmd+K`) and quick search across views and entities.
2. Verify all modals render strictly centered with backdrop blur (no slide-out drawers).
3. Verify Hex 2 diagram renders true SVG geometric hexagons with slotted domain interface bars.
4. Verify responsive layout, dark/light theme switching, and PostgreSQL database connectivity.


