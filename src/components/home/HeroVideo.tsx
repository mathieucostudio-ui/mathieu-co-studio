'use client';

/**
 * HeroVideo — Section hero plein écran avec vidéo de fond
 *
 * Assets attendus :
 *   /video/hero.mp4          — vidéo de fond (existant)
 *   /images/hero-poster.jpg  — image de fallback (à ajouter)
 *
 * Structure visuelle (d'après maquette SVG 1440×860) :
 *   • Fond vidéo sombre (#0A1820) + 3 gradients directionnels
 *   • Contenu LEFT-ALIGNED, max-w-2xl
 *   • Eyebrow or → H1 Cormorant italic → Subtitle or → CTAs
 *   • Flèches nav pulsées (panneaux latéraux)
 *   • Badge projet bas-droite
 *   • Scroll indicator
 *   • Barre contrôles vidéo + dots (plein bas)
 */

import React, {
  memo,
  useState,
  useRef,
  useEffect,
  useCallback,
} from 'react';
import { motion, AnimatePresence, useReducedMotion, type Variants } from 'framer-motion';
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Play,
  Pause,
  Volume2,
  VolumeX,
  ArrowUpRight,
} from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { cn } from '@/lib/utils';

// ─────────────────────────────────────────────────────────────────────────────
//  Types & données
// ─────────────────────────────────────────────────────────────────────────────
interface SlideData {
  id: number;
  eyebrow: string;
  h1: string[];           // chaque string = une ligne animée séparément
  subtitle: string;
  cta1: { label: string; href: string };
  cta2: { label: string; href: string };
  projectLabel: string;
}

const SLIDES: SlideData[] = [
  {
    id: 1,
    eyebrow: "Architecture d'Intérieur",
    h1: ["L'Art de Vivre", 'Réinventé'],
    subtitle: 'Espaces de prestige, taillés sur mesure — Cotonou',
    cta1: { label: 'Nos réalisations', href: '/galerie' },
    cta2: { label: 'La boutique',      href: '/boutique' },
    projectLabel: 'Villa Bord de Lagon — Cotonou',
  },
  {
    id: 2,
    eyebrow: 'Design & Décoration',
    h1: ['Chaque Détail', 'Raconte une Histoire'],
    subtitle: "Mobilier exclusif, matériaux d'exception",
    cta1: { label: 'Explorer nos services',  href: '/services' },
    cta2: { label: 'Prendre rendez-vous', href: '/contact'  },
    projectLabel: 'Résidence Fidjrossè — Cotonou',
  },
  {
    id: 3,
    eyebrow: 'Boutique en Ligne',
    h1: ["Objets d'Exception", 'Livrés chez Vous'],
    subtitle: 'Artisanat africain et design contemporain',
    cta1: { label: 'Découvrir la boutique', href: '/boutique' },
    cta2: { label: 'Nos partenaires',       href: '/apropos'  },
    projectLabel: 'Collection Printemps 2026',
  },
];

/** Durée affichage d'un slide (ms) avant auto-avance */
const SLIDE_DURATION = 8_000;

// ─────────────────────────────────────────────────────────────────────────────
//  Animation variants
// ─────────────────────────────────────────────────────────────────────────────
const SPRING: [number, number, number, number] = [0.16, 1, 0.3, 1];

/** Conteneur : orchestre le stagger de tous les enfants */
const containerVariants: Variants = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.11, delayChildren: 0.35 } },
  exit:    { transition: { staggerChildren: 0.06, staggerDirection: -1 } },
};

const eyebrowVariants: Variants = {
  hidden:  { opacity: 0, y: -16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: SPRING } },
  exit:    { opacity: 0, y: -10, transition: { duration: 0.22 } },
};

const h1LineVariants: Variants = {
  hidden:  { opacity: 0, y: 36 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.72, ease: SPRING } },
  exit:    { opacity: 0, y: -18, transition: { duration: 0.28 } },
};

const subtitleVariants: Variants = {
  hidden:  { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: SPRING } },
  exit:    { opacity: 0, y: -10, transition: { duration: 0.22 } },
};

const ctaVariants: Variants = {
  hidden:  { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: SPRING } },
  exit:    { opacity: 0, transition: { duration: 0.18 } },
};

// ─────────────────────────────────────────────────────────────────────────────
//  Helpers
// ─────────────────────────────────────────────────────────────────────────────
function pad2(n: number): string {
  return String(n).padStart(2, '0');
}

