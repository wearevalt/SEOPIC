'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Image as ImageIcon,
  Layers,
  Zap,
  Activity,
  Upload,
  BarChart2,
  Download,
  Check,
  ArrowRight,
  Star,
  Menu,
  X,
  Sun,
  Moon,
  ChevronRight,
  Sparkles,
  TrendingUp,
  Shield,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'

/* ─── DATA ─────────────────────────────────────────────────────── */

const features = [
  {
    icon: ImageIcon,
    title: 'Injection Métadonnées',
    desc: 'EXIF, IPTC, XMP — mots-clés, description, copyright et géolocalisation injectés dans vos images.',
    color: 'text-orange-400',
    bg: 'bg-orange-500/10',
  },
  {
    icon: Layers,
    title: 'Traitement par Lot',
    desc: 'Optimisez 100+ images en un clic. Templates, export ZIP, gain de temps massif.',
    color: 'text-blue-400',
    bg: 'bg-blue-500/10',
  },
  {
    icon: Zap,
    title: 'IA Suggestions',
    desc: "L'IA analyse vos images et suggère les meilleurs mots-clés SEO automatiquement.",
    color: 'text-yellow-400',
    bg: 'bg-yellow-500/10',
  },
  {
    icon: Activity,
    title: 'Audit SEO Images',
    desc: 'Scannez un site et obtenez un rapport complet avec score SEO global.',
    color: 'text-green-400',
    bg: 'bg-green-500/10',
  },
]

const steps = [
  {
    icon: Upload,
    title: 'Uploadez',
    desc: "Glissez vos images ou entrez l'URL de votre site",
    step: '01',
  },
  {
    icon: BarChart2,
    title: 'Analysez & Optimisez',
    desc: 'Score SEO, mots-clés IA, métadonnées injectées',
    step: '02',
  },
  {
    icon: Download,
    title: 'Téléchargez',
    desc: 'Image optimisée en JPG injecté ou WebP compressé',
    step: '03',
  },
]

const plans = [
  {
    name: 'Découverte',
    price: 0,
    annual: null,
    highlight: false,
    features: [
      '5 analyses / mois',
      'Injection EXIF + IPTC + XMP',
      'Traitement par lot',
      'AI Suggest',
      'Audit SEO site',
      'Academy gratuite',
    ],
    cta: 'Commencer gratuitement',
    primary: false,
  },
  {
    name: 'Pro',
    price: 29,
    annual: 20,
    highlight: true,
    features: [
      'Analyses illimitées',
      'Injection EXIF + IPTC + XMP',
      'Bulk illimité',
      'AI Suggest illimité',
      'Audit SEO illimité',
      'Academy Pro complète',
      'Géolocalisation GPS',
      'Support prioritaire',
    ],
    cta: 'Passer Pro',
    primary: true,
  },
  {
    name: 'Entreprise',
    price: null,
    annual: null,
    highlight: false,
    features: [
      'Tout le plan Pro',
      'White label',
      'Accès API complet',
      'Équipe illimitée',
      'Account manager dédié',
      'SLA & support dédié',
    ],
    cta: 'Nous contacter',
    primary: false,
  },
]

const reviews = [
  {
    name: 'Karim B.',
    role: 'E-commerce',
    text: 'Mes images sont enfin visibles sur Google Images. +340% de trafic en 2 mois.',
    rating: 5,
  },
  {
    name: 'Sophie L.',
    role: 'SEO',
    text: "L'injection EXIF/IPTC que personne ne fait — SeoPic le fait en 2 clics.",
    rating: 5,
  },
  {
    name: 'Ahmed M.',
    role: 'Photographe',
    text: 'Copyright injecté + visibilité. Double effet.',
    rating: 5,
  },
  {
    name: 'Laura D.',
    role: 'Blogueuse',
    text: 'La géolocalisation a boosté mon SEO local.',
    rating: 5,
  },
  {
    name: 'Youssef T.',
    role: 'Agence',
    text: 'Le bulk nous fait gagner 3h/semaine. ROI immédiat.',
    rating: 5,
  },
]

const stats = [
  { value: '+340%', label: 'trafic organique moyen' },
  { value: '100+', label: 'images / min traitées' },
  { value: '4.9★', label: 'satisfaction client' },
  { value: '50k+', label: 'images analysées' },
]

