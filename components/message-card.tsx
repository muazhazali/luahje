"use client"

import type { UnsentMessage } from "@/lib/types"
import { getContrastColor } from "@/lib/types"

interface MessageCardProps {
  message: UnsentMessage
  onClick: (message: UnsentMessage) => void
}

export function MessageCard({ message, onClick }: MessageCardProps) {
  const textColor = getContrastColor(message.color)

  return (
    <button
      onClick={() => onClick(message)}
      className="group w-full cursor-pointer rounded-2xl p-5 text-left transition-all duration-300 hover:scale-[1.02] hover:shadow-xl md:p-6"
      style={{ backgroundColor: message.color, color: textColor }}
      aria-label={`Message to ${message.to}. Click to read full message.`}
    >
      <p
        className="mb-3 text-xs font-semibold uppercase tracking-widest opacity-70"
        style={{ color: textColor }}
      >
        To: {message.to}
      </p>
      <p
        className="text-sm leading-relaxed md:text-base"
        style={{ color: textColor }}
      >
        {message.message.length > 140
          ? `${message.message.substring(0, 140)}...`
          : message.message}
      </p>
    </button>
  )
}
