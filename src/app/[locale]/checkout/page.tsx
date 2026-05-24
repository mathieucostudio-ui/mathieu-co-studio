/**
 * Checkout — /checkout
 *
 * Server Component minimal : metadata + locale.
 * Tout le rendu dynamique est délégué à CheckoutClient (Client Component)
 * car la page lit le panier depuis localStorage via Zustand.
 */

import type { Metadata }     from 'next';
import { setRequestLocale }  from 'next-intl/server';
import { CheckoutClient }    from '@/components/checkout/CheckoutClient';

// ─── Métadonnées ──────────────────────────────────────────────────────────────

export const metadata: Metadata = {
  title:       'Paiement — Mathieu&Co Studio',
  description: 'Finalisez votre commande Mathieu&Co Studio. Paiement sécurisé par carte, Mobile Money, PayPal ou virement.',
  robots: { index: false },
};

// ─── Page ─────────────────────────────────────────────────────────────────────

type Props = { params: Promise<{ locale: string }> };

export default async function CheckoutPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <CheckoutClient />;
}
