'use client';

/**
 * PanierClient — page panier complète
 *
 * SVG layout (1440×2000) :
 *   y=172-224 : titre "Mon Panier" + barre de progression livraison
 *   y=224-980 : grille 2 col : articles (gauche) + résumé (droite x=1020-1394)
 *     Résumé séparateurs : y=336/370/418/452/686/784
 *     Rouge = remise / Or = prix / Vert = livraison offerte
 *   y=980-1180: trust badges
 *
 * Client Component — lit useCartStore (localStorage).
 * Hydration guard (mounted) pour éviter le mismatch SSR.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence }                   from 'framer-motion';
import { ShoppingBag, Trash2, Minus, Plus, Tag, X, Check, ArrowRight, Lock, RotateCcw, Truck, Shield } from 'lucide-react';
import { Link }          from '@/i18n/navigation';
import { cn }            from '@/lib/utils';
import {
  useCartStore,
  useCartTotaux,
  formatFCFA,
  SEUIL_LIVRAISON_GRATUITE,
  type CartItem,
} from '@/store/cartStore';

// =============================================================================
//  DeliveryProgressBar
// =============================================================================

function DeliveryProgressBar({ sousTotal }: { sousTotal: number }) {
  const manque = Math.max(0, SEUIL_LIVRAISON_GRATUITE - sousTotal);
  const pct    = Math.min(100, Math.round((sousTotal / SEUIL_LIVRAISON_GRATUITE) * 100));
  const done   = manque === 0;

  return (
    <div className="mt-6">
      {/* Label */}
      <div className="mb-2 flex items-center justify-between">
        <p className={cn('text-[11px] transition-colors duration-300', done ? 'text-vert font-semibold' : 'text-gris')}>
          {done
            ? 'Livraison gratuite offerte'
            : `Plus que ${formatFCFA(manque)} pour la livraison gratuite`}
        </p>
        <span className="text-[10px] text-gris/60 tabular-nums">
          {formatFCFA(SEUIL_LIVRAISON_GRATUITE)}
        </span>
      </div>

      {/* Track */}
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-gris-cl">
        <motion.div
          className={cn('h-full rounded-full', done ? 'bg-vert' : 'bg-or')}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          aria-valuenow={pct}
          aria-valuemin={0}
          aria-valuemax={100}
          role="progressbar"
          aria-label={`${pct}% vers la livraison gratuite`}
        />
      </div>
    </div>
  );
}

// =============================================================================
//  QuantityControl
// =============================================================================

function QuantityControl({ item }: { item: CartItem }) {
  const updateQuantity = useCartStore((s) => s.updateQuantity);

  return (
    <div className="inline-flex items-center border border-gris-cl rounded-sm overflow-hidden">
      <button
        type="button"
        onClick={() => updateQuantity(item.key, item.quantite - 1)}
        disabled={item.quantite <= 1}
        aria-label="Diminuer la quantité"
        className={cn(
          'flex size-8 items-center justify-center transition-colors duration-150',
          item.quantite > 1 ? 'text-noir hover:bg-beige' : 'text-gris/30 cursor-not-allowed',
        )}
      >
        <Minus size={12} strokeWidth={2} aria-hidden />
      </button>
      <span
        className="w-10 text-center text-[13px] font-semibold text-noir select-none tabular-nums"
        aria-live="polite"
      >
        {item.quantite}
      </span>
      <button
        type="button"
        onClick={() => updateQuantity(item.key, item.quantite + 1)}
        aria-label="Augmenter la quantité"
        className="flex size-8 items-center justify-center text-noir hover:bg-beige transition-colors duration-150"
      >
        <Plus size={12} strokeWidth={2} aria-hidden />
      </button>
    </div>
  );
}

// =============================================================================
//  CartItemRow
// =============================================================================

const BG_PLACEHOLDERS = ['bg-beige2', 'bg-beige3', 'bg-beige4', 'bg-beige5', 'bg-beige'];

