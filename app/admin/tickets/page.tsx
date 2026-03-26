'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'

const ADMIN_EMAILS = (process.env.NEXT_PUBLIC_ADMIN_EMAILS || 'mustapha@wearevalt.co,ilyas@wearevalt.co').split(',')

interface Reply {
  id: string
  text: string
  from_role: 'admin' | 'client'
  author_name: string | null
  created_at: string
}

interface Ticket {
  id: string
  title: string
  description: string
  client_name: string | null
  client_email: string
  status: 'Ouvert' | 'En Cours' | 'Résolu' | 'Fermé'
  priority: 'Haute' | 'Moyenne' | 'Basse'
  created_at: string
  replies: Reply[]
}

export default function AdminTickets() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [selected, setSelected] = useState<Ticket | null>(null)
  const [reply, setReply] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('Tous')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/auth/signin')
    if (status === 'authenticated' && !ADMIN_EMAILS.includes(session?.user?.email || '')) router.push('/dashboard')
  }, [status, session, router])

  const fetchTickets = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/tickets')
      if (res.ok) {
        const data = await res.json()
        setTickets(data)
        if (selected) {
          const updated = data.find((t: Ticket) => t.id === selected.id)
          if (updated) setSelected(updated)
        }
      }
    } finally { setLoading(false) }
  }, [selected])

  useEffect(() => {
    if (status === 'authenticated') {
      fetchTickets()
      const interval = setInterval(fetchTickets, 15000)
      return () => clearInterval(interval)
    }
  }, [status, fetchTickets])

  const sendReply = async () => {
    if (!reply.trim() || !selected) return
    setSending(true)
    try {
      await fetch(`/api/tickets/${selected.id}/reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: reply, from_role: 'admin', author_name: session?.user?.name || 'Admin VALT' }),
      })
      setReply('')
      await fetchTickets()
    } finally { setSending(false) }
  }

  const updateStatus = async (id: string, newStatus: string) => {
    await fetch(`/api/tickets/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    })
    await fetchTickets()
  }

  if (status === 'loading') return (
    <div className="min-h-screen bg-[#030303] flex items-center justify-center">
      <p className="text-white/40">Chargement...</p>
    </div>
  )

  if (status !== 'authenticated' || !ADMIN_EMAILS.includes(session?.user?.email || '')) return null

  const filtered = filterStatus === 'Tous' ? tickets : tickets.filter(t => t.status === filterStatus)

  const statusStyle = (s: string) =>
    s === 'Ouvert'   ? 'bg-red-500/20 text-red-400 border-red-500/30' :
    s === 'En Cours' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' :
    s === 'Résolu'   ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' :
    'bg-green-500/20 text-green-400 border-green-500/30'

  return (
    <div className="min-h-screen bg-[#030303]">
      <nav className="border-b border-white/5 px-8 py-5">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Link href="/admin" className="text-white/30 hover:text-white text-sm transition">← Admin</Link>
            <span className="text-white/10">/</span>
            <span className="text-white font-semibold">Tickets</span>
          </div>
          <span className="text-white/30 text-sm">{tickets.length} ticket(s)</span>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-8 py-8 flex gap-6">

        {/* Liste */}
        <div className="w-80 shrink-0">
          {/* Filtres */}
          <div className="flex gap-1 mb-4 flex-wrap">
            {['Tous', 'Ouvert', 'En Cours', 'Résolu', 'Fermé'].map(f => (
              <button
                key={f}
                onClick={() => setFilterStatus(f)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                  filterStatus === f ? 'bg-orange-500 text-white' : 'bg-white/5 text-white/40 hover:text-white'
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          {loading ? (
            <p className="text-white/30 text-sm text-center py-8">Chargement...</p>
          ) : filtered.length === 0 ? (
            <p className="text-white/30 text-sm text-center py-8">Aucun ticket</p>
          ) : (
            <div className="space-y-2">
              {filtered.map(t => (
                <div
                  key={t.id}
                  onClick={() => setSelected(t)}
                  className={`p-4 rounded-xl border cursor-pointer transition ${
                    selected?.id === t.id
                      ? 'border-orange-500/40 bg-orange-500/5'
                      : 'border-white/5 bg-white/[0.02] hover:border-white/10'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className={`text-xs px-1.5 py-0.5 rounded-full border ${statusStyle(t.status)}`}>{t.status}</span>
                    {t.status === 'Ouvert' && t.replies.length === 0 && (
                      <span className="text-xs bg-orange-500 text-white px-1.5 py-0.5 rounded-full">Nouveau</span>
                    )}
                  </div>
                  <p className="text-white text-sm font-semibold truncate">{t.title}</p>
                  <p className="text-white/40 text-xs mt-0.5">{t.client_name || t.client_email}</p>
                  <p className="text-white/20 text-xs mt-1">{new Date(t.created_at).toLocaleDateString('fr-FR')}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Détail */}
        {selected ? (
          <div className="flex-1 bg-white/[0.02] border border-white/5 rounded-2xl flex flex-col overflow-hidden">
            {/* Header */}
            <div className="p-6 border-b border-white/5">
              <div className="flex justify-between items-start gap-4">
                <div>
                  <h2 className="text-white font-bold text-lg">{selected.title}</h2>
                  <p className="text-white/40 text-sm mt-0.5">{selected.client_name} · {selected.client_email}</p>
                </div>
                <select
                  value={selected.status}
                  onChange={(e) => updateStatus(selected.id, e.target.value)}
                  className="bg-white/5 border border-white/10 text-white text-sm px-3 py-1.5 rounded-lg"
                >
                  {['Ouvert', 'En Cours', 'Résolu', 'Fermé'].map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 max-h-[400px]">
              {/* Message initial */}
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold text-white shrink-0">
                  {(selected.client_name || selected.client_email)[0].toUpperCase()}
                </div>
                <div className="flex-1">
                  <p className="text-xs text-white/30 mb-1">{selected.client_name || 'Client'} · {new Date(selected.created_at).toLocaleString('fr-FR')}</p>
                  <div className="bg-white/5 rounded-xl p-4 text-white/80 text-sm">{selected.description}</div>
                </div>
              </div>

              {/* Réponses */}
              {selected.replies.map(r => (
                <div key={r.id} className={`flex gap-3 ${r.from_role === 'admin' ? 'flex-row-reverse' : ''}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                    r.from_role === 'admin' ? 'bg-orange-500 text-white' : 'bg-white/10 text-white'
                  }`}>
                    {r.from_role === 'admin' ? 'V' : (selected.client_name || 'C')[0].toUpperCase()}
                  </div>
                  <div className={`flex-1 ${r.from_role === 'admin' ? 'items-end' : ''}`}>
                    <p className={`text-xs text-white/30 mb-1 ${r.from_role === 'admin' ? 'text-right' : ''}`}>
                      {r.author_name || (r.from_role === 'admin' ? 'VALT' : 'Client')} · {new Date(r.created_at).toLocaleString('fr-FR')}
                    </p>
                    <div className={`rounded-xl p-4 text-sm ${
                      r.from_role === 'admin' ? 'bg-orange-500/15 text-orange-100' : 'bg-white/5 text-white/80'
                    }`}>
                      {r.text}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Zone réponse */}
            {selected.status !== 'Fermé' && (
              <div className="p-6 border-t border-white/5">
                <textarea
                  rows={3}
                  value={reply}
                  onChange={e => setReply(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && e.ctrlKey) sendReply() }}
                  placeholder="Répondre au client... (Ctrl+Entrée pour envoyer)"
                  className="w-full bg-white/5 border border-white/10 focus:border-orange-500/40 text-white placeholder-white/20 rounded-xl px-4 py-3 text-sm outline-none transition resize-none mb-3"
                />
                <div className="flex justify-between items-center">
                  <button
                    onClick={() => updateStatus(selected.id, 'Fermé')}
                    className="text-xs text-white/30 hover:text-white/60 transition"
                  >
                    Fermer le ticket
                  </button>
                  <button
                    onClick={sendReply}
                    disabled={!reply.trim() || sending}
                    className="bg-orange-500 hover:bg-orange-600 disabled:opacity-40 text-white px-5 py-2 rounded-lg font-semibold text-sm transition"
                  >
                    {sending ? 'Envoi...' : 'Envoyer'}
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-white/20">Sélectionnez un ticket</p>
          </div>
        )}
      </div>
    </div>
  )
}
