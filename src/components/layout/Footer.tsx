import Link from 'next/link';
import { Facebook, Instagram, Linkedin, Mail, MapPin, Pinterest } from 'lucide-react';
import { cn } from '@/lib/utils';

const STUDIO_LINKS = [
  { label: 'Services', href: '/services' },
  { label: 'Galerie', href: '/galerie' },
  { label: 'Blog', href: '/blog' },
  { label: 'À propos', href: '/a-propos' },
  { label: 'Contact', href: '/contact' },
] as const;

const BOUTIQUE_LINKS = [
  { label: 'Catalogue', href: '/boutique' },
  { label: 'Mobilier', href: '/boutique?categorie=mobilier' },
  { label: 'Décoration', href: '/boutique?categorie=decoration' },
  { label: 'FAQ', href: '/faq' },
  { label: 'Livraison & retours', href: '/livraison-retours' },
] as const;

const SOCIAL_LINKS = [
  {
    label: 'Instagram',
    href: 'https://instagram.com/mathieuco',
    icon: Instagram,
  },
  {
    label: 'LinkedIn',
    href: 'https://linkedin.com/company/mathieuco',
    icon: Linkedin,
  },
  {
    label: 'Facebook',
    href: 'https://facebook.com/mathieuco',
    icon: Facebook,
  },
  {
    label: 'Pinterest',
    href: 'https://pinterest.com/mathieuco',
    icon: Pinterest,
  },
] as const;

const LEGAL_LINKS = [
  { label: 'Mentions légales', href: '/mentions-legales' },
  { label: 'Confidentialité', href: '/confidentialite' },
] as const;

function FooterColumnTitle({
  id,
  children,
}: {
  id: string;
  children: string;
}) {
  return (
    <h3
      id={id}
      className="text-[10px] font-semibold uppercase tracking-[0.25em] text-or"
    >
      {children}
    </h3>
  );
}

function FooterNavLink({
  href,
  children,
  className,
}: {
  href: string;
  children: string;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        'text-sm text-blanc/85 transition-colors duration-200 hover:text-or',
        className,
      )}
    >
      {children}
    </Link>
  );
}

function FooterLogo() {
  return (
    <Link
      href="/"
      className="inline-flex items-baseline gap-1.5 group"
      aria-label="Mathieu&Co Studio — accueil"
    >
      <span className="text-[15px] font-semibold tracking-tight text-blanc transition-colors duration-200 group-hover:text-or">
        Mathieu<span className="text-or">&amp;</span>Co
      </span>
      <span className="text-[9px] uppercase tracking-[0.22em] font-light text-gris leading-none">
        Studio
      </span>
    </Link>
  );
}

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-noir text-blanc" aria-labelledby="footer-heading">
      <h2 id="footer-heading" className="sr-only">
        Pied de page
      </h2>

      <div className="max-w-7xl mx-auto px-6 md:px-10 pt-16 pb-12">
        <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-4 lg:gap-10">
          {/* Colonne 1 — Logo + description */}
          <div className="flex flex-col gap-5 sm:col-span-2 lg:col-span-1">
            <FooterLogo />
            <p className="max-w-xs text-sm leading-relaxed text-gris">
              Studio d&apos;architecture d&apos;intérieur et d&apos;extérieur à
              Cotonou. Rendus 3D, conception sur mesure et boutique mobilier
              &amp; décoration pour un marché international.
            </p>
          </div>

          {/* Colonne 2 — Liens studio */}
          <nav aria-labelledby="footer-studio-heading" className="flex flex-col gap-5">
            <FooterColumnTitle id="footer-studio-heading">Studio</FooterColumnTitle>
            <ul className="flex flex-col gap-3">
              {STUDIO_LINKS.map(({ label, href }) => (
                <li key={href}>
                  <FooterNavLink href={href}>{label}</FooterNavLink>
                </li>
              ))}
            </ul>
          </nav>

          {/* Colonne 3 — Liens boutique */}
          <nav aria-labelledby="footer-boutique-heading" className="flex flex-col gap-5">
            <FooterColumnTitle id="footer-boutique-heading">Boutique</FooterColumnTitle>
            <ul className="flex flex-col gap-3">
              {BOUTIQUE_LINKS.map(({ label, href }) => (
                <li key={href}>
                  <FooterNavLink href={href}>{label}</FooterNavLink>
                </li>
              ))}
            </ul>
          </nav>

          {/* Colonne 4 — Contact + réseaux */}
          <div className="flex flex-col gap-5">
            <FooterColumnTitle id="footer-contact-heading">Contact</FooterColumnTitle>

            <ul className="flex flex-col gap-4">
              <li>
                <a
                  href="mailto:contact@mathieu-co.studio"
                  className="group inline-flex items-start gap-3 text-sm text-blanc/85 transition-colors hover:text-or"
                >
                  <Mail
                    className="mt-0.5 size-4 shrink-0 text-or"
                    strokeWidth={1.5}
                    aria-hidden
                  />
                  <span>contact@mathieu-co.studio</span>
                </a>
              </li>
              <li>
                <span className="inline-flex items-start gap-3 text-sm text-blanc/85">
                  <MapPin
                    className="mt-0.5 size-4 shrink-0 text-or"
                    strokeWidth={1.5}
                    aria-hidden
                  />
                  <span>
                    Cotonou, Bénin
                    <span className="block text-gris">International</span>
                  </span>
                </span>
              </li>
            </ul>

            <div>
              <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-gris">
                Suivez-nous
              </p>
              <ul className="flex items-center gap-2">
                {SOCIAL_LINKS.map(({ label, href, icon: Icon }) => (
                  <li key={label}>
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={label}
                      className={cn(
                        'flex size-10 items-center justify-center rounded-full border border-blanc/15',
                        'text-blanc transition-colors duration-200',
                        'hover:border-or hover:bg-or/10 hover:text-or',
                      )}
                    >
                      <Icon className="size-4" strokeWidth={1.5} aria-hidden />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Barre inférieure */}
      <div className="border-t border-blanc/10">
        <div className="max-w-7xl mx-auto flex flex-col gap-4 px-6 py-6 md:flex-row md:items-center md:justify-between md:px-10">
          <p className="text-xs text-gris">
            © {year} Mathieu&amp;Co Studio. Tous droits réservés.
          </p>
          <ul className="flex flex-wrap items-center gap-x-6 gap-y-2">
            {LEGAL_LINKS.map(({ label, href }) => (
              <li key={href}>
                <FooterNavLink href={href} className="text-xs text-gris hover:text-or">
                  {label}
                </FooterNavLink>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}
