'use client'

import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  ArrowLeft,
  BarChart3,
  CheckCircle2,
  ChevronRight,
  Download,
  FileImage,
  History,
  Home,
  Image as ImageIcon,
  LayoutDashboard,
  LogOut,
  Menu,
  RefreshCcw,
  Search,
  Settings,
  Shield,
  Sparkles,
  Ticket,
  Upload,
  UserCircle2,
  Wand2,
  X,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

const ADMIN_EMAILS = (process.env.NEXT_PUBLIC_ADMIN_EMAILS || '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean)

type Section = 'overview' | 'image-agent' | 'history' | 'tickets' | 'settings'

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

const navItems: {
  id: Section
  label: string
  icon: React.ComponentType<{ className?: string }>
}[] = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'image-agent', label: 'Image Agent', icon: FileImage },
  { id: 'history', label: 'Historique', icon: History },
  { id: 'tickets', label: 'Tickets', icon: Ticket },
  { id: 'settings', label: 'Paramètres', icon: Settings },
]

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

function formatDate(value?: string) {
  if (!value) return '—'
  try {
    return new Date(value).toLocaleDateString()
  } catch {
    return value
  }
}

function scoreTone(score: number) {
  if (score >= 80) return { label: 'Excellent', cls: 'text-emerald-400', bar: 'bg-emerald-400' }
  if (score >= 60) return { label: 'Correct', cls: 'text-yellow-400', bar: 'bg-yellow-400' }
  return { label: 'À améliorer', cls: 'text-red-400', bar: 'bg-red-400' }
}

function statusTone(status?: string) {
  if (status === 'Fermé') return 'border-emerald-500/20 text-emerald-400'
  if (status === 'En Cours') return 'border-yellow-500/20 text-yellow-400'
  return 'border-brand/20 text-brand'
}

function priorityTone(priority?: string) {
  if (priority === 'Haute') return 'border-red-500/20 text-red-400'
  if (priority === 'Basse') return 'border-emerald-500/20 text-emerald-400'
  return 'border-yellow-500/20 text-yellow-400'
}

function CircularScore({ score }: { score: number }) {
  const radius = 48
  const circumference = 2 * Math.PI * radius
  const progress = circumference - (score / 100) * circumference
  const tone = scoreTone(score)

  return (
    <div className="relative flex h-36 w-36 items-center justify-center">
      <svg className="h-36 w-36 -rotate-90" viewBox="0 0 120 120">
        <circle
          cx="60"
          cy="60"
          r={radius}
          stroke="currentColor"
          strokeWidth="8"
          fill="transparent"
          className="text-white/10"
        />
        <circle
          cx="60"
          cy="60"
          r={radius}
          stroke="currentColor"
          strokeWidth="8"
          fill="transparent"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={progress}
          className={cn(
            tone.bar === 'bg-emerald-400' && 'text-emerald-400',
            tone.bar === 'bg-yellow-400' && 'text-yellow-400',
            tone.bar === 'bg-red-400' && 'text-red-400'
          )}
        />
      </svg>

      <div className="absolute text-center">
        <div className="text-4xl font-black tracking-tight">{score}</div>
        <div className="mt-1 text-xs text-muted-foreground">/100</div>
      </div>
    </div>
  )
}

function GooglePreview({
  title,
  description,
}: {
  title: string
  description: string
}) {
  return (
    <div className="rounded-[24px] border border-white/10 bg-white p-5 text-black shadow-[0_20px_60px_rgba(0,0,0,0.18)]">
      <p className="text-xs text-green-700">seopic.io › votre-page</p>
      <h3 className="mt-1 text-[28px] leading-tight text-[#1a0dab]">
        {title || 'Titre SEO'}
      </h3>
      <p className="mt-2 text-[15px] leading-7 text-[#4d5156]">
        {description || 'Votre meta description apparaîtra ici.'}
      </p>
    </div>
  )
}

