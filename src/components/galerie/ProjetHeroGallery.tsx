'use client';

/**
 * ProjetHeroGallery
 *
 * Full-bleed project hero with thumbnail strip + lightbox.
 *
 * Layout (from SVG mockup):
 *   • Main image: full width, ~460px tall, dark bg #243848
 *   • Thumbnail strip: 4 slots, right-aligned inside image
 *   • Lightbox: triggered by click on main image, keyboard navigable
 */

import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence }           from 'framer-motion';
import { X, ChevronLeft, ChevronRight, ZoomIn, Grid3x3 } from 'lucide-react';
import { cn }                                from '@/lib/utils';
import type { ProjetImage }                  from '@/lib/supabase/queries/projets';

// ─── Placeholder ──────────────────────────────────────────────────────────────

function ImagePlaceholder({ className }: { className?: string }) {
  return (
    <div className={cn('absolute inset-0 flex items-center justify-center', className)}
      style={{ backgroundColor: '#1A3040' }}>
      <svg className="opacity-10" width="80" height="80" viewBox="0 0 80 80" fill="none" aria-hidden>
        <circle cx="40" cy="40" r="30" stroke="#B8893A" strokeWidth="1" />
        <circle cx="40" cy="40" r="20" stroke="#B8893A" strokeWidth="0.6" />
        <line x1="10" y1="40" x2="70" y2="40" stroke="#B8893A" strokeWidth="0.6" />
        <line x1="40" y1="10" x2="40" y2="70" stroke="#B8893A" strokeWidth="0.6" />
      </svg>
    </div>
  );
}

// ─── Lightbox ─────────────────────────────────────────────────────────────────

interface LightboxProps {
  images: ProjetImage[];
  startIdx: number;
  onClose: () => void;
}

function Lightbox({ images, startIdx, onClose }: LightboxProps) {
  const [idx, setIdx] = useState(startIdx);
  const [dir, setDir] = useState(0);

  const go = useCallback((next: number) => {
    setDir(next > idx ? 1 : -1);
    setIdx(Math.max(0, Math.min(images.length - 1, next)));
  }, [idx, images.length]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape')      onClose();
      if (e.key === 'ArrowRight')  go(idx + 1);
      if (e.key === 'ArrowLeft')   go(idx - 1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [idx, go, onClose]);

  const img = images[idx];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-[200] flex items-center justify-center bg-noir/95 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal
      aria-label="Visionneuse d'images"
    >
      {/* Main image */}
      <div
        className="relative w-full h-full flex items-center justify-center p-4 md:p-14"
        onClick={(e) => e.stopPropagation()}
      >
        <AnimatePresence mode="wait" custom={dir}>
          <motion.div
            key={idx}
            custom={dir}
            variants={{
              enter: (d: number) => ({ x: d * 60, opacity: 0 }),
              center: { x: 0, opacity: 1 },
              exit:   (d: number) => ({ x: d * -60, opacity: 0 }),
            }}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="relative max-w-5xl w-full"
          >
            {img?.url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={img.url}
                alt={img.alt ?? `Image ${idx + 1}`}
                className="w-full max-h-[80vh] object-contain rounded-sm"
              />
            ) : (
              <div className="w-full aspect-video bg-beige2/10 rounded-sm" />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Controls */}
      <button
        type="button"
        onClick={onClose}
        className="absolute top-5 right-5 flex size-9 items-center justify-center rounded-full bg-blanc/10 text-blanc hover:bg-blanc/20 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blanc/50"
        aria-label="Fermer la visionneuse"
      >
        <X size={16} strokeWidth={1.8} aria-hidden />
      </button>

      {idx > 0 && (
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); go(idx - 1); }}
          className="absolute left-4 top-1/2 -translate-y-1/2 flex size-10 items-center justify-center rounded-full bg-blanc/10 text-blanc hover:bg-blanc/20 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blanc/50"
          aria-label="Image précédente"
        >
          <ChevronLeft size={18} strokeWidth={1.8} aria-hidden />
        </button>
      )}

      {idx < images.length - 1 && (
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); go(idx + 1); }}
          className="absolute right-4 top-1/2 -translate-y-1/2 flex size-10 items-center justify-center rounded-full bg-blanc/10 text-blanc hover:bg-blanc/20 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blanc/50"
          aria-label="Image suivante"
        >
          <ChevronRight size={18} strokeWidth={1.8} aria-hidden />
        </button>
      )}

      {/* Counter */}
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 text-[10px] font-semibold uppercase tracking-[0.22em] text-blanc/50">
        {idx + 1} / {images.length}
      </div>

      {/* Thumbnail strip */}
      {images.length > 1 && (
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex items-center gap-2">
          {images.map((im, i) => (
            <button
              key={i}
              type="button"
              onClick={(e) => { e.stopPropagation(); go(i); }}
              aria-label={`Image ${i + 1}`}
              className={cn(
                'relative size-12 rounded-sm overflow-hidden transition-all duration-200',
                i === idx
                  ? 'ring-2 ring-or opacity-100 scale-110'
                  : 'opacity-40 hover:opacity-70',
              )}
            >
              {im.url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={im.url} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-beige2/20" />
              )}
            </button>
          ))}
        </div>
      )}
    </motion.div>
  );
}

