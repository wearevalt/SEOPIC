import type { Metadata } from 'next'
import './globals.css'
import Providers from './providers'

export const metadata: Metadata = {
  title: 'SEOPIC — Analyse SEO d\'images par IA',
  description: 'Optimisez vos images pour le SEO avec l\'IA. Alt text, meta title, meta description et keywords générés automatiquement.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
