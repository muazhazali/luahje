# Deployment Guide for Cloudflare Pages

This guide will help you deploy the Luah Je application to Cloudflare Pages with D1 database.

## Prerequisites

- A Cloudflare account
- A GitHub repository connected to Cloudflare Pages
- Cloudflare API Token with the following permissions:
  - Account > D1 > Edit
  - Account > Cloudflare Pages > Edit
  - User > User Details > Read

## Setup Steps

### 1. Create D1 Database

First, create the D1 database on Cloudflare:

```bash
npx wrangler d1 create unsent_messages
```

This will output something like:

```
✅ Successfully created DB 'unsent_messages'

[[d1_databases]]
binding = "DB"
database_name = "unsent_messages"
database_id = "xxxx-xxxx-xxxx-xxxx-xxxx"
```

### 2. Update wrangler.toml

Copy the `database_id` from the output above and update `wrangler.toml`:

```toml
[[d1_databases]]
binding = "DB"
database_name = "unsent_messages"
database_id = "your-actual-database-id-here"  # Replace with actual ID
```

### 3. Run Database Migrations

Apply the database schema:

```bash
npx wrangler d1 execute unsent_messages --file=./migrations/0001_create_messages.sql
```

### 4. Configure GitHub Secrets

Add the following secrets to your GitHub repository (Settings → Secrets and variables → Actions):

- `CLOUDFLARE_API_TOKEN`: Your Cloudflare API token
- `CLOUDFLARE_ACCOUNT_ID`: Your Cloudflare account ID

### 5. Deploy via GitHub Actions

The deployment is automated via GitHub Actions. Simply push to the `main` branch:

```bash
git push origin main
```

The workflow will:
1. Install dependencies
2. Build the Next.js project for Cloudflare Pages
3. Deploy to Cloudflare Pages

### Manual Deployment (Alternative)

If you prefer to deploy manually:

```bash
# Build the project
pnpm run pages:build

# Deploy to Cloudflare Pages
npx wrangler pages deploy .vercel/output/static --project-name=luah-je
```

## Cloudflare Pages Project Setup

### Option 1: Using Wrangler (Recommended)

The GitHub Actions workflow will automatically create the Cloudflare Pages project on first deployment.

### Option 2: Manual Setup via Dashboard

1. Go to [Cloudflare Dashboard → Pages](https://dash.cloudflare.com/pages)
2. Click "Create a project"
3. Connect your GitHub repository
4. Configure build settings:
   - **Build command**: `pnpm run pages:build`
   - **Build output directory**: `.vercel/output/static`
   - **Root directory**: `/`

### Bind D1 Database to Pages Project

After creating the Pages project, bind the D1 database:

1. Go to your Cloudflare Pages project → Settings → Functions
2. Under "D1 database bindings", add:
   - **Variable name**: `DB`
   - **D1 database**: Select `unsent_messages`

## Verifying the Deployment

Once deployed, your application will be available at:
```
https://luah-je.pages.dev
```

Or your custom domain if configured.

## Troubleshooting

### Authentication Errors

If you get authentication errors, ensure your API token has the required permissions:
- Account > D1 > Edit
- Account > Cloudflare Pages > Edit
- User > User Details > Read

### Build Failures

If the build fails with module errors, ensure:
1. `@cloudflare/next-on-pages` is installed
2. The API routes use `getRequestContext()` instead of top-level `cloudflare:workers` imports

### Database Not Found

If you get "Missing D1 binding" errors:
1. Ensure the database is created
2. Verify the binding is configured in Cloudflare Pages settings
3. Check that `wrangler.toml` has the correct `database_id`

## Local Development

To run the project locally with D1:

```bash
# Start development server with Wrangler
pnpm run preview
```

This will start a local server with D1 database bindings.
