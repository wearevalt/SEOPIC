'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'

/* ═══ THEMES ═══ */
const TH = {
  dark:  { bg:'#262624', bgA:'#1E1E1C', sf:'#2E2E2B', sfH:'#363633', tx:'#FAFAF9', txS:'#A8A89E', txM:'#6B6B63', bd:'#3A3A37', acG:'#E76F2E20' },
  light: { bg:'#FAFAF9', bgA:'#F0F0ED', sf:'#E8E8E4', sfH:'#DDDDD8', tx:'#262624', txS:'#6B6B63', txM:'#A8A89E', bd:'#D5D5D0', acG:'#E76F2E15' },
}
type Mode = 'dark' | 'light'

/* ═══ DATA ═══ */
const featuresData = [
  { icon:'image',  title:'Injection Métadonnées', desc:"EXIF, IPTC, XMP — mots-clés, description, copyright et géolocalisation injectés dans vos images." },
  { icon:'layers', title:'Traitement par Lot',    desc:"Optimisez 100+ images en un clic. Templates, export ZIP, gain de temps massif." },
  { icon:'zap',    title:'IA Suggestions',        desc:"L'IA analyse vos images et suggère les meilleurs mots-clés SEO automatiquement." },
  { icon:'activity',title:'Audit SEO Images',     desc:"Scannez un site et obtenez un rapport complet avec score SEO global." },
]

const plans = [
  { name:'Découverte', price:'0',        period:'/mois', hi:false, annual:null, feat:['5 analyses / mois','Injection EXIF + IPTC + XMP','Traitement par lot','AI Suggest','Audit SEO site','Academy gratuite'],                                                              cta:'Commencer gratuitement', pri:false },
  { name:'Pro',        price:'29',       period:'/mois', hi:true,  annual:'20', feat:['Analyses illimitées','Injection EXIF + IPTC + XMP','Bulk illimité','AI Suggest illimité','Audit SEO illimité','Academy Pro complète','Géolocalisation GPS','Support prioritaire'], cta:'Passer Pro',             pri:true  },
  { name:'Entreprise', price:'Sur devis',period:'',      hi:false, annual:null, feat:['Tout le plan Pro','White label','Accès API complet','Équipe illimitée','Account manager dédié','SLA & support dédié'],                                                              cta:'Nous contacter',         pri:false },
]

const reviews = [
  { name:'Karim B.',   role:'E-commerce', text:"Mes images sont enfin visibles sur Google Images. +340% de trafic en 2 mois." },
  { name:'Sophie L.',  role:'SEO',        text:"L'injection EXIF/IPTC que personne ne fait — SeoPic le fait en 2 clics." },
  { name:'Ahmed M.',   role:'Photographe',text:"Copyright injecté + visibilité. Double effet." },
  { name:'Laura D.',   role:'Blogueuse',  text:"La géolocalisation a boosté mon SEO local." },
  { name:'Youssef T.', role:'Agence',     text:"Le bulk nous fait gagner 3h/semaine. ROI immédiat." },
]

const socials = [
  { name:'Instagram', url:'https://instagram.com/seopic.io',  color:'#E1306C', count:'14.2k', thumbs:[
    { img:'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=400&q=80', cap:'Nouveau workflow SEO image 🔥', likes:'2.4k' },
    { img:'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&q=80', cap:'+340% trafic organique',        likes:'1.8k' },
    { img:'https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?w=400&q=80', cap:'Dominer Google Images',         likes:'3.1k' },
  ]},
  { name:'TikTok', url:'https://tiktok.com/@seopic.io', color:'#00F2EA', count:'28.5k', thumbs:[
    { img:'https://images.unsplash.com/photo-1553877522-43269d4ea984?w=400&q=80', cap:'SEO trick secret',    likes:'12k'  },
    { img:'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&q=80', cap:'Alt text en 30 sec',  likes:'8.5k' },
    { img:'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=400&q=80', cap:'Google Images hack',  likes:'15k'  },
  ]},
  { name:'YouTube', url:'https://youtube.com/@seopic.io', color:'#FF0000', count:'5.8k', thumbs:[
    { img:'https://images.unsplash.com/photo-1432888498266-38ffec3eaf0a?w=400&q=80', cap:'Tuto SEO images complet', likes:'890'  },
    { img:'https://images.unsplash.com/photo-1573164713988-8665fc963095?w=400&q=80', cap:'EXIF masterclass',        likes:'1.2k' },
    { img:'https://images.unsplash.com/photo-1559028012-481c04fa702d?w=400&q=80', cap:'Audit SEO en live',         likes:'2.1k' },
  ]},
]

/* ═══ SVG ICONS ═══ */
function IconImage()    { return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg> }
function IconLayers()   { return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg> }
function IconZap()      { return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg> }
function IconActivity() { return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg> }
function IconUpload()   { return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg> }
function IconChart()    { return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20V10"/><path d="M18 20V4"/><path d="M6 20v-4"/></svg> }
function IconDownload() { return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg> }

const featureIcons: Record<string, () => React.ReactElement> = { image:IconImage, layers:IconLayers, zap:IconZap, activity:IconActivity }
const stepIcons = [IconUpload, IconChart, IconDownload]

/* ═══ HOOKS ═══ */
function useInView(threshold = 0.1) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const el = ref.current; if (!el) return
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true) }, { threshold })
    obs.observe(el); return () => obs.disconnect()
  }, [threshold])
  return [ref, visible] as const
}

function useWindowWidth() {
  const [w, setW] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200)
  useEffect(() => {
    const h = () => setW(window.innerWidth)
    window.addEventListener('resize', h)
    return () => window.removeEventListener('resize', h)
  }, [])
  return w
}

