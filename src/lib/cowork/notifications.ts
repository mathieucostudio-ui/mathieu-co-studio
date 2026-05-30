/**
 * cowork/notifications — Notifications WhatsApp (Meta Business Cloud API)
 *
 * ⚠️  SERVER-ONLY
 *
 * Variables d'environnement requises :
 *   WHATSAPP_PHONE_ID       — ID du numéro WhatsApp Business
 *   WHATSAPP_ACCESS_TOKEN   — Token d'accès Meta Business
 *   WHATSAPP_TO_NUMBER      — Numéro de Mathieu (format: 22997000000)
 *
 * Documentation : https://developers.facebook.com/docs/whatsapp/cloud-api
 *
 * Template messages pré-approuvés par Meta :
 *   • cowork_task_review — Notification nouvelle tâche à valider
 *   • cowork_weekly_report — Rapport hebdomadaire disponible
 */

const API_VERSION = 'v19.0';
const BASE_URL    = `https://graph.facebook.com/${API_VERSION}`;

interface WhatsAppTextMessage {
  to:   string;
  body: string;
}

// ─── sendWhatsAppText ─────────────────────────────────────────────────────────

/**
 * Envoie un message texte simple (pour les tests / notifications rapides).
 * En production, utiliser sendTaskReviewNotification avec un template approuvé.
 */
export async function sendWhatsAppText({
  to,
  body,
}: WhatsAppTextMessage): Promise<boolean> {
  const phoneId = process.env.WHATSAPP_PHONE_ID;
  const token   = process.env.WHATSAPP_ACCESS_TOKEN;

  if (!phoneId || !token) {
    console.warn('[cowork/notifications] WhatsApp non configuré (WHATSAPP_PHONE_ID / WHATSAPP_ACCESS_TOKEN manquants)');
    // Log en développement à la place
    console.log(`[WhatsApp MOCK] → ${to}: ${body}`);
    return true;
  }

  try {
    const res = await fetch(`${BASE_URL}/${phoneId}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type':  'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to,
        type: 'text',
        text: { body, preview_url: false },
      }),
      signal: AbortSignal.timeout(10_000),
    });

    if (!res.ok) {
      const err = await res.json();
      console.error('[cowork/notifications] Erreur WhatsApp :', err);
      return false;
    }

    return true;
  } catch (err) {
    console.error('[cowork/notifications] Erreur réseau WhatsApp :', err);
    return false;
  }
}

// ─── sendTaskReviewNotification ───────────────────────────────────────────────

/**
 * Notifie Mathieu qu'une nouvelle tâche marketing est à valider.
 */
export async function sendTaskReviewNotification(task: {
  id:       string;
  type:     string;
  platform: string | null;
  titre:    string | null;
}): Promise<boolean> {
  const to = process.env.WHATSAPP_TO_NUMBER ?? '';

  const platformLabel = {
    instagram: 'Instagram',
    linkedin:  'LinkedIn',
    both:      'Instagram + LinkedIn',
  }[task.platform ?? ''] ?? task.platform ?? 'Réseaux sociaux';

  const typeLabel = {
    instagram_post:  'Post Instagram',
    instagram_story: 'Story Instagram',
    linkedin_post:   'Post LinkedIn',
    newsletter_draft:'Brouillon newsletter',
  }[task.type] ?? task.type;

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://mathieu-co.studio';

  const body = [
    `🎨 *Mathieu&Co Cowork*`,
    ``,
    `Nouveau contenu à valider :`,
    `*${typeLabel}* — ${platformLabel}`,
    ``,
    task.titre ? `📌 ${task.titre}` : '',
    ``,
    `Valider sur le dashboard :`,
    `${siteUrl}/admin/cowork`,
    ``,
    `ID tâche : \`${task.id.slice(0, 8)}…\``,
  ].filter((l) => l !== undefined).join('\n');

  return sendWhatsAppText({ to, body });
}

// ─── sendWeeklyReportNotification ────────────────────────────────────────────

/**
 * Notifie Mathieu que le rapport hebdomadaire est disponible.
 */
export async function sendWeeklyReportNotification(
  semaine: string,
  stats: { publiees: number; vues?: number },
): Promise<boolean> {
  const to = process.env.WHATSAPP_TO_NUMBER ?? '';
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://mathieu-co.studio';

  const body = [
    `📊 *Rapport hebdomadaire Mathieu&Co*`,
    `Semaine du ${new Date(semaine).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}`,
    ``,
    `✅ Posts publiés : ${stats.publiees}`,
    stats.vues ? `👁 Vues totales : ${stats.vues.toLocaleString('fr-FR')}` : '',
    ``,
    `Rapport complet :`,
    `${siteUrl}/admin/cowork`,
  ].filter(Boolean).join('\n');

  return sendWhatsAppText({ to, body });
}
