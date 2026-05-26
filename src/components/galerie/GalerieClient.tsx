'use client';

import { useState, useMemo, useCallback, useId } from 'react';
import { motion, AnimatePresence }                from 'framer-motion';
import { ArrowUpRight, MapPin, Calendar, Maximize2 } from 'lucide-react';
import { Link }                                   from '@/i18n/navigation';
import { cn }                                     from '@/lib/utils';
import type { ProjetCard }                        from '@/lib/supabase/queries/projets';
import type { CategorieProjet }                   from '@/types/database';

// ─── Types ────────────────────────────────────────────────────────────────────

type FilterId = 'tous' | CategorieProjet;

interface Filter {
  id:    FilterId;
  label: string;
  count: number;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const CATEGORIE_LABELS: Record<CategorieProjet, string> = {
  architecture:   'Architecture',
  decoration:     'Décoration',
  gestion_projet: 'Gestion de projet',
  boutique:       'Boutique',
};

// Aspect-ratio buckets — deterministic hash from slug so it never shifts
// Tall (portrait) | Square | Wide (landscape)
function getAspectBucket(slug: string): 'tall' | 'square' | 'wide' {
  let hash = 0;
  for (let i = 0; i < slug.length; i++) hash = (hash * 31 + slug.charCodeAt(i)) | 0;
  const n = Math.abs(hash) % 10;
  if (n < 4) return 'tall';   // 40% tall
  if (n < 7) return 'wide';   // 30% wide
  return 'square';            // 30% square
}

const ASPECT_CLASSES: Record<ReturnType<typeof getAspectBucket>, string> = {
  tall:   'aspect-[3/4]',
  square: 'aspect-square',
  wide:   'aspect-[4/3]',
};

// ─── Placeholder image ────────────────────────────────────────────────────────

function ProjetPlaceholder({ categorie }: { categorie: CategorieProjet }) {
  const palettes: Record<CategorieProjet, { bg: string; fg: string }> = {
    architecture:   { bg: '#1A3040', fg: '#2A5060' },
    decoration:     { bg: '#2A1A08', fg: '#3A2810' },
    gestion_projet: { bg: '#152818', fg: '#223828' },
    boutique:       { bg: '#252318', fg: '#353328' },
  };
  const { bg, fg } = palettes[categorie];

  return (
    <div className="absolute inset-0" style={{ backgroundColor: bg }}>
      {/* Organic circle motif */}
      <svg className="absolute inset-0 w-full h-full opacity-30" viewBox="0 0 400 300" fill="none" aria-hidden>
        <circle cx="320" cy="80"  r="120" stroke={fg} strokeWidth="1" fill="none" />
        <circle cx="320" cy="80"  r="80"  stroke={fg} strokeWidth="0.5" fill="none" />
        <circle cx="80"  cy="220" r="90"  stroke={fg} strokeWidth="0.8" fill="none" />
        <line x1="200" y1="0" x2="400" y2="300" stroke={fg} strokeWidth="0.5" />
        <line x1="160" y1="0" x2="360" y2="300" stroke={fg} strokeWidth="0.3" />
      </svg>
      <div
        className="absolute bottom-0 left-0 right-0 h-1/3"
        style={{ background: `linear-gradient(to top, ${bg}, transparent)` }}
      />
    </div>
  );
}

// ─── ProjectCard ──────────────────────────────────────────────────────────────

interface ProjectCardProps {
  projet: ProjetCard;
  index:  number;
}

function ProjectCard({ projet, index }: ProjectCardProps) {
  const bucket      = getAspectBucket(projet.slug);
  const aspectClass = ASPECT_CLASSES[bucket];

  const location = [projet.lieu ?? projet.ville, projet.pays]
    .filter(Boolean)
    .join(', ');

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{
        layout:  { type: 'spring', stiffness: 300, damping: 30 },
        opacity: { duration: 0.35, delay: Math.min(index * 0.06, 0.4) },
        y:       { type: 'spring', stiffness: 280, damping: 28, delay: Math.min(index * 0.06, 0.4) },
      }}
      className="group relative w-full overflow-hidden rounded-sm cursor-pointer"
    >
      <Link href={`/galerie/${projet.slug}`} className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-or focus-visible:ring-offset-2">

        {/* Image container */}
        <div className={cn('relative w-full overflow-hidden', aspectClass)}>

