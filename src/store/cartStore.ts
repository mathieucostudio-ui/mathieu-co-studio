/**
 * CartStore — panier d'achat Mathieu&Co Studio
 *
 * Architecture :
 *   • État brut : items[], codePromo
 *   • Persistance : localStorage via Zustand persist (SSR-safe)
 *   • Calculs : fonctions pures exportées → utilisées dans les composants
 *   • Clé panier : produitId + finition → permet plusieurs finitions du même produit
 *
 * Codes promo (demo client-side — production = validation API) :
 *   BIENVENUE10  → -10%  (sans seuil)
 *   STUDIO15     → -15%  (dès 200 000 FCFA)
 *   FIDELITE25   → -25%  (dès 500 000 FCFA)
 *   LIVRAISON    → frais de port offerts (dès 50 000 FCFA)
 */

import { create }                         from 'zustand';
import { persist, createJSONStorage, devtools } from 'zustand/middleware';
import { formatFCFA }                     from '@/types/product';

// ─── Constantes ───────────────────────────────────────────────────────────────

/** Seuil de commande pour livraison offerte (FCFA) */
export const SEUIL_LIVRAISON_GRATUITE  = 150_000;

/** Frais de livraison standard (FCFA) */
export const FRAIS_LIVRAISON_DEFAUT    =   5_000;

/** Quantité maximale par ligne de panier */
export const QUANTITE_MAX_PAR_ARTICLE  =      10;

// ─── Types ────────────────────────────────────────────────────────────────────

/**
 * Une ligne du panier.
 * `key` = identifiant unique : `produitId:finition` (ou juste `produitId`
 * si pas de finition), ce qui permet d'avoir deux finitions du même produit.
 */
export interface CartItem {
  /** Clé unique dans le panier : `produitId[:finition]` */
  key:          string;
  produitId:    string;
  slug:         string;
  nom:          string;
  /** URL de la première image, null si placeholder */
  image:        string | null;
  /** Prix effectif unitaire (prix_promo ?? prix) en FCFA */
  prixUnitaire: number;
  /** Prix de base avant promotion produit (pour affichage barré) */
  prixOriginal: number;
  quantite:     number;
  /** Finition choisie (ex. 'teak', 'ebene', 'lin', 'noyer') */
  finition?:    string;
}

/**
 * Input pour addToCart — `key` et `quantite` sont optionnels :
 *   • `key` : généré automatiquement si absent
 *   • `quantite` : 1 par défaut
 */
export type CartItemInput = Omit<CartItem, 'key' | 'quantite'> & {
  key?:      string;
  quantite?: number;
};

export type TypePromo = 'pourcentage' | 'montant_fixe';

export interface CodePromo {
  code:    string;
  type:    TypePromo;
  /** Pour 'pourcentage' : 10 = 10% | Pour 'montant_fixe' : valeur en FCFA */
  valeur:  number;
  /** Seuil minimum du sous-total (0 = aucun seuil) */
  minimum: number;
  /** Label affiché dans le récapitulatif panier */
  label:   string;
}

/** Raison d'échec de l'application d'un code promo */
export type ErreurPromo =
  | 'code_invalide'
  | 'montant_insuffisant'
  | 'deja_applique';

/** Résultat de l'application d'un code promo */
export type ResultatPromo =
  | { success: true }
  | { success: false; erreur: ErreurPromo };

// ─── Codes promo (catalogue demo) ─────────────────────────────────────────────

const CODES_PROMO: Readonly<Record<string, CodePromo>> = {
  BIENVENUE10: {
    code:    'BIENVENUE10',
    type:    'pourcentage',
    valeur:  10,
    minimum: 0,
    label:   '−10% de bienvenue',
  },
  STUDIO15: {
    code:    'STUDIO15',
    type:    'pourcentage',
    valeur:  15,
    minimum: 200_000,
    label:   '−15% dès 200 000 FCFA',
  },
  FIDELITE25: {
    code:    'FIDELITE25',
    type:    'pourcentage',
    valeur:  25,
    minimum: 500_000,
    label:   '−25% dès 500 000 FCFA',
  },
  LIVRAISON: {
    code:    'LIVRAISON',
    type:    'montant_fixe',
    valeur:  FRAIS_LIVRAISON_DEFAUT,
    minimum: 50_000,
    label:   'Livraison offerte',
  },
} as const;

