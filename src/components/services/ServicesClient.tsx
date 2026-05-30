'use client';

/**
 * ServicesClient — sections animées de la page /services
 *
 * Sections :
 *   1. 4 services en colonnes (beige)
 *   2. Process 5 étapes (beige2)
 *   3. CTA final (noir)
 */

import { useRef }              from 'react';
import { motion, useInView }   from 'framer-motion';
import { ArrowUpRight, Check } from 'lucide-react';
import { cn }                  from '@/lib/utils';
import Link                    from 'next/link';

// ─── Data ─────────────────────────────────────────────────────────────────────

const SERVICES = [
  {
    num: '01',
    titre: 'Architecture Intérieure',
    desc: 'Conception d\'espaces sur-mesure alliant fonctionnalité, esthétique et durabilité. Chaque projet est pensé dans ses moindres détails.',
    features: [
      'Plans 2D & 3D détaillés',
      'Sélection matériaux & finitions',
      'Suivi et coordination chantier',
      'Livraison clé en main',
    ],
    cta: 'Demander un devis',
    accent: 'architecture',
  },
  {
    num: '02',
    titre: 'Décoration Contemporaine',
    desc: 'Un regard éditorial sur votre intérieur. Mobilier, textiles, œuvres d\'art et accessoires soigneusement sélectionnés pour votre espace.',
    features: [
      'Moodboard & concept board',
      'Sourcing mobilier & objets',
      'Mise en scène & styling',
      'Portraits d\'intérieur',
    ],
    cta: 'Découvrir',
    accent: 'decoration',
  },
  {
    num: '03',
    titre: 'Gestion de Projet',
    desc: 'Coordination complète de votre chantier : artisans, fournisseurs, délais et budget. Vous n\'avez qu\'à recevoir les clés.',
    features: [
      'Planning & budget détaillé',
      'Sélection artisans qualifiés',
      'Reporting hebdomadaire',
      'Réception et garanties',
    ],
    cta: 'En savoir plus',
    accent: 'gestion',
  },
  {
    num: '04',
    titre: 'Boutique Design',
    desc: 'Des pièces d\'exception sélectionnées pour enrichir votre intérieur — mobilier contemporain africain, luminaires et objets de créateurs.',
    features: [
      'Pièces uniques & éditions limitées',
      'Mobilier contemporain africain',
      'Luminaires de créateurs',
      'Livraison Bénin & Afrique',
    ],
    cta: 'Voir la boutique',
    href: '/boutique',
    accent: 'boutique',
  },
] as const;

const PROCESS_STEPS = [
  {
    num: '01',
    titre: 'Consultation',
    desc: 'Première rencontre pour comprendre votre vision, vos besoins et votre budget.',
  },
  {
    num: '02',
    titre: 'Concept',
    desc: 'Moodboard, références et proposition créative pour valider la direction.',
  },
  {
    num: '03',
    titre: 'Design',
    desc: 'Plans détaillés, sélection matériaux et chiffrage précis du projet.',
  },
  {
    num: '04',
    titre: 'Réalisation',
    desc: 'Coordination des artisans et suivi chantier semaine par semaine.',
  },
  {
    num: '05',
    titre: 'Livraison',
    desc: 'Réception du projet, styling final et remise des clés.',
  },
] as const;

// ─── Animation helpers ────────────────────────────────────────────────────────

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show:   { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 120, damping: 20 } },
};

const stagger = {
  hidden: {},
  show:   { transition: { staggerChildren: 0.09 } },
};

// ─── ServicesClient ───────────────────────────────────────────────────────────

