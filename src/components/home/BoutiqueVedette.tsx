'use client';

/**
 * BoutiqueVedette — 4 produits mock, fond blanc
 *
 * Maquette SVG y=2160–2760 (h=600) :
 *   • fond blanc
 *   • Header  : gauche (x=80,  y=2240, w=391, h=106) eyebrow + titre
 *               droite (x=871, y=2240, w=264, h=106) + CTA or (w=160, h=40)
 *   • 4 cartes égales 298×349, gap=16px, à y=2480
 *     – image top 200px : bg-beige2 / bg-beige / bg-beige3 / bg-beige2
 *     – badge prix overlaid sur image (y=2601 → 121px du top, x=card+115)
 *     – card 1 badge or (SÉLECTION), card 2 badge noir (NOUVEAU), card 4 badge or
 *
 * Images : placeholders en attendant les assets produit.
 */

import { memo, useState, useCallback } from 'react';
import { motion, useReducedMotion, AnimatePresence, type Variants } from 'framer-motion';
import { ShoppingBag, Heart, ArrowUpRight, Eye } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { Badge } from '@/components/ui';
import { type BadgeVariant } from '@/components/ui';
import { cn } from '@/lib/utils';
import { useCartStore } from '@/store/cartStore';

// ─────────────────────────────────────────────────────────────────────────────
//  Données produits mock
// ─────────────────────────────────────────────────────────────────────────────
interface Product {
  id: string;
  name: string;
  material: string;
  price: number;           // FCFA
  imageBg: string;         // couleur placeholder SVG
  badge?: BadgeVariant;
  href: string;
}

function formatFCFA(n: number) {
  return n.toLocaleString('fr-FR') + ' FCFA';
}

const PRODUCTS: Product[] = [
  {
    id: 'fauteuil-okonkwo',
    name: 'Fauteuil Okonkwo',
    material: 'Bois de teck sculpté à la main',
    price: 245_000,
    imageBg: 'bg-beige2',
    badge: 'nouveau',
    href: '/boutique/fauteuil-okonkwo',
  },
  {
    id: 'lampe-zephyr',
    name: 'Lampe Zéphyr',
    material: 'Laiton et verre soufflé bouche',
    price: 89_000,
    imageBg: 'bg-beige',
    badge: 'best',
    href: '/boutique/lampe-zephyr',
  },
  {
    id: 'table-adinkra',
    name: 'Table Basse Adinkra',
    material: 'Marbre blanc et laiton doré',
    price: 185_000,
    imageBg: 'bg-beige3',
    href: '/boutique/table-basse-adinkra',
  },
  {
    id: 'miroir-oshun',
    name: 'Miroir Oshun',
    material: 'Bois flotté et cadre laiton',
    price: 125_000,
    imageBg: 'bg-beige2',
    badge: 'nouveau',
    href: '/boutique/miroir-oshun',
  },
];

// ─────────────────────────────────────────────────────────────────────────────
//  Animation variants
// ─────────────────────────────────────────────────────────────────────────────
const SPRING: [number, number, number, number] = [0.16, 1, 0.3, 1];

const headerContainer: Variants = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.1 } },
};

const fadeUp: Variants = {
  hidden:  { opacity: 0, y: 22 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.65, ease: SPRING } },
};

const gridContainer: Variants = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.1, delayChildren: 0.1 } },
};

const cardReveal: Variants = {
  hidden:  { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: SPRING } },
};

