/**
 * POST /api/cowork/approve
 *
 * Approuve une tâche et la publie immédiatement sur la plateforme cible.
 *
 * Body : { task_id: string; note?: string; publish_now?: boolean }
 * Auth : x-admin-secret
 */

import { NextRequest, NextResponse }    from 'next/server';
import { approveTask, markPublished, markFailed, getTaskById } from '@/lib/cowork/queue';
import { publishInstagramPost, publishInstagramCarousel } from '@/lib/cowork/social/instagram';
import { publishLinkedInPost }          from '@/lib/cowork/social/linkedin';

function isAuthorized(req: NextRequest): boolean {
  const secret = process.env.ADMIN_SECRET;
  if (!secret) return true;
  return req.headers.get('x-admin-secret') === secret;
}

export async function POST(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  const { task_id, note, publish_now = true }: {
    task_id:      string;
    note?:        string;
    publish_now?: boolean;
  } = await req.json();

  if (!task_id) {
    return NextResponse.json({ error: 'task_id manquant' }, { status: 400 });
  }

  // Charger la tâche
  const task = await getTaskById(task_id);
  if (!task) {
    return NextResponse.json({ error: 'Tâche introuvable' }, { status: 404 });
  }

  // Approuver en base
  await approveTask(task_id, note);

  if (!publish_now) {
    return NextResponse.json({ ok: true, statut: 'approuve', task_id });
  }

  // Publier selon la plateforme
  let result = { ok: false, error: 'Plateforme inconnue' } as { ok: boolean; post_id?: string; url?: string; error?: string };

  try {
    const caption = `${task.contenu}\n\n${task.hashtags?.join(' ') ?? ''}`.trim();

    if (task.platform === 'instagram' || task.type === 'instagram_post') {
      if (task.images_urls && task.images_urls.length > 1) {
        result = await publishInstagramCarousel(task.images_urls, caption);
      } else if (task.images_urls?.[0]) {
        result = await publishInstagramPost(task.images_urls[0], caption);
      } else {
        result = { ok: false, error: 'Aucune image pour Instagram' };
      }
    } else if (task.platform === 'linkedin' || task.type === 'linkedin_post') {
      result = await publishLinkedInPost(task.contenu, task.images_urls?.[0]);
    }

    if (result.ok) {
      await markPublished(task_id, result.post_id ?? '', result.url);
    } else {
      await markFailed(task_id, result.error ?? 'Erreur publication');
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erreur inconnue';
    await markFailed(task_id, message);
    result = { ok: false, error: message };
  }

  return NextResponse.json({
    ok:       result.ok,
    task_id,
    statut:   result.ok ? 'publie' : 'echec',
    post_url: result.url,
    error:    result.error,
  }, { status: result.ok ? 200 : 500 });
}
