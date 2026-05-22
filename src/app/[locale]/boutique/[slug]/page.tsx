/**
 * Fiche produit — /boutique/[slug]
 *
 * SVG layout (1440×2800) :
 *   y=72-984   : Hero split 53/47 (galerie gauche + info droite)
 *   y=984-1364 : RendusSection (dark #151515)
 *   y=1364-1744: DetailsSection (beige #F2EDE8)
 *   y=1744-2084: AvisSection (blanc)
 *   y=2084-2524: ProduitsSimilaires (beige #F2EDE8)
 *
 * Server Component — tous les fetch sont côté serveur.
 * React.cache() déduplique getProduitBySlug entre generateMetadata et la page.
 */

import type { Metadata }         from 'next';
import { notFound }               from 'next/navigation';
import { setRequestLocale }       from 'next-intl/server';
import { getProduitBySlug }       from '@/lib/supabase/queries/produits';
import { getAvisParProduit }      from '@/lib/supabase/queries/avis';
import { GalerieProduit }         from '@/components/produit/GalerieProduit';
import { ProduitInfo }            from '@/components/produit/ProduitInfo';
import { RendusSection }          from '@/components/produit/RendusSection';
import { DetailsSection }         from '@/components/produit/DetailsSection';
import { AvisSection }            from '@/components/produit/AvisSection';
import { ProduitsSimilaires }     from '@/components/produit/ProduitsSimilaires';

// ─── Types ────────────────────────────────────────────────────────────────────

type Props = {
  params: Promise<{ locale: string; slug: string }>;
};

// ─── Métadonnées dynamiques ───────────────────────────────────────────────────

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const produit  = await getProduitBySlug(slug);

  if (!produit) {
    return {
      title: 'Produit introuvable — Mathieu&Co Studio',
    };
  }

  return {
    title:       `${produit.nom} — Mathieu&Co Studio`,
    description: produit.description_courte ?? `Découvrez ${produit.nom}, pièce artisanale disponible sur Mathieu&Co Studio.`,
    openGraph: {
      title:       produit.nom,
      description: produit.description_courte ?? '',
      images:      produit.images[0]?.url ? [{ url: produit.images[0].url }] : [],
    },
  };
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function ProduitDetailPage({ params }: Props) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  // ── Données principales ──────────────────────────────────────────────────
  const produit = await getProduitBySlug(slug);
  if (!produit) notFound();

  // ── Données parallèles (avis) — graceful fallback ────────────────────────
  const [avisResult] = await Promise.allSettled([
    getAvisParProduit(produit.id, 10),
  ]);

  const { avis, stats: avisStats } = avisResult.status === 'fulfilled'
    ? avisResult.value
    : { avis: [], stats: { total: 0, moyenne: 0, repartition: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } as const } };

  // ── Catégorie ────────────────────────────────────────────────────────────
  const categorie = produit.categorie ?? null;

  return (
    <main>

      {/* ─── Hero : galerie + infos ────────────────────────────────────── */}
      <section
        className="w-full bg-blanc"
        aria-label={`Fiche produit : ${produit.nom}`}
      >
        <div
          className={[
            'mx-auto max-w-[1440px]',
            'grid grid-cols-1',
            'lg:grid-cols-[53%_47%]',
            'lg:min-h-[680px]',
          ].join(' ')}
        >
          {/* ── Galerie (colonne gauche) ─────────────────────────────── */}
          <div className="relative px-6 py-8 lg:px-10 lg:py-10">
            <GalerieProduit
              images={produit.images}
              nomProduit={produit.nom}
              showRendusBadge={produit.vedette}
            />
          </div>

          {/* ── Informations produit (colonne droite) ───────────────── */}
          <div className="border-t border-gris-cl/40 lg:border-t-0 lg:border-l lg:border-gris-cl/40">
            <ProduitInfo
              produit={produit}
              categorie={categorie}
              avisTotal={avisStats.total}
              avisMoyenne={avisStats.moyenne}
            />
          </div>
        </div>
      </section>

      {/* ─── Rendus 3D ───────────────────────────────────────────────── */}
      <RendusSection nomProduit={produit.nom} />

      {/* ─── Accordéon détails ───────────────────────────────────────── */}
      <DetailsSection produit={produit} />

      {/* ─── Avis clients ────────────────────────────────────────────── */}
      <AvisSection
        avis={avis}
        stats={avisStats}
        produitId={produit.id}
      />

      {/* ─── Produits similaires ─────────────────────────────────────── */}
      <ProduitsSimilaires
        categorieId={categorie?.id ?? null}
        exclureId={produit.id}
      />

    </main>
  );
}
