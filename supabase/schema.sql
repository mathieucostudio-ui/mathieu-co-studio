-- =============================================================================
--  Mathieu&Co Studio — Schéma PostgreSQL / Supabase
--  Généré le 2026-05-22
--
--  Ordre de création (dépendances FK respectées) :
--    1. categories          — arbre de catégories produits
--    2. clients             — comptes clients / utilisateurs
--    3. codes_promo         — codes de réduction
--    4. produits            — catalogue boutique
--    5. commandes           — en-têtes de commandes
--    6. commandes_items     — lignes de commandes
--    7. avis                — avis produits
--    8. wishlist            — favoris clients
--    9. projets             — portfolio architecture / déco
--   10. articles_blog       — contenu éditorial
--
--  Conventions :
--    • PK     : UUID gen_random_uuid()
--    • Argent : INTEGER en FCFA (pas de centimes)
--    • Temps  : TIMESTAMPTZ (toujours avec fuseau)
--    • JSON   : JSONB (indexable)
--    • Suppression douce : colonne deleted_at (NULL = actif)
-- =============================================================================

-- Extensions requises (activer dans Supabase Dashboard > Database > Extensions)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";   -- gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS "unaccent";   -- recherche insensible aux accents

-- =============================================================================
--  TYPES ÉNUMÉRÉS
-- =============================================================================

CREATE TYPE statut_produit      AS ENUM ('actif', 'inactif', 'epuise', 'archive');
CREATE TYPE statut_commande     AS ENUM ('en_attente', 'confirmee', 'en_preparation', 'expediee', 'livree', 'annulee', 'remboursee');
CREATE TYPE statut_avis         AS ENUM ('en_attente', 'approuve', 'rejete');
CREATE TYPE statut_client       AS ENUM ('actif', 'inactif', 'banni');
CREATE TYPE statut_publication  AS ENUM ('publie', 'brouillon', 'archive');
CREATE TYPE type_promo          AS ENUM ('pourcentage', 'montant_fixe', 'livraison_gratuite');
CREATE TYPE categorie_projet    AS ENUM ('architecture', 'decoration', 'gestion_projet', 'boutique');


-- =============================================================================
--  1. CATEGORIES
-- =============================================================================

