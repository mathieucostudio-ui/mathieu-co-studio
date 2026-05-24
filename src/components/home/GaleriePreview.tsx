'use client';

/**
 * GaleriePreview — 4 projets, fond beige #F2EEE8
 *
 * Maquette SVG y=1520–2160 (h=640) :
 *   • fond #F2EEE8 (≈ beige)
 *   • Header  : titre gauche (x=80, y=1680.5, w=352, h=71)
 *               CTA noir    (x=1032, y=1696, w=160, h=40)
 *   • 4 cartes asymétriques à y=1868 : [380, 260, 260, 380]px, gap=12px
 *     – fond (couleurs SVG) : #C7DAEA / #CCD1D6 / #D1C7B5 / #CCDAC7
 *     – hauteur 360px (dépassent légèrement sur la section suivante)
 *
 * Images : placeholders colorés en attendant les photos réelles.
 *          Remplacer les `div` par `<Image>` next/image quand disponibles.
 */

import { memo } from 'react';
import { motion, useReducedMotion, type Variants } from 'framer-motion';
import { ArrowUpRight, MapPin } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { cn } from '@/lib/utils';

// ─────────────────────────────────────────────────────────────────────────────
//  Données projets
// ─────────────────────────────────────────────────────────────────────────────
interface Project {
  id: string;
  title: string;
  category: string;
  location: string;
  year: string;
  imageBg: string;   // couleur placeholder SVG
  href: string;
  featured: boolean; // true = carte large (flex-[19])
}

const PROJECTS: Project[] = [
  {
    id: 'villa-lagon',
    title: 'Villa Bord de Lagon',
    category: 'Architecture & Intérieur',
    location: 'Cotonou',
    year: '2025',
    imageBg: 'bg-[#C7DAEA]',   // slate-blue SVG
    href: '/galerie/villa-bord-de-lagon',
    featured: true,
  },
  {
    id: 'residence-fidjrosse',
    title: 'Résidence Fidjrossè',
    category: 'Design & Décoration',
    location: 'Cotonou',
    year: '2024',
    imageBg: 'bg-[#CCD1D6]',   // cool-gray SVG
    href: '/galerie/residence-fidjrosse',
    featured: false,
  },
  {
    id: 'appartement-cadjehoun',
    title: 'Appartement Cadjèhoun',
    category: 'Rénovation complète',
    location: 'Cotonou',
    year: '2024',
    imageBg: 'bg-[#D1C7B5]',   // warm-tan SVG
    href: '/galerie/appartement-cadjehoun',
    featured: false,
  },
  {
    id: 'hotel-ganhi',
    title: 'Hôtel Boutique Ganhi',
    category: 'Hôtellerie & Prestige',
    location: 'Cotonou',
    year: '2025',
    imageBg: 'bg-[#CCDAC7]',   // sage-green SVG
    href: '/galerie/hotel-boutique-ganhi',
    featured: true,
  },
];

// ─────────────────────────────────────────────────────────────────────────────
//  Animation variants
// ─────────────────────────────────────────────────────────────────────────────
const SPRING: [number, number, number, number] = [0.16, 1, 0.3, 1];

const headerRow: Variants = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.1 } },
};

const fadeUp: Variants = {
  hidden:  { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.65, ease: SPRING } },
};

const gridContainer: Variants = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.12, delayChildren: 0.05 } },
};

const cardReveal: Variants = {
  hidden:  { opacity: 0, y: 36 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.75, ease: SPRING } },
};

// ─────────────────────────────────────────────────────────────────────────────
//  ProjectCard — mémoïsé
// ─────────────────────────────────────────────────────────────────────────────
const ProjectCard = memo(function ProjectCard({
  project,
  reduced,
}: {
  project: Project;
  reduced: boolean | null;
}) {
  return (
    <motion.article
      variants={reduced ? undefined : cardReveal}
      className={cn(
        project.featured ? 'flex-[19]' : 'flex-[13]',
        'group relative min-w-0 overflow-hidden rounded-sm',
        'h-[280px] md:h-[320px] lg:h-[360px]',
        'transition-shadow duration-300 hover:shadow-modal',
      )}
    >
      <Link
        href={project.href}
        className="block h-full w-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-or focus-visible:ring-offset-2"
        aria-label={`Voir le projet : ${project.title}`}
      >
        {/* ── Placeholder image (à remplacer par <Image>) ── */}
        <div
          className={cn(
            'absolute inset-0 transition-transform duration-700 ease-out-expo',
            'group-hover:scale-[1.04]',
            project.imageBg,
          )}
          aria-hidden
        />

        {/* ── Overlay gradient bas→haut ── */}
        <div
          className="absolute inset-0 bg-gradient-to-t from-noir/75 via-noir/20 to-transparent"
          aria-hidden
        />

        {/* ── Hover : overlay léger ── */}
        <div
          className="absolute inset-0 bg-noir/0 transition-colors duration-300 group-hover:bg-noir/10"
          aria-hidden
        />

        {/* ── Catégorie top-left ── */}
        <span
          className={cn(
            'absolute left-4 top-4',
            'rounded-sm bg-blanc/10 px-2.5 py-1 backdrop-blur-sm',
            'text-[9px] font-semibold uppercase tracking-[0.25em] text-blanc/75',
          )}
        >
          {project.category}
        </span>

        {/* ── Info bas de carte ── */}
        <div className="absolute inset-x-0 bottom-0 p-5 md:p-6">
          {/* Numéro projet top de l'info */}
          <p className="mb-1 text-[9px] font-bold tracking-[0.3em] text-or/70">
            {project.year}
          </p>

          {/* Titre */}
          <h3
            className={cn(
              'font-display font-light italic leading-tight text-blanc',
              'transition-transform duration-300 group-hover:-translate-y-0.5',
            )}
            style={{ fontSize: 'clamp(1.05rem, 1.5vw, 1.3rem)' }}
          >
            {project.title}
          </h3>

          {/* Localisation + flèche */}
          <div className="mt-2 flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-[11px] text-blanc/50">
              <MapPin size={10} strokeWidth={1.5} aria-hidden />
              {project.location}
            </span>

            {/* Flèche reveal au hover */}
            <span
              className={cn(
                'flex size-7 items-center justify-center rounded-full',
                'border border-blanc/20 bg-blanc/10 text-blanc/60',
                'opacity-0 transition-all duration-300',
                'group-hover:opacity-100 group-hover:translate-x-0',
                '-translate-x-2',
              )}
              aria-hidden
            >
              <ArrowUpRight size={13} strokeWidth={1.5} />
            </span>
          </div>
        </div>
      </Link>
    </motion.article>
  );
});

