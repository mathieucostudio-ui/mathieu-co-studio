/**
 * not-found.tsx — Page 404 cinématique
 *
 * Design (from SVG maquette 404-mathieu-co 1.svg):
 *   • Fond noir #151515
 *   • "404" en grand display or (ghost text avec stroke)
 *   • Éléments archi SVG flottants en arrière-plan
 *   • Tagline "Cette page s'est égarée dans les plans."
 *   • Barre de recherche + 3 CTA principaux
 *   • 6 pills de liens rapides
 *   • Animations Framer Motion (fade, float, stagger)
 */

'use client';

import { useState }             from 'react';
import { motion }               from 'framer-motion';
import { Search, ArrowUpRight } from 'lucide-react';
import Link                     from 'next/link';
import { useRouter }            from 'next/navigation';
import { cn }                   from '@/lib/utils';

// ─── Quick links ──────────────────────────────────────────────────────────────

const QUICK_LINKS = [
  { label: 'Galerie',          href: '/galerie'          },
  { label: 'Services',         href: '/services'         },
  { label: 'Boutique',         href: '/boutique'         },
  { label: 'À propos',         href: '/a-propos'         },
  { label: 'Contact',          href: '/contact'          },
  { label: 'FAQ',              href: '/faq'              },
] as const;

// ─── Animation variants ───────────────────────────────────────────────────────

const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  show:   { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 100, damping: 20 } },
};

const stagger = {
  hidden: {},
  show:   { transition: { staggerChildren: 0.08, delayChildren: 0.3 } },
};

// ─── Not Found ────────────────────────────────────────────────────────────────

