/**
 * robots.ts — Génération dynamique du robots.txt
 * Accessible via : /robots.txt
 */

import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://mathieu-co.studio';

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin/',
          '/api/',
          '/auth/',
          '/compte/',
          '/_next/',
        ],
      },
      {
        // Bloquer les crawlers IA sur le contenu créatif
        userAgent: ['GPTBot', 'ChatGPT-User', 'CCBot', 'anthropic-ai', 'Claude-Web'],
        disallow: '/',
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host:    baseUrl,
  };
}
