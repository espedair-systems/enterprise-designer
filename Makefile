.PHONY: all setup build web-build test run-server run-desktop run-desktop-pg run-tui run-server-pg db-up db-down db-logs docker-build docker-up docker-down docker-logs package-win-zip zip archive clean help

# Default target
all: web-build build

# Setup development dependencies
setup:
	@echo "==> Setting up development environment..."
	go mod download
	(cd web && npm install)
	@echo "Setup complete! Run 'make help' for available commands."

# Build React 19 Frontend Web SPA into web/dist
web-build:
	@echo "==> Building React frontend SPA in web/dist..."
	(cd web && npm run build)

# Build Go Single Executable Binary
build:
	@echo "==> Compiling bin/base..."
	mkdir -p bin
	go build -o bin/base ./cmd/base

# Run Full Test Suite with Coverage
test:
	@echo "==> Running Go test suite..."
	go test -cover ./...

# Run Base Artist REST API Server (Standard Server Config)
run-server: all
	@echo "==> Starting REST API server on http://localhost:8088..."
	./bin/base server --config config.yaml

# Run Desktop Standalone Server
run-desktop: all
	@echo "==> Starting Standalone Desktop REST API server on http://localhost:8088 (PostgreSQL)..."
	./bin/base server --config config.yaml

# Run Desktop Standalone Server with local PostgreSQL + pgweb
run-desktop-pg: all
	@echo "==> Ensuring PostgreSQL and pgweb are running in Docker..."
	docker compose -f deploy/desk/docker-compose.yml up -d postgres pgweb
	@echo "==> Starting Standalone Desktop REST API server on http://localhost:8088 (PostgreSQL)..."
	./bin/base server --config config.yaml

# Run Terminal User Interface (TUI)
run-tui: all
	@echo "==> Starting Bubbletea TUI..."
	./bin/base tui

# Run Base Artist REST API Server against Docker PostgreSQL (CLI mode)
run-server-pg: all
	@echo "==> Starting REST API server on http://localhost:8088 connecting to PostgreSQL..."
	./bin/base server --config deploy/docker/config.postgres.yaml

# ── Standalone Database (PostgreSQL + pgweb GUI) ──────────────────────────────
# Starts PostgreSQL (5432) and pgweb (8081) in Docker while running BASE from CLI
db-up:
	@echo "==> Starting standalone PostgreSQL (5432) and pgweb (8081)..."
	docker compose -f deploy/docker/docker-compose.yml up -d postgres pgweb
	@echo "PostgreSQL is running on localhost:5432 [Schema: BASE_BASE]"
	@echo "pgweb GUI is accessible on http://localhost:8081"

db-down:
	@echo "==> Stopping standalone database services..."
	docker compose -f deploy/docker/docker-compose.yml down

db-logs:
	docker compose -f deploy/docker/docker-compose.yml logs -f postgres pgweb

# ── Full Containerized Deployment (PostgreSQL + pgweb + BASE Server) ────────────
# Build Multi-Stage Docker Image
docker-build:
	@echo "==> Building Docker image base-server:latest..."
	docker compose -f deploy/docker/docker-compose.yml build

# Run Full Stack in Docker Compose
docker-up:
	@echo "==> Starting full Docker deployment (PostgreSQL + pgweb + BASE Server)..."
	docker compose -f deploy/docker/docker-compose.yml up -d
	@echo "Base Artist Web App: http://localhost:8088"
	@echo "pgweb Database GUI:  http://localhost:8081"

# Stop Full Stack
docker-down:
	@echo "==> Stopping Docker deployment..."
	docker compose -f deploy/docker/docker-compose.yml down

# Stream Full Stack Logs
docker-logs:
	docker compose -f deploy/docker/docker-compose.yml logs -f

# Build Windows Standalone Executable & Package ZIP
package-win-zip: web-build
	@echo "==> Compiling Windows binary bin/base.exe..."
	GOOS=windows GOARCH=amd64 CGO_ENABLED=0 go build -o bin/base.exe ./cmd/base
	@echo "==> Creating Windows install ZIP archive arch-base-deploy-windows.zip..."
	@rm -f arch-base-deploy-windows.zip
	zip -j arch-base-deploy-windows.zip bin/base.exe config.yaml
	@echo "Windows install package created at arch-base-deploy-windows.zip"

# Zip clean project source to parent directory respecting .gitignore rules
zip:
	@ZIP_NAME="../arch-base-deploy-$$(date +%Y%m%d-%H%M%S).zip"; \
	echo "Creating clean source archive at $$ZIP_NAME ..."; \
	if [ -d .git ]; then \
		git archive --format=zip -o "$$ZIP_NAME" HEAD; \
	else \
		git init -q && \
		git config user.email "build@local" && \
		git config user.name "build" && \
		git add . && \
		git commit -q -m "source archive" --no-gpg-sign && \
		git archive --format=zip -o "$$ZIP_NAME" HEAD && \
		rm -rf .git; \
	fi; \
	echo "Source archive created successfully: $$ZIP_NAME"

archive: zip

# Clean Build Artifacts
clean:
	@echo "==> Cleaning build artifacts..."
	rm -rf bin/base bin/base.exe bin/bt bin/bt.exe bin/ba bin/ba.exe web/dist arch-base-deploy.zip arch-base-deploy-windows.zip arch-bt-deploy.zip arch-bt-deploy-windows.zip arch-ba-deploy.zip arch-ba-deploy-windows.zip

# Help Target
help:
	@echo "Base Artist Build Automation (Makefile)"
	@echo ""
	@echo "Available Targets:"
	@echo "  make setup           - Install Go and npm dependencies"
	@echo "  make all             - Build frontend SPA and compile Go binary (bin/base)"
	@echo "  make web-build       - Build React SPA in web/dist"
	@echo "  make build           - Compile Go binary to bin/base"
	@echo "  make test            - Run repository unit & integration test suite"
	@echo "  make run-server      - Build and launch REST API server (config.yaml)"
	@echo "  make run-server-pg   - Launch REST API server on CLI connected to Docker PostgreSQL"
	@echo "  make run-desktop     - Build and launch Desktop Standalone server"
	@echo "  make run-desktop-pg  - Build and launch Desktop server with Docker PostgreSQL + pgweb"
	@echo "  make run-tui         - Build and launch Bubbletea TUI interface (base tui)"
	@echo "  make db-up           - Start standalone PostgreSQL (5432) and pgweb (8081) in Docker"
	@echo "  make db-down         - Stop standalone PostgreSQL and pgweb"
	@echo "  make db-logs         - Stream logs from PostgreSQL and pgweb"
	@echo "  make docker-build    - Build multi-stage Docker image (deploy/docker/Dockerfile)"
	@echo "  make docker-up       - Launch full container stack (PostgreSQL + pgweb + BASE Server)"
	@echo "  make docker-down     - Stop full container stack"
	@echo "  make docker-logs     - Stream full container stack logs"
	@echo "  make package-win-zip - Cross-compile Windows binary and package install ZIP"
	@echo "  make zip             - Zip clean source code to parent directory respecting .gitignore"
	@echo "  make clean           - Remove compiled binaries, dist assets, and zip archives"
