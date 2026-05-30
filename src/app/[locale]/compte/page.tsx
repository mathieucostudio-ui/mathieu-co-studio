/**
 * /compte — Espace client
 *
 * Layout (from SVG maquette compte-utilisateur-mathieu-co 1.svg):
 *   ┌─────────────────────────────────────────────┐
 *   │  Header compte — fond noir, avatar + nom     │
 *   ├────────────┬────────────────────────────────┤
 *   │  Sidebar   │  Contenu tab actif             │
 *   │  (240px)   │                                │
 *   │  • Profil  │  Commandes / Wishlist /        │
 *   │  • Cmdes   │  Adresses / Sécurité           │
 *   │  • Wishlist│                                │
 *   │  • Adresses│                                │
 *   │  • Sécu    │                                │
 *   │  • Logout  │                                │
 *   └────────────┴────────────────────────────────┘
 *
 * Protégée par le middleware — user est forcément connecté.
 */

import type { Metadata }    from 'next';
import { redirect }          from 'next/navigation';
import { setRequestLocale }  from 'next-intl/server';
import { createClient }      from '@/lib/supabase/server';
import { CompteClient }      from '@/components/compte/CompteClient';

export const metadata: Metadata = {
  title:  'Mon Compte — Mathieu&Co Studio',
  robots: 'noindex',
};

type Props = {
  params:      Promise<{ locale: string }>;
  searchParams: Promise<{ tab?: string }>;
};

export default async function ComptePage({ params, searchParams }: Props) {
  const { locale }  = await params;
  const { tab }     = await searchParams;
  setRequestLocale(locale);

  // Double-check session (le middleware protège déjà, mais on vérifie)
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/auth/login?redirectTo=/compte');

  // Récupérer les données du profil et les commandes récentes en parallèle
  const [profileRes, commandesRes] = await Promise.allSettled([
    supabase
      .from('clients')
      .select('id, nom, prenom, email, telephone, ville, pays, newsletter')
      .eq('email', user.email!)
      .maybeSingle(),
    supabase
      .from('commandes')
      .select('id, numero, statut, total, created_at, commandes_items(id, nom_produit, quantite, prix_unitaire)')
      .eq('client_email', user.email!)
      .order('created_at', { ascending: false })
      .limit(10),
  ]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const profile   = profileRes.status   === 'fulfilled' ? (profileRes.value.data as any)   : null;
  const commandes = commandesRes.status === 'fulfilled' ? commandesRes.value.data ?? [] : [];

  return (
    <div className="min-h-[100dvh] bg-beige">
      <CompteClient
        user={{
          id:     user.id,
          email:  user.email ?? '',
          nom:    profile ? `${profile.prenom ?? ''} ${profile.nom ?? ''}`.trim() : (user.user_metadata?.full_name ?? ''),
          avatar: user.user_metadata?.avatar_url ?? null,
        }}
        commandes={commandes as CompteCommande[]}
        activeTab={(tab as CompteTab) ?? 'commandes'}
      />
    </div>
  );
}

// ─── Re-export des types utilisés dans CompteClient ──────────────────────────

export type CompteTab = 'commandes' | 'wishlist' | 'adresses' | 'securite';

export interface CompteCommande {
  id:               string;
  numero:           string;
  statut:           string;
  total:            number;
  created_at:       string;
  commandes_items?: { id: string; nom_produit: string; quantite: number; prix_unitaire: number }[];
}
