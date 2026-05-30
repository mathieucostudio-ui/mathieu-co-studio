/**
 * À Propos — Page studio
 *
 * Layout (from SVG maquette apropos-mathieu-co 1.svg):
 *   ┌─────────────────────────────────────────────┐
 *   │  Hero dark #1A2830 (h≈560px)                │
 *   │  • Grand cadre image (portrait/projet)       │
 *   │  • Left overlay + titre + CTA               │
 *   ├─────────────────────────────────────────────┤
 *   │  Fondateur — fond chaud sombre              │
 *   │  • Portrait + biographie + signature        │
 *   ├─────────────────────────────────────────────┤
 *   │  3 Piliers valeurs — beige                  │
 *   │  • Conception / Artisanat / Durabilité       │
 *   ├─────────────────────────────────────────────┤
 *   │  Timeline — beige2                          │
 *   │  • 5 jalons fondateurs (2016–2024)          │
 *   ├─────────────────────────────────────────────┤
 *   │  CTA final + socials — noir #151515         │
 *   └─────────────────────────────────────────────┘
 */

import type { Metadata }    from 'next';
import { Suspense }          from 'react';
import { setRequestLocale }  from 'next-intl/server';
import { AProposClient }     from '@/components/a-propos/AProposClient';

// ─── Métadonnées ──────────────────────────────────────────────────────────────

export const metadata: Metadata = {
  title:       'À Propos — Mathieu&Co Studio',
  description: 'Mathieu&Co Studio : studio d\'architecture intérieure et de décoration fondé à Cotonou, Bénin. Notre histoire, nos valeurs et notre approche créative.',
  openGraph: {
    title:       'À Propos — Mathieu&Co Studio',
    description: 'Découvrez l\'histoire de Mathieu&Co Studio, notre philosophie de conception et notre engagement envers des espaces durables et contemporains.',
    type:        'website',
  },
};

// ─── Types ────────────────────────────────────────────────────────────────────

type Props = {
  params: Promise<{ locale: string }>;
};

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function AProposPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div className="min-h-[100dvh]">
      {/* Hero */}
      <AProposHero />

      {/* Client sections — animations */}
      <Suspense fallback={<AProposSkeleton />}>
        <AProposClient />
      </Suspense>
    </div>
  );
}

// =============================================================================
//  AProposHero — Server Component
// =============================================================================

function AProposHero() {
  return (
    <section
      className="relative flex min-h-[580px] w-full overflow-hidden"
      style={{ backgroundColor: '#1A2830' }}
      aria-label="En-tête à propos"
    >
      {/* Large image frame placeholder (centered) */}
      <div
        className="absolute left-1/2 top-[14%] -translate-x-1/2 w-[56%] h-[70%] rounded-sm overflow-hidden"
        style={{ backgroundColor: '#282420', opacity: 0.85 }}
        aria-hidden
      >
        {/* Subtle inner grid */}
        <svg
          className="absolute inset-0 w-full h-full opacity-[0.12]"
          viewBox="0 0 700 400"
          fill="none"
          preserveAspectRatio="xMidYMid slice"
        >
          {Array.from({ length: 18 }, (_, i) => (
            <line
              key={`v${i}`}
              x1={i * 40}
              y1="0"
              x2={i * 40}
              y2="400"
              stroke="#C8900A"
              strokeWidth="0.4"
            />
          ))}
          {Array.from({ length: 10 }, (_, i) => (
            <line
              key={`h${i}`}
              x1="0"
              y1={i * 42}
              x2="700"
              y2={i * 42}
              stroke="#C8900A"
              strokeWidth="0.3"
            />
          ))}
          <circle cx="350" cy="200" r="140" stroke="#C8900A" strokeWidth="0.6" fill="none" />
          <circle cx="350" cy="200" r="80" stroke="#C8900A" strokeWidth="0.4" fill="none" />
        </svg>
        {/* Label */}
        <div className="absolute bottom-4 left-4 text-[9px] font-semibold uppercase tracking-[0.3em] text-blanc/25">
          Studio · Cotonou
        </div>
      </div>

      {/* Left dark overlay */}
      <div
        className="pointer-events-none absolute left-0 top-0 h-full w-[44%]"
        style={{
          background: 'linear-gradient(to right, rgba(10,10,10,0.88) 0%, rgba(10,10,10,0.3) 70%, transparent 100%)',
        }}
        aria-hidden
      />

      {/* Organic circles right */}
      <div
        className="pointer-events-none absolute right-0 top-0 h-full w-1/2 opacity-30"
        style={{
          background:
            'radial-gradient(ellipse 70% 80% at 110% 50%, rgba(24,40,30,0.8) 0%, transparent 60%),' +
            'radial-gradient(ellipse 50% 60% at 130% 20%, rgba(21,32,16,0.6) 0%, transparent 55%)',
        }}
        aria-hidden
      />

      {/* Bottom gradient */}
      <div
        className="pointer-events-none absolute bottom-0 left-0 right-0 h-36"
        style={{
          background: 'linear-gradient(to top, rgba(26,40,48,0.98) 0%, transparent 100%)',
        }}
        aria-hidden
      />

      {/* Gold bottom line */}
      <div
        className="pointer-events-none absolute bottom-0 left-0 right-0 h-px opacity-50"
        style={{ backgroundColor: '#B8893A' }}
        aria-hidden
      />

      {/* Content — left-aligned */}
      <div className="relative z-10 flex flex-col justify-end pb-14 pt-28 px-6 md:px-10 xl:px-16 w-full max-w-[1440px] mx-auto">

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
            Notre histoire
          </span>
        </div>

        {/* Title */}
        <h1
          className="font-display font-extralight italic text-white"
          style={{ fontSize: 'clamp(2.8rem, 5.5vw, 4.8rem)', lineHeight: 1.08 }}
        >
          À propos
        </h1>

        <p
          className="mt-5 max-w-[400px] text-[12.5px] leading-relaxed"
          style={{ color: 'rgba(255,255,255,0.42)' }}
        >
          Un studio né à Cotonou, animé par la conviction que les espaces
          façonnent les vies — et que chaque intérieur mérite d&apos;être pensé
          avec soin, audace et précision.
        </p>

        {/* CTA */}
        <a
          href="/contact"
          className="mt-8 inline-flex w-fit items-center gap-3 rounded-sm bg-or px-7 py-3.5 text-[10.5px] font-semibold uppercase tracking-[0.22em] text-blanc transition-all duration-300 hover:bg-or-dark active:scale-[0.98]"
        >
          Travailler avec nous
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden>
            <path d="M2 11L11 2M11 2H5.5M11 2v5.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </a>
      </div>
    </section>
  );
}

// =============================================================================
//  AProposSkeleton — fallback Suspense
// =============================================================================

function AProposSkeleton() {
  return (
    <div aria-hidden>
      <div className="bg-beige px-6 py-16">
        <div className="mx-auto max-w-[1440px] grid grid-cols-1 md:grid-cols-3 gap-6">
          {Array.from({ length: 3 }, (_, i) => (
            <div
              key={i}
              className="h-48 rounded-sm bg-beige2 animate-pulse"
              style={{ animationDelay: `${i * 80}ms` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
