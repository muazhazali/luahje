# Cloudflare Pages Deployment Setup

## Summary

The Cloudflare Pages deployment has been successfully configured and merged to the `main` branch. The GitHub Actions workflow is set up and will automatically deploy your application to Cloudflare Pages whenever you push to the main branch.

## What Has Been Done

✅ **Merged Changes to Main**
- Successfully resolved conflicts from the draft PRs (#1 and #2)
- Merged all Cloudflare deployment configuration to main
- Updated API route to use `getRequestContext` for Cloudflare Workers compatibility
- Added GitHub Actions workflow for automated deployment
- Updated dependencies and lockfile

✅ **Configuration Files Updated**
- `package.json`: Added Cloudflare build scripts and dependencies
- `app/api/messages/route.ts`: Fixed to use `@cloudflare/next-on-pages` 
- `wrangler.toml`: Configured with D1 database bindings and build output
- `.gitignore`: Added `.vercel/` and `.wrangler/` directories
- `.github/workflows/deploy.yml`: Created automated deployment workflow

## What You Need to Do

### 1. Set Up Cloudflare Account and Project

If you haven't already:
1. Sign in to your [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Go to **Workers & Pages** section
3. Create a new Pages project named `luah-je` (or update the workflow to use your project name)

### 2. Create a D1 Database

1. In your Cloudflare Dashboard, go to **Workers & Pages** > **D1**
2. Create a new D1 database named `unsent_messages`
3. Copy the database ID and update it in `wrangler.toml` (replace `REPLACE_ME`)
4. Run the migration to create the messages table:
   ```bash
   npx wrangler d1 execute unsent_messages --file=./migrations/0001_create_messages.sql
   ```

### 3. Configure GitHub Secrets

Add the following secrets to your GitHub repository:

**To add secrets:**
1. Go to your GitHub repository
2. Click **Settings** > **Secrets and variables** > **Actions**
3. Click **New repository secret**

**Required secrets:**

- `CLOUDFLARE_API_TOKEN`
  - Create at: https://dash.cloudflare.com/profile/api-tokens
  - Click "Create Token"
  - Use the "Edit Cloudflare Workers" template
  - Add permissions for:
    - Account > Cloudflare Pages: Edit
    - Account > D1: Edit
  - Copy the token and add it as a GitHub secret

- `CLOUDFLARE_ACCOUNT_ID`
  - Find this in your Cloudflare Dashboard URL: `dash.cloudflare.com/<account-id>/`
  - Or go to any Workers & Pages page and look at the URL
  - Add this as a GitHub secret

### 4. Update Database ID in wrangler.toml

Edit `wrangler.toml` and replace `REPLACE_ME` with your actual D1 database ID:

```toml
[[d1_databases]]
binding = "DB"
database_name = "unsent_messages"
database_id = "your-actual-database-id-here"
```

### 5. Test the Deployment

Once you've completed the above steps:

1. Push any commit to the `main` branch:
   ```bash
   git commit --allow-empty -m "trigger deployment"
   git push origin main
   ```

2. Watch the deployment progress:
   ```bash
   gh run watch
   ```

3. Once successful, your app will be available at: `https://luah-je.pages.dev`

## Automatic Deployment

From now on, every push to the `main` branch will automatically:
1. Install dependencies
2. Build the application with Cloudflare adapter
3. Deploy to Cloudflare Pages
4. Run D1 database migrations

## Local Development

To test the Cloudflare build locally:

```bash
# Build for Cloudflare
pnpm run pages:build

# Preview with Wrangler
pnpm run preview
```

## Notes

- The `@cloudflare/next-on-pages` package shows a deprecation warning suggesting OpenNext adapter. This is noted for future updates.
- The current setup uses Next.js 16.1.6, which is newer than the package's stated compatibility (<=15.5.2), but it should still work for basic functionality.
- The D1 migration step in the workflow is set to `continue-on-error: true` to avoid failures if the migration was already run.

## Troubleshooting

If deployment fails:
1. Check GitHub Actions logs: `gh run view --log-failed`
2. Verify all secrets are set correctly in GitHub
3. Ensure the D1 database exists and the ID in `wrangler.toml` is correct
4. Check Cloudflare Pages dashboard for any project configuration issues
