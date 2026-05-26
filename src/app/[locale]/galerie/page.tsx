/**
 * Galerie — Page portfolio de projets
 *
 * Architecture :
 *   ┌─────────────────────────────────────────────┐
 *   │  GalerieHero (Server Component, statique)   │
 *   │  • Hero dark h=560px — motif architectural   │
 *   │  • Titre + sous-titre + compteur de projets  │
 *   ├─────────────────────────────────────────────┤
 *   │  GalerieClient (Client Component)           │
 *   │  • Filter bar — pills de catégories (sticky) │
 *   │  • Masonry 2 colonnes — cards avec hover     │
 *   └─────────────────────────────────────────────┘
 *
 * Données : fetch server-side (getAllProjets), passées en prop au client.
 * Filtrage : client-side via useState (pas de URL params pour la galerie).
 */

import type { Metadata }       from 'next';
import { Suspense }             from 'react';
import { setRequestLocale }     from 'next-intl/server';
import { getAllProjets }         from '@/lib/supabase/queries/projets';
import { GalerieClient }        from '@/components/galerie/GalerieClient';

// ─── Métadonnées ──────────────────────────────────────────────────────────────

export const metadata: Metadata = {
  title:       'Galerie — Mathieu&Co Studio',
  description: 'Découvrez nos réalisations en architecture intérieure, décoration et gestion de projet à Cotonou, Bénin et en Afrique de l\'Ouest.',
  openGraph: {
    title:       'Galerie de projets — Mathieu&Co Studio',
    description: 'Architecture intérieure, décoration contemporaine et gestion de projet. Portfolio de réalisations en Afrique de l\'Ouest.',
    type:        'website',
  },
};

// ─── Types ────────────────────────────────────────────────────────────────────

type Props = {
  params: Promise<{ locale: string }>;
};

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function GaleriePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  // Fetch projects — Promise.allSettled so page renders even if Supabase is down
  const settled = await Promise.allSettled([getAllProjets()]);
  const projets = settled[0].status === 'fulfilled' ? settled[0].value : [];

  if (settled[0].status === 'rejected') {
    console.error('[GaleriePage] Supabase indisponible :', settled[0].reason);
  }

  return (
    <div className="min-h-[100dvh] bg-beige">
      {/* Hero */}
      <GalerieHero total={projets.length} />

      {/* Interactive section */}
      <Suspense fallback={<GalerieSkeleton />}>
        <GalerieClient projets={projets} />
      </Suspense>
    </div>
  );
}

// =============================================================================
//  GalerieHero — Server Component (aucune interactivité)
// =============================================================================

