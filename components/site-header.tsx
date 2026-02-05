"use client"

import { Search, PenLine } from "lucide-react"

interface SiteHeaderProps {
  onOpenSubmit: () => void
  onOpenSearch: () => void
  searchQuery: string
}

export function SiteHeader({ onOpenSubmit, onOpenSearch, searchQuery }: SiteHeaderProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-border/40 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 md:px-6">
        <div className="flex flex-col">
          <h1 className="text-lg font-semibold tracking-tight text-foreground md:text-xl">
            The Unsent Archive
          </h1>
          <p className="hidden text-xs text-muted-foreground md:block">
            Messages never sent, feelings never shared
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenSearch}
            className="relative flex h-9 items-center gap-2 rounded-full border border-border bg-secondary/50 px-3 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground md:w-64"
            aria-label="Search messages"
          >
            <Search className="h-3.5 w-3.5 shrink-0" />
            <span className="hidden md:inline">
              {searchQuery ? `"${searchQuery}"` : "Search by name or keyword..."}
            </span>
            <span className="md:hidden">Search</span>
          </button>
          <button
            onClick={onOpenSubmit}
            className="flex h-9 items-center gap-2 rounded-full bg-foreground px-4 text-sm font-medium text-background transition-opacity hover:opacity-90"
          >
            <PenLine className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Write a message</span>
          </button>
        </div>
      </div>
    </header>
  )
}
