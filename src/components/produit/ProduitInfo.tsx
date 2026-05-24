'use client';

/**
 * ProduitInfo — colonne droite de la fiche produit (47% du split)
 *
 * SVG right column layout :
 *   • Badge "Vu dans nos rendus" (top)
 *   • Nom produit + eyebrow catégorie
 *   • Rating stars + note
 *   • Prix (normal ou barré + promo)
 *   • Séparateur gold
 *   • "Finition & Matière" + 4 swatches (y=574-606)
 *     Colors from SVG: #8A6548 Teak / #2A1A08 Ébène / #C8B89A Lin / #4A3828 Noyer
 *   • Quantité +/−
 *   • CTA panier (noir)
 *   • CTA achat direct (or)
 *   • Trust badges (livraison | retour | authenticité)
 */

import { useState, useCallback, memo } from 'react';
import { motion, AnimatePresence }       from 'framer-motion';
import { ShoppingBag, Heart, Minus, Plus, Truck, RotateCcw, Award, Check } from 'lucide-react';
import { Link }                           from '@/i18n/navigation';
import { cn }                             from '@/lib/utils';
import { formatFCFA, getPourcentageRemise } from '@/types/product';
import type { ProduitDetail, CategorieResume } from '@/types/product';
import { useCartStore }                   from '@/store/cartStore';

// ─── Types ────────────────────────────────────────────────────────────────────

interface ProduitInfoProps {
  produit:    ProduitDetail;
  categorie?: CategorieResume | null;
  avisTotal?: number;
  avisMoyenne?: number;
}

// ─── Swatches (from SVG paths [83-86]) ───────────────────────────────────────

const FINITIONS = [
  { id: 'teak',   label: 'Teak naturel',   color: '#8A6548' },
  { id: 'ebene',  label: 'Ébène laqué',    color: '#2A1A08' },
  { id: 'lin',    label: 'Lin naturel',    color: '#C8B89A' },
  { id: 'noyer',  label: 'Noyer brossé',   color: '#4A3828' },
] as const;

// ─── Stars ────────────────────────────────────────────────────────────────────

function Stars({ note, max = 5, size = 12 }: { note: number; max?: number; size?: number }) {
  return (
    <div className="flex items-center gap-0.5" aria-label={`Note : ${note} sur ${max}`}>
      {Array.from({ length: max }, (_, i) => {
        const filled = i < Math.floor(note);
        const half   = !filled && i < note;
        return (
          <svg key={i} width={size} height={size} viewBox="0 0 12 12" fill="none" aria-hidden>
            <path
              d="M6 1L7.4 4.2L11 4.7L8.5 7.1L9.2 10.7L6 9L2.8 10.7L3.5 7.1L1 4.7L4.6 4.2L6 1Z"
              fill={filled ? '#B8893A' : half ? 'url(#half)' : 'none'}
              stroke={filled || half ? '#B8893A' : '#D0CCC8'}
              strokeWidth="0.8"
            />
            {half && (
              <defs>
                <linearGradient id="half">
                  <stop offset="50%" stopColor="#B8893A" />
                  <stop offset="50%" stopColor="transparent" />
                </linearGradient>
              </defs>
            )}
          </svg>
        );
      })}
    </div>
  );
}

// ─── Trust badge ──────────────────────────────────────────────────────────────

function TrustBadge({ icon, label, sub }: { icon: React.ReactNode; label: string; sub: string }) {
  return (
    <div className="flex items-start gap-2.5">
      <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-beige2 text-or">
        {icon}
      </span>
      <div>
        <p className="text-[11px] font-semibold text-noir leading-none">{label}</p>
        <p className="mt-0.5 text-[10px] text-gris leading-snug">{sub}</p>
      </div>
    </div>
  );
}

// ─── ProduitInfo ──────────────────────────────────────────────────────────────

