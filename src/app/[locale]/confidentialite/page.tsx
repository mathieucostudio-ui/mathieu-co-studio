/**
 * /confidentialite — Politique de confidentialité & cookies
 */

import type { Metadata }    from 'next';
import { setRequestLocale }  from 'next-intl/server';

export const metadata: Metadata = {
  title:  'Politique de confidentialité — Mathieu&Co Studio',
  robots: 'noindex',
};

type Props = { params: Promise<{ locale: string }> };

export default async function ConfidentialitePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div className="min-h-[100dvh] bg-beige">
      <LegalHero
        eyebrow="Légal"
        title="Politique de confidentialité"
        subtitle="Comment nous collectons, utilisons et protégeons vos données personnelles."
      />

      <div className="mx-auto max-w-[860px] px-6 md:px-10 xl:px-16 py-16 space-y-10">

        <LegalSection title="Responsable du traitement">
          <p>
            <strong>Mathieu&amp;Co Studio</strong> — Haie Vive, Cotonou, Bénin.<br />
            Contact DPO : <a href="mailto:privacy@mathieuandco.studio">privacy@mathieuandco.studio</a>
          </p>
        </LegalSection>

        <LegalSection title="Données collectées">
          <p>Nous collectons les données suivantes :</p>
          <ul>
            <li><strong>Données d&apos;identification</strong> : nom, prénom, email, téléphone</li>
            <li><strong>Données de commande</strong> : adresse de livraison, historique d&apos;achats, préférences</li>
            <li><strong>Données de navigation</strong> : adresse IP, pages visitées, durée de session (via cookies analytiques)</li>
            <li><strong>Données de paiement</strong> : traitées directement par Stripe ou FedaPay — nous ne stockons pas vos coordonnées bancaires</li>
          </ul>
        </LegalSection>

        <LegalSection title="Finalités du traitement">
          <ul>
            <li>Gestion des commandes et du service après-vente</li>
            <li>Envoi de confirmations de commande et notifications</li>
            <li>Newsletter et communications marketing (avec votre consentement)</li>
            <li>Amélioration de nos services et analyse de l&apos;audience</li>
            <li>Prévention de la fraude et sécurité</li>
          </ul>
        </LegalSection>

        <LegalSection title="Base légale du traitement">
          <ul>
            <li><strong>Contrat</strong> : exécution de votre commande, gestion de votre compte</li>
            <li><strong>Intérêt légitime</strong> : amélioration des services, sécurité</li>
            <li><strong>Consentement</strong> : newsletter, cookies non essentiels</li>
          </ul>
        </LegalSection>

        <LegalSection title="Partage des données">
          <p>Vos données ne sont jamais vendues. Elles peuvent être partagées avec :</p>
          <ul>
            <li><strong>Prestataires de paiement</strong> : Stripe (USA), FedaPay (Bénin)</li>
            <li><strong>Prestataires logistiques</strong> : uniquement les données nécessaires à la livraison</li>
            <li><strong>Hébergeur</strong> : Vercel (USA) — données chiffrées en transit et au repos</li>
            <li><strong>Supabase</strong> (USA) — base de données et authentification</li>
          </ul>
        </LegalSection>

        <LegalSection title="Conservation des données">
          <p>
            Vos données de compte sont conservées pendant la durée de votre abonnement et jusqu&apos;à
            3 ans après votre dernière activité. Les données de commande sont conservées 10 ans
            pour des raisons comptables et légales.
          </p>
        </LegalSection>

        <LegalSection title="Vos droits">
          <p>Vous disposez des droits suivants :</p>
          <ul>
            <li>Droit d&apos;accès à vos données personnelles</li>
            <li>Droit de rectification en cas d&apos;inexactitude</li>
            <li>Droit à l&apos;effacement (« droit à l&apos;oubli »)</li>
            <li>Droit à la portabilité</li>
            <li>Droit d&apos;opposition au marketing direct</li>
            <li>Droit de retirer votre consentement à tout moment</li>
          </ul>
          <p>
            Pour exercer ces droits, contactez-nous à{' '}
            <a href="mailto:privacy@mathieuandco.studio">privacy@mathieuandco.studio</a>.
            Nous répondons dans un délai de 30 jours.
          </p>
        </LegalSection>

        <LegalSection title="Cookies">
          <p>Nous utilisons les cookies suivants :</p>
          <ul>
            <li><strong>Essentiels</strong> : session, authentification, panier — non désactivables</li>
            <li><strong>Analytiques</strong> : mesure d&apos;audience anonyme (Vercel Analytics) — désactivables</li>
            <li><strong>Marketing</strong> : retargeting, réseaux sociaux — avec consentement explicite</li>
          </ul>
          <p>
            Vous pouvez gérer vos préférences de cookies depuis les paramètres de votre navigateur ou
            via notre bannière cookies.
          </p>
        </LegalSection>

        <p className="text-[10.5px] text-gris/60 border-t border-gris-cl pt-6">
          Dernière mise à jour : Mai 2026.
        </p>
      </div>
    </div>
  );
}

function LegalHero({ eyebrow, title, subtitle }: { eyebrow: string; title: string; subtitle: string }) {
  return (
    <section className="relative flex min-h-[240px] w-full flex-col justify-end overflow-hidden" style={{ backgroundColor: '#1A2830' }}>
      <div className="pointer-events-none absolute inset-0" style={{ background: 'radial-gradient(ellipse 55% 65% at 75% 45%, rgba(40,75,55,0.35) 0%, transparent 60%)' }} aria-hidden />
      <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-px opacity-40" style={{ backgroundColor: '#B8893A' }} aria-hidden />
      <div className="relative mx-auto w-full max-w-[1440px] px-6 md:px-10 xl:px-16 pb-10 pt-16">
        <div className="mb-3 flex items-center gap-3">
          <span className="block h-px w-8 shrink-0" style={{ backgroundColor: 'rgba(184,137,58,0.8)' }} aria-hidden />
          <span className="text-[9px] font-semibold uppercase tracking-[0.38em]" style={{ color: 'rgba(184,137,58,0.8)' }}>{eyebrow}</span>
        </div>
        <h1 className="font-display font-extralight italic text-white" style={{ fontSize: 'clamp(2rem, 4vw, 3.2rem)' }}>{title}</h1>
        <p className="mt-3 text-[12px] max-w-[480px]" style={{ color: 'rgba(255,255,255,0.42)' }}>{subtitle}</p>
      </div>
    </section>
  );
}

function LegalSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="text-[15px] font-semibold text-noir mb-4 pb-3 border-b border-gris-cl">{title}</h2>
      <div className="text-[12px] text-gris leading-[1.85] space-y-3 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1.5 [&_strong]:text-noir [&_a]:underline [&_a]:underline-offset-2 hover:[&_a]:text-noir">
        {children}
      </div>
    </section>
  );
}