function getPlaceholderBg(produitId: string): string {
  let h = 0;
  for (let i = 0; i < produitId.length; i++) { h = ((h << 5) - h) + produitId.charCodeAt(i); h |= 0; }
  return BG_PLACEHOLDERS[Math.abs(h) % BG_PLACEHOLDERS.length];
}

function CartItemRow({ item }: { item: CartItem }) {
  const removeFromCart = useCartStore((s) => s.removeFromCart);
  const hasPromo       = item.prixOriginal > item.prixUnitaire;
  const bg             = getPlaceholderBg(item.produitId);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1,  y: 0  }}
      exit={{ opacity: 0, x: -24, transition: { duration: 0.22 } }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="group flex gap-5 py-6 border-b border-gris-cl/60 last:border-0"
    >
      {/* Image */}
      <Link
        href={`/boutique/${item.slug}`}
        className="shrink-0 overflow-hidden rounded-sm"
        tabIndex={-1}
        aria-hidden
      >
        <div className={cn('w-[88px] h-[88px] transition-transform duration-500 group-hover:scale-[1.04]', item.image ? '' : bg)}>
          {item.image && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={item.image}
              alt={item.nom}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          )}
        </div>
      </Link>

      {/* Infos */}
      <div className="flex flex-1 flex-col gap-1.5 min-w-0">
        {/* Nom */}
        <Link
          href={`/boutique/${item.slug}`}
          className="font-display font-light italic text-noir leading-snug hover:text-or transition-colors duration-200 text-[1rem] line-clamp-2"
        >
          {item.nom}
        </Link>

        {/* Finition */}
        {item.finition && (
          <p className="text-[10.5px] text-gris">
            Finition : <span className="text-gris-dark capitalize">{item.finition}</span>
          </p>
        )}

        {/* Prix + Qty */}
        <div className="mt-auto flex items-center justify-between gap-4 flex-wrap">
          {/* Prix */}
          <div className="flex items-baseline gap-2">
            <span className="text-[13px] font-semibold text-noir tabular-nums">
              {formatFCFA(item.prixUnitaire * item.quantite)}
            </span>
            {item.quantite > 1 && (
              <span className="text-[10.5px] text-gris">
                ({formatFCFA(item.prixUnitaire)} × {item.quantite})
              </span>
            )}
            {hasPromo && (
              <span className="text-[10.5px] text-gris line-through">
                {formatFCFA(item.prixOriginal * item.quantite)}
              </span>
            )}
          </div>

          {/* Quantité + Supprimer */}
          <div className="flex items-center gap-3">
            <QuantityControl item={item} />
            <button
              type="button"
              onClick={() => removeFromCart(item.key)}
              aria-label={`Retirer ${item.nom} du panier`}
              className={cn(
                'flex size-8 items-center justify-center rounded-sm',
                'text-gris/50 hover:text-rouge hover:bg-rouge/8',
                'transition-all duration-200',
              )}
            >
              <Trash2 size={13} strokeWidth={1.8} aria-hidden />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// =============================================================================
//  PromoCodeInput
// =============================================================================

