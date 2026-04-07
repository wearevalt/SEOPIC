'use client'

import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useEffect, useMemo, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowRight,
  BarChart3,
  Bot,
  BrainCircuit,
  ChevronDown,
  ChevronRight,
  FileImage,
  FileText,
  Globe,
  History,
  Home,
  Image as ImageIcon,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquare,
  Search,
  Settings,
  Shield,
  Sparkles,
  Ticket,
  Upload,
  Wand2,
  X,
  ScanSearch,
  BadgeCheck,
  RefreshCcw,
  UserCircle2,
  Crown,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

const ADMIN_EMAILS = (process.env.NEXT_PUBLIC_ADMIN_EMAILS || '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean)

type Section =
  | 'overview'
  | 'image-agent'
  | 'site-audit-agent'
  | 'keyword-agent'
  | 'content-agent'
  | 'history'
  | 'tickets'
  | 'settings'

interface SeoResult {
  detectedContent: string
  suggestedAltText: string
  metaTitle: string
  metaDescription: string
  keywords: string[]
  seoScore: number
  improvements: string[]
  imageCategory: string
  tone: string
}

interface AnalysisHistory {
  id: string
  image_name: string | null
  image_size: number | null
  seo_score: number
  alt_text: string
  meta_title: string
  keywords: string[]
  image_category: string
  created_at: string
}

interface TicketItem {
  id: string
  title: string
  description: string
  status: 'Ouvert' | 'En Cours' | 'Fermé'
  priority: 'Haute' | 'Moyenne' | 'Basse'
  created_at: string
  replies?: { id: string }[]
}

interface SiteAuditResult {
  url: string
  score: number
  issues: string[]
  strengths: string[]
  weakPages: string[]
  missingImageSeo: number
  keywordIdeas: string[]
  contentIdeas: string[]
}

const navItems: {
  id: Section
  label: string
  icon: React.ComponentType<{ className?: string }>
  group: 'workspace' | 'support'
}[] = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard, group: 'workspace' },
  { id: 'image-agent', label: 'Image Agent', icon: FileImage, group: 'workspace' },
  { id: 'site-audit-agent', label: 'Site Audit Agent', icon: ScanSearch, group: 'workspace' },
  { id: 'keyword-agent', label: 'Keyword Agent', icon: Search, group: 'workspace' },
  { id: 'content-agent', label: 'Content Agent', icon: FileText, group: 'workspace' },
  { id: 'history', label: 'Historique', icon: History, group: 'support' },
  { id: 'tickets', label: 'Tickets', icon: Ticket, group: 'support' },
  { id: 'settings', label: 'Paramètres', icon: Settings, group: 'support' },
]

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.42, delay: i * 0.05, ease: 'easeOut' as const },
  }),
}

