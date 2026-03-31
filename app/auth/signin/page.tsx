'use client'

import { signIn } from 'next-auth/react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowLeft, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
      <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
      <path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
    </svg>
  )
}

export default function SignIn() {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4">
      {/* Background glow */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand/10 blur-[100px]" />
      </div>

      <div className="relative w-full max-w-sm">
        {/* Back */}
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-6"
        >
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Retour
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Logo */}
          <div className="mb-8 text-center">
            <div className="mb-4 flex justify-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand shadow-[0_0_24px_hsl(22_82%_55%/0.4)]">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
            </div>
            <h1 className="text-3xl font-black tracking-tight">
              Seo<span className="text-brand">Pic</span>
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Connectez-vous pour accéder à votre espace
            </p>
          </div>

          {/* Card */}
          <Card className="border-border/60 shadow-xl">
            <CardContent className="p-8">
              <h2 className="mb-1 text-lg font-bold">Bienvenue</h2>
              <p className="mb-6 text-sm text-muted-foreground">
                Utilisez votre compte Google pour continuer
              </p>

              <button
                onClick={() => signIn('google', { callbackUrl: '/dashboard' })}
                className="flex w-full items-center justify-center gap-3 rounded-xl border border-border bg-background px-4 py-3 text-sm font-semibold transition-all hover:bg-secondary hover:shadow-sm active:scale-[0.98]"
              >
                <GoogleIcon />
                Continuer avec Google
              </button>

              <p className="mt-6 text-center text-xs leading-relaxed text-muted-foreground">
                En vous connectant, vous acceptez les{' '}
                <a href="#" className="text-brand hover:underline">conditions d'utilisation</a>{' '}
                de SEOPIC.
              </p>
            </CardContent>
          </Card>

          <p className="mt-6 text-center text-xs text-muted-foreground">
            Une solution{' '}
            <a href="https://valt.agency" target="_blank" rel="noreferrer" className="font-semibold text-foreground hover:text-brand">
              VALT Agency
            </a>{' '}
            · Tanger, Maroc
          </p>
        </motion.div>
      </div>
    </div>
  )
}
