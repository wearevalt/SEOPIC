import type { Metadata, Viewport } from 'next'
import './globals.css'
import Providers from './providers'

export const metadata: Metadata = {
  metadataBase: new URL('https://seopic.io'),
  title: {
    default: 'SEOPIC — Analyse SEO d’images par IA',
    template: '%s | SEOPIC',
  },
  description:
    "Optimisez vos images pour le SEO avec l'IA. Alt text, meta title, meta description et keywords générés automatiquement.",
  openGraph: {
    title: 'SEOPIC — Analyse SEO d’images par IA',
    description:
      "Optimisez vos images pour le SEO avec l'IA. Alt text, meta title, meta description et keywords générés automatiquement.",
    url: 'https://seopic.io',
    siteName: 'SEOPIC',
    locale: 'fr_FR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SEOPIC — Analyse SEO d’images par IA',
    description:
      "Optimisez vos images pour le SEO avec l'IA. Alt text, meta title, meta description et keywords générés automatiquement.",
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#0B0B0C',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className="min-h-screen bg-background text-foreground">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
