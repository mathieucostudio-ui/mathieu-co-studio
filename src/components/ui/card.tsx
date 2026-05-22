'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { Eye, Heart, ShoppingBag, Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge, type BadgeVariant } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

// ── Types ────────────────────────────────────────────────────────────────────
export interface ProductCardProps {
  imageSrc: string;
  imageAlt: string;
  category: string;
  title: string;
  price: number;
  pricePromo?: number;
  currency?: string;
  rating?: number;
  reviewCount?: number;
  badge?: BadgeVariant;
  inWishlist?: boolean;
  className?: string;
  onAddToCart?: () => void;
  onToggleWishlist?: () => void;
  onQuickView?: () => void;
  href?: string;
}

// ── Helpers ──────────────────────────────────────────────────────────────────
function formatPrice(amount: number, currency: string): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

// ── Rating stars ─────────────────────────────────────────────────────────────
function RatingStars({ rating }: { rating: number }) {
  const filled = Math.round(Math.min(5, Math.max(0, rating)));
  return (
    <div
      className="flex items-center gap-0.5"
      aria-label={`Note : ${rating} sur 5`}
    >
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={cn(
            'size-3',
            i < filled ? 'fill-or text-or' : 'fill-beige3 text-beige3',
          )}
          aria-hidden
        />
      ))}
    </div>
  );
}

// ── Action icon button ────────────────────────────────────────────────────────
function ActionIconBtn({
  onClick,
  label,
  active,
  children,
}: {
  onClick?: (e: React.MouseEvent) => void;
  label: string;
  active?: boolean;
  children: React.ReactNode;
}) {
  return (
    <motion.button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onClick?.(e);
      }}
      aria-label={label}
      whileTap={{ scale: 0.9 }}
      transition={{ duration: 0.1 }}
      className={cn(
        'flex size-9 items-center justify-center rounded-full',
        'border border-gris-cl/70 bg-blanc/75 backdrop-blur-sm',
        'text-noir shadow-[0_1px_4px_rgba(21,21,21,0.08)]',
        'transition-colors duration-150',
        'hover:border-or hover:text-or',
        active && 'border-or text-or',
      )}
    >
      {children}
    </motion.button>
  );
}

// ── ProductCard ───────────────────────────────────────────────────────────────
export function ProductCard({
  imageSrc,
  imageAlt,
  category,
  title,
  price,
  pricePromo,
  currency = 'XOF',
  rating,
  reviewCount,
  badge,
  inWishlist = false,
  className,
  onAddToCart,
  onToggleWishlist,
  onQuickView,
  href,
}: ProductCardProps) {
  const displayPrice = pricePromo ?? price;
  const hasPromo = pricePromo !== undefined && pricePromo < price;

  const article = (
    <motion.article
      whileHover={{ y: -5 }}
      transition={{ type: 'spring', stiffness: 380, damping: 28 }}
      className={cn(
        'group flex h-full flex-col overflow-hidden rounded-sm',
        'border border-gris-cl bg-blanc',
        'shadow-card hover:shadow-card-hover',
        'transition-shadow duration-300',
        className,
      )}
    >
      {/* ── Image ── */}
      <div className="relative aspect-[4/5] overflow-hidden bg-beige2">
        <Image
          src={imageSrc}
          alt={imageAlt}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
        />

        {/* Gradient overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-noir/10 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

        {/* Badge */}
        {badge && (
          <div className="absolute left-3 top-3">
            <Badge variant={badge} size="sm" />
          </div>
        )}

        {/* Action buttons — révélés au hover depuis la droite */}
        <div className="absolute right-3 top-3 flex flex-col gap-2">
          <div className="translate-x-2 opacity-0 transition-all duration-200 group-hover:translate-x-0 group-hover:opacity-100">
            <ActionIconBtn
              onClick={onToggleWishlist}
              label={inWishlist ? 'Retirer des favoris' : 'Ajouter aux favoris'}
              active={inWishlist}
            >
              <Heart
                size={15}
                strokeWidth={1.5}
                className={cn(inWishlist && 'fill-current')}
                aria-hidden
              />
            </ActionIconBtn>
          </div>

          {onQuickView && (
            <div className="translate-x-2 opacity-0 transition-all delay-[40ms] duration-200 group-hover:translate-x-0 group-hover:opacity-100">
              <ActionIconBtn onClick={onQuickView} label="Aperçu rapide">
                <Eye size={15} strokeWidth={1.5} aria-hidden />
              </ActionIconBtn>
            </div>
          )}
        </div>
      </div>

      {/* ── Content ── */}
      <div className="flex flex-1 flex-col gap-3 p-4">
        <p className="text-[9px] font-semibold uppercase tracking-[0.28em] text-or">
          {category}
        </p>

        <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-noir">
          {title}
        </h3>

        {rating !== undefined && (
          <div className="flex items-center gap-1.5">
            <RatingStars rating={rating} />
            {reviewCount !== undefined && (
              <span className="text-[11px] text-gris">({reviewCount})</span>
            )}
          </div>
        )}

        {/* ── Price + CTA ── */}
        <div className="mt-auto flex items-end justify-between gap-3 pt-1">
          <div className="flex flex-col leading-none">
            {hasPromo && (
              <span className="mb-0.5 text-[11px] text-gris line-through">
                {formatPrice(price, currency)}
              </span>
            )}
            <span
              className={cn(
                'text-base font-bold tracking-tight',
                hasPromo ? 'text-rouge' : 'text-noir',
              )}
            >
              {formatPrice(displayPrice, currency)}
            </span>
          </div>

          <Button
            variant="noir"
            size="sm"
            aria-label="Ajouter au panier"
            leftIcon={<ShoppingBag size={14} strokeWidth={1.5} />}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onAddToCart?.();
            }}
            className="shrink-0"
          />
        </div>
      </div>
    </motion.article>
  );

  if (href) {
    return (
      <a
        href={href}
        className="block h-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-or focus-visible:ring-offset-2 focus-visible:ring-offset-beige"
      >
        {article}
      </a>
    );
  }

  return article;
}

// ── ProductCardSkeleton ───────────────────────────────────────────────────────
export function ProductCardSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'flex h-full flex-col overflow-hidden rounded-sm border border-gris-cl bg-blanc',
        className,
      )}
      aria-hidden
    >
      {/* Image placeholder */}
      <div className="relative aspect-[4/5] overflow-hidden bg-beige2">
        <div className="absolute inset-0 bg-[linear-gradient(105deg,transparent_30%,rgba(255,255,255,0.6)_50%,transparent_70%)] bg-[length:200%_100%] animate-shimmer" />
      </div>

      {/* Content placeholder */}
      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="h-2.5 w-16 rounded-sm bg-beige3 animate-pulse" />
        <div className="space-y-1.5">
          <div className="h-3.5 w-full rounded-sm bg-beige2 animate-pulse" />
          <div className="h-3.5 w-3/4 rounded-sm bg-beige2 animate-pulse" />
        </div>
        <div className="mt-auto flex items-end justify-between pt-1">
          <div className="h-5 w-20 rounded-sm bg-beige3 animate-pulse" />
          <div className="h-9 w-9 rounded-sm bg-beige3 animate-pulse" />
        </div>
      </div>
    </div>
  );
}

/** Alias rétrocompatible pour la grille boutique */
export { ProductCard as Card };