function FadeIn({ children, delay = 0, style }: { children: React.ReactNode; delay?: number; style?: React.CSSProperties }) {
  const [ref, visible] = useInView()
  return (
    <div ref={ref} style={{ opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(22px)', transition: `opacity .65s ease ${delay}s, transform .65s cubic-bezier(.16,1,.3,1) ${delay}s`, ...style }}>
      {children}
    </div>
  )
}

function SBadge({ label }: { label: string }) {
  return (
    <div style={{ display:'inline-flex', alignItems:'center', gap:8, marginBottom:14 }}>
      <span className="bdot" style={{ width:6, height:6, borderRadius:'50%', background:'#E76F2E', boxShadow:'0 0 8px #E76F2E' }} />
      <span style={{ fontSize:11, color:'#E76F2E', fontWeight:700, letterSpacing:2.5, textTransform:'uppercase' }}>{label}</span>
    </div>
  )
}

/* ═══ MAIN ═══ */
export default function Home() {
  const { data: session } = useSession()
  const [mode, setMode]         = useState<Mode>('dark')
  const [annual, setAnnual]     = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [chatOpen, setChatOpen] = useState(false)
  const [activeStep, setActiveStep] = useState(0)
  const [socialTab, setSocialTab]   = useState(0)
  const [scrollY, setScrollY]   = useState(0)
  const [showTop, setShowTop]   = useState(false)

  const w   = useWindowWidth()
  const mob = w < 768
  const tab = w >= 768 && w < 1024
  const t   = TH[mode]
  const dk  = mode === 'dark'

  useEffect(() => {
    const h = () => { setScrolled(window.scrollY > 30); setScrollY(window.scrollY); setShowTop(window.scrollY > 400) }
    window.addEventListener('scroll', h, { passive:true })
    return () => window.removeEventListener('scroll', h)
  }, [])
  useEffect(() => { if (!mob) setMenuOpen(false) }, [mob])
  useEffect(() => {
    const ti = setInterval(() => setActiveStep(p => (p + 1) % 3), 2600)
    return () => clearInterval(ti)
  }, [])

  const goTo = useCallback((id: string) => {
    setMenuOpen(false)
    document.getElementById(id)?.scrollIntoView({ behavior:'smooth', block:'start' })
  }, [])
  const goTop = () => window.scrollTo({ top:0, behavior:'smooth' })

  const navOp = Math.min(0.92, 0.65 + scrollY * 0.0004)
  const navTx = dk ? 'rgba(255,255,255,.52)' : 'rgba(0,0,0,.5)'
  const navBd = dk ? 'rgba(255,255,255,.08)' : 'rgba(0,0,0,.08)'
  const navBg = dk ? 'rgba(255,255,255,.03)' : 'rgba(0,0,0,.03)'

  const stepsData = [
    { title:'Uploadez',             desc:"Glissez vos images ou entrez l'URL de votre site" },
    { title:'Analysez & Optimisez', desc:'Score SEO, mots-clés IA, métadonnées injectées' },
    { title:'Téléchargez',          desc:'Image optimisée en JPG injecté ou WebP compressé' },
  ]

  const navLinks = [
    { label:'Fonctionnalités',                            id:'feat'       },
    { label: tab ? 'Process' : 'Comment ça marche',      id:'how'        },
    { label:'Academy',                                    id:'academy'    },
    { label:'Tarifs',                                     id:'tarifs'     },
  ]

  return (
    <div style={{ background:t.bg, color:t.tx, minHeight:'100vh', fontFamily:"'Outfit',system-ui,sans-serif", transition:'background .4s,color .4s', overflowX:'hidden' }}>
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet" />
      <style>{`
        *{margin:0;padding:0;box-sizing:border-box}
        html{scroll-behavior:smooth;scroll-padding-top:80px}
        @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
        @keyframes bdot{0%,100%{opacity:.35;transform:scale(1)}50%{opacity:1;transform:scale(1.5)}}
        @keyframes glow{0%,100%{box-shadow:0 0 18px #E76F2E20}50%{box-shadow:0 0 36px #E76F2E50}}
        @keyframes slideM{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}
        @keyframes scanLine{0%{top:-2px;opacity:0}10%{opacity:1}90%{opacity:1}100%{top:calc(100% - 2px);opacity:0}}
        .bdot{animation:bdot 2.5s ease-in-out infinite}
        .ch{transition:transform .3s,box-shadow .3s,border-color .3s}
        .ch:hover{transform:translateY(-4px);box-shadow:0 12px 36px rgba(0,0,0,.15);border-color:#E76F2E30!important}
        .bp{transition:all .3s;cursor:pointer}
        .bp:hover{transform:translateY(-2px);box-shadow:0 6px 20px #E76F2E35}
        .gb{transition:all .3s;cursor:pointer}
        .gb:hover{background:#E76F2E10!important;color:#E76F2E!important}
        .nl{cursor:pointer;transition:color .2s}
        .nl:hover{color:#E76F2E!important}
        .rt{display:flex;gap:16px;animation:slideM 36s linear infinite;width:max-content}
        .rt:hover{animation-play-state:paused}
        .sb{transition:all .25s cubic-bezier(.16,1,.3,1)}
        .sb:hover{transform:translateY(-2px)}
        .tc{transition:all .25s cubic-bezier(.16,1,.3,1)}
        .tc:hover{transform:translateY(-3px);box-shadow:0 14px 36px rgba(0,0,0,.25)}
        .sc{position:relative;overflow:hidden;transition:all .6s cubic-bezier(.4,0,.2,1)}
        .sc .scl{position:absolute;left:0;right:0;height:2px;background:linear-gradient(90deg,transparent,#E76F2E,transparent);opacity:0;pointer-events:none}
        .sc.act .scl{animation:scanLine 2s ease-in-out infinite}
        .sc.act{border-color:#E76F2E50!important;box-shadow:0 0 30px #E76F2E12,0 12px 40px rgba(0,0,0,.08)!important}
        .fab-btn{width:42px;height:42px;border-radius:12px;display:flex;align-items:center;justify-content:center;cursor:pointer;transition:all .3s;border:none;font-family:inherit}
        .fab-btn:hover{transform:scale(1.08)}
        .glow-anim{animation:glow 3s infinite}
        .float-anim{animation:float 6s ease-in-out infinite}
      `}</style>

      {/* ══════ NAVBAR ══════ */}
      <nav style={{ position:'fixed', top:scrolled?10:16, left:'50%', transform:'translateX(-50%)', zIndex:1000, transition:'all .4s cubic-bezier(.4,0,.2,1)', width:mob?'calc(100% - 20px)':tab?'calc(100% - 48px)':'auto', maxWidth:880 }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:mob?8:14, background:dk?`rgba(38,38,36,${navOp})`:`rgba(245,245,243,${navOp})`, backdropFilter:`blur(${Math.min(20,10+scrollY*0.015)}px) saturate(1.4)`, border:`1px solid ${navBd}`, borderRadius:mob?18:50, padding:mob?'8px 14px':'8px 10px 8px 20px', boxShadow:scrolled?'0 8px 32px rgba(0,0,0,.15)':'0 4px 16px rgba(0,0,0,.06)', transition:'all .4s' }}>

          {/* Logo */}
          <a href="/" onClick={e => { e.preventDefault(); goTop() }} style={{ display:'flex', alignItems:'center', gap:8, textDecoration:'none', flexShrink:0 }}>
            <div style={{ width:32, height:32, background:'linear-gradient(135deg,#E76F2E,#C4581E)', borderRadius:9, display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 0 14px #E76F2E35' }}>
              <svg viewBox="0 0 20 20" fill="none" width="16" height="16">
                <path d="M4 14L8 9L11 12L16 6" stroke="white" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M13 6H16V9" stroke="white" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span style={{ fontWeight:800, fontSize:16, letterSpacing:-0.5, color:dk?'#EDE9E0':'#262624' }}>SEOPIC</span>
          </a>

          {/* Nav links (desktop) */}
          {!mob && (
            <div style={{ display:'flex', gap:18, alignItems:'center' }}>
              {navLinks.map(l => (
                <button key={l.id} onClick={() => goTo(l.id)} className="nl" style={{ background:'none', border:'none', color:navTx, fontSize:13, fontWeight:500, cursor:'pointer', fontFamily:'inherit', padding:0, whiteSpace:'nowrap' }}>
                  {l.label}
                </button>
              ))}
            </div>
          )}

          {/* Right side */}
          <div style={{ display:'flex', alignItems:'center', gap:7, flexShrink:0 }}>
            {/* Theme toggle */}
            <button onClick={() => setMode(dk ? 'light' : 'dark')} style={{ width:32, height:32, borderRadius:9, border:`1px solid ${navBd}`, background:navBg, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', color:navTx, transition:'.2s', flexShrink:0 }}>
              {dk
                ? <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32l1.41 1.41M2 12h2m16 0h2M4.93 19.07l1.41-1.41M18.36 5.64l1.41-1.41"/></svg>
                : <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
              }
            </button>
            {!mob && !session && (
              <Link href="/auth/signin" className="nl" style={{ background:'none', border:'none', color:navTx, fontSize:13, padding:'6px 8px', cursor:'pointer', fontFamily:'inherit', textDecoration:'none', whiteSpace:'nowrap' }}>
                Se connecter
              </Link>
            )}
            <Link href={session ? '/dashboard' : '/auth/signin'} className="bp" style={{ padding:'7px 16px', background:'linear-gradient(135deg,#E76F2E,#C4581E)', color:'#fff', textDecoration:'none', borderRadius:50, fontSize:13, fontWeight:700, boxShadow:'0 4px 14px #E76F2E35', display:'inline-block', whiteSpace:'nowrap', flexShrink:0 }}>
              {session ? (mob ? 'Dashboard' : 'Dashboard →') : (mob ? 'Lancer' : "Lancer l'app →")}
            </Link>
            {/* Hamburger */}
            {mob && (
              <button onClick={() => setMenuOpen(!menuOpen)} style={{ width:32, height:32, borderRadius:9, border:`1px solid ${navBd}`, background:navBg, cursor:'pointer', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:menuOpen?0:4 }}>
                <span style={{ width:13, height:2, background:navTx, borderRadius:1, transition:'all .3s', transform:menuOpen?'rotate(45deg) translateY(1px)':'none', display:'block' }}/>
                {!menuOpen && <span style={{ width:13, height:2, background:navTx, borderRadius:1, display:'block' }}/>}
                <span style={{ width:13, height:2, background:navTx, borderRadius:1, transition:'all .3s', transform:menuOpen?'rotate(-45deg) translateY(-1px)':'none', display:'block' }}/>
              </button>
            )}
          </div>
        </div>

        {/* Mobile menu */}
        {mob && menuOpen && (
          <div style={{ marginTop:6, background:dk?'rgba(46,46,43,.95)':'rgba(240,240,237,.95)', backdropFilter:'blur(20px)', border:`1px solid ${navBd}`, borderRadius:16, padding:8 }}>
            {navLinks.map(l => (
              <button key={l.id} onClick={() => goTo(l.id)} style={{ display:'block', width:'100%', background:'none', border:'none', color:navTx, fontSize:14, fontWeight:500, padding:'12px 14px', fontFamily:'inherit', textAlign:'left', cursor:'pointer', borderRadius:10 }}>
                {l.label}
              </button>
            ))}
            <div style={{ height:1, background:navBd, margin:'4px 10px' }}/>
            <Link href={session ? '/dashboard' : '/auth/signin'} style={{ display:'block', color:navTx, fontSize:14, fontWeight:500, padding:'12px 14px', textDecoration:'none' }}>
              {session ? 'Dashboard →' : 'Se connecter'}
            </Link>
          </div>
        )}
      </nav>

      {/* ══════ HERO ══════ */}
      <section style={{ minHeight:'100vh', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', textAlign:'center', padding:mob?'120px 18px 50px':'140px 28px 70px', position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', top:'10%', left:'50%', transform:'translateX(-50%)', width:mob?280:460, height:mob?280:460, borderRadius:'50%', background:'radial-gradient(circle,#E76F2E0D,transparent 70%)', filter:'blur(50px)', pointerEvents:'none' }}/>
        <div style={{ position:'absolute', inset:0, opacity:dk?.022:.03, backgroundImage:`linear-gradient(${t.txM} 1px,transparent 1px),linear-gradient(90deg,${t.txM} 1px,transparent 1px)`, backgroundSize:'50px 50px', pointerEvents:'none' }}/>

        <FadeIn>
          <div style={{ display:'inline-flex', alignItems:'center', gap:8, background:t.acG, border:'1px solid #E76F2E25', borderRadius:18, padding:'5px 14px', marginBottom:22, fontSize:mob?11:12 }}>
            <span className="bdot" style={{ width:5, height:5, borderRadius:'50%', background:'#E76F2E', boxShadow:'0 0 8px #E76F2E' }}/>
            <span style={{ color:'#E76F2E', fontWeight:600 }}>Injection IA de métadonnées SEO</span>
          </div>
        </FadeIn>

        <FadeIn delay={0.1}>
          <h1 style={{ fontSize:mob?34:tab?46:60, fontWeight:900, lineHeight:1.05, letterSpacing:-1.5, maxWidth:680, marginBottom:18 }}>
            Vos images méritent{mob?' ':(<br/>)}d&apos;être{' '}
            <span style={{ background:'linear-gradient(135deg,#E76F2E,#F2994A)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>trouvées</span>
          </h1>
        </FadeIn>

        <FadeIn delay={0.2}>
          <p style={{ fontSize:mob?14:16, color:t.txS, maxWidth:480, lineHeight:1.7, marginBottom:32 }}>
            SeoPic injecte les métadonnées SEO directement dans vos fichiers images. Ce que 95% des créateurs oublient.
          </p>
        </FadeIn>

        <FadeIn delay={0.3}>
          <div style={{ display:'flex', gap:10, flexWrap:'wrap', justifyContent:'center' }}>
            <Link href="/auth/signin" className="bp glow-anim" style={{ background:'linear-gradient(135deg,#E76F2E,#F2994A)', color:'#fff', border:'none', padding:mob?'12px 22px':'13px 28px', borderRadius:26, fontSize:mob?14:15, fontWeight:700, fontFamily:'inherit', textDecoration:'none' }}>
              Commencer gratuitement
            </Link>
            <button onClick={() => goTo('how')} className="gb" style={{ background:'transparent', color:t.tx, border:`1px solid ${t.bd}`, padding:mob?'12px 22px':'13px 28px', borderRadius:26, fontSize:mob?14:15, fontWeight:500, fontFamily:'inherit' }}>
              Voir la démo ▶
            </button>
          </div>
        </FadeIn>

        <FadeIn delay={0.4}>
          <div style={{ marginTop:36, display:'flex', gap:mob?14:32, justifyContent:'center', flexWrap:'wrap', color:t.txM, fontSize:mob?11:12.5 }}>
            {['Google Images +340%','22% du trafic mondial','1 min / image'].map((s,i) => (
              <div key={i} style={{ display:'flex', alignItems:'center', gap:6 }}>
                <span style={{ color:'#4ADE80', fontSize:10 }}>✓</span><span>{s}</span>
              </div>
            ))}
          </div>
        </FadeIn>

        {/* App mockup */}
        {!mob && (
          <FadeIn delay={0.5} style={{ width:'100%', maxWidth:760, marginTop:46 }}>
            <div className="float-anim" style={{ background:t.sf, border:`1px solid ${t.bd}`, borderRadius:14, padding:3, boxShadow:'0 18px 50px rgba(0,0,0,.15)' }}>
              <div style={{ background:t.sfH, borderRadius:12, padding:'10px 18px', display:'flex', alignItems:'center', gap:10, borderBottom:`1px solid ${t.bd}` }}>
                <div style={{ display:'flex', gap:5 }}>
                  {['#EF4444','#FACC15','#4ADE80'].map((c,i) => <div key={i} style={{ width:8, height:8, borderRadius:'50%', background:c, opacity:.55 }}/>)}
                </div>
                <div style={{ flex:1, background:t.bg, borderRadius:6, padding:'4px 10px', fontSize:11, color:t.txM, textAlign:'center' }}>app.seopic.io/optimizer</div>
              </div>
              <div style={{ padding:24, display:'flex', gap:18 }}>
                <div style={{ flex:'1 1 180px', minHeight:90, background:t.bg, borderRadius:10, border:`2px dashed ${t.bd}`, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:6, padding:18 }}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={t.txM} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity:.5 }}>
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
                  </svg>
                  <div style={{ color:t.txM, fontSize:11 }}>Glissez vos images ici</div>
                </div>
                <div style={{ flex:'1 1 180px', display:'flex', flexDirection:'column', gap:7 }}>
                  {['SEO Score','Alt Text','Meta Title','Keywords'].map((l,i) => (
                    <div key={i} style={{ background:t.bg, borderRadius:6, padding:'8px 10px', border:`1px solid ${t.bd}`, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                      <span style={{ fontSize:10.5, color:t.txS }}>{l}</span>
                      <div style={{ width:44, height:4, borderRadius:2, background:i===0?'linear-gradient(90deg,#E76F2E,#4ADE80)':t.bd }}/>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </FadeIn>
        )}
      </section>

      {/* ══════ FEATURES ══════ */}
      <section id="feat" style={{ padding:mob?'50px 18px':'80px 28px', maxWidth:1020, margin:'0 auto' }}>
        <FadeIn>
          <div style={{ textAlign:'center', marginBottom:42 }}>
            <SBadge label="Fonctionnalités"/>
            <h2 style={{ fontSize:mob?24:tab?32:38, fontWeight:800, letterSpacing:-0.8, lineHeight:1.15 }}>
              Tout pour <span style={{ color:'#E76F2E' }}>dominer</span> Google Images
            </h2>
          </div>
        </FadeIn>
        <div style={{ display:'grid', gridTemplateColumns:mob?'1fr':tab?'1fr 1fr':'repeat(4,1fr)', gap:14 }}>
          {featuresData.map((f,i) => {
            const Ic = featureIcons[f.icon]
            return (
              <FadeIn key={i} delay={i*0.07}>
                <div className="ch" style={{ background:t.sf, border:`1px solid ${t.bd}`, borderRadius:14, padding:22, height:'100%' }}>
                  <div style={{ width:40, height:40, borderRadius:10, background:t.acG, border:'1px solid #E76F2E20', display:'flex', alignItems:'center', justifyContent:'center', color:'#E76F2E', marginBottom:14 }}>
                    <Ic/>
                  </div>
                  <h3 style={{ fontSize:14.5, fontWeight:700, marginBottom:7 }}>{f.title}</h3>
                  <p style={{ fontSize:12.5, color:t.txS, lineHeight:1.6 }}>{f.desc}</p>
                </div>
              </FadeIn>
            )
          })}
        </div>
      </section>

      {/* ══════ STEPS ══════ */}
      <section id="how" style={{ padding:mob?'50px 18px':'80px 28px', background:t.bgA, transition:'background .4s' }}>
        <div style={{ maxWidth:900, margin:'0 auto' }}>
          <FadeIn>
            <div style={{ textAlign:'center', marginBottom:50 }}>
              <SBadge label="Comment ça marche"/>
              <h2 style={{ fontSize:mob?24:tab?32:38, fontWeight:800, letterSpacing:-0.8 }}>
                3 étapes. 1 minute. <span style={{ color:'#E76F2E' }}>C&apos;est tout.</span>
              </h2>
            </div>
          </FadeIn>
          <FadeIn delay={0.1}>
            <div style={{ display:'flex', flexDirection:'column', gap:mob?16:20 }}>
              {stepsData.map((s,i) => {
                const isAct = activeStep === i
                const isDone = activeStep > i
                const Ic = stepIcons[i]
                return (
                  <div key={i} className={`sc${isAct?' act':''}`} style={{ background:dk?(isAct?'rgba(231,111,46,.06)':'rgba(255,255,255,.02)'):(isAct?'rgba(231,111,46,.05)':'rgba(0,0,0,.02)'), border:`1px solid ${isAct?'#E76F2E40':isDone?'#E76F2E25':dk?'rgba(255,255,255,.06)':'rgba(0,0,0,.06)'}`, borderRadius:16, padding:mob?'20px':'24px 32px', display:'flex', alignItems:'center', gap:mob?20:32 }}>
                    <div className="scl"/>
                    <span style={{ fontSize:mob?40:52, fontWeight:900, lineHeight:1, letterSpacing:-3, transition:'all .6s', color:isAct||isDone?'#E76F2E':'transparent', WebkitTextStroke:isAct||isDone?'none':`1.5px ${dk?'rgba(255,255,255,.1)':'rgba(0,0,0,.1)'}`, textShadow:isAct?'0 0 30px #E76F2E30':'none', flexShrink:0 }}>0{i+1}</span>
                    <div style={{ width:2, height:mob?40:52, borderRadius:1, background:isAct?'linear-gradient(180deg,#E76F2E,transparent)':isDone?'#E76F2E30':dk?'rgba(255,255,255,.06)':'rgba(0,0,0,.06)', flexShrink:0, transition:'background .6s' }}/>
                    <div style={{ width:mob?44:52, height:mob?44:52, borderRadius:14, flexShrink:0, background:isAct?'linear-gradient(135deg,#E76F2E,#F2994A)':isDone?'#E76F2E18':dk?'rgba(255,255,255,.04)':'rgba(0,0,0,.04)', border:isAct?'none':`1px solid ${isDone?'#E76F2E30':dk?'rgba(255,255,255,.06)':'rgba(0,0,0,.06)'}`, display:'flex', alignItems:'center', justifyContent:'center', color:isAct?'#fff':isDone?'#E76F2E':t.txM, transition:'all .6s', boxShadow:isAct?'0 8px 24px #E76F2E30':'none' }}>
                      <Ic/>
                    </div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <h3 style={{ fontSize:mob?15:17, fontWeight:700, marginBottom:4, color:isAct||isDone?t.tx:t.txS, transition:'color .6s' }}>{s.title}</h3>
                      <p style={{ fontSize:mob?12:13, color:t.txM, lineHeight:1.55 }}>{s.desc}</p>
                    </div>
                    <div style={{ flexShrink:0, width:mob?8:10, height:mob?8:10, borderRadius:'50%', transition:'all .6s', background:isAct?'#E76F2E':isDone?'#4ADE80':'transparent', border:isAct||isDone?'none':`2px solid ${dk?'rgba(255,255,255,.1)':'rgba(0,0,0,.1)'}`, boxShadow:isAct?'0 0 12px #E76F2E50':isDone?'0 0 8px #4ADE8040':'none' }}/>
                  </div>
                )
              })}
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ══════ ACADEMY ══════ */}
      <section id="academy" style={{ padding:mob?'50px 18px':'80px 28px', maxWidth:1020, margin:'0 auto' }}>
        <FadeIn>
          <div style={{ textAlign:'center', marginBottom:42 }}>
            <SBadge label="Academy"/>
            <h2 style={{ fontSize:mob?24:tab?32:38, fontWeight:800, letterSpacing:-0.8, marginBottom:10 }}>
              Devenez un <span style={{ color:'#E76F2E' }}>expert</span> SEO Images
            </h2>
            <p style={{ fontSize:14, color:t.txS, maxWidth:420, margin:'0 auto' }}>Formations gratuites et premium pour booster votre trafic.</p>
          </div>
        </FadeIn>
        <FadeIn delay={0.1}>
          <div style={{ background:t.sf, border:`1px solid ${t.bd}`, borderRadius:16, overflow:'hidden', display:'flex', flexDirection:mob?'column':'row' }}>
            <div style={{ flex:'1 1 360px', minHeight:mob?180:280, background:t.bgA, display:'flex', alignItems:'center', justifyContent:'center', position:'relative', cursor:'pointer' }}>
              <div style={{ position:'absolute', inset:0, background:'linear-gradient(135deg,#E76F2E0C,transparent)' }}/>
              <div style={{ width:56, height:56, borderRadius:'50%', background:'linear-gradient(135deg,#E76F2E,#F2994A)', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 6px 22px #E76F2E30', zIndex:1 }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="#fff"><polygon points="5 3 19 12 5 21 5 3"/></svg>
              </div>
            </div>
            <div style={{ flex:'1 1 260px', padding:mob?18:22 }}>
              <h3 style={{ fontSize:16, fontWeight:700, marginBottom:14 }}>Formations populaires</h3>
              {[{t:'SEO Images 101',d:'45 min',f:true},{t:'EXIF, IPTC, XMP décryptés',d:'30 min',f:true},{t:"Google Images : mine d'or",d:'25 min',f:false},{t:'Audit SEO avancé',d:'1h 20',f:false}].map((c,i) => (
                <div key={i} style={{ display:'flex', alignItems:'center', gap:10, padding:'9px 0', borderBottom:i<3?`1px solid ${t.bd}`:'none' }}>
                  <div style={{ width:30, height:30, borderRadius:7, flexShrink:0, background:c.f?'#4ADE8015':'#E76F2E15', display:'flex', alignItems:'center', justifyContent:'center' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={c.f?'#4ADE80':'#E76F2E'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                  </div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontSize:12.5, fontWeight:600, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{c.t}</div>
                    <div style={{ fontSize:10.5, color:t.txM }}>{c.d}</div>
                  </div>
                  <span style={{ fontSize:10, fontWeight:600, padding:'2px 7px', borderRadius:8, background:c.f?'#4ADE8010':'#E76F2E10', color:c.f?'#4ADE80':'#E76F2E', flexShrink:0 }}>{c.f?'Gratuit':'Pro'}</span>
                </div>
              ))}
              <Link href="/auth/signin" className="bp" style={{ display:'block', textAlign:'center', width:'100%', marginTop:14, background:'linear-gradient(135deg,#E76F2E,#F2994A)', color:'#fff', textDecoration:'none', padding:'10px 18px', borderRadius:10, fontSize:12.5, fontWeight:600 }}>
                Accéder aux formations →
              </Link>
            </div>
          </div>
        </FadeIn>
      </section>

      {/* ══════ PRICING ══════ */}
      <section id="tarifs" style={{ padding:mob?'50px 18px':'80px 28px', background:t.bgA, transition:'background .4s' }}>
        <div style={{ maxWidth:940, margin:'0 auto' }}>
          <FadeIn>
            <div style={{ textAlign:'center', marginBottom:32 }}>
              <SBadge label="Tarifs"/>
              <h2 style={{ fontSize:mob?24:tab?32:38, fontWeight:800, letterSpacing:-0.8, marginBottom:16 }}>
                Un plan pour chaque <span style={{ color:'#E76F2E' }}>ambition</span>
              </h2>
              <div style={{ display:'inline-flex', alignItems:'center', gap:3, background:t.sf, borderRadius:26, padding:3, border:`1px solid ${t.bd}` }}>
                <button onClick={() => setAnnual(false)} style={{ padding:'6px 16px', borderRadius:20, border:'none', cursor:'pointer', background:!annual?'#E76F2E':'transparent', color:!annual?'#fff':t.txS, fontSize:12, fontWeight:600, fontFamily:'inherit', transition:'all .3s' }}>Mensuel</button>
                <button onClick={() => setAnnual(true)}  style={{ padding:'6px 16px', borderRadius:20, border:'none', cursor:'pointer', background:annual?'#E76F2E':'transparent',  color:annual?'#fff':t.txS,  fontSize:12, fontWeight:600, fontFamily:'inherit', transition:'all .3s' }}>
                  Annuel <span style={{ background:'rgba(255,255,255,.15)', color:'#fff', padding:'2px 6px', borderRadius:6, fontSize:10, marginLeft:2 }}>-30%</span>
                </button>
              </div>
            </div>
          </FadeIn>
          <div style={{ display:'grid', gridTemplateColumns:mob?'1fr':'repeat(3,1fr)', gap:14, alignItems:'stretch' }}>
            {plans.map((p,i) => {
              const showPrice = annual && p.annual ? p.annual : p.price
              const isCustom = p.price === 'Sur devis'
              return (
                <FadeIn key={i} delay={i*0.07}>
                  <div className="ch" style={{ background:p.hi?(dk?'#33261E':'#FFF5EE'):t.sf, border:p.hi?'2px solid #E76F2E45':`1px solid ${t.bd}`, borderRadius:16, padding:mob?22:26, position:'relative', height:'100%', display:'flex', flexDirection:'column' }}>
                    {p.hi && <div style={{ position:'absolute', top:-11, left:'50%', transform:'translateX(-50%)', background:'linear-gradient(135deg,#E76F2E,#F2994A)', color:'#fff', fontSize:10, fontWeight:700, padding:'3px 12px', borderRadius:10, whiteSpace:'nowrap' }}>⭐ Populaire</div>}
                    <div style={{ fontSize:12.5, fontWeight:600, color:t.txS, marginBottom:5 }}>{p.name}</div>
                    <div style={{ display:'flex', alignItems:'baseline', gap:3, marginBottom:16 }}>
                      {isCustom
                        ? <span style={{ fontSize:20, fontWeight:800 }}>{p.price}</span>
                        : <span style={{ display:'flex', alignItems:'baseline', gap:3 }}>
                            <span style={{ fontSize:34, fontWeight:900 }}>{showPrice}</span>
                            <span style={{ color:t.txM, fontSize:13 }}>€{p.period}</span>
                            {annual && p.annual && <span style={{ color:t.txM, fontSize:11, textDecoration:'line-through', marginLeft:3 }}>{p.price}€</span>}
                          </span>
                      }
                    </div>
                    <div style={{ flex:1 }}>
                      {p.feat.map((f,j) => (
                        <div key={j} style={{ display:'flex', gap:6, padding:'4px 0', fontSize:12, color:t.txS, lineHeight:1.5 }}>
                          <span style={{ color:'#E76F2E', flexShrink:0 }}>✓</span>{f}
                        </div>
                      ))}
                    </div>
                    <Link href="/auth/signin" className={p.pri?'bp':'gb'} style={{ display:'block', textAlign:'center', width:'100%', marginTop:16, padding:'10px 0', borderRadius:10, fontSize:12.5, fontWeight:600, fontFamily:'inherit', textDecoration:'none', background:p.pri?'linear-gradient(135deg,#E76F2E,#F2994A)':'transparent', color:p.pri?'#fff':t.tx, border:p.pri?'none':`1px solid ${t.bd}` }}>
                      {p.cta}
                    </Link>
                  </div>
                </FadeIn>
              )
            })}
          </div>
        </div>
      </section>

      {/* ══════ REVIEWS ══════ */}
      <section style={{ padding:mob?'50px 0':'70px 0', overflow:'hidden' }}>
        <FadeIn>
          <div style={{ textAlign:'center', marginBottom:36, padding:'0 18px' }}>
            <SBadge label="Avis clients"/>
            <h2 style={{ fontSize:mob?24:34, fontWeight:800, letterSpacing:-0.8 }}>
              Ils dominent Google avec <span style={{ color:'#E76F2E' }}>SeoPic</span>
            </h2>
          </div>
        </FadeIn>
        <div style={{ overflow:'hidden', padding:'6px 0' }}>
          <div className="rt">
            {[...reviews, ...reviews].map((r,i) => (
              <div key={i} style={{ background:t.sf, border:`1px solid ${t.bd}`, borderRadius:14, padding:18, width:mob?250:270, flexShrink:0 }}>
                <div style={{ color:'#FACC15', marginBottom:8, letterSpacing:2, fontSize:12 }}>★★★★★</div>
                <p style={{ fontSize:12.5, color:t.txS, lineHeight:1.6, marginBottom:12 }}>&ldquo;{r.text}&rdquo;</p>
                <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                  <div style={{ width:30, height:30, borderRadius:'50%', background:'linear-gradient(135deg,#E76F2E20,#F2994A20)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, fontWeight:700, color:'#E76F2E' }}>{r.name[0]}</div>
                  <div>
                    <div style={{ fontSize:11.5, fontWeight:600 }}>{r.name}</div>
                    <div style={{ fontSize:10, color:t.txM }}>{r.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════ SUIVEZ-NOUS ══════ */}
      <section id="social" style={{ padding:mob?'30px 18px 50px':'50px 28px 70px', maxWidth:900, margin:'0 auto' }}>
        <FadeIn>
          <div style={{ textAlign:'center', marginBottom:28 }}>
            <SBadge label="Suivez-nous"/>
            <h2 style={{ fontSize:mob?24:34, fontWeight:800, letterSpacing:-0.8, marginBottom:8 }}>
              Tips exclusifs, études de cas{mob?' ':(<br/>)}<span style={{ color:'#E76F2E' }}>et hacks SEO.</span>
            </h2>
            <p style={{ fontSize:13.5, color:t.txS, maxWidth:420, margin:'0 auto' }}>Du contenu quotidien pour dominer Google Images.</p>
          </div>
        </FadeIn>

        {/* Profile banner */}
        <FadeIn delay={0.1}>
          <div style={{ background:dk?'rgba(255,255,255,.025)':'rgba(0,0,0,.02)', border:`1px solid ${dk?'rgba(255,255,255,.06)':'rgba(0,0,0,.06)'}`, borderRadius:18, padding:mob?'14px 16px':'16px 22px', display:'flex', alignItems:'center', justifyContent:'space-between', gap:14, marginBottom:18, flexWrap:'wrap' }}>
            <div style={{ display:'flex', alignItems:'center', gap:14 }}>
              <div style={{ width:48, height:48, borderRadius:'50%', background:'linear-gradient(135deg,#E76F2E,#C4581E)', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 0 16px #E76F2E35', flexShrink:0 }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M5 18L9.5 11L13 14.5L19 6" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <circle cx="19" cy="6" r="2" fill="#fff"/>
                </svg>
              </div>
              <div>
                <div style={{ fontWeight:700, fontSize:14 }}>SeoPic.io <span style={{ fontSize:10, color:'#E76F2E', background:'#E76F2E15', padding:'2px 6px', borderRadius:6, marginLeft:4 }}>Officiel</span></div>
                <div style={{ fontSize:11.5, color:t.txM, marginTop:2 }}>@seopic.io · L&apos;outil SEO images #1</div>
              </div>
            </div>
            <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
              {socials.map(s => (
                <a key={s.name} href={s.url} target="_blank" rel="noopener noreferrer" className="sb" style={{ padding:'7px 14px', borderRadius:9, border:`1px solid ${dk?'rgba(255,255,255,.07)':'rgba(0,0,0,.07)'}`, background:'transparent', color:t.txM, textDecoration:'none', fontSize:12, fontWeight:500 }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor=s.color; e.currentTarget.style.color=s.color; e.currentTarget.style.boxShadow=`0 0 12px ${s.color}25` }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor=dk?'rgba(255,255,255,.07)':'rgba(0,0,0,.07)'; e.currentTarget.style.color=t.txM; e.currentTarget.style.boxShadow='none' }}>
                  {s.name}
                </a>
              ))}
            </div>
          </div>
        </FadeIn>

        {/* Tabs */}
        <FadeIn delay={0.18}>
          <div style={{ display:'flex', gap:6, marginBottom:16, flexWrap:'wrap' }}>
            {socials.map((s,i) => (
              <button key={i} onClick={() => setSocialTab(i)} className="sb" style={{ padding:'8px 16px', borderRadius:9, cursor:'pointer', fontFamily:'inherit', fontSize:13, transition:'all .25s', border:socialTab===i?`1px solid ${s.color}50`:`1px solid ${dk?'rgba(255,255,255,.07)':'rgba(0,0,0,.07)'}`, background:socialTab===i?`${s.color}10`:'transparent', color:socialTab===i?s.color:t.txM, fontWeight:socialTab===i?600:400 }}>
                {s.name} <span style={{ fontSize:10.5, opacity:.5, marginLeft:4 }}>{s.count}</span>
              </button>
            ))}
          </div>
        </FadeIn>

        {/* Photo grid */}
        <FadeIn delay={0.24}>
          <div style={{ display:'grid', gridTemplateColumns:mob?'1fr':'repeat(3,1fr)', gap:12 }}>
            {socials[socialTab].thumbs.map((th,i) => (
              <div key={`${socialTab}-${i}`} className="tc" style={{ background:dk?'rgba(255,255,255,.025)':'rgba(0,0,0,.02)', border:`1px solid ${dk?'rgba(255,255,255,.06)':'rgba(0,0,0,.06)'}`, borderRadius:14, overflow:'hidden', cursor:'pointer' }}>
                <div style={{ position:'relative', paddingTop:'68%', overflow:'hidden' }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={th.img} alt={th.cap} loading="lazy" style={{ position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'cover' }}/>
                  <div style={{ position:'absolute', top:8, right:8, background:'rgba(0,0,0,.6)', backdropFilter:'blur(4px)', borderRadius:6, padding:'3px 8px', fontSize:10.5, color:'#fff', fontWeight:600, display:'flex', alignItems:'center', gap:3 }}>
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="#fff"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                    {th.likes}
                  </div>
                </div>
                <div style={{ padding:'10px 12px' }}>
                  <p style={{ fontSize:12, color:t.txS, lineHeight:1.5 }}>{th.cap}</p>
                </div>
              </div>
            ))}
          </div>
        </FadeIn>
      </section>

      {/* ══════ CTA FINAL ══════ */}
      <section style={{ padding:mob?'40px 18px 60px':'60px 28px 80px', textAlign:'center', position:'relative' }}>
        <div style={{ position:'absolute', inset:0, background:'radial-gradient(ellipse at center,#E76F2E0A,transparent 60%)', pointerEvents:'none' }}/>
        <FadeIn>
          <h2 style={{ fontSize:mob?26:tab?38:46, fontWeight:900, letterSpacing:-1, maxWidth:600, margin:'0 auto 16px', lineHeight:1.1 }}>
            Vos images méritent{mob?' ':(<br/>)}d&apos;être <span style={{ color:'#E76F2E' }}>vues</span>
          </h2>
          <p style={{ fontSize:mob?13:15, color:t.txS, maxWidth:400, margin:'0 auto 28px', lineHeight:1.7 }}>Gratuit, sans carte bancaire.</p>
          <Link href="/auth/signin" className="bp glow-anim" style={{ display:'inline-block', background:'linear-gradient(135deg,#E76F2E,#F2994A)', color:'#fff', textDecoration:'none', padding:mob?'13px 26px':'14px 34px', borderRadius:26, fontSize:mob?14:15, fontWeight:700 }}>
            Commencer gratuitement →
          </Link>
        </FadeIn>
      </section>

      {/* ══════ FOOTER ══════ */}
      <footer style={{ borderTop:`1px solid ${t.bd}`, padding:mob?'36px 18px 22px':'48px 28px 24px', background:t.bgA }}>
        <div style={{ maxWidth:1020, margin:'0 auto' }}>
          <div style={{ display:'flex', flexWrap:'wrap', gap:mob?28:40, marginBottom:36 }}>
            {/* Brand */}
            <div style={{ flex:'1 1 200px' }}>
              <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:12 }}>
                <div style={{ width:32, height:32, borderRadius:8, background:'linear-gradient(135deg,#E76F2E,#F2994A)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                  <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
                    <path d="M4 14L8 9L11 12L16 6" stroke="white" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M13 6H16V9" stroke="white" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <span style={{ fontSize:17, fontWeight:800, letterSpacing:-0.5, color:dk?'#EDE9E0':'#262624' }}>SEOPIC</span>
              </div>
              <p style={{ color:t.txM, fontSize:12, lineHeight:1.7, maxWidth:240 }}>Injectez les métadonnées SEO dans vos images. Dominez Google Images.</p>
              <div style={{ display:'flex', gap:7, marginTop:14 }}>
                {[{l:'𝕏',c:dk?'#fff':'#000'},{l:'in',c:'#0A66C2'},{l:'ig',c:'#E1306C'},{l:'tk',c:'#00F2EA'},{l:'▶',c:'#FF0000'}].map((s,i) => (
                  <div key={i} className="sb" style={{ width:30, height:30, borderRadius:'50%', border:`1px solid ${t.bd}`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, color:t.txM, cursor:'pointer', transition:'all .25s' }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor=s.c; e.currentTarget.style.color=s.c; e.currentTarget.style.boxShadow=`0 0 10px ${s.c}20` }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor=t.bd; e.currentTarget.style.color=t.txM; e.currentTarget.style.boxShadow='none' }}>
                    {s.l}
                  </div>
                ))}
              </div>
            </div>

            {/* Columns */}
            {[
              { title:'Produit',    links:['Fonctionnalités','Tarifs','Academy','API'] },
              { title:'Ressources', links:['Blog SEO','Guides','Support','Communauté'] },
              { title:'Légal',      links:['À propos','Contact','Confidentialité','CGU'] },
            ].map((col,i) => (
              <div key={i} style={{ flex:'0 0 110px' }}>
                <div style={{ fontSize:11.5, fontWeight:700, marginBottom:12, color:t.tx }}>{col.title}</div>
                {col.links.map((l,j) => (
                  <div key={j} className="nl" style={{ fontSize:11.5, color:t.txM, padding:'3px 0', cursor:'pointer' }}>{l}</div>
                ))}
              </div>
            ))}
          </div>
          <div style={{ borderTop:`1px solid ${t.bd}`, paddingTop:18, textAlign:'center' }}>
            <span style={{ fontSize:10.5, color:t.txM }}>© 2026 SeoPic — Crafted by <span style={{ fontWeight:600, color:t.txS }}>VALT Agency</span>, Tanger</span>
          </div>
        </div>
      </footer>

      {/* ══════ FAB — CHAT + SCROLL TOP ══════ */}
      <div style={{ position:'fixed', bottom:mob?16:24, right:mob?16:24, zIndex:999, display:'flex', flexDirection:'column', gap:8, alignItems:'flex-end' }}>

        {/* Chat popup */}
        {chatOpen && (
          <div style={{ width:mob?260:280, background:dk?'rgba(46,46,43,.97)':'rgba(245,245,243,.97)', backdropFilter:'blur(24px)', border:`1px solid ${dk?'rgba(255,255,255,.08)':'rgba(0,0,0,.08)'}`, borderRadius:16, padding:18, boxShadow:'0 16px 48px rgba(0,0,0,.2)', marginBottom:4 }}>
            <div style={{ fontSize:14, fontWeight:700, marginBottom:4, color:t.tx }}>Une question ?</div>
            <p style={{ fontSize:12, color:t.txS, marginBottom:14, lineHeight:1.6 }}>Réponse rapide sur WhatsApp — l&apos;équipe VALT répond en quelques minutes.</p>
            <a href="https://wa.me/212669335438?text=Bonjour%20!%20Question%20sur%20SeoPic" target="_blank" rel="noopener noreferrer" className="bp" style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:8, width:'100%', padding:'10px 0', borderRadius:10, background:'#25D366', color:'#fff', textDecoration:'none', fontSize:13, fontWeight:600 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="#fff"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
              Ouvrir WhatsApp
            </a>
          </div>
        )}

        {/* Button group */}
        <div style={{ display:'flex', gap:8, padding:6, background:dk?'rgba(46,46,43,.88)':'rgba(245,245,243,.88)', backdropFilter:'blur(16px)', border:`1px solid ${dk?'rgba(255,255,255,.08)':'rgba(0,0,0,.08)'}`, borderRadius:16, boxShadow:'0 8px 28px rgba(0,0,0,.12)' }}>

          {/* Chat */}
          <button onClick={() => setChatOpen(!chatOpen)} className="fab-btn" style={{ background:chatOpen?'transparent':'linear-gradient(135deg,#E76F2E,#F2994A)', border:chatOpen?`1px solid ${dk?'rgba(255,255,255,.1)':'rgba(0,0,0,.1)'}`:'none', color:chatOpen?t.txM:'#fff' }}>
            {chatOpen
              ? <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              : <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
            }
          </button>

          {/* Scroll to top */}
          <button onClick={goTop} className="fab-btn" style={{ background:'transparent', border:`1px solid ${dk?'rgba(255,255,255,.1)':'rgba(0,0,0,.1)'}`, color:t.txM, opacity:showTop?1:0, pointerEvents:showTop?'auto':'none', transition:'opacity .3s,transform .3s', transform:showTop?'translateY(0)':'translateY(8px)' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="18 15 12 9 6 15"/></svg>
          </button>
        </div>
      </div>
    </div>
  )
}