export default function NotFound() {
  const [query, setQuery] = useState('');
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/boutique?q=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <div
      className="relative flex min-h-[100dvh] flex-col items-center justify-center overflow-hidden px-6"
      style={{ backgroundColor: '#151515' }}
    >
      {/* ── Background architectural SVG ───────────────────────────────────── */}
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        {/* Large ghost circle right */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 120, repeat: Infinity, ease: 'linear' }}
          className="absolute -right-40 top-1/2 -translate-y-1/2"
        >
          <svg width="600" height="600" viewBox="0 0 600 600" fill="none" opacity="0.04">
            <circle cx="300" cy="300" r="280" stroke="white" strokeWidth="0.8" />
            <circle cx="300" cy="300" r="200" stroke="white" strokeWidth="0.5" />
            <circle cx="300" cy="300" r="120" stroke="white" strokeWidth="0.3" />
            {Array.from({ length: 12 }, (_, i) => (
              <line
                key={i}
                x1="300" y1="300"
                x2={300 + 280 * Math.cos((i * Math.PI * 2) / 12)}
                y2={300 + 280 * Math.sin((i * Math.PI * 2) / 12)}
                stroke="white" strokeWidth="0.3"
              />
            ))}
          </svg>
        </motion.div>

        {/* Floating small elements left */}
        <motion.div
          animate={{ y: [0, -18, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute left-10 top-[20%]"
        >
          <svg width="80" height="80" viewBox="0 0 80 80" fill="none" opacity="0.06">
            <rect x="10" y="10" width="60" height="60" stroke="#B8893A" strokeWidth="0.6" />
            <line x1="10" y1="40" x2="70" y2="40" stroke="#B8893A" strokeWidth="0.4" />
            <line x1="40" y1="10" x2="40" y2="70" stroke="#B8893A" strokeWidth="0.4" />
          </svg>
        </motion.div>

        <motion.div
          animate={{ y: [0, 14, 0] }}
          transition={{ duration: 7.5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
          className="absolute left-[15%] bottom-[25%]"
        >
          <svg width="50" height="50" viewBox="0 0 50 50" fill="none" opacity="0.08">
            <circle cx="25" cy="25" r="22" stroke="#B8893A" strokeWidth="0.5" />
            <circle cx="25" cy="25" r="12" stroke="#B8893A" strokeWidth="0.3" />
          </svg>
        </motion.div>

        {/* Grid lines top */}
        <svg
          className="absolute top-0 left-0 w-full h-32 opacity-[0.03]"
          viewBox="0 0 1440 128"
          fill="none"
          preserveAspectRatio="none"
        >
          {Array.from({ length: 20 }, (_, i) => (
            <line key={i} x1={i * 72} y1="0" x2={i * 72} y2="128" stroke="white" strokeWidth="0.5" />
          ))}
        </svg>

        {/* Gold horizontal line */}
        <div
          className="absolute left-0 right-0 top-[38%] h-px opacity-[0.06]"
          style={{ backgroundColor: '#B8893A' }}
        />
      </div>

      {/* ── Content ─────────────────────────────────────────────────────────── */}
      <motion.div
        variants={stagger}
        initial="hidden"
        animate="show"
        className="relative z-10 flex flex-col items-center text-center max-w-[680px]"
      >
        {/* 404 ghost number */}
        <motion.div
          variants={fadeUp}
          className="relative mb-2 select-none"
          aria-hidden
        >
          <span
            className="font-display font-extralight"
            style={{
              fontSize: 'clamp(7rem, 20vw, 16rem)',
              lineHeight: 1,
              color: 'transparent',
              WebkitTextStroke: '1px rgba(184,137,58,0.25)',
            }}
          >
            404
          </span>
          {/* Or shimmer overlay */}
          <span
            className="absolute inset-0 font-display font-extralight"
            style={{
              fontSize: 'clamp(7rem, 20vw, 16rem)',
              lineHeight: 1,
              color: 'transparent',
              WebkitTextStroke: '1px rgba(184,137,58,0.08)',
              filter: 'blur(8px)',
            }}
          >
            404
          </span>
        </motion.div>

        {/* Eyebrow */}
        <motion.div variants={fadeUp} className="mb-5 flex items-center gap-3">
          <span className="block h-px w-8 shrink-0 bg-or/60" aria-hidden />
          <span className="text-[9px] font-semibold uppercase tracking-[0.38em] text-or/70">
            Page introuvable
          </span>
          <span className="block h-px w-8 shrink-0 bg-or/60" aria-hidden />
        </motion.div>

        {/* Tagline */}
        <motion.h1
          variants={fadeUp}
          className="font-display font-light italic text-blanc"
          style={{ fontSize: 'clamp(1.6rem, 3.5vw, 2.8rem)', lineHeight: 1.2 }}
        >
          Cette page s&apos;est égarée dans les plans.
        </motion.h1>

        <motion.p
          variants={fadeUp}
          className="mt-4 text-[12.5px] text-blanc/40 leading-relaxed max-w-[400px]"
        >
          L&apos;URL que vous cherchez n&apos;existe pas ou a été déplacée. Utilisez la recherche
          ou revenez à l&apos;accueil.
        </motion.p>

        {/* Search bar */}
        <motion.form
          variants={fadeUp}
          onSubmit={handleSearch}
          className="mt-10 flex w-full max-w-[420px] gap-0 overflow-hidden rounded-sm border border-blanc/10"
        >
          <div className="relative flex-1">
            <Search
              size={14}
              strokeWidth={1.8}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-blanc/30 pointer-events-none"
              aria-hidden
            />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Rechercher un produit, un projet…"
              className="w-full bg-blanc/5 px-5 py-3.5 pl-11 text-[12px] text-blanc/70 placeholder:text-blanc/25 focus:outline-none focus:bg-blanc/8 transition-colors"
              aria-label="Recherche"
            />
          </div>
          <button
            type="submit"
            className="shrink-0 bg-or px-5 py-3.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-noir hover:bg-or-dark transition-colors"
          >
            OK
          </button>
        </motion.form>

        {/* 3 CTAs */}
        <motion.div
          variants={fadeUp}
          className="mt-8 flex flex-col sm:flex-row items-center gap-3"
        >
          <Link
            href="/"
            className={cn(
              'flex items-center gap-2 rounded-sm bg-or px-6 py-3',
              'text-[10.5px] font-semibold uppercase tracking-[0.2em] text-noir',
              'hover:bg-or-dark transition-all active:scale-[0.98]',
            )}
          >
            Retour à l&apos;accueil
          </Link>
          <Link
            href="/galerie"
            className={cn(
              'flex items-center gap-2 rounded-sm border border-blanc/15 px-6 py-3',
              'text-[10.5px] font-semibold uppercase tracking-[0.2em] text-blanc/60',
              'hover:border-blanc/30 hover:text-blanc/85 transition-all active:scale-[0.98]',
            )}
          >
            Voir la galerie
            <ArrowUpRight size={13} strokeWidth={2} aria-hidden />
          </Link>
          <Link
            href="/boutique"
            className={cn(
              'flex items-center gap-2 rounded-sm border border-blanc/15 px-6 py-3',
              'text-[10.5px] font-semibold uppercase tracking-[0.2em] text-blanc/60',
              'hover:border-blanc/30 hover:text-blanc/85 transition-all active:scale-[0.98]',
            )}
          >
            Boutique
          </Link>
        </motion.div>

        {/* Quick links pills */}
        <motion.div
          variants={fadeUp}
          className="mt-10 flex flex-wrap justify-center gap-2"
          aria-label="Liens rapides"
        >
          {QUICK_LINKS.map(({ label, href }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                'rounded-full border border-blanc/10 px-4 py-1.5',
                'text-[10px] font-semibold uppercase tracking-[0.18em] text-blanc/35',
                'hover:border-blanc/25 hover:text-blanc/60 transition-all duration-200',
              )}
            >
              {label}
            </Link>
          ))}
        </motion.div>
      </motion.div>

      {/* Gold bottom accent */}
      <div
        className="pointer-events-none absolute bottom-0 left-0 right-0 h-px opacity-30"
        style={{ backgroundColor: '#B8893A' }}
        aria-hidden
      />
    </div>
  );
}
