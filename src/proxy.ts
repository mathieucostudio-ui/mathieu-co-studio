/**
 * proxy.ts — Middleware Next.js 16 : i18n + auth guard Supabase
 *
 * Dans Next.js 16, le fichier proxy.ts remplace middleware.ts.
 *
 * Chaîne :
 *   1. next-intl  : routing localisé (fr/en, localePrefix: 'as-needed')
 *   2. Auth guard : /compte et /admin/* → redirect /auth/login si non connecté
 *                   /auth/*             → redirect /compte si déjà connecté
 *
 * Gestion de session : le middleware rafraîchit le cookie Supabase sur chaque
 * requête via createServerClient (@supabase/ssr — pattern officiel).
 */

import { NextRequest, NextResponse }  from 'next/server';
import createIntlMiddleware            from 'next-intl/middleware';
import { createServerClient }          from '@supabase/ssr';
import { routing }                     from './i18n/routing';

// ─── next-intl handler ───────────────────────────────────────────────────────

const handleI18n = createIntlMiddleware(routing);

// ─── Routes protégées ────────────────────────────────────────────────────────

/** Nécessite d'être connecté */
const PROTECTED_PATTERNS = [
  /^\/(fr\/)?compte(\/.*)?$/,
  /^\/admin(\/.*)?$/,
];

/** Accessible seulement si NON connecté */
const AUTH_ONLY_PATTERNS = [
  /^\/(fr\/)?auth\/(login|register)(\/.*)?$/,
];

function matchesPattern(pathname: string, patterns: RegExp[]): boolean {
  return patterns.some((p) => p.test(pathname));
}

// ─── Proxy (middleware) ───────────────────────────────────────────────────────

export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Passer les assets statiques et webhooks directement
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api/webhooks') ||
    pathname.startsWith('/favicon') ||
    pathname.match(/\.(svg|png|jpg|jpeg|gif|ico|webp|avif|woff|woff2|mp4|webm)$/)
  ) {
    return NextResponse.next();
  }

  // ── Routing i18n ──────────────────────────────────────────────────────────
  const i18nResponse = handleI18n(request);
  const response = i18nResponse ?? NextResponse.next({
    request: { headers: request.headers },
  });

  // ── Rafraîchir la session Supabase ────────────────────────────────────────
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

  // getUser() rafraîchit le token expiré si nécessaire
  const { data: { user } } = await supabase.auth.getUser();

  // ── Auth guards ───────────────────────────────────────────────────────────

  if (matchesPattern(pathname, PROTECTED_PATTERNS) && !user) {
    const loginUrl = new URL('/auth/login', request.url);
    loginUrl.searchParams.set('redirectTo', pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (matchesPattern(pathname, AUTH_ONLY_PATTERNS) && user) {
    return NextResponse.redirect(new URL('/compte', request.url));
  }

  return response;
}

// ─── Matcher ─────────────────────────────────────────────────────────────────

export const config = {
  matcher: ['/((?!api|trpc|_next|_vercel|.*\\..*).*)'],
};
