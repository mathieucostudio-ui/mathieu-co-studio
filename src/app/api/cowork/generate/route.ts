/**
 * POST /api/cowork/generate
 *
 * Génère du contenu marketing pour un projet/produit/article
 * et l'ajoute à la queue Cowork.
 *
 * Body : ContentGenerationRequest
 * Auth : x-admin-secret
 */

import { NextRequest, NextResponse }   from 'next/server';
import { generateContent }              from '@/lib/cowork/content-generator';
import { createTask }                   from '@/lib/cowork/queue';
import { sendTaskReviewNotification }   from '@/lib/cowork/notifications';
import type { ContentGenerationRequest } from '@/lib/cowork/types';

function isAuthorized(req: NextRequest): boolean {
  const secret = process.env.ADMIN_SECRET;
  if (!secret) return true;
  return req.headers.get('x-admin-secret') === secret;
}

export async function POST(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  let body: ContentGenerationRequest;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Body JSON invalide' }, { status: 400 });
  }

  const { source_type, source_slug, platform } = body;

  if (!source_type || !source_slug || !platform) {
    return NextResponse.json({
      error: 'Paramètres manquants : source_type, source_slug, platform',
    }, { status: 400 });
  }

  try {
    // Générer le contenu
    const taskInserts = await generateContent(body);

    // Créer les tâches dans Supabase
    const created = await Promise.all(taskInserts.map((t) => createTask(t)));
    const tasks   = created.filter(Boolean);

    // Notifier Mathieu par WhatsApp pour chaque tâche
    for (const task of tasks) {
      if (task) {
        await sendTaskReviewNotification({
          id:       task.id,
          type:     task.type,
          platform: task.platform,
          titre:    task.titre,
        });
      }
    }

    return NextResponse.json({
      ok:    true,
      tasks: tasks.map((t) => ({ id: t?.id, type: t?.type, platform: t?.platform })),
      count: tasks.length,
    }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erreur inconnue';
    console.error('[api/cowork/generate]', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
