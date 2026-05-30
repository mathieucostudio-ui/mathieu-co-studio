'use client';

/**
 * CompteClient — Dashboard espace client
 *
 * Tabs : Commandes · Wishlist · Adresses · Sécurité
 * Sidebar fixe avec avatar, info user et navigation.
 */

import { useState, useCallback }          from 'react';
import { motion, AnimatePresence }         from 'framer-motion';
import {
  Package, Heart, MapPin, Shield,
  LogOut, ChevronRight, User,
} from 'lucide-react';
import { cn }             from '@/lib/utils';
import { createClient }   from '@/lib/supabase/client';
import type { CompteTab, CompteCommande } from '@/app/[locale]/compte/page';

// ─── Types ────────────────────────────────────────────────────────────────────

interface CompteUser {
  id:     string;
  email:  string;
  nom:    string;
  avatar: string | null;
}

interface CompteClientProps {
  user:       CompteUser;
  commandes:  CompteCommande[];
  activeTab:  CompteTab;
}

// ─── Nav items ────────────────────────────────────────────────────────────────

const NAV_ITEMS: { id: CompteTab; label: string; icon: typeof Package }[] = [
  { id: 'commandes', label: 'Mes commandes', icon: Package },
  { id: 'wishlist',  label: 'Ma wishlist',   icon: Heart   },
  { id: 'adresses',  label: 'Mes adresses',  icon: MapPin  },
  { id: 'securite',  label: 'Sécurité',      icon: Shield  },
];

// ─── Statuts commande ─────────────────────────────────────────────────────────

const STATUT_LABELS: Record<string, string> = {
  en_attente:      'En attente',
  confirmee:       'Confirmée',
  en_preparation:  'En préparation',
  expediee:        'Expédiée',
  livree:          'Livrée',
  annulee:         'Annulée',
  remboursee:      'Remboursée',
};

const STATUT_COLORS: Record<string, string> = {
  en_attente:      'bg-amber-500/15 text-amber-400',
  confirmee:       'bg-blue-500/15 text-blue-400',
  en_preparation:  'bg-blue-500/15 text-blue-400',
  expediee:        'bg-purple-500/15 text-purple-400',
  livree:          'bg-vert/15 text-vert',
  annulee:         'bg-rouge/15 text-rouge',
  remboursee:      'bg-gris/15 text-gris',
};

// ─── CompteClient ─────────────────────────────────────────────────────────────

