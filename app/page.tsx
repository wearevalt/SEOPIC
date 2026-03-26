'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'

/* ── Animation hook ── */
function useInView(threshold = 0.1) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true) },
      { threshold }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [threshold])
  return [ref, visible] as const
}

function FadeIn({ children, delay = 0, className = '', style }: { children: React.ReactNode; delay?: number; className?: string; style?: React.CSSProperties }) {
  const [ref, visible] = useInView()
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(22px)',
        transition: `opacity .65s ease ${delay}s, transform .65s cubic-bezier(.16,1,.3,1) ${delay}s`,
        ...style,
      }}
    >
      {children}
    </div>
  )
}

function Badge({ label }: { label: string }) {
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#E76F2E', boxShadow: '0 0 8px #E76F2E', animation: 'pulse 2.5s ease-in-out infinite', display: 'inline-block' }} />
      <span style={{ fontSize: 11, color: '#E76F2E', fontWeight: 700, letterSpacing: 2.5, textTransform: 'uppercase' }}>{label}</span>
    </div>
  )
}

const features = [
  { icon: '🎯', title: 'Alt Text optimisé', desc: 'Descriptions précises et accessibles, limitées à 125 caractères pour Google.' },
  { icon: '📝', title: 'Meta Title & Description', desc: 'Title en 60 caractères, description en 160 — calibrés pour les moteurs de recherche.' },
  { icon: '🔑', title: 'Keywords SEO', desc: '5 à 8 mots-clés ciblés extraits automatiquement du contenu visuel de votre image.' },
  { icon: '📊', title: 'Score SEO /100', desc: "Un score objectif de 0 à 100 pour évaluer le potentiel SEO de chaque image." },
  { icon: '💡', title: 'Recommandations IA', desc: "3 axes d'amélioration concrets pour maximiser l'impact de vos images en ligne." },
  { icon: '🎫', title: 'Support VALT', desc: "Créez des tickets depuis votre dashboard. L'équipe VALT répond en 24h." },
]

const plans = [
  { name: 'Découverte', price: '0', period: '/mois', highlight: false, features: ['5 analyses / mois', 'Alt Text + Meta + Keywords', 'Score SEO /100', 'Recommandations IA', 'Academy gratuite'], cta: 'Commencer gratuitement', primary: false },
  { name: 'Pro', price: '29', period: '/mois', highlight: true, features: ['Analyses illimitées', 'Alt Text + Meta + Keywords', 'Score SEO /100', 'Recommandations illimitées', 'Historique complet', 'Support prioritaire'], cta: 'Passer Pro', primary: true },
  { name: 'Entreprise', price: 'Sur devis', period: '', highlight: false, features: ['Tout le plan Pro', 'White label', 'Accès API complet', 'Équipe illimitée', 'Account manager dédié', 'SLA & support dédié'], cta: 'Nous contacter', primary: false },
]

const stepsData = [
  { title: 'Uploadez', desc: 'Glissez votre image ou sélectionnez un fichier depuis votre appareil' },
  { title: 'Analysez', desc: "L'IA analyse votre image et génère tous les éléments SEO en quelques secondes" },
  { title: 'Exportez', desc: 'Copiez vos métadonnées optimisées et intégrez-les à votre site' },
]

