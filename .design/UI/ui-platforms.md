# Platforms Layout Specification (`appMode: 'platforms'`)

**Target View Container:** [`web/src/components/platform/PlatformStudio.tsx`](file:///run/media/jonk/Workspace/ESPEDAIR/baseline-template/web/src/components/platform/PlatformStudio.tsx)  
**Parent Orchestrator:** [`web/src/App.tsx`](file:///run/media/jonk/Workspace/ESPEDAIR/baseline-template/web/src/App.tsx)  
**Navigation Trigger:** "Platforms" button in [`Header.tsx`](file:///run/media/jonk/Workspace/ESPEDAIR/baseline-template/web/src/components/layout/Header.tsx)

---

## 1. Activation & Structural Transition

When the user clicks the **Platforms** button in the header:
1. `useStore` updates state:
   * `appMode = 'platforms'`
   * `activeView = 'platforms-overview'`
2. The contextual sidebar transitions to the **Enterprise Connectors** rail.
3. The main content area renders [`PlatformStudio.tsx`](file:///run/media/jonk/Workspace/ESPEDAIR/baseline-template/web/src/components/platform/PlatformStudio.tsx).

```
+---------------------------------------------------------------------------------------------------+
| [Header] Active App Mode: "Platforms" (Plug Icon)                                                 |
+--------------------------+------------------------------------------------------------------------+
| [Platforms Sidebar]      | [Main Viewport: PlatformStudio]                                        |
|                          |                                                                        |
| 1. Enterprise Connectors | Header: Title, Subtitle & "Sync All Integrations" Trigger             |
|   - Platforms Overview   +------------------------------------------------------------------------+
|   - Enterprise HCM [Live]| 3-Column Responsive Connector Grid:                                    |
|   - ServiceNow SPM       | +--------------------+ +--------------------+ +--------------------+   |
|   - Jira Align           | | 1. Enterprise HCM  | | 2. Jira Software   | | 3. Confluence ADRs |   |
|   - Confluence ADRs      | | Status: Connected  | | Status: Connected  | | Status: Connected  |   |
|   - Cloud Infrastructure | | Last Sync: 12m ago | | Last Sync: 5m ago  | | Last Sync: 1h ago  |   |
|                          | | [Sync Now]         | | [Sync Now]         | | [Sync Now]         |   |
| Bottom Strict            | +--------------------+ +--------------------+ +--------------------+   |
| Provenance Card          | +--------------------+ +--------------------+                          |
| (PostgreSQL Auth)        | | 4. ServiceNow SPM  | | 5. Cloud Cost Hub  |                          |
|                          | | Status: Connected  | | Status: Configured |                          |
|                          | | Last Sync: 22m ago | | Last Sync: 3h ago  |                          |
|                          | | [Sync Now]         | | [Sync Now]         |                          |
|                          | +--------------------+ +--------------------+                          |
+--------------------------+------------------------------------------------------------------------+
```

---

## 2. Platforms Navigation Rail ([`Sidebar.tsx`](file:///run/media/jonk/Workspace/ESPEDAIR/baseline-template/web/src/components/layout/Sidebar.tsx))

The left navigation rail (`w-64`, 256px fixed) displays the **Enterprise Connectors** section (`text-amber-500`):

| View ID (`activeView`) | Label | Description | Badge |
| :--- | :--- | :--- | :--- |
| `platforms-overview` | Platforms Overview | Integration status & active connectors hub | — |
| `plat-hcm` | Enterprise HCM | Employee directory & organization structure sync | `Live` |
| `plat-servicenow` | ServiceNow SPM | Service catalog & process mapping sync | — |
| `plat-jira` | Jira Align | Strategic initiatives & OKRs telemetry | — |
| `plat-confluence` | Confluence ADRs | Architecture Decision Records publisher | — |
| `plat-cloud` | Cloud Infrastructure | Multi-cloud hosting & Kubernetes pods | — |

---

## 3. Main Viewport: Platform Studio Hub ([`PlatformStudio.tsx`](file:///run/media/jonk/Workspace/ESPEDAIR/baseline-template/web/src/components/platform/PlatformStudio.tsx))

The Platform Studio provides a dashboard for managing bi-directional enterprise connectors:

### 3.1. Header Bar
* **Icon & Title:** `Layers` icon (`text-indigo-500`), **"Enterprise Platforms & Integration Hub"** (`text-2xl font-extrabold`).
* **Description:** Subtitle detailing authoritative bi-directional synchronization with enterprise systems.
* **Global Action Button:** **"Sync All Integrations"** (`RefreshCw` icon), triggering asynchronous synchronization across all connectors with live loading spinner state.

---

### 3.2. Connector Cards Grid
Rendered in a responsive 3-column layout (`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5`):

1. **Enterprise HCM & Org Hierarchy:**
   * *Icon & Category:* `Briefcase` | `Human Capital & Org`
   * *Scope:* Authoritative sync for Organizational Units, Business Functions, Job Profiles, and Worker Cost Rates.
   * *Telemetry:* 1,240 synced records, 99.8% health, live pulse indicator.
2. **Jira Software & Jira Align:**
   * *Icon & Category:* `GitBranch` | `Agile Delivery`
   * *Scope:* Bi-directional sync of Strategic Initiatives, Epics, Sprints, and Program Milestones.
   * *Telemetry:* 480 synced records, 98.5% health.
3. **Confluence Architecture ADRs:**
   * *Icon & Category:* `FileText` | `Knowledge Base`
   * *Scope:* Automated publishing of BIZBOK capability definitions and Architecture Decision Records (ADRs).
   * *Telemetry:* 92 synced records, 100.0% health.
4. **ServiceNow SPM & CMDB:**
   * *Icon & Category:* `Server` | `ITSM & Service Catalog`
   * *Scope:* Bi-directional link between Business Services, CMDB Configuration Items, and SLA performance.
   * *Telemetry:* 310 synced records, 97.4% health.
5. **AWS & Azure Cloud Cost Hub:**
   * *Icon & Category:* `Cloud` | `Cloud Infrastructure`
   * *Scope:* Multi-cloud infrastructure cost allocation mapped directly to Business Capabilities and Value Streams.
   * *Telemetry:* 15,400 configuration items, 99.1% health.

---

### 3.3. Connector Card Anatomy & Interactions
Each connector card is packaged as an interactive tile with:
* **Status Badge:** Visual pulse indicator with connection health tag (`Connected`, `Configured`, `Syncing`, `Degraded`).
* **Telemetry Footer:** Last synchronized timestamp and total Configuration Items (CIs) / entities.
* **Sync Now Button:** Individual trigger for running instant delta synchronization with animation feedback.
