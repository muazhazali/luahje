"use client"

import { useParams, usePathname, useRouter, useSearchParams } from 'next/navigation'
import { Globe } from 'lucide-react'

const languages = [
  { code: 'en', label: 'English', flag: 'EN' },
  { code: 'ms', label: 'Bahasa Melayu', flag: 'MS' },
]

export function LanguageSwitcher() {
  const params = useParams()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const router = useRouter()
  const currentLocale = (params?.locale as string) || 'en'

  const switchLanguage = (newLocale: string) => {
    if (newLocale === currentLocale) return
    
    const hasLocalePrefix = pathname.startsWith(`/${currentLocale}`)
    const newPathname = hasLocalePrefix
      ? pathname.replace(`/${currentLocale}`, `/${newLocale}`)
      : pathname === '/'
        ? `/${newLocale}`
        : `/${newLocale}${pathname}`
    const queryString = searchParams.toString()
    router.push(queryString ? `${newPathname}?${queryString}` : newPathname)
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
