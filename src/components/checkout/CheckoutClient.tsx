'use client';

import { useState, useCallback, useEffect, useId, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import {
  Check, ChevronLeft, Lock, CreditCard, Smartphone,
  Building2, Globe, Shield, RotateCcw, Truck,
  MapPin, User, Eye, EyeOff, Wifi,
} from 'lucide-react';
import { Link }           from '@/i18n/navigation';
import { cn }             from '@/lib/utils';
import { useCartStore, useCartTotaux, formatFCFA } from '@/store/cartStore';

// ─── Types ────────────────────────────────────────────────────────────────────

type PayMethod = 'carte' | 'mobile' | 'paypal' | 'virement';
type MoMoOp   = 'mtn' | 'moov' | 'wave';
type CardBrand = 'visa' | 'mastercard' | 'other';
type CardFocus = 'number' | 'name' | 'expiry' | 'cvc' | null;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtCard(v: string): string {
  return v.replace(/\D/g, '').slice(0, 16).replace(/(\d{4})(?=\d)/g, '$1 ');
}
function fmtExpiry(v: string): string {
  const d = v.replace(/\D/g, '').slice(0, 4);
  return d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d;
}
function detectBrand(n: string): CardBrand {
  const c = n.replace(/\s/g, '');
  if (/^4/.test(c))              return 'visa';
  if (/^5[1-5]|^2[2-7]/.test(c)) return 'mastercard';
  return 'other';
}

// ─── SVG Logos ────────────────────────────────────────────────────────────────

function VisaLogo({ className }: { className?: string }) {
  return (
    <svg width="38" height="24" viewBox="0 0 42 26" fill="none" aria-label="Visa" className={className}>
      <rect width="42" height="26" rx="4" fill="white" fillOpacity="0.15"/>
      <path d="M17.5 18H15.1l1.6-9.8h2.4L17.5 18Z" fill="white"/>
      <path d="M25.3 8.4c-.55-.2-1.4-.44-2.45-.44-2.7 0-4.6 1.4-4.6 3.4-.02 1.47 1.32 2.28 2.33 2.77 1.03.5 1.38.82 1.38 1.27-.02.68-.8.99-1.55.99-1.03 0-1.59-.16-2.44-.53l-.34-.16-.37 2.12c.65.29 1.87.54 3.15.55 2.8 0 4.6-1.37 4.62-3.49.01-1.16-.69-2.05-2.2-2.77-.91-.47-1.47-.78-1.47-1.26.01-.43.47-.88 1.52-.88.87-.02 1.5.19 1.99.4l.24.11.36-2.08Z" fill="white"/>
      <path d="M29.4 14.7c.22-.59 1.07-2.9 1.07-2.9-.01.02.22-.6.36-.99l.18.9s.5 2.37.6 2.99H29.4Zm3.38-6.5h-2.05c-.63 0-1.1.18-1.37.83l-3.78 9.97h2.78l.55-1.57h3.4l.32 1.57h2.46L32.78 8.2Z" fill="white"/>
      <path d="M13.2 8.2L10.6 14.2l-.28-1.37c-.47-1.68-1.98-3.5-3.68-4.4l2.37 8.6h2.8L16.0 8.2h-2.8Z" fill="white"/>
      <path d="M8.3 8.2H4l-.05.22c3.4.86 5.66 2.95 6.49 4.4L9.6 9.1c-.16-.64-.62-.87-1.3-.9Z" fill="#F9A533"/>
    </svg>
  );
}

function MastercardLogo({ className }: { className?: string }) {
  return (
    <svg width="38" height="24" viewBox="0 0 42 26" fill="none" aria-label="Mastercard" className={className}>
      <circle cx="16" cy="13" r="8" fill="#EB001B"/>
      <circle cx="26" cy="13" r="8" fill="#F79E1B"/>
      <path d="M21 6.8A8 8 0 0 1 25 13 8 8 0 0 1 21 19.2 8 8 0 0 1 17 13 8 8 0 0 1 21 6.8Z" fill="#FF5F00"/>
    </svg>
  );
}

function VisaLogoCard({ active = false }: { active?: boolean }) {
  return (
    <svg width="42" height="26" viewBox="0 0 42 26" fill="none" aria-label="Visa"
      className={cn('transition-opacity duration-200', active ? 'opacity-100' : 'opacity-35')}>
      <rect width="42" height="26" rx="4" fill="#F4F4F4" stroke="#E0DEDA" strokeWidth="1"/>
      <path d="M17.5 18H15.1l1.6-9.8h2.4L17.5 18Z" fill="#1A1F71"/>
      <path d="M25.3 8.4c-.55-.2-1.4-.44-2.45-.44-2.7 0-4.6 1.4-4.6 3.4-.02 1.47 1.32 2.28 2.33 2.77 1.03.5 1.38.82 1.38 1.27-.02.68-.8.99-1.55.99-1.03 0-1.59-.16-2.44-.53l-.34-.16-.37 2.12c.65.29 1.87.54 3.15.55 2.8 0 4.6-1.37 4.62-3.49.01-1.16-.69-2.05-2.2-2.77-.91-.47-1.47-.78-1.47-1.26.01-.43.47-.88 1.52-.88.87-.02 1.5.19 1.99.4l.24.11.36-2.08Z" fill="#1A1F71"/>
      <path d="M29.4 14.7c.22-.59 1.07-2.9 1.07-2.9-.01.02.22-.6.36-.99l.18.9s.5 2.37.6 2.99H29.4Zm3.38-6.5h-2.05c-.63 0-1.1.18-1.37.83l-3.78 9.97h2.78l.55-1.57h3.4l.32 1.57h2.46L32.78 8.2Z" fill="#1A1F71"/>
      <path d="M13.2 8.2L10.6 14.2l-.28-1.37c-.47-1.68-1.98-3.5-3.68-4.4l2.37 8.6h2.8L16.0 8.2h-2.8Z" fill="#1A1F71"/>
      <path d="M8.3 8.2H4l-.05.22c3.4.86 5.66 2.95 6.49 4.4L9.6 9.1c-.16-.64-.62-.87-1.3-.9Z" fill="#F9A533"/>
    </svg>
  );
}

function MastercardLogoCard({ active = false }: { active?: boolean }) {
  return (
    <svg width="42" height="26" viewBox="0 0 42 26" fill="none" aria-label="Mastercard"
      className={cn('transition-opacity duration-200', active ? 'opacity-100' : 'opacity-35')}>
      <rect width="42" height="26" rx="4" fill="#F4F4F4" stroke="#E0DEDA" strokeWidth="1"/>
      <circle cx="16" cy="13" r="6.5" fill="#EB001B"/>
      <circle cx="26" cy="13" r="6.5" fill="#F79E1B"/>
      <path d="M21 7.93A6.5 6.5 0 0 1 24.5 13 6.5 6.5 0 0 1 21 18.07 6.5 6.5 0 0 1 17.5 13 6.5 6.5 0 0 1 21 7.93Z" fill="#FF5F00"/>
    </svg>
  );
}

function PayPalLogo() {
  return (
    <svg width="72" height="20" viewBox="0 0 72 20" fill="none" aria-label="PayPal">
      <path d="M8.8 2H3.5L0 18h3.9l.8-4.8H7c3.4 0 6-1.8 6.6-5.3C14.3 4.2 12.7 2 8.8 2Zm.8 6c-.3 1.7-1.6 2.7-3.4 2.7H4.5l1-5.6h1.8c1.8 0 2.6.9 2.3 2.9Z" fill="#003087"/>
      <path d="M22.4 2h-5.3L13.6 18h3.9l.8-4.8H20.6c3.4 0 6-1.8 6.6-5.3.7-3.7-.9-5.9-4.8-5.9Zm.8 6c-.3 1.7-1.6 2.7-3.4 2.7h-1.7l1-5.6h1.8c1.8 0 2.6.9 2.3 2.9Z" fill="#009CDE"/>
      <path d="M38.6 7.9c-.2 1.2-.9 2.2-2 3s-2.5 1.2-4 1.2h-1.2l-.8 5.9h-3.8L30 2h6.3c2.8 0 4.4 1.4 3.9 4.1l-.1.7-.3 1.1Z" fill="#012169"/>
      <text x="42" y="14" fontFamily="Arial" fontSize="11" fontWeight="700" fill="#003087">Pay</text>
      <text x="57" y="14" fontFamily="Arial" fontSize="11" fontWeight="700" fill="#009CDE">Pal</text>
    </svg>
  );
}

// ─── 3D Card Preview ──────────────────────────────────────────────────────────

function CardDigitGroup({ digits, highlight }: { digits: string; highlight: boolean }) {
  return (
    <div className={cn('flex gap-0.5 transition-all duration-300', highlight && 'scale-105')}>
      {Array.from({ length: 4 }).map((_, i) => {
        const char = digits[i];
        return (
          <div
            key={i}
            className={cn(
              'relative w-[9px] h-[16px] overflow-hidden',
              'text-[14px] font-bold leading-none',
              highlight ? 'text-or' : 'text-white/90',
            )}
          >
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.span
                key={char ?? 'placeholder'}
                initial={{ y: 12, opacity: 0 }}
                animate={{ y: 0,  opacity: 1 }}
                exit={{ y: -12,  opacity: 0 }}
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                className="absolute inset-0 flex items-center justify-center"
              >
                {char ?? '•'}
              </motion.span>
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}

interface CardPreviewProps {
  num: string;
  name: string;
  expiry: string;
  cvc: string;
  brand: CardBrand;
  focus: CardFocus;
}

function CardPreview({ num, name, expiry, cvc, brand, focus }: CardPreviewProps) {
  const isFlipped = focus === 'cvc';

  const raw   = num.replace(/\s/g, '');
  const g1    = raw.slice(0, 4);
  const g2    = raw.slice(4, 8);
  const g3    = raw.slice(8, 12);
  const g4    = raw.slice(12, 16);

  return (
    <div
      className="mx-auto w-full max-w-[340px] mb-6"
      style={{ perspective: '1000px', height: '192px' }}
    >
      <motion.div
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ type: 'spring', stiffness: 120, damping: 20 }}
        style={{ transformStyle: 'preserve-3d', position: 'relative', width: '100%', height: '100%' }}
      >
        {/* Card Front */}
        <div
          className="absolute inset-0 rounded-xl overflow-hidden"
          style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}
        >
          {/* Background gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#1e1e1e] via-[#2a2419] to-[#151515]" />
          {/* Gold shimmer overlay */}
          <div className="absolute inset-0 opacity-20"
            style={{ background: 'radial-gradient(ellipse at 70% 30%, rgba(184,137,58,0.6) 0%, transparent 60%)' }} />
          {/* Edge refraction */}
          <div className="absolute inset-0 rounded-xl border border-white/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]" />

          {/* Content */}
          <div className="relative h-full flex flex-col justify-between p-6">
            {/* Top row */}
            <div className="flex items-start justify-between">
              <div className="flex flex-col gap-1">
                <Wifi size={18} strokeWidth={1.5} className="text-white/60 rotate-90" aria-hidden />
              </div>
              <div>
                {brand === 'visa' && <VisaLogo />}
                {brand === 'mastercard' && <MastercardLogo />}
                {brand === 'other' && (
                  <div className="w-[38px] h-[24px] rounded border border-white/20" />
                )}
              </div>
            </div>

            {/* Chip */}
            <div className="flex items-center gap-5">
              <div className="w-9 h-7 rounded bg-gradient-to-br from-[#d4a85c] to-[#8a6030]
                flex items-center justify-center border border-[#b8893a]/40">
                <div className="grid grid-cols-2 gap-[2px]">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="w-[5px] h-[4px] rounded-[1px] bg-[#5e3e18]/60" />
                  ))}
                </div>
              </div>

              {/* Card number */}
              <div className="flex items-center gap-2.5">
                {[g1, g2, g3, g4].map((g, i) => (
                  <CardDigitGroup
                    key={i}
                    digits={g}
                    highlight={focus === 'number'}
                  />
                ))}
              </div>
            </div>

            {/* Bottom row */}
            <div className="flex items-end justify-between">
              <div>
                <p className="text-[8px] font-semibold uppercase tracking-[0.22em] text-white/40 mb-0.5">
                  Titulaire
                </p>
                <motion.p
                  className={cn(
                    'text-[12px] font-semibold uppercase tracking-wide text-white/90 transition-colors duration-300',
                    focus === 'name' && 'text-or',
                  )}
                >
                  {name.trim() || 'PRÉNOM NOM'}
                </motion.p>
              </div>
              <div className="text-right">
                <p className="text-[8px] font-semibold uppercase tracking-[0.22em] text-white/40 mb-0.5">
                  Expire
                </p>
                <motion.p
                  className={cn(
                    'text-[12px] font-mono font-semibold text-white/90 transition-colors duration-300',
                    focus === 'expiry' && 'text-or',
                  )}
                >
                  {expiry || 'MM/AA'}
                </motion.p>
              </div>
            </div>
          </div>
        </div>

        {/* Card Back */}
        <div
          className="absolute inset-0 rounded-xl overflow-hidden"
          style={{
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-[#1e1e1e] via-[#2a2419] to-[#151515]" />
          <div className="absolute inset-0 opacity-20"
            style={{ background: 'radial-gradient(ellipse at 30% 70%, rgba(184,137,58,0.5) 0%, transparent 60%)' }} />
          <div className="absolute inset-0 rounded-xl border border-white/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]" />

          <div className="relative h-full flex flex-col justify-between py-6">
            {/* Magnetic stripe */}
            <div className="w-full h-10 bg-[#0a0a0a] border-y border-white/5" />

            {/* CVC area */}
            <div className="px-6">
              <div className="flex items-center gap-3">
                <div className="flex-1 h-9 bg-white/90 rounded-sm flex items-center justify-end px-3">
                  <span className="font-mono text-[14px] font-bold text-[#151515] tracking-[0.3em]">
                    {cvc || '•••'}
                  </span>
                </div>
                <div className="shrink-0">
                  {brand === 'visa' && <VisaLogo />}
                  {brand === 'mastercard' && <MastercardLogo />}
                  {brand === 'other' && (
                    <div className="w-[38px] h-[24px] rounded border border-white/20" />
                  )}
                </div>
              </div>
              <p className="mt-2 text-[8.5px] text-white/40 tracking-wide">Code de sécurité (CVC)</p>
            </div>

            <p className="px-6 text-[8px] text-white/20 leading-relaxed">
              Ce service est géré par Mathieu&amp;Co Studio. Paiement sécurisé SSL 256-bit.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Carte Bancaire form ──────────────────────────────────────────────────────

function CardForm() {
  const formId = useId();

  const [num,     setNum]     = useState('');
  const [expiry,  setExpiry]  = useState('');
  const [cvc,     setCvc]     = useState('');
  const [name,    setName]    = useState('');
  const [showCvc, setShowCvc] = useState(false);
  const [focus,   setFocus]   = useState<CardFocus>(null);

  const brand  = detectBrand(num);
  const filled = num.replace(/\s/g, '').length === 16 &&
                 expiry.length === 5 &&
                 cvc.length >= 3 &&
                 name.trim().length >= 3;

  const inputClass = cn(
    'w-full rounded-sm border bg-beige px-4 py-3.5',
    'text-[13px] font-medium text-noir placeholder:text-gris/40 placeholder:font-normal',
    'outline-none transition-all duration-200',
    'focus:border-or focus:ring-1 focus:ring-or/30 focus:bg-blanc',
    'border-gris-cl',
  );

  return (
    <div className="space-y-5">
      <CardPreview num={num} name={name} expiry={expiry} cvc={cvc} brand={brand} focus={focus} />

      {/* Card number */}
      <div>
        <label htmlFor={`${formId}-num`}
          className="mb-2 block text-[9.5px] font-semibold uppercase tracking-[0.22em] text-gris/70">
          Numéro de carte
        </label>
        <div className="relative">
          <input
            id={`${formId}-num`}
            type="text"
            inputMode="numeric"
            autoComplete="cc-number"
            value={num}
            onChange={(e) => setNum(fmtCard(e.target.value))}
            onFocus={() => setFocus('number')}
            onBlur={() => setFocus(null)}
            placeholder="0000 0000 0000 0000"
            maxLength={19}
            className={cn(inputClass, 'pr-28')}
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
            <VisaLogoCard       active={brand === 'visa'       || brand === 'other'} />
            <MastercardLogoCard active={brand === 'mastercard' || brand === 'other'} />
          </div>
        </div>
      </div>

      {/* Expiry + CVC */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor={`${formId}-exp`}
            className="mb-2 block text-[9.5px] font-semibold uppercase tracking-[0.22em] text-gris/70">
            Date d&apos;expiration
          </label>
          <input
            id={`${formId}-exp`}
            type="text"
            inputMode="numeric"
            autoComplete="cc-exp"
            value={expiry}
            onChange={(e) => setExpiry(fmtExpiry(e.target.value))}
            onFocus={() => setFocus('expiry')}
            onBlur={() => setFocus(null)}
            placeholder="MM/AA"
            maxLength={5}
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor={`${formId}-cvc`}
            className="mb-2 block text-[9.5px] font-semibold uppercase tracking-[0.22em] text-gris/70">
            Code CVC
          </label>
          <div className="relative">
            <input
              id={`${formId}-cvc`}
              type={showCvc ? 'text' : 'password'}
              inputMode="numeric"
              autoComplete="cc-csc"
              value={cvc}
              onChange={(e) => setCvc(e.target.value.replace(/\D/g, '').slice(0, 4))}
              onFocus={() => setFocus('cvc')}
              onBlur={() => setFocus(null)}
              placeholder="•••"
              maxLength={4}
              className={cn(inputClass, 'pr-10')}
            />
            <button
              type="button"
              onClick={() => setShowCvc((v) => !v)}
              aria-label={showCvc ? 'Masquer le CVC' : 'Afficher le CVC'}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gris/40 hover:text-gris transition-colors"
            >
              {showCvc
                ? <EyeOff size={14} strokeWidth={1.8} aria-hidden />
                : <Eye    size={14} strokeWidth={1.8} aria-hidden />}
            </button>
          </div>
        </div>
      </div>

      {/* Cardholder */}
      <div>
        <label htmlFor={`${formId}-name`}
          className="mb-2 block text-[9.5px] font-semibold uppercase tracking-[0.22em] text-gris/70">
          Nom sur la carte
        </label>
        <div className="relative">
          <input
            id={`${formId}-name`}
            type="text"
            autoComplete="cc-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onFocus={() => setFocus('name')}
            onBlur={() => setFocus(null)}
            placeholder="Prénom NOM"
            className={cn(inputClass, filled ? 'pr-10' : '')}
          />
          {filled && (
            <motion.span
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-vert"
            >
              <Check size={14} strokeWidth={2.5} aria-hidden />
            </motion.span>
          )}
        </div>
      </div>

      {/* SSL */}
      <p className="flex items-center gap-1.5 text-[10.5px] text-gris/60">
        <Lock size={11} strokeWidth={1.8} className="text-vert shrink-0" aria-hidden />
        Données chiffrées SSL 256 bits. Nous ne stockons pas vos informations de carte.
      </p>
    </div>
  );
}

// ─── Mobile Money ─────────────────────────────────────────────────────────────

const OPERATORS = [
  {
    id: 'mtn' as MoMoOp, label: 'MTN Mobile Money', short: 'MTN MoMo',
    logo: (
      <svg width="36" height="22" viewBox="0 0 36 22" fill="none" aria-label="MTN">
        <rect width="36" height="22" rx="3" fill="#FFCC00"/>
        <text x="50%" y="60%" dominantBaseline="middle" textAnchor="middle"
          fill="#151515" fontSize="9" fontWeight="900" fontFamily="Arial">MTN</text>
      </svg>
    ),
  },
  {
    id: 'moov' as MoMoOp, label: 'Moov Money', short: 'Moov',
    logo: (
      <svg width="36" height="22" viewBox="0 0 36 22" fill="none" aria-label="Moov">
        <rect width="36" height="22" rx="3" fill="#0096D6"/>
        <text x="50%" y="60%" dominantBaseline="middle" textAnchor="middle"
          fill="white" fontSize="8" fontWeight="900" fontFamily="Arial">MOOV</text>
      </svg>
    ),
  },
  {
    id: 'wave' as MoMoOp, label: 'Wave', short: 'Wave',
    logo: (
      <svg width="36" height="22" viewBox="0 0 36 22" fill="none" aria-label="Wave">
        <rect width="36" height="22" rx="3" fill="#1DC0FF"/>
        <text x="50%" y="60%" dominantBaseline="middle" textAnchor="middle"
          fill="white" fontSize="9" fontWeight="900" fontFamily="Arial">Wave</text>
      </svg>
    ),
  },
] as const;

function MobileMoneyForm() {
  const formId = useId();
  const [op, setOp]       = useState<MoMoOp>('mtn');
  const [phone, setPhone] = useState('');
  const current = OPERATORS.find((o) => o.id === op)!;

  return (
    <div className="space-y-5">
      <div>
        <p className="mb-3 text-[9.5px] font-semibold uppercase tracking-[0.22em] text-gris/70">
          Opérateur
        </p>
        <div className="grid grid-cols-3 gap-3">
          {OPERATORS.map((o) => (
            <motion.button
              key={o.id}
              type="button"
              onClick={() => setOp(o.id)}
              whileTap={{ scale: 0.97 }}
              transition={{ type: 'spring', stiffness: 400, damping: 20 }}
              className={cn(
                'flex flex-col items-center gap-2.5 rounded-sm border py-4 px-3',
                'transition-all duration-200 outline-none relative',
                'focus-visible:ring-2 focus-visible:ring-or',
                op === o.id
                  ? 'border-or/60 bg-or/6 shadow-[0_2px_12px_rgba(184,137,58,0.12)]'
                  : 'border-gris-cl hover:border-gris',
              )}
              aria-pressed={op === o.id}
              aria-label={o.label}
            >
              {o.logo}
              <span className={cn('text-[10px] font-semibold', op === o.id ? 'text-or' : 'text-gris')}>
                {o.short}
              </span>
              {op === o.id && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  className="absolute top-2 right-2 flex size-4 items-center justify-center rounded-full bg-or"
                >
                  <Check size={9} strokeWidth={3} className="text-blanc" aria-hidden />
                </motion.span>
              )}
            </motion.button>
          ))}
        </div>
      </div>

      <div>
        <label htmlFor={`${formId}-phone`}
          className="mb-2 block text-[9.5px] font-semibold uppercase tracking-[0.22em] text-gris/70">
          Numéro {current.short}
        </label>
        <div className="flex overflow-hidden rounded-sm border border-gris-cl focus-within:border-or focus-within:ring-1 focus-within:ring-or/30 transition-all duration-200">
          <div className="flex items-center gap-2 border-r border-gris-cl bg-beige px-3.5 shrink-0">
            <span className="text-[11.5px] leading-none" role="img" aria-label="Bénin">🇧🇯</span>
            <span className="text-[12px] font-semibold text-gris-dark">+229</span>
          </div>
          <input
            id={`${formId}-phone`}
            type="tel"
            inputMode="numeric"
            value={phone}
            onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
            placeholder="97 00 00 00"
            className="flex-1 bg-beige px-4 py-3.5 outline-none text-[13px] font-medium text-noir placeholder:text-gris/40"
          />
        </div>
      </div>

      <div className="rounded-sm border border-gris-cl/60 bg-beige px-4 py-3 text-[11px] text-gris leading-relaxed">
        Vous recevrez une invitation de paiement sur votre téléphone.
        Validez avec votre code PIN {current.short} pour confirmer la commande.
      </div>
    </div>
  );
}

// ─── PayPal ───────────────────────────────────────────────────────────────────

function PayPalForm() {
  return (
    <div className="flex flex-col items-center gap-6 py-6">
      <div className="flex size-16 items-center justify-center rounded-full bg-[#003087]/8">
        <PayPalLogo />
      </div>
      <div className="text-center max-w-sm">
        <h3 className="font-display font-light italic text-noir text-[1.2rem] mb-2">
          Paiement via PayPal
        </h3>
        <p className="text-[12px] text-gris leading-relaxed">
          Vous serez redirigé vers PayPal pour finaliser votre paiement
          en toute sécurité. Votre commande sera confirmée automatiquement.
        </p>
      </div>
      <motion.button
        type="button"
        whileTap={{ scale: 0.98 }}
        transition={{ type: 'spring', stiffness: 400, damping: 20 }}
        className="flex w-full max-w-xs items-center justify-center gap-2.5 rounded-sm py-4 bg-[#FFC439] text-[#003087] text-[10.5px] font-bold uppercase tracking-[0.2em] hover:bg-[#f0b429] transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#003087]"
      >
        <PayPalLogo />
        Continuer avec PayPal
      </motion.button>
      <p className="text-[10px] text-gris/50 text-center max-w-xs">
        Compte PayPal ou carte bancaire acceptés. Retour automatique après paiement.
      </p>
    </div>
  );
}

// ─── Virement ─────────────────────────────────────────────────────────────────

const BANK_DETAILS = [
  { label: 'Banque',         value: 'Ecobank Bénin' },
  { label: 'Titulaire',      value: 'MATHIEU & CO STUDIO SARL' },
  { label: 'IBAN',           value: 'BJ66 0001 0001 0001 2345 67890' },
  { label: 'Code BIC/SWIFT', value: 'ECOCBJBJXXX' },
  { label: 'Référence',      value: 'CMD-2024-XXXX' },
] as const;

function BankTransferForm() {
  const [copied, setCopied] = useState<string | null>(null);

  const copyField = useCallback((value: string, label: string) => {
    navigator.clipboard.writeText(value).then(() => {
      setCopied(label);
      setTimeout(() => setCopied(null), 2000);
    });
  }, []);

  return (
    <div className="space-y-4">
      <p className="text-[12px] text-gris leading-relaxed">
        Effectuez un virement vers le compte ci-dessous. Votre commande sera
        traitée sous 24h après réception du paiement.
      </p>
      <div className="rounded-sm border border-gris-cl overflow-hidden">
        {BANK_DETAILS.map(({ label, value }) => (
          <div key={label}
            className="flex items-center justify-between gap-4 px-4 py-3.5 border-b border-gris-cl/50 last:border-0 hover:bg-beige/50 transition-colors group">
            <div className="min-w-0">
              <p className="text-[9.5px] font-semibold uppercase tracking-[0.2em] text-gris/60 mb-0.5">{label}</p>
              <p className="text-[12px] font-medium text-noir font-mono truncate">{value}</p>
            </div>
            <button
              type="button"
              onClick={() => copyField(value, label)}
              aria-label={`Copier ${label}`}
              className={cn(
                'shrink-0 flex items-center gap-1 rounded-sm px-2.5 py-1.5',
                'text-[9.5px] font-semibold uppercase tracking-[0.16em] transition-all duration-150',
                copied === label
                  ? 'bg-vert/10 text-vert'
                  : 'bg-gris-cl/50 text-gris hover:bg-gris-cl hover:text-noir opacity-0 group-hover:opacity-100',
              )}
            >
              {copied === label ? (
                <><Check size={10} strokeWidth={2.5} aria-hidden /> Copié</>
              ) : 'Copier'}
            </button>
          </div>
        ))}
      </div>
      <div className="rounded-sm border border-or/30 bg-or/6 px-4 py-3 text-[11px] text-gris-dark leading-relaxed">
        Indiquez impérativement la <strong className="text-noir">référence commande</strong> dans
        le libellé de votre virement. Sans référence, le traitement peut prendre 3–5 jours ouvrés.
      </div>
    </div>
  );
}

// ─── Order Summary ────────────────────────────────────────────────────────────

function OrderSummary() {
  const items       = useCartStore((s) => s.items);
  const codePromo   = useCartStore((s) => s.codePromo);
  const { sousTotal, remise, fraisLivraison, total, nombreArticles } = useCartTotaux();

  return (
    <div className="sticky top-24 rounded-sm border border-gris-cl/60 bg-blanc overflow-hidden shadow-card">
      <div className="bg-noir px-5 py-4">
        <div className="flex items-center justify-between">
          <h2 className="text-[10px] font-semibold uppercase tracking-[0.3em] text-blanc">Votre commande</h2>
          <span className="text-[10px] text-blanc/50">{nombreArticles} article{nombreArticles !== 1 ? 's' : ''}</span>
        </div>
      </div>

      {items.length > 0 ? (
        <div className="divide-y divide-gris-cl/40 max-h-[280px] overflow-y-auto">
          {items.map((item) => (
            <div key={item.key} className="flex gap-3 px-5 py-3.5">
              <div className="shrink-0 size-14 rounded-sm overflow-hidden bg-beige2">
                {item.image && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={item.image} alt={item.nom} className="w-full h-full object-cover" loading="lazy" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[11.5px] font-medium text-noir leading-snug line-clamp-2">{item.nom}</p>
                {item.finition && (
                  <p className="mt-0.5 text-[10px] text-gris capitalize">{item.finition}</p>
                )}
                <div className="mt-1 flex items-center justify-between">
                  <span className="text-[10px] text-gris">×{item.quantite}</span>
                  <span className="text-[12px] font-semibold text-noir tabular-nums">
                    {formatFCFA(item.prixUnitaire * item.quantite)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="px-5 py-8 text-center">
          <p className="text-[12px] text-gris">Votre panier est vide</p>
          <Link href="/boutique" className="mt-2 inline-block text-[11px] text-or hover:underline">
            Découvrir la boutique
          </Link>
        </div>
      )}

      <div className="border-t border-gris-cl/60 divide-y divide-gris-cl/50">
        <div className="flex justify-between items-center px-5 py-3">
          <span className="text-[12px] text-gris">Sous-total</span>
          <span className="text-[12px] font-medium text-noir tabular-nums">{formatFCFA(sousTotal)}</span>
        </div>
        {remise > 0 && codePromo && (
          <div className="flex justify-between items-start px-5 py-3">
            <div>
              <span className="text-[12px] text-gris">Remise</span>
              <p className="text-[10px] text-gris/60">{codePromo.label}</p>
            </div>
            <span className="text-[12px] font-medium text-rouge tabular-nums">−{formatFCFA(remise)}</span>
          </div>
        )}
        <div className="flex justify-between items-start px-5 py-3">
          <div>
            <span className="text-[12px] text-gris">Livraison</span>
            <p className="text-[10px] text-gris/60">Cotonou · 48h ouvrées</p>
          </div>
          <span className={cn('text-[12px] font-medium tabular-nums', fraisLivraison === 0 ? 'text-vert' : 'text-noir')}>
            {fraisLivraison === 0 ? 'Offerte' : formatFCFA(fraisLivraison)}
          </span>
        </div>
        <div className="px-5 py-4">
          <div className="flex items-center justify-between">
            <span className="text-[14px] font-semibold text-noir">Total TTC</span>
            <motion.span
              key={total}
              initial={{ scale: 0.9, opacity: 0.6 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              className="font-display font-light text-noir tabular-nums"
              style={{ fontSize: 'clamp(1.1rem, 1.6vw, 1.3rem)' }}
            >
              {formatFCFA(total)}
            </motion.span>
          </div>
          {remise > 0 && (
            <p className="mt-1 text-[10px] text-vert">Vous économisez {formatFCFA(remise)}</p>
          )}
        </div>
      </div>

      <div className="border-t border-gris-cl/50 px-5 py-4 space-y-2.5">
        {[
          { icon: <Lock size={11} strokeWidth={1.8} />,      label: 'Paiement 100% sécurisé' },
          { icon: <RotateCcw size={11} strokeWidth={1.8} />, label: 'Retour sous 30 jours' },
          { icon: <Shield size={11} strokeWidth={1.8} />,    label: 'Garantie authenticité' },
        ].map(({ icon, label }) => (
          <div key={label} className="flex items-center gap-2 text-[10.5px] text-gris/70">
            <span className="text-or">{icon}</span>
            {label}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Payment Tabs ─────────────────────────────────────────────────────────────

const PAY_TABS: { id: PayMethod; icon: React.ReactNode; label: string }[] = [
  { id: 'carte',    icon: <CreditCard size={14} strokeWidth={1.8} />, label: 'Carte' },
  { id: 'mobile',   icon: <Smartphone size={14} strokeWidth={1.8} />, label: 'Mobile Money' },
  { id: 'paypal',   icon: <Globe      size={14} strokeWidth={1.8} />, label: 'PayPal' },
  { id: 'virement', icon: <Building2  size={14} strokeWidth={1.8} />, label: 'Virement' },
];

// ─── Step Indicator ───────────────────────────────────────────────────────────

const STEPS = [
  { id: 1, label: 'Informations', done: true,  current: false },
  { id: 2, label: 'Livraison',    done: true,  current: false },
  { id: 3, label: 'Paiement',     done: false, current: true  },
  { id: 4, label: 'Confirmation', done: false, current: false },
] as const;

function StepIndicator() {
  return (
    <div className="bg-blanc border-b border-gris-cl">
      <div className="mx-auto max-w-[1440px] px-6 md:px-12 xl:px-16 py-5">
        <div className="flex items-start justify-center gap-0">
          {STEPS.map((step, idx) => (
            <div key={step.id} className="flex items-center">
              <div className="flex flex-col items-center gap-2 min-w-[72px]">
                <motion.div
                  initial={false}
                  animate={step.current ? { scale: [1, 1.08, 1] } : {}}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className={cn(
                    'flex size-9 items-center justify-center rounded-full',
                    'text-[11px] font-bold transition-colors duration-300',
                    step.done    && 'bg-vert text-blanc',
                    step.current && 'bg-or text-blanc ring-4 ring-or/20',
                    !step.done && !step.current && 'bg-gris-cl text-gris/60',
                  )}
                >
                  {step.done
                    ? <Check size={14} strokeWidth={2.5} aria-hidden />
                    : step.id}
                </motion.div>
                <span className={cn(
                  'hidden sm:block text-[9.5px] font-semibold uppercase tracking-[0.2em] text-center',
                  step.done    && 'text-vert',
                  step.current && 'text-or',
                  !step.done && !step.current && 'text-gris/40',
                )}>
                  {step.label}
                </span>
              </div>
              {idx < STEPS.length - 1 && (
                <div className={cn(
                  'mb-5 h-[2px] w-16 sm:w-24 md:w-32 xl:w-40 rounded-full transition-colors duration-500',
                  step.done && STEPS[idx + 1].done    && 'bg-vert',
                  step.done && STEPS[idx + 1].current && 'bg-gradient-to-r from-vert to-or/40',
                  !step.done                          && 'bg-gris-cl',
                )} aria-hidden />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Shipping recap ───────────────────────────────────────────────────────────

function ShippingInfoCard() {
  return (
    <div className="rounded-sm border border-gris-cl bg-blanc px-5 py-4">
      <div className="flex items-center justify-between mb-3">
        <span className="text-[9px] font-semibold uppercase tracking-[0.28em] text-or/80">Livraison confirmée</span>
        <Link href="/checkout/livraison"
          className="text-[10px] text-gris/60 hover:text-or transition-colors underline underline-offset-2">
          Modifier
        </Link>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="flex items-start gap-2.5">
          <User size={13} strokeWidth={1.6} className="mt-0.5 text-gris shrink-0" aria-hidden />
          <div>
            <p className="text-[11px] font-medium text-noir">Mathieu Koudjonou</p>
            <p className="text-[10.5px] text-gris">mathieu@studio.bj</p>
          </div>
        </div>
        <div className="flex items-start gap-2.5">
          <MapPin size={13} strokeWidth={1.6} className="mt-0.5 text-gris shrink-0" aria-hidden />
          <div>
            <p className="text-[11px] font-medium text-noir">Cotonou, Bénin</p>
            <p className="text-[10.5px] text-gris">Livraison standard · 48h ouvrées</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function CheckoutSkeleton() {
  return (
    <div className="min-h-[100dvh] bg-beige" aria-hidden>
      <div className="bg-blanc border-b border-gris-cl py-5">
        <div className="mx-auto max-w-[1440px] px-8 flex items-center justify-center gap-4">
          {[1,2,3,4].map((i) => (
            <div key={i} className="size-9 rounded-full bg-beige3 animate-pulse"
              style={{ animationDelay: `${i*80}ms` }} />
          ))}
        </div>
      </div>
      <div className="mx-auto max-w-[1440px] px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-8">
          <div className="space-y-5">
            <div className="h-9 w-40 rounded-sm bg-beige2 animate-pulse" />
            <div className="h-20 rounded-sm border border-gris-cl bg-blanc animate-pulse" />
            <div className="h-64 rounded-sm border border-gris-cl bg-blanc animate-pulse" />
            <div className="h-24 rounded-sm border border-gris-cl bg-blanc animate-pulse" />
          </div>
          <div className="h-80 rounded-sm border border-gris-cl bg-blanc animate-pulse" />
        </div>
      </div>
    </div>
  );
}

// ─── CheckoutClient ───────────────────────────────────────────────────────────

export function CheckoutClient() {
  const [method,  setMethod]  = useState<PayMethod>('carte');
  const [mounted, setMounted] = useState(false);
  const tabsRef               = useRef<HTMLDivElement>(null);
  const { total }             = useCartTotaux();

  useEffect(() => setMounted(true), []);
  if (!mounted) return <CheckoutSkeleton />;

  return (
    <div className="min-h-[100dvh] bg-beige">

      <StepIndicator />

      {/* Breadcrumb */}
      <div className="mx-auto max-w-[1440px] px-8 md:px-12 xl:px-16 pt-7 pb-2">
        <nav className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.22em]" aria-label="Fil d'Ariane">
          <Link href="/"         className="text-gris/60 hover:text-or transition-colors">Accueil</Link>
          <span className="text-gris-cl">/</span>
          <Link href="/boutique" className="text-gris/60 hover:text-or transition-colors">Boutique</Link>
          <span className="text-gris-cl">/</span>
          <Link href="/panier"   className="text-gris/60 hover:text-or transition-colors">Panier</Link>
          <span className="text-gris-cl">/</span>
          <span className="text-noir">Paiement</span>
        </nav>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-[1440px] px-8 md:px-12 xl:px-16 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] xl:grid-cols-[1fr_420px] gap-8 xl:gap-12">

          {/* Left */}
          <div className="space-y-5">

            <div className="flex items-baseline justify-between gap-4">
              <h1 className="font-display font-light italic text-noir"
                style={{ fontSize: 'clamp(1.6rem, 2.5vw, 2.2rem)' }}>
                Paiement
              </h1>
              <span className="text-[11px] text-gris hidden sm:block">Étape 3 sur 4</span>
            </div>

            <ShippingInfoCard />

            {/* Payment tabs */}
            <div>
              <p className="mb-3 text-[9.5px] font-semibold uppercase tracking-[0.28em] text-gris/70">
                Méthode de paiement
              </p>

              {/* Tab bar with animated background pill */}
              <div
                ref={tabsRef}
                className="relative grid grid-cols-4 gap-2 mb-0 rounded-sm"
                role="tablist"
                aria-label="Méthodes de paiement"
              >
                {PAY_TABS.map((tab) => (
                  <button
                    key={tab.id}
                    role="tab"
                    aria-selected={method === tab.id}
                    aria-controls={`panel-${tab.id}`}
                    onClick={() => setMethod(tab.id)}
                    className={cn(
                      'relative flex flex-col items-center gap-1.5 rounded-sm py-3 px-2',
                      'border text-center transition-colors duration-200',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-or',
                      method === tab.id
                        ? 'border-noir bg-noir text-blanc'
                        : 'border-gris-cl bg-blanc text-gris hover:border-gris hover:text-gris-dark',
                    )}
                  >
                    {method === tab.id && (
                      <motion.div
                        layoutId="tab-bg"
                        className="absolute inset-0 rounded-sm bg-noir"
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                        style={{ zIndex: -1 }}
                      />
                    )}
                    <span className={method === tab.id ? 'text-blanc' : 'text-gris'}>
                      {tab.icon}
                    </span>
                    <span className="text-[9.5px] font-semibold leading-tight">{tab.label}</span>
                  </button>
                ))}
              </div>

              {/* Tab content */}
              <div className="mt-2 rounded-sm border border-gris-cl bg-blanc p-6">
                <AnimatePresence mode="wait" initial={false}>
                  <motion.div
                    key={method}
                    id={`panel-${method}`}
                    role="tabpanel"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  >
                    {method === 'carte'    && <CardForm />}
                    {method === 'mobile'   && <MobileMoneyForm />}
                    {method === 'paypal'   && <PayPalForm />}
                    {method === 'virement' && <BankTransferForm />}
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>

            {/* Action buttons */}
            <div className="rounded-sm border border-gris-cl bg-blanc px-6 py-5">
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <Link
                  href="/panier"
                  className="inline-flex items-center gap-2 rounded-sm border border-gris-cl px-5 py-3.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-gris-dark hover:border-gris hover:text-noir transition-all duration-200 w-full sm:w-auto justify-center active:-translate-y-px"
                >
                  <ChevronLeft size={13} strokeWidth={2} aria-hidden />
                  Retour au panier
                </Link>

                <motion.button
                  type="button"
                  whileTap={{ scale: 0.98, y: 1 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                  disabled={method === 'paypal'}
                  className="flex flex-1 items-center justify-center gap-2.5 rounded-sm py-3.5 px-6 bg-or text-blanc shadow-or text-[10px] font-semibold uppercase tracking-[0.24em] hover:bg-or-dark hover:shadow-or-lg transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-or focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed w-full"
                >
                  <Lock size={12} strokeWidth={2} aria-hidden />
                  {method === 'virement'
                    ? 'Confirmer la commande'
                    : `Payer ${total > 0 ? formatFCFA(total) : ''}`}
                </motion.button>
              </div>

              <div className="mt-4 flex items-center justify-center gap-5 flex-wrap">
                {[
                  { icon: <Lock size={10} strokeWidth={1.8} />,   label: 'SSL 256 bits' },
                  { icon: <Shield size={10} strokeWidth={1.8} />, label: 'Paiement sécurisé' },
                  { icon: <Truck size={10} strokeWidth={1.8} />,  label: 'Livraison 48h' },
                ].map(({ icon, label }) => (
                  <span key={label} className="flex items-center gap-1.5 text-[10px] text-gris/50">
                    {icon} {label}
                  </span>
                ))}
              </div>
            </div>

          </div>

          {/* Right */}
          <div>
            <div className="mb-2 flex items-center gap-3">
              <span className="block h-[2px] w-5 rounded-full bg-or/60" aria-hidden />
              <span className="text-[9px] font-semibold uppercase tracking-[0.34em] text-or/70">Récapitulatif</span>
            </div>
            <OrderSummary />
          </div>

        </div>
      </div>

    </div>
  );
}
