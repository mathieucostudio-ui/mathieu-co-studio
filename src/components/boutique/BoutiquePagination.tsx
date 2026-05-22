'use client';

/**
 * BoutiquePagination — navigation numérique paginée
 *
 * SVG layout : y=1588-1660 (h=72px), fond blanc, centré
 * Affiche : « Préc | 1 | 2 | … | 10 | Suiv »
 */

import { useCallback, useTransition } from 'react';
import { useRouter } from '@/i18n/navigation';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn }               from '@/lib/utils';
import { useFiltresStore, filtresVersUrl } from '@/store/filtresStore';

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Génère la liste des pages à afficher (avec ellipses) */
function buildPages(current: number, total: number): (number | '…')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  const pages: (number | '…')[] = [1];

  if (current > 3)          pages.push('…');

  const start = Math.max(2, current - 1);
  const end   = Math.min(total - 1, current + 1);

  for (let i = start; i <= end; i++) pages.push(i);

  if (current < total - 2)  pages.push('…');

  pages.push(total);

  return pages;
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface BoutiquePaginationProps {
  totalPages: number;
  className?: string;
}

// ─── BoutiquePagination ───────────────────────────────────────────────────────

export function BoutiquePagination({ totalPages, className }: BoutiquePaginationProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const { page, setPage } = useFiltresStore();
  const pages = buildPages(page, totalPages);

  const navigate = useCallback((nextPage: number) => {
    if (nextPage < 1 || nextPage > totalPages || nextPage === page) return;

    setPage(nextPage);
    const s      = useFiltresStore.getState();
    const params = filtresVersUrl({ ...s, page: nextPage });
    const url    = params.toString() ? `/boutique?${params.toString()}` : '/boutique';
    startTransition(() => {
      router.push(url);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }, [page, totalPages, setPage, router]);

  if (totalPages <= 1) return null;

  return (
    <nav
      className={cn(
        'flex h-[72px] items-center justify-center gap-1',
        'border-t border-gris-cl/60 bg-blanc px-5',
        isPending && 'opacity-60 pointer-events-none',
        className,
      )}
      aria-label="Pagination des produits"
    >
      {/* Précédent */}
      <button
        type="button"
        onClick={() => navigate(page - 1)}
        disabled={page <= 1}
        aria-label="Page précédente"
        className={cn(
          'flex size-8 items-center justify-center rounded-sm',
          'border border-gris-cl text-gris',
          'transition-all duration-150',
          page > 1
            ? 'hover:border-or/50 hover:text-or cursor-pointer'
            : 'cursor-not-allowed opacity-35',
        )}
      >
        <ChevronLeft size={14} strokeWidth={1.8} aria-hidden />
      </button>

      {/* Pages */}
      {pages.map((p, idx) =>
        p === '…' ? (
          <span
            key={`ellipsis-${idx}`}
            className="flex size-8 items-center justify-center text-[11px] text-gris/50"
            aria-hidden
          >
            …
          </span>
        ) : (
          <button
            key={p}
            type="button"
            onClick={() => navigate(p)}
            aria-label={`Page ${p}`}
            aria-current={page === p ? 'page' : undefined}
            className={cn(
              'flex size-8 items-center justify-center rounded-sm',
              'text-[12px] font-medium transition-all duration-150',
              page === p
                ? 'bg-noir text-blanc border border-noir cursor-default'
                : 'border border-gris-cl text-gris hover:border-or/50 hover:text-or cursor-pointer',
            )}
          >
            {p}
          </button>
        ),
      )}

      {/* Suivant */}
      <button
        type="button"
        onClick={() => navigate(page + 1)}
        disabled={page >= totalPages}
        aria-label="Page suivante"
        className={cn(
          'flex size-8 items-center justify-center rounded-sm',
          'border border-gris-cl text-gris',
          'transition-all duration-150',
          page < totalPages
            ? 'hover:border-or/50 hover:text-or cursor-pointer'
            : 'cursor-not-allowed opacity-35',
        )}
      >
        <ChevronRight size={14} strokeWidth={1.8} aria-hidden />
      </button>
    </nav>
  );
}
