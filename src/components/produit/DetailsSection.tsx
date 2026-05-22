'use client';

/**
 * DetailsSection — accordéon détails produit
 *
 * SVG layout (y=1364-1744, h=380px, bg=#F2EDE8) :
 *   Accordéon 4 sections :
 *   • Description complète
 *   • Dimensions & Poids
 *   • Matériaux & Entretien
 *   • Livraison & Retours
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { cn }          from '@/lib/utils';
import type { ProduitDetail } from '@/types/product';

// ─── Types ────────────────────────────────────────────────────────────────────

interface DetailsSectionProps {
  produit: ProduitDetail;
}

interface AccordionItem {
  id:      string;
  label:   string;
  content: React.ReactNode;
}

// ─── Accordion Item ───────────────────────────────────────────────────────────

function AccordionRow({
  item,
  open,
  onToggle,
}: {
  item: AccordionItem;
  open: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="border-b border-gris-cl/70 last:border-0">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className={cn(
          'flex w-full items-center justify-between py-5',
          'text-left transition-colors duration-150',
          'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-or rounded-sm',
        )}
      >
        <span className={cn(
          'text-[11px] font-semibold uppercase tracking-[0.28em]',
          open ? 'text-or' : 'text-gris-dark',
          'transition-colors duration-200',
        )}>
          {item.label}
        </span>
        <ChevronDown
          size={14}
          strokeWidth={1.8}
          className={cn(
            'shrink-0 text-gris transition-transform duration-300',
            open && 'rotate-180 text-or',
          )}
          aria-hidden
        />
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <div className="pb-5 text-[12.5px] leading-relaxed text-gris">
              {item.content}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── DetailsSection ───────────────────────────────────────────────────────────

export function DetailsSection({ produit }: DetailsSectionProps) {
  const [openId, setOpenId] = useState<string>('description');

  const toggle = (id: string) => setOpenId((cur) => cur === id ? '' : id);

  const accordionItems: AccordionItem[] = [
    {
      id:    'description',
      label: 'Description',
      content: (
        <p className="max-w-2xl">
          {produit.description || produit.description_courte || 'Aucune description disponible.'}
        </p>
      ),
    },
    {
      id:    'dimensions',
      label: 'Dimensions & Poids',
      content: (
        <div className="space-y-2">
          {produit.dimensions ? (
            <table className="w-full max-w-sm text-[12px]">
              <tbody>
                {produit.dimensions.largeur_cm && (
                  <tr className="border-b border-gris-cl/50">
                    <td className="py-2 font-medium text-gris-dark w-1/2">Largeur</td>
                    <td className="py-2 text-noir">{produit.dimensions.largeur_cm} cm</td>
                  </tr>
                )}
                {produit.dimensions.hauteur_cm && (
                  <tr className="border-b border-gris-cl/50">
                    <td className="py-2 font-medium text-gris-dark">Hauteur</td>
                    <td className="py-2 text-noir">{produit.dimensions.hauteur_cm} cm</td>
                  </tr>
                )}
                {produit.dimensions.profondeur_cm && (
                  <tr className="border-b border-gris-cl/50">
                    <td className="py-2 font-medium text-gris-dark">Profondeur</td>
                    <td className="py-2 text-noir">{produit.dimensions.profondeur_cm} cm</td>
                  </tr>
                )}
                {produit.poids_g && (
                  <tr>
                    <td className="py-2 font-medium text-gris-dark">Poids</td>
                    <td className="py-2 text-noir">{(produit.poids_g / 1000).toFixed(1)} kg</td>
                  </tr>
                )}
              </tbody>
            </table>
          ) : (
            <p>Dimensions sur demande.</p>
          )}
        </div>
      ),
    },
    {
      id:    'materiaux',
      label: 'Matériaux & Entretien',
      content: (
        <div className="space-y-3 max-w-xl">
          {produit.materiaux && produit.materiaux.length > 0 && (
            <div>
              <p className="mb-1.5 font-medium text-gris-dark text-[11px] uppercase tracking-[0.2em]">
                Composition
              </p>
              <ul className="flex flex-wrap gap-2">
                {produit.materiaux.map((mat) => (
                  <li
                    key={mat}
                    className="rounded-sm border border-gris-cl px-2.5 py-1 text-[11px] text-gris-dark"
                  >
                    {mat}
                  </li>
                ))}
              </ul>
            </div>
          )}
          <div>
            <p className="mb-1.5 font-medium text-gris-dark text-[11px] uppercase tracking-[0.2em]">
              Entretien
            </p>
            <p>
              Dépoussiérer régulièrement avec un chiffon doux et sec.
              Éviter l&apos;exposition directe au soleil et à l&apos;humidité.
              Huiler les parties en bois tous les 6 mois avec une huile naturelle.
            </p>
          </div>
        </div>
      ),
    },
    {
      id:    'livraison',
      label: 'Livraison & Retours',
      content: (
        <div className="space-y-3 max-w-xl">
          <div>
            <p className="mb-1 font-medium text-gris-dark text-[11px] uppercase tracking-[0.2em]">
              Livraison
            </p>
            <p>
              Livraison offerte à partir de 150 000 FCFA d&apos;achat. Délai : 48h ouvrées
              pour Cotonou, 5-7 jours pour le reste du Bénin.
              Emballage protecteur renforcé pour les pièces volumineuses.
            </p>
          </div>
          <div>
            <p className="mb-1 font-medium text-gris-dark text-[11px] uppercase tracking-[0.2em]">
              Retours
            </p>
            <p>
              Retour accepté sous 30 jours, pièce non montée dans son emballage d&apos;origine.
              Contactez notre service client pour initier le retour.
            </p>
          </div>
        </div>
      ),
    },
  ];

  return (
    <section
      className="w-full py-16"
      style={{ backgroundColor: '#F2EDE8' }}
      aria-label="Détails du produit"
    >
      <div className="mx-auto max-w-[1440px] px-8 md:px-12 xl:px-16">

        {/* Layout 2 colonnes */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-12">

          {/* Gauche : titre section */}
          <div className="lg:pt-5">
            <div className="mb-3 flex items-center gap-3">
              <span className="block h-[2px] w-6 rounded-full bg-or/60" aria-hidden />
              <span className="text-[9px] font-semibold uppercase tracking-[0.36em] text-or/70">
                Informations
              </span>
            </div>
            <h2
              className="font-display font-light italic leading-tight text-noir"
              style={{ fontSize: 'clamp(1.3rem, 2vw, 1.75rem)' }}
            >
              Tout ce que vous devez savoir
            </h2>
            {produit.origine && (
              <p className="mt-3 text-[11px] text-gris">
                Origine : <span className="font-medium text-gris-dark">{produit.origine}</span>
              </p>
            )}
          </div>

          {/* Droite : accordéon */}
          <div>
            {accordionItems.map((item) => (
              <AccordionRow
                key={item.id}
                item={item}
                open={openId === item.id}
                onToggle={() => toggle(item.id)}
              />
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
