/**
 * loading.tsx — Skeleton fiche produit
 *
 * Affiché par Next.js pendant le chargement de la page produit.
 * Reproduit fidèlement la structure hero (galerie + info) + sections.
 */

export default function ProduitDetailLoading() {
  return (
    <main aria-busy="true" aria-label="Chargement du produit…">

      {/* ─── Hero skeleton ──────────────────────────────────────────── */}
      <section className="w-full bg-blanc">
        <div className="mx-auto max-w-[1440px] grid grid-cols-1 lg:grid-cols-[53%_47%] lg:min-h-[680px]">

          {/* Galerie */}
          <div className="px-6 py-8 lg:px-10 lg:py-10">
            <div className="relative flex h-full gap-3">
              {/* Image principale */}
              <div className="flex-1 min-h-[480px] md:min-h-[580px] rounded-sm bg-beige2 animate-pulse" />
              {/* Thumbnails */}
              <div className="hidden md:flex flex-col gap-2.5 w-[130px] shrink-0">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div
                    key={i}
                    className="flex-1 min-h-[100px] rounded-sm bg-beige2 animate-pulse"
                    style={{ animationDelay: `${i * 80}ms` }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Info */}
          <div className="border-t border-gris-cl/40 lg:border-t-0 lg:border-l lg:border-gris-cl/40 px-8 py-8 xl:px-12 flex flex-col gap-5">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2">
              {[60, 8, 80, 8, 100, 8, 140].map((w, i) =>
                w === 8 ? (
                  <div key={i} className="w-2 h-2 rounded-full bg-gris-cl animate-pulse" />
                ) : (
                  <div key={i} className="h-3 rounded-sm bg-gris-cl animate-pulse" style={{ width: w }} />
                )
              )}
            </div>

            {/* Category badge */}
            <div className="h-3 w-24 rounded-sm bg-beige3 animate-pulse" />

            {/* Nom produit */}
            <div className="space-y-2">
              <div className="h-8 w-4/5 rounded-sm bg-beige2 animate-pulse" />
              <div className="h-8 w-3/5 rounded-sm bg-beige2 animate-pulse" />
            </div>

            {/* Stars */}
            <div className="h-4 w-32 rounded-sm bg-beige3 animate-pulse" />

            {/* Prix */}
            <div className="h-8 w-48 rounded-sm bg-beige2 animate-pulse" />

            {/* Séparateur */}
            <div className="h-px w-full bg-gris-cl/50 animate-pulse" />

            {/* Swatches */}
            <div className="space-y-3">
              <div className="h-3 w-32 rounded-sm bg-beige3 animate-pulse" />
              <div className="flex gap-2.5">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="size-8 rounded-full bg-beige2 animate-pulse" style={{ animationDelay: `${i * 60}ms` }} />
                ))}
              </div>
            </div>

            {/* Quantité */}
            <div className="space-y-3">
              <div className="h-3 w-20 rounded-sm bg-beige3 animate-pulse" />
              <div className="h-10 w-36 rounded-sm bg-beige2 animate-pulse" />
            </div>

            {/* CTAs */}
            <div className="space-y-3">
              <div className="h-[52px] w-full rounded-sm bg-beige2 animate-pulse" />
              <div className="h-[52px] w-full rounded-sm bg-beige3 animate-pulse" />
            </div>

            {/* Trust badges */}
            <div className="mt-auto pt-5 border-t border-gris-cl/60 space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-start gap-2.5">
                  <div className="size-7 rounded-full bg-beige2 animate-pulse shrink-0" style={{ animationDelay: `${i * 80}ms` }} />
                  <div className="space-y-1.5 flex-1">
                    <div className="h-3 w-3/4 rounded-sm bg-beige2 animate-pulse" />
                    <div className="h-3 w-1/2 rounded-sm bg-beige3 animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </section>

      {/* ─── Rendus skeleton ────────────────────────────────────────── */}
      <section className="w-full py-16" style={{ backgroundColor: '#151515' }}>
        <div className="mx-auto max-w-[1440px] px-8 md:px-12 xl:px-16">
          <div className="mb-10 space-y-3">
            <div className="h-3 w-24 rounded-sm bg-white/10 animate-pulse" />
            <div className="h-7 w-64 rounded-sm bg-white/10 animate-pulse" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="h-[240px] rounded-sm bg-white/8 animate-pulse"
                style={{ animationDelay: `${i * 100}ms` }}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ─── Détails skeleton ───────────────────────────────────────── */}
      <section className="w-full py-16" style={{ backgroundColor: '#F2EDE8' }}>
        <div className="mx-auto max-w-[1440px] px-8 md:px-12 xl:px-16">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-12">
            <div className="space-y-3">
              <div className="h-3 w-20 rounded-sm bg-beige3 animate-pulse" />
              <div className="h-7 w-48 rounded-sm bg-beige2 animate-pulse" />
            </div>
            <div className="space-y-0">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="py-5 border-b border-gris-cl/70 last:border-0">
                  <div className="h-4 w-40 rounded-sm bg-beige2 animate-pulse" style={{ animationDelay: `${i * 80}ms` }} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── Avis skeleton ──────────────────────────────────────────── */}
      <section className="w-full py-16 bg-blanc">
        <div className="mx-auto max-w-[1440px] px-8 md:px-12 xl:px-16">
          <div className="mb-10 space-y-3">
            <div className="h-3 w-28 rounded-sm bg-beige3 animate-pulse" />
            <div className="h-7 w-52 rounded-sm bg-beige2 animate-pulse" />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-12">
            <div className="space-y-4">
              <div className="h-16 w-24 rounded-sm bg-beige2 animate-pulse" />
              <div className="space-y-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="h-2 w-full rounded-full bg-beige3 animate-pulse" style={{ animationDelay: `${i * 50}ms` }} />
                ))}
              </div>
            </div>
            <div className="space-y-6">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="py-6 border-b border-gris-cl/60 space-y-2">
                  <div className="h-3 w-32 rounded-sm bg-beige3 animate-pulse" />
                  <div className="h-4 w-48 rounded-sm bg-beige2 animate-pulse" />
                  <div className="h-3 w-full rounded-sm bg-beige3 animate-pulse" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

    </main>
  );
}
