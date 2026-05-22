import type { Metadata } from 'next';
import { Inter, Cormorant_Garamond } from 'next/font/google';
import { getLocale } from 'next-intl/server';
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

export const metadata: Metadata = {
  title: {
    default: 'Mathieu&Co Studio',
    template: '%s · Mathieu&Co Studio',
  },
  description:
    "Studio d'architecture d'intérieur et boutique e-commerce — Cotonou, Bénin",
  metadataBase: new URL('https://mathieu-co.studio'),
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
        {children}
      </body>
    </html>
  );
}
