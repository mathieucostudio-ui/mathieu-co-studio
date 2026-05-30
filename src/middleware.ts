/**
 * Middleware Next.js — i18n + protection de routes
 *
 * Chaîne :
 *   1. next-intl  : routing localisé (fr/en avec localePrefix: 'as-needed')
 *   2. Auth guard : /compte et /admin/* → redirect /auth/login si non connecté
 *                   /auth/*           → redirect /compte  si déjà connecté
 *
 * Gestion de session : le middleware rafraîchit le cookie Supabase sur chaque
 * requête via createServerClient (pattern recommandé @supabase/ssr).
 */

import { NextRequest, NextResponse } from 'next/server';
import createIntlMiddleware           from 'next-intl/middleware';
import { createServerClient }         from '@supabase/ssr';
import { routing }                    from '@/i18n/routing';

// ─── next-intl handler ───────────────────────────────────────────────────────

const handleI18n = createIntlMiddleware(routing);

// ─── Routes protégées ────────────────────────────────────────────────────────

/** Patterns qui nécessitent d'être connecté */
const PROTECTED_PATTERNS = [
  /^\/(fr\/)?compte(\/.*)?$/,
  /^\/admin(\/.*)?$/,
];

/** Patterns accessibles seulement si NON connecté */
const AUTH_ONLY_PATTERNS = [
  /^\/(fr\/)?auth\/(login|register)(\/.*)?$/,
];

function matchesPattern(pathname: string, patterns: RegExp[]): boolean {
  return patterns.some((p) => p.test(pathname));
}

// ─── Middleware ───────────────────────────────────────────────────────────────

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Passer les fichiers statiques et API routes non-auth
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api/webhooks') ||
    pathname.startsWith('/favicon') ||
    pathname.match(/\.(svg|png|jpg|jpeg|gif|ico|webp|avif|woff|woff2)$/)
  ) {
    return NextResponse.next();
  }

  // ── Créer la réponse i18n de base ─────────────────────────────────────────
  const i18nResponse = handleI18n(request);

  // ── Rafraîchir le cookie de session Supabase ──────────────────────────────
  // On crée un client "edge-compatible" qui lit/écrit les cookies
  // sur la request/response. C'est le pattern officiel @supabase/ssr.
  const response = i18nResponse ?? NextResponse.next({
    request: { headers: request.headers },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // IMPORTANT : appeler getUser() rafraîchit le token si nécessaire
  const { data: { user } } = await supabase.auth.getUser();

  // ── Auth guards ───────────────────────────────────────────────────────────

  if (matchesPattern(pathname, PROTECTED_PATTERNS) && !user) {
    // Non connecté → rediriger vers login avec `redirectTo`
    const loginUrl = new URL('/auth/login', request.url);
    loginUrl.searchParams.set('redirectTo', pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (matchesPattern(pathname, AUTH_ONLY_PATTERNS) && user) {
    // Déjà connecté → rediriger vers l'espace compte
    return NextResponse.redirect(new URL('/compte', request.url));
  }

  return response;
}

// ─── Config matcher ───────────────────────────────────────────────────────────

export const config = {
  // Exclure les fichiers statiques et _next, matcher sur tout le reste
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|ico|webp|avif|woff|woff2|mp4|webm)).*)',
  ],
};
