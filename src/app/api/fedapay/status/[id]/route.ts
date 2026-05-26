import type { NextRequest } from 'next/server';
import { initFedaPay, Transaction } from '@/lib/fedapay/server';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  initFedaPay();

  const { id } = await params;
  const numericId = parseInt(id, 10);

  if (!numericId || isNaN(numericId)) {
    return Response.json({ error: 'ID invalide' }, { status: 400 });
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const transaction = await (Transaction as any).retrieve(numericId);

    return Response.json({
      id:     transaction.id,
      status: transaction.status ?? 'pending',
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erreur';
    console.error('[fedapay/status]', message);
    return Response.json({ error: message }, { status: 500 });
  }
}
