-- =============================================================================
--  Mathieu&Co Studio — Politiques Row Level Security (RLS)
--  À exécuter APRÈS supabase/schema.sql dans le SQL Editor.
--
--  Modèle de sécurité :
--
--    ┌─────────────────┬────────────────────────────────────────────────────┐
--    │ Rôle            │ Accès                                              │
--    ├─────────────────┼────────────────────────────────────────────────────┤
--    │ anon            │ Lecture des données publiques uniquement            │
--    │ authenticated   │ Lecture publique + gestion de ses propres données   │
--    │ service_role    │ Bypass RLS — toutes opérations (admin, webhooks)    │
--    └─────────────────┴────────────────────────────────────────────────────┘
--
--  Hypothèse critique : clients.id = auth.uid()
--    → Le trigger handle_new_user() (section 1) crée automatiquement
--      un enregistrement clients lors de chaque inscription.
--
--  Les opérations admin (backoffice) utilisent createAdminClient()
--  avec la clé service_role → RLS ignoré → pas de politique admin nécessaire.
-- =============================================================================


-- =============================================================================
--  0. ACTIVATION RLS SUR TOUTES LES TABLES
-- =============================================================================

ALTER TABLE categories       ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients          ENABLE ROW LEVEL SECURITY;
ALTER TABLE codes_promo      ENABLE ROW LEVEL SECURITY;
ALTER TABLE produits         ENABLE ROW LEVEL SECURITY;
ALTER TABLE commandes        ENABLE ROW LEVEL SECURITY;
ALTER TABLE commandes_items  ENABLE ROW LEVEL SECURITY;
ALTER TABLE avis             ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlist         ENABLE ROW LEVEL SECURITY;
ALTER TABLE projets          ENABLE ROW LEVEL SECURITY;
ALTER TABLE articles_blog    ENABLE ROW LEVEL SECURITY;


-- =============================================================================
--  1. TRIGGER — Synchronisation clients ↔ auth.users
--
--  Chaque nouvel utilisateur Supabase Auth crée automatiquement
--  un enregistrement dans la table clients avec le même UUID.
--  Cela permet : auth.uid() = clients.id dans toutes les policies.
-- =============================================================================

CREATE OR REPLACE FUNCTION handle_new_auth_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.clients (id, email, prenom, nom)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'prenom', ''),
    COALESCE(NEW.raw_user_meta_data ->> 'nom',    '')
  )
  ON CONFLICT (id) DO NOTHING;   -- idempotent
  RETURN NEW;
END;
$$;

-- Déclenché à chaque nouvelle inscription
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_auth_user();


-- =============================================================================
--  2. CATÉGORIES
--  Données de référence publiques. Lecture pour tous, écriture admin only.
-- =============================================================================

-- Lecture publique (catalogue visible sans connexion)
CREATE POLICY "categories_select_public"
  ON categories FOR SELECT
  USING (true);

