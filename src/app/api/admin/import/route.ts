/**
 * POST /api/admin/import
 *
 * Importe un produit édité dans la table Supabase `produits`.
 *
 * Body : ImportPayload
 * Auth : header x-admin-secret = ADMIN_SECRET env var
 */

import { NextRequest, NextResponse }  from 'next/server';
import { createAdminClient }           from '@/lib/supabase/server';
import type { ImportPayload }          from '@/lib/scraping/types';

// ─── Auth helper ──────────────────────────────────────────────────────────────

function isAuthorized(req: NextRequest): boolean {
  const secret = process.env.ADMIN_SECRET;
  if (!secret) return true;
  return req.headers.get('x-admin-secret') === secret;
}

// ─── POST handler ─────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  let payload: ImportPayload;
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ error: 'Body JSON invalide' }, { status: 400 });
  }

  // Validation basique
  if (!payload.nom || !payload.slug || payload.prix == null) {
    return NextResponse.json({
      error: 'Champs obligatoires manquants : nom, slug, prix',
    }, { status: 400 });
  }

  if (payload.prix < 0) {
    return NextResponse.json({ error: 'Le prix doit être positif' }, { status: 400 });
  }

  try {
    const supabase = await createAdminClient();

    // Vérifier si le slug existe déjà
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: existing } = await (supabase as any)
      .from('produits')
      .select('id, slug')
      .eq('slug', payload.slug)
      .maybeSingle();

    if (existing) {
      return NextResponse.json({
        error: `Le slug "${payload.slug}" est déjà utilisé`,
        existingId: (existing as { id: string }).id,
      }, { status: 409 });
    }

    // Préparer l'objet produit pour l'insertion
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const insertData: Record<string, any> = {
      nom:                payload.nom,
      description:        payload.description,
      description_courte: payload.description_courte,
      slug:               payload.slug,
      prix:               payload.prix,
      prix_promo:         payload.prix_promo ?? null,
      stock:              payload.stock ?? 0,
      images:             payload.images,
      materiaux:          payload.materiaux.length > 0 ? payload.materiaux : null,
      poids_g:            payload.poids_g ?? null,
      tags:               payload.tags.length > 0 ? payload.tags : null,
      categorie_id:       payload.categorie_id ?? null,
      vedette:            payload.vedette ?? false,
      origine:            payload.origine ?? null,
      artisan:            payload.artisan ?? null,
      meta_titre:         payload.meta_titre ?? null,
      meta_description:   payload.meta_description ?? null,
      statut:             'brouillon', // Toujours en brouillon à l'import
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: produitRaw, error } = await (supabase as any)
      .from('produits')
      .insert(insertData)
      .select('id, slug, nom')
      .single();

    if (error) {
      console.error('[api/admin/import] Erreur Supabase :', error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const produit = produitRaw as { id: string; slug: string; nom: string };

    return NextResponse.json({
      ok:     true,
      produit: { id: produit.id, slug: produit.slug, nom: produit.nom },
      message: `Produit "${produit.nom}" importé avec succès (statut: brouillon)`,
    }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erreur inconnue';
    console.error('[api/admin/import]', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
