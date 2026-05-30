-- ============================================================
--  Cowork — Schéma Supabase
--  À exécuter dans : Supabase > SQL Editor
--  Mathieu&Co Studio — Phase 10 Automation
-- ============================================================

-- ── cowork_tasks ─────────────────────────────────────────────
-- Queue de tâches marketing : posts Instagram, LinkedIn, etc.

CREATE TABLE IF NOT EXISTS cowork_tasks (
  id           UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  type         TEXT        NOT NULL, -- 'instagram_post' | 'linkedin_post' | 'newsletter_draft' | 'story'
  statut       TEXT        NOT NULL DEFAULT 'en_attente',
                                     -- 'en_attente' | 'approuve' | 'rejete' | 'publie' | 'echec'
  platform     TEXT,                 -- 'instagram' | 'linkedin' | 'both'
  source_type  TEXT,                 -- 'projet' | 'produit' | 'article_blog' | 'custom'
  source_id    UUID,
  source_slug  TEXT,
  titre        TEXT,
  contenu      TEXT        NOT NULL, -- Caption / texte du post
  hashtags     TEXT[]      DEFAULT '{}',
  images_urls  TEXT[]      DEFAULT '{}',
  meta         JSONB       DEFAULT '{}',
  note_admin   TEXT,                 -- Note de validation de Mathieu
  publie_le    TIMESTAMPTZ,
  publie_url   TEXT,                 -- URL du post une fois publié
  erreur       TEXT,                 -- Détail d'erreur si echec
  created_at   TIMESTAMPTZ DEFAULT now(),
  updated_at   TIMESTAMPTZ DEFAULT now()
);

-- Index pour les requêtes fréquentes
CREATE INDEX IF NOT EXISTS cowork_tasks_statut_idx  ON cowork_tasks(statut);
CREATE INDEX IF NOT EXISTS cowork_tasks_platform_idx ON cowork_tasks(platform);
CREATE INDEX IF NOT EXISTS cowork_tasks_created_idx  ON cowork_tasks(created_at DESC);

-- Trigger updated_at automatique
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_cowork_tasks_updated_at ON cowork_tasks;
CREATE TRIGGER set_cowork_tasks_updated_at
  BEFORE UPDATE ON cowork_tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ── cowork_reports ────────────────────────────────────────────
-- Rapports hebdomadaires de performance

CREATE TABLE IF NOT EXISTS cowork_reports (
  id           UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  semaine      DATE        NOT NULL UNIQUE, -- Premier lundi de la semaine
  donnees      JSONB       NOT NULL DEFAULT '{}',
  email_envoye BOOLEAN     DEFAULT false,
  envoye_le    TIMESTAMPTZ,
  created_at   TIMESTAMPTZ DEFAULT now()
);

-- ── RLS Policies ─────────────────────────────────────────────
-- Tables admin uniquement — pas d'accès public

ALTER TABLE cowork_tasks   ENABLE ROW LEVEL SECURITY;
ALTER TABLE cowork_reports ENABLE ROW LEVEL SECURITY;

-- Seul le service_role (admin) peut lire/écrire
-- (Les API routes utilisent createAdminClient avec service_role key)
CREATE POLICY "Admin only cowork_tasks"
  ON cowork_tasks FOR ALL
  USING (false) WITH CHECK (false);

CREATE POLICY "Admin only cowork_reports"
  ON cowork_reports FOR ALL
  USING (false) WITH CHECK (false);
