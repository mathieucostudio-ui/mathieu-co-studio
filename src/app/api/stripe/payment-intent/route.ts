import type { NextRequest } from 'next/server';
import { stripe } from '@/lib/stripe/server';

// XOF (FCFA) is a zero-decimal currency in Stripe
const SEUIL_LIVRAISON_GRATUITE = 150_000;
const FRAIS_LIVRAISON_DEFAUT   =   5_000;

interface CartItemData {
  produitId:    string;
  slug:         string;
  nom:          string;
  prixUnitaire: number;
  quantite:     number;
  finition?:    string;
}

interface PromoData {
  code:    string;
  type:    'pourcentage' | 'montant_fixe' | 'livraison_gratuite';
  valeur:  number;
  minimum: number;
}

function computeOrderTotals(items: CartItemData[], promo: PromoData | null) {
  const sousTotal = items.reduce((acc, i) => acc + i.prixUnitaire * i.quantite, 0);

  let remise = 0;
  if (promo) {
    if (promo.type === 'pourcentage')   remise = Math.round(sousTotal * promo.valeur / 100);
    if (promo.type === 'montant_fixe')  remise = Math.min(promo.valeur, sousTotal);
  }

  const montantApresRemise = sousTotal - remise;
  const fraisLivraison =
    promo?.type === 'livraison_gratuite' || montantApresRemise >= SEUIL_LIVRAISON_GRATUITE
      ? 0
      : FRAIS_LIVRAISON_DEFAUT;

  return { sousTotal, remise, fraisLivraison, total: montantApresRemise + fraisLivraison };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as {
      items:     CartItemData[];
      codePromo: PromoData | null;
      email?:    string;
    };

    const { items, codePromo, email } = body;

    if (!Array.isArray(items) || items.length === 0) {
      return Response.json({ error: 'Panier vide' }, { status: 400 });
    }

    const { sousTotal, remise, fraisLivraison, total } = computeOrderTotals(items, codePromo);

    if (total <= 0) {
      return Response.json({ error: 'Montant invalide' }, { status: 400 });
    }

    // Compact items for metadata (Stripe: max 500 chars per value)
    const itemsMeta = JSON.stringify(
      items.slice(0, 6).map((i) => ({
        id:   i.produitId,
        slug: i.slug,
        nom:  i.nom.slice(0, 30),
        qty:  i.quantite,
        prix: i.prixUnitaire,
      })),
    ).slice(0, 490);

    const paymentIntent = await stripe.paymentIntents.create({
      amount:   total,
      currency: 'xof',
      automatic_payment_methods: { enabled: true },
      metadata: {
        email:           email ?? '',
        sous_total:      String(sousTotal),
        remise:          String(remise),
        frais_livraison: String(fraisLivraison),
        total:           String(total),
        promo_code:      codePromo?.code ?? '',
        items:           itemsMeta,
      },
    });

    return Response.json({ clientSecret: paymentIntent.client_secret });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erreur serveur';
    console.error('[stripe/payment-intent]', message);
    return Response.json({ error: message }, { status: 500 });
  }
}
