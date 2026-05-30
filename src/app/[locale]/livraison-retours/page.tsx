/**
 * /livraison-retours — Politique de livraison et retours
 */

import type { Metadata }    from 'next';
import { setRequestLocale }  from 'next-intl/server';

export const metadata: Metadata = {
  title:       'Livraison & Retours — Mathieu&Co Studio',
  description: 'Politique de livraison, délais, frais et conditions de retour de la boutique Mathieu&Co Studio.',
};

type Props = { params: Promise<{ locale: string }> };

export default async function LivraisonRetoursPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div className="min-h-[100dvh] bg-beige">
      <LegalHero
        eyebrow="Boutique"
        title="Livraison & Retours"
        subtitle="Tout ce que vous devez savoir sur la livraison et les retours de vos commandes."
      />

      <div className="mx-auto max-w-[860px] px-6 md:px-10 xl:px-16 py-16 space-y-10">

        <LegalSection title="Zones de livraison">
          <p>Nous livrons dans les zones suivantes :</p>
          <ul>
            <li><strong>Cotonou et environs</strong> — Livraison en 24–48h ouvrées</li>
            <li><strong>Autres villes du Bénin</strong> — 3 à 5 jours ouvrés</li>
            <li><strong>Afrique de l&apos;Ouest</strong> (Togo, Nigeria, Ghana, Sénégal, Côte d&apos;Ivoire…) — 5 à 10 jours ouvrés</li>
            <li><strong>Europe, Amérique du Nord, reste du monde</strong> — 10 à 21 jours ouvrés</li>
          </ul>
          <p>
            Ces délais sont indicatifs et peuvent varier selon la disponibilité des transporteurs partenaires,
            les formalités douanières et les périodes de forte activité (fêtes, etc.).
          </p>
        </LegalSection>

        <LegalSection title="Frais de livraison">
          <p>
            Les frais de livraison sont calculés automatiquement lors du passage en caisse en fonction du
            poids total, du volume et de la destination.
          </p>
          <ul>
            <li><strong>Livraison gratuite à Cotonou</strong> pour toute commande ≥ 50 000 FCFA</li>
            <li>Tarifs dégressifs pour les commandes volumineuses</li>
            <li>Frais d&apos;import/douane à la charge du client pour les livraisons internationales</li>
          </ul>
        </LegalSection>

        <LegalSection title="Suivi de commande">
          <p>
            Dès l&apos;expédition de votre commande, vous recevez un email et un SMS avec le numéro de suivi.
            Vous pouvez suivre votre colis depuis votre espace client ou directement sur le site du transporteur.
          </p>
        </LegalSection>

        <LegalSection title="Politique de retours">
          <p>
            Vous disposez de <strong>14 jours calendaires</strong> à compter de la date de réception pour
            retourner un article, sous réserve des conditions suivantes :
          </p>
          <ul>
            <li>L&apos;article doit être dans son état d&apos;origine, non utilisé, non lavé</li>
            <li>L&apos;emballage d&apos;origine doit être intact</li>
            <li>L&apos;étiquette ne doit pas avoir été retirée</li>
          </ul>
          <p>
            <strong>Articles non éligibles au retour :</strong> articles sur-mesure, pièces d&apos;art originales,
            articles en promotion finale, produits personnalisés, consommables ouverts.
          </p>
        </LegalSection>

        <LegalSection title="Procédure de retour">
          <ol>
            <li>Contactez-nous par email ou WhatsApp dans le délai de 14 jours</li>
            <li>Précisez votre numéro de commande et la raison du retour</li>
            <li>Nous vous communiquons l&apos;adresse de retour et, si applicable, une étiquette prépayée</li>
            <li>Déposez le colis au transporteur avec le bon de retour fourni</li>
            <li>Dès réception et vérification, nous procédons au remboursement sous 5–10 jours ouvrés</li>
          </ol>
        </LegalSection>

        <LegalSection title="Remboursements">
          <p>
            Le remboursement est effectué sur le même moyen de paiement utilisé lors de l&apos;achat :
            Mobile Money, carte bancaire ou virement. Nous ne remboursons pas les frais de livraison initiaux,
            sauf en cas de défaut du produit ou d&apos;erreur de notre part.
          </p>
        </LegalSection>

        <LegalSection title="Articles défectueux ou endommagés">
          <p>
            Si votre commande est arrivée endommagée ou défectueuse, photographiez immédiatement
            l&apos;emballage et l&apos;article, puis contactez-nous dans les <strong>48 heures</strong> suivant la réception.
            Nous procéderons au remplacement ou au remboursement intégral selon votre préférence, à nos frais.
          </p>
        </LegalSection>

        <p className="text-[10.5px] text-gris/60 border-t border-gris-cl pt-6">
          Dernière mise à jour : Mai 2026. Pour toute question, contactez-nous à{' '}
          <a href="mailto:contact@mathieuandco.studio" className="underline hover:text-gris transition-colors">
            contact@mathieuandco.studio
          </a>.
        </p>
      </div>
    </div>
  );
}

// ─── Shared components (inline) ───────────────────────────────────────────────

function LegalHero({ eyebrow, title, subtitle }: { eyebrow: string; title: string; subtitle: string }) {
  return (
    <section
      className="relative flex min-h-[240px] w-full flex-col justify-end overflow-hidden"
      style={{ backgroundColor: '#1A2830' }}
    >
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse 55% 65% at 75% 45%, rgba(40,75,55,0.35) 0%, transparent 60%)',
        }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute bottom-0 left-0 right-0 h-px opacity-40"
        style={{ backgroundColor: '#B8893A' }}
        aria-hidden
      />
      <div className="relative mx-auto w-full max-w-[1440px] px-6 md:px-10 xl:px-16 pb-10 pt-16">
        <div className="mb-3 flex items-center gap-3">
          <span className="block h-px w-8 shrink-0" style={{ backgroundColor: 'rgba(184,137,58,0.8)' }} aria-hidden />
          <span className="text-[9px] font-semibold uppercase tracking-[0.38em]" style={{ color: 'rgba(184,137,58,0.8)' }}>
            {eyebrow}
          </span>
        </div>
        <h1 className="font-display font-extralight italic text-white" style={{ fontSize: 'clamp(2rem, 4vw, 3.2rem)' }}>
          {title}
        </h1>
        <p className="mt-3 text-[12px] max-w-[480px]" style={{ color: 'rgba(255,255,255,0.42)' }}>
          {subtitle}
        </p>
      </div>
    </section>
  );
}

function LegalSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="text-[15px] font-semibold text-noir mb-4 pb-3 border-b border-gris-cl">
        {title}
      </h2>
      <div className="prose-legal text-[12px] text-gris leading-[1.85] space-y-3 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1.5 [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:space-y-1.5 [&_strong]:text-noir [&_a]:underline [&_a]:underline-offset-2 hover:[&_a]:text-noir">
        {children}
      </div>
    </section>
  );
}
