'use client';

import {
  forwardRef,
  useState,
  useCallback,
  type InputHTMLAttributes,
  type TextareaHTMLAttributes,
  type ReactNode,
} from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils';

// ── Shared styles ────────────────────────────────────────────────────────────
const labelCls =
  'text-[10px] font-semibold uppercase tracking-[0.25em] text-or';

const wrapperCls = [
  'relative flex items-center rounded-sm border',
  'border-gris-cl/80 bg-blanc/55 backdrop-blur-md',
  'shadow-[inset_0_1px_0_rgba(255,255,255,0.55)]',
  'transition-[border-color,box-shadow,background-color] duration-200',
  'focus-within:border-or/60 focus-within:bg-blanc/70',
  'focus-within:ring-2 focus-within:ring-or/15',
  'focus-within:shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]',
].join(' ');

const wrapperErrorCls = [
  'border-rouge/60',
  'focus-within:border-rouge focus-within:ring-rouge/15',
].join(' ');

const wrapperDisabledCls = 'cursor-not-allowed opacity-55 pointer-events-none';

const fieldCls =
  'w-full bg-transparent px-3 py-2.5 text-sm font-normal text-noir placeholder:text-gris/70 outline-none disabled:cursor-not-allowed';

// ── Helper: meta row (error / hint / char count) ─────────────────────────────
function MetaRow({
  error,
  hint,
  current,
  max,
}: {
  error?: string;
  hint?: string;
  current?: number;
  max?: number;
}) {
  if (!error && !hint && max === undefined) return null;

  return (
    <div className="flex items-start justify-between gap-2">
      <span>
        {error ? (
          <p className="text-[11px] text-rouge leading-tight" role="alert">
            {error}
          </p>
        ) : hint ? (
          <p className="text-[11px] text-gris leading-tight">{hint}</p>
        ) : null}
      </span>

      {max !== undefined && current !== undefined && (
        <p
          className={cn(
            'shrink-0 text-[10px] tabular-nums',
            current > max ? 'text-rouge' : 'text-gris',
          )}
          aria-live="polite"
        >
          {current}/{max}
        </p>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  Input
// ─────────────────────────────────────────────────────────────────────────────
export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  /** Affiche un bouton œil pour les champs type="password" */
  showPasswordToggle?: boolean;
  /** Affiche le compteur de caractères quand maxLength est défini */
  showCount?: boolean;
  containerClassName?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      containerClassName,
      label,
      error,
      hint,
      leftIcon,
      rightIcon,
      showPasswordToggle = false,
      showCount = false,
      id,
      disabled,
      maxLength,
      type,
      onChange,
      defaultValue,
      value,
      ...props
    },
    ref,
  ) => {
    const inputId = id ?? (label ? `input-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined);
    const isPassword = type === 'password';

    const [showPwd, setShowPwd] = useState(false);
    const [charLen, setCharLen] = useState(
      typeof value === 'string'
        ? value.length
        : typeof defaultValue === 'string'
          ? defaultValue.length
          : 0,
    );

    const handleChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        if (showCount && maxLength !== undefined) {
          setCharLen(e.target.value.length);
        }
        onChange?.(e);
      },
      [onChange, showCount, maxLength],
    );

    const resolvedType = isPassword && showPwd ? 'text' : (type ?? 'text');
    const hasRightSlot = (isPassword && showPasswordToggle) || rightIcon;

    return (
      <div className={cn('flex w-full flex-col gap-1.5', containerClassName)}>
        {label && (
          <label htmlFor={inputId} className={labelCls}>
            {label}
          </label>
        )}

        <div
          className={cn(
            wrapperCls,
            error && wrapperErrorCls,
            disabled && wrapperDisabledCls,
          )}
        >
          {leftIcon && (
            <span className="pointer-events-none pl-3 text-gris [&>svg]:size-4" aria-hidden>
              {leftIcon}
            </span>
          )}

          <input
            ref={ref}
            id={inputId}
            type={resolvedType}
            disabled={disabled}
            maxLength={maxLength}
            value={value}
            defaultValue={defaultValue}
            onChange={handleChange}
            className={cn(
              fieldCls,
              leftIcon     ? 'pl-2' : undefined,
              hasRightSlot ? 'pr-2' : undefined,
              className,
            )}
            {...props}
          />

          {isPassword && showPasswordToggle ? (
            <button
              type="button"
              tabIndex={-1}
              onClick={() => setShowPwd((v) => !v)}
              aria-label={showPwd ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
              className="mr-3 shrink-0 text-gris transition-colors hover:text-or focus-visible:outline-none"
            >
              {showPwd ? (
                <EyeOff size={16} strokeWidth={1.5} aria-hidden />
              ) : (
                <Eye size={16} strokeWidth={1.5} aria-hidden />
              )}
            </button>
          ) : rightIcon ? (
            <span className="pointer-events-none pr-3 text-gris [&>svg]:size-4" aria-hidden>
              {rightIcon}
            </span>
          ) : null}
        </div>

        <MetaRow
          error={error}
          hint={hint}
          current={showCount ? charLen : undefined}
          max={showCount ? maxLength : undefined}
        />
      </div>
    );
  },
);

Input.displayName = 'Input';

// ─────────────────────────────────────────────────────────────────────────────
//  Textarea
// ─────────────────────────────────────────────────────────────────────────────
export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
  showCount?: boolean;
  containerClassName?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      className,
      containerClassName,
      label,
      error,
      hint,
      showCount = false,
      id,
      disabled,
      maxLength,
      onChange,
      defaultValue,
      value,
      rows = 4,
      ...props
    },
    ref,
  ) => {
    const textareaId =
      id ?? (label ? `textarea-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined);

    const [charLen, setCharLen] = useState(
      typeof value === 'string'
        ? value.length
        : typeof defaultValue === 'string'
          ? defaultValue.length
          : 0,
    );

    const handleChange = useCallback(
      (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        if (showCount && maxLength !== undefined) {
          setCharLen(e.target.value.length);
        }
        onChange?.(e);
      },
      [onChange, showCount, maxLength],
    );

    return (
      <div className={cn('flex w-full flex-col gap-1.5', containerClassName)}>
        {label && (
          <label htmlFor={textareaId} className={labelCls}>
            {label}
          </label>
        )}

        <div
          className={cn(
            wrapperCls,
            'items-start',
            error && wrapperErrorCls,
            disabled && wrapperDisabledCls,
          )}
        >
          <textarea
            ref={ref}
            id={textareaId}
            disabled={disabled}
            rows={rows}
            maxLength={maxLength}
            value={value}
            defaultValue={defaultValue}
            onChange={handleChange}
            className={cn(
              fieldCls,
              'resize-none py-3 leading-relaxed',
              className,
            )}
            {...props}
          />
        </div>

        <MetaRow
          error={error}
          hint={hint}
          current={showCount ? charLen : undefined}
          max={showCount ? maxLength : undefined}
        />
      </div>
    );
  },
);

Textarea.displayName = 'Textarea';