// ─── Calculs dérivés (fonctions pures) ────────────────────────────────────────

/** Génère la clé unique d'une ligne panier */
export function buildCartKey(produitId: string, finition?: string): string {
  return finition ? `${produitId}:${finition}` : produitId;
}

/** Sous-total avant remise et livraison (FCFA) */
export function calculerSousTotal(items: CartItem[]): number {
  return items.reduce((acc, item) => acc + item.prixUnitaire * item.quantite, 0);
}

/** Montant de la remise code promo (FCFA) */
export function calculerRemise(sousTotal: number, code: CodePromo | null): number {
  if (!code) return 0;
  if (code.type === 'pourcentage') {
    return Math.round(sousTotal * (code.valeur / 100));
  }
  // montant_fixe : ne jamais dépasser le sous-total
  return Math.min(code.valeur, sousTotal);
}

/** Frais de livraison après remise (FCFA — 0 si seuil atteint ou code LIVRAISON) */
export function calculerFraisLivraison(
  sousTotal:  number,
  remise:     number,
  codePromo:  CodePromo | null,
): number {
  if (codePromo?.code === 'LIVRAISON') return 0;
  const montantApresRemise = sousTotal - remise;
  return montantApresRemise >= SEUIL_LIVRAISON_GRATUITE ? 0 : FRAIS_LIVRAISON_DEFAUT;
}

export interface TotauxPanier {
  sousTotal:      number;
  remise:         number;
  fraisLivraison: number;
  total:          number;
  nombreArticles: number;
  /** Montant restant pour atteindre la livraison gratuite (0 si déjà atteint) */
  resteAvantLivraisonGratuite: number;
}

/** Calcule tous les totaux du panier en une passe */
export function calculerTotaux(
  items:     CartItem[],
  codePromo: CodePromo | null,
): TotauxPanier {
  const sousTotal      = calculerSousTotal(items);
  const remise         = calculerRemise(sousTotal, codePromo);
  const fraisLivraison = calculerFraisLivraison(sousTotal, remise, codePromo);
  const total          = sousTotal - remise + fraisLivraison;
  const nombreArticles = items.reduce((acc, item) => acc + item.quantite, 0);
  const resteAvantLivraisonGratuite = Math.max(
    0,
    SEUIL_LIVRAISON_GRATUITE - (sousTotal - remise),
  );

  return { sousTotal, remise, fraisLivraison, total, nombreArticles, resteAvantLivraisonGratuite };
}

/** Re-export pour éviter l'import double dans les composants panier */
export { formatFCFA };

// ─── Interface du store ────────────────────────────────────────────────────────

export interface CartState {
  items:     CartItem[];
  codePromo: CodePromo | null;

  /**
   * Ajoute un article au panier.
   * Si une ligne avec la même clé existe déjà, incrémente la quantité.
   * Respecte QUANTITE_MAX_PAR_ARTICLE.
   */
  addToCart: (item: CartItemInput) => void;

  /**
   * Supprime une ligne du panier par sa clé.
   * Utiliser buildCartKey() pour construire la clé.
   */
  removeFromCart: (key: string) => void;

  /**
   * Met à jour la quantité d'une ligne.
   * Si quantite <= 0, supprime la ligne (alias de removeFromCart).
   * Respecte QUANTITE_MAX_PAR_ARTICLE.
   */
  updateQuantity: (key: string, quantite: number) => void;

  /**
   * Valide et applique un code promo.
   * La comparaison est insensible à la casse.
   * @returns ResultatPromo — success ou raison d'échec
   */
  applyPromoCode: (code: string) => ResultatPromo;

  /** Retire le code promo actif */
  removePromoCode: () => void;

  /** Vide le panier et retire le code promo */
  clearCart: () => void;
}

// ─── Stockage SSR-safe ────────────────────────────────────────────────────────

/**
 * Stub côté serveur : localStorage n'existe pas en SSR.
 * Zustand persist n'appellera ce stub que pendant le rendu serveur —
 * la vraie hydratation se fait côté client via rehydrate automatique.
 */
