import PocketBase from "pocketbase"
import type { UnsentMessage } from "@/lib/types"
import { seedMessages } from "@/lib/seed-messages"

const COLLECTION_NAME = "messages"

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

export async function GET() {
  const pb = await getAuthedPocketBase()
  await ensureSeeded(pb)

  const records = await pb.collection(COLLECTION_NAME).getFullList({
    sort: "-created_at",
  })

  return Response.json(records.map((record) => mapRecord(record as MessageRecord)))
}

export async function POST(request: Request) {
  const pb = await getAuthedPocketBase()
  await ensureSeeded(pb)
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

  const record = await pb.collection(COLLECTION_NAME).create({
    recipient: to,
    body: message,
    color,
    created_at: toPocketBaseDate(new Date().toISOString()),
  })

  return Response.json(mapRecord(record as MessageRecord), { status: 201 })
}
