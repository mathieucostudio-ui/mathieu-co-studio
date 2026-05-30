'use client';

/**
 * CoworkDashboard — Interface de validation marketing
 *
 * Sections :
 *   1. Stats overview (4 métriques)
 *   2. Générateur rapide (slug + plateforme)
 *   3. Tâches en attente de validation
 *   4. Historique des posts publiés
 *   5. Bouton rapport hebdomadaire
 */

import { useState, useCallback }      from 'react';
import { motion, AnimatePresence }    from 'framer-motion';
import {
  Check, X, RefreshCw, Send, Loader2,
  FileText, ExternalLink, ChevronDown, ChevronUp,
  AlertCircle, Clock,
} from 'lucide-react';
import { cn }          from '@/lib/utils';
import type { CoworkTask } from '@/lib/cowork/types';

// ─── Types ────────────────────────────────────────────────────────────────────

interface CoworkDashboardProps {
  tasksPending:   CoworkTask[];
  tasksPublished: CoworkTask[];
  stats:          Record<string, number>;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const PLATFORM_ICONS: Record<string, React.ReactNode> = {
  instagram: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden><rect x="2" y="2" width="20" height="20" rx="5" stroke="currentColor" strokeWidth="1.8"/><circle cx="12" cy="12" r="4.5" stroke="currentColor" strokeWidth="1.8"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor"/></svg>,
  linkedin:  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden><rect x="2" y="2" width="20" height="20" rx="4" stroke="currentColor" strokeWidth="1.8"/><path d="M7 10v7M7 7v1M12 17v-4c0-1.1.9-2 2-2s2 .9 2 2v4M12 10v7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>,
  both:      <span className="text-[9px] font-bold">IG+LI</span>,
};

const PLATFORM_COLORS: Record<string, string> = {
  instagram: 'bg-pink-500/15 text-pink-400 border-pink-500/20',
  linkedin:  'bg-blue-500/15 text-blue-400 border-blue-500/20',
  both:      'bg-purple-500/15 text-purple-400 border-purple-500/20',
};

const SOURCE_LABELS: Record<string, string> = {
  projet:       'Projet',
  produit:      'Produit',
  article_blog: 'Article',
  custom:       'Manuel',
};

// ─── CoworkDashboard ──────────────────────────────────────────────────────────

export function CoworkDashboard({
  tasksPending: initialPending,
  tasksPublished,
  stats,
}: CoworkDashboardProps) {
  const [pending, setPending]     = useState(initialPending);
  const [loading, setLoading]     = useState<string | null>(null); // task_id en cours
  const [genLoading, setGenLoading] = useState(false);
  const [reportLoading, setReportLoading] = useState(false);
  const [flash, setFlash]         = useState('');

  // Générateur
  const [genSlug, setGenSlug]     = useState('');
  const [genType, setGenType]     = useState<'projet' | 'produit' | 'article_blog'>('projet');
  const [genPlatform, setGenPlatform] = useState<'instagram' | 'linkedin' | 'both'>('instagram');
  const [genTone, setGenTone]     = useState<'inspire' | 'professionnel' | 'commercial'>('inspire');

  const showFlash = (msg: string) => {
    setFlash(msg);
    setTimeout(() => setFlash(''), 3500);
  };

  // ── Approuver ──────────────────────────────────────────────────────────────
  const handleApprove = useCallback(async (taskId: string) => {
    setLoading(taskId);
    try {
      const res = await fetch('/api/cowork/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ task_id: taskId, publish_now: true }),
      });
      const json = await res.json();
      if (json.ok) {
        setPending((p) => p.filter((t) => t.id !== taskId));
        showFlash(`✅ Post publié${json.post_url ? ` → ${json.post_url}` : ''}`);
      } else {
        showFlash(`❌ Erreur : ${json.error}`);
      }
    } catch {
      showFlash('❌ Erreur réseau');
    } finally {
      setLoading(null);
    }
  }, []);

