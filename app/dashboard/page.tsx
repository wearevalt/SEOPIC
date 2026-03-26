'use client'

import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState, useCallback } from 'react'
import Link from 'next/link'

const ADMIN_EMAILS = (process.env.NEXT_PUBLIC_ADMIN_EMAILS || '').split(',')

interface Ticket {
  id: string
  title: string
  description: string
  status: 'Ouvert' | 'En Cours' | 'Fermé'
  priority: 'Haute' | 'Moyenne' | 'Basse'
  created_at: string
  replies: { id: string }[]
}

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

export default function Dashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [tab, setTab] = useState<'seo' | 'history' | 'tickets'>('seo')

  // SEO Tool
  const [image, setImage] = useState<string | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<SeoResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState<string | null>(null)

  // Historique
  const [history, setHistory] = useState<AnalysisHistory[]>([])
  const [historyLoading, setHistoryLoading] = useState(false)

  // Tickets
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [ticketsLoading, setTicketsLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ title: '', description: '', priority: 'Moyenne' })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/auth/signin')
  }, [status, router])

  const fetchTickets = useCallback(async () => {
    if (!session?.user?.email) return
    setTicketsLoading(true)
    try {
      const res = await fetch(`/api/tickets?email=${encodeURIComponent(session.user.email)}`)
      if (res.ok) setTickets(await res.json())
    } finally { setTicketsLoading(false) }
  }, [session?.user?.email])

  const fetchHistory = useCallback(async () => {
    setHistoryLoading(true)
    try {
      const res = await fetch('/api/analyses')
      if (res.ok) setHistory(await res.json())
    } finally { setHistoryLoading(false) }
  }, [])

  useEffect(() => {
    if (tab === 'tickets' && status === 'authenticated') fetchTickets()
    if (tab === 'history' && status === 'authenticated') fetchHistory()
  }, [tab, status, fetchTickets, fetchHistory])

  const submitTicket = async () => {
    if (!form.title.trim() || !form.description.trim()) return
    setSubmitting(true)
    try {
      const res = await fetch('/api/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: form.title,
          description: form.description,
          priority: form.priority,
          client_name: session?.user?.name || 'Client',
          client_email: session?.user?.email,
        }),
      })
      if (res.ok) {
        setForm({ title: '', description: '', priority: 'Moyenne' })
        setShowForm(false)
        await fetchTickets()
      }
    } finally { setSubmitting(false) }
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-[#030303] flex items-center justify-center">
        <div className="text-white text-xl">Chargement...</div>
      </div>
    )
  }

  if (status === 'unauthenticated') return null

  const isAdmin = ADMIN_EMAILS.includes(session?.user?.email || '')

  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Fichier non valide. Utilisez JPG, PNG, WEBP ou GIF.')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('Image trop grande. Maximum 5MB.')
      return
    }
    setError(null)
    setResult(null)
    setImageFile(file)
    const reader = new FileReader()
    reader.onload = (e) => setImage(e.target?.result as string)
    reader.readAsDataURL(file)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  const analyze = async () => {
    if (!imageFile || !image) return
    setLoading(true)
    setError(null)
    try {
      const base64 = image.split(',')[1]
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
      if (!res.ok) throw new Error('Erreur lors de l\'analyse')
      const data = await res.json()
      setResult(data)
    } catch (err) {
      setError('Analyse échouée. Réessayez.')
    } finally {
      setLoading(false)
    }
  }

  const copyText = (text: string, key: string) => {
    navigator.clipboard.writeText(text)
    setCopied(key)
    setTimeout(() => setCopied(null), 2000)
  }

  const scoreColor = (score: number) => {
    if (score >= 80) return 'text-green-400'
    if (score >= 60) return 'text-yellow-400'
    return 'text-red-400'
  }

  const scoreBg = (score: number) => {
    if (score >= 80) return 'bg-green-500'
    if (score >= 60) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  return (
    <div className="min-h-screen bg-[#030303]">

      {/* Navbar */}
      <nav className="border-b border-gray-800 px-8 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <span className="text-2xl font-black text-white tracking-tight">
            SEO<span className="text-orange-500">PIC</span>
          </span>
          <div className="flex items-center gap-4">
            {isAdmin && (
              <Link href="/admin" className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-semibold transition">
                Admin Panel
              </Link>
            )}
            <div className="flex items-center gap-3">
              {session?.user?.image && (
                <img src={session.user.image} alt="avatar" className="w-9 h-9 rounded-full border-2 border-orange-500" />
              )}
              <div className="text-right hidden md:block">
                <p className="text-white text-sm font-semibold">{session?.user?.name}</p>
                <p className="text-gray-400 text-xs">{session?.user?.email}</p>
              </div>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: '/auth/signin' })}
              className="border border-gray-700 hover:border-gray-500 text-gray-400 hover:text-white px-4 py-2 rounded-lg text-sm transition"
            >
              Déconnexion
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-8 py-10">

        {/* Onglets */}
        <div className="flex gap-2 mb-10 border-b border-gray-800 pb-4">
          <button
            onClick={() => setTab('seo')}
            className={`px-6 py-2.5 rounded-lg font-semibold text-sm transition ${
              tab === 'seo' ? 'bg-orange-500 text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            🔍 Analyse SEO Image
          </button>
          <button
            onClick={() => setTab('history')}
            className={`px-6 py-2.5 rounded-lg font-semibold text-sm transition ${
              tab === 'history' ? 'bg-orange-500 text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            📂 Historique
          </button>
          <button
            onClick={() => setTab('tickets')}
            className={`px-6 py-2.5 rounded-lg font-semibold text-sm transition flex items-center gap-2 ${
              tab === 'tickets' ? 'bg-orange-500 text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            🎫 Mes Tickets
            {tickets.filter(t => t.status !== 'Fermé').length > 0 && (
              <span className="bg-orange-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                {tickets.filter(t => t.status !== 'Fermé').length}
              </span>
            )}
          </button>
        </div>

        {/* ===== ONGLET HISTORIQUE ===== */}
        {tab === 'history' && (
          <div>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-white">Historique des analyses</h2>
              <p className="text-gray-400 text-sm mt-1">Vos 20 dernières analyses SEO</p>
            </div>
            {historyLoading ? (
              <div className="text-center py-10 text-gray-500">Chargement...</div>
            ) : history.length === 0 ? (
              <div className="bg-gray-900 border border-gray-800 rounded-2xl p-12 text-center">
                <p className="text-4xl mb-4">📂</p>
                <p className="text-white font-semibold">Aucune analyse pour l'instant</p>
                <p className="text-gray-500 text-sm mt-2">Analysez une image pour voir votre historique ici</p>
                <button
                  onClick={() => setTab('seo')}
                  className="mt-4 bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-lg font-semibold text-sm transition"
                >
                  Analyser une image
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {history.map((h) => {
                  const scoreColor = h.seo_score >= 80 ? 'text-green-400' : h.seo_score >= 60 ? 'text-yellow-400' : 'text-red-400'
                  return (
                    <div key={h.id} className="bg-gray-900 border border-gray-800 rounded-xl p-5 hover:border-gray-700 transition">
                      <div className="flex justify-between items-start gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2 flex-wrap">
                            <span className={`text-2xl font-black ${scoreColor}`}>{h.seo_score}</span>
                            <span className="text-gray-500 text-xs">/100</span>
                            {h.image_category && (
                              <span className="text-xs text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded-full">
                                {h.image_category}
                              </span>
                            )}
                          </div>
                          <p className="text-white font-semibold truncate">{h.meta_title || '—'}</p>
                          <p className="text-gray-400 text-sm truncate mt-0.5">{h.alt_text}</p>
                          {h.keywords?.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {h.keywords.slice(0, 4).map((kw, i) => (
                                <span key={i} className="text-xs text-gray-500 bg-gray-800 px-2 py-0.5 rounded-full">{kw}</span>
                              ))}
                              {h.keywords.length > 4 && (
                                <span className="text-xs text-gray-600">+{h.keywords.length - 4}</span>
                              )}
                            </div>
                          )}
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-gray-500 text-xs">{new Date(h.created_at).toLocaleDateString('fr-FR')}</p>
                          {h.image_name && (
                            <p className="text-gray-600 text-xs mt-0.5 max-w-[120px] truncate">{h.image_name}</p>
                          )}
                          {h.image_size && (
                            <p className="text-gray-700 text-xs">{(h.image_size / 1024).toFixed(0)} KB</p>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* ===== ONGLET TICKETS ===== */}
        {tab === 'tickets' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold text-white">Mes Tickets</h2>
                <p className="text-gray-400 text-sm mt-1">Suivez vos demandes et échangez avec l'équipe VALT</p>
              </div>
              <button
                onClick={() => setShowForm(!showForm)}
                className="bg-orange-500 hover:bg-orange-600 text-white px-5 py-2.5 rounded-lg font-semibold text-sm transition"
              >
                + Nouveau Ticket
              </button>
            </div>

            {/* Formulaire */}
            {showForm && (
              <div className="bg-gray-900 border border-orange-500/30 rounded-2xl p-6 mb-6">
                <h3 className="text-white font-bold mb-4">Nouveau Ticket</h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-gray-400 text-sm mb-1 block">Titre *</label>
                    <input
                      type="text"
                      value={form.title}
                      onChange={(e) => setForm({ ...form, title: e.target.value })}
                      placeholder="Ex: Problème avec l'analyse SEO"
                      className="w-full bg-gray-800 border border-gray-700 focus:border-orange-500 text-white placeholder-gray-500 rounded-xl px-4 py-3 text-sm outline-none transition"
                    />
                  </div>
                  <div>
                    <label className="text-gray-400 text-sm mb-1 block">Description *</label>
                    <textarea
                      rows={4}
                      value={form.description}
                      onChange={(e) => setForm({ ...form, description: e.target.value })}
                      placeholder="Décrivez votre problème ou demande en détail..."
                      className="w-full bg-gray-800 border border-gray-700 focus:border-orange-500 text-white placeholder-gray-500 rounded-xl px-4 py-3 text-sm outline-none transition resize-none"
                    />
                  </div>
                  <div>
                    <label className="text-gray-400 text-sm mb-1 block">Priorité</label>
                    <select
                      value={form.priority}
                      onChange={(e) => setForm({ ...form, priority: e.target.value })}
                      className="bg-gray-800 border border-gray-700 text-white px-4 py-3 rounded-xl text-sm"
                    >
                      <option>Haute</option>
                      <option>Moyenne</option>
                      <option>Basse</option>
                    </select>
                  </div>
                  <div className="flex gap-3 justify-end">
                    <button
                      onClick={() => setShowForm(false)}
                      className="border border-gray-700 text-gray-400 hover:text-white px-5 py-2 rounded-lg text-sm transition"
                    >
                      Annuler
                    </button>
                    <button
                      onClick={submitTicket}
                      disabled={!form.title.trim() || !form.description.trim() || submitting}
                      className="bg-orange-500 hover:bg-orange-600 disabled:opacity-40 text-white px-6 py-2 rounded-lg font-semibold text-sm transition"
                    >
                      {submitting ? 'Envoi...' : 'Envoyer le ticket'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Liste tickets */}
            {ticketsLoading ? (
              <div className="text-center py-10 text-gray-500">Chargement...</div>
            ) : tickets.length === 0 ? (
              <div className="bg-gray-900 border border-gray-800 rounded-2xl p-12 text-center">
                <p className="text-5xl mb-4">📭</p>
                <p className="text-white font-semibold">Aucun ticket pour l'instant</p>
                <p className="text-gray-500 text-sm mt-2">Créez votre premier ticket pour contacter l'équipe VALT</p>
              </div>
            ) : (
              <div className="space-y-3">
                {tickets.map(ticket => {
                  const statusStyle =
                    ticket.status === 'Ouvert' ? 'bg-red-500/20 text-red-400 border-red-500/30' :
                    ticket.status === 'En Cours' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' :
                    'bg-green-500/20 text-green-400 border-green-500/30'
                  return (
                    <div key={ticket.id} className="bg-gray-900 border border-gray-800 rounded-xl p-5 hover:border-gray-700 transition">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2 flex-wrap">
                            <span className={`text-xs px-2 py-0.5 rounded-full border ${statusStyle}`}>{ticket.status}</span>
                            <span className="text-xs text-gray-500 bg-gray-800 px-2 py-0.5 rounded-full">{ticket.priority}</span>
                            {ticket.replies.length > 0 && (
                              <span className="text-xs text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded-full">
                                {ticket.replies.length} réponse(s) VALT
                              </span>
                            )}
                          </div>
                          <h3 className="text-white font-semibold">{ticket.title}</h3>
                        </div>
                        <p className="text-gray-500 text-xs ml-4">
                          {new Date(ticket.created_at).toLocaleDateString('fr-FR')}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* ===== ONGLET SEO ===== */}
        {tab === 'seo' && (
        <div>
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-black text-white mb-3">
            Analyseur SEO <span className="text-orange-500">d'Images</span>
          </h1>
          <p className="text-gray-400 text-lg">
            Uploadez une image — notre IA génère automatiquement votre alt text, meta title, description et keywords
          </p>
        </div>

        {/* Upload Zone */}
        <div
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          onClick={() => !image && fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-10 text-center transition cursor-pointer mb-8 ${
            image ? 'border-orange-500 bg-orange-500/5' : 'border-gray-700 hover:border-orange-500 bg-gray-900/50'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
          />

          {image ? (
            <div>
              <img src={image} alt="preview" className="max-h-64 mx-auto rounded-xl mb-4 object-contain" />
              <p className="text-gray-400 text-sm mb-4">{imageFile?.name} — {((imageFile?.size || 0) / 1024).toFixed(0)} KB</p>
              <div className="flex justify-center gap-3">
                <button
                  onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click() }}
                  className="border border-gray-600 hover:border-gray-400 text-gray-300 px-4 py-2 rounded-lg text-sm transition"
                >
                  Changer l'image
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); analyze() }}
                  disabled={loading}
                  className="bg-orange-500 hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed text-white px-8 py-2 rounded-lg font-bold transition"
                >
                  {loading ? 'Analyse en cours...' : 'Analyser le SEO'}
                </button>
              </div>
            </div>
          ) : (
            <div>
              <div className="text-5xl mb-4">📸</div>
              <p className="text-white font-semibold text-lg mb-2">Glissez votre image ici</p>
              <p className="text-gray-400 mb-4">ou cliquez pour sélectionner</p>
              <p className="text-gray-600 text-sm">JPG, PNG, WEBP, GIF — max 5MB</p>
            </div>
          )}
        </div>

        {/* Loading */}
        {loading && (
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-10 text-center mb-8">
            <div className="animate-pulse">
              <div className="text-4xl mb-4">🤖</div>
              <p className="text-white font-semibold text-lg">Claude AI analyse votre image...</p>
              <p className="text-gray-400 mt-2">Génération des métadonnées SEO optimisées</p>
            </div>
            <div className="mt-6 bg-gray-800 rounded-full h-2 overflow-hidden">
              <div className="bg-orange-500 h-full rounded-full animate-pulse w-3/4"></div>
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-8 text-red-400 text-center">
            {error}
          </div>
        )}

        {/* Results */}
        {result && !loading && (
          <div className="space-y-6">

            {/* Score */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm mb-1">Score SEO</p>
                <p className={`text-7xl font-black ${scoreColor(result.seoScore)}`}>{result.seoScore}</p>
                <p className="text-gray-500 text-sm mt-1">/100</p>
              </div>
              <div className="text-right">
                <p className="text-gray-400 text-sm mb-1">Catégorie</p>
                <p className="text-white font-semibold">{result.imageCategory}</p>
                <p className="text-gray-500 text-sm mt-1">{result.tone}</p>
              </div>
              <div className="w-32 h-32 relative">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                  <circle cx="18" cy="18" r="15.9" fill="none" stroke="#1f2937" strokeWidth="3" />
                  <circle
                    cx="18" cy="18" r="15.9" fill="none"
                    stroke={result.seoScore >= 80 ? '#22c55e' : result.seoScore >= 60 ? '#eab308' : '#ef4444'}
                    strokeWidth="3"
                    strokeDasharray={`${result.seoScore} 100`}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className={`text-xl font-black ${scoreColor(result.seoScore)}`}>{result.seoScore}%</span>
                </div>
              </div>
            </div>

            {/* Contenu détecté */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
              <p className="text-gray-400 text-sm mb-2">Contenu détecté</p>
              <p className="text-white">{result.detectedContent}</p>
            </div>

            {/* Alt Text */}
            <ResultCard
              label="Alt Text suggéré"
              value={result.suggestedAltText}
              maxLen={125}
              onCopy={() => copyText(result.suggestedAltText, 'alt')}
              copied={copied === 'alt'}
            />

            {/* Meta Title */}
            <ResultCard
              label="Meta Title"
              value={result.metaTitle}
              maxLen={60}
              onCopy={() => copyText(result.metaTitle, 'title')}
              copied={copied === 'title'}
            />

            {/* Meta Description */}
            <ResultCard
              label="Meta Description"
              value={result.metaDescription}
              maxLen={160}
              onCopy={() => copyText(result.metaDescription, 'desc')}
              copied={copied === 'desc'}
            />

            {/* Keywords */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
              <div className="flex justify-between items-center mb-4">
                <p className="text-white font-semibold">Keywords SEO</p>
                <button
                  onClick={() => copyText(result.keywords.join(', '), 'kw')}
                  className="text-xs text-orange-400 hover:text-orange-300 border border-orange-500/30 px-3 py-1 rounded-lg transition"
                >
                  {copied === 'kw' ? '✓ Copié' : 'Copier tout'}
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {result.keywords.map((kw, i) => (
                  <span key={i} className="bg-orange-500/15 text-orange-400 border border-orange-500/30 px-3 py-1 rounded-full text-sm font-medium">
                    {kw}
                  </span>
                ))}
              </div>
            </div>

            {/* Améliorations */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
              <p className="text-white font-semibold mb-4">Améliorations recommandées</p>
              <div className="space-y-3">
                {result.improvements.map((imp, i) => (
                  <div key={i} className="flex gap-3">
                    <span className="text-orange-500 font-bold mt-0.5">→</span>
                    <p className="text-gray-300">{imp}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Nouvelle analyse */}
            <div className="text-center pt-4">
              <button
                onClick={() => { setImage(null); setImageFile(null); setResult(null) }}
                className="border border-gray-700 hover:border-orange-500 text-gray-300 hover:text-white px-8 py-3 rounded-xl font-semibold transition"
              >
                Analyser une nouvelle image
              </button>
            </div>
          </div>
        )}
        </div>
        )}
      </div>
    </div>
  )
}

function ResultCard({ label, value, maxLen, onCopy, copied }: {
  label: string
  value: string
  maxLen: number
  onCopy: () => void
  copied: boolean
}) {
  const len = value.length
  const pct = Math.round((len / maxLen) * 100)
  const barColor = pct > 100 ? 'bg-red-500' : pct > 80 ? 'bg-green-500' : 'bg-yellow-500'

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
      <div className="flex justify-between items-center mb-3">
        <p className="text-white font-semibold">{label}</p>
        <button
          onClick={onCopy}
          className="text-xs text-orange-400 hover:text-orange-300 border border-orange-500/30 px-3 py-1 rounded-lg transition"
        >
          {copied ? '✓ Copié' : 'Copier'}
        </button>
      </div>
      <p className="text-gray-200 mb-3">{value}</p>
      <div className="flex items-center gap-3">
        <div className="flex-1 bg-gray-800 rounded-full h-1.5">
          <div
            className={`h-full rounded-full transition-all ${barColor}`}
            style={{ width: `${Math.min(pct, 100)}%` }}
          />
        </div>
        <span className={`text-xs font-mono ${pct > 100 ? 'text-red-400' : 'text-gray-500'}`}>
          {len}/{maxLen}
        </span>
      </div>
    </div>
  )
}
