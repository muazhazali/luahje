"use client"

import { useCallback, useRef } from "react"
import { useTranslations } from 'next-intl'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Download, Share2 } from "lucide-react"
import type { UnsentMessage } from "@/lib/types"
import { getContrastColor } from "@/lib/types"

interface MessageDetailProps {
  message: UnsentMessage | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function MessageDetail({ message, open, onOpenChange }: MessageDetailProps) {
  const t = useTranslations();
  const cardRef = useRef<HTMLDivElement>(null)

  const handleDownload = useCallback(() => {
    if (!message) return
    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const width = 1080
    const height = 1350
    canvas.width = width
    canvas.height = height

    // Background
    ctx.fillStyle = message.color
    ctx.fillRect(0, 0, width, height)

    const textColor = getContrastColor(message.color)
    ctx.fillStyle = textColor

    // To header
    ctx.font = "600 28px sans-serif"
    ctx.globalAlpha = 0.7
    ctx.fillText(`TO: ${message.to.toUpperCase()}`, 80, 180)
    ctx.globalAlpha = 1

    // Message body
    ctx.font = "400 36px sans-serif"
    const words = message.message.split(" ")
    let line = ""
    let y = 280
    const maxWidth = width - 160
    const lineHeight = 52

    for (const word of words) {
      const testLine = line + word + " "
      const metrics = ctx.measureText(testLine)
      if (metrics.width > maxWidth && line !== "") {
        ctx.fillText(line.trim(), 80, y)
        line = word + " "
        y += lineHeight
      } else {
        line = testLine
      }
    }
    ctx.fillText(line.trim(), 80, y)

    // Footer
    ctx.globalAlpha = 0.5
    ctx.font = "400 22px sans-serif"
    ctx.fillText("Luah Je", 80, height - 80)
    ctx.globalAlpha = 1

    const link = document.createElement("a")
    link.download = `luah-je-to-${message.to.toLowerCase().replace(/\s/g, "-")}.png`
    link.href = canvas.toDataURL("image/png")
    link.click()
  }, [message])

  const handleShare = useCallback(async () => {
    if (!message) return
    const text = `To: ${message.to}\n\n${message.message}\n\n- Luah Je`
    const url = typeof window !== "undefined" ? window.location.href : ""

    if (navigator.share) {
      try {
        await navigator.share({ text, url })
      } catch {
        // User cancelled
      }
    } else {
      await navigator.clipboard.writeText(`${text}\n${url}`)
    }
  }, [message])

  if (!message) return null

  const textColor = getContrastColor(message.color)
  const dateStr = new Date(message.createdAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="sr-only">Message to {message.to}</DialogTitle>
          <DialogDescription className="sr-only">
            Full unsent message to {message.to}
          </DialogDescription>
        </DialogHeader>

        <div
          ref={cardRef}
          className="rounded-xl p-6 md:p-8"
          style={{ backgroundColor: message.color, color: textColor }}
        >
          <p
            className="mb-4 text-xs font-semibold uppercase tracking-widest opacity-70"
            style={{ color: textColor }}
          >
            {t('message.to')}: {message.to}
          </p>
          <p
            className="text-base leading-relaxed md:text-lg"
            style={{ color: textColor }}
          >
            {message.message}
          </p>
          <p
            className="mt-6 text-xs opacity-50"
            style={{ color: textColor }}
          >
            {dateStr}
          </p>
        </div>

        <div className="flex items-center justify-end gap-2 pt-1">
          <button
            onClick={handleDownload}
            className="flex h-9 items-center gap-2 rounded-lg border border-border px-3 text-sm text-foreground transition-colors hover:bg-secondary"
            aria-label="Download as image"
          >
            <Download className="h-3.5 w-3.5" />
            {t('message.download')}
          </button>
          <button
            onClick={handleShare}
            className="flex h-9 items-center gap-2 rounded-lg border border-border px-3 text-sm text-foreground transition-colors hover:bg-secondary"
            aria-label="Share this message"
          >
            <Share2 className="h-3.5 w-3.5" />
            {t('message.share')}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
