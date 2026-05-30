/**
 * /auth/register — Page de création de compte
 */

import type { Metadata }    from 'next';
import { setRequestLocale }  from 'next-intl/server';
import Link                  from 'next/link';
import { AuthForm }          from '@/components/auth/AuthForm';

export const metadata: Metadata = {
  title:  'Créer un compte — Mathieu&Co Studio',
  robots: 'noindex',
};

type Props = {
  params:      Promise<{ locale: string }>;
  searchParams: Promise<{ redirectTo?: string }>;
};

export default async function RegisterPage({ params, searchParams }: Props) {
  const { locale }    = await params;
  const { redirectTo} = await searchParams;
  setRequestLocale(locale);

  return (
    <div className="min-h-[100dvh] bg-beige flex flex-col items-center justify-center px-4 py-16">
      <div className="w-full max-w-[440px]">

        {/* Logo */}
        <div className="mb-10 text-center">
          <Link href="/" className="inline-block">
            <span
              className="font-display font-light italic text-noir"
              style={{ fontSize: 'clamp(1.4rem, 3vw, 1.8rem)' }}
            >
              Mathieu&amp;Co
            </span>
          </Link>
          <p className="mt-2 text-[9.5px] font-semibold uppercase tracking-[0.3em] text-gris/60">
            Studio · Boutique
          </p>
        </div>

        {/* Card */}
        <div className="rounded-sm border border-gris-cl bg-blanc p-8 shadow-sm">
          <h1 className="text-[18px] font-semibold text-noir mb-1.5">Créer un compte</h1>
          <p className="text-[11.5px] text-gris mb-7">
            Rejoignez Mathieu&amp;Co Studio et accédez à toute notre boutique design.
          </p>

          <AuthForm mode="register" redirectTo={redirectTo ?? '/compte'} />

          {/* Lien login */}
          <p className="mt-6 text-center text-[11px] text-gris">
            Déjà un compte ?{' '}
            <Link href="/auth/login" className="font-semibold text-noir hover:text-or transition-colors">
              Se connecter
            </Link>
          </p>
        </div>

        {/* Back */}
        <div className="mt-6 text-center">
          <Link
            href="/"
            className="text-[10px] font-semibold uppercase tracking-[0.2em] text-gris/50 hover:text-gris transition-colors"
          >
            ← Retour à l&apos;accueil
          </Link>
        </div>
      </div>
    </div>
  );
}
