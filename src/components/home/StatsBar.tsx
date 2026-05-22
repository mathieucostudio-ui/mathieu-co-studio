'use client';

/**
 * StatsBar — Bande noire pleine largeur avec 3 chiffres clés
 *
 * Maquette SVG y=860, h=100 :
 *   • fond #151515
 *   • 3 séparateurs verticaux (blanc/10) à x=355 / x=724 / x=1084
 *   • Numéro : Cormorant italic, text-or, ~2.75rem
 *   • Label   : 10px uppercase tracking-[0.28em] blanc/45
 */

import { memo } from 'react';
import { motion, useReducedMotion, type Variants } from 'framer-motion';
import { cn } from '@/lib/utils';

// ─────────────────────────────────────────────────────────────────────────────
//  Données
// ─────────────────────────────────────────────────────────────────────────────
interface Stat {
  value: string;
  label: string;
  sublabel: string;
}

const STATS: Stat[] = [
  { value: '8+',   label: 'Années',    sublabel: "d'Expérience" },
  { value: '120+', label: 'Projets',   sublabel: 'Réalisés'     },
  { value: '15+',  label: 'Pays',      sublabel: "d'Influence"  },
];

// ─────────────────────────────────────────────────────────────────────────────
//  Animation variants
// ─────────────────────────────────────────────────────────────────────────────
const SPRING: [number, number, number, number] = [0.16, 1, 0.3, 1];

const containerVariants: Variants = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
};

const itemVariants: Variants = {
  hidden:  { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: SPRING } },
};

const lineVariants: Variants = {
  hidden:  { scaleY: 0 },
  visible: { scaleY: 1, transition: { duration: 0.5, delay: 0.3, ease: SPRING } },
};

// ─────────────────────────────────────────────────────────────────────────────
//  StatItem — mémoïsé pour éviter les re-renders inutiles
// ─────────────────────────────────────────────────────────────────────────────
const StatItem = memo(function StatItem({
  stat,
  isLast,
  reduced,
}: {
  stat: Stat;
  isLast: boolean;
  reduced: boolean | null;
}) {
  return (
    <div className="relative flex flex-1 items-stretch">
      {/* ── Contenu ── */}
      <motion.div
        variants={reduced ? undefined : itemVariants}
        className={cn(
          'flex flex-1 flex-col items-center justify-center',
          'gap-1 py-7 md:py-8 lg:py-9',
          'text-center',
        )}
      >
        {/* Valeur numérique */}
        <span
          className="block font-display font-light italic leading-none text-or"
          style={{ fontSize: 'clamp(2rem, 3.5vw, 2.75rem)' }}
          aria-label={`${stat.value} ${stat.label} ${stat.sublabel}`}
        >
          {stat.value}
        </span>

        {/* Label sur deux lignes */}
        <span className="flex flex-col items-center gap-[1px]" aria-hidden>
          <span className="text-[9.5px] font-semibold uppercase tracking-[0.3em] text-blanc/55 md:text-[10px] md:tracking-[0.32em]">
            {stat.label}
          </span>
          <span className="text-[9px] uppercase tracking-[0.22em] text-blanc/30 md:text-[9.5px]">
            {stat.sublabel}
          </span>
        </span>
      </motion.div>

      {/* ── Séparateur vertical — sauf dernier item ── */}
      {!isLast && (
        <motion.div
          variants={reduced ? undefined : lineVariants}
          style={{ originY: '50%' }}
          className="absolute right-0 top-1/2 h-12 w-px -translate-y-1/2 bg-blanc/[0.07]"
          aria-hidden
        />
      )}
    </div>
  );
});

// ─────────────────────────────────────────────────────────────────────────────
//  StatsBar — composant principal
// ─────────────────────────────────────────────────────────────────────────────
export function StatsBar() {
  const reduced = useReducedMotion();

  return (
    <section
      className="w-full bg-noir"
      aria-label="Chiffres clés Mathieu&Co Studio"
    >
      {/* Ligne or micro en haut — frontière visuelle avec la section hero */}
      <div className="h-px w-full bg-gradient-to-r from-transparent via-or/25 to-transparent" aria-hidden />

      <div className="mx-auto max-w-7xl px-0 md:px-0">
        <motion.div
          variants={reduced ? undefined : containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          className="flex items-stretch"
        >
          {STATS.map((stat, i) => (
            <StatItem
              key={stat.value}
              stat={stat}
              isLast={i === STATS.length - 1}
              reduced={reduced}
            />
          ))}
        </motion.div>
      </div>

      {/* Ligne basse subtile */}
      <div className="h-px w-full bg-blanc/[0.04]" aria-hidden />
    </section>
  );
}
