/**
 * /admin/scraping — Interface admin d'import produits
 *
 * Workflow :
 *   1. Coller une URL (alibaba / aliexpress / amazon / jumia)
 *   2. Cliquer "Analyser" → POST /api/admin/scrape
 *   3. Prévisualiser et éditer les données
 *   4. Ajuster le prix, le slug, les tags
 *   5. Cliquer "Publier en brouillon" → POST /api/admin/import
 *   6. Voir l'historique des jobs
 */

import type { Metadata } from 'next';
import { ScrapingDashboard } from '@/components/admin/ScrapingDashboard';

export const metadata: Metadata = {
  title: 'Import Produits — Admin Mathieu&Co',
  robots: 'noindex, nofollow',
};

export default function AdminScrapingPage() {
  return (
    <div className="min-h-screen bg-[#0F1014]">
      {/* Admin header */}
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
                Import Produits
              </p>
            </div>
          </div>
          <a
            href="/boutique"
            className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/40 hover:text-white/70 transition-colors"
          >
            ← Boutique
          </a>
        </div>
      </header>

      {/* Dashboard interactif */}
      <main className="mx-auto max-w-[1400px] px-6 py-8">
        <ScrapingDashboard />
      </main>
    </div>
  );
}
