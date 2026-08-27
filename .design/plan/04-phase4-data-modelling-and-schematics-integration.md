# Phase 4 Implementation Plan: Data Modeling & Schematics Integration

> **Subsystem**: ESPEDAIR Designer (`designer` / `ea-designer`)  
> **Phase**: 4 of 5  
> **Goal**: Integrate the visual Entity-Relationship (ER) modeler, Column-Level Lineage (CLL) graph explorer, and declarative SQL schema diff engine powered by ESPEDAIR Schematics.  

---

## 1. Objectives & Deliverables

1. **Interactive Visual Entity-Relationship (ER) Modeler (`web/src/datamodel/`)**:
   - Interactive canvas displaying database entities, columns, primary keys, foreign-key relationship connectors, and indexes.
   - Click-to-add table, add column, and drag-to-connect relationship links.
2. **Column-Level Lineage (CLL) DAG Explorer (`web/src/lineage/`)**:
   - Visual Directed Acyclic Graph (DAG) visualizing column-to-column transformations from raw ingestion models to staging and analytics marts.
   - Interactive blast radius analyzer highlighting downstream impacted models.
3. **AST SQL Editor & Linter Integration (`web/src/sqleditor/`)**:
   - In-browser Monaco / CodeMirror SQL editor with syntax highlighting, auto-completion, and real-time Schematics AST linter annotations (`L001`, `L002`, `L003`).
4. **Declarative Schema Diff & Migration Generator (`internal/adapters/inbound/http/schematics_handler.go`)**:
   - REST bridge to Schematics engine generating Flyway-style migrations (`V__`, `R__`, `A__`) from visual ER model alterations.
5. **Database Connector Manager (`web/src/datasources/`)**:
   - UI configuration for PostgreSQL, Snowflake, BigQuery, MySQL, MSSQL, and Oracle connections.

---

## 2. Step-by-Step Task Checklist

- [x] **Task 4.1**: Build interactive ER diagram canvas in [`web/src/datamodel/ERModelerCanvas.tsx`](file:///home/jonk/workspace/ESPEDAIR/designer/web/src/datamodel/ERModelerCanvas.tsx).
- [x] **Task 4.2**: Implement schema entity inspector for modifying column types, nullability, and foreign keys in [`ERModelerCanvas.tsx`](file:///home/jonk/workspace/ESPEDAIR/designer/web/src/datamodel/ERModelerCanvas.tsx).
- [x] **Task 4.3**: Implement Column-Level Lineage visualizer with impact analysis highlights in [`web/src/lineage/LineageDAGView.tsx`](file:///home/jonk/workspace/ESPEDAIR/designer/web/src/lineage/LineageDAGView.tsx).
- [x] **Task 4.4**: Integrate AST SQL editor with linting feedback and query execution in [`web/src/sqleditor/SqlEditorView.tsx`](file:///home/jonk/workspace/ESPEDAIR/designer/web/src/sqleditor/SqlEditorView.tsx).
- [x] **Task 4.5**: Connect frontend data modeler to Schematics backend diff engine in [`internal/adapters/inbound/http/schematics_handlers.go`](file:///home/jonk/workspace/ESPEDAIR/designer/internal/adapters/inbound/http/schematics_handlers.go) (`/api/v1/schematics/diff`).
- [x] **Task 4.6**: Build visual migration planner modal and script generator in [`web/src/datamodel/MigrationPlannerModal.tsx`](file:///home/jonk/workspace/ESPEDAIR/designer/web/src/datamodel/MigrationPlannerModal.tsx) (`/api/v1/schematics/migrations/plan`).

---

## 3. Verification Plan

```bash
# 1. Test ER diagram to DDL generation
# Design a new table with 3 columns and a foreign key; verify generated PostgreSQL DDL is valid.

# 2. Test Lineage DAG visualization
# Load staging and mart models; verify directed edges match ColumnLineageDag.
```
