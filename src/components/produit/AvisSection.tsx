/**
 * AvisSection — avis clients
 *
 * SVG layout (y=1744-2084, h=340px, bg=white) :
 *   Gauche : note globale (grand score + étoiles + barres)
 *   Droite  : 2-3 avis individuels
 *   Bas     : CTA "Écrire un avis"
 *
 * Server Component — données depuis Supabase (approuvés uniquement via RLS).
 */

import { cn }          from '@/lib/utils';
import type { AvisRow, AvisStats } from '@/lib/supabase/queries/avis';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
    .format(new Date(iso));
}

// ─── Stars serveur ────────────────────────────────────────────────────────────

function StarsStatic({ note, size = 12 }: { note: number; size?: number }) {
  return (
    <div className="flex items-center gap-0.5" aria-label={`${note}/5`}>
      {Array.from({ length: 5 }, (_, i) => (
        <svg key={i} width={size} height={size} viewBox="0 0 12 12" fill="none" aria-hidden>
          <path
            d="M6 1L7.4 4.2L11 4.7L8.5 7.1L9.2 10.7L6 9L2.8 10.7L3.5 7.1L1 4.7L4.6 4.2L6 1Z"
            fill={i < Math.round(note) ? '#B8893A' : 'none'}
            stroke={i < Math.round(note) ? '#B8893A' : '#D0CCC8'}
            strokeWidth="0.8"
          />
        </svg>
      ))}
    </div>
  );
}

// ─── Rating Overview ──────────────────────────────────────────────────────────

function RatingOverview({ stats }: { stats: AvisStats }) {
  return (
    <div className="flex flex-col gap-4">
      {/* Score global */}
      <div className="flex items-baseline gap-3">
        <span
          className="font-display font-light text-noir"
          style={{ fontSize: 'clamp(3rem, 5vw, 4rem)' }}
          aria-label={`Note moyenne : ${stats.moyenne}`}
        >
          {stats.moyenne > 0 ? stats.moyenne.toFixed(1) : '—'}
        </span>
        <div className="flex flex-col gap-1">
          <StarsStatic note={stats.moyenne} size={14} />
          <span className="text-[11px] text-gris">
            {stats.total} avis{stats.total !== 1 ? '' : ''}
          </span>
        </div>
      </div>

      {/* Barres de répartition */}
      {stats.total > 0 && (
        <div className="flex flex-col gap-1.5">
          {([5, 4, 3, 2, 1] as const).map((n) => {
            const count = stats.repartition[n];
            const pct   = stats.total > 0 ? Math.round((count / stats.total) * 100) : 0;
            return (
              <div key={n} className="flex items-center gap-2">
                <span className="w-3 text-[10px] text-gris text-right">{n}</span>
                <div className="flex-1 h-1.5 rounded-full bg-gris-cl overflow-hidden">
                  <div
                    className="h-full rounded-full bg-or transition-all duration-500"
                    style={{ width: `${pct}%` }}
                    role="progressbar"
                    aria-valuenow={pct}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label={`${n} étoiles : ${count} avis`}
                  />
                </div>
                <span className="w-5 text-[10px] text-gris">{count}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Carte avis individuel ────────────────────────────────────────────────────

function AvisCard({ avis }: { avis: AvisRow }) {
  return (
    <article className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <StarsStatic note={avis.note} size={11} />
          {avis.verifie && (
            <span className={cn(
              'inline-flex items-center rounded-sm px-1.5 py-0.5',
              'bg-vert/10 text-[8.5px] font-semibold uppercase tracking-[0.2em] text-vert',
            )}>
              Achat vérifié
            </span>
          )}
        </div>
        <time
          dateTime={avis.created_at}
          className="text-[10px] text-gris/60"
        >
          {formatDate(avis.created_at)}
        </time>
      </div>

      {avis.titre && (
        <h4 className="text-[13px] font-semibold text-noir leading-snug">
          {avis.titre}
        </h4>
      )}

      {avis.commentaire && (
        <p className="text-[12px] leading-relaxed text-gris max-w-lg">
          {avis.commentaire}
        </p>
      )}

      {/* Signature anonyme */}
      <p className="text-[10px] text-gris/50 uppercase tracking-[0.18em]">
        Client vérifié
      </p>
    </article>
  );
}

// ─── AvisSection ──────────────────────────────────────────────────────────────

interface AvisSectionProps {
  avis:    AvisRow[];
  stats:   AvisStats;
  produitId: string;
}

export function AvisSection({ avis, stats, produitId: _ }: AvisSectionProps) {
  return (
    <section
      className="w-full py-16 bg-blanc"
      aria-labelledby="avis-heading"
    >
      <div className="mx-auto max-w-[1440px] px-8 md:px-12 xl:px-16">

        {/* Header */}
        <div className="mb-10">
          <div className="mb-3 flex items-center gap-3">
            <span className="block h-[2px] w-6 rounded-full bg-or/60" aria-hidden />
            <span className="text-[9px] font-semibold uppercase tracking-[0.36em] text-or/70">
              Retours clients
            </span>
          </div>
          <h2
            id="avis-heading"
            className="font-display font-light italic text-noir"
            style={{ fontSize: 'clamp(1.3rem, 2vw, 1.75rem)' }}
          >
            Ce qu&apos;ils en pensent
          </h2>
        </div>

        {/* Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-12">

          {/* Gauche : note globale */}
          <RatingOverview stats={stats} />

          {/* Droite : avis ou état vide */}
          <div>
            {avis.length > 0 ? (
              <div className="flex flex-col divide-y divide-gris-cl/60">
                {avis.map((a) => (
                  <div key={a.id} className="py-6 first:pt-0">
                    <AvisCard avis={a} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-start gap-3 py-6">
                <p className="text-[12.5px] text-gris leading-relaxed max-w-sm">
                  Aucun avis pour ce produit pour l&apos;instant.
                  Soyez le premier à partager votre expérience.
                </p>
                <button
                  type="button"
                  className={cn(
                    'inline-flex items-center gap-2 rounded-sm border border-gris-cl',
                    'px-4 py-2.5 text-[10px] font-semibold uppercase tracking-[0.22em] text-gris-dark',
                    'hover:border-or/50 hover:text-or transition-all duration-200',
                  )}
                >
                  Écrire un avis
                </button>
              </div>
            )}
          </div>

        </div>

      </div>
    </section>
  );
}
