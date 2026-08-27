# Login Flow & User Profile Layout Specification

**Target Components:**
* **Authentication Dialog:** [`web/src/components/startup/StartupDialog.tsx`](file:///run/media/jonk/Workspace/ESPEDAIR/baseline-template/web/src/components/startup/StartupDialog.tsx)
* **User Profile Modal:** [`web/src/components/modals/UserProfileModal.tsx`](file:///run/media/jonk/Workspace/ESPEDAIR/baseline-template/web/src/components/modals/UserProfileModal.tsx)
* **Global State Store:** [`web/src/store/useStore.ts`](file:///run/media/jonk/Workspace/ESPEDAIR/baseline-template/web/src/store/useStore.ts)

---

## 1. Startup & Login Experience ([`StartupDialog.tsx`](file:///run/media/jonk/Workspace/ESPEDAIR/baseline-template/web/src/components/startup/StartupDialog.tsx))

When the user initially launches the web application or is unauthenticated (`isLoggedIn === false`), the system presents a **centered modal dialog over a deep backdrop blur (`bg-black/70 backdrop-blur-md`)**.

```
+-----------------------------------------------------------------------------------------+
| [Backdrop Blur Overlay]                                                                 |
|                                                                                         |
|   +---------------------------------------------------------------------------------+   |
|   | [BA Logo] Business Artist (BIZBOK® 12.0)            [IAM Single Sign-On Badge]  |   |
|   | Enterprise Business Architecture Operating System                               |   |
|   +---------------------------------------------------------------------------------+   |
|   | SELECT ARCHITECT PERSONA PRESET:                                                |   |
|   | +-----------------------+ +-----------------------+ +-------------------------+ |   |
|   | | [Admin]               | | [Flow Architect]      | | [Executive]             | |   |
|   | | Lead Business Arch    | | Value Stream Lead     | | Strategy Director       | |   |
|   | | EMP-892401            | | EMP-774120            | | EMP-339801              | |   |
|   | +-----------------------+ +-----------------------+ +-------------------------+ |   |
|   +---------------------------------------------------------------------------------+   |
|   | Corporate Email / Username             | SSO Password / Token (Eye toggle)      |   |
|   +----------------------------------------+----------------------------------------+   |
|   | PostgreSQL Tenancy Schema              | Assigned Entitlement Role (Read-only)  |   |
|   | [public / BA-RETAIL / BA-SUPPLY]       | [Principal Business Architect...]      |   |
|   +---------------------------------------------------------------------------------+   |
|   | ● PostgreSQL authoritative storage active   [Enter Business Architecture OS ->] |   |
|   +---------------------------------------------------------------------------------+   |
|                                                                                         |
+-----------------------------------------------------------------------------------------+
```

### 1.1. Login Dialog Anatomy
1. **Header Branding:**
   * `BA` monogram icon with `from-indigo-600 to-cyan-500` gradient shadow.
   * Product title **Business Artist** with version tag `BIZBOK® 12.0`.
   * IAM Single Sign-On indicator badge with security shield.
2. **Persona Preset Quick-Select:**
   * Allows one-click persona configuration with preset entitlements and tenancy schemas:
     * **Lead Business Architect (`Admin`):** `EMP-892401` targeting `public` schema.
     * **Value Stream & Flow Lead (`Flow Architect`):** `EMP-774120` targeting `BA-RETAIL-BANKING` schema.
     * **Strategy & Transformation Director (`Executive`):** `EMP-339801` targeting `BA-SUPPLY-CHAIN` schema.
3. **Authentication Fields:**
   * Corporate Email / Username input field.
   * SSO Password / Token field with toggleable show/hide eye icon.
   * PostgreSQL Tenancy Schema selector (`public`, `BA-RETAIL-BANKING`, `BA-SUPPLY-CHAIN`).
   * Assigned Entitlement Role (dynamically bound to active persona).
4. **Footer & Storage Telemetry:**
   * Live green pulse indicator: `PostgreSQL authoritative storage active`.
   * Primary action button: **"Enter Business Architecture OS"** (`ArrowRight`).

---

## 2. Post-Login State: What the User Receives

Upon successful authentication:
1. **Global State Hydration (`useStore`):**
   * `isLoggedIn` transitions to `true`, unmounting the `StartupDialog`.
   * `currentUser` state is populated with `name`, `email`, `role`, `tenancy`, `employeeId`, and derived monogram `initials`.
2. **UI Activation:**
   * **Full Navigation Access:** Unlocks domain switcher tabs (*Dashboard*, *Architect*, *HR*, *BA*), *Platforms Hub*, and *Settings*.
   * **Workspace Canvas:** Defaults to the **Executive Dashboard** (`ExecutiveDashboard.tsx`), populating live KPIs, maturity radars, and capability metrics computed directly from PostgreSQL fact sheets.
   * **Header Profile Badge:** The top-right profile button activates displaying the user's monogram badge (e.g. `BA`, `LA`) and full name.

---

## 3. User Profile Modal Layout ([`UserProfileModal.tsx`](file:///run/media/jonk/Workspace/ESPEDAIR/baseline-template/web/src/components/modals/UserProfileModal.tsx))

Clicking the profile badge in the top header opens the **centered Profile Modal** (`backdrop-blur-sm`, `max-w-lg`):

```
+-----------------------------------------------------------------------------+
| [Backdrop Blur Overlay]                                                     |
|                                                                             |
|   +---------------------------------------------------------------------+   |
|   | [Initials Avatar]  Full Name  [EMP-ID Badge]                    [X] |   |
|   |                    Role Title (e.g. Principal Business Architect)   |   |
|   +---------------------------------------------------------------------+   |
|   | ENTERPRISE DIRECTORY ACTIVE SESSION                                 |   |
|   | +-----------------------------------------------------------------+ |   |
|   | | [Mail Icon]     corporate.email@enterprise.internal             | |   |
|   | | [Building Icon] Department: Enterprise Architecture             | |   |
|   | | [MapPin Icon]   Location: Global HQ / Remote                    | |   |
|   | +-----------------------------------------------------------------+ |   |
|   +---------------------------------------------------------------------+   |
|   | AUTHORITATIVE ENTITLEMENTS (RBAC)                                   |   |
|   | +-------------------------------+ +-------------------------------+ |   |
|   | | [Shield] BIZBOK® Editor       | | [Award] Value Stream Lead     | |   |
|   | +-------------------------------+ +-------------------------------+ |   |
|   | | [Check] Maturity Assessor     | | [Briefcase] Arch Governance   | |   |
|   | +-------------------------------+ +-------------------------------+ |   |
|   +---------------------------------------------------------------------+   |
|   | [Sign Out / Switch Persona]                     [Settings]  [Done]  |   |
|   +---------------------------------------------------------------------+   |
|                                                                             |
+-----------------------------------------------------------------------------+
```

### 3.1. Profile Modal Sections
1. **Header Identity Card:**
   * Large gradient avatar with user initials.
   * User full name and employee ID badge (`font-mono`).
   * Primary assigned role title.
   * Modal close button (`X`).
2. **Enterprise Directory Active Session:**
   * Grouped metadata card displaying authenticated corporate email, department, and location.
3. **Authoritative Entitlements Grid (2x2):**
   * Visual badge grid confirming active governance rights:
     * `BIZBOK® Editor` (Primary modeling authority)
     * `Value Stream Lead` (Flow & stage gating permissions)
     * `Maturity Assessor` (Capability & heatmap score auditing)
     * `Architecture Governance` (Repository schema modification permissions)
4. **Modal Footer Controls:**
   * **Switch Persona / Sign Out (`LogOut` icon):** Clears session, resets `isLoggedIn = false`, closes profile modal, and re-launches `StartupDialog`.
   * **Settings (`Settings` icon):** Navigates to `appMode: 'settings'`.
   * **Done Button:** Dismisses the profile modal.
