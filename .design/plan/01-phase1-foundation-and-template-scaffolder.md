# Phase 1 Implementation Plan: Foundation & Template Scaffolder

> **Subsystem**: ESPEDAIR Designer (`designer` / `ea-designer`)  
> **Phase**: 1 of 5  
> **Goal**: Initialize the Designer core backend (Go, Chi router, PostgreSQL exclusively, Hexagonal Architecture) and implement the template cloning, parameterization, and project scaffolding engine based on `enterprise-template`.  

---

## 1. Objectives & Deliverables

1. **Go Hexagonal Architecture Backend (`cmd/designer/`, `internal/`)**:
   - Initialize Go module `github.com/espedair/designer` with strict Hexagonal boundaries (`internal/core/domain`, `internal/core/ports`, `internal/core/services`, `internal/adapters/inbound/http`, `internal/adapters/outbound/postgres`).
2. **PostgreSQL Database Schema & Migrations (`db/migrations/`)**:
   - `designer_workspaces`: Multi-tenant workspace partitions.
   - `designer_apps`: Application registry (Type: `studio` or `agent`, slug, description, layout DSL reference, status).
   - `designer_layouts`: Dynamic slot configurations (Rail, Menu Bar, Left/Right Sidebars, Canvas, Bottom Console).
   - `designer_datasources`: Configured PostgreSQL and external database connection profiles.
3. **Template Scaffolder Service (`internal/core/services/scaffolder.go`)**:
   - Reads `/home/jonk/workspace/ESPEDAIR/studio/enterprise-template` (and `enterprise-artist`).
   - Clones and customizes packages, module names, app titles, database connection strings, and default routes.
4. **REST API Endpoints (`internal/adapters/inbound/http/app_handler.go`)**:
   - `POST /api/v1/apps`: Create new Studio or Agent app from template.
   - `GET /api/v1/apps`: List all registered designer applications.
   - `GET /api/v1/apps/{id}`: Inspect application metadata and active layout DSL.
   - `PUT /api/v1/apps/{id}`: Update application configuration.
   - `DELETE /api/v1/apps/{id}`: Archive/delete application.

---

## 2. Step-by-Step Task Checklist

- [x] **Task 1.1**: Initialize Go module `arch-base-deploy` / `designer` with [`go.mod`](file:///home/jonk/workspace/ESPEDAIR/designer/go.mod), [`Makefile`](file:///home/jonk/workspace/ESPEDAIR/designer/Makefile), and [`config.yaml`](file:///home/jonk/workspace/ESPEDAIR/designer/config.yaml).
- [x] **Task 1.2**: Author PostgreSQL schema migration [`db/migrations/000002_init_designer_apps.up.sql`](file:///home/jonk/workspace/ESPEDAIR/designer/db/migrations/000002_init_designer_apps.up.sql).
- [x] **Task 1.3**: Implement domain entities in [`internal/core/domain/designer_app.go`](file:///home/jonk/workspace/ESPEDAIR/designer/internal/core/domain/designer_app.go).
- [x] **Task 1.4**: Define repository and service ports in [`internal/core/ports/designer_ports.go`](file:///home/jonk/workspace/ESPEDAIR/designer/internal/core/ports/designer_ports.go).
- [x] **Task 1.5**: Implement PostgreSQL adapter in [`internal/adapters/outbound/postgres/designer_repository.go`](file:///home/jonk/workspace/ESPEDAIR/designer/internal/adapters/outbound/postgres/designer_repository.go).
- [x] **Task 1.6**: Implement `ScaffolderService` in [`internal/core/services/designer_scaffolder.go`](file:///home/jonk/workspace/ESPEDAIR/designer/internal/core/services/designer_scaffolder.go).
- [x] **Task 1.7**: Implement Chi HTTP router & REST handlers in [`internal/adapters/inbound/http/designer_handlers.go`](file:///home/jonk/workspace/ESPEDAIR/designer/internal/adapters/inbound/http/designer_handlers.go) & [`router.go`](file:///home/jonk/workspace/ESPEDAIR/designer/internal/adapters/inbound/http/router.go).
- [x] **Task 1.8**: Author automated tests in [`internal/core/services/designer_scaffolder_test.go`](file:///home/jonk/workspace/ESPEDAIR/designer/internal/core/services/designer_scaffolder_test.go) & [`internal/core/domain/designer_app_test.go`](file:///home/jonk/workspace/ESPEDAIR/designer/internal/core/domain/designer_app_test.go).

---

## 3. Verification Plan

```bash
# 1. Run database migrations against PostgreSQL
make migrate-up

# 2. Run backend test suite
go test -v -cover ./...

# 3. Create a test studio application via REST API
curl -X POST http://localhost:8080/api/v1/apps \
  -H "Content-Type: application/json" \
  -d '{"name": "Fleet Logistics Studio", "type": "studio", "slug": "fleet-logistics"}'
```
