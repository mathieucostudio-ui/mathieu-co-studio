/**
 * Contact — Page de contact
 *
 * Layout (from SVG maquette):
 *   ┌─────────────────────────────────────────────┐
 *   │  Hero #1A2830 (h≈280px)                     │
 *   │  • Eyebrow or + titre + sous-titre           │
 *   ├──────────────────┬──────────────────────────┤
 *   │  Left #151515    │  Right #F2EDE8            │
 *   │  (w=480/1440)    │  (w=960/1440)             │
 *   │  • Adresse       │  • Formulaire RHF + Zod   │
 *   │  • Téléphone     │  • Submit noir            │
 *   │  • WhatsApp      │                           │
 *   │  • Email         │                           │
 *   │  • Horaires      │                           │
 *   │  • Socials       │                           │
 *   └──────────────────┴──────────────────────────┘
 */

import type { Metadata }    from 'next';
import { setRequestLocale }  from 'next-intl/server';
import { MapPin, Phone, Mail, Clock } from 'lucide-react';
import { ContactForm }       from '@/components/contact/ContactForm';
import { LocalBusinessSchema } from '@/components/seo/JsonLd';

// ─── Métadonnées ──────────────────────────────────────────────────────────────

export const metadata: Metadata = {
  title:       'Contact — Mathieu&Co Studio',
  description: 'Contactez Mathieu&Co Studio pour votre projet d\'architecture intérieure ou de décoration à Cotonou, Bénin. Devis gratuit sous 24h.',
  openGraph: {
    title:       'Nous contacter — Mathieu&Co Studio',
    description: 'Architecture intérieure et décoration contemporaine à Cotonou. Écrivez-nous pour un devis gratuit.',
    type:        'website',
  },
};

// ─── Types ────────────────────────────────────────────────────────────────────

type Props = {
  params: Promise<{ locale: string }>;
};

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function ContactPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div className="min-h-[100dvh]">
      <LocalBusinessSchema />
      {/* Hero */}
      <ContactHero />

      {/* Split layout */}
      <div className="flex flex-col xl:flex-row">
        {/* Left — contact info */}
        <ContactSidebar />

        {/* Right — form */}
        <section
          className="flex-1 bg-beige"
          aria-label="Formulaire de contact"
        >
          <div className="px-6 sm:px-10 xl:px-16 py-16 max-w-[880px]">
            <div className="mb-10">
              <div className="mb-3 flex items-center gap-3">
                <span className="block h-px w-6 shrink-0 bg-or/70" aria-hidden />
                <span className="text-[9px] font-semibold uppercase tracking-[0.34em] text-or/80">
                  Formulaire
                </span>
              </div>
              <h2
                className="font-display font-light italic text-noir mb-3"
                style={{ fontSize: 'clamp(1.6rem, 2.5vw, 2.2rem)' }}
              >
                Décrivez votre projet
              </h2>
              <p className="text-[12px] text-gris leading-relaxed max-w-[480px]">
                Partagez votre vision et nous vous recontactons sous 24h ouvrées
                avec une proposition adaptée.
              </p>
            </div>
            <ContactForm />
          </div>
        </section>
      </div>
    </div>
  );
}

// =============================================================================
//  ContactHero — Server Component
// =============================================================================

function ContactHero() {
  return (
    <section
      className="relative flex min-h-[320px] w-full flex-col justify-end overflow-hidden"
      style={{ backgroundColor: '#1A2830' }}
      aria-label="En-tête contact"
    >
      {/* Decorative shapes */}
      <svg
        className="pointer-events-none absolute right-0 top-0 h-full w-auto opacity-[0.06]"
        viewBox="0 0 700 320"
        fill="none"
        aria-hidden
      >
        {Array.from({ length: 16 }, (_, i) => (
          <line
            key={i}
            x1={i * 42}
            y1="0"
            x2={i * 42}
            y2="320"
            stroke="white"
            strokeWidth="0.5"
          />
        ))}
        <circle cx="560" cy="140" r="200" stroke="white" strokeWidth="0.7" fill="none" />
        <circle cx="560" cy="140" r="130" stroke="white" strokeWidth="0.4" fill="none" />
      </svg>

      {/* Radial overlays */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 55% 65% at 75% 45%, rgba(40,75,55,0.4) 0%, transparent 60%),' +
            'radial-gradient(ellipse 30% 45% at 10% 80%, rgba(26,48,64,0.6) 0%, transparent 55%)',
        }}
        aria-hidden
      />

      {/* Gold line */}
      <div
        className="pointer-events-none absolute bottom-0 left-0 right-0 h-px opacity-40"
        style={{ backgroundColor: '#B8893A' }}
        aria-hidden
      />

      {/* Content */}
      <div className="relative mx-auto w-full max-w-[1440px] px-6 md:px-10 xl:px-16 pb-12 pt-20">
        <div className="mb-4 flex items-center gap-3">
          <span
            className="block h-px w-8 shrink-0"
            style={{ backgroundColor: 'rgba(184,137,58,0.8)' }}
            aria-hidden
          />
          <span
            className="text-[9px] font-semibold uppercase tracking-[0.38em]"
            style={{ color: 'rgba(184,137,58,0.8)' }}
          >
            Parlons de votre projet
          </span>
        </div>

        <h1
          className="font-display font-extralight italic text-white"
          style={{ fontSize: 'clamp(2.4rem, 5vw, 4.2rem)', lineHeight: 1.1 }}
        >
          Contact
        </h1>
        <p
          className="mt-4 max-w-[420px] text-[12px] leading-relaxed"
          style={{ color: 'rgba(255,255,255,0.42)' }}
        >
          Une question, un projet, une collaboration ? Nous lisons tous nos messages
          et répondons sous 24 heures.
        </p>
      </div>
    </section>
  );
}

