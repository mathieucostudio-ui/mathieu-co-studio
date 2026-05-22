/**
 * Queries produits — server-side uniquement
 *
 * Toutes les fonctions sont wrappées dans React.cache() :
 *  • Déduplication : appels identiques dans le même arbre de rendu ne font
 *    qu'une seule requête réseau (memoization scoped par request).
 *  • Compatible Server Components et Server Actions.
 *
 * Pattern de gestion d'erreur :
 *  • Erreur Supabase  → throw (remontée au Error Boundary le plus proche)
 *  • Ligne non trouvée (PGRST116) → return null (cas attendu pour les slugs)
 */

import { cache } from 'react';
import { createClient } from '@/lib/supabase/server';
import type {
  DbProduit,
  ProduitCard,
  ProduitDetail,
  ProduitImage,
  ProduitDimensions,
  GetAllProduitsOptions,
  PaginatedProduits,
} from '@/types/product';

// ─── Sélecteurs SQL ───────────────────────────────────────────────────────────

/** Colonnes minimales pour les cards (listing, BoutiqueVedette, wishlist) */
const SELECT_CARD = `
  id,
  slug,
  nom,
  description_courte,
  prix,
  prix_promo,
  stock,
  images,
  vedette,
  statut,
  categorie_id,
  categories ( id, slug, nom )
` as const;

/** Toutes les colonnes pour la page détail produit */
const SELECT_DETAIL = `
  *,
  categories ( id, slug, nom )
` as const;

// ─── Helpers de cast JSONB ─────────────────────────────────────────────────────

function castImages(raw: unknown): ProduitImage[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((item) => ({
    url:   typeof item?.url   === 'string' ? item.url   : '',
    alt:   typeof item?.alt   === 'string' ? item.alt   : '',
    ordre: typeof item?.ordre === 'number' ? item.ordre : 0,
  }));
}

function castDimensions(raw: unknown): ProduitDimensions | null {
  if (raw === null || typeof raw !== 'object' || Array.isArray(raw)) return null;
  const d = raw as Record<string, unknown>;
  return {
    largeur_cm:    typeof d.largeur_cm    === 'number' ? d.largeur_cm    : undefined,
    hauteur_cm:    typeof d.hauteur_cm    === 'number' ? d.hauteur_cm    : undefined,
    profondeur_cm: typeof d.profondeur_cm === 'number' ? d.profondeur_cm : undefined,
  };
}

// =============================================================================
//  getAllProduits
// =============================================================================

/**
 * Récupère une liste paginée de produits.
 *
 * @example
 * // Tous les produits actifs
 * const { data } = await getAllProduits()
 *
 * // Produits en vedette uniquement
 * const { data } = await getAllProduits({ vedette: true, limit: 4 })
 *
 * // Produits d'une catégorie, triés par prix croissant
 * const { data } = await getAllProduits({
 *   categorie_id: 'uuid…',
 *   orderBy: 'prix',
 *   ascending: true,
 * })
 */
