import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export type ButtonVariant = 'noir' | 'or' | 'outline-noir' | 'outline-or' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

const variantStyles: Record<ButtonVariant, string> = {
  noir:
    'bg-noir text-blanc hover:bg-noir/90 focus-visible:ring-noir/40 disabled:bg-gris disabled:text-blanc/80',
  or: 'bg-or text-blanc hover:bg-or-dark focus-visible:ring-or/40 disabled:bg-beige3 disabled:text-gris',
  'outline-noir':
    'border border-noir bg-transparent text-noir hover:bg-noir hover:text-blanc focus-visible:ring-noir/30',
  'outline-or':
    'border border-or bg-transparent text-or hover:bg-or hover:text-blanc focus-visible:ring-or/30',
  ghost: 'bg-transparent text-noir hover:bg-beige2 focus-visible:ring-gris/30',
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'h-9 px-4 text-[11px]',
  md: 'h-11 px-6 text-xs',
  lg: 'h-12 px-8 text-[13px]',
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'noir',
      size = 'md',
      fullWidth = false,
      type = 'button',
      disabled,
      children,
      ...props
    },
    ref,
  ) => {
    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled}
        className={cn(
          'inline-flex items-center justify-center gap-2 rounded-sm font-semibold tracking-wide transition-colors duration-200',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-beige',
          'disabled:cursor-not-allowed disabled:opacity-70',
          variantStyles[variant],
          sizeStyles[size],
          fullWidth && 'w-full',
          className,
        )}
        {...props}
      >
        {children}
      </button>
    );
  },
);

Button.displayName = 'Button';
