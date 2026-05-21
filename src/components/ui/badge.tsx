'use client';

import { motion, type HTMLMotionProps } from 'framer-motion';
import { cn } from '@/lib/utils';

export type BadgeVariant = 'nouveau' | 'best' | 'solde';

const variantStyles: Record<BadgeVariant, string> = {
  nouveau: 'bg-or text-blanc',
  best: 'bg-noir text-blanc',
  solde: 'bg-rouge text-blanc',
};

const variantLabels: Record<BadgeVariant, string> = {
  nouveau: 'NOUVEAU',
  best: 'BEST',
  solde: 'SOLDE',
};

export interface BadgeProps extends Omit<HTMLMotionProps<'span'>, 'children'> {
  variant: BadgeVariant;
  label?: string;
  animate?: boolean;
}

export function Badge({
  variant,
  label,
  animate = true,
  className,
  ...props
}: BadgeProps) {
  const text = label ?? variantLabels[variant];

  return (
    <motion.span
      initial={animate ? { scale: 0.7, opacity: 0 } : false}
      animate={animate ? { scale: 1, opacity: 1 } : false}
      transition={
        animate
          ? { type: 'spring', stiffness: 300, damping: 18 }
          : undefined
      }
      className={cn(
        'inline-flex items-center justify-center rounded-sm px-2 py-0.5',
        'text-[9px] font-bold uppercase tracking-[0.12em]',
        variantStyles[variant],
        className,
      )}
      {...props}
    >
      {text}
    </motion.span>
  );
}
