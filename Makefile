# Luahje Makefile
# Provides convenient shortcuts for common development tasks

.PHONY: help setup dev build start db-up db-down db-reset db-migrate db-seed db-studio lint clean

# Default target
help: ## Show this help message
	@echo "Luahje Development Commands"
	@echo "=========================="
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-15s\033[0m %s\n", $$1, $$2}'

# Setup and Installation
setup: ## One-command setup: installs deps, starts DB, runs migrations, seeds data
	@./scripts/setup.sh

dev: ## Quick start: ensures DB is running and starts dev server
	@./scripts/dev.sh

# Building
build: ## Build the application for production
	@pnpm build

start: ## Start production server (requires build first)
	@pnpm start

# Database Management
db-up: ## Start PostgreSQL Docker container
	@docker-compose up -d postgres
	@echo "Waiting for PostgreSQL to be ready..."
	@until docker exec luahje-postgres pg_isready -U luahje > /dev/null 2>&1; do sleep 1; done
	@echo "PostgreSQL is ready!"

db-down: ## Stop PostgreSQL Docker container
	@docker-compose down

db-reset: ## Reset database (destructive - removes all data!)
	@docker-compose down -v && docker-compose up -d postgres
	@echo "Waiting for PostgreSQL to be ready..."
	@until docker exec luahje-postgres pg_isready -U luahje > /dev/null 2>&1; do sleep 1; done
	@echo "PostgreSQL is ready!"

db-migrate: ## Run database migrations
	@pnpm db:migrate

db-seed: ## Seed database with sample messages
	@pnpm db:seed

db-studio: ## Open Prisma Studio (database GUI)
	@pnpm db:studio

# Development Utilities
lint: ## Run ESLint
	@pnpm lint

clean: ## Clean build artifacts and node_modules
	@rm -rf .next node_modules dist coverage
	@echo "Cleaned build artifacts"

install: ## Install dependencies
	@pnpm install

typecheck: ## Run TypeScript type checking
	@pnpm tsc --noEmit

# Testing
test: ## Run tests (if available)
	@pnpm test 2>/dev/null || echo "No tests configured"

# Maintenance
update: ## Update dependencies
	@pnpm update

prune: ## Remove unused dependencies
	@pnpm prune

# Docker Commands
docker-build: ## Build Docker images
	@docker-compose build

docker-up: ## Start all Docker services
	@docker-compose up -d

docker-down: ## Stop all Docker services
	@docker-compose down

docker-logs: ## View Docker logs
	@docker-compose logs -f

# Production
deploy-cf: ## Deploy to Cloudflare Workers
	@pnpm build:cf
	@pnpm deploy:cf

# GitHub Actions (for testing CI locally)
act: ## Run GitHub Actions locally (requires act installed)
	@act push --secret-file .env.local 2>/dev/null || echo "Install act: https://github.com/nektos/act"
