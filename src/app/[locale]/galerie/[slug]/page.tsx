/**
 * Projet detail — /galerie/[slug]
 *
 * SVG layout (1440×2878) :
 *   Y   0–74   : Navbar
 *   Y  74–814  : Hero full-bleed (image + info band)
 *   Y 814–1246 : Info + description + tags
 *   Y 1246–1842: Avant/Après (bg #F2EDE8)
 *   Y 1842–2233: Témoignage client (bg #151515)
 *   Y 2233–2623: Projets similaires (bg #F2EDE8)
 *   Y 2829–2878: Footer
 *
 * Server Component — fetch via React.cache() (generateMetadata + page partagent la même requête).
 * Client isolation : ProjetHeroGallery (gallery nav + lightbox), AvantApres (slider).
 */

import type { Metadata }        from 'next';
import { notFound }              from 'next/navigation';
import { Suspense }              from 'react';
import { setRequestLocale }      from 'next-intl/server';
import { Link }                  from '@/i18n/navigation';
import { ChevronLeft, MapPin, Calendar, Maximize2, Tag, ArrowUpRight } from 'lucide-react';
import { cn }                    from '@/lib/utils';
import {
  getProjetDetail,
  getProjetsSimIlaires,
  parseProjetImages,
}                                from '@/lib/supabase/queries/projets';
import type { ProjetCard }       from '@/lib/supabase/queries/projets';
import type { CategorieProjet }  from '@/types/database';
import { ProjetHeroGallery }     from '@/components/galerie/ProjetHeroGallery';
import { AvantApres }            from '@/components/galerie/AvantApres';
import { ProjectSchema, BreadcrumbSchema } from '@/components/seo/JsonLd';

// ─── Constants ────────────────────────────────────────────────────────────────

const CATEGORIE_LABELS: Record<CategorieProjet, string> = {
  architecture:   'Architecture',
  decoration:     'Décoration',
  gestion_projet: 'Gestion de projet',
  boutique:       'Boutique',
};

// ─── Types ────────────────────────────────────────────────────────────────────

type Props = {
  params: Promise<{ locale: string; slug: string }>;
};

