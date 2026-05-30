/**
 * GET /auth/callback
 *
 * Handler OAuth callback et magic link.
 * Échange le `code` contre une session Supabase puis redirige.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient }              from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code        = searchParams.get('code');
  const redirectTo  = searchParams.get('redirectTo') ?? '/compte';
  const error       = searchParams.get('error');
  const errorDesc   = searchParams.get('error_description');

  // OAuth error → rediriger vers login avec message
  if (error) {
    const loginUrl = new URL('/auth/login', origin);
    loginUrl.searchParams.set('error', errorDesc ?? error);
    return NextResponse.redirect(loginUrl);
  }

  if (code) {
    const supabase = await createClient();
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

    if (exchangeError) {
      console.error('[auth/callback] Erreur échange code :', exchangeError.message);
      const loginUrl = new URL('/auth/login', origin);
      loginUrl.searchParams.set('error', exchangeError.message);
      return NextResponse.redirect(loginUrl);
    }

    // Succès → rediriger vers la destination
    return NextResponse.redirect(new URL(redirectTo, origin));
  }

  // Aucun code → retour login
  return NextResponse.redirect(new URL('/auth/login', origin));
}
