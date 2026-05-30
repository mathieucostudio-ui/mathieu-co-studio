/**
 * amazon — Scraper Cheerio pour Amazon (amazon.fr, amazon.com, amazon.co.uk)
 *
 * ⚠️  SERVER-ONLY
 *
 * Amazon bloque souvent les scrapers non-navigateurs. On utilise
 * des headers réalistes et un User-Agent rotatif.
 *
 * Note : Amazon peut exiger une résolution CAPTCHA dans certains cas —
 * on détecte le pattern et on lève une erreur explicite.
 */

import * as cheerio             from 'cheerio';
import { parsePrice }           from '@/lib/scraping/price-parser';
import type { ScrapedProduct }  from '@/lib/scraping/types';

// ─── User-Agent pool ──────────────────────────────────────────────────────────

const UA_POOL = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'Mozilla/5.0 (X11; Linux x86_64; rv:124.0) Gecko/20100101 Firefox/124.0',
];

// ─── fetchHtml ────────────────────────────────────────────────────────────────

async function fetchHtml(url: string): Promise<string> {
  const ua = UA_POOL[Math.floor(Math.random() * UA_POOL.length)];

  const response = await fetch(url, {
    headers: {
      'User-Agent':       ua,
      'Accept':           'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
      'Accept-Language':  'fr-FR,fr;q=0.9,en;q=0.8',
      'Accept-Encoding':  'gzip, deflate, br',
      'Connection':       'keep-alive',
      'Cache-Control':    'no-cache',
      'Pragma':           'no-cache',
      'Upgrade-Insecure-Requests': '1',
    },
    redirect: 'follow',
    signal: AbortSignal.timeout(20_000),
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status} pour ${url}`);
  }

  return response.text();
}

// ─── scrapeAmazon ─────────────────────────────────────────────────────────────

export async function scrapeAmazon(url: string): Promise<ScrapedProduct> {
  const erreurs: string[] = [];
  const html = await fetchHtml(url);
  const $    = cheerio.load(html);

  // Détecter les CAPTCHAs et pages de blocage
  if ($('form[action*="captcha"]').length || $('title').text().includes('Robot Check')) {
    throw new Error('Amazon CAPTCHA détecté — réessayez dans quelques minutes ou utilisez Playwright');
  }

  // ── Titre ──────────────────────────────────────────────────────────────────
  const nom = (
    $('#productTitle').text() ||
    $('h1.a-size-large').text() ||
    $('[data-feature-name="title"] h1').text() ||
    'Produit Amazon'
  ).trim();

  // ── Prix ───────────────────────────────────────────────────────────────────
  const prixRaw = (
    $('.a-price .a-offscreen').first().text() ||
    $('#priceblock_ourprice').text() ||
    $('#priceblock_dealprice').text() ||
    $('.a-price-whole').first().text() ||
    ''
  ).trim();
  const prixData = parsePrice(prixRaw);
  if (!prixData) erreurs.push(`Prix non parsé depuis "${prixRaw}"`);

  // ── Images ─────────────────────────────────────────────────────────────────
  const images_urls: string[] = [];

  // Méthode 1: JSON dans les scripts (données produit)
  const scriptContent = $('script[type="text/javascript"]')
    .map((_, el) => $(el).html() ?? '')
    .get()
    .join('\n');

  const imgBlockMatch = scriptContent.match(/"hiRes":"(https:[^"]+)"/g);
  if (imgBlockMatch) {
    imgBlockMatch.forEach((m) => {
      const urlMatch = m.match(/"hiRes":"([^"]+)"/);
      if (urlMatch) images_urls.push(urlMatch[1]);
    });
  }

  // Méthode 2: img tags directs
  if (images_urls.length === 0) {
    $('#imgBlkFront, #landingImage, #main-image-container img').each((_, el) => {
      const src = $(el).attr('src') || $(el).attr('data-old-hires') || '';
      if (src.startsWith('http')) images_urls.push(src);
    });
  }

  // Méthode 3: thumbnails
  if (images_urls.length === 0) {
    $('#altImages img').each((_, el) => {
      const src = ($(el).attr('src') || '')
        .replace('._SS40_', '._SL1500_')
        .replace(/\._AC_.*?\./, '._SL1500_.');
      if (src.startsWith('http') && !src.includes('grey-pixel')) images_urls.push(src);
    });
  }

  if (images_urls.length === 0) erreurs.push('Aucune image trouvée');

  // ── Description ────────────────────────────────────────────────────────────
  const descItems: string[] = [];
  $('#feature-bullets ul li, .a-unordered-list.a-vertical.a-spacing-mini li').each((_, el) => {
    const t = $(el).text().trim();
    if (t) descItems.push(t);
  });
  const description = descItems.length > 0 ? descItems.join('\n') : null;

  // ── Infos produit ──────────────────────────────────────────────────────────
  const specs: Record<string, string> = {};
  $('#productDetails_techSpec_section_1 tr, #productDetails_detailBullets_sections1 tr').each((_, el) => {
    const key = $(el).find('th').text().trim();
    const val = $(el).find('td').text().trim();
    if (key && val) specs[key.toLowerCase()] = val;
  });

  // Table des détails (format liste)
  $('.detail-bullet-list li').each((_, el) => {
    const text = $(el).text().trim();
    const [key, ...rest] = text.split(':');
    if (key && rest.length) specs[key.trim().toLowerCase()] = rest.join(':').trim();
  });

  const poids_g  = extractPoids(specs);
  const origine  = specs['pays d\'origine'] || specs['country of origin'] || null;
  const materiaux = extractMatieres(specs);

  // ── Avis ───────────────────────────────────────────────────────────────────
  const noteText  = $('#acrPopover .a-icon-alt, [data-hook="average-star-rating"] .a-icon-alt').first().text();
  const totalText = $('#acrCustomerReviewText, [data-hook="total-review-count"]').first().text();
  const avis_note  = noteText  ? parseFloat(noteText.split(' ')[0].replace(',', '.')) : null;
  const avis_total = totalText ? parseInt(totalText.replace(/\D/g, ''))               : null;

  // ── Tags ───────────────────────────────────────────────────────────────────
  const tags: string[] = [];
  $('#wayfinding-breadcrumbs_container li a, .a-breadcrumb li a').each((_, el) => {
    const t = $(el).text().trim();
    if (t && t !== 'Amazon') tags.push(t);
  });

  return {
    url,
    source:              'amazon',
    nom,
    description,
    description_courte:  description ? description.slice(0, 160) : null,
    prix_original:       prixData?.montant ?? 0,
    devise_originale:    prixData?.devise ?? 'EUR',
    prix_xof:            prixData?.xof ?? 0,
    images_urls:         [...new Set(images_urls)].slice(0, 12),
    materiaux,
    poids_g,
    origine,
    artisan:             null,
    tags,
    avis_note,
    avis_total,
    scrapedAt:           new Date(),
    erreurs,
  };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function extractPoids(specs: Record<string, string>): number | null {
  const keys = ['poids', 'weight', 'masse', 'mass'];
  for (const k of keys) {
    const val = Object.entries(specs).find(([key]) => key.includes(k))?.[1];
    if (val) {
      const match = val.match(/([\d.,]+)\s*(kg|g|lb|oz)/i);
      if (match) {
        const n    = parseFloat(match[1].replace(',', '.'));
        const unit = match[2].toLowerCase();
        if (unit === 'kg')  return Math.round(n * 1000);
        if (unit === 'lb')  return Math.round(n * 453.6);
        if (unit === 'oz')  return Math.round(n * 28.35);
        return Math.round(n);
      }
    }
  }
  return null;
}

function extractMatieres(specs: Record<string, string>): string[] {
  const keys = ['matière', 'material', 'fabric', 'tissu', 'composition'];
  for (const k of keys) {
    const val = Object.entries(specs).find(([key]) => key.includes(k))?.[1];
    if (val) return val.split(',').map((s) => s.trim()).filter(Boolean);
  }
  return [];
}