// ─── generateMetadata ─────────────────────────────────────────────────────────

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const projet   = await getProjetDetail(slug);

  if (!projet) {
    return { title: 'Projet introuvable — Mathieu&Co Studio' };
  }

  const images = parseProjetImages(projet.images);
  const ogImage = projet.image_principale ?? images[0]?.url;

  return {
    title:       projet.meta_titre ?? `${projet.titre} — Mathieu&Co Studio`,
    description: projet.meta_description ?? projet.description?.slice(0, 160) ?? undefined,
    openGraph: {
      title:       projet.titre,
      description: projet.description?.slice(0, 160) ?? '',
      images:      ogImage ? [{ url: ogImage }] : [],
      type:        'article',
    },
  };
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function ProjetDetailPage({ params }: Props) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  // Fetch projet detail — notFound() if missing
  const projet = await getProjetDetail(slug);
  if (!projet) notFound();

  // Parallel: similar projects (graceful fallback)
  const [similairesResult] = await Promise.allSettled([
    getProjetsSimIlaires(projet.categorie, projet.slug, 3),
  ]);
  const similaires: ProjetCard[] =
    similairesResult.status === 'fulfilled' ? similairesResult.value : [];

  // Parse images
  const allImages   = parseProjetImages(projet.images);
  const avantImage  = allImages.find((img) => img.type === 'avant') ?? null;
  const apresImage  = allImages.find((img) => img.type === 'apres') ?? null;
  const hasAvantApres = Boolean(avantImage || apresImage);

  // Location string
  const location = [projet.lieu ?? projet.ville, projet.pays].filter(Boolean).join(', ');

  const heroImage = allImages.find((img) => img.type !== 'avant' && img.type !== 'apres')?.url
    ?? projet.image_principale
    ?? null;

  return (
    <div className="min-h-[100dvh] bg-blanc">

      {/* JSON-LD */}
      <ProjectSchema
        titre={projet.titre}
        description={projet.description}
        slug={projet.slug}
        image={heroImage}
        categorie={projet.categorie}
        lieu={location}
        annee={projet.annee}
      />
      <BreadcrumbSchema items={[
        { label: 'Accueil', href: '/' },
        { label: 'Galerie', href: '/galerie' },
        { label: projet.titre, href: `/galerie/${projet.slug}` },
      ]} />

      {/* ── Breadcrumb bar ───────────────────────────────────────────────────── */}
      <div className="border-b border-gris-cl/60 bg-blanc">
        <div className="mx-auto max-w-[1440px] px-6 md:px-10 xl:px-16">
          <nav
            className="flex items-center gap-1.5 py-3.5 text-[10px] uppercase tracking-[0.22em]"
            aria-label="Fil d'Ariane"
          >
            <Link href="/"         className="text-gris/50 hover:text-or transition-colors">Accueil</Link>
            <span className="text-gris-cl">/</span>
            <Link href="/galerie"  className="text-gris/50 hover:text-or transition-colors">Galerie</Link>
            <span className="text-gris-cl">/</span>
            <span className="truncate max-w-[200px] text-noir">{projet.titre}</span>
          </nav>
        </div>
      </div>

      {/* ── Hero gallery ─────────────────────────────────────────────────────── */}
      <section aria-label={`Galerie photos — ${projet.titre}`}>
        <Suspense fallback={
          <div className="w-full bg-beige2 animate-pulse" style={{ minHeight: '480px' }} />
        }>
          <ProjetHeroGallery
            images={allImages}
            titre={projet.titre}
            imagePrincipale={projet.image_principale}
          />
        </Suspense>
      </section>

      {/* ── Info band (dark) ─────────────────────────────────────────────────── */}
      <div style={{ backgroundColor: '#1E1A10' }}>
        <div className="mx-auto max-w-[1440px] px-6 md:px-10 xl:px-16 py-7 md:py-8">
          <div className="flex flex-col md:flex-row md:items-end gap-5 md:gap-12">

            {/* Title + category */}
            <div className="flex-1 min-w-0">
              <div className="mb-2 flex items-center gap-2.5">
                <span
                  className="inline-flex items-center rounded-sm px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.22em]"
                  style={{ backgroundColor: 'rgba(184,137,58,0.2)', color: '#B8893A', border: '1px solid rgba(184,137,58,0.25)' }}
                >
                  {CATEGORIE_LABELS[projet.categorie]}
                </span>
                {projet.vedette && (
                  <span className="inline-flex items-center rounded-sm px-2 py-1 text-[8px] font-semibold uppercase tracking-[0.2em] bg-or/15 text-or border border-or/20">
                    Vedette
                  </span>
                )}
              </div>
              <h1
                className="font-display font-light italic leading-tight text-blanc"
                style={{ fontSize: 'clamp(1.7rem, 3.5vw, 3rem)' }}
              >
                {projet.titre}
              </h1>
              {projet.sous_titre && (
                <p className="mt-2 text-[13px] font-light" style={{ color: 'rgba(255,255,255,0.5)' }}>
                  {projet.sous_titre}
                </p>
              )}
            </div>

            {/* Metadata pills */}
            <div className="flex flex-wrap gap-3 md:shrink-0">
              {location && (
                <div className="flex items-center gap-1.5 text-[10.5px]" style={{ color: 'rgba(255,255,255,0.5)' }}>
                  <MapPin size={11} strokeWidth={1.6} aria-hidden style={{ color: '#B8893A' }} />
                  {location}
                </div>
              )}
              {projet.annee && (
                <div className="flex items-center gap-1.5 text-[10.5px]" style={{ color: 'rgba(255,255,255,0.5)' }}>
                  <Calendar size={11} strokeWidth={1.6} aria-hidden style={{ color: '#B8893A' }} />
                  {projet.annee}
                </div>
              )}
              {projet.surface_m2 && (
                <div className="flex items-center gap-1.5 text-[10.5px]" style={{ color: 'rgba(255,255,255,0.5)' }}>
                  <Maximize2 size={11} strokeWidth={1.6} aria-hidden style={{ color: '#B8893A' }} />
                  {projet.surface_m2} m²
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Second dark band — back link */}
      <div style={{ backgroundColor: '#124460' }}>
        <div className="mx-auto max-w-[1440px] px-6 md:px-10 xl:px-16 py-3">
          <Link
            href="/galerie"
            className="inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] transition-colors"
            style={{ color: 'rgba(255,255,255,0.4)' }}
          >
            <ChevronLeft size={12} strokeWidth={2} aria-hidden />
            Retour à la galerie
          </Link>
        </div>
      </div>

      {/* ── Description + Info ───────────────────────────────────────────────── */}
      <ProjetInfoSection projet={projet} />

      {/* ── Avant / Après ────────────────────────────────────────────────────── */}
      {hasAvantApres && (
        <section
          aria-label="Avant et après les travaux"
          style={{ backgroundColor: '#F2EDE8' }}
        >
          <div className="mx-auto max-w-[1440px] px-6 md:px-10 xl:px-16 py-16 md:py-20">
            <AvantApres avant={avantImage} apres={apresImage} />
          </div>
        </section>
      )}

      {/* ── Témoignage ───────────────────────────────────────────────────────── */}
      <TemoignageSection projet={projet} />

      {/* ── Projets similaires ────────────────────────────────────────────────── */}
      {similaires.length > 0 && (
        <ProjetsSimIlairesSection projets={similaires} currentCategorie={projet.categorie} />
      )}

    </div>
  );
}

