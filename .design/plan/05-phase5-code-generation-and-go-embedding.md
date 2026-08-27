# Phase 5 Implementation Plan: Code Generation, Go Embedding & Release Packaging

> **Subsystem**: ESPEDAIR Designer (`designer` / `ea-designer`)  
> **Phase**: 5 of 5  
> **Goal**: Deliver the automated code generator, React asset embedder (`//go:embed all:dist`), and single-executable Go binary release pipeline for custom studios and agent applications.  

---

## 1. Objectives & Deliverables

1. **AST-to-Go Code Generation Engine (`internal/core/services/generator.go`)**:
   - Compiles visual canvas layout DSLs, data models, and queries into production-grade Go source code conforming to `enterprise-template`.
   - Generates typed Chi HTTP handlers, SQL database models, and service interfaces.
2. **Frontend Production Bundle Builder (`internal/core/services/builder.go`)**:
   - Runs non-interactive Vite / Rollup build in background, outputting minified static SPA assets into `web/dist/`.
3. **Single Executable Binary Packaging (`web/web.go`)**:
   - Mounts embedded assets via standard `//go:embed all:dist` in Go 1.22+.
   - Sets up SPA fallback routing on Chi router for seamless client-side browser navigation.
4. **Makefile & Automated Build Pipeline (`Makefile`)**:
   - Commands: `make all`, `make build-embedded`, `make test`, `make run-server`, `make zip`.
   - Produces clean standalone executable `bin/<app-name>` with zero runtime dependencies.
5. **End-to-End Export & Download Workflow**:
   - REST API: `POST /api/v1/apps/{id}/export/binary` (returns compiled executable) and `POST /api/v1/apps/{id}/export/zip` (returns clean source archive).

---

## 2. Step-by-Step Task Checklist

- [x] **Task 5.1**: Implement Go source code templates in [`internal/core/services/generator.go`](file:///home/jonk/workspace/ESPEDAIR/designer/internal/core/services/generator.go).
- [x] **Task 5.2**: Implement `CodeGeneratorService` to generate Go backend files from application DSL in [`generator.go`](file:///home/jonk/workspace/ESPEDAIR/designer/internal/core/services/generator.go).
- [x] **Task 5.3**: Implement automated build execution worker in [`internal/core/services/builder.go`](file:///home/jonk/workspace/ESPEDAIR/designer/internal/core/services/builder.go).
- [x] **Task 5.4**: Configure static asset embedding via `//go:embed all:dist` and Chi SPA router in [`web/web.go`](file:///home/jonk/workspace/ESPEDAIR/designer/web/web.go) and [`internal/adapters/inbound/http/web_embed.go`](file:///home/jonk/workspace/ESPEDAIR/designer/internal/adapters/inbound/http/web_embed.go).
- [x] **Task 5.5**: Add binary compiler service invoking `go build` to generate standalone executables in [`builder.go`](file:///home/jonk/workspace/ESPEDAIR/designer/internal/core/services/builder.go).
- [x] **Task 5.6**: Implement REST export endpoints for downloading binaries or zip archives in [`internal/adapters/inbound/http/export_handlers.go`](file:///home/jonk/workspace/ESPEDAIR/designer/internal/adapters/inbound/http/export_handlers.go) & [`web/src/components/export/AppExportModal.tsx`](file:///home/jonk/workspace/ESPEDAIR/designer/web/src/components/export/AppExportModal.tsx).
- [x] **Task 5.7**: Run end-to-end integration test: visually design an app, compile binary (`bin/base`), and verify embedded SPA build.

---

## 3. Verification Plan

```bash
# 1. Generate full application from visual design
curl -X POST http://localhost:8080/api/v1/apps/1/export/binary -o bin/custom_analytics_studio
chmod +x bin/custom_analytics_studio

# 2. Launch the standalone compiled binary
./bin/custom_analytics_studio

# 3. Verify in browser at http://localhost:8080
# Confirm custom layout, activity rail tools, visual widgets, and PostgreSQL persistence operate seamlessly.
```
