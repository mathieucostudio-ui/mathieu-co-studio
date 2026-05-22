'use client';

import { useState } from 'react';
import { Link } from '@/i18n/navigation';
import { motion, useScroll, useMotionValueEvent, AnimatePresence } from 'framer-motion';
import { ShoppingBag, User, Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';

const NAV_LINKS = [
  { label: 'Boutique', href: '/boutique' },
  { label: 'Galerie', href: '/galerie' },
  { label: 'Blog', href: '/blog' },
  { label: 'Contact', href: '/contact' },
] as const;

export function Navbar() {
  const { scrollY } = useScroll();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useMotionValueEvent(scrollY, 'change', (latest) => {
    setScrolled(latest > 20);
  });

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
              {NAV_LINKS.map(({ label, href }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className={cn(
                      'relative text-[10.5px] font-semibold uppercase tracking-[0.16em]',
                      'transition-colors duration-300 hover:text-or',
                      'after:absolute after:bottom-[-3px] after:left-0 after:w-0 after:h-px',
                      'after:bg-or after:transition-[width] after:duration-200',
                      'hover:after:w-full',
                      scrolled
                        ? 'text-noir'
                        : 'text-blanc [text-shadow:0_1px_10px_rgba(0,0,0,0.55)]',
                    )}
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* ── Icons ── */}
          <div className="flex items-center gap-1">
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
              {/* Badge panier — à connecter au store cart */}
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
              {NAV_LINKS.map(({ label, href }) => (
                <li key={href}>
                  <Link
                    href={href}
                    onClick={() => setMobileOpen(false)}
                    className="block px-6 py-4 text-[11px] font-semibold uppercase tracking-[0.2em] text-noir hover:text-or hover:bg-beige transition-colors duration-150"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.nav>
        )}
      </AnimatePresence>
    </>
  );
}
