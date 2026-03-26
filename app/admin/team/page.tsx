'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import Link from 'next/link'

const ADMIN_EMAILS = (process.env.NEXT_PUBLIC_ADMIN_EMAILS || 'mustapha@wearevalt.co,ilyas@wearevalt.co').split(',')

const TEAM = [
  { name: 'Mustapha', role: 'Strategist & Founder', email: 'mustapha@wearevalt.co', initials: 'M' },
  { name: 'Ilyas', role: 'Creative Director & Founder', email: 'ilyas@wearevalt.co', initials: 'I' },
]

export default function AdminTeam() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/auth/signin')
    if (status === 'authenticated' && !ADMIN_EMAILS.includes(session?.user?.email || '')) router.push('/dashboard')
  }, [status, session, router])

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
            <span className="text-white font-semibold">Équipe</span>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-black text-white">Équipe VALT</h1>
          <p className="text-white/30 text-sm mt-1">Tanger, Maroc · Making You Visible</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {TEAM.map(m => (
            <div key={m.email} className="bg-white/[0.03] border border-white/5 rounded-2xl p-6 flex items-center gap-5">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center text-white text-xl font-black shrink-0">
                {m.initials}
              </div>
              <div>
                <p className="text-white font-bold text-lg">{m.name}</p>
                <p className="text-orange-400 text-sm">{m.role}</p>
                <p className="text-white/30 text-sm mt-0.5">{m.email}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 bg-white/[0.02] border border-white/5 rounded-2xl p-6">
          <p className="text-white/60 font-semibold mb-1">VALT Agency</p>
          <p className="text-white/30 text-sm">hello@wearevalt.co · Tanger, Maroc</p>
          <p className="text-white/20 text-xs mt-2 italic">"Making You Visible / We Forge Empires"</p>
        </div>
      </div>
    </div>
  )
}
