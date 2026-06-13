#!/bin/bash

# Luahje Setup Script
# This script sets up the development environment in one command

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Helper functions
print_step() {
    echo -e "${BLUE}➜${NC} $1"
}

print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

# Check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Get script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

cd "$PROJECT_ROOT"

echo -e "${GREEN}╔════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║     Luahje Development Setup          ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════╝${NC}"
echo ""

# =============================================================================
# Check Prerequisites
# =============================================================================
print_step "Checking prerequisites..."

MISSING_DEPS=()

if ! command_exists node; then
    MISSING_DEPS+=("Node.js")
else
    NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 20 ]; then
        print_error "Node.js version must be 20+. Current: $(node --version)"
        exit 1
    fi
    print_success "Node.js $(node --version)"
fi

if ! command_exists pnpm; then
    MISSING_DEPS+=("pnpm")
else
    print_success "pnpm $(pnpm --version)"
fi

if ! command_exists docker; then
    MISSING_DEPS+=("Docker")
else
    print_success "Docker $(docker --version | cut -d' ' -f3 | tr -d ',')"
fi

if ! command_exists docker-compose; then
    MISSING_DEPS+=("Docker Compose")
else
    print_success "Docker Compose $(docker-compose --version | cut -d' ' -f3)"
fi

if [ ${#MISSING_DEPS[@]} -ne 0 ]; then
    echo ""
    print_error "Missing required dependencies:"
    for dep in "${MISSING_DEPS[@]}"; do
        echo "  - $dep"
    done
    echo ""
    echo "Please install the missing dependencies and try again:"
    echo "  • Node.js 20+: https://nodejs.org/"
    echo "  • pnpm: npm install -g pnpm"
    echo "  • Docker: https://docs.docker.com/get-docker/"
    exit 1
fi

# =============================================================================
# Install Dependencies
# =============================================================================
echo ""
print_step "Installing dependencies..."
if [ -d "node_modules" ]; then
    print_warning "node_modules already exists, skipping install (use 'pnpm install' to update)"
else
    pnpm install
    print_success "Dependencies installed"
fi

# =============================================================================
# Setup Environment File
# =============================================================================
echo ""
print_step "Setting up environment file..."

if [ -f ".env" ]; then
    print_warning ".env already exists, skipping creation"
else
    cp .env.example .env
    print_success "Created .env from .env.example"
fi

if [ -f ".env.local" ]; then
    print_warning ".env.local already exists, skipping creation"
else
    cp .env.local.example .env.local
    print_success "Created .env.local from .env.local.example"
fi

# =============================================================================
# Start PostgreSQL
# =============================================================================
echo ""
print_step "Starting PostgreSQL..."

docker-compose up -d postgres

# Wait for PostgreSQL to be ready
print_step "Waiting for PostgreSQL to be ready..."
RETRIES=30
until docker exec luahje-postgres pg_isready -U luahje >/dev/null 2>&1 || [ $RETRIES -eq 0 ]; do
    echo -n "."
    sleep 1
    RETRIES=$((RETRIES - 1))
done

if [ $RETRIES -eq 0 ]; then
    echo ""
    print_error "PostgreSQL failed to start. Check logs: docker logs luahje-postgres"
    exit 1
fi

echo ""
print_success "PostgreSQL is ready"

# =============================================================================
# Run Database Migrations
# =============================================================================
echo ""
print_step "Running database migrations..."
pnpm db:migrate

# =============================================================================
# Seed Database
# =============================================================================
echo ""
print_step "Seeding database with sample messages..."
pnpm db:seed

# =============================================================================
# Success Message
# =============================================================================
echo ""
echo -e "${GREEN}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║              Setup Complete! 🎉                              ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "Your development environment is ready!"
echo ""
echo -e "${BLUE}Quick Start Commands:${NC}"
echo "  pnpm dev          Start the development server"
echo "  pnpm db:studio    Open Prisma Studio (database GUI)"
echo "  pnpm db:reset     Reset database (destructive)"
echo ""
echo -e "${BLUE}URLs:${NC}"
echo "  • App:           http://localhost:3000"
echo "  • Prisma Studio: http://localhost:5555"
echo ""
echo -e "${BLUE}Happy coding!${NC}"
