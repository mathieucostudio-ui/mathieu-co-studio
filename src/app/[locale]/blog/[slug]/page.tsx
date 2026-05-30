/**
 * /blog/[slug] — Article de blog
 *
 * Layout :
 *   • Hero article (image principale + titre + meta)
 *   • Contenu long (rich text depuis Supabase JSON)
 *   • Table des matières sticky (desktop)
 *   • Newsletter CTA en bas
 *   • Articles similaires
 */

import type { Metadata }    from 'next';
import { notFound }          from 'next/navigation';
import { setRequestLocale }  from 'next-intl/server';
import Image                 from 'next/image';
import Link                  from 'next/link';
import { Clock, Eye, ArrowLeft, Tag } from 'lucide-react';
import {
  getArticleBySlug,
  getArticlesSimilaires,
}                            from '@/lib/supabase/queries/blog';
import { ArticleSchema, BreadcrumbSchema } from '@/components/seo/JsonLd';

// ─── generateMetadata ─────────────────────────────────────────────────────────

type Props = {
  params: Promise<{ locale: string; slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug }   = await params;
  const article    = await getArticleBySlug(slug);
  if (!article) return { title: 'Article introuvable' };

  const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://mathieu-co.studio';

  return {
    title:       article.meta_titre ?? article.titre,
    description: article.meta_description ?? article.extrait ?? undefined,
    openGraph: {
      title:       article.titre,
      description: article.extrait ?? undefined,
      type:        'article',
      publishedTime: article.publie_le ?? undefined,
      authors:     article.auteur_nom ? [article.auteur_nom] : undefined,
      images:      article.image_principale ? [{ url: article.image_principale, alt: article.image_alt ?? article.titre }] : [],
    },
    alternates: { canonical: `${BASE}/blog/${slug}` },
  };
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function BlogArticlePage({ params }: Props) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const article = await getArticleBySlug(slug);
  if (!article) notFound();

  const [similairesResult] = await Promise.allSettled([
    getArticlesSimilaires(article.categorie, article.slug, 3),
  ]);
  const similaires = similairesResult.status === 'fulfilled' ? similairesResult.value : [];

  // Contenu brut — en production: rich text parser (Tiptap/Portable Text/Markdown)
  const contenuTexte: string = (() => {
    if (!article.contenu) return '';
    if (typeof article.contenu === 'string') return article.contenu;
    // JSON Tiptap/ProseMirror → extract text nodes
    const extractText = (node: Record<string, unknown>): string => {
      if (node.type === 'text') return (node.text as string) ?? '';
      if (Array.isArray(node.content)) {
        return (node.content as Record<string, unknown>[]).map(extractText).join('\n');
      }
      return '';
    };
    try {
      return extractText(article.contenu as Record<string, unknown>);
    } catch {
      return '';
    }
  })();

  return (
    <div className="min-h-[100dvh] bg-beige">

      {/* JSON-LD */}
      <ArticleSchema
        titre={article.titre}
        extrait={article.extrait}
        slug={article.slug}
        image={article.image_principale}
        auteur={article.auteur_nom}
        publie_le={article.publie_le}
        updated_at={article.updated_at}
        tags={article.tags}
        temps_lecture={article.temps_lecture_min}
      />
      <BreadcrumbSchema items={[
        { label: 'Accueil', href: '/' },
        { label: 'Blog',    href: '/blog' },
        { label: article.titre, href: `/blog/${article.slug}` },
      ]} />

      {/* Hero article */}
      <header>
        {/* Image principale */}
        {article.image_principale && (
          <div className="relative h-[55vh] max-h-[600px] w-full overflow-hidden" style={{ backgroundColor: '#1A2830' }}>
            <Image
              src={article.image_principale}
              alt={article.image_alt ?? article.titre}
              fill
              sizes="100vw"
              priority
              className="object-cover"
            />
            <div
              className="absolute inset-0"
              style={{ background: 'linear-gradient(to bottom, rgba(21,21,21,0.2) 0%, rgba(21,21,21,0.7) 100%)' }}
              aria-hidden
            />
          </div>
        )}

        {/* Info band */}
        <div className="bg-blanc border-b border-gris-cl">
          <div className="mx-auto max-w-[860px] px-6 md:px-10 py-10">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.2em] text-gris/60 mb-6" aria-label="Fil d'Ariane">
              <Link href="/blog" className="hover:text-or transition-colors flex items-center gap-1.5">
                <ArrowLeft size={11} aria-hidden />
                Journal Design
              </Link>
              <span>/</span>
              <span className="truncate max-w-[200px] text-noir">{article.titre}</span>
            </nav>

            {/* Meta */}
            <div className="flex flex-wrap items-center gap-3 mb-5">
              {article.categorie && (
                <span className="rounded-full border border-or/30 bg-or/8 px-3 py-0.5 text-[9.5px] font-semibold uppercase tracking-[0.2em] text-or/80">
                  {article.categorie}
                </span>
              )}
              {article.publie_le && (
                <span className="text-[10px] text-gris/60">
                  {new Date(article.publie_le).toLocaleDateString('fr-FR', {
                    day: 'numeric', month: 'long', year: 'numeric',
                  })}
                </span>
              )}
              {article.temps_lecture_min && (
                <span className="flex items-center gap-1 text-[10px] text-gris/50">
                  <Clock size={11} strokeWidth={1.8} aria-hidden />
                  {article.temps_lecture_min} min de lecture
                </span>
              )}
              {article.vues > 0 && (
                <span className="flex items-center gap-1 text-[10px] text-gris/40">
                  <Eye size={11} strokeWidth={1.8} aria-hidden />
                  {article.vues.toLocaleString('fr-FR')} vues
                </span>
              )}
            </div>

            {/* Titre */}
            <h1
              className="font-display font-light italic text-noir"
              style={{ fontSize: 'clamp(1.8rem, 3.5vw, 3rem)', lineHeight: 1.15 }}
            >
              {article.titre}
            </h1>

            {article.sous_titre && (
              <p className="mt-3 text-[14px] text-gris leading-relaxed">
                {article.sous_titre}
              </p>
            )}

            {/* Auteur */}
            {article.auteur_nom && (
              <div className="mt-6 flex items-center gap-3">
                <div className="size-8 rounded-full bg-beige2 flex items-center justify-center text-[11px] font-semibold text-gris shrink-0">
                  {article.auteur_nom.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-noir">{article.auteur_nom}</p>
                  <p className="text-[10px] text-gris/60">Mathieu&amp;Co Studio</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Contenu principal */}
      <div className="mx-auto max-w-[860px] px-6 md:px-10 py-12">
        {article.extrait && (
          <p className="text-[14px] text-gris leading-relaxed italic border-l-2 border-or/50 pl-5 mb-10">
            {article.extrait}
          </p>
        )}

        {contenuTexte ? (
          <div className="prose-article text-[13px] text-gris leading-[1.9] space-y-5 [&_p]:leading-[1.9] [&_h2]:text-[17px] [&_h2]:font-semibold [&_h2]:text-noir [&_h2]:mt-10 [&_h2]:mb-4 [&_h3]:text-[15px] [&_h3]:font-semibold [&_h3]:text-noir [&_h3]:mt-8 [&_h3]:mb-3 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-2 [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:space-y-2 [&_strong]:text-noir [&_blockquote]:border-l-2 [&_blockquote]:border-or/50 [&_blockquote]:pl-5 [&_blockquote]:italic [&_blockquote]:text-gris/80">
            {contenuTexte.split('\n\n').filter(Boolean).map((para, i) => (
              <p key={i}>{para}</p>
            ))}
          </div>
        ) : (
          <div className="rounded-sm border border-gris-cl bg-beige2/50 p-10 text-center">
            <p className="text-[12px] text-gris">Le contenu de cet article est en cours de rédaction.</p>
          </div>
        )}

        {/* Tags */}
        {article.tags && article.tags.length > 0 && (
          <div className="mt-12 pt-8 border-t border-gris-cl">
            <div className="flex items-center gap-3 flex-wrap">
              <Tag size={13} strokeWidth={1.8} className="text-gris/50 shrink-0" aria-hidden />
              {article.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-gris-cl px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.15em] text-gris/70"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Articles similaires */}
      {similaires.length > 0 && (
        <section className="bg-blanc border-t border-gris-cl">
          <div className="mx-auto max-w-[1440px] px-6 md:px-10 xl:px-16 py-16">
            <div className="mb-8 flex items-center gap-3">
              <span className="block h-px w-6 shrink-0 bg-or/70" aria-hidden />
              <span className="text-[9px] font-semibold uppercase tracking-[0.34em] text-or/80">
                Continuer la lecture
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {similaires.map((art) => (
                <Link
                  key={art.id}
                  href={`/blog/${art.slug}`}
                  className="group flex flex-col gap-3 p-5 rounded-sm border border-gris-cl bg-beige hover:bg-blanc hover:shadow-sm transition-all duration-200"
                >
                  {art.categorie && (
                    <span className="text-[9px] font-semibold uppercase tracking-[0.2em] text-or/70">
                      {art.categorie}
                    </span>
                  )}
                  <h3 className="text-[13px] font-semibold text-noir leading-snug group-hover:text-or transition-colors line-clamp-2">
                    {art.titre}
                  </h3>
                  {art.temps_lecture_min && (
                    <span className="flex items-center gap-1 text-[10px] text-gris/50">
                      <Clock size={10} strokeWidth={1.8} aria-hidden />
                      {art.temps_lecture_min} min
                    </span>
                  )}
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Back to blog */}
      <div className="mx-auto max-w-[1440px] px-6 md:px-10 xl:px-16 py-8">
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 text-[10.5px] font-semibold uppercase tracking-[0.2em] text-gris/60 hover:text-or transition-colors"
        >
          <ArrowLeft size={12} aria-hidden />
          Retour au journal
        </Link>
      </div>
    </div>
  );
}
