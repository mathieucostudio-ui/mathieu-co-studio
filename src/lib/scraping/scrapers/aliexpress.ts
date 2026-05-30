/**
 * aliexpress — Scraper Playwright pour AliExpress (aliexpress.com)
 *
 * ⚠️  SERVER-ONLY
 *
 * AliExpress est fortement JavaScript — on attend le rendu complet
 * avant d'extraire les données.
 *
 * Supporte :
 *   • www.aliexpress.com/item/xxx.html
 *   • fr.aliexpress.com/item/xxx.html
 */

import type { Page }           from 'playwright';
import { withPageRetry }       from '@/lib/scraping/browser';
import { parsePrice }          from '@/lib/scraping/price-parser';
import type { ScrapedProduct } from '@/lib/scraping/types';

// ─── Sélecteurs ───────────────────────────────────────────────────────────────

const SEL = {
  titre: [
    'h1[data-pl="product-title"]',
    '.product-title',
    'h1[class*="title"]',
    '.pdp-info h1',
    'h1',
  ],
  prix: [
    '.product-price-value',
    '[class*="price--currentPriceText"]',
    '[class*="CurrentPrice"]',
    '.uniform-banner-box-price',
    '[data-pl="product-price"]',
  ],
  images: [
    '[class*="magnifier--image"] img',
    '[class*="image-zoom"] img',
    '.images-view-list img',
    '[class*="gallery-item"] img',
    '.pdp-images img',
  ],
  imagesThumbs: [
    '.images-view-list img[src*="alicdn"]',
    '[class*="img-item"] img',
  ],
  description: [
    '[data-pl="product-description"]',
    '.product-description',
    '[class*="description-wrap"]',
    '#product-desc',
  ],
  avis: {
    note:  '[class*="overview-rating"]',
    total: '[class*="overview-ratings"]',
  },
  specs: '[class*="specification-key"]',
  specsValues: '[class*="specification-value"]',
} as const;

// ─── scrapeAliExpress ─────────────────────────────────────────────────────────

export async function scrapeAliExpress(url: string): Promise<ScrapedProduct> {
  const erreurs: string[] = [];

  return withPageRetry(async (page) => {
    await page.goto(url, { waitUntil: 'networkidle', timeout: 35_000 });

    // Attendre que le titre du produit soit visible
    await page.waitForSelector('h1, .product-title', { timeout: 12_000 })
      .catch(() => { erreurs.push('Timeout attente titre'); });

    // Anti-popup : fermer les modales éventuelles
    await page.click('[class*="close-btn"], .close-mask, [aria-label*="Close"]')
      .catch(() => {});

    // ── Titre ────────────────────────────────────────────────────────────────
    const nom = await extractText(page, SEL.titre) ?? 'Produit AliExpress';

    // ── Prix ─────────────────────────────────────────────────────────────────
    const prixRaw  = await extractText(page, SEL.prix) ?? '';
    const prixData = parsePrice(prixRaw);
    const prix_xof = prixData?.xof ?? 0;

    // ── Images ───────────────────────────────────────────────────────────────
    // AliExpress : les images HD sont dans les thumbnails
    let images_urls = await extractImages(page, SEL.imagesThumbs);
    if (images_urls.length === 0) {
      images_urls = await extractImages(page, SEL.images);
    }
    // Convertir les URLs thumbnail vers HD (supprimer le resize)
    images_urls = images_urls.map((u) =>
      u.replace(/_\d+x\d+\.(jpg|jpeg|png|webp)/i, '.$1')
       .replace(/\?.*$/, ''),
    );

    // ── Description ──────────────────────────────────────────────────────────
    const descRaw     = await extractText(page, SEL.description);
    const description = descRaw ? descRaw.slice(0, 2000) : null;

    // ── Spécifications ────────────────────────────────────────────────────────
    const specs = await page.evaluate(() => {
      const keys   = Array.from(document.querySelectorAll('[class*="specification-key"]'));
      const values = Array.from(document.querySelectorAll('[class*="specification-value"]'));
      const result: Record<string, string> = {};
      keys.forEach((k, i) => {
        const key = k.textContent?.trim();
        const val = values[i]?.textContent?.trim();
        if (key && val) result[key] = val;
      });
      return result;
    }).catch(() => ({} as Record<string, string>));

    // Extraire materiaux et dimensions depuis les specs
    const materiaux: string[] = [];
    const dimensions = null;
    let poids_g: number | null = null;
    let origine: string | null = null;

    for (const [key, val] of Object.entries(specs)) {
      const k = key.toLowerCase();
      if (k.includes('material') || k.includes('matériau') || k.includes('matiere')) {
        materiaux.push(val);
      }
      if (k.includes('origin') || k.includes('origine') || k.includes('country')) {
        origine = val;
      }
      if (k.includes('weight') || k.includes('poids')) {
        const match = val.match(/[\d.]+/);
        if (match) {
          const g = parseFloat(match[0]);
          poids_g = val.toLowerCase().includes('kg') ? Math.round(g * 1000) : Math.round(g);
        }
      }
    }

    // ── Avis ─────────────────────────────────────────────────────────────────
    const noteRaw  = await extractText(page, [SEL.avis.note]);
    const totalRaw = await extractText(page, [SEL.avis.total]);
    const avis_note  = noteRaw  ? parseFloat(noteRaw)  : null;
    const avis_total = totalRaw ? parseInt(totalRaw.replace(/\D/g, '')) : null;

    // ── Tags depuis catégories ────────────────────────────────────────────────
    const tags = await page.$$eval(
      '[class*="breadcrumb"] a, [class*="nav-path"] a',
      (els) => els.map((e) => e.textContent?.trim()).filter(Boolean).slice(1) as string[],
    ).catch(() => []);

    if (!prixData) erreurs.push(`Prix non parsé depuis "${prixRaw}"`);
    if (images_urls.length === 0) erreurs.push('Aucune image trouvée');

    return {
      url,
      source:              'aliexpress',
      nom,
      description,
      description_courte:  description ? description.slice(0, 160) + (description.length > 160 ? '…' : '') : null,
      prix_original:       prixData?.montant ?? 0,
      devise_originale:    prixData?.devise ?? 'USD',
      prix_xof,
      images_urls,
      materiaux,
      dimensions,
      poids_g,
      origine,
      artisan:             null,
      tags,
      avis_note,
      avis_total,
      scrapedAt:           new Date(),
      erreurs,
    };
  }, { timeout: 45_000, retries: 2 });
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function extractText(
  page: Page,
  selectors: readonly string[],
): Promise<string | null> {
  for (const sel of selectors) {
    try {
      const text = await page.$eval(sel, (el) => el.textContent?.trim() ?? '');
      if (text) return text;
    } catch {
      // Try next selector
    }
  }
  return null;
}

async function extractImages(
  page: Page,
  selectors: readonly string[],
): Promise<string[]> {
  for (const sel of selectors) {
    try {
      const urls = await page.$$eval(sel, (imgs) =>
        (imgs as HTMLImageElement[])
          .map((img) => img.src || img.dataset.src || '')
          .filter((u) => u.startsWith('http') && (u.includes('alicdn') || u.includes('ae01') || u.includes('ae02')))
          .slice(0, 12),
      );
      if (urls.length > 0) return [...new Set(urls)];
    } catch {
      // Try next selector
    }
  }
  return [];
}
