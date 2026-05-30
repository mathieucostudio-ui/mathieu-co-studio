/**
 * cowork/report — Rapport hebdomadaire PDF par email
 *
 * ⚠️  SERVER-ONLY
 *
 * Génère un rapport HTML formaté avec les métriques de la semaine
 * et l'envoie par email via Resend (https://resend.com).
 *
 * Variable d'environnement :
 *   RESEND_API_KEY   — Clé API Resend
 *   REPORT_EMAIL_TO  — Email de destination (Mathieu)
 *   REPORT_EMAIL_FROM — Expéditeur (ex: rapport@mathieuandco.studio)
 */

import { createAdminClient }         from '@/lib/supabase/server';
import { getInstagramMetrics }        from './social/instagram';
import { getLinkedInMetrics }         from './social/linkedin';
import { getQueueStats }              from './queue';
import { sendWeeklyReportNotification } from './notifications';
import type { CoworkReportData }      from './types';

// ─── Génération rapport ───────────────────────────────────────────────────────

export async function generateWeeklyReport(): Promise<{
  data: CoworkReportData;
  emailSent: boolean;
}> {
  const semaine = getMondayDate(new Date());

  // Fetch métriques en parallèle
  const [igMetrics, liMetrics, queueStats, boutiqueMetrics] = await Promise.allSettled([
    getInstagramMetrics(),
    getLinkedInMetrics(),
    getQueueStats(),
    getBoutiqueMetrics(),
  ]);

  const data: CoworkReportData = {
    instagram: igMetrics.status === 'fulfilled' ? igMetrics.value ?? undefined : undefined,
    linkedin:  liMetrics.status === 'fulfilled' ? liMetrics.value ?? undefined : undefined,
    boutique:  boutiqueMetrics.status === 'fulfilled' ? boutiqueMetrics.value ?? undefined : undefined,
    tasks: {
      generees:   Object.values(queueStats.status === 'fulfilled' ? queueStats.value : {}).reduce((a, b) => a + b, 0),
      approuvees: queueStats.status === 'fulfilled' ? (queueStats.value.approuve ?? 0) : 0,
      rejetees:   queueStats.status === 'fulfilled' ? (queueStats.value.rejete ?? 0) : 0,
      publiees:   queueStats.status === 'fulfilled' ? (queueStats.value.publie ?? 0) : 0,
    },
  };

  // Stocker le rapport en base
  const supabase = createAdminClient();
  await (supabase as any)
    .from('cowork_reports')
    .upsert({
      semaine,
      donnees:      data,
      email_envoye: false,
    }, { onConflict: 'semaine' });

  // Envoyer l'email HTML
  const emailSent = await sendReportEmail(semaine, data);

  // Notification WhatsApp
  await sendWeeklyReportNotification(semaine, {
    publiees: data.tasks.publiees,
    vues:     (data.instagram?.impressions ?? 0) + (data.linkedin?.impressions ?? 0),
  });

  // Marquer l'email comme envoyé
  if (emailSent) {
    await (supabase as any)
      .from('cowork_reports')
      .update({ email_envoye: true, envoye_le: new Date().toISOString() })
      .eq('semaine', semaine);
  }

  return { data, emailSent };
}

// ─── Email HTML ───────────────────────────────────────────────────────────────

async function sendReportEmail(
  semaine: string,
  data:    CoworkReportData,
): Promise<boolean> {
  const apiKey  = process.env.RESEND_API_KEY;
  const to      = process.env.REPORT_EMAIL_TO ?? 'mathieu.co.studio@gmail.com';
  const from    = process.env.REPORT_EMAIL_FROM ?? 'rapport@mathieuandco.studio';

  const html = buildReportHtml(semaine, data);

  if (!apiKey) {
    console.warn('[cowork/report] RESEND_API_KEY manquant — email non envoyé');
    console.log('[cowork/report] Rapport HTML généré :', semaine);
    return false;
  }

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type':  'application/json',
      },
      body: JSON.stringify({
        from,
        to:      [to],
        subject: `📊 Rapport Mathieu&Co — Semaine du ${new Date(semaine).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}`,
        html,
      }),
      signal: AbortSignal.timeout(15_000),
    });

    return res.ok;
  } catch {
    return false;
  }
}

// ─── Build HTML ───────────────────────────────────────────────────────────────