// ─────────────────────────────────────────────────────────────────────────────
//  GaleriePreview — composant principal
// ─────────────────────────────────────────────────────────────────────────────
export function GaleriePreview() {
  const reduced = useReducedMotion();

  return (
    <section
      className="w-full bg-beige"
      aria-labelledby="galerie-heading"
    >
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="mx-auto max-w-7xl px-6 pt-16 pb-10 md:px-20 md:pt-20 md:pb-12 xl:px-24">
        <motion.div
          variants={reduced ? undefined : headerRow}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          className="flex items-end justify-between gap-6"
        >
          {/* Gauche : eyebrow + titre (SVG : w=352, h=71) */}
          <motion.div variants={reduced ? undefined : fadeUp}>
            <div className="mb-3 flex items-center gap-3">
              <span className="block h-px w-6 bg-or/55" aria-hidden />
              <span className="text-[9px] font-semibold uppercase tracking-[0.36em] text-or/75">
                Nos réalisations
              </span>
            </div>
            <h2
              id="galerie-heading"
              className="font-display font-light italic leading-tight text-noir"
              style={{ fontSize: 'clamp(1.9rem, 3vw, 2.6rem)' }}
            >
              Projets Récents
            </h2>
          </motion.div>

          {/* CTA noir (SVG : x=1032, fill=#151515, w=160, h=40) */}
          <motion.div variants={reduced ? undefined : fadeUp} className="shrink-0">
            <Link
              href="/galerie"
              className={cn(
                'inline-flex items-center gap-2 rounded-sm',
                'bg-noir px-5 py-2.5',
                'text-[9.5px] font-semibold uppercase tracking-[0.22em] text-blanc',
                'shadow-card transition-all duration-200 hover:bg-noir-soft',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-or',
              )}
            >
              Toute la galerie
              <ArrowUpRight size={11} strokeWidth={2} aria-hidden />
            </Link>
          </motion.div>
        </motion.div>
      </div>

      {/* ── Grille asymétrique [380 / 260 / 260 / 380] px ───────────────────
           SVG : gap=12px, hauteur=360px
           CSS : flex + flex-[19|13] + gap-3 (12px)
      ─────────────────────────────────────────────────────────────────────── */}
      <div className="px-6 pb-16 md:px-20 md:pb-20 xl:px-24">
        <motion.div
          variants={reduced ? undefined : gridContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          className="flex gap-3"
          role="list"
          aria-label="Nos quatre projets récents"
        >
          {/* Mobile : affiche uniquement featured sur 1 col, ou 2 col grid */}
          {PROJECTS.map((project) => (
            <div
              key={project.id}
              role="listitem"
              className={cn(
                // Mobile : masque les non-featured pour garder 2 cartes
                !project.featured && 'hidden sm:block',
                'min-w-0',
                project.featured ? 'flex-[19]' : 'flex-[13]',
              )}
              style={{ flex: project.featured ? '19 1 0%' : '13 1 0%' }}
            >
              <ProjectCard project={project} reduced={reduced} />
            </div>
          ))}
        </motion.div>

        {/* Mobile : grille 2×2 (toutes les cartes) */}
        <motion.div
          variants={reduced ? undefined : gridContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          className="mt-3 grid grid-cols-2 gap-3 sm:hidden"
          aria-hidden
        >
          {PROJECTS.filter((p) => !p.featured).map((project) => (
            <ProjectCard key={`mob-${project.id}`} project={project} reduced={reduced} />
          ))}
        </motion.div>
      </div>
    </section>
  );
}
