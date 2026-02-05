# Cloudflare Deployment Guide

This guide will help you deploy your Next.js application to Cloudflare Pages with D1 database.

## Prerequisites

- A Cloudflare account
- Cloudflare API Token (get it from https://dash.cloudflare.com/profile/api-tokens)
- Cloudflare Account ID (found in your Cloudflare dashboard URL or Workers & Pages overview)

## Quick Start: Automated Deployment with GitHub Actions

The easiest way to deploy is using the included GitHub Actions workflow:

### 1. Set Up GitHub Secrets

Go to your GitHub repository Settings > Secrets and variables > Actions, and add:

- `CLOUDFLARE_API_TOKEN`: Your Cloudflare API token
- `CLOUDFLARE_ACCOUNT_ID`: Your Cloudflare Account ID

### 2. Create D1 Database (One-time setup)

Before the first deployment, you need to create the D1 database:

```bash
# Authenticate with Cloudflare
export CLOUDFLARE_API_TOKEN="your-token-here"
export CLOUDFLARE_ACCOUNT_ID="your-account-id-here"

# Create database
npx wrangler d1 create unsent_messages

# Update wrangler.toml with the database_id from the output above
```

### 3. Deploy

Push to main/master branch or manually trigger the workflow from GitHub Actions tab.

---

## Manual Deployment

If you prefer to deploy manually:

## Authentication

You have two options to authenticate:

### Option 1: Using Wrangler Login (Interactive)
```bash
npx wrangler login
```

### Option 2: Using API Token (Non-Interactive)
1. Go to https://dash.cloudflare.com/profile/api-tokens
2. Create a new API token with the following permissions:
   - Account Settings: Read
   - D1: Edit
   - Workers Scripts: Edit
   - Pages: Edit
3. Add the token as a secret in Cursor Dashboard (Cloud Agents > Secrets):
   - Name: `CLOUDFLARE_API_TOKEN`
   - Value: Your API token

## Deployment Steps

Once authenticated, run the following commands:

### 1. Create D1 Database
```bash
npx wrangler d1 create unsent_messages
```

This will output something like:
```
✅ Successfully created DB 'unsent_messages'
database_id = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
```

### 2. Update wrangler.toml
Copy the `database_id` from the output above and update `wrangler.toml`:
```toml
[[d1_databases]]
binding = "DB"
database_name = "unsent_messages"
database_id = "your-actual-database-id-here"
```

### 3. Run Database Migrations
```bash
npx wrangler d1 execute unsent_messages --file=./migrations/0001_create_messages.sql
```

### 4. Deploy to Cloudflare Pages
```bash
npm run pages:build
npx wrangler pages deploy .vercel/output/static --project-name=luah-je
```

Or use the shorthand:
```bash
npm run deploy
```

### 5. Bind D1 Database to Pages Project
After deployment, you need to bind the D1 database:
```bash
npx wrangler pages deployment tail --project-name=luah-je
```

Then in the Cloudflare dashboard:
1. Go to Workers & Pages > luah-je
2. Go to Settings > Functions > D1 database bindings
3. Add binding:
   - Variable name: `DB`
   - D1 database: `unsent_messages`

## Alternative: Deploy via Cloudflare Dashboard

1. Go to https://dash.cloudflare.com/
2. Navigate to Workers & Pages
3. Click "Create application" > "Pages" > "Connect to Git"
4. Select your repository
5. Configure build settings:
   - Build command: `npm run pages:build`
   - Build output directory: `.vercel/output/static`
6. Add environment variable binding for D1 database

## Local Development

To test locally with D1:
```bash
# Create local D1 database
npx wrangler d1 execute unsent_messages --local --file=./migrations/0001_create_messages.sql

# Run development server
npm run preview
```

## Troubleshooting

### Error: "You are not authenticated"
Run `npx wrangler login` or add `CLOUDFLARE_API_TOKEN` to your environment.

### Error: "database_id not found"
Make sure you've updated `wrangler.toml` with the correct database_id from step 1.

### Build Errors
If you encounter build errors, try:
```bash
pnpm install
npm run build
```

## Additional Resources

- [Cloudflare Pages Documentation](https://developers.cloudflare.com/pages/)
- [Cloudflare D1 Documentation](https://developers.cloudflare.com/d1/)
- [Next.js on Cloudflare](https://developers.cloudflare.com/pages/framework-guides/nextjs/)
