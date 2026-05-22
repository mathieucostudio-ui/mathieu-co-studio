'use client';

/**
 * BoutiqueSidebar — 278px, bg-beige, filtres du catalogue
 *
 * SVG layout :
 *   • bg #F2EDE8, x=0 → 278px
 *   • Gold dividers (w=38, h=2, fill=#B8893A) entre chaque section
 *   • Sections : Catégories / Prix / Disponibilité
 *
 * Architecture :
 *   • Lit les searchParams au montage → initialise l'état local
 *   • Chaque changement → router.push() → Server Component re-fetch
 *   • Prix slider : état local pendant le drag, push au mouseup/touchend
 */

import {
  useState,
  useEffect,
  useRef,
  useCallback,
  useTransition,
  type ChangeEvent,
} from 'react';
import { useSearchParams } from 'next/navigation';
import { useRouter } from '@/i18n/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, RotateCcw, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  useFiltresStore,
  urlVersFiltres,
  filtresVersUrl,
  PRIX_MIN_DEFAUT,
  PRIX_MAX_DEFAUT,
  ITEMS_PAR_PAGE,
} from '@/store/filtresStore';
import type { CategorieResumee } from '@/lib/supabase/queries/categories';

// ─── Types ────────────────────────────────────────────────────────────────────

interface BoutiqueSidebarProps {
  categories: CategorieResumee[];
}

// ─── Formatage prix ───────────────────────────────────────────────────────────