// ─── ProjetHeroGallery ────────────────────────────────────────────────────────

interface ProjetHeroGalleryProps {
  images:     ProjetImage[];
  titre:      string;
  /** Fallback if no images */
  imagePrincipale?: string | null;
}

export function ProjetHeroGallery({
  images,
  titre,
  imagePrincipale,
}: ProjetHeroGalleryProps) {
  const [activeIdx,   setActiveIdx]   = useState(0);
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);
  const [dir,         setDir]         = useState(0);

  // Normalise: if no typed images, fall back to image_principale as single slot
  const allImages: ProjetImage[] = images.length > 0
    ? images
    : imagePrincipale
      ? [{ url: imagePrincipale, alt: titre }]
      : [];

  const galleryImages = allImages.filter((img) => img.type !== 'avant' && img.type !== 'apres');
  const displayImages = galleryImages.length > 0 ? galleryImages : allImages;

  const goTo = useCallback((next: number) => {
    setDir(next > activeIdx ? 1 : -1);
    setActiveIdx(next);
  }, [activeIdx]);

  const active = displayImages[activeIdx] ?? null;
  const thumbs = displayImages.slice(0, 5);

  return (
    <>
      {/* Main hero container */}
      <div
        className="relative w-full overflow-hidden"
        style={{ minHeight: '480px', backgroundColor: '#1A3040' }}
      >
        {/* Background image */}
        <AnimatePresence mode="sync">
          <motion.div
            key={activeIdx}
            initial={{ opacity: 0, scale: 1.03 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="absolute inset-0"
          >
            {active?.url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={active.url}
                alt={active.alt ?? titre}
                className="w-full h-full object-cover"
              />
            ) : (
              <ImagePlaceholder />
            )}
          </motion.div>
        </AnimatePresence>

        {/* Gradient overlays */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'linear-gradient(to bottom, rgba(26,48,64,0.5) 0%, rgba(26,48,64,0.1) 30%, rgba(26,48,64,0.0) 60%, rgba(21,21,21,0.75) 100%)',
          }}
          aria-hidden
        />

        {/* Thumbnail strip — top-right corner */}
        {displayImages.length > 1 && (
          <div className="absolute top-5 right-5 flex flex-col gap-2 z-10">
            {thumbs.map((img, i) => (
              <button
                key={i}
                type="button"
                onClick={() => goTo(i)}
                aria-label={`Vue ${i + 1}`}
                className={cn(
                  'relative size-[72px] overflow-hidden rounded-sm transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-or',
                  i === activeIdx
                    ? 'ring-2 ring-or scale-[1.04]'
                    : 'opacity-55 hover:opacity-80 hover:scale-[1.02]',
                )}
              >
                {img.url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={img.url} alt="" className="w-full h-full object-cover" loading="lazy" />
                ) : (
                  <div className="w-full h-full" style={{ backgroundColor: '#243848' }} />
                )}
              </button>
            ))}
            {/* View all button */}
            {displayImages.length > 5 && (
              <button
                type="button"
                onClick={() => setLightboxIdx(0)}
                className="flex size-[72px] flex-col items-center justify-center gap-1 rounded-sm bg-noir/60 backdrop-blur-sm text-blanc/70 hover:text-blanc hover:bg-noir/80 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-or"
                aria-label="Voir toutes les images"
              >
                <Grid3x3 size={16} strokeWidth={1.5} aria-hidden />
                <span className="text-[8px] font-semibold uppercase tracking-[0.15em]">
                  +{displayImages.length - 5}
                </span>
              </button>
            )}
          </div>
        )}

        {/* Fullscreen trigger */}
        <button
          type="button"
          onClick={() => setLightboxIdx(activeIdx)}
          className="group absolute bottom-5 right-5 flex items-center gap-2 rounded-sm bg-noir/50 backdrop-blur-sm px-3 py-2 text-blanc/70 hover:text-blanc hover:bg-noir/70 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blanc/40 z-10"
          aria-label="Voir en plein écran"
          style={{ display: displayImages.length === 0 ? 'none' : 'flex' }}
        >
          <ZoomIn size={12} strokeWidth={1.8} aria-hidden />
          <span className="text-[9px] font-semibold uppercase tracking-[0.18em]">
            Plein écran
          </span>
          {displayImages.length > 1 && (
            <span className="text-[9px] opacity-60">
              {activeIdx + 1}/{displayImages.length}
            </span>
          )}
        </button>
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxIdx !== null && (
          <Lightbox
            images={displayImages}
            startIdx={lightboxIdx}
            onClose={() => setLightboxIdx(null)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