// ─────────────────────────────────────────────────────────────────────────────
//  PulsingArrow — composant isolé + mémoïsé (boucle infinie isolée)
// ─────────────────────────────────────────────────────────────────────────────
const PulsingArrow = memo(function PulsingArrow({
  direction,
  onClick,
}: {
  direction: 'left' | 'right';
  onClick: () => void;
}) {
  const isLeft = direction === 'left';
  const reduced = useReducedMotion();
  const Icon = isLeft ? ChevronLeft : ChevronRight;

  return (
    <motion.button
      type="button"
      onClick={onClick}
      aria-label={isLeft ? 'Slide précédent' : 'Slide suivant'}
      className={cn(
        'group absolute top-0 bottom-16 z-20',
        'hidden md:flex items-center justify-center',
        isLeft ? 'left-0 w-16 xl:w-20' : 'right-0 w-16 xl:w-20',
        'transition-colors duration-300',
        'hover:bg-noir/20 focus-visible:outline-none',
      )}
    >
      {/* Cercle avec flèche pulsée */}
      <motion.div
        animate={
          reduced
            ? undefined
            : {
                opacity: [0.35, 0.9, 0.35],
                x: isLeft ? [-4, 0, -4] : [4, 0, 4],
              }
        }
        transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut' }}
        className={cn(
          'flex size-11 items-center justify-center rounded-full',
          'border border-blanc/20 bg-noir/30 backdrop-blur-sm text-blanc',
          'shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]',
          'transition-all duration-300',
          'group-hover:border-blanc/55 group-hover:bg-noir/50 group-hover:opacity-100',
          'group-focus-visible:border-or/70 group-focus-visible:text-or',
        )}
      >
        <Icon size={17} strokeWidth={1.5} aria-hidden />
      </motion.div>
    </motion.button>
  );
});

