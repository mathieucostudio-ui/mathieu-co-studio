/**
 * Panier — /panier
 *
 * Server Component minimal : metadata + locale.
 * Tout le rendu dynamique est délégué à PanierClient (Client Component)
 * car le panier lit exclusivement depuis localStorage via Zustand.
 */

import type { Metadata }      from 'next';
import { setRequestLocale }   from 'next-intl/server';
import { PanierClient }       from '@/components/panier/PanierClient';

// ─── Métadonnées ──────────────────────────────────────────────────────────────

export const metadata: Metadata = {
  title:       'Mon Panier — Mathieu&Co Studio',
  description: 'Votre panier Mathieu&Co Studio : mobilier et objets décoratifs artisanaux. Livraison offerte dès 150 000 FCFA.',
  robots: { index: false },   // page panier non indexée
};

// ─── Page ─────────────────────────────────────────────────────────────────────

type Props = { params: Promise<{ locale: string }> };

export default async function PanierPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <PanierClient />;
}
