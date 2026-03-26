'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'

const ADMIN_EMAILS = (process.env.NEXT_PUBLIC_ADMIN_EMAILS || 'mustapha@wearevalt.co,ilyas@wearevalt.co').split(',')

interface Stats {
  openTickets: number
  totalTickets: number
  clients: number
  pendingReplies: number
}

export default function AdminDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [stats, setStats] = useState<Stats | null>(null)

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/auth/signin')
    if (status === 'authenticated' && !ADMIN_EMAILS.includes(session?.user?.email || '')) router.push('/dashboard')
  }, [status, session, router])

  useEffect(() => {
    if (status !== 'authenticated') return
    fetch('/api/tickets')
      .then(r => r.json())
      .then((tickets: { status: string; client_email: string; replies: unknown[] }[]) => {
        if (!Array.isArray(tickets)) return
        const open = tickets.filter(t => t.status === 'Ouvert').length
        const clients = new Set(tickets.map(t => t.client_email)).size
        const pending = tickets.filter(t => t.status === 'Ouvert' && t.replies.length === 0).length
        setStats({ openTickets: open, totalTickets: tickets.length, clients, pendingReplies: pending })
      })
      .catch(() => {})
  }, [status])

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-[#030303] flex items-center justify-center">
        <div className="text-white/40">Chargement...</div>
      </div>
    )
  }

  if (status !== 'authenticated' || !ADMIN_EMAILS.includes(session?.user?.email || '')) return null

  return (
    <div className="min-h-screen bg-[#030303]">

      {/* Navbar */}
      <nav className="border-b border-white/5 px-8 py-5">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div>
            <span className="text-2xl font-black tracking-tight">
              SEO<span className="text-orange-500">PIC</span>
            </span>
            <span className="ml-3 text-xs bg-orange-500/15 text-orange-400 border border-orange-500/20 px-2 py-0.5 rounded-full">
              Admin
            </span>
          </div>
          <Link href="/dashboard" className="text-white/40 hover:text-white text-sm transition">
            ← Espace client
          </Link>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-8 py-10">

        {/* Header */}
        <div className="mb-10">
          <h1 className="text-3xl font-black text-white">Dashboard Admin</h1>
          <p className="text-white/30 mt-1">Gestion de la plateforme SEOPIC · VALT Agency</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {[
            { label: 'Tickets ouverts', value: stats?.openTickets ?? '—', color: 'orange' },
            { label: 'Clients actifs', value: stats?.clients ?? '—', color: 'blue' },
            { label: 'Total tickets', value: stats?.totalTickets ?? '—', color: 'purple' },
            { label: 'Sans réponse', value: stats?.pendingReplies ?? '—', color: 'red' },
          ].map((s) => (
            <div
              key={s.label}
              className="bg-white/[0.03] border border-white/5 rounded-2xl p-6"
            >
              <p className="text-white/40 text-xs mb-2">{s.label}</p>
              <p className="text-3xl font-black text-white">{s.value}</p>
            </div>
          ))}
        </div>

        {/* Navigation */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
          {[
            {
              href: '/admin/tickets',
              icon: '🎫',
              title: 'Gestion des Tickets',
              desc: 'Voir, répondre et gérer tous les tickets clients',
              accent: 'group-hover:border-orange-500/30',
              badge: stats?.openTickets ? `${stats.openTickets} ouverts` : null,
            },
            {
              href: '/admin/clients',
              icon: '👥',
              title: 'Clients',
              desc: 'Liste des clients et leur historique',
              accent: 'group-hover:border-blue-500/20',
              badge: null,
            },
            {
              href: '/admin/team',
              icon: '⚡',
              title: "Équipe VALT",
              desc: 'Membres de l\'équipe et leurs rôles',
              accent: 'group-hover:border-green-500/20',
              badge: null,
            },
            {
              href: '/admin/messages',
              icon: '💬',
              title: 'Messages',
              desc: 'Notifications et messages reçus',
              accent: 'group-hover:border-purple-500/20',
              badge: null,
            },
          ].map((item) => (
            <Link key={item.href} href={item.href} className="group">
              <div className={`bg-white/[0.03] border border-white/5 rounded-2xl p-7 transition ${item.accent}`}>
                <div className="flex items-start justify-between">
                  <div className="text-2xl mb-3">{item.icon}</div>
                  {item.badge && (
                    <span className="text-xs bg-orange-500/15 text-orange-400 border border-orange-500/20 px-2 py-0.5 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </div>
                <h3 className="text-white font-bold mb-1">{item.title}</h3>
                <p className="text-white/30 text-sm">{item.desc}</p>
              </div>
            </Link>
          ))}
        </div>

        {/* Info VALT */}
        <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 flex items-center justify-between">
          <div>
            <p className="text-white/60 text-sm font-semibold">VALT Agency</p>
            <p className="text-white/30 text-xs mt-0.5">Tanger, Maroc · hello@wearevalt.co</p>
          </div>
          <p className="text-white/20 text-xs italic">Making You Visible</p>
        </div>
      </div>
    </div>
  )
}