const ssrStorage = {
  getItem:    (_key: string): null => null,
  setItem:    (_key: string, _value: string): void => undefined,
  removeItem: (_key: string): void => undefined,
};

// ─── Store ────────────────────────────────────────────────────────────────────

export const useCartStore = create<CartState>()(
  devtools(
    persist(
      (set, get) => ({
        items:     [],
        codePromo: null,

        // ── addToCart ──────────────────────────────────────────────────────────
        addToCart(input) {
          const key      = input.key ?? buildCartKey(input.produitId, input.finition);
          const qty      = Math.min(QUANTITE_MAX_PAR_ARTICLE, input.quantite ?? 1);
          const { items } = get();
          const idx      = items.findIndex((i) => i.key === key);

          if (idx !== -1) {
            // Ligne existante → incrémenter
            set({
              items: items.map((item, i) =>
                i === idx
                  ? { ...item, quantite: Math.min(QUANTITE_MAX_PAR_ARTICLE, item.quantite + qty) }
                  : item,
              ),
            }, false, 'addToCart/increment');
          } else {
            // Nouvelle ligne
            set({
              items: [...items, { ...input, key, quantite: qty }],
            }, false, 'addToCart/new');
          }
        },

        // ── removeFromCart ─────────────────────────────────────────────────────
        removeFromCart(key) {
          set(
            { items: get().items.filter((i) => i.key !== key) },
            false,
            'removeFromCart',
          );
        },

        // ── updateQuantity ─────────────────────────────────────────────────────
        updateQuantity(key, quantite) {
          if (quantite <= 0) {
            get().removeFromCart(key);
            return;
          }
          const clamped = Math.min(QUANTITE_MAX_PAR_ARTICLE, quantite);
          set({
            items: get().items.map((item) =>
              item.key === key ? { ...item, quantite: clamped } : item,
            ),
          }, false, 'updateQuantity');
        },

        // ── applyPromoCode ─────────────────────────────────────────────────────
        applyPromoCode(rawCode) {
          const code = rawCode.trim().toUpperCase();

          if (get().codePromo?.code === code) {
            return { success: false, erreur: 'deja_applique' };
          }

          const promo = CODES_PROMO[code];
          if (!promo) {
            return { success: false, erreur: 'code_invalide' };
          }

          const sousTotal = calculerSousTotal(get().items);
          if (promo.minimum > 0 && sousTotal < promo.minimum) {
            return { success: false, erreur: 'montant_insuffisant' };
          }

          set({ codePromo: promo }, false, 'applyPromoCode');
          return { success: true };
        },

        // ── removePromoCode ────────────────────────────────────────────────────
        removePromoCode() {
          set({ codePromo: null }, false, 'removePromoCode');
        },

        // ── clearCart ─────────────────────────────────────────────────────────
        clearCart() {
          set({ items: [], codePromo: null }, false, 'clearCart');
        },
      }),
      {
        name: 'cart-mathieu-co',
        storage: createJSONStorage(() =>
          typeof window === 'undefined' ? ssrStorage : localStorage,
        ),
        // Ne persiste que les données — pas les fonctions
        partialize: (state) => ({
          items:     state.items,
          codePromo: state.codePromo,
        }),
      },
    ),
    { name: 'CartStore' },
  ),
);

// ─── Sélecteurs mémoïsés (stable reference) ───────────────────────────────────

/**
 * Hook dérivé : retourne les totaux calculés du panier.
 * Utilise une selector function pour éviter les re-rendus inutiles.
 *
 * @example
 * const { total, nombreArticles, resteAvantLivraisonGratuite } = useCartTotaux();
 */
export function useCartTotaux(): TotauxPanier {
  return useCartStore((state) => calculerTotaux(state.items, state.codePromo));
}

/**
 * Hook dérivé : nombre total d'articles dans le panier (pour le badge nav).
 *
 * @example
 * const count = useCartCount();
 */
export function useCartCount(): number {
  return useCartStore((state) =>
    state.items.reduce((acc, item) => acc + item.quantite, 0),
  );
}
