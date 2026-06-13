# PostgreSQL Migration Plan for Luahje

## Overview
Migrate the backend from PocketBase to PostgreSQL using Docker for local development.

## Current Architecture
- **Database:** PocketBase (collection: `messages`)
- **Schema:** recipient (string), body (string), color (string), created_at (datetime)
- **API:** GET (list with pagination), POST (create with validation)
- **Features:** Rate limiting, seed data fallback, XSS filtering

---

## Phase 1: PostgreSQL Infrastructure

### 1.1 Docker Compose Setup
Create `docker-compose.yml`:
```yaml
version: '3.8'
services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: luahje
      POSTGRES_PASSWORD: luahje_dev
      POSTGRES_DB: luahje
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./init.sql:/docker-entrypoint-initdb.d/init.sql
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U luahje"]
      interval: 5s
      timeout: 5s
      retries: 5

  # Optional: pgAdmin for management
  pgadmin:
    image: dpage/pgadmin4:latest
    environment:
      PGADMIN_DEFAULT_EMAIL: admin@luahje.local
      PGADMIN_DEFAULT_PASSWORD: admin
    ports:
      - "5050:80"
    depends_on:
      - postgres

volumes:
  postgres_data:
```

### 1.2 Database Initialization
Create `init.sql` for initial schema:
```sql
CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recipient VARCHAR(50) NOT NULL,
    body TEXT NOT NULL,
    color VARCHAR(7) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_messages_created_at ON messages(created_at DESC);
```

---

## Phase 2: Application Layer (Choose Option A or B)

### Option A: Prisma ORM (Recommended)
**Pros:** Type-safe, migrations, better DX, schema management  
**Cons:** Additional dependency, learning curve

#### 2A.1 Setup
```bash
pnpm add prisma @prisma/client
pnpm dlx prisma init
```

#### 2A.2 Schema (`prisma/schema.prisma`)
```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Message {
  id        String   @id @default(uuid())
  recipient String   @db.VarChar(50)
  body      String
  color     String   @db.VarChar(7)
  createdAt DateTime @default(now()) @map("created_at") @db.Timestamptz()

  @@index([createdAt])
  @@map("messages")
}
```

#### 2A.3 Environment
```bash
DATABASE_URL="postgresql://luahje:luahje_dev@localhost:5432/luahje"
```

#### 2A.4 Database Client (`lib/db.ts`)
```typescript
import { PrismaClient } from '@prisma/client'

const globalForPrisma = global as unknown as { prisma: PrismaClient }

export const prisma = globalForPrisma.prisma || new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
```

### Option B: pg Driver (Simpler)
**Pros:** No schema files, direct SQL, lighter weight  
**Cons:** No type safety, manual migrations

#### 2B.1 Setup
```bash
pnpm add pg
pnpm add -D @types/pg
```

#### 2B.2 Database Client (`lib/db.ts`)
```typescript
import { Pool } from 'pg'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

export { pool }
```

---

## Phase 3: API Migration

### 3.1 GET /api/messages
**Current:** PocketBase collection query  
**New:** SQL query with LIMIT/OFFSET

```typescript
// Prisma version
const messages = await prisma.message.findMany({
  orderBy: { createdAt: 'desc' },
  take: 200,
})

// pg version
const result = await pool.query(
  'SELECT * FROM messages ORDER BY created_at DESC LIMIT $1',
  [200]
)
```

### 3.2 POST /api/messages
**Current:** PocketBase create record  
**New:** SQL INSERT

```typescript
// Prisma version
const message = await prisma.message.create({
  data: { recipient, body, color }
})

// pg version
const result = await pool.query(
  'INSERT INTO messages (recipient, body, color) VALUES ($1, $2, $3) RETURNING *',
  [recipient, body, color]
)
```

### 3.3 Seed Data Migration
Move seed data from `lib/seed-messages.ts` to database initialization:
- Option 1: Include in `init.sql`
- Option 2: Create a seed script using Prisma or pg

---

## Phase 4: Environment Updates

### Remove
- `POCKETBASE_URL`

### Add
```bash
# Required
DATABASE_URL="postgresql://luahje:luahje_dev@localhost:5432/luahje"

# Optional (for docker-compose)
POSTGRES_USER=luahje
POSTGRES_PASSWORD=luahje_dev
POSTGRES_DB=luahje
```

---

## Phase 5: Deployment Considerations

### 5.1 Cloudflare Workers
**Problem:** Workers don't support direct PostgreSQL connections (no Node.js runtime)  
**Solutions:**
1. **Neon Postgre** (serverless Postgres with HTTP API)
2. **Supabase** (PostgreSQL with REST API)
3. **Cloudflare D1** (SQLite, requires migration changes)
4. **Keep PocketBase for production** (dual mode)

### 5.2 Recommended: Neon PostgreSQL
- Serverless PostgreSQL
- Works with Prisma via connection pooling
- HTTP API available
- Free tier sufficient for this app

```bash
# Production env
DATABASE_URL="postgresql://user:pass@ep-xxx.us-east-1.aws.neon.tech/luahje?sslmode=require"
```

---

## Phase 6: Migration Script

### Step-by-step Commands

```bash
# 1. Start PostgreSQL
docker-compose up -d postgres

# 2. Install dependencies (Prisma path)
pnpm add prisma @prisma/client
pnpm dlx prisma init

# 3. Create schema and run migration
pnpm dlx prisma migrate dev --name init

# 4. Seed data (if needed)
pnpm dlx prisma db seed

# 5. Update API routes
# Replace PocketBase imports with Prisma/pg

# 6. Test
curl http://localhost:3000/api/messages
curl -X POST http://localhost:3000/api/messages \
  -H "Content-Type: application/json" \
  -d '{"to":"Test","message":"Hello","color":"#E63946"}'
```

---

## Decision Points

| Decision | Options | Recommendation |
|----------|---------|----------------|
| ORM | Prisma vs pg | **Prisma** - better long-term |
| Production DB | Neon vs Supabase vs D1 | **Neon** - best Prisma support |
| Seed Data | SQL file vs Prisma seed | **Prisma seed** - keeps in JS |
| Connection | Direct vs Pool | **Pool** - required for serverless |

---

## Risk Assessment

| Risk | Mitigation |
|------|------------|
| Cloudflare Workers incompatibility | Use Neon PostgreSQL with connection pooling |
| Migration data loss | PocketBase as fallback during transition |
| Performance | Connection pooling + indexes on created_at |
| Schema changes | Prisma migrations handle versioning |

---

## Timeline Estimate

- Phase 1 (Docker): 30 mins
- Phase 2 (Prisma setup): 30 mins
- Phase 3 (API migration): 1-2 hours
- Phase 4 (Environment): 15 mins
- Testing: 30 mins

**Total: ~4 hours**

---

## Recommended Path

1. **Use Prisma ORM** - Better developer experience
2. **Docker for local dev** - Easy to manage
3. **Neon for production** - Serverless PostgreSQL
4. **Keep seed data** - Fallback for empty database

Proceed with implementation?
