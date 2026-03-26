import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen bg-[#030303] text-white overflow-hidden">

      {/* Nav */}
      <nav className="border-b border-white/5 px-8 py-5">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <span className="text-2xl font-black tracking-tight">
            SEO<span className="text-orange-500">PIC</span>
          </span>
          <Link
            href="/auth/signin"
            className="bg-orange-500 hover:bg-orange-600 text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition"
          >
            Se connecter
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-4xl mx-auto px-8 py-32 text-center">
        <div className="inline-flex items-center gap-2 bg-orange-500/10 border border-orange-500/20 rounded-full px-4 py-1.5 text-orange-400 text-sm font-medium mb-8">
          <span className="w-1.5 h-1.5 bg-orange-400 rounded-full" />
          Propulsé par Claude AI · Anthropic
        </div>

        <h1 className="text-6xl md:text-7xl font-black leading-tight mb-6">
          SEO d'images,{' '}
          <span className="text-orange-500">automatisé</span>{' '}
          par l'IA
        </h1>

        <p className="text-xl text-white/50 max-w-2xl mx-auto mb-10 leading-relaxed">
          Uploadez une image. SEOPIC génère instantanément votre alt text, meta title,
          meta description, keywords et score SEO — en quelques secondes.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/auth/signin"
            className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 rounded-xl font-bold text-lg transition"
          >
            Commencer gratuitement →
          </Link>
          <a
            href="#features"
            className="border border-white/10 hover:border-white/20 text-white/60 hover:text-white px-8 py-4 rounded-xl font-semibold text-lg transition"
          >
            Voir les fonctionnalités
          </a>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="max-w-6xl mx-auto px-8 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-black mb-4">Tout ce dont vous avez besoin</h2>
          <p className="text-white/40 text-lg">Une analyse complète en une seule image</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              icon: '🎯',
              title: 'Alt Text optimisé',
              desc: 'Générez automatiquement des descriptions précises et accessibles, limitées à 125 caractères.',
            },
            {
              icon: '📝',
              title: 'Meta Title & Description',
              desc: "Title en 60 caractères, description en 160 — parfaitement calibrés pour les moteurs de recherche.",
            },
            {
              icon: '🔑',
              title: 'Keywords SEO',
              desc: '5 à 8 mots-clés ciblés extraits automatiquement du contenu visuel de votre image.',
            },
            {
              icon: '📊',
              title: 'Score SEO /100',
              desc: "Un score objectif de 0 à 100 pour évaluer le potentiel SEO de chaque image.",
            },
            {
              icon: '💡',
              title: 'Recommandations',
              desc: '3 axes d\'amélioration concrets pour maximiser l\'impact de vos images en ligne.',
            },
            {
              icon: '🎫',
              title: 'Support VALT',
              desc: "Créez des tickets directement depuis votre dashboard. L'équipe VALT répond en 24h.",
            },
          ].map((f) => (
            <div
              key={f.title}
              className="bg-white/[0.03] border border-white/5 rounded-2xl p-6 hover:border-orange-500/20 transition"
            >
              <div className="text-3xl mb-4">{f.icon}</div>
              <h3 className="text-white font-bold mb-2">{f.title}</h3>
              <p className="text-white/40 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-3xl mx-auto px-8 py-20 text-center">
        <div className="bg-gradient-to-b from-orange-500/10 to-transparent border border-orange-500/20 rounded-3xl p-12">
          <h2 className="text-4xl font-black mb-4">Prêt à optimiser vos images ?</h2>
          <p className="text-white/40 mb-8 text-lg">Connectez-vous avec Google et commencez en 30 secondes.</p>
          <Link
            href="/auth/signin"
            className="inline-block bg-orange-500 hover:bg-orange-600 text-white px-10 py-4 rounded-xl font-bold text-lg transition"
          >
            Accéder à SEOPIC →
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 px-8 py-8 mt-10">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <span className="text-white/30 text-sm">
            © 2025 SEOPIC — Propulsé par{' '}
            <span className="text-white/50 font-semibold">VALT Agency</span>, Tanger
          </span>
          <span className="text-white/20 text-sm">Making You Visible</span>
        </div>
      </footer>

    </main>
  )
}
