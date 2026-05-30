/**
 * Types partagés — système de scraping Mathieu&Co
 */

// ─── ScrapedProduct ───────────────────────────────────────────────────────────

export type ScrapingSource = 'alibaba' | 'aliexpress' | 'amazon' | 'jumia';

export interface ScrapedAvis {
  auteur:   string;
  note:     number;   // 1–5
  date:     string;
  texte:    string;
}

export interface ScrapedVariante {
  nom:    string;       // "Couleur", "Taille", "Matériau"
  valeur: string;       // "Bleu", "M", "Bois"
  prix?:  number;       // prix spécifique à cette variante (XOF)
  stock?: number;
}

export interface ScrapedProduct {
  /** URL source d'où le produit a été extrait */
  url:   string;
  source: ScrapingSource;

  /** Informations produit */
  nom:                 string;
  description:         string | null;
  description_courte?: string | null;

  /** Prix */
  prix_original:       number;       // Prix dans la devise source
  devise_originale:    string;       // 'USD', 'EUR', 'NGN', 'CNY', etc.
  prix_xof:            number;       // Converti en FCFA

  /** Médias */
  images_urls:         string[];     // URLs brutes à télécharger
  images_supabase?:    string[];     // URLs après upload Supabase Storage

  /** Caractéristiques */
  materiaux?:          string[];
  dimensions?:         { l?: number; w?: number; h?: number; unite?: string } | null;
  poids_g?:            number | null;
  couleurs?:           string[];
  origine?:            string | null;
  artisan?:            string | null;

  /** Taxonomie */
  tags?:               string[];
  categorie_suggeree?: string | null;

  /** Avis */
  avis_note?:          number | null;   // Moyenne 1–5
  avis_total?:         number | null;   // Nombre d'avis
  avis_exemples?:      ScrapedAvis[];

  /** Variantes */
  variantes?:          ScrapedVariante[];

  /** Statut */
  scrapedAt:           Date;
  erreurs?:            string[];
}

// ─── ScrapeJobStatus ─────────────────────────────────────────────────────────

export type ScrapeJobStatus = 'pending' | 'scraping' | 'done' | 'error';

export interface ScrapeJob {
  id:        string;
  url:       string;
  source:    ScrapingSource;
  status:    ScrapeJobStatus;
  result?:   ScrapedProduct;
  erreur?:   string;
  createdAt: Date;
  updatedAt: Date;
}

// ─── ImportPayload ────────────────────────────────────────────────────────────

/** Données éditées dans l'interface admin avant import en base */
export interface ImportPayload {
  nom:                string;
  description:        string | null;
  description_courte: string | null;
  slug:               string;
  prix:               number;       // Prix final en XOF
  prix_promo:         number | null;
  stock:              number;
  images:             string[];     // URLs Supabase Storage
  materiaux:          string[];
  poids_g:            number | null;
  tags:               string[];
  categorie_id:       string | null;
  vedette:            boolean;
  origine:            string | null;
  artisan:            string | null;
  meta_titre:         string | null;
  meta_description:   string | null;
}