/* ─── ANIMATION VARIANTS ────────────────────────────────────────── */

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.1, ease: "easeOut" as const },
  }),
}

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
}

/* ─── NAVBAR ────────────────────────────────────────────────────── */

function Navbar({ dark, onToggle }: { dark: boolean; onToggle: () => void }) {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const { data: session } = useSession()

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', h, { passive: true })
    return () => window.removeEventListener('scroll', h)
  }, [])

  const links = [
    { label: 'Fonctionnalités', href: '#features' },
    { label: 'Comment ça marche', href: '#how' },
    { label: 'Tarifs', href: '#pricing' },
    { label: 'Témoignages', href: '#reviews' },
  ]

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        scrolled
          ? 'border-b border-border/60 bg-background/80 backdrop-blur-xl shadow-sm'
          : 'bg-transparent'
      )}
    >
      <div className="container flex h-16 max-w-6xl items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <span className="text-lg font-bold tracking-tight">
            Seo<span className="text-brand">Pic</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-6 md:flex">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {l.label}
            </a>
          ))}
        </nav>

        {/* Actions */}
        <div className="hidden items-center gap-2 md:flex">
          <button
            onClick={onToggle}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            aria-label="Toggle theme"
          >
            {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
          {session ? (
            <Button asChild size="sm" variant="brand">
              <Link href="/dashboard">Dashboard</Link>
            </Button>
          ) : (
            <>
              <Button asChild size="sm" variant="ghost">
                <Link href="/auth/signin">Connexion</Link>
              </Button>
              <Button asChild size="sm" variant="brand">
                <Link href="/auth/signin">
                  Essai gratuit <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                </Link>
              </Button>
            </>
          )}
        </div>

        {/* Mobile menu toggle */}
        <div className="flex items-center gap-2 md:hidden">
          <button
            onClick={onToggle}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-muted-foreground"
          >
            {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
          <button
            onClick={() => setOpen(!open)}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-muted-foreground"
          >
            {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden border-t border-border bg-background/95 backdrop-blur-xl md:hidden"
          >
            <div className="container flex flex-col gap-1 py-4">
              {links.map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="rounded-lg px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                >
                  {l.label}
                </a>
              ))}
              <Separator className="my-2" />
              <Button asChild variant="brand" className="w-full">
                <Link href="/auth/signin">Essai gratuit</Link>
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  )
}

/* ─── HERO ──────────────────────────────────────────────────────── */

