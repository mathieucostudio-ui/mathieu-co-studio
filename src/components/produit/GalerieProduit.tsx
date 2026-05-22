'use client';

/**
 * GalerieProduit — galerie 4 images avec thumbnails verticaux
 *
 * SVG layout (x=0-760px) :
 *   • Image principale : x=80-556 (476px), y=124-704 (580px)
 *   • Bande thumbnails : x=560-740 (180px), y=124-704 — 4 slots de ~130px
 *
 * Desktop : thumbnails à droite de l'image principale
 * Mobile  : image unique + indicateurs points
 */

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ZoomIn } from 'lucide-react';
import { cn }      from '@/lib/utils';
import type { ProduitImage } from '@/types/product';

// ─── Palettes placeholder (déterministe selon index) ─────────────────────────

const PLACEHOLDER_BG = ['bg-beige2', 'bg-beige3', 'bg-beige4', 'bg-beige5', 'bg-beige'];

// ─── Props ────────────────────────────────────────────────────────────────────

interface GalerieProduitProps {
  images:   ProduitImage[];
  nomProduit: string;
  /** Badge "Vu dans nos rendus" sur l'image principale */
  showRendusBadge?: boolean;
}

// ─── Variants ─────────────────────────────────────────────────────────────────

const SPRING = { type: 'spring', stiffness: 280, damping: 28 } as const;

// ─── GalerieProduit ───────────────────────────────────────────────────────────

export function GalerieProduit({ images, nomProduit, showRendusBadge = true }: GalerieProduitProps) {
  const [activeIdx, setActiveIdx] = useState(0);
  const [direction, setDirection]  = useState(1);

  // Garantir au moins 4 slots (pour la galerie placeholder)
  const slots = Array.from({ length: Math.max(4, images.length) }, (_, i) => images[i] ?? null);
  const activeImage = images[activeIdx] ?? null;

  const goTo = useCallback((idx: number) => {
    setDirection(idx > activeIdx ? 1 : -1);
    setActiveIdx(idx);
  }, [activeIdx]);

  return (
    <div className="relative flex h-full gap-3">

      {/* ── Image principale ────────────────────────────────────────────────── */}
      <div
        className={cn(
          'relative flex-1 overflow-hidden rounded-sm',
          'min-h-[480px] md:min-h-[580px]',
          activeImage ? '' : PLACEHOLDER_BG[activeIdx % PLACEHOLDER_BG.length],
        )}
      >
        {/* Badge "Vu dans nos rendus" */}
        {showRendusBadge && (
          <div className="absolute left-4 top-4 z-20">
            <span className={cn(
              'inline-flex items-center gap-1.5 rounded-sm px-2.5 py-1.5',
              'bg-noir/80 backdrop-blur-sm',
              'text-[9px] font-semibold uppercase tracking-[0.24em] text-or',
            )}>
              <svg width="8" height="8" viewBox="0 0 8 8" fill="none" aria-hidden>
                <path d="M4 1L5.2 3.2L7.5 3.6L5.8 5.2L6.2 7.5L4 6.4L1.8 7.5L2.2 5.2L0.5 3.6L2.8 3.2L4 1Z"
                  fill="currentColor"/>
              </svg>
              Vu dans nos rendus
            </span>
          </div>
        )}

        {/* Image ou placeholder */}
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={activeIdx}
            initial={{ opacity: 0, x: direction * 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction * -24 }}
            transition={SPRING}
            className="absolute inset-0"
          >
            {activeImage?.url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={activeImage.url}
                alt={activeImage.alt || nomProduit}
                className="h-full w-full object-cover"
                loading="eager"
                decoding="async"
              />
            ) : (
              <div className={cn(
                'h-full w-full',
                PLACEHOLDER_BG[activeIdx % PLACEHOLDER_BG.length],
              )} />
            )}
          </motion.div>
        </AnimatePresence>

        {/* Zoom icon overlay */}
        <button
          type="button"
          className={cn(
            'absolute bottom-4 right-4 z-10',
            'flex size-8 items-center justify-center rounded-full',
            'bg-blanc/80 backdrop-blur-sm',
            'text-gris hover:text-noir transition-colors duration-150',
          )}
          aria-label="Agrandir l'image"
        >
          <ZoomIn size={14} strokeWidth={1.8} aria-hidden />
        </button>

        {/* Indicateurs mobile */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 md:hidden">
          {slots.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => goTo(i)}
              className={cn(
                'rounded-full transition-all duration-200',
                i === activeIdx
                  ? 'w-4 h-1.5 bg-blanc'
                  : 'w-1.5 h-1.5 bg-blanc/50',
              )}
              aria-label={`Image ${i + 1}`}
            />
          ))}
        </div>
      </div>

      {/* ── Thumbnails verticaux (desktop) ──────────────────────────────────── */}
      <div className="hidden md:flex flex-col gap-2.5 w-[130px] shrink-0">
        {slots.map((img, i) => (
          <motion.button
            key={i}
            type="button"
            onClick={() => goTo(i)}
            whileTap={{ scale: 0.96 }}
            aria-label={`Voir image ${i + 1}`}
            className={cn(
              'relative flex-1 min-h-[100px] overflow-hidden rounded-sm',
              'border-2 transition-all duration-200',
              i === activeIdx
                ? 'border-or shadow-or'
                : 'border-transparent hover:border-gris-cl',
              img ? '' : PLACEHOLDER_BG[i % PLACEHOLDER_BG.length],
            )}
          >
            {img?.url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={img.url}
                alt={img.alt || `${nomProduit} — vue ${i + 1}`}
                className="h-full w-full object-cover"
                loading="lazy"
                decoding="async"
              />
            ) : (
              <div className={cn(
                'absolute inset-0',
                PLACEHOLDER_BG[i % PLACEHOLDER_BG.length],
              )} />
            )}

            {/* Overlay actif */}
            {i === activeIdx && (
              <div className="absolute inset-0 bg-or/8 rounded-[inherit]" aria-hidden />
            )}
          </motion.button>
        ))}
      </div>

    </div>
  );
}
