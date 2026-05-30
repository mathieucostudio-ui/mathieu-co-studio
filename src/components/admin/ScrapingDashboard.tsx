'use client';

/**
 * ScrapingDashboard — Interface complète d'import produits
 *
 * États :
 *   idle       → Formulaire URL
 *   scraping   → Loader animé
 *   preview    → Données extraites + formulaire d'édition
 *   importing  → Loader d'import
 *   imported   → Succès + lien vers le produit
 *   error      → Message d'erreur
 */

import { useState, useCallback }       from 'react';
import { useForm }                     from 'react-hook-form';
import { zodResolver }                 from '@hookform/resolvers/zod';
import { z }                           from 'zod';
import { motion, AnimatePresence }     from 'framer-motion';
import {
  Search, Loader2, CheckCircle, AlertCircle,
  ExternalLink, RefreshCw, Package, Tag,
  X, ChevronDown, ChevronUp,
} from 'lucide-react';
import { cn }                          from '@/lib/utils';
import type { ScrapedProduct }         from '@/lib/scraping/types';

// ─── Types ────────────────────────────────────────────────────────────────────

type DashboardState = 'idle' | 'scraping' | 'preview' | 'importing' | 'imported' | 'error';

interface JobEntry {
  id:         string;
  url:        string;
  source:     string;
  nom:        string;
  status:     'success' | 'error';
  timestamp:  Date;
  importedId?: string;
}

// ─── Schema de validation pour l'édition ─────────────────────────────────────

const editSchema = z.object({
  nom:                z.string().min(3, 'Nom trop court'),
  slug:               z.string().min(3).regex(/^[a-z0-9-]+$/, 'Slug : minuscules, chiffres et tirets uniquement'),
  description:        z.string().optional(),
  description_courte: z.string().max(200).optional(),
  prix:               z.number({ message: 'Prix invalide' }).min(1, 'Prix minimum 1 XOF'),
  prix_promo:         z.number().nullable().optional(),
  stock:              z.number().int().min(0).optional(),
  origine:            z.string().optional(),
  artisan:            z.string().optional(),
  tags:               z.string().optional(), // Séparés par virgule
  meta_titre:         z.string().max(70).optional(),
  meta_description:   z.string().max(160).optional(),
  vedette:            z.boolean().optional(),
});

type EditForm = z.infer<typeof editSchema>;

// ─── ScrapingDashboard ────────────────────────────────────────────────────────

