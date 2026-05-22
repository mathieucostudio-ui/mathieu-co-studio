/**
 * Queries catégories — server-side uniquement
 * Wrappées dans React.cache() pour déduplication dans le même rendu.
 */

import { cache } from 'react';
import { createClient } from '@/lib/supabase/server';
import type { DbCategorie } from '@/types/product';

// ─── Types ────────────────────────────────────────────────────────────────────

export type CategorieResumee = Pick<
  DbCategorie,
  'id' | 'slug' | 'nom' | 'description'
>;

// =============================================================================
//  getAllCategories
// =============================================================================

/**
 * Récupère toutes les catégories triées par nom.
 * Utilisée dans la sidebar boutique et le formulaire admin.
 *
 * @example
 * const categories = await getAllCategories()
 */
export const getAllCategories = cache(async (): Promise<CategorieResumee[]> => {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('categories')
    .select('id, slug, nom, description')
    .order('nom', { ascending: true });

  if (error) {
    throw new Error(`[getAllCategories] ${error.message} (code: ${error.code})`);
  }

  return (data ?? []) as CategorieResumee[];
});

// =============================================================================
//  getCategorieBySlug
// =============================================================================

/**
 * Récupère une catégorie par son slug.
 * Retourne null si non trouvée (PGRST116).
 *
 * @example
 * const cat = await getCategorieBySlug('mobilier')
 * if (!cat) notFound()
 */
export const getCategorieBySlug = cache(async (
  slug: string,
): Promise<CategorieResumee | null> => {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('categories')
    .select('id, slug, nom, description')
    .eq('slug', slug)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw new Error(`[getCategorieBySlug] ${error.message} (slug: "${slug}", code: ${error.code})`);
  }

  return data as CategorieResumee;
});
