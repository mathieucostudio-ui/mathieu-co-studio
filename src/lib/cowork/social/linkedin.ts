/**
 * cowork/social/linkedin — LinkedIn API v2
 *
 * ⚠️  SERVER-ONLY
 *
 * Variables d'environnement requises :
 *   LINKEDIN_ACCESS_TOKEN  — Token OAuth 2.0 (valide 60 jours)
 *   LINKEDIN_PERSON_ID     — URN de la personne : urn:li:person:xxx
 *   LINKEDIN_ORG_ID        — URN de l'organisation (optionnel) : urn:li:organization:xxx
 *
 * La publication peut cibler soit le profil personnel, soit la page entreprise.
 *
 * Documentation : https://learn.microsoft.com/en-us/linkedin/marketing/community-management/shares
 */

import type { PostResult, LinkedInMetrics } from '../types';

const API_URL = 'https://api.linkedin.com/v2';
const UPLOAD_URL = 'https://api.linkedin.com/v2/assets?action=registerUpload';

function getConfig() {
  const token  = process.env.LINKEDIN_ACCESS_TOKEN;
  const orgId  = process.env.LINKEDIN_ORG_ID;
  const userId = process.env.LINKEDIN_PERSON_ID;
  const author = orgId
    ? `urn:li:organization:${orgId.replace('urn:li:organization:', '')}`
    : `urn:li:person:${userId?.replace('urn:li:person:', '') ?? ''}`;

  return { token, author, configured: !!(token && (orgId || userId)) };
}

// ─── publishPost ──────────────────────────────────────────────────────────────

/**
 * Publie un post texte (avec ou sans image) sur LinkedIn.
 */
export async function publishLinkedInPost(
  text:     string,
  imageUrl?: string,
): Promise<PostResult> {
  const { token, author, configured } = getConfig();

  if (!configured) {
    console.warn('[linkedin] Non configuré — simulation de publication');
    return { ok: true, post_id: `mock_li_${Date.now()}`, url: 'https://www.linkedin.com/company/mathieu-co-studio/' };
  }

  try {
    // Si image, uploader d'abord
    let imageAsset: string | null = null;
    if (imageUrl) {
      imageAsset = await uploadImage(imageUrl, author, token!);
    }

    // Construire le payload UGC Post
    const payload: Record<string, unknown> = {
      author,
      lifecycleState: 'PUBLISHED',
      specificContent: {
        'com.linkedin.ugc.ShareContent': {
          shareCommentary: { text },
          shareMediaCategory: imageAsset ? 'IMAGE' : 'NONE',
          ...(imageAsset ? {
            media: [{
              status: 'READY',
              media:  imageAsset,
            }],
          } : {}),
        },
      },
      visibility: {
        'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC',
      },
    };

    const res = await fetch(`${API_URL}/ugcPosts`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type':  'application/json',
        'X-Restli-Protocol-Version': '2.0.0',
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(20_000),
    });

    if (!res.ok) {
      const err = await res.json();
      return { ok: false, error: err.message ?? 'Erreur publication LinkedIn' };
    }

    const postId = res.headers.get('X-RestLi-Id') ?? '';
    const url    = postId
      ? `https://www.linkedin.com/feed/update/${encodeURIComponent(postId)}/`
      : 'https://www.linkedin.com/company/mathieu-co-studio/';

    return { ok: true, post_id: postId, url };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'Erreur inconnue' };
  }
}

// ─── getMetrics ───────────────────────────────────────────────────────────────

export async function getLinkedInMetrics(): Promise<LinkedInMetrics | null> {
  const { token, author, configured } = getConfig();

  if (!configured) {
    return {
      followers: 1_243, impressions: 8_700, clicks: 420,
      reactions: 680, shares: 95, comments: 48, posts_count: 52,
    };
  }

  try {
    // Statistiques de la page organisation
    const orgUrn = author.includes('organization') ? author : null;
    if (!orgUrn) return null;

    const orgId = orgUrn.split(':').pop();
    const res = await fetch(
      `${API_URL}/organizationalEntityFollowerStatistics?` +
      `q=organizationalEntity&organizationalEntity=${encodeURIComponent(orgUrn)}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'X-Restli-Protocol-Version': '2.0.0',
        },
      },
    );

    if (!res.ok) return null;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data = await res.json() as any;
    const totalFollowers = data.elements?.[0]?.followerCountsByAssociationType
      ?.find((f: { associationType: string }) => f.associationType === 'MEMBER')
      ?.followerCounts?.organicFollowerCount ?? 0;

    return {
      followers:   totalFollowers,
      impressions: 0, // Nécessite scope r_organization_social_feed
      clicks:      0,
      reactions:   0,
      shares:      0,
      comments:    0,
      posts_count: 0,
    };
  } catch {
    return null;
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function uploadImage(
  imageUrl: string,
  author:   string,
  token:    string,
): Promise<string | null> {
  try {
    // 1. Enregistrer l'upload
    const registerRes = await fetch(UPLOAD_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type':  'application/json',
      },
      body: JSON.stringify({
        registerUploadRequest: {
          recipes:         ['urn:li:digitalmediaRecipe:feedshare-image'],
          owner:           author,
          serviceRelationships: [{
            relationshipType: 'OWNER',
            identifier:       'urn:li:userGeneratedContent',
          }],
        },
      }),
    });

    if (!registerRes.ok) return null;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const registerData = await registerRes.json() as any;
    const uploadUrl = registerData.value?.uploadMechanism
      ?.['com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest']?.uploadUrl;
    const asset = registerData.value?.asset;

    if (!uploadUrl || !asset) return null;

    // 2. Télécharger l'image depuis l'URL source
    const imgRes = await fetch(imageUrl);
    if (!imgRes.ok) return null;
    const imgBuffer = await imgRes.arrayBuffer();

    // 3. Uploader vers LinkedIn
    await fetch(uploadUrl, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type':  'image/jpeg',
      },
      body: imgBuffer,
    });

    return asset;
  } catch {
    return null;
  }
}
