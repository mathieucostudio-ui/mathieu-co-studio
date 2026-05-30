import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const nextConfig: NextConfig = {
  images: {
    // Domaines autorisés pour next/image (remotePatterns)
    remotePatterns: [
      // Supabase Storage — toutes les instances
      { protocol: 'https', hostname: '*.supabase.co',   pathname: '/storage/v1/object/public/**' },
      { protocol: 'https', hostname: '*.supabase.in',   pathname: '/storage/v1/object/public/**' },
      // CDN Alibaba / AliExpress
      { protocol: 'https', hostname: '*.alicdn.com' },
      { protocol: 'https', hostname: '*.aliexpress.com' },
      { protocol: 'https', hostname: 'ae01.alicdn.com' },
      { protocol: 'https', hostname: 'ae02.alicdn.com' },
      // Amazon CDN
      { protocol: 'https', hostname: 'm.media-amazon.com' },
      { protocol: 'https', hostname: '*.ssl-images-amazon.com' },
      // Jumia CDN
      { protocol: 'https', hostname: '*.jumia.com' },
      { protocol: 'https', hostname: 'k.jumia.is' },
      // Picsum / placeholder (développement)
      { protocol: 'https', hostname: 'picsum.photos' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
    ],
    // Formats optimaux modernes
    formats: ['image/avif', 'image/webp'],
    // Tailles de breakpoints
    deviceSizes:      [375, 640, 768, 1024, 1280, 1440, 1920],
    imageSizes:       [16, 32, 64, 96, 128, 256, 384],
    // Durée du cache (secondes)
    minimumCacheTTL:  60,
  },
  // Compression et optimisations
  compress:           true,
  poweredByHeader:    false,
  // Headers de sécurité
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options',    value: 'nosniff' },
          { key: 'X-Frame-Options',           value: 'DENY' },
          { key: 'X-XSS-Protection',          value: '1; mode=block' },
          { key: 'Referrer-Policy',           value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy',        value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
      {
        // Cache agressif pour les assets statiques
        source: '/(_next/static|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|avif|ico|woff|woff2))',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
    ];
  },
};

export default withNextIntl(nextConfig);
