'use client';

/**
 * Newsletter — Section fond noir, capture email
 *
 * Maquette SVG y=3220, h=280 :
 *   • fond #151515
 *   • Input email : x=495 y=3399 w=319 h=45, bordure blanche opacity 0.2
 *   • Bouton or   : x=815 y=3399 w=130 h=46, fill #B8893A
 *   • Total form  : 449px, centré à x=720 (milieu exact du viewport 1440px)
 */

import {
  useState,
  useCallback,
  useId,
  type FormEvent,
  type ChangeEvent,
} from 'react';
import { motion, AnimatePresence, useReducedMotion, type Variants } from 'framer-motion';
import { ArrowRight, CheckCircle2, Loader2, Mail } from 'lucide-react';
import { cn } from '@/lib/utils';

// ─────────────────────────────────────────────────────────────────────────────
//  Constantes
// ─────────────────────────────────────────────────────────────────────────────
/** Simule un POST newsletter (à remplacer par vraie API route) */
async function subscribeEmail(email: string): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 1200));
  if (email.includes('test-error')) {
    throw new Error('Adresse déjà inscrite.');
  }
}

// ─────────────────────────────────────────────────────────────────────────────
//  Animation variants
// ─────────────────────────────────────────────────────────────────────────────
const SPRING: [number, number, number, number] = [0.16, 1, 0.3, 1];

const containerVariants: Variants = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.12, delayChildren: 0.05 } },
};

const fadeUp: Variants = {
  hidden:  { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.65, ease: SPRING } },
};

const successVariants: Variants = {
  hidden:  { opacity: 0, scale: 0.93, y: 10 },
  visible: {
    opacity: 1, scale: 1, y: 0,
    transition: { type: 'spring', stiffness: 340, damping: 26 },
  },
  exit: {
    opacity: 0, scale: 0.96, y: -8,
    transition: { duration: 0.2 },
  },
};

