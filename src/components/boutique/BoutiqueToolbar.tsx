'use client';

/**
 * BoutiqueToolbar — barre supérieure du catalogue
 *
 * SVG layout : y=352-406 (h=54px), fond blanc
 *   • Gauche : "X produits"
 *   • Droite : select tri
 */

import { useCallback, useTransition } from 'react';
import { useRouter } from '@/i18n/navigation';
import { SlidersHorizontal } from 'lucide-react';
import { cn }                 from '@/lib/utils';
import {
  useFiltresStore,
  filtresVersUrl,
  type TriColonne,
} from '@/store/filtresStore';

// ─── Options de tri ───────────────────────────────────────────────────────────

const TRI_OPTIONS: { value: string; label: string; col: TriColonne; asc: boolean }[] = [
  { value: 'recent_desc',  label: 'Plus récents',       col: 'created_at', asc: false },
  { value: 'recent_asc',   label: 'Plus anciens',        col: 'created_at', asc: true  },
  { value: 'prix_asc',     label: 'Prix croissant',      col: 'prix',       asc: true  },
  { value: 'prix_desc',    label: 'Prix décroissant',    col: 'prix',       asc: false },
  { value: 'nom_asc',      label: 'Nom A → Z',           col: 'nom',        asc: true  },
  { value: 'nom_desc',     label: 'Nom Z → A',           col: 'nom',        asc: false },
];

// ─── BoutiqueToolbar ──────────────────────────────────────────────────────────

interface BoutiqueToolbarProps {
  total:      number;
  /** Callback pour ouvrir/fermer la sidebar en mobile */
  onToggleSidebar?: () => void;
}

export function BoutiqueToolbar({ total, onToggleSidebar }: BoutiqueToolbarProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const { tri, triAscendant, setTri } = useFiltresStore();

  // Valeur sélectionnée dans le select
  const currentValue =
    TRI_OPTIONS.find((o) => o.col === tri && o.asc === triAscendant)?.value
    ?? 'recent_desc';

  const handleTri = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    const opt = TRI_OPTIONS.find((o) => o.value === e.target.value);
    if (!opt) return;

    setTri(opt.col, opt.asc);
    const s = useFiltresStore.getState();
    const params = filtresVersUrl({ ...s, tri: opt.col, triAscendant: opt.asc, page: 1 });
    const url = params.toString() ? `/boutique?${params.toString()}` : '/boutique';
    startTransition(() => router.push(url));
  }, [setTri, router]);

  return (
    <div
      className={cn(
        'flex h-[54px] items-center justify-between',
        'border-b border-gris-cl/60 bg-blanc',
        'px-5 shrink-0',
        isPending && 'opacity-60',
      )}
    >
      {/* Gauche : compteur + toggle sidebar mobile */}
      <div className="flex items-center gap-3">
        {/* Bouton sidebar mobile */}
        {onToggleSidebar && (
          <button
            type="button"
            onClick={onToggleSidebar}
            className={cn(
              'md:hidden flex items-center gap-1.5 rounded-sm',
              'border border-gris-cl px-2.5 py-1.5',
              'text-[9.5px] uppercase tracking-[0.2em] text-gris',
              'hover:border-or/50 hover:text-or transition-all duration-150',
            )}
            aria-label="Afficher les filtres"
          >
            <SlidersHorizontal size={11} strokeWidth={1.8} aria-hidden />
            Filtres
          </button>
        )}

        <p className="text-[11px] text-gris">
          <span className="font-semibold text-noir">{total}</span>
          {' '}
          {total === 1 ? 'produit' : 'produits'}
        </p>
      </div>

      {/* Droite : tri */}
      <div className="flex items-center gap-2">
        <label
          htmlFor="boutique-tri"
          className="hidden sm:block text-[10px] uppercase tracking-[0.22em] text-gris/70 whitespace-nowrap"
        >
          Trier par
        </label>
        <select
          id="boutique-tri"
          value={currentValue}
          onChange={handleTri}
          className={cn(
            'rounded-sm border border-gris-cl bg-blanc',
            'py-1.5 pl-3 pr-8',
            'text-[11px] font-medium text-noir',
            'appearance-none cursor-pointer',
            'outline-none focus:border-or/50 focus:ring-1 focus:ring-or/25',
            'hover:border-gris transition-all duration-150',
          )}
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'%3E%3Cpath d='M1 1L5 5L9 1' stroke='%23b8893a' strokeWidth='1.5' strokeLinecap='round' strokeLinejoin='round' fill='none'/%3E%3C/svg%3E")`,
            backgroundRepeat:   'no-repeat',
            backgroundPosition: 'right 10px center',
          }}
        >
          {TRI_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
