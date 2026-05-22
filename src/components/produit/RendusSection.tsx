/**
 * RendusSection — "Vu dans nos rendus 3D"
 *
 * SVG layout (y=984-1364, h=380px, bg=#151515) :
 *   Trois cartes d'environnements intérieurs :
 *   • Salon contemporain  bg=#2A5060 (teal)
 *   • Bureau traditionnel bg=#3A2A18 (caramel/brun)
 *   • Espace nature        bg=#203828 (vert forêt)
 *
 * Server Component — pas d'interactivité, pas de données.
 */

import { cn } from '@/lib/utils';

// ─── Environnements ───────────────────────────────────────────────────────────

const ENVS = [
  {
    id:      'salon',
    bg:      '#2A5060',
    label:   'Salon Contemporain',
    tag:     'Minimalisme',
    desc:    'Lignes épurées, matières brutes et lumière naturelle diffuse.',
  },
  {
    id:      'bureau',
    bg:      '#3A2A18',
    label:   'Bureau Traditionnel',
    tag:     'Héritage',
    desc:    'Boiseries sombres, laiton et tapis en fibres naturelles.',
  },
  {
    id:      'nature',
    bg:      '#203828',
    label:   'Espace Nature',
    tag:     'Organique',
    desc:    'Végétation, terre et matières non traitées en dialogue.',
  },
] as const;

// ─── RendusSection ────────────────────────────────────────────────────────────

interface RendusSectionProps {
  nomProduit: string;
}

export function RendusSection({ nomProduit }: RendusSectionProps) {
  return (
    <section
      className="w-full py-16"
      style={{ backgroundColor: '#151515' }}
      aria-labelledby="rendus-heading"
    >
      <div className="mx-auto max-w-[1440px] px-8 md:px-12 xl:px-16">

        {/* Header */}
        <div className="mb-10 flex flex-col gap-1 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="mb-3 flex items-center gap-3">
              <span className="block h-[2px] w-6 rounded-full bg-or/60" aria-hidden />
              <span className="text-[9px] font-semibold uppercase tracking-[0.36em] text-or/70">
                Mise en scène
              </span>
            </div>
            <h2
              id="rendus-heading"
              className="font-display font-light italic text-blanc leading-tight"
              style={{ fontSize: 'clamp(1.4rem, 2.2vw, 1.9rem)' }}
            >
              Imaginez-le dans votre espace
            </h2>
          </div>
          <p className="text-[11px] text-blanc/40 max-w-xs leading-relaxed">
            Nos rendus 3D vous projettent dans trois atmosphères d&apos;intérieur
            pour vous aider à visualiser la pièce chez vous.
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {ENVS.map((env) => (
            <div
              key={env.id}
              className="group relative h-[240px] overflow-hidden rounded-sm"
              style={{ backgroundColor: env.bg }}
            >
              {/* Gradient overlay */}
              <div
                className="absolute inset-0"
                style={{
                  background: 'linear-gradient(to top, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0) 55%)',
                }}
                aria-hidden
              />

              {/* Motif géométrique subtil */}
              <div
                className="absolute inset-0 opacity-[0.06]"
                style={{
                  backgroundImage: `radial-gradient(circle at 70% 30%, rgba(255,255,255,0.3) 0%, transparent 50%),
                    repeating-linear-gradient(45deg, transparent, transparent 20px, rgba(255,255,255,0.03) 20px, rgba(255,255,255,0.03) 21px)`,
                }}
                aria-hidden
              />

              {/* Content */}
              <div className="absolute bottom-0 left-0 right-0 p-5">
                <span
                  className={cn(
                    'mb-2 inline-block rounded-sm px-2 py-0.5',
                    'text-[8.5px] font-semibold uppercase tracking-[0.28em]',
                  )}
                  style={{ backgroundColor: 'rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.65)' }}
                >
                  {env.tag}
                </span>
                <h3 className="font-display font-light italic text-blanc text-lg leading-tight mb-1">
                  {env.label}
                </h3>
                <p className="text-[11px] text-blanc/55 leading-relaxed">
                  {env.desc}
                </p>
              </div>

              {/* Nom produit en coin haut droit */}
              <div className="absolute right-4 top-4">
                <span className="text-[9px] text-blanc/30 uppercase tracking-[0.2em]">
                  {nomProduit}
                </span>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
