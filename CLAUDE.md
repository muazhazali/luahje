# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Luahje is a Next.js 16 application for sharing anonymous "unsent" messages. It supports bilingual content (English/Malay) and is designed to deploy on Cloudflare Workers using OpenNext.

## Development Commands

- `pnpm dev` - Start the development server on http://localhost:3000
- `pnpm build` - Build the Next.js application
- `pnpm build:cf` - Build for Cloudflare Workers deployment
- `pnpm deploy:cf` - Deploy to Cloudflare Workers
- `pnpm lint` - Run ESLint
- `pnpm pb:setup` - Set up PocketBase (local database)
- `pnpm web:smoke` - Run smoke tests

## Architecture

### Internationalization (i18n)

Uses `next-intl` for routing and translations:
- Locales: `en` (default), `ms`
- Locale prefix: `as-needed` (no prefix for default locale)
- Middleware matches: `/`, `/(ms|en)/:path*`, and excludes `/api`, `/_next`, files
- Messages stored in `/messages/{locale}.json`

### Routing Structure

- Root layout (`app/layout.tsx`) - Minimal, only for static params generation
- Locale layouts (`app/[locale]/layout.tsx`) - Main app layout with fonts, providers
- Locale pages (`app/[locale]/page.tsx`) - Server component that renders `page-client.tsx`
- API routes (`app/api/messages/route.ts`) - PocketBase-backed message CRUD

### Database (PocketBase)

The app uses PocketBase as the backend:
- Collection: `messages` with fields: `recipient`, `body`, `color`, `created_at`
- Environment variable: `POCKETBASE_URL`
- Graceful fallback to seed data if PocketBase is unavailable

### Styling

- Tailwind CSS 4.x with custom color system
- shadcn/ui components in `/components/ui/`
- Custom fonts: Source Sans (sans), IM Fell (serif/display)
- Theme support via `next-themes`

### Components

Key components in `/components/`:
- `message-grid.tsx` - Grid display with masonry layout
- `message-card.tsx` - Individual message card
- `message-detail.tsx` - Full-screen message modal
- `submit-modal.tsx` - Form for submitting new messages
- `search-modal.tsx` - Search and filter messages
- `language-switcher.tsx` - Locale toggle
- `site-header.tsx` - Navigation header

### Type System

Core types in `/lib/types.ts`:
- `UnsentMessage` - Message data structure
- `SortMode` - "newest" | "oldest" | "random"
- `MESSAGE_COLORS` - 12 predefined colors with contrast calculation

## Security Considerations

The API implements several protections:
- Rate limiting per IP (8 POST/min, 60 GET/min)
- CORS origin validation via `ALLOWED_ORIGINS` or `NEXT_PUBLIC_SITE_URL`
- XSS filtering: blocks `<script`, `<iframe`, `javascript:`, event handlers
- Link limits: max 2 URLs per message
- Input sanitization: strips control characters
- Security headers on API responses

## Environment Variables

Required for production:
- `POCKETBASE_URL` - PocketBase instance URL
- `ALLOWED_ORIGINS` - Comma-separated list of allowed origins for API
- `NEXT_PUBLIC_SITE_URL` - Fallback for allowed origins

## Deployment

Configured for Cloudflare Workers:
- Uses `@opennextjs/cloudflare` adapter
- `wrangler.jsonc` for Worker configuration
- Images are unoptimized (`unoptimized: true` in next.config.mjs)
- Build ignores TypeScript errors (`ignoreBuildErrors: true`)

## Package Manager

Uses pnpm with security overrides in `package.json` for transitive dependencies.
