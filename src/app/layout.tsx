import type { Metadata } from 'next';
import { Inter, Cormorant_Garamond } from 'next/font/google';
import { getLocale } from 'next-intl/server';
import { OrganizationSchema, WebSiteSchema } from '@/components/seo/JsonLd';
import './globals.css';

// ── Sans-serif : interface, corps de texte ──────────────
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
  weight: ['300', '400', '500', '600', '700'],
});

// ── Serif display : titres, citations, accents luxe ─────
const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  variable: '--font-cormorant',
  display: 'swap',
  weight: ['300', '400', '500', '600', '700'],
  style: ['normal', 'italic'],
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://mathieu-co.studio';

export const metadata: Metadata = {
  title: {
    default:  'Mathieu&Co Studio',
    template: '%s · Mathieu&Co Studio',
  },
  description: "Studio d'architecture intérieure et boutique design contemporain — Cotonou, Bénin et Afrique de l'Ouest.",
  metadataBase: new URL(SITE_URL),
  keywords: ['architecture intérieure', 'décoration', 'Cotonou', 'Bénin', 'Afrique de l\'Ouest', 'design contemporain'],
  authors: [{ name: 'Mathieu&Co Studio', url: SITE_URL }],
  creator: 'Mathieu&Co Studio',
  openGraph: {
    type:        'website',
    locale:      'fr_FR',
    url:         SITE_URL,
    siteName:    'Mathieu&Co Studio',
    title:       'Mathieu&Co Studio',
    description: "Studio d'architecture intérieure et boutique design contemporain — Cotonou, Bénin.",
    images: [{ url: `${SITE_URL}/og-image.jpg`, width: 1200, height: 630, alt: 'Mathieu&Co Studio' }],
  },
  twitter: {
    card:        'summary_large_image',
    title:       'Mathieu&Co Studio',
    description: "Studio d'architecture intérieure et boutique design à Cotonou.",
    images:      [`${SITE_URL}/og-image.jpg`],
  },
  robots: {
    index:          true,
    follow:         true,
    googleBot: {
      index:              true,
      follow:             true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet':      -1,
    },
  },
  alternates: {
    canonical: SITE_URL,
    languages: {
      'fr': `${SITE_URL}/fr`,
      'en': `${SITE_URL}/en`,
    },
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();

  return (
    <html
      lang={locale}
      className={`${inter.variable} ${cormorant.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans bg-beige text-noir">
        <OrganizationSchema />
        <WebSiteSchema />
        {children}
      </body>
    </html>
  );
}
