import PocketBase from "pocketbase"
import type { UnsentMessage } from "@/lib/types"
import { MESSAGE_COLORS } from "@/lib/types"
import { seedMessages } from "@/lib/seed-messages"

const COLLECTION_NAME = "messages"
const MAX_TO_LENGTH = 50
const MAX_MESSAGE_LENGTH = 4999
const MAX_BODY_BYTES = 4096
const MAX_GET_ITEMS = 200
const POST_RATE_LIMIT = { limit: 8, windowMs: 60_000 }
const GET_RATE_LIMIT = { limit: 60, windowMs: 60_000 }

type RateLimitEntry = {
  count: number
  resetAt: number
}

const rateLimitStore: Map<string, RateLimitEntry> =
  (globalThis as { __rateLimitStore?: Map<string, RateLimitEntry> }).__rateLimitStore ??
  new Map<string, RateLimitEntry>()

;(globalThis as { __rateLimitStore?: Map<string, RateLimitEntry> }).__rateLimitStore =
  rateLimitStore

const allowedColors = new Set(MESSAGE_COLORS.map((color) => color.value.toLowerCase()))
const securityHeaders = {
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "Referrer-Policy": "no-referrer",
  "Cache-Control": "no-store",
}

type MessageRecord = {
  id: string
  recipient: string
  body: string
  color: string
  created_at: string
}

function getPocketBaseConfig() {
  const url = process.env.POCKETBASE_URL
  const email = process.env.POCKETBASE_SU_EMAIL
  const password = process.env.POCKETBASE_SU_PASSWORD
  if (!url || !email || !password) {
    throw new Error("Missing PocketBase environment variables.")
  }
  return { url, email, password }
}

async function getAuthedPocketBase() {
  const { url, email, password } = getPocketBaseConfig()
  const pb = new PocketBase(url)
  await pb.collection("_superusers").authWithPassword(email, password)
  return pb
}

function mapRecord(record: MessageRecord): UnsentMessage {
  return {
    id: record.id,
    to: record.recipient,
    message: record.body,
    color: record.color,
    createdAt: record.created_at,
  }
}

function toPocketBaseDate(value: string) {
  return value.replace("T", " ")
}

function normalizeInput(value: string) {
  return value.replace(/[\u0000-\u001F\u007F]/g, "").trim()
}

function jsonResponse(data: unknown, init?: ResponseInit) {
  return Response.json(data, {
    ...init,
    headers: {
      ...securityHeaders,
      ...(init?.headers ?? {}),
    },
  })
}

function getClientIp(request: Request) {
  const forwardedFor = request.headers.get("x-forwarded-for")
  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim() ?? "unknown"
  }
  return (
    request.headers.get("x-real-ip") ??
    request.headers.get("cf-connecting-ip") ??
    "unknown"
  )
}

function isOriginAllowed(request: Request) {
  const origin = request.headers.get("origin")
  const allowedOrigins = (
    process.env.ALLOWED_ORIGINS ??
    process.env.NEXT_PUBLIC_SITE_URL ??
    ""
  )
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean)

  if (allowedOrigins.length === 0) return true
  if (!origin) return false
  return allowedOrigins.includes(origin)
}

function checkRateLimit(key: string, limit: number, windowMs: number) {
  const now = Date.now()
  const entry = rateLimitStore.get(key)
  if (!entry || entry.resetAt <= now) {
    rateLimitStore.set(key, { count: 1, resetAt: now + windowMs })
    return { allowed: true, retryAfterMs: 0 }
  }

  if (entry.count >= limit) {
    return { allowed: false, retryAfterMs: entry.resetAt - now }
  }

  entry.count += 1
  return { allowed: true, retryAfterMs: 0 }
}

function containsSuspiciousPayload(value: string) {
  const lowered = value.toLowerCase()
  if (lowered.includes("<script") || lowered.includes("<iframe")) return true
  if (lowered.includes("javascript:") || lowered.includes("data:text/html")) return true
  if (/on\w+=/i.test(value)) return true
  return false
}

function countLinks(value: string) {
  const matches = value.match(/https?:\/\/|www\./gi)
  return matches ? matches.length : 0
}

