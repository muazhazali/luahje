# Contributing to Luahje

Thank you for your interest in contributing to Luahje! This document provides guidelines and instructions to help you get started.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Submitting Changes](#submitting-changes)
- [Development Guidelines](#development-guidelines)

## Code of Conduct

Be respectful, constructive, and welcoming. We're building this together!

## Getting Started

### Prerequisites

Before you begin, ensure you have:

- **Node.js 20+** - [Download here](https://nodejs.org/)
- **pnpm** - Install with: `npm install -g pnpm`
- **Docker** - [Download here](https://docs.docker.com/get-docker/)
- **Docker Compose** - Usually included with Docker Desktop

### One-Command Setup

The easiest way to set up your development environment:

```bash
# Clone the repository
git clone https://github.com/muazhazali/luahje.git
cd luahje

# Run the setup script (installs deps, starts DB, runs migrations, seeds data)
./scripts/setup.sh
```

That's it! The script will:
1. ✅ Check your prerequisites
2. ✅ Install dependencies with pnpm
3. ✅ Create `.env` and `.env.local` files
4. ✅ Start PostgreSQL in Docker
5. ✅ Run database migrations
6. ✅ Seed with sample messages

### Alternative: Manual Setup

If you prefer manual setup:

```bash
# Install dependencies
pnpm install

# Copy environment files
cp .env.example .env
cp .env.local.example .env.local

# Start PostgreSQL
pnpm db:up

# Run migrations and seed
pnpm db:migrate
pnpm db:seed
```

### Using Make

If you have Make installed, you can use these shortcuts:

```bash
make setup    # One-command setup
make dev      # Quick start (ensures DB is running + starts dev server)
make db-up    # Start PostgreSQL
make db-down  # Stop PostgreSQL
make db-reset # Reset database (destructive)
```

See all available commands with: `make help`

## Development Workflow

### Starting Development

```bash
# Option 1: Use the dev script (recommended)
./scripts/dev.sh

# Option 2: Use Make
make dev

# Option 3: Manual
pnpm db:up  # Ensure DB is running
pnpm dev    # Start Next.js dev server
```

The app will be available at http://localhost:3000

### Database Management

```bash
# Open Prisma Studio (database GUI)
pnpm db:studio
# or
make db-studio

# Run migrations after schema changes
pnpm db:migrate

# Reset database (⚠️ destructive!)
pnpm db:reset
# or
make db-reset

# Seed with sample data
pnpm db:seed
```

### Project Structure

```
luahje/
├── app/                 # Next.js App Router
│   ├── [locale]/        # Internationalized routes (en, ms)
│   └── api/             # API routes
├── components/          # React components
│   └── ui/              # shadcn/ui components
├── lib/                 # Utilities and database client
├── prisma/              # Database schema and migrations
├── messages/            # i18n translations (en.json, ms.json)
├── scripts/             # Setup and utility scripts
├── public/              # Static assets
└── styles/              # Global styles
```

## Submitting Changes

### Creating a Branch

```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/your-bug-fix
```

### Making Changes

1. Write clear, concise code
2. Follow existing patterns and conventions
3. Update tests if applicable
4. Update documentation if needed

### Commit Messages

We follow conventional commits:

```
feat: add new message search feature
fix: resolve color picker bug in submit modal
docs: update README with new setup instructions
refactor: simplify message card component
style: format code with prettier
test: add tests for API routes
chore: update dependencies
```

### Before Submitting

```bash
# Run linting
pnpm lint

# Build locally to ensure no errors
pnpm build

# Test the app works
pnpm dev
```

### Pull Request Process

1. **Fork** the repository and create your branch from `main`
2. **Make your changes** and test thoroughly
3. **Update documentation** if needed
4. **Submit a Pull Request** with:
   - Clear title describing the change
   - Description of what changed and why
   - Screenshots for UI changes (if applicable)
   - Reference any related issues

### PR Review

- All PRs require review before merging
- Address feedback constructively
- Keep PRs focused on a single change when possible

## Development Guidelines

### Code Style

- Use TypeScript for type safety
- Follow existing component patterns
- Use Tailwind CSS for styling
- Use `cn()` utility from `lib/utils.ts` for conditional classes

### Component Guidelines

```tsx
// Use named exports for components
export function MessageCard({ message }: MessageCardProps) {
  // Component logic
}

// Use proper typing
interface MessageCardProps {
  message: Message;
  onDelete?: (id: string) => void;
}
```

### API Guidelines

- Use proper HTTP status codes
- Validate input with Zod schemas
- Implement rate limiting for public endpoints
- Return consistent response formats

Example:
```typescript
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validated = messageSchema.parse(body);
    // ... handle request
    return Response.json({ success: true, data: result });
  } catch (error) {
    return Response.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
}
```

### Database Changes

1. Modify `prisma/schema.prisma`
2. Run `pnpm db:migrate` to create migration
3. Update seed data if needed in `prisma/seed.ts`
4. Commit the migration files

### Environment Variables

- Never commit `.env` or `.env.local`
- Add new variables to `.env.example` with comments
- Document in PR description if new env vars are needed

## Troubleshooting

### Common Issues

**PostgreSQL won't start:**
```bash
# Check logs
docker logs luahje-postgres

# Reset (WARNING: loses data)
make db-reset
```

**Migrations fail:**
```bash
# Reset and start fresh
make db-reset
pnpm db:migrate
pnpm db:seed
```

**Node modules issues:**
```bash
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

### Getting Help

- Check existing [issues](https://github.com/muazhazali/luahje/issues)
- Create a new issue with clear reproduction steps
- Join discussions (if available)

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing! 💌