function formatPrixCourt(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(n % 1_000_000 === 0 ? 0 : 1)}M`;
  if (n >= 1_000)     return `${(n / 1_000).toFixed(0)}k`;
  return String(n);
}

// ─── Sous-composants ──────────────────────────────────────────────────────────

/** Séparateur gold de section */
function GoldDivider() {
  return (
    <div className="my-5 flex items-center gap-3" aria-hidden>
      <span className="h-[2px] w-[38px] bg-or/70 rounded-full" />
      <span className="flex-1 h-px bg-gris-cl/60" />
    </div>
  );
}

/** Titre de section sidebar */
function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="mb-3.5 text-[9px] font-semibold uppercase tracking-[0.32em] text-gris/70">
      {children}
    </h3>
  );
}

/** Checkbox catégorie */
function CategorieCheckbox({
  id,
  label,
  checked,
  onChange,
}: {
  id: string | null;
  label: string;
  checked: boolean;
  onChange: (id: string | null) => void;
}) {
  return (
    <label className="group flex cursor-pointer items-center gap-3 py-1.5">
      <span
        className={cn(
          'flex size-[11px] shrink-0 items-center justify-center rounded-[2px]',
          'border transition-all duration-150',
          checked
            ? 'border-or bg-or'
            : 'border-gris/50 bg-blanc group-hover:border-or/60',
        )}
        aria-hidden
      >
        {checked && (
          <svg width="7" height="7" viewBox="0 0 7 7" fill="none" aria-hidden>
            <path d="M1 3.5L3 5.5L6 1.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        )}
      </span>
      <span
        className={cn(
          'text-[12px] leading-none transition-colors duration-150',
          checked ? 'font-medium text-noir' : 'text-gris group-hover:text-noir',
        )}
      >
        {label}
      </span>
      <input
        type="checkbox"
        checked={checked}
        onChange={() => onChange(id)}
        className="sr-only"
        aria-label={label}
      />
    </label>
  );
}

/** Slider prix double (min + max) */
function PrixSlider({
  min,
  max,
  onCommit,
}: {
  min: number;
  max: number;
  onCommit: (min: number, max: number) => void;
}) {
  const [localMin, setLocalMin] = useState(min);
  const [localMax, setLocalMax] = useState(max);

  // Sync quand les props changent (reset externe)
  useEffect(() => { setLocalMin(min); }, [min]);
  useEffect(() => { setLocalMax(max); }, [max]);

  const pctMin = ((localMin - PRIX_MIN_DEFAUT) / (PRIX_MAX_DEFAUT - PRIX_MIN_DEFAUT)) * 100;
  const pctMax = ((localMax - PRIX_MIN_DEFAUT) / (PRIX_MAX_DEFAUT - PRIX_MIN_DEFAUT)) * 100;

  const handleMinChange = (e: ChangeEvent<HTMLInputElement>) => {
    const v = Number(e.target.value);
    if (v < localMax) setLocalMin(v);
  };

  const handleMaxChange = (e: ChangeEvent<HTMLInputElement>) => {
    const v = Number(e.target.value);
    if (v > localMin) setLocalMax(v);
  };

  const handleCommit = () => onCommit(localMin, localMax);

  const thumbStyle =
    'absolute h-4 w-4 rounded-full bg-blanc border-2 border-or shadow-xs top-1/2 -translate-y-1/2 cursor-grab active:cursor-grabbing transition-transform duration-100 hover:scale-110';

  return (
    <div className="px-1">
      {/* Track */}
      <div className="relative h-1.5 rounded-full bg-gris-cl mb-5">
        {/* Filled range */}
        <div
          className="absolute h-full rounded-full bg-or"
          style={{ left: `${pctMin}%`, width: `${pctMax - pctMin}%` }}
          aria-hidden
        />
        {/* Thumb min */}
        <span
          className={thumbStyle}
          style={{ left: `calc(${pctMin}% - 8px)` }}
          aria-hidden
        />
        {/* Thumb max */}
        <span
          className={thumbStyle}
          style={{ left: `calc(${pctMax}% - 8px)` }}
          aria-hidden
        />

        {/* Input range min (invisible, par-dessus) */}
        <input
          type="range"
          min={PRIX_MIN_DEFAUT}
          max={PRIX_MAX_DEFAUT}
          step={10_000}
          value={localMin}
          onChange={handleMinChange}
          onMouseUp={handleCommit}
          onTouchEnd={handleCommit}
          aria-label="Prix minimum"
          className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
        />
        {/* Input range max (par-dessus, z-index supérieur) */}
        <input
          type="range"
          min={PRIX_MIN_DEFAUT}
          max={PRIX_MAX_DEFAUT}
          step={10_000}
          value={localMax}
          onChange={handleMaxChange}
          onMouseUp={handleCommit}
          onTouchEnd={handleCommit}
          aria-label="Prix maximum"
          className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
          style={{ zIndex: localMax === PRIX_MAX_DEFAUT ? 1 : undefined }}
        />
      </div>

      {/* Valeurs */}
      <div className="flex items-center justify-between text-[11px] text-gris">
        <span className="font-medium text-noir">
          {formatPrixCourt(localMin)} FCFA
        </span>
        <span>—</span>
        <span className="font-medium text-noir">
          {formatPrixCourt(localMax)} FCFA
        </span>
      </div>
    </div>
  );
}

// ─── BoutiqueSidebar ──────────────────────────────────────────────────────────

export function BoutiqueSidebar({ categories }: BoutiqueSidebarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  // Store Zustand (source de vérité locale)
  const {
    categorieId, prixMin, prixMax, statut, recherche,
    setCategorieId, setPrixRange, setStatut, setRecherche, resetFiltres,
  } = useFiltresStore();

  // ── Hydratation depuis l'URL au montage ──────────────────────────────────
  useEffect(() => {
    const patch = urlVersFiltres(searchParams);
    const store = useFiltresStore.getState();
    if (patch.categorieId !== undefined) store.setCategorieId(patch.categorieId);
    if (patch.prixMin     !== undefined || patch.prixMax !== undefined) {
      store.setPrixRange(patch.prixMin ?? PRIX_MIN_DEFAUT, patch.prixMax ?? PRIX_MAX_DEFAUT);
    }
    if (patch.statut    !== undefined) store.setStatut(patch.statut);
    if (patch.recherche !== undefined) store.setRecherche(patch.recherche);
    if (patch.tri       !== undefined) store.setTri(patch.tri, patch.triAscendant ?? false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // intentionnel : uniquement au montage

  // ── Pousse l'URL quand l'état change ────────────────────────────────────
  const pushUrl = useCallback((nextState: Parameters<typeof filtresVersUrl>[0]) => {
    const params = filtresVersUrl(nextState);
    const url = params.toString() ? `/boutique?${params.toString()}` : '/boutique';
    startTransition(() => router.push(url));
  }, [router]);

  // ── Handlers ────────────────────────────────────────────────────────────
  const handleCategorie = useCallback((id: string | null) => {
    const next = id === categorieId ? null : id;
    setCategorieId(next);
    const s = useFiltresStore.getState();
    pushUrl({ ...s, categorieId: next, page: 1 });
  }, [categorieId, setCategorieId, pushUrl]);

  const handlePrixCommit = useCallback((min: number, max: number) => {
    setPrixRange(min, max);
    const s = useFiltresStore.getState();
    pushUrl({ ...s, prixMin: min, prixMax: max, page: 1 });
  }, [setPrixRange, pushUrl]);

  const handleStatut = useCallback((value: 'actif' | 'epuise' | null) => {
    setStatut(value);
    const s = useFiltresStore.getState();
    pushUrl({ ...s, statut: value, page: 1 });
  }, [setStatut, pushUrl]);

  // Ref pour ignorer l'effet au premier rendu (évite navigation parasite au montage)
  const isFirstRechercheRender = useRef(true);

  const handleRecherche = useCallback((value: string) => {
    setRecherche(value);
    // L'effet ci-dessous gère le debounce + push URL
  }, [setRecherche]);

  // Debounce recherche → push URL après 450ms sans frappe
  // NE se déclenche PAS au premier rendu pour éviter une navigation inutile
  useEffect(() => {
    if (isFirstRechercheRender.current) {
      isFirstRechercheRender.current = false;
      return;
    }
    const timer = setTimeout(() => {
      const s = useFiltresStore.getState();
      pushUrl({ ...s, recherche, page: 1 });
    }, 450);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recherche]);

  const handleReset = useCallback(() => {
    resetFiltres();
    startTransition(() => router.push('/boutique'));
  }, [resetFiltres, router]);

  // ── Compteur filtres actifs ──────────────────────────────────────────────
  const nbFiltresActifs =
    (categorieId ? 1 : 0) +
    (prixMin !== PRIX_MIN_DEFAUT || prixMax !== PRIX_MAX_DEFAUT ? 1 : 0) +
    (statut ? 1 : 0) +
    (recherche ? 1 : 0);

  // ── États section collapsibles (mobile) ─────────────────────────────────
  const [openCategories,    setOpenCategories]    = useState(true);
  const [openPrix,          setOpenPrix]          = useState(true);
  const [openDisponibilite, setOpenDisponibilite] = useState(true);

  return (
    <aside
      className={cn(
        'relative w-full md:w-[278px] shrink-0',
        'bg-beige border-r border-gris-cl/60',
        'py-6 px-6',
        isPending && 'pointer-events-none',
      )}
      aria-label="Filtres de la boutique"
    >
      {/* ── En-tête ──────────────────────────────────────────────────────── */}
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-[10px] font-semibold uppercase tracking-[0.36em] text-noir">
            Filtres
          </h2>
          <AnimatePresence>
            {nbFiltresActifs > 0 && (
              <motion.span
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                className="flex size-4 items-center justify-center rounded-full bg-or text-[8px] font-bold text-blanc"
              >
                {nbFiltresActifs}
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        {nbFiltresActifs > 0 && (
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-1 text-[9.5px] uppercase tracking-[0.2em] text-gris hover:text-or transition-colors duration-150"
            aria-label="Réinitialiser les filtres"
          >
            <RotateCcw size={9} strokeWidth={2} aria-hidden />
            Effacer
          </button>
        )}
      </div>

      {/* ── Recherche ────────────────────────────────────────────────────── */}
      <div className="relative mb-1">
        <Search
          size={12}
          strokeWidth={1.8}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gris/60 pointer-events-none"
          aria-hidden
        />
        <input
          type="search"
          value={recherche}
          onChange={(e) => handleRecherche(e.target.value)}
          placeholder="Rechercher…"
          aria-label="Rechercher un produit"
          className={cn(
            'w-full rounded-sm border border-gris-cl bg-blanc/80',
            'py-2 pl-8 pr-8',
            'text-[12px] text-noir placeholder:text-gris/50',
            'outline-none transition-all duration-200',
            'focus:border-or/60 focus:bg-blanc focus:ring-1 focus:ring-or/30',
          )}
        />
        {recherche && (
          <button
            type="button"
            onClick={() => handleRecherche('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gris/50 hover:text-gris transition-colors"
            aria-label="Effacer la recherche"
          >
            <X size={11} strokeWidth={2} />
          </button>
        )}
      </div>

      <GoldDivider />

      {/* ── Catégories ───────────────────────────────────────────────────── */}
      <section>
        <button
          type="button"
          onClick={() => setOpenCategories((o) => !o)}
          className="flex w-full items-center justify-between group"
          aria-expanded={openCategories}
        >
          <SectionTitle>Catégories</SectionTitle>
          <ChevronDown
            size={12}
            strokeWidth={2}
            className={cn(
              'text-gris/50 transition-transform duration-200 mb-3.5 mr-0.5',
              openCategories ? 'rotate-180' : 'rotate-0',
            )}
            aria-hidden
          />
        </button>

        <AnimatePresence initial={false}>
          {openCategories && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              className="overflow-hidden"
            >
              {/* "Tous" */}
              <CategorieCheckbox
                id={null}
                label="Toutes les catégories"
                checked={categorieId === null}
                onChange={() => handleCategorie(null)}
              />

              {categories.map((cat) => (
                <CategorieCheckbox
                  key={cat.id}
                  id={cat.id}
                  label={cat.nom}
                  checked={categorieId === cat.id}
                  onChange={handleCategorie}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      <GoldDivider />

      {/* ── Prix ─────────────────────────────────────────────────────────── */}
      <section>
        <button
          type="button"
          onClick={() => setOpenPrix((o) => !o)}
          className="flex w-full items-center justify-between group"
          aria-expanded={openPrix}
        >
          <SectionTitle>Fourchette de prix</SectionTitle>
          <ChevronDown
            size={12}
            strokeWidth={2}
            className={cn(
              'text-gris/50 transition-transform duration-200 mb-3.5 mr-0.5',
              openPrix ? 'rotate-180' : 'rotate-0',
            )}
            aria-hidden
          />
        </button>

        <AnimatePresence initial={false}>
          {openPrix && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              className="overflow-hidden pb-1"
            >
              <PrixSlider
                min={prixMin}
                max={prixMax}
                onCommit={handlePrixCommit}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      <GoldDivider />

      {/* ── Disponibilité ────────────────────────────────────────────────── */}
      <section>
        <button
          type="button"
          onClick={() => setOpenDisponibilite((o) => !o)}
          className="flex w-full items-center justify-between group"
          aria-expanded={openDisponibilite}
        >
          <SectionTitle>Disponibilité</SectionTitle>
          <ChevronDown
            size={12}
            strokeWidth={2}
            className={cn(
              'text-gris/50 transition-transform duration-200 mb-3.5 mr-0.5',
              openDisponibilite ? 'rotate-180' : 'rotate-0',
            )}
            aria-hidden
          />
        </button>

        <AnimatePresence initial={false}>
          {openDisponibilite && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              className="overflow-hidden"
            >
              {(
                [
                  { value: null,     label: 'Tous les produits' },
                  { value: 'actif',  label: 'En stock' },
                  { value: 'epuise', label: 'Épuisé' },
                ] as { value: 'actif' | 'epuise' | null; label: string }[]
              ).map(({ value, label }) => (
                <label key={String(value)} className="group flex cursor-pointer items-center gap-3 py-1.5">
                  <span
                    className={cn(
                      'flex size-[11px] shrink-0 items-center justify-center rounded-full',
                      'border transition-all duration-150',
                      statut === value
                        ? 'border-or bg-or'
                        : 'border-gris/50 bg-blanc group-hover:border-or/60',
                    )}
                    aria-hidden
                  >
                    {statut === value && (
                      <span className="size-[5px] rounded-full bg-blanc" aria-hidden />
                    )}
                  </span>
                  <span
                    className={cn(
                      'text-[12px] leading-none transition-colors duration-150',
                      statut === value ? 'font-medium text-noir' : 'text-gris group-hover:text-noir',
                    )}
                  >
                    {label}
                  </span>
                  <input
                    type="radio"
                    name="dispo"
                    checked={statut === value}
                    onChange={() => handleStatut(value)}
                    className="sr-only"
                    aria-label={label}
                  />
                </label>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* ── Overlay chargement ───────────────────────────────────────────── */}
      <AnimatePresence>
        {isPending && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 rounded-sm bg-beige/60 backdrop-blur-[1px]"
            aria-hidden
          />
        )}
      </AnimatePresence>
    </aside>
  );
}
