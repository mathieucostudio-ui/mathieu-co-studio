// Raw body required for Stripe signature verification
export const runtime = 'nodejs';

import type Stripe from 'stripe';
import { stripe }            from '@/lib/stripe/server';
import { createAdminClient } from '@/lib/supabase/server';
import type { Database }     from '@/types/database';

type ClientInsert   = Database['public']['Tables']['clients']['Insert'];
type ClientRow      = Database['public']['Tables']['clients']['Row'];
type CommandeInsert = Database['public']['Tables']['commandes']['Insert'];
type CommandeRow    = Database['public']['Tables']['commandes']['Row'];
type ItemInsert     = Database['public']['Tables']['commandes_items']['Insert'];

// Supabase insert helper that sidesteps the 'never[]' inference issue in strict mode
async function dbInsert<T>(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  query: any,
  values: T | T[],
): Promise<{ data: unknown; error: unknown }> {
  return query.insert(values).select('*').single();
}

async function dbInsertMany<T>(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  query: any,
  values: T[],
): Promise<{ error: unknown }> {
  return query.insert(values);
}

export async function POST(request: Request) {
  const rawBody = await request.text();
  const sig     = request.headers.get('stripe-signature') ?? '';
  const secret  = process.env.STRIPE_WEBHOOK_SECRET!;

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, secret);
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Signature invalide';
    console.error('[webhook/stripe] Signature error:', msg);
    return new Response(`Webhook Error: ${msg}`, { status: 400 });
  }

  if (event.type === 'payment_intent.succeeded') {
    const pi   = event.data.object as Stripe.PaymentIntent;
    const meta = pi.metadata;

    const supabase = createAdminClient();

    // Idempotency check — skip if order already exists
    const { data: existingRaw } = await supabase
      .from('commandes')
      .select('id')
      .eq('ref_paiement', pi.id)
      .maybeSingle();

    if ((existingRaw as { id: string } | null)?.id) {
      return new Response('Already processed', { status: 200 });
    }

    // Resolve or create client by email
    const email    = meta.email;
    let   clientId = '';

    if (email) {
      const { data: foundRaw } = await supabase
        .from('clients')
        .select('id')
        .eq('email', email)
        .maybeSingle();

      const found = foundRaw as Pick<ClientRow, 'id'> | null;

      if (found?.id) {
        clientId = found.id;
      } else {
        const newClient: ClientInsert = { email, pays: 'BJ', statut: 'actif' };
        const { data: createdRaw } = await dbInsert<ClientInsert>(
          supabase.from('clients'),
          newClient,
        );
        const created = createdRaw as ClientRow | null;
        if (created?.id) clientId = created.id;
      }
    }

    if (!clientId) {
      console.error('[webhook/stripe] Cannot resolve client for email:', email);
      return new Response('Client error', { status: 500 });
    }

    // Generate unique order number
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const rand    = Math.floor(Math.random() * 9000 + 1000);
    const numero  = `CMD-${dateStr}-${rand}`;

    // Parse items from metadata
    let items: Array<{ id: string; slug: string; nom: string; qty: number; prix: number }> = [];
    try { items = JSON.parse(meta.items ?? '[]'); } catch { /* ignore */ }

    // Insert order
    const newCommande: CommandeInsert = {
      client_id:        clientId,
      numero,
      statut:           'confirmee',
      sous_total:       parseInt(meta.sous_total       ?? '0', 10),
      frais_livraison:  parseInt(meta.frais_livraison  ?? '0', 10),
      remise:           parseInt(meta.remise           ?? '0', 10),
      total:            pi.amount,
      adresse_livraison: {},
      mode_paiement:    'carte_stripe',
      ref_paiement:     pi.id,
    };

    const { data: commandeRaw, error: cmdErr } = await dbInsert<CommandeInsert>(
      supabase.from('commandes'),
      newCommande,
    );

    const commande = commandeRaw as CommandeRow | null;

    if (cmdErr || !commande?.id) {
      console.error('[webhook/stripe] DB error:', cmdErr);
      return new Response('Database error', { status: 500 });
    }

    // Insert line items
    if (items.length > 0) {
      const lignes: ItemInsert[] = items.map((item) => ({
        commande_id:   commande.id,
        produit_id:    item.id,
        nom_produit:   item.nom,
        quantite:      item.qty,
        prix_unitaire: item.prix,
        total:         item.prix * item.qty,
      }));

      await dbInsertMany<ItemInsert>(supabase.from('commandes_items'), lignes);
    }

    console.log('[webhook/stripe] Order created:', commande.id, numero);
  }

  return new Response('OK', { status: 200 });
}