          {/* Background image or placeholder */}
          {projet.image_principale ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={projet.image_principale}
              alt={projet.titre}
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out-expo group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <ProjetPlaceholder categorie={projet.categorie} />
          )}

          {/* Base gradient (always present — bottom readability) */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: 'linear-gradient(to top, rgba(21,21,21,0.72) 0%, rgba(21,21,21,0.18) 45%, transparent 100%)',
            }}
            aria-hidden
          />

          {/* Hover overlay — darkens whole card */}
          <div
            className="absolute inset-0 bg-noir/40 opacity-0 transition-opacity duration-400 ease-spring group-hover:opacity-100 pointer-events-none"
            aria-hidden
          />

          {/* ── TOP ROW: category badge + vedette dot ── */}
          <div className="absolute top-4 left-4 right-4 flex items-start justify-between pointer-events-none">
            <span
              className="inline-flex items-center rounded-sm bg-noir/60 px-2.5 py-1 backdrop-blur-sm
                         text-[9px] font-semibold uppercase tracking-[0.22em] text-blanc/90
                         border border-blanc/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]
                         transition-all duration-300 group-hover:bg-or/80 group-hover:text-blanc"
            >
              {CATEGORIE_LABELS[projet.categorie]}
            </span>

            {/* Arrow icon — slides in on hover */}
            <span
              className="flex size-8 items-center justify-center rounded-full bg-or/0
                         translate-x-3 opacity-0 transition-all duration-300 ease-spring
                         group-hover:translate-x-0 group-hover:opacity-100 group-hover:bg-or"
              aria-hidden
            >
              <ArrowUpRight size={14} strokeWidth={2} className="text-blanc" />
            </span>
          </div>

          {/* ── BOTTOM ROW: title + meta ── */}
          <div className="absolute bottom-0 left-0 right-0 px-5 pb-5 pointer-events-none">
            {/* Meta: location + year */}
            <div
              className="mb-2 flex items-center gap-3 translate-y-2 opacity-0 transition-all duration-300 ease-spring group-hover:translate-y-0 group-hover:opacity-100"
            >
              {location && (
                <span className="flex items-center gap-1 text-[9.5px] text-blanc/70 font-medium">
                  <MapPin size={9} strokeWidth={1.8} aria-hidden />
                  {location}
                </span>
              )}
              {projet.annee && (
                <span className="flex items-center gap-1 text-[9.5px] text-blanc/70 font-medium">
                  <Calendar size={9} strokeWidth={1.8} aria-hidden />
                  {projet.annee}
                </span>
              )}
              {projet.surface_m2 && (
                <span className="flex items-center gap-1 text-[9.5px] text-blanc/70 font-medium">
                  <Maximize2 size={9} strokeWidth={1.8} aria-hidden />
                  {projet.surface_m2} m²
                </span>
              )}
            </div>

            {/* Title */}
            <h3
              className="font-display font-light italic leading-tight text-blanc"
              style={{ fontSize: 'clamp(1.05rem, 1.8vw, 1.4rem)' }}
            >
              {projet.titre}
            </h3>

            {/* Sous-titre or description excerpt */}
            {(projet.sous_titre || projet.description) && (
              <p
                className="mt-1.5 text-[11px] text-blanc/60 leading-relaxed line-clamp-2
                           max-h-0 opacity-0 overflow-hidden transition-all duration-400 ease-spring
                           group-hover:max-h-10 group-hover:opacity-100"
              >
                {projet.sous_titre ?? (projet.description?.slice(0, 90) + '…')}
              </p>
            )}
          </div>

          {/* Vedette indicator */}
          {projet.vedette && (
            <span
              className="absolute top-4 right-4 translate-x-0 opacity-100 group-hover:opacity-0
                         transition-opacity duration-200 pointer-events-none"
              aria-label="Projet vedette"
            >
              <span className="flex size-2 rounded-full bg-or shadow-or" aria-hidden />
            </span>
          )}
        </div>

      </Link>
    </motion.article>
  );
}

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyState({ label }: { label: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="col-span-full py-20 text-center"
    >
      <div className="mx-auto mb-5 flex size-14 items-center justify-center rounded-full border border-gris-cl bg-blanc">
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden>
          <circle cx="11" cy="11" r="7" stroke="#84827F" strokeWidth="1.2" />
          <path d="M8 11h6M11 8v6" stroke="#84827F" strokeWidth="1.2" strokeLinecap="round" />
        </svg>
      </div>
      <p className="text-[13px] font-medium text-gris">
        Aucun projet dans <span className="text-noir">{label}</span>
      </p>
      <p className="mt-1 text-[11px] text-gris/60">D&apos;autres projets arrivent prochainement.</p>
    </motion.div>
  );
}

// ─── Masonry Grid ─────────────────────────────────────────────────────────────