export function CompteClient({ user, commandes, activeTab: initialTab }: CompteClientProps) {
  const [tab, setTab] = useState<CompteTab>(initialTab);

  const handleLogout = useCallback(async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = '/';
  }, []);

  // Initiales avatar
  const initials = user.nom
    ? user.nom.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : user.email[0].toUpperCase();

  return (
    <div className="flex flex-col xl:flex-row min-h-[100dvh]">

      {/* ── Sidebar ─────────────────────────────────────────────────────────── */}
      <aside
        className="xl:w-[260px] xl:min-h-[100dvh] shrink-0 flex flex-col"
        style={{ backgroundColor: '#151515' }}
        aria-label="Navigation du compte"
      >
        {/* Avatar + infos */}
        <div className="px-6 pt-10 pb-8 border-b border-blanc/8">
          <div className="flex items-center gap-4">
            {user.avatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={user.avatar}
                alt={user.nom || user.email}
                className="size-12 rounded-full object-cover ring-2 ring-or/30"
              />
            ) : (
              <div className="size-12 rounded-full bg-or/20 flex items-center justify-center text-[13px] font-semibold text-or shrink-0">
                {initials}
              </div>
            )}
            <div className="min-w-0">
              <p className="text-[13px] font-semibold text-blanc/85 truncate">
                {user.nom || 'Mon compte'}
              </p>
              <p className="text-[10.5px] text-blanc/35 truncate mt-0.5">{user.email}</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-6">
          <ul className="space-y-1" role="list">
            {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
              <li key={id}>
                <button
                  type="button"
                  onClick={() => setTab(id)}
                  className={cn(
                    'w-full flex items-center gap-3 rounded-sm px-3 py-2.5 text-left',
                    'text-[11.5px] font-medium transition-all duration-200',
                    tab === id
                      ? 'bg-or/15 text-or'
                      : 'text-blanc/45 hover:text-blanc/70 hover:bg-blanc/5',
                  )}
                  aria-current={tab === id ? 'page' : undefined}
                >
                  <Icon size={14} strokeWidth={1.8} aria-hidden />
                  {label}
                  {tab === id && (
                    <ChevronRight size={12} className="ml-auto" aria-hidden />
                  )}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* Déconnexion */}
        <div className="px-3 pb-8">
          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center gap-3 rounded-sm px-3 py-2.5 text-[11.5px] font-medium text-blanc/35 hover:text-rouge/80 transition-colors duration-200"
          >
            <LogOut size={14} strokeWidth={1.8} aria-hidden />
            Se déconnecter
          </button>
        </div>
      </aside>

      {/* ── Contenu ──────────────────────────────────────────────────────────── */}
      <main className="flex-1 px-6 md:px-10 xl:px-12 py-10">

        {/* En-tête section */}
        <div className="mb-8">
          <div className="mb-2 flex items-center gap-3">
            <span className="block h-px w-6 shrink-0 bg-or/70" aria-hidden />
            <span className="text-[9px] font-semibold uppercase tracking-[0.34em] text-or/80">
              Mon espace
            </span>
          </div>
          <h1
            className="font-display font-light italic text-noir"
            style={{ fontSize: 'clamp(1.8rem, 2.5vw, 2.4rem)' }}
          >
            {NAV_ITEMS.find((n) => n.id === tab)?.label ?? 'Mon compte'}
          </h1>
        </div>

        {/* Tab content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            {tab === 'commandes' && <TabCommandes commandes={commandes} />}
            {tab === 'wishlist'  && <TabWishlist />}
            {tab === 'adresses'  && <TabAdresses user={user} />}
            {tab === 'securite'  && <TabSecurite user={user} />}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}

// =============================================================================
//  Tab : Commandes
// =============================================================================

function TabCommandes({ commandes }: { commandes: CompteCommande[] }) {
  if (commandes.length === 0) {
    return (
      <EmptyState
        icon={<Package size={28} strokeWidth={1.5} className="text-gris/40" />}
        titre="Aucune commande"
        desc="Vos commandes passées apparaîtront ici."
        cta={{ label: 'Découvrir la boutique', href: '/boutique' }}
      />
    );
  }

  return (
    <div className="space-y-4">
      {commandes.map((cmd) => (
        <div
          key={cmd.id}
          className="rounded-sm border border-gris-cl bg-blanc p-5"
        >
          <div className="flex items-start justify-between gap-4 mb-3">
            <div>
              <p className="text-[11px] font-semibold text-noir">Commande #{cmd.numero}</p>
              <p className="text-[10px] text-gris mt-0.5">
                {new Date(cmd.created_at).toLocaleDateString('fr-FR', {
                  day: 'numeric', month: 'long', year: 'numeric',
                })}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className={cn(
                'rounded-full px-2.5 py-0.5 text-[9px] font-semibold uppercase tracking-[0.1em]',
                STATUT_COLORS[cmd.statut] ?? 'bg-gris/10 text-gris',
              )}>
                {STATUT_LABELS[cmd.statut] ?? cmd.statut}
              </span>
              <span className="text-[12px] font-semibold text-noir">
                {cmd.total.toLocaleString('fr-FR')} XOF
              </span>
            </div>
          </div>

          {/* Articles */}
          {cmd.commandes_items && cmd.commandes_items.length > 0 && (
            <ul className="space-y-1.5 border-t border-gris-cl/60 pt-3">
              {cmd.commandes_items.map((item) => (
                <li key={item.id} className="flex items-center justify-between gap-4">
                  <p className="text-[11px] text-gris truncate">{item.nom_produit}</p>
                  <span className="text-[10.5px] text-gris/70 shrink-0">
                    ×{item.quantite} · {(item.prix_unitaire * item.quantite).toLocaleString('fr-FR')} XOF
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      ))}
    </div>
  );
}

