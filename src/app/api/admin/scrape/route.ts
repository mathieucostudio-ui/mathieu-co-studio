/**
 * POST /api/admin/scrape
 *
 * Scrape une URL produit et retourne les données extraites.
 * Optionnellement télécharge les images vers Supabase Storage.
 *
 * Body : { url: string; downloadImages?: boolean }
 * Auth : header x-admin-secret = ADMIN_SECRET env var
 */

import { NextRequest, NextResponse } from 'next/server';
import { scrapeUrl, detectSource }   from '@/lib/scraping';
import { downloadMultipleImages }    from '@/lib/scraping/image-downloader';
import { generateSlug }              from '@/lib/scraping';

// ─── Vérification auth admin ──────────────────────────────────────────────────

function isAuthorized(req: NextRequest): boolean {
  const secret = process.env.ADMIN_SECRET;
  if (!secret) return true; // Pas de secret configuré → pas de restriction (dev)
  const header = req.headers.get('x-admin-secret');
  return header === secret;
}

// ─── POST handler ─────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  let body: { url?: string; downloadImages?: boolean };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Body JSON invalide' }, { status: 400 });
  }

  const { url, downloadImages = false } = body;

  if (!url || typeof url !== 'string') {
    return NextResponse.json({ error: 'Paramètre url manquant ou invalide' }, { status: 400 });
  }

  // Valider l'URL
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return NextResponse.json({ error: `URL invalide : ${url}` }, { status: 400 });
  }

  // Vérifier la source
  const source = detectSource(url);
  if (!source) {
    return NextResponse.json({
      error: 'Source non supportée',
      supportees: ['alibaba.com', 'aliexpress.com', 'amazon.*', 'jumia.*'],
    }, { status: 422 });
  }

  try {
    // Scraper l'URL
    const product = await scrapeUrl(url);

    // Télécharger les images si demandé
    if (downloadImages && product.images_urls.length > 0) {
      const folder = `scraped/${source}/${parsed.hostname.split('.')[0]}-${Date.now()}`;
      const supabaseUrls = await downloadMultipleImages(product.images_urls, folder);
      product.images_supabase = supabaseUrls;
    }

    // Générer un slug suggéré
    const slugSuggeree = generateSlug(product.nom, source);

    return NextResponse.json({
      ok:      true,
      product: { ...product, slugSuggeree },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erreur inconnue';
    console.error('[api/admin/scrape]', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
