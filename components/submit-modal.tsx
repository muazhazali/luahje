"use client"

import { useState } from "react"
import { useTranslations } from 'next-intl'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { MESSAGE_COLORS, getContrastColor } from "@/lib/types"

interface SubmitModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (to: string, message: string, color: string) => Promise<void> | void
}

const MAX_CHARS = 500

export function SubmitModal({ open, onOpenChange, onSubmit }: SubmitModalProps) {
  const t = useTranslations();
  const [to, setTo] = useState("")
  const [message, setMessage] = useState("")
  const [selectedColor, setSelectedColor] = useState(MESSAGE_COLORS[0].value)
  const [agreed, setAgreed] = useState(false)
  const [errors, setErrors] = useState<{ to?: string; message?: string; agreed?: string }>({})

  const textColor = getContrastColor(selectedColor)
  const charsLeft = MAX_CHARS - message.length

  async function handleSubmit() {
    const newErrors: typeof errors = {}
    if (!to.trim()) newErrors.to = t('message.errorName')
    if (!message.trim()) newErrors.message = t('message.errorMessage')
    if (message.length > MAX_CHARS) newErrors.message = t('message.errorTooLong')
    if (!agreed) newErrors.agreed = t('message.errorAgree')
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    await onSubmit(to, message, selectedColor)
    setTo("")
    setMessage("")
    setSelectedColor(MESSAGE_COLORS[0].value)
    setAgreed(false)
    setErrors({})
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl">{t('message.writeTitle')}</DialogTitle>
          <DialogDescription>
            {t('message.writeDescription')}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-5 pt-2">
          {/* Preview */}
          <div
            className="rounded-xl p-5 transition-colors duration-300"
            style={{ backgroundColor: selectedColor, color: textColor }}
          >
            <p
              className="mb-2 text-xs font-semibold uppercase tracking-widest opacity-70"
              style={{ color: textColor }}
            >
              {t('message.to')}: {to || "..."}
            </p>
            <p
              className="min-h-[48px] text-sm leading-relaxed"
              style={{ color: textColor }}
            >
              {message || t('message.previewPlaceholder')}
            </p>
          </div>

          {/* To field */}
          <div>
            <label htmlFor="to-field" className="mb-1.5 block text-sm font-medium text-foreground">
              {t('message.to')}
            </label>
            <input
              id="to-field"
              type="text"
              placeholder={t('message.toPlaceholder')}
              value={to}
              onChange={(e) => {
                setTo(e.target.value)
                setErrors((prev) => ({ ...prev, to: undefined }))
              }}
              className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              maxLength={50}
            />
            {errors.to && <p className="mt-1 text-xs text-destructive">{errors.to}</p>}
          </div>

          {/* Message field */}
          <div>
            <label htmlFor="message-field" className="mb-1.5 block text-sm font-medium text-foreground">
              {t('message.yourMessage')}
            </label>
            <textarea
              id="message-field"
              placeholder={t('message.messagePlaceholder')}
              value={message}
              onChange={(e) => {
                setMessage(e.target.value)
                setErrors((prev) => ({ ...prev, message: undefined }))
              }}
              className="flex min-h-[120px] w-full resize-none rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              maxLength={MAX_CHARS}
            />
            <div className="mt-1 flex items-center justify-between">
              {errors.message && (
                <p className="text-xs text-destructive">{errors.message}</p>
              )}
              <p
                className={`ml-auto text-xs ${
                  charsLeft < 50 ? "text-destructive" : "text-muted-foreground"
                }`}
              >
                {charsLeft} {t('message.charactersRemaining')}
              </p>
            </div>
          </div>

          {/* Color picker */}
          <div>
            <p className="mb-2 text-sm font-medium text-foreground">{t('message.chooseColor')}</p>
            <div className="flex flex-wrap gap-2">
              {MESSAGE_COLORS.map((c) => (
                <button
                  key={c.value}
                  onClick={() => setSelectedColor(c.value)}
                  className={`h-9 w-9 rounded-full border-2 transition-all ${
                    selectedColor === c.value
                      ? "scale-110 border-foreground shadow-md"
                      : "border-transparent hover:scale-105"
                  }`}
                  style={{ backgroundColor: c.value }}
                  aria-label={`Select ${c.name}`}
                  title={c.name}
                  type="button"
                />
              ))}
            </div>
          </div>

          {/* Agreement */}
          <label className="flex items-start gap-2.5 text-sm text-muted-foreground">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => {
                setAgreed(e.target.checked)
                setErrors((prev) => ({ ...prev, agreed: undefined }))
              }}
              className="mt-0.5 h-4 w-4 rounded border-border accent-foreground"
            />
            <span>
              {t('message.agreement')}
            </span>
          </label>
          {errors.agreed && <p className="-mt-3 text-xs text-destructive">{errors.agreed}</p>}

          {/* Submit */}
          <button
            onClick={handleSubmit}
            className="h-11 w-full rounded-lg bg-foreground text-sm font-medium text-background transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {t('message.submit')}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