// ─────────────────────────────────────────────────────────────────────────────
//  ProductCard — mémoïsé, avec wishlist + hover actions
// ─────────────────────────────────────────────────────────────────────────────
const ProductCard = memo(function ProductCard({
  product,
  reduced,
}: {
  product: Product;
  reduced: boolean | null;
}) {
  const addToCart   = useCartStore((s) => s.addToCart);
  const [wishlisted,  setWishlisted]  = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);

  const handleWishlist = useCallback(() => setWishlisted((w) => !w), []);

  const handleAddToCart = useCallback(() => {
    if (addedToCart) return;
    addToCart({
      produitId:    product.id,
      slug:         product.href.replace('/boutique/', ''),
      nom:          product.name,
      image:        null,
      prixUnitaire: product.price,
      prixOriginal: product.price,
      quantite:     1,
    });
    setAddedToCart(true);
    const t = setTimeout(() => setAddedToCart(false), 2200);
    return () => clearTimeout(t);
  }, [addedToCart, addToCart, product]);

  return (
    <motion.article
      variants={reduced ? undefined : cardReveal}
      className={cn(
        'group relative flex flex-col',
        'rounded-sm border border-gris-cl/50 bg-blanc',
        'overflow-hidden transition-shadow duration-300',
        'hover:shadow-card-hover',
      )}
    >
      {/* ── Image placeholder (SVG : h=200px) ───────────────────────────── */}
      <div className="relative h-[200px] overflow-hidden">
        {/* Fond coloré (à remplacer par <Image>) */}
        <div
          className={cn(
            'absolute inset-0 transition-transform duration-500 ease-out-expo',
            'group-hover:scale-[1.04]',
            product.imageBg,
          )}
          aria-hidden
        />

        {/* Badge variant (SVG : x=card+115, y=card+121, w=68, h=22) */}
        {product.badge && (
          <div className="absolute left-3 bottom-3 z-10">
            <Badge variant={product.badge} size="sm" animate={false} />
          </div>
        )}

        {/* Wishlist bouton */}
        <motion.button
          type="button"
          onClick={handleWishlist}
          aria-label={wishlisted ? 'Retirer des favoris' : 'Ajouter aux favoris'}
          aria-pressed={wishlisted}
          whileTap={reduced ? undefined : { scale: 0.88 }}
          transition={{ duration: 0.1 }}
          className={cn(
            'absolute right-3 top-3 z-10',
            'flex size-7 items-center justify-center rounded-full',
            'border border-blanc/40 bg-blanc/80 backdrop-blur-sm',
            'transition-all duration-200',
            wishlisted
              ? 'border-rouge/40 bg-rouge/10 text-rouge'
              : 'text-gris hover:border-blanc hover:bg-blanc',
          )}
        >
          <Heart
            size={13}
            strokeWidth={1.8}
            fill={wishlisted ? 'currentColor' : 'none'}
            aria-hidden
          />
        </motion.button>

        {/* Voir le produit — overlay hover sur image */}
        <div
          className={cn(
            'absolute inset-0 flex items-center justify-center',
            'bg-noir/0 transition-colors duration-300 group-hover:bg-noir/15',
          )}
          aria-hidden
        >
          <span
            className={cn(
              'flex items-center gap-1.5 rounded-sm',
              'bg-blanc/90 px-3 py-1.5 backdrop-blur-sm',
              'text-[9px] font-semibold uppercase tracking-[0.22em] text-noir',
              'opacity-0 transition-all duration-300 translate-y-2',
              'group-hover:opacity-100 group-hover:translate-y-0',
            )}
          >
            <Eye size={10} strokeWidth={2} aria-hidden />
            Aperçu
          </span>
        </div>
      </div>

      {/* ── Infos produit (SVG : h=149px restants) ──────────────────────── */}
      <div className="flex flex-1 flex-col p-4">
        {/* Matière */}
        <p className="mb-1 text-[10px] uppercase tracking-[0.22em] text-gris/70">
          {product.material}
        </p>

        {/* Nom produit */}
        <h3 className="mb-3 font-display font-light italic leading-snug text-noir text-[1rem]">
          <Link
            href={product.href}
            className="hover:text-or transition-colors duration-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-or rounded-sm"
          >
            {product.name}
          </Link>
        </h3>

        {/* Prix */}
        <p className="mb-4 text-[13px] font-semibold text-noir">
          {formatFCFA(product.price)}
        </p>

        {/* CTA ajouter au panier */}
        <motion.button
          type="button"
          onClick={handleAddToCart}
          whileTap={reduced ? undefined : { scale: 0.97 }}
          transition={{ duration: 0.1 }}
          className={cn(
            'mt-auto flex w-full items-center justify-center gap-2 rounded-sm',
            'py-2.5',
            'text-[9.5px] font-semibold uppercase tracking-[0.2em]',
            'transition-all duration-200',
            addedToCart
              ? 'bg-vert text-blanc'
              : 'bg-noir text-blanc hover:bg-noir-soft',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-or',
          )}
          aria-label={
            addedToCart
              ? 'Produit ajouté au panier'
              : `Ajouter ${product.name} au panier`
          }
        >
          <AnimatePresence mode="wait" initial={false}>
            {addedToCart ? (
              <motion.span
                key="added"
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.18 }}
                className="flex items-center gap-1.5"
              >
                {/* Checkmark inline SVG pour éviter un import supplémentaire */}
                <svg width="11" height="11" viewBox="0 0 11 11" fill="none" aria-hidden>
                  <path d="M1.5 5.5L4.5 8.5L9.5 2.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
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

// ─────────────────────────────────────────────────────────────────────────────
//  BoutiqueVedette — composant principal
// ─────────────────────────────────────────────────────────────────────────────
export function BoutiqueVedette() {
  const reduced = useReducedMotion();

  return (
    <section
      className="w-full bg-blanc"
      aria-labelledby="boutique-heading"
    >
      <div className="mx-auto max-w-7xl px-6 py-16 md:px-20 md:py-20 xl:px-24">

        {/* ── Header ─────────────────────────────────────────────────────── */}
        <motion.div
          variants={reduced ? undefined : headerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          className="mb-12 flex flex-col gap-6 md:flex-row md:items-end md:justify-between"
        >
          {/* Gauche : eyebrow + titre (SVG : w=391, h=106) */}
          <motion.div variants={reduced ? undefined : fadeUp} className="max-w-sm">
            <div className="mb-4 flex items-center gap-3">
              <span className="block h-px w-6 bg-or/55" aria-hidden />
              <span className="text-[9px] font-semibold uppercase tracking-[0.36em] text-or/75">
                La boutique
              </span>
            </div>
            <h2
              id="boutique-heading"
              className="font-display font-light italic leading-tight text-noir"
              style={{ fontSize: 'clamp(1.9rem, 3vw, 2.6rem)' }}
            >
              Pièces en Vedette
            </h2>
            <p className="mt-3 text-[12.5px] leading-relaxed text-gris">
              Artisanat africain contemporain et design international — une sélection
              curatée par notre directeur artistique.
            </p>
          </motion.div>

          {/* Droite : CTA or (SVG : x=871, fill=#B8893A, w=160, h=40) */}
          <motion.div variants={reduced ? undefined : fadeUp} className="shrink-0">
            <Link
              href="/boutique"
              className={cn(
                'inline-flex items-center gap-2 rounded-sm',
                'bg-or px-5 py-2.5',
                'text-[9.5px] font-semibold uppercase tracking-[0.22em] text-blanc',
                'shadow-or transition-all duration-200 hover:bg-or-dark hover:shadow-or-lg',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-or',
                'focus-visible:ring-offset-2 focus-visible:ring-offset-blanc',
              )}
            >
              Explorer la boutique
              <ArrowUpRight size={11} strokeWidth={2} aria-hidden />
            </Link>
          </motion.div>
        </motion.div>

        {/* ── Grille produits (SVG : 4×298px, gap=16px) ──────────────────── */}
        <motion.div
          variants={reduced ? undefined : gridContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          className="grid grid-cols-2 gap-4 lg:grid-cols-4"
          role="list"
          aria-label="Quatre produits en vedette"
        >
          {PRODUCTS.map((product) => (
            <div key={product.id} role="listitem">
              <ProductCard product={product} reduced={reduced} />
            </div>
          ))}
        </motion.div>

        {/* ── Lien voir tout — bas centré ─────────────────────────────────── */}
        <motion.div
          initial={reduced ? undefined : { opacity: 0, y: 16 }}
          whileInView={reduced ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55, delay: 0.5, ease: SPRING }}
          className="mt-10 flex justify-center"
        >
          <Link
            href="/boutique"
            className={cn(
              'flex items-center gap-2',
              'text-[10px] font-semibold uppercase tracking-[0.28em] text-gris',
              'transition-colors duration-200 hover:text-or',
              'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-or rounded-sm',
            )}
          >
            Voir tous les produits
            <ArrowUpRight size={12} strokeWidth={2} aria-hidden />
          </Link>
        </motion.div>

      </div>
    </section>
  );
}
