// Raw body required for FedaPay signature verification
export const runtime = 'nodejs';

import { initFedaPay, Webhook }  from '@/lib/fedapay/server';
import { createAdminClient }      from '@/lib/supabase/server';
import type { Database }          from '@/types/database';

type ClientRow   = Database['public']['Tables']['clients']['Row'];
type ClientInsert = Database['public']['Tables']['clients']['Insert'];
type CommandeRow = Database['public']['Tables']['commandes']['Row'];
type CommandeInsert = Database['public']['Tables']['commandes']['Insert'];
type ItemInsert  = Database['public']['Tables']['commandes_items']['Insert'];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function dbInsert(query: any, values: any) {
  return query.insert(values).select('*').single();
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function dbInsertMany(query: any, values: any[]) {
  return query.insert(values);
}

interface FedaPayWebhookEvent {
  id:     number;
  type:   string;       // e.g. 'transaction.approved'
  object: {
    id:          number;
    reference:   string;
    status:      string;
    amount:      number;
    description: string;
    meta?:       string; // our custom JSON string
    customer?: {
      email?:    string;
      firstname?: string;
      lastname?:  string;
    };
  };
}

export async function POST(request: Request) {
  initFedaPay();

  const rawBody = await request.text();
  const sigHeader = request.headers.get('x-fedapay-signature') ?? '';
  const secret = process.env.FEDAPAY_WEBHOOK_SECRET!;

  // Verify signature
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (Webhook as any).constructEvent(rawBody, sigHeader, secret);
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Signature invalide';
    console.error('[webhook/fedapay] Signature error:', msg);
    return new Response(`Webhook Error: ${msg}`, { status: 400 });
  }

  let event: FedaPayWebhookEvent;
  try {
    event = JSON.parse(rawBody) as FedaPayWebhookEvent;
  } catch {
    return new Response('Invalid JSON', { status: 400 });
  }

  if (event.type === 'transaction.approved') {
    const tx = event.object;
    const supabase = createAdminClient();

    // Idempotency — skip if order already recorded
    const { data: existingRaw } = await supabase
      .from('commandes')
      .select('id')
      .eq('ref_paiement', String(tx.id))
      .maybeSingle();

    if ((existingRaw as { id: string } | null)?.id) {
      return new Response('Already processed', { status: 200 });
    }

    // Parse metadata
    let meta: {
      sous_total?:      number;
      remise?:          number;
      frais_livraison?: number;
      promo_code?:      string;
      items?:           Array<{ id: string; slug: string; nom: string; qty: number; prix: number }>;
    } = {};
    try { meta = JSON.parse(tx.meta ?? '{}'); } catch { /* ignore */ }

    // Resolve client email
    const email = tx.customer?.email ?? '';
    let clientId = '';

    if (email && !email.startsWith('mobile_')) {
      const { data: foundRaw } = await supabase
        .from('clients')
        .select('id')
        .eq('email', email)
        .maybeSingle();

      const found = foundRaw as Pick<ClientRow, 'id'> | null;

      if (found?.id) {
        clientId = found.id;
      } else {
        const newClient: ClientInsert = {
          email,
          nom:    tx.customer?.lastname  ?? null,
          prenom: tx.customer?.firstname ?? null,
          pays:   'BJ',
          statut: 'actif',
        };
        const { data: createdRaw } = await dbInsert(supabase.from('clients'), newClient);
        const created = createdRaw as ClientRow | null;
        if (created?.id) clientId = created.id;
      }
    }

    if (!clientId) {
      console.error('[webhook/fedapay] Cannot resolve client for email:', email);
      return new Response('Client error', { status: 500 });
    }

    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const rand    = Math.floor(Math.random() * 9000 + 1000);
    const numero  = `CMD-${dateStr}-${rand}`;

    const newCommande: CommandeInsert = {
      client_id:        clientId,
      numero,
      statut:           'confirmee',
      sous_total:       meta.sous_total      ?? tx.amount,
      frais_livraison:  meta.frais_livraison ?? 0,
      remise:           meta.remise          ?? 0,
      total:            tx.amount,
      adresse_livraison: {},
      mode_paiement:    'mobile_money',
      ref_paiement:     String(tx.id),
    };

    const { data: commandeRaw, error: cmdErr } = await dbInsert(
      supabase.from('commandes'),
      newCommande,
    );

    const commande = commandeRaw as CommandeRow | null;

    if (cmdErr || !commande?.id) {
      console.error('[webhook/fedapay] DB error:', cmdErr);
      return new Response('Database error', { status: 500 });
    }

    if (Array.isArray(meta.items) && meta.items.length > 0) {
      const lignes: ItemInsert[] = meta.items.map((item) => ({
        commande_id:   commande.id,
        produit_id:    item.id,
        nom_produit:   item.nom,
        quantite:      item.qty,
        prix_unitaire: item.prix,
        total:         item.prix * item.qty,
      }));
      await dbInsertMany(supabase.from('commandes_items'), lignes);
    }

    console.log('[webhook/fedapay] Order created:', commande.id, numero);
  }

  return new Response('OK', { status: 200 });
}
