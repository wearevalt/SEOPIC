# SEOPIC — Handoff Document

Plateforme SaaS d'analyse SEO d'images par IA. Produit de **VALT Agency** (Tanger, Maroc).

---

## État actuel : Fonctionnel ✅

Le projet tourne en production sur Vercel. Toutes les fonctionnalités core sont opérationnelles.

---

## Stack

| Couche | Technologie |
|---|---|
| Framework | Next.js 14 (App Router) |
| Auth | NextAuth.js + Google OAuth |
| DB | Supabase (PostgreSQL) |
| AI | Claude Sonnet 4.6 (Anthropic) |
| UI | Tailwind CSS + Radix UI |
| Validation | Zod v4 |
| Déploiement | Vercel |

---

## Architecture

```
/app
  page.tsx              ← Landing page publique
  layout.tsx            ← Root layout + SessionProvider
  providers.tsx         ← NextAuth SessionProvider (client)
  /auth/signin          ← Page connexion Google
  /dashboard            ← Espace client (SEO tool + tickets)
  /admin                ← Espace VALT (stats dynamiques)
    /tickets            ← Gestion tickets + réponses
    /clients            ← Liste clients (statique)
    /team               ← Équipe VALT (statique)
    /messages           ← Messages (statique)
  /api
    /analyze            ← POST: analyse image via Claude
    /tickets            ← GET (list) + POST (create)
    /tickets/[id]       ← PATCH (update status)
    /tickets/[id]/reply ← POST (add reply)
    /auth/[...nextauth] ← NextAuth handler

/lib
  auth.ts         ← Config NextAuth (Google OAuth)
  supabase.ts     ← Clients Supabase (client + admin)
  schemas.ts      ← Validation Zod (analyze, ticket, reply)
  rate-limit.ts   ← Rate limiter in-memory
  utils.ts        ← cn() pour Tailwind

/components/ui    ← Button, Card, Badge, Input, Label, Separator
/middleware.ts    ← Protection /dashboard + /admin
```

---

## Flux principaux

### Analyse SEO
1. Client upload une image dans `/dashboard` (onglet SEO)
2. POST `/api/analyze` → rate limit → Zod validation
3. Appel Claude API (`claude-sonnet-4-6`) avec image en base64
4. Retour JSON : `seoScore`, `suggestedAltText`, `metaTitle`, `metaDescription`, `keywords`, `improvements`
5. Affichage avec score visuel, barres de longueur, boutons copy

### Tickets
1. Client crée un ticket depuis `/dashboard` (onglet Tickets)
2. POST `/api/tickets` → Supabase table `tickets`
3. Admin voit tout dans `/admin/tickets` avec panel latéral
4. Réponses via POST `/api/tickets/[id]/reply` → table `replies`
5. Statut automatique : `Ouvert` → `En Cours` à la première réponse admin

---

## Base de données Supabase

```sql
-- Table tickets
id          uuid PRIMARY KEY DEFAULT gen_random_uuid()
title       text NOT NULL
description text NOT NULL
client_name text
client_email text NOT NULL
status      text DEFAULT 'Ouvert'   -- Ouvert | En Cours | Résolu | Fermé
priority    text DEFAULT 'Moyenne'  -- Haute | Moyenne | Basse
created_at  timestamptz DEFAULT now()

-- Table replies
id          uuid PRIMARY KEY DEFAULT gen_random_uuid()
ticket_id   uuid REFERENCES tickets(id)
text        text NOT NULL
from_role   text NOT NULL           -- admin | client
author_name text
created_at  timestamptz DEFAULT now()
```

---

## Variables d'environnement

Copier `env.example` → `.env.local` et remplir :

```
NEXTAUTH_SECRET=       # openssl rand -base64 32
NEXTAUTH_URL=          # http://localhost:3000 (ou domaine prod)
GOOGLE_CLIENT_ID=      # Google Cloud Console
GOOGLE_CLIENT_SECRET=  # Google Cloud Console
ANTHROPIC_API_KEY=     # console.anthropic.com
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_ADMIN_EMAILS=mustapha@wearevalt.co,ilyas@wearevalt.co
ADMIN_EMAILS=mustapha@wearevalt.co,ilyas@wearevalt.co
```

---

## Sécurité en place

- **Middleware** (`middleware.ts`) : JWT vérifié sur toutes les routes `/dashboard` et `/admin`
- **Admin guard** : vérification email dans `ADMIN_EMAILS` côté middleware ET côté page
- **Rate limiting** in-memory :
  - Analyse : 10 req/min par IP
  - Tickets : 5 créations/5min par IP
  - Réponses : 20 req/min par IP
- **Zod validation** sur tous les body API
- **UUID validation** sur les paramètres d'URL
- **Headers HTTP** : CSP, X-Frame-Options, HSTS, etc. (dans `next.config.js`)

---

## Lancer en local

```bash
cp env.example .env.local
# Remplir les variables d'environnement

npm install
npm run dev
# → http://localhost:3000
```

---

## Ce qui reste à faire

### Priorité haute
- [ ] **Clients/Team/Messages admin** — données statiques, à connecter à Supabase si besoin
- [ ] **Notifications** — alerter l'admin quand un nouveau ticket arrive (email ou webhook)
- [ ] **Historique analyses** — sauvegarder les analyses SEO en Supabase pour les afficher

### Priorité moyenne
- [ ] **Pagination** sur la liste des tickets admin (quand > 50 tickets)
- [ ] **Recherche** dans les tickets admin
- [ ] **Export** des résultats SEO en JSON/CSV

### Priorité basse
- [ ] Supprimer `api/analyze.js` (legacy Vercel Pages, remplacé par `app/api/analyze/route.ts`)
- [ ] Internationalisation (FR/EN/AR)

---

## Accès production

- **App** : déployée sur Vercel (repo `wearevalt/SEOPIC`)
- **Supabase** : projet accessible sur supabase.com
- **Admin** : wearevalt@gmail.com, mustapha@wearevalt.co

---

*Généré le 2026-03-26 — VALT Agency*
