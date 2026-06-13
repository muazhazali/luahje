#!/bin/bash

# Luahje Development Quick Start
# Ensures PostgreSQL is running and starts the dev server

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

cd "$PROJECT_ROOT"

# Check if PostgreSQL is running
if ! docker ps | grep -q "luahje-postgres"; then
    echo -e "${YELLOW}PostgreSQL is not running. Starting it now...${NC}"
    docker-compose up -d postgres

    # Wait for PostgreSQL
    echo -e "${BLUE}Waiting for PostgreSQL to be ready...${NC}"
    RETRIES=30
    until docker exec luahje-postgres pg_isready -U luahje >/dev/null 2>&1 || [ $RETRIES -eq 0 ]; do
        echo -n "."
        sleep 1
        RETRIES=$((RETRIES - 1))
    done
    echo ""

    if [ $RETRIES -eq 0 ]; then
        echo "PostgreSQL failed to start. Check logs: docker logs luahje-postgres"
        exit 1
    fi
    echo -e "${GREEN}✓ PostgreSQL is ready${NC}"
fi

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}node_modules not found. Running setup...${NC}"
    "$SCRIPT_DIR/setup.sh"
    exit 0
fi

# Start dev server
echo -e "${GREEN}Starting development server...${NC}"
exec pnpm dev