// ─────────────────────────────────────────────────────────────────────────────
//  Newsletter
// ─────────────────────────────────────────────────────────────────────────────
export function Newsletter() {
  const reduced = useReducedMotion();
  const emailId = useId();

  const [email,       setEmail]       = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess,   setIsSuccess]   = useState(false);
  const [error,       setError]       = useState<string | null>(null);

  // ── Validation simple ──────────────────────────────────────────────────────
  const isValidEmail = (v: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());

  // ── Soumission ─────────────────────────────────────────────────────────────
  const handleSubmit = useCallback(
    async (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      setError(null);

      if (!isValidEmail(email)) {
        setError('Veuillez saisir une adresse email valide.');
        return;
      }

      setIsSubmitting(true);
      try {
        await subscribeEmail(email.trim());
        setIsSuccess(true);
        setEmail('');
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Une erreur est survenue. Veuillez réessayer.",
        );
      } finally {
        setIsSubmitting(false);
      }
    },
    [email],
  );

  const handleChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    if (error) setError(null);
  }, [error]);

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <section
      className="relative w-full overflow-hidden bg-noir"
      aria-label="Inscription à la newsletter"
    >
      {/* Ligne or haut */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-or/25 to-transparent" aria-hidden />

      {/* ── Décor : halo or centré ──────────────────────────────────────────── */}
      <div
        className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2"
        aria-hidden
      >
        <div className="h-80 w-80 rounded-full bg-or/[0.06] blur-[80px]" />
      </div>

      {/* ── Contenu ─────────────────────────────────────────────────────────── */}
      <div className="relative z-10 mx-auto max-w-3xl px-6 py-16 md:px-20 md:py-20 xl:px-24">
        <motion.div
          variants={reduced ? undefined : containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          className="flex flex-col items-center text-center"
        >

          {/* ── Eyebrow ── */}
          <motion.div
            variants={reduced ? undefined : fadeUp}
            className="mb-6 flex items-center gap-3"
          >
            <span className="block h-px w-6 bg-or/50" aria-hidden />
            <span className="text-[9.5px] font-semibold uppercase tracking-[0.35em] text-or/70">
              Newsletter
            </span>
            <span className="block h-px w-6 bg-or/50" aria-hidden />
          </motion.div>

          {/* ── Titre ── */}
          <motion.h2
            variants={reduced ? undefined : fadeUp}
            className="mb-4 font-display font-light italic text-blanc"
            style={{ fontSize: 'clamp(1.75rem, 3.5vw, 2.75rem)' }}
          >
            Restez Inspiré
          </motion.h2>

          {/* ── Sous-titre ── */}
          <motion.p
            variants={reduced ? undefined : fadeUp}
            className="mb-10 max-w-md text-[13px] leading-relaxed text-blanc/45 md:text-sm"
          >
            Tendances intérieur, coulisses de nos projets, pièces exclusives de la boutique —
            une lettre bimestrielle, sans superflu.
          </motion.p>

          {/* ── Zone form / succès ─────────────────────────────────────────────── */}
          <motion.div variants={reduced ? undefined : fadeUp} className="w-full">
            <AnimatePresence mode="wait">

              {/* ── Succès ── */}
              {isSuccess ? (
                <motion.div
                  key="success"
                  variants={reduced ? undefined : successVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="flex flex-col items-center gap-3 py-4"
                  role="status"
                  aria-live="polite"
                >
                  <CheckCircle2 size={32} strokeWidth={1.5} className="text-or" aria-hidden />
                  <p className="text-sm font-medium text-blanc">
                    Inscription confirmée — à très bientôt !
                  </p>
                  <p className="text-[12px] text-blanc/40">
                    Vérifiez votre boîte mail pour confirmer votre adresse.
                  </p>
                </motion.div>
              ) : (

                /* ── Formulaire ── */
                <motion.form
                  key="form"
                  variants={reduced ? undefined : successVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  onSubmit={handleSubmit}
                  noValidate
                  className="w-full"
                >
                  {/* Row : input + bouton (miroir exact du SVG) */}
                  <div className="flex w-full items-stretch justify-center">

                    {/* ── Input email (SVG : w=319, border blanc/0.2) ── */}
                    <div className="relative flex-1 max-w-[320px]">
                      <label htmlFor={emailId} className="sr-only">
                        Votre adresse email
                      </label>

                      {/* Icône mail */}
                      <span
                        className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-blanc/25"
                        aria-hidden
                      >
                        <Mail size={14} strokeWidth={1.5} />
                      </span>

                      <input
                        id={emailId}
                        type="email"
                        autoComplete="email"
                        required
                        value={email}
                        onChange={handleChange}
                        disabled={isSubmitting}
                        placeholder="votre@email.com"
                        aria-describedby={error ? `${emailId}-error` : undefined}
                        aria-invalid={error ? 'true' : 'false'}
                        className={cn(
                          'h-[46px] w-full rounded-l-sm border-y border-l pl-10 pr-4',
                          'bg-blanc/[0.04] font-sans text-[13px] text-blanc placeholder:text-blanc/25',
                          'outline-none transition-colors duration-200',
                          error
                            ? 'border-rouge/60 focus:border-rouge/80'
                            : 'border-blanc/[0.18] focus:border-or/55',
                          'disabled:cursor-not-allowed disabled:opacity-50',
                        )}
                      />
                    </div>

                    {/* ── Bouton or (SVG : w=130) ── */}
                    <motion.button
                      type="submit"
                      disabled={isSubmitting || !email}
                      whileTap={reduced || isSubmitting ? undefined : { scale: 0.97 }}
                      transition={{ duration: 0.1 }}
                      className={cn(
                        'flex h-[46px] w-[130px] shrink-0 items-center justify-center gap-2',
                        'rounded-r-sm bg-or',
                        'text-[10.5px] font-semibold uppercase tracking-[0.2em] text-blanc',
                        'transition-all duration-200',
                        'hover:bg-or-dark',
                        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-or',
                        'focus-visible:ring-offset-2 focus-visible:ring-offset-noir',
                        'disabled:cursor-not-allowed disabled:opacity-55',
                      )}
                      aria-label={isSubmitting ? 'Envoi en cours…' : "S'inscrire à la newsletter"}
                    >
                      {isSubmitting ? (
                        <Loader2 size={14} strokeWidth={2} className="animate-spin" aria-hidden />
                      ) : (
                        <>
                          <span>S&apos;inscrire</span>
                          <ArrowRight size={13} strokeWidth={2} aria-hidden />
                        </>
                      )}
                    </motion.button>
                  </div>

                  {/* ── Message d'erreur ── */}
                  <AnimatePresence>
                    {error && (
                      <motion.p
                        id={`${emailId}-error`}
                        role="alert"
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        transition={{ duration: 0.2 }}
                        className="mt-3 text-[11px] text-rouge-light"
                      >
                        {error}
                      </motion.p>
                    )}
                  </AnimatePresence>

                  {/* ── Note confidentialité ── */}
                  <p className="mt-4 text-[10.5px] text-blanc/25">
                    Sans spam. Désinscription en un clic. Conformément au&nbsp;
                    <span className="underline underline-offset-2 opacity-60 transition-opacity hover:opacity-100">
                      RGPD
                    </span>
                    .
                  </p>
                </motion.form>
              )}
            </AnimatePresence>
          </motion.div>

        </motion.div>
      </div>

      {/* Ligne or bas */}
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-or/25 to-transparent" aria-hidden />
    </section>
  );
}