function PromoCodeInput() {
  const applyPromoCode  = useCartStore((s) => s.applyPromoCode);
  const removePromoCode = useCartStore((s) => s.removePromoCode);
  const codePromo       = useCartStore((s) => s.codePromo);

  const [code,   setCode]   = useState('');
  const [erreur, setErreur] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Reset local error when store promo changes
  useEffect(() => {
    if (codePromo) { setCode(''); setErreur(null); setSuccess(true); }
  }, [codePromo]);

  const handleApply = useCallback(() => {
    if (!code.trim()) { setErreur('Veuillez saisir un code.'); return; }
    const result = applyPromoCode(code);
    if (result.success) {
      setErreur(null);
    } else {
      const msgs: Record<typeof result.erreur, string> = {
        code_invalide:       'Code invalide ou expiré.',
        montant_insuffisant: `Montant minimum non atteint pour ce code.`,
        deja_applique:       'Ce code est déjà appliqué.',
      };
      setErreur(msgs[result.erreur]);
    }
  }, [code, applyPromoCode]);

  // Code already applied state
  if (codePromo) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-4 flex items-center justify-between rounded-sm bg-vert/8 border border-vert/30 px-3.5 py-2.5"
      >
        <div className="flex items-center gap-2">
          <Check size={13} strokeWidth={2.5} className="text-vert shrink-0" aria-hidden />
          <div>
            <p className="text-[11px] font-semibold text-noir">{codePromo.code}</p>
            <p className="text-[10px] text-gris">{codePromo.label}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => { removePromoCode(); setSuccess(false); }}
          aria-label="Retirer le code promo"
          className="text-gris/50 hover:text-rouge transition-colors"
        >
          <X size={13} strokeWidth={2} aria-hidden />
        </button>
      </motion.div>
    );
  }

  return (
    <div className="mt-4">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Tag
            size={12}
            strokeWidth={1.8}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gris/50 pointer-events-none"
            aria-hidden
          />
          <input
            ref={inputRef}
            type="text"
            value={code}
            onChange={(e) => { setCode(e.target.value.toUpperCase()); setErreur(null); }}
            onKeyDown={(e) => e.key === 'Enter' && handleApply()}
            placeholder="Code promo"
            maxLength={20}
            className={cn(
              'w-full rounded-sm border bg-blanc py-2.5 pl-8 pr-3',
              'text-[12px] font-semibold uppercase tracking-[0.12em] text-noir',
              'placeholder:text-gris/40 placeholder:font-normal placeholder:normal-case placeholder:tracking-normal',
              'outline-none transition-all duration-200',
              erreur
                ? 'border-rouge/50 focus:border-rouge focus:ring-1 focus:ring-rouge/30'
                : 'border-gris-cl focus:border-or focus:ring-1 focus:ring-or/30',
            )}
          />
        </div>
        <button
          type="button"
          onClick={handleApply}
          className={cn(
            'shrink-0 rounded-sm border border-gris-cl px-4 py-2.5',
            'text-[10px] font-semibold uppercase tracking-[0.18em] text-gris-dark',
            'hover:border-or/60 hover:text-or transition-all duration-200',
          )}
        >
          Appliquer
        </button>
      </div>

      <AnimatePresence>
        {erreur && (
          <motion.p
            key="err"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-1.5 text-[10.5px] text-rouge overflow-hidden"
          >
            {erreur}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

// =============================================================================
//  OrderSummary
// =============================================================================

function SummaryRow({
  label,
  value,
  variant = 'default',
  sub,
}: {
  label: string;
  value: string;
  variant?: 'default' | 'remise' | 'livraison-gratuite' | 'total';
  sub?: string;
}) {
  const valueClass = cn(
    'font-medium tabular-nums',
    variant === 'remise'           && 'text-rouge',
    variant === 'livraison-gratuite' && 'text-vert',
    variant === 'total'            && 'text-noir font-semibold',
    variant === 'default'          && 'text-noir',
  );

  return (
    <div className="flex items-start justify-between gap-4 py-3.5">
      <div>
        <span className={cn('text-[12px]', variant === 'total' ? 'text-noir font-semibold' : 'text-gris')}>
          {label}
        </span>
        {sub && <p className="text-[10px] text-gris/70 mt-0.5">{sub}</p>}
      </div>
      <span className={cn('text-[12px] shrink-0', valueClass)}>{value}</span>
    </div>
  );
}

function OrderSummary() {
  const { sousTotal, remise, fraisLivraison, total, nombreArticles, resteAvantLivraisonGratuite } = useCartTotaux();
  const codePromo = useCartStore((s) => s.codePromo);

  return (
    <div className="sticky top-24 overflow-hidden rounded-sm border border-gris-cl/70 bg-blanc shadow-[0_4px_24px_rgba(21,21,21,0.06)]">

      {/* Header */}
      <div className="bg-noir px-5 py-4">
        <h2 className="text-[10px] font-semibold uppercase tracking-[0.3em] text-blanc">
          {nombreArticles} article{nombreArticles !== 1 ? 's' : ''}
        </h2>
      </div>

      <div className="divide-y divide-gris-cl/60 px-5">

        {/* Sous-total */}
        <SummaryRow label="Sous-total" value={formatFCFA(sousTotal)} />

        {/* Remise promo */}
        {remise > 0 && codePromo && (
          <SummaryRow
            label="Remise"
            value={`−${formatFCFA(remise)}`}
            variant="remise"
            sub={codePromo.label}
          />
        )}

        {/* Livraison */}
        <SummaryRow
          label="Livraison"
          value={fraisLivraison === 0 ? 'Offerte' : formatFCFA(fraisLivraison)}
          variant={fraisLivraison === 0 ? 'livraison-gratuite' : 'default'}
          sub={
            fraisLivraison > 0 && resteAvantLivraisonGratuite > 0
              ? `Encore ${formatFCFA(resteAvantLivraisonGratuite)} pour la livraison gratuite`
              : undefined
          }
        />

        {/* Total */}
        <div className="py-4">
          <div className="flex items-center justify-between">
            <span className="text-[13px] font-semibold text-noir">Total</span>
            <motion.span
              key={total}
              initial={{ scale: 0.9, opacity: 0.6 }}
              animate={{ scale: 1,   opacity: 1   }}
              transition={{ duration: 0.25 }}
              className="font-display font-light text-noir tabular-nums"
              style={{ fontSize: 'clamp(1.1rem, 1.8vw, 1.35rem)' }}
            >
              {formatFCFA(total)}
            </motion.span>
          </div>
          {remise > 0 && (
            <p className="mt-1 text-[10px] text-vert">
              Vous économisez {formatFCFA(remise)} sur cette commande
            </p>
          )}
        </div>

      </div>

      {/* Code promo */}
      <div className="px-5 pb-4">
        <p className="text-[9.5px] font-semibold uppercase tracking-[0.24em] text-gris/70 mb-2">
          Code promo
        </p>
        <PromoCodeInput />
      </div>

      {/* CTA */}
      <div className="px-5 pb-5 pt-2">
        <motion.button
          type="button"
          whileTap={{ scale: 0.98 }}
          transition={{ duration: 0.1 }}
          className={cn(
            'flex w-full items-center justify-center gap-2.5 rounded-sm py-4',
            'bg-or text-blanc shadow-or',
            'text-[10px] font-semibold uppercase tracking-[0.24em]',
            'hover:bg-or-dark hover:shadow-or-lg transition-all duration-200',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-or focus-visible:ring-offset-2',
          )}
        >
          <Lock size={12} strokeWidth={2} aria-hidden />
          Procéder au paiement
        </motion.button>

        <Link
          href="/boutique"
          className={cn(
            'mt-3 flex w-full items-center justify-center gap-1.5',
            'text-[10px] text-gris/60 hover:text-gris transition-colors duration-200',
          )}
        >
          <ArrowRight size={11} strokeWidth={1.8} className="rotate-180" aria-hidden />
          Continuer mes achats
        </Link>

        {/* Trust mini */}
        <div className="mt-4 flex items-center justify-center gap-4">
          <span className="flex items-center gap-1 text-[9.5px] text-gris/50">
            <Shield size={10} strokeWidth={1.8} aria-hidden />
            Paiement sécurisé
          </span>
          <span className="flex items-center gap-1 text-[9.5px] text-gris/50">
            <RotateCcw size={10} strokeWidth={1.8} aria-hidden />
            Retour 30 jours
          </span>
        </div>
      </div>

    </div>
  );
}

// =============================================================================
//  EmptyCart
// =============================================================================

function EmptyCart() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0  }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="flex flex-col items-center justify-center py-24 gap-7"
    >
      <div className={cn(
        'flex size-20 items-center justify-center rounded-full',
        'bg-beige2 border border-gris-cl',
      )}>
        <ShoppingBag size={28} strokeWidth={1.4} className="text-gris" aria-hidden />
      </div>

      <div className="text-center max-w-sm">
        <h2
          className="font-display font-light italic text-noir mb-3"
          style={{ fontSize: 'clamp(1.4rem, 2.5vw, 1.9rem)' }}
        >
          Votre panier est vide
        </h2>
        <p className="text-[12.5px] text-gris leading-relaxed">
          Découvrez notre collection de mobilier et objets décoratifs artisanaux.
          Ajoutez vos pièces préférées pour les retrouver ici.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <Link
          href="/boutique"
          className={cn(
            'inline-flex items-center gap-2 rounded-sm',
            'bg-noir px-6 py-3.5 text-blanc',
            'text-[10px] font-semibold uppercase tracking-[0.22em]',
            'hover:bg-noir-soft transition-colors duration-200',
          )}
        >
          <ShoppingBag size={12} strokeWidth={2} aria-hidden />
          Explorer la boutique
        </Link>
      </div>
    </motion.div>
  );
}

