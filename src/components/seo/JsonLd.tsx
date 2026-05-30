/**
 * JsonLd — Composants Schema.org JSON-LD (Server Components)
 *
 * Chaque composant génère un <script type="application/ld+json"> optimisé.
 *
 * Exports :
 *   OrganizationSchema   — sur toutes les pages (via layout)
 *   WebSiteSchema        — sur la homepage (SearchAction)
 *   ProductSchema        — sur /boutique/[slug]
 *   ProjectSchema        — sur /galerie/[slug] (CreativeWork)
 *   ArticleSchema        — sur /blog/[slug]
 *   BreadcrumbSchema     — sur toutes les pages profondes
 *   LocalBusinessSchema  — sur /contact et /a-propos
 */

const SITE_URL  = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://mathieu-co.studio';
const SITE_NAME = 'Mathieu&Co Studio';
const LOGO_URL  = `${SITE_URL}/logo.png`;

// ─── Helper ───────────────────────────────────────────────────────────────────

function Script({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

// ─── OrganizationSchema ───────────────────────────────────────────────────────

export function OrganizationSchema() {
  return (
    <Script data={{
      '@context':   'https://schema.org',
      '@type':      'Organization',
      name:         SITE_NAME,
      url:          SITE_URL,
      logo:         LOGO_URL,
      description:  'Studio d\'architecture intérieure et boutique de design contemporain à Cotonou, Bénin.',
      foundingDate: '2016',
      areaServed:   ['Bénin', 'Afrique de l\'Ouest', 'France'],
      address: {
        '@type':         'PostalAddress',
        streetAddress:   'Haie Vive',
        addressLocality: 'Cotonou',
        addressCountry:  'BJ',
      },
      contactPoint: {
        '@type':       'ContactPoint',
        contactType:   'customer service',
        email:         'contact@mathieuandco.studio',
        telephone:     '+229-97-00-00-00',
        availableLanguage: ['French', 'English'],
      },
      sameAs: [
        'https://www.instagram.com/mathieuandco',
        'https://www.linkedin.com/company/mathieu-co-studio',
      ],
    }} />
  );
}

// ─── WebSiteSchema ────────────────────────────────────────────────────────────

export function WebSiteSchema() {
  return (
    <Script data={{
      '@context': 'https://schema.org',
      '@type':    'WebSite',
      name:       SITE_NAME,
      url:        SITE_URL,
      potentialAction: {
        '@type':       'SearchAction',
        target:        { '@type': 'EntryPoint', urlTemplate: `${SITE_URL}/boutique?q={search_term_string}` },
        'query-input': 'required name=search_term_string',
      },
    }} />
  );
}

// ─── ProductSchema ────────────────────────────────────────────────────────────

interface ProductSchemaProps {
  nom:              string;
  description:      string | null;
  slug:             string;
  prix:             number;
  prix_promo?:      number | null;
  images:           string[];
  categorie?:       string | null;
  disponible?:      boolean;
  note?:            number | null;
  total_avis?:      number | null;
}

export function ProductSchema({
  nom, description, slug, prix, prix_promo, images,
  categorie, disponible = true, note, total_avis,
}: ProductSchemaProps) {
  const offers: Record<string, unknown> = {
    '@type':        'Offer',
    price:          prix_promo ?? prix,
    priceCurrency:  'XOF',
    availability:   disponible
      ? 'https://schema.org/InStock'
      : 'https://schema.org/OutOfStock',
    url:            `${SITE_URL}/boutique/${slug}`,
    seller: {
      '@type': 'Organization',
      name:    SITE_NAME,
    },
  };

  const data: Record<string, unknown> = {
    '@context':   'https://schema.org',
    '@type':      'Product',
    name:         nom,
    description:  description ?? undefined,
    url:          `${SITE_URL}/boutique/${slug}`,
    image:        images.length > 0 ? images : undefined,
    category:     categorie ?? undefined,
    brand: {
      '@type': 'Brand',
      name:    SITE_NAME,
    },
    offers,
  };

  if (note != null && total_avis != null && total_avis > 0) {
    data.aggregateRating = {
      '@type':       'AggregateRating',
      ratingValue:   note,
      reviewCount:   total_avis,
      bestRating:    5,
      worstRating:   1,
    };
  }

  return <Script data={data} />;
}

// ─── ProjectSchema (CreativeWork) ─────────────────────────────────────────────

interface ProjectSchemaProps {
  titre:        string;
  description?: string | null;
  slug:         string;
  image?:       string | null;
  categorie?:   string | null;
  lieu?:        string | null;
  annee?:       number | null;
}

export function ProjectSchema({ titre, description, slug, image, categorie, lieu, annee }: ProjectSchemaProps) {
  return (
    <Script data={{
      '@context':    'https://schema.org',
      '@type':       'CreativeWork',
      name:          titre,
      description:   description ?? undefined,
      url:           `${SITE_URL}/galerie/${slug}`,
      image:         image ?? undefined,
      genre:         categorie ?? 'Architecture Intérieure',
      locationCreated: lieu ?? 'Cotonou, Bénin',
      dateCreated:   annee ? `${annee}` : undefined,
      creator: {
        '@type': 'Organization',
        name:    SITE_NAME,
      },
    }} />
  );
}

// ─── ArticleSchema ────────────────────────────────────────────────────────────

interface ArticleSchemaProps {
  titre:        string;
  extrait?:     string | null;
  slug:         string;
  image?:       string | null;
  auteur?:      string | null;
  publie_le?:   string | null;
  updated_at?:  string;
  tags?:        string[] | null;
  temps_lecture?: number | null;
}

export function ArticleSchema({
  titre, extrait, slug, image, auteur, publie_le, updated_at, tags, temps_lecture,
}: ArticleSchemaProps) {
  return (
    <Script data={{
      '@context':        'https://schema.org',
      '@type':           'Article',
      headline:          titre,
      description:       extrait ?? undefined,
      url:               `${SITE_URL}/blog/${slug}`,
      image:             image ?? undefined,
      author: {
        '@type': 'Person',
        name:    auteur ?? 'Mathieu&Co Studio',
      },
      publisher: {
        '@type': 'Organization',
        name:    SITE_NAME,
        logo: { '@type': 'ImageObject', url: LOGO_URL },
      },
      datePublished:     publie_le ?? undefined,
      dateModified:      updated_at ?? publie_le ?? undefined,
      keywords:          tags?.join(', ') ?? undefined,
      timeRequired:      temps_lecture ? `PT${temps_lecture}M` : undefined,
    }} />
  );
}

// ─── BreadcrumbSchema ─────────────────────────────────────────────────────────

export interface BreadcrumbItem {
  label: string;
  href:  string;
}

export function BreadcrumbSchema({ items }: { items: BreadcrumbItem[] }) {
  return (
    <Script data={{
      '@context': 'https://schema.org',
      '@type':    'BreadcrumbList',
      itemListElement: items.map((item, idx) => ({
        '@type':   'ListItem',
        position:  idx + 1,
        name:      item.label,
        item:      `${SITE_URL}${item.href}`,
      })),
    }} />
  );
}

// ─── LocalBusinessSchema ──────────────────────────────────────────────────────

export function LocalBusinessSchema() {
  return (
    <Script data={{
      '@context':        'https://schema.org',
      '@type':           'InteriorDesigner',
      name:              SITE_NAME,
      url:               SITE_URL,
      logo:              LOGO_URL,
      image:             LOGO_URL,
      description:       'Studio d\'architecture intérieure, décoration contemporaine et gestion de projet à Cotonou, Bénin.',
      telephone:         '+229-97-00-00-00',
      email:             'contact@mathieuandco.studio',
      foundingDate:      '2016',
      priceRange:        '€€€',
      currenciesAccepted: 'XOF',
      paymentAccepted:   'Mobile Money, Carte bancaire, Virement',
      openingHours:      ['Mo-Fr 08:00-18:00', 'Sa 09:00-13:00'],
      address: {
        '@type':           'PostalAddress',
        streetAddress:     'Haie Vive',
        addressLocality:   'Cotonou',
        addressRegion:     'Littoral',
        addressCountry:    'BJ',
      },
      geo: {
        '@type':     'GeoCoordinates',
        latitude:    '6.3703',
        longitude:   '2.3912',
      },
      areaServed: [
        { '@type': 'Country', name: 'Bénin' },
        { '@type': 'Country', name: 'Sénégal' },
        { '@type': 'Country', name: 'Côte d\'Ivoire' },
        { '@type': 'Country', name: 'Togo' },
      ],
      sameAs: [
        'https://www.instagram.com/mathieuandco',
        'https://www.linkedin.com/company/mathieu-co-studio',
      ],
    }} />
  );
}
