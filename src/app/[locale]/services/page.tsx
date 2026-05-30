/**
 * Services — Page studio
 *
 * Layout (from SVG maquette):
 *   ┌─────────────────────────────────────────────┐
 *   │  Hero dark #151515 (h≈400px)                │
 *   │  • Eyebrow or + grand titre + sous-titre     │
 *   ├─────────────────────────────────────────────┤
 *   │  4 services strip — beige #F2EDE8           │
 *   │  • 4 colonnes séparées par lignes gris-cl   │
 *   │  • Numéro, titre, liste features, CTA       │
 *   ├─────────────────────────────────────────────┤
 *   │  Process — beige2 #EAE3DA                   │
 *   │  • 5 étapes numérotées horizontales         │
 *   ├─────────────────────────────────────────────┤
 *   │  CTA contact rapide — noir #151515          │
 *   └─────────────────────────────────────────────┘
 */

import type { Metadata }    from 'next';
import { Suspense }          from 'react';
import { setRequestLocale }  from 'next-intl/server';
import { ServicesClient }    from '@/components/services/ServicesClient';

// ─── Métadonnées ──────────────────────────────────────────────────────────────

export const metadata: Metadata = {
  title:       'Nos Services — Mathieu&Co Studio',
  description: 'Architecture intérieure, décoration contemporaine, gestion de projet et boutique design. Découvrez les services de Mathieu&Co Studio à Cotonou.',
  openGraph: {
    title:       'Services — Mathieu&Co Studio',
    description: 'De la conception à la livraison : architecture intérieure, décoration et gestion de chantier clé en main en Afrique de l\'Ouest.',
    type:        'website',
  },
};

// ─── Types ────────────────────────────────────────────────────────────────────

type Props = {
  params: Promise<{ locale: string }>;
};

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function ServicesPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div className="min-h-[100dvh] bg-beige">
      {/* Hero */}
      <ServicesHero />

      {/* Services + Process + CTA — animations client-side */}
      <Suspense fallback={<ServicesSkeleton />}>
        <ServicesClient />
      </Suspense>
    </div>
  );
}

// =============================================================================
//  ServicesHero — Server Component
// =============================================================================

function ServicesHero() {
  return (
    <section
      className="relative flex min-h-[440px] w-full flex-col justify-end overflow-hidden"
      style={{ backgroundColor: '#151515' }}
      aria-label="En-tête des services"
    >
      {/* Architectural pattern */}
      <svg
        className="pointer-events-none absolute right-0 top-0 h-full w-auto opacity-[0.05]"
        viewBox="0 0 800 440"
        fill="none"
        aria-hidden
      >
        {Array.from({ length: 22 }, (_, i) => (
          <line
            key={i}
            x1={i * 36}
            y1="0"
            x2={i * 36}
            y2="440"
            stroke="white"
            strokeWidth="0.5"
          />
        ))}
        <circle cx="640" cy="160" r="260" stroke="white" strokeWidth="0.8" fill="none" />
        <circle cx="640" cy="160" r="180" stroke="white" strokeWidth="0.5" fill="none" />
        <circle cx="640" cy="160" r="100" stroke="white" strokeWidth="0.3" fill="none" />
      </svg>

      {/* Radial accent */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 50% 60% at 75% 40%, rgba(42,80,60,0.35) 0%, transparent 60%),' +
            'radial-gradient(ellipse 30% 40% at 15% 80%, rgba(184,137,58,0.08) 0%, transparent 55%)',
        }}
        aria-hidden
      />

      {/* Gold accent line bottom */}
      <div
        className="pointer-events-none absolute bottom-0 left-0 right-0 h-px opacity-40"
        style={{ backgroundColor: '#B8893A' }}
        aria-hidden
      />

      {/* Content */}
      <div className="relative mx-auto w-full max-w-[1440px] px-6 md:px-10 xl:px-16 pb-14 pt-24">
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
            Studio · Mathieu&amp;Co
          </span>
        </div>

        <div className="flex flex-col gap-0">
          <h1
            className="font-display font-extralight italic leading-none text-white"
            style={{ fontSize: 'clamp(2.8rem, 6vw, 5rem)' }}
          >
            Nos
          </h1>
          <p
            className="font-display font-extralight italic leading-none"
            style={{
              fontSize: 'clamp(2.8rem, 6vw, 5rem)',
              color: 'rgba(255,255,255,0.28)',
              WebkitTextStroke: '1px rgba(184,137,58,0.45)',
            }}
            aria-hidden
          >
            services
          </p>
        </div>

        <p
          className="mt-6 max-w-[480px] text-[12.5px] leading-relaxed"
          style={{ color: 'rgba(255,255,255,0.45)' }}
        >
          De la vision à la livraison — nous concevons, décorons et coordonnons
          des espaces qui vous ressemblent, depuis Cotonou et à travers l&apos;Afrique de l&apos;Ouest.
        </p>
      </div>
    </section>
  );
}

// =============================================================================
//  ServicesSkeleton — fallback Suspense
// =============================================================================

function ServicesSkeleton() {
  return (
    <div aria-hidden>
      <div className="bg-beige px-6 py-16">
        <div className="mx-auto max-w-[1440px] grid grid-cols-2 md:grid-cols-4 gap-6">
          {Array.from({ length: 4 }, (_, i) => (
            <div
              key={i}
              className="h-64 rounded-sm bg-beige2 animate-pulse"
              style={{ animationDelay: `${i * 80}ms` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