function buildReportHtml(semaine: string, data: CoworkReportData): string {
  const dateStr = new Date(semaine).toLocaleDateString('fr-FR', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });

  const metric = (val: number | undefined, label: string) =>
    `<tr><td style="padding:6px 0; color:#84827F; font-size:12px;">${label}</td><td style="padding:6px 0; font-size:13px; font-weight:600; color:#151515; text-align:right;">${val?.toLocaleString('fr-FR') ?? '—'}</td></tr>`;

  const section = (title: string, rows: string) =>
    `<div style="margin-bottom:24px; background:#f9f8f6; border-radius:4px; padding:20px;">
      <p style="margin:0 0 12px; font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:0.2em; color:#B8893A;">${title}</p>
      <table style="width:100%; border-collapse:collapse;">${rows}</table>
    </div>`;

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width"></head>
<body style="margin:0; padding:0; background:#F2EDE8; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <div style="max-width:560px; margin:0 auto; padding:32px 16px;">

    <!-- Header -->
    <div style="background:#151515; border-radius:4px; padding:32px; margin-bottom:24px; text-align:center;">
      <p style="margin:0 0 4px; font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:0.3em; color:rgba(184,137,58,0.8);">Rapport hebdomadaire</p>
      <h1 style="margin:0; font-size:22px; font-weight:300; font-style:italic; color:white; font-family:Georgia,serif;">Mathieu&amp;Co Studio</h1>
      <p style="margin:8px 0 0; font-size:12px; color:rgba(255,255,255,0.4);">Semaine du ${dateStr}</p>
    </div>

    <!-- Tâches Cowork -->
    ${section('Cowork · Contenu publié', [
      metric(data.tasks.generees,   'Tâches générées'),
      metric(data.tasks.approuvees, 'Tâches approuvées'),
      metric(data.tasks.rejetees,   'Tâches rejetées'),
      metric(data.tasks.publiees,   'Posts publiés'),
    ].join(''))}

    <!-- Instagram -->
    ${data.instagram ? section('Instagram', [
      metric(data.instagram.followers,    'Abonnés'),
      metric(data.instagram.impressions,  'Impressions'),
      metric(data.instagram.reach,        'Portée'),
      metric(data.instagram.likes,        'J\'aime'),
      metric(data.instagram.saves,        'Enregistrements'),
      metric(data.instagram.profile_views,'Vues du profil'),
    ].join('')) : ''}

    <!-- LinkedIn -->
    ${data.linkedin ? section('LinkedIn', [
      metric(data.linkedin.followers,   'Abonnés'),
      metric(data.linkedin.impressions, 'Impressions'),
      metric(data.linkedin.clicks,      'Clics'),
      metric(data.linkedin.reactions,   'Réactions'),
      metric(data.linkedin.shares,      'Partages'),
    ].join('')) : ''}

    <!-- Boutique -->
    ${data.boutique ? section('Boutique', [
      metric(data.boutique.commandes,        'Commandes'),
      metric(data.boutique.revenus_xof,      'Revenus (XOF)'),
      metric(data.boutique.nouveaux_clients, 'Nouveaux clients'),
      metric(data.boutique.panier_moyen,     'Panier moyen (XOF)'),
    ].join('')) : ''}

    <!-- CTA -->
    <div style="text-align:center; margin-top:24px;">
      <a href="${process.env.NEXT_PUBLIC_SITE_URL ?? 'https://mathieu-co.studio'}/admin/cowork"
         style="display:inline-block; background:#B8893A; color:#151515; text-decoration:none;
                padding:12px 28px; border-radius:3px; font-size:11px; font-weight:700;
                text-transform:uppercase; letter-spacing:0.2em;">
        Voir le dashboard
      </a>
    </div>

    <!-- Footer -->
    <p style="text-align:center; margin-top:24px; font-size:10px; color:#84827F;">
      Rapport automatique Mathieu&amp;Co Cowork · ${new Date().getFullYear()}
    </p>

  </div>
</body>
</html>`;
}

// ─── Boutique metrics ─────────────────────────────────────────────────────────

async function getBoutiqueMetrics() {
  const supabase = createAdminClient();
  const startOfWeek = getMondayDate(new Date());
  const endOfWeek   = new Date(startOfWeek);
  endOfWeek.setDate(endOfWeek.getDate() + 7);

  const { data } = await (supabase as any)
    .from('commandes')
    .select('id, total, client_email, created_at')
    .gte('created_at', startOfWeek)
    .lt('created_at', endOfWeek.toISOString())
    .eq('statut', 'livree');

  if (!data) return null;

  const commandes = data as { id: string; total: number; client_email: string }[];
  const revenus   = commandes.reduce((sum, c) => sum + (c.total ?? 0), 0);
  const emails    = new Set(commandes.map((c) => c.client_email));

  return {
    commandes:        commandes.length,
    revenus_xof:      revenus,
    nouveaux_clients: emails.size,
    panier_moyen:     commandes.length > 0 ? Math.round(revenus / commandes.length) : 0,
    produits_vus:     0,
  };
}

// ─── Date helper ──────────────────────────────────────────────────────────────

function getMondayDate(date: Date): string {
  const d    = new Date(date);
  const day  = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Ajuster pour lundi
  d.setDate(diff);
  return d.toISOString().split('T')[0];
}
