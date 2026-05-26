/**
 * Queries projets — server-side uniquement
 *
 * Fonctions wrappées dans React.cache() pour la déduplication dans le
 * même arbre de rendu (memoization scoped par request).
 */

import { cache }         from 'react';
import { createClient }  from '@/lib/supabase/server';
import type { Database, Json } from '@/types/database';

// ─── Image type ───────────────────────────────────────────────────────────────

export type ProjetImage = {
  url:   string;
  alt?:  string;
  /** 'galerie' | 'avant' | 'apres' — avant/après images are separated */
  type?: string;
};

export function parseProjetImages(raw: Json): ProjetImage[] {
  if (!Array.isArray(raw)) return [];
  return raw
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .filter((item): item is Record<string, any> => typeof item === 'object' && item !== null)
    .map((item) => ({
      url:  typeof item['url']  === 'string' ? item['url']  : '',
      alt:  typeof item['alt']  === 'string' ? item['alt']  : '',
      type: typeof item['type'] === 'string' ? item['type'] : 'galerie',
    }))
    .filter((img) => img.url.length > 0);
}

// ─── Card type (listing) ──────────────────────────────────────────────────────

export type ProjetCard = Pick<
  Database['public']['Tables']['projets']['Row'],
  | 'id'
  | 'slug'
  | 'titre'
  | 'sous_titre'
  | 'description'
  | 'categorie'
  | 'lieu'
  | 'ville'
  | 'pays'
  | 'annee'
  | 'surface_m2'
  | 'image_principale'
  | 'tags'
  | 'vedette'
>;

// ─── Detail type (page fiche) ─────────────────────────────────────────────────

export type ProjetDetail = Database['public']['Tables']['projets']['Row'];

const SELECT_CARD = `
  id,
  slug,
  titre,
  sous_titre,
  description,
  categorie,
  lieu,
  ville,
  pays,
  annee,
  surface_m2,
  image_principale,
  tags,
  vedette
` as const;

// ─── getAllProjets ─────────────────────────────────────────────────────────────

export const getAllProjets = cache(async (): Promise<ProjetCard[]> => {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('projets')
    .select(SELECT_CARD)
    .eq('statut', 'publie')
    .order('vedette', { ascending: false })
    .order('annee',   { ascending: false });

  if (error) {
    console.error('[getAllProjets]', error.message);
    throw new Error(error.message);
  }

  return (data ?? []) as ProjetCard[];
});

// ─── getProjetBySlug ──────────────────────────────────────────────────────────

export const getProjetBySlug = cache(async (slug: string): Promise<ProjetCard | null> => {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('projets')
    .select(SELECT_CARD)
    .eq('slug', slug)
    .eq('statut', 'publie')
    .maybeSingle();

  if (error) {
    console.error('[getProjetBySlug]', error.message);
    throw new Error(error.message);
  }

  return data as ProjetCard | null;
});

// ─── getProjetDetail — toutes les colonnes pour la page détail ────────────────

export const getProjetDetail = cache(async (slug: string): Promise<ProjetDetail | null> => {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('projets')
    .select('*')
    .eq('slug', slug)
    .eq('statut', 'publie')
    .maybeSingle();

  if (error) {
    console.error('[getProjetDetail]', error.message);
    throw new Error(error.message);
  }

  return data as ProjetDetail | null;
});

// ─── getProjetsSimIlaires — même catégorie, exclure slug actuel ────────────────

export const getProjetsSimIlaires = cache(async (
  categorie: string,
  excludeSlug: string,
  limit = 3,
): Promise<ProjetCard[]> => {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('projets')
    .select(SELECT_CARD)
    .eq('statut', 'publie')
    .eq('categorie', categorie)
    .neq('slug', excludeSlug)
    .order('vedette', { ascending: false })
    .order('annee',   { ascending: false })
    .limit(limit);

  if (error) {
    console.error('[getProjetsSimIlaires]', error.message);
    return [];
  }

  // Pad with other categories if not enough same-category results
  if ((data ?? []).length < limit) {
    const { data: fallback } = await supabase
      .from('projets')
      .select(SELECT_CARD)
      .eq('statut', 'publie')
      .neq('slug', excludeSlug)
      .order('vedette', { ascending: false })
      .limit(limit);
    return ((fallback ?? []) as ProjetCard[]).slice(0, limit);
  }

  return (data ?? []) as ProjetCard[];
});
