'use client';

/**
 * ServicesGrid — 4 cartes services, fond blanc
 *
 * Maquette SVG y=960–1520 (h=560) :
 *   • fond blanc
 *   • Header  : gauche (x=80,  y=1040, w=379, h=116) eyebrow + titre
 *               droite (x=1059, y=1040, w=440, h=114) texte + CTA outline (w=159)
 *   • 4 cartes flush (320×320px), gap-px, bg alternés beige→beige2→beige3→blanc
 *   • Badge numéro : 40×40 blanc/60 à (card_x+36, card_y+65) dans chaque carte
 */

import { memo } from 'react';
import { motion, useReducedMotion, type Variants } from 'framer-motion';
import { Check, ArrowUpRight } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { cn } from '@/lib/utils';

// ─────────────────────────────────────────────────────────────────────────────
//  Données
// ─────────────────────────────────────────────────────────────────────────────
interface Service {
  number: string;
  title: string[];   // lignes séparées
  subtitle: string;
  description: string;
  features: string[];
  href: string;
  cardBg: string;
}

const SERVICES: Service[] = [
  {
    number: '01',
    title: ["Architecture", "d'Intérieur"],
    subtitle: 'Design spatial',
    description:
      "Conception et réalisation d'espaces résidentiels et commerciaux de prestige, à Cotonou et au-delà.",
    features: [
      'Plans & rendus 3D',
      'Suivi de chantier',
      'Mobilier sur mesure',
      "Design d'éclairage",
    ],
    href: '/services#architecture',
    cardBg: 'bg-beige',
  },
  {
    number: '02',
    title: ['Design &', 'Décoration'],
    subtitle: 'Mise en scène',
    description:
      "Sélection exclusive de mobilier, de matériaux rares et d’objets d’art pour sublimer chaque pièce.",
    features: [
      'Styling intérieur complet',
      'Sourcing matériaux rares',
      'Scénographie',
      'Palette chromatique',
    ],
    href: '/services#decoration',
    cardBg: 'bg-beige2',
  },
  {
    number: '03',
    title: ['Gestion de', 'Projet'],
    subtitle: "Maîtrise d'œuvre",
    description:
      'Pilotage intégral de vos travaux, du premier concept à la livraison clé-en-main.',
    features: [
      'Planification & budget',
      'Coordination des corps de métier',
      'Contrôle qualité',
      'Livraison clé-en-main',
    ],
    href: '/services#gestion',
    cardBg: 'bg-beige3',
  },
  {
    number: '04',
    title: ['Boutique', 'en Ligne'],
    subtitle: "Pièces d'exception",
    description:
      'Artisanat africain contemporain et design international, curatés par nos artistes et livrés à domicile.',
    features: [
      'Artisanat africain',
      'Éditions limitées',
      'Livraison à Cotonou',
      'Curation experte',
    ],
    href: '/boutique',
    cardBg: 'bg-blanc',
  },
];

// ─────────────────────────────────────────────────────────────────────────────
//  Animation variants
// ─────────────────────────────────────────────────────────────────────────────
const SPRING: [number, number, number, number] = [0.16, 1, 0.3, 1];

const headerContainer: Variants = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.1 } },
};

const fadeUp: Variants = {
  hidden:  { opacity: 0, y: 22 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.65, ease: SPRING } },
};

const gridContainer: Variants = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.1, delayChildren: 0.1 } },
};

const cardReveal: Variants = {
  hidden:  { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: SPRING } },
};