// =============================================================================
//  TrustStrip
// =============================================================================

function TrustStrip() {
  const BADGES = [
    { icon: <Truck     size={16} strokeWidth={1.5} />, label: 'Livraison offerte dès 150 000 FCFA',  sub: 'Cotonou et environs' },
    { icon: <RotateCcw size={16} strokeWidth={1.5} />, label: 'Retour sous 30 jours',                sub: 'Pièce non montée' },
    { icon: <Shield    size={16} strokeWidth={1.5} />, label: 'Paiement 100% sécurisé',              sub: 'Chiffrement SSL' },
  ] as const;

  return (
    <section className="w-full border-t border-gris-cl/60 bg-blanc py-10">
      <div className="mx-auto max-w-[1440px] px-8 md:px-12 xl:px-16">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {BADGES.map(({ icon, label, sub }) => (
            <div key={label} className="flex items-start gap-3.5">
              <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full bg-beige2 text-or">
                {icon}
              </span>
              <div>
                <p className="text-[12px] font-semibold text-noir leading-snug">{label}</p>
                <p className="mt-0.5 text-[10.5px] text-gris">{sub}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// =============================================================================
//  Skeleton (before hydration)
// =============================================================================

function PanierSkeleton() {
  return (
    <div className="min-h-[100dvh] bg-beige" aria-hidden>
      {/* Header */}
      <div className="bg-blanc border-b border-gris-cl py-8">
        <div className="mx-auto max-w-[1440px] px-8 md:px-12 xl:px-16">
          <div className="h-3 w-48 rounded-sm bg-beige3 animate-pulse" />
          <div className="mt-5 h-8 w-64 rounded-sm bg-beige2 animate-pulse" />
          <div className="mt-6 h-1.5 w-full rounded-full bg-beige3 animate-pulse" />
        </div>
      </div>
      {/* Content placeholder */}
      <div className="mx-auto max-w-[1440px] px-8 md:px-12 xl:px-16 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8">
          <div className="space-y-6">
            {[1,2,3].map((i) => (
              <div key={i} className="flex gap-5 py-6 border-b border-gris-cl/60">
                <div className="size-[88px] rounded-sm bg-beige2 animate-pulse shrink-0" style={{ animationDelay: `${i*80}ms` }} />
                <div className="flex-1 space-y-2">
                  <div className="h-3 w-3/4 rounded-sm bg-beige2 animate-pulse" />
                  <div className="h-4 w-1/2 rounded-sm bg-beige3 animate-pulse" />
                  <div className="h-3 w-1/3 rounded-sm bg-beige2 animate-pulse" />
                </div>
              </div>
            ))}
          </div>
          <div className="rounded-sm border border-gris-cl bg-blanc overflow-hidden animate-pulse">
            <div className="h-14 bg-beige3" />
            <div className="p-5 space-y-4">
              {[1,2,3,4].map((i) => (
                <div key={i} className="h-10 rounded-sm bg-beige2" style={{ animationDelay: `${i*60}ms` }} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// =============================================================================
//  PanierClient — composant principal
// =============================================================================

export function PanierClient() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const items      = useCartStore((s) => s.items);
  const clearCart  = useCartStore((s) => s.clearCart);
  const { sousTotal, nombreArticles } = useCartTotaux();

  // Guard SSR hydration mismatch
  if (!mounted) return <PanierSkeleton />;

  const isEmpty = nombreArticles === 0;

  return (
    <div className="min-h-[100dvh] bg-beige">

      {/* ─── Page Header ────────────────────────────────────────────── */}
      <header className="bg-blanc border-b border-gris-cl">
        <div className="mx-auto max-w-[1440px] px-8 md:px-12 xl:px-16 py-8">

          {/* Breadcrumb */}
          <nav
            className="mb-5 flex items-center gap-1.5 text-[10px] uppercase tracking-[0.22em]"
            aria-label="Fil d'Ariane"
          >
            <Link href="/"       className="text-gris/60 hover:text-or transition-colors">Accueil</Link>
            <span className="text-gris-cl">/</span>
            <Link href="/boutique" className="text-gris/60 hover:text-or transition-colors">Boutique</Link>
            <span className="text-gris-cl">/</span>
            <span className="text-noir">Panier</span>
          </nav>

          {/* Title row */}
          <div className="flex items-baseline justify-between gap-4 flex-wrap">
            <h1
              className="font-display font-light italic text-noir"
              style={{ fontSize: 'clamp(1.75rem, 2.8vw, 2.4rem)' }}
            >
              Mon Panier
            </h1>

            {!isEmpty && (
              <div className="flex items-center gap-5">
                <span className="text-[11px] text-gris">
                  {nombreArticles} article{nombreArticles !== 1 ? 's' : ''}
                  {' · '}
                  <span className="text-or font-semibold">{formatFCFA(sousTotal)}</span>
                </span>
                <button
                  type="button"
                  onClick={clearCart}
                  className="text-[10px] text-gris/50 hover:text-rouge transition-colors uppercase tracking-[0.16em]"
                >
                  Vider le panier
                </button>
              </div>
            )}
          </div>

          {/* Delivery progress */}
          {!isEmpty && <DeliveryProgressBar sousTotal={sousTotal} />}
        </div>
      </header>

      {/* ─── Main Content ────────────────────────────────────────────── */}
      <div className="mx-auto max-w-[1440px] px-8 md:px-12 xl:px-16 py-10">

        {isEmpty ? (
          <EmptyCart />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] xl:grid-cols-[1fr_400px] gap-8 xl:gap-12">

            {/* ── Articles ─────────────────────────────────────────── */}
            <div>
              <div className="mb-2 flex items-center gap-3">
                <span className="block h-[2px] w-5 rounded-full bg-or/60" aria-hidden />
                <span className="text-[9px] font-semibold uppercase tracking-[0.34em] text-or/70">
                  Articles sélectionnés
                </span>
              </div>

              <motion.ul layout className="mt-0">
                <AnimatePresence initial={false}>
                  {items.map((item) => (
                    <li key={item.key}>
                      <CartItemRow item={item} />
                    </li>
                  ))}
                </AnimatePresence>
              </motion.ul>
            </div>

            {/* ── Résumé commande ───────────────────────────────────── */}
            <div>
              <div className="mb-2 flex items-center gap-3">
                <span className="block h-[2px] w-5 rounded-full bg-or/60" aria-hidden />
                <span className="text-[9px] font-semibold uppercase tracking-[0.34em] text-or/70">
                  Résumé de commande
                </span>
              </div>
              <OrderSummary />
            </div>

          </div>
        )}

      </div>

      {/* ─── Trust strip ─────────────────────────────────────────────── */}
      <TrustStrip />

    </div>
  );
}
