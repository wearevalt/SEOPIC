'use client'

import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { useTheme } from 'next-themes'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowRight,
  BarChart3,
  Bot,
  Check,
  ChevronRight,
  ChevronUp,
  Compass,
  FileImage,
  Globe,
  Image as ImageIcon,
  Menu,
  Moon,
  ScanSearch,
  Search,
  Shield,
  Sparkles,
  Sun,
  Upload,
  Wand2,
  X,
  Zap,
  FileText,
  Layers3,
  BrainCircuit,
  Gauge,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, delay: i * 0.08, ease: 'easeOut' as const },
  }),
}

const stagger = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
    },
  },
}

const modules = [
  {
    icon: FileImage,
    title: 'Image Agent',
    desc: 'Analyse, alt text, filename, title, description, compression et metadata depuis un seul flux.',
    bullets: ['Alt text', 'Filename', 'Compression', 'Metadata'],
  },
  {
    icon: ScanSearch,
    title: 'Site Audit Agent',
    desc: 'Scanne vos URLs, détecte les images non optimisées, les pages faibles et les zones prioritaires.',
    bullets: ['Scan URL', 'Pages faibles', 'Images non optimisées', 'Priorités'],
  },
  {
    icon: Search,
    title: 'Keyword Agent',
    desc: 'Trouve les mots-clés liés à vos images et pages, et révèle les meilleures opportunités SEO.',
    bullets: ['Intentions', 'Mots-clés', 'Opportunités', 'Priorisation'],
  },
  {
    icon: FileText,
    title: 'Content Agent',
    desc: 'Suggère des textes SEO pour pages produit, catégories et contenus éditoriaux.',
    bullets: ['Pages produit', 'Catégories', 'Blog', 'Descriptions'],
  },
]

const pillars = [
  {
    icon: Zap,
    title: 'Votre SEO visuel travaille tout seul',
    desc: 'Passez d’un outil manuel à une logique d’automatisation continue.',
  },
  {
    icon: Globe,
    title: 'Images, pages et contenus',
    desc: 'Une seule plateforme pour gérer le SEO visuel et on-site.',
  },
  {
    icon: Gauge,
    title: 'Priorités claires',
    desc: 'SeoPic vous montre quoi corriger, dans quel ordre, et pourquoi.',
  },
]

const flowSteps = [
  {
    icon: Upload,
    title: 'Ajoutez une image ou une URL',
    desc: 'Importez un visuel ou lancez un audit sur une page ou un site.',
    chip: 'Étape 01',
  },
  {
    icon: BrainCircuit,
    title: 'Les agents travaillent',
    desc: 'Image Agent, Audit Agent, Keyword Agent et Content Agent coordonnent l’analyse.',
    chip: 'Étape 02',
  },
  {
    icon: Compass,
    title: 'Passez à l’action',
    desc: 'Appliquez les recommandations, exportez les données et améliorez votre SEO plus vite.',
    chip: 'Étape 03',
  },
]

const pricing = [
  {
    name: 'Découverte',
    price: '0€',
    desc: 'Pour tester la plateforme',
    features: [
      '5 analyses par mois',
      '1 image ou URL à la fois',
      'SEO visuel de base',
      'Export standard',
    ],
    cta: 'Commencer gratuitement',
    variant: 'outline' as const,
    highlight: false,
  },
  {
    name: 'Pro',
    price: '29€',
    desc: 'Pour les e-commerçants, agences et équipes growth',
    features: [
      'Analyses illimitées',
      'Image Agent complet',
      'Site Audit Agent',
      'Keyword Agent',
      'Content Agent',
      'Historique et priorités',
    ],
    cta: 'Passer au Pro',
    variant: 'brand' as const,
    highlight: true,
  },
  {
    name: 'Entreprise',
    price: 'Sur devis',
    desc: 'Pour les équipes, workflows avancés et besoins API',
    features: [
      'Tout le plan Pro',
      'White label',
      'Accès API',
      'Équipe illimitée',
      'Support dédié',
    ],
    cta: 'Nous contacter',
    variant: 'outline' as const,
    highlight: false,
  },
]

