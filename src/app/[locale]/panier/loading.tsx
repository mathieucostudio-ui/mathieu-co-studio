/**
 * loading.tsx — Skeleton panier
 * Affiché pendant le chargement de la page (avant hydration).
 */

export default function PanierLoading() {
  return (
    <div className="min-h-[100dvh] bg-beige" aria-busy="true" aria-label="Chargement du panier…">

      {/* Header */}
      <div className="bg-blanc border-b border-gris-cl py-8">
        <div className="mx-auto max-w-[1440px] px-8 md:px-12 xl:px-16">
          <div className="flex gap-2 mb-5">
            {[60, 8, 70, 8, 55].map((w, i) => (
              w === 8
                ? <div key={i} className="w-2 h-2 rounded-full bg-gris-cl animate-pulse" />
                : <div key={i} className="h-3 rounded-sm bg-beige3 animate-pulse" style={{ width: w }} />
            ))}
          </div>
          <div className="h-9 w-52 rounded-sm bg-beige2 animate-pulse" />
          <div className="mt-6 h-1.5 w-full rounded-full bg-beige3 animate-pulse" />
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-[1440px] px-8 md:px-12 xl:px-16 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8">

          {/* Articles */}
          <div className="space-y-0">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex gap-5 py-6 border-b border-gris-cl/60">
                <div
                  className="size-[88px] shrink-0 rounded-sm bg-beige2 animate-pulse"
                  style={{ animationDelay: `${i * 80}ms` }}
                />
                <div className="flex-1 space-y-2.5">
                  <div className="h-2.5 w-24 rounded-sm bg-beige3 animate-pulse" />
                  <div className="h-4 w-3/4 rounded-sm bg-beige2 animate-pulse" />
                  <div className="h-3 w-1/3 rounded-sm bg-beige3 animate-pulse" />
                  <div className="mt-4 flex justify-between">
                    <div className="h-4 w-32 rounded-sm bg-beige2 animate-pulse" />
                    <div className="h-8 w-28 rounded-sm bg-beige3 animate-pulse" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="rounded-sm border border-gris-cl bg-blanc overflow-hidden">
            <div className="h-14 bg-beige3 animate-pulse" />
            <div className="p-5 space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex justify-between py-2 border-b border-gris-cl/50 last:border-0">
                  <div className="h-3.5 w-24 rounded-sm bg-beige3 animate-pulse" style={{ animationDelay: `${i * 60}ms` }} />
                  <div className="h-3.5 w-28 rounded-sm bg-beige2 animate-pulse" style={{ animationDelay: `${i * 60}ms` }} />
                </div>
              ))}
              <div className="h-12 w-full rounded-sm bg-beige2 animate-pulse mt-2" />
              <div className="h-12 w-full rounded-sm bg-beige3 animate-pulse" />
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}
