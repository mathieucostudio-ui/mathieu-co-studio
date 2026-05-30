/**
 * /faq — Questions fréquentes avec accordéon + recherche
 */

import type { Metadata }    from 'next';
import { setRequestLocale }  from 'next-intl/server';
import { FaqAccordion }      from '@/components/legal/FaqAccordion';
import type { FaqItem }      from '@/components/legal/FaqAccordion';

export const metadata: Metadata = {
  title:       'FAQ — Mathieu&Co Studio',
  description: 'Retrouvez les réponses aux questions les plus fréquentes sur nos services d\'architecture intérieure, la boutique, les commandes et la livraison.',
};

type Props = { params: Promise<{ locale: string }> };

// ─── Données FAQ ──────────────────────────────────────────────────────────────

const FAQ_ITEMS: FaqItem[] = [
  // Studio & Services
  {
    id: 's1', categorie: 'Studio & Services',
    question: 'Dans quelles villes intervenez-vous ?',
    reponse:  'Notre base est à Cotonou, Bénin, mais nous intervenons dans toute l\'Afrique de l\'Ouest et au-delà. Nous avons réalisé des projets au Sénégal, en Côte d\'Ivoire, au Togo, au Maroc et en France. Les projets à distance sont gérés via des outils collaboratifs et des visites ponctuelles.',
  },
  {
    id: 's2', categorie: 'Studio & Services',
    question: 'Quelle est la durée moyenne d\'un projet d\'architecture intérieure ?',
    reponse:  'Un projet standard (appartement de 80–150 m²) dure en moyenne 3 à 6 mois, de la première consultation à la livraison. Les projets plus complexes (hôtels, locaux commerciaux) peuvent durer 8 à 18 mois. Nous vous fournissons un planning détaillé dès la phase de conception.',
  },
  {
    id: 's3', categorie: 'Studio & Services',
    question: 'Proposez-vous des consultations à distance ?',
    reponse:  'Oui. Nous proposons des consultations en visioconférence (Zoom, Google Meet) avec visite virtuelle de l\'espace si vous disposez d\'un scan 3D ou de photos détaillées. Des formules 100 % à distance sont disponibles pour les projets hors Afrique de l\'Ouest.',
  },
  {
    id: 's4', categorie: 'Studio & Services',
    question: 'Comment se passe la première consultation ?',
    reponse:  'La première consultation (1h30 environ) est gratuite. Elle nous permet de comprendre votre projet, vos goûts, votre budget et vos contraintes. Nous vous présentons ensuite une offre détaillée sous 72h.',
  },
  {
    id: 's5', categorie: 'Studio & Services',
    question: 'Intervenez-vous pour des projets commerciaux ?',
    reponse:  'Absolument. Boutiques, hôtels, restaurants, bureaux, cliniques — nous avons réalisé de nombreux projets commerciaux en Afrique de l\'Ouest. Chaque espace commercial bénéficie d\'une approche qui intègre vos contraintes d\'exploitation et d\'expérience client.',
  },

  // Boutique & Commandes
  {
    id: 'b1', categorie: 'Boutique & Commandes',
    question: 'Les prix sont-ils en FCFA ?',
    reponse:  'Oui, tous les prix de la boutique sont affichés en FCFA (XOF). Nous proposons également des équivalences en EUR et USD pour nos clients internationaux. Les paiements sont acceptés en Mobile Money (MTN, Moov, Wave), carte bancaire (Visa/Mastercard) et virement.',
  },
  {
    id: 'b2', categorie: 'Boutique & Commandes',
    question: 'Puis-je annuler ou modifier ma commande ?',
    reponse:  'Vous pouvez annuler ou modifier votre commande dans les 2h suivant la validation, tant qu\'elle n\'a pas été préparée. Passé ce délai, contactez-nous par WhatsApp pour trouver une solution. Les commandes expédiées ne peuvent plus être annulées.',
  },
  {
    id: 'b3', categorie: 'Boutique & Commandes',
    question: 'Les produits de la boutique sont-ils authentiques ?',
    reponse:  'Oui. Chaque pièce de notre boutique est personnellement sélectionnée par notre équipe. Nous travaillons avec des artisans locaux, des fabricants certifiés et des marques vérifiées. Chaque produit est accompagné de son certificat d\'authenticité si applicable.',
  },
  {
    id: 'b4', categorie: 'Boutique & Commandes',
    question: 'Proposez-vous des devis sur-mesure pour de la décoration ?',
    reponse:  'Oui. Pour toute commande de plus de 500 000 FCFA ou pour un projet de décoration complet, contactez-nous pour un devis personnalisé. Nous proposons des packages décoration qui incluent la sélection, l\'achat et l\'installation.',
  },

  // Livraison
  {
    id: 'l1', categorie: 'Livraison',
    question: 'Quels sont les délais de livraison ?',
    reponse:  'Cotonou et Abomey-Calavi : 24–48h ouvrées.\nAutres villes du Bénin : 3–5 jours ouvrés.\nAfrique de l\'Ouest : 5–10 jours ouvrés.\nEurope et reste du monde : 10–21 jours ouvrés.\n\nCes délais sont indicatifs et peuvent varier selon la disponibilité du transporteur.',
  },
  {
    id: 'l2', categorie: 'Livraison',
    question: 'La livraison est-elle gratuite ?',
    reponse:  'La livraison est gratuite à Cotonou pour toute commande supérieure à 50 000 FCFA. Pour les autres destinations, les frais sont calculés automatiquement au moment du paiement selon le poids, le volume et la destination.',
  },
  {
    id: 'l3', categorie: 'Livraison',
    question: 'Puis-je suivre ma commande en temps réel ?',
    reponse:  'Oui. Dès l\'expédition, vous recevez un email et un SMS avec le numéro de suivi. Vous pouvez suivre votre colis directement depuis votre espace compte ou via notre page de suivi.',
  },

  // Retours & Remboursements
  {
    id: 'r1', categorie: 'Retours & Remboursements',
    question: 'Puis-je retourner un article ?',
    reponse:  'Vous disposez de 14 jours à compter de la livraison pour retourner un article non utilisé dans son emballage d\'origine. Les articles sur-mesure, les pièces d\'art et les consommables ne sont pas éligibles au retour. Frais de retour à votre charge sauf défaut.',
  },
  {
    id: 'r2', categorie: 'Retours & Remboursements',
    question: 'Que faire si mon article est arrivé endommagé ?',
    reponse:  'Prenez des photos de l\'emballage et de l\'article dès réception et contactez-nous dans les 48h via WhatsApp ou email. Nous prendrons en charge le remplacement ou le remboursement intégral selon votre préférence.',
  },
  {
    id: 'r3', categorie: 'Retours & Remboursements',
    question: 'Combien de temps pour être remboursé ?',
    reponse:  'Après validation du retour, le remboursement est effectué sous 5–10 jours ouvrés sur le même moyen de paiement utilisé lors de l\'achat (Mobile Money, carte bancaire ou virement).',
  },

  // Paiement
  {
    id: 'p1', categorie: 'Paiement',
    question: 'Quels moyens de paiement acceptez-vous ?',
    reponse:  'Nous acceptons :\n• Mobile Money : MTN MoMo, Moov Money, Wave\n• Carte bancaire : Visa, Mastercard (3D Secure)\n• Virement bancaire (pour les commandes > 500 000 FCFA)\n• Paiement à la livraison disponible à Cotonou',
  },
  {
    id: 'p2', categorie: 'Paiement',
    question: 'Le paiement en ligne est-il sécurisé ?',
    reponse:  'Oui. Les paiements par carte sont traités par Stripe (certification PCI-DSS niveau 1). Les paiements Mobile Money sont gérés par FedaPay. Nous ne stockons jamais vos informations de carte bancaire.',
  },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function FaqPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div className="min-h-[100dvh] bg-beige">
      {/* Hero */}
      <section
        className="relative flex min-h-[280px] w-full flex-col justify-end overflow-hidden"
        style={{ backgroundColor: '#1A2830' }}
      >
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background: 'radial-gradient(ellipse 60% 70% at 80% 40%, rgba(40,75,55,0.4) 0%, transparent 60%)',
          }}
          aria-hidden
        />
        <div
          className="pointer-events-none absolute bottom-0 left-0 right-0 h-px opacity-40"
          style={{ backgroundColor: '#B8893A' }}
          aria-hidden
        />
        <div className="relative mx-auto w-full max-w-[1440px] px-6 md:px-10 xl:px-16 pb-12 pt-20">
          <div className="mb-4 flex items-center gap-3">
            <span className="block h-px w-8 shrink-0" style={{ backgroundColor: 'rgba(184,137,58,0.8)' }} aria-hidden />
            <span className="text-[9px] font-semibold uppercase tracking-[0.38em]" style={{ color: 'rgba(184,137,58,0.8)' }}>
              Aide
            </span>
          </div>
          <h1
            className="font-display font-extralight italic text-white"
            style={{ fontSize: 'clamp(2.2rem, 5vw, 3.8rem)' }}
          >
            Questions fréquentes
          </h1>
          <p className="mt-3 text-[12px]" style={{ color: 'rgba(255,255,255,0.42)' }}>
            {FAQ_ITEMS.length} réponses à vos questions les plus courantes.
          </p>
        </div>
      </section>

      {/* Content */}
      <div className="mx-auto max-w-[1440px] px-6 md:px-10 xl:px-16 py-16">
        <div className="max-w-[860px]">
          <FaqAccordion items={FAQ_ITEMS} />
        </div>
      </div>

      {/* CTA contact */}
      <div
        className="mx-6 md:mx-10 xl:mx-16 mb-16 rounded-sm border border-gris-cl bg-blanc p-8 max-w-[860px]"
      >
        <p className="text-[13px] font-semibold text-noir mb-2">Vous n&apos;avez pas trouvé votre réponse ?</p>
        <p className="text-[11.5px] text-gris mb-5">Notre équipe répond sous 24h.</p>
        <a
          href="/contact"
          className="inline-flex items-center gap-2 rounded-sm bg-noir px-6 py-3 text-[10.5px] font-semibold uppercase tracking-[0.2em] text-blanc hover:bg-noir/80 transition-all active:scale-[0.98]"
        >
          Nous contacter
        </a>
      </div>
    </div>
  );
}