CREATE TABLE categories (
  id            UUID          PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Hiérarchie : une catégorie peut avoir un parent (sous-catégorie)
  parent_id     UUID          REFERENCES categories (id) ON DELETE SET NULL,

  slug          VARCHAR(120)  NOT NULL UNIQUE,
  nom           VARCHAR(120)  NOT NULL,
  description   TEXT,
  image_url     VARCHAR(500),

  -- Ordre d'affichage dans les listings
  ordre         SMALLINT      NOT NULL DEFAULT 0,

  created_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE  categories              IS 'Arbre de catégories pour la boutique (supporte 2 niveaux : parent → enfant).';
COMMENT ON COLUMN categories.slug         IS 'Identifiant URL lisible, unique, ex: mobilier-salon.';
COMMENT ON COLUMN categories.parent_id    IS 'NULL = catégorie racine ; non NULL = sous-catégorie.';

CREATE INDEX idx_categories_parent_id ON categories (parent_id);
CREATE INDEX idx_categories_slug      ON categories (slug);


-- =============================================================================
--  2. CLIENTS
-- =============================================================================

CREATE TABLE clients (
  id              UUID          PRIMARY KEY DEFAULT gen_random_uuid(),

  email           VARCHAR(254)  NOT NULL UNIQUE,
  nom             VARCHAR(100),
  prenom          VARCHAR(100),
  telephone       VARCHAR(30),

  -- Adresse principale stockée en JSONB pour flexibilité internationale
  -- Structure attendue : { rue, complement, ville, region, code_postal, pays }
  adresse         JSONB,

  ville           VARCHAR(100),
  pays            CHAR(2)       NOT NULL DEFAULT 'BJ',   -- ISO 3166-1 alpha-2

  date_naissance  DATE,
  newsletter      BOOLEAN       NOT NULL DEFAULT FALSE,
  statut          statut_client NOT NULL DEFAULT 'actif',

  -- Métadonnées marketing
  source          VARCHAR(60),                            -- ex: 'google', 'instagram', 'referral'
  notes_internes  TEXT,                                  -- notes CRM (non visibles client)

  created_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  deleted_at      TIMESTAMPTZ                            -- suppression douce
);

COMMENT ON TABLE  clients             IS 'Comptes clients de la boutique Mathieu&Co Studio.';
COMMENT ON COLUMN clients.pays        IS 'Code pays ISO 3166-1 alpha-2. Défaut BJ = Bénin.';
COMMENT ON COLUMN clients.adresse     IS 'JSONB : { rue, complement, ville, region, code_postal, pays }.';

CREATE INDEX idx_clients_email      ON clients (email);
CREATE INDEX idx_clients_statut     ON clients (statut);
CREATE INDEX idx_clients_deleted_at ON clients (deleted_at) WHERE deleted_at IS NULL;


-- =============================================================================
--  3. CODES_PROMO
-- =============================================================================

CREATE TABLE codes_promo (
  id                UUID          PRIMARY KEY DEFAULT gen_random_uuid(),

  code              VARCHAR(60)   NOT NULL UNIQUE,
  type              type_promo    NOT NULL,

  -- Valeur : % pour 'pourcentage' (ex: 15.00 = 15 %), FCFA pour 'montant_fixe'
  valeur            NUMERIC(10,2) NOT NULL CHECK (valeur >= 0),

  minimum_commande  INTEGER       NOT NULL DEFAULT 0 CHECK (minimum_commande >= 0),

  -- NULL = illimité
  usage_maximum     INTEGER       CHECK (usage_maximum IS NULL OR usage_maximum > 0),
  usage_actuel      INTEGER       NOT NULL DEFAULT 0 CHECK (usage_actuel >= 0),

  -- Réservé à un client spécifique (NULL = tous)
  client_id         UUID          REFERENCES clients (id) ON DELETE SET NULL,

  date_debut        TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  date_fin          TIMESTAMPTZ,                         -- NULL = pas d'expiration

  actif             BOOLEAN       NOT NULL DEFAULT TRUE,

  created_at        TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ   NOT NULL DEFAULT NOW(),

  CONSTRAINT chk_dates_promo CHECK (date_fin IS NULL OR date_fin > date_debut),
  CONSTRAINT chk_usage       CHECK (usage_actuel <= COALESCE(usage_maximum, usage_actuel + 1))
);

COMMENT ON TABLE  codes_promo              IS 'Codes de réduction applicables au panier.';
COMMENT ON COLUMN codes_promo.valeur       IS 'Pourcentage (0–100) ou montant fixe en FCFA selon le type.';
COMMENT ON COLUMN codes_promo.usage_maximum IS 'NULL = pas de limite d''utilisation.';

CREATE INDEX idx_codes_promo_code      ON codes_promo (code);
CREATE INDEX idx_codes_promo_client_id ON codes_promo (client_id);
CREATE INDEX idx_codes_promo_actif     ON codes_promo (actif, date_debut, date_fin);


-- =============================================================================
--  4. PRODUITS
-- =============================================================================

CREATE TABLE produits (
  id                UUID            PRIMARY KEY DEFAULT gen_random_uuid(),

  categorie_id      UUID            REFERENCES categories (id) ON DELETE SET NULL,

  slug              VARCHAR(160)    NOT NULL UNIQUE,
  nom               VARCHAR(200)    NOT NULL,
  description       TEXT,
  description_courte VARCHAR(400),

  -- Prix en FCFA (entiers, pas de centimes)
  prix              INTEGER         NOT NULL CHECK (prix >= 0),
  prix_promo        INTEGER         CHECK (prix_promo IS NULL OR prix_promo >= 0),

  stock             INTEGER         NOT NULL DEFAULT 0 CHECK (stock >= 0),

  -- Tableau d'URLs d'images : [{ url, alt, ordre }]
  images            JSONB           NOT NULL DEFAULT '[]',

  -- Attributs spécifiques artisanat / design
  origine           VARCHAR(100),                         -- ex: 'Cotonou', 'Abomey', 'Lagos'
  artisan           VARCHAR(150),                         -- nom de l'artisan/créateur
  materiaux         TEXT[],                              -- ex: '{bronze, bois_iroko}'
  dimensions        JSONB,                                -- { largeur_cm, hauteur_cm, profondeur_cm }
  poids_g           INTEGER         CHECK (poids_g IS NULL OR poids_g > 0),

  tags              TEXT[],
  statut            statut_produit  NOT NULL DEFAULT 'actif',
  vedette           BOOLEAN         NOT NULL DEFAULT FALSE,

  -- SEO
  meta_titre        VARCHAR(70),
  meta_description  VARCHAR(160),

  created_at        TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
  deleted_at        TIMESTAMPTZ,

  CONSTRAINT chk_prix_promo CHECK (prix_promo IS NULL OR prix_promo < prix)
);

COMMENT ON TABLE  produits                 IS 'Catalogue de la boutique Mathieu&Co Studio.';
COMMENT ON COLUMN produits.prix            IS 'Prix public en FCFA (franc CFA BCEAO).';
COMMENT ON COLUMN produits.prix_promo      IS 'Prix soldé en FCFA, doit être < prix. NULL = pas de promo.';
COMMENT ON COLUMN produits.images          IS 'JSONB : [{ "url": "...", "alt": "...", "ordre": 0 }].';
COMMENT ON COLUMN produits.dimensions      IS 'JSONB : { "largeur_cm": 80, "hauteur_cm": 120, "profondeur_cm": 40 }.';

CREATE INDEX idx_produits_categorie_id ON produits (categorie_id);
CREATE INDEX idx_produits_slug         ON produits (slug);
CREATE INDEX idx_produits_statut       ON produits (statut) WHERE deleted_at IS NULL;
CREATE INDEX idx_produits_vedette      ON produits (vedette) WHERE vedette = TRUE AND deleted_at IS NULL;
-- Recherche plein texte sur nom + description
CREATE INDEX idx_produits_fts          ON produits
  USING gin(to_tsvector('french', COALESCE(nom,'') || ' ' || COALESCE(description,'')));


-- =============================================================================
--  5. COMMANDES
-- =============================================================================

CREATE TABLE commandes (
  id                 UUID              PRIMARY KEY DEFAULT gen_random_uuid(),

  client_id          UUID              NOT NULL REFERENCES clients (id) ON DELETE RESTRICT,
  code_promo_id      UUID              REFERENCES codes_promo (id) ON DELETE SET NULL,

  -- Numéro lisible affiché au client : MC-2026-00001
  numero             VARCHAR(30)       NOT NULL UNIQUE,

  statut             statut_commande   NOT NULL DEFAULT 'en_attente',

  -- Montants en FCFA
  sous_total         INTEGER           NOT NULL CHECK (sous_total >= 0),
  frais_livraison    INTEGER           NOT NULL DEFAULT 0 CHECK (frais_livraison >= 0),
  remise             INTEGER           NOT NULL DEFAULT 0 CHECK (remise >= 0),
  total              INTEGER           NOT NULL CHECK (total >= 0),

  -- Adresse de livraison snapshot au moment de la commande
  adresse_livraison  JSONB             NOT NULL,          -- { nom, rue, ville, pays, telephone }

  -- Mode de paiement et référence
  mode_paiement      VARCHAR(60),                         -- ex: 'mobile_money', 'virement', 'especes'
  ref_paiement       VARCHAR(100),                        -- référence externe du paiement

  notes              TEXT,                                -- instructions client
  notes_internes     TEXT,                                -- notes équipe

  created_at         TIMESTAMPTZ       NOT NULL DEFAULT NOW(),
  updated_at         TIMESTAMPTZ       NOT NULL DEFAULT NOW(),

  CONSTRAINT chk_total CHECK (total = sous_total + frais_livraison - remise)
);

COMMENT ON TABLE  commandes                    IS 'En-têtes des commandes passées sur la boutique.';
COMMENT ON COLUMN commandes.numero             IS 'Numéro lisible unique, format MC-AAAA-NNNNN.';
COMMENT ON COLUMN commandes.adresse_livraison  IS 'Snapshot JSONB de l''adresse au moment de la commande.';
COMMENT ON COLUMN commandes.total              IS 'Doit respecter : sous_total + frais_livraison - remise.';

CREATE INDEX idx_commandes_client_id     ON commandes (client_id);
CREATE INDEX idx_commandes_statut        ON commandes (statut);
CREATE INDEX idx_commandes_code_promo_id ON commandes (code_promo_id);
CREATE INDEX idx_commandes_created_at    ON commandes (created_at DESC);


-- =============================================================================
--  6. COMMANDES_ITEMS
-- =============================================================================

CREATE TABLE commandes_items (
  id              UUID      PRIMARY KEY DEFAULT gen_random_uuid(),

  commande_id     UUID      NOT NULL REFERENCES commandes (id) ON DELETE CASCADE,
  produit_id      UUID      NOT NULL REFERENCES produits  (id) ON DELETE RESTRICT,

  -- Snapshot du produit au moment de la commande
  nom_produit     VARCHAR(200)  NOT NULL,                 -- copie de produits.nom
  image_url       VARCHAR(500),                           -- première image du produit

  quantite        INTEGER   NOT NULL DEFAULT 1 CHECK (quantite > 0),
  prix_unitaire   INTEGER   NOT NULL CHECK (prix_unitaire >= 0),  -- FCFA au moment de la commande
  total           INTEGER   NOT NULL CHECK (total >= 0),

  created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),

  CONSTRAINT chk_item_total CHECK (total = quantite * prix_unitaire)
);

