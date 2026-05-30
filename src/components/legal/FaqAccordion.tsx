'use client';

/**
 * FaqAccordion — Accordéon FAQ avec recherche en temps réel
 */

import { useState, useMemo }     from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus, Minus }   from 'lucide-react';
import { cn }                    from '@/lib/utils';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface FaqItem {
  id:        string;
  categorie: string;
  question:  string;
  reponse:   string;
}

interface FaqAccordionProps {
  items: FaqItem[];
}

// ─── FaqAccordion ─────────────────────────────────────────────────────────────

export function FaqAccordion({ items }: FaqAccordionProps) {
  const [search,  setSearch]  = useState('');
  const [open,    setOpen]    = useState<string | null>(null);
  const [catFilt, setCatFilt] = useState<string>('Tous');

  // Catégories uniques
  const categories = useMemo(() => {
    const cats = [...new Set(items.map((i) => i.categorie))];
    return ['Tous', ...cats];
  }, [items]);

  // Filtrage
  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return items.filter((item) => {
      const matchCat = catFilt === 'Tous' || item.categorie === catFilt;
      const matchQ   = !q || item.question.toLowerCase().includes(q) || item.reponse.toLowerCase().includes(q);
      return matchCat && matchQ;
    });
  }, [items, search, catFilt]);

  const toggle = (id: string) => setOpen((o) => (o === id ? null : id));

  return (
    <div>
      {/* Barre recherche */}
      <div className="mb-8 relative">
        <Search
          size={15}
          strokeWidth={1.8}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-gris/50 pointer-events-none"
          aria-hidden
        />
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Rechercher une question…"
          className="w-full max-w-[480px] rounded-sm border border-gris-cl bg-blanc px-5 py-3 pl-11 text-[12px] text-noir placeholder:text-gris/45 focus:outline-none focus:ring-2 focus:ring-or/40 focus:border-or/60 transition-colors"
          aria-label="Rechercher dans la FAQ"
        />
      </div>

      {/* Filtres catégories */}
      <div className="mb-10 flex flex-wrap gap-2" role="group" aria-label="Filtrer par catégorie">
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => { setCatFilt(cat); setOpen(null); }}
            className={cn(
              'rounded-sm px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.2em] transition-all duration-200',
              catFilt === cat
                ? 'bg-noir text-blanc'
                : 'border border-gris-cl text-gris hover:border-gris hover:text-noir',
            )}
            aria-pressed={catFilt === cat}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Résultats */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-gris">
          <p className="text-[13px] font-semibold mb-2">Aucun résultat</p>
          <p className="text-[11px]">Essayez d&apos;autres mots-clés ou contactez-nous directement.</p>
        </div>
      ) : (
        <div className="space-y-3" role="list" aria-label="Questions fréquentes">
          {/* Grouper par catégorie si filtre 'Tous' */}
          {catFilt === 'Tous' && !search
            ? Object.entries(
                filtered.reduce<Record<string, FaqItem[]>>((acc, item) => {
                  (acc[item.categorie] ??= []).push(item);
                  return acc;
                }, {}),
              ).map(([cat, catItems]) => (
                <div key={cat}>
                  <p className="text-[9px] font-semibold uppercase tracking-[0.3em] text-gris/60 mb-3 mt-6 first:mt-0">
                    {cat}
                  </p>
                  {catItems.map((item) => (
                    <FaqRow key={item.id} item={item} isOpen={open === item.id} onToggle={() => toggle(item.id)} />
                  ))}
                </div>
              ))
            : filtered.map((item) => (
                <FaqRow key={item.id} item={item} isOpen={open === item.id} onToggle={() => toggle(item.id)} />
              ))
          }
        </div>
      )}
    </div>
  );
}

// ─── FaqRow ───────────────────────────────────────────────────────────────────

function FaqRow({
  item, isOpen, onToggle,
}: {
  item:     FaqItem;
  isOpen:   boolean;
  onToggle: () => void;
}) {
  return (
    <div
      className={cn(
        'rounded-sm border transition-colors duration-200',
        isOpen ? 'border-or/30 bg-beige' : 'border-gris-cl bg-blanc',
      )}
      role="listitem"
    >
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-start gap-4 px-5 py-4 text-left"
        aria-expanded={isOpen}
      >
        <span className="flex-1 text-[12.5px] font-semibold text-noir leading-snug">
          {item.question}
        </span>
        <span className="shrink-0 mt-0.5" aria-hidden>
          {isOpen
            ? <Minus size={14} strokeWidth={2} className="text-or" />
            : <Plus  size={14} strokeWidth={2} className="text-gris/60" />
          }
        </span>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 pt-0">
              <div className="h-px bg-gris-cl mb-4" aria-hidden />
              <p className="text-[12px] text-gris leading-[1.8] whitespace-pre-line">
                {item.reponse}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