// =============================================================================
//  ProjetInfoSection — description, metadata grid, tags
// =============================================================================

type ProjetInfoSectionProps = {
  projet: Awaited<ReturnType<typeof getProjetDetail>>;
};

function ProjetInfoSection({ projet }: ProjetInfoSectionProps) {
  if (!projet) return null;

  const hasMeta = projet.annee || projet.surface_m2 || projet.lieu || projet.ville;

  return (
    <section aria-label="Informations du projet" className="bg-blanc border-b border-gris-cl/40">
      <div className="mx-auto max-w-[1440px] px-6 md:px-10 xl:px-16 py-14 md:py-16">

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] xl:grid-cols-[1fr_400px] gap-10 lg:gap-16">

          {/* ── Description ─────────────────────────────────────────────────── */}
          <div>
            <div className="mb-6 flex items-center gap-3">
              <span className="block h-px w-6 shrink-0 bg-or/60" aria-hidden />
              <span className="text-[9px] font-semibold uppercase tracking-[0.34em] text-or/80">
                À propos du projet
              </span>
            </div>

            {projet.description ? (
              <div className="space-y-4">
                {projet.description.split('\n\n').map((para, i) => (
                  <p key={i} className="text-[14px] text-gris-dark leading-relaxed max-w-[65ch]">
                    {para.trim()}
                  </p>
                ))}
              </div>
            ) : (
              <p className="text-[14px] text-gris/60 italic leading-relaxed max-w-[65ch]">
                Description du projet à venir.
              </p>
            )}

            {/* Tags */}
            {Array.isArray(projet.tags) && projet.tags.length > 0 && (
              <div className="mt-8 flex flex-wrap items-center gap-2">
                <Tag size={11} strokeWidth={1.6} className="text-gris/50 shrink-0" aria-hidden />
                {projet.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-sm border border-gris-cl bg-beige px-2.5 py-1 text-[9.5px] font-medium text-gris-dark"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* ── Metadata grid ────────────────────────────────────────────────── */}
          {hasMeta && (
            <div>
              <div className="mb-6 flex items-center gap-3">
                <span className="block h-px w-6 shrink-0 bg-or/60" aria-hidden />
                <span className="text-[9px] font-semibold uppercase tracking-[0.34em] text-or/80">
                  Fiche technique
                </span>
              </div>

              <dl className="divide-y divide-gris-cl/50">
                {([
                  { key: 'Catégorie',  value: CATEGORIE_LABELS[projet.categorie] },
                  { key: 'Lieu',       value: projet.lieu ?? null },
                  { key: 'Ville',      value: projet.ville },
                  { key: 'Pays',       value: projet.pays },
                  { key: 'Année',      value: projet.annee?.toString() ?? null },
                  { key: 'Surface',    value: projet.surface_m2 ? `${projet.surface_m2} m²` : null },
                ] as { key: string; value: string | null }[])
                  .filter((row) => Boolean(row.value))
                  .map(({ key, value }) => (
                    <div key={key} className="flex items-start justify-between gap-4 py-3">
                      <dt className="text-[10.5px] font-semibold uppercase tracking-[0.18em] text-gris/60 shrink-0">
                        {key}
                      </dt>
                      <dd className="text-[12.5px] font-medium text-noir text-right">
                        {value}
                      </dd>
                    </div>
                  ))
                }
              </dl>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

// =============================================================================
//  TemoignageSection — dark testimonial block (Y 1842-2233 in SVG)
// =============================================================================

type TemoignageSectionProps = {
  projet: Awaited<ReturnType<typeof getProjetDetail>>;
};

function TemoignageSection({ projet }: TemoignageSectionProps) {
  if (!projet) return null;

  // Placeholder testimonial — replace with DB field when available
  const temoignage = {
    texte:
      'L\'équipe de Mathieu&Co Studio a transformé notre espace au-delà de nos attentes. ' +
      'Leur sens du détail et leur compréhension de nos besoins ont rendu chaque décision évidente. ' +
      'Un résultat qui allie élégance, fonctionnalité et authenticité.',
    auteur:  'Client — ' + (projet.ville ?? 'Cotonou'),
    note:    5,
  };

  return (
    <section
      aria-label="Témoignage client"
      style={{ backgroundColor: '#151515' }}
    >
      <div className="mx-auto max-w-[1440px] px-6 md:px-10 xl:px-16 py-20 md:py-24">

        <div className="grid grid-cols-1 lg:grid-cols-[auto_1fr] gap-8 lg:gap-16 items-start">

          {/* Gold quote mark */}
          <div aria-hidden className="shrink-0">
            <svg width="56" height="40" viewBox="0 0 56 40" fill="none">
              <path
                d="M0 40V24C0 16.267 2.133 10 6.4 5.6 10.667 1.2 16.533 0 24 0v8C19.467 8 16.267 9.733 14.4 13.2 12.533 16.667 11.6 20.8 11.6 25.6H20V40H0ZM36 40V24c0-7.733 2.133-14 6.4-18.4C46.667 1.2 52.533 0 60 0v8c-4.533 0-7.733 1.733-9.6 5.2-1.867 3.467-2.8 7.6-2.8 12.4H56V40H36Z"
                fill="#B8893A"
                fillOpacity="0.4"
              />
            </svg>
          </div>

          {/* Quote */}
          <div>
            <blockquote>
              <p
                className="font-display font-light italic leading-relaxed"
                style={{ fontSize: 'clamp(1.15rem, 2vw, 1.55rem)', color: 'rgba(242,237,232,0.88)' }}
              >
                &ldquo;{temoignage.texte}&rdquo;
              </p>

              {/* Stars */}
              <div className="mt-6 flex items-center gap-1.5" aria-label={`${temoignage.note} étoiles sur 5`}>
                {Array.from({ length: 5 }, (_, i) => (
                  <svg key={i} width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
                    <path
                      d="M6 1l1.2 3.6H11L8.4 6.8l.9 3.6L6 8.2 2.7 10.4l.9-3.6L1 4.6h3.8L6 1z"
                      fill={i < temoignage.note ? '#B8893A' : 'rgba(184,137,58,0.2)'}
                    />
                  </svg>
                ))}
              </div>

              {/* Attribution */}
              <footer className="mt-4">
                <div className="flex items-center gap-3">
                  <span className="block h-px w-6 bg-or/40 shrink-0" aria-hidden />
                  <cite className="text-[10.5px] font-semibold not-italic uppercase tracking-[0.22em]"
                    style={{ color: 'rgba(184,137,58,0.7)' }}>
                    {temoignage.auteur}
                  </cite>
                </div>
              </footer>
            </blockquote>
          </div>
        </div>

      </div>
    </section>
  );
}

// =============================================================================
//  ProjetsSimIlairesSection — 3-column grid (Y 2233-2623 in SVG)
// =============================================================================

type ProjetsSimIlairesProps = {
  projets: ProjetCard[];
  currentCategorie: CategorieProjet;
};

function getAspectBucket(slug: string): 'tall' | 'square' | 'wide' {
  let hash = 0;
  for (let i = 0; i < slug.length; i++) hash = (hash * 31 + slug.charCodeAt(i)) | 0;
  const n = Math.abs(hash) % 10;
  if (n < 4) return 'tall';
  if (n < 7) return 'wide';
  return 'square';
}

const ASPECT_CLASSES: Record<ReturnType<typeof getAspectBucket>, string> = {
  tall:   'aspect-[3/4]',
  square: 'aspect-square',
  wide:   'aspect-[4/3]',
};

const CATEGORIE_PALETTES: Record<CategorieProjet, string> = {
  architecture:   '#1A3040',
  decoration:     '#2A1A08',
  gestion_projet: '#152818',
  boutique:       '#252318',
};

function ProjetsSimIlairesSection({ projets, currentCategorie }: ProjetsSimIlairesProps) {
  return (
    <section
      aria-label="Projets similaires"
      style={{ backgroundColor: '#F2EDE8' }}
    >
      <div className="mx-auto max-w-[1440px] px-6 md:px-10 xl:px-16 py-16 md:py-20">

        {/* Header */}
        <div className="mb-10 flex items-end justify-between gap-4">
          <div>
            <div className="mb-3 flex items-center gap-3">
              <span className="block h-px w-6 shrink-0 bg-or/60" aria-hidden />
              <span className="text-[9px] font-semibold uppercase tracking-[0.34em] text-or/80">
                Découvrir
              </span>
            </div>
            <h2
              className="font-display font-light italic text-noir"
              style={{ fontSize: 'clamp(1.6rem, 2.5vw, 2.4rem)' }}
            >
              Projets similaires
            </h2>
          </div>

          <Link
            href="/galerie"
            className="hidden sm:inline-flex items-center gap-2 rounded-sm border border-gris-cl bg-blanc px-4 py-2.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-gris-dark hover:border-gris hover:text-noir transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-or"
          >
            Voir tout
            <ArrowUpRight size={11} strokeWidth={2} aria-hidden />
          </Link>
        </div>

        {/* 3-column grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {projets.map((p) => {
            const bucket      = getAspectBucket(p.slug);
            const aspectClass = ASPECT_CLASSES[bucket];
            const placeholderBg = CATEGORIE_PALETTES[p.categorie];
            const locationStr = [p.lieu ?? p.ville, p.pays].filter(Boolean).join(', ');

            return (
              <Link
                key={p.id}
                href={`/galerie/${p.slug}`}
                className="group relative block overflow-hidden rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-or focus-visible:ring-offset-2"
              >
                {/* Image */}
                <div className={cn('relative w-full overflow-hidden', aspectClass)}>
                  {p.image_principale ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={p.image_principale}
                      alt={p.titre}
                      className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.19,1,0.22,1)] group-hover:scale-105"
                      loading="lazy"
                    />
                  ) : (
                    <div className="absolute inset-0" style={{ backgroundColor: placeholderBg }}>
                      <svg className="absolute inset-0 w-full h-full opacity-20" viewBox="0 0 400 300" fill="none" aria-hidden>
                        <circle cx="320" cy="80" r="120" stroke="white" strokeWidth="0.8" fill="none" />
                        <circle cx="80"  cy="220" r="90"  stroke="white" strokeWidth="0.6" fill="none" />
                      </svg>
                    </div>
                  )}

                  {/* Overlay */}
                  <div
                    className="absolute inset-0 pointer-events-none"
                    style={{ background: 'linear-gradient(to top, rgba(21,21,21,0.7) 0%, transparent 55%)' }}
                    aria-hidden
                  />
                  <div
                    className="absolute inset-0 bg-noir/35 opacity-0 transition-opacity duration-300 group-hover:opacity-100 pointer-events-none"
                    aria-hidden
                  />

                  {/* Category badge */}
                  <div className="absolute top-3 left-3">
                    <span className="inline-flex items-center rounded-sm bg-noir/55 px-2 py-1 backdrop-blur-sm text-[8.5px] font-semibold uppercase tracking-[0.2em] text-blanc/80 border border-blanc/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.07)] transition-all duration-300 group-hover:bg-or/75 group-hover:text-blanc">
                      {CATEGORIE_LABELS[p.categorie]}
                    </span>
                  </div>

                  {/* Arrow appear on hover */}
                  <div className="absolute top-3 right-3 flex size-7 items-center justify-center rounded-full bg-or/0 translate-x-2 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100 group-hover:bg-or" aria-hidden>
                    <ArrowUpRight size={12} strokeWidth={2} className="text-blanc" />
                  </div>

                  {/* Title */}
                  <div className="absolute bottom-0 left-0 right-0 px-4 pb-4 pointer-events-none">
                    {locationStr && (
                      <p className="mb-1 text-[9px] text-blanc/55 font-medium translate-y-1 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                        {locationStr}
                      </p>
                    )}
                    <h3
                      className="font-display font-light italic text-blanc leading-tight"
                      style={{ fontSize: 'clamp(1rem, 1.5vw, 1.2rem)' }}
                    >
                      {p.titre}
                    </h3>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Mobile CTA */}
        <div className="mt-8 text-center sm:hidden">
          <Link
            href="/galerie"
            className="inline-flex items-center gap-2 rounded-sm border border-gris-cl bg-blanc px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-gris-dark"
          >
            Voir tous les projets
            <ArrowUpRight size={11} strokeWidth={2} aria-hidden />
          </Link>
        </div>

      </div>
    </section>
  );
}