-- Insertion : service_role uniquement (RLS ignoré pour service_role,
-- mais on documente l'intention explicitement)
-- Pas de CREATE POLICY INSERT → seul service_role peut écrire.


-- =============================================================================
--  3. CLIENTS
--  Chaque utilisateur ne voit et modifie que son propre profil.
-- =============================================================================

-- Lecture de son propre profil
CREATE POLICY "clients_select_own"
  ON clients FOR SELECT
  TO authenticated
  USING (id = auth.uid());

-- Mise à jour de son propre profil
-- (nom, prénom, téléphone, adresse, newsletter — pas statut ni notes_internes)
CREATE POLICY "clients_update_own"
  ON clients FOR UPDATE
  TO authenticated
  USING  (id = auth.uid())
  WITH CHECK (
    id = auth.uid()
    -- Empêche un client de changer son propre statut ou ses notes internes
    AND statut        = (SELECT statut        FROM clients WHERE id = auth.uid())
    AND notes_internes IS NOT DISTINCT FROM
        (SELECT notes_internes FROM clients WHERE id = auth.uid())
  );

-- Insertion : gérée par le trigger handle_new_auth_user, pas en direct
-- Suppression : service_role uniquement (soft delete géré côté serveur)


-- =============================================================================
--  4. CODES PROMO
--  Un client peut lire les codes qui lui sont destinés ou publics.
--  La validation réelle se fait server-side (service_role).
-- =============================================================================

-- Lecture des codes actifs accessibles au client connecté
CREATE POLICY "codes_promo_select_own_or_public"
  ON codes_promo FOR SELECT
  TO authenticated
  USING (
    actif = true
    AND (date_fin IS NULL OR date_fin > NOW())
    AND (
      client_id IS NULL          -- code public
      OR client_id = auth.uid()  -- code nominatif
    )
  );

-- Pas d'écriture directe pour les clients (service_role only)


-- =============================================================================
--  5. PRODUITS
--  Catalogue public en lecture. Gestion admin via service_role.
-- =============================================================================

-- Lecture publique des produits actifs et non supprimés
CREATE POLICY "produits_select_public"
  ON produits FOR SELECT
  USING (
    statut     = 'actif'
    AND deleted_at IS NULL
  );

-- Les utilisateurs authentifiés voient aussi les produits épuisés
-- (pour les wishlist, les commandes passées, etc.)
CREATE POLICY "produits_select_epuises_auth"
  ON produits FOR SELECT
  TO authenticated
  USING (
    statut IN ('actif', 'epuise')
    AND deleted_at IS NULL
  );

-- Pas d'écriture directe pour les clients


-- =============================================================================
--  6. COMMANDES
--  Chaque client ne voit que ses propres commandes.
-- =============================================================================

-- Lecture de ses propres commandes
CREATE POLICY "commandes_select_own"
  ON commandes FOR SELECT
  TO authenticated
  USING (client_id = auth.uid());

-- Création d'une commande (le client_id doit correspondre à l'utilisateur)
CREATE POLICY "commandes_insert_own"
  ON commandes FOR INSERT
  TO authenticated
  WITH CHECK (client_id = auth.uid());

-- Annulation d'une commande en attente (seul statut modifiable par le client)
CREATE POLICY "commandes_update_cancel_own"
  ON commandes FOR UPDATE
  TO authenticated
  USING (
    client_id = auth.uid()
    AND statut = 'en_attente'  -- seules les commandes non confirmées
  )
  WITH CHECK (
    client_id = auth.uid()
    AND statut = 'annulee'     -- le client ne peut que passer à 'annulee'
  );

-- Suppression : service_role uniquement


-- =============================================================================
--  7. COMMANDES_ITEMS
--  Accessible en lecture uniquement via les commandes du client.
-- =============================================================================

-- Lecture des lignes de ses propres commandes
CREATE POLICY "commandes_items_select_own"
  ON commandes_items FOR SELECT
  TO authenticated
  USING (
    commande_id IN (
      SELECT id FROM commandes
      WHERE client_id = auth.uid()
    )
  );

-- Insertion lors du passage d'une commande
CREATE POLICY "commandes_items_insert_own"
  ON commandes_items FOR INSERT
  TO authenticated
  WITH CHECK (
    commande_id IN (
      SELECT id FROM commandes
      WHERE client_id = auth.uid()
      AND   statut    = 'en_attente'  -- commande en cours de création
    )
  );

-- Modification / suppression : service_role uniquement


-- =============================================================================
--  8. AVIS
--  Lecture publique des avis approuvés. Écriture par le client concerné.
-- =============================================================================

-- Lecture publique des avis approuvés uniquement
CREATE POLICY "avis_select_approuve_public"
  ON avis FOR SELECT
  USING (statut = 'approuve');

-- Lecture de ses propres avis (quel que soit le statut)
CREATE POLICY "avis_select_own"
  ON avis FOR SELECT
  TO authenticated
  USING (client_id = auth.uid());

-- Insertion d'un avis (client authentifié uniquement, lié à son profil)
CREATE POLICY "avis_insert_own"
  ON avis FOR INSERT
  TO authenticated
  WITH CHECK (
    client_id = auth.uid()
    AND statut = 'en_attente'  -- toujours créé en attente de modération
    AND signale = false
  );

