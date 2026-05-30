/**
 * POST /api/cowork/reject
 *
 * Rejette une tâche Cowork.
 *
 * Body : { task_id: string; note?: string }
 * Auth : x-admin-secret
 */

import { NextRequest, NextResponse } from 'next/server';
import { rejectTask }                 from '@/lib/cowork/queue';

function isAuthorized(req: NextRequest): boolean {
  const secret = process.env.ADMIN_SECRET;
  if (!secret) return true;
  return req.headers.get('x-admin-secret') === secret;
}

export async function POST(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  const { task_id, note }: { task_id: string; note?: string } = await req.json();

  if (!task_id) {
    return NextResponse.json({ error: 'task_id manquant' }, { status: 400 });
  }

  const task = await rejectTask(task_id, note);

  if (!task) {
    return NextResponse.json({ error: 'Tâche introuvable ou erreur' }, { status: 404 });
  }

  return NextResponse.json({ ok: true, task_id, statut: 'rejete' });
}