export const ProduitInfo = memo(function ProduitInfo({
  produit,
  categorie,
  avisTotal = 0,
  avisMoyenne = 0,
}: ProduitInfoProps) {
  const addToCart = useCartStore((s) => s.addToCart);

  const [activeFinition, setActiveFinition] = useState<string>(FINITIONS[0].id);
  const [quantite,       setQuantite]        = useState(1);
  const [wishlisted,     setWishlisted]       = useState(false);
  const [cartAdded,      setCartAdded]        = useState(false);

  const isEpuise  = produit.statut === 'epuise';
  const hasPromo  = produit.prix_promo !== null && produit.prix_promo > 0;
  const pctRemise = hasPromo ? getPourcentageRemise(produit.prix, produit.prix_promo!) : 0;

  const handleQty = useCallback((delta: number) => {
    setQuantite((q) => Math.max(1, Math.min(produit.stock, q + delta)));
  }, [produit.stock]);

  const handleAddToCart = useCallback(() => {
    if (isEpuise || cartAdded) return;
    addToCart({
      produitId:    produit.id,
      slug:         produit.slug,
      nom:          produit.nom,
      image:        produit.images[0]?.url ?? null,
      prixUnitaire: produit.prix_promo ?? produit.prix,
      prixOriginal: produit.prix,
      quantite,
      finition:     activeFinition,
    });
    setCartAdded(true);
    setTimeout(() => setCartAdded(false), 2500);
  }, [isEpuise, cartAdded, addToCart, produit, quantite, activeFinition]);

  return (
    <div className="flex h-full flex-col py-8 px-8 xl:px-12">

      {/* ── Breadcrumb ──────────────────────────────────────────────────────── */}
      <nav className="mb-5 flex items-center gap-1.5 text-[10px] uppercase tracking-[0.22em]" aria-label="Fil d'Ariane">
        <Link href="/"       className="text-gris/60 hover:text-or transition-colors">Accueil</Link>
        <span className="text-gris-cl">/</span>
        <Link href="/boutique" className="text-gris/60 hover:text-or transition-colors">Boutique</Link>
        {categorie && (
          <>
            <span className="text-gris-cl">/</span>
            <Link href={`/boutique?cat=${categorie.id}`} className="text-gris/60 hover:text-or transition-colors">
              {categorie.nom}
            </Link>
          </>
        )}
        <span className="text-gris-cl">/</span>
        <span className="text-noir truncate max-w-[140px]">{produit.nom}</span>
      </nav>

      {/* ── Eyebrow + Badge ──────────────────────────────────────────────────── */}
      <div className="mb-3 flex items-center gap-3 flex-wrap">
        {categorie && (
          <span className="text-[9px] font-semibold uppercase tracking-[0.32em] text-or/80">
            {categorie.nom}
          </span>
        )}
        {produit.vedette && (
          <span className={cn(
            'inline-flex items-center gap-1 rounded-sm px-2 py-0.5',
            'border border-or/30 bg-or/8',
            'text-[8.5px] font-semibold uppercase tracking-[0.22em] text-or',
          )}>
            <svg width="7" height="7" viewBox="0 0 8 8" fill="none" aria-hidden>
              <path d="M4 1L5.2 3.2L7.5 3.6L5.8 5.2L6.2 7.5L4 6.4L1.8 7.5L2.2 5.2L0.5 3.6L2.8 3.2L4 1Z"
                fill="#B8893A"/>
            </svg>
            Vu dans nos rendus
          </span>
        )}
        {isEpuise && (
          <span className="inline-flex items-center rounded-sm px-2 py-0.5 bg-gris-cl text-[8.5px] font-semibold uppercase tracking-[0.22em] text-gris-dark">
            Épuisé
          </span>
        )}
      </div>

      {/* ── Nom produit ──────────────────────────────────────────────────────── */}
      <h1
        className="font-display font-light italic leading-tight text-noir"
        style={{ fontSize: 'clamp(1.75rem, 2.8vw, 2.5rem)' }}
      >
        {produit.nom}
      </h1>

      {/* ── Origine / Artisan ────────────────────────────────────────────────── */}
      {(produit.origine || produit.artisan) && (
        <p className="mt-2 text-[11px] text-gris leading-relaxed">
          {produit.artisan && <span className="font-medium text-gris-dark">{produit.artisan}</span>}
          {produit.artisan && produit.origine && ' — '}
          {produit.origine}
        </p>
      )}

      {/* ── Rating ───────────────────────────────────────────────────────────── */}
      {avisTotal > 0 && (
        <div className="mt-3 flex items-center gap-2">
          <Stars note={avisMoyenne} />
          <span className="text-[11px] text-gris">
            {avisMoyenne.toFixed(1)} ({avisTotal} avis)
          </span>
        </div>
      )}

      {/* ── Prix ─────────────────────────────────────────────────────────────── */}
      <div className="mt-5 flex items-baseline gap-3">
        {hasPromo ? (
          <>
            <span
              className="font-display font-light text-rouge-light"
              style={{ fontSize: 'clamp(1.4rem, 2.2vw, 1.9rem)' }}
            >
              {formatFCFA(produit.prix_promo!)}
            </span>
            <span className="text-[13px] text-gris line-through">{formatFCFA(produit.prix)}</span>
            <span className={cn(
              'inline-flex items-center rounded-sm px-1.5 py-0.5',
              'bg-rouge/10 text-[9px] font-bold text-rouge tracking-[0.1em]',
            )}>
              -{pctRemise}%
            </span>
          </>
        ) : (
          <span
            className="font-display font-light text-noir"
            style={{ fontSize: 'clamp(1.4rem, 2.2vw, 1.9rem)' }}
          >
            {formatFCFA(produit.prix)}
          </span>
        )}
      </div>

      {/* ── Séparateur ───────────────────────────────────────────────────────── */}
      <div className="my-5 flex items-center gap-3">
        <span className="h-[2px] w-[38px] rounded-full bg-or/60" aria-hidden />
        <span className="flex-1 h-px bg-gris-cl/60" aria-hidden />
      </div>

      {/* ── Swatches finitions (from SVG y=574-606) ──────────────────────────── */}
      <div className="mb-5">
        <p className="mb-3 text-[9.5px] font-semibold uppercase tracking-[0.28em] text-gris/70">
          Finition & Matière —{' '}
          <span className="text-noir font-normal normal-case tracking-normal text-[11px]">
            {FINITIONS.find((f) => f.id === activeFinition)?.label}
          </span>
        </p>

        <div className="flex items-center gap-2.5">
          {FINITIONS.map((f) => (
            <motion.button
              key={f.id}
              type="button"
              onClick={() => setActiveFinition(f.id)}
              whileTap={{ scale: 0.9 }}
              aria-label={f.label}
              aria-pressed={activeFinition === f.id}
              className={cn(
                'relative size-8 rounded-full transition-all duration-200',
                'border-2',
                activeFinition === f.id
                  ? 'border-or shadow-or scale-110'
                  : 'border-transparent hover:border-gris-cl hover:scale-105',
              )}
              style={{ backgroundColor: f.color }}
            >
              {activeFinition === f.id && (
                <span className="absolute inset-0 flex items-center justify-center">
                  <Check size={10} strokeWidth={2.5} className="text-blanc" aria-hidden />
                </span>
              )}
            </motion.button>
          ))}
        </div>
      </div>

      {/* ── Quantité ─────────────────────────────────────────────────────────── */}
      <div className="mb-5">
        <p className="mb-3 text-[9.5px] font-semibold uppercase tracking-[0.28em] text-gris/70">
          Quantité
          {produit.stock <= 3 && produit.stock > 0 && (
            <span className="ml-2 font-normal normal-case tracking-normal text-[11px] text-rouge-light">
              Plus que {produit.stock} en stock
            </span>
          )}
        </p>

        <div className="inline-flex items-center border border-gris-cl rounded-sm overflow-hidden">
          <button
            type="button"
            onClick={() => handleQty(-1)}
            disabled={quantite <= 1}
            className={cn(
              'flex size-10 items-center justify-center',
              'transition-colors duration-150',
              quantite > 1
                ? 'text-noir hover:bg-beige'
                : 'text-gris/30 cursor-not-allowed',
            )}
            aria-label="Diminuer la quantité"
          >
            <Minus size={14} strokeWidth={1.8} aria-hidden />
          </button>

          <span
            className="w-12 text-center text-[14px] font-semibold text-noir select-none"
            aria-live="polite"
            aria-label={`Quantité : ${quantite}`}
          >
            {quantite}
          </span>

          <button
            type="button"
            onClick={() => handleQty(+1)}
            disabled={quantite >= produit.stock || isEpuise}
            className={cn(
              'flex size-10 items-center justify-center',
              'transition-colors duration-150',
              quantite < produit.stock && !isEpuise
                ? 'text-noir hover:bg-beige'
                : 'text-gris/30 cursor-not-allowed',
            )}
            aria-label="Augmenter la quantité"
          >
            <Plus size={14} strokeWidth={1.8} aria-hidden />
          </button>
        </div>
      </div>

      {/* ── CTAs ─────────────────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-3 mb-5">
        {/* Ajouter au panier */}
        <div className="flex gap-2">
          <motion.button
            type="button"
            onClick={handleAddToCart}
            disabled={isEpuise}
            whileTap={isEpuise ? undefined : { scale: 0.98 }}
            transition={{ duration: 0.1 }}
            className={cn(
              'flex flex-1 items-center justify-center gap-2 rounded-sm py-3.5',
              'text-[10px] font-semibold uppercase tracking-[0.22em]',
              'transition-all duration-200',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-or',
              isEpuise
                ? 'cursor-not-allowed bg-gris-cl text-gris'
                : cartAdded
                ? 'bg-vert text-blanc'
                : 'bg-noir text-blanc hover:bg-noir-soft',
            )}
          >
            <AnimatePresence mode="wait" initial={false}>
              {isEpuise ? (
                <motion.span key="epuise" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="flex items-center gap-2">
                  Indisponible
                </motion.span>
              ) : cartAdded ? (
                <motion.span key="added"
                  initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.15 }}
                  className="flex items-center gap-2">
                  <Check size={13} strokeWidth={2} aria-hidden />
                  Ajouté au panier
                </motion.span>
              ) : (
                <motion.span key="add"
                  initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.15 }}
                  className="flex items-center gap-2">
                  <ShoppingBag size={13} strokeWidth={1.8} aria-hidden />
                  Ajouter au panier
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>

          {/* Wishlist */}
          <motion.button
            type="button"
            onClick={() => setWishlisted((w) => !w)}
            whileTap={{ scale: 0.88 }}
            aria-label={wishlisted ? 'Retirer des favoris' : 'Ajouter aux favoris'}
            aria-pressed={wishlisted}
            className={cn(
              'flex size-[52px] shrink-0 items-center justify-center rounded-sm',
              'border transition-all duration-200',
              wishlisted
                ? 'border-rouge/40 bg-rouge/8 text-rouge'
                : 'border-gris-cl text-gris hover:border-or/50 hover:text-or',
            )}
          >
            <Heart
              size={16}
              strokeWidth={1.8}
              fill={wishlisted ? 'currentColor' : 'none'}
              aria-hidden
            />
          </motion.button>
        </div>

        {/* Acheter maintenant */}
        {!isEpuise && (
          <motion.button
            type="button"
            whileTap={{ scale: 0.98 }}
            transition={{ duration: 0.1 }}
            className={cn(
              'flex w-full items-center justify-center gap-2 rounded-sm py-3.5',
              'bg-or text-blanc shadow-or',
              'text-[10px] font-semibold uppercase tracking-[0.22em]',
              'transition-all duration-200 hover:bg-or-dark hover:shadow-or-lg',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-or focus-visible:ring-offset-2',
            )}
          >
            Acheter maintenant
          </motion.button>
        )}
      </div>

      {/* ── Trust badges ─────────────────────────────────────────────────────── */}
      <div className="mt-auto grid grid-cols-1 gap-3 border-t border-gris-cl/60 pt-5">
        <TrustBadge
          icon={<Truck size={14} strokeWidth={1.6} />}
          label="Livraison offerte dès 150 000 FCFA"
          sub="Cotonou et environs · 48h ouvrées"
        />
        <TrustBadge
          icon={<RotateCcw size={14} strokeWidth={1.6} />}
          label="Retour sous 30 jours"
          sub="Pièce non montée, emballage d'origine"
        />
        <TrustBadge
          icon={<Award size={14} strokeWidth={1.6} />}
          label="Authenticité garantie"
          sub="Certificat d'origine artisanale inclus"
        />
      </div>

    </div>
  );
});