const faqs = [
  {
    q: 'SeoPic est-il seulement un outil pour les images ?',
    a: 'Non. SeoPic évolue vers une plateforme qui améliore automatiquement votre SEO visuel et on-site : images, pages, mots-clés et contenus.',
  },
  {
    q: 'Puis-je analyser une page ou un site ?',
    a: 'Oui. Le Site Audit Agent est pensé pour scanner des URLs, détecter les faiblesses et vous aider à prioriser les corrections.',
  },
  {
    q: 'À qui s’adresse SeoPic ?',
    a: 'Aux e-commerçants, agences, créateurs, marques et équipes marketing qui veulent un système SEO plus rapide, plus propre et plus automatisé.',
  },
]

function Navbar() {
  const { data: session } = useSession()
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    setMounted(true)
    const onScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const isDark = theme === 'dark'

  return (
    <motion.header
      initial={{ opacity: 0, y: -24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: 'easeOut' }}
      className="fixed inset-x-0 top-4 z-50"
    >
      <div className="container max-w-6xl">
        <motion.div
          animate={{ scale: scrolled ? 0.985 : 1 }}
          transition={{ duration: 0.25 }}
          className={cn(
            'mx-auto flex h-16 max-w-5xl items-center justify-between rounded-full border px-3 sm:px-4',
            'bg-background/55 supports-[backdrop-filter]:bg-background/45',
            'backdrop-blur-2xl border-white/10',
            'shadow-[0_10px_40px_rgba(0,0,0,0.18)]',
            scrolled && 'shadow-[0_14px_50px_rgba(0,0,0,0.25)]'
          )}
          style={{ WebkitBackdropFilter: 'blur(24px)' }}
        >
          <Link href="/" className="flex items-center gap-2 pl-1">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand shadow-[0_0_30px_hsl(22_82%_55%/0.35)]">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <span className="text-base font-black tracking-tight sm:text-lg">
              Seo<span className="text-brand">Pic</span>
            </span>
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            {[
              { label: 'Modules', href: '#modules' },
              { label: 'Démo', href: '#demo' },
              { label: 'Comment ça marche', href: '#how-it-works' },
              { label: 'Tarifs', href: '#pricing' },
              { label: 'FAQ', href: '#faq' },
            ].map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="rounded-full px-4 py-2 text-sm text-muted-foreground transition-all duration-200 hover:bg-white/10 hover:text-foreground"
              >
                {item.label}
              </a>
            ))}
          </nav>

          <div className="hidden items-center gap-2 md:flex">
            {mounted && (
              <button
                onClick={() => setTheme(isDark ? 'light' : 'dark')}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-muted-foreground transition-all hover:scale-105 hover:bg-white/10 hover:text-foreground"
                aria-label="Changer le thème"
              >
                {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </button>
            )}

            {session ? (
              <>
                <Button asChild variant="brand" className="rounded-full px-5">
                  <Link href="/dashboard">Dashboard</Link>
                </Button>

                <Link
                  href="/dashboard"
                  className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-white/10 bg-white/5 transition hover:scale-105 hover:bg-white/10"
                  aria-label="Mon compte"
                >
                  {session.user?.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={session.user.image}
                      alt="Avatar"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-brand/30 to-orange-400/20 text-sm font-bold text-foreground">
                      {session.user?.name?.[0]?.toUpperCase() || 'U'}
                    </div>
                  )}
                </Link>
              </>
            ) : (
              <>
                <Button asChild variant="ghost" className="rounded-full">
                  <Link href="/auth/signin">Connexion</Link>
                </Button>
                <Button asChild variant="brand" className="rounded-full px-5">
                  <Link href="/auth/signin">
                    Essayer
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </>
            )}
          </div>

          <div className="flex items-center gap-2 md:hidden">
            {mounted && (
              <button
                onClick={() => setTheme(isDark ? 'light' : 'dark')}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-muted-foreground"
                aria-label="Changer le thème"
              >
                {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </button>
            )}

            {session && (
              <Link
                href="/dashboard"
                className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-white/10 bg-white/5"
                aria-label="Mon compte"
              >
                {session.user?.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={session.user.image}
                    alt="Avatar"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-brand/30 to-orange-400/20 text-sm font-bold text-foreground">
                    {session.user?.name?.[0]?.toUpperCase() || 'U'}
                  </div>
                )}
              </Link>
            )}

            {!session && (
              <Button asChild variant="brand" className="rounded-full px-4">
                <Link href="/auth/signin">Essayer gratuitement</Link>
              </Button>
            )}

            <button
              onClick={() => setOpen(!open)}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-muted-foreground"
              aria-label="Ouvrir le menu"
            >
              {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </motion.div>

        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, y: -12, scale: 0.98 }}
              animate={{ opacity: 1, y: 8, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.98 }}
              transition={{ duration: 0.2 }}
              className="mx-auto mt-3 max-w-5xl rounded-3xl border border-white/10 bg-background/70 p-3 shadow-2xl backdrop-blur-2xl md:hidden"
            >
              <div className="flex flex-col gap-1">
                {[
                  { label: 'Modules', href: '#modules' },
                  { label: 'Démo', href: '#demo' },
                  { label: 'Comment ça marche', href: '#how-it-works' },
                  { label: 'Tarifs', href: '#pricing' },
                  { label: 'FAQ', href: '#faq' },
                ].map((item) => (
                  <a
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className="rounded-2xl px-4 py-3 text-sm text-muted-foreground transition hover:bg-white/5 hover:text-foreground"
                  >
                    {item.label}
                  </a>
                ))}

                {session ? (
                  <Button asChild variant="brand" className="mt-2 w-full rounded-2xl">
                    <Link href="/dashboard">Aller au dashboard</Link>
                  </Button>
                ) : (
                  <Button asChild variant="brand" className="mt-2 w-full rounded-2xl">
                    <Link href="/auth/signin">Essayer gratuitement</Link>
                  </Button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.header>
  )
}