export function ServicesClient() {
  const servicesRef = useRef<HTMLDivElement>(null);
  const processRef  = useRef<HTMLDivElement>(null);
  const ctaRef      = useRef<HTMLDivElement>(null);

  const servicesInView = useInView(servicesRef, { once: true, margin: '-80px' });
  const processInView  = useInView(processRef,  { once: true, margin: '-80px' });
  const ctaInView      = useInView(ctaRef,      { once: true, margin: '-80px' });

  return (
    <>
      {/* ── Section 1 : 4 Services ─────────────────────────────────────────── */}
      <section
        className="bg-beige"
        aria-label="Nos services"
      >
        <div className="mx-auto max-w-[1440px] px-6 md:px-10 xl:px-16 py-20">

          {/* Section header */}
          <div className="mb-14">
            <div className="mb-3 flex items-center gap-3">
              <span className="block h-px w-6 shrink-0 bg-or/70" aria-hidden />
              <span className="text-[9px] font-semibold uppercase tracking-[0.34em] text-or/80">
                Ce que nous faisons
              </span>
            </div>
            <h2
              className="font-display font-light italic text-noir"
              style={{ fontSize: 'clamp(1.8rem, 2.8vw, 2.6rem)' }}
            >
              Quatre domaines d&apos;expertise
            </h2>
          </div>

          {/* Services grid */}
          <motion.div
            ref={servicesRef}
            variants={stagger}
            initial="hidden"
            animate={servicesInView ? 'show' : 'hidden'}
            className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-0 divide-y sm:divide-y-0 sm:divide-x divide-gris-cl"
          >
            {SERVICES.map((service) => (
              <ServiceCard key={service.num} service={service} />
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Section 2 : Process ────────────────────────────────────────────── */}
      <section
        className="bg-beige2"
        aria-label="Notre processus"
        style={{ borderTop: '1px solid rgba(224,222,218,0.6)' }}
      >
        <div className="mx-auto max-w-[1440px] px-6 md:px-10 xl:px-16 py-20">

          {/* Header */}
          <div className="mb-14 flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <div>
              <div className="mb-3 flex items-center gap-3">
                <span className="block h-px w-6 shrink-0 bg-or/70" aria-hidden />
                <span className="text-[9px] font-semibold uppercase tracking-[0.34em] text-or/80">
                  Comment ça marche
                </span>
              </div>
              <h2
                className="font-display font-light italic text-noir"
                style={{ fontSize: 'clamp(1.8rem, 2.8vw, 2.6rem)' }}
              >
                Notre processus
              </h2>
            </div>
            <p className="hidden md:block max-w-[360px] text-[12px] text-gris leading-relaxed">
              De la première rencontre à la livraison finale, nous vous accompagnons
              à chaque étape pour un résultat à la hauteur de vos attentes.
            </p>
          </div>

          {/* Steps */}
          <motion.div
            ref={processRef}
            variants={stagger}
            initial="hidden"
            animate={processInView ? 'show' : 'hidden'}
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-6 md:gap-0 md:divide-x divide-gris-cl"
          >
            {PROCESS_STEPS.map((step, idx) => (
              <ProcessStep key={step.num} step={step} isLast={idx === PROCESS_STEPS.length - 1} />
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Section 3 : CTA ────────────────────────────────────────────────── */}
      <section
        className="overflow-hidden"
        style={{ backgroundColor: '#151515' }}
        aria-label="Démarrer un projet"
      >
        <div className="mx-auto max-w-[1440px] px-6 md:px-10 xl:px-16 py-24">
          <motion.div
            ref={ctaRef}
            variants={stagger}
            initial="hidden"
            animate={ctaInView ? 'show' : 'hidden'}
            className="flex flex-col md:flex-row md:items-center md:justify-between gap-10 md:gap-16"
          >
            {/* Left — text */}
            <motion.div variants={fadeUp} className="md:max-w-[560px]">
              <div className="mb-4 flex items-center gap-3">
                <span className="block h-px w-6 shrink-0 bg-or/70" aria-hidden />
                <span className="text-[9px] font-semibold uppercase tracking-[0.34em] text-or/80">
                  Votre projet
                </span>
              </div>
              <h2
                className="font-display font-light italic text-white"
                style={{ fontSize: 'clamp(2rem, 3.5vw, 3.2rem)', lineHeight: 1.15 }}
              >
                Vous avez un projet ?<br />
                <span style={{ color: 'rgba(255,255,255,0.38)', WebkitTextStroke: '1px rgba(184,137,58,0.4)' }}>
                  Parlons-en.
                </span>
              </h2>
              <p className="mt-5 text-[12.5px] leading-relaxed text-white/45">
                Chaque collaboration commence par une conversation. Partagez-nous votre vision
                et nous vous proposerons une approche sur-mesure adaptée à votre budget et vos délais.
              </p>
            </motion.div>

            {/* Right — CTAs */}
            <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-4 shrink-0">
              <Link
                href="/contact"
                className={cn(
                  'group inline-flex items-center gap-3 rounded-sm px-8 py-4',
                  'text-[10.5px] font-semibold uppercase tracking-[0.22em]',
                  'bg-or text-blanc transition-all duration-300',
                  'hover:bg-or-dark active:scale-[0.98]',
                )}
              >
                Demander un devis
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
                  'text-[10.5px] font-semibold uppercase tracking-[0.22em]',
                  'border border-blanc/20 text-blanc/70 transition-all duration-300',
                  'hover:border-blanc/40 hover:text-blanc active:scale-[0.98]',
                )}
              >
                Voir nos réalisations
              </Link>
            </motion.div>
          </motion.div>
        </div>

        {/* Architecture SVG watermark */}
        <svg
          className="pointer-events-none absolute right-0 bottom-0 opacity-[0.03] h-64 w-auto"
          viewBox="0 0 400 300"
          fill="none"
          aria-hidden
        >
          <circle cx="300" cy="200" r="180" stroke="white" strokeWidth="0.6" />
          <circle cx="300" cy="200" r="120" stroke="white" strokeWidth="0.4" />
        </svg>
      </section>
    </>
  );
}

// ─── ServiceCard ──────────────────────────────────────────────────────────────

interface ServiceCardProps {
  service: (typeof SERVICES)[number];
}

function ServiceCard({ service }: ServiceCardProps) {
  const href = 'href' in service ? service.href : '/contact';

  return (
    <motion.div
      variants={fadeUp}
      className="group flex flex-col gap-6 px-6 xl:px-8 py-10 first:pl-0 last:pr-0 hover:bg-beige2/60 transition-colors duration-300"
    >
      {/* Number */}
      <span
        className="font-display font-light italic"
        style={{ fontSize: 'clamp(2.4rem, 3.5vw, 3.2rem)', color: 'rgba(184,137,58,0.35)', lineHeight: 1 }}
        aria-hidden
      >
        {service.num}
      </span>

      {/* Title */}
      <h3 className="text-[15px] font-semibold text-noir leading-snug">
        {service.titre}
      </h3>

      {/* Description */}
      <p className="text-[11.5px] text-gris leading-relaxed flex-1">
        {service.desc}
      </p>

      {/* Features */}
      <ul className="space-y-2" aria-label={`Inclus dans ${service.titre}`}>
        {service.features.map((f) => (
          <li key={f} className="flex items-start gap-2.5 text-[10.5px] text-noir/70">
            <Check
              size={11}
              strokeWidth={2.5}
              className="mt-0.5 shrink-0 text-or"
              aria-hidden
            />
            {f}
          </li>
        ))}
      </ul>

      {/* CTA */}
      <Link
        href={href}
        className={cn(
          'group/link mt-2 inline-flex items-center gap-2',
          'text-[10px] font-semibold uppercase tracking-[0.22em] text-or/80',
          'transition-colors duration-200 hover:text-or',
        )}
        aria-label={`${service.cta} — ${service.titre}`}
      >
        {service.cta}
        <ArrowUpRight
          size={12}
          strokeWidth={2}
          className="transition-transform duration-200 group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5"
          aria-hidden
        />
      </Link>
    </motion.div>
  );
}

// ─── ProcessStep ──────────────────────────────────────────────────────────────

interface ProcessStepProps {
  step:   (typeof PROCESS_STEPS)[number];
  isLast: boolean;
}

function ProcessStep({ step, isLast }: ProcessStepProps) {
  return (
    <motion.div
      variants={fadeUp}
      className="flex flex-col gap-4 px-0 md:px-6 xl:px-8 md:first:pl-0 md:last:pr-0 pb-6 md:pb-0"
    >
      {/* Number + connector */}
      <div className="flex items-center gap-3">
        <span
          className="flex size-8 items-center justify-center rounded-full border border-or/40 text-[10px] font-semibold text-or/80 shrink-0"
        >
          {step.num}
        </span>
        {!isLast && (
          <span className="hidden xl:block flex-1 h-px bg-gris-cl/80" aria-hidden />
        )}
      </div>

      {/* Title */}
      <h3 className="text-[13px] font-semibold text-noir">
        {step.titre}
      </h3>

      {/* Description */}
      <p className="text-[11px] text-gris leading-relaxed">
        {step.desc}
      </p>
    </motion.div>
  );
}
