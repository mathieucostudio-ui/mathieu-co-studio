'use client';

/**
 * AProposClient — sections animées de la page /a-propos
 *
 * Sections :
 *   1. Fondateur — portrait + biographie
 *   2. 3 Piliers valeurs
 *   3. Timeline 2016–2024
 *   4. CTA final
 */

import { useRef }            from 'react';
import { motion, useInView } from 'framer-motion';
import { ArrowUpRight }      from 'lucide-react';
import Link                  from 'next/link';
import { cn }                from '@/lib/utils';

// ─── Animation helpers ────────────────────────────────────────────────────────

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  show:   { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 110, damping: 20 } },
};

const stagger = {
  hidden: {},
  show:   { transition: { staggerChildren: 0.1 } },
};

// ─── Data ─────────────────────────────────────────────────────────────────────

const PILIERS = [
  {
    num:    '01',
    titre:  'Conception sur-mesure',
    desc:   'Chaque projet commence par une écoute profonde. Nous refusons les solutions génériques — chaque espace est conçu pour son habitant, ses usages et son contexte culturel.',
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden>
        <path d="M3 19L11 3l8 16M6 13h10" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    num:    '02',
    titre:  'Excellence artisanale',
    desc:   'Nous collaborons avec des artisans et fournisseurs rigoureusement sélectionnés. La qualité d\'exécution est notre signature — visible dans chaque détail, chaque finition.',
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden>
        <path d="M11 2l2.6 5.3 5.8.8-4.2 4.1 1 5.8L11 15.3 5.8 18l1-5.8L2.6 8.1l5.8-.8L11 2z" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    num:    '03',
    titre:  'Durabilité & impact',
    desc:   'Concevoir pour demain. Matériaux locaux, circuits courts, pérennité des choix — nous intégrons la responsabilité environnementale et sociale dans chaque décision créative.',
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden>
        <path d="M12 22V12M12 12C12 7 16 4 20 4c0 4-2 8-8 8zM12 12C12 7 8 4 4 4c0 4 2 8 8 8z" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
] as const;

const TIMELINE = [
  {
    annee: '2016',
    titre: 'Fondation à Cotonou',
    desc:  'Mathieu&Co Studio voit le jour dans un petit atelier de Haie Vive, avec une vision simple : rendre l\'architecture intérieure accessible en Afrique de l\'Ouest.',
  },
  {
    annee: '2018',
    titre: 'Premier grand projet',
    desc:  'Refonte complète d\'un hôtel boutique à Cotonou — 42 chambres, espaces communs, restaurant. Un tournant qui installe la signature du studio.',
  },
  {
    annee: '2020',
    titre: 'Ouverture boutique design',
    desc:  'Lancement de la boutique en ligne, première en Afrique de l\'Ouest dédiée à la décoration contemporaine avec livraison régionale.',
  },
  {
    annee: '2022',
    titre: 'Expansion internationale',
    desc:  'Premiers projets hors Bénin — Sénégal, Côte d\'Ivoire, Maroc. Le studio s\'installe comme une référence panafricaine de l\'architecture intérieure.',
  },
  {
    annee: '2024',
    titre: '120+ projets livrés',
    desc:  'Avec une équipe de 8 talents et plus de 120 réalisations, Mathieu&Co Studio entre dans une nouvelle ère : plus exigeante, plus créative, plus responsable.',
  },
] as const;

// ─── AProposClient ────────────────────────────────────────────────────────────

export function AProposClient() {
  const foRef       = useRef<HTMLDivElement>(null);
  const piliersRef  = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);
  const ctaRef      = useRef<HTMLDivElement>(null);

  const foInView       = useInView(foRef,       { once: true, margin: '-60px' });
  const piliersInView  = useInView(piliersRef,  { once: true, margin: '-60px' });
  const timelineInView = useInView(timelineRef, { once: true, margin: '-60px' });
  const ctaInView      = useInView(ctaRef,      { once: true, margin: '-60px' });

  return (
    <>
      {/* ── Section Fondateur ──────────────────────────────────────────────── */}
      <section
        style={{ backgroundColor: '#1E1810' }}
        aria-label="Le fondateur"
      >
        <div className="mx-auto max-w-[1440px] px-6 md:px-10 xl:px-16 py-20">
          <motion.div
            ref={foRef}
            variants={stagger}
            initial="hidden"
            animate={foInView ? 'show' : 'hidden'}
            className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-12 lg:gap-20 items-start"
          >
            {/* Portrait placeholder */}
            <motion.div variants={fadeUp} className="relative">
              <div
                className="relative w-full aspect-[3/4] max-w-[300px] mx-auto lg:mx-0 rounded-sm overflow-hidden"
                style={{ backgroundColor: '#1E3A4A' }}
              >
                {/* Portrait mockup */}
                <svg
                  className="absolute inset-0 w-full h-full opacity-[0.15]"
                  viewBox="0 0 300 400"
                  fill="none"
                  preserveAspectRatio="xMidYMid slice"
                  aria-hidden
                >
                  {/* Person silhouette */}
                  <circle cx="150" cy="130" r="55" stroke="#C8900A" strokeWidth="0.8" fill="none" />
                  <path
                    d="M60 400c0-66.3 40.3-120 90-120s90 53.7 90 120"
                    stroke="#C8900A"
                    strokeWidth="0.8"
                    fill="none"
                  />
                  <circle cx="150" cy="130" r="35" stroke="#C8900A" strokeWidth="0.5" fill="none" />
                </svg>
                {/* Texture lines */}
                <div
                  className="absolute inset-0 opacity-5"
                  style={{
                    backgroundImage: 'repeating-linear-gradient(0deg, #C8900A, #C8900A 1px, transparent 1px, transparent 32px)',
                  }}
                  aria-hidden
                />
                {/* Label */}
                <div className="absolute bottom-4 left-4 text-[8.5px] font-semibold uppercase tracking-[0.3em] text-blanc/30">
                  Mathieu K. · Fondateur
                </div>
              </div>

              {/* Gold accent bar */}
              <div
                className="absolute -left-3 top-8 h-16 w-0.5"
                style={{ backgroundColor: '#B8893A', opacity: 0.7 }}
                aria-hidden
              />
            </motion.div>

            {/* Bio */}
            <motion.div variants={fadeUp} className="flex flex-col gap-7">
              <div>
                <div className="mb-4 flex items-center gap-3">
                  <span className="block h-px w-6 shrink-0 bg-or/60" aria-hidden />
                  <span className="text-[9px] font-semibold uppercase tracking-[0.34em] text-or/70">
                    Le fondateur
                  </span>
                </div>
                <h2
                  className="font-display font-light italic text-white"
                  style={{ fontSize: 'clamp(1.8rem, 3vw, 2.8rem)', lineHeight: 1.12 }}
                >
                  Une vision née<br />
                  <span style={{ color: 'rgba(255,255,255,0.32)', WebkitTextStroke: '1px rgba(184,137,58,0.4)' }}>
                    entre Cotonou et le monde
                  </span>
                </h2>
              </div>

              <div className="space-y-4 text-[12.5px] leading-[1.85] text-blanc/50">
                <p>
                  Architecte d&apos;intérieur de formation, Mathieu a forgé son regard en Europe et
                  en Asie avant de revenir en Afrique de l&apos;Ouest avec une conviction profonde :
                  le continent méritait un studio de design ancré dans sa réalité, ses matériaux
                  et sa culture, sans compromis sur l&apos;exigence internationale.
                </p>
                <p>
                  Fondé en 2016 dans un atelier de Haie Vive à Cotonou, Mathieu&amp;Co Studio est
                  devenu en huit ans une référence reconnue — 120+ projets livrés, des clients
                  privés aux hôtels boutiques, des institutions aux commerces de prestige.
                </p>
                <p>
                  Sa méthode repose sur trois piliers : l&apos;écoute absolue du client, la précision
                  du détail et la conviction que chaque espace a une âme à révéler.
                </p>
              </div>

              {/* Stats inline */}
              <div className="flex flex-wrap gap-8 pt-2">
                {[
                  { val: '8+', label: 'Années d\'expérience' },
                  { val: '120+', label: 'Projets livrés' },
                  { val: '15+', label: 'Pays couverts' },
                ].map((s) => (
                  <div key={s.label}>
                    <span
                      className="font-display font-light italic block"
                      style={{ fontSize: 'clamp(1.8rem, 2.5vw, 2.4rem)', color: 'rgba(184,137,58,0.75)', lineHeight: 1 }}
                    >
                      {s.val}
                    </span>
                    <span className="text-[9.5px] font-semibold uppercase tracking-[0.24em] text-blanc/35 mt-1 block">
                      {s.label}
                    </span>
                  </div>
                ))}
              </div>

              {/* Signature line */}
              <div className="flex items-center gap-4 pt-2">
                <div className="h-px w-12 bg-or/40" aria-hidden />
                <span className="font-display italic text-[13px] text-or/60">
                  Mathieu K.
                </span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── Section Piliers ────────────────────────────────────────────────── */}
      <section className="bg-beige" aria-label="Nos valeurs">
        <div className="mx-auto max-w-[1440px] px-6 md:px-10 xl:px-16 py-20">
          {/* Header */}
          <div className="mb-14">
            <div className="mb-3 flex items-center gap-3">
              <span className="block h-px w-6 shrink-0 bg-or/70" aria-hidden />
              <span className="text-[9px] font-semibold uppercase tracking-[0.34em] text-or/80">
                Philosophie
              </span>
            </div>
            <h2
              className="font-display font-light italic text-noir"
              style={{ fontSize: 'clamp(1.8rem, 2.8vw, 2.6rem)' }}
            >
              3 piliers qui guident chaque projet
            </h2>
          </div>

          {/* Grid */}
          <motion.div
            ref={piliersRef}
            variants={stagger}
            initial="hidden"
            animate={piliersInView ? 'show' : 'hidden'}
            className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-0 md:divide-x divide-gris-cl"
          >
            {PILIERS.map((p) => (
              <PilierCard key={p.num} pilier={p} />
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Section Timeline ───────────────────────────────────────────────── */}
      <section className="bg-beige2" aria-label="Notre histoire">
        <div className="mx-auto max-w-[1440px] px-6 md:px-10 xl:px-16 py-20">
          {/* Header */}
          <div className="mb-14">
            <div className="mb-3 flex items-center gap-3">
              <span className="block h-px w-6 shrink-0 bg-or/70" aria-hidden />
              <span className="text-[9px] font-semibold uppercase tracking-[0.34em] text-or/80">
                Chronologie
              </span>
            </div>
            <h2
              className="font-display font-light italic text-noir"
              style={{ fontSize: 'clamp(1.8rem, 2.8vw, 2.6rem)' }}
            >
              8 ans d&apos;histoire
            </h2>
          </div>

          {/* Steps */}
          <motion.div
            ref={timelineRef}
            variants={stagger}
            initial="hidden"
            animate={timelineInView ? 'show' : 'hidden'}
            className="relative flex flex-col gap-0"
          >
            {/* Vertical line desktop */}
            <div
              className="hidden md:block absolute left-[84px] top-4 bottom-4 w-px bg-gris-cl"
              aria-hidden
            />

            {TIMELINE.map((item, idx) => (
              <TimelineItem key={item.annee} item={item} isLast={idx === TIMELINE.length - 1} />
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── CTA Final ──────────────────────────────────────────────────────── */}
      <section
        className="overflow-hidden"
        style={{ backgroundColor: '#151515' }}
        aria-label="Travailler avec nous"
      >
        <div className="mx-auto max-w-[1440px] px-6 md:px-10 xl:px-16 py-24">
          <motion.div
            ref={ctaRef}
            variants={stagger}
            initial="hidden"
            animate={ctaInView ? 'show' : 'hidden'}
            className="flex flex-col md:flex-row md:items-center md:justify-between gap-10 md:gap-16"
          >
            <motion.div variants={fadeUp} className="md:max-w-[540px]">
              <div className="mb-4 flex items-center gap-3">
                <span className="block h-px w-6 shrink-0 bg-or/70" aria-hidden />
                <span className="text-[9px] font-semibold uppercase tracking-[0.34em] text-or/80">
                  Collaborer
                </span>
              </div>
              <h2
                className="font-display font-light italic text-white"
                style={{ fontSize: 'clamp(2rem, 3.5vw, 3rem)', lineHeight: 1.15 }}
              >
                Construisons quelque chose<br />
                <span style={{ color: 'rgba(255,255,255,0.35)', WebkitTextStroke: '1px rgba(184,137,58,0.4)' }}>
                  d&apos;extraordinaire ensemble.
                </span>
              </h2>
              <p className="mt-5 text-[12.5px] leading-relaxed text-white/45 max-w-[440px]">
                Que ce soit pour un projet résidentiel, commercial ou une simple consultation,
                nous sommes à votre écoute.
              </p>
            </motion.div>

            <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-4 shrink-0">
              <Link
                href="/contact"
                className={cn(
                  'group inline-flex items-center gap-3 rounded-sm px-8 py-4',
                  'text-[10.5px] font-semibold uppercase tracking-[0.22em] text-blanc',
                  'bg-or transition-all duration-300 hover:bg-or-dark active:scale-[0.98]',
                )}
              >
                Démarrer un projet
                <ArrowUpRight
                  size={14}
                  strokeWidth={2}
                  className="transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                  aria-hidden
                />
              </Link>
              <Link
                href="/galerie"
                className={cn(
                  'inline-flex items-center gap-3 rounded-sm px-8 py-4',
                  'text-[10.5px] font-semibold uppercase tracking-[0.22em] text-blanc/70',
                  'border border-blanc/20 transition-all duration-300',
                  'hover:border-blanc/40 hover:text-blanc active:scale-[0.98]',
                )}
              >
                Voir nos projets
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </>
  );
}

// ─── PilierCard ───────────────────────────────────────────────────────────────

function PilierCard({ pilier }: { pilier: (typeof PILIERS)[number] }) {
  return (
    <motion.div
      variants={fadeUp}
      className="flex flex-col gap-5 px-0 md:px-8 xl:px-10 py-8 md:py-0 md:first:pl-0 md:last:pr-0 border-b md:border-b-0 border-gris-cl last:border-b-0"
    >
      {/* Icon */}
      <div
        className="flex size-11 items-center justify-center rounded-full border border-or/30 text-or/70"
      >
        {pilier.icon}
      </div>

      {/* Num + title */}
      <div>
        <span
          className="font-display font-light italic text-[2rem] leading-none"
          style={{ color: 'rgba(184,137,58,0.25)' }}
          aria-hidden
        >
          {pilier.num}
        </span>
        <h3 className="text-[14px] font-semibold text-noir mt-1">
          {pilier.titre}
        </h3>
      </div>

      <p className="text-[11.5px] text-gris leading-relaxed">
        {pilier.desc}
      </p>
    </motion.div>
  );
}

// ─── TimelineItem ─────────────────────────────────────────────────────────────

function TimelineItem({
  item,
  isLast,
}: {
  item:   (typeof TIMELINE)[number];
  isLast: boolean;
}) {
  return (
    <motion.div
      variants={fadeUp}
      className={cn(
        'relative flex items-start gap-8 py-8',
        !isLast && 'border-b border-gris-cl/60',
      )}
    >
      {/* Year */}
      <div className="relative z-10 shrink-0 w-[72px]">
        <span
          className="font-display font-light italic text-[1.05rem] text-or/70"
        >
          {item.annee}
        </span>
      </div>

      {/* Dot */}
      <div
        className="relative z-10 mt-[6px] shrink-0 size-2.5 rounded-full border-2 border-or/60 bg-beige2"
        aria-hidden
      />

      {/* Content */}
      <div className="flex-1 min-w-0 pb-2">
        <h3 className="text-[13.5px] font-semibold text-noir mb-2">
          {item.titre}
        </h3>
        <p className="text-[11.5px] text-gris leading-relaxed max-w-[540px]">
          {item.desc}
        </p>
      </div>
    </motion.div>
  );
}
