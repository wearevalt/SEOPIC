'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'

const ADMIN_EMAILS = (process.env.NEXT_PUBLIC_ADMIN_EMAILS || 'mustapha@wearevalt.co,ilyas@wearevalt.co').split(',')

interface TicketMessage {
  id: string
  title: string
  client_name: string | null
  client_email: string
  created_at: string
  status: string
  replies: { id: string }[]
}

export default function AdminMessages() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [messages, setMessages] = useState<TicketMessage[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/auth/signin')
    if (status === 'authenticated' && !ADMIN_EMAILS.includes(session?.user?.email || '')) router.push('/dashboard')
  }, [status, session, router])

  useEffect(() => {
    if (status !== 'authenticated') return
    fetch('/api/tickets')
      .then(r => r.json())
      .then((data) => { if (Array.isArray(data)) setMessages(data.filter((t: TicketMessage) => t.replies.length === 0 && t.status === 'Ouvert')) })
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
            <span className="text-white font-semibold">Messages</span>
          </div>
          {messages.length > 0 && (
            <span className="text-xs bg-orange-500 text-white px-2 py-0.5 rounded-full">{messages.length} sans réponse</span>
          )}
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-black text-white">Messages sans réponse</h1>
          <p className="text-white/30 text-sm mt-1">Tickets ouverts en attente de votre réponse</p>
        </div>

        {loading ? (
          <p className="text-white/30 text-center py-12">Chargement...</p>
        ) : messages.length === 0 ? (
          <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-12 text-center">
            <p className="text-3xl mb-3">✅</p>
            <p className="text-white font-semibold">Tous les messages ont une réponse</p>
            <p className="text-white/30 text-sm mt-1">Aucun ticket en attente</p>
          </div>
        ) : (
          <div className="space-y-3">
            {messages.map(m => (
              <Link key={m.id} href="/admin/tickets">
                <div className="bg-white/[0.03] border border-orange-500/20 rounded-xl p-5 hover:border-orange-500/40 transition cursor-pointer">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs bg-orange-500 text-white px-2 py-0.5 rounded-full">Nouveau</span>
                      </div>
                      <p className="text-white font-semibold">{m.title}</p>
                      <p className="text-white/40 text-sm mt-0.5">{m.client_name || m.client_email}</p>
                    </div>
                    <p className="text-white/30 text-xs shrink-0">{new Date(m.created_at).toLocaleDateString('fr-FR')}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
