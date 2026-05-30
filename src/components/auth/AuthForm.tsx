'use client';

/**
 * AuthForm — Formulaire login / register avec Supabase Auth
 *
 * Mode login  : email + password + lien "Mot de passe oublié"
 * Mode register : email + password + confirmation
 * Google OAuth : bouton unique pour les deux modes
 */

import { useState, useCallback }        from 'react';
import { useForm }                       from 'react-hook-form';
import { zodResolver }                   from '@hookform/resolvers/zod';
import { z }                             from 'zod';
import { motion, AnimatePresence }       from 'framer-motion';
import { Eye, EyeOff, Loader2 }  from 'lucide-react';
import { cn }                            from '@/lib/utils';
import { createClient }                  from '@/lib/supabase/client';

// ─── Schemas ──────────────────────────────────────────────────────────────────

const loginSchema = z.object({
  email:    z.string().email('Adresse email invalide'),
  password: z.string().min(6, 'Minimum 6 caractères'),
});

const registerSchema = z.object({
  email:    z.string().email('Adresse email invalide'),
  password: z.string().min(8, 'Minimum 8 caractères'),
  confirm:  z.string(),
  nom:      z.string().min(2, 'Minimum 2 caractères'),
}).refine((d) => d.password === d.confirm, {
  message: 'Les mots de passe ne correspondent pas',
  path: ['confirm'],
});

type LoginForm    = z.infer<typeof loginSchema>;
type RegisterForm = z.infer<typeof registerSchema>;

// ─── Google Icon ──────────────────────────────────────────────────────────────

function GoogleIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  );
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface AuthFormProps {
  mode:        'login' | 'register';
  redirectTo?: string;
}

// ─── AuthForm ─────────────────────────────────────────────────────────────────

