'use client'

import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState, useCallback } from 'react'
import Link from 'next/link'

const ADMIN_EMAILS = (process.env.NEXT_PUBLIC_ADMIN_EMAILS || '').split(',')

/* ── Types ── */
interface Ticket {
  id: string; title: string; description: string
  status: 'Ouvert' | 'En Cours' | 'Fermé'; priority: 'Haute' | 'Moyenne' | 'Basse'
  created_at: string; replies: { id: string }[]
}
interface SeoResult {
  detectedContent: string; suggestedAltText: string; metaTitle: string
  metaDescription: string; keywords: string[]; seoScore: number
  improvements: string[]; imageCategory: string; tone: string
}
interface AnalysisHistory {
  id: string; image_name: string | null; image_size: number | null
  seo_score: number; alt_text: string; meta_title: string
  keywords: string[]; image_category: string; created_at: string
}

type Section = 'analyser' | 'analyser-site' | 'historique' | 'tickets' | 'quiz' | 'academy' | 'communaute' | 'accueil' | 'parametres'
type Mode = 'dark' | 'light'

/* ── Theme ── */
const TH = {
  dark:  { bg:'#1A1A18', bgA:'#1E1E1C', sf:'#242422', sfH:'#2A2A28', bd:'#333331', tx:'#F5F5F0', txS:'#A8A89E', txM:'#6B6B63', card:'rgba(255,255,255,.03)', glow:'#E76F2E' },
  light: { bg:'#F5F5F0', bgA:'#EEEEE9', sf:'#FFFFFF', sfH:'#F0F0EB', bd:'#E0E0D8', tx:'#1A1A18', txS:'#6B6B63', txM:'#A8A89E', card:'rgba(0,0,0,.02)', glow:'#E76F2E' },
}

/* ── Sidebar nav items ── */
const NAV_WORKSPACE = [
  { id:'analyser',      icon:IconScan,     label:'Analyser image' },
  { id:'analyser-site', icon:IconGlobe,    label:'Analyser un site' },
  { id:'historique',    icon:IconHistory,  label:'Historique' },
  { id:'tickets',       icon:IconTicket,   label:'Mes Tickets' },
  { id:'quiz',          icon:IconQuiz,     label:'Quiz SEO' },
  { id:'parametres',    icon:IconSettings, label:'Paramètres' },
]
const NAV_PLATFORM = [
  { id:'academy',    icon:IconAcademy, label:'Academy' },
  { id:'communaute', icon:IconUsers,   label:'Communauté' },
]

