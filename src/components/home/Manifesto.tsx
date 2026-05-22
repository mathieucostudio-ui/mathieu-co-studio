'use client';

/**
 * Manifesto — Citation fondateur, fond beige2 (#EAE3DA)
 *
 * Maquette SVG y=2760, h=360 :
 *   • fond #EAE3DA (beige2)
 *   • Monogramme "M" décoratif bg-left-bottom, opacity 0.35, fill beige3 (#DAD1C6)
 *   • Petite étiquette "M" tracée en paths (≈ 7px) → eyebrow label
 *   • Citation principale : Cormorant italic, grande taille
 *   • Attribution : trait or + nom + titre fondateur
 */

import { useReducedMotion, motion, type Variants } from 'framer-motion';
import { cn } from '@/lib/utils';

// ─────────────────────────────────────────────────────────────────────────────
//  Contenu éditorial
// ─────────────────────────────────────────────────────────────────────────────
const QUOTE =
  'Nous ne décorons pas des espaces — nous composons\ndes œuvres destinées à être vécues.';

const AUTHOR = {
  name:  'Mathieu CODJO',
  title: 'Fondateur & Directeur Artistique — Mathieu&Co Studio',
};

// ─────────────────────────────────────────────────────────────────────────────
//  Animation variants
// ─────────────────────────────────────────────────────────────────────────────
const SPRING: [number, number, number, number] = [0.16, 1, 0.3, 1];

const containerVariants: Variants = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.14, delayChildren: 0.05 } },
};

const fadeUp: Variants = {
  hidden:  { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.75, ease: SPRING } },
};

const lineGrow: Variants = {
  hidden:  { scaleX: 0 },
  visible: { scaleX: 1, transition: { duration: 0.6, delay: 0.2, ease: SPRING } },
};

// ─────────────────────────────────────────────────────────────────────────────
//  Manifesto
// ─────────────────────────────────────────────────────────────────────────────
export function Manifesto() {
  const reduced = useReducedMotion();

  return (
    <section
      className="relative w-full overflow-hidden bg-beige2"
      aria-label="Manifeste Mathieu&Co Studio"
    >
      {/* ── Monogramme "M" décoratif (inspiré du watermark SVG) ─────────────── */}
      <div
        className={cn(
          'pointer-events-none absolute bottom-0 left-4 select-none',
          'font-display font-light italic leading-none text-beige3',
          'translate-y-[18%] opacity-35',
        )}
        style={{ fontSize: 'clamp(14rem, 28vw, 22rem)' }}
        aria-hidden
      >
        M
      </div>

      {/* ── Ornement or haut-centre (trait horizontal) ─────────────────────── */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-or/20 to-transparent" aria-hidden />

      {/* ── Contenu ─────────────────────────────────────────────────────────── */}
      <div className="relative z-10 mx-auto max-w-4xl px-6 py-24 md:px-20 md:py-28 xl:px-24 xl:py-32">
        <motion.div
          variants={reduced ? undefined : containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          className="flex flex-col items-center text-center"
        >

          {/* ── Eyebrow ── */}
          <motion.div
            variants={reduced ? undefined : fadeUp}
            className="mb-10 flex items-center gap-4"
          >
            <motion.span
              variants={reduced ? undefined : lineGrow}
              style={{ originX: 'right' }}
              className="block h-px w-8 bg-or/60"
              aria-hidden
            />
            <span className="text-[9.5px] font-semibold uppercase tracking-[0.35em] text-or/70">
              Manifeste
            </span>
            <motion.span
              variants={reduced ? undefined : lineGrow}
              style={{ originX: 'left' }}
              className="block h-px w-8 bg-or/60"
              aria-hidden
            />
          </motion.div>

          {/* ── Guillemet ouvrant décoratif ── */}
          <motion.span
            variants={reduced ? undefined : fadeUp}
            className={cn(
              'mb-6 block select-none font-display font-light italic',
              'leading-none text-or/30',
            )}
            style={{ fontSize: 'clamp(5rem, 10vw, 8rem)', lineHeight: 0.7 }}
            aria-hidden
          >
            «
          </motion.span>

          {/* ── Citation ── */}
          <motion.blockquote
            variants={reduced ? undefined : fadeUp}
            className={cn(
              'font-display font-light italic text-noir/80',
              'leading-[1.45] tracking-tight',
            )}
            style={{ fontSize: 'clamp(1.45rem, 2.8vw, 2.2rem)' }}
          >
            {QUOTE.split('\n').map((line, i) => (
              <span key={i}>
                {line}
                {i < QUOTE.split('\n').length - 1 && <br />}
              </span>
            ))}
          </motion.blockquote>

          {/* ── Séparateur ── */}
          <motion.div
            variants={reduced ? undefined : fadeUp}
            className="my-10 flex items-center gap-5"
            aria-hidden
          >
            <div className="h-px w-16 bg-or/30" />
            {/* Losange or */}
            <svg width="8" height="8" viewBox="0 0 8 8" fill="none" aria-hidden>
              <path d="M4 0L8 4L4 8L0 4L4 0Z" fill="#B8893A" opacity="0.6" />
            </svg>
            <div className="h-px w-16 bg-or/30" />
          </motion.div>

          {/* ── Attribution ── */}
          <motion.footer variants={reduced ? undefined : fadeUp}>
            <p className="text-[12px] font-semibold uppercase tracking-[0.28em] text-noir">
              {AUTHOR.name}
            </p>
            <p className="mt-1 text-[10.5px] uppercase tracking-[0.2em] text-gris">
              {AUTHOR.title}
            </p>
          </motion.footer>

        </motion.div>
      </div>

      {/* Ligne basse */}
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-or/20 to-transparent" aria-hidden />
    </section>
  );
}