// ─────────────────────────────────────────────────────────────────────────────
//  ScrollIndicator — composant isolé + mémoïsé
// ─────────────────────────────────────────────────────────────────────────────
const ScrollIndicator = memo(function ScrollIndicator() {
  const reduced = useReducedMotion();

  return (
    <div
      className="absolute bottom-[76px] left-1/2 z-20 hidden -translate-x-1/2 flex-col items-center gap-1.5 md:flex"
      aria-hidden
    >
      <span className="select-none text-[7px] uppercase tracking-[0.38em] text-blanc/30">
        Défiler
      </span>
      {/* Ligne verticale animée */}
      <div className="relative h-6 w-px overflow-hidden">
        <div className="absolute inset-0 bg-blanc/15" />
        <motion.div
          className="absolute inset-x-0 top-0 bg-blanc/60"
          animate={reduced ? undefined : { y: ['-100%', '200%'] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
          style={{ height: '50%' }}
        />
      </div>
      <motion.div
        animate={reduced ? undefined : { y: [0, 5, 0] }}
        transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut', delay: 0.4 }}
      >
        <ChevronDown size={12} strokeWidth={1.5} className="text-blanc/30" />
      </motion.div>
    </div>
  );
});

// ─────────────────────────────────────────────────────────────────────────────
//  HeroVideo — composant principal
// ─────────────────────────────────────────────────────────────────────────────
export function HeroVideo() {
  const [current,   setCurrent]   = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted,   setIsMuted]   = useState(true);

  const videoRef  = useRef<HTMLVideoElement>(null);
  const timerRef  = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const reduced   = useReducedMotion();
  const slide     = SLIDES[current];

  // ── Auto-avance des slides ─────────────────────────────────────────────────
  useEffect(() => {
    timerRef.current = setTimeout(() => {
      setCurrent((c) => (c + 1) % SLIDES.length);
    }, SLIDE_DURATION);
    return () => clearTimeout(timerRef.current);
  }, [current]);

  // ── Contrôles vidéo ───────────────────────────────────────────────────────
  const togglePlay = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    isPlaying ? v.pause() : v.play().catch(() => {});
    setIsPlaying((p) => !p);
  }, [isPlaying]);

  const toggleMute = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = !isMuted;
    setIsMuted((m) => !m);
  }, [isMuted]);

  // ── Navigation slides ─────────────────────────────────────────────────────
  const goTo = useCallback((idx: number) => {
    clearTimeout(timerRef.current);
    setCurrent(idx);
  }, []);

  const goPrev = useCallback(
    () => goTo((current - 1 + SLIDES.length) % SLIDES.length),
    [current, goTo],
  );
  const goNext = useCallback(
    () => goTo((current + 1) % SLIDES.length),
    [current, goTo],
  );

  // ── Clavier (flèches) ─────────────────────────────────────────────────────
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft')  goPrev();
      if (e.key === 'ArrowRight') goNext();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [goPrev, goNext]);

  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <section
      className="relative min-h-[100dvh] w-full overflow-hidden bg-[#0A1820]"
      aria-label="Présentation Mathieu&Co Studio"
    >

      {/* ── Vidéo de fond ──────────────────────────────────────────────────── */}
      <video
        ref={videoRef}
        src="/video/hero.mp4"
        poster="/images/hero-poster.jpg"
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 z-0 h-full w-full object-cover"
        aria-hidden
      />

      {/* ── Gradients directionnels (d'après maquette SVG) ────────────────── */}
      <div className="pointer-events-none absolute inset-0 z-10" aria-hidden>
        {/* Bas → sombre (paint4_linear) */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#020608]/55 to-[#020608]/82" />
        {/* Haut → voile renforcé sous la navbar (garantit la lisibilité du texte blanc) */}
        <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-[#020608]/70 to-transparent" />
        {/* Gauche → vignette (paint6_linear, couvre 40%) */}
        <div className="absolute inset-y-0 left-0 w-[40%] bg-gradient-to-r from-[#020608]/45 to-transparent" />
      </div>

      {/* ── Flèches navigation pulsées ──────────────────────────────────────── */}
      <PulsingArrow direction="left"  onClick={goPrev} />
      <PulsingArrow direction="right" onClick={goNext} />

      {/* ── Contenu principal (stagger Framer Motion) ───────────────────────── */}
      <div className="relative z-20 flex min-h-[100dvh] flex-col justify-center pb-20 pt-24">
        <div className="mx-auto w-full max-w-7xl px-6 md:px-20 xl:px-24">
          <AnimatePresence mode="wait">
            <motion.div
              key={current}
              variants={reduced ? undefined : containerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="max-w-[680px]"
            >

              {/* Eyebrow */}
              <motion.div
                variants={reduced ? undefined : eyebrowVariants}
                className="mb-6 flex items-center gap-3"
              >
                <motion.span
                  className="block h-px bg-or"
                  initial={reduced ? undefined : { width: 0 }}
                  animate={reduced ? undefined : { width: 32 }}
                  transition={{ duration: 0.6, delay: 0.2, ease: SPRING }}
                  aria-hidden
                />
                <span className="text-[10px] font-semibold uppercase tracking-[0.32em] text-or">
                  {slide.eyebrow}
                </span>
              </motion.div>

              {/* H1 — Cormorant Garamond italic, two staggered lines */}
              <h1 className="mb-5">
                {slide.h1.map((line, i) => (
                  <motion.span
                    key={`${current}-${i}`}
                    variants={reduced ? undefined : h1LineVariants}
                    className="block overflow-hidden font-display font-light italic leading-[1.08] tracking-[-0.01em] text-blanc"
                    style={{
                      fontSize: 'clamp(2.75rem, 6.5vw, 5.5rem)',
                    }}
                  >
                    {line}
                  </motion.span>
                ))}
              </h1>

              {/* Sous-titre or */}
              <motion.p
                variants={reduced ? undefined : subtitleVariants}
                className="mb-10 font-display font-light italic text-or/85"
                style={{ fontSize: 'clamp(0.95rem, 1.4vw, 1.2rem)' }}
              >
                {slide.subtitle}
              </motion.p>

              {/* CTAs */}
              <motion.div
                variants={reduced ? undefined : ctaVariants}
                className="flex flex-wrap items-center gap-4"
              >
                {/* CTA primaire — or plein */}
                <Link
                  href={slide.cta1.href}
                  className={cn(
                    'group inline-flex items-center gap-2.5 rounded-sm',
                    'bg-or px-7 py-3.5',
                    'text-[10.5px] font-semibold uppercase tracking-[0.2em] text-blanc',
                    'shadow-or transition-all duration-200',
                    'hover:bg-or-dark hover:shadow-or-lg',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-or',
                    'focus-visible:ring-offset-2 focus-visible:ring-offset-noir',
                  )}
                >
                  {slide.cta1.label}
                  <ArrowUpRight
                    size={13}
                    strokeWidth={2}
                    className="transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                    aria-hidden
                  />
                </Link>

                {/* CTA secondaire — outline blanc */}
                <Link
                  href={slide.cta2.href}
                  className={cn(
                    'inline-flex items-center gap-2 rounded-sm',
                    'border border-blanc/30 bg-transparent px-7 py-3.5',
                    'text-[10.5px] font-semibold uppercase tracking-[0.2em] text-blanc/75',
                    'backdrop-blur-sm transition-all duration-200',
                    'hover:border-blanc/60 hover:bg-blanc/8 hover:text-blanc',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blanc/40',
                  )}
                >
                  {slide.cta2.label}
                </Link>
              </motion.div>

            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* ── Badge projet — bas droite ────────────────────────────────────────── */}
      <div
        className="absolute bottom-[74px] right-6 z-20 hidden md:block md:right-20 xl:right-24"
        aria-live="polite"
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={`badge-${current}`}
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0, transition: { duration: 0.4, delay: 0.75, ease: SPRING } }}
            exit={{ opacity: 0, x: -8, transition: { duration: 0.22 } }}
            className="flex flex-col items-end gap-1.5 text-right"
          >
            {/* Label discret */}
            <span className="select-none text-[8px] uppercase tracking-[0.3em] text-blanc/30">
              Projet en vedette
            </span>

            {/* Nom du projet */}
            <span className="text-[12px] font-medium tracking-wide text-blanc/70">
              {slide.projectLabel}
            </span>

            {/* Compteur 01 / 03 */}
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-[11px] tracking-[0.2em] text-or">
                {pad2(current + 1)}
              </span>
              <span className="text-blanc/20 text-[10px]">/</span>
              <span className="text-[11px] text-blanc/30 tracking-[0.15em]">
                {pad2(SLIDES.length)}
              </span>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ── Scroll indicator ────────────────────────────────────────────────── */}
      <ScrollIndicator />

      {/* ── Barre contrôles vidéo + dots ─────────────────────────────────────
           Position : absolute bottom-0, pleine largeur, h-16
           Couleur  : #0A1820/85 + backdrop-blur (inspiré teal #124460 maquette)
      ────────────────────────────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 1.0, ease: SPRING }}
        className={cn(
          'absolute inset-x-0 bottom-0 z-30 h-16',
          'flex items-center gap-4 md:gap-5',
          'border-t border-blanc/[0.07]',
          'bg-[#0A1820]/85 backdrop-blur-md',
          'px-5 md:px-10 xl:px-14',
        )}
      >

        {/* ── Bouton Play / Pause ── */}
        <button
          type="button"
          onClick={togglePlay}
          aria-label={isPlaying ? 'Mettre en pause' : 'Reprendre la lecture'}
          className={cn(
            'flex size-7 shrink-0 items-center justify-center rounded-full',
            'border border-blanc/20 text-blanc/55',
            'transition-all duration-200 hover:border-blanc/55 hover:text-blanc',
            'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-or',
          )}
        >
          {isPlaying
            ? <Pause  size={11} strokeWidth={2} aria-hidden />
            : <Play   size={11} strokeWidth={2} className="translate-x-[1px]" aria-hidden />
          }
        </button>

        {/* ── Volume ── */}
        <button
          type="button"
          onClick={toggleMute}
          aria-label={isMuted ? 'Activer le son' : 'Couper le son'}
          className={cn(
            'shrink-0 text-blanc/35 transition-colors duration-200 hover:text-blanc/80',
            'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-or rounded-sm',
          )}
        >
          {isMuted
            ? <VolumeX size={14} strokeWidth={1.5} aria-hidden />
            : <Volume2 size={14} strokeWidth={1.5} aria-hidden />
          }
        </button>

        {/* ── Séparateur ── */}
        <div className="h-5 w-px shrink-0 bg-blanc/[0.1]" aria-hidden />

        {/* ── Dots slider ── */}
        <div
          className="flex items-center gap-2"
          role="tablist"
          aria-label="Navigation des slides"
        >
          {SLIDES.map((s, i) => (
            <button
              key={s.id}
              type="button"
              role="tab"
              aria-selected={i === current}
              aria-label={`Slide ${i + 1} — ${s.projectLabel}`}
              onClick={() => goTo(i)}
              className={cn(
                'h-[3px] rounded-full transition-all duration-300 focus-visible:outline-none',
                'focus-visible:ring-1 focus-visible:ring-or',
                i === current
                  ? 'w-8 bg-or'
                  : 'w-2 bg-blanc/25 hover:bg-blanc/50',
              )}
            />
          ))}
        </div>

        {/* ── Compteur slide (mobile masqué, visible ≥ sm) ── */}
        <div className="hidden shrink-0 items-center gap-1 sm:flex" aria-hidden>
          <span className="text-[10px] font-bold tracking-[0.18em] text-or">
            {pad2(current + 1)}
          </span>
          <span className="text-[9px] text-blanc/20">/</span>
          <span className="text-[10px] text-blanc/30">{pad2(SLIDES.length)}</span>
        </div>

      </motion.div>

    </section>
  );
}
