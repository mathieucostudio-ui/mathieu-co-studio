/**
 * Queries projets — server-side uniquement
 *
 * Fonctions wrappées dans React.cache() pour la déduplication dans le
 * même arbre de rendu (memoization scoped par request).
 */

import { cache }         from 'react';
import { createClient }  from '@/lib/supabase/server';
import type { Database } from '@/types/database';

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
