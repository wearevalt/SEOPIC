'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'

const ADMIN_EMAILS = (process.env.NEXT_PUBLIC_ADMIN_EMAILS || 'mustapha@wearevalt.co,ilyas@wearevalt.co').split(',')

interface Client {
  email: string
  name: string
  ticketCount: number
  lastActivity: string
}

export default function AdminClients() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/auth/signin')
    if (status === 'authenticated' && !ADMIN_EMAILS.includes(session?.user?.email || '')) router.push('/dashboard')
  }, [status, session, router])

  useEffect(() => {
    if (status !== 'authenticated') return
    fetch('/api/tickets')
      .then(r => r.json())
      .then((tickets: { client_email: string; client_name: string | null; created_at: string }[]) => {
        if (!Array.isArray(tickets)) return
        const map = new Map<string, Client>()
        tickets.forEach(t => {
          const existing = map.get(t.client_email)
          if (existing) {
            existing.ticketCount++
            if (t.created_at > existing.lastActivity) existing.lastActivity = t.created_at
          } else {
            map.set(t.client_email, {
              email: t.client_email,
              name: t.client_name || t.client_email.split('@')[0],
              ticketCount: 1,
              lastActivity: t.created_at,
            })
          }
        })
        setClients(Array.from(map.values()).sort((a, b) => b.ticketCount - a.ticketCount))
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [status])

  if (status === 'loading') return (
    <div className="min-h-screen bg-[#030303] flex items-center justify-center">
      <p className="text-white/40">Chargement...</p>
    </div>
  )

  if (status !== 'authenticated' || !ADMIN_EMAILS.includes(session?.user?.email || '')) return null

  return (
    <div className="min-h-screen bg-[#030303]">
      <nav className="border-b border-white/5 px-8 py-5">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Link href="/admin" className="text-white/30 hover:text-white text-sm transition">← Admin</Link>
            <span className="text-white/10">/</span>
            <span className="text-white font-semibold">Clients</span>
          </div>
          <span className="text-white/30 text-sm">{clients.length} client(s)</span>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-black text-white">Clients</h1>
          <p className="text-white/30 text-sm mt-1">Tous les clients ayant soumis au moins un ticket</p>
        </div>

        {loading ? (
          <p className="text-white/30 text-center py-12">Chargement...</p>
        ) : clients.length === 0 ? (
          <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-12 text-center">
            <p className="text-white/40">Aucun client pour l'instant</p>
          </div>
        ) : (
          <div className="space-y-3">
            {clients.map(c => (
              <div key={c.email} className="bg-white/[0.03] border border-white/5 rounded-xl p-5 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-orange-500/20 border border-orange-500/30 flex items-center justify-center text-orange-400 font-bold">
                    {c.name[0].toUpperCase()}
                  </div>
                  <div>
                    <p className="text-white font-semibold">{c.name}</p>
                    <p className="text-white/40 text-sm">{c.email}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-white font-bold">{c.ticketCount} ticket{c.ticketCount > 1 ? 's' : ''}</p>
                  <p className="text-white/30 text-xs mt-0.5">
                    Dernier : {new Date(c.lastActivity).toLocaleDateString('fr-FR')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