COMMENT ON TABLE  commandes_items                 IS 'Lignes détaillées de chaque commande.';
COMMENT ON COLUMN commandes_items.nom_produit     IS 'Snapshot du nom au moment de la commande (invariant).';
COMMENT ON COLUMN commandes_items.prix_unitaire   IS 'Prix FCFA au moment de la commande, indépendant du prix actuel.';

CREATE INDEX idx_commandes_items_commande_id ON commandes_items (commande_id);
CREATE INDEX idx_commandes_items_produit_id  ON commandes_items (produit_id);


-- =============================================================================
--  7. AVIS
-- =============================================================================

CREATE TABLE avis (
  id           UUID          PRIMARY KEY DEFAULT gen_random_uuid(),

  produit_id   UUID          NOT NULL REFERENCES produits (id) ON DELETE CASCADE,
  client_id    UUID          REFERENCES clients (id) ON DELETE SET NULL,   -- NULL = anonyme

  note         SMALLINT      NOT NULL CHECK (note BETWEEN 1 AND 5),
  titre        VARCHAR(120),
  commentaire  TEXT,

  statut       statut_avis   NOT NULL DEFAULT 'en_attente',
  verifie      BOOLEAN       NOT NULL DEFAULT FALSE,  -- achat vérifié

  -- Modération
  signale      BOOLEAN       NOT NULL DEFAULT FALSE,
  raison_rejet VARCHAR(200),

  created_at   TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ   NOT NULL DEFAULT NOW(),

  -- Un client ne peut laisser qu'un seul avis par produit
  UNIQUE (produit_id, client_id)
);