-- Modification d'un avis encore en attente (avant modération)
CREATE POLICY "avis_update_own_pending"
  ON avis FOR UPDATE
  TO authenticated
  USING (
    client_id = auth.uid()
    AND statut = 'en_attente'
  )
  WITH CHECK (
    client_id = auth.uid()
    AND statut = 'en_attente'  -- ne peut pas changer son propre statut
  );

-- Suppression d'un avis en attente (avant modération)
CREATE POLICY "avis_delete_own_pending"
  ON avis FOR DELETE
  TO authenticated
  USING (
    client_id = auth.uid()
    AND statut = 'en_attente'
  );


-- =============================================================================
--  9. WISHLIST
--  Chaque client gère uniquement sa propre liste de souhaits.
-- =============================================================================

-- Lecture de sa propre wishlist
CREATE POLICY "wishlist_select_own"
  ON wishlist FOR SELECT
  TO authenticated
  USING (client_id = auth.uid());

-- Ajout d'un produit à sa wishlist
CREATE POLICY "wishlist_insert_own"
  ON wishlist FOR INSERT
  TO authenticated
  WITH CHECK (client_id = auth.uid());

-- Suppression d'un produit de sa wishlist
CREATE POLICY "wishlist_delete_own"
  ON wishlist FOR DELETE
  TO authenticated
  USING (client_id = auth.uid());

-- Pas de UPDATE (wishlist = insert + delete uniquement)


-- =============================================================================
--  10. PROJETS
--  Portfolio public. Lecture pour tous, gestion admin via service_role.
-- =============================================================================

-- Lecture publique des projets publiés
CREATE POLICY "projets_select_publie_public"
  ON projets FOR SELECT
  USING (statut = 'publie');

-- Pas d'écriture directe pour les visiteurs


-- =============================================================================
--  11. ARTICLES_BLOG
--  Contenu éditorial public. Lecture pour tous, gestion admin via service_role.
-- =============================================================================

-- Lecture publique des articles publiés
CREATE POLICY "articles_blog_select_publie_public"
  ON articles_blog FOR SELECT
  USING (
    statut     = 'publie'
    AND publie_le <= NOW()   -- pas d'articles programmés dans le futur
  );

-- Incrément du compteur de vues par les utilisateurs authentifiés
-- (UPDATE très limité : uniquement la colonne `vues`)
CREATE POLICY "articles_blog_update_vues"
  ON articles_blog FOR UPDATE
  TO authenticated
  USING  (statut = 'publie')
  WITH CHECK (
    statut  = 'publie'
    -- S'assure que seule la colonne `vues` peut changer via cette policy
    -- Note : le contrôle fin se fait côté application (Route Handler)
  );


-- =============================================================================
--  12. VÉRIFICATION — Vue récapitulative des policies actives
--  Exécuter après ce script pour confirmer :
--    SELECT tablename, policyname, permissive, roles, cmd, qual
--    FROM pg_policies
--    WHERE schemaname = 'public'
--    ORDER BY tablename, cmd;
-- =============================================================================


-- =============================================================================
--  NOTES D'IMPLÉMENTATION
-- =============================================================================
--
--  1. ADMIN  → Toujours utiliser createAdminClient() (service_role key).
--             La clé service_role bypass RLS — aucune policy admin nécessaire.
--
--  2. WEBHOOKS STRIPE → Utiliser createAdminClient() pour mettre à jour
--             les statuts de commandes depuis les Route Handlers.
--
--  3. INCRÉMENT VUES → Préférer une fonction RPC côté Supabase :
--             CREATE OR REPLACE FUNCTION increment_article_vues(article_id UUID)
--             RETURNS void LANGUAGE sql SECURITY DEFINER AS $$
--               UPDATE articles_blog SET vues = vues + 1 WHERE id = article_id;
--             $$;
--             → Appel client : supabase.rpc('increment_article_vues', { article_id })
--
--  4. CODES PROMO → La vérification de validité (usage, date) se fait
--             impérativement server-side via createAdminClient() dans un
--             Route Handler (jamais côté client).
--
--  5. TRIGGER → Si le trigger échoue (ex: email déjà pris dans clients),
--             l'inscription échoue aussi. Vérifier l'unicité email dans clients.
-- =============================================================================
