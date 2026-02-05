#!/bin/bash

# Cloudflare Deployment Script
# This script automates the deployment of your Next.js app to Cloudflare Pages

set -e  # Exit on any error

echo "🚀 Starting Cloudflare deployment process..."

# Check if wrangler is authenticated
echo "📋 Checking authentication..."
if ! npx wrangler whoami > /dev/null 2>&1; then
  echo "❌ Not authenticated with Cloudflare."
  echo "Please run: npx wrangler login"
  echo "Or set CLOUDFLARE_API_TOKEN environment variable"
  exit 1
fi

echo "✅ Authenticated with Cloudflare"

# Check if database_id is set in wrangler.toml
if grep -q "REPLACE_ME" wrangler.toml; then
  echo "⚠️  Database ID not configured in wrangler.toml"
  echo "Creating D1 database..."
  
  # Create D1 database and capture output
  DB_OUTPUT=$(npx wrangler d1 create unsent_messages 2>&1)
  echo "$DB_OUTPUT"
  
  # Extract database_id
  DB_ID=$(echo "$DB_OUTPUT" | grep "database_id" | sed 's/.*database_id = "\(.*\)"/\1/')
  
  if [ -z "$DB_ID" ]; then
    echo "❌ Failed to create database or extract database_id"
    echo "Please create database manually and update wrangler.toml"
    exit 1
  fi
  
  echo "✅ Database created with ID: $DB_ID"
  
  # Update wrangler.toml
  echo "📝 Updating wrangler.toml..."
  sed -i.bak "s/REPLACE_ME/$DB_ID/" wrangler.toml
  rm wrangler.toml.bak 2>/dev/null || true
  
  echo "✅ Updated wrangler.toml with database ID"
  
  # Run migrations
  echo "📊 Running database migrations..."
  npx wrangler d1 execute unsent_messages --file=./migrations/0001_create_messages.sql
  echo "✅ Migrations completed"
else
  echo "✅ Database already configured"
  
  # Still run migrations in case they weren't run before
  echo "📊 Running database migrations..."
  npx wrangler d1 execute unsent_messages --file=./migrations/0001_create_messages.sql || echo "⚠️  Migrations may have already been run"
fi

# Build the application
echo "🔨 Building application for Cloudflare Pages..."
npm run pages:build

echo "✅ Build completed"

# Deploy to Cloudflare Pages
echo "🚀 Deploying to Cloudflare Pages..."
npx wrangler pages deploy .vercel/output/static --project-name=luah-je

echo ""
echo "✅ Deployment complete!"
echo ""
echo "📝 Next steps:"
echo "1. Go to your Cloudflare Dashboard"
echo "2. Navigate to Workers & Pages > luah-je"
echo "3. Go to Settings > Functions > D1 database bindings"
echo "4. Verify the D1 binding:"
echo "   - Variable name: DB"
echo "   - D1 database: unsent_messages"
echo ""
echo "Your app should be live at: https://luah-je.pages.dev"
