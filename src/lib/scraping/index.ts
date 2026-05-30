/**
 * scraping/index — Orchestrateur
 *
 * Point d'entrée unique pour tous les scrapers.
 * Détecte automatiquement la source depuis l'URL et dispatch.
 *
 * ⚠️  SERVER-ONLY
 */

import type { ScrapedProduct, ScrapingSource } from './types';

// ─── detectSource ─────────────────────────────────────────────────────────────

export function detectSource(url: string): ScrapingSource | null {
  try {
    const { hostname } = new URL(url);
    if (hostname.includes('alibaba.com') || hostname.includes('1688.com')) return 'alibaba';
    if (hostname.includes('aliexpress.com'))   return 'aliexpress';
    if (hostname.includes('amazon.'))          return 'amazon';
    if (hostname.includes('jumia.'))           return 'jumia';
    return null;
  } catch {
    return null;
  }
}

// ─── scrapeUrl ────────────────────────────────────────────────────────────────

/**
 * Analyse une URL produit et retourne les données scrapées.
 *
 * @param url  URL complète du produit (alibaba.com, aliexpress.com, amazon.*, jumia.*)
 * @throws     Si la source n'est pas supportée ou si le scraping échoue
 */
export async function scrapeUrl(url: string): Promise<ScrapedProduct> {
  const source = detectSource(url);

  if (!source) {
    throw new Error(
      `Source non supportée pour l'URL : ${url}\n` +
      'Sources supportées : alibaba.com, aliexpress.com, amazon.*, jumia.*',
    );
  }

  console.log(`[scraping] Démarrage scraping ${source} pour : ${url}`);
  const start = Date.now();

  let product: ScrapedProduct;

  switch (source) {
    case 'alibaba': {
      const { scrapeAlibaba } = await import('./scrapers/alibaba');
      product = await scrapeAlibaba(url);
      break;
    }
    case 'aliexpress': {
      const { scrapeAliExpress } = await import('./scrapers/aliexpress');
      product = await scrapeAliExpress(url);
      break;
    }
    case 'amazon': {
      const { scrapeAmazon } = await import('./scrapers/amazon');
      product = await scrapeAmazon(url);
      break;
    }
    case 'jumia': {
      const { scrapeJumia } = await import('./scrapers/jumia');
      product = await scrapeJumia(url);
      break;
    }
  }

  const elapsed = ((Date.now() - start) / 1000).toFixed(1);
  console.log(`[scraping] Terminé (${elapsed}s) — "${product.nom}" — ${product.images_urls.length} images`);
  if (product.erreurs?.length) {
    console.warn(`[scraping] Avertissements :`, product.erreurs);
  }

  return product;
}

// ─── generateSlug ─────────────────────────────────────────────────────────────

export function generateSlug(nom: string, source: ScrapingSource): string {
  const base = nom
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')  // supprimer les accents
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 60);

  // Ajouter un suffixe aléatoire court pour éviter les collisions
  const suffix = Math.random().toString(36).slice(2, 7);
  return `${base}-${suffix}`;
}

// ─── Exports publics ──────────────────────────────────────────────────────────

export type { ScrapedProduct, ScrapingSource, ImportPayload } from './types';
