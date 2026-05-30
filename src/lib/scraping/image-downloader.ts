/**
 * image-downloader — Téléchargement d'images vers Supabase Storage
 *
 * ⚠️  Fichier SERVER-ONLY — utilise createAdminClient (service_role).
 *
 * Flow :
 *   URL externe → fetch → buffer → Supabase Storage (bucket: product-images)
 *   → retourne l'URL publique Supabase
 */

import { createAdminClient } from '@/lib/supabase/server';

const BUCKET = 'product-images';
const MAX_SIZE_MB = 10;
const TIMEOUT_MS  = 15_000;

// ─── Types ────────────────────────────────────────────────────────────────────

export interface DownloadResult {
  url:      string;    // URL publique Supabase Storage
  path:     string;    // Chemin dans le bucket
  sizeKB:   number;
}

// ─── downloadImageToStorage ───────────────────────────────────────────────────

/**
 * Télécharge une image depuis une URL externe et la stocke dans Supabase Storage.
 *
 * @param imageUrl  URL de l'image source
 * @param folder    Dossier dans le bucket (ex: "alibaba/chair-123")
 * @param index     Index de l'image (pour générer un nom unique)
 */
export async function downloadImageToStorage(
  imageUrl: string,
  folder:   string,
  index:    number,
): Promise<DownloadResult | null> {
  try {
    // Nettoyer l'URL (supprimer les paramètres de resize)
    const cleanUrl = cleanImageUrl(imageUrl);

    // Télécharger l'image avec timeout
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

    const response = await fetch(cleanUrl, {
      signal: controller.signal,
      headers: {
        'Accept': 'image/*,*/*',
        'User-Agent': 'Mozilla/5.0 (compatible; MathieuCoStudio-Scraper/1.0)',
      },
    }).finally(() => clearTimeout(timer));

    if (!response.ok) {
      console.warn(`[image-downloader] HTTP ${response.status} pour ${cleanUrl}`);
      return null;
    }

    // Vérifier le content-type
    const contentType = response.headers.get('content-type') ?? 'image/jpeg';
    if (!contentType.startsWith('image/')) {
      console.warn(`[image-downloader] Content-type non-image : ${contentType}`);
      return null;
    }

    // Lire le buffer
    const buffer = await response.arrayBuffer();
    const sizeKB = buffer.byteLength / 1024;

    if (sizeKB > MAX_SIZE_MB * 1024) {
      console.warn(`[image-downloader] Image trop volumineuse : ${sizeKB.toFixed(0)} KB`);
      return null;
    }

    // Déterminer l'extension
    const ext = extensionFromContentType(contentType);

    // Générer un chemin unique
    const timestamp = Date.now();
    const path = `${folder}/${timestamp}-${index}.${ext}`;

    // Upload vers Supabase Storage
    const supabase = await createAdminClient();
    const { error } = await supabase.storage
      .from(BUCKET)
      .upload(path, buffer, {
        contentType,
        cacheControl: '31536000',
        upsert: false,
      });

    if (error) {
      console.error('[image-downloader] Erreur upload Supabase :', error.message);
      return null;
    }

    // Obtenir l'URL publique
    const { data: { publicUrl } } = supabase.storage
      .from(BUCKET)
      .getPublicUrl(path);

    return { url: publicUrl, path, sizeKB };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    if (!msg.includes('abort')) {
      console.error('[image-downloader] Erreur :', msg);
    }
    return null;
  }
}

// ─── downloadMultipleImages ───────────────────────────────────────────────────

/**
 * Télécharge plusieurs images en parallèle (max 4 concurrent).
 * Filtre les résultats null.
 */
export async function downloadMultipleImages(
  urls:    string[],
  folder:  string,
): Promise<string[]> {
  const CHUNK = 4;
  const results: string[] = [];

  const deduped = [...new Set(urls)].slice(0, 20); // max 20 images

  for (let i = 0; i < deduped.length; i += CHUNK) {
    const chunk = deduped.slice(i, i + CHUNK);
    const downloads = await Promise.allSettled(
      chunk.map((url, idx) => downloadImageToStorage(url, folder, i + idx)),
    );

    for (const dl of downloads) {
      if (dl.status === 'fulfilled' && dl.value) {
        results.push(dl.value.url);
      }
    }
  }

  return results;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function cleanImageUrl(url: string): string {
  try {
    const u = new URL(url);
    // Alibaba/AliExpress ajoutent des paramètres de redimensionnement
    ['resize', 'width', 'height', 'crop', 'format', 'quality', 'webp'].forEach((p) => {
      u.searchParams.delete(p);
    });
    return u.toString();
  } catch {
    return url;
  }
}

function extensionFromContentType(ct: string): string {
  if (ct.includes('png'))  return 'png';
  if (ct.includes('gif'))  return 'gif';
  if (ct.includes('webp')) return 'webp';
  if (ct.includes('avif')) return 'avif';
  if (ct.includes('svg'))  return 'svg';
  return 'jpg';
}
