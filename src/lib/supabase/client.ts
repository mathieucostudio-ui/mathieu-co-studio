'use client';

/**
 * Client Supabase — côté navigateur (Client Components)
 *
 * Utilise @supabase/ssr createBrowserClient.
 * Singleton : une seule instance par session navigateur.
 *
 * Usage :
 *   import { createClient } from '@/lib/supabase/client'
 *   const supabase = createClient()
 *   const { data } = await supabase.from('produits').select('*')
 */

import { createBrowserClient } from '@supabase/ssr';
import type { Database } from '@/types/database';

// Singleton — évite de recréer le client à chaque rendu
let browserClient: ReturnType<typeof createBrowserClient<Database>> | undefined;

export function createClient() {
  if (browserClient) return browserClient;

  browserClient = createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );

  return browserClient;
}
