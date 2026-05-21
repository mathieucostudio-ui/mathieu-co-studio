import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      label,
      error,
      hint,
      leftIcon,
      rightIcon,
      id,
      disabled,
      ...props
    },
    ref,
  ) => {
    const inputId = id ?? (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className={cn('flex w-full flex-col gap-1.5', className)}>
        {label ? (
          <label
            htmlFor={inputId}
            className="text-[10px] font-semibold uppercase tracking-[0.25em] text-or"
          >
            {label}
          </label>
        ) : null}

        <div
          className={cn(
            'relative flex items-center rounded-sm border transition-colors duration-200',
            'border-gris-cl/80 bg-blanc/55 backdrop-blur-md',
            'focus-within:border-or/60 focus-within:bg-blanc/70 focus-within:ring-2 focus-within:ring-or/15',
            error && 'border-rouge/60 focus-within:border-rouge focus-within:ring-rouge/15',
            disabled && 'cursor-not-allowed opacity-60',
          )}
        >
          {leftIcon ? (
            <span className="pointer-events-none pl-3 text-gris">{leftIcon}</span>
          ) : null}

          <input
            ref={ref}
            id={inputId}
            disabled={disabled}
            className={cn(
              'w-full bg-transparent px-3 py-2.5 text-sm font-normal text-noir placeholder:text-gris',
              'outline-none disabled:cursor-not-allowed',
              leftIcon ? 'pl-2' : undefined,
              rightIcon ? 'pr-2' : undefined,
            )}
            {...props}
          />

          {rightIcon ? (
            <span className="pointer-events-none pr-3 text-gris">{rightIcon}</span>
          ) : null}
        </div>

        {error ? (
          <p className="text-xs text-rouge" role="alert">
            {error}
          </p>
        ) : hint ? (
          <p className="text-xs text-gris">{hint}</p>
        ) : null}
      </div>
    );
  },
);

Input.displayName = 'Input';
