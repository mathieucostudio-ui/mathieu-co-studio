'use client';

/**
 * ContactForm — Formulaire React Hook Form + Zod (client-side)
 *
 * Champs : nom, email, téléphone (optionnel), sujet, message
 * Validation : zod schema
 * Soumission : POST /api/contact (à implémenter si besoin)
 */

import { useState }                         from 'react';
import { useForm }                          from 'react-hook-form';
import { zodResolver }                      from '@hookform/resolvers/zod';
import { z }                                from 'zod';
import { motion, AnimatePresence }          from 'framer-motion';
import { Send, CheckCircle, Loader2, X }   from 'lucide-react';
import { cn }                               from '@/lib/utils';

// ─── Schema ───────────────────────────────────────────────────────────────────

const SUJETS = [
  'Architecture intérieure',
  'Décoration contemporaine',
  'Gestion de projet',
  'Boutique design',
  'Autre',
] as const;

const schema = z.object({
  nom:       z.string().min(2, 'Veuillez entrer votre nom (min. 2 caractères)'),
  email:     z.string().email('Adresse email invalide'),
  telephone: z.string().optional(),
  sujet:     z.enum(SUJETS, { message: 'Veuillez choisir un sujet' }),
  message:   z.string().min(20, 'Le message doit faire au moins 20 caractères'),
});

type FormData = z.infer<typeof schema>;

// ─── ContactForm ──────────────────────────────────────────────────────────────

export function ContactForm() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    setStatus('loading');
    try {
      // POST to /api/contact — returns 200 on success
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Erreur serveur');
      setStatus('success');
      reset();
    } catch {
      setStatus('error');
      setErrorMsg('Une erreur est survenue. Réessayez ou contactez-nous directement par WhatsApp.');
    }
  };

  if (status === 'success') {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center gap-6 py-20 text-center"
      >
        <div className="flex size-16 items-center justify-center rounded-full bg-vert/10">
          <CheckCircle size={28} strokeWidth={1.5} className="text-vert" />
        </div>
        <div>
          <p className="text-[15px] font-semibold text-noir mb-2">Message envoyé</p>
          <p className="text-[12px] text-gris leading-relaxed max-w-[280px]">
            Nous vous répondons sous 24h ouvrées. À très bientôt.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setStatus('idle')}
          className="text-[10px] font-semibold uppercase tracking-[0.22em] text-or hover:text-or-dark transition-colors"
        >
          Nouveau message
        </button>
      </motion.div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className="flex flex-col gap-6"
      aria-label="Formulaire de contact"
    >
      {/* Nom + Email */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <Field label="Nom complet" error={errors.nom?.message} required>
          <input
            {...register('nom')}
            type="text"
            placeholder="Votre nom"
            autoComplete="name"
            className={inputClass(!!errors.nom)}
          />
        </Field>
        <Field label="Email" error={errors.email?.message} required>
          <input
            {...register('email')}
            type="email"
            placeholder="votre@email.com"
            autoComplete="email"
            className={inputClass(!!errors.email)}
          />
        </Field>
      </div>

      {/* Téléphone + Sujet */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <Field label="Téléphone" error={errors.telephone?.message}>
          <input
            {...register('telephone')}
            type="tel"
            placeholder="+229 XX XX XX XX"
            autoComplete="tel"
            className={inputClass(!!errors.telephone)}
          />
        </Field>
        <Field label="Sujet" error={errors.sujet?.message} required>
          <select
            {...register('sujet')}
            className={cn(inputClass(!!errors.sujet), 'appearance-none bg-right bg-no-repeat pr-8')}
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath d='M2 4l4 4 4-4' stroke='%2384827F' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E")`,
              backgroundPosition: 'right 12px center',
            }}
          >
            <option value="">Choisir un sujet</option>
            {SUJETS.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </Field>
      </div>

      {/* Message */}
      <Field label="Message" error={errors.message?.message} required>
        <textarea
          {...register('message')}
          rows={5}
          placeholder="Décrivez votre projet, vos attentes, votre budget et vos délais..."
          className={cn(inputClass(!!errors.message), 'resize-y min-h-[120px]')}
        />
      </Field>

      {/* Error banner */}
      <AnimatePresence>
        {status === 'error' && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex items-start gap-3 rounded-sm bg-rouge/8 border border-rouge/20 px-4 py-3 text-[11px] text-rouge"
          >
            <X size={13} strokeWidth={2} className="shrink-0 mt-0.5" aria-hidden />
            {errorMsg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Submit */}
      <button
        type="submit"
        disabled={status === 'loading'}
        className={cn(
          'group flex items-center justify-center gap-3 rounded-sm px-8 py-4 w-full sm:w-auto',
          'text-[10.5px] font-semibold uppercase tracking-[0.22em] text-blanc',
          'bg-noir transition-all duration-300',
          'hover:bg-noir/80 active:scale-[0.98]',
          'disabled:opacity-60 disabled:cursor-not-allowed',
        )}
      >
        {status === 'loading' ? (
          <>
            <Loader2 size={14} strokeWidth={2} className="animate-spin" aria-hidden />
            Envoi en cours…
          </>
        ) : (
          <>
            Envoyer le message
            <Send
              size={13}
              strokeWidth={2}
              className="transition-transform duration-200 group-hover:translate-x-0.5"
              aria-hidden
            />
          </>
        )}
      </button>

      <p className="text-[10px] text-gris/60 leading-relaxed">
        En soumettant ce formulaire, vous acceptez que vos données soient utilisées pour vous répondre.
        Consultez notre{' '}
        <a href="/confidentialite" className="underline underline-offset-2 hover:text-gris transition-colors">
          politique de confidentialité
        </a>.
      </p>
    </form>
  );
}

// ─── Field helper ─────────────────────────────────────────────────────────────

function Field({
  label,
  error,
  required,
  children,
}: {
  label:    string;
  error?:   string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[10.5px] font-semibold uppercase tracking-[0.18em] text-noir/70">
        {label}
        {required && (
          <span className="ml-1 text-or/70" aria-hidden>*</span>
        )}
      </label>
      {children}
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="text-[10px] text-rouge"
            role="alert"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

function inputClass(hasError: boolean) {
  return cn(
    'w-full rounded-sm border px-4 py-3',
    'text-[12px] text-noir placeholder:text-gris/50',
    'bg-blanc focus:outline-none focus:ring-2 focus:ring-or/40 focus:border-or/60',
    'transition-colors duration-200',
    hasError
      ? 'border-rouge/50 focus:ring-rouge/20'
      : 'border-gris-cl',
  );
}