COMMENT ON TABLE  avis           IS 'Avis et notes clients sur les produits.';
COMMENT ON COLUMN avis.verifie   IS 'TRUE si le client a effectivement acheté ce produit.';
COMMENT ON COLUMN avis.statut    IS 'Les avis passent par une modération avant publication.';

CREATE INDEX idx_avis_produit_id ON avis (produit_id);
CREATE INDEX idx_avis_client_id  ON avis (client_id);
CREATE INDEX idx_avis_statut     ON avis (statut);


-- =============================================================================
--  8. WISHLIST
-- =============================================================================

CREATE TABLE wishlist (
  id           UUID         PRIMARY KEY DEFAULT gen_random_uuid(),

  client_id    UUID         NOT NULL REFERENCES clients  (id) ON DELETE CASCADE,
  produit_id   UUID         NOT NULL REFERENCES produits (id) ON DELETE CASCADE,

  created_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW(),

  -- Un produit ne peut apparaître qu'une fois par liste
  UNIQUE (client_id, produit_id)
);

COMMENT ON TABLE wishlist IS 'Favoris / liste de souhaits des clients.';

CREATE INDEX idx_wishlist_client_id  ON wishlist (client_id);
CREATE INDEX idx_wishlist_produit_id ON wishlist (produit_id);


-- =============================================================================
--  9. PROJETS
-- =============================================================================

