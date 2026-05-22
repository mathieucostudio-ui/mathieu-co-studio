/**
 * Types produit — couche UI
 *
 * Construit sur Database['public']['Tables']['produits']['Row'] mais avec :
 *   • JSONB -> types concrets (ProduitImage, ProduitDimensions)
 *   • Relations joinées (categorie)
 *   • Sous-types pour l'affichage (ProduitCard, ProduitDetail)
 */

import type { Tables } from './database';

// =============================================================================
//  Types JSONB concrets
// =============================================================================

/** Structure d'un item dans le tableau `images` */
export interface ProduitImage {
  url:   string;
  alt:   string;
  ordre: number;
}

/** Structure de la colonne `dimensions` */
export interface ProduitDimensions {
  largeur_cm?:    number;
  hauteur_cm?:    number;
  profondeur_cm?: number;
}

// =============================================================================
//  Type de base DB (alias pratique)
// =============================================================================
export type DbProduit   = Tables<'produits'>;
export type DbCategorie = Tables<'categories'>;

// =============================================================================
//  Type raccourci catégorie (pour les jointures)
// =============================================================================
export type CategorieResume = Pick<DbCategorie, 'id' | 'slug' | 'nom'>;

// =============================================================================
//  ProduitCard — données minimales pour les listings et cartes
// =============================================================================
export interface ProduitCard {
  id:                 string;
  slug:               string;
  nom:                string;
  description_courte: string | null;
  prix:               number;
  prix_promo:         number | null;
  stock:              number;
  images:             ProduitImage[];
  vedette:            boolean;
  statut:             DbProduit['statut'];
  categorie:          CategorieResume | null;
}

// =============================================================================
//  ProduitDetail — données complètes pour la page produit
// =============================================================================
export interface ProduitDetail extends Omit<DbProduit, 'images' | 'dimensions'> {
  images:     ProduitImage[];
  dimensions: ProduitDimensions | null;
  categorie:  CategorieResume | null;
}

// =============================================================================
//  Paramètres de requête
// =============================================================================

export interface GetAllProduitsOptions {
  /** Filtre par catégorie (UUID) */
  categorie_id?: string;
  /** Statut souhaité — défaut : 'actif' */
  statut?: DbProduit['statut'];
  /** Si true, ne retourne que les produits en vedette */
  vedette?: boolean;
  /** Nombre maximum de résultats (défaut : 20) */
  limit?: number;
  /** Offset pour la pagination (défaut : 0) */
  offset?: number;
  /** Colonne de tri (défaut : 'created_at') */
  orderBy?: 'created_at' | 'prix' | 'nom';
  /** Sens du tri (défaut : false = DESC) */
  ascending?: boolean;
}

// =============================================================================
//  Réponses API paginées
// =============================================================================

export interface PaginatedProduits {
  data:    ProduitCard[];
  total:   number;
  limit:   number;
  offset:  number;
  hasMore: boolean;
}

// =============================================================================
//  Helpers de formatage
// =============================================================================

/** Formate un prix en FCFA avec séparateur de milliers */
export function formatFCFA(montant: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style:    'currency',
    currency: 'XOF',         // FCFA — ISO 4217
    maximumFractionDigits: 0,
  }).format(montant);
}

/** Retourne vrai si un produit est en promotion */
export function isProduitEnPromo(produit: Pick<DbProduit, 'prix_promo'>): boolean {
  return produit.prix_promo !== null && produit.prix_promo > 0;
}

/** Calcule le pourcentage de remise */
export function getPourcentageRemise(
  prix: number,
  prix_promo: number,
): number {
  if (prix === 0) return 0;
  return Math.round(((prix - prix_promo) / prix) * 100);
}
