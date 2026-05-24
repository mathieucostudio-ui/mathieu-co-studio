'use client';

/**
 * ProduitCard — carte produit pour le catalogue boutique
 *
 * Reçoit un ProduitCard depuis Supabase (données réelles).
 * Gère : wishlist toggle, ajout panier, overlay hover, badges.
 *
 * Badges logique :
 *   • prix_promo présent          → SOLDE (rouge)
 *   • statut = 'epuise'           → étiquette grise "Épuisé"
 *   • vedette = true, pas de promo → SÉLECTION (or)
 */

import { memo, useState, useCallback } from 'react';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
import { ShoppingBag, Heart, Eye, Tag } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { Badge }  from '@/components/ui';
import { cn }     from '@/lib/utils';
import { formatFCFA, getPourcentageRemise, type ProduitCard as TProduitCard } from '@/types/product';
import { useCartStore } from '@/store/cartStore';

// ─── Props ────────────────────────────────────────────────────────────────────

export interface ProduitCardProps {
  produit:     TProduitCard;
  /** Index dans la grille — pour le délai d'entrée stagger */
  index?:      number;
  /** Prefixe de route (défaut: /boutique) */
  basePath?:   string;
}

// ─── Variants animation ───────────────────────────────────────────────────────

const SPRING = [0.16, 1, 0.3, 1] as [number, number, number, number];

export const cardReveal: Variants = {
  hidden:  { opacity: 0, y: 28 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.65, ease: SPRING, delay: i * 0.075 },
  }),
};

// ─── Helpers image placeholder ────────────────────────────────────────────────

const BG_PALETTES = [
  'bg-beige2',
  'bg-beige3',
  'bg-beige',
  'bg-beige4',
  'bg-beige5',
];

function getPlaceholderBg(id: string): string {
  // Déterministe basé sur l'id pour que la couleur ne change pas entre rendus
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = ((hash << 5) - hash) + id.charCodeAt(i);
    hash |= 0;
  }
  return BG_PALETTES[Math.abs(hash) % BG_PALETTES.length];
}

// ─── ProduitCard ──────────────────────────────────────────────────────────────

