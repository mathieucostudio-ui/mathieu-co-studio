/**
 * Queries blog — server-side uniquement
 */

import { cache }         from 'react';
import { createClient }  from '@/lib/supabase/server';
import type { Database } from '@/types/database';

export type ArticleCard = Pick<
  Database['public']['Tables']['articles_blog']['Row'],
  | 'id'
  | 'slug'
  | 'titre'
  | 'sous_titre'
  | 'extrait'
  | 'image_principale'
  | 'image_alt'
  | 'tags'
  | 'categorie'
  | 'auteur_nom'
  | 'publie_le'
  | 'temps_lecture_min'
  | 'vues'
>;

export type ArticleDetail = Database['public']['Tables']['articles_blog']['Row'];

const SELECT_CARD = `
  id, slug, titre, sous_titre, extrait,
  image_principale, image_alt, tags, categorie,
  auteur_nom, publie_le, temps_lecture_min, vues
` as const;

// ─── getAllArticles ────────────────────────────────────────────────────────────

export const getAllArticles = cache(async (): Promise<ArticleCard[]> => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('articles_blog')
    .select(SELECT_CARD)
    .eq('statut', 'publie')
    .order('publie_le', { ascending: false });

  if (error) {
    console.error('[getAllArticles]', error.message);
    return [];
  }
  return (data ?? []) as ArticleCard[];
});

// ─── getArticleBySlug ─────────────────────────────────────────────────────────

export const getArticleBySlug = cache(async (slug: string): Promise<ArticleDetail | null> => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('articles_blog')
    .select('*')
    .eq('slug', slug)
    .eq('statut', 'publie')
    .maybeSingle();

  if (error) {
    console.error('[getArticleBySlug]', error.message);
    return null;
  }
  return data as ArticleDetail | null;
});

// ─── getArticlesSimilaires ────────────────────────────────────────────────────

export const getArticlesSimilaires = cache(async (
  categorie: string | null,
  excludeSlug: string,
  limit = 3,
): Promise<ArticleCard[]> => {
  const supabase = await createClient();

  let query = supabase
    .from('articles_blog')
    .select(SELECT_CARD)
    .eq('statut', 'publie')
    .neq('slug', excludeSlug)
    .order('publie_le', { ascending: false })
    .limit(limit);

  if (categorie) query = query.eq('categorie', categorie);

  const { data } = await query;
  return (data ?? []) as ArticleCard[];
});
