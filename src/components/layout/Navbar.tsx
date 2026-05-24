'use client';

import { useState } from 'react';
import { Link, usePathname } from '@/i18n/navigation';
import { useLocale } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import { motion, useScroll, useMotionValueEvent, AnimatePresence } from 'framer-motion';
import { ShoppingBag, User, Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCartCount } from '@/store/cartStore';

const NAV_LINKS = [
  { label: 'Boutique', href: '/boutique' },
  { label: 'Galerie',  href: '/galerie'  },
  { label: 'Blog',     href: '/blog'     },
  { label: 'Contact',  href: '/contact'  },
] as const;

export function Navbar() {
  const { scrollY } = useScroll();
  const [scrolled,   setScrolled]   = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const cartCount  = useCartCount();
  const pathname   = usePathname();
  const locale     = useLocale();
  const router     = useRouter();

  useMotionValueEvent(scrollY, 'change', (latest) => {
    setScrolled(latest > 20);
  });

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href);

  const toggleLocale = () => {
    const next = locale === 'fr' ? 'en' : 'fr';
    router.replace(pathname, { locale: next });
  };

  return (
    <>
      <motion.header
        initial={{ opacity: 0, y: -28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
        className={cn(
          'fixed top-0 inset-x-0 z-50',
          'transition-[padding,background-color,backdrop-filter,border-color,box-shadow] duration-300 ease-out',
          scrolled
            ? 'py-3 bg-blanc/80 backdrop-blur-md border-b border-beige3/40 shadow-[0_1px_16px_0_rgba(21,21,21,0.06)]'
            : 'py-5 bg-transparent',
        )}
      >
        <div className="max-w-7xl mx-auto px-6 md:px-10 flex items-center justify-between">

          {/* ── Logo ── */}
          <Link
            href="/"
            className="flex items-baseline gap-1.5 shrink-0 group"
            aria-label="Mathieu&Co Studio — accueil"
            translate="no"
          >
            <span
              className={cn(
                'text-[15px] font-semibold tracking-tight transition-colors duration-300 group-hover:text-or',
                scrolled
                  ? 'text-noir'
                  : 'text-blanc [text-shadow:0_1px_10px_rgba(0,0,0,0.55)]',
              )}
            >
              {'Mathieu'}<span className="text-or">{'&'}</span>{'Co'}
            </span>
            <span
              className={cn(
                'text-[9px] uppercase tracking-[0.22em] font-light leading-none transition-colors duration-300',
                scrolled ? 'text-gris' : 'text-blanc/60 [text-shadow:0_1px_8px_rgba(0,0,0,0.45)]',
              )}
            >
              Studio
            </span>
          </Link>

          {/* ── Nav links (desktop) ── */}
          <nav aria-label="Navigation principale">
            <ul className="hidden md:flex items-center gap-8">
              {NAV_LINKS.map(({ label, href }) => {
                const active = isActive(href);
                return (
                  <li key={href}>
                    <Link
                      href={href}
                      aria-current={active ? 'page' : undefined}
                      className={cn(
                        'relative text-[10.5px] font-semibold uppercase tracking-[0.16em]',
                        'transition-colors duration-300',
                        'after:absolute after:bottom-[-3px] after:left-0 after:h-px',
                        'after:bg-or after:transition-[width] after:duration-300',
                        active
                          ? 'text-or after:w-full'
                          : 'after:w-0 hover:text-or hover:after:w-full',
                        !active && (scrolled
                          ? 'text-noir'
                          : 'text-blanc [text-shadow:0_1px_10px_rgba(0,0,0,0.55)]'),
                      )}
                    >
                      {label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* ── Icons ── */}
          <div className="flex items-center gap-1">
            {/* Language switcher */}
            <button
              type="button"
              onClick={toggleLocale}
              aria-label={`Passer en ${locale === 'fr' ? 'anglais' : 'français'}`}
              className={cn(
                'hidden md:flex items-center gap-1 px-2.5 py-1.5 rounded-sm',
                'text-[9px] font-semibold uppercase tracking-[0.18em]',
                'border transition-all duration-200',
                scrolled
                  ? 'border-gris-cl text-gris hover:border-or/50 hover:text-or'
                  : 'border-blanc/20 text-blanc/60 hover:border-blanc/50 hover:text-blanc',
              )}
            >
              {locale === 'fr' ? 'EN' : 'FR'}
            </button>

            <Link
              href="/compte"
              aria-label="Mon compte"
              className={cn(
                'p-2 rounded-full transition-colors duration-300 hover:text-or',
                scrolled
                  ? 'text-noir hover:bg-beige2'
                  : 'text-blanc/80 hover:bg-blanc/10 [text-shadow:0_1px_8px_rgba(0,0,0,0.4)]',
              )}
            >
              <User size={18} strokeWidth={1.5} />
            </Link>

            <Link
              href="/panier"
              aria-label="Panier"
              className={cn(
                'relative p-2 rounded-full transition-colors duration-300 hover:text-or',
                scrolled
                  ? 'text-noir hover:bg-beige2'
                  : 'text-blanc/80 hover:bg-blanc/10 [text-shadow:0_1px_8px_rgba(0,0,0,0.4)]',
              )}
            >
              <ShoppingBag size={18} strokeWidth={1.5} />
              {cartCount > 0 && (
                <span className={cn(
                  'absolute -top-0.5 -right-0.5',
                  'flex size-4 items-center justify-center rounded-full',
                  'bg-or text-blanc text-[9px] font-bold leading-none',
                )}>
                  {cartCount > 9 ? '9+' : cartCount}
                </span>
              )}
            </Link>

            {/* Burger (mobile) */}
            <button
              aria-label={mobileOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
              aria-expanded={mobileOpen}
              onClick={() => setMobileOpen((v) => !v)}
              className={cn(
                'md:hidden p-2 rounded-full transition-colors duration-300 ml-1',
                scrolled
                  ? 'text-noir hover:bg-beige2'
                  : 'text-blanc/80 hover:bg-blanc/10',
              )}
            >
              {mobileOpen ? <X size={18} strokeWidth={1.5} /> : <Menu size={18} strokeWidth={1.5} />}
            </button>
          </div>

        </div>
      </motion.header>

      {/* ── Mobile menu ── */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.nav
            key="mobile-nav"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            aria-label="Navigation mobile"
            className={cn(
              'fixed inset-x-0 top-[56px] z-40 md:hidden',
              'bg-blanc/95 backdrop-blur-md border-b border-beige3/40',
              'shadow-[0_8px_24px_0_rgba(21,21,21,0.08)]',
            )}
          >
            <ul className="flex flex-col divide-y divide-beige2">
              {NAV_LINKS.map(({ label, href }) => {
                const active = isActive(href);
                return (
                  <li key={href}>
                    <Link
                      href={href}
                      onClick={() => setMobileOpen(false)}
                      aria-current={active ? 'page' : undefined}
                      className={cn(
                        'flex items-center justify-between px-6 py-4',
                        'text-[11px] font-semibold uppercase tracking-[0.2em]',
                        'hover:bg-beige transition-colors duration-150',
                        active ? 'text-or' : 'text-noir hover:text-or',
                      )}
                    >
                      {label}
                      {active && (
                        <span className="block h-px w-4 rounded-full bg-or" aria-hidden />
                      )}
                    </Link>
                  </li>
                );
              })}
              <li className="px-6 py-4 flex items-center justify-between">
                <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-gris">
                  Langue
                </span>
                <button
                  type="button"
                  onClick={() => { toggleLocale(); setMobileOpen(false); }}
                  className="text-[10px] font-semibold uppercase tracking-[0.18em] text-gris hover:text-or transition-colors duration-150"
                >
                  {locale === 'fr' ? '🇬🇧 EN' : '🇫🇷 FR'}
                </button>
              </li>
            </ul>
          </motion.nav>
        )}
      </AnimatePresence>
    </>
  );
}
