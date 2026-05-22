/**
 * Queries avis — server-side uniquement
 * Wrappées dans React.cache() pour déduplication.
 *
 * Seuls les avis statut='approuve' sont visibles via RLS (rôle anon/authenticated).
 */

import { cache } from 'react';
import { createClient } from '@/lib/supabase/server';
import type { Tables } from '@/types/database';

// ─── Types ────────────────────────────────────────────────────────────────────

export type AvisRow = Pick<
  Tables<'avis'>,
  'id' | 'produit_id' | 'note' | 'titre' | 'commentaire' | 'verifie' | 'created_at'
>;

export interface AvisStats {
  total:    number;
  moyenne:  number;
  repartition: Record<1|2|3|4|5, number>;  // note → count
}

// =============================================================================
//  getAvisParProduit
// =============================================================================

export const getAvisParProduit = cache(async (
  produitId: string,
  limit = 10,
): Promise<{ avis: AvisRow[]; stats: AvisStats }> => {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('avis')
    .select('id, produit_id, note, titre, commentaire, verifie, created_at')
    .eq('produit_id', produitId)
    .eq('statut', 'approuve')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    // Permission denied = avis table pas encore grantée — fallback silencieux
    if (error.code === '42501') return { avis: [], stats: emptyStats() };
    throw new Error(`[getAvisParProduit] ${error.message} (code: ${error.code})`);
  }

  const rows = (data ?? []) as AvisRow[];

  // Calculer les statistiques
  const stats = computeStats(rows);

  return { avis: rows, stats };
});

// ─── Helpers ─────────────────────────────────────────────────────────────────

function emptyStats(): AvisStats {
  return { total: 0, moyenne: 0, repartition: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } };
}

function computeStats(rows: AvisRow[]): AvisStats {
  if (rows.length === 0) return emptyStats();

  const rep: Record<1|2|3|4|5, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  let sum = 0;

  for (const a of rows) {
    const n = Math.min(5, Math.max(1, Math.round(a.note))) as 1|2|3|4|5;
    rep[n]++;
    sum += n;
  }

  return {
    total: rows.length,
    moyenne: Math.round((sum / rows.length) * 10) / 10,
    repartition: rep,
  };
}
