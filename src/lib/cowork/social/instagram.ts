/**
 * cowork/social/instagram — Instagram Graph API
 *
 * ⚠️  SERVER-ONLY
 *
 * Variables d'environnement requises :
 *   INSTAGRAM_ACCESS_TOKEN  — Token d'accès longue durée (60 jours)
 *   INSTAGRAM_ACCOUNT_ID    — ID du compte Instagram Business
 *
 * Flow de publication :
 *   1. Uploader le media (image) → obtenir un container_id
 *   2. Publier le container → obtenir le post_id
 *
 * Documentation : https://developers.facebook.com/docs/instagram-api/guides/content-publishing
 */

import type { PostResult, InstagramMetrics } from '../types';

const GRAPH_URL = 'https://graph.facebook.com/v19.0';

function getConfig() {
  const token     = process.env.INSTAGRAM_ACCESS_TOKEN;
  const accountId = process.env.INSTAGRAM_ACCOUNT_ID;
  return { token, accountId, configured: !!(token && accountId) };
}

// ─── publishPost ──────────────────────────────────────────────────────────────

/**
 * Publie un post photo sur Instagram.
 *
 * @param imageUrl  URL publique de l'image (doit être accessible depuis Meta)
 * @param caption   Texte + hashtags du post
 */
export async function publishInstagramPost(
  imageUrl: string,
  caption:  string,
): Promise<PostResult> {
  const { token, accountId, configured } = getConfig();

  if (!configured) {
    console.warn('[instagram] Non configuré — simulation de publication');
    return {
      ok:     true,
      post_id: `mock_${Date.now()}`,
      url:    'https://www.instagram.com/mathieuandco/',
    };
  }

  try {
    // Étape 1 : Créer le container media
    const containerRes = await fetch(
      `${GRAPH_URL}/${accountId}/media?` +
      `image_url=${encodeURIComponent(imageUrl)}&` +
      `caption=${encodeURIComponent(caption)}&` +
      `access_token=${token}`,
      { method: 'POST', signal: AbortSignal.timeout(20_000) },
    );

    if (!containerRes.ok) {
      const err = await containerRes.json();
      return { ok: false, error: err.error?.message ?? 'Erreur création container' };
    }

    const { id: containerId } = await containerRes.json();

    // Étape 2 : Attendre que le container soit prêt (media processing)
    await waitForContainer(containerId, token!);

    // Étape 3 : Publier le container
    const publishRes = await fetch(
      `${GRAPH_URL}/${accountId}/media_publish?` +
      `creation_id=${containerId}&` +
      `access_token=${token}`,
      { method: 'POST', signal: AbortSignal.timeout(15_000) },
    );

    if (!publishRes.ok) {
      const err = await publishRes.json();
      return { ok: false, error: err.error?.message ?? 'Erreur publication' };
    }

    const { id: postId } = await publishRes.json();

    // Récupérer l'URL du post
    const postRes = await fetch(
      `${GRAPH_URL}/${postId}?fields=permalink&access_token=${token}`,
    );
    const postData = await postRes.json();

    return {
      ok:     true,
      post_id: postId,
      url:    postData.permalink ?? `https://www.instagram.com/p/${postId}/`,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erreur inconnue';
    return { ok: false, error: message };
  }
}

// ─── publishCarousel ──────────────────────────────────────────────────────────

/**
 * Publie un carousel (plusieurs images) sur Instagram.
 */
export async function publishInstagramCarousel(
  imageUrls: string[],
  caption:   string,
): Promise<PostResult> {
  const { token, accountId, configured } = getConfig();

  if (!configured) {
    return { ok: true, post_id: `mock_carousel_${Date.now()}`, url: 'https://www.instagram.com/mathieuandco/' };
  }

  if (imageUrls.length < 2) {
    return publishInstagramPost(imageUrls[0], caption);
  }

  try {
    // Créer les containers enfants
    const childIds: string[] = [];
    for (const url of imageUrls.slice(0, 10)) { // max 10 images
      const res = await fetch(
        `${GRAPH_URL}/${accountId}/media?` +
        `image_url=${encodeURIComponent(url)}&` +
        `is_carousel_item=true&` +
        `access_token=${token}`,
        { method: 'POST', signal: AbortSignal.timeout(15_000) },
      );
      if (!res.ok) continue;
      const { id } = await res.json();
      if (id) childIds.push(id);
    }

    if (childIds.length < 2) return { ok: false, error: 'Pas assez d\'images valides pour le carousel' };

    // Créer le container carousel
    const carouselRes = await fetch(
      `${GRAPH_URL}/${accountId}/media?` +
      `media_type=CAROUSEL&` +
      `caption=${encodeURIComponent(caption)}&` +
      `children=${childIds.join(',')}&` +
      `access_token=${token}`,
      { method: 'POST', signal: AbortSignal.timeout(15_000) },
    );

    if (!carouselRes.ok) {
      const err = await carouselRes.json();
      return { ok: false, error: err.error?.message };
    }

    const { id: containerId } = await carouselRes.json();
    await waitForContainer(containerId, token!);

    const publishRes = await fetch(
      `${GRAPH_URL}/${accountId}/media_publish?creation_id=${containerId}&access_token=${token}`,
      { method: 'POST' },
    );

    const { id: postId } = await publishRes.json();
    return { ok: true, post_id: postId, url: `https://www.instagram.com/p/${postId}/` };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'Erreur inconnue' };
  }
}

// ─── getMetrics ───────────────────────────────────────────────────────────────

/**
 * Récupère les métriques du compte Instagram.
 */
export async function getInstagramMetrics(): Promise<InstagramMetrics | null> {
  const { token, accountId, configured } = getConfig();

  if (!configured) {
    // Mock pour le développement
    return {
      followers: 2_847, impressions: 18_500, reach: 12_300,
      profile_views: 840, posts_count: 127, likes: 3_200,
      comments: 245, saves: 680,
    };
  }

  try {
    const [accountRes, insightsRes] = await Promise.all([
      fetch(`${GRAPH_URL}/${accountId}?fields=followers_count,media_count&access_token=${token}`),
      fetch(
        `${GRAPH_URL}/${accountId}/insights?` +
        `metric=impressions,reach,profile_views&period=week&access_token=${token}`,
      ),
    ]);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const account  = await accountRes.json() as any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const insights = await insightsRes.json() as any;

    const metricsMap: Record<string, number> = {};
    (insights.data ?? []).forEach((m: { name: string; values: { value: number }[] }) => {
      const latest = m.values?.[m.values.length - 1]?.value ?? 0;
      metricsMap[m.name] = latest;
    });

    return {
      followers:     account.followers_count ?? 0,
      impressions:   metricsMap.impressions ?? 0,
      reach:         metricsMap.reach ?? 0,
      profile_views: metricsMap.profile_views ?? 0,
      posts_count:   account.media_count ?? 0,
      likes:         0,
      comments:      0,
      saves:         0,
    };
  } catch {
    return null;
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function waitForContainer(
  containerId: string,
  token:       string,
  maxWait = 30_000,
): Promise<void> {
  const start = Date.now();
  while (Date.now() - start < maxWait) {
    const res  = await fetch(`${GRAPH_URL}/${containerId}?fields=status_code&access_token=${token}`);
    const data = await res.json();
    if (data.status_code === 'FINISHED') return;
    if (data.status_code === 'ERROR') throw new Error('Container media en erreur');
    await new Promise((r) => setTimeout(r, 2_000));
  }
  throw new Error('Timeout attente container media');
}