async function parseJsonBody(request: Request) {
  const contentType = request.headers.get("content-type") ?? ""
  if (!contentType.includes("application/json")) {
    return { error: "Unsupported content type.", status: 415 } as const
  }

  const lengthHeader = request.headers.get("content-length")
  if (lengthHeader && Number(lengthHeader) > MAX_BODY_BYTES) {
    return { error: "Payload too large.", status: 413 } as const
  }

  const rawBody = await request.text()
  if (rawBody.length > MAX_BODY_BYTES) {
    return { error: "Payload too large.", status: 413 } as const
  }

  try {
    return { data: JSON.parse(rawBody) } as const
  } catch {
    return { error: "Invalid JSON payload.", status: 400 } as const
  }
}

async function ensureSeeded(pb: PocketBase) {
  const firstPage = await pb.collection(COLLECTION_NAME).getList(1, 1)
  if (firstPage.totalItems > 0) return

  for (const message of seedMessages) {
    await pb.collection(COLLECTION_NAME).create({
      recipient: message.to,
      body: message.message,
      color: message.color,
      created_at: toPocketBaseDate(message.createdAt),
    })
  }
}

export async function GET(request: Request) {
  try {
    const ip = getClientIp(request)
    const rateKey = `get:${ip}`
    const limitResult = checkRateLimit(rateKey, GET_RATE_LIMIT.limit, GET_RATE_LIMIT.windowMs)
    if (!limitResult.allowed) {
      return jsonResponse(
        { error: "Too many requests. Please slow down." },
        {
          status: 429,
          headers: {
            "Retry-After": Math.ceil(limitResult.retryAfterMs / 1000).toString(),
          },
        }
      )
    }

    const pb = await getAuthedPocketBase()
    await ensureSeeded(pb)

    const records = await pb.collection(COLLECTION_NAME).getList(1, MAX_GET_ITEMS, {
      sort: "-created_at",
    })

    return jsonResponse(
      records.items.map((record) => mapRecord(record as unknown as MessageRecord))
    )
  } catch (error) {
    console.error("GET /api/messages failed", error)
    return jsonResponse({ error: "Unable to load messages." }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    if (!isOriginAllowed(request)) {
      return jsonResponse({ error: "Origin not allowed." }, { status: 403 })
    }

    const ip = getClientIp(request)
    const rateKey = `post:${ip}`
    const limitResult = checkRateLimit(rateKey, POST_RATE_LIMIT.limit, POST_RATE_LIMIT.windowMs)
    if (!limitResult.allowed) {
      return jsonResponse(
        { error: "Too many requests. Please slow down." },
        {
          status: 429,
          headers: {
            "Retry-After": Math.ceil(limitResult.retryAfterMs / 1000).toString(),
          },
        }
      )
    }

    const parsed = await parseJsonBody(request)
    if ("error" in parsed) {
      return jsonResponse({ error: parsed.error }, { status: parsed.status })
    }

    const body = parsed.data as {
      to?: string
      message?: string
      color?: string
    }

    const to = body.to ? normalizeInput(body.to) : ""
    const message = body.message ? normalizeInput(body.message) : ""
    const color = body.color ? normalizeInput(body.color) : ""

    if (!to || !message || !color) {
      return jsonResponse({ error: "Missing required fields." }, { status: 400 })
    }

    if (to.length > MAX_TO_LENGTH) {
      return jsonResponse({ error: "Recipient name is too long." }, { status: 400 })
    }

    if (message.length > MAX_MESSAGE_LENGTH) {
      return jsonResponse({ error: "Message is too long." }, { status: 400 })
    }

    if (!allowedColors.has(color.toLowerCase())) {
      return jsonResponse({ error: "Invalid color selection." }, { status: 400 })
    }

    if (containsSuspiciousPayload(to) || containsSuspiciousPayload(message)) {
      return jsonResponse({ error: "Message content is not allowed." }, { status: 400 })
    }

    if (countLinks(message) > 2) {
      return jsonResponse({ error: "Too many links in message." }, { status: 400 })
    }

    const pb = await getAuthedPocketBase()
    await ensureSeeded(pb)

    const record = await pb.collection(COLLECTION_NAME).create({
      recipient: to,
      body: message,
      color,
      created_at: toPocketBaseDate(new Date().toISOString()),
    })

    return jsonResponse(mapRecord(record as unknown as MessageRecord), { status: 201 })
  } catch (error) {
    console.error("POST /api/messages failed", error)
    return jsonResponse({ error: "Unable to submit message." }, { status: 500 })
  }
}
