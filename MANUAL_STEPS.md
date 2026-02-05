# Manual Setup Steps Required

Due to API token permission limitations, the following steps need to be completed manually:

## ⚠️ API Token Permissions

The current Cloudflare API token in the Cursor Dashboard lacks the following permissions:
- **D1 Database Management** - Cannot create databases or run migrations via CLI
- **Cloudflare Pages Deployment** - Cannot deploy directly via Wrangler
- **User Details Read** - Cannot retrieve user information

## 🔧 Manual Steps to Complete Deployment

### Option 1: Update API Token Permissions (Recommended)

1. Go to [Cloudflare Dashboard → API Tokens](https://dash.cloudflare.com/profile/api-tokens)
2. Edit your existing token or create a new one with these permissions:
   - **Account > D1 > Edit**
   - **Account > Cloudflare Pages > Edit**
   - **User > User Details > Read**
3. Update the token in Cursor Dashboard (Cloud Agents > Secrets)
4. Run the setup script:
   ```bash
   ./scripts/setup-d1.sh
   ```

### Option 2: Manual Setup via Cloudflare Dashboard

If you cannot update token permissions, follow these steps:

#### Step 1: Create D1 Database

1. Go to [Cloudflare Dashboard → D1](https://dash.cloudflare.com/?to=/:account/workers/d1)
2. Click "Create database"
3. Name it: `unsent_messages`
4. Copy the database ID
5. Update `wrangler.toml`:
   ```toml
   [[d1_databases]]
   binding = "DB"
   database_name = "unsent_messages"
   database_id = "your-database-id-here"  # Replace with actual ID
   ```

#### Step 2: Run Database Migration

Option A - Using Wrangler CLI (requires token with D1 permissions):
```bash
npx wrangler d1 execute unsent_messages --file=./migrations/0001_create_messages.sql
```

Option B - Via Cloudflare Dashboard:
1. Go to your D1 database in the dashboard
2. Click on "Console"
3. Copy and paste the contents of `migrations/0001_create_messages.sql`
4. Execute the SQL

#### Step 3: Create Cloudflare Pages Project

1. Go to [Cloudflare Dashboard → Pages](https://dash.cloudflare.com/pages)
2. Click "Create a project"
3. Choose "Connect to Git" and select your GitHub repository
4. Configure build settings:
   - **Production branch**: `main`
   - **Build command**: `pnpm run pages:build`
   - **Build output directory**: `.vercel/output/static`
5. Click "Save and Deploy"

#### Step 4: Bind D1 Database to Pages Project

1. Go to your Pages project → Settings → Functions
2. Scroll to "D1 database bindings"
3. Click "Add binding"
4. Configure:
   - **Variable name**: `DB`
   - **D1 database**: Select `unsent_messages`
5. Click "Save"

#### Step 5: Trigger Deployment

Once the Pages project is set up, deployments will happen automatically via GitHub Actions when you push to the `main` branch.

## ✅ Verification

After completing the manual steps:

1. **Check the D1 database**:
   ```bash
   npx wrangler d1 execute unsent_messages --command "SELECT COUNT(*) FROM messages"
   ```

2. **Visit your deployed site**:
   - Your site will be available at: `https://luah-je.pages.dev`
   - Or your custom domain if configured

3. **Test the application**:
   - Try creating a new message
   - Verify messages are displayed
   - Check that the database is working

## 🚀 GitHub Actions Deployment

The GitHub Actions workflow (`.github/workflows/deploy.yml`) is already configured and will:
- Automatically trigger on pushes to `main` branch
- Build the project with Cloudflare adapter
- Deploy to Cloudflare Pages

Make sure these secrets are configured in your GitHub repository:
- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`

## 📝 Summary of Completed Work

✅ **Completed**:
- Installed Wrangler and Cloudflare Next.js adapter
- Fixed API route to use `getRequestContext()` (no build errors)
- Updated `wrangler.toml` with pages configuration
- Created GitHub Actions workflow for automated deployment
- Built project successfully for Cloudflare Pages
- Added comprehensive documentation (README.md, DEPLOYMENT.md)
- Created database setup script
- Committed and pushed all changes to branch `cursor/cloudflare-deployment-secrets-e9b7`

⚠️ **Requires Manual Completion**:
- Create D1 database (or grant API token permissions)
- Update `database_id` in `wrangler.toml`
- Run database migrations
- Set up Cloudflare Pages project (or it will be created automatically on first deploy if using GitHub Actions with proper permissions)
- Bind D1 database to Pages project

## 🔗 Useful Links

- [Current PR on GitHub](https://github.com/muazhazali/luahje/pull/new/cursor/cloudflare-deployment-secrets-e9b7)
- [Cloudflare API Token Settings](https://dash.cloudflare.com/profile/api-tokens)
- [Cloudflare D1 Dashboard](https://dash.cloudflare.com/?to=/:account/workers/d1)
- [Cloudflare Pages Dashboard](https://dash.cloudflare.com/pages)
