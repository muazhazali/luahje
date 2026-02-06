import React from "react"
import type { Viewport } from 'next'
import { IM_Fell_DW_Pica, Source_Sans_3 } from 'next/font/google'
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { locales } from '@/i18n';

import '../globals.css'

const imFellDWPica = IM_Fell_DW_Pica({ 
  weight: '400',
  style: 'italic',
  subsets: ['latin'], 
  variable: '--font-im-fell' 
})
const sourceSans = Source_Sans_3({
  weight: ['400', '500', '600'],
  subsets: ['latin'],
  variable: '--font-source-sans'
})

export const viewport: Viewport = {
  themeColor: '#fafaf9',
  userScalable: true,
}

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const messages = await getMessages({ locale }) as any;
  
  return {
    title: messages?.metadata?.title || 'Luah Je',
    description: messages?.metadata?.description || 'A digital archive of anonymous messages to the people we loved, lost, or never had the courage to speak to.',
  };
}

export default async function LocaleLayout({
  children,
  params
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;
  
  // Ensure that the incoming `locale` is valid
  if (!locales.includes(locale as any)) {
    notFound();
  }

  // Enable static rendering
  setRequestLocale(locale);

  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body className={`${imFellDWPica.variable} ${sourceSans.variable} font-sans antialiased`}>
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
