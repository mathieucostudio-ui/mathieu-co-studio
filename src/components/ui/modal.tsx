'use client';

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type MouseEvent,
  type ReactNode,
} from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

// ── Types ────────────────────────────────────────────────────────────────────
export type ModalSize = 'sm' | 'md' | 'lg' | 'xl';

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  size?: ModalSize;
  className?: string;
  closeOnOverlayClick?: boolean;
  showCloseButton?: boolean;
}

// ── Style maps ────────────────────────────────────────────────────────────────
const sizeMap: Record<ModalSize, string> = {
  sm: 'max-w-sm',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
};

// ── Animation variants ────────────────────────────────────────────────────────
const backdropVariants: Variants = {
  hidden:  { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.2 } },
  exit:    { opacity: 0, transition: { duration: 0.18, delay: 0.04 } },
};

const panelVariants: Variants = {
  hidden: { opacity: 0, scale: 0.94, y: 18 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 380, damping: 32, mass: 0.9 },
  },
  exit: {
    opacity: 0,
    scale: 0.96,
    y: 10,
    // Bezier ease-in — contourne le narrowing string de TS
    transition: { duration: 0.18, ease: [0.42, 0, 1, 1] as [number, number, number, number] },
  },
};

// ── Modal ─────────────────────────────────────────────────────────────────────
export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = 'md',
  className,
  closeOnOverlayClick = true,
  showCloseButton = true,
}: ModalProps) {
  const titleId       = useId();
  const descriptionId = useId();
  const panelRef      = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  // SSR-safe : on n'accède au DOM qu'après le montage client
  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // Scroll lock + Escape
  useEffect(() => {
    if (!open) return;

    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);

    // Focus le panel
    const raf = requestAnimationFrame(() => panelRef.current?.focus());

    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener('keydown', onKey);
      cancelAnimationFrame(raf);
    };
  }, [open, onClose]);

  const handleOverlayClick = useCallback(
    (e: MouseEvent<HTMLDivElement>) => {
      if (closeOnOverlayClick && e.target === e.currentTarget) onClose();
    },
    [closeOnOverlayClick, onClose],
  );

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
          role="presentation"
          onClick={handleOverlayClick}
        >
          {/* ── Backdrop ── */}
          <motion.div
            key="backdrop"
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="absolute inset-0 bg-noir/50 backdrop-blur-[3px]"
            aria-hidden
          />

          {/* ── Panel ── */}
          <motion.div
            key="panel"
            ref={panelRef}
            variants={panelVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            role="dialog"
            aria-modal="true"
            aria-labelledby={title ? titleId : undefined}
            aria-describedby={description ? descriptionId : undefined}
            tabIndex={-1}
            className={cn(
              'relative z-10 flex w-full flex-col overflow-hidden rounded-sm',
              'border border-gris-cl/70 bg-blanc',
              'shadow-modal outline-none',
              // Liquid glass : refraction edge
              'ring-1 ring-inset ring-blanc/30',
              sizeMap[size],
              className,
            )}
          >
            {/* ── Header ── */}
            {(title || showCloseButton) && (
              <div className="flex items-start justify-between gap-4 border-b border-gris-cl/60 px-5 py-4">
                <div className="min-w-0">
                  {title && (
                    <h2
                      id={titleId}
                      className="text-base font-bold tracking-tight text-noir"
                    >
                      {title}
                    </h2>
                  )}
                  {description && (
                    <p
                      id={descriptionId}
                      className="mt-1 text-[13px] leading-relaxed text-gris"
                    >
                      {description}
                    </p>
                  )}
                </div>

                {showCloseButton && (
                  <motion.button
                    type="button"
                    onClick={onClose}
                    aria-label="Fermer"
                    whileTap={{ scale: 0.9 }}
                    transition={{ duration: 0.1 }}
                    className={cn(
                      'flex size-8 shrink-0 items-center justify-center rounded-sm',
                      'text-gris transition-colors duration-150',
                      'hover:bg-beige2 hover:text-noir',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-or',
                    )}
                  >
                    <X size={16} strokeWidth={1.5} aria-hidden />
                  </motion.button>
                )}
              </div>
            )}

            {/* ── Body ── */}
            <div className="max-h-[min(68vh,640px)] overflow-y-auto px-5 py-5">
              {children}
            </div>

            {/* ── Footer ── */}
            {footer && (
              <div className="flex flex-wrap items-center justify-end gap-3 border-t border-gris-cl/60 bg-beige/60 px-5 py-4">
                {footer}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