function Hero() {
  const { data: session } = useSession()

  return (
    <section className="relative overflow-hidden pt-28">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <motion.div
          animate={{ x: [0, 20, 0], y: [0, -15, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute left-1/2 top-24 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-brand/12 blur-[120px]"
        />
        <motion.div
          animate={{ x: [0, -18, 0], y: [0, 20, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute right-0 top-0 h-[320px] w-[320px] rounded-full bg-orange-400/10 blur-[100px]"
        />
        <motion.div
          animate={{ x: [0, 15, 0], y: [0, 18, 0] }}
          transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute left-0 top-[260px] h-[280px] w-[280px] rounded-full bg-yellow-400/10 blur-[100px]"
        />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              'linear-gradient(hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)',
            backgroundSize: '56px 56px',
          }}
        />
      </div>

      <div className="container relative max-w-6xl py-14 md:py-20">
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="visible"
          className="mx-auto max-w-5xl text-center"
        >
          <motion.div variants={fadeUp} custom={0}>
            <Badge variant="brand" className="mb-6 gap-1.5 px-3 py-1 text-xs">
              <Bot className="h-3 w-3" />
              SEO autonome propulsé par agents
            </Badge>
          </motion.div>

          <motion.h1
            variants={fadeUp}
            custom={1}
            className="text-5xl font-black leading-[0.98] tracking-tight drop-shadow-[0_0_30px_rgba(231,111,46,0.08)] sm:text-6xl md:text-7xl"
          >
            Votre SEO visuel
            <br />
            <span className="gradient-brand">travaille tout seul</span>
          </motion.h1>

          <motion.p
            variants={fadeUp}
            custom={2}
            className="mx-auto mt-6 max-w-3xl text-lg leading-relaxed text-muted-foreground sm:text-xl"
          >
            Automatisez le SEO de vos images, pages et contenus depuis une seule
            plateforme. SeoPic coordonne vos analyses, détecte les faiblesses,
            révèle les opportunités et vous aide à améliorer automatiquement votre
            SEO visuel et on-site.
          </motion.p>

          <motion.div
            variants={fadeUp}
            custom={3}
            className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row"
          >
            <Button asChild variant="brand" size="lg" className="glow-brand min-w-[220px] rounded-full">
              <Link href={session ? '/dashboard' : '/auth/signin'}>
                {session ? 'Aller au dashboard' : 'Essayer gratuitement'}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="min-w-[220px] rounded-full">
              <a href="#demo">Voir la démo</a>
            </Button>
          </motion.div>

          <motion.div
            variants={fadeUp}
            custom={4}
            className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground"
          >
            <span className="flex items-center gap-1.5">
              <Check className="h-4 w-4 text-green-500" />
              Images, pages et contenus
            </span>
            <span className="flex items-center gap-1.5">
              <Shield className="h-4 w-4 text-green-500" />
              4 agents complémentaires
            </span>
            <span className="flex items-center gap-1.5">
              <Zap className="h-4 w-4 text-brand" />
              Priorités et actions claires
            </span>
          </motion.div>
        </motion.div>

        <motion.div
          id="demo"
          initial={{ opacity: 0, y: 28, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.45 }}
          whileHover={{ y: -4 }}
          className="mx-auto mt-16 max-w-6xl"
        >
          <div className="overflow-hidden rounded-[32px] border border-border/60 bg-card/70 shadow-[0_20px_80px_hsl(22_82%_55%/0.10)] backdrop-blur-xl">
            <div className="border-b border-border/60 px-5 py-4">
              <div className="flex items-center gap-2">
                <div className="h-2.5 w-2.5 rounded-full bg-red-400/80" />
                <div className="h-2.5 w-2.5 rounded-full bg-yellow-400/80" />
                <div className="h-2.5 w-2.5 rounded-full bg-green-400/80" />
                <span className="ml-3 text-sm text-muted-foreground">SeoPic OS — aperçu plateforme</span>
              </div>
            </div>

            <div className="grid gap-0 xl:grid-cols-[1.15fr_0.85fr]">
              <div className="border-b border-border/60 p-6 xl:border-b-0 xl:border-r">
                <div className="grid gap-4 md:grid-cols-2">
                  {modules.map((module, i) => (
                    <motion.div
                      key={module.title}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.15 + i * 0.08 }}
                      whileHover={{ y: -4 }}
                      className="rounded-2xl border border-white/10 bg-background/50 p-5"
                    >
                      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-brand/15">
                        <module.icon className="h-5 w-5 text-brand" />
                      </div>
                      <h3 className="text-base font-bold">{module.title}</h3>
                      <p className="mt-2 text-sm leading-6 text-muted-foreground">{module.desc}</p>
                      <div className="mt-4 flex flex-wrap gap-2">
                        {module.bullets.map((item) => (
                          <span
                            key={item}
                            className="rounded-full border border-border bg-secondary px-2.5 py-1 text-[11px] text-muted-foreground"
                          >
                            {item}
                          </span>
                        ))}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              <div className="p-6">
                <div className="space-y-4">
                  <motion.div whileHover={{ scale: 1.01 }} className="rounded-2xl border border-border/60 bg-background/60 p-4">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-sm font-medium">Santé SEO globale</span>
                      <span className="text-sm font-bold text-brand">88 / 100</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-secondary">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: '88%' }}
                        transition={{ duration: 1.2, delay: 0.8 }}
                        className="h-full rounded-full bg-brand"
                      />
                    </div>
                  </motion.div>

                  <motion.div whileHover={{ scale: 1.01 }} className="rounded-2xl border border-border/60 bg-background/60 p-4">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">
                      Priorité actuelle
                    </p>
                    <p className="mt-2 text-sm font-medium">
                      12 images sans alt text et 3 pages faibles à corriger
                    </p>
                  </motion.div>

                  <motion.div whileHover={{ scale: 1.01 }} className="rounded-2xl border border-border/60 bg-background/60 p-4">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">
                      Opportunité mot-clé
                    </p>
                    <p className="mt-2 text-sm font-medium">
                      “climatiseur mural salon moderne” présente un fort potentiel
                    </p>
                  </motion.div>

                  <motion.div whileHover={{ scale: 1.01 }} className="rounded-2xl border border-border/60 bg-background/60 p-4">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">
                      Suggestion content agent
                    </p>
                    <p className="mt-2 text-sm font-medium">
                      Ajouter un texte SEO enrichi sur la catégorie “climatisation murale”
                    </p>
                  </motion.div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

function TrustBar() {
  return (
    <section className="py-6">
      <div className="container max-w-6xl">
        <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm text-muted-foreground">
          <span>E-commerce</span>
          <span className="hidden h-1 w-1 rounded-full bg-border sm:inline-block" />
          <span>Agences</span>
          <span className="hidden h-1 w-1 rounded-full bg-border sm:inline-block" />
          <span>Photographes</span>
          <span className="hidden h-1 w-1 rounded-full bg-border sm:inline-block" />
          <span>Créateurs</span>
          <span className="hidden h-1 w-1 rounded-full bg-border sm:inline-block" />
          <span>Équipes growth</span>
        </div>
      </div>
    </section>
  )
}

function Pillars() {
  return (
    <section className="py-24">
      <div className="container max-w-6xl">
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          className="mx-auto mb-14 max-w-3xl text-center"
        >
          <motion.div variants={fadeUp}>
            <Badge variant="brand" className="mb-4">
              Vision produit
            </Badge>
          </motion.div>
          <motion.h2 variants={fadeUp} custom={1} className="text-4xl font-black tracking-tight sm:text-5xl">
            Plus qu’un outil,
            <span className="gradient-brand"> un système SEO</span>
          </motion.h2>
        </motion.div>

        <div className="grid gap-5 lg:grid-cols-3">
          {pillars.map((item, i) => (
            <motion.div
              key={item.title}
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-80px' }}
              custom={i}
              whileHover={{ y: -6, scale: 1.01 }}
              transition={{ duration: 0.2 }}
            >
              <Card className="h-full overflow-hidden border-border/60 bg-card/60 transition duration-300 hover:border-brand/40 hover:shadow-[0_18px_50px_rgba(0,0,0,0.18)]">
                <CardContent className="p-7">
                  <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-brand/12">
                    <item.icon className="h-5 w-5 text-brand" />
                  </div>
                  <h3 className="text-xl font-bold tracking-tight">{item.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-muted-foreground">{item.desc}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

function Modules() {
  return (
    <section id="modules" className="py-24">
      <div className="container max-w-6xl">
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          className="mx-auto mb-14 max-w-3xl text-center"
        >
          <motion.div variants={fadeUp}>
            <Badge variant="brand" className="mb-4">
              Les 4 modules
            </Badge>
          </motion.div>
          <motion.h2 variants={fadeUp} custom={1} className="text-4xl font-black tracking-tight sm:text-5xl">
            Les agents qui composent
            <br />
            <span className="gradient-brand">le futur de SeoPic</span>
          </motion.h2>
          <motion.p variants={fadeUp} custom={2} className="mx-auto mt-4 max-w-2xl text-muted-foreground">
            Chaque agent couvre un angle précis du SEO, ensemble ils créent une plateforme beaucoup plus forte.
          </motion.p>
        </motion.div>

        <div className="grid gap-5 lg:grid-cols-2">
          {modules.map((item, i) => (
            <motion.div
              key={item.title}
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-80px' }}
              custom={i}
              whileHover={{ y: -6 }}
              transition={{ duration: 0.2 }}
            >
              <Card className="h-full rounded-[28px] border border-white/10 bg-card/60 shadow-[0_20px_50px_rgba(0,0,0,0.12)] backdrop-blur-xl">
                <CardContent className="p-7">
                  <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-[20px] bg-brand/12">
                    <item.icon className="h-6 w-6 text-brand" />
                  </div>
                  <h3 className="text-2xl font-bold tracking-tight">{item.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-muted-foreground">{item.desc}</p>
                  <div className="mt-5 flex flex-wrap gap-2">
                    {item.bullets.map((b) => (
                      <span
                        key={b}
                        className="rounded-full border border-border bg-secondary px-3 py-1 text-xs text-muted-foreground"
                      >
                        {b}
                      </span>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24">
      <div className="container max-w-6xl">
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          className="mx-auto mb-14 max-w-3xl text-center"
        >
          <motion.div variants={fadeUp}>
            <Badge variant="brand" className="mb-4">
              Comment ça marche
            </Badge>
          </motion.div>
          <motion.h2
            variants={fadeUp}
            custom={1}
            className="text-4xl font-black tracking-tight sm:text-5xl"
          >
            Une machine SEO,
            <span className="gradient-brand"> en 3 étapes</span>
          </motion.h2>
          <motion.p
            variants={fadeUp}
            custom={2}
            className="mx-auto mt-4 max-w-2xl text-muted-foreground"
          >
            Une entrée simple, plusieurs agents qui travaillent, puis des actions claires à appliquer.
          </motion.p>
        </motion.div>

        <div className="relative">
          <div className="pointer-events-none absolute left-1/2 top-24 hidden h-[2px] w-[72%] -translate-x-1/2 bg-gradient-to-r from-transparent via-brand/40 to-transparent lg:block" />

          <div className="grid gap-6 lg:grid-cols-3">
            {flowSteps.map((step, i) => (
              <motion.div
                key={step.title}
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-80px' }}
                custom={i}
                whileHover={{ y: -8, scale: 1.015 }}
                transition={{ duration: 0.25 }}
                className="relative"
              >
                <Card className="relative h-full overflow-hidden rounded-[28px] border border-white/10 bg-card/60 shadow-[0_20px_50px_rgba(0,0,0,0.14)] backdrop-blur-xl">
                  <div className="absolute inset-0 bg-gradient-to-br from-white/[0.06] via-transparent to-brand/[0.03]" />

                  <CardContent className="relative p-7">
                    <div className="mb-5 flex items-center justify-between">
                      <Badge variant="outline" className="rounded-full px-3 py-1 text-[11px]">
                        {step.chip}
                      </Badge>
                      <div className="text-sm font-semibold text-muted-foreground">
                        0{i + 1}
                      </div>
                    </div>

                    <motion.div
                      animate={{ y: [0, -6, 0] }}
                      transition={{
                        duration: 3.5 + i,
                        repeat: Infinity,
                        ease: 'easeInOut',
                      }}
                      className="mb-6 flex h-20 w-20 items-center justify-center rounded-[24px] border border-white/10 bg-gradient-to-br from-brand/20 via-brand/10 to-transparent shadow-[0_0_30px_hsl(22_82%_55%/0.15)]"
                    >
                      <step.icon className="h-9 w-9 text-brand" />
                    </motion.div>

                    <h3 className="text-xl font-bold tracking-tight">{step.title}</h3>
                    <p className="mt-3 text-sm leading-7 text-muted-foreground">{step.desc}</p>

                    <div className="mt-8 rounded-2xl border border-white/10 bg-background/40 p-4 backdrop-blur-md">
                      {i === 0 && (
                        <div className="space-y-3">
                          <div className="flex items-center gap-3 rounded-xl border border-dashed border-border/80 px-4 py-3">
                            <Upload className="h-5 w-5 text-brand" />
                            <span className="text-sm text-muted-foreground">Image ou URL</span>
                          </div>
                          <div className="h-2 rounded-full bg-secondary">
                            <motion.div
                              initial={{ width: 0 }}
                              whileInView={{ width: '70%' }}
                              viewport={{ once: true }}
                              transition={{ duration: 1 }}
                              className="h-full rounded-full bg-brand"
                            />
                          </div>
                        </div>
                      )}

                      {i === 1 && (
                        <div className="space-y-3">
                          <div className="grid grid-cols-2 gap-2">
                            {['Image', 'Audit', 'Keyword', 'Content'].map((item) => (
                              <div
                                key={item}
                                className="rounded-xl border border-white/10 bg-background/60 px-3 py-2 text-center text-xs text-muted-foreground"
                              >
                                {item}
                              </div>
                            ))}
                          </div>
                          <div className="h-2 rounded-full bg-secondary">
                            <motion.div
                              initial={{ width: 0 }}
                              whileInView={{ width: '86%' }}
                              viewport={{ once: true }}
                              transition={{ duration: 1.2 }}
                              className="h-full rounded-full bg-brand"
                            />
                          </div>
                        </div>
                      )}

                      {i === 2 && (
                        <div className="space-y-3">
                          <div className="flex items-center justify-between rounded-xl border border-white/10 bg-background/60 px-4 py-3">
                            <span className="text-sm text-muted-foreground">Actions prêtes</span>
                            <ArrowRight className="h-4 w-4 text-brand" />
                          </div>
                          <Button variant="outline" className="w-full rounded-xl">
                            Voir les priorités
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {i < flowSteps.length - 1 && (
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.25 + i * 0.15 }}
                    className="absolute -right-4 top-1/2 z-10 hidden -translate-y-1/2 lg:flex"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-background/70 shadow-lg backdrop-blur-xl">
                      <ArrowRight className="h-4 w-4 text-brand" />
                    </div>
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

function Pricing() {
  const { data: session } = useSession()

  return (
    <section id="pricing" className="py-24">
      <div className="container max-w-6xl">
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          className="mx-auto mb-14 max-w-3xl text-center"
        >
          <motion.div variants={fadeUp}>
            <Badge variant="brand" className="mb-4">
              Tarifs
            </Badge>
          </motion.div>
          <motion.h2 variants={fadeUp} custom={1} className="text-4xl font-black tracking-tight sm:text-5xl">
            Une base simple,
            <span className="gradient-brand"> un potentiel énorme</span>
          </motion.h2>
          <motion.p variants={fadeUp} custom={2} className="mx-auto mt-4 max-w-2xl text-muted-foreground">
            Commencez gratuitement, puis activez la vraie puissance de la plateforme avec le plan Pro.
          </motion.p>
        </motion.div>

        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          className="grid gap-6 md:grid-cols-3"
        >
          {pricing.map((plan, i) => (
            <motion.div key={plan.name} variants={fadeUp} custom={i} whileHover={{ y: -6 }} transition={{ duration: 0.2 }}>
              <Card
                className={cn(
                  'relative h-full border-border/60 bg-card/60 transition duration-300 hover:shadow-xl',
                  plan.highlight && 'border-brand/50 shadow-[0_0_50px_hsl(22_82%_55%/0.12)]'
                )}
              >
                {plan.highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge variant="brand">Le plus choisi</Badge>
                  </div>
                )}
                <CardContent className="flex h-full flex-col p-7">
                  <div>
                    <h3 className="text-lg font-bold">{plan.name}</h3>
                    <div className="mt-3 text-4xl font-black tracking-tight">{plan.price}</div>
                    <p className="mt-2 text-sm text-muted-foreground">{plan.desc}</p>
                  </div>

                  <ul className="mt-6 space-y-3">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2.5 text-sm">
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-8">
                    <Button asChild variant={plan.variant} className="w-full rounded-full">
                      <Link href={session ? '/dashboard' : '/auth/signin'}>
                        {plan.cta}
                        <ChevronRight className="ml-1.5 h-4 w-4" />
                      </Link>
                    </Button>
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

function FAQ() {
  const [open, setOpen] = useState<number | null>(0)

  return (
    <section id="faq" className="py-24">
      <div className="container max-w-4xl">
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          className="mb-14 text-center"
        >
          <motion.div variants={fadeUp}>
            <Badge variant="brand" className="mb-4">
              FAQ
            </Badge>
          </motion.div>
          <motion.h2 variants={fadeUp} custom={1} className="text-4xl font-black tracking-tight sm:text-5xl">
            Questions fréquentes
          </motion.h2>
        </motion.div>

        <div className="space-y-4">
          {faqs.map((item, index) => {
            const active = open === index

            return (
              <motion.div
                key={item.q}
                layout
                className="overflow-hidden rounded-2xl border border-border/60 bg-card/60"
              >
                <button
                  onClick={() => setOpen(active ? null : index)}
                  className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
                >
                  <span className="text-sm font-semibold sm:text-base">{item.q}</span>
                  <ChevronRight
                    className={cn(
                      'h-4 w-4 shrink-0 transition-transform',
                      active && 'rotate-90'
                    )}
                  />
                </button>
                <AnimatePresence initial={false}>
                  {active && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.22 }}
                      className="overflow-hidden"
                    >
                      <div className="px-6 pb-5 text-sm leading-7 text-muted-foreground">
                        {item.a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

function FinalCTA() {
  const { data: session } = useSession()

  return (
    <section className="pb-24 pt-8">
      <div className="container max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 26 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55 }}
          className="relative overflow-hidden rounded-[32px] border border-brand/25 bg-gradient-to-br from-brand/12 via-background to-orange-400/5 px-6 py-14 text-center shadow-[0_0_80px_hsl(22_82%_55%/0.10)] sm:px-10"
        >
          <div className="pointer-events-none absolute inset-0">
            <motion.div
              animate={{ x: [0, 20, 0], y: [0, -12, 0] }}
              transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute left-1/2 top-0 h-[220px] w-[420px] -translate-x-1/2 rounded-full bg-brand/10 blur-[70px]"
            />
          </div>

          <div className="relative">
            <Badge variant="brand" className="mb-5">
              Prêt à changer d’échelle ?
            </Badge>
            <h2 className="text-4xl font-black tracking-tight sm:text-5xl">
              Automatisez le SEO
              <br />
              <span className="gradient-brand">de vos images, pages et contenus</span>
            </h2>
            <p className="mx-auto mt-5 max-w-2xl text-muted-foreground">
              Faites évoluer Seopic vers une vraie machine SEO visuelle et on-site,
              pensée pour gagner du temps et créer de meilleurs résultats.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button asChild variant="brand" size="lg" className="glow-brand min-w-[220px] rounded-full">
                <Link href={session ? '/dashboard' : '/auth/signin'}>
                  {session ? 'Ouvrir le dashboard' : 'Essayer gratuitement'}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="min-w-[220px] rounded-full">
                <a href="#modules">Voir les modules</a>
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

function Footer() {
  return (
    <footer className="border-t border-border/70 py-10">
      <div className="container max-w-6xl">
        <div className="flex flex-col items-center justify-between gap-5 sm:flex-row">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <span className="font-black tracking-tight">
              Seo<span className="text-brand">Pic</span>
            </span>
          </div>

          <p className="text-center text-sm text-muted-foreground">
            © 2026 SeoPic · Produit de VALT Agency · Tanger, Maroc
          </p>

          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <Link href="/privacy" className="hover:text-foreground">
              Confidentialité
            </Link>
            <Link href="/terms" className="hover:text-foreground">
              Conditions
            </Link>
            <Link href="/auth/signin" className="hover:text-foreground">
              Connexion
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}

function BackToTop() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 500)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          initial={{ opacity: 0, y: 20, scale: 0.92 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.92 }}
          transition={{ duration: 0.2 }}
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-6 right-6 z-50 flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-background/70 text-foreground shadow-[0_10px_30px_rgba(0,0,0,0.28)] backdrop-blur-xl transition hover:scale-105 hover:bg-background/90"
          aria-label="Revenir en haut"
        >
          <ChevronUp className="h-5 w-5" />
        </motion.button>
      )}
    </AnimatePresence>
  )
}

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <main>
        <Hero />
        <TrustBar />
        <Separator />
        <Pillars />
        <Separator />
        <Modules />
        <Separator />
        <HowItWorks />
        <Separator />
        <Pricing />
        <Separator />
        <FAQ />
        <FinalCTA />
      </main>
      <Footer />
      <BackToTop />
    </div>
  )
}
