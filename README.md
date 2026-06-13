# Luahje

A beautiful, anonymous platform for sharing "unsent" messages — those words you never said but wish you had. Built with Next.js 16, PostgreSQL, and deployed on Cloudflare Workers.

![Luahje Screenshot](https://placeholder-screenshot-url.com)

## Quick Start

**One command to get started:**

```bash
git clone https://github.com/muazhazali/luahje.git
cd luahje
./scripts/setup.sh
```

Then open http://localhost:3000

That's it! The setup script handles everything: dependencies, database, migrations, and sample data.

## What is Luahje?

Luahje (Malay for "letter") is a digital message board where users can:
- **Write anonymous messages** to anyone — past loves, old friends, missed connections
- **Browse a curated feed** of heartfelt, unsent letters from others
- **Search and filter** messages by color, recipient, or content
- **Experience in bilingual** — supports English and Malay (Bahasa Malaysia)

Each message is displayed as a beautiful card in a masonry grid, color-coded by the sender's choice from a curated palette.

## Features

- ✉️ **Anonymous messaging** — no accounts, no tracking
- 🎨 **12 color themes** for messages (Rose, Coral, Peach, Sunflower, Mint, Sage, Sky, Ocean, Lavender, Plum, Blush, Slate)
- 🔍 **Search & filter** by recipient name or message content
- 🌐 **Bilingual support** — switch between English and Malay
- 🌙 **Dark mode** — automatic theme detection
- 📱 **Responsive design** — works on all devices
- ⚡ **Fast** — deployed on Cloudflare's edge network
- 🔒 **Secure** — rate limiting, XSS protection, CORS validation

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript 6
- **Database:** PostgreSQL (via Prisma ORM)
- **Styling:** Tailwind CSS 4 + shadcn/ui
- **I18n:** next-intl
- **Deployment:** Cloudflare Workers (OpenNext)
- **Containerization:** Docker + Docker Compose

## Directory Structure

```
luahje/
├── app/                          # Next.js App Router
│   ├── [locale]/                 # Internationalized routes (en, ms)
│   │   ├── layout.tsx            # Root layout with fonts, providers
│   │   ├── page.tsx              # Server component wrapper
│   │   ├── page-client.tsx       # Main page with message grid
│   │   └── globals.css           # Global styles + Tailwind
│   ├── api/
│   │   └── messages/
│   │       └── route.ts          # API: GET/POST messages (Prisma)
│   └── layout.tsx                # Root layout (minimal)
├── components/                   # React components
│   ├── ui/                       # shadcn/ui components
│   ├── message-grid.tsx          # Masonry grid display
│   ├── message-card.tsx          # Individual message card
│   ├── message-detail.tsx        # Full-screen message modal
│   ├── submit-modal.tsx          # Submit message form
│   ├── search-modal.tsx          # Search interface
│   ├── site-header.tsx           # Navigation header
│   └── language-switcher.tsx     # Locale toggle
├── lib/                          # Utilities
│   ├── db.ts                     # Prisma client singleton
│   ├── types.ts                  # TypeScript types
│   ├── utils.ts                  # Tailwind class merging (cn)
│   └── seed-messages.ts          # Sample data fallback
├── prisma/                       # Database
│   ├── schema.prisma             # Prisma schema (Message model)
│   ├── seed.ts                   # Database seeding script
│   └── migrations/               # Database migrations
├── messages/                     # i18n translations
│   ├── en.json                   # English translations
│   └── ms.json                   # Malay translations
├── i18n.ts                       # i18n configuration
├── middleware.ts                 # Next.js middleware (locale routing)
├── docker-compose.yml            # PostgreSQL + pgAdmin containers
├── next.config.mjs               # Next.js config
├── tailwind.config.ts            # Tailwind configuration
└── package.json
```

## Getting Started

### Prerequisites

- Node.js 20+
- pnpm: `npm install -g pnpm`
- Docker + Docker Compose: https://docs.docker.com/get-docker/

### Option 1: One-Command Setup (Recommended)

```bash
git clone https://github.com/muazhazali/luahje.git
cd luahje
./scripts/setup.sh
```

This script automatically:
- ✅ Checks your prerequisites
- ✅ Installs dependencies
- ✅ Creates environment files
- ✅ Starts PostgreSQL
- ✅ Runs migrations
- ✅ Seeds sample data

### Option 2: Manual Setup

```bash
# Clone and install
git clone https://github.com/muazhazali/luahje.git
cd luahje
pnpm install

# Copy environment files
cp .env.example .env
cp .env.local.example .env.local

# Start PostgreSQL
pnpm db:up

# Setup database
pnpm db:migrate
pnpm db:seed

# Start development server
pnpm dev
```

### Option 3: Using Make

```bash
make setup   # One-time setup
make dev     # Start development server
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Development Commands

### Quick Start

| Command | Description |
|---------|-------------|
| `./scripts/setup.sh` | One-command full setup |
| `./scripts/dev.sh` | Quick start (DB + dev server) |
| `make setup` | Setup using Make |
| `make dev` | Start dev server using Make |
| `make help` | Show all Make commands |

### Package Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start Next.js dev server (Turbopack) |
| `pnpm build` | Build for production |
| `pnpm start` | Start production server |
| `pnpm lint` | Run ESLint |
| `pnpm db:up` | Start PostgreSQL Docker container |
| `pnpm db:down` | Stop PostgreSQL container |
| `pnpm db:reset` | **Reset database (destructive!)** |
| `pnpm db:migrate` | Run Prisma migrations |
| `pnpm db:seed` | Seed database with sample messages |
| `pnpm db:studio` | Open Prisma Studio (database GUI) |
| `pnpm build:cf` | Build for Cloudflare Workers |
| `pnpm deploy:cf` | Deploy to Cloudflare |

## Database Management

### Prisma Studio (GUI)

```bash
pnpm db:studio
```

Open http://localhost:5555 to browse and edit database records.

### pgAdmin (Alternative GUI)

If you started the full docker-compose stack:

1. Open http://localhost:5050
2. Login: `admin@luahje.local` / `admin`
3. Add server:
   - Name: `luahje`
   - Host: `postgres` (Docker service name)
   - Port: `5432`
   - DB: `luahje`
   - User: `luahje`
   - Password: `luahje_dev`

### Environment Variables

Create `.env.local` (copied from `.env`):

```bash
# Database (local development)
DATABASE_URL="postgresql://luahje:luahje_dev@localhost:5432/luahje?schema=public"

# Optional: CORS origins for API
ALLOWED_ORIGINS="http://localhost:3000,http://192.168.1.112:3000"

# Optional: Site URL (used for SEO/meta)
NEXT_PUBLIC_SITE_URL="http://localhost:3000"
```

## Deployment

### Cloudflare Workers (Production)

This app is configured for Cloudflare Workers deployment using OpenNext:

```bash
# Build
pnpm build:cf

# Deploy
pnpm deploy:cf
```

### Database for Production

For Cloudflare Workers, use a serverless PostgreSQL provider:

**Recommended: Neon PostgreSQL**
```bash
# Set production database URL
DATABASE_URL="postgresql://user:pass@ep-xxx.us-east-1.aws.neon.tech/luahje?sslmode=require"
```

Run migrations on production:
```bash
DATABASE_URL="your-production-url" pnpm db:migrate
```

## API Documentation

### GET /api/messages

Returns a list of messages (max 200, newest first).

**Response:**
```json
[
  {
    "id": "uuid",
    "to": "Recipient Name",
    "message": "Message content...",
    "color": "#E63946",
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
]
```

**Rate Limit:** 60 requests/minute per IP

### POST /api/messages

Submit a new message.

**Request Body:**
```json
{
  "to": "Recipient Name",
  "message": "Your message content...",
  "color": "#E63946"
}
```

**Constraints:**
- `to`: max 50 characters
- `message`: max 4999 characters
- `color`: must be from the allowed palette
- Max 2 links per message
- XSS filtering applied

**Rate Limit:** 8 requests/minute per IP

## Security

- **Rate limiting:** In-memory store per IP
- **XSS protection:** Blocks `<script>`, `<iframe>`, event handlers
- **CORS:** Origin validation via `ALLOWED_ORIGINS`
- **Input sanitization:** Control characters stripped
- **Security headers:** `X-Content-Type-Options`, `X-Frame-Options`, etc.

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Commit changes: `git commit -am 'Add new feature'`
4. Push to branch: `git push origin feature/my-feature`
5. Submit a pull request

## Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for:

- Detailed setup instructions
- Development workflow
- Code style guidelines
- Pull request process

**Quick start for contributors:**
```bash
./scripts/setup.sh  # One-command setup
./scripts/dev.sh    # Start developing
```

## License

MIT License — feel free to use this for your own projects.

## Acknowledgments

- Built with [Next.js](https://nextjs.org)
- UI components from [shadcn/ui](https://ui.shadcn.com)
- Deployed on [Cloudflare](https://cloudflare.com)
- Inspired by the concept of unsent letters and missed connections
