# Luah Je - Unsent Messages

A Next.js application for sharing unsent messages, deployed on Cloudflare Pages with D1 database.

## Features

- 📝 Submit and view unsent messages
- 🎨 Color-coded message cards
- 🔍 Search functionality
- 🌙 Dark mode support
- ⚡ Edge runtime with Cloudflare D1 database
- 🚀 Automated deployment to Cloudflare Pages

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Runtime**: Cloudflare Workers (Edge)
- **Database**: Cloudflare D1 (SQLite)
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI + shadcn/ui
- **Deployment**: Cloudflare Pages

## Quick Start

### Prerequisites

- Node.js 20+ and pnpm
- Cloudflare account
- Cloudflare API token with appropriate permissions

### Local Development

1. **Install dependencies**
   ```bash
   pnpm install
   ```

2. **Set up D1 database**
   ```bash
   ./scripts/setup-d1.sh
   ```
   
   Or manually:
   ```bash
   # Create database
   npx wrangler d1 create unsent_messages
   
   # Update wrangler.toml with the database_id
   # Then run migrations
   npx wrangler d1 execute unsent_messages --file=./migrations/0001_create_messages.sql
   ```

3. **Run development server**
   ```bash
   pnpm run preview
   ```
   
   This starts a local Wrangler server with D1 bindings.

## Deployment

### Automated Deployment (Recommended)

This project includes a GitHub Actions workflow for automated deployment to Cloudflare Pages.

1. **Configure GitHub Secrets**
   
   Add these secrets to your repository (Settings → Secrets and variables → Actions):
   - `CLOUDFLARE_API_TOKEN`
   - `CLOUDFLARE_ACCOUNT_ID`

2. **Push to main branch**
   ```bash
   git push origin main
   ```
   
   The workflow will automatically:
   - Build the project
   - Deploy to Cloudflare Pages
   - Bind the D1 database

### Manual Deployment

```bash
# Build for Cloudflare Pages
pnpm run pages:build

# Deploy
pnpm run deploy
```

## Project Structure

```
.
├── app/
│   ├── api/messages/       # API routes for messages
│   ├── layout.tsx          # Root layout
│   └── page.tsx            # Home page
├── components/             # React components
│   ├── ui/                 # shadcn/ui components
│   ├── message-card.tsx
│   ├── message-grid.tsx
│   └── ...
├── lib/
│   ├── types.ts            # TypeScript types
│   └── seed-messages.ts    # Initial seed data
├── migrations/             # D1 database migrations
├── scripts/
│   └── setup-d1.sh         # Database setup script
├── wrangler.toml           # Cloudflare configuration
└── DEPLOYMENT.md           # Detailed deployment guide
```

## Configuration

### Cloudflare API Token Permissions

Your API token needs these permissions:
- **Account > D1 > Edit** - For database management
- **Account > Cloudflare Pages > Edit** - For deployments
- **User > User Details > Read** - For authentication

### Environment Variables

When deploying, ensure these are set in your Cursor Dashboard (Cloud Agents > Secrets):
- `CLOUDFLARE_API_TOKEN` - Your Cloudflare API token
- `CLOUDFLARE_ACCOUNT_ID` - Your Cloudflare account ID

## Database Schema

```sql
CREATE TABLE messages (
  id TEXT PRIMARY KEY,
  recipient TEXT NOT NULL,
  body TEXT NOT NULL,
  color TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE INDEX messages_created_at_idx ON messages (created_at DESC);
```

## Available Scripts

- `pnpm dev` - Start Next.js development server
- `pnpm build` - Build Next.js application
- `pnpm pages:build` - Build for Cloudflare Pages
- `pnpm preview` - Preview with Wrangler (local)
- `pnpm deploy` - Build and deploy to Cloudflare Pages
- `pnpm lint` - Run ESLint

## Troubleshooting

### Build Errors

If you encounter module import errors during build:
- Ensure you're using `getRequestContext()` from `@cloudflare/next-on-pages`
- Don't import `cloudflare:workers` at the top level

### Database Connection Issues

If you get "Missing D1 binding" errors:
1. Verify `database_id` in `wrangler.toml` is correct
2. Ensure D1 database binding is configured in Cloudflare Pages settings
3. Check that the binding name is "DB"

### Authentication Errors

If Wrangler commands fail with authentication errors:
- Verify your API token has the required permissions
- Check that `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` are set correctly

## Documentation

- [Deployment Guide](./DEPLOYMENT.md) - Detailed deployment instructions
- [Cloudflare Pages Docs](https://developers.cloudflare.com/pages/)
- [Cloudflare D1 Docs](https://developers.cloudflare.com/d1/)
- [Next.js on Cloudflare](https://github.com/cloudflare/next-on-pages)

## License

This project is private and proprietary.
