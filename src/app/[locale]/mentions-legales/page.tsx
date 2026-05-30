/**
 * /mentions-legales — Mentions légales + CGV + CGU
 */

import type { Metadata }    from 'next';
import { setRequestLocale }  from 'next-intl/server';

export const metadata: Metadata = {
  title:  'Mentions légales — Mathieu&Co Studio',
  robots: 'noindex',
};

type Props = { params: Promise<{ locale: string }> };

export default async function MentionsLegalesPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div className="min-h-[100dvh] bg-beige">
      <LegalHero
        eyebrow="Légal"
        title="Mentions légales"
        subtitle="Informations légales, conditions générales de vente et d'utilisation."
      />

      <div className="mx-auto max-w-[860px] px-6 md:px-10 xl:px-16 py-16 space-y-10">

        {/* Navigation rapide */}
        <nav className="rounded-sm border border-gris-cl bg-blanc p-5" aria-label="Sections">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-gris/60 mb-3">Sur cette page</p>
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            {['Éditeur', 'Hébergement', 'Propriété intellectuelle', 'Conditions de vente', 'Conditions d\'utilisation'].map((s) => (
              <a
                key={s}
                href={`#${s.toLowerCase().replace(/[\s']/g, '-').replace(/[éè]/g, 'e')}`}
                className="text-[11px] text-or/80 hover:text-or underline-offset-2 transition-colors"
              >
                {s}
              </a>
            ))}
          </div>
        </nav>

        <LegalSection id="editeur" title="Éditeur du site">
          <p><strong>Mathieu&amp;Co Studio</strong></p>
          <p>Entreprise individuelle enregistrée au Bénin</p>
          <p>Adresse : Haie Vive, Cotonou, République du Bénin</p>
          <p>Email : <a href="mailto:contact@mathieuandco.studio">contact@mathieuandco.studio</a></p>
          <p>Téléphone : +229 97 00 00 00</p>
          <p>Directeur de publication : Mathieu K.</p>
        </LegalSection>

        <LegalSection id="hebergement" title="Hébergement">
          <p>Ce site est hébergé par :</p>
          <p><strong>Vercel Inc.</strong></p>
          <p>440 N Barranca Ave #4133, Covina, CA 91723, USA</p>
          <p>Site : <a href="https://vercel.com" target="_blank" rel="noopener noreferrer">vercel.com</a></p>
        </LegalSection>

        <LegalSection id="propriete-intellectuelle" title="Propriété intellectuelle">
          <p>
            L&apos;ensemble du contenu de ce site (textes, images, photographies, logos, maquettes, icônes,
            visuels) est la propriété exclusive de Mathieu&amp;Co Studio ou de ses partenaires,
            et est protégé par les lois sur le droit d&apos;auteur applicables au Bénin et internationalement.
          </p>
          <p>
            Toute reproduction, représentation, modification, publication, adaptation de tout ou partie des
            éléments du site, quel que soit le moyen ou le procédé utilisé, est interdite, sauf autorisation
            écrite préalable de Mathieu&amp;Co Studio.
          </p>
        </LegalSection>

        <LegalSection id="conditions-de-vente" title="Conditions générales de vente">
          <p>
            Les présentes CGV régissent les relations entre Mathieu&amp;Co Studio et tout acheteur passant
            commande via le site mathieuandco.studio.
          </p>
          <p><strong>Commandes</strong></p>
          <p>
            Toute commande passée sur notre boutique en ligne vaut acceptation des présentes CGV.
            Vous recevez une confirmation de commande par email dans les 30 minutes suivant la validation.
          </p>
          <p><strong>Prix</strong></p>
          <p>
            Les prix sont affichés en FCFA (XOF), toutes taxes comprises. Nous nous réservons le droit de
            modifier les prix à tout moment. Seul le prix affiché au moment de la validation de la commande
            est applicable.
          </p>
          <p><strong>Paiement</strong></p>
          <p>
            Le paiement est exigible immédiatement à la commande. Les modes de paiement acceptés sont
            détaillés sur la page de paiement.
          </p>
          <p><strong>Droit de rétractation</strong></p>
          <p>
            Conformément à la législation en vigueur, vous disposez d&apos;un délai de 14 jours calendaires
            à compter de la réception de votre commande pour exercer votre droit de rétractation,
            sans avoir à justifier votre décision ni à supporter d&apos;autres coûts que les frais de retour.
          </p>
        </LegalSection>

        <LegalSection id="conditions-d'utilisation" title="Conditions générales d'utilisation">
          <p>
            L&apos;utilisation de ce site implique l&apos;acceptation pleine et entière des présentes CGU.
          </p>
          <p><strong>Compte utilisateur</strong></p>
          <p>
            Vous êtes responsable du maintien de la confidentialité de vos identifiants et de toute
            activité sur votre compte. Signalez toute utilisation non autorisée à notre équipe de sécurité.
          </p>
          <p><strong>Données personnelles</strong></p>
          <p>
            Nous collectons et traitons vos données personnelles conformément à notre{' '}
            <a href="/confidentialite">politique de confidentialité</a>.
          </p>
          <p><strong>Limitation de responsabilité</strong></p>
          <p>
            Mathieu&amp;Co Studio s&apos;efforce de maintenir ce site disponible et à jour. Nous ne saurions
            être tenus responsables des dommages résultant d&apos;une indisponibilité du site ou d&apos;une
            erreur de contenu.
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
    <section
      className="relative flex min-h-[240px] w-full flex-col justify-end overflow-hidden"
      style={{ backgroundColor: '#1A2830' }}
    >
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: 'radial-gradient(ellipse 55% 65% at 75% 45%, rgba(40,75,55,0.35) 0%, transparent 60%)' }}
        aria-hidden
      />
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

function LegalSection({ id, title, children }: { id?: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id}>
      <h2 className="text-[15px] font-semibold text-noir mb-4 pb-3 border-b border-gris-cl">{title}</h2>
      <div className="text-[12px] text-gris leading-[1.85] space-y-3 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1.5 [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:space-y-1.5 [&_strong]:text-noir [&_a]:underline [&_a]:underline-offset-2 hover:[&_a]:text-noir">
        {children}
      </div>
    </section>
  );
}