function StatCard({
  label,
  value,
  sub,
  icon: Icon,
}: {
  label: string
  value: string
  sub: string
  icon: React.ComponentType<{ className?: string }>
}) {
  return (
    <Card className="rounded-[28px] border-white/10 bg-card/60 backdrop-blur-xl">
      <CardContent className="p-6">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-brand/12">
          <Icon className="h-5 w-5 text-brand" />
        </div>
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="mt-2 text-4xl font-black tracking-tight">{value}</p>
        <p className="mt-2 text-sm text-muted-foreground">{sub}</p>
      </CardContent>
    </Card>
  )
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

  const [seoFilename, setSeoFilename] = useState('')
  const [seoTitle, setSeoTitle] = useState('')
  const [seoAltText, setSeoAltText] = useState('')
  const [seoDescription, setSeoDescription] = useState('')
  const [seoKeywords, setSeoKeywords] = useState<string[]>([])
  const [keywordInput, setKeywordInput] = useState('')
  const [outputFormat, setOutputFormat] = useState<'jpg' | 'png' | 'webp'>('jpg')
  const [outputQuality, setOutputQuality] = useState(85)
  const [injectLoading, setInjectLoading] = useState(false)
  const [injectError, setInjectError] = useState<string | null>(null)
  const [injectSuccess, setInjectSuccess] = useState(false)

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
  const latestHistory = history.slice(0, 3)

  const estimatedWebpSize = useMemo(() => {
    if (!imageFile?.size) return null
    const ratio = outputFormat === 'webp' ? 0.78 : outputFormat === 'jpg' ? 0.88 : 1
    return Math.round(imageFile.size * ratio)
  }, [imageFile, outputFormat])

  const handleImageFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setImageError('Utilise un fichier image valide.')
      return
    }

    if (file.size > 10 * 1024 * 1024) {
      setImageError('Image trop lourde. Maximum 10MB.')
      return
    }

    setImageError(null)
    setInjectError(null)
    setInjectSuccess(false)
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
      setInjectSuccess(false)

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

      const cleanBaseName =
        (data?.metaTitle || imageFile.name.replace(/\.[^.]+$/, ''))
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-+|-+$/g, '') || 'image-seo'

      setSeoFilename(cleanBaseName)
      setSeoTitle(data?.metaTitle || '')
      setSeoAltText(data?.suggestedAltText || '')
      setSeoDescription(data?.metaDescription || '')
      setSeoKeywords(Array.isArray(data?.keywords) ? data.keywords : [])

      fetchHistory()
    } catch {
      setImageError('Analyse impossible. Vérifie ta connexion.')
    } finally {
      setImageLoading(false)
    }
  }

  const addKeyword = () => {
    const value = keywordInput.trim()
    if (!value) return
    if (seoKeywords.includes(value)) {
      setKeywordInput('')
      return
    }
    setSeoKeywords((prev) => [...prev, value])
    setKeywordInput('')
  }

  const removeKeyword = (value: string) => {
    setSeoKeywords((prev) => prev.filter((k) => k !== value))
  }

  const resetImageAgent = () => {
    setImagePreview(null)
    setImageFile(null)
    setImageResult(null)
    setImageError(null)
    setInjectError(null)
    setInjectSuccess(false)
    setSeoFilename('')
    setSeoTitle('')
    setSeoAltText('')
    setSeoDescription('')
    setSeoKeywords([])
    setKeywordInput('')
    setOutputFormat('jpg')
    setOutputQuality(85)
  }

  const injectAndDownload = async () => {
    if (!imagePreview) return

    try {
      setInjectLoading(true)
      setInjectError(null)
      setInjectSuccess(false)

      const imageBase64 = imagePreview.split(',')[1]

      const res = await fetch('/api/inject-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64,
          filename: seoFilename,
          title: seoTitle,
          altText: seoAltText,
          description: seoDescription,
          keywords: seoKeywords,
          format: outputFormat,
          quality: outputQuality,
        }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => null)
        setInjectError(data?.error || 'Injection impossible.')
        return
      }

      const blob = await res.blob()
      const url = window.URL.createObjectURL(blob)

      const safeFilename =
        (seoFilename || 'image-seo')
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-+|-+$/g, '') || 'image-seo'

      const a = document.createElement('a')
      a.href = url
      a.download = `${safeFilename}.${outputFormat}`
      document.body.appendChild(a)
      a.click()
      a.remove()
      window.URL.revokeObjectURL(url)

      setInjectSuccess(true)
    } catch {
      setInjectError('Erreur pendant le téléchargement.')
    } finally {
      setInjectLoading(false)
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
      setSection('tickets')
    } catch {
      setTicketError('Connexion impossible.')
    } finally {
      setTicketSubmitting(false)
    }
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
        'hidden border-r border-white/10 bg-background/45 backdrop-blur-2xl lg:flex lg:h-screen lg:flex-col lg:sticky lg:top-0',
        sidebarCollapsed ? 'lg:w-[88px]' : 'lg:w-[280px]'
      )}
    >
      <div className="flex h-20 items-center justify-between border-b border-white/10 px-4">
        {!sidebarCollapsed && (
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand shadow-[0_0_35px_hsl(22_82%_55%/0.35)]">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <div>
              <p className="text-lg font-black tracking-tight">
                Seo<span className="text-brand">Pic</span>
              </p>
              <p className="text-[11px] text-muted-foreground">Client Dashboard</p>
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
        <div className="mb-6 rounded-[28px] border border-brand/20 bg-gradient-to-br from-brand/12 to-orange-500/5 p-5">
          {!sidebarCollapsed ? (
            <>
              <div className="mb-3 flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-[0.22em] text-brand">
                  Plan
                </span>
                <Badge variant="outline" className="border-brand/20 text-brand">
                  Découverte
                </Badge>
              </div>
              <p className="text-base font-bold">Pilotage SEO visuel</p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Analyse, édition, injection et export depuis une seule interface.
              </p>
            </>
          ) : (
            <div className="flex justify-center">
              <Sparkles className="h-5 w-5 text-brand" />
            </div>
          )}
        </div>

        <div className="space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon
            const active = section === item.id
            return (
              <button
                key={item.id}
                onClick={() => setSection(item.id)}
                className={cn(
                  'flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left transition',
                  active
                    ? 'border border-brand/20 bg-brand/12 text-brand shadow-[0_10px_30px_rgba(231,111,46,0.08)]'
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

      <div className="border-t border-white/10 p-4">
        <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-3">
          {session?.user?.image ? (
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
        <div className="absolute left-1/2 top-0 h-[480px] w-[480px] -translate-x-1/2 rounded-full bg-brand/10 blur-[140px]" />
        <div className="absolute right-0 top-20 h-[300px] w-[300px] rounded-full bg-orange-400/10 blur-[120px]" />
        <div className="absolute left-0 bottom-0 h-[220px] w-[220px] rounded-full bg-yellow-400/5 blur-[100px]" />
      </div>

      <div className="relative flex min-h-screen">
        {desktopSidebar}

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-40 border-b border-white/10 bg-background/50 backdrop-blur-2xl">
            <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-5 sm:px-6 lg:px-8">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setMobileMenuOpen(true)}
                  className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-muted-foreground lg:hidden"
                >
                  <Menu className="h-5 w-5" />
                </button>

                <div>
                  <h1 className="text-3xl font-black tracking-tight">
                    {section === 'overview' && 'Overview'}
                    {section === 'image-agent' && 'Image Agent'}
                    {section === 'history' && 'Historique'}
                    {section === 'tickets' && 'Tickets'}
                    {section === 'settings' && 'Paramètres'}
                  </h1>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Interface premium pour piloter votre SEO visuel.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {isAdmin && (
                  <Button asChild variant="outline" className="rounded-full">
                    <Link href="/admin">
                      <Shield className="mr-2 h-4 w-4" />
                      Admin
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
                  className="fixed left-0 top-0 z-50 h-screen w-[290px] border-r border-white/10 bg-background/95 p-4 backdrop-blur-2xl lg:hidden"
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
                        <p className="text-[11px] text-muted-foreground">Client</p>
                      </div>
                    </Link>

                    <button
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="space-y-1.5">
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
                              ? 'border border-brand/20 bg-brand/12 text-brand'
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
                    <Button asChild variant="outline" className="mb-2 w-full rounded-2xl">
                      <Link href="/">
                        <Home className="mr-2 h-4 w-4" />
                        Accueil
                      </Link>
                    </Button>
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
              <div className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                  <StatCard
                    label="Dernier score SEO"
                    value={latestScore ? String(latestScore) : '—'}
                    sub={latestScore ? scoreTone(latestScore).label : 'Aucune analyse'}
                    icon={BarChart3}
                  />
                  <StatCard
                    label="Analyses enregistrées"
                    value={String(history.length)}
                    sub="Historique disponible"
                    icon={History}
                  />
                  <StatCard
                    label="Tickets ouverts"
                    value={String(openTicketsCount)}
                    sub="Support client"
                    icon={Ticket}
                  />
                  <StatCard
                    label="Image Agent"
                    value={imageResult ? 'Actif' : 'Prêt'}
                    sub={imageResult ? 'Données disponibles' : 'Aucune image analysée'}
                    icon={FileImage}
                  />
                </div>

                <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
                  <Card className="rounded-[32px] border-white/10 bg-card/60 backdrop-blur-xl">
                    <CardHeader>
                      <CardTitle>Accès rapide</CardTitle>
                      <CardDescription>
                        Accédez aux actions clés de votre espace.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-4 sm:grid-cols-2">
                      {[
                        {
                          title: 'Image Agent',
                          desc: 'Analyser, éditer et exporter vos images SEO.',
                          section: 'image-agent' as Section,
                          icon: FileImage,
                        },
                        {
                          title: 'Historique',
                          desc: 'Retrouver vos analyses enregistrées.',
                          section: 'history' as Section,
                          icon: History,
                        },
                        {
                          title: 'Tickets',
                          desc: 'Contacter le support et suivre vos demandes.',
                          section: 'tickets' as Section,
                          icon: Ticket,
                        },
                        {
                          title: 'Paramètres',
                          desc: 'Gérer votre compte et votre navigation.',
                          section: 'settings' as Section,
                          icon: Settings,
                        },
                      ].map((item) => {
                        const Icon = item.icon
                        return (
                          <button
                            key={item.title}
                            onClick={() => setSection(item.section)}
                            className="rounded-[24px] border border-white/10 bg-background/45 p-5 text-left transition hover:-translate-y-1 hover:border-brand/20 hover:shadow-[0_18px_40px_rgba(0,0,0,0.18)]"
                          >
                            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-brand/12">
                              <Icon className="h-5 w-5 text-brand" />
                            </div>
                            <h3 className="text-lg font-bold">{item.title}</h3>
                            <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.desc}</p>
                          </button>
                        )
                      })}
                    </CardContent>
                  </Card>

                  <Card className="rounded-[32px] border-white/10 bg-card/60 backdrop-blur-xl">
                    <CardHeader>
                      <CardTitle>Dernières analyses</CardTitle>
                      <CardDescription>
                        Les derniers résultats enregistrés dans votre espace.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {latestHistory.length === 0 ? (
                        <div className="flex min-h-[260px] items-center justify-center rounded-[28px] border border-white/10 bg-background/40 p-8 text-center">
                          <div>
                            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand/12">
                              <History className="h-6 w-6 text-brand" />
                            </div>
                            <p className="text-lg font-bold">Aucune analyse</p>
                            <p className="mt-2 text-sm text-muted-foreground">
                              Lancez votre première analyse depuis Image Agent.
                            </p>
                          </div>
                        </div>
                      ) : (
                        latestHistory.map((item) => (
                          <div
                            key={item.id}
                            className="rounded-[24px] border border-white/10 bg-background/45 p-5"
                          >
                            <div className="mb-3 flex items-center justify-between gap-3">
                              <div>
                                <p className="truncate text-base font-bold">
                                  {item.image_name || 'Sans nom'}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {formatDate(item.created_at)} · {formatBytes(item.image_size)}
                                </p>
                              </div>
                              <Badge variant="outline" className="border-brand/20 text-brand">
                                {item.image_category || 'Image'}
                              </Badge>
                            </div>

                            <div className="mb-2 flex items-center justify-between">
                              <span className="text-sm text-muted-foreground">Score</span>
                              <span className={cn('text-sm font-bold', scoreTone(item.seo_score).cls)}>
                                {item.seo_score}/100
                              </span>
                            </div>
                            <div className="h-2 overflow-hidden rounded-full bg-secondary">
                              <div
                                className={cn('h-full rounded-full', scoreTone(item.seo_score).bar)}
                                style={{ width: `${item.seo_score}%` }}
                              />
                            </div>
                          </div>
                        ))
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {section === 'image-agent' && (
              <div className="grid gap-6 xl:grid-cols-[1.05fr_1fr]">
                <div className="grid gap-6">
                  <Card className="rounded-[32px] border-white/10 bg-card/60 backdrop-blur-xl">
                    <CardHeader>
                      <CardTitle>Image originale</CardTitle>
                      <CardDescription>
                        Chargez un visuel, analysez-le et préparez son export SEO.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-5">
                      {!imagePreview ? (
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          className="group flex min-h-[360px] w-full flex-col items-center justify-center rounded-[28px] border border-dashed border-white/15 bg-background/40 p-8 text-center transition hover:border-brand/30 hover:bg-brand/5"
                        >
                          <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-[24px] bg-brand/12">
                            <Upload className="h-8 w-8 text-brand" />
                          </div>
                          <h3 className="text-2xl font-bold">Ajouter une image</h3>
                          <p className="mt-3 max-w-sm text-sm leading-7 text-muted-foreground">
                            JPG, PNG, WEBP ou GIF. Maximum 10MB.
                          </p>
                        </button>
                      ) : (
                        <>
                          <div className="overflow-hidden rounded-[28px] border border-white/10 bg-background/40">
                            <img
                              src={imagePreview}
                              alt="Preview"
                              className="h-[360px] w-full object-contain bg-black/20"
                            />
                          </div>

                          <div className="rounded-[24px] border border-white/10 bg-background/45 p-5">
                            <div className="flex flex-wrap items-center gap-4">
                              <div>
                                <p className="text-xs uppercase tracking-wide text-muted-foreground">Original</p>
                                <p className="mt-1 text-3xl font-black tracking-tight">
                                  {formatBytes(imageFile?.size)}
                                </p>
                              </div>

                              <div className="text-2xl text-muted-foreground">→</div>

                              <div>
                                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                                  {outputFormat.toUpperCase()}
                                </p>
                                <p className="mt-1 text-3xl font-black tracking-tight text-emerald-400">
                                  {estimatedWebpSize ? formatBytes(estimatedWebpSize) : '—'}
                                </p>
                              </div>

                              {imageFile?.size && estimatedWebpSize ? (
                                <div className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-sm font-semibold text-emerald-400">
                                  -{Math.max(1, Math.round((1 - estimatedWebpSize / imageFile.size) * 100))}%
                                </div>
                              ) : null}
                            </div>
                          </div>

                          <div className="grid gap-3 sm:grid-cols-3">
                            <Button
                              onClick={analyzeImage}
                              disabled={imageLoading}
                              className="rounded-full"
                              variant="brand"
                            >
                              <Wand2 className="mr-2 h-4 w-4" />
                              {imageLoading ? 'Analyse…' : 'Analyser'}
                            </Button>

                            <Button
                              onClick={injectAndDownload}
                              disabled={injectLoading || !seoFilename || !seoTitle}
                              className="rounded-full"
                              variant="outline"
                            >
                              <Download className="mr-2 h-4 w-4" />
                              {injectLoading ? 'Injection…' : 'Injecter & Télécharger'}
                            </Button>

                            <Button
                              onClick={resetImageAgent}
                              variant="outline"
                              className="rounded-full"
                            >
                              Réinitialiser
                            </Button>
                          </div>
                        </>
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

                  <div className="grid gap-6 md:grid-cols-[260px_1fr]">
                    <Card className="rounded-[32px] border-white/10 bg-card/60 backdrop-blur-xl">
                      <CardHeader>
                        <CardTitle>Score SEO</CardTitle>
                      </CardHeader>
                      <CardContent className="flex flex-col items-center justify-center">
                        <CircularScore score={imageResult?.seoScore || 0} />
                        <p className={cn('mt-4 text-sm font-semibold', imageResult ? scoreTone(imageResult.seoScore).cls : 'text-muted-foreground')}>
                          {imageResult ? scoreTone(imageResult.seoScore).label : 'En attente'}
                        </p>
                      </CardContent>
                    </Card>

                    <Card className="rounded-[32px] border-white/10 bg-card/60 backdrop-blur-xl">
                      <CardHeader>
                        <CardTitle>Contenu détecté</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="rounded-[24px] border border-white/10 bg-background/45 p-5 text-sm leading-8 text-muted-foreground">
                          {imageResult?.detectedContent || 'Aucune détection pour le moment.'}
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <Card className="rounded-[32px] border-white/10 bg-card/60 backdrop-blur-xl">
                    <CardHeader>
                      <CardTitle>Recommandations</CardTitle>
                      <CardDescription>
                        Actions suggérées pour améliorer la performance SEO du visuel.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {(imageResult?.improvements?.length
                        ? imageResult.improvements
                        : [
                            'Ajoutez une analyse IA pour générer des recommandations précises.',
                            'Personnalisez le texte alternatif avec les mots-clés de votre page de destination.',
                            'Vérifiez que le nom du fichier reflète bien l’intention de recherche principale.',
                          ]
                      ).map((item, idx) => (
                        <div
                          key={idx}
                          className="flex gap-3 rounded-2xl border border-white/10 bg-background/45 px-4 py-4"
                        >
                          <Sparkles className="mt-1 h-4 w-4 shrink-0 text-brand" />
                          <p className="text-sm leading-7 text-muted-foreground">{item}</p>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </div>

                <div className="grid gap-6">
                  <Card className="rounded-[32px] border-white/10 bg-card/60 backdrop-blur-xl">
                    <CardHeader>
                      <CardTitle>Éditeur de métadonnées SEO</CardTitle>
                      <CardDescription>
                        Modifiez vos champs avant injection dans le fichier final.
                      </CardDescription>
                    </CardHeader>

                    <CardContent className="grid gap-5">
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Filename</label>
                          <input
                            value={seoFilename}
                            onChange={(e) => setSeoFilename(e.target.value)}
                            placeholder="nom-de-fichier-seo"
                            className="h-12 w-full rounded-2xl border border-white/10 bg-background/60 px-4 text-sm outline-none transition focus:border-brand/30"
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="text-sm font-medium">Meta Title</label>
                          <input
                            value={seoTitle}
                            onChange={(e) => setSeoTitle(e.target.value)}
                            placeholder="Titre SEO"
                            className="h-12 w-full rounded-2xl border border-white/10 bg-background/60 px-4 text-sm outline-none transition focus:border-brand/30"
                          />
                          <p className={cn('text-right text-xs', seoTitle.length > 60 ? 'text-red-400' : 'text-muted-foreground')}>
                            {seoTitle.length}/60
                          </p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium">Texte alternatif (Alt Text)</label>
                        <textarea
                          value={seoAltText}
                          onChange={(e) => setSeoAltText(e.target.value)}
                          placeholder="Alt text"
                          className="min-h-[110px] w-full rounded-2xl border border-white/10 bg-background/60 px-4 py-3 text-sm outline-none transition focus:border-brand/30"
                        />
                        <p className={cn('text-right text-xs', seoAltText.length > 125 ? 'text-red-400' : 'text-muted-foreground')}>
                          {seoAltText.length}/125
                        </p>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium">Meta Description</label>
                        <textarea
                          value={seoDescription}
                          onChange={(e) => setSeoDescription(e.target.value)}
                          placeholder="Meta description"
                          className="min-h-[130px] w-full rounded-2xl border border-white/10 bg-background/60 px-4 py-3 text-sm outline-none transition focus:border-brand/30"
                        />
                        <p className={cn('text-right text-xs', seoDescription.length > 160 ? 'text-red-400' : 'text-muted-foreground')}>
                          {seoDescription.length}/160
                        </p>
                      </div>

                      <div className="space-y-3">
                        <label className="text-sm font-medium">Mots-clés SEO</label>

                        <div className="flex flex-col gap-3 sm:flex-row">
                          <input
                            value={keywordInput}
                            onChange={(e) => setKeywordInput(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault()
                                addKeyword()
                              }
                            }}
                            placeholder="Ajouter un mot-clé"
                            className="h-12 flex-1 rounded-2xl border border-white/10 bg-background/60 px-4 text-sm outline-none transition focus:border-brand/30"
                          />
                          <Button onClick={addKeyword} variant="outline" className="rounded-2xl">
                            Ajouter
                          </Button>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          {seoKeywords.map((keyword) => (
                            <button
                              key={keyword}
                              onClick={() => removeKeyword(keyword)}
                              className="rounded-full border border-brand/20 bg-brand/10 px-3 py-1 text-xs text-brand transition hover:border-red-500/30 hover:text-red-300"
                            >
                              {keyword} ×
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-3">
                        <label className="text-sm font-medium">Aperçu Google</label>
                        <GooglePreview title={seoTitle} description={seoDescription} />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="rounded-[32px] border-white/10 bg-card/60 backdrop-blur-xl">
                    <CardHeader>
                      <CardTitle>Export de l’image</CardTitle>
                      <CardDescription>
                        Injectez vos données SEO puis téléchargez le fichier final.
                      </CardDescription>
                    </CardHeader>

                    <CardContent className="grid gap-5">
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Format</label>
                          <select
                            value={outputFormat}
                            onChange={(e) => setOutputFormat(e.target.value as 'jpg' | 'png' | 'webp')}
                            className="h-12 w-full rounded-2xl border border-white/10 bg-background/60 px-4 text-sm outline-none transition focus:border-brand/30"
                          >
                            <option value="jpg">JPG</option>
                            <option value="png">PNG</option>
                            <option value="webp">WEBP</option>
                          </select>
                        </div>

                        <div className="space-y-2">
                          <label className="text-sm font-medium">Qualité: {outputQuality}</label>
                          <input
                            type="range"
                            min={40}
                            max={100}
                            step={5}
                            value={outputQuality}
                            onChange={(e) => setOutputQuality(Number(e.target.value))}
                            className="w-full accent-[hsl(var(--primary))]"
                          />
                        </div>
                      </div>

                      {injectSuccess && (
                        <div className="flex items-center gap-3 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-4 text-sm text-emerald-300">
                          <CheckCircle2 className="h-5 w-5" />
                          SEO injecté avec succès.
                        </div>
                      )}

                      {injectError && (
                        <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-300">
                          {injectError}
                        </div>
                      )}

                      <div className="grid gap-3">
                        <Button
                          onClick={injectAndDownload}
                          disabled={injectLoading || !imagePreview}
                          className="h-14 rounded-full text-base"
                          variant="brand"
                        >
                          <Download className="mr-2 h-5 w-5" />
                          {injectLoading
                            ? 'Injection en cours…'
                            : `Télécharger ${outputFormat.toUpperCase()} avec SEO`}
                        </Button>

                        <p className="text-center text-sm text-muted-foreground">
                          Modifiez les données puis réinjectez pour générer une nouvelle version.
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {section === 'history' && (
              <Card className="rounded-[32px] border-white/10 bg-card/60 backdrop-blur-xl">
                <CardHeader className="flex flex-row items-center justify-between gap-4">
                  <div>
                    <CardTitle>Historique</CardTitle>
                    <CardDescription>Retrouvez vos dernières analyses sauvegardées.</CardDescription>
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
                        Lancez une analyse dans Image Agent.
                      </p>
                    </div>
                  ) : (
                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                      {history.map((item) => (
                        <div
                          key={item.id}
                          className="rounded-[24px] border border-white/10 bg-background/45 p-5"
                        >
                          <div className="mb-3 flex items-center justify-between gap-3">
                            <Badge variant="outline" className="border-brand/20 text-brand">
                              {item.image_category || 'Image'}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {formatDate(item.created_at)}
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
                              <span className={cn('text-sm font-bold', scoreTone(item.seo_score).cls)}>
                                {item.seo_score}/100
                              </span>
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
                    <CardTitle>Créer un ticket</CardTitle>
                    <CardDescription>Contactez le support depuis votre espace client.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Button
                      onClick={() => setShowTicketForm((v) => !v)}
                      variant="brand"
                      className="rounded-full"
                    >
                      {showTicketForm ? 'Fermer' : 'Nouveau ticket'}
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
                            placeholder="Titre"
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
                            {ticketSubmitting ? 'Envoi…' : 'Envoyer'}
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
                      <CardDescription>Suivez vos demandes envoyées au support.</CardDescription>
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
                          <Ticket className="h-6 w-6 text-brand" />
                        </div>
                        <p className="text-lg font-bold">Aucun ticket</p>
                        <p className="mt-2 text-sm text-muted-foreground">
                          Créez votre premier ticket si besoin.
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
                              <Badge variant="outline" className={statusTone(ticket.status)}>
                                {ticket.status}
                              </Badge>
                              <Badge variant="outline" className={priorityTone(ticket.priority)}>
                                {ticket.priority}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                {formatDate(ticket.created_at)}
                              </span>
                            </div>
                            <p className="text-base font-bold">{ticket.title}</p>
                            <p className="mt-2 text-sm leading-6 text-muted-foreground">
                              {ticket.description}
                            </p>
                            <p className="mt-3 text-xs text-muted-foreground">
                              Réponses : {ticket.replies?.length || 0}
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
                  <CardDescription>Compte, navigation et accès avancés.</CardDescription>
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
                        <Link href="/">
                          <ArrowLeft className="mr-2 h-4 w-4" />
                          Retour landing
                        </Link>
                      </Button>
                      {isAdmin && (
                        <Button asChild variant="outline" className="rounded-full">
                          <Link href="/admin">
                            <Shield className="mr-2 h-4 w-4" />
                            Admin
                          </Link>
                        </Button>
                      )}
                    </div>
                  </div>

                  <div className="rounded-[24px] border border-white/10 bg-background/45 p-5 md:col-span-2">
                    <div className="mb-3 flex items-center gap-3">
                      <Search className="h-5 w-5 text-brand" />
                      <p className="font-semibold">Positionnement produit</p>
                    </div>
                    <p className="text-sm leading-7 text-muted-foreground">
                      Votre espace est conçu pour analyser des visuels, éditer des métadonnées SEO, injecter les informations dans le fichier final et exporter des images prêtes à être publiées.
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
