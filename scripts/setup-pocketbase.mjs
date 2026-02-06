import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import PocketBase from "pocketbase"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const rootDir = path.resolve(__dirname, "..")
const envPath = path.join(rootDir, ".env.local")

function parseEnvFile(contents) {
  const env = {}
  const lines = contents.split(/\r?\n/)
  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith("#")) continue
    const equalsIndex = trimmed.indexOf("=")
    if (equalsIndex === -1) continue
    const key = trimmed.slice(0, equalsIndex).trim()
    const value = trimmed.slice(equalsIndex + 1).trim()
    env[key] = value
  }
  return env
}

function getEnvConfig() {
  if (!fs.existsSync(envPath)) {
    throw new Error(`Missing .env.local at ${envPath}`)
  }
  const fileContents = fs.readFileSync(envPath, "utf8")
  const env = parseEnvFile(fileContents)
  const url = env.POCKETBASE_URL || process.env.POCKETBASE_URL
  const email = env.POCKETBASE_SU_EMAIL || process.env.POCKETBASE_SU_EMAIL
  const password = env.POCKETBASE_SU_PASSWORD || process.env.POCKETBASE_SU_PASSWORD
  if (!url || !email || !password) {
    throw new Error("Missing POCKETBASE_URL/POCKETBASE_SU_EMAIL/POCKETBASE_SU_PASSWORD.")
  }
  return { url, email, password }
}

const COLLECTION_NAME = "messages"
const desiredFields = [
  { name: "recipient", type: "text", required: true },
  { name: "body", type: "text", required: true },
  { name: "color", type: "text", required: true },
  { name: "created_at", type: "date", required: true },
]
const desiredIndexes = ["CREATE INDEX idx_messages_created_at ON messages (created_at)"]

async function ensureCollection(pb) {
  let collection
  try {
    collection = await pb.collections.getOne(COLLECTION_NAME)
  } catch (error) {
    if (error?.status !== 404) {
      throw error
    }
  }

  if (!collection) {
    return pb.collections.create({
      name: COLLECTION_NAME,
      type: "base",
      fields: desiredFields,
      indexes: desiredIndexes,
    })
  }

  const existingNames = new Set(collection.fields.map((field) => field.name))
  const missingFields = desiredFields.filter((field) => !existingNames.has(field.name))
  const mergedIndexes = Array.from(new Set([...(collection.indexes || []), ...desiredIndexes]))

  if (missingFields.length === 0 && mergedIndexes.length === (collection.indexes || []).length) {
    return collection
  }

  return pb.collections.update(collection.id, {
    name: collection.name,
    fields: [...collection.fields, ...missingFields],
    indexes: mergedIndexes,
  })
}

async function verifyWriteRead(pb) {
  const record = await pb.collection(COLLECTION_NAME).create({
    recipient: "PocketBase Test",
    body: "PocketBase connectivity check.",
    color: "#111111",
    created_at: toPocketBaseDate(new Date().toISOString()),
  })

  const fetched = await pb.collection(COLLECTION_NAME).getOne(record.id)
  await pb.collection(COLLECTION_NAME).delete(record.id)

  return fetched?.id === record.id
}

function toPocketBaseDate(value) {
  return value.replace("T", " ")
}

async function run() {
  const { url, email, password } = getEnvConfig()
  const pb = new PocketBase(url)

  console.log("Connecting to PocketBase...")
  await pb.collection("_superusers").authWithPassword(email, password)

  console.log(`Connected. Ensuring "${COLLECTION_NAME}" collection exists...`)
  await ensureCollection(pb)

  console.log("Verifying write/read/delete cycle...")
  const ok = await verifyWriteRead(pb)

  if (!ok) {
    throw new Error("PocketBase verification failed.")
  }

  console.log("PocketBase setup verified successfully.")
}

run().catch((error) => {
  console.error(error)
  process.exit(1)
})
