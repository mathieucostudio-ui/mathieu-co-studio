/**
 * FiltresStore — Zustand store pour les filtres de la boutique
 *
 * Source de vérité côté client pour l'état des filtres.
 * Les composants sidebar / toolbar / pagination lisent ici et pushent
 * vers l'URL via useRouter() pour déclencher le re-fetch Server Component.
 *
 * Pattern :
 *   1. Sidebar lit searchParams → initialise ce store via initFromUrl()
 *   2. Chaque setter met à jour le store ET pousse la nouvelle URL
 *   3. Le Server Component page.tsx lit les searchParams → re-fetch Supabase
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

// ─── Constantes ───────────────────────────────────────────────────────────────

export const PRIX_MIN_DEFAUT  = 0;
export const PRIX_MAX_DEFAUT  = 2_000_000;   // 2 M FCFA
export const ITEMS_PAR_PAGE   = 12;

// ─── Types ────────────────────────────────────────────────────────────────────

export type StatutFiltre = 'actif' | 'epuise';
export type TriColonne   = 'created_at' | 'prix' | 'nom';

export interface FiltresState {
  categorieId:  string | null;
  prixMin:      number;
  prixMax:      number;
  statut:       StatutFiltre | null;   // null = tous
  recherche:    string;
  tri:          TriColonne;
  triAscendant: boolean;
  page:         number;

  // Setters (remettent page à 1 sauf setPage)
  setCategorieId:  (id: string | null) => void;
  setPrixRange:    (min: number, max: number) => void;
  setStatut:       (s: StatutFiltre | null) => void;
  setRecherche:    (s: string) => void;
  setTri:          (t: TriColonne, ascending: boolean) => void;
  setPage:         (p: number) => void;
  resetFiltres:    () => void;
}

// ─── État par défaut ──────────────────────────────────────────────────────────

export const FILTRES_DEFAUT = {
  categorieId:  null  as string | null,
  prixMin:      PRIX_MIN_DEFAUT,
  prixMax:      PRIX_MAX_DEFAUT,
  statut:       null  as StatutFiltre | null,
  recherche:    '',
  tri:          'created_at' as TriColonne,
  triAscendant: false,
  page:         1,
} as const;

/** Type mutable des valeurs hydratable (sans setters, sans readonly) */
export type FiltresHydratables = {
  categorieId:  string | null;
  prixMin:      number;
  prixMax:      number;
  statut:       StatutFiltre | null;
  recherche:    string;
  tri:          TriColonne;
  triAscendant: boolean;
  page:         number;
};

// ─── Helpers URL ──────────────────────────────────────────────────────────────

/** Sérialise l'état filtres en URLSearchParams */
export function filtresVersUrl(state: FiltresHydratables): URLSearchParams {
  const p = new URLSearchParams();
  if (state.categorieId)                        p.set('cat',  state.categorieId);
  if (state.prixMin !== PRIX_MIN_DEFAUT)        p.set('pmin', String(state.prixMin));
  if (state.prixMax !== PRIX_MAX_DEFAUT)        p.set('pmax', String(state.prixMax));
  if (state.statut)                             p.set('dispo', state.statut);
  if (state.recherche)                          p.set('q',    state.recherche);
  if (state.tri !== 'created_at')               p.set('tri',  state.tri);
  if (state.triAscendant)                       p.set('asc',  '1');
  if (state.page > 1)                           p.set('page', String(state.page));
  return p;
}

/** Hydrate le store depuis les URLSearchParams (appelé à la montée du sidebar) */
export function urlVersFiltres(params: URLSearchParams): Partial<FiltresHydratables> {
  const patch: Partial<FiltresHydratables> = {};

  const cat   = params.get('cat');
  const pmin  = params.get('pmin');
  const pmax  = params.get('pmax');
  const dispo = params.get('dispo');
  const q     = params.get('q');
  const tri   = params.get('tri');
  const asc   = params.get('asc');
  const page  = params.get('page');

  if (cat)                                     patch.categorieId  = cat;
  if (pmin && !isNaN(Number(pmin)))            patch.prixMin      = Number(pmin);
  if (pmax && !isNaN(Number(pmax)))            patch.prixMax      = Number(pmax);
  if (dispo === 'actif' || dispo === 'epuise') patch.statut       = dispo;
  if (q)                                       patch.recherche    = q;
  if (tri === 'prix' || tri === 'nom')         patch.tri          = tri;
  if (asc === '1')                             patch.triAscendant = true;
  if (page && !isNaN(Number(page)))            patch.page         = Math.max(1, Number(page));

  return patch;
}

// ─── Store ────────────────────────────────────────────────────────────────────

export const useFiltresStore = create<FiltresState>()(
  devtools(
    (set) => ({
      ...FILTRES_DEFAUT,

      setCategorieId:  (id)      => set({ categorieId: id,                 page: 1 }, false, 'setCategorieId'),
      setPrixRange:    (min, max) => set({ prixMin: min, prixMax: max,      page: 1 }, false, 'setPrixRange'),
      setStatut:       (s)       => set({ statut: s,                        page: 1 }, false, 'setStatut'),
      setRecherche:    (s)       => set({ recherche: s,                     page: 1 }, false, 'setRecherche'),
      setTri:          (t, a)    => set({ tri: t, triAscendant: a,          page: 1 }, false, 'setTri'),
      setPage:         (p)       => set({ page: p },                               false, 'setPage'),
      resetFiltres:    ()        => set({ ...FILTRES_DEFAUT },                      false, 'resetFiltres'),
    }),
    { name: 'FiltresStore' },
  ),
);
