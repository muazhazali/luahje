#!/bin/bash
set -e

echo "=========================================="
echo "Cloudflare D1 Database Setup Script"
echo "=========================================="
echo ""
echo "This script will help you set up the D1 database for the Luah Je application."
echo ""

# Check if wrangler is available
if ! command -v wrangler &> /dev/null && ! command -v npx &> /dev/null; then
    echo "Error: Neither wrangler nor npx is available. Please install Node.js and npm/pnpm."
    exit 1
fi

WRANGLER_CMD="npx wrangler"

echo "Step 1: Creating D1 Database..."
echo "Running: $WRANGLER_CMD d1 create unsent_messages"
echo ""

# Try to create the database
if $WRANGLER_CMD d1 create unsent_messages; then
    echo ""
    echo "✅ Database created successfully!"
    echo ""
    echo "⚠️  IMPORTANT: Copy the database_id from the output above and update it in wrangler.toml"
    echo "   Replace 'REPLACE_ME' with your actual database_id"
    echo ""
    read -p "Press Enter once you've updated wrangler.toml with the database_id..."
else
    echo ""
    echo "❌ Failed to create database. This could be due to:"
    echo "   1. The database already exists"
    echo "   2. Insufficient API token permissions"
    echo "   3. Network issues"
    echo ""
    read -p "Enter your database_id manually (or press Enter to skip): " DB_ID
    
    if [ -n "$DB_ID" ]; then
        # Update wrangler.toml with the provided database_id
        if [ -f "wrangler.toml" ]; then
            sed -i.bak "s/database_id = \"REPLACE_ME\"/database_id = \"$DB_ID\"/" wrangler.toml
            echo "✅ Updated wrangler.toml with database_id: $DB_ID"
        fi
    else
        echo "⚠️  Skipping database_id update. Please update wrangler.toml manually."
    fi
fi

echo ""
echo "Step 2: Running Database Migrations..."
echo ""

if [ ! -f "wrangler.toml" ]; then
    echo "❌ Error: wrangler.toml not found. Please run this script from the project root."
    exit 1
fi

# Check if database_id is still REPLACE_ME
if grep -q 'database_id = "REPLACE_ME"' wrangler.toml; then
    echo "❌ Error: Please update the database_id in wrangler.toml before running migrations."
    echo "   Open wrangler.toml and replace 'REPLACE_ME' with your actual database_id."
    exit 1
fi

if [ -f "migrations/0001_create_messages.sql" ]; then
    echo "Running: $WRANGLER_CMD d1 execute unsent_messages --file=./migrations/0001_create_messages.sql"
    if $WRANGLER_CMD d1 execute unsent_messages --file=./migrations/0001_create_messages.sql; then
        echo ""
        echo "✅ Database migrations completed successfully!"
    else
        echo ""
        echo "❌ Failed to run migrations. Please check:"
        echo "   1. The database_id in wrangler.toml is correct"
        echo "   2. Your API token has D1 database permissions"
        echo "   3. You're authenticated with Cloudflare"
        exit 1
    fi
else
    echo "❌ Error: Migration file not found at migrations/0001_create_messages.sql"
    exit 1
fi

echo ""
echo "=========================================="
echo "✨ Setup Complete!"
echo "=========================================="
echo ""
echo "Next steps:"
echo "1. Verify your GitHub secrets are configured:"
echo "   - CLOUDFLARE_API_TOKEN"
echo "   - CLOUDFLARE_ACCOUNT_ID"
echo ""
echo "2. Push to the main branch to trigger deployment:"
echo "   git push origin main"
echo ""
echo "3. Or deploy manually with:"
echo "   pnpm run deploy"
echo ""
