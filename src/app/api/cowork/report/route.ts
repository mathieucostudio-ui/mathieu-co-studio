/**
 * POST /api/cowork/report
 *
 * Génère le rapport hebdomadaire et l'envoie par email + WhatsApp.
 * À appeler via un cron job (ex: Vercel Cron tous les lundis à 8h).
 *
 * GET : retourne les données du dernier rapport sans email
 * POST : génère + envoie le rapport complet
 *
 * Auth : x-admin-secret
 */

import { NextRequest, NextResponse } from 'next/server';
import { generateWeeklyReport }      from '@/lib/cowork/report';
import { createAdminClient }          from '@/lib/supabase/server';

function isAuthorized(req: NextRequest): boolean {
  const secret = process.env.ADMIN_SECRET;
  if (!secret) return true;
  return req.headers.get('x-admin-secret') === secret;
}

// GET — Dernier rapport disponible
export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  const supabase = createAdminClient();
  const { data } = await (supabase as any)
    .from('cowork_reports')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  return NextResponse.json({ ok: true, report: data ?? null });
}

// POST — Générer + envoyer
export async function POST(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  try {
    const { data, emailSent } = await generateWeeklyReport();
    return NextResponse.json({
      ok:         true,
      emailSent,
      tasks:      data.tasks,
      instagram:  data.instagram ? { followers: data.instagram.followers, impressions: data.instagram.impressions } : null,
      linkedin:   data.linkedin  ? { followers: data.linkedin.followers }  : null,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erreur inconnue';
    console.error('[api/cowork/report]', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
