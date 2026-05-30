/**
 * cowork/queue — Opérations sur la queue de tâches Supabase
 *
 * ⚠️  SERVER-ONLY — utilise createAdminClient (service_role, bypass RLS).
 */

import { createAdminClient }    from '@/lib/supabase/server';
import type {
  CoworkTask,
  CoworkTaskInsert,
  CoworkTaskUpdate,
  CoworkTaskStatut,
} from './types';

// ─── getTasks ─────────────────────────────────────────────────────────────────

export async function getTasks(
  statut?: CoworkTaskStatut,
  limit = 50,
): Promise<CoworkTask[]> {
  const supabase = createAdminClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let query = (supabase as any)
    .from('cowork_tasks')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (statut) query = query.eq('statut', statut);

  const { data, error } = await query;
  if (error) {
    console.error('[cowork/queue] getTasks:', error.message);
    return [];
  }
  return (data ?? []) as CoworkTask[];
}

// ─── getTaskById ──────────────────────────────────────────────────────────────

export async function getTaskById(id: string): Promise<CoworkTask | null> {
  const supabase = createAdminClient();
  const { data, error } = await (supabase as any)
    .from('cowork_tasks')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) {
    console.error('[cowork/queue] getTaskById:', error.message);
    return null;
  }
  return data as CoworkTask | null;
}

// ─── createTask ───────────────────────────────────────────────────────────────

export async function createTask(task: CoworkTaskInsert): Promise<CoworkTask | null> {
  const supabase = createAdminClient();
  const { data, error } = await (supabase as any)
    .from('cowork_tasks')
    .insert({
      ...task,
      statut:      task.statut ?? 'en_attente',
      hashtags:    task.hashtags ?? [],
      images_urls: task.images_urls ?? [],
      meta:        task.meta ?? {},
    })
    .select()
    .single();

  if (error) {
    console.error('[cowork/queue] createTask:', error.message);
    return null;
  }
  return data as CoworkTask;
}

// ─── updateTask ───────────────────────────────────────────────────────────────

export async function updateTask(
  id:     string,
  patch:  CoworkTaskUpdate,
): Promise<CoworkTask | null> {
  const supabase = createAdminClient();
  const { data, error } = await (supabase as any)
    .from('cowork_tasks')
    .update(patch)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('[cowork/queue] updateTask:', error.message);
    return null;
  }
  return data as CoworkTask;
}

// ─── approveTask ──────────────────────────────────────────────────────────────

export async function approveTask(id: string, note?: string): Promise<CoworkTask | null> {
  return updateTask(id, {
    statut:     'approuve',
    note_admin: note ?? null,
  });
}

// ─── rejectTask ───────────────────────────────────────────────────────────────

export async function rejectTask(id: string, note?: string): Promise<CoworkTask | null> {
  return updateTask(id, {
    statut:     'rejete',
    note_admin: note ?? null,
  });
}

// ─── markPublished ────────────────────────────────────────────────────────────

export async function markPublished(
  id:       string,
  post_id:  string,
  url?:     string,
): Promise<CoworkTask | null> {
  return updateTask(id, {
    statut:    'publie',
    publie_le: new Date().toISOString(),
    publie_url: url ?? null,
    meta:      { post_id },
  });
}

// ─── markFailed ───────────────────────────────────────────────────────────────

export async function markFailed(id: string, erreur: string): Promise<CoworkTask | null> {
  return updateTask(id, { statut: 'echec', erreur });
}

// ─── getStats ─────────────────────────────────────────────────────────────────

export async function getQueueStats(): Promise<Record<string, number>> {
  const supabase = createAdminClient();
  const { data } = await (supabase as any)
    .from('cowork_tasks')
    .select('statut');

  if (!data) return {};

  return (data as { statut: string }[]).reduce<Record<string, number>>((acc, row) => {
    acc[row.statut] = (acc[row.statut] ?? 0) + 1;
    return acc;
  }, {});
}
