# Base Artist Deploy (`arch-base-deploy`) - Agent Guidelines

## Architecture Overview
- **Hexagonal Architecture**: Business logic in `internal/core/` relies purely on `domain` entities and `ports` interfaces. Never import `adapters` into `core`.
- **Database Strategy**: **PostgreSQL Exclusively** with authoritative schema namespace **`BASE_BASE`** for persistent server storage and multi-tenant data management (`postgres://base:base_secret@localhost:5432/base?sslmode=disable` configured via `config.yaml` with `default_schema: BASE_BASE`). An in-memory cache/repo is provided for standalone desktop / CLI operation, with authoritative persistence to PostgreSQL via REST API in server mode.
- **Single Executable Asset Embedding**: React 19 SPA frontend assets in `web/dist` are embedded into the Go binary via `//go:embed all:dist` in `web/web.go` and mounted on the Chi router via `RegisterWebStaticRoutes` in `internal/adapters/inbound/http/web_embed.go`.

## Key Commands
- `make all`: Build web frontend & compile `bin/base`.
- `make test`: Run complete test suite (`go test ./...`).
- `make run-server`: Launch REST API server on port 8088 with `config.yaml` (`base server`).
- `make run-tui`: Launch Bubbletea Terminal User Interface (`base tui`).
- `make zip`: Package clean source archive `arch-base-deploy.zip`.

## Golden Rules
- **PostgreSQL Mandatory**: All persistent entity saves, updates, deletions, workspace operations, and analytics queries must persist into PostgreSQL schema **`DES_BASE`** via the REST API backend.
- **Centered Modals Only**: All entity inspectors, schema viewers, detail dialogs, settings, and forms must be centered modals with backdrop blur, never right slide-out drawers.
- **Activity Rail Navigation**: The Activity Rail is the sole authoritative navigation mechanism for moving between different spaces and canvas modes (App Canvas, ER Modeler, Lineage DAG, SQL Console, Agent Graph). Never place redundant canvas mode tabs in the Top Menu Bar.
- **Theme & Scrollbar Consistency**: Maintain cohesive dark theme styling across all components, panels, modals, and custom scrollbars.
- **No Mock Data**: Always compute metrics, schema tables, and graphs dynamically from facts stored in the repository.



## Critical IDE & Terminal Execution Safety
- **NEVER generate large scripts, heredocs (`cat << 'EOF'`), or inline Python scripts within terminal/prompt inputs**:
  - Passing large payloads, inline scripts, or multiline heredocs directly into terminal command executions (`run_command`) breaks and freezes the IDE, requiring a forced restart.
- **Always use dedicated IDE tools for file operations**:
  - Use `write_to_file`, `replace_file_content`, and `multi_replace_file_content` to create and modify files.
  - Never attempt to write or pipe file content via bash commands or inline scripts.