CREATE TABLE projets (
  id                UUID               PRIMARY KEY DEFAULT gen_random_uuid(),

  slug              VARCHAR(160)       NOT NULL UNIQUE,
  titre             VARCHAR(200)       NOT NULL,
  sous_titre        VARCHAR(300),
  description       TEXT,

  categorie         categorie_projet   NOT NULL,
  lieu              VARCHAR(150),                         -- ex: 'Quartier Haie Vive'
  ville             VARCHAR(100)       NOT NULL DEFAULT 'Cotonou',
  pays              CHAR(2)            NOT NULL DEFAULT 'BJ',
  annee             SMALLINT           CHECK (annee BETWEEN 1990 AND 2100),
  surface_m2        INTEGER            CHECK (surface_m2 IS NULL OR surface_m2 > 0),

  -- Tableau d'images : [{ url, alt, ordre, largeur, hauteur }]
  images            JSONB              NOT NULL DEFAULT '[]',
  image_principale  VARCHAR(500),

  tags              TEXT[],
  vedette           BOOLEAN            NOT NULL DEFAULT FALSE,
  statut            statut_publication NOT NULL DEFAULT 'brouillon',

  -- SEO
  meta_titre        VARCHAR(70),
  meta_description  VARCHAR(160),

  created_at        TIMESTAMPTZ        NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ        NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE  projets                  IS 'Portfolio des réalisations de Mathieu&Co Studio.';
COMMENT ON COLUMN projets.images           IS 'JSONB : [{ "url": "...", "alt": "...", "ordre": 0 }].';
COMMENT ON COLUMN projets.vedette          IS 'TRUE = affiché dans la section GaleriePreview de l''accueil.';

CREATE INDEX idx_projets_slug      ON projets (slug);
CREATE INDEX idx_projets_categorie ON projets (categorie);
CREATE INDEX idx_projets_statut    ON projets (statut);
CREATE INDEX idx_projets_vedette   ON projets (vedette) WHERE vedette = TRUE;
-- Recherche plein texte
CREATE INDEX idx_projets_fts       ON projets
  USING gin(to_tsvector('french', COALESCE(titre,'') || ' ' || COALESCE(description,'')));


-- =============================================================================
--  10. ARTICLES_BLOG
-- =============================================================================

CREATE TABLE articles_blog (
  id                UUID               PRIMARY KEY DEFAULT gen_random_uuid(),

  -- L'auteur est optionnel (article sans profil lié)
  auteur_id         UUID               REFERENCES clients (id) ON DELETE SET NULL,
  auteur_nom        VARCHAR(150),                         -- snapshot ou auteur externe

  slug              VARCHAR(200)       NOT NULL UNIQUE,
  titre             VARCHAR(200)       NOT NULL,
  sous_titre        VARCHAR(400),

  -- Contenu riche stocké en JSONB (compatible avec éditeurs Tiptap/ProseMirror/Notion)
  contenu           JSONB,
  extrait           TEXT,                                 -- résumé court (~160 car)

  image_principale  VARCHAR(500),
  image_alt         VARCHAR(200),

  tags              TEXT[],
  categorie         VARCHAR(80),                          -- ex: 'Tendances', 'Conseils', 'Actualités'

  statut            statut_publication NOT NULL DEFAULT 'brouillon',
  publie_le         TIMESTAMPTZ,                          -- NULL tant que brouillon
  temps_lecture_min SMALLINT           CHECK (temps_lecture_min IS NULL OR temps_lecture_min > 0),
  vues              INTEGER            NOT NULL DEFAULT 0 CHECK (vues >= 0),

  -- SEO
  meta_titre        VARCHAR(70),
  meta_description  VARCHAR(160),

  created_at        TIMESTAMPTZ        NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ        NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE  articles_blog                  IS 'Articles et actualités du blog Mathieu&Co Studio.';
COMMENT ON COLUMN articles_blog.contenu          IS 'JSONB compatible Tiptap/ProseMirror pour l''éditeur riche.';
COMMENT ON COLUMN articles_blog.extrait          IS 'Résumé affiché dans les listings (~160 caractères).';
COMMENT ON COLUMN articles_blog.publie_le        IS 'Date de publication effective, NULL = non publié.';

CREATE INDEX idx_articles_blog_slug       ON articles_blog (slug);
CREATE INDEX idx_articles_blog_statut     ON articles_blog (statut);
CREATE INDEX idx_articles_blog_publie_le  ON articles_blog (publie_le DESC) WHERE statut = 'publie';
CREATE INDEX idx_articles_blog_auteur_id  ON articles_blog (auteur_id);
-- Recherche plein texte
CREATE INDEX idx_articles_blog_fts        ON articles_blog
  USING gin(to_tsvector('french', COALESCE(titre,'') || ' ' || COALESCE(extrait,'')));


-- =============================================================================
--  TRIGGERS — mise à jour automatique de updated_at
-- =============================================================================

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_categories_updated_at
  BEFORE UPDATE ON categories
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_clients_updated_at
  BEFORE UPDATE ON clients
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_codes_promo_updated_at
  BEFORE UPDATE ON codes_promo
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_produits_updated_at
  BEFORE UPDATE ON produits
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_commandes_updated_at
  BEFORE UPDATE ON commandes
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_avis_updated_at
  BEFORE UPDATE ON avis
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_projets_updated_at
  BEFORE UPDATE ON projets
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_articles_blog_updated_at
  BEFORE UPDATE ON articles_blog
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();


-- =============================================================================
--  DONNÉES DE RÉFÉRENCE — catégories initiales
-- =============================================================================

INSERT INTO categories (slug, nom, description, ordre) VALUES
  ('mobilier',           'Mobilier',              'Canapés, tables, chaises et meubles de rangement',  1),
  ('luminaires',         'Luminaires',            'Lampes, suspensions et éclairages décoratifs',       2),
  ('decoration',         'Décoration',            'Objets d''art, vases, coussins et accessoires',      3),
  ('art-africain',       'Art Africain',          'Sculptures, masques et art contemporain africain',   4),
  ('textiles',           'Textiles',              'Tapis, tentures et tissus d''ameublement',           5),
  ('art-de-la-table',    'Art de la Table',       'Vaisselle, couverts et accessoires de table',        6);