export const ProduitCard = memo(function ProduitCard({
  produit,
  index = 0,
  basePath = '/boutique',
}: ProduitCardProps) {
  const addToCart     = useCartStore((s) => s.addToCart);
  const [wishlisted,  setWishlisted]  = useState(false);
  const [cartAdded,   setCartAdded]   = useState(false);

  const isEpuise  = produit.statut === 'epuise';
  const hasPromo  = produit.prix_promo !== null && produit.prix_promo > 0;
  const pctRemise = hasPromo ? getPourcentageRemise(produit.prix, produit.prix_promo!) : 0;

  const handleWishlist = useCallback(() => {
    if (isEpuise) return;
    setWishlisted((w) => !w);
  }, [isEpuise]);

  const handleAddToCart = useCallback(() => {
    if (isEpuise || cartAdded) return;
    addToCart({
      produitId:    produit.id,
      slug:         produit.slug,
      nom:          produit.nom,
      image:        produit.images[0]?.url ?? null,
      prixUnitaire: produit.prix_promo ?? produit.prix,
      prixOriginal: produit.prix,
      quantite:     1,
    });
    setCartAdded(true);
    const tid = setTimeout(() => setCartAdded(false), 2200);
    return () => clearTimeout(tid);
  }, [isEpuise, cartAdded, addToCart, produit]);

  const placeholderBg = getPlaceholderBg(produit.id);
  const firstImage    = produit.images[0];
  const href          = `${basePath}/${produit.slug}`;

  return (
    <motion.article
      variants={cardReveal}
      custom={index}
      whileHover={{ y: -2 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      className={cn(
        'group relative flex flex-col',
        'rounded-sm border border-gris-cl/50 bg-blanc',
        'overflow-hidden',
        'transition-shadow duration-300 hover:shadow-card-hover',
        isEpuise && 'opacity-80',
      )}
      aria-label={produit.nom}
    >
      {/* ── Zone image ────────────────────────────────────────────────────── */}
      <div className="relative h-[220px] overflow-hidden">
        {/* Image ou placeholder */}
        {firstImage?.url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={firstImage.url}
            alt={firstImage.alt || produit.nom}
            className={cn(
              'absolute inset-0 h-full w-full object-cover',
              'transition-transform duration-500 ease-[cubic-bezier(0.19,1,0.22,1)]',
              'group-hover:scale-[1.04]',
            )}
            loading="lazy"
            decoding="async"
          />
        ) : (
          <div
            className={cn(
              'absolute inset-0 transition-transform duration-500 ease-[cubic-bezier(0.19,1,0.22,1)]',
              'group-hover:scale-[1.04]',
              placeholderBg,
            )}
            aria-hidden
          />
        )}

        {/* Overlay épuisé */}
        {isEpuise && (
          <div className="absolute inset-0 flex items-center justify-center bg-noir/30 backdrop-blur-[1px]">
            <span className="rounded-sm bg-gris-dark/90 px-3 py-1 text-[9px] font-semibold uppercase tracking-[0.22em] text-blanc">
              Épuisé
            </span>
          </div>
        )}

        {/* Badge produit (bottom-left) */}
        {!isEpuise && (
          <div className="absolute bottom-3 left-3 z-10 flex items-center gap-1.5">
            {hasPromo && (
              <Badge variant="solde" size="sm" animate={false} label={`-${pctRemise}%`} />
            )}
            {produit.vedette && !hasPromo && (
              <Badge variant="nouveau" size="sm" animate={false} label="Sélection" />
            )}
          </div>
        )}

        {/* Wishlist bouton (top-right) */}
        <motion.button
          type="button"
          onClick={handleWishlist}
          aria-label={wishlisted ? 'Retirer des favoris' : 'Ajouter aux favoris'}
          aria-pressed={wishlisted}
          whileTap={{ scale: 0.86 }}
          transition={{ duration: 0.1 }}
          className={cn(
            'absolute right-3 top-3 z-10',
            'flex size-7 items-center justify-center rounded-full',
            'border border-blanc/40 bg-blanc/80 backdrop-blur-sm',
            'transition-all duration-200',
            wishlisted
              ? 'border-rouge/40 bg-rouge/10 text-rouge'
              : 'text-gris hover:border-blanc hover:bg-blanc',
            isEpuise && 'pointer-events-none opacity-40',
          )}
        >
          <Heart
            size={13}
            strokeWidth={1.8}
            fill={wishlisted ? 'currentColor' : 'none'}
            aria-hidden
          />
        </motion.button>

        {/* Hover : lien vers le produit */}
        <Link
          href={href}
          className={cn(
            'absolute inset-0 flex items-center justify-center',
            'bg-noir/0 transition-colors duration-300 group-hover:bg-noir/12',
          )}
          tabIndex={-1}
          aria-hidden
        >
          <span
            className={cn(
              'flex items-center gap-1.5 rounded-sm',
              'bg-blanc/92 px-3 py-1.5 backdrop-blur-sm',
              'text-[9px] font-semibold uppercase tracking-[0.22em] text-noir',
              'opacity-0 translate-y-2 transition-all duration-300',
              'group-hover:opacity-100 group-hover:translate-y-0',
            )}
          >
            <Eye size={10} strokeWidth={2} aria-hidden />
            Voir le produit
          </span>
        </Link>
      </div>

      {/* ── Infos produit ─────────────────────────────────────────────────── */}
      <div className="flex flex-1 flex-col p-4">
        {/* Catégorie */}
        {produit.categorie && (
          <p className="mb-1 text-[9.5px] uppercase tracking-[0.22em] text-or/80">
            {produit.categorie.nom}
          </p>
        )}

        {/* Nom */}
        <h3 className="mb-2.5 font-display font-light italic leading-snug text-noir text-[0.95rem]">
          <Link
            href={href}
            className="hover:text-or transition-colors duration-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-or rounded-sm"
          >
            {produit.nom}
          </Link>
        </h3>

        {/* Description courte */}
        {produit.description_courte && (
          <p className="mb-3 line-clamp-2 text-[11px] leading-relaxed text-gris">
            {produit.description_courte}
          </p>
        )}

        {/* Prix */}
        <div className="mb-4 flex items-baseline gap-2">
          {hasPromo ? (
            <>
              <span className="text-[13px] font-semibold text-rouge-light">
                {formatFCFA(produit.prix_promo!)}
              </span>
              <span className="text-[11px] text-gris line-through">
                {formatFCFA(produit.prix)}
              </span>
            </>
          ) : (
            <span className="text-[13px] font-semibold text-noir">
              {formatFCFA(produit.prix)}
            </span>
          )}
        </div>

        {/* CTA */}
        <motion.button
          type="button"
          onClick={handleAddToCart}
          disabled={isEpuise}
          whileTap={isEpuise ? undefined : { scale: 0.97 }}
          transition={{ duration: 0.1 }}
          className={cn(
            'mt-auto flex w-full items-center justify-center gap-2 rounded-sm',
            'py-2.5 text-[9.5px] font-semibold uppercase tracking-[0.2em]',
            'transition-all duration-200',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-or',
            isEpuise
              ? 'cursor-not-allowed bg-gris-cl text-gris'
              : cartAdded
              ? 'bg-vert text-blanc'
              : 'bg-noir text-blanc hover:bg-noir-soft',
          )}
          aria-label={
            isEpuise
              ? `${produit.nom} — épuisé`
              : cartAdded
              ? 'Produit ajouté au panier'
              : `Ajouter ${produit.nom} au panier`
          }
        >
          <AnimatePresence mode="wait" initial={false}>
            {isEpuise ? (
              <motion.span
                key="epuise"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center gap-1.5"
              >
                <Tag size={11} strokeWidth={2} aria-hidden />
                Indisponible
              </motion.span>
            ) : cartAdded ? (
              <motion.span
                key="added"
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.18 }}
                className="flex items-center gap-1.5"
              >
                <svg width="11" height="11" viewBox="0 0 11 11" fill="none" aria-hidden>
                  <path d="M1.5 5.5L4.5 8.5L9.5 2.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Ajouté
              </motion.span>
            ) : (
              <motion.span
                key="add"
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.18 }}
                className="flex items-center gap-1.5"
              >
                <ShoppingBag size={11} strokeWidth={2} aria-hidden />
                Ajouter au panier
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>
      </div>
    </motion.article>
  );
});