/* ── SVG Icons ── */
function IconScan()     { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7V5a2 2 0 0 1 2-2h2"/><path d="M17 3h2a2 2 0 0 1 2 2v2"/><path d="M21 17v2a2 2 0 0 1-2 2h-2"/><path d="M7 21H5a2 2 0 0 1-2-2v-2"/><circle cx="12" cy="12" r="3"/><path d="M12 5v2m0 10v2M5 12h2m10 0h2"/></svg> }
function IconHistory()  { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9"/><polyline points="12 7 12 12 15 15"/></svg> }
function IconTicket()   { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M2 9a3 3 0 1 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2z"/></svg> }
function IconSettings() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"/></svg> }
function IconAcademy()  { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg> }
function IconBuilding() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="18" rx="1"/><path d="M8 21V8M16 21V8M2 12h20M2 16h6M16 16h6"/></svg> }
function IconUsers()    { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg> }
function IconHome()     { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg> }
function IconCopy()     { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg> }
function IconCheck()    { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#4ADE80" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg> }
function IconDownload() { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg> }
function IconSparkle()  { return <svg width="12" height="12" viewBox="0 0 24 24" fill="#E76F2E" stroke="none"><path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z"/></svg> }
function IconRefresh()  { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 4v6h-6"/><path d="M1 20v-6h6"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg> }
function IconSun()      { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32l1.41 1.41M2 12h2m16 0h2M4.93 19.07l1.41-1.41M18.36 5.64l1.41-1.41"/></svg> }
function IconMoon()     { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg> }
function IconUpload()   { return <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg> }
function IconEdit()     { return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg> }
function IconInject()   { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg> }
function IconGlobe()    { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg> }
function IconQuiz()     { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/><circle cx="12" cy="12" r="10"/></svg> }
function IconPlay()     { return <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="none"><polygon points="5 3 19 12 5 21 5 3"/></svg> }
function IconComment()  { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg> }
function IconClose()    { return <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg> }
function IconPlus()     { return <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg> }

/* ══════════════════════════════════════════ MAIN ══════════════════════════════════════════ */
export default function Dashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [mode, setMode] = useState<Mode>('dark')
  const [section, setSection] = useState<Section>('analyser')
  const [sidebarOpen, setSidebarOpen] = useState(true)

  /* SEO tool */
  const [image, setImage]       = useState<string | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [loading, setLoading]   = useState(false)
  const [step, setStep]         = useState<'upload' | 'analyzing' | 'result'>('upload')
  const [result, setResult]     = useState<SeoResult | null>(null)
  const [error, setError]       = useState<string | null>(null)
  const [copied, setCopied]     = useState<string | null>(null)
  const [dragOver, setDragOver] = useState(false)

  /* Editable fields */
  const [editAlt,   setEditAlt]   = useState('')
  const [editTitle, setEditTitle] = useState('')
  const [editDesc,  setEditDesc]  = useState('')
  const [editKws,   setEditKws]   = useState<string[]>([])
  const [editedFields, setEditedFields] = useState<Set<string>>(new Set())
  const [injected, setInjected]         = useState(false)
  const [injecting, setInjecting]       = useState(false)
  const [injectedImage, setInjectedImage] = useState<string | null>(null)
  const [injectError, setInjectError]   = useState<string | null>(null)

  /* History */
  const [history, setHistory]           = useState<AnalysisHistory[]>([])
  const [historyLoading, setHistoryLoading] = useState(false)

  /* Tickets */
  const [tickets, setTickets]         = useState<Ticket[]>([])
  const [ticketsLoading, setTicketsLoading] = useState(false)
  const [showForm, setShowForm]       = useState(false)
  const [form, setForm]               = useState({ title: '', description: '', priority: 'Moyenne' })
  const [submitting, setSubmitting]   = useState(false)
  const [ticketError, setTicketError] = useState<string | null>(null)
  const [ticketSuccess, setTicketSuccess] = useState(false)

  /* Scan progress */
  const [scanProgress, setScanProgress] = useState(0)

  /* Keywords editing */
  const [kwInput, setKwInput] = useState('')

  /* Quiz */
  const [quizIndex, setQuizIndex]     = useState(0)
  const [quizAnswer, setQuizAnswer]   = useState<number | null>(null)
  const [quizScore, setQuizScore]     = useState(0)
  const [quizDone, setQuizDone]       = useState(false)

  /* Academy */
  const [activeVideo, setActiveVideo] = useState(0)
  const [newComment, setNewComment]   = useState('')
  const [videoComments, setVideoComments] = useState<Record<number,{author:string,text:string,time:string}[]>>({
    0: [{ author:'Karim B.', text:'Formation très claire, merci !', time:'il y a 2j' }],
    1: [{ author:'Sophie L.', text:'Le module Alt Text est excellent.', time:'il y a 5j' }],
  })

  const t = TH[mode]
  const dk = mode === 'dark'

  useEffect(() => { if (status === 'unauthenticated') router.push('/auth/signin') }, [status, router])

  /* Sync editable fields when result changes */
  useEffect(() => {
    if (result) {
      setEditAlt(result.suggestedAltText)
      setEditTitle(result.metaTitle)
      setEditDesc(result.metaDescription)
      setEditKws([...result.keywords])
      setEditedFields(new Set())
      setInjected(false)
      setInjectedImage(null)
      setInjectError(null)
    }
  }, [result])

  /* Fake progress bar during analysis */
  useEffect(() => {
    if (!loading) { setScanProgress(0); return }
    setScanProgress(0)
    const t1 = setTimeout(() => setScanProgress(30), 400)
    const t2 = setTimeout(() => setScanProgress(65), 1200)
    const t3 = setTimeout(() => setScanProgress(88), 2500)
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3) }
  }, [loading])

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
    if (section === 'tickets'    && status === 'authenticated') fetchTickets()
    if (section === 'historique' && status === 'authenticated') fetchHistory()
  }, [section, status, fetchTickets, fetchHistory])

  const submitTicket = async () => {
    if (!form.title.trim() || !form.description.trim()) return
    setSubmitting(true); setTicketError(null); setTicketSuccess(false)
    try {
      const res = await fetch('/api/tickets', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: form.title.trim(), description: form.description.trim(), priority: form.priority, client_name: session?.user?.name || 'Client', client_email: session?.user?.email || '' }),
      })
      const data = await res.json()
      if (res.ok) {
        setForm({ title: '', description: '', priority: 'Moyenne' })
        setShowForm(false)
        setTicketSuccess(true)
        setTimeout(() => setTicketSuccess(false), 4000)
        await fetchTickets()
      } else {
        setTicketError(data?.error || 'Erreur lors de la création du ticket.')
      }
    } catch {
      setTicketError('Connexion impossible. Vérifiez votre réseau.')
    } finally { setSubmitting(false) }
  }

  if (status === 'loading') return (
    <div style={{ minHeight:'100vh', background:'#1A1A18', display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:16 }}>
        <div style={{ width:40, height:40, borderRadius:10, background:'linear-gradient(135deg,#E76F2E,#C4581E)', display:'flex', alignItems:'center', justifyContent:'center', animation:'spin 1s linear infinite' }}>
          <svg viewBox="0 0 20 20" fill="none" width="20" height="20"><path d="M4 14L8 9L11 12L16 6" stroke="white" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round"/><path d="M13 6H16V9" stroke="white" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </div>
        <p style={{ color:'rgba(255,255,255,.4)', fontSize:13 }}>Chargement...</p>
      </div>
    </div>
  )
  if (status === 'unauthenticated') return null

  const isAdmin = ADMIN_EMAILS.includes(session?.user?.email || '')

  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) { setError('Fichier non valide. Utilisez JPG, PNG, WEBP ou GIF.'); return }
    if (file.size > 5 * 1024 * 1024)    { setError('Image trop grande. Maximum 5MB.'); return }
    setError(null); setResult(null); setImageFile(file); setStep('upload')
    const reader = new FileReader()
    reader.onload = e => setImage(e.target?.result as string)
    reader.readAsDataURL(file)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); setDragOver(false)
    const file = e.dataTransfer.files[0]; if (file) handleFile(file)
  }

  const analyze = async () => {
    if (!imageFile || !image) return
    setLoading(true); setError(null); setStep('analyzing')
    try {
      const base64 = image.split(',')[1]
      const res = await fetch('/api/analyze', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: base64, mimeType: imageFile.type, imageName: imageFile.name, imageSize: imageFile.size }),
      })
      if (!res.ok) throw new Error()
      const data = await res.json()
      setResult(data); setStep('result')
    } catch {
      setError("Analyse échouée. Vérifiez votre connexion et réessayez."); setStep('upload')
    } finally { setLoading(false) }
  }

  const copyText = (text: string, key: string) => {
    navigator.clipboard.writeText(text); setCopied(key)
    setTimeout(() => setCopied(null), 2000)
  }

  const markEdited = (field: string) => setEditedFields(prev => new Set(prev).add(field))

  const resetTool = () => { setImage(null); setImageFile(null); setResult(null); setStep('upload'); setError(null) }

  /* Real metadata injection via server API */
  const injectMetadata = async () => {
    if (!image || !imageFile || injecting) return
    setInjecting(true); setInjectError(null)
    try {
      // Get image as base64 (strip data URL prefix)
      const base64 = image.split(',')[1]
      // Determine output mime type: always send as JPEG for canvas export compatibility
      const mime = imageFile.type === 'image/webp' ? 'image/webp' : 'image/jpeg'
      const res = await fetch('/api/inject', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: base64,
          mimeType: mime,
          altText: editAlt,
          metaTitle: editTitle,
          metaDescription: editDesc,
          keywords: editKws,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Injection échouée')
      // Store the injected image (base64) for download
      const prefix = mime === 'image/webp' ? 'data:image/webp;base64,' : 'data:image/jpeg;base64,'
      setInjectedImage(prefix + data.imageBase64)
      setInjected(true)
    } catch (err) {
      setInjectError(err instanceof Error ? err.message : 'Erreur lors de l\'injection')
    } finally { setInjecting(false) }
  }

  const makeSlug = () =>
    (editTitle.toLowerCase()
      .replace(/[àâä]/g,'a').replace(/[éèêë]/g,'e').replace(/[ùûü]/g,'u')
      .replace(/[îï]/g,'i').replace(/[ôö]/g,'o').replace(/ç/g,'c')
      .replace(/\s+/g,'-').replace(/[^a-z0-9-]/g,'').slice(0,40)) || 'image-optimisee'

  /* Download the already-injected image, optionally converting format */
  const downloadImage = (format: 'jpeg' | 'webp') => {
    if (!injectedImage || !injected) return
    const slug  = makeSlug()
    const fname = `${slug}-seo.${format === 'jpeg' ? 'jpg' : 'webp'}`
    const srcMime = injectedImage.startsWith('data:image/webp') ? 'image/webp' : 'image/jpeg'

    if (srcMime === `image/${format}`) {
      // Same format — download directly (metadata preserved)
      const a = document.createElement('a')
      a.style.display = 'none'
      a.href = injectedImage
      a.download = fname
      document.body.appendChild(a); a.click()
      setTimeout(() => document.body.removeChild(a), 500)
    } else {
      // Convert via canvas (WebP↔JPEG) — metadata stays in file header
      const img = new window.Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        canvas.width = img.naturalWidth || img.width
        canvas.height = img.naturalHeight || img.height
        const ctx = canvas.getContext('2d')
        if (!ctx) return
        ctx.drawImage(img, 0, 0)
        canvas.toBlob(blob => {
          if (!blob) return
          const url = URL.createObjectURL(blob)
          const a = document.createElement('a')
          a.style.display = 'none'; a.href = url; a.download = fname
          document.body.appendChild(a); a.click()
          setTimeout(() => { document.body.removeChild(a); URL.revokeObjectURL(url) }, 1000)
        }, `image/${format}`, 0.92)
      }
      img.src = injectedImage
    }
  }

  const scoreGrade = (s: number) => s >= 80 ? { color:'#4ADE80', label:'Excellent', bg:'rgba(74,222,128,.12)', bar:'#4ADE80' }
    : s >= 60 ? { color:'#FACC15', label:'Correct', bg:'rgba(250,204,21,.12)', bar:'#FACC15' }
    : { color:'#F87171', label:'À améliorer', bg:'rgba(248,113,113,.12)', bar:'#F87171' }

  const openTickets = tickets.filter(tk => tk.status !== 'Fermé').length

  /* ──────────────────────────────────── RENDER ──────────────────────────────────── */
  return (
    <div style={{ display:'flex', minHeight:'100vh', background:t.bg, color:t.tx, fontFamily:"'Outfit',system-ui,sans-serif", transition:'background .3s,color .3s' }}>
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet"/>
      <style>{`
        *{box-sizing:border-box}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes scanLine{0%{top:0;opacity:0}5%{opacity:1}95%{opacity:1}100%{top:100%;opacity:0}}
        @keyframes pulse{0%,100%{opacity:.5}50%{opacity:1}}
        @keyframes shimmer{0%{transform:translateX(-100%)}100%{transform:translateX(100%)}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
        @keyframes glow{0%,100%{box-shadow:0 0 20px #E76F2E15}50%{box-shadow:0 0 40px #E76F2E35}}
        @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}
        .nav-item{transition:all .2s cubic-bezier(.16,1,.3,1);border-radius:10px;cursor:pointer;user-select:none}
        .nav-item:hover{background:rgba(231,111,46,.08)!important;color:#E76F2E!important}
        .nav-item.active{background:rgba(231,111,46,.14)!important;color:#E76F2E!important}
        .btn-primary{transition:all .25s;cursor:pointer}
        .btn-primary:hover{transform:translateY(-1px);box-shadow:0 6px 20px #E76F2E30!important}
        .btn-ghost{transition:all .2s;cursor:pointer}
        .btn-ghost:hover{border-color:#E76F2E!important;color:#E76F2E!important}
        .card-enter{animation:fadeUp .4s cubic-bezier(.16,1,.3,1) both}
        .field-card{transition:border-color .2s,box-shadow .2s}
        .field-card:focus-within{border-color:#E76F2E50!important;box-shadow:0 0 0 3px #E76F2E08!important}
        .copy-btn{transition:all .2s;opacity:.5}
        .copy-btn:hover{opacity:1}
        .kw-tag{transition:all .15s;cursor:pointer}
        .kw-tag:hover{background:#E76F2E20!important;border-color:#E76F2E50!important}
        .scan-bar{position:absolute;left:0;right:0;height:2px;background:linear-gradient(90deg,transparent,#E76F2E,transparent);animation:scanLine 1.8s ease-in-out infinite}
        .shimmer{position:relative;overflow:hidden}
        .shimmer::after{content:'';position:absolute;inset:0;background:linear-gradient(90deg,transparent,rgba(231,111,46,.06),transparent);animation:shimmer 2s ease-in-out infinite}
        .score-ring{filter:drop-shadow(0 0 12px currentColor)}
        .upload-zone{animation:glow 3s infinite}
        ::-webkit-scrollbar{width:4px}::-webkit-scrollbar-track{background:transparent}::-webkit-scrollbar-thumb{background:rgba(231,111,46,.2);border-radius:4px}
        input,textarea,select{color:inherit;font-family:inherit}
        textarea{resize:vertical}
      `}</style>

      {/* ═══════════════════ SIDEBAR ═══════════════════ */}
      <aside style={{ width: sidebarOpen ? 240 : 64, flexShrink:0, background:t.bgA, borderRight:`1px solid ${t.bd}`, display:'flex', flexDirection:'column', position:'sticky', top:0, height:'100vh', transition:'width .3s cubic-bezier(.16,1,.3,1)', overflow:'hidden' }}>

        {/* Logo */}
        <div style={{ padding:'16px 12px', borderBottom:`1px solid ${t.bd}`, display:'flex', alignItems:'center', justifyContent: sidebarOpen ? 'space-between' : 'center', gap:8, minHeight:58 }}>
          {sidebarOpen && (
            <div style={{ display:'flex', alignItems:'center', gap:9, overflow:'hidden', flex:1, minWidth:0 }}>
              <div style={{ width:30, height:30, background:'linear-gradient(135deg,#E76F2E,#C4581E)', borderRadius:8, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, boxShadow:'0 0 12px #E76F2E30' }}>
                <svg viewBox="0 0 20 20" fill="none" width="15" height="15"><path d="M4 14L8 9L11 12L16 6" stroke="white" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round"/><path d="M13 6H16V9" stroke="white" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </div>
              <span style={{ fontWeight:800, fontSize:15, letterSpacing:-0.3, whiteSpace:'nowrap' }}>SEOPIC</span>
            </div>
          )}
          <button onClick={() => setSidebarOpen(!sidebarOpen)} style={{ background:'none', border:'none', cursor:'pointer', color:t.txM, padding:4, borderRadius:7, flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center' }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              {sidebarOpen ? <><path d="M18 6L6 18M6 6l12 12"/></> : <><path d="M3 12h18M3 6h18M3 18h18"/></>}
            </svg>
          </button>
        </div>

        {/* Plan card */}
        {sidebarOpen && (
          <div style={{ margin:'12px 12px 4px', background:'linear-gradient(135deg,rgba(231,111,46,.12),rgba(231,111,46,.04))', border:'1px solid rgba(231,111,46,.2)', borderRadius:12, padding:'12px 14px' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
              <span style={{ fontSize:10, fontWeight:700, color:'#E76F2E', textTransform:'uppercase', letterSpacing:1 }}>Découverte</span>
              <span style={{ fontSize:10, color:t.txM }}>5 restants</span>
            </div>
            <div style={{ background:t.bd, borderRadius:4, height:4, overflow:'hidden' }}>
              <div style={{ width:'100%', height:'100%', background:'linear-gradient(90deg,#E76F2E,#F2994A)', borderRadius:4 }}/>
            </div>
            <p style={{ fontSize:10, color:t.txM, marginTop:6 }}>5 / 5 analyses utilisées</p>
          </div>
        )}

        {/* Nav: Workspace */}
        <div style={{ flex:1, overflowY:'auto', padding:'8px 8px 0' }}>
          {sidebarOpen && <p style={{ fontSize:9, fontWeight:700, color:t.txM, textTransform:'uppercase', letterSpacing:1.5, padding:'12px 10px 6px' }}>Workspace</p>}
          {NAV_WORKSPACE.map(item => {
            const active = section === item.id
            const badge = item.id === 'tickets' && openTickets > 0 ? openTickets : null
            return (
              <div key={item.id} onClick={() => setSection(item.id as Section)} className={`nav-item${active ? ' active' : ''}`} style={{ display:'flex', alignItems:'center', gap:10, padding:sidebarOpen ? '9px 12px' : '9px', color: active ? '#E76F2E' : t.txS, marginBottom:2, justifyContent: sidebarOpen ? 'flex-start' : 'center' }}>
                <item.icon/>
                {sidebarOpen && <span style={{ fontSize:13, fontWeight:500, flex:1 }}>{item.label}</span>}
                {sidebarOpen && badge && <span style={{ background:'#E76F2E', color:'#fff', fontSize:9, fontWeight:700, padding:'1px 5px', borderRadius:6 }}>{badge}</span>}
              </div>
            )
          })}

          {sidebarOpen && <p style={{ fontSize:9, fontWeight:700, color:t.txM, textTransform:'uppercase', letterSpacing:1.5, padding:'16px 10px 6px' }}>Plateforme</p>}
          {!sidebarOpen && <div style={{ height:1, background:t.bd, margin:'8px 4px' }}/>}
          {NAV_PLATFORM.map(item => {
            const active = section === item.id
            return (
              <div key={item.id} onClick={() => setSection(item.id as Section)} className={`nav-item${active ? ' active' : ''}`} style={{ display:'flex', alignItems:'center', gap:10, padding:sidebarOpen ? '9px 12px' : '9px', color: active ? '#E76F2E' : t.txS, marginBottom:2, justifyContent: sidebarOpen ? 'flex-start' : 'center' }}>
                <item.icon/>
                {sidebarOpen && <span style={{ fontSize:13, fontWeight:500 }}>{item.label}</span>}
                {item.id === 'communaute' && sidebarOpen && <span style={{ fontSize:9, background:t.bd, color:t.txM, padding:'1px 5px', borderRadius:5, marginLeft:'auto' }}>Bientôt</span>}
              </div>
            )
          })}
        </div>

        {/* Bottom */}
        <div style={{ padding:'8px 8px 16px', borderTop:`1px solid ${t.bd}` }}>
          {/* Accueil */}
          <Link href="/" style={{ textDecoration:'none' }}>
            <div className="nav-item" style={{ display:'flex', alignItems:'center', gap:10, padding:sidebarOpen ? '9px 12px' : '9px', color:t.txS, marginBottom:4, justifyContent: sidebarOpen ? 'flex-start' : 'center' }}>
              <IconHome/>
              {sidebarOpen && <span style={{ fontSize:13, fontWeight:500 }}>Accueil</span>}
            </div>
          </Link>

          {/* Theme toggle */}
          <div onClick={() => setMode(dk ? 'light' : 'dark')} className="nav-item" style={{ display:'flex', alignItems:'center', gap:10, padding:sidebarOpen ? '9px 12px' : '9px', color:t.txS, marginBottom:4, cursor:'pointer', justifyContent: sidebarOpen ? 'flex-start' : 'center' }}>
            {dk ? <IconSun/> : <IconMoon/>}
            {sidebarOpen && <span style={{ fontSize:13, fontWeight:500 }}>{dk ? 'Mode clair' : 'Mode sombre'}</span>}
          </div>

          {/* User */}
          {sidebarOpen ? (
            <div style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 12px', background:t.card, border:`1px solid ${t.bd}`, borderRadius:10 }}>
              {session?.user?.image
                ? <img src={session.user.image} alt="" style={{ width:28, height:28, borderRadius:'50%', border:'2px solid #E76F2E', flexShrink:0 }}/>
                : <div style={{ width:28, height:28, borderRadius:'50%', background:'linear-gradient(135deg,#E76F2E,#C4581E)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:700, color:'#fff', flexShrink:0 }}>{(session?.user?.name || 'U')[0]}</div>
              }
              <div style={{ flex:1, minWidth:0 }}>
                <p style={{ fontSize:12, fontWeight:600, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{session?.user?.name}</p>
                <p style={{ fontSize:10, color:t.txM, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{session?.user?.email}</p>
              </div>
              <button onClick={() => signOut({ callbackUrl:'/auth/signin' })} style={{ background:'none', border:'none', cursor:'pointer', color:t.txM, padding:2 }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
              </button>
            </div>
          ) : (
            <div style={{ display:'flex', justifyContent:'center', padding:'4px 0' }}>
              {session?.user?.image
                ? <img src={session.user.image} alt="" style={{ width:28, height:28, borderRadius:'50%', border:'2px solid #E76F2E' }}/>
                : <div style={{ width:28, height:28, borderRadius:'50%', background:'linear-gradient(135deg,#E76F2E,#C4581E)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:700, color:'#fff' }}>{(session?.user?.name || 'U')[0]}</div>
              }
            </div>
          )}
        </div>
      </aside>

      {/* ═══════════════════ MAIN ═══════════════════ */}
      <main style={{ flex:1, display:'flex', flexDirection:'column', minWidth:0, overflow:'auto' }}>

        {/* Top header */}
        <header style={{ padding:'18px 28px', borderBottom:`1px solid ${t.bd}`, display:'flex', alignItems:'center', justifyContent:'space-between', gap:16, background:t.bgA, position:'sticky', top:0, zIndex:100, backdropFilter:'blur(12px)' }}>
          <div>
            <h1 style={{ fontSize:18, fontWeight:700, letterSpacing:-0.3 }}>
              {section === 'analyser'      && 'Analyser une image'}
              {section === 'analyser-site' && 'Analyser un site'}
              {section === 'historique'    && 'Historique'}
              {section === 'tickets'       && 'Mes Tickets'}
              {section === 'quiz'          && 'Quiz SEO'}
              {section === 'academy'       && 'Academy'}
              {section === 'communaute'    && 'Communauté'}
              {section === 'accueil'       && 'Accueil'}
              {section === 'parametres'    && 'Paramètres'}
            </h1>
            <p style={{ fontSize:12, color:t.txM, marginTop:2 }}>
              {section === 'analyser'      && 'Uploadez une image · SeoPic génère vos métadonnées SEO'}
              {section === 'analyser-site' && 'Entrez une URL · audit SEO complet de vos images'}
              {section === 'historique'    && 'Vos 20 dernières analyses'}
              {section === 'tickets'       && 'Support SeoPic — réponse en 24h'}
              {section === 'quiz'          && 'Testez vos connaissances SEO image'}
              {section === 'academy'       && 'Formations SEO Images · du débutant à l\'expert'}
            </p>
          </div>
          <div style={{ display:'flex', gap:8, alignItems:'center' }}>
            {isAdmin && (
              <Link href="/admin" style={{ padding:'8px 14px', background:'rgba(231,111,46,.12)', border:'1px solid rgba(231,111,46,.3)', color:'#E76F2E', borderRadius:9, fontSize:12, fontWeight:600, textDecoration:'none' }}>
                Admin
              </Link>
            )}
            <button onClick={() => setSection('tickets')} className="btn-ghost" style={{ padding:'8px 14px', background:'transparent', border:`1px solid ${t.bd}`, color:t.txS, borderRadius:9, fontSize:12, fontWeight:500, display:'flex', alignItems:'center', gap:6 }}>
              <IconTicket/> Nouveau ticket
            </button>
            <button onClick={() => setSection('academy')} className="btn-primary" style={{ padding:'8px 16px', background:'linear-gradient(135deg,#E76F2E,#C4581E)', color:'#fff', border:'none', borderRadius:9, fontSize:12, fontWeight:600, display:'flex', alignItems:'center', gap:6 }}>
              <IconAcademy/> Academy
            </button>
          </div>
        </header>

        {/* Content */}
        <div style={{ flex:1, padding:'24px 28px', maxWidth:1100, width:'100%', margin:'0 auto' }}>

          {/* ════════════ ANALYSER ════════════ */}
          {section === 'analyser' && (
            <div className="card-enter">

              {/* Step indicator */}
              <div style={{ display:'flex', alignItems:'center', gap:0, marginBottom:28, background:t.sf, border:`1px solid ${t.bd}`, borderRadius:14, padding:'14px 20px', overflow:'hidden' }}>
                {[{n:'01',label:'Upload',done:step!=='upload'},{n:'02',label:'Analyse IA',done:step==='result'},{n:'03',label:'Export',done:false}].map((s,i) => {
                  const isActive = (i===0&&step==='upload') || (i===1&&step==='analyzing') || (i===2&&step==='result')
                  const isDone   = s.done
                  return (
                    <div key={i} style={{ display:'flex', alignItems:'center', flex:1, minWidth:0 }}>
                      <div style={{ display:'flex', alignItems:'center', gap:10, flex:1 }}>
                        <div style={{ width:28, height:28, borderRadius:8, flexShrink:0, background: isDone ? '#4ADE80' : isActive ? 'linear-gradient(135deg,#E76F2E,#F2994A)' : t.bd, display:'flex', alignItems:'center', justifyContent:'center', transition:'all .4s', boxShadow: isActive ? '0 0 14px #E76F2E40' : 'none' }}>
                          {isDone ? <IconCheck/> : <span style={{ fontSize:10, fontWeight:800, color: isActive ? '#fff' : t.txM }}>{s.n}</span>}
                        </div>
                        <div style={{ minWidth:0 }}>
                          <p style={{ fontSize:12, fontWeight:600, color: isActive||isDone ? t.tx : t.txM, transition:'color .3s', whiteSpace:'nowrap' }}>{s.label}</p>
                        </div>
                      </div>
                      {i < 2 && <div style={{ height:1, flex:1, margin:'0 12px', background: isDone ? '#4ADE8040' : i===0&&step!=='upload' ? '#E76F2E40' : t.bd, transition:'background .4s', maxWidth:60 }}/>}
                    </div>
                  )
                })}
              </div>

              {/* Error */}
              {error && (
                <div style={{ background:'rgba(248,113,113,.08)', border:'1px solid rgba(248,113,113,.25)', borderRadius:10, padding:'12px 16px', marginBottom:16, color:'#F87171', fontSize:13 }}>
                  ⚠ {error}
                </div>
              )}

              {/* ── UPLOAD STATE ── */}
              {step === 'upload' && !image && (
                <div
                  className="upload-zone"
                  onDrop={handleDrop}
                  onDragOver={e => { e.preventDefault(); setDragOver(true) }}
                  onDragLeave={() => setDragOver(false)}
                  onClick={() => fileInputRef.current?.click()}
                  style={{ position:'relative', border:`2px dashed ${dragOver ? '#E76F2E' : t.bd}`, borderRadius:20, padding:'60px 40px', textAlign:'center', cursor:'pointer', background: dragOver ? 'rgba(231,111,46,.04)' : t.sf, transition:'all .3s', overflow:'hidden' }}
                >
                  <input ref={fileInputRef} type="file" accept="image/*" style={{ display:'none' }} onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])}/>

                  {/* Grid pattern */}
                  <div style={{ position:'absolute', inset:0, opacity:.03, backgroundImage:`linear-gradient(${t.txM} 1px,transparent 1px),linear-gradient(90deg,${t.txM} 1px,transparent 1px)`, backgroundSize:'32px 32px', pointerEvents:'none' }}/>

                  {/* Corner accents */}
                  {[{t:0,l:0,bt:'6px 0 0 0'},{t:0,r:0,bt:'0 6px 0 0'},{b:0,l:0,bt:'0 0 0 6px'},{b:0,r:0,bt:'0 0 6px 0'}].map((pos,i) => (
                    <div key={i} style={{ position:'absolute', width:20, height:20, border:'2px solid #E76F2E', opacity: dragOver ? .8 : .35, transition:'opacity .3s', borderRadius:pos.bt, top:pos.t!==undefined?12:undefined, bottom:(pos as any).b!==undefined?12:undefined, left:pos.l!==undefined?12:undefined, right:(pos as any).r!==undefined?12:undefined, ...(i===0?{borderRight:'none',borderBottom:'none'}:i===1?{borderLeft:'none',borderBottom:'none'}:i===2?{borderRight:'none',borderTop:'none'}:{borderLeft:'none',borderTop:'none'}) }}/>
                  ))}

                  <div style={{ position:'relative', zIndex:1 }}>
                    <div style={{ width:64, height:64, borderRadius:18, background:'rgba(231,111,46,.1)', border:'1px solid rgba(231,111,46,.2)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 20px', color:'#E76F2E', animation:'float 4s ease-in-out infinite' }}>
                      <IconUpload/>
                    </div>
                    <p style={{ fontSize:17, fontWeight:700, marginBottom:8 }}>Glissez votre image ici</p>
                    <p style={{ fontSize:13, color:t.txS, marginBottom:6 }}>ou <span style={{ color:'#E76F2E', fontWeight:600 }}>cliquez pour sélectionner</span></p>
                    <p style={{ fontSize:11, color:t.txM }}>JPG, PNG, WEBP, GIF · max 5 MB</p>
                  </div>
                </div>
              )}

              {/* ── IMAGE SELECTED, NOT YET ANALYZED ── */}
              {step === 'upload' && image && (
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20 }}>
                  <div style={{ background:t.sf, border:`1px solid ${t.bd}`, borderRadius:16, overflow:'hidden' }}>
                    <img src={image} alt="preview" style={{ width:'100%', height:220, objectFit:'cover', display:'block' }}/>
                    <div style={{ padding:'14px 16px' }}>
                      <p style={{ fontSize:12.5, fontWeight:600, marginBottom:3 }}>{imageFile?.name}</p>
                      <p style={{ fontSize:11, color:t.txM }}>{((imageFile?.size||0)/1024).toFixed(0)} KB · {imageFile?.type?.split('/')[1]?.toUpperCase()}</p>
                    </div>
                  </div>
                  <div style={{ display:'flex', flexDirection:'column', gap:12, justifyContent:'center' }}>
                    <div style={{ background:t.sf, border:`1px solid ${t.bd}`, borderRadius:14, padding:'20px 20px' }}>
                      <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:10 }}>
                        <IconSparkle/>
                        <span style={{ fontSize:12, fontWeight:700, color:'#E76F2E' }}>Prêt pour l'analyse SeoPic</span>
                      </div>
                      <p style={{ fontSize:12, color:t.txS, lineHeight:1.6 }}>SeoPic va analyser votre image et générer automatiquement :<br/>alt text, méta titre, méta description, mots-clés et score SEO.</p>
                    </div>
                    <button onClick={analyze} className="btn-primary" style={{ background:'linear-gradient(135deg,#E76F2E,#F2994A)', color:'#fff', border:'none', borderRadius:12, padding:'14px 20px', fontSize:14, fontWeight:700, fontFamily:'inherit' }}>
                      ⚡ Lancer l'analyse IA
                    </button>
                    <button onClick={resetTool} className="btn-ghost" style={{ background:'transparent', border:`1px solid ${t.bd}`, color:t.txS, borderRadius:12, padding:'10px 20px', fontSize:13, fontWeight:500, fontFamily:'inherit' }}>
                      Changer d'image
                    </button>
                  </div>
                </div>
              )}

              {/* ── ANALYZING STATE ── */}
              {step === 'analyzing' && (
                <div style={{ background:t.sf, border:`1px solid rgba(231,111,46,.25)`, borderRadius:20, overflow:'hidden', boxShadow:'0 0 40px rgba(231,111,46,.06)' }}>
                  {/* Image with scan */}
                  <div style={{ position:'relative', height:220, overflow:'hidden' }}>
                    {image && <img src={image} alt="scanning" style={{ width:'100%', height:'100%', objectFit:'cover', opacity:.5 }}/>}
                    <div className="scan-bar"/>
                    <div style={{ position:'absolute', inset:0, background:'linear-gradient(to bottom,rgba(231,111,46,.08),transparent,rgba(231,111,46,.08))', animation:'pulse 2s ease-in-out infinite' }}/>
                    <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center' }}>
                      <div style={{ background:'rgba(0,0,0,.7)', backdropFilter:'blur(8px)', borderRadius:14, padding:'14px 22px', display:'flex', alignItems:'center', gap:12, border:'1px solid rgba(231,111,46,.3)' }}>
                        <div style={{ width:8, height:8, borderRadius:'50%', background:'#E76F2E', animation:'pulse 1s ease-in-out infinite' }}/>
                        <span style={{ fontSize:13, fontWeight:600, color:'#fff' }}>SeoPic analyse votre image...</span>
                      </div>
                    </div>
                  </div>

                  {/* Progress */}
                  <div style={{ padding:'20px 24px' }}>
                    {[
                      { label:'Détection du contenu visuel', done: scanProgress > 20 },
                      { label:'Génération des métadonnées SEO', done: scanProgress > 55 },
                      { label:'Calcul du score SEO', done: scanProgress > 80 },
                    ].map((item, i) => (
                      <div key={i} style={{ display:'flex', alignItems:'center', gap:10, padding:'6px 0' }}>
                        <div style={{ width:16, height:16, borderRadius:'50%', border:`2px solid ${item.done ? '#4ADE80' : t.bd}`, background: item.done ? '#4ADE8018' : 'transparent', display:'flex', alignItems:'center', justifyContent:'center', transition:'all .4s', flexShrink:0 }}>
                          {item.done && <IconCheck/>}
                        </div>
                        <span style={{ fontSize:12, color: item.done ? t.tx : t.txM, transition:'color .4s' }}>{item.label}</span>
                      </div>
                    ))}
                    <div style={{ marginTop:16, background:t.bd, borderRadius:6, height:4, overflow:'hidden' }}>
                      <div className="shimmer" style={{ height:'100%', width:`${scanProgress}%`, background:'linear-gradient(90deg,#E76F2E,#F2994A)', borderRadius:6, transition:'width .6s cubic-bezier(.16,1,.3,1)' }}/>
                    </div>
                    <p style={{ fontSize:11, color:t.txM, marginTop:8, textAlign:'right' }}>{scanProgress}%</p>
                  </div>
                </div>
              )}

              {/* ── RESULT STATE ── */}
              {step === 'result' && result && (
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1.4fr', gap:20, alignItems:'start' }}>

                  {/* LEFT COLUMN */}
                  <div style={{ display:'flex', flexDirection:'column', gap:14 }}>

                    {/* Image preview */}
                    <div style={{ background:t.sf, border:`1px solid ${t.bd}`, borderRadius:16, overflow:'hidden' }}>
                      {image && <img src={image} alt="analyzed" style={{ width:'100%', height:180, objectFit:'cover', display:'block' }}/>}
                      <div style={{ padding:'12px 14px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                        <div>
                          <p style={{ fontSize:11.5, fontWeight:600 }}>{imageFile?.name}</p>
                          <p style={{ fontSize:10.5, color:t.txM }}>{((imageFile?.size||0)/1024).toFixed(0)} KB · {result.imageCategory}</p>
                        </div>
                        <span style={{ fontSize:10, color:t.txS, background:t.bd, padding:'3px 8px', borderRadius:6 }}>{result.tone}</span>
                      </div>
                    </div>

                    {/* SEO Score */}
                    {(() => {
                      const g = scoreGrade(result.seoScore)
                      const circ = 2 * Math.PI * 30
                      return (
                        <div style={{ background:t.sf, border:`1px solid ${t.bd}`, borderRadius:16, padding:'18px 18px' }}>
                          <p style={{ fontSize:11, fontWeight:700, color:t.txM, textTransform:'uppercase', letterSpacing:1, marginBottom:14 }}>Score SEO</p>
                          <div style={{ display:'flex', alignItems:'center', gap:16 }}>
                            <div style={{ position:'relative', width:72, height:72, flexShrink:0 }}>
                              <svg width="72" height="72" viewBox="0 0 72 72" style={{ transform:'rotate(-90deg)' }}>
                                <circle cx="36" cy="36" r="30" fill="none" stroke={t.bd} strokeWidth="5"/>
                                <circle cx="36" cy="36" r="30" fill="none" stroke={g.bar} strokeWidth="5" strokeDasharray={`${(result.seoScore/100)*circ} ${circ}`} strokeLinecap="round" style={{ transition:'stroke-dasharray .8s cubic-bezier(.16,1,.3,1)', filter:`drop-shadow(0 0 8px ${g.bar})` }}/>
                              </svg>
                              <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center' }}>
                                <span style={{ fontSize:16, fontWeight:900, color:g.color }}>{result.seoScore}</span>
                              </div>
                            </div>
                            <div>
                              <div style={{ display:'inline-flex', alignItems:'center', gap:5, background:'transparent', border:`1px solid ${g.color}40`, borderRadius:8, padding:'4px 10px', marginBottom:6 }}>
                                <div style={{ width:6, height:6, borderRadius:'50%', background:g.color }}/>
                                <span style={{ fontSize:12, fontWeight:700, color:g.color }}>{g.label}</span>
                              </div>
                              <p style={{ fontSize:11.5, color:t.txS }}>sur 100 points</p>
                            </div>
                          </div>
                        </div>
                      )
                    })()}

                    {/* Improvements */}
                    <div style={{ background:t.sf, border:`1px solid ${t.bd}`, borderRadius:16, padding:'16px 18px' }}>
                      <p style={{ fontSize:11, fontWeight:700, color:t.txM, textTransform:'uppercase', letterSpacing:1, marginBottom:12 }}>Améliorations</p>
                      <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                        {result.improvements.map((imp,i) => (
                          <div key={i} style={{ display:'flex', gap:8, alignItems:'flex-start' }}>
                            <span style={{ color:'#E76F2E', fontWeight:700, fontSize:12, flexShrink:0, marginTop:1 }}>→</span>
                            <p style={{ fontSize:12, color:t.txS, lineHeight:1.55 }}>{imp}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Injection status */}
                    {injectError && (
                      <div style={{ background:'rgba(248,113,113,.08)', border:'1px solid rgba(248,113,113,.25)', borderRadius:12, padding:'12px 14px', fontSize:12, color:'#F87171' }}>
                        ⚠ {injectError}
                      </div>
                    )}
                    <div style={{ background: injected ? 'rgba(74,222,128,.06)' : t.sf, border:`1px solid ${injected ? 'rgba(74,222,128,.3)' : t.bd}`, borderRadius:14, padding:'14px 16px', transition:'all .4s' }}>
                      <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom: injected ? 8 : 0 }}>
                        <div style={{ width:8, height:8, borderRadius:'50%', background: injected ? '#4ADE80' : t.txM, boxShadow: injected ? '0 0 8px #4ADE8060' : 'none', flexShrink:0, transition:'all .3s' }}/>
                        <span style={{ fontSize:12, fontWeight:600, color: injected ? '#4ADE80' : t.txM }}>{injected ? 'XMP injectées dans le fichier ✓' : 'En attente d\'injection'}</span>
                      </div>
                      {injected && (
                        <div style={{ display:'flex', flexDirection:'column', gap:3, paddingLeft:16 }}>
                          {[['Alt Text', editAlt.slice(0,50)+'…'],['Meta Titre', editTitle],['Mots-clés', editKws.slice(0,3).join(', ')+(editKws.length>3?'…':'')]].map(([k,v])=>(
                            <p key={k} style={{ fontSize:10.5, color:t.txM }}><span style={{ fontWeight:600, color:t.txS }}>{k} :</span> {v}</p>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* New analysis */}
                    <button onClick={resetTool} className="btn-ghost" style={{ background:'transparent', border:`1px solid ${t.bd}`, color:t.txS, borderRadius:10, padding:'10px 16px', fontSize:12, fontWeight:500, fontFamily:'inherit', textAlign:'center' }}>
                      ↩ Nouvelle analyse
                    </button>
                  </div>

                  {/* RIGHT COLUMN */}
                  <div style={{ display:'flex', flexDirection:'column', gap:12 }}>

                    {/* Detected content */}
                    <div style={{ background:'rgba(231,111,46,.05)', border:'1px solid rgba(231,111,46,.15)', borderRadius:12, padding:'10px 14px', display:'flex', gap:8, alignItems:'flex-start' }}>
                      <IconSparkle/>
                      <div>
                        <span style={{ fontSize:10, fontWeight:700, color:'#E76F2E', textTransform:'uppercase', letterSpacing:1 }}>IA Détecté · </span>
                        <span style={{ fontSize:12, color:t.txS }}>{result.detectedContent}</span>
                      </div>
                    </div>

                    {/* Editable fields */}
                    {[
                      { key:'alt',   label:'Alt Text',          max:125, value:editAlt,   set:setEditAlt   },
                      { key:'title', label:'Meta Title',         max:60,  value:editTitle, set:setEditTitle },
                      { key:'desc',  label:'Meta Description',   max:160, value:editDesc,  set:setEditDesc  },
                    ].map(field => {
                      const len = field.value.length
                      const pct = (len / field.max) * 100
                      const barC = pct > 100 ? '#F87171' : pct > 80 ? '#4ADE80' : '#FACC15'
                      const isEdited = editedFields.has(field.key)
                      return (
                        <div key={field.key} className="field-card" style={{ background:t.sf, border:`1px solid ${t.bd}`, borderRadius:14, padding:'14px 16px' }}>
                          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
                            <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                              <span style={{ fontSize:12, fontWeight:600 }}>{field.label}</span>
                              <span style={{ fontSize:9, background:'rgba(231,111,46,.12)', color:'#E76F2E', padding:'1px 6px', borderRadius:5, fontWeight:700 }}>IA</span>
                              {isEdited && <span style={{ fontSize:9, background:'rgba(74,222,128,.12)', color:'#4ADE80', padding:'1px 6px', borderRadius:5, fontWeight:700 }}>Édité</span>}
                            </div>
                            <div style={{ display:'flex', gap:4 }}>
                              <button className="copy-btn" onClick={() => { const orig = field.key==='alt'?result.suggestedAltText:field.key==='title'?result.metaTitle:result.metaDescription; field.set(orig); markEdited(field.key) }} style={{ background:'none', border:'none', cursor:'pointer', color:t.txM, padding:3 }} title="Régénérer">
                                <IconRefresh/>
                              </button>
                              <button className="copy-btn" onClick={() => copyText(field.value, field.key)} style={{ background:'none', border:'none', cursor:'pointer', color: copied===field.key ? '#4ADE80' : t.txM, padding:3 }}>
                                {copied===field.key ? <IconCheck/> : <IconCopy/>}
                              </button>
                            </div>
                          </div>
                          <textarea
                            value={field.value}
                            onChange={e => { field.set(e.target.value); markEdited(field.key) }}
                            rows={field.key==='desc'?3:2}
                            style={{ width:'100%', background:'transparent', border:'none', outline:'none', fontSize:12.5, color:t.tx, lineHeight:1.6, resize:'none', padding:0 }}
                          />
                          <div style={{ display:'flex', alignItems:'center', gap:8, marginTop:8 }}>
                            <div style={{ flex:1, background:t.bd, borderRadius:3, height:2.5, overflow:'hidden' }}>
                              <div style={{ width:`${Math.min(pct,100)}%`, height:'100%', background:barC, borderRadius:3, transition:'width .3s,background .3s' }}/>
                            </div>
                            <span style={{ fontSize:10, color: pct>100?'#F87171':t.txM, fontWeight:600 }}>{len}/{field.max}</span>
                          </div>
                        </div>
                      )
                    })}

                    {/* Keywords */}
                    <div className="field-card" style={{ background:t.sf, border:`1px solid ${t.bd}`, borderRadius:14, padding:'14px 16px' }}>
                      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10 }}>
                        <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                          <span style={{ fontSize:12, fontWeight:600 }}>Mots-clés SEO</span>
                          <span style={{ fontSize:9, background:'rgba(231,111,46,.12)', color:'#E76F2E', padding:'1px 6px', borderRadius:5, fontWeight:700 }}>IA</span>
                        </div>
                        <button className="copy-btn" onClick={() => copyText(editKws.join(', '),'kws')} style={{ background:'none', border:'none', cursor:'pointer', color: copied==='kws'?'#4ADE80':t.txM, padding:3 }}>
                          {copied==='kws' ? <IconCheck/> : <IconCopy/>}
                        </button>
                      </div>
                      <div style={{ display:'flex', flexWrap:'wrap', gap:6, marginBottom:10 }}>
                        {editKws.map((kw,i) => (
                          <span key={i} style={{ background:'rgba(231,111,46,.1)', border:'1px solid rgba(231,111,46,.25)', color:'#E76F2E', borderRadius:20, padding:'4px 10px 4px 12px', fontSize:12, fontWeight:500, display:'inline-flex', alignItems:'center', gap:6 }}>
                            {kw}
                            <button onClick={() => setEditKws(editKws.filter((_,idx)=>idx!==i))} style={{ background:'none', border:'none', cursor:'pointer', color:'#E76F2E', padding:0, display:'flex', alignItems:'center', opacity:.7, lineHeight:1 }}>
                              <IconClose/>
                            </button>
                          </span>
                        ))}
                      </div>
                      <div style={{ display:'flex', gap:6 }}>
                        <input
                          type="text"
                          value={kwInput}
                          onChange={e => setKwInput(e.target.value)}
                          onKeyDown={e => { if (e.key==='Enter'&&kwInput.trim()) { setEditKws([...editKws,kwInput.trim()]); setKwInput('') } }}
                          placeholder="Ajouter un mot-clé…"
                          style={{ flex:1, background:t.bg, border:`1px solid ${t.bd}`, borderRadius:8, padding:'7px 12px', fontSize:12, color:t.tx, outline:'none', fontFamily:'inherit' }}
                        />
                        <button onClick={() => { if(kwInput.trim()){ setEditKws([...editKws,kwInput.trim()]); setKwInput('') }}} style={{ background:'rgba(231,111,46,.12)', border:'1px solid rgba(231,111,46,.25)', borderRadius:8, padding:'7px 10px', cursor:'pointer', color:'#E76F2E', display:'flex', alignItems:'center' }}>
                          <IconPlus/>
                        </button>
                      </div>
                    </div>

                    {/* Filename */}
                    <div style={{ background:t.sf, border:`1px solid ${t.bd}`, borderRadius:14, padding:'12px 16px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                      <div>
                        <p style={{ fontSize:11, color:t.txM, marginBottom:3 }}>Suggestion de nom de fichier</p>
                        <p style={{ fontSize:12.5, fontWeight:600, fontFamily:'monospace' }}>
                          {editTitle.toLowerCase().replace(/\s+/g,'-').replace(/[^a-z0-9-]/g,'').slice(0,40) || 'image-optimisee'}-seo.jpg
                        </p>
                      </div>
                      <button className="copy-btn" onClick={() => copyText(`${editTitle.toLowerCase().replace(/\s+/g,'-').replace(/[^a-z0-9-]/g,'').slice(0,40)||'image-optimisee'}-seo.jpg`,'fname')} style={{ background:'none', border:'none', cursor:'pointer', color: copied==='fname'?'#4ADE80':t.txM, padding:4 }}>
                        {copied==='fname' ? <IconCheck/> : <IconCopy/>}
                      </button>
                    </div>

                    {/* Action buttons */}
                    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginTop:4 }}>
                      <button onClick={injectMetadata} disabled={injecting || injected} className="btn-primary" style={{ background: injected ? 'rgba(74,222,128,.08)' : 'linear-gradient(135deg,#E76F2E,#F2994A)', color: injected ? '#4ADE80' : '#fff', border: injected ? '1px solid rgba(74,222,128,.3)' : 'none', borderRadius:10, padding:'11px 0', fontSize:12.5, fontWeight:600, fontFamily:'inherit', display:'flex', alignItems:'center', justifyContent:'center', gap:6, transition:'all .3s', cursor: injecting||injected ? 'default' : 'pointer', opacity: injecting ? 0.7 : 1 }}>
                        {injecting ? <><span style={{ width:12,height:12,border:'2px solid rgba(255,255,255,.4)',borderTopColor:'#fff',borderRadius:'50%',animation:'spin 1s linear infinite',display:'inline-block'}}/>  Injection...</> : injected ? <>✓ Métadonnées injectées</> : <><IconInject/> Injecter les métadonnées</>}
                      </button>
                      <button onClick={analyze} className="btn-ghost" style={{ background:'transparent', border:`1px solid ${t.bd}`, color:t.txS, borderRadius:10, padding:'11px 0', fontSize:12.5, fontWeight:500, fontFamily:'inherit', display:'flex', alignItems:'center', justifyContent:'center', gap:6 }}>
                        <IconRefresh/> Régénérer
                      </button>
                      <button onClick={() => downloadImage('jpeg')} disabled={!injected} className="btn-primary" style={{ background: injected ? 'linear-gradient(135deg,#1A1A18,#2A2A28)' : t.bd, color: injected ? '#fff' : t.txM, border: injected ? '1px solid rgba(255,255,255,.1)' : 'none', borderRadius:10, padding:'11px 0', fontSize:12.5, fontWeight:600, fontFamily:'inherit', display:'flex', alignItems:'center', justifyContent:'center', gap:6, cursor: injected ? 'pointer' : 'not-allowed', opacity: injected ? 1 : 0.5, transition:'all .3s' }}>
                        <IconDownload/> Télécharger JPG
                      </button>
                      <button onClick={() => downloadImage('webp')} disabled={!injected} className="btn-primary" style={{ background: injected ? 'rgba(231,111,46,.15)' : t.bd, color: injected ? '#E76F2E' : t.txM, border: injected ? '1px solid rgba(231,111,46,.35)' : 'none', borderRadius:10, padding:'11px 0', fontSize:12.5, fontWeight:600, fontFamily:'inherit', display:'flex', alignItems:'center', justifyContent:'center', gap:6, cursor: injected ? 'pointer' : 'not-allowed', opacity: injected ? 1 : 0.5, transition:'all .3s' }}>
                        <IconDownload/> Télécharger WebP
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ════════════ HISTORIQUE ════════════ */}
          {section === 'historique' && (
            <div className="card-enter">
              {historyLoading ? (
                <div style={{ textAlign:'center', padding:'60px 0', color:t.txM }}>Chargement...</div>
              ) : history.length === 0 ? (
                <div style={{ textAlign:'center', padding:'60px 24px', background:t.sf, border:`1px solid ${t.bd}`, borderRadius:20 }}>
                  <div style={{ width:56, height:56, background:'rgba(231,111,46,.08)', borderRadius:16, display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 16px', color:'#E76F2E' }}><IconHistory/></div>
                  <p style={{ fontWeight:600, marginBottom:6 }}>Aucune analyse pour l'instant</p>
                  <p style={{ fontSize:13, color:t.txM, marginBottom:20 }}>Analysez une image pour voir votre historique ici</p>
                  <button onClick={() => setSection('analyser')} className="btn-primary" style={{ background:'linear-gradient(135deg,#E76F2E,#F2994A)', color:'#fff', border:'none', borderRadius:10, padding:'10px 24px', fontSize:13, fontWeight:600, fontFamily:'inherit' }}>
                    Analyser une image
                  </button>
                </div>
              ) : (
                <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                  {history.map((h,idx) => {
                    const g = scoreGrade(h.seo_score)
                    return (
                      <div key={h.id} className="card-enter" style={{ background:t.sf, border:`1px solid ${t.bd}`, borderRadius:14, padding:'14px 18px', animationDelay:`${idx*0.04}s`, display:'flex', gap:16, alignItems:'center' }}>
                        <div style={{ width:44, height:44, borderRadius:12, background:g.bg, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                          <span style={{ fontSize:16, fontWeight:900, color:g.color }}>{h.seo_score}</span>
                        </div>
                        <div style={{ flex:1, minWidth:0 }}>
                          <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:3, flexWrap:'wrap' }}>
                            <p style={{ fontSize:13, fontWeight:600, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{h.meta_title || '—'}</p>
                            {h.image_category && <span style={{ fontSize:10, background:'rgba(231,111,46,.1)', color:'#E76F2E', padding:'1px 6px', borderRadius:5, flexShrink:0 }}>{h.image_category}</span>}
                          </div>
                          <p style={{ fontSize:11.5, color:t.txS, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', marginBottom:6 }}>{h.alt_text}</p>
                          <div style={{ display:'flex', gap:5, flexWrap:'wrap' }}>
                            {h.keywords?.slice(0,4).map((kw,i) => <span key={i} style={{ fontSize:10, background:t.bd, color:t.txM, padding:'2px 7px', borderRadius:5 }}>{kw}</span>)}
                            {(h.keywords?.length||0) > 4 && <span style={{ fontSize:10, color:t.txM }}>+{h.keywords.length-4}</span>}
                          </div>
                        </div>
                        <div style={{ textAlign:'right', flexShrink:0 }}>
                          <p style={{ fontSize:11, color:t.txM }}>{new Date(h.created_at).toLocaleDateString('fr-FR')}</p>
                          {h.image_name && <p style={{ fontSize:10, color:t.txM, marginTop:2, maxWidth:110, overflow:'hidden', textOverflow:'ellipsis' }}>{h.image_name}</p>}
                          {h.image_size && <p style={{ fontSize:10, color:t.txM }}>{(h.image_size/1024).toFixed(0)} KB</p>}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {/* ════════════ TICKETS ════════════ */}
          {section === 'tickets' && (
            <div className="card-enter">
              {ticketSuccess && (
                <div style={{ background:'rgba(74,222,128,.08)', border:'1px solid rgba(74,222,128,.25)', borderRadius:10, padding:'12px 16px', marginBottom:16, color:'#4ADE80', fontSize:13, display:'flex', alignItems:'center', gap:8 }}>
                  <IconCheck/> Ticket envoyé avec succès — notre équipe vous répond sous 24h.
                </div>
              )}
              {ticketError && (
                <div style={{ background:'rgba(248,113,113,.08)', border:'1px solid rgba(248,113,113,.25)', borderRadius:10, padding:'12px 16px', marginBottom:16, color:'#F87171', fontSize:13 }}>
                  ⚠ {ticketError}
                </div>
              )}
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
                <p style={{ fontSize:13, color:t.txS }}>{tickets.length} ticket{tickets.length!==1?'s':''} · {openTickets} en cours</p>
                <button onClick={() => { setShowForm(!showForm); setTicketError(null) }} className="btn-primary" style={{ background:'linear-gradient(135deg,#E76F2E,#F2994A)', color:'#fff', border:'none', borderRadius:10, padding:'9px 18px', fontSize:12.5, fontWeight:600, fontFamily:'inherit' }}>
                  + Nouveau ticket
                </button>
              </div>

              {showForm && (
                <div style={{ background:t.sf, border:'1px solid rgba(231,111,46,.2)', borderRadius:16, padding:'20px 20px', marginBottom:20 }}>
                  <h3 style={{ fontSize:14, fontWeight:700, marginBottom:16 }}>Nouveau ticket de support</h3>
                  <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
                    <div>
                      <label style={{ fontSize:11, color:t.txM, display:'block', marginBottom:5 }}>Titre *</label>
                      <input type="text" value={form.title} onChange={e => setForm({...form,title:e.target.value})} placeholder="Ex: Problème avec l'analyse SEO" style={{ width:'100%', background:t.bg, border:`1px solid ${t.bd}`, borderRadius:9, padding:'10px 14px', fontSize:13, outline:'none', color:t.tx }}/>
                    </div>
                    <div>
                      <label style={{ fontSize:11, color:t.txM, display:'block', marginBottom:5 }}>Description *</label>
                      <textarea rows={4} value={form.description} onChange={e => setForm({...form,description:e.target.value})} placeholder="Décrivez votre problème en détail..." style={{ width:'100%', background:t.bg, border:`1px solid ${t.bd}`, borderRadius:9, padding:'10px 14px', fontSize:13, outline:'none', color:t.tx }}/>
                    </div>
                    <div>
                      <label style={{ fontSize:11, color:t.txM, display:'block', marginBottom:5 }}>Priorité</label>
                      <select value={form.priority} onChange={e => setForm({...form,priority:e.target.value})} style={{ background:t.bg, border:`1px solid ${t.bd}`, borderRadius:9, padding:'10px 14px', fontSize:13, color:t.tx, outline:'none' }}>
                        <option>Haute</option><option>Moyenne</option><option>Basse</option>
                      </select>
                    </div>
                    <div style={{ display:'flex', gap:8, justifyContent:'flex-end' }}>
                      <button onClick={() => setShowForm(false)} className="btn-ghost" style={{ background:'transparent', border:`1px solid ${t.bd}`, color:t.txS, borderRadius:9, padding:'9px 16px', fontSize:12.5, fontWeight:500, fontFamily:'inherit' }}>Annuler</button>
                      <button onClick={submitTicket} disabled={!form.title.trim()||!form.description.trim()||submitting} className="btn-primary" style={{ background:'linear-gradient(135deg,#E76F2E,#F2994A)', color:'#fff', border:'none', borderRadius:9, padding:'9px 20px', fontSize:12.5, fontWeight:600, fontFamily:'inherit', opacity:!form.title.trim()||!form.description.trim()||submitting?.4:1 }}>
                        {submitting ? 'Envoi...' : 'Envoyer'}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {ticketsLoading ? (
                <div style={{ textAlign:'center', padding:'40px 0', color:t.txM }}>Chargement...</div>
              ) : tickets.length === 0 ? (
                <div style={{ textAlign:'center', padding:'60px 24px', background:t.sf, border:`1px solid ${t.bd}`, borderRadius:20 }}>
                  <div style={{ width:56, height:56, background:'rgba(231,111,46,.08)', borderRadius:16, display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 16px', color:'#E76F2E' }}><IconTicket/></div>
                  <p style={{ fontWeight:600, marginBottom:6 }}>Aucun ticket pour l'instant</p>
                  <p style={{ fontSize:13, color:t.txM }}>Créez un ticket pour contacter l'équipe VALT</p>
                </div>
              ) : (
                <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                  {tickets.map((tk,idx) => {
                    const sc = tk.status==='Ouvert'?{bg:'rgba(248,113,113,.1)',c:'#F87171',bd:'rgba(248,113,113,.25)'}:tk.status==='En Cours'?{bg:'rgba(250,204,21,.1)',c:'#FACC15',bd:'rgba(250,204,21,.25)'}:{bg:'rgba(74,222,128,.1)',c:'#4ADE80',bd:'rgba(74,222,128,.25)'}
                    const pc = tk.priority==='Haute'?'#F87171':tk.priority==='Moyenne'?'#FACC15':'#4ADE80'
                    return (
                      <div key={tk.id} className="card-enter" style={{ background:t.sf, border:`1px solid ${t.bd}`, borderRadius:14, padding:'14px 18px', animationDelay:`${idx*0.04}s` }}>
                        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
                          <div style={{ flex:1 }}>
                            <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:6, flexWrap:'wrap' }}>
                              <span style={{ fontSize:10, fontWeight:700, padding:'2px 8px', borderRadius:6, background:sc.bg, color:sc.c, border:`1px solid ${sc.bd}` }}>{tk.status}</span>
                              <span style={{ fontSize:10, padding:'2px 7px', borderRadius:5, background:t.bd, color:pc, fontWeight:600 }}>● {tk.priority}</span>
                              {tk.replies.length > 0 && <span style={{ fontSize:10, background:'rgba(231,111,46,.1)', color:'#E76F2E', padding:'2px 7px', borderRadius:5 }}>💬 {tk.replies.length} réponse{tk.replies.length>1?'s':''} VALT</span>}
                            </div>
                            <p style={{ fontSize:13.5, fontWeight:600 }}>{tk.title}</p>
                          </div>
                          <p style={{ fontSize:11, color:t.txM, marginLeft:12, flexShrink:0 }}>{new Date(tk.created_at).toLocaleDateString('fr-FR')}</p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {/* ════════════ ACADEMY ════════════ */}
          {section === 'academy' && (() => {
            const VIDEOS = [
              { id:0, title:'SEO Images 101 — Les bases', duration:'45 min', level:'Débutant', free:true,  desc:"Découvrez pourquoi les métadonnées d'images sont cruciales pour votre référencement. Alt text, EXIF, IPTC — on explique tout simplement.", thumb:'https://images.unsplash.com/photo-1432888498266-38ffec3eaf0a?w=800&q=80' },
              { id:1, title:'Alt Text : les règles d\'or',  duration:'20 min', level:'Débutant', free:true,  desc:"Comment rédiger un alt text parfait qui plaît à Google et aux utilisateurs. Exemples concrets, erreurs à éviter, outils pratiques.", thumb:'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80' },
              { id:2, title:'EXIF, IPTC, XMP décryptés',   duration:'30 min', level:'Intermédiaire', free:true,  desc:"Plongez dans les métadonnées techniques. Comprendre chaque champ et l'optimiser pour Google Images et les moteurs de recherche.", thumb:'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80' },
              { id:3, title:"Google Images : mine d'or",   duration:'25 min', level:'Intermédiaire', free:false, desc:"Stratégies avancées pour dominer Google Images. Optimisation du contexte, balisage schema, et signaux de pertinence visuelle.", thumb:'https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?w=800&q=80' },
              { id:4, title:'Audit SEO Images complet',    duration:'1h 20',  level:'Avancé', free:false, desc:"Méthodologie complète d'audit SEO images. Crawler, analyse de masse, détection des problèmes et plan d'action prioritaire.", thumb:'https://images.unsplash.com/photo-1573164713988-8665fc963095?w=800&q=80' },
              { id:5, title:'Stratégie de contenus visuels',duration:'50 min', level:'Avancé', free:false, desc:"Créer une stratégie SEO visuelle long terme. Calendrier éditorial, types d'images performantes et mesure du ROI SEO.", thumb:'https://images.unsplash.com/photo-1559028012-481c04fa702d?w=800&q=80' },
            ]
            const v = VIDEOS[activeVideo]
            return (
              <div className="card-enter" style={{ display:'grid', gridTemplateColumns:'1fr 340px', gap:20, alignItems:'start' }}>
                {/* Player + info */}
                <div>
                  {/* Video thumb */}
                  <div style={{ borderRadius:16, overflow:'hidden', position:'relative', aspectRatio:'16/9', background:'#000', marginBottom:16 }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={v.thumb} alt={v.title} style={{ width:'100%', height:'100%', objectFit:'cover', opacity:.75 }}/>
                    <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center' }}>
                      <div style={{ width:60, height:60, borderRadius:'50%', background:'rgba(231,111,46,.9)', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', boxShadow:'0 0 30px #E76F2E50', paddingLeft:4, color:'#fff' }}>
                        <IconPlay/>
                      </div>
                    </div>
                    <div style={{ position:'absolute', top:12, right:12, background:'rgba(0,0,0,.65)', backdropFilter:'blur(8px)', borderRadius:7, padding:'4px 10px', fontSize:11, fontWeight:600, color:'#fff' }}>{v.duration}</div>
                    <div style={{ position:'absolute', top:12, left:12, background: v.free ? 'rgba(74,222,128,.9)' : 'rgba(231,111,46,.9)', borderRadius:7, padding:'4px 10px', fontSize:11, fontWeight:700, color:'#fff' }}>{v.free ? 'Gratuit' : 'Pro'}</div>
                  </div>

                  {/* Info */}
                  <div style={{ marginBottom:16 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:8 }}>
                      <span style={{ fontSize:11, fontWeight:700, background:'rgba(231,111,46,.12)', color:'#E76F2E', padding:'2px 8px', borderRadius:6 }}>{v.level}</span>
                    </div>
                    <h2 style={{ fontSize:18, fontWeight:800, marginBottom:10, letterSpacing:-.3 }}>{v.title}</h2>
                    <p style={{ fontSize:13.5, color:t.txS, lineHeight:1.7 }}>{v.desc}</p>
                  </div>

                  {/* Comments — per video */}
                  {(() => {
                    const vComments = videoComments[activeVideo] || []
                    const addComment = () => {
                      if (!newComment.trim()) return
                      setVideoComments(prev => ({ ...prev, [activeVideo]: [...(prev[activeVideo]||[]), { author: session?.user?.name||'Vous', text: newComment.trim(), time: "à l'instant" }] }))
                      setNewComment('')
                    }
                    return (
                      <div style={{ background:t.sf, border:`1px solid ${t.bd}`, borderRadius:14, padding:'16px 18px' }}>
                        <p style={{ fontSize:12, fontWeight:700, color:t.txM, textTransform:'uppercase', letterSpacing:1, marginBottom:14 }}>Commentaires ({vComments.length})</p>
                        {vComments.length === 0 && <p style={{ fontSize:12.5, color:t.txM, marginBottom:14, fontStyle:'italic' }}>Soyez le premier à commenter cette vidéo.</p>}
                        <div style={{ display:'flex', flexDirection:'column', gap:10, marginBottom:14 }}>
                          {vComments.map((c,i) => (
                            <div key={i} style={{ display:'flex', gap:10, alignItems:'flex-start' }}>
                              <div style={{ width:28, height:28, borderRadius:'50%', background:'linear-gradient(135deg,#E76F2E,#C4581E)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:700, color:'#fff', flexShrink:0 }}>{c.author[0]}</div>
                              <div>
                                <div style={{ display:'flex', gap:8, alignItems:'center', marginBottom:3 }}>
                                  <span style={{ fontSize:12, fontWeight:600 }}>{c.author}</span>
                                  <span style={{ fontSize:11, color:t.txM }}>{c.time}</span>
                                </div>
                                <p style={{ fontSize:12.5, color:t.txS, lineHeight:1.5 }}>{c.text}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                        <div style={{ display:'flex', gap:8 }}>
                          <input type="text" value={newComment} onChange={e => setNewComment(e.target.value)} onKeyDown={e => e.key==='Enter' && addComment()} placeholder="Laisser un commentaire…" style={{ flex:1, background:t.bg, border:`1px solid ${t.bd}`, borderRadius:9, padding:'9px 14px', fontSize:12.5, color:t.tx, outline:'none', fontFamily:'inherit' }}/>
                          <button onClick={addComment} className="btn-primary" style={{ background:'linear-gradient(135deg,#E76F2E,#F2994A)', color:'#fff', border:'none', borderRadius:9, padding:'9px 16px', fontSize:12, fontWeight:600, fontFamily:'inherit', display:'flex', alignItems:'center', gap:5 }}>
                            <IconComment/> Publier
                          </button>
                        </div>
                      </div>
                    )
                  })()}
                </div>

                {/* Playlist */}
                <div style={{ background:t.sf, border:`1px solid ${t.bd}`, borderRadius:16, overflow:'hidden' }}>
                  <div style={{ padding:'14px 16px', borderBottom:`1px solid ${t.bd}` }}>
                    <p style={{ fontSize:13, fontWeight:700 }}>Toutes les formations</p>
                    <p style={{ fontSize:11, color:t.txM, marginTop:2 }}>{VIDEOS.length} vidéos</p>
                  </div>
                  <div style={{ overflowY:'auto', maxHeight:520 }}>
                    {VIDEOS.map((vid,i) => (
                      <div key={i} onClick={() => setActiveVideo(i)} style={{ display:'flex', gap:10, padding:'12px 14px', cursor:'pointer', borderBottom:`1px solid ${t.bd}`, background: activeVideo===i ? 'rgba(231,111,46,.06)' : 'transparent', transition:'background .2s', borderLeft: activeVideo===i ? '3px solid #E76F2E' : '3px solid transparent' }}>
                        <div style={{ width:64, height:40, borderRadius:7, overflow:'hidden', flexShrink:0, position:'relative', background:'#000' }}>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={vid.thumb} alt="" style={{ width:'100%', height:'100%', objectFit:'cover', opacity:.7 }}/>
                          <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center' }}>
                            <div style={{ width:16, height:16, borderRadius:'50%', background:'rgba(231,111,46,.85)', display:'flex', alignItems:'center', justifyContent:'center', paddingLeft:1, color:'#fff' }}>
                              <svg width="7" height="7" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                            </div>
                          </div>
                        </div>
                        <div style={{ flex:1, minWidth:0 }}>
                          <p style={{ fontSize:12, fontWeight:600, lineHeight:1.4, marginBottom:3, display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden' } as React.CSSProperties}>{vid.title}</p>
                          <div style={{ display:'flex', gap:5, alignItems:'center' }}>
                            <span style={{ fontSize:10, color:t.txM }}>{vid.duration}</span>
                            <span style={{ fontSize:9, fontWeight:700, background: vid.free?'rgba(74,222,128,.12)':'rgba(231,111,46,.12)', color: vid.free?'#4ADE80':'#E76F2E', padding:'1px 5px', borderRadius:4 }}>{vid.free?'Gratuit':'Pro'}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )
          })()}

          {/* ════════════ ANALYSER SITE ════════════ */}
          {section === 'analyser-site' && (
            <div className="card-enter" style={{ maxWidth:640, margin:'0 auto' }}>
              <div style={{ background:t.sf, border:`1px solid ${t.bd}`, borderRadius:20, padding:'40px 36px', textAlign:'center' }}>
                <div style={{ width:64, height:64, background:'rgba(231,111,46,.08)', borderRadius:18, display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 20px', color:'#E76F2E', border:'1px solid rgba(231,111,46,.15)', animation:'float 4s ease-in-out infinite' }}><IconGlobe/></div>
                <span style={{ fontSize:11, fontWeight:700, color:'#E76F2E', textTransform:'uppercase', letterSpacing:2, background:'rgba(231,111,46,.1)', padding:'4px 14px', borderRadius:20 }}>Bientôt disponible</span>
                <h2 style={{ fontSize:22, fontWeight:800, marginTop:16, marginBottom:10 }}>Audit SEO de site</h2>
                <p style={{ fontSize:13.5, color:t.txS, lineHeight:1.7, maxWidth:400, margin:'0 auto 28px' }}>Entrez l'URL d'un site et SeoPic scannera toutes vos images : alt text manquants, score SEO global, recommandations priorisées.</p>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:28, textAlign:'left' }}>
                  {['Scan automatique','Score par image','Alt text manquants','Export rapport PDF','Recommandations IA','Suivi dans le temps'].map((f,i) => (
                    <div key={i} style={{ display:'flex', gap:7, alignItems:'center', fontSize:12.5, color:t.txS }}>
                      <span style={{ color:'#E76F2E' }}>✓</span>{f}
                    </div>
                  ))}
                </div>
                <a href="https://wa.me/212669335438?text=Je%20veux%20l'audit%20SEO%20de%20site%20SeoPic" target="_blank" rel="noopener noreferrer" className="btn-primary" style={{ display:'inline-block', background:'linear-gradient(135deg,#E76F2E,#F2994A)', color:'#fff', textDecoration:'none', borderRadius:12, padding:'13px 28px', fontSize:13.5, fontWeight:700 }}>
                  M'avertir au lancement →
                </a>
              </div>
            </div>
          )}

          {/* ════════════ QUIZ SEO ════════════ */}
          {section === 'quiz' && (() => {
            const ALL_Q = [
              { cat:'Alt Text', q:"Quelle est la longueur idéale d'un alt text SEO ?", opts:['Moins de 30 caractères','Entre 80 et 125 caractères','Exactement 60 caractères','Plus de 200 caractères'], correct:1, exp:"Un alt text entre 80-125 caractères est idéal : assez descriptif pour Google, sans bourrage de mots-clés pénalisé." },
              { cat:'Format',   q:"Quel format d'image offre le meilleur compromis qualité/poids en 2024 ?", opts:['JPEG classique','PNG 24 bits','WebP','TIFF'], correct:2, exp:"WebP réduit le poids de 25-34% par rapport au JPEG à qualité égale — améliore directement le LCP, facteur Core Web Vitals." },
              { cat:'EXIF',     q:"EXIF signifie :", opts:['Extended File Info XML','Exchangeable Image File Format','External Image Fix','Expert Format Index'], correct:1, exp:"EXIF (Exchangeable Image File Format) est un standard qui stocke les métadonnées dans le fichier image : appareil, date, GPS, copyright." },
              { cat:'Core Web Vitals', q:"Quel indicateur Core Web Vitals est directement impacté par les images lentes ?", opts:['FID (First Input Delay)','CLS (Cumulative Layout Shift)','LCP (Largest Contentful Paint)','TTFB (Time To First Byte)'], correct:2, exp:"Le LCP mesure le temps d'affichage du plus grand élément visible — souvent une image hero. Google l'utilise comme signal de ranking depuis 2021." },
              { cat:'Nom fichier', q:"Quel nom de fichier est le plus optimisé SEO ?", opts:['IMG_20240301_001.jpg','photo.jpg','chaussure-running-nike-rouge.jpg','image_final_v2.png'], correct:2, exp:"Google lit le nom du fichier. 'chaussure-running-nike-rouge.jpg' indique la catégorie, la marque et la couleur — bien plus parlant qu''IMG_001.jpg'." },
              { cat:'Schema.org', q:"Quel balisage permet d'obtenir des images enrichies (rich snippets) dans Google ?", opts:['meta og:image','Schema.org ImageObject','robots.txt','sitemap.xml'], correct:1, exp:"Le balisage Schema.org ImageObject permet à Google d'afficher vos images comme rich snippets, augmentant le CTR de 15-30%." },
              { cat:'Lazy Load', q:"Le lazy loading des images améliore :", opts:['Le score SEO uniquement','Le LCP et l\'expérience utilisateur','Uniquement la vitesse mobile','Rien du tout'], correct:1, exp:"Le lazy loading retarde le chargement des images hors-écran, ce qui améliore le LCP et réduit la consommation de bande passante — facteur UX et SEO." },
              { cat:'Compression', q:"Quelle compression est la meilleure pour les photos sur le web ?", opts:['Sans compression (lossless)','JPEG à 40%','WebP à 75-85%','PNG compressé'], correct:2, exp:"WebP à 75-85% offre un rapport qualité/poids optimal. En dessous de 70%, les artefacts de compression deviennent visibles et nuisent à l'expérience." },
              { cat:'Sitemap', q:"Un sitemap image XML permet :", opts:['Rien de spécial','Bloquer l\'indexation des images','Indiquer à Google les images à indexer en priorité','Compresser automatiquement les images'], correct:2, exp:"Un sitemap image dédié (image:image) permet de soumettre jusqu'à 1000 images par URL à Google pour une indexation prioritaire et plus rapide." },
              { cat:'Dimension', q:"Quelle dimension est idéale pour une image hero de page d'accueil SEO ?", opts:['400×300px','800×600px','1200×630px ou plus','4000×3000px'], correct:2, exp:"1200×630px est la taille optimale : adaptée au partage social (OG), chargement raisonnable et qualité suffisante pour tous les écrans." },
              { cat:'CDN',      q:"Pourquoi utiliser un CDN pour ses images ?", opts:['Pour modifier les métadonnées','Réduire la latence géographique et améliorer le LCP','Pour convertir en WebP automatiquement','Pour générer des alt texts'], correct:1, exp:"Un CDN (Content Delivery Network) sert les images depuis le serveur le plus proche de l'utilisateur — réduit la latence de 40-70%, améliore le LCP." },
              { cat:'IPTC',     q:"Les données IPTC dans une image permettent de stocker :", opts:['La résolution uniquement','Le copyright, les mots-clés et la description','La palette de couleurs','Le format de compression'], correct:1, exp:"IPTC (International Press Telecommunications Council) est un standard professionnel pour stocker copyright, mots-clés, description et crédits dans l'image." },
              { cat:'Google Images', q:"Quel signal renforce le plus la visibilité dans Google Images ?", opts:['La taille du fichier','Le contexte textuel autour de l\'image + alt text pertinent','La date d\'upload','La couleur dominante'], correct:1, exp:"Google analyse le contexte : titre de la page, paragraphe adjacent, légende et alt text. Une image bien contextualisée est jusqu'à 3× plus visible." },
              { cat:'Responsive', q:"L'attribut srcset permet :", opts:['D\'ajouter plusieurs sources vidéo','De servir différentes tailles d\'images selon l\'écran','De bloquer certains navigateurs','D\'injecter des métadonnées'], correct:1, exp:"srcset permet au navigateur de choisir la meilleure résolution selon la taille d'écran et la densité de pixels — évite de charger de grandes images sur mobile." },
              { cat:'Copyright', q:"Injecter votre copyright dans les métadonnées EXIF permet :", opts:['Rien de juridique','De protéger vos droits et améliorer la traçabilité','D\'augmenter le poids du fichier','De bloquer le téléchargement'], correct:1, exp:"Le copyright EXIF protège légalement vos images et permet la traçabilité sur le web. C'est aussi un signal de confiance pour certains moteurs." },
            ]
            const QUESTIONS = ALL_Q.slice(quizIndex < ALL_Q.length ? 0 : 0, ALL_Q.length)
            const q = QUESTIONS[quizIndex]
            const total = QUESTIONS.length
            const pct = Math.round((quizScore / total) * 100)
            const grade = pct >= 80 ? { emoji:'🏆', label:'Expert SEO !', color:'#4ADE80', msg:'Impressionnant ! Vous maîtrisez le SEO image comme un professionnel.' }
              : pct >= 60 ? { emoji:'⭐', label:'Bon niveau !', color:'#FACC15', msg:'Bonne base ! Quelques points à consolider pour atteindre le niveau expert.' }
              : pct >= 40 ? { emoji:'📈', label:'En progression', color:'#E76F2E', msg:'Vous avancez bien. Consultez l\'Academy pour renforcer vos connaissances.' }
              : { emoji:'📚', label:'À renforcer', color:'#F87171', msg:'Pas de panique — l\'Academy est faite pour vous. Commencez par les modules gratuits !' }

            return (
              <div className="card-enter">
                {/* Header info */}
                {!quizDone && (
                  <div style={{ display:'flex', alignItems:'center', gap:16, marginBottom:20, background:t.sf, border:`1px solid ${t.bd}`, borderRadius:14, padding:'14px 20px' }}>
                    <div style={{ flex:1 }}>
                      <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:6 }}>
                        <span style={{ fontSize:12, color:t.txM }}>Question {quizIndex+1} / {total}</span>
                        <span style={{ fontSize:11, fontWeight:700, background:'rgba(231,111,46,.12)', color:'#E76F2E', padding:'2px 8px', borderRadius:6 }}>{q.cat}</span>
                      </div>
                      <div style={{ background:t.bd, borderRadius:4, height:6, overflow:'hidden' }}>
                        <div style={{ width:`${((quizIndex)/total)*100}%`, height:'100%', background:'linear-gradient(90deg,#E76F2E,#F2994A)', borderRadius:4, transition:'width .5s cubic-bezier(.16,1,.3,1)' }}/>
                      </div>
                    </div>
                    <div style={{ display:'flex', alignItems:'center', gap:6, background:'rgba(231,111,46,.08)', border:'1px solid rgba(231,111,46,.2)', borderRadius:10, padding:'8px 14px' }}>
                      <span style={{ fontSize:18 }}>🎯</span>
                      <div>
                        <p style={{ fontSize:10, color:t.txM, lineHeight:1 }}>Score</p>
                        <p style={{ fontSize:16, fontWeight:900, color:'#E76F2E', lineHeight:1.2 }}>{quizScore}<span style={{ fontSize:10, color:t.txM }}>/{quizIndex}</span></p>
                      </div>
                    </div>
                  </div>
                )}

                {quizDone ? (
                  <div style={{ background:t.sf, border:`1px solid ${t.bd}`, borderRadius:20, padding:'52px 40px', textAlign:'center', maxWidth:560, margin:'0 auto' }}>
                    <div style={{ fontSize:56, marginBottom:16, lineHeight:1 }}>{grade.emoji}</div>
                    <h2 style={{ fontSize:26, fontWeight:900, marginBottom:8, color:grade.color }}>{grade.label}</h2>
                    <p style={{ fontSize:14, color:t.txS, lineHeight:1.7, maxWidth:380, margin:'0 auto 28px' }}>{grade.msg}</p>
                    {/* Score ring */}
                    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:20, marginBottom:28 }}>
                      {(() => { const circ = 2*Math.PI*28; return (
                        <svg width="72" height="72" viewBox="0 0 72 72" style={{ transform:'rotate(-90deg)' }}>
                          <circle cx="36" cy="36" r="28" fill="none" stroke={t.bd} strokeWidth="5"/>
                          <circle cx="36" cy="36" r="28" fill="none" stroke={grade.color} strokeWidth="5" strokeDasharray={`${(pct/100)*circ} ${circ}`} strokeLinecap="round"/>
                          <text x="36" y="44" textAnchor="middle" style={{ fill:grade.color, fontSize:16, fontWeight:900, transform:'rotate(90deg)', transformOrigin:'36px 36px' }}>{pct}%</text>
                        </svg>
                      )})()}
                      <div style={{ textAlign:'left' }}>
                        <p style={{ fontSize:28, fontWeight:900 }}>{quizScore}<span style={{ fontSize:14, color:t.txM }}>/{total}</span></p>
                        <p style={{ fontSize:12, color:t.txM }}>bonnes réponses</p>
                      </div>
                    </div>
                    <div style={{ display:'flex', gap:10, justifyContent:'center', flexWrap:'wrap' }}>
                      <button onClick={() => { setQuizIndex(0); setQuizAnswer(null); setQuizScore(0); setQuizDone(false) }} className="btn-primary" style={{ background:'linear-gradient(135deg,#E76F2E,#F2994A)', color:'#fff', border:'none', borderRadius:12, padding:'12px 28px', fontSize:13.5, fontWeight:700, fontFamily:'inherit', cursor:'pointer' }}>
                        🔄 Recommencer
                      </button>
                      <button onClick={() => setSection('academy')} className="btn-ghost" style={{ background:'transparent', border:`1px solid ${t.bd}`, color:t.txS, borderRadius:12, padding:'12px 24px', fontSize:13.5, fontWeight:500, fontFamily:'inherit', cursor:'pointer' }}>
                        📚 Aller à l'Academy
                      </button>
                    </div>
                  </div>
                ) : (
                  <div style={{ background:t.sf, border:`1px solid ${t.bd}`, borderRadius:20, padding:'28px 28px' }}>
                    <p style={{ fontSize:17, fontWeight:700, lineHeight:1.55, marginBottom:22, color:t.tx }}>{q.q}</p>

                    <div style={{ display:'flex', flexDirection:'column', gap:9, marginBottom:20 }}>
                      {q.opts.map((opt,i) => {
                        const isSelected = quizAnswer === i
                        const isCorrect  = i === q.correct
                        const showResult = quizAnswer !== null
                        let bg = t.bg, border = `1px solid ${t.bd}`, color = t.tx, dot = t.txM
                        if (showResult && isCorrect)               { bg='rgba(74,222,128,.08)'; border='1.5px solid rgba(74,222,128,.5)'; color='#4ADE80'; dot='#4ADE80' }
                        else if (showResult && isSelected && !isCorrect) { bg='rgba(248,113,113,.08)'; border='1.5px solid rgba(248,113,113,.5)'; color='#F87171'; dot='#F87171' }
                        return (
                          <button key={i} disabled={quizAnswer!==null} onClick={() => { setQuizAnswer(i); if(i===q.correct) setQuizScore(s=>s+1) }}
                            style={{ background:bg, border, borderRadius:12, padding:'13px 16px', fontSize:13.5, fontWeight:500, color, fontFamily:'inherit', textAlign:'left', cursor:quizAnswer!==null?'default':'pointer', transition:'all .25s', display:'flex', alignItems:'center', gap:12 }}>
                            <span style={{ width:28, height:28, borderRadius:8, background: showResult&&isCorrect?'rgba(74,222,128,.15)':showResult&&isSelected&&!isCorrect?'rgba(248,113,113,.15)':'rgba(231,111,46,.08)', border:`1px solid ${dot}30`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, fontWeight:800, flexShrink:0, color:dot, transition:'all .25s' }}>
                              {String.fromCharCode(65+i)}
                            </span>
                            <span style={{ flex:1 }}>{opt}</span>
                            {showResult && isCorrect && <span style={{ fontSize:16, flexShrink:0 }}>✓</span>}
                            {showResult && isSelected && !isCorrect && <span style={{ fontSize:16, flexShrink:0 }}>✗</span>}
                          </button>
                        )
                      })}
                    </div>

                    {quizAnswer !== null && (
                      <>
                        <div style={{ background:'rgba(231,111,46,.05)', border:'1px solid rgba(231,111,46,.15)', borderRadius:12, padding:'14px 16px', marginBottom:16, display:'flex', gap:10, alignItems:'flex-start' }}>
                          <span style={{ fontSize:16, flexShrink:0 }}>💡</span>
                          <p style={{ fontSize:13, color:t.txS, lineHeight:1.65 }}>{q.exp}</p>
                        </div>
                        <button onClick={() => { if(quizIndex < total-1){ setQuizIndex(i=>i+1); setQuizAnswer(null) } else { setQuizDone(true) }}} className="btn-primary" style={{ width:'100%', background:'linear-gradient(135deg,#E76F2E,#F2994A)', color:'#fff', border:'none', borderRadius:12, padding:'13px 0', fontSize:14, fontWeight:700, fontFamily:'inherit', cursor:'pointer' }}>
                          {quizIndex < total-1 ? `Question suivante (${quizIndex+2}/${total}) →` : '🎯 Voir mes résultats'}
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>
            )
          })()}

          {/* ════════════ COMMUNAUTE ════════════ */}
          {section === 'communaute' && (
            <div className="card-enter" style={{ maxWidth:520, margin:'80px auto 0', textAlign:'center' }}>
              <div style={{ width:64, height:64, background:'rgba(231,111,46,.06)', borderRadius:18, display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 20px', color:'#E76F2E', border:`1px solid rgba(231,111,46,.15)` }}><IconUsers/></div>
              <span style={{ fontSize:11, fontWeight:700, color:'#E76F2E', textTransform:'uppercase', letterSpacing:2, background:'rgba(231,111,46,.1)', padding:'4px 14px', borderRadius:20 }}>Bientôt disponible</span>
              <h2 style={{ fontSize:22, fontWeight:800, marginTop:16, marginBottom:10 }}>La communauté SeoPic</h2>
              <p style={{ fontSize:13.5, color:t.txS, lineHeight:1.7 }}>Échangez avec d'autres créateurs, partagez vos stratégies SEO et accédez aux derniers hacks Google Images.</p>
            </div>
          )}

          {/* ════════════ PARAMETRES ════════════ */}
          {section === 'parametres' && (
            <div className="card-enter" style={{ maxWidth:540 }}>
              <div style={{ background:t.sf, border:`1px solid ${t.bd}`, borderRadius:16, overflow:'hidden' }}>
                {[{ label:'Nom', value: session?.user?.name || '—' }, { label:'Email', value: session?.user?.email || '—' }].map((item,i) => (
                  <div key={i} style={{ padding:'16px 20px', borderBottom:`1px solid ${t.bd}`, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                    <span style={{ fontSize:12.5, color:t.txM }}>{item.label}</span>
                    <span style={{ fontSize:13, fontWeight:500 }}>{item.value}</span>
                  </div>
                ))}
                <div style={{ padding:'16px 20px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                  <span style={{ fontSize:12.5, color:t.txM }}>Plan</span>
                  <span style={{ fontSize:12, fontWeight:700, color:'#E76F2E', background:'rgba(231,111,46,.1)', padding:'3px 10px', borderRadius:6 }}>Découverte</span>
                </div>
              </div>
              <button onClick={() => signOut({ callbackUrl:'/auth/signin' })} className="btn-ghost" style={{ marginTop:14, background:'transparent', border:`1px solid rgba(248,113,113,.25)`, color:'#F87171', borderRadius:10, padding:'11px 0', fontSize:13, fontWeight:500, fontFamily:'inherit', width:'100%' }}>
                Déconnexion
              </button>
            </div>
          )}

        </div>
      </main>
    </div>
  )
}
