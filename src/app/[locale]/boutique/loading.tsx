/**
 * Boutique loading — skeleton affiché pendant le fetch Supabase
 * Remplace le contenu de la page pendant la navigation Server Component.
 */

import { ProduitsGrilleSkeleton } from '@/components/boutique/ProduitsGrille';

export default function BoutiqueLoading() {
  return (
    <>
      {/* Hero skeleton */}
      <div
        className="h-[280px] w-full animate-pulse"
        style={{ backgroundColor: '#1A2830' }}
        aria-hidden
      />

      {/* Layout */}
      <div className="flex min-h-[600px] items-stretch bg-blanc">

        {/* Sidebar skeleton */}
        <aside className="hidden md:block w-[278px] shrink-0 border-r border-gris-cl/60 bg-beige py-6 px-6">
          <div className="mb-6 flex items-center justify-between">
            <div className="h-2.5 w-14 animate-pulse rounded-sm bg-beige3" />
          </div>
          <div className="h-8 w-full animate-pulse rounded-sm bg-beige3 mb-6" />
          {/* Divider */}
          <div className="mb-5 h-px w-full animate-pulse bg-beige3" />
          {/* Categorie items */}
          {Array.from({ length: 5 }, (_, i) => (
            <div key={i} className="mb-3 flex items-center gap-3">
              <div className="size-[11px] animate-pulse rounded-[2px] bg-beige3 shrink-0" />
              <div className="h-2.5 animate-pulse rounded-sm bg-beige3" style={{ width: `${60 + i * 12}%` }} />
            </div>
          ))}
          {/* Divider */}
          <div className="my-5 h-px w-full animate-pulse bg-beige3" />
          {/* Prix */}
          <div className="mb-3 h-2.5 w-20 animate-pulse rounded-sm bg-beige3" />
          <div className="h-1.5 w-full animate-pulse rounded-full bg-beige3 mb-3" />
          <div className="flex justify-between">
            <div className="h-2.5 w-16 animate-pulse rounded-sm bg-beige3" />
            <div className="h-2.5 w-16 animate-pulse rounded-sm bg-beige3" />
          </div>
        </aside>

        {/* Contenu */}
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Toolbar skeleton */}
          <div className="flex h-[54px] items-center justify-between border-b border-gris-cl/60 bg-blanc px-5">
            <div className="h-3 w-24 animate-pulse rounded-sm bg-beige3" />
            <div className="h-7 w-36 animate-pulse rounded-sm bg-beige3" />
          </div>

          {/* Grille skeleton */}
          <ProduitsGrilleSkeleton count={12} />
        </div>
      </div>
    </>
  );
}