// =============================================================================
//  ContactSidebar — Server Component
// =============================================================================

function ContactSidebar() {
  return (
    <aside
      className="xl:w-[400px] shrink-0"
      style={{ backgroundColor: '#151515' }}
      aria-label="Informations de contact"
    >
      <div className="px-6 sm:px-10 xl:px-12 py-16 h-full flex flex-col gap-10">

        {/* Coordonnées */}
        <div>
          <div className="mb-5 flex items-center gap-3">
            <span className="block h-px w-6 shrink-0 bg-or/60" aria-hidden />
            <span className="text-[9px] font-semibold uppercase tracking-[0.34em] text-or/70">
              Coordonnées
            </span>
          </div>

          <ul className="space-y-5">
            <li className="flex items-start gap-4">
              <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full border border-blanc/10">
                <MapPin size={13} strokeWidth={1.5} className="text-blanc/50" aria-hidden />
              </div>
              <div>
                <p className="text-[11px] font-semibold text-blanc/80 mb-0.5">Adresse</p>
                <p className="text-[11px] text-blanc/45 leading-relaxed">
                  Haie Vive, Cotonou<br />
                  République du Bénin
                </p>
              </div>
            </li>

            <li className="flex items-start gap-4">
              <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full border border-blanc/10">
                <Phone size={13} strokeWidth={1.5} className="text-blanc/50" aria-hidden />
              </div>
              <div>
                <p className="text-[11px] font-semibold text-blanc/80 mb-0.5">Téléphone</p>
                <a
                  href="tel:+22997000000"
                  className="text-[11px] text-blanc/45 hover:text-or/80 transition-colors"
                >
                  +229 97 00 00 00
                </a>
              </div>
            </li>

            <li className="flex items-start gap-4">
              <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full border border-blanc/10">
                <Mail size={13} strokeWidth={1.5} className="text-blanc/50" aria-hidden />
              </div>
              <div>
                <p className="text-[11px] font-semibold text-blanc/80 mb-0.5">Email</p>
                <a
                  href="mailto:contact@mathieuandco.studio"
                  className="text-[11px] text-blanc/45 hover:text-or/80 transition-colors break-all"
                >
                  contact@mathieuandco.studio
                </a>
              </div>
            </li>

            <li className="flex items-start gap-4">
              <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full border border-blanc/10">
                <Clock size={13} strokeWidth={1.5} className="text-blanc/50" aria-hidden />
              </div>
              <div>
                <p className="text-[11px] font-semibold text-blanc/80 mb-0.5">Horaires</p>
                <p className="text-[11px] text-blanc/45 leading-relaxed">
                  Lun–Ven : 8h–18h<br />
                  Sam : 9h–13h (sur RDV)
                </p>
              </div>
            </li>
          </ul>
        </div>

        {/* Séparateur */}
        <div className="h-px bg-blanc/8" aria-hidden />

        {/* WhatsApp */}
        <div>
          <div className="mb-5 flex items-center gap-3">
            <span className="block h-px w-6 shrink-0 bg-or/60" aria-hidden />
            <span className="text-[9px] font-semibold uppercase tracking-[0.34em] text-or/70">
              Réponse rapide
            </span>
          </div>
          <a
            href="https://wa.me/22997000000?text=Bonjour%20Mathieu%26Co%20Studio%2C%20j'ai%20un%20projet%20..."
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-4 rounded-sm border border-blanc/10 px-4 py-3.5 hover:border-blanc/20 transition-all duration-200"
            aria-label="Contacter via WhatsApp"
          >
            {/* WhatsApp icon */}
            <div
              className="flex size-9 shrink-0 items-center justify-center rounded-full"
              style={{ backgroundColor: 'rgba(37,211,102,0.15)' }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M12 2C6.477 2 2 6.477 2 12c0 1.89.52 3.66 1.422 5.178L2 22l4.978-1.397A9.96 9.96 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm-1.055 5.5c-.138-.003-.28.002-.417.014-.137.012-.382.05-.595.19-.215.14-.52.418-.8.774-.283.356-.528.795-.574 1.273-.05.498.04.95.22 1.38.182.43.46.837.79 1.23.33.39.715.77 1.14 1.125.425.356.9.683 1.39.95.49.264 1 .463 1.49.542.49.08.96.043 1.36-.1.4-.14.734-.39.98-.68.244-.29.41-.62.472-.95.063-.33.023-.644-.08-.91-.106-.266-.284-.48-.476-.63l-1.05-.88c-.19-.16-.39-.17-.57-.08-.18.09-.34.26-.49.42l-.34.38c-.09.1-.2.13-.31.07-.85-.46-1.62-1.1-2.17-1.86-.056-.076-.06-.19.022-.28l.3-.32c.14-.15.29-.32.36-.5.07-.18.05-.38-.05-.55l-.84-1.11c-.13-.18-.3-.29-.5-.31a1.67 1.67 0 00-.25-.01z"
                  fill="#25D366"
                />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-semibold text-blanc/80">WhatsApp</p>
              <p className="text-[10px] text-blanc/40 truncate">Réponse en moins d'1h</p>
            </div>
            <svg
              width="14"
              height="14"
              viewBox="0 0 14 14"
              fill="none"
              className="shrink-0 text-blanc/30 group-hover:text-blanc/60 transition-colors"
              aria-hidden
            >
              <path d="M3 11L11 3M11 3H6M11 3v5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
            </svg>
          </a>
        </div>

        {/* Séparateur */}
        <div className="h-px bg-blanc/8" aria-hidden />

        {/* Réseaux sociaux */}
        <div>
          <div className="mb-5 flex items-center gap-3">
            <span className="block h-px w-6 shrink-0 bg-or/60" aria-hidden />
            <span className="text-[9px] font-semibold uppercase tracking-[0.34em] text-or/70">
              Nos réseaux
            </span>
          </div>

          <div className="flex flex-col gap-3">
            <SocialLink
              href="https://www.instagram.com/mathieuandco"
              label="Instagram"
              color="#E1306C"
              icon={
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <rect x="2" y="2" width="20" height="20" rx="5" stroke="currentColor" strokeWidth="1.8" />
                  <circle cx="12" cy="12" r="4.5" stroke="currentColor" strokeWidth="1.8" />
                  <circle cx="17.5" cy="6.5" r="1" fill="currentColor" />
                </svg>
              }
            />
            <SocialLink
              href="https://www.linkedin.com/company/mathieu-co-studio"
              label="LinkedIn"
              color="#0077B5"
              icon={
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <rect x="2" y="2" width="20" height="20" rx="4" stroke="currentColor" strokeWidth="1.8" />
                  <path d="M7 10v7M7 7v1M12 17v-4c0-1.1.9-2 2-2s2 .9 2 2v4M12 10v7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
              }
            />
            <SocialLink
              href="https://www.pinterest.com/mathieuandco"
              label="Pinterest"
              color="#E60023"
              icon={
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.8" />
                  <path d="M12 8c-2.2 0-4 1.8-4 4 0 1.7 1 3.1 2.5 3.7-.1-.3-.1-.8 0-1.2l.7-2.9c-.2-.3-.3-.7-.3-1.1 0-1 .6-1.8 1.5-1.8.7 0 1 .5 1 1.1 0 .7-.4 1.7-.6 2.7-.2.8.4 1.4 1.2 1.4 1.4 0 2.4-1.8 2.4-4 0-1.7-1.2-2.9-2.9-2.9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              }
            />
          </div>
        </div>
      </div>
    </aside>
  );
}

// ─── SocialLink ───────────────────────────────────────────────────────────────

function SocialLink({
  href,
  label,
  color,
  icon,
}: {
  href:  string;
  label: string;
  color: string;
  icon:  React.ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex items-center gap-3.5 text-blanc/50 hover:text-blanc/80 transition-colors duration-200"
      aria-label={`Suivre sur ${label}`}
    >
      <div
        className="flex size-8 shrink-0 items-center justify-center rounded-full border border-blanc/10 group-hover:border-blanc/20 transition-colors"
        style={{ color }}
      >
        {icon}
      </div>
      <span className="text-[11px] font-medium">{label}</span>
    </a>
  );
}
