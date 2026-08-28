# Implementation Plan: Audit Findings & Defensive Hardening (CR-0016)

- **CR ID**: `cr-0016`
- **Application**: Enterprise Designer (`enterprise-designer`)
- **Plan Date**: 2026-08-28T16:40:00+08:00
- **Target Schema**: PostgreSQL `DES_BASE` (Port 8088)

---

## 1. Objectives

1. **Formalize Database Migrations for All Domain Tables**:
   - Create `db/migrations/000003_init_enterprise_designer_domains.up.sql` and `.down.sql` covering:
     - `quest_surveys`, `quest_question_bank`, `quest_reference_data`, `quest_submissions`
     - `schema_registries`
     - `openapi_endpoints`
     - `usecase_models`
     - `cr_requests`
2. **Eliminate Remaining Mock Data**:
   - Refactor `InteractiveAPIConsoleCanvas.tsx` to dynamically query and execute against live endpoints from `api.listOpenAPIEndpoints()`.
   - Refactor `SchemaGraphVisualizerCanvas.tsx` to parse AST nodes dynamically from registered schemas.
3. **Defensive Programming Hardening**:
   - Audit and protect all array mapping operations (`.map()`, `.filter()`, `.find()`, `.slice()`, `.length`) with defensive fallback guards across the entire frontend.
4. **Verification & Build**:
   - Run complete test suite (`go test ./...`) and build production assets (`make all`).

---

## 2. Step-by-Step Implementation Workflows

### Phase 1: Database Migration Scripts (`000003`)
1. Create `db/migrations/000003_init_enterprise_designer_domains.up.sql`:
   - Define all domain tables with strict foreign keys to `designer_apps(id)` or `designer_workspaces(id)`.
   - Set up JSONB columns, timestamps, and indexes.
2. Create `db/migrations/000003_init_enterprise_designer_domains.down.sql`:
   - Clean rollback script dropping domain tables in reverse dependency order.

---

### Phase 2: Dynamic Data Integration (Eliminating Mock Data)
1. **Interactive API Console (`InteractiveAPIConsoleCanvas.tsx`)**:
   - Query `api.listOpenAPIEndpoints()` on mount.
   - Dynamically map OpenAPI endpoints into interactive console routes.
   - If no endpoints exist, provide an empty state prompting the user to add endpoints in OpenAPI Route Manager.
2. **2D Schema Graph AST (`SchemaGraphVisualizerCanvas.tsx`)**:
   - Fetch registered schema AST via `api.listSchemas()` / `api.getSchema()`.
   - Parse top-level properties and nested `$defs` / object children into 2D node graphs dynamically.

---

### Phase 3: Defensive Code Hardening
1. Add defensive nullish coalescing `(items ?? []).map(...)` and `Array.isArray(x) ? x : []` across:
   - `web/src/canvas/schema/*`
   - `web/src/canvas/q/*`
   - `web/src/toolbox/*`
2. Ensure optional chaining on all nested properties (`?.`).

---

### Phase 4: Testing & Verification
1. Run `npm run build` in `web/` to confirm zero TypeScript compilation errors.
2. Run `go test ./...` across all Go backend packages.
3. Run `make all` to build clean `bin/base` binary embedding `web/dist`.
