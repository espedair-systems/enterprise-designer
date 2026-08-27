# Web Application Top-Level Layout Specification

**Target Component:** [`web/src/App.tsx`](file:///run/media/jonk/Workspace/ESPEDAIR/baseline-template/web/src/App.tsx)  
**Layout Components:** [`web/src/components/layout/Header.tsx`](file:///run/media/jonk/Workspace/ESPEDAIR/baseline-template/web/src/components/layout/Header.tsx), [`web/src/components/layout/Sidebar.tsx`](file:///run/media/jonk/Workspace/ESPEDAIR/baseline-template/web/src/components/layout/Sidebar.tsx)  
**Design Alignment:** Aligns with Enterprise Artist (`arch-ea-deploy` / `arch-ba-deploy`) visual design language, theme engine, and modal standards.

---

## 1. Structural Overview & Viewport Grid

The web interface is structured as a full-viewport, single-page application (`min-h-screen`, `flex flex-col`, `overflow-hidden`) with a strict 3-tier visual hierarchy:

```
+-----------------------------------------------------------------------------------------+
| [Header] (h-14, 56px fixed height)                                                      |
| Brand | Top Mode Switcher (Dashboard, Architect, HR, BA) | Utility & Profile Controls   |
+-------------------+---------------------------------------------------------------------+
| [Sidebar]         | [Main Content Viewport] (flex-1, overflow-y-auto)                   |
| (w-64, 256px)     |                                                                     |
| Contextual Rail   | Active Studio / Workspace Canvas:                                   |
| - Group Headers   | - Executive Dashboard                                               |
| - Sub-navigation  | - Capability Studio / Value Stream Studio / Strategy Studio         |
| - Badges & Counts | - Org Studio / RACI Matrix / Process Studio (SIPOC)                 |
|                   | - Requirements / Glossary / Platforms Hub / Settings Studio         |
| Bottom Provenance |                                                                     |
| Footer Badge      |                                                                     |
+-------------------+---------------------------------------------------------------------+
| [Global Overlays] Centered Dialogs & Modals (Backdrop Blur, zero slide-out drawers)    |
+-----------------------------------------------------------------------------------------+
```

---

## 2. Component Breakdown

### 2.1. Top Navigation Bar ([`Header.tsx`](file:///run/media/jonk/Workspace/ESPEDAIR/baseline-template/web/src/components/layout/Header.tsx))
Fixed at the top of the viewport (`h-14`, `z-30`, border-b with subtle drop shadow) serving global domain switching and system utilities.

* **Left Section (Brand Identity):**
  * Brand badge with gradient accent (`from-indigo-600 to-cyan-500`) displaying application monogram (`BA`).
  * Product Title: **Business Artist** (`text-xs font-extrabold tracking-tight`).
  * Subtitle: **Business Architecture OS** (`text-[10px] text-muted-foreground`).
* **Center Section (Top Domain Modes):**
  * Segmented mode buttons with dual-line labels and domain icons:
    1. **Dashboard** (`Executive Overview`)
    2. **Architect** (`Business Architecture` - Capabilities, Value Streams, Strategy, Services, Products)
    3. **HR** (`Organisation & RACI`)
    4. **BA** (`Processes & Requirements` - SIPOC, Requirements, Glossary)
* **Right Section (System Controls & User Context):**
  * **Platforms Hub:** Integrations & connector status (ServiceNow, Jira Align, Confluence, Cloud Infra).
  * **Settings:** RBAC governance, database schemas, theme configurations, ingestion/export studio.
  * **Help:** BIZBOK® & TOGAF® 10 knowledge base reference guides.
  * **Theme Switcher:** Single-click dark/light mode toggle with smooth transitions.
  * **User Profile Avatar Badge:** Active architect identity, initials, and persona trigger.

---

### 2.2. Contextual Navigation Rail ([`Sidebar.tsx`](file:///run/media/jonk/Workspace/ESPEDAIR/baseline-template/web/src/components/layout/Sidebar.tsx))
Docked to the left (`w-64`, `bg-sidebar`, `border-r border-border`) updating dynamically based on the active `appMode`:

* **Dynamic Navigation Groups:**
  * Categorized item groups with uppercase color-coded section titles.
  * Icon, primary label, descriptive subline, and optional status badge (e.g. `Live`, `Active`).
  * Instant view switching bound to `setActiveView()` in global Zustand state store.
* **Provenanced Repository Footer:**
  * Displays strict provenance status card indicating zero mock data and PostgreSQL authority.

---

### 2.3. Main Studio Workspace (`<main>` in [`App.tsx`](file:///run/media/jonk/Workspace/ESPEDAIR/baseline-template/web/src/App.tsx))
Occupies the remaining viewport space (`flex-1`, `overflow-y-auto`, `pb-16`):

* Houses rich studio components:
  * **ExecutiveDashboard:** Enterprise KPIs, maturity radars, strategic gap analytics.
  * **CapabilityStudio:** L1–L4 capability heatmaps, decomposition trees, and metadata inspectors.
  * **ValueStreamStudio:** Value stages, gating criteria, flow efficiency metrics.
  * **OrgStudio & RaciStudio:** Organization unit hierarchy and RACI responsibility matrices.
  * **ProcessStudio & RequirementsStudio:** SIPOC diagrams, user story backlog, and requirement traceability.
  * **InformationStudio:** Canonical business terms and domain glossary.
  * **PlatformStudio & SettingsStudio:** Connector telemetry, multi-tenant database management, data ingestion/export.

---

### 2.4. Global Modal Layer
In strict compliance with architectural guidelines, **no slide-out right drawers** are permitted. All detail inspectors, editors, and dialogs are rendered as **centered modals with backdrop blur (`backdrop-blur-sm`)**:

1. **[`StartupDialog`](file:///run/media/jonk/Workspace/ESPEDAIR/baseline-template/web/src/components/startup/StartupDialog.tsx):** Workspace initialization and login/session establishment.
2. **[`EntityModal`](file:///run/media/jonk/Workspace/ESPEDAIR/baseline-template/web/src/components/modals/EntityModal.tsx):** Universal centered inspector and editor for business architecture fact sheets.
3. **[`UserProfileModal`](file:///run/media/jonk/Workspace/ESPEDAIR/baseline-template/web/src/components/modals/UserProfileModal.tsx):** User session profile and RBAC entitlements.

---

## 3. Theming, Typography & Interaction Principles

* **Design Tokens:** Tailwind CSS semantic color tokens (`bg-background`, `text-foreground`, `bg-card`, `bg-sidebar`, `border-border`, `bg-primary`, `text-primary-foreground`).
* **Theme Switching:** Dark mode default with light mode support via [`ThemeProvider.tsx`](file:///run/media/jonk/Workspace/ESPEDAIR/baseline-template/web/src/components/theme/ThemeProvider.tsx).
* **Responsive Density:** Crisp typography scaling from `text-[9px]` badges to `text-xs` navigation labels with high information density appropriate for enterprise architecture tooling.