function getInitials(name?: string | null) {
  if (!name) return 'U'
  return name
    .split(' ')
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

function formatBytes(bytes?: number | null) {
  if (!bytes) return '—'
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function scoreTone(score: number) {
  if (score >= 80) return { label: 'Excellent', cls: 'text-emerald-400', bar: 'bg-emerald-400' }
  if (score >= 60) return { label: 'Correct', cls: 'text-yellow-400', bar: 'bg-yellow-400' }
  return { label: 'À améliorer', cls: 'text-red-400', bar: 'bg-red-400' }
}

function buildDemoAudit(url: string): SiteAuditResult {
  const host = (() => {
    try {
      return new URL(url).hostname.replace('www.', '')
    } catch {
      return url
    }
  })()

  return {
    url,
    score: 71,
    issues: [
      'Plusieurs images semblent sans alt text explicite.',
      'Certaines pages catégories manquent de texte SEO.',
      'Les filenames d’images ne sont pas assez descriptifs.',
      'Plusieurs opportunités de mots-clés longue traîne sont absentes.',
    ],
    strengths: [
      'Structure de site exploitable pour un audit SEO.',
      'Potentiel visuel élevé sur les pages produit.',
      'Base exploitable pour enrichir les contenus catégories.',
    ],
    weakPages: [
      `https://${host}/collections`,
      `https://${host}/products/example-product`,
      `https://${host}/blog`,
    ],
    missingImageSeo: 12,
    keywordIdeas: [
      'seo image produit',
      'optimisation visuelle ecommerce',
      'alt text produit',
      'seo categorie ecommerce',
      'keyword image google',
    ],
    contentIdeas: [
      'Ajouter un texte SEO en haut des catégories principales.',
      'Enrichir les descriptions produit avec un angle intention de recherche.',
      'Créer un mini guide blog lié aux familles de produits les plus visuelles.',
    ],
  }
}

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [section, setSection] = useState<Section>('overview')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imageLoading, setImageLoading] = useState(false)
  const [imageError, setImageError] = useState<string | null>(null)
  const [imageResult, setImageResult] = useState<SeoResult | null>(null)

  const [siteUrl, setSiteUrl] = useState('')
  const [siteAuditLoading, setSiteAuditLoading] = useState(false)
  const [siteAuditResult, setSiteAuditResult] = useState<SiteAuditResult | null>(null)

  const [history, setHistory] = useState<AnalysisHistory[]>([])
  const [historyLoading, setHistoryLoading] = useState(false)

  const [tickets, setTickets] = useState<TicketItem[]>([])
  const [ticketsLoading, setTicketsLoading] = useState(false)
  const [showTicketForm, setShowTicketForm] = useState(false)
  const [ticketForm, setTicketForm] = useState({
    title: '',
    description: '',
    priority: 'Moyenne',
  })
  const [ticketSubmitting, setTicketSubmitting] = useState(false)
  const [ticketError, setTicketError] = useState<string | null>(null)

  const [keywordQuery, setKeywordQuery] = useState('')
  const [manualKeywords, setManualKeywords] = useState<string[]>([])

  const [contentTopic, setContentTopic] = useState('')
  const [contentType, setContentType] = useState<'product' | 'category' | 'blog'>('product')

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/auth/signin')
  }, [status, router])

  const isAdmin = ADMIN_EMAILS.includes(session?.user?.email || '')

  const fetchHistory = async () => {
    try {
      setHistoryLoading(true)
      const res = await fetch('/api/analyses')
      if (!res.ok) return
      const data = await res.json()
      setHistory(Array.isArray(data) ? data : [])
    } finally {
      setHistoryLoading(false)
    }
  }

  const fetchTickets = async () => {
    if (!session?.user?.email) return
    try {
      setTicketsLoading(true)
      const res = await fetch(`/api/tickets?email=${encodeURIComponent(session.user.email)}`)
      if (!res.ok) return
      const data = await res.json()
      setTickets(Array.isArray(data) ? data : [])
    } finally {
      setTicketsLoading(false)
    }
  }

  useEffect(() => {
    if (status === 'authenticated') {
      fetchHistory()
      fetchTickets()
    }
  }, [status])

  const openTicketsCount = useMemo(
    () => tickets.filter((t) => t.status !== 'Fermé').length,
    [tickets]
  )

  const latestScore = history[0]?.seo_score ?? imageResult?.seoScore ?? 0

  const overviewActions = useMemo(() => {
    const actions: string[] = []
    if (imageResult?.improvements?.length) actions.push(imageResult.improvements[0])
    if (siteAuditResult?.issues?.length) actions.push(siteAuditResult.issues[0])
    if (history.length === 0) actions.push('Lancez votre première analyse Image Agent.')
    if (!siteAuditResult) actions.push('Scannez une URL avec le Site Audit Agent.')
    return actions.slice(0, 4)
  }, [imageResult, siteAuditResult, history])

  const keywordIdeas = useMemo(() => {
    const merged = [
      ...(imageResult?.keywords || []),
      ...(siteAuditResult?.keywordIdeas || []),
      ...manualKeywords,
    ]
    return Array.from(new Set(merged.filter(Boolean)))
  }, [imageResult, siteAuditResult, manualKeywords])

  const generatedContentIdeas = useMemo(() => {
    const baseKeyword = contentTopic || keywordIdeas[0] || 'seo visuel'
    return [
      {
        title:
          contentType === 'product'
            ? `Description produit SEO pour "${baseKeyword}"`
            : contentType === 'category'
            ? `Texte catégorie optimisé pour "${baseKeyword}"`
            : `Article blog autour de "${baseKeyword}"`,
        text:
          contentType === 'product'
            ? `Mettez en avant les bénéfices, l’usage, le contexte visuel et les expressions liées à ${baseKeyword}. Ajoutez un angle intention d’achat et un vocabulaire descriptif cohérent avec vos images.`
            : contentType === 'category'
            ? `Créez une introduction claire, contextualisez la catégorie autour de ${baseKeyword}, ajoutez des variations sémantiques et reliez les familles de produits avec un vocabulaire riche et naturel.`
            : `Construisez un contenu éditorial qui explique ${baseKeyword}, répond aux questions fréquentes, exploite les opportunités de longue traîne et relie le contenu aux pages business du site.`,
      },
      {
        title: 'Angle SEO recommandé',
        text:
          'Travaillez le couple image + texte + intention. SeoPic doit toujours pousser une logique de cohérence entre visuel, structure de page, mots-clés et contenu éditorial.',
      },
    ]
  }, [contentType, contentTopic, keywordIdeas])

  const handleImageFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setImageError('Utilise un fichier image valide.')
      return
    }

    setImageError(null)
    setImageResult(null)
    setImageFile(file)

    const reader = new FileReader()
    reader.onload = (e) => setImagePreview(e.target?.result as string)
    reader.readAsDataURL(file)
  }

  const analyzeImage = async () => {
    if (!imageFile || !imagePreview) return

    try {
      setImageLoading(true)
      setImageError(null)

      const base64 = imagePreview.split(',')[1]

      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: base64,
          mimeType: imageFile.type,
          imageName: imageFile.name,
          imageSize: imageFile.size,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setImageError(data?.error || 'Analyse impossible.')
        return
      }

      setImageResult(data)
      setSection('image-agent')
      fetchHistory()
    } catch {
      setImageError('Analyse impossible. Vérifie ta connexion.')
    } finally {
      setImageLoading(false)
    }
  }

  const runSiteAudit = async () => {
    if (!siteUrl.trim()) return
    try {
      setSiteAuditLoading(true)
      setSiteAuditResult(null)

      let result: SiteAuditResult | null = null

      try {
        const res = await fetch('/api/site-audit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: siteUrl.trim() }),
        })

        if (res.ok) {
          const data = await res.json()
          if (data?.url && data?.issues) {
            result = data as SiteAuditResult
          }
        }
      } catch {
        // fallback below
      }

      if (!result) {
        result = buildDemoAudit(siteUrl.trim())
      }

      setSiteAuditResult(result)
      setSection('site-audit-agent')
    } finally {
      setSiteAuditLoading(false)
    }
  }

  const submitTicket = async () => {
    if (!ticketForm.title.trim() || !ticketForm.description.trim() || !session?.user?.email) {
      return
    }

    try {
      setTicketSubmitting(true)
      setTicketError(null)

      const res = await fetch('/api/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: ticketForm.title.trim(),
          description: ticketForm.description.trim(),
          priority: ticketForm.priority,
          client_name: session.user.name || 'Client',
          client_email: session.user.email,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setTicketError(data?.error || 'Erreur lors de la création du ticket.')
        return
      }

      setTicketForm({ title: '', description: '', priority: 'Moyenne' })
      setShowTicketForm(false)
      fetchTickets()
    } catch {
      setTicketError('Connexion impossible.')
    } finally {
      setTicketSubmitting(false)
    }
  }

  const addManualKeyword = () => {
    const value = keywordQuery.trim()
    if (!value) return
    setManualKeywords((prev) => Array.from(new Set([...prev, value])))
    setKeywordQuery('')
  }

  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-foreground">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-2xl border-2 border-brand border-t-transparent" />
          <p className="text-sm text-muted-foreground">Chargement du dashboard…</p>
        </div>
      </div>
    )
  }

  if (status === 'unauthenticated') return null

  const desktopSidebar = (
    <aside
      className={cn(
        'hidden border-r border-white/10 bg-background/40 backdrop-blur-2xl lg:flex lg:h-screen lg:flex-col lg:sticky lg:top-0',
        sidebarCollapsed ? 'lg:w-[88px]' : 'lg:w-[280px]'
      )}
    >
      <div className="flex h-20 items-center justify-between border-b border-white/10 px-4">
        {!sidebarCollapsed && (
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-brand shadow-[0_0_30px_hsl(22_82%_55%/0.35)]">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <div>
              <p className="text-lg font-black tracking-tight">
                Seo<span className="text-brand">Pic</span>
              </p>
              <p className="text-[11px] text-muted-foreground">SEO Operating System</p>
            </div>
          </Link>
        )}

        <button
          onClick={() => setSidebarCollapsed((v) => !v)}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-muted-foreground transition hover:bg-white/10 hover:text-foreground"
        >
          {sidebarCollapsed ? <ChevronRight className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <div className="mb-5 rounded-2xl border border-brand/20 bg-brand/10 p-4">
          {!sidebarCollapsed ? (
            <>
              <div className="mb-2 flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-brand">
                  Plan actuel
                </span>
                <Badge variant="outline" className="border-brand/20 text-brand">
                  Découverte
                </Badge>
              </div>
              <p className="text-sm font-semibold">Passe au niveau OS complet</p>
              <p className="mt-1 text-xs leading-5 text-muted-foreground">
                Active les agents, l’historique avancé et le pilotage global du SEO.
              </p>
            </>
          ) : (
            <div className="flex justify-center">
              <Crown className="h-5 w-5 text-brand" />
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div>
            {!sidebarCollapsed && (
              <p className="mb-2 px-2 text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                Workspace
              </p>
            )}
            <div className="space-y-1">
              {navItems
                .filter((item) => item.group === 'workspace')
                .map((item) => {
                  const Icon = item.icon
                  const active = section === item.id
                  return (
                    <button
                      key={item.id}
                      onClick={() => setSection(item.id)}
                      className={cn(
                        'flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left transition',
                        active
                          ? 'bg-brand/12 text-brand border border-brand/20'
                          : 'text-muted-foreground hover:bg-white/5 hover:text-foreground'
                      )}
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      {!sidebarCollapsed && <span className="text-sm font-medium">{item.label}</span>}
                    </button>
                  )
                })}
            </div>
          </div>

          <div>
            {!sidebarCollapsed && (
              <p className="mb-2 px-2 text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                Support
              </p>
            )}
            <div className="space-y-1">
              {navItems
                .filter((item) => item.group === 'support')
                .map((item) => {
                  const Icon = item.icon
                  const active = section === item.id
                  return (
                    <button
                      key={item.id}
                      onClick={() => setSection(item.id)}
                      className={cn(
                        'flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left transition',
                        active
                          ? 'bg-brand/12 text-brand border border-brand/20'
                          : 'text-muted-foreground hover:bg-white/5 hover:text-foreground'
                      )}
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      {!sidebarCollapsed && (
                        <div className="flex w-full items-center justify-between">
                          <span className="text-sm font-medium">{item.label}</span>
                          {item.id === 'tickets' && openTicketsCount > 0 && (
                            <span className="rounded-full bg-brand px-2 py-0.5 text-[10px] font-bold text-white">
                              {openTicketsCount}
                            </span>
                          )}
                        </div>
                      )}
                    </button>
                  )
                })}
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10 p-4">
        <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-3">
          {session?.user?.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={session.user.image}
              alt="Avatar"
              className="h-10 w-10 rounded-full object-cover ring-2 ring-brand/40"
            />
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-brand/40 to-orange-400/20 font-bold text-white">
              {getInitials(session?.user?.name)}
            </div>
          )}

          {!sidebarCollapsed && (
            <>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">{session?.user?.name}</p>
                <p className="truncate text-xs text-muted-foreground">{session?.user?.email}</p>
              </div>

              <button
                onClick={() => signOut({ callbackUrl: '/auth/signin' })}
                className="flex h-9 w-9 items-center justify-center rounded-xl text-muted-foreground transition hover:bg-white/10 hover:text-foreground"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </>
          )}
        </div>
      </div>
    </aside>
  )

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-0 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-brand/10 blur-[120px]" />
        <div className="absolute right-0 top-24 h-[260px] w-[260px] rounded-full bg-orange-400/10 blur-[110px]" />
      </div>

      <div className="relative flex min-h-screen">
        {desktopSidebar}

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-40 border-b border-white/10 bg-background/55 backdrop-blur-2xl">
            <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setMobileMenuOpen(true)}
                  className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-muted-foreground lg:hidden"
                >
                  <Menu className="h-5 w-5" />
                </button>

                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-xl font-black tracking-tight sm:text-2xl">
                      {section === 'overview' && 'Seopic OS'}
                      {section === 'image-agent' && 'Image Agent'}
                      {section === 'site-audit-agent' && 'Site Audit Agent'}
                      {section === 'keyword-agent' && 'Keyword Agent'}
                      {section === 'content-agent' && 'Content Agent'}
                      {section === 'history' && 'Historique'}
                      {section === 'tickets' && 'Tickets'}
                      {section === 'settings' && 'Paramètres'}
                    </h1>
                    {isAdmin && (
                      <Badge variant="outline" className="border-brand/20 text-brand">
                        Admin
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Dashboard harmonisé avec la landing et centré sur les 4 modules.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {isAdmin && (
                  <Button asChild variant="outline" className="rounded-full">
                    <Link href="/admin">
                      <Shield className="mr-2 h-4 w-4" />
                      Dashboard admin
                    </Link>
                  </Button>
                )}

                <Button
                  variant="outline"
                  className="rounded-full"
                  onClick={() => {
                    fetchHistory()
                    fetchTickets()
                  }}
                >
                  <RefreshCcw className="mr-2 h-4 w-4" />
                  Actualiser
                </Button>
              </div>
            </div>
          </header>

          <AnimatePresence>
            {mobileMenuOpen && (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-50 bg-black/50 lg:hidden"
                  onClick={() => setMobileMenuOpen(false)}
                />
                <motion.aside
                  initial={{ x: -320 }}
                  animate={{ x: 0 }}
                  exit={{ x: -320 }}
                  transition={{ duration: 0.25 }}
                  className="fixed left-0 top-0 z-50 h-screen w-[290px] border-r border-white/10 bg-background/90 p-4 backdrop-blur-2xl lg:hidden"
                >
                  <div className="mb-5 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-brand">
                        <Sparkles className="h-4 w-4 text-white" />
                      </div>
                      <div>
                        <p className="text-lg font-black tracking-tight">
                          Seo<span className="text-brand">Pic</span>
                        </p>
                        <p className="text-[11px] text-muted-foreground">SEO OS</p>
                      </div>
                    </Link>

                    <button
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="space-y-1">
                    {navItems.map((item) => {
                      const Icon = item.icon
                      const active = section === item.id
                      return (
                        <button
                          key={item.id}
                          onClick={() => {
                            setSection(item.id)
                            setMobileMenuOpen(false)
                          }}
                          className={cn(
                            'flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left transition',
                            active
                              ? 'bg-brand/12 text-brand border border-brand/20'
                              : 'text-muted-foreground hover:bg-white/5 hover:text-foreground'
                          )}
                        >
                          <Icon className="h-4 w-4" />
                          <span className="text-sm font-medium">{item.label}</span>
                        </button>
                      )
                    })}
                  </div>

                  <div className="mt-5 border-t border-white/10 pt-5">
                    {isAdmin && (
                      <Button asChild variant="outline" className="mb-2 w-full rounded-2xl">
                        <Link href="/admin">Aller à l’admin</Link>
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      className="w-full rounded-2xl"
                      onClick={() => signOut({ callbackUrl: '/auth/signin' })}
                    >
                      Se déconnecter
                    </Button>
                  </div>
                </motion.aside>
              </>
            )}
          </AnimatePresence>

          <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
            {section === 'overview' && (
              <motion.div
                initial="hidden"
                animate="visible"
                variants={fadeUp}
                className="space-y-6"
              >
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                  {[
                    {
                      label: 'Modules actifs',
                      value: '4',
                      sub: 'Image, Audit, Keyword, Content',
                      icon: Bot,
                    },
                    {
                      label: 'Dernier score SEO',
                      value: latestScore ? String(latestScore) : '—',
                      sub: latestScore ? scoreTone(latestScore).label : 'Pas encore de score',
                      icon: BarChart3,
                    },
                    {
                      label: 'Analyses enregistrées',
                      value: String(history.length),
                      sub: 'Historique disponible',
                      icon: History,
                    },
                    {
                      label: 'Tickets ouverts',
                      value: String(openTicketsCount),
                      sub: 'Support et suivi client',
                      icon: Ticket,
                    },
                  ].map((item, i) => {
                    const Icon = item.icon
                    return (
                      <motion.div key={item.label} custom={i} variants={fadeUp}>
                        <Card className="rounded-[28px] border-white/10 bg-card/60 backdrop-blur-xl">
                          <CardContent className="p-6">
                            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-brand/12">
                              <Icon className="h-5 w-5 text-brand" />
                            </div>
                            <p className="text-sm text-muted-foreground">{item.label}</p>
                            <p className="mt-2 text-4xl font-black tracking-tight">{item.value}</p>
                            <p className="mt-2 text-sm text-muted-foreground">{item.sub}</p>
                          </CardContent>
                        </Card>
                      </motion.div>
                    )
                  })}
                </div>

                <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
                  <Card className="rounded-[32px] border-white/10 bg-card/60 backdrop-blur-xl">
                    <CardHeader>
                      <CardTitle>Vue plateforme</CardTitle>
                      <CardDescription>
                        Ton dashboard doit raconter Seopic comme un SEO Operating System.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-4 md:grid-cols-2">
                      {[
                        {
                          title: 'Image Agent',
                          desc: 'Analyse des images, alt text, meta et score SEO.',
                          icon: FileImage,
                          go: 'image-agent' as Section,
                        },
                        {
                          title: 'Site Audit Agent',
                          desc: 'Scan URL, pages faibles, visuels non optimisés.',
                          icon: ScanSearch,
                          go: 'site-audit-agent' as Section,
                        },
                        {
                          title: 'Keyword Agent',
                          desc: 'Opportunités mots-clés liées aux pages et visuels.',
                          icon: Search,
                          go: 'keyword-agent' as Section,
                        },
                        {
                          title: 'Content Agent',
                          desc: 'Suggestions de texte pour produits, catégories et blog.',
                          icon: FileText,
                          go: 'content-agent' as Section,
                        },
                      ].map((item, i) => {
                        const Icon = item.icon
                        return (
                          <motion.button
                            key={item.title}
                            custom={i}
                            variants={fadeUp}
                            onClick={() => setSection(item.go)}
                            className="group rounded-[24px] border border-white/10 bg-background/45 p-5 text-left transition hover:-translate-y-1 hover:border-brand/25 hover:shadow-[0_18px_40px_rgba(0,0,0,0.18)]"
                          >
                            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-brand/12">
                              <Icon className="h-5 w-5 text-brand" />
                            </div>
                            <h3 className="text-lg font-bold">{item.title}</h3>
                            <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.desc}</p>
                            <div className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-brand">
                              Ouvrir
                              <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                            </div>
                          </motion.button>
                        )
                      })}
                    </CardContent>
                  </Card>

                  <Card className="rounded-[32px] border-white/10 bg-card/60 backdrop-blur-xl">
                    <CardHeader>
                      <CardTitle>Actions prioritaires</CardTitle>
                      <CardDescription>
                        Ce que Seopic devrait pousser en premier au client.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {overviewActions.map((action, i) => (
                        <div
                          key={i}
                          className="rounded-2xl border border-white/10 bg-background/45 p-4"
                        >
                          <div className="mb-2 flex items-center gap-2">
                            <Badge variant="outline" className="border-brand/20 text-brand">
                              Priorité {i + 1}
                            </Badge>
                          </div>
                          <p className="text-sm leading-6 text-muted-foreground">{action}</p>
                        </div>
                      ))}

                      <div className="rounded-2xl border border-brand/20 bg-brand/10 p-4">
                        <p className="text-sm font-semibold">Objectif produit</p>
                        <p className="mt-1 text-sm leading-6 text-muted-foreground">
                          “J’améliore automatiquement ton SEO visuel et on-site.”
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </motion.div>
            )}

            {section === 'image-agent' && (
              <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
                <Card className="rounded-[32px] border-white/10 bg-card/60 backdrop-blur-xl">
                  <CardHeader>
                    <CardTitle>Image Agent</CardTitle>
                    <CardDescription>
                      Analyse image, alt text, title, description, mots-clés et score SEO.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {!imagePreview ? (
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="group flex min-h-[280px] w-full flex-col items-center justify-center rounded-[28px] border border-dashed border-white/15 bg-background/40 p-8 text-center transition hover:border-brand/30 hover:bg-brand/5"
                      >
                        <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-[22px] bg-brand/12">
                          <Upload className="h-7 w-7 text-brand" />
                        </div>
                        <h3 className="text-lg font-bold">Ajoute une image</h3>
                        <p className="mt-2 max-w-sm text-sm leading-6 text-muted-foreground">
                          Glisse-dépose un visuel ou clique ici pour lancer l’Image Agent.
                        </p>
                      </button>
                    ) : (
                      <div className="space-y-4">
                        <div className="overflow-hidden rounded-[28px] border border-white/10 bg-background/40">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={imagePreview}
                            alt="Preview"
                            className="h-[280px] w-full object-cover"
                          />
                        </div>

                        <div className="flex flex-wrap gap-3">
                          <Button
                            onClick={analyzeImage}
                            disabled={imageLoading}
                            className="rounded-full"
                            variant="brand"
                          >
                            {imageLoading ? 'Analyse en cours…' : 'Lancer l’analyse'}
                          </Button>
                          <Button
                            onClick={() => {
                              setImagePreview(null)
                              setImageFile(null)
                              setImageResult(null)
                              setImageError(null)
                            }}
                            variant="outline"
                            className="rounded-full"
                          >
                            Réinitialiser
                          </Button>
                        </div>
                      </div>
                    )}

                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) handleImageFile(file)
                      }}
                    />

                    {imageError && (
                      <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-300">
                        {imageError}
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card className="rounded-[32px] border-white/10 bg-card/60 backdrop-blur-xl">
                  <CardHeader>
                    <CardTitle>Résultat de l’agent</CardTitle>
                    <CardDescription>
                      Le rendu doit être propre, premium et exploitable directement.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {!imageResult ? (
                      <div className="flex min-h-[380px] items-center justify-center rounded-[28px] border border-white/10 bg-background/40 p-8 text-center">
                        <div>
                          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand/12">
                            <Bot className="h-6 w-6 text-brand" />
                          </div>
                          <h3 className="text-lg font-bold">Aucun résultat pour le moment</h3>
                          <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
                            Lance une analyse image pour activer les sorties de l’Image Agent.
                          </p>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="rounded-2xl border border-white/10 bg-background/45 p-4">
                          <div className="mb-2 flex items-center justify-between">
                            <span className="text-sm font-medium">Score SEO</span>
                            <span className={cn('text-sm font-bold', scoreTone(imageResult.seoScore).cls)}>
                              {imageResult.seoScore}/100 · {scoreTone(imageResult.seoScore).label}
                            </span>
                          </div>
                          <div className="h-2 overflow-hidden rounded-full bg-secondary">
                            <div
                              className={cn('h-full rounded-full', scoreTone(imageResult.seoScore).bar)}
                              style={{ width: `${imageResult.seoScore}%` }}
                            />
                          </div>
                        </div>

                        <div className="grid gap-4">
                          <InfoCard label="Alt text" value={imageResult.suggestedAltText} />
                          <InfoCard label="Meta title" value={imageResult.metaTitle} />
                          <InfoCard label="Meta description" value={imageResult.metaDescription} />

                          <div className="rounded-2xl border border-white/10 bg-background/45 p-4">
                            <p className="text-xs uppercase tracking-wide text-muted-foreground">
                              Mots-clés
                            </p>
                            <div className="mt-3 flex flex-wrap gap-2">
                              {imageResult.keywords.map((k) => (
                                <span
                                  key={k}
                                  className="rounded-full border border-border bg-secondary px-3 py-1 text-xs text-muted-foreground"
                                >
                                  {k}
                                </span>
                              ))}
                            </div>
                          </div>

                          <div className="rounded-2xl border border-white/10 bg-background/45 p-4">
                            <p className="text-xs uppercase tracking-wide text-muted-foreground">
                              Améliorations
                            </p>
                            <ul className="mt-3 space-y-2">
                              {imageResult.improvements.map((item, idx) => (
                                <li key={idx} className="flex gap-2 text-sm text-muted-foreground">
                                  <BadgeCheck className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
                                  <span>{item}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}

            {section === 'site-audit-agent' && (
              <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
                <Card className="rounded-[32px] border-white/10 bg-card/60 backdrop-blur-xl">
                  <CardHeader>
                    <CardTitle>Site Audit Agent</CardTitle>
                    <CardDescription>
                      Scanne une URL et révèle les pages faibles, les images non optimisées et les priorités.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="rounded-[24px] border border-white/10 bg-background/40 p-4">
                      <label className="mb-2 block text-sm font-medium">URL à analyser</label>
                      <div className="flex flex-col gap-3 sm:flex-row">
                        <input
                          value={siteUrl}
                          onChange={(e) => setSiteUrl(e.target.value)}
                          placeholder="https://monsite.com"
                          className="h-12 flex-1 rounded-2xl border border-white/10 bg-background/60 px-4 text-sm outline-none transition focus:border-brand/30"
                        />
                        <Button
                          onClick={runSiteAudit}
                          disabled={siteAuditLoading || !siteUrl.trim()}
                          className="h-12 rounded-2xl"
                          variant="brand"
                        >
                          {siteAuditLoading ? 'Scan en cours…' : 'Scanner'}
                        </Button>
                      </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <MiniStat title="Images à optimiser" value={siteAuditResult?.missingImageSeo ?? 0} />
                      <MiniStat title="Pages faibles" value={siteAuditResult?.weakPages.length ?? 0} />
                    </div>

                    <div className="rounded-2xl border border-brand/20 bg-brand/10 p-4">
                      <p className="text-sm font-semibold">Important</p>
                      <p className="mt-1 text-sm leading-6 text-muted-foreground">
                        Si tu n’as pas encore de vraie route `/api/site-audit`, cette version génère un audit de démo propre pour garder le module vivant côté produit.
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="rounded-[32px] border-white/10 bg-card/60 backdrop-blur-xl">
                  <CardHeader>
                    <CardTitle>Lecture audit</CardTitle>
                    <CardDescription>
                      Le module doit donner un vrai sentiment d’outil premium et orienté action.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {!siteAuditResult ? (
                      <div className="flex min-h-[380px] items-center justify-center rounded-[28px] border border-white/10 bg-background/40 p-8 text-center">
                        <div>
                          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand/12">
                            <Globe className="h-6 w-6 text-brand" />
                          </div>
                          <h3 className="text-lg font-bold">Aucun audit pour le moment</h3>
                          <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
                            Lance un scan URL pour activer le Site Audit Agent.
                          </p>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="rounded-2xl border border-white/10 bg-background/45 p-4">
                          <div className="mb-2 flex items-center justify-between">
                            <span className="text-sm font-medium">Score audit</span>
                            <span className={cn('text-sm font-bold', scoreTone(siteAuditResult.score).cls)}>
                              {siteAuditResult.score}/100 · {scoreTone(siteAuditResult.score).label}
                            </span>
                          </div>
                          <div className="h-2 overflow-hidden rounded-full bg-secondary">
                            <div
                              className={cn('h-full rounded-full', scoreTone(siteAuditResult.score).bar)}
                              style={{ width: `${siteAuditResult.score}%` }}
                            />
                          </div>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                          <AuditList title="Forces" items={siteAuditResult.strengths} />
                          <AuditList title="Points faibles" items={siteAuditResult.issues} />
                        </div>

                        <AuditList title="Pages à surveiller" items={siteAuditResult.weakPages} />
                      </>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}

            {section === 'keyword-agent' && (
              <div className="grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
                <Card className="rounded-[32px] border-white/10 bg-card/60 backdrop-blur-xl">
                  <CardHeader>
                    <CardTitle>Keyword Agent</CardTitle>
                    <CardDescription>
                      Centralise les mots-clés issus des images, du site audit et de tes ajouts manuels.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="rounded-2xl border border-white/10 bg-background/40 p-4">
                      <label className="mb-2 block text-sm font-medium">Ajouter un mot-clé</label>
                      <div className="flex flex-col gap-3 sm:flex-row">
                        <input
                          value={keywordQuery}
                          onChange={(e) => setKeywordQuery(e.target.value)}
                          placeholder="ex: climatiseur mural salon"
                          className="h-12 flex-1 rounded-2xl border border-white/10 bg-background/60 px-4 text-sm outline-none transition focus:border-brand/30"
                        />
                        <Button onClick={addManualKeyword} variant="brand" className="h-12 rounded-2xl">
                          Ajouter
                        </Button>
                      </div>
                    </div>

                    <div className="rounded-2xl border border-brand/20 bg-brand/10 p-4">
                      <p className="text-sm font-semibold">Source des suggestions</p>
                      <p className="mt-1 text-sm leading-6 text-muted-foreground">
                        Le Keyword Agent récupère les signaux des autres modules pour construire une couche SEO plus intelligente.
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="rounded-[32px] border-white/10 bg-card/60 backdrop-blur-xl">
                  <CardHeader>
                    <CardTitle>Opportunités détectées</CardTitle>
                    <CardDescription>
                      Ce bloc doit devenir central dans la promesse “SEO visuel + on-site”.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {keywordIdeas.length === 0 ? (
                      <div className="flex min-h-[320px] items-center justify-center rounded-[28px] border border-white/10 bg-background/40 p-8 text-center">
                        <div>
                          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand/12">
                            <Search className="h-6 w-6 text-brand" />
                          </div>
                          <h3 className="text-lg font-bold">Aucune opportunité affichée</h3>
                          <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
                            Lance d’abord l’Image Agent ou le Site Audit Agent, ou ajoute un mot-clé manuellement.
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-wrap gap-3">
                        {keywordIdeas.map((k) => (
                          <motion.div
                            key={k}
                            whileHover={{ y: -3 }}
                            className="rounded-full border border-white/10 bg-background/45 px-4 py-2 text-sm text-muted-foreground shadow-[0_10px_24px_rgba(0,0,0,0.08)]"
                          >
                            {k}
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}

            {section === 'content-agent' && (
              <div className="grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
                <Card className="rounded-[32px] border-white/10 bg-card/60 backdrop-blur-xl">
                  <CardHeader>
                    <CardTitle>Content Agent</CardTitle>
                    <CardDescription>
                      Génère des angles de texte pour produits, catégories et blog.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="rounded-2xl border border-white/10 bg-background/40 p-4">
                      <label className="mb-2 block text-sm font-medium">Sujet principal</label>
                      <input
                        value={contentTopic}
                        onChange={(e) => setContentTopic(e.target.value)}
                        placeholder="ex: climatisation murale"
                        className="h-12 w-full rounded-2xl border border-white/10 bg-background/60 px-4 text-sm outline-none transition focus:border-brand/30"
                      />
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-background/40 p-4">
                      <label className="mb-2 block text-sm font-medium">Type de contenu</label>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { key: 'product', label: 'Produit' },
                          { key: 'category', label: 'Catégorie' },
                          { key: 'blog', label: 'Blog' },
                        ].map((item) => (
                          <button
                            key={item.key}
                            onClick={() => setContentType(item.key as 'product' | 'category' | 'blog')}
                            className={cn(
                              'rounded-xl border px-3 py-3 text-sm transition',
                              contentType === item.key
                                ? 'border-brand/30 bg-brand/12 text-brand'
                                : 'border-white/10 bg-background/60 text-muted-foreground hover:text-foreground'
                            )}
                          >
                            {item.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="rounded-[32px] border-white/10 bg-card/60 backdrop-blur-xl">
                  <CardHeader>
                    <CardTitle>Suggestions générées</CardTitle>
                    <CardDescription>
                      Même en V1, ce module doit déjà montrer une vraie valeur produit.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {generatedContentIdeas.map((idea) => (
                      <div
                        key={idea.title}
                        className="rounded-2xl border border-white/10 bg-background/45 p-5"
                      >
                        <p className="text-base font-bold">{idea.title}</p>
                        <p className="mt-2 text-sm leading-7 text-muted-foreground">{idea.text}</p>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            )}

            {section === 'history' && (
              <Card className="rounded-[32px] border-white/10 bg-card/60 backdrop-blur-xl">
                <CardHeader className="flex flex-row items-center justify-between gap-4">
                  <div>
                    <CardTitle>Historique des analyses</CardTitle>
                    <CardDescription>Les dernières analyses enregistrées côté utilisateur.</CardDescription>
                  </div>
                  <Button onClick={fetchHistory} variant="outline" className="rounded-full">
                    Actualiser
                  </Button>
                </CardHeader>
                <CardContent>
                  {historyLoading ? (
                    <div className="py-16 text-center text-sm text-muted-foreground">Chargement…</div>
                  ) : history.length === 0 ? (
                    <div className="py-16 text-center">
                      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand/12">
                        <History className="h-6 w-6 text-brand" />
                      </div>
                      <p className="text-lg font-bold">Aucune analyse enregistrée</p>
                      <p className="mt-2 text-sm text-muted-foreground">
                        Lance une analyse avec l’Image Agent pour alimenter l’historique.
                      </p>
                    </div>
                  ) : (
                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                      {history.map((item) => (
                        <div
                          key={item.id}
                          className="rounded-[24px] border border-white/10 bg-background/45 p-5"
                        >
                          <div className="mb-3 flex items-center justify-between">
                            <Badge variant="outline" className="border-brand/20 text-brand">
                              {item.image_category || 'Image'}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {new Date(item.created_at).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="truncate text-base font-bold">
                            {item.image_name || 'Sans nom'}
                          </p>
                          <p className="mt-1 text-xs text-muted-foreground">
                            {formatBytes(item.image_size)}
                          </p>
                          <div className="mt-4">
                            <div className="mb-2 flex items-center justify-between">
                              <span className="text-sm text-muted-foreground">Score</span>
                              <span className="text-sm font-bold text-brand">{item.seo_score}/100</span>
                            </div>
                            <div className="h-2 overflow-hidden rounded-full bg-secondary">
                              <div
                                className={cn('h-full rounded-full', scoreTone(item.seo_score).bar)}
                                style={{ width: `${item.seo_score}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {section === 'tickets' && (
              <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
                <Card className="rounded-[32px] border-white/10 bg-card/60 backdrop-blur-xl">
                  <CardHeader>
                    <CardTitle>Support</CardTitle>
                    <CardDescription>
                      Le support doit rester premium et aligné avec le reste du produit.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Button
                      onClick={() => setShowTicketForm((v) => !v)}
                      variant="brand"
                      className="rounded-full"
                    >
                      {showTicketForm ? 'Fermer le formulaire' : 'Créer un ticket'}
                    </Button>

                    <AnimatePresence>
                      {showTicketForm && (
                        <motion.div
                          initial={{ opacity: 0, y: 12 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 12 }}
                          className="space-y-3 rounded-[24px] border border-white/10 bg-background/45 p-4"
                        >
                          <input
                            value={ticketForm.title}
                            onChange={(e) => setTicketForm((prev) => ({ ...prev, title: e.target.value }))}
                            placeholder="Titre du ticket"
                            className="h-12 w-full rounded-2xl border border-white/10 bg-background/60 px-4 text-sm outline-none transition focus:border-brand/30"
                          />
                          <textarea
                            value={ticketForm.description}
                            onChange={(e) =>
                              setTicketForm((prev) => ({ ...prev, description: e.target.value }))
                            }
                            placeholder="Décris le problème"
                            className="min-h-[120px] w-full rounded-2xl border border-white/10 bg-background/60 px-4 py-3 text-sm outline-none transition focus:border-brand/30"
                          />
                          <select
                            value={ticketForm.priority}
                            onChange={(e) =>
                              setTicketForm((prev) => ({ ...prev, priority: e.target.value }))
                            }
                            className="h-12 w-full rounded-2xl border border-white/10 bg-background/60 px-4 text-sm outline-none transition focus:border-brand/30"
                          >
                            <option>Moyenne</option>
                            <option>Haute</option>
                            <option>Basse</option>
                          </select>

                          {ticketError && (
                            <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-300">
                              {ticketError}
                            </div>
                          )}

                          <Button
                            onClick={submitTicket}
                            disabled={ticketSubmitting}
                            variant="brand"
                            className="rounded-full"
                          >
                            {ticketSubmitting ? 'Envoi…' : 'Envoyer le ticket'}
                          </Button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </CardContent>
                </Card>

                <Card className="rounded-[32px] border-white/10 bg-card/60 backdrop-blur-xl">
                  <CardHeader className="flex flex-row items-center justify-between gap-4">
                    <div>
                      <CardTitle>Mes tickets</CardTitle>
                      <CardDescription>Liste des demandes envoyées depuis l’espace client.</CardDescription>
                    </div>
                    <Button onClick={fetchTickets} variant="outline" className="rounded-full">
                      Actualiser
                    </Button>
                  </CardHeader>
                  <CardContent>
                    {ticketsLoading ? (
                      <div className="py-16 text-center text-sm text-muted-foreground">Chargement…</div>
                    ) : tickets.length === 0 ? (
                      <div className="py-16 text-center">
                        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand/12">
                          <MessageSquare className="h-6 w-6 text-brand" />
                        </div>
                        <p className="text-lg font-bold">Aucun ticket pour le moment</p>
                        <p className="mt-2 text-sm text-muted-foreground">
                          Crée ton premier ticket si tu veux une aide personnalisée.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {tickets.map((ticket) => (
                          <div
                            key={ticket.id}
                            className="rounded-[24px] border border-white/10 bg-background/45 p-5"
                          >
                            <div className="mb-3 flex flex-wrap items-center gap-2">
                              <Badge variant="outline" className="border-brand/20 text-brand">
                                {ticket.status}
                              </Badge>
                              <Badge variant="outline">{ticket.priority}</Badge>
                              <span className="text-xs text-muted-foreground">
                                {new Date(ticket.created_at).toLocaleDateString()}
                              </span>
                            </div>
                            <p className="text-base font-bold">{ticket.title}</p>
                            <p className="mt-2 text-sm leading-6 text-muted-foreground">
                              {ticket.description}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}

            {section === 'settings' && (
              <Card className="rounded-[32px] border-white/10 bg-card/60 backdrop-blur-xl">
                <CardHeader>
                  <CardTitle>Paramètres</CardTitle>
                  <CardDescription>
                    Réglages simples, mais toujours alignés avec l’identité premium du produit.
                  </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-[24px] border border-white/10 bg-background/45 p-5">
                    <div className="mb-3 flex items-center gap-3">
                      <UserCircle2 className="h-5 w-5 text-brand" />
                      <p className="font-semibold">Compte</p>
                    </div>
                    <p className="text-sm text-muted-foreground">{session?.user?.name}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{session?.user?.email}</p>
                  </div>

                  <div className="rounded-[24px] border border-white/10 bg-background/45 p-5">
                    <div className="mb-3 flex items-center gap-3">
                      <Home className="h-5 w-5 text-brand" />
                      <p className="font-semibold">Navigation</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button asChild variant="outline" className="rounded-full">
                        <Link href="/">Retour landing</Link>
                      </Button>
                      {isAdmin && (
                        <Button asChild variant="outline" className="rounded-full">
                          <Link href="/admin">Admin</Link>
                        </Button>
                      )}
                    </div>
                  </div>

                  <div className="rounded-[24px] border border-white/10 bg-background/45 p-5 md:col-span-2">
                    <div className="mb-3 flex items-center gap-3">
                      <Shield className="h-5 w-5 text-brand" />
                      <p className="font-semibold">Vision produit</p>
                    </div>
                    <p className="text-sm leading-7 text-muted-foreground">
                      Le dashboard doit rester cohérent avec la landing : plus de clarté, plus de structure, plus de sensation “SEO Operating System”, et une vraie mise en avant des 4 agents.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </main>
        </div>
      </div>
    </div>
  )
}

function MiniStat({ title, value }: { title: string; value: string | number }) {
  return (
    <div className="rounded-[24px] border border-white/10 bg-background/45 p-5">
      <p className="text-sm text-muted-foreground">{title}</p>
      <p className="mt-2 text-3xl font-black tracking-tight">{value}</p>
    </div>
  )
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-background/45 p-4">
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-2 text-sm leading-7 text-muted-foreground">{value}</p>
    </div>
  )
}

function AuditList({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-background/45 p-4">
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{title}</p>
      <ul className="mt-3 space-y-2">
        {items.map((item, idx) => (
          <li key={idx} className="flex gap-2 text-sm text-muted-foreground">
            <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
