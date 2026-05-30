/**
 * /admin/cowork — Dashboard Cowork
 *
 * Workflow visible :
 *   • Vue globale : stats tâches (en attente / approuvées / publiées / rejetées)
 *   • Liste des tâches en attente avec preview + boutons Approuver / Rejeter
 *   • Générateur rapide : saisir un slug + choisir plateforme → générer
 *   • Historique des tâches publiées
 *   • Rapport hebdomadaire : bouton "Générer & envoyer"
 */

import type { Metadata } from 'next';
import { getTasks, getQueueStats } from '@/lib/cowork/queue';
import { CoworkDashboard }         from '@/components/admin/CoworkDashboard';

export const metadata: Metadata = {
  title:  'Cowork — Admin Mathieu&Co',
  robots: 'noindex, nofollow',
};

export default async function CoworkPage() {
  // Fetch tasks server-side avec revalidation courte
  const [tasksPending, tasksPublished, tasksAll, stats] = await Promise.all([
    getTasks('en_attente', 20),
    getTasks('publie', 10),
    getTasks(undefined, 5),
    getQueueStats(),
  ]);

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#0F1014' }}>
      {/* Header */}
      <header className="border-b border-white/8 px-6 py-4">
        <div className="mx-auto max-w-[1400px] flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div
              className="flex size-8 items-center justify-center rounded-sm text-[10px] font-bold"
              style={{ backgroundColor: '#B8893A', color: '#151515' }}
            >
              M&amp;C
            </div>
            <div>
              <p className="text-[11px] font-semibold text-white/80">Admin Studio</p>
              <p className="text-[9px] font-semibold uppercase tracking-[0.24em] text-white/30">
                Cowork · Automation
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <a
              href="/admin/scraping"
              className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/40 hover:text-white/70 transition-colors"
            >
              Import produits
            </a>
            <a
              href="/"
              className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/40 hover:text-white/70 transition-colors"
            >
              ← Site
            </a>
          </div>
        </div>
      </header>

      {/* Dashboard */}
      <main className="mx-auto max-w-[1400px] px-6 py-8">
        <CoworkDashboard
          tasksPending={tasksPending}
          tasksPublished={tasksPublished}
          stats={stats}
        />
      </main>
    </div>
  );
}
