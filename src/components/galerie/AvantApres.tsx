'use client';

/**
 * AvantApres — Drag comparison slider
 *
 * SVG layout (Y 1246-1842, bg #F2EDE8):
 *   • Left panel (AVANT):  x=80-660, dark teal #243848
 *   • Right panel (APRÈS): x=1040-1360, dark blue #243848
 *   • Center divider: x=700-1000, subtle separator element
 *
 * Interaction: drag the vertical handle left/right to reveal AVANT/APRÈS
 */

import { useState, useRef, useCallback, useId } from 'react';
import { motion }    from 'framer-motion';
import { cn }        from '@/lib/utils';
import type { ProjetImage } from '@/lib/supabase/queries/projets';

// ─── Placeholder ──────────────────────────────────────────────────────────────

function SlotPlaceholder({ label, side }: { label: string; side: 'avant' | 'apres' }) {
  const bg = side === 'avant' ? '#1A3040' : '#152818';
  const accent = side === 'avant' ? '#2A5060' : '#223828';
  return (
    <div className="absolute inset-0 flex items-end" style={{ backgroundColor: bg }}>
      <svg className="absolute inset-0 w-full h-full opacity-20" viewBox="0 0 600 420" fill="none" aria-hidden>
        <circle cx={side === 'avant' ? 480 : 120} cy="140" r="200" stroke={accent} strokeWidth="1" fill="none" />
        <circle cx={side === 'avant' ? 480 : 120} cy="140" r="130" stroke={accent} strokeWidth="0.5" fill="none" />
        {Array.from({ length: 10 }, (_, i) => (
          <line
            key={i}
            x1={i * 60}
            y1="0"
            x2={i * 60}
            y2="420"
            stroke={accent}
            strokeWidth="0.4"
          />
        ))}
      </svg>
      <div className="relative px-5 pb-5 text-[9.5px] font-semibold uppercase tracking-[0.28em] text-blanc/30">
        {label}
      </div>
    </div>
  );
}

// ─── AvantApres ───────────────────────────────────────────────────────────────

interface AvantApresProps {
  avant: ProjetImage | null;
  apres: ProjetImage | null;
}

