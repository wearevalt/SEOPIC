-- ============================================================
-- SEOPIC — Schéma complet Supabase
-- À exécuter dans Supabase Dashboard > SQL Editor
-- ============================================================

-- ── 1. TICKETS ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS tickets (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  title        text        NOT NULL,
  description  text        NOT NULL,
  client_name  text,
  client_email text        NOT NULL,
  status       text        NOT NULL DEFAULT 'Ouvert',
  priority     text        NOT NULL DEFAULT 'Moyenne',
  created_at   timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT tickets_status_check   CHECK (status   IN ('Ouvert','En Cours','Résolu','Fermé')),
  CONSTRAINT tickets_priority_check CHECK (priority IN ('Haute','Moyenne','Basse'))
);

-- ── 2. REPLIES ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS replies (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id   uuid        NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
  text        text        NOT NULL,
  from_role   text        NOT NULL DEFAULT 'client',
  author_name text,
  created_at  timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT replies_role_check CHECK (from_role IN ('client','admin'))
);

-- ── 3. ANALYSES (historique SEO) ────────────────────────────
CREATE TABLE IF NOT EXISTS analyses (
  id                uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_email        text        NOT NULL,
  image_name        text,
  image_size        integer,
  seo_score         integer,
  alt_text          text,
  meta_title        text,
  meta_description  text,
  keywords          text[]      DEFAULT '{}',
  improvements      text[]      DEFAULT '{}',
  image_category    text,
  detected_content  text,
  tone              text,
  created_at        timestamptz NOT NULL DEFAULT now()
);

-- ── INDEX ────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS tickets_client_email_idx ON tickets(client_email);
CREATE INDEX IF NOT EXISTS tickets_status_idx       ON tickets(status);
CREATE INDEX IF NOT EXISTS tickets_created_at_idx   ON tickets(created_at DESC);
CREATE INDEX IF NOT EXISTS replies_ticket_id_idx    ON replies(ticket_id);
CREATE INDEX IF NOT EXISTS analyses_user_email_idx  ON analyses(user_email);
CREATE INDEX IF NOT EXISTS analyses_created_at_idx  ON analyses(created_at DESC);

-- ── RLS (Row Level Security) ─────────────────────────────────
-- On utilise le service role côté serveur — RLS désactivée pour simplifier.
-- Si tu actives l'auth Supabase côté client, active RLS et adapte les policies.
ALTER TABLE tickets  DISABLE ROW LEVEL SECURITY;
ALTER TABLE replies  DISABLE ROW LEVEL SECURITY;
ALTER TABLE analyses DISABLE ROW LEVEL SECURITY;
