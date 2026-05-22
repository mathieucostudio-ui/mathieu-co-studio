'use client';

import { forwardRef, type ReactNode } from 'react';
import { motion, type HTMLMotionProps } from 'framer-motion';
import { cn } from '@/lib/utils';

// ── Types ────────────────────────────────────────────────────────────────────
export type ButtonVariant =
  | 'noir'
  | 'or'
  | 'outline-noir'
  | 'outline-or'
  | 'ghost'
  | 'link'
  | 'destructive';

export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  loading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  children?: ReactNode;
}

// ── Style maps ───────────────────────────────────────────────────────────────
const variantMap: Record<ButtonVariant, string> = {
  noir: [
    'bg-noir text-blanc',
    'hover:bg-noir/90',
    'focus-visible:ring-noir/40',
    'disabled:bg-gris disabled:text-blanc/70',
  ].join(' '),
  or: [
    'bg-or text-blanc',
    'hover:bg-or-dark',
    'focus-visible:ring-or/40',
    'disabled:bg-beige3 disabled:text-gris',
  ].join(' '),
  'outline-noir': [
    'border border-noir text-noir bg-transparent',
    'hover:bg-noir hover:text-blanc',
    'focus-visible:ring-noir/30',
  ].join(' '),
  'outline-or': [
    'border border-or text-or bg-transparent',
    'hover:bg-or hover:text-blanc',
    'focus-visible:ring-or/30',
  ].join(' '),
  ghost: [
    'bg-transparent text-noir',
    'hover:bg-beige2',
    'focus-visible:ring-gris/30',
  ].join(' '),
  link: [
    'bg-transparent text-or underline-offset-4',
    'hover:underline hover:text-or-dark',
    'focus-visible:ring-or/30',
  ].join(' '),
  destructive: [
    'bg-rouge text-blanc',
    'hover:bg-rouge/90',
    'focus-visible:ring-rouge/40',
  ].join(' '),
};

const sizeMap: Record<ButtonSize, { btn: string; spinner: string }> = {
  sm: { btn: 'h-9 px-4 text-[11px] gap-1.5',  spinner: 'size-3'   },
  md: { btn: 'h-11 px-6 text-xs gap-2',        spinner: 'size-3.5' },
  lg: { btn: 'h-12 px-8 text-[13px] gap-2.5',  spinner: 'size-4'   },
};

// ── Spinner (CSS — aucune dépendance runtime supplémentaire) ─────────────────
function LoadingSpinner({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        'shrink-0 animate-spin rounded-full border-[1.5px] border-current border-t-transparent',
        className,
      )}
      aria-hidden
    />
  );
}

// ── Button ───────────────────────────────────────────────────────────────────
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'noir',
      size = 'md',
      fullWidth = false,
      loading = false,
      leftIcon,
      rightIcon,
      type = 'button',
      disabled,
      children,
      whileTap,
      ...props
    },
    ref,
  ) => {
    const isDisabled = disabled || loading;
    const isLink = variant === 'link';
    const { btn, spinner } = sizeMap[size];

    return (
      <motion.button
        ref={ref}
        type={type}
        disabled={isDisabled}
        whileTap={isDisabled ? undefined : (whileTap ?? { scale: 0.97 })}
        transition={{ duration: 0.1, ease: 'easeOut' }}
        className={cn(
          'relative inline-flex select-none items-center justify-center rounded-sm font-semibold tracking-wide',
          'transition-colors duration-200',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-beige',
          'disabled:cursor-not-allowed disabled:opacity-60',
          variantMap[variant],
          !isLink && btn,
          !isLink && fullWidth && 'w-full',
          isLink && 'h-auto px-0 rounded-none',
          className,
        )}
        {...props}
      >
        {/* Spinner — overlay absolu pour conserver la largeur du bouton */}
        {loading && (
          <span className="absolute inset-0 flex items-center justify-center">
            <LoadingSpinner className={spinner} />
          </span>
        )}

        {/* Contenu — invisible pendant le loading (préserve la largeur) */}
        <span
          className={cn(
            'inline-flex items-center gap-[inherit]',
            loading && 'invisible',
          )}
        >
          {leftIcon && (
            <span className="shrink-0 [&>svg]:size-[1em]" aria-hidden>
              {leftIcon}
            </span>
          )}
          {children}
          {rightIcon && (
            <span className="shrink-0 [&>svg]:size-[1em]" aria-hidden>
              {rightIcon}
            </span>
          )}
        </span>
      </motion.button>
    );
  },
);

Button.displayName = 'Button';
