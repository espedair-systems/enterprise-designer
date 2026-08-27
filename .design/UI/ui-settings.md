# Settings Layout Specification (`appMode: 'settings'`)

**Target View Container:** [`web/src/components/settings/SettingsStudio.tsx`](file:///run/media/jonk/Workspace/ESPEDAIR/baseline-template/web/src/components/settings/SettingsStudio.tsx)  
**Parent Orchestrator:** [`web/src/App.tsx`](file:///run/media/jonk/Workspace/ESPEDAIR/baseline-template/web/src/App.tsx)  
**Navigation Trigger:** "Settings" action button in [`Header.tsx`](file:///run/media/jonk/Workspace/ESPEDAIR/baseline-template/web/src/components/layout/Header.tsx)

---

## 1. Activation & Structural Transition

When the user selects **Settings** (either via the top header utility button or through keyboard shortcut/command):
1. Global state in `useStore` transitions `appMode` to `'settings'`.
2. The contextual sidebar re-renders with the dedicated 5-category Settings navigation rail.
3. The main viewport mounts `SettingsStudio`, defaulting to `UISettingsView` or the last active administrative subview.

```
+---------------------------------------------------------------------------------------------------+
| [Header] Active App Mode: "Settings"                                                              |
+--------------------------+------------------------------------------------------------------------+
| [Settings Sidebar]       | [Settings Main Viewport] (SettingsStudio)                              |
|                          |                                                                        |
| 1. Identity & Governance | Header: Title, Category Badge, Context Subtitle                       |
|   - Users & Accounts     +------------------------------------------------------------------------+
|   - Roles & Entitlements | Body: Active Settings Sub-Canvas                                       |
|   - SSO & Directory IAM  |                                                                        |
|   - Audit Trail & Logs   | [Default: UI & Display Settings]                                       |
|                          | 1. Theme & Appearance (Dark / Light / Midnight cards, Accent Palettes) |
| 2. System Configuration  | 2. Canvas & Diagram Modeler (Node thresholds, Snap grid, Minimap)      |
|   - UI & Display (Active)| 3. Layout Density & Pagination (Compact / Normal / Relaxed, Page sizes)|
|   - Data & Persistence   | 4. Telemetry & Diagnostics (Console logs, TUI stream, Log levels)      |
|                          |                                                                        |
| 3. Database & Schemas    | [Alternative Subviews: Database, Data Persistence, Ingestion, Export]  |
|   - Database & Schemas   |                                                                        |
|                          |                                                                        |
| 4. Ingestion & Import    |                                                                        |
|   - Ingestion Studio     |                                                                        |
|                          |                                                                        |
| 5. Repository Export     |                                                                        |
|   - Export Studio        |                                                                        |
+--------------------------+------------------------------------------------------------------------+
```

---

## 2. Dedicated Settings Navigation Rail ([`Sidebar.tsx`](file:///run/media/jonk/Workspace/ESPEDAIR/baseline-template/web/src/components/layout/Sidebar.tsx))

The left rail (`w-64`, 256px fixed) displays 5 categorized groups with distinct color accents:

| Category | Item ID (`activeView`) | Label | Description |
| :--- | :--- | :--- | :--- |
| **1. Identity & Governance** (`text-indigo-500`) | `admin-users` | Users & Accounts | User directory & schema access (`admin.users`) |
| | `admin-roles` | Roles & Entitlements | RBAC permissions & access policies (`admin.roles`) |
| | `admin-sso` | SSO & Directory IAM | Corporate OIDC & SAML 2.0 federation |
| | `admin-audit` | Audit Trail & Logs | Immutable security event log (`admin.audit_logs`) |
| **2. System Configuration** (`text-purple-500`) | `settings` | UI & Display | Theme engine, density, diagram thresholds |
| | `data-settings` | Data & Persistence | PostgreSQL persistence, pool size, autosave rules |
| **3. Database & Schemas** (`text-emerald-500`) | `database` | Database & Schemas | Multi-tenant PostgreSQL schemas (`BA-*`), health |
| **4. Ingestion & Import** (`text-cyan-500`) | `imports` | Ingestion Studio | Ingest BIZBOK JSON, CSV, ArchiMate 3.1 |
| **5. Repository Export** (`text-amber-500`) | `export` | Export Studio | Export BIZBOK JSON, Markdown, ArchiMate |

---

## 3. Subview Layout Specifications

### 3.1. Default View: UI & Display ([`UISettingsView.tsx`](file:///run/media/jonk/Workspace/ESPEDAIR/baseline-template/web/src/components/settings/UISettingsView.tsx))

When `activeView === 'settings'`, the main viewport presents a structured, high-density configuration canvas:

1. **Header Bar:**
   * Sliders icon, title **"UI Settings & Preferences"**, and `APPEARANCE` badge.
   * Description subline detailing frontend customization scope.
2. **Section 1: Theme & Visual Appearance:**
   * **Three Theme Cards:**
     * *Dark Mode:* Obsidian palette with high contrast for low-light enterprise environments.
     * *Light Mode:* Clean, daylight-optimized presentation.
     * *Midnight / Cyber Mode:* Deep indigo & cyan futuristic aesthetic.
   * **Accent Color Swatches:** 6 selectable brand accents (Indigo/Cyan default, Emerald/Mint, Violet/Purple, Amber/Gold, Rose/Crimson, Sky/Ocean).
3. **Section 2: Canvas & Diagram Modeler Defaults:**
   * Diagram node threshold limit selector (50, 100, 150, 200, 500 nodes).
   * Toggle switches for *Warn on Exceeding Node Limit*, *Background Grid*, *Snap to Grid (16px raster)*, and *Show MiniMap*.
4. **Section 3: Layout Density & Table Pagination:**
   * Density mode selector: *Compact* (dense data grids), *Normal* (balanced), *Relaxed* (touch/spaced).
   * Default table page size dropdown: 10, 25, 50, 100 rows per page.
5. **Section 4: Telemetry & Diagnostic Logging:**
   * Toggle switches for *Browser Console Logging* and *Terminal Logging Stream (TUI Sync)*.
   * Log verbosity level dropdown (*DEBUG*, *INFO*, *WARN*, *ERROR*).

---

### 3.2. Data & Persistence ([`DataSettingsView.tsx`](file:///run/media/jonk/Workspace/ESPEDAIR/baseline-template/web/src/components/settings/DataSettingsView.tsx))

When `activeView === 'data-settings'`:
* Authoritative PostgreSQL connection status card (`postgres://ba:ba_secret@localhost:5432/ba`).
* Autosave policies, mutation cache intervals, and batch commit thresholds.
* Database maintenance actions: schema validation, index re-indexing, and VACUUM triggers.

---

### 3.3. Database & Schemas ([`DatabaseCanvas.tsx`](file:///run/media/jonk/Workspace/ESPEDAIR/baseline-template/web/src/components/database/DatabaseCanvas.tsx))

When `activeView === 'database'`:
* Multi-tenant schema inspector listing active `BA-*` enterprise tenancy schemas.
* Connection telemetry: active pool connections, query latency, schema migration version.
* Schema switcher allowing architects to target isolated workspace schemas.

---

### 3.4. Identity & Governance Subviews (`admin-*`)

* **`admin-users` (User Management & IAM):** Authoritative table of active architects, corporate emails, assigned RBAC roles, schema access grants, and status badges.
* **`admin-roles` (Roles & Entitlements):** 3-card RBAC policy overview (*Principal Architect*, *Business Architect*, *Executive Stakeholder*) detailing fine-grained CRUD capabilities.
* **`admin-sso` (SSO & Directory IAM):** Identity provider federation status card (OIDC / SAML 2.0 issuer metadata and endpoint verification).
* **`admin-audit` (Audit Trail & Event Log):** Compliance data table with timestamps, actor IDs, mutation actions, target schemas, and outcome status.

---

### 3.5. Ingestion & Export Studio ([`ImportsExportsCanvas.tsx`](file:///run/media/jonk/Workspace/ESPEDAIR/baseline-template/web/src/components/imports/ImportsExportsCanvas.tsx))

When `activeView === 'imports'` or `activeView === 'export'`:
* Multi-format data exchange cards for BIZBOK® JSON, Open Group ArchiMate 3.1 Exchange XML/JSON, CSV matrix tables, and Markdown technical documentation.
* File dropzones with live validation and schema conformance checkers.