function GalerieHero({ total }: { total: number }) {
  return (
    <section
      className="relative flex min-h-[520px] w-full flex-col justify-end overflow-hidden"
      style={{ backgroundColor: '#1A3040' }}
      aria-label="En-tête de la galerie"
    >
      {/* ── Background layers ────────────────────────────────────────────── */}

      {/* Radial light on the right */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 60% 70% at 80% 40%, rgba(42,80,96,0.6) 0%, transparent 60%),' +
            'radial-gradient(ellipse 40% 50% at 15% 70%, rgba(21,40,24,0.5) 0%, transparent 55%)',
        }}
        aria-hidden
      />

      {/* Architectural line pattern — right side */}
      <svg
        className="pointer-events-none absolute right-0 top-0 h-full w-auto opacity-[0.06]"
        viewBox="0 0 700 560"
        fill="none"
        aria-hidden
      >
        {/* Vertical rhythm lines */}
        {Array.from({ length: 18 }, (_, i) => (
          <line
            key={i}
            x1={28 + i * 36}
            y1="0"
            x2={28 + i * 36}
            y2="560"
            stroke="white"
            strokeWidth="0.6"
          />
        ))}
        {/* Large organic circles */}
        <circle cx="560" cy="180" r="220" stroke="white" strokeWidth="0.8" fill="none" />
        <circle cx="560" cy="180" r="150" stroke="white" strokeWidth="0.5" fill="none" />
        <circle cx="560" cy="180" r="80"  stroke="white" strokeWidth="0.4" fill="none" />
        {/* Horizontal bars */}
        <line x1="300" y1="200" x2="700" y2="200" stroke="white" strokeWidth="0.5" />
        <line x1="320" y1="210" x2="700" y2="210" stroke="white" strokeWidth="0.3" />
      </svg>

      {/* Left organic blob */}
      <div
        className="pointer-events-none absolute left-0 top-0 h-full w-1/3 opacity-30"
        style={{
          background:
            'radial-gradient(ellipse 80% 60% at -10% 80%, rgba(21,40,21,0.7) 0%, transparent 70%)',
        }}
        aria-hidden
      />

      {/* Gold accent line at bottom */}
      <div
        className="pointer-events-none absolute bottom-0 left-0 right-0 h-px opacity-40"
        style={{ backgroundColor: '#B8893A' }}
        aria-hidden
      />

      {/* Bottom gradient — fades into content area */}
      <div
        className="pointer-events-none absolute bottom-0 left-0 right-0 h-48"
        style={{
          background: 'linear-gradient(to top, rgba(26,48,64,0.95) 0%, transparent 100%)',
        }}
        aria-hidden
      />

      {/* ── Content ──────────────────────────────────────────────────────── */}
      <div className="relative mx-auto w-full max-w-[1440px] px-6 md:px-10 xl:px-16 pb-14 pt-24">

        {/* Eyebrow */}
        <div className="mb-4 flex items-center gap-3">
          <span
            className="block h-px w-8 shrink-0"
            style={{ backgroundColor: 'rgba(184,137,58,0.8)' }}
            aria-hidden
          />
          <span
            className="text-[9px] font-semibold uppercase tracking-[0.38em]"
            style={{ color: 'rgba(184,137,58,0.8)' }}
          >
            Portfolio & Réalisations
          </span>
        </div>

        {/* Split heading — large display font */}
        <div className="flex flex-col gap-1 md:gap-0">
          <h1
            className="font-display font-extralight italic leading-none text-white"
            style={{ fontSize: 'clamp(2.8rem, 6vw, 5.5rem)' }}
          >
            Galerie
          </h1>
          <p
            className="font-display font-extralight italic leading-none"
            style={{
              fontSize: 'clamp(2.8rem, 6vw, 5.5rem)',
              color: 'rgba(255,255,255,0.32)',
              WebkitTextStroke: '1px rgba(184,137,58,0.4)',
            }}
            aria-hidden
          >
            de projets
          </p>
        </div>

        {/* Description + counter */}
        <div className="mt-6 flex flex-col sm:flex-row sm:items-end gap-5 sm:gap-12">
          <p
            className="max-w-[420px] text-[12.5px] leading-relaxed"
            style={{ color: 'rgba(255,255,255,0.5)' }}
          >
            Architecture intérieure, décoration contemporaine et gestion de projet.
            Des espaces pensés pour durer, depuis Cotonou et à travers l&apos;Afrique de l&apos;Ouest.
          </p>

          {total > 0 && (
            <div className="shrink-0">
              <span
                className="block font-display font-light italic"
                style={{ fontSize: 'clamp(2.2rem, 4vw, 3.5rem)', color: 'rgba(184,137,58,0.7)' }}
                aria-label={`${total} projets`}
              >
                {String(total).padStart(2, '0')}
              </span>
              <span className="text-[9px] font-semibold uppercase tracking-[0.32em] text-white/30">
                Projets réalisés
              </span>
            </div>
          )}
        </div>

        {/* Scroll hint */}
        <div className="mt-10 flex items-center gap-2.5 opacity-40" aria-hidden>
          <span className="block h-px w-6" style={{ backgroundColor: '#B8893A' }} />
          <span className="text-[9px] font-semibold uppercase tracking-[0.28em] text-white/60">
            Découvrir
          </span>
          <svg width="12" height="18" viewBox="0 0 12 18" fill="none">
            <path d="M6 2v14M1 11l5 5 5-5" stroke="white" strokeWidth="1" strokeLinecap="round" />
          </svg>
        </div>

      </div>
    </section>
  );
}

// =============================================================================
//  GalerieSkeleton — fallback Suspense
// =============================================================================

function GalerieSkeleton() {
  return (
    <div aria-hidden>
      {/* Filter bar skeleton */}
      <div className="border-b border-gris-cl/60 bg-beige px-6 md:px-10 py-4">
        <div className="flex items-center gap-2">
          {Array.from({ length: 5 }, (_, i) => (
            <div
              key={i}
              className="h-8 rounded-sm bg-beige2 animate-pulse"
              style={{ width: `${60 + i * 25}px`, animationDelay: `${i * 80}ms` }}
            />
          ))}
        </div>
      </div>

      {/* Masonry skeleton */}
      <div className="mx-auto max-w-[1440px] px-6 md:px-10 xl:px-16 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5 items-start">
          {/* Left column */}
          <div className="flex flex-col gap-4 md:gap-5">
            {['aspect-[3/4]', 'aspect-[4/3]', 'aspect-square'].map((asp, i) => (
              <div
                key={i}
                className={`w-full rounded-sm bg-beige2 animate-pulse ${asp}`}
                style={{ animationDelay: `${i * 120}ms` }}
              />
            ))}
          </div>
          {/* Right column */}
          <div className="flex flex-col gap-4 md:gap-5 md:mt-8">
            {['aspect-square', 'aspect-[3/4]', 'aspect-[4/3]'].map((asp, i) => (
              <div
                key={i}
                className={`w-full rounded-sm bg-beige2 animate-pulse ${asp}`}
                style={{ animationDelay: `${i * 120 + 60}ms` }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