export default function Home() {
  const [scrollY, setScrollY] = useState(0)
  const [scrolled, setScrolled] = useState(false)
  const [activeStep, setActiveStep] = useState(0)
  const [annual, setAnnual] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY)
      setScrolled(window.scrollY > 30)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    const timer = setInterval(() => setActiveStep(p => (p + 1) % 3), 2600)
    return () => clearInterval(timer)
  }, [])

  const navOp = Math.min(0.88, 0.65 + scrollY * 0.0004)
  const blur = Math.min(20, 10 + scrollY * 0.015)

  const goTo = useCallback((id: string) => {
    setMenuOpen(false)
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [])

  const navLinks = [
    { label: 'Fonctionnalités', id: 'features' },
    { label: 'Comment ça marche', id: 'how' },
    { label: 'Tarifs', id: 'tarifs' },
  ]

  return (
    <div style={{ background: '#1A1A18', color: '#FAFAF9', minHeight: '100vh', fontFamily: "'Outfit', system-ui, sans-serif", overflowX: 'hidden' }}>
      {/* Google Font */}
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet" />

      <style>{`
        *{box-sizing:border-box}
        html{scroll-behavior:smooth;scroll-padding-top:90px}
        @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
        @keyframes pulse{0%,100%{opacity:.35;transform:scale(1)}50%{opacity:1;transform:scale(1.5)}}
        @keyframes glow{0%,100%{box-shadow:0 0 18px #E76F2E20}50%{box-shadow:0 0 40px #E76F2E50}}
        @keyframes scanLine{0%{top:-2px;opacity:0}10%{opacity:1}90%{opacity:1}100%{top:calc(100% - 2px);opacity:0}}
        .card-hover{transition:transform .3s,box-shadow .3s,border-color .3s}
        .card-hover:hover{transform:translateY(-4px);box-shadow:0 16px 40px rgba(0,0,0,.2);border-color:#E76F2E30!important}
        .btn-primary{transition:all .3s;cursor:pointer}
        .btn-primary:hover{transform:translateY(-2px);box-shadow:0 8px 24px #E76F2E40}
        .btn-ghost{transition:all .3s;cursor:pointer}
        .btn-ghost:hover{background:rgba(231,111,46,.1)!important;color:#E76F2E!important}
        .nav-link{cursor:pointer;transition:color .2s;background:none;border:none;font-family:inherit}
        .nav-link:hover{color:#E76F2E!important}
        .step-card{position:relative;overflow:hidden;transition:all .6s cubic-bezier(.4,0,.2,1)}
        .step-card .scan-line{position:absolute;left:0;right:0;height:2px;background:linear-gradient(90deg,transparent,#E76F2E,transparent);opacity:0;pointer-events:none}
        .step-card.active .scan-line{animation:scanLine 2s ease-in-out infinite}
        .step-card.active{border-color:#E76F2E50!important;box-shadow:0 0 30px #E76F2E12,0 12px 40px rgba(0,0,0,.1)}
        .floating-app{animation:float 6s ease-in-out infinite}
        .glow-cta{animation:glow 3s infinite}
      `}</style>

      {/* ══════ NAVBAR — FLOATING PILL ══════ */}
      <nav style={{
        position: 'fixed',
        top: scrolled ? 10 : 16,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 1000,
        transition: 'all .4s cubic-bezier(.4,0,.2,1)',
        width: 'auto',
        maxWidth: 860,
        minWidth: 320,
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
          background: `rgba(38,38,36,${navOp})`,
          backdropFilter: `blur(${blur}px) saturate(1.4)`,
          border: '1px solid rgba(255,255,255,.08)',
          borderRadius: 50,
          padding: '8px 10px 8px 20px',
          boxShadow: scrolled ? '0 8px 32px rgba(0,0,0,.2)' : '0 4px 16px rgba(0,0,0,.1)',
          transition: 'all .4s',
        }}>
          {/* Logo */}
          <a
            href="/"
            onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
            style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none', flexShrink: 0 }}
          >
            <div style={{ width: 32, height: 32, background: 'linear-gradient(135deg,#E76F2E,#C4581E)', borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 14px #E76F2E35', flexShrink: 0 }}>
              <svg viewBox="0 0 20 20" fill="none" width="16" height="16">
                <path d="M4 14L8 9L11 12L16 6" stroke="white" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M13 6H16V9" stroke="white" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <span style={{ fontWeight: 800, fontSize: 16, letterSpacing: -0.5, color: '#EDE9E0', whiteSpace: 'nowrap' }}>SEOPIC</span>
          </a>

          {/* Nav links — desktop */}
          <div style={{ display: 'flex', gap: 18, alignItems: 'center' }} className="hidden-mobile">
            {navLinks.map(l => (
              <button
                key={l.id}
                onClick={() => goTo(l.id)}
                className="nav-link"
                style={{ color: 'rgba(255,255,255,.52)', fontSize: 13, fontWeight: 500, cursor: 'pointer', padding: 0, whiteSpace: 'nowrap' }}
              >
                {l.label}
              </button>
            ))}
          </div>

          {/* Right side */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, flexShrink: 0 }}>
            <Link
              href="/auth/signin"
              className="nav-link"
              style={{ color: 'rgba(255,255,255,.52)', fontSize: 13, padding: '6px 8px', textDecoration: 'none', whiteSpace: 'nowrap' }}
            >
              Se connecter
            </Link>
            <Link
              href="/auth/signin"
              className="btn-primary"
              style={{
                padding: '7px 16px',
                background: 'linear-gradient(135deg,#E76F2E,#C4581E)',
                color: '#fff',
                textDecoration: 'none',
                borderRadius: 50,
                fontSize: 13,
                fontWeight: 700,
                boxShadow: '0 4px 14px #E76F2E35',
                display: 'inline-block',
                whiteSpace: 'nowrap',
                flexShrink: 0,
              }}
            >
              Lancer l&apos;app →
            </Link>
            {/* Mobile hamburger */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              style={{ width: 32, height: 32, borderRadius: 9, border: '1px solid rgba(255,255,255,.08)', background: 'rgba(255,255,255,.03)', cursor: 'pointer', display: 'none', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: menuOpen ? 0 : 4, flexShrink: 0 }}
              className="mobile-menu-btn"
              aria-label="Menu"
            >
              <span style={{ width: 13, height: 2, background: 'rgba(255,255,255,.52)', borderRadius: 1, transition: 'all .3s', transform: menuOpen ? 'rotate(45deg) translateY(1px)' : 'none', display: 'block' }} />
              {!menuOpen && <span style={{ width: 13, height: 2, background: 'rgba(255,255,255,.52)', borderRadius: 1, display: 'block' }} />}
              <span style={{ width: 13, height: 2, background: 'rgba(255,255,255,.52)', borderRadius: 1, transition: 'all .3s', transform: menuOpen ? 'rotate(-45deg) translateY(-1px)' : 'none', display: 'block' }} />
            </button>
          </div>
        </div>

        {/* Mobile dropdown */}
        {menuOpen && (
          <div style={{ marginTop: 6, background: 'rgba(46,46,43,.95)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,.08)', borderRadius: 16, padding: 8 }}>
            {navLinks.map(l => (
              <button key={l.id} onClick={() => goTo(l.id)} style={{ display: 'block', width: '100%', background: 'none', border: 'none', color: 'rgba(255,255,255,.7)', fontSize: 14, fontWeight: 500, padding: '12px 14px', fontFamily: 'inherit', textAlign: 'left', cursor: 'pointer', borderRadius: 10 }}>
                {l.label}
              </button>
            ))}
            <div style={{ height: 1, background: 'rgba(255,255,255,.06)', margin: '4px 10px' }} />
            <Link href="/auth/signin" style={{ display: 'block', color: 'rgba(255,255,255,.7)', fontSize: 14, fontWeight: 500, padding: '12px 14px', textDecoration: 'none', borderRadius: 10 }}>
              Se connecter
            </Link>
          </div>
        )}
      </nav>

      <style>{`
        @media (max-width: 767px) {
          .hidden-mobile { display: none !important; }
          .mobile-menu-btn { display: flex !important; }
        }
      `}</style>

      {/* ══════ HERO ══════ */}
      <section style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: 'clamp(120px, 15vw, 140px) 24px 70px', position: 'relative', overflow: 'hidden' }}>
        {/* Radial glow */}
        <div style={{ position: 'absolute', top: '10%', left: '50%', transform: 'translateX(-50%)', width: 460, height: 460, borderRadius: '50%', background: 'radial-gradient(circle,#E76F2E0D,transparent 70%)', filter: 'blur(50px)', pointerEvents: 'none' }} />
        {/* Grid pattern */}
        <div style={{ position: 'absolute', inset: 0, opacity: 0.025, backgroundImage: 'linear-gradient(rgba(168,168,158,1) 1px,transparent 1px),linear-gradient(90deg,rgba(168,168,158,1) 1px,transparent 1px)', backgroundSize: '50px 50px', pointerEvents: 'none' }} />

        <FadeIn>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#E76F2E20', border: '1px solid #E76F2E25', borderRadius: 18, padding: '5px 14px', marginBottom: 22, fontSize: 12 }}>
            <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#E76F2E', boxShadow: '0 0 8px #E76F2E', animation: 'pulse 2.5s ease-in-out infinite', display: 'inline-block' }} />
            <span style={{ color: '#E76F2E', fontWeight: 600 }}>Propulsé par Claude AI · Anthropic</span>
          </div>
        </FadeIn>

        <FadeIn delay={0.1}>
          <h1 style={{ fontSize: 'clamp(34px, 5vw, 62px)', fontWeight: 900, lineHeight: 1.05, letterSpacing: -1.5, maxWidth: 700, marginBottom: 18 }}>
            SEO d&apos;images,{' '}
            <span style={{ background: 'linear-gradient(135deg,#E76F2E,#F2994A)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              automatisé
            </span>{' '}
            par l&apos;IA
          </h1>
        </FadeIn>

        <FadeIn delay={0.2}>
          <p style={{ fontSize: 'clamp(14px, 2vw, 17px)', color: '#A8A89E', maxWidth: 500, lineHeight: 1.7, marginBottom: 32, margin: '0 auto 32px' }}>
            Uploadez une image. SEOPIC génère instantanément votre alt text, meta title,
            meta description, keywords et score SEO — en quelques secondes.
          </p>
        </FadeIn>

        <FadeIn delay={0.3}>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center', marginBottom: 36 }}>
            <Link
              href="/auth/signin"
              className="btn-primary glow-cta"
              style={{ background: 'linear-gradient(135deg,#E76F2E,#F2994A)', color: '#fff', textDecoration: 'none', padding: '13px 28px', borderRadius: 26, fontSize: 15, fontWeight: 700, display: 'inline-block' }}
            >
              Commencer gratuitement
            </Link>
            <button
              onClick={() => goTo('features')}
              className="btn-ghost"
              style={{ background: 'transparent', color: '#FAFAF9', border: '1px solid rgba(255,255,255,.12)', padding: '13px 28px', borderRadius: 26, fontSize: 15, fontWeight: 500, fontFamily: 'inherit' }}
            >
              Voir les fonctionnalités
            </button>
          </div>
        </FadeIn>

        <FadeIn delay={0.4}>
          <div style={{ display: 'flex', gap: 32, justifyContent: 'center', flexWrap: 'wrap', color: '#6B6B63', fontSize: 12.5 }}>
            {['Google Images +340%', '22% du trafic mondial', '1 min / image'].map((s, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ color: '#4ADE80', fontSize: 10 }}>✓</span>
                <span>{s}</span>
              </div>
            ))}
          </div>
        </FadeIn>

        {/* App preview */}
        <FadeIn delay={0.5} className="floating-app" style={{ width: '100%', maxWidth: 760, marginTop: 46 }}>
          <div style={{ background: '#2E2E2B', border: '1px solid #3A3A37', borderRadius: 14, padding: 3, boxShadow: '0 18px 50px rgba(0,0,0,.25)' }}>
            <div style={{ background: '#363633', borderRadius: 12, padding: '10px 18px', display: 'flex', alignItems: 'center', gap: 10, borderBottom: '1px solid #3A3A37' }}>
              <div style={{ display: 'flex', gap: 5 }}>
                {['#EF4444', '#FACC15', '#4ADE80'].map((c, i) => (
                  <div key={i} style={{ width: 8, height: 8, borderRadius: '50%', background: c, opacity: 0.6 }} />
                ))}
              </div>
              <div style={{ flex: 1, background: '#1A1A18', borderRadius: 6, padding: '4px 10px', fontSize: 11, color: '#6B6B63', textAlign: 'center' }}>
                app.seopic.io/dashboard
              </div>
            </div>
            <div style={{ padding: 24, display: 'flex', gap: 18, flexWrap: 'wrap' }}>
              <div style={{ flex: '1 1 180px', minHeight: 90, background: '#1A1A18', borderRadius: 10, border: '2px dashed #3A3A37', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6, padding: 18 }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#6B6B63" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.5 }}>
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
                </svg>
                <div style={{ color: '#6B6B63', fontSize: 11 }}>Glissez votre image ici</div>
              </div>
              <div style={{ flex: '1 1 200px', display: 'flex', flexDirection: 'column', gap: 7 }}>
                {['SEO Score', 'Alt Text', 'Meta Title', 'Keywords'].map((l, i) => (
                  <div key={i} style={{ background: '#1A1A18', borderRadius: 6, padding: '8px 10px', border: '1px solid #3A3A37', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 10.5, color: '#A8A89E' }}>{l}</span>
                    <div style={{ width: 44, height: 4, borderRadius: 2, background: i === 0 ? 'linear-gradient(90deg,#E76F2E,#4ADE80)' : '#3A3A37' }} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </FadeIn>
      </section>

      {/* ══════ FEATURES ══════ */}
      <section id="features" style={{ padding: 'clamp(50px, 7vw, 80px) clamp(18px, 4vw, 28px)', maxWidth: 1040, margin: '0 auto' }}>
        <FadeIn>
          <div style={{ textAlign: 'center', marginBottom: 42 }}>
            <Badge label="Fonctionnalités" />
            <h2 style={{ fontSize: 'clamp(24px, 3vw, 38px)', fontWeight: 800, letterSpacing: -0.8, lineHeight: 1.15 }}>
              Tout ce dont vous avez besoin pour{' '}
              <span style={{ color: '#E76F2E' }}>dominer</span> Google Images
            </h2>
          </div>
        </FadeIn>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 14 }}>
          {features.map((f, i) => (
            <FadeIn key={f.title} delay={i * 0.07}>
              <div className="card-hover" style={{ background: '#2E2E2B', border: '1px solid #3A3A37', borderRadius: 14, padding: 22, height: '100%' }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: '#E76F2E20', border: '1px solid #E76F2E20', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14, fontSize: 20 }}>
                  {f.icon}
                </div>
                <h3 style={{ fontSize: 14.5, fontWeight: 700, marginBottom: 7 }}>{f.title}</h3>
                <p style={{ fontSize: 12.5, color: '#A8A89E', lineHeight: 1.6 }}>{f.desc}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* ══════ STEPS ══════ */}
      <section id="how" style={{ padding: 'clamp(50px, 7vw, 80px) clamp(18px, 4vw, 28px)', background: '#1E1E1C', transition: 'background .4s' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <FadeIn>
            <div style={{ textAlign: 'center', marginBottom: 50 }}>
              <Badge label="Comment ça marche" />
              <h2 style={{ fontSize: 'clamp(24px, 3vw, 38px)', fontWeight: 800, letterSpacing: -0.8 }}>
                3 étapes. 1 minute.{' '}
                <span style={{ color: '#E76F2E' }}>C&apos;est tout.</span>
              </h2>
            </div>
          </FadeIn>
          <FadeIn delay={0.1}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {stepsData.map((s, i) => {
                const isAct = activeStep === i
                const isDone = activeStep > i
                return (
                  <div
                    key={i}
                    className={`step-card${isAct ? ' active' : ''}`}
                    style={{
                      background: isAct ? 'rgba(231,111,46,.06)' : 'rgba(255,255,255,.02)',
                      border: `1px solid ${isAct ? '#E76F2E40' : isDone ? '#E76F2E25' : 'rgba(255,255,255,.06)'}`,
                      borderRadius: 16,
                      padding: '24px 32px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 32,
                    }}
                  >
                    <div className="scan-line" />
                    <span style={{
                      fontSize: 52,
                      fontWeight: 900,
                      lineHeight: 1,
                      letterSpacing: -3,
                      transition: 'all .6s',
                      color: isAct || isDone ? '#E76F2E' : 'transparent',
                      WebkitTextStroke: isAct || isDone ? 'none' : '1.5px rgba(255,255,255,.1)',
                      textShadow: isAct ? '0 0 30px #E76F2E30' : 'none',
                      flexShrink: 0,
                    }}>0{i + 1}</span>
                    <div style={{ width: 2, height: 52, borderRadius: 1, background: isAct ? 'linear-gradient(180deg,#E76F2E,transparent)' : isDone ? '#E76F2E30' : 'rgba(255,255,255,.06)', flexShrink: 0, transition: 'background .6s' }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 4, color: isAct || isDone ? '#FAFAF9' : '#A8A89E', transition: 'color .6s' }}>{s.title}</h3>
                      <p style={{ fontSize: 13, color: '#6B6B63', lineHeight: 1.55 }}>{s.desc}</p>
                    </div>
                    <div style={{
                      flexShrink: 0,
                      width: 10,
                      height: 10,
                      borderRadius: '50%',
                      transition: 'all .6s',
                      background: isAct ? '#E76F2E' : isDone ? '#4ADE80' : 'transparent',
                      border: isAct || isDone ? 'none' : '2px solid rgba(255,255,255,.1)',
                      boxShadow: isAct ? '0 0 12px #E76F2E50' : isDone ? '0 0 8px #4ADE8040' : 'none',
                    }} />
                  </div>
                )
              })}
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ══════ PRICING ══════ */}
      <section id="tarifs" style={{ padding: 'clamp(50px, 7vw, 80px) clamp(18px, 4vw, 28px)', background: '#1A1A18' }}>
        <div style={{ maxWidth: 940, margin: '0 auto' }}>
          <FadeIn>
            <div style={{ textAlign: 'center', marginBottom: 32 }}>
              <Badge label="Tarifs" />
              <h2 style={{ fontSize: 'clamp(24px, 3vw, 38px)', fontWeight: 800, letterSpacing: -0.8, marginBottom: 20 }}>
                Un plan pour chaque{' '}
                <span style={{ color: '#E76F2E' }}>ambition</span>
              </h2>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 3, background: '#2E2E2B', borderRadius: 26, padding: 3, border: '1px solid #3A3A37' }}>
                <button onClick={() => setAnnual(false)} style={{ padding: '6px 16px', borderRadius: 20, border: 'none', cursor: 'pointer', background: !annual ? '#E76F2E' : 'transparent', color: !annual ? '#fff' : '#A8A89E', fontSize: 12, fontWeight: 600, fontFamily: 'inherit', transition: 'all .3s' }}>Mensuel</button>
                <button onClick={() => setAnnual(true)} style={{ padding: '6px 16px', borderRadius: 20, border: 'none', cursor: 'pointer', background: annual ? '#E76F2E' : 'transparent', color: annual ? '#fff' : '#A8A89E', fontSize: 12, fontWeight: 600, fontFamily: 'inherit', transition: 'all .3s' }}>
                  Annuel <span style={{ background: 'rgba(255,255,255,.15)', color: '#fff', padding: '2px 6px', borderRadius: 6, fontSize: 10, marginLeft: 2 }}>-30%</span>
                </button>
              </div>
            </div>
          </FadeIn>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 14, alignItems: 'stretch' }}>
            {plans.map((p, i) => {
              const priceNum = p.price === 'Sur devis' ? null : annual ? Math.round(parseInt(p.price) * 0.7) : parseInt(p.price)
              return (
                <FadeIn key={i} delay={i * 0.07}>
                  <div
                    className="card-hover"
                    style={{
                      background: p.highlight ? '#33261E' : '#2E2E2B',
                      border: p.highlight ? '2px solid #E76F2E45' : '1px solid #3A3A37',
                      borderRadius: 16,
                      padding: 26,
                      position: 'relative',
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                    }}
                  >
                    {p.highlight && (
                      <div style={{ position: 'absolute', top: -11, left: '50%', transform: 'translateX(-50%)', background: 'linear-gradient(135deg,#E76F2E,#F2994A)', color: '#fff', fontSize: 10, fontWeight: 700, padding: '3px 12px', borderRadius: 10, whiteSpace: 'nowrap' }}>
                        Populaire
                      </div>
                    )}
                    <div style={{ fontSize: 12.5, fontWeight: 600, color: '#A8A89E', marginBottom: 5 }}>{p.name}</div>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 3, marginBottom: 16 }}>
                      {priceNum === null
                        ? <span style={{ fontSize: 20, fontWeight: 800 }}>{p.price}</span>
                        : <>
                          <span style={{ fontSize: 34, fontWeight: 900 }}>{priceNum}</span>
                          <span style={{ color: '#6B6B63', fontSize: 13 }}>€{p.period}</span>
                          {annual && p.price !== '0' && <span style={{ color: '#6B6B63', fontSize: 11, textDecoration: 'line-through', marginLeft: 3 }}>{p.price}€</span>}
                        </>
                      }
                    </div>
                    <div style={{ flex: 1 }}>
                      {p.features.map((f, j) => (
                        <div key={j} style={{ display: 'flex', gap: 6, padding: '4px 0', fontSize: 12, color: '#A8A89E', lineHeight: 1.5 }}>
                          <span style={{ color: '#E76F2E', flexShrink: 0 }}>✓</span>{f}
                        </div>
                      ))}
                    </div>
                    <Link
                      href="/auth/signin"
                      className={p.primary ? 'btn-primary' : 'btn-ghost'}
                      style={{
                        display: 'block',
                        textAlign: 'center',
                        marginTop: 16,
                        padding: '10px 0',
                        borderRadius: 10,
                        fontSize: 12.5,
                        fontWeight: 600,
                        textDecoration: 'none',
                        background: p.primary ? 'linear-gradient(135deg,#E76F2E,#F2994A)' : 'transparent',
                        color: p.primary ? '#fff' : '#FAFAF9',
                        border: p.primary ? 'none' : '1px solid #3A3A37',
                      }}
                    >
                      {p.cta}
                    </Link>
                  </div>
                </FadeIn>
              )
            })}
          </div>
        </div>
      </section>

      {/* ══════ CTA ══════ */}
      <section style={{ maxWidth: 760, margin: '0 auto', padding: 'clamp(50px, 7vw, 80px) clamp(18px, 4vw, 28px)', textAlign: 'center' }}>
        <FadeIn>
          <div style={{ background: 'linear-gradient(180deg,rgba(231,111,46,.1),transparent)', border: '1px solid #E76F2E25', borderRadius: 28, padding: 'clamp(40px, 6vw, 60px) clamp(24px, 4vw, 48px)' }}>
            <h2 style={{ fontSize: 'clamp(26px, 3vw, 40px)', fontWeight: 900, marginBottom: 12 }}>
              Prêt à optimiser vos images ?
            </h2>
            <p style={{ color: '#A8A89E', marginBottom: 28, fontSize: 'clamp(14px, 1.5vw, 17px)', lineHeight: 1.6 }}>
              Connectez-vous avec Google et commencez en 30 secondes.
            </p>
            <Link
              href="/auth/signin"
              className="btn-primary glow-cta"
              style={{
                display: 'inline-block',
                background: 'linear-gradient(135deg,#E76F2E,#F2994A)',
                color: '#fff',
                textDecoration: 'none',
                padding: '14px 36px',
                borderRadius: 26,
                fontWeight: 700,
                fontSize: 'clamp(14px, 1.5vw, 16px)',
              }}
            >
              Accéder à SEOPIC →
            </Link>
          </div>
        </FadeIn>
      </section>

      {/* ══════ FOOTER ══════ */}
      <footer style={{ borderTop: '1px solid rgba(255,255,255,.05)', padding: '24px clamp(18px, 4vw, 28px)', marginTop: 10 }}>
        <div style={{ maxWidth: 1040, margin: '0 auto', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 24, height: 24, background: 'linear-gradient(135deg,#E76F2E,#C4581E)', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg viewBox="0 0 20 20" fill="none" width="12" height="12">
                <path d="M4 14L8 9L11 12L16 6" stroke="white" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M13 6H16V9" stroke="white" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <span style={{ color: 'rgba(255,255,255,.3)', fontSize: 13 }}>
              © 2025 SEOPIC — par{' '}
              <span style={{ color: 'rgba(255,255,255,.5)', fontWeight: 600 }}>VALT Agency</span>, Tanger
            </span>
          </div>
          <span style={{ color: 'rgba(255,255,255,.2)', fontSize: 12 }}>Making You Visible</span>
        </div>
      </footer>
    </div>
  )
}
