'use client';

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { PLAN_CONFIGS } from '@/lib/types';
import Link from 'next/link';

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 },
};

const stagger = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

export default function PricingPage() {
  const router = useRouter();
  const { data: session } = useSession();

  const handleCheckout = async (planType: 'pro' | 'enterprise') => {
    if (!session) {
      router.push('/auth/signin');
      return;
    }

    try {
      // Try Stripe first
      const stripeResponse = await fetch('/api/payments/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planType }),
      });

      if (stripeResponse.ok) {
        const { sessionId } = await stripeResponse.json();
        // Redirect to Stripe Checkout
        window.location.href = `https://checkout.stripe.com/pay/${sessionId}`;
        return;
      }

      // Fallback to PayPal
      const paypalResponse = await fetch('/api/payments/paypal/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planType }),
      });

      if (paypalResponse.ok) {
        const { approvalUrl } = await paypalResponse.json();
        window.location.href = approvalUrl;
      }
    } catch (error) {
      console.error('Checkout error:', error);
      alert('Erreur lors de la création de la session de paiement');
    }
  };

  const plans = [
    {
      type: 'free' as const,
      name: PLAN_CONFIGS.free.name,
      price: 'Gratuit',
      description: 'Parfait pour commencer',
      analyses: `${PLAN_CONFIGS.free.analyses_per_month} analyses/mois`,
      features: PLAN_CONFIGS.free.features,
      cta: 'Commencer gratuitement',
      ctaAction: () => {
        if (!session) {
          router.push('/auth/signin');
        } else {
          router.push('/dashboard');
        }
      },
      highlight: false,
    },
    {
      type: 'pro' as const,
      name: PLAN_CONFIGS.pro.name,
      price: '29€',
      priceDesc: '/mois',
      description: 'Pour les professionnels',
      analyses: `${PLAN_CONFIGS.pro.analyses_per_month} analyses/mois`,
      features: PLAN_CONFIGS.pro.features,
      cta: 'Essayer Pro',
      ctaAction: () => handleCheckout('pro'),
      highlight: true,
    },
    {
      type: 'enterprise' as const,
      name: PLAN_CONFIGS.enterprise.name,
      price: 'Personnalisé',
      description: 'Pour les grandes équipes',
      analyses: 'Analyses illimitées',
      features: PLAN_CONFIGS.enterprise.features,
      cta: 'Nous contacter',
      ctaAction: () => {
        window.location.href = 'mailto:contact@seopic.com?subject=Plan Entreprise';
      },
      highlight: false,
    },
  ];

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-black/80 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold">
            SEOPIC
          </Link>
          <Link href="/" className="hover:text-gray-300 transition">
            ← Retour
          </Link>
        </div>
      </nav>

      {/* Header */}
      <div className="pt-32 pb-20 text-center">
        <motion.h1
          className="text-5xl md:text-6xl font-bold mb-6"
          {...fadeUp}
        >
          Tarification simple et transparente
        </motion.h1>
        <motion.p
          className="text-xl text-gray-400 max-w-2xl mx-auto"
          {...fadeUp}
        >
          Choisissez le plan qui correspond à vos besoins et commencez à optimiser vos images pour le SEO
        </motion.p>
      </div>

      {/* Pricing Cards */}
      <motion.div
        className="max-w-7xl mx-auto px-6 pb-20 grid md:grid-cols-3 gap-8"
        variants={stagger}
        initial="initial"
        animate="animate"
      >
        {plans.map((plan) => (
          <motion.div
            key={plan.type}
            className={`relative rounded-2xl p-8 border transition ${
              plan.highlight
                ? 'bg-gradient-to-br from-orange-500/10 to-orange-500/5 border-orange-500 scale-105 md:scale-110'
                : 'bg-white/5 border-white/10 hover:border-white/20'
            }`}
            variants={fadeUp}
          >
            {plan.highlight && (
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <span className="bg-orange-500 text-black px-4 py-1 rounded-full text-sm font-semibold">
                  Populaire
                </span>
              </div>
            )}

            <div className="mb-8">
              <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
              <p className="text-gray-400 text-sm">{plan.description}</p>
            </div>

            <div className="mb-8">
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold">{plan.price}</span>
                {plan.priceDesc && (
                  <span className="text-gray-400">{plan.priceDesc}</span>
                )}
              </div>
              <p className="text-gray-400 text-sm mt-3">{plan.analyses}</p>
            </div>

            <button
              onClick={plan.ctaAction}
              className={`w-full py-3 rounded-lg font-semibold transition mb-8 ${
                plan.highlight
                  ? 'bg-orange-500 text-black hover:bg-orange-600'
                  : 'bg-white/10 text-white hover:bg-white/20 border border-white/20'
              }`}
            >
              {plan.cta}
            </button>

            <div className="space-y-4">
              <p className="text-xs font-semibold text-gray-400 uppercase">
                Inclus dans ce plan
              </p>
              <ul className="space-y-3">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm">
                    <span className="text-orange-500 mt-1">✓</span>
                    <span className="text-gray-300">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* FAQ Section */}
      <div className="max-w-4xl mx-auto px-6 py-20">
        <h2 className="text-3xl font-bold text-center mb-12">Questions fréquentes</h2>
        <div className="space-y-6">
          {[
            {
              q: 'Puis-je changer de plan à tout moment?',
              a: 'Oui, vous pouvez upgrader ou downgrade votre plan à tout moment. Les changements seront effectifs au prochain cycle de facturation.',
            },
            {
              q: 'Y a-t-il une période d\'essai gratuite?',
              a: 'Oui, tous les nouveaux utilisateurs commencent avec le plan gratuit qui inclut 5 analyses par mois.',
            },
            {
              q: 'Comment fonctionne la facturation?',
              a: 'Les plans payants sont facturés mensuellement. Vous pouvez annuler votre abonnement à tout moment sans frais supplémentaires.',
            },
            {
              q: 'Acceptez-vous PayPal et Stripe?',
              a: 'Oui, nous acceptons les deux méthodes de paiement pour votre commodité.',
            },
          ].map((item, i) => (
            <motion.div
              key={i}
              className="bg-white/5 border border-white/10 rounded-lg p-6 hover:bg-white/10 transition"
              variants={fadeUp}
            >
              <h3 className="font-semibold mb-2">{item.q}</h3>
              <p className="text-gray-400 text-sm">{item.a}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
