/**
 * alibaba — Scraper Playwright pour Alibaba (alibaba.com / 1688.com)
 *
 * ⚠️  SERVER-ONLY
 *
 * Sélecteurs CSS ciblés sur la structure Alibaba (Mai 2026).
 * Robustes via plusieurs fallbacks — les sites e-commerce changent souvent.
 *
 * Supporte :
 *   • alibaba.com/product-detail/xxx.html
 *   • www.alibaba.com/goods/xxx.html
 */

import type { Page }        from 'playwright';
import { withPageRetry }    from '@/lib/scraping/browser';
import { parsePrice }       from '@/lib/scraping/price-parser';
import type { ScrapedProduct } from '@/lib/scraping/types';

// ─── Sélecteurs ───────────────────────────────────────────────────────────────

const SEL = {
  titre: [
    'h1.product-detail-title',
    '.module-pdp-main h1',
    'h1[class*="title"]',
    '#subject',
    'h1',
  ],
  prix: [
    '.module-pdp-price .price-text',
    '.price-module__price',
    '[class*="price-range"]',
    '[class*="price--"]',
    '.price',
  ],
  images: [
    '.detail-main-img-list img',
    '.image-viewer-btn img',
    '[class*="img-list"] img',
    '[class*="detail-img"] img',
    '.slide-show-img img',
    'img[src*="alicdn"]',
  ],
  description: [
    '#description',
    '.module-pdp-description',
    '[class*="detail-desc"]',
    '[class*="product-desc"]',
  ],
  avis: {
    note:  '.feedback-score, [class*="rating-score"]',
    total: '.feedback-count, [class*="rating-count"]',
  },
  infos: {
    origine: '[class*="origin"], .origin-item td',
    matiere: '[class*="material"], .material-td',
  },
} as const;

// ─── scrapeAlibaba ────────────────────────────────────────────────────────────

export async function scrapeAlibaba(url: string): Promise<ScrapedProduct> {
  const erreurs: string[] = [];

  return withPageRetry(async (page) => {
    // Navigation
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30_000 });

    // Attendre le contenu principal
    await page.waitForSelector('h1, .module-pdp-main, #subject', { timeout: 10_000 })
      .catch(() => { erreurs.push('Timeout attente contenu principal'); });

    // ── Titre ────────────────────────────────────────────────────────────────
    const nom = await extractText(page, SEL.titre) ?? 'Produit Alibaba';

    // ── Prix ─────────────────────────────────────────────────────────────────
    const prixRaw  = await extractText(page, SEL.prix) ?? '';
    const prixData = parsePrice(prixRaw);
    const prix_xof = prixData?.xof ?? 0;

    // ── Images ───────────────────────────────────────────────────────────────
    const images_urls = await extractImages(page, SEL.images);

    // ── Description ──────────────────────────────────────────────────────────
    const descRaw = await extractText(page, SEL.description);
    const description = descRaw ? truncate(descRaw, 2000) : null;

    // ── Avis ─────────────────────────────────────────────────────────────────
    const noteRaw  = await extractText(page, [SEL.avis.note]);
    const totalRaw = await extractText(page, [SEL.avis.total]);
    const avis_note  = noteRaw  ? parseFloat(noteRaw)  : null;
    const avis_total = totalRaw ? parseInt(totalRaw.replace(/\D/g, '')) : null;

    // ── Infos produit ─────────────────────────────────────────────────────────
    const origine = await extractText(page, [SEL.infos.origine]);

    // ── Variantes (couleurs, tailles) ─────────────────────────────────────────
    const couleurs = await page.$$eval(
      '[class*="sku-item"] [class*="sku-property-text"], [class*="color-item"] span',
      (els) => [...new Set(els.map((e) => e.textContent?.trim()).filter(Boolean))] as string[],
    ).catch(() => []);

    // ── Tags depuis les fils d'Ariane / catégories ─────────────────────────────
    const tags = await page.$$eval(
      '[class*="breadcrumb"] a, nav[aria-label*="breadcrumb"] a',
      (els) => els.map((e) => e.textContent?.trim()).filter(Boolean).slice(1) as string[],
    ).catch(() => []);

    if (!prixData) erreurs.push(`Prix non parsé depuis "${prixRaw}"`);
    if (images_urls.length === 0) erreurs.push('Aucune image trouvée');

    return {
      url,
      source: 'alibaba',
      nom,
      description,
      description_courte: description ? truncate(description, 160) : null,
      prix_original: prixData?.montant ?? 0,
      devise_originale: prixData?.devise ?? 'USD',
      prix_xof,
      images_urls,
      couleurs,
      origine: origine ?? null,
      artisan: null,
      tags,
      avis_note,
      avis_total,
      scrapedAt: new Date(),
      erreurs,
    };
  }, { timeout: 40_000, retries: 2 });
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
          .map((img) => img.src || img.dataset.src || img.getAttribute('data-original') || '')
          .filter((u) => u.startsWith('http') && !u.includes('placeholder'))
          .slice(0, 12),
      );
      if (urls.length > 0) return [...new Set(urls)];
    } catch {
      // Try next selector
    }
  }
  return [];
}

function truncate(text: string, max: number): string {
  return text.length > max ? text.slice(0, max - 1) + '…' : text;
}