export function AvantApres({ avant, apres }: AvantApresProps) {
  const [sliderPct, setSliderPct] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const labelId = useId();

  const updateSlider = useCallback((clientX: number) => {
    const el = containerRef.current;
    if (!el) return;
    const { left, width } = el.getBoundingClientRect();
    const pct = Math.min(100, Math.max(0, ((clientX - left) / width) * 100));
    setSliderPct(pct);
  }, []);

  // Mouse
  const onMouseDown = useCallback((e: React.MouseEvent) => {
    setIsDragging(true);
    updateSlider(e.clientX);
    const onMove = (ev: MouseEvent) => updateSlider(ev.clientX);
    const onUp   = () => { setIsDragging(false); window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp); };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  }, [updateSlider]);

  // Touch
  const onTouchStart = useCallback((e: React.TouchEvent) => {
    setIsDragging(true);
    updateSlider(e.touches[0].clientX);
    const onMove = (ev: TouchEvent) => updateSlider(ev.touches[0].clientX);
    const onEnd  = () => { setIsDragging(false); window.removeEventListener('touchmove', onMove); window.removeEventListener('touchend', onEnd); };
    window.addEventListener('touchmove', onMove, { passive: true });
    window.addEventListener('touchend', onEnd);
  }, [updateSlider]);

  return (
    <div>
      {/* Section header */}
      <div className="mb-8 flex items-start justify-between gap-6">
        <div>
          <div className="mb-3 flex items-center gap-3">
            <span className="block h-px w-6 shrink-0 bg-or/70" aria-hidden />
            <span className="text-[9px] font-semibold uppercase tracking-[0.34em] text-or/80">
              Transformation
            </span>
          </div>
          <h2
            className="font-display font-light italic text-noir"
            style={{ fontSize: 'clamp(1.6rem, 2.5vw, 2.4rem)' }}
          >
            Avant &amp; Après
          </h2>
        </div>
        <p className="hidden sm:block max-w-[320px] text-[12px] text-gris leading-relaxed">
          Faites glisser le curseur pour comparer l&apos;état initial et le résultat final de l&apos;intervention.
        </p>
      </div>

      {/* Comparison slider */}
      <div
        ref={containerRef}
        role="slider"
        aria-label="Comparaison avant/après"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(sliderPct)}
        aria-labelledby={labelId}
        tabIndex={0}
        className={cn(
          'relative w-full overflow-hidden rounded-sm select-none',
          'aspect-[16/9] md:aspect-[21/9]',
          isDragging ? 'cursor-grabbing' : 'cursor-grab',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-or focus-visible:ring-offset-2',
        )}
        onMouseDown={onMouseDown}
        onTouchStart={onTouchStart}
        onKeyDown={(e) => {
          if (e.key === 'ArrowLeft')  setSliderPct(p => Math.max(0, p - 5));
          if (e.key === 'ArrowRight') setSliderPct(p => Math.min(100, p + 5));
        }}
      >
        {/* APRÈS — base layer (always full) */}
        <div className="absolute inset-0">
          {apres?.url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={apres.url}
              alt={apres.alt ?? 'Vue après travaux'}
              className="w-full h-full object-cover"
              draggable={false}
              loading="lazy"
            />
          ) : (
            <SlotPlaceholder label="Après" side="apres" />
          )}
        </div>

        {/* AVANT — clipped layer */}
        <div
          className="absolute inset-0 overflow-hidden"
          style={{ width: `${sliderPct}%` }}
        >
          {avant?.url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={avant.url}
              alt={avant.alt ?? 'Vue avant travaux'}
              className="absolute inset-0 h-full object-cover"
              style={{ width: `${10000 / sliderPct}%`, maxWidth: 'none' }}
              draggable={false}
              loading="lazy"
            />
          ) : (
            <div className="absolute inset-0" style={{ width: `${10000 / Math.max(sliderPct, 0.1)}%` }}>
              <SlotPlaceholder label="Avant" side="avant" />
            </div>
          )}
        </div>

        {/* Divider line */}
        <div
          className="absolute inset-y-0 z-10 w-px bg-blanc/60 shadow-[0_0_8px_rgba(255,255,255,0.4)]"
          style={{ left: `${sliderPct}%` }}
          aria-hidden
        />

        {/* Drag handle */}
        <motion.div
          className="absolute top-1/2 z-20 -translate-y-1/2 -translate-x-1/2"
          style={{ left: `${sliderPct}%` }}
          animate={{ scale: isDragging ? 1.12 : 1 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          aria-hidden
        >
          <div className="flex size-10 items-center justify-center rounded-full bg-blanc shadow-modal cursor-grab active:cursor-grabbing border border-gris-cl/30">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M4 7H1M1 7L3 5M1 7L3 9" stroke="#151515" strokeWidth="1.3" strokeLinecap="round" />
              <path d="M10 7H13M13 7L11 5M13 7L11 9" stroke="#151515" strokeWidth="1.3" strokeLinecap="round" />
            </svg>
          </div>
        </motion.div>

        {/* AVANT label */}
        <div
          className={cn(
            'absolute top-4 left-4 z-10 rounded-sm px-3 py-1.5 backdrop-blur-sm',
            'border border-blanc/10 bg-noir/50 text-blanc/80',
            'text-[9px] font-semibold uppercase tracking-[0.24em]',
            'transition-opacity duration-200',
            sliderPct < 8 && 'opacity-0',
          )}
          aria-hidden
        >
          Avant
        </div>

        {/* APRÈS label */}
        <div
          className={cn(
            'absolute top-4 right-4 z-10 rounded-sm px-3 py-1.5 backdrop-blur-sm',
            'border border-blanc/10 bg-noir/50 text-blanc/80',
            'text-[9px] font-semibold uppercase tracking-[0.24em]',
            'transition-opacity duration-200',
            sliderPct > 92 && 'opacity-0',
          )}
          aria-hidden
        >
          Après
        </div>
      </div>

      {/* Mobile instruction */}
      <p id={labelId} className="mt-3 text-center text-[10.5px] text-gris/50 sm:hidden">
        Glissez pour comparer
      </p>
    </div>
  );
}
