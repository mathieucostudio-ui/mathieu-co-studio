import Image from 'next/image';
import { Eye, Heart, ShoppingCart, Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge, type BadgeVariant } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

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

function formatPrice(amount: number, currency: string): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

function RatingStars({ rating }: { rating: number }) {
  const filled = Math.round(Math.min(5, Math.max(0, rating)));

  return (
    <div className="flex items-center gap-0.5" aria-label={`Note ${rating} sur 5`}>
      {Array.from({ length: 5 }).map((_, index) => (
        <Star
          key={index}
          className={cn(
            'size-3',
            index < filled ? 'fill-or text-or' : 'fill-beige3 text-beige3',
          )}
          aria-hidden
        />
      ))}
    </div>
  );
}

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

  const content = (
    <article
      className={cn(
        'group flex h-full flex-col overflow-hidden rounded-sm border border-gris-cl bg-blanc transition-shadow duration-300',
        'hover:shadow-[0_12px_40px_rgba(21,21,21,0.08)]',
        className,
      )}
    >
      <div className="relative aspect-[4/5] overflow-hidden bg-beige3">
        <Image
          src={imageSrc}
          alt={imageAlt}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
        />

        {badge ? (
          <div className="absolute left-3 top-3">
            <Badge variant={badge} />
          </div>
        ) : null}

        <div className="absolute right-3 top-3 flex flex-col gap-2">
          <button
            type="button"
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              onToggleWishlist?.();
            }}
            aria-label={inWishlist ? 'Retirer des favoris' : 'Ajouter aux favoris'}
            className={cn(
              'flex size-9 items-center justify-center rounded-full border border-gris-cl/80 bg-blanc/70 backdrop-blur-sm transition-colors',
              'hover:border-or hover:text-or',
              inWishlist && 'border-or text-or',
            )}
          >
            <Heart className={cn('size-4', inWishlist && 'fill-current')} />
          </button>

          {onQuickView ? (
            <button
              type="button"
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                onQuickView();
              }}
              className="flex size-9 items-center justify-center rounded-full border border-gris-cl/80 bg-blanc/70 text-noir backdrop-blur-sm transition-colors hover:border-or hover:text-or"
              aria-label="Aperçu rapide"
            >
              <Eye className="size-4" aria-hidden />
            </button>
          ) : null}
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <p className="text-[9px] font-semibold uppercase tracking-[0.25em] text-or">
          {category}
        </p>

        <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-noir">
          {title}
        </h3>

        {rating !== undefined ? (
          <div className="flex items-center gap-2">
            <RatingStars rating={rating} />
            {reviewCount !== undefined ? (
              <span className="text-xs text-gris">({reviewCount})</span>
            ) : null}
          </div>
        ) : null}

        <div className="mt-auto flex items-end justify-between gap-3">
          <div className="flex flex-col">
            {hasPromo ? (
              <span className="text-xs text-gris line-through">
                {formatPrice(price, currency)}
              </span>
            ) : null}
            <span
              className={cn(
                'text-base font-bold',
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
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              onAddToCart?.();
            }}
            className="shrink-0 px-3"
          >
            <ShoppingCart className="size-4" aria-hidden />
          </Button>
        </div>
      </div>
    </article>
  );

  if (href) {
    return (
      <a href={href} className="block h-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-or focus-visible:ring-offset-2 focus-visible:ring-offset-beige">
        {content}
      </a>
    );
  }

  return content;
}

/** Alias pour la grille boutique */
export { ProductCard as Card };
