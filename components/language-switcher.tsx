"use client"

import { useParams, usePathname, useRouter } from 'next/navigation'
import { Globe } from 'lucide-react'

const languages = [
  { code: 'en', label: 'English', flag: 'EN' },
  { code: 'ms', label: 'Bahasa Melayu', flag: 'MS' },
]

export function LanguageSwitcher() {
  const params = useParams()
  const pathname = usePathname()
  const router = useRouter()
  const currentLocale = (params?.locale as string) || 'en'

  const switchLanguage = (newLocale: string) => {
    if (newLocale === currentLocale) return
    
    // Replace the current locale in the pathname
    const newPathname = pathname.replace(`/${currentLocale}`, `/${newLocale}`)
    router.push(newPathname || `/${newLocale}`)
  }

  const otherLanguage = languages.find(lang => lang.code !== currentLocale)

  return (
    <button
      onClick={() => otherLanguage && switchLanguage(otherLanguage.code)}
      className="flex h-9 items-center gap-2 rounded-full border border-border bg-secondary/50 px-3 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
      aria-label={`Switch to ${otherLanguage?.label}`}
      title={`Switch to ${otherLanguage?.label}`}
    >
      <Globe className="h-3.5 w-3.5 shrink-0" />
      <span className="hidden sm:inline">{otherLanguage?.flag}</span>
    </button>
  )
}
