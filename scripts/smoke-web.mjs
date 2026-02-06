const baseUrl = process.env.WEB_URL || "http://localhost:3000"
const timeoutMs = Number(process.env.SMOKE_TIMEOUT_MS || 10000)

async function fetchWithTimeout(url, options = {}) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    return await fetch(url, { ...options, signal: controller.signal })
  } finally {
    clearTimeout(timer)
  }
}

async function checkHomePage() {
  const response = await fetchWithTimeout(baseUrl, { redirect: "follow" })
  if (!response.ok) {
    throw new Error(`Home page check failed (${response.status}) at ${response.url}`)
  }
  const contentType = response.headers.get("content-type") || ""
  const body = await response.text()
  if (!body.trim()) {
    throw new Error(`Home page returned empty body at ${response.url}`)
  }
  if (!contentType.includes("text/html")) {
    console.warn(`Home page content-type is ${contentType || "unknown"}`)
  }
  console.log(`Home page OK: ${response.url}`)
}

async function checkMessagesApi() {
  const apiUrl = new URL("/api/messages", baseUrl).toString()
  const response = await fetchWithTimeout(apiUrl, { headers: { accept: "application/json" } })
  if (!response.ok) {
    throw new Error(`API check failed (${response.status}) at ${apiUrl}`)
  }
  const data = await response.json()
  if (!Array.isArray(data)) {
    throw new Error("API check failed: expected an array response from /api/messages.")
  }
  console.log(`API OK: ${apiUrl} (${data.length} messages)`)
}

async function run() {
  await checkHomePage()
  await checkMessagesApi()
  console.log("Web smoke test passed.")
}

run().catch((error) => {
  console.error(error)
  process.exit(1)
})