export const getAllProduits = cache(async (
  options: GetAllProduitsOptions = {},
): Promise<PaginatedProduits> => {
  const {
    categorie_id,
    statut     = 'actif',
    vedette,
    limit      = 20,
    offset     = 0,
    orderBy    = 'created_at',
    ascending  = false,
    prixMin,
    prixMax,
    recherche,
  } = options;

  const supabase = await createClient();

  // Construction dynamique de la requête
  let query = supabase
    .from('produits')
    .select(SELECT_CARD, { count: 'exact' })
    .eq('statut', statut)
    .is('deleted_at', null)
    .order(orderBy, { ascending })
    .range(offset, offset + limit - 1);

  if (categorie_id !== undefined) query = query.eq('categorie_id', categorie_id);
  if (vedette      !== undefined) query = query.eq('vedette', vedette);
  if (prixMin      !== undefined) query = query.gte('prix', prixMin);
  if (prixMax      !== undefined) query = query.lte('prix', prixMax);
  if (recherche    !== undefined && recherche.trim() !== '') {
    // Recherche ILIKE sur nom + description_courte (fallback du FTS)
    query = query.or(
      `nom.ilike.%${recherche.trim()}%,description_courte.ilike.%${recherche.trim()}%`,
    );
  }

  const { data: rawData, error, count } = await query;

  if (error) {
    throw new Error(`[getAllProduits] ${error.message} (code: ${error.code})`);
  }

  const total = count ?? 0;

  // Supabase ne peut pas inférer le type exact depuis un sélecteur string dynamique
  // avec jointure — on caste vers un type intermédiaire connu.
  type RawRow = {
    id: string; slug: string; nom: string;
    description_courte: string | null;
    prix: number; prix_promo: number | null; stock: number;
    images: unknown; vedette: boolean; statut: DbProduit['statut'];
    categorie_id: string | null;
    categories: { id: string; slug: string; nom: string } | { id: string; slug: string; nom: string }[] | null;
  };

  const rows = (rawData ?? []) as unknown as RawRow[];

  const produits: ProduitCard[] = rows.map((row) => ({
    id:                 row.id,
    slug:               row.slug,
    nom:                row.nom,
    description_courte: row.description_courte,
    prix:               row.prix,
    prix_promo:         row.prix_promo,
    stock:              row.stock,
    images:             castImages(row.images),
    vedette:            row.vedette,
    statut:             row.statut,
    // Supabase retourne la jointure sous forme d'objet ou de tableau selon le contexte
    categorie: Array.isArray(row.categories)
      ? (row.categories[0] ?? null)
      : (row.categories ?? null),
  }));

  return {
    data:    produits,
    total,
    limit,
    offset,
    hasMore: offset + limit < total,
  };
});

// =============================================================================
//  getProduitBySlug
// =============================================================================

/**
 * Récupère un produit complet par son slug.
 * Retourne null si le slug n'existe pas (PGRST116).
 *
 * @example
 * const produit = await getProduitBySlug('fauteuil-okonkwo')
 * if (!produit) notFound()
 */
export const getProduitBySlug = cache(async (
  slug: string,
): Promise<ProduitDetail | null> => {
  const supabase = await createClient();

  const { data: rawData, error } = await supabase
    .from('produits')
    .select(SELECT_DETAIL)
    .eq('slug', slug)
    .is('deleted_at', null)
    .single();

  if (error) {
    // PGRST116 = "The result contains 0 rows" → produit non trouvé, cas normal
    if (error.code === 'PGRST116') return null;
    throw new Error(`[getProduitBySlug] ${error.message} (slug: "${slug}", code: ${error.code})`);
  }

  type RawDetail = DbProduit & {
    categories: { id: string; slug: string; nom: string } | { id: string; slug: string; nom: string }[] | null;
  };

  const row = rawData as unknown as RawDetail;

  const produit: ProduitDetail = {
    ...row,
    images:     castImages(row.images),
    dimensions: castDimensions(row.dimensions),
    categorie: Array.isArray(row.categories)
      ? (row.categories[0] ?? null)
      : (row.categories ?? null),
  };

  return produit;
});

// =============================================================================
//  getProduitsVedette  (raccourci — utilisé dans BoutiqueVedette)
// =============================================================================

/**
 * Récupère les N produits en vedette pour la section BoutiqueVedette.
 * Triés par date de création décroissante.
 *
 * @example
 * const produits = await getProduitsVedette(4)
 */
export const getProduitsVedette = cache(async (
  limit = 4,
): Promise<ProduitCard[]> => {
  const result = await getAllProduits({ vedette: true, limit });
  return result.data;
});

// =============================================================================
//  getProduitsByCategorie  (raccourci)
// =============================================================================

/**
 * Récupère les produits d'une catégorie spécifique.
 *
 * @example
 * const { data, total } = await getProduitsByCategorie('uuid-mobilier', { limit: 12 })
 */
export const getProduitsByCategorie = cache(async (
  categorie_id: string,
  options: Omit<GetAllProduitsOptions, 'categorie_id'> = {},
): Promise<PaginatedProduits> => {
  return getAllProduits({ ...options, categorie_id });
});
