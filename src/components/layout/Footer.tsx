import { Link } from '@/i18n/navigation';
import { Mail, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';

type SocialBrand = 'instagram' | 'linkedin' | 'facebook' | 'pinterest';

function SocialBrandIcon({
  brand,
  className,
}: {
  brand: SocialBrand;
  className?: string;
}) {
  const shared = { className, fill: 'currentColor', 'aria-hidden': true as const };

  switch (brand) {
    case 'instagram':
      return (
        <svg viewBox="0 0 24 24" {...shared}>
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 1.17.054 1.97.24 2.427.403a4.92 4.92 0 011.77 1.153 4.92 4.92 0 011.153 1.77c.163.457.349 1.257.403 2.427.058 1.266.07 1.646.07 4.85s-.012 3.584-.07 4.85c-.054 1.17-.24 1.97-.403 2.427a4.92 4.92 0 01-1.153 1.77 4.92 4.92 0 01-1.77 1.153c-.457.163-1.257.349-2.427.403-1.266.058-1.646.07-4.85.07s-3.584-.012-4.85-.07c-1.17-.054-1.97-.24-2.427-.403a4.92 4.92 0 01-1.77-1.153 4.92 4.92 0 01-1.153-1.77c-.163-.457-.349-1.257-.403-2.427C2.175 15.584 2.163 15.204 2.163 12s.012-3.584.07-4.85c.054-1.17.24-1.97.403-2.427a4.92 4.92 0 011.153-1.77 4.92 4.92 0 011.77-1.153c.457-.163 1.257-.349 2.427-.403C8.416 2.175 8.796 2.163 12 2.163zm0 1.622c-3.15 0-3.518.012-4.748.068-1.01.046-1.56.218-1.924.363-.484.188-.83.413-1.193.776a3.07 3.07 0 00-.776 1.193c-.145.364-.317.914-.363 1.924-.056 1.23-.068 1.598-.068 4.748s.012 3.518.068 4.748c.046 1.01.218 1.56.363 1.924.188.484.413.83.776 1.193.363.363.709.588 1.193.776.364.145.914.317 1.924.363 1.23.056 1.598.068 4.748.068s3.518-.012 4.748-.068c1.01-.046 1.56-.218 1.924-.363.484-.188.83-.413 1.193-.776.363-.363.588-.709.776-1.193.145-.364.317-.914.363-1.924.056-1.23.068-1.598.068-4.748s-.012-3.518-.068-4.748c-.046-1.01-.218-1.56-.363-1.924a3.07 3.07 0 00-.776-1.193 3.07 3.07 0 00-1.193-.776c-.364-.145-.914-.317-1.924-.363-1.23-.056-1.598-.068-4.748-.068zM12 7.378a4.622 4.622 0 110 9.244 4.622 4.622 0 010-9.244zm0 1.622a3 3 0 100 6 3 3 0 000-6zm5.884-5.96a1.08 1.08 0 110 2.16 1.08 1.08 0 010-2.16z" />
        </svg>
      );
    case 'linkedin':
      return (
        <svg viewBox="0 0 24 24" {...shared}>
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 110-4.124 2.062 2.062 0 010 4.124zM7.114 20.452H3.56V9h3.554v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
        </svg>
      );
    case 'facebook':
      return (
        <svg viewBox="0 0 24 24" {...shared}>
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
      );
    case 'pinterest':
      return (
        <svg viewBox="0 0 24 24" {...shared}>
          <path d="M12 0C5.373 0 0 5.373 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.194.6 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 01.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z" />
        </svg>
      );
  }
}

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
    brand: 'instagram' as const,
  },
  {
    label: 'LinkedIn',
    href: 'https://linkedin.com/company/mathieuco',
    brand: 'linkedin' as const,
  },
  {
    label: 'Facebook',
    href: 'https://facebook.com/mathieuco',
    brand: 'facebook' as const,
  },
  {
    label: 'Pinterest',
    href: 'https://pinterest.com/mathieuco',
    brand: 'pinterest' as const,
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
      translate="no"
    >
      <span className="text-[15px] font-semibold tracking-tight text-blanc transition-colors duration-200 group-hover:text-or">
        {'Mathieu'}<span className="text-or">{'&'}</span>{'Co'}
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
                {SOCIAL_LINKS.map(({ label, href, brand }) => (
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
                      <SocialBrandIcon brand={brand} className="size-4" />
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
            © {year} Mathieu{'&'}Co Studio. Tous droits réservés.
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
