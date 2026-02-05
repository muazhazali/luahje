"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import type { UnsentMessage, SortMode } from "@/lib/types"
import { MESSAGE_COLORS } from "@/lib/types"
import { MessageCard } from "./message-card"
import { X } from "lucide-react"

interface MessageGridProps {
  messages: UnsentMessage[]
  sortMode: SortMode
  onSortChange: (mode: SortMode) => void
  activeColorFilter: string | null
  onColorFilterChange: (color: string | null) => void
  onMessageClick: (message: UnsentMessage) => void
  searchQuery: string
}

const PAGE_SIZE = 12

export function MessageGrid({
  messages,
  sortMode,
  onSortChange,
  activeColorFilter,
  onColorFilterChange,
  onMessageClick,
  searchQuery,
}: MessageGridProps) {
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)
  const sentinelRef = useRef<HTMLDivElement>(null)

  // Reset visible count when filters change
  useEffect(() => {
    setVisibleCount(PAGE_SIZE)
  }, [sortMode, activeColorFilter, searchQuery])

  const loadMore = useCallback(() => {
    setVisibleCount((prev) => Math.min(prev + PAGE_SIZE, messages.length))
  }, [messages.length])

  // Infinite scroll observer
  useEffect(() => {
    const sentinel = sentinelRef.current
    if (!sentinel) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && visibleCount < messages.length) {
          loadMore()
        }
      },
      { rootMargin: "200px" }
    )
    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [visibleCount, messages.length, loadMore])

  const visibleMessages = messages.slice(0, visibleCount)

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 md:px-6">
      {/* Toolbar */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <p className="text-sm text-muted-foreground">
            {messages.length} {messages.length === 1 ? "message" : "messages"}
            {searchQuery && (
              <span>
                {" "}for <span className="font-medium text-foreground">{`"${searchQuery}"`}</span>
              </span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Color filter chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pr-2">
            {MESSAGE_COLORS.map((c) => (
              <button
                key={c.value}
                onClick={() =>
                  onColorFilterChange(activeColorFilter === c.value ? null : c.value)
                }
                className={`h-6 w-6 shrink-0 rounded-full border-2 transition-all ${
                  activeColorFilter === c.value
                    ? "scale-110 border-foreground"
                    : "border-transparent hover:scale-110"
                }`}
                style={{ backgroundColor: c.value }}
                aria-label={`Filter by ${c.name}`}
                title={c.name}
              />
            ))}
            {activeColorFilter && (
              <button
                onClick={() => onColorFilterChange(null)}
                className="ml-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-border text-muted-foreground hover:text-foreground"
                aria-label="Clear color filter"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>

          {/* Sort selector */}
          <select
            value={sortMode}
            onChange={(e) => onSortChange(e.target.value as SortMode)}
            className="h-8 rounded-lg border border-border bg-secondary/50 px-2 text-xs text-foreground outline-none"
            aria-label="Sort messages"
          >
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="random">Random</option>
          </select>
        </div>
      </div>

      {/* Grid */}
      {visibleMessages.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <p className="text-lg font-medium text-foreground">No messages found</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Try a different search or filter
          </p>
        </div>
      ) : (
        <div className="columns-1 gap-4 sm:columns-2 lg:columns-3 xl:columns-4">
          {visibleMessages.map((msg) => (
            <div key={msg.id} className="mb-4 break-inside-avoid">
              <MessageCard message={msg} onClick={onMessageClick} />
            </div>
          ))}
        </div>
      )}

      {/* Infinite scroll sentinel */}
      {visibleCount < messages.length && (
        <div ref={sentinelRef} className="flex justify-center py-8">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent" />
        </div>
      )}
    </div>
  )
}
