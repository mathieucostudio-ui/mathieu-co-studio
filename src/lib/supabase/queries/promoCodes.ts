/**
 * promoCodes — validation code promo via Supabase (browser-side)
 *
 * Vérifie : actif, date_fin non dépassée, usage_maximum non atteint.
 * Le seuil minimum_commande est vérifié dans cartStore (besoin du sous-total).
 */

import { createClient }    from '@/lib/supabase/client';
import type { Database }   from '@/types/database';

type DbCodePromo = Database['public']['Tables']['codes_promo']['Row'];

export type PromoValidation =
  | { ok: true;  promo: DbCodePromo }
  | { ok: false; erreur: 'code_invalide' | 'code_expire' | 'limite_atteinte' | 'erreur_reseau' };

export async function validerCodePromo(rawCode: string): Promise<PromoValidation> {
  const code = rawCode.trim().toUpperCase();

  try {
    const supabase = createClient();

    const result = await supabase
      .from('codes_promo')
      .select('*')
      .eq('code', code)
      .single();

    const data = result.data as DbCodePromo | null;
    const error = result.error;

    if (error || !data) return { ok: false, erreur: 'code_invalide' };
    if (!data.actif)    return { ok: false, erreur: 'code_invalide' };

    if (data.date_fin && new Date(data.date_fin) < new Date()) {
      return { ok: false, erreur: 'code_expire' };
    }

    if (data.usage_maximum !== null && data.usage_actuel >= data.usage_maximum) {
      return { ok: false, erreur: 'limite_atteinte' };
    }

    return { ok: true, promo: data };
  } catch {
    return { ok: false, erreur: 'erreur_reseau' };
  }
}
