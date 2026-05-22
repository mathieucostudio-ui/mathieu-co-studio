/**
 * ProduitsSimilaires — "Vous aimerez aussi"
 *
 * SVG layout (y=2084-2524, h=440px, bg=#F2EDE8) :
 *   Header gauche-aligné + grille 4 cartes horizontale
 *
 * Server Component — données depuis Supabase.
 * Utilise ProduitCard existant pour la cohérence visuelle.
 */

import { getAllProduits } from '@/lib/supabase/queries/produits';
import { ProduitCard }   from '@/components/boutique/ProduitCard';
import type { ProduitCard as TProduitCard } from '@/types/product';
import { Link }          from '@/i18n/navigation';
import { ArrowRight }    from 'lucide-react';
import { cn }            from '@/lib/utils';

// ─── Props ────────────────────────────────────────────────────────────────────

interface ProduitsSimilairesProps {
  categorieId: string | null;
  /** Exclure le produit courant de la liste */
  exclureId:   string;
}

// ─── ProduitsSimilaires ───────────────────────────────────────────────────────

export async function ProduitsSimilaires({
  categorieId,
  exclureId,
}: ProduitsSimilairesProps) {
  // Si pas de catégorie, on prend les 5 produits en vedette et on exclut
  let produits: TProduitCard[] = [];
  try {
    if (categorieId) {
      const res = await getAllProduits({
        categorie_id: categorieId,
        limit:        5,   // +1 au cas où le courant est dedans
        orderBy:      'created_at',
        ascending:    false,
      });
      produits = res.data.filter((p) => p.id !== exclureId).slice(0, 4);
    }

    // Fallback : 4 produits en vedette (toutes catégories)
    if (produits.length < 2) {
      const res = await getAllProduits({ vedette: true, limit: 5 });
      produits = res.data.filter((p) => p.id !== exclureId).slice(0, 4);
    }
  } catch {
    // Silencieux — section optionnelle
    return null;
  }

  if (produits.length === 0) return null;

  return (
    <section
      className="w-full py-16"
      style={{ backgroundColor: '#F2EDE8' }}
      aria-labelledby="similaires-heading"
    >
      <div className="mx-auto max-w-[1440px] px-8 md:px-12 xl:px-16">

        {/* Header */}
        <div className="mb-10 flex items-end justify-between">
          <div>
            <div className="mb-3 flex items-center gap-3">
              <span className="block h-[2px] w-6 rounded-full bg-or/60" aria-hidden />
              <span className="text-[9px] font-semibold uppercase tracking-[0.36em] text-or/70">
                Dans la même veine
              </span>
            </div>
            <h2
              id="similaires-heading"
              className="font-display font-light italic leading-tight text-noir"
              style={{ fontSize: 'clamp(1.3rem, 2vw, 1.75rem)' }}
            >
              Vous aimerez aussi
            </h2>
          </div>

          <Link
            href="/boutique"
            className={cn(
              'hidden md:inline-flex items-center gap-1.5',
              'text-[9.5px] font-semibold uppercase tracking-[0.22em] text-gris',
              'hover:text-or transition-colors duration-200',
            )}
          >
            Voir toute la boutique
            <ArrowRight size={11} strokeWidth={2} aria-hidden />
          </Link>
        </div>

        {/* Grille 4 colonnes */}
        <div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5"
          role="list"
        >
          {produits.map((produit, i) => (
            <div key={produit.id} role="listitem">
              <ProduitCard produit={produit} index={i} />
            </div>
          ))}
        </div>

        {/* Mobile CTA */}
        <div className="mt-8 flex justify-center md:hidden">
          <Link
            href="/boutique"
            className={cn(
              'inline-flex items-center gap-2 rounded-sm border border-gris-cl',
              'px-6 py-3 text-[10px] font-semibold uppercase tracking-[0.22em] text-gris-dark',
              'hover:border-or/50 hover:text-or transition-all duration-200',
            )}
          >
            Voir toute la boutique
            <ArrowRight size={11} strokeWidth={2} aria-hidden />
          </Link>
        </div>

      </div>
    </section>
  );
}
