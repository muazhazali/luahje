"use client"

import { useState, useMemo, useCallback, useEffect } from "react"
import { useTranslations } from 'next-intl'
import type { UnsentMessage, SortMode } from "@/lib/types"
import { SiteHeader } from "@/components/site-header"
import { MessageGrid } from "@/components/message-grid"
import { SubmitModal } from "@/components/submit-modal"
import { SearchModal } from "@/components/search-modal"
import { MessageDetail } from "@/components/message-detail"

export default function Page() {
  const t = useTranslations();
  const [messages, setMessages] = useState<UnsentMessage[]>([])
  const [sortMode, setSortMode] = useState<SortMode>("newest")
  const [searchQuery, setSearchQuery] = useState("")
  const [activeColorFilter, setActiveColorFilter] = useState<string | null>(null)
  const [submitOpen, setSubmitOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [selectedMessage, setSelectedMessage] = useState<UnsentMessage | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)

  const loadMessages = useCallback(async () => {
    try {
      const response = await fetch("/api/messages", { cache: "no-store" })
      if (!response.ok) {
        throw new Error("Failed to load messages.")
      }
      const data = (await response.json()) as UnsentMessage[]
      setMessages(data)
    } catch (error) {
      console.error(error)
      setMessages([])
    }
  }, [])

  // Load messages on mount
  useEffect(() => {
    void loadMessages()
  }, [loadMessages])

  // Keyboard shortcut
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setSearchOpen(true)
      }
    }
    window.addEventListener("keydown", handleKey)
    return () => window.removeEventListener("keydown", handleKey)
  }, [])

  const handleSubmit = useCallback(async (to: string, message: string, color: string) => {
    const response = await fetch("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ to, message, color }),
    })

    if (!response.ok) {
      return
    }

    const newMsg = (await response.json()) as UnsentMessage
    setMessages((prev) => [newMsg, ...prev])
  }, [])

  const handleMessageClick = useCallback((msg: UnsentMessage) => {
    setSelectedMessage(msg)
    setDetailOpen(true)
  }, [])

  // Filter and sort
  const processedMessages = useMemo(() => {
    let filtered = [...messages]

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (m) =>
          m.to.toLowerCase().includes(q) ||
          m.message.toLowerCase().includes(q)
      )
    }

    // Color filter
    if (activeColorFilter) {
      filtered = filtered.filter((m) => m.color === activeColorFilter)
    }

    // Sort
    switch (sortMode) {
      case "newest":
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        break
      case "oldest":
        filtered.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
        break
      case "random":
        for (let i = filtered.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1))
          ;[filtered[i], filtered[j]] = [filtered[j], filtered[i]]
        }
        break
    }

    return filtered
  }, [messages, searchQuery, activeColorFilter, sortMode])

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader
        onOpenSubmit={() => setSubmitOpen(true)}
        onOpenSearch={() => setSearchOpen(true)}
        searchQuery={searchQuery}
      />

      {/* Hero section - shown when no search is active */}
      {!searchQuery && !activeColorFilter && (
        <section className="border-b border-border/40 bg-secondary/30">
          <div className="mx-auto flex max-w-7xl flex-col items-center px-4 py-16 text-center md:py-24">
            <h2 className="text-balance text-3xl font-semibold tracking-tight text-foreground md:text-5xl">
              {t('hero.title')}
              <br />
              <span className="text-muted-foreground">{t('hero.subtitle')}</span>
            </h2>
            <p className="mt-4 max-w-lg text-pretty text-sm leading-relaxed text-muted-foreground md:text-base">
              {t('hero.description')}
            </p>
            <button
              onClick={() => setSubmitOpen(true)}
              className="mt-8 h-11 rounded-full bg-foreground px-6 text-sm font-medium text-background transition-opacity hover:opacity-90"
            >
              {t('hero.cta')}
            </button>
          </div>
        </section>
      )}

      <main>
        <MessageGrid
          messages={processedMessages}
          sortMode={sortMode}
          onSortChange={setSortMode}
          activeColorFilter={activeColorFilter}
          onColorFilterChange={setActiveColorFilter}
          onMessageClick={handleMessageClick}
          searchQuery={searchQuery}
        />
      </main>

      <SubmitModal
        open={submitOpen}
        onOpenChange={setSubmitOpen}
        onSubmit={handleSubmit}
      />

      <SearchModal
        open={searchOpen}
        onOpenChange={setSearchOpen}
        query={searchQuery}
        onQueryChange={setSearchQuery}
      />

      <MessageDetail
        message={selectedMessage}
        open={detailOpen}
        onOpenChange={setDetailOpen}
      />

      {/* Footer */}
      <footer className="border-t border-border/40 py-8 text-center text-xs text-muted-foreground">
        <p>{t('footer.tagline')}</p>
      </footer>
    </div>
  )
}
