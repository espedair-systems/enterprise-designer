#!/bin/bash
set -e

# ==============================================================================
# Business Artist - Desktop Launch Script with PostgreSQL Container
# Port: 8082 | Postgres: 5432
# ==============================================================================

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/../.." && pwd)"

cd "$ROOT_DIR"

echo "=========================================================="
echo "  Starting PostgreSQL for Business Artist                "
echo "=========================================================="

if [ -f "$SCRIPT_DIR/docker-compose.yml" ]; then
    docker compose -f "$SCRIPT_DIR/docker-compose.yml" up -d
fi

if [ ! -f "bin/ba" ]; then
    echo "Building Business Artist binary..."
    make all
fi

# Launch TUI with PostgreSQL backend
./bin/ba tui -res auto
