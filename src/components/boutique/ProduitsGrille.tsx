'use client';

/**
 * ProduitsGrille — grille 3 colonnes avec animations stagger
 *
 * SVG layout :
 *   • 3 colonnes, gap=16px, dans la zone x=278-1440
 *   • Cards w≈340px, h≈370px
 *   • État vide élégant quand aucun résultat
 */

import { motion } from 'framer-motion';
import { PackageOpen } from 'lucide-react';
import { cn }           from '@/lib/utils';
import { ProduitCard }  from './ProduitCard';
import type { ProduitCard as TProduitCard } from '@/types/product';

// ─── Props ────────────────────────────────────────────────────────────────────

interface ProduitsGrilleProps {
  produits: TProduitCard[];
}

// ─── Animation container ──────────────────────────────────────────────────────

const gridContainer = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0 }, // géré par custom delay dans ProduitCard
  },
};

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="col-span-3 flex flex-col items-center justify-center py-24 text-center"
    >
      <div className="mb-5 flex size-16 items-center justify-center rounded-full bg-beige2">
        <PackageOpen size={26} strokeWidth={1.2} className="text-gris/50" aria-hidden />
      </div>
      <h3 className="mb-2 font-display font-light italic text-noir text-xl">
        Aucun produit trouvé
      </h3>
      <p className="max-w-[280px] text-[12px] leading-relaxed text-gris">
        Essayez d&apos;ajuster vos filtres ou d&apos;élargir votre recherche pour
        découvrir notre collection.
      </p>
    </motion.div>
  );
}

// ─── Skeleton card ────────────────────────────────────────────────────────────

export function ProduitCardSkeleton({ index = 0 }: { index?: number }) {
  return (
    <div
      className="flex flex-col rounded-sm border border-gris-cl/50 bg-blanc overflow-hidden"
      style={{ animationDelay: `${index * 75}ms` }}
    >
      {/* Image */}
      <div className="h-[220px] animate-pulse bg-beige2" />
      {/* Body */}
      <div className="flex flex-col gap-2.5 p-4">
        <div className="h-2 w-16 animate-pulse rounded-sm bg-beige3" />
        <div className="h-3.5 w-40 animate-pulse rounded-sm bg-beige3" />
        <div className="h-2.5 w-full animate-pulse rounded-sm bg-beige3" />
        <div className="h-2.5 w-3/4 animate-pulse rounded-sm bg-beige3" />
        <div className="mt-2 h-3 w-20 animate-pulse rounded-sm bg-beige3" />
        <div className="mt-1 h-9 w-full animate-pulse rounded-sm bg-beige3" />
      </div>
    </div>
  );
}

// ─── ProduitsGrille ───────────────────────────────────────────────────────────

export function ProduitsGrille({ produits }: ProduitsGrilleProps) {
  if (produits.length === 0) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-5">
        <EmptyState />
      </div>
    );
  }

  return (
    <motion.div
      variants={gridContainer}
      initial="hidden"
      animate="visible"
      className={cn(
        'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
        'gap-4 p-5',
      )}
      role="list"
      aria-label={`${produits.length} produit${produits.length > 1 ? 's' : ''}`}
    >
      {produits.map((produit, i) => (
        <div key={produit.id} role="listitem">
          <ProduitCard produit={produit} index={i} />
        </div>
      ))}
    </motion.div>
  );
}

// ─── Skeleton grille (pour le loading.tsx + Suspense) ────────────────────────

export function ProduitsGrilleSkeleton({ count = 12 }: { count?: number }) {
  return (
    <div
      className={cn(
        'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
        'gap-4 p-5',
      )}
      aria-label="Chargement des produits…"
      aria-busy="true"
    >
      {Array.from({ length: count }, (_, i) => (
        <ProduitCardSkeleton key={i} index={i} />
      ))}
    </div>
  );
}