export function ScrapingDashboard() {
  const [state,    setState]    = useState<DashboardState>('idle');
  const [url,      setUrl]      = useState('');
  const [product,  setProduct]  = useState<ScrapedProduct & { slugSuggeree?: string } | null>(null);
  const [error,    setError]    = useState('');
  const [history,  setHistory]  = useState<JobEntry[]>([]);
  const [imported, setImported] = useState<{ id: string; slug: string; nom: string } | null>(null);
  const [showSpecs, setShowSpecs] = useState(false);

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<EditForm>({
    resolver: zodResolver(editSchema),
  });

  // ── Analyse URL ─────────────────────────────────────────────────────────────
  const handleAnalyse = useCallback(async () => {
    if (!url.trim()) return;
    setState('scraping');
    setError('');
    setProduct(null);

    try {
      const res = await fetch('/api/admin/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim(), downloadImages: false }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? 'Erreur scraping');

      const p = json.product as ScrapedProduct & { slugSuggeree: string };
      setProduct(p);
      setState('preview');

      // Pré-remplir le formulaire
      setValue('nom',                p.nom);
      setValue('slug',               p.slugSuggeree ?? '');
      setValue('description',        p.description ?? '');
      setValue('description_courte', p.description_courte ?? '');
      setValue('prix',               p.prix_xof);
      setValue('stock',              0);
      setValue('origine',            p.origine ?? '');
      setValue('artisan',            p.artisan ?? '');
      setValue('tags',               p.tags?.join(', ') ?? '');
      setValue('meta_titre',         p.nom.slice(0, 70));
      setValue('meta_description',   p.description_courte ?? '');
      setValue('vedette',            false);

    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erreur inconnue';
      setError(msg);
      setState('error');
      setHistory((h) => [{
        id: Date.now().toString(),
        url,
        source: detectSourceLabel(url),
        nom: 'Erreur',
        status: 'error',
        timestamp: new Date(),
      }, ...h.slice(0, 19)]);
    }
  }, [url, setValue]);

  // ── Import ──────────────────────────────────────────────────────────────────
  const onImport = useCallback(async (data: EditForm) => {
    if (!product) return;
    setState('importing');

    const imagesUrls = product.images_supabase ?? product.images_urls.slice(0, 8);

    try {
      const res = await fetch('/api/admin/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nom:                data.nom,
          slug:               data.slug,
          description:        data.description ?? null,
          description_courte: data.description_courte ?? null,
          prix:               data.prix,
          prix_promo:         data.prix_promo ?? null,
          stock:              data.stock ?? 0,
          images:             imagesUrls,
          materiaux:          product.materiaux ?? [],
          poids_g:            product.poids_g ?? null,
          tags:               (data.tags ?? '').split(',').map((t) => t.trim()).filter(Boolean),
          categorie_id:       null,
          vedette:            data.vedette ?? false,
          origine:            data.origine ?? null,
          artisan:            data.artisan ?? null,
          meta_titre:         data.meta_titre ?? null,
          meta_description:   data.meta_description ?? null,
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? 'Erreur import');

      setImported(json.produit);
      setState('imported');
      setHistory((h) => [{
        id: Date.now().toString(),
        url,
        source: detectSourceLabel(url),
        nom: data.nom,
        status: 'success',
        timestamp: new Date(),
        importedId: json.produit.id,
      }, ...h.slice(0, 19)]);

    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erreur inconnue';
      setError(msg);
      setState('preview'); // Revenir à preview, pas error
    }
  }, [product, url]);

  const resetToIdle = useCallback(() => {
    setState('idle');
    setProduct(null);
    setError('');
    setImported(null);
  }, []);

  return (
    <div className="grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-6 items-start">

      {/* ── Zone principale ─────────────────────────────────────────────────── */}
      <div className="space-y-6">

        {/* Header + URL input */}
        <div className="rounded-sm border border-white/8 bg-white/4 p-6">
          <div className="mb-5">
            <h1 className="text-[15px] font-semibold text-white mb-1">Import de produits</h1>
            <p className="text-[11px] text-white/40">
              Coller l&apos;URL d&apos;un produit Alibaba, AliExpress, Amazon ou Jumia
            </p>
          </div>

          <div className="flex gap-3">
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleAnalyse(); }}
              placeholder="https://www.alibaba.com/product-detail/..."
              disabled={state === 'scraping' || state === 'importing'}
              className={cn(
                'flex-1 rounded-sm border border-white/10 bg-white/5',
                'px-4 py-3 text-[12px] text-white placeholder:text-white/25',
                'focus:outline-none focus:border-or/50 focus:ring-1 focus:ring-or/30',
                'disabled:opacity-50',
              )}
            />
            <button
              type="button"
              onClick={handleAnalyse}
              disabled={!url.trim() || state === 'scraping' || state === 'importing'}
              className={cn(
                'flex items-center gap-2.5 rounded-sm px-5 py-3 shrink-0',
                'text-[11px] font-semibold uppercase tracking-[0.18em]',
                'bg-or text-noir transition-all duration-200',
                'hover:bg-or-dark disabled:opacity-50 disabled:cursor-not-allowed',
                'active:scale-[0.98]',
              )}
            >
              {state === 'scraping' ? (
                <Loader2 size={14} className="animate-spin" aria-hidden />
              ) : (
                <Search size={14} aria-hidden />
              )}
              Analyser
            </button>
          </div>

          {/* Source badges */}
          <div className="mt-4 flex flex-wrap gap-2" aria-label="Sources supportées">
            {['Alibaba', 'AliExpress', 'Amazon', 'Jumia'].map((s) => (
              <span
                key={s}
                className="rounded-full border border-white/10 px-2.5 py-0.5 text-[9.5px] font-semibold uppercase tracking-[0.15em] text-white/35"
              >
                {s}
              </span>
            ))}
          </div>
        </div>

        {/* ── States ─────────────────────────────────────────────────────────── */}
        <AnimatePresence mode="wait">

          {/* Scraping loader */}
          {state === 'scraping' && (
            <motion.div
              key="scraping"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="rounded-sm border border-white/8 bg-white/4 p-10 flex flex-col items-center gap-4"
            >
              <div className="relative">
                <div className="size-14 rounded-full border-2 border-or/20" />
                <div className="absolute inset-0 rounded-full border-2 border-or border-t-transparent animate-spin" />
              </div>
              <div className="text-center">
                <p className="text-[13px] font-semibold text-white/80 mb-1">Analyse en cours…</p>
                <p className="text-[11px] text-white/35">Extraction des données produit</p>
              </div>
            </motion.div>
          )}

          {/* Error */}
          {state === 'error' && (
            <motion.div
              key="error"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="rounded-sm border border-rouge/20 bg-rouge/8 p-6"
            >
              <div className="flex items-start gap-4">
                <AlertCircle size={18} strokeWidth={1.8} className="shrink-0 text-rouge mt-0.5" aria-hidden />
                <div className="flex-1">
                  <p className="text-[13px] font-semibold text-rouge mb-1">Erreur d&apos;analyse</p>
                  <p className="text-[11.5px] text-white/50 leading-relaxed">{error}</p>
                </div>
                <button type="button" onClick={resetToIdle} className="text-white/30 hover:text-white/60 transition-colors">
                  <X size={16} aria-hidden />
                </button>
              </div>
              <button
                type="button"
                onClick={() => setState('idle')}
                className="mt-4 flex items-center gap-2 text-[10.5px] font-semibold uppercase tracking-[0.2em] text-white/40 hover:text-white/70 transition-colors"
              >
                <RefreshCw size={12} aria-hidden />
                Réessayer
              </button>
            </motion.div>
          )}

          {/* Preview + formulaire d'édition */}
          {(state === 'preview' || state === 'importing') && product && (
            <motion.div
              key="preview"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-5"
            >
              {/* En-tête preview */}
              <div className="rounded-sm border border-white/8 bg-white/4 p-5 flex items-center justify-between gap-4">
                <div className="flex items-center gap-4 min-w-0">
                  {/* Miniature image */}
                  {product.images_urls[0] && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={product.images_urls[0]}
                      alt=""
                      className="size-14 rounded-sm object-cover shrink-0 bg-white/10"
                    />
                  )}
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <SourceBadge source={product.source} />
                      {product.erreurs && product.erreurs.length > 0 && (
                        <span className="rounded-full bg-amber-500/15 px-2 py-0.5 text-[9px] font-semibold text-amber-400">
                          {product.erreurs.length} avert.
                        </span>
                      )}
                    </div>
                    <p className="text-[12px] font-semibold text-white/80 truncate">{product.nom}</p>
                    <p className="text-[11px] text-white/35 mt-0.5">
                      {product.prix_xof.toLocaleString('fr-FR')} XOF · {product.images_urls.length} images
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <a
                    href={product.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex size-8 items-center justify-center rounded-sm border border-white/10 text-white/40 hover:text-white/70 transition-colors"
                    aria-label="Voir sur la source"
                  >
                    <ExternalLink size={13} aria-hidden />
                  </a>
                  <button
                    type="button"
                    onClick={resetToIdle}
                    className="flex size-8 items-center justify-center rounded-sm border border-white/10 text-white/40 hover:text-white/70 transition-colors"
                    aria-label="Recommencer"
                  >
                    <X size={13} aria-hidden />
                  </button>
                </div>
              </div>

              {/* Galerie images */}
              {product.images_urls.length > 0 && (
                <div className="rounded-sm border border-white/8 bg-white/4 p-5">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/40 mb-4">
                    Images ({product.images_urls.length})
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {product.images_urls.map((imgUrl, i) => (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        key={i}
                        src={imgUrl}
                        alt=""
                        className="size-16 rounded-sm object-cover bg-white/5"
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Formulaire d'édition */}
              <form
                onSubmit={handleSubmit(onImport)}
                className="rounded-sm border border-white/8 bg-white/4 p-6 space-y-5"
              >
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/40 mb-2">
                  Édition avant import
                </p>

                {/* Nom + Slug */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <AdminField label="Nom du produit" error={errors.nom?.message} required>
                    <input {...register('nom')} className={adminInput(!!errors.nom)} />
                  </AdminField>
                  <AdminField label="Slug URL" error={errors.slug?.message} required>
                    <input {...register('slug')} className={adminInput(!!errors.slug)} />
                  </AdminField>
                </div>

                {/* Prix + Prix promo + Stock */}
                <div className="grid grid-cols-3 gap-4">
                  <AdminField label="Prix (XOF)" error={errors.prix?.message} required>
                    <input
                      type="number"
                      {...register('prix', { valueAsNumber: true })}
                      className={adminInput(!!errors.prix)}
                    />
                  </AdminField>
                  <AdminField label="Prix promo (XOF)" error={errors.prix_promo?.message}>
                    <input
                      type="number"
                      {...register('prix_promo', { valueAsNumber: true })}
                      className={adminInput(!!errors.prix_promo)}
                      placeholder="Optionnel"
                    />
                  </AdminField>
                  <AdminField label="Stock" error={errors.stock?.message}>
                    <input
                      type="number"
                      {...register('stock', { valueAsNumber: true })}
                      className={adminInput(!!errors.stock)}
                      defaultValue={0}
                    />
                  </AdminField>
                </div>

                {/* Description */}
                <AdminField label="Description courte" error={errors.description_courte?.message}>
                  <input {...register('description_courte')} className={adminInput(!!errors.description_courte)} />
                </AdminField>

                <AdminField label="Description complète" error={errors.description?.message}>
                  <textarea
                    {...register('description')}
                    rows={4}
                    className={cn(adminInput(!!errors.description), 'resize-y')}
                  />
                </AdminField>

                {/* Origine + Artisan */}
                <div className="grid grid-cols-2 gap-4">
                  <AdminField label="Origine / Pays" error={errors.origine?.message}>
                    <input {...register('origine')} className={adminInput(!!errors.origine)} placeholder="Bénin, Chine…" />
                  </AdminField>
                  <AdminField label="Artisan / Marque" error={errors.artisan?.message}>
                    <input {...register('artisan')} className={adminInput(!!errors.artisan)} placeholder="Artisan ou marque" />
                  </AdminField>
                </div>

                {/* Tags */}
                <AdminField label="Tags (séparés par virgule)" error={errors.tags?.message}>
                  <input {...register('tags')} className={adminInput(!!errors.tags)} placeholder="déco, moderne, bois…" />
                </AdminField>

                {/* SEO — section repliable */}
                <div>
                  <button
                    type="button"
                    onClick={() => setShowSpecs((s) => !s)}
                    className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/40 hover:text-white/60 transition-colors"
                  >
                    {showSpecs ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                    SEO &amp; Options avancées
                  </button>
                  <AnimatePresence>
                    {showSpecs && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="pt-4 space-y-4">
                          <AdminField label="Meta titre (max 70 car.)" error={errors.meta_titre?.message}>
                            <input {...register('meta_titre')} className={adminInput(!!errors.meta_titre)} />
                          </AdminField>
                          <AdminField label="Meta description (max 160 car.)" error={errors.meta_description?.message}>
                            <textarea
                              {...register('meta_description')}
                              rows={2}
                              className={cn(adminInput(!!errors.meta_description), 'resize-y')}
                            />
                          </AdminField>
                          <label className="flex items-center gap-3 cursor-pointer">
                            <input
                              type="checkbox"
                              {...register('vedette')}
                              className="size-4 rounded accent-or"
                            />
                            <span className="text-[11px] text-white/60">Produit vedette</span>
                          </label>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Error banner import */}
                {state !== 'importing' && error && (
                  <div className="rounded-sm border border-rouge/20 bg-rouge/8 px-4 py-3 text-[11px] text-rouge">
                    {error}
                  </div>
                )}

                {/* Submit */}
                <div className="flex gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={state === 'importing'}
                    className={cn(
                      'flex-1 flex items-center justify-center gap-2.5 rounded-sm py-3.5',
                      'text-[10.5px] font-semibold uppercase tracking-[0.2em] text-blanc',
                      'bg-or hover:bg-or-dark transition-all active:scale-[0.98]',
                      'disabled:opacity-60 disabled:cursor-not-allowed',
                    )}
                  >
                    {state === 'importing' ? (
                      <><Loader2 size={14} className="animate-spin" /> Import en cours…</>
                    ) : (
                      <><Package size={14} /> Publier en brouillon</>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          )}

          {/* Succès import */}
          {state === 'imported' && imported && (
            <motion.div
              key="imported"
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="rounded-sm border border-vert/20 bg-vert/8 p-8 text-center"
            >
              <CheckCircle size={32} strokeWidth={1.5} className="mx-auto mb-4 text-vert" />
              <p className="text-[14px] font-semibold text-white/80 mb-2">Produit importé</p>
              <p className="text-[11px] text-white/40 mb-6">
                <strong className="text-white/60">{imported.nom}</strong> a été créé avec le statut Brouillon.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-3">
                <a
                  href={`/boutique/${imported.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 rounded-sm bg-vert/20 border border-vert/30 px-5 py-2.5 text-[10.5px] font-semibold uppercase tracking-[0.18em] text-vert/80 hover:bg-vert/30 transition-colors"
                >
                  <ExternalLink size={12} /> Voir le produit
                </a>
                <button
                  type="button"
                  onClick={resetToIdle}
                  className="flex items-center justify-center gap-2 rounded-sm border border-white/10 px-5 py-2.5 text-[10.5px] font-semibold uppercase tracking-[0.18em] text-white/50 hover:text-white/70 hover:border-white/20 transition-colors"
                >
                  <RefreshCw size={12} /> Nouvel import
                </button>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      {/* ── Sidebar historique ───────────────────────────────────────────────── */}
      <div className="sticky top-6 space-y-4">
        <div className="rounded-sm border border-white/8 bg-white/4 p-5">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/40 mb-4 flex items-center gap-2">
            <Tag size={11} aria-hidden />
            Historique session
          </p>

          {history.length === 0 ? (
            <p className="text-[11px] text-white/25 text-center py-6">
              Aucun import pour cette session
            </p>
          ) : (
            <ul className="space-y-2.5">
              {history.map((job) => (
                <li
                  key={job.id}
                  className="flex items-start gap-3 p-3 rounded-sm bg-white/4 border border-white/5"
                >
                  <div className={cn(
                    'mt-0.5 size-2 rounded-full shrink-0',
                    job.status === 'success' ? 'bg-vert' : 'bg-rouge',
                  )} aria-hidden />
                  <div className="min-w-0 flex-1">
                    <p className="text-[10.5px] font-semibold text-white/70 truncate">{job.nom}</p>
                    <p className="text-[9.5px] text-white/30 mt-0.5">
                      {job.source} · {formatTime(job.timestamp)}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Guide rapide */}
        <div className="rounded-sm border border-white/8 bg-white/4 p-5">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/40 mb-4">
            Guide rapide
          </p>
          <ol className="space-y-2.5">
            {[
              'Coller l\'URL d\'un produit',
              'Cliquer sur Analyser',
              'Vérifier et éditer les données',
              'Ajuster le prix en XOF',
              'Publier en brouillon',
            ].map((step, i) => (
              <li key={i} className="flex items-start gap-2.5 text-[10.5px] text-white/40">
                <span className="shrink-0 mt-0.5 size-4 rounded-full border border-or/30 flex items-center justify-center text-[9px] text-or/60">
                  {i + 1}
                </span>
                {step}
              </li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function SourceBadge({ source }: { source: string }) {
  const colors: Record<string, string> = {
    alibaba:   'bg-orange-500/15 text-orange-400 border-orange-500/20',
    aliexpress:'bg-red-500/15 text-red-400 border-red-500/20',
    amazon:    'bg-amber-500/15 text-amber-400 border-amber-500/20',
    jumia:     'bg-orange-600/15 text-orange-300 border-orange-600/20',
  };
  return (
    <span className={cn(
      'rounded-full border px-2 py-0.5 text-[8.5px] font-semibold uppercase tracking-[0.12em]',
      colors[source] ?? 'bg-white/10 text-white/40 border-white/10',
    )}>
      {source}
    </span>
  );
}

function AdminField({
  label, error, required, children,
}: { label: string; error?: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[9.5px] font-semibold uppercase tracking-[0.18em] text-white/40">
        {label}{required && <span className="ml-1 text-or/60">*</span>}
      </label>
      {children}
      {error && (
        <p className="text-[10px] text-rouge" role="alert">{error}</p>
      )}
    </div>
  );
}

function adminInput(hasError: boolean) {
  return cn(
    'w-full rounded-sm border px-3 py-2.5',
    'bg-white/5 text-[11.5px] text-white/80 placeholder:text-white/25',
    'focus:outline-none focus:ring-1 focus:ring-or/40',
    hasError ? 'border-rouge/40' : 'border-white/10',
  );
}

function detectSourceLabel(url: string): string {
  if (url.includes('alibaba'))    return 'Alibaba';
  if (url.includes('aliexpress')) return 'AliExpress';
  if (url.includes('amazon'))     return 'Amazon';
  if (url.includes('jumia'))      return 'Jumia';
  return 'Inconnu';
}

function formatTime(d: Date): string {
  return d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
}
