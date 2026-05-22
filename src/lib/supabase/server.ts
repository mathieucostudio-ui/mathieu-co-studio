/**
 * Client Supabase — côté serveur (Server Components, Server Actions, Route Handlers)
 *
 * Utilise @supabase/ssr createServerClient avec cookies() de next/headers.
 * IMPORTANT : cette fonction est async et doit être appelée avec await.
 * Ne pas mettre en singleton — chaque requête doit avoir sa propre instance
 * pour que les cookies soient correctement lus/écrits.
 *
 * Usage :
 *   import { createClient } from '@/lib/supabase/server'
 *   const supabase = await createClient()
 *   const { data } = await supabase.from('produits').select('*')
 *
 * Pour les opérations admin (bypass RLS) :
 *   import { createAdminClient } from '@/lib/supabase/server'
 *   const supabase = createAdminClient()   // synchrone, pas de cookies
 */

import { createServerClient } from '@supabase/ssr';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import type { Database } from '@/types/database';

// ─── Client standard (anon key, respecte les RLS policies) ───────────────────

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Dans un Server Component, les cookies ne peuvent pas être écrits.
            // Cette erreur est normale — elle est levée uniquement dans les
            // composants qui lisent la session (pas dans les Server Actions).
          }
        },
      },
    },
  );
}

// ─── Client admin (service_role, bypass RLS — server-side uniquement) ─────────
// ⚠  Ne jamais exposer la service_role key côté client.

export function createAdminClient() {
  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession:   false,
      },
    },
  );
}
