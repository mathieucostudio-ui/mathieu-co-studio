/**
 * sitemap.ts — Sitemap XML dynamique
 * Accessible via : /sitemap.xml
 *
 * Inclut :
 *   • Pages statiques
 *   • Projets publiés (Supabase)
 *   • Produits actifs (Supabase)
 *   • Articles de blog publiés (Supabase)
 *
 * Priorités SEO :
 *   Homepage  1.0
 *   Galerie   0.9  | Boutique   0.9
 *   Projets   0.8  | Produits   0.8  | Articles 0.8
 *   Services  0.7  | FAQ        0.6  | Légal    0.3
 */

import type { MetadataRoute } from 'next';
import { createAdminClient }  from '@/lib/supabase/server';

const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://mathieu-co.studio';
const NOW  = new Date().toISOString();

// ─── Pages statiques ─────────────────────────────────────────────────────────

const STATIC_PAGES: MetadataRoute.Sitemap = [
  { url: BASE,                      lastModified: NOW, changeFrequency: 'weekly',  priority: 1.0 },
  { url: `${BASE}/galerie`,         lastModified: NOW, changeFrequency: 'weekly',  priority: 0.9 },
  { url: `${BASE}/boutique`,        lastModified: NOW, changeFrequency: 'daily',   priority: 0.9 },
  { url: `${BASE}/blog`,            lastModified: NOW, changeFrequency: 'daily',   priority: 0.8 },
  { url: `${BASE}/services`,        lastModified: NOW, changeFrequency: 'monthly', priority: 0.7 },
  { url: `${BASE}/a-propos`,        lastModified: NOW, changeFrequency: 'monthly', priority: 0.7 },
  { url: `${BASE}/contact`,         lastModified: NOW, changeFrequency: 'monthly', priority: 0.7 },
  { url: `${BASE}/faq`,             lastModified: NOW, changeFrequency: 'monthly', priority: 0.6 },
  { url: `${BASE}/livraison-retours`, lastModified: NOW, changeFrequency: 'monthly', priority: 0.4 },
  { url: `${BASE}/mentions-legales`,lastModified: NOW, changeFrequency: 'yearly',  priority: 0.3 },
  { url: `${BASE}/confidentialite`, lastModified: NOW, changeFrequency: 'yearly',  priority: 0.3 },
];

// ─── Sitemap ──────────────────────────────────────────────────────────────────

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = createAdminClient();

  // Fetch en parallèle avec fallback gracieux
  const [projetsRes, produitsRes, articlesRes] = await Promise.allSettled([
    supabase
      .from('projets')
      .select('slug, updated_at')
      .eq('statut', 'publie')
      .order('updated_at', { ascending: false }),

    supabase
      .from('produits')
      .select('slug, updated_at')
      .eq('statut', 'actif')
      .order('updated_at', { ascending: false }),

    supabase
      .from('articles_blog')
      .select('slug, updated_at')
      .eq('statut', 'publie')
      .order('updated_at', { ascending: false }),
  ]);

  type Slugged = { slug: string; updated_at: string | null };

  // Projets
  const projetUrls: MetadataRoute.Sitemap =
    projetsRes.status === 'fulfilled'
      ? ((projetsRes.value.data ?? []) as Slugged[]).map((p) => ({
          url:             `${BASE}/galerie/${p.slug}`,
          lastModified:    p.updated_at ?? NOW,
          changeFrequency: 'monthly' as const,
          priority:        0.8,
        }))
      : [];

  // Produits
  const produitUrls: MetadataRoute.Sitemap =
    produitsRes.status === 'fulfilled'
      ? ((produitsRes.value.data ?? []) as Slugged[]).map((p) => ({
          url:             `${BASE}/boutique/${p.slug}`,
          lastModified:    p.updated_at ?? NOW,
          changeFrequency: 'weekly' as const,
          priority:        0.8,
        }))
      : [];

  // Articles
  const articleUrls: MetadataRoute.Sitemap =
    articlesRes.status === 'fulfilled'
      ? ((articlesRes.value.data ?? []) as Slugged[]).map((a) => ({
          url:             `${BASE}/blog/${a.slug}`,
          lastModified:    a.updated_at ?? NOW,
          changeFrequency: 'monthly' as const,
          priority:        0.8,
        }))
      : [];

  return [
    ...STATIC_PAGES,
    ...projetUrls,
    ...produitUrls,
    ...articleUrls,
  ];
}
