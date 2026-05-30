/**
 * /blog — Journal Design
 *
 * Listing des articles avec filtres catégorie et article vedette.
 * Données Supabase (articles_blog) avec React.cache() deduplication.
 */

import type { Metadata }    from 'next';
import { Suspense }          from 'react';
import { setRequestLocale }  from 'next-intl/server';
import { getAllArticles }     from '@/lib/supabase/queries/blog';
import { BlogClient }        from '@/components/blog/BlogClient';

export const metadata: Metadata = {
  title:       'Journal Design — Mathieu&Co Studio',
  description: 'Architecture intérieure, décoration contemporaine et tendances design en Afrique de l\'Ouest. Le journal de Mathieu&Co Studio.',
  openGraph: {
    title:       'Journal Design — Mathieu&Co Studio',
    description: 'Tendances design, architecture intérieure et inspirations décoration depuis Cotonou.',
    type:        'website',
  },
};

type Props = { params: Promise<{ locale: string }> };

export default async function BlogPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const settled  = await Promise.allSettled([getAllArticles()]);
  const articles = settled[0].status === 'fulfilled' ? settled[0].value : [];

  return (
    <div className="min-h-[100dvh] bg-beige">

      {/* Hero */}
      <section
        className="relative flex min-h-[360px] w-full flex-col justify-end overflow-hidden"
        style={{ backgroundColor: '#1A2830' }}
        aria-label="En-tête blog"
      >
        {/* Motif SVG */}
        <svg
          className="pointer-events-none absolute right-0 top-0 h-full w-auto opacity-[0.05]"
          viewBox="0 0 700 360"
          fill="none"
          aria-hidden
        >
          {Array.from({ length: 18 }, (_, i) => (
            <line key={i} x1={i * 38} y1="0" x2={i * 38} y2="360" stroke="white" strokeWidth="0.5" />
          ))}
          <circle cx="560" cy="150" r="220" stroke="white" strokeWidth="0.7" fill="none" />
          <circle cx="560" cy="150" r="140" stroke="white" strokeWidth="0.4" fill="none" />
          <line x1="300" y1="150" x2="700" y2="150" stroke="white" strokeWidth="0.4" />
        </svg>

        {/* Overlays */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{ background: 'radial-gradient(ellipse 50% 60% at 75% 40%, rgba(38,70,50,0.45) 0%, transparent 60%)' }}
          aria-hidden
        />
        <div
          className="pointer-events-none absolute bottom-0 left-0 right-0 h-px opacity-40"
          style={{ backgroundColor: '#B8893A' }}
          aria-hidden
        />

        <div className="relative mx-auto w-full max-w-[1440px] px-6 md:px-10 xl:px-16 pb-14 pt-24">
          <div className="mb-4 flex items-center gap-3">
            <span className="block h-px w-8 shrink-0" style={{ backgroundColor: 'rgba(184,137,58,0.8)' }} aria-hidden />
            <span className="text-[9px] font-semibold uppercase tracking-[0.38em]" style={{ color: 'rgba(184,137,58,0.8)' }}>
              Inspirations &amp; Tendances
            </span>
          </div>

          <div className="flex flex-col gap-0">
            <h1
              className="font-display font-extralight italic text-white"
              style={{ fontSize: 'clamp(2.6rem, 5.5vw, 4.8rem)', lineHeight: 1.05 }}
            >
              Journal Design
            </h1>
            <p
              className="font-display font-extralight italic"
              style={{
                fontSize: 'clamp(2.6rem, 5.5vw, 4.8rem)',
                lineHeight: 1.05,
                color: 'rgba(255,255,255,0.25)',
                WebkitTextStroke: '1px rgba(184,137,58,0.35)',
              }}
              aria-hidden
            >
              Mathieu&amp;Co
            </p>
          </div>

          <div className="mt-6 flex flex-col sm:flex-row sm:items-end gap-5 sm:gap-12">
            <p className="max-w-[420px] text-[12.5px] leading-relaxed" style={{ color: 'rgba(255,255,255,0.42)' }}>
              Architecture intérieure, décoration contemporaine, coulisses du studio et
              tendances design depuis Cotonou.
            </p>
            {articles.length > 0 && (
              <div className="shrink-0">
                <span
                  className="block font-display font-light italic"
                  style={{ fontSize: 'clamp(2rem, 3.5vw, 3rem)', color: 'rgba(184,137,58,0.7)' }}
                  aria-label={`${articles.length} articles`}
                >
                  {String(articles.length).padStart(2, '0')}
                </span>
                <span className="text-[9px] font-semibold uppercase tracking-[0.28em] text-white/30">
                  Articles publiés
                </span>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Content */}
      <div className="mx-auto max-w-[1440px] px-6 md:px-10 xl:px-16 py-16">
        <Suspense fallback={<BlogSkeleton />}>
          <BlogClient articles={articles} />
        </Suspense>
      </div>

      {/* Newsletter CTA */}
      <section
        className="mx-6 md:mx-10 xl:mx-16 mb-16 overflow-hidden rounded-sm"
        style={{ backgroundColor: '#151515' }}
        aria-label="Newsletter"
      >
        <div className="mx-auto max-w-[1440px] px-8 md:px-12 py-12 flex flex-col md:flex-row items-center justify-between gap-8">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-or/70 mb-3">Newsletter</p>
            <h2 className="font-display font-light italic text-blanc" style={{ fontSize: 'clamp(1.5rem, 2.5vw, 2rem)' }}>
              Recevez nos derniers articles
            </h2>
            <p className="mt-2 text-[11.5px] text-blanc/40">
              Design, architecture et coulisses. Une fois par mois, pas plus.
            </p>
          </div>
          <form
            className="flex gap-0 w-full max-w-[380px] overflow-hidden rounded-sm border border-blanc/10"
            onSubmit={(e) => e.preventDefault()}
          >
            <input
              type="email"
              placeholder="votre@email.com"
              className="flex-1 bg-blanc/5 px-4 py-3 text-[12px] text-blanc/70 placeholder:text-blanc/25 focus:outline-none focus:bg-blanc/8 transition-colors"
              aria-label="Adresse email"
            />
            <button
              type="submit"
              className="shrink-0 bg-or px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-noir hover:bg-or-dark transition-colors"
            >
              S&apos;abonner
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function BlogSkeleton() {
  return (
    <div aria-hidden className="space-y-6">
      <div className="h-72 w-full rounded-sm bg-beige2 animate-pulse" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 3 }, (_, i) => (
          <div key={i} className="h-64 rounded-sm bg-beige2 animate-pulse" style={{ animationDelay: `${i * 80}ms` }} />
        ))}
      </div>
    </div>
  );
}
