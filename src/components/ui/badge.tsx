'use client';

import { motion, type HTMLMotionProps } from 'framer-motion';
import { cn } from '@/lib/utils';

// ── Types ────────────────────────────────────────────────────────────────────
export type BadgeVariant = 'nouveau' | 'best' | 'solde';
export type BadgeSize   = 'sm' | 'md';

const LABELS: Record<BadgeVariant, string> = {
  nouveau: 'NOUVEAU',
  best:    'BEST',
  solde:   'SOLDE',
};

const baseColor: Record<BadgeVariant, string> = {
  nouveau: 'bg-or         text-blanc',
  best:    'bg-noir        text-blanc',
  solde:   'bg-rouge       text-blanc',
};

const sizeClass: Record<BadgeSize, string> = {
  sm: 'px-1.5 py-0.5 text-[8px]  gap-1',
  md: 'px-2   py-0.5 text-[9px]  gap-1.5',
};

// ── Pulse dot (NOUVEAU) ──────────────────────────────────────────────────────
function PulseDot() {
  return (
    <span className="relative flex size-1.5 shrink-0" aria-hidden>
      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blanc/70 opacity-75" />
      <span className="relative inline-flex size-1.5 rounded-full bg-blanc" />
    </span>
  );
}

// ── Shimmer layer (SOLDE) ────────────────────────────────────────────────────
function ShimmerLayer() {
  return (
    <span
      className={cn(
        'pointer-events-none absolute inset-0 rounded-[inherit]',
        'bg-[linear-gradient(105deg,transparent_30%,rgba(255,255,255,0.35)_50%,transparent_70%)]',
        'bg-[length:200%_100%] animate-shimmer',
      )}
      aria-hidden
    />
  );
}

// ── Props ────────────────────────────────────────────────────────────────────
export interface BadgeProps extends Omit<HTMLMotionProps<'span'>, 'children'> {
  variant: BadgeVariant;
  size?: BadgeSize;
  label?: string;
  /** Active l'animation d'entrée spring (défaut : true) */
  animate?: boolean;
}

// ── Badge ────────────────────────────────────────────────────────────────────
export function Badge({
  variant,
  size = 'md',
  label,
  animate = true,
  className,
  ...props
}: BadgeProps) {
  const text = label ?? LABELS[variant];

  return (
    <motion.span
      initial={animate ? { scale: 0.65, opacity: 0 } : false}
      animate={animate ? { scale: 1, opacity: 1 }  : false}
      transition={
        animate
          ? { type: 'spring', stiffness: 320, damping: 18, delay: 0.05 }
          : undefined
      }
      className={cn(
        'relative inline-flex items-center justify-center overflow-hidden rounded-sm',
        'font-bold uppercase tracking-[0.14em] leading-none',
        baseColor[variant],
        sizeClass[size],
        className,
      )}
      {...props}
    >
      {variant === 'nouveau' && <PulseDot />}
      {text}
      {variant === 'solde' && <ShimmerLayer />}
    </motion.span>
  );
}