function MasonryGrid({ projets }: { projets: ProjetCard[] }) {
  // Split into two columns for masonry — left gets even indices, right gets odd
  const left  = projets.filter((_, i) => i % 2 === 0);
  const right = projets.filter((_, i) => i % 2 !== 0);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5 items-start">
      {/* Left column */}
      <div className="flex flex-col gap-4 md:gap-5">
        <AnimatePresence mode="popLayout">
          {left.map((p, i) => (
            <ProjectCard key={p.id} projet={p} index={i * 2} />
          ))}
        </AnimatePresence>
      </div>
      {/* Right column — offset slightly for asymmetric masonry feel */}
      <div className="flex flex-col gap-4 md:gap-5 md:mt-8">
        <AnimatePresence mode="popLayout">
          {right.map((p, i) => (
            <ProjectCard key={p.id} projet={p} index={i * 2 + 1} />
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ─── GalerieClient ────────────────────────────────────────────────────────────

interface GalerieClientProps {
  projets: ProjetCard[];
}

export function GalerieClient({ projets }: GalerieClientProps) {
  const [activeFilter, setActiveFilter] = useState<FilterId>('tous');
  const filterId = useId();

  // Build filter list with counts
  const filters = useMemo<Filter[]>(() => {
    const counts = projets.reduce<Record<CategorieProjet, number>>(
      (acc, p) => { acc[p.categorie] = (acc[p.categorie] ?? 0) + 1; return acc; },
      {} as Record<CategorieProjet, number>,
    );

    const cats = Object.entries(counts) as [CategorieProjet, number][];
    return [
      { id: 'tous', label: 'Tous les projets', count: projets.length },
      ...cats.map(([id, count]) => ({ id, label: CATEGORIE_LABELS[id], count })),
    ];
  }, [projets]);

  // Filtered list
  const filtered = useMemo(
    () => activeFilter === 'tous'
      ? projets
      : projets.filter((p) => p.categorie === activeFilter),
    [projets, activeFilter],
  );

  const handleFilter = useCallback((id: FilterId) => setActiveFilter(id), []);

  return (
    <section aria-label="Galerie de projets">
      {/* ── Filter Bar ───────────────────────────────────────────────────────── */}
      <div
        className="sticky top-0 z-20 border-b border-gris-cl/60 bg-beige/90 backdrop-blur-sm"
        style={{ boxShadow: '0 1px 0 rgba(224,222,218,0.6)' }}
      >
        <div className="mx-auto max-w-[1440px] px-6 md:px-10 xl:px-16">
          <div
            role="tablist"
            aria-label="Filtrer par catégorie"
            className="flex items-center gap-2 overflow-x-auto py-4 scrollbar-none"
          >
            {filters.map((f) => {
              const isActive = f.id === activeFilter;
              return (
                <button
                  key={f.id}
                  role="tab"
                  id={`${filterId}-tab-${f.id}`}
                  aria-selected={isActive}
                  aria-controls={`${filterId}-panel`}
                  onClick={() => handleFilter(f.id)}
                  className={cn(
                    'relative shrink-0 inline-flex items-center gap-2 rounded-sm px-4 py-2',
                    'text-[10px] font-semibold uppercase tracking-[0.2em]',
                    'transition-all duration-200 ease-spring',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-or',
                    isActive
                      ? 'bg-noir text-blanc'
                      : 'bg-blanc border border-gris-cl text-gris hover:border-gris hover:text-noir',
                  )}
                >
                  {isActive && (
                    <motion.span
                      layoutId={`${filterId}-pill`}
                      className="absolute inset-0 rounded-sm bg-noir"
                      transition={{ type: 'spring', stiffness: 350, damping: 32 }}
                      style={{ zIndex: -1 }}
                    />
                  )}
                  <span className="relative">{f.label}</span>
                  <span
                    className={cn(
                      'relative inline-flex size-4 items-center justify-center rounded-full text-[8px] font-bold',
                      isActive ? 'bg-blanc/15 text-blanc' : 'bg-beige2 text-gris',
                    )}
                  >
                    {f.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Grid ─────────────────────────────────────────────────────────────── */}
      <div
        id={`${filterId}-panel`}
        role="tabpanel"
        aria-label={filters.find((f) => f.id === activeFilter)?.label}
        className="mx-auto max-w-[1440px] px-6 md:px-10 xl:px-16 py-8 md:py-10"
      >
        {/* Results count */}
        <div className="mb-6 flex items-center justify-between">
          <p className="text-[11px] text-gris/70">
            <span className="font-semibold text-noir">{filtered.length}</span>
            {' '}projet{filtered.length !== 1 ? 's' : ''}
            {activeFilter !== 'tous' && (
              <> en <span className="text-or">{filters.find((f) => f.id === activeFilter)?.label}</span></>
            )}
          </p>
          {activeFilter !== 'tous' && (
            <button
              type="button"
              onClick={() => handleFilter('tous')}
              className="text-[10px] text-gris/60 hover:text-noir underline underline-offset-2 transition-colors duration-150"
            >
              Réinitialiser
            </button>
          )}
        </div>

        {/* Masonry or empty state */}
        {filtered.length === 0 ? (
          <EmptyState label={filters.find((f) => f.id === activeFilter)?.label ?? ''} />
        ) : (
          <MasonryGrid projets={filtered} />
        )}
      </div>
    </section>
  );
}