// ─────────────────────────────────────────────────────────────────────────────
//  ServiceCard — mémoïsé (évite les re-renders du stagger)
// ─────────────────────────────────────────────────────────────────────────────
const ServiceCard = memo(function ServiceCard({
  service,
  reduced,
}: {
  service: Service;
  reduced: boolean | null;
}) {
  return (
    <motion.article
      variants={reduced ? undefined : cardReveal}
      className={cn(
        'group relative flex flex-col p-8 lg:p-10',
        'min-h-[320px]',
        service.cardBg,
        // Dernier card (blanc) a une bordure subtile
        service.cardBg === 'bg-blanc' && 'ring-1 ring-inset ring-gris-cl/40',
      )}
    >
      {/* ── Numéro badge (SVG : 40×40 blanc/60 à 36px du bord gauche) ── */}
      <div
        className={cn(
          'mb-7 flex size-10 shrink-0 items-center justify-center self-start',
          'rounded-sm bg-blanc/60 backdrop-blur-sm',
          'text-[10px] font-bold tracking-[0.2em] text-noir/40',
        )}
        aria-hidden
      >
        {service.number}
      </div>

      {/* ── Titre service ── */}
      <h3
        className="mb-1.5 font-display font-light italic leading-snug text-noir"
        style={{ fontSize: 'clamp(1.3rem, 1.8vw, 1.6rem)' }}
      >
        {service.title.map((line, i) => (
          <span key={i} className="block">{line}</span>
        ))}
      </h3>

      {/* ── Sous-titre ── */}
      <p className="mb-5 text-[9.5px] font-semibold uppercase tracking-[0.28em] text-or">
        {service.subtitle}
      </p>

      {/* ── Description ── */}
      <p className="mb-6 text-[12.5px] leading-relaxed text-gris-dark/80">
        {service.description}
      </p>

      {/* ── Features ── */}
      <ul
        className="mb-8 flex flex-col gap-2"
        aria-label={`Inclus : ${service.title.join(' ')}`}
      >
        {service.features.map((feat) => (
          <li key={feat} className="flex items-center gap-2.5 text-[11.5px] text-noir/55">
            <Check
              size={9}
              strokeWidth={3}
              className="shrink-0 text-or/60"
              aria-hidden
            />
            {feat}
          </li>
        ))}
      </ul>

      {/* ── Lien ── */}
      <Link
        href={service.href}
        className={cn(
          'mt-auto inline-flex items-center gap-1.5',
          'text-[9.5px] font-semibold uppercase tracking-[0.22em]',
          'text-noir/35 transition-colors duration-200',
          'group-hover:text-or',
          'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-or rounded-sm',
        )}
        aria-label={`En savoir plus sur ${service.title.join(' ')}`}
      >
        En savoir plus
        <ArrowUpRight
          size={11}
          strokeWidth={2}
          className="transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
          aria-hidden
        />
      </Link>
    </motion.article>
  );
});

// ─────────────────────────────────────────────────────────────────────────────
//  ServicesGrid — composant principal
// ─────────────────────────────────────────────────────────────────────────────
export function ServicesGrid() {
  const reduced = useReducedMotion();

  return (
    <section
      className="w-full bg-blanc"
      aria-labelledby="services-heading"
    >
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="mx-auto max-w-7xl px-6 py-16 md:px-20 md:py-20 xl:px-24">
        <motion.div
          variants={reduced ? undefined : headerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between"
        >
          {/* Gauche : eyebrow + titre */}
          <motion.div variants={reduced ? undefined : fadeUp} className="max-w-xs">
            <div className="mb-4 flex items-center gap-3">
              <span className="block h-px w-6 bg-or/55" aria-hidden />
              <span className="text-[9px] font-semibold uppercase tracking-[0.36em] text-or/75">
                Ce que nous faisons
              </span>
            </div>
            <h2
              id="services-heading"
              className="font-display font-light italic leading-tight text-noir"
              style={{ fontSize: 'clamp(1.9rem, 3vw, 2.6rem)' }}
            >
              Nos Services
            </h2>
          </motion.div>

          {/* Droite : description + CTA outline (SVG : stroke #151515, w=159, rx=3.5) */}
          <motion.div
            variants={reduced ? undefined : fadeUp}
            className="flex flex-col gap-5 md:max-w-[300px] md:items-end md:text-right"
          >
            <p className="text-[12.5px] leading-relaxed text-gris">
              De la conception à la livraison, nous transformons chaque espace
              en une œuvre à vivre — à Cotonou et au-delà.
            </p>
            <Link
              href="/services"
              className={cn(
                'inline-flex items-center gap-2 self-start rounded-sm md:self-end',
                'border border-noir/25 px-5 py-2.5',
                'text-[9.5px] font-semibold uppercase tracking-[0.22em] text-noir/60',
                'transition-all duration-200 hover:border-noir/55 hover:text-noir',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-or',
              )}
            >
              Tous nos services
              <ArrowUpRight size={11} strokeWidth={2} aria-hidden />
            </Link>
          </motion.div>
        </motion.div>
      </div>

      {/* ── Grille de cartes ──────────────────────────────────────────────────
           SVG : 4 cartes 320×320, gap 2px — reproduit avec gap-px + bg parent
      ─────────────────────────────────────────────────────────────────────── */}
      <motion.div
        variants={reduced ? undefined : gridContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-80px' }}
        className={cn(
          'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
          'gap-px bg-gris-cl/30',                   // gap-px = séparateur 1px
          'border-t border-gris-cl/30',
        )}
        role="list"
        aria-label="Nos quatre services"
      >
        {SERVICES.map((service) => (
          <div key={service.number} role="listitem">
            <ServiceCard service={service} reduced={reduced} />
          </div>
        ))}
      </motion.div>
    </section>
  );
}
