#!/bin/bash
set -e

# ==============================================================================
# Business Artist - Desktop Launch Script (Local In-Memory Cache Mode)
# Port: 8082
# ==============================================================================

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/../.." && pwd)"

cd "$ROOT_DIR"

echo "=========================================================="
echo "  Launching Business Artist (Desktop Mode - Port 8082)    "
echo "=========================================================="

if [ ! -f "bin/ba" ]; then
    echo "Building Business Artist single executable..."
    make all
fi

# Launch TUI which spins up background web server at http://localhost:8082
./bin/ba tui -res auto