  // ── Rejeter ────────────────────────────────────────────────────────────────
  const handleReject = useCallback(async (taskId: string) => {
    setLoading(taskId);
    try {
      const res = await fetch('/api/cowork/reject', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ task_id: taskId }),
      });
      if (res.ok) {
        setPending((p) => p.filter((t) => t.id !== taskId));
        showFlash('🗑️ Tâche rejetée');
      }
    } catch {
      showFlash('❌ Erreur réseau');
    } finally {
      setLoading(null);
    }
  }, []);

  // ── Générer ────────────────────────────────────────────────────────────────
  const handleGenerate = useCallback(async () => {
    if (!genSlug.trim()) return;
    setGenLoading(true);
    try {
      const res = await fetch('/api/cowork/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          source_type: genType,
          source_slug: genSlug.trim(),
          platform:    genPlatform,
          tone:        genTone,
        }),
      });
      const json = await res.json();
      if (json.ok) {
        showFlash(`🎨 ${json.count} tâche(s) générée(s) — actualise la page pour les voir`);
        setGenSlug('');
      } else {
        showFlash(`❌ ${json.error}`);
      }
    } catch {
      showFlash('❌ Erreur réseau');
    } finally {
      setGenLoading(false);
    }
  }, [genSlug, genType, genPlatform, genTone]);

  // ── Rapport ────────────────────────────────────────────────────────────────
  const handleReport = useCallback(async () => {
    setReportLoading(true);
    try {
      const res = await fetch('/api/cowork/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const json = await res.json();
      if (json.ok) {
        showFlash(`📊 Rapport généré${json.emailSent ? ' et envoyé par email' : ' (email non configuré)'}`);
      } else {
        showFlash(`❌ ${json.error}`);
      }
    } catch {
      showFlash('❌ Erreur réseau');
    } finally {
      setReportLoading(false);
    }
  }, []);

  // ── Stats KPIs ─────────────────────────────────────────────────────────────
  const KPIS = [
    { label: 'En attente',  value: stats.en_attente ?? 0,  color: 'text-amber-400',  bg: 'bg-amber-500/10' },
    { label: 'Approuvées',  value: stats.approuve   ?? 0,  color: 'text-blue-400',   bg: 'bg-blue-500/10' },
    { label: 'Publiées',    value: stats.publie      ?? 0,  color: 'text-emerald-400',bg: 'bg-emerald-500/10' },
    { label: 'Rejetées',    value: stats.rejete      ?? 0,  color: 'text-red-400',    bg: 'bg-red-500/10' },
  ];

  return (
    <div className="space-y-6">

      {/* Flash message */}
      <AnimatePresence>
        {flash && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="rounded-sm border border-white/10 bg-white/8 px-5 py-3 text-[12px] font-medium text-white/80"
          >
            {flash}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Header + Rapport btn ───────────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-[16px] font-semibold text-white/85">Cowork · Automation</h1>
          <p className="text-[11px] text-white/35 mt-0.5">Génération et validation du contenu marketing</p>
        </div>
        <button
          type="button"
          onClick={handleReport}
          disabled={reportLoading}
          className={cn(
            'flex items-center gap-2 rounded-sm border border-white/10 px-4 py-2.5',
            'text-[10px] font-semibold uppercase tracking-[0.18em] text-white/50',
            'hover:border-white/20 hover:text-white/70 transition-all',
            'disabled:opacity-50 disabled:cursor-not-allowed',
          )}
        >
          {reportLoading ? (
            <Loader2 size={12} className="animate-spin" />
          ) : (
            <FileText size={12} />
          )}
          Rapport hebdomadaire
        </button>
      </div>

      {/* ── KPIs ──────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {KPIS.map((kpi) => (
          <div
            key={kpi.label}
            className="rounded-sm border border-white/8 bg-white/4 p-5"
          >
            <p className="text-[9.5px] font-semibold uppercase tracking-[0.2em] text-white/35 mb-2">{kpi.label}</p>
            <p className={cn('text-[2.2rem] font-light font-mono leading-none', kpi.color)}>
              {String(kpi.value).padStart(2, '0')}
            </p>
          </div>
        ))}
      </div>

      {/* ── Générateur rapide ─────────────────────────────────────────────── */}
      <div className="rounded-sm border border-white/8 bg-white/4 p-6">
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/40 mb-5">
          Générer du contenu
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          {/* Type de source */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[9.5px] font-semibold uppercase tracking-[0.16em] text-white/35">Source</label>
            <select
              value={genType}
              onChange={(e) => setGenType(e.target.value as typeof genType)}
              className="rounded-sm border border-white/10 bg-white/5 px-3 py-2.5 text-[11.5px] text-white/70 focus:outline-none focus:border-or/50"
            >
              <option value="projet">Projet galerie</option>
              <option value="produit">Produit boutique</option>
              <option value="article_blog">Article blog</option>
            </select>
          </div>

          {/* Slug */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[9.5px] font-semibold uppercase tracking-[0.16em] text-white/35">Slug</label>
            <input
              type="text"
              value={genSlug}
              onChange={(e) => setGenSlug(e.target.value)}
              placeholder="ex: villa-cotonou-2024"
              className="rounded-sm border border-white/10 bg-white/5 px-3 py-2.5 text-[11.5px] text-white/70 placeholder:text-white/20 focus:outline-none focus:border-or/50"
            />
          </div>

          {/* Plateforme */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[9.5px] font-semibold uppercase tracking-[0.16em] text-white/35">Plateforme</label>
            <select
              value={genPlatform}
              onChange={(e) => setGenPlatform(e.target.value as typeof genPlatform)}
              className="rounded-sm border border-white/10 bg-white/5 px-3 py-2.5 text-[11.5px] text-white/70 focus:outline-none focus:border-or/50"
            >
              <option value="instagram">Instagram</option>
              <option value="linkedin">LinkedIn</option>
              <option value="both">Les deux</option>
            </select>
          </div>

          {/* Ton */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[9.5px] font-semibold uppercase tracking-[0.16em] text-white/35">Ton</label>
            <select
              value={genTone}
              onChange={(e) => setGenTone(e.target.value as typeof genTone)}
              className="rounded-sm border border-white/10 bg-white/5 px-3 py-2.5 text-[11.5px] text-white/70 focus:outline-none focus:border-or/50"
            >
              <option value="inspire">Inspiré</option>
              <option value="professionnel">Professionnel</option>
              <option value="commercial">Commercial</option>
            </select>
          </div>
        </div>

        <button
          type="button"
          onClick={handleGenerate}
          disabled={genLoading || !genSlug.trim()}
          className={cn(
            'flex items-center gap-2.5 rounded-sm px-6 py-3',
            'text-[10.5px] font-semibold uppercase tracking-[0.2em]',
            'bg-or text-noir hover:bg-or-dark transition-all active:scale-[0.98]',
            'disabled:opacity-50 disabled:cursor-not-allowed',
          )}
        >
          {genLoading ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />}
          Générer le contenu
        </button>
      </div>

      {/* ── Tâches en attente ─────────────────────────────────────────────── */}
      <div className="rounded-sm border border-white/8 bg-white/4 p-6">
        <div className="flex items-center justify-between mb-5">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/40">
            En attente de validation ({pending.length})
          </p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="flex items-center gap-1.5 text-[9.5px] text-white/30 hover:text-white/50 transition-colors"
          >
            <RefreshCw size={11} />
            Actualiser
          </button>
        </div>

        {pending.length === 0 ? (
          <div className="py-10 text-center">
            <p className="text-[12px] font-semibold text-white/40 mb-1">Aucune tâche en attente</p>
            <p className="text-[11px] text-white/20">Utilisez le générateur pour créer du contenu.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {pending.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                isLoading={loading === task.id}
                onApprove={() => handleApprove(task.id)}
                onReject={() => handleReject(task.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── Historique publiés ─────────────────────────────────────────────── */}
      {tasksPublished.length > 0 && (
        <div className="rounded-sm border border-white/8 bg-white/4 p-6">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/40 mb-4">
            Publiés récemment
          </p>
          <div className="space-y-2">
            {tasksPublished.map((task) => (
              <div key={task.id} className="flex items-center gap-4 py-2.5 border-b border-white/5 last:border-0">
                <div className={cn(
                  'flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[8.5px] font-semibold shrink-0',
                  PLATFORM_COLORS[task.platform ?? ''] ?? 'bg-white/10 text-white/40 border-white/10',
                )}>
                  {PLATFORM_ICONS[task.platform ?? '']}
                  {task.platform}
                </div>
                <p className="flex-1 text-[11px] text-white/60 truncate">{task.titre ?? task.contenu.slice(0, 60)}</p>
                <p className="text-[10px] text-white/30 shrink-0">
                  {task.publie_le ? new Date(task.publie_le).toLocaleDateString('fr-FR') : '—'}
                </p>
                {task.publie_url && (
                  <a
                    href={task.publie_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shrink-0 text-white/30 hover:text-white/60 transition-colors"
                    aria-label="Voir le post"
                  >
                    <ExternalLink size={12} />
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── TaskCard ─────────────────────────────────────────────────────────────────

function TaskCard({
  task, isLoading, onApprove, onReject,
}: {
  task:      CoworkTask;
  isLoading: boolean;
  onApprove: () => void;
  onReject:  () => void;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="rounded-sm border border-white/8 bg-white/3 overflow-hidden">
      {/* Header */}
      <div className="flex items-start gap-4 p-4">
        {/* Platform badge */}
        <div className={cn(
          'flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[8.5px] font-semibold uppercase tracking-[0.1em] shrink-0 mt-0.5',
          PLATFORM_COLORS[task.platform ?? ''] ?? 'bg-white/10 text-white/40 border-white/10',
        )}>
          {PLATFORM_ICONS[task.platform ?? '']}
          <span>{task.platform}</span>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            {task.source_type && (
              <span className="text-[9px] font-semibold uppercase tracking-[0.15em] text-white/30">
                {SOURCE_LABELS[task.source_type]}
              </span>
            )}
            {task.source_slug && (
              <span className="text-[9px] text-white/20 truncate">{task.source_slug}</span>
            )}
          </div>
          <p className="text-[12px] font-semibold text-white/80 truncate">
            {task.titre ?? 'Post sans titre'}
          </p>
          <p className="text-[10.5px] text-white/40 mt-0.5 flex items-center gap-1.5">
            <Clock size={10} strokeWidth={1.8} />
            {new Date(task.created_at).toLocaleString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
            {task.meta?.generated_with != null && (
              <span className="ml-1 text-[9px] text-or/50">
                via {String(task.meta.generated_with)}
              </span>
            )}
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setExpanded((e) => !e)}
            className="flex size-7 items-center justify-center rounded-sm border border-white/10 text-white/40 hover:text-white/60 transition-colors"
            aria-label={expanded ? 'Replier' : 'Voir le contenu'}
          >
            {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          </button>
          <button
            type="button"
            onClick={onReject}
            disabled={isLoading}
            className="flex size-7 items-center justify-center rounded-sm border border-red-500/20 text-red-400/70 hover:bg-red-500/10 hover:text-red-400 transition-all disabled:opacity-40"
            aria-label="Rejeter"
          >
            {isLoading ? <Loader2 size={12} className="animate-spin" /> : <X size={12} />}
          </button>
          <button
            type="button"
            onClick={onApprove}
            disabled={isLoading}
            className="flex items-center gap-1.5 rounded-sm bg-or/90 px-3 py-1.5 text-[9.5px] font-semibold uppercase tracking-[0.15em] text-noir hover:bg-or transition-all disabled:opacity-40"
            aria-label="Approuver et publier"
          >
            {isLoading ? <Loader2 size={11} className="animate-spin" /> : <Check size={11} />}
            Publier
          </button>
        </div>
      </div>

      {/* Contenu expandable */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 border-t border-white/5 pt-4">
              {/* Images preview */}
              {task.images_urls && task.images_urls.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {task.images_urls.slice(0, 4).map((url, i) => (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      key={i}
                      src={url}
                      alt=""
                      className="size-14 rounded-sm object-cover bg-white/5"
                    />
                  ))}
                </div>
              )}

              {/* Caption */}
              <div className="rounded-sm bg-white/4 border border-white/8 p-4">
                <p className="text-[11px] text-white/60 whitespace-pre-wrap leading-relaxed">
                  {task.contenu}
                </p>
              </div>

              {/* Hashtags */}
              {task.hashtags && task.hashtags.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {task.hashtags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-white/5 border border-white/8 px-2 py-0.5 text-[9px] text-white/35"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Alerte si erreur passée */}
              {task.erreur && (
                <div className="mt-3 flex items-start gap-2 rounded-sm bg-red-500/8 border border-red-500/15 px-3 py-2.5">
                  <AlertCircle size={12} className="shrink-0 text-red-400 mt-0.5" />
                  <p className="text-[10.5px] text-red-400/80">{task.erreur}</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