function Hero() {
  const { data: session } = useSession()

  return (
    <section className="relative flex min-h-screen items-center overflow-hidden pt-16">
      {/* Background */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-1/3 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand/10 blur-[120px]" />
        <div className="absolute right-0 top-0 h-[400px] w-[400px] rounded-full bg-orange-400/5 blur-[80px]" />
        <div className="absolute bottom-0 left-0 h-[300px] w-[300px] rounded-full bg-yellow-500/5 blur-[80px]" />
        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              'linear-gradient(hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />
      </div>

      <div className="container relative max-w-6xl py-24">
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="visible"
          className="mx-auto max-w-4xl text-center"
        >
          {/* Badge */}
          <motion.div variants={fadeUp} custom={0}>
            <Badge variant="brand" className="mb-6 gap-1.5 px-3 py-1 text-xs">
              <Sparkles className="h-3 w-3" />
              Propulsé par Claude AI · VALT Agency
            </Badge>
          </motion.div>

          {/* Headline */}
          <motion.h1
            variants={fadeUp}
            custom={1}
            className="mb-6 text-5xl font-black leading-[1.08] tracking-tight sm:text-6xl md:text-7xl"
          >
            Boostez votre SEO
            <br />
            <span className="gradient-brand">avec l'IA image</span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            variants={fadeUp}
            custom={2}
            className="mx-auto mb-10 max-w-2xl text-lg text-muted-foreground sm:text-xl"
          >
            SeoPic analyse, optimise et injecte les métadonnées SEO dans vos images en quelques secondes.
            Résultat garanti sur Google Images.
          </motion.p>

          {/* CTAs */}
          <motion.div
            variants={fadeUp}
            custom={3}
            className="flex flex-col items-center justify-center gap-3 sm:flex-row"
          >
            <Button asChild size="xl" variant="brand" className="glow-brand w-full sm:w-auto">
              <Link href="/auth/signin">
                Commencer gratuitement
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button asChild size="xl" variant="outline" className="w-full sm:w-auto">
              <a href="#how">Voir comment ça marche</a>
            </Button>
          </motion.div>

          {/* Social proof micro */}
          <motion.div
            variants={fadeUp}
            custom={4}
            className="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground"
          >
            <span className="flex items-center gap-1.5">
              <Shield className="h-3.5 w-3.5 text-green-500" /> Gratuit pour commencer
            </span>
            <span className="flex items-center gap-1.5">
              <Check className="h-3.5 w-3.5 text-green-500" /> Sans carte bancaire
            </span>
            <span className="flex items-center gap-1.5">
              <TrendingUp className="h-3.5 w-3.5 text-brand" /> +340% trafic moyen
            </span>
          </motion.div>
        </motion.div>

        {/* Stats bar */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.6, ease: "easeOut" as const }}
          className="mx-auto mt-20 grid max-w-3xl grid-cols-2 gap-4 md:grid-cols-4"
        >
          {stats.map((s) => (
            <div
              key={s.label}
              className="rounded-xl border border-border bg-card/60 p-4 text-center backdrop-blur-sm"
            >
              <div className="text-2xl font-black text-brand">{s.value}</div>
              <div className="mt-0.5 text-xs text-muted-foreground">{s.label}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

/* ─── FEATURES ──────────────────────────────────────────────────── */

function Features() {
  return (
    <section id="features" className="py-24">
      <div className="container max-w-6xl">
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          className="mb-16 text-center"
        >
          <motion.div variants={fadeUp}>
            <Badge variant="brand" className="mb-4">
              Fonctionnalités
            </Badge>
          </motion.div>
          <motion.h2 variants={fadeUp} custom={1} className="text-4xl font-black tracking-tight sm:text-5xl">
            Tout pour dominer
            <br />
            <span className="gradient-brand">Google Images</span>
          </motion.h2>
          <motion.p variants={fadeUp} custom={2} className="mx-auto mt-4 max-w-xl text-muted-foreground">
            Un outil complet pensé pour les pros du SEO, e-commerçants et agences qui veulent des résultats.
          </motion.p>
        </motion.div>

        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
        >
          {features.map((f, i) => (
            <motion.div key={f.title} variants={fadeUp} custom={i}>
              <Card className="group h-full border-border/60 transition-all duration-300 hover:-translate-y-1 hover:border-brand/40 hover:shadow-lg">
                <CardHeader className="pb-3">
                  <div className={cn('mb-3 inline-flex h-11 w-11 items-center justify-center rounded-xl', f.bg)}>
                    <f.icon className={cn('h-5 w-5', f.color)} />
                  </div>
                  <CardTitle className="text-base">{f.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-sm leading-relaxed">{f.desc}</CardDescription>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

/* ─── HOW IT WORKS ──────────────────────────────────────────────── */

function HowItWorks() {
  return (
    <section id="how" className="py-24">
      <div className="container max-w-6xl">
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          className="mb-16 text-center"
        >
          <motion.div variants={fadeUp}>
            <Badge variant="brand" className="mb-4">
              Comment ça marche
            </Badge>
          </motion.div>
          <motion.h2 variants={fadeUp} custom={1} className="text-4xl font-black tracking-tight sm:text-5xl">
            3 étapes,
            <br />
            <span className="gradient-brand">des résultats immédiats</span>
          </motion.h2>
        </motion.div>

        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          className="relative grid gap-8 md:grid-cols-3"
        >
          {/* Connector line (desktop) */}
          <div className="absolute left-1/3 right-1/3 top-10 hidden h-[1px] bg-gradient-to-r from-transparent via-brand/40 to-transparent md:block" />
          <div className="absolute left-2/3 right-0 top-10 hidden h-[1px] bg-gradient-to-r from-brand/40 to-transparent md:block" />

          {steps.map((s, i) => (
            <motion.div key={s.title} variants={fadeUp} custom={i} className="relative flex flex-col items-center text-center">
              <div className="relative mb-6">
                <div className="flex h-20 w-20 items-center justify-center rounded-2xl border-2 border-brand/30 bg-brand/10">
                  <s.icon className="h-8 w-8 text-brand" />
                </div>
                <span className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-brand text-xs font-bold text-white">
                  {i + 1}
                </span>
              </div>
              <h3 className="mb-2 text-lg font-bold">{s.title}</h3>
              <p className="text-sm text-muted-foreground">{s.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

/* ─── PRICING ───────────────────────────────────────────────────── */

function Pricing() {
  const [annual, setAnnual] = useState(false)

  return (
    <section id="pricing" className="py-24">
      <div className="container max-w-6xl">
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          className="mb-16 text-center"
        >
          <motion.div variants={fadeUp}>
            <Badge variant="brand" className="mb-4">
              Tarifs
            </Badge>
          </motion.div>
          <motion.h2 variants={fadeUp} custom={1} className="text-4xl font-black tracking-tight sm:text-5xl">
            Simple,
            <span className="gradient-brand"> transparent</span>
          </motion.h2>

          {/* Toggle */}
          <motion.div variants={fadeUp} custom={2} className="mt-8 flex items-center justify-center gap-3">
            <span className={cn('text-sm', !annual && 'text-foreground font-medium', annual && 'text-muted-foreground')}>
              Mensuel
            </span>
            <button
              onClick={() => setAnnual(!annual)}
              className={cn(
                'relative h-6 w-11 rounded-full border transition-colors duration-200',
                annual ? 'border-brand bg-brand' : 'border-border bg-secondary'
              )}
            >
              <span
                className={cn(
                  'absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-200',
                  annual ? 'translate-x-5' : 'translate-x-0.5'
                )}
              />
            </button>
            <span className={cn('flex items-center gap-1.5 text-sm', annual && 'text-foreground font-medium', !annual && 'text-muted-foreground')}>
              Annuel
              <Badge variant="brand" className="text-[10px] px-1.5 py-0">-31%</Badge>
            </span>
          </motion.div>
        </motion.div>

        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          className="grid gap-6 md:grid-cols-3"
        >
          {plans.map((plan, i) => (
            <motion.div key={plan.name} variants={fadeUp} custom={i}>
              <Card
                className={cn(
                  'relative h-full transition-all duration-300 hover:-translate-y-1',
                  plan.highlight
                    ? 'border-brand/60 shadow-[0_0_40px_hsl(22_82%_55%/0.15)]'
                    : 'border-border/60 hover:border-border hover:shadow-md'
                )}
              >
                {plan.highlight && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                    <Badge variant="brand" className="shadow-lg">
                      <Star className="mr-1 h-3 w-3 fill-current" /> Populaire
                    </Badge>
                  </div>
                )}

                <CardHeader className="pb-4">
                  <CardTitle className="text-lg">{plan.name}</CardTitle>
                  <div className="mt-2">
                    {plan.price === null ? (
                      <span className="text-3xl font-black">Sur devis</span>
                    ) : plan.price === 0 ? (
                      <div>
                        <span className="text-4xl font-black">Gratuit</span>
                      </div>
                    ) : (
                      <div className="flex items-end gap-1">
                        <span className="text-4xl font-black">
                          {annual && plan.annual ? plan.annual : plan.price}€
                        </span>
                        <span className="mb-1.5 text-sm text-muted-foreground">/mois</span>
                      </div>
                    )}
                    {annual && plan.annual && (
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        Facturé annuellement · {plan.annual * 12}€/an
                      </p>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="flex flex-col gap-6">
                  <ul className="space-y-2.5">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-center gap-2.5 text-sm">
                        <Check className="h-4 w-4 shrink-0 text-brand" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    asChild
                    variant={plan.primary ? 'brand' : 'outline'}
                    className="w-full"
                    size="lg"
                  >
                    <Link href="/auth/signin">
                      {plan.cta}
                      <ChevronRight className="ml-1.5 h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

/* ─── TESTIMONIALS ──────────────────────────────────────────────── */

function Testimonials() {
  return (
    <section id="reviews" className="py-24">
      <div className="container max-w-6xl">
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          className="mb-16 text-center"
        >
          <motion.div variants={fadeUp}>
            <Badge variant="brand" className="mb-4">
              Témoignages
            </Badge>
          </motion.div>
          <motion.h2 variants={fadeUp} custom={1} className="text-4xl font-black tracking-tight sm:text-5xl">
            Ils ont transformé
            <br />
            <span className="gradient-brand">leur visibilité</span>
          </motion.h2>
        </motion.div>

        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          {reviews.map((r, i) => (
            <motion.div key={r.name} variants={fadeUp} custom={i}>
              <Card className="h-full border-border/60 transition-all duration-300 hover:border-border hover:shadow-md">
                <CardContent className="p-6">
                  <div className="mb-3 flex gap-0.5">
                    {Array.from({ length: r.rating }).map((_, j) => (
                      <Star key={j} className="h-4 w-4 fill-brand text-brand" />
                    ))}
                  </div>
                  <p className="mb-4 text-sm leading-relaxed text-foreground">"{r.text}"</p>
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand/15 text-sm font-bold text-brand">
                      {r.name[0]}
                    </div>
                    <div>
                      <div className="text-sm font-semibold">{r.name}</div>
                      <div className="text-xs text-muted-foreground">{r.role}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

/* ─── CTA SECTION ───────────────────────────────────────────────── */

function CtaSection() {
  return (
    <section className="py-24">
      <div className="container max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: "easeOut" as const }}
          className="relative overflow-hidden rounded-3xl border border-brand/30 bg-gradient-to-br from-brand/10 via-background to-orange-400/5 p-12 text-center shadow-[0_0_80px_hsl(22_82%_55%/0.1)]"
        >
          <div className="pointer-events-none absolute inset-0 rounded-3xl">
            <div className="absolute left-1/2 top-0 h-[200px] w-[400px] -translate-x-1/2 rounded-full bg-brand/10 blur-[60px]" />
          </div>
          <div className="relative">
            <Badge variant="brand" className="mb-6">
              Prêt à démarrer ?
            </Badge>
            <h2 className="mb-4 text-4xl font-black tracking-tight sm:text-5xl">
              Lancez-vous
              <span className="gradient-brand"> gratuitement</span>
            </h2>
            <p className="mx-auto mb-8 max-w-lg text-muted-foreground">
              Rejoignez des centaines de pros qui ont déjà boosté leur SEO image avec SeoPic. Sans engagement.
            </p>
            <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button asChild size="xl" variant="brand" className="glow-brand w-full sm:w-auto">
                <Link href="/auth/signin">
                  Commencer maintenant
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

/* ─── FOOTER ────────────────────────────────────────────────────── */

function Footer() {
  return (
    <footer className="border-t border-border py-12">
      <div className="container max-w-6xl">
        <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-brand">
              <Sparkles className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="font-bold">
              Seo<span className="text-brand">Pic</span>
            </span>
          </div>
          <p className="text-center text-sm text-muted-foreground">
            © 2024 SeoPic · Produit de{' '}
            <a href="https://valt.agency" className="text-brand hover:underline" target="_blank" rel="noreferrer">
              VALT Agency
            </a>{' '}
            · Tanger, Maroc
          </p>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <a href="#" className="hover:text-foreground">Confidentialité</a>
            <a href="#" className="hover:text-foreground">CGU</a>
            <Link href="/auth/signin" className="hover:text-foreground">Connexion</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}

/* ─── PAGE ──────────────────────────────────────────────────────── */

export default function Home() {
  const [dark, setDark] = useState(true)

  useEffect(() => {
    const saved = localStorage.getItem('theme')
    if (saved) setDark(saved === 'dark')
    else setDark(window.matchMedia('(prefers-color-scheme: dark)').matches)
  }, [])

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
    localStorage.setItem('theme', dark ? 'dark' : 'light')
  }, [dark])

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar dark={dark} onToggle={() => setDark(!dark)} />
      <main>
        <Hero />
        <Separator />
        <Features />
        <Separator />
        <HowItWorks />
        <Separator />
        <Pricing />
        <Separator />
        <Testimonials />
        <CtaSection />
      </main>
      <Footer />
    </div>
  )
}