// =============================================================================
//  Tab : Wishlist
// =============================================================================

function TabWishlist() {
  return (
    <EmptyState
      icon={<Heart size={28} strokeWidth={1.5} className="text-gris/40" />}
      titre="Votre wishlist est vide"
      desc="Sauvegardez les produits qui vous plaisent pour les retrouver facilement."
      cta={{ label: 'Explorer la boutique', href: '/boutique' }}
    />
  );
}

// =============================================================================
//  Tab : Adresses
// =============================================================================

function TabAdresses({ user: _user }: { user: CompteUser }) {
  return (
    <div>
      <div className="rounded-sm border border-gris-cl bg-blanc p-6 mb-4">
        <div className="flex items-start gap-4">
          <div className="size-10 rounded-full bg-beige2 flex items-center justify-center shrink-0">
            <User size={16} strokeWidth={1.5} className="text-gris" aria-hidden />
          </div>
          <div className="flex-1">
            <p className="text-[12px] font-semibold text-noir mb-1">Adresse de livraison principale</p>
            <p className="text-[11.5px] text-gris leading-relaxed">
              Aucune adresse enregistrée.
            </p>
          </div>
        </div>
        <button
          type="button"
          className="mt-4 text-[10.5px] font-semibold uppercase tracking-[0.2em] text-or hover:text-or-dark transition-colors"
        >
          + Ajouter une adresse
        </button>
      </div>
    </div>
  );
}

// =============================================================================
//  Tab : Sécurité
// =============================================================================

function TabSecurite({ user }: { user: CompteUser }) {
  const supabase = createClient();

  const handleResetPassword = useCallback(async () => {
    await supabase.auth.resetPasswordForEmail(user.email, {
      redirectTo: `${window.location.origin}/auth/callback?redirectTo=/compte?tab=securite`,
    });
    alert('Email de réinitialisation envoyé !');
  }, [supabase, user.email]);

  return (
    <div className="space-y-4 max-w-[480px]">
      <div className="rounded-sm border border-gris-cl bg-blanc p-6">
        <p className="text-[12px] font-semibold text-noir mb-1">Adresse email</p>
        <p className="text-[11.5px] text-gris mb-4">{user.email}</p>
        <div className="h-px bg-gris-cl mb-4" />
        <p className="text-[12px] font-semibold text-noir mb-1">Mot de passe</p>
        <p className="text-[11.5px] text-gris mb-4">
          Réinitialisez votre mot de passe par email.
        </p>
        <button
          type="button"
          onClick={handleResetPassword}
          className="text-[10.5px] font-semibold uppercase tracking-[0.2em] text-or hover:text-or-dark transition-colors"
        >
          Envoyer un email de réinitialisation
        </button>
      </div>
    </div>
  );
}

// =============================================================================
//  EmptyState helper
// =============================================================================

function EmptyState({
  icon, titre, desc, cta,
}: {
  icon:  React.ReactNode;
  titre: string;
  desc:  string;
  cta?:  { label: string; href: string };
}) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center gap-5">
      <div className="size-16 rounded-full bg-beige2 flex items-center justify-center">
        {icon}
      </div>
      <div>
        <p className="text-[14px] font-semibold text-noir mb-2">{titre}</p>
        <p className="text-[12px] text-gris leading-relaxed max-w-[260px] mx-auto">{desc}</p>
      </div>
      {cta && (
        <a
          href={cta.href}
          className="inline-flex items-center gap-2 rounded-sm bg-noir px-6 py-3 text-[10.5px] font-semibold uppercase tracking-[0.2em] text-blanc transition-all hover:bg-noir/80 active:scale-[0.98]"
        >
          {cta.label}
        </a>
      )}
    </div>
  );
}