export function AuthForm({ mode, redirectTo = '/compte' }: AuthFormProps) {
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');
  const [success,  setSuccess]  = useState('');
  const [showPass, setShowPass] = useState(false);

  const supabase = createClient();

  // ── Login form ──────────────────────────────────────────────────────────────
  const loginForm = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const registerForm = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  });

  // ── Handlers ────────────────────────────────────────────────────────────────

  const handleLogin = useCallback(async (data: LoginForm) => {
    setLoading(true);
    setError('');
    const { error } = await supabase.auth.signInWithPassword({
      email:    data.email,
      password: data.password,
    });
    setLoading(false);
    if (error) {
      setError(
        error.message === 'Invalid login credentials'
          ? 'Email ou mot de passe incorrect'
          : error.message,
      );
      return;
    }
    // Redirection gérée par le middleware
    window.location.href = redirectTo;
  }, [supabase, redirectTo]);

  const handleRegister = useCallback(async (data: RegisterForm) => {
    setLoading(true);
    setError('');
    const { error } = await supabase.auth.signUp({
      email:    data.email,
      password: data.password,
      options: {
        data: { full_name: data.nom },
        emailRedirectTo: `${window.location.origin}/auth/callback?redirectTo=${redirectTo}`,
      },
    });
    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    setSuccess('Un email de confirmation vous a été envoyé. Vérifiez votre boîte mail.');
  }, [supabase, redirectTo]);

  const handleGoogle = useCallback(async () => {
    setLoading(true);
    setError('');
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback?redirectTo=${redirectTo}`,
      },
    });
    if (error) {
      setLoading(false);
      setError(error.message);
    }
    // Si ok, Supabase redirige automatiquement vers Google
  }, [supabase, redirectTo]);

  // ── Succès (register email envoyé) ────────────────────────────────────────
  if (success) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-8"
      >
        <div className="mb-4 flex size-14 items-center justify-center rounded-full bg-vert/10 mx-auto">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path d="M20 6L9 17l-5-5" stroke="#3A8A3A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <p className="text-[14px] font-semibold text-noir mb-2">Vérifiez votre email</p>
        <p className="text-[12px] text-gris leading-relaxed max-w-[280px] mx-auto">{success}</p>
      </motion.div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Google OAuth */}
      <button
        type="button"
        onClick={handleGoogle}
        disabled={loading}
        className={cn(
          'w-full flex items-center justify-center gap-3 rounded-sm border border-gris-cl px-5 py-3.5',
          'text-[11px] font-semibold text-noir/80 transition-all duration-200',
          'hover:bg-beige2 hover:border-gris-cl active:scale-[0.98]',
          'disabled:opacity-50 disabled:cursor-not-allowed',
        )}
      >
        {loading ? (
          <Loader2 size={15} className="animate-spin text-gris" aria-hidden />
        ) : (
          <GoogleIcon />
        )}
        Continuer avec Google
      </button>

      {/* Séparateur */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-gris-cl" aria-hidden />
        <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-gris/50">ou</span>
        <div className="flex-1 h-px bg-gris-cl" aria-hidden />
      </div>

      {/* Formulaire login */}
      {mode === 'login' && (
        <form onSubmit={loginForm.handleSubmit(handleLogin)} noValidate className="space-y-4">
          <AuthField label="Email" error={loginForm.formState.errors.email?.message} required>
            <input
              {...loginForm.register('email')}
              type="email"
              placeholder="votre@email.com"
              autoComplete="email"
              className={authInput(!!loginForm.formState.errors.email)}
            />
          </AuthField>

          <AuthField label="Mot de passe" error={loginForm.formState.errors.password?.message} required>
            <div className="relative">
              <input
                {...loginForm.register('password')}
                type={showPass ? 'text' : 'password'}
                placeholder="••••••••"
                autoComplete="current-password"
                className={cn(authInput(!!loginForm.formState.errors.password), 'pr-11')}
              />
              <button
                type="button"
                onClick={() => setShowPass((s) => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gris hover:text-noir transition-colors"
                aria-label={showPass ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
              >
                {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </AuthField>

          <div className="flex justify-end">
            <a
              href="/auth/forgot-password"
              className="text-[10.5px] text-or/70 hover:text-or transition-colors"
            >
              Mot de passe oublié ?
            </a>
          </div>

          <ErrorBanner error={error} />

          <button
            type="submit"
            disabled={loading}
            className={submitBtn}
          >
            {loading ? <Loader2 size={14} className="animate-spin" /> : null}
            Se connecter
          </button>
        </form>
      )}

      {/* Formulaire register */}
      {mode === 'register' && (
        <form onSubmit={registerForm.handleSubmit(handleRegister)} noValidate className="space-y-4">
          <AuthField label="Nom complet" error={registerForm.formState.errors.nom?.message} required>
            <input
              {...registerForm.register('nom')}
              type="text"
              placeholder="Votre nom"
              autoComplete="name"
              className={authInput(!!registerForm.formState.errors.nom)}
            />
          </AuthField>

          <AuthField label="Email" error={registerForm.formState.errors.email?.message} required>
            <input
              {...registerForm.register('email')}
              type="email"
              placeholder="votre@email.com"
              autoComplete="email"
              className={authInput(!!registerForm.formState.errors.email)}
            />
          </AuthField>

          <AuthField label="Mot de passe" error={registerForm.formState.errors.password?.message} required>
            <div className="relative">
              <input
                {...registerForm.register('password')}
                type={showPass ? 'text' : 'password'}
                placeholder="8 caractères minimum"
                autoComplete="new-password"
                className={cn(authInput(!!registerForm.formState.errors.password), 'pr-11')}
              />
              <button
                type="button"
                onClick={() => setShowPass((s) => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gris hover:text-noir transition-colors"
                aria-label={showPass ? 'Masquer' : 'Afficher'}
              >
                {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </AuthField>

          <AuthField label="Confirmer le mot de passe" error={registerForm.formState.errors.confirm?.message} required>
            <input
              {...registerForm.register('confirm')}
              type={showPass ? 'text' : 'password'}
              placeholder="Répéter le mot de passe"
              autoComplete="new-password"
              className={authInput(!!registerForm.formState.errors.confirm)}
            />
          </AuthField>

          <ErrorBanner error={error} />

          <button type="submit" disabled={loading} className={submitBtn}>
            {loading ? <Loader2 size={14} className="animate-spin" /> : null}
            Créer mon compte
          </button>

          <p className="text-center text-[10px] text-gris/60 leading-relaxed">
            En créant un compte, vous acceptez nos{' '}
            <a href="/mentions-legales" className="underline underline-offset-2 hover:text-gris transition-colors">
              conditions générales
            </a>.
          </p>
        </form>
      )}
    </div>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function AuthField({
  label, error, required, children,
}: { label: string; error?: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[10.5px] font-semibold uppercase tracking-[0.18em] text-noir/60">
        {label}{required && <span className="ml-1 text-or/70" aria-hidden>*</span>}
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

function ErrorBanner({ error }: { error: string }) {
  if (!error) return null;
  return (
    <motion.div
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-sm bg-rouge/8 border border-rouge/20 px-4 py-3 text-[11px] text-rouge"
      role="alert"
    >
      {error}
    </motion.div>
  );
}

function authInput(hasError: boolean) {
  return cn(
    'w-full rounded-sm border px-4 py-3 text-[12px] text-noir placeholder:text-gris/45',
    'bg-blanc focus:outline-none focus:ring-2 focus:ring-or/40 focus:border-or/60',
    'transition-colors duration-200',
    hasError ? 'border-rouge/50' : 'border-gris-cl',
  );
}

const submitBtn = cn(
  'w-full flex items-center justify-center gap-2.5 rounded-sm px-6 py-3.5',
  'text-[10.5px] font-semibold uppercase tracking-[0.22em] text-blanc',
  'bg-noir hover:bg-noir/80 transition-all duration-200 active:scale-[0.98]',
  'disabled:opacity-60 disabled:cursor-not-allowed',
);
