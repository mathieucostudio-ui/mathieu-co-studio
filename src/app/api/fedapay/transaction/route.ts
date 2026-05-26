import type { NextRequest } from 'next/server';
import { initFedaPay, Transaction, Customer, FEDAPAY_MODES } from '@/lib/fedapay/server';

// Shared total computation (same logic as Stripe route)
const SEUIL_LIVRAISON_GRATUITE = 150_000;
const FRAIS_LIVRAISON_DEFAUT   =   5_000;

interface CartItemData {
  produitId:    string;
  slug:         string;
  nom:          string;
  prixUnitaire: number;
  quantite:     number;
}

interface PromoData {
  code:   string;
  type:   'pourcentage' | 'montant_fixe' | 'livraison_gratuite';
  valeur: number;
}

function computeTotal(items: CartItemData[], promo: PromoData | null) {
  const sousTotal = items.reduce((acc, i) => acc + i.prixUnitaire * i.quantite, 0);
  let remise = 0;
  if (promo) {
    if (promo.type === 'pourcentage')  remise = Math.round(sousTotal * promo.valeur / 100);
    if (promo.type === 'montant_fixe') remise = Math.min(promo.valeur, sousTotal);
  }
  const net = sousTotal - remise;
  const frais =
    promo?.type === 'livraison_gratuite' || net >= SEUIL_LIVRAISON_GRATUITE
      ? 0 : FRAIS_LIVRAISON_DEFAUT;
  return { sousTotal, remise, fraisLivraison: frais, total: net + frais };
}

export async function POST(request: NextRequest) {
  initFedaPay();

  try {
    const body = await request.json() as {
      operator:  'mtn' | 'moov' | 'wave';
      phone:     string;   // 8-digit Beninese number, no country code
      items:     CartItemData[];
      codePromo: PromoData | null;
      email?:    string;
      nom?:      string;
      prenom?:   string;
    };

    const { operator, phone, items, codePromo, email, nom, prenom } = body;

    if (!phone || phone.replace(/\D/g, '').length < 8) {
      return Response.json({ error: 'Numéro de téléphone invalide' }, { status: 400 });
    }

    if (!Array.isArray(items) || items.length === 0) {
      return Response.json({ error: 'Panier vide' }, { status: 400 });
    }

    const mode = FEDAPAY_MODES[operator];
    if (!mode) {
      return Response.json({ error: 'Opérateur non supporté' }, { status: 400 });
    }

    const { sousTotal, remise, fraisLivraison, total } = computeTotal(items, codePromo);
    if (total <= 0) {
      return Response.json({ error: 'Montant invalide' }, { status: 400 });
    }

    const cleanPhone = phone.replace(/\D/g, '');

    // Create FedaPay transaction with embedded customer
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const transaction = await (Transaction as any).create({
      description:  `Commande Mathieu&Co Studio — ${items.length} article(s)`,
      amount:        total,
      currency:     { iso: 'XOF' },
      callback_url: `${process.env.NEXT_PUBLIC_SITE_URL}/checkout/confirmation`,
      customer: {
        firstname:    prenom || 'Client',
        lastname:     nom    || 'Boutique',
        email:        email  || `mobile_${cleanPhone}@mathieu-co.studio`,
        phone_number: {
          number:  cleanPhone,
          country: 'BJ',
        },
      },
      // Compact metadata for order reconstruction in webhook
      meta: JSON.stringify({
        sous_total:      sousTotal,
        remise,
        frais_livraison: fraisLivraison,
        promo_code:      codePromo?.code ?? '',
        items: items.slice(0, 6).map((i) => ({
          id:   i.produitId,
          slug: i.slug,
          nom:  i.nom.slice(0, 30),
          qty:  i.quantite,
          prix: i.prixUnitaire,
        })),
      }).slice(0, 490),
    });

    // Send Mobile Money payment request to customer's phone
    // sendNow generates a token internally and POSTs to /{mode}
    // The customer receives an OTP / USSD push on their phone to confirm
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (transaction as any).sendNow(mode);

    return Response.json({
      transactionId: transaction.id,
      status:        transaction.status ?? 'pending',
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erreur serveur';
    console.error('[fedapay/transaction]', message);
    return Response.json({ error: message }, { status: 500 });
  }
}
