import { getRequestContext } from "@cloudflare/next-on-pages"
import type { UnsentMessage } from "@/lib/types"
import { seedMessages } from "@/lib/seed-messages"

export const runtime = "edge"

const TABLE_NAME = "messages"

type D1ResultRow = {
  id: string
  recipient: string
  body: string
  color: string
  created_at: string
}

type Env = {
  DB: D1Database
}

function getDatabase() {
  const { env } = getRequestContext<Env>()
  const db = env.DB
  if (!db) {
    throw new Error("Missing D1 binding. Ensure DB is configured in wrangler.toml.")
  }
  return db
}

function mapRow(row: D1ResultRow): UnsentMessage {
  return {
    id: row.id,
    to: row.recipient,
    message: row.body,
    color: row.color,
    createdAt: row.created_at,
  }
}

async function ensureSeeded(db: ReturnType<typeof getDatabase>) {
  const countRow = await db.prepare(`SELECT COUNT(*) as count FROM ${TABLE_NAME}`).first()
  const count = Number(countRow?.count ?? 0)
  if (count > 0) return

  const inserts = seedMessages.map((message) =>
    db
      .prepare(
        `INSERT INTO ${TABLE_NAME} (id, recipient, body, color, created_at) VALUES (?1, ?2, ?3, ?4, ?5)`
      )
      .bind(message.id, message.to, message.message, message.color, message.createdAt)
  )

  await db.batch(inserts)
}

export async function GET() {
  const db = getDatabase()
  await ensureSeeded(db)

  const { results } = await db
    .prepare(
      `SELECT id, recipient, body, color, created_at FROM ${TABLE_NAME} ORDER BY created_at DESC`
    )
    .all()

  return Response.json(results.map(mapRow))
}

export async function POST(request: Request) {
  const db = getDatabase()
  await ensureSeeded(db)
  const body = (await request.json()) as {
    to?: string
    message?: string
    color?: string
  }

  const to = body.to?.trim() ?? ""
  const message = body.message?.trim() ?? ""
  const color = body.color?.trim() ?? ""

  if (!to || !message || !color) {
    return Response.json({ error: "Missing required fields." }, { status: 400 })
  }

  const newMessage: UnsentMessage = {
    id: `msg-${crypto.randomUUID()}`,
    to,
    message,
    color,
    createdAt: new Date().toISOString(),
  }

  await db
    .prepare(
      `INSERT INTO ${TABLE_NAME} (id, recipient, body, color, created_at) VALUES (?1, ?2, ?3, ?4, ?5)`
    )
    .bind(newMessage.id, newMessage.to, newMessage.message, newMessage.color, newMessage.createdAt)
    .run()

  return Response.json(newMessage, { status: 201 })
}
