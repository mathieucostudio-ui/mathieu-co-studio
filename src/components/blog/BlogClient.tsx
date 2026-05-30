'use client';

/**
 * BlogClient — Liste d'articles avec filtres catégorie
 */

import { useState, useMemo }       from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image                       from 'next/image';
import Link                        from 'next/link';
import { ArrowUpRight, Clock, Eye } from 'lucide-react';
import { cn }                      from '@/lib/utils';
import type { ArticleCard }        from '@/lib/supabase/queries/blog';

// ─── Animation ────────────────────────────────────────────────────────────────

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  show:   { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 120, damping: 22 } },
};

const stagger = {
  hidden: {},
  show:   { transition: { staggerChildren: 0.06 } },
};

// ─── BlogClient ───────────────────────────────────────────────────────────────

export function BlogClient({ articles }: { articles: ArticleCard[] }) {
  const [catFilter, setCatFilter] = useState<string>('Tous');

  // Catégories uniques
  const categories = useMemo(() => {
    const cats = [...new Set(articles.map((a) => a.categorie).filter(Boolean))] as string[];
    return ['Tous', ...cats];
  }, [articles]);

  const filtered = useMemo(() =>
    catFilter === 'Tous'
      ? articles
      : articles.filter((a) => a.categorie === catFilter),
  [articles, catFilter]);

  // Featured = premier article
  const featured  = filtered[0] ?? null;
  const remaining = filtered.slice(1);

  if (articles.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center">
        <p className="text-[14px] font-semibold text-noir mb-2">Bientôt disponible</p>
        <p className="text-[12px] text-gris">
          Le Journal Design arrive prochainement avec des articles sur l&apos;architecture,
          la décoration et les tendances design en Afrique.
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Filtres */}
      <div className="mb-10 flex flex-wrap gap-2" role="group" aria-label="Filtrer par catégorie">
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setCatFilter(cat)}
            className={cn(
              'rounded-sm px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.2em] transition-all duration-200',
              catFilter === cat
                ? 'bg-noir text-blanc'
                : 'border border-gris-cl text-gris hover:border-gris hover:text-noir',
            )}
            aria-pressed={catFilter === cat}
          >
            {cat}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={catFilter}
          variants={stagger}
          initial="hidden"
          animate="show"
          exit={{ opacity: 0 }}
        >
          {/* Article featured */}
          {featured && (
            <motion.div variants={cardVariants} className="mb-10">
              <FeaturedCard article={featured} />
            </motion.div>
          )}

          {/* Grille articles */}
          {remaining.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {remaining.map((article) => (
                <motion.div key={article.id} variants={cardVariants}>
                  <ArticleCard article={article} />
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// ─── FeaturedCard ─────────────────────────────────────────────────────────────

function FeaturedCard({ article }: { article: ArticleCard }) {
  return (
    <Link
      href={`/blog/${article.slug}`}
      className="group grid grid-cols-1 md:grid-cols-2 gap-0 overflow-hidden rounded-sm border border-gris-cl hover:shadow-md transition-shadow duration-300"
      aria-label={article.titre}
    >
      {/* Image */}
      <div className="relative aspect-[4/3] md:aspect-auto bg-beige2 overflow-hidden">
        {article.image_principale ? (
          <Image
            src={article.image_principale}
            alt={article.image_alt ?? article.titre}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover transition-transform duration-700 group-hover:scale-105"
            priority
          />
        ) : (
          <BlogPlaceholder />
        )}
      </div>

      {/* Content */}
      <div className="flex flex-col justify-center gap-4 p-8 bg-blanc">
        <ArticleMeta article={article} />
        <h2 className="text-[18px] font-semibold text-noir leading-snug group-hover:text-or transition-colors">
          {article.titre}
        </h2>
        {article.extrait && (
          <p className="text-[12px] text-gris leading-relaxed line-clamp-3">
            {article.extrait}
          </p>
        )}
        <span className="inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-or/80 group-hover:text-or transition-colors">
          Lire l&apos;article
          <ArrowUpRight size={13} strokeWidth={2} className="transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden />
        </span>
      </div>
    </Link>
  );
}

// ─── ArticleCard ──────────────────────────────────────────────────────────────

function ArticleCard({ article }: { article: ArticleCard }) {
  return (
    <Link
      href={`/blog/${article.slug}`}
      className="group flex flex-col overflow-hidden rounded-sm border border-gris-cl hover:shadow-md transition-shadow duration-300"
      aria-label={article.titre}
    >
      {/* Image */}
      <div className="relative aspect-[16/9] overflow-hidden bg-beige2">
        {article.image_principale ? (
          <Image
            src={article.image_principale}
            alt={article.image_alt ?? article.titre}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-700 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <BlogPlaceholder />
        )}
      </div>

      {/* Content */}
      <div className="flex flex-col gap-3 p-5 bg-blanc flex-1">
        <ArticleMeta article={article} />
        <h3 className="text-[14px] font-semibold text-noir leading-snug group-hover:text-or transition-colors line-clamp-2">
          {article.titre}
        </h3>
        {article.extrait && (
          <p className="text-[11.5px] text-gris leading-relaxed line-clamp-2 flex-1">
            {article.extrait}
          </p>
        )}
        {article.tags && article.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-auto">
            {article.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-gris-cl px-2.5 py-0.5 text-[9px] font-semibold uppercase tracking-[0.1em] text-gris/70"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}

// ─── ArticleMeta ──────────────────────────────────────────────────────────────

function ArticleMeta({ article }: { article: ArticleCard }) {
  return (
    <div className="flex items-center gap-3 flex-wrap">
      {article.categorie && (
        <span className="text-[9px] font-semibold uppercase tracking-[0.22em] text-or/80 border border-or/20 rounded-full px-2.5 py-0.5">
          {article.categorie}
        </span>
      )}
      {article.publie_le && (
        <span className="text-[10px] text-gris/60">
          {new Date(article.publie_le).toLocaleDateString('fr-FR', {
            day: 'numeric', month: 'short', year: 'numeric',
          })}
        </span>
      )}
      {article.temps_lecture_min && (
        <span className="flex items-center gap-1 text-[10px] text-gris/50">
          <Clock size={10} strokeWidth={1.8} aria-hidden />
          {article.temps_lecture_min} min
        </span>
      )}
      {article.vues > 0 && (
        <span className="flex items-center gap-1 text-[10px] text-gris/50">
          <Eye size={10} strokeWidth={1.8} aria-hidden />
          {article.vues.toLocaleString('fr-FR')}
        </span>
      )}
    </div>
  );
}

// ─── Placeholder ──────────────────────────────────────────────────────────────

function BlogPlaceholder() {
  return (
    <div className="absolute inset-0 flex items-center justify-center" style={{ backgroundColor: '#1A2830' }}>
      <svg className="opacity-10" width="60" height="60" viewBox="0 0 60 60" fill="none" aria-hidden>
        <rect x="8" y="8" width="44" height="44" stroke="#B8893A" strokeWidth="0.8" />
        <line x1="8" y1="28" x2="52" y2="28" stroke="#B8893A" strokeWidth="0.5" />
        <line x1="28" y1="8" x2="28" y2="52" stroke="#B8893A" strokeWidth="0.5" />
      </svg>
    </div>
  );
}
