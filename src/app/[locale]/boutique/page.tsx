/**
 * Boutique — Page catalogue
 *
 * Server Component : lit les searchParams, fetch Supabase, passe les données
 * aux Client Components (sidebar, grille, toolbar, pagination).
 *
 * Mise en page :
 *   ┌──────────────────────────────────────────────────────┐
 *   │  Hero banner (#1A2830, h=280px)                      │
 *   ├─────────────┬────────────────────────────────────────┤
 *   │ Sidebar     │ Toolbar (54px)                         │
 *   │ 278px beige ├────────────────────────────────────────┤
 *   │             │ Grille 3 cols                           │
 *   │             ├────────────────────────────────────────┤
 *   │             │ Pagination                              │
 *   └─────────────┴────────────────────────────────────────┘
 */

import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { getAllProduits }   from '@/lib/supabase/queries/produits';
import { getAllCategories } from '@/lib/supabase/queries/categories';
import { BoutiqueSidebar }    from '@/components/boutique/BoutiqueSidebar';
import { BoutiqueToolbar }    from '@/components/boutique/BoutiqueToolbar';
import { ProduitsGrille }     from '@/components/boutique/ProduitsGrille';
import { BoutiquePagination } from '@/components/boutique/BoutiquePagination';
import { ITEMS_PAR_PAGE } from '@/store/filtresStore';
import type { GetAllProduitsOptions } from '@/types/product';

// ─── Métadonnées ──────────────────────────────────────────────────────────────

export const metadata: Metadata = {
  title:       'Boutique — Mathieu&Co Studio',
  description: 'Découvrez notre collection de mobilier et objets décoratifs artisanaux : pièces uniques africaines et design contemporain, disponibles en livraison depuis Cotonou.',
};

// ─── Types ────────────────────────────────────────────────────────────────────

type SearchParams = Promise<{
  cat?:   string;
  pmin?:  string;
  pmax?:  string;
  dispo?: string;
  q?:     string;
  tri?:   string;
  asc?:   string;
  page?:  string;
}>;

type Props = {
  params:       Promise<{ locale: string }>;
  searchParams: SearchParams;
};

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function BoutiquePage({ params, searchParams }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  // ── Lecture des searchParams ─────────────────────────────────────────────
  const sp = await searchParams;

  const categorieId   = sp.cat   ?? null;
  const prixMin       = sp.pmin  ? Number(sp.pmin)  : undefined;
  const prixMax       = sp.pmax  ? Number(sp.pmax)  : undefined;
  const recherche     = sp.q     ?? undefined;
  const page          = sp.page  ? Math.max(1, Number(sp.page)) : 1;

  // Tri
  let orderBy:   GetAllProduitsOptions['orderBy']  = 'created_at';
  let ascending: boolean                           = false;
  if (sp.tri === 'prix' || sp.tri === 'nom') orderBy = sp.tri;
  if (sp.asc === '1') ascending = true;

  // Statut (disponibilité)
  const statutParam = sp.dispo;
  const statut: GetAllProduitsOptions['statut'] =
    statutParam === 'epuise' ? 'epuise' : 'actif';

  const offset = (page - 1) * ITEMS_PAR_PAGE;

  // ── Fetch parallèle : produits + catégories ──────────────────────────────
  const [produitsResult, categories] = await Promise.all([
    getAllProduits({
      categorie_id: categorieId ?? undefined,
      statut,
      limit:        ITEMS_PAR_PAGE,
      offset,
      orderBy,
      ascending,
      prixMin:      prixMin !== undefined && !isNaN(prixMin) ? prixMin : undefined,
      prixMax:      prixMax !== undefined && !isNaN(prixMax) ? prixMax : undefined,
      recherche,
    }),
    getAllCategories(),
  ]);

  const { data: produits, total } = produitsResult;
  const totalPages = Math.ceil(total / ITEMS_PAR_PAGE);

  // ─── Rendu ──────────────────────────────────────────────────────────────
  return (
    <>
      {/* ── Hero banner ─────────────────────────────────────────────────── */}
      <BoutiqueHero
        total={total}
        categorieNom={
          categorieId
            ? (categories.find((c) => c.id === categorieId)?.nom ?? null)
            : null
        }
      />

      {/* ── Layout principal : sidebar + contenu ────────────────────────── */}
      <div className="flex min-h-[600px] items-stretch bg-blanc">

        {/* Sidebar filtres */}
        <BoutiqueSidebar categories={categories} />

        {/* Contenu : toolbar + grille + pagination */}
        <div className="flex flex-1 flex-col overflow-hidden">

          {/* Toolbar */}
          <BoutiqueToolbar total={total} />

          {/* Grille produits */}
          <ProduitsGrille produits={produits} />

          {/* Pagination */}
          <BoutiquePagination totalPages={totalPages} />

        </div>
      </div>
    </>
  );
}

// =============================================================================
//  BoutiqueHero — Server Component inline (statique, pas de données)
// =============================================================================

function BoutiqueHero({
  total,
  categorieNom,
}: {
  total:        number;
  categorieNom: string | null;
}) {
  return (
    <section
      className="relative flex h-[280px] w-full items-end overflow-hidden"
      style={{ backgroundColor: '#1A2830' }}
      aria-label="En-tête de la boutique"
    >
      {/* Gradient overlay */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'linear-gradient(160deg, rgba(26,40,48,0.4) 0%, rgba(26,40,48,0.85) 60%, rgba(26,40,48,0.96) 100%)',
        }}
        aria-hidden
      />

      {/* Motif géométrique subtil (SVG inline) */}
      <svg
        className="pointer-events-none absolute right-0 top-0 h-full w-auto opacity-[0.04]"
        viewBox="0 0 800 280"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden
      >
        <circle cx="700" cy="140" r="200" stroke="white" strokeWidth="1"/>
        <circle cx="700" cy="140" r="140" stroke="white" strokeWidth="1"/>
        <circle cx="700" cy="140" r="80"  stroke="white" strokeWidth="1"/>
        <line x1="500" y1="0" x2="900" y2="280" stroke="white" strokeWidth="0.5"/>
        <line x1="400" y1="0" x2="800" y2="280" stroke="white" strokeWidth="0.5"/>
      </svg>

      {/* Contenu */}
      <div className="relative mx-auto w-full max-w-[1440px] px-8 pb-10 md:px-12">

        {/* Eyebrow */}
        <div className="mb-3 flex items-center gap-3">
          <span className="block h-px w-6 shrink-0" style={{ backgroundColor: '#B8893A' }} aria-hidden />
          <span
            className="text-[9px] font-semibold uppercase tracking-[0.36em]"
            style={{ color: 'rgba(184,137,58,0.85)' }}
          >
            {categorieNom ? categorieNom : 'Collection complète'}
          </span>
        </div>

        {/* Titre */}
        <h1
          className="font-display font-light italic leading-none text-white"
          style={{ fontSize: 'clamp(2rem, 4vw, 3.2rem)' }}
        >
          {categorieNom ? categorieNom : 'La Boutique'}
        </h1>

        {/* Sous-titre */}
        <p
          className="mt-3 text-[12.5px] leading-relaxed"
          style={{ color: 'rgba(255,255,255,0.55)', maxWidth: '480px' }}
        >
          {total > 0
            ? `${total} pièce${total > 1 ? 's' : ''} sélectionnée${total > 1 ? 's' : ''} — artisanat africain et design contemporain`
            : 'Artisanat africain contemporain et design international — Cotonou, Bénin'}
        </p>
      </div>
    </section>
  );
}
