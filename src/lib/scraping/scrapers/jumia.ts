/**
 * jumia — Scraper Cheerio pour Jumia (jumia.bj, jumia.com.ng, jumia.ci, etc.)
 *
 * ⚠️  SERVER-ONLY
 *
 * Jumia est un site serveur-rendu — Cheerio suffit pour la plupart des pages.
 * Les pages produits Jumia ont une structure CSS assez stable.
 *
 * Supporte :
 *   • jumia.bj/…-xxxxx.html
 *   • jumia.com.ng/…-xxxxx.html
 *   • jumia.ci/…-xxxxx.html
 */

import * as cheerio             from 'cheerio';
import { parsePrice }           from '@/lib/scraping/price-parser';
import type { ScrapedProduct }  from '@/lib/scraping/types';

// ─── Détection devise par domaine ─────────────────────────────────────────────

function deviseFromUrl(url: string): string {
  if (url.includes('jumia.bj'))    return 'XOF';
  if (url.includes('jumia.ci'))    return 'XOF';
  if (url.includes('jumia.sn'))    return 'XOF';
  if (url.includes('jumia.com.ng'))return 'NGN';
  if (url.includes('jumia.co.ke')) return 'KES';
  if (url.includes('jumia.ma'))    return 'MAD';
  if (url.includes('jumia.co.za')) return 'ZAR';
  if (url.includes('jumia.com.gh'))return 'GHS';
  return 'XOF';
}

// ─── fetchHtml ────────────────────────────────────────────────────────────────

async function fetchHtml(url: string): Promise<string> {
  const response = await fetch(url, {
    headers: {
      'User-Agent':      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
      'Accept':          'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'fr-FR,fr;q=0.9',
      'Referer':         'https://www.google.com/',
    },
    signal: AbortSignal.timeout(20_000),
  });

  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.text();
}

// ─── scrapeJumia ──────────────────────────────────────────────────────────────

export async function scrapeJumia(url: string): Promise<ScrapedProduct> {
  const erreurs: string[] = [];
  const html = await fetchHtml(url);
  const $    = cheerio.load(html);

  // Détecter les pages de blocage
  if (!$('h1').length || $('title').text().toLowerCase().includes('access denied')) {
    throw new Error('Page Jumia inaccessible — réessayez plus tard');
  }

  // ── Titre ──────────────────────────────────────────────────────────────────
  const nom = (
    $('h1.name').text() ||
    $('.productMainDetails h1').text() ||
    $('[class*="-name"] h1').text() ||
    $('[data-js="product-title"]').text() ||
    $('h1').first().text() ||
    'Produit Jumia'
  ).trim();

  // ── Prix ───────────────────────────────────────────────────────────────────
  const prixRaw = (
    $('span.prc').text() ||
    $('.price.-b').text() ||
    $('[class*="price"] [class*="current"]').text() ||
    $('[data-js="product-price"]').text() ||
    ''
  ).trim();

  // Injecter la devise si absente
  const deviseFallback = deviseFromUrl(url);
  const prixAvecDevise = prixRaw && !/[A-Z€$£₦]/i.test(prixRaw)
    ? `${deviseFallback} ${prixRaw}`
    : prixRaw;

  const prixData = parsePrice(prixAvecDevise);
  if (!prixData) erreurs.push(`Prix non parsé depuis "${prixRaw}"`);

  // ── Prix promo ─────────────────────────────────────────────────────────────
  const promoRaw = $('span.prc-dsc, [class*="price--old"]').text().trim();

  // ── Images ─────────────────────────────────────────────────────────────────
  const images_urls: string[] = [];

  // Méthode 1 : img tags dans la galerie
  $('img.img.img-responsive, .slick-gallery img, [class*="gallery"] img').each((_, el) => {
    const src = $(el).attr('data-src') || $(el).attr('src') || '';
    if (src.startsWith('http') && !src.includes('1x1.png')) {
      // Jumia utilise des URLs avec taille, on prend la version large
      const large = src.replace(/_small/, '_big').replace(/_medium/, '_big');
      images_urls.push(large);
    }
  });

  // Méthode 2 : JSON-LD
  if (images_urls.length === 0) {
    $('script[type="application/ld+json"]').each((_, el) => {
      try {
        const data = JSON.parse($(el).html() ?? '{}');
        if (data.image) {
          const imgs = Array.isArray(data.image) ? data.image : [data.image];
          imgs.forEach((img: string) => { if (img.startsWith('http')) images_urls.push(img); });
        }
      } catch {
        // ignore JSON parse errors
      }
    });
  }

  if (images_urls.length === 0) erreurs.push('Aucune image trouvée');

  // ── Description ────────────────────────────────────────────────────────────
  const descItems: string[] = [];
  $('.product-description li, [class*="description"] li').each((_, el) => {
    const t = $(el).text().trim();
    if (t) descItems.push(t);
  });
  const descText = descItems.length > 0
    ? descItems.join('\n')
    : ($('.product-description, [class*="description"]').first().text().trim() || null);

  // ── Spécifications ─────────────────────────────────────────────────────────
  const specs: Record<string, string> = {};
  $('table.specifications tr, .product-details li').each((_, el) => {
    const key = $(el).find('th, .name').text().trim().toLowerCase();
    const val = $(el).find('td, .value').text().trim();
    if (key && val) specs[key] = val;
  });

  const materiaux: string[] = [];
  const poids_g:   number | null = null;
  let origine:     string | null = null;

  for (const [key, val] of Object.entries(specs)) {
    if (key.includes('matière') || key.includes('material')) materiaux.push(val);
    if (key.includes('origine') || key.includes('brand origin')) origine = val;
  }

  // ── Marque ─────────────────────────────────────────────────────────────────
  const marque = ($('[class*="brand"] a, .brand-name').first().text().trim()) || null;

  // ── Avis ───────────────────────────────────────────────────────────────────
  const noteText  = $('[class*="stars"] [class*="star-rating"]').attr('class') ?? '';
  const noteMatch = noteText.match(/star-rating-(\d)/);
  const avis_note  = noteMatch ? parseInt(noteMatch[1]) : null;
  const totalText  = $('[class*="count--nb-ratings"], [class*="review-count"]').first().text();
  const avis_total = totalText ? parseInt(totalText.replace(/\D/g, '')) : null;

  // ── Tags / catégories ──────────────────────────────────────────────────────
  const tags: string[] = [];
  $('[class*="breadcrumb"] li a, .breadcrumb a').each((_, el) => {
    const t = $(el).text().trim();
    if (t && t !== 'Jumia' && t !== 'Accueil') tags.push(t);
  });
  if (marque) tags.push(marque);

  return {
    url,
    source:              'jumia',
    nom,
    description:         descText,
    description_courte:  descText ? descText.slice(0, 160) : null,
    prix_original:       prixData?.montant ?? 0,
    devise_originale:    prixData?.devise ?? deviseFallback,
    prix_xof:            prixData?.xof ?? 0,
    images_urls:         [...new Set(images_urls)].slice(0, 12),
    materiaux,
    poids_g,
    origine,
    artisan:             marque ?? null,
    tags,
    avis_note,
    avis_total,
    scrapedAt:           new Date(),
    erreurs,
  };
}
