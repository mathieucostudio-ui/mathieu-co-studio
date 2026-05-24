/**
 * loading.tsx — Skeleton checkout
 * Affiché pendant le chargement de la page (avant hydration).
 */

export default function CheckoutLoading() {
  return (
    <div className="min-h-[100dvh] bg-beige" aria-busy="true" aria-label="Chargement du paiement…">

      {/* Stepper */}
      <div className="bg-blanc border-b border-gris-cl py-5">
        <div className="mx-auto max-w-[1440px] px-8 md:px-12 xl:px-16">
          <div className="flex items-center justify-center gap-0">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center">
                <div className="flex flex-col items-center gap-2 min-w-[72px]">
                  <div className="size-9 rounded-full bg-beige3 animate-pulse"
                    style={{ animationDelay: `${i * 80}ms` }} />
                  <div className="h-2 w-16 rounded-sm bg-beige3 animate-pulse hidden sm:block"
                    style={{ animationDelay: `${i * 80}ms` }} />
                </div>
                {i < 4 && (
                  <div className="mb-5 h-[2px] w-24 md:w-32 xl:w-40 bg-beige3 animate-pulse rounded-full" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-[1440px] px-8 md:px-12 xl:px-16 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] xl:grid-cols-[1fr_420px] gap-8 xl:gap-12">

          {/* Left */}
          <div className="space-y-5">
            <div className="h-9 w-48 rounded-sm bg-beige2 animate-pulse" />

            {/* Shipping info card */}
            <div className="h-20 rounded-sm border border-gris-cl bg-blanc animate-pulse" />

            {/* Tabs */}
            <div className="space-y-2">
              <div className="h-3 w-36 rounded-sm bg-beige3 animate-pulse" />
              <div className="grid grid-cols-4 gap-2">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-16 rounded-sm bg-beige2 animate-pulse"
                    style={{ animationDelay: `${i * 60}ms` }} />
                ))}
              </div>
              <div className="h-64 rounded-sm border border-gris-cl bg-blanc animate-pulse" />
            </div>

            {/* CTA */}
            <div className="h-24 rounded-sm border border-gris-cl bg-blanc animate-pulse" />
          </div>

          {/* Right */}
          <div className="rounded-sm border border-gris-cl bg-blanc overflow-hidden">
            <div className="h-14 bg-beige3 animate-pulse" />
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex gap-3 px-5 py-3.5 border-b border-gris-cl/50">
                <div className="size-14 rounded-sm bg-beige2 animate-pulse shrink-0"
                  style={{ animationDelay: `${i * 80}ms` }} />
                <div className="flex-1 space-y-2">
                  <div className="h-3 w-3/4 rounded-sm bg-beige3 animate-pulse" />
                  <div className="h-3 w-1/2 rounded-sm bg-beige2 animate-pulse" />
                </div>
              </div>
            ))}
            <div className="p-5 space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex justify-between">
                  <div className="h-3 w-20 rounded-sm bg-beige3 animate-pulse" style={{ animationDelay: `${i * 60}ms` }} />
                  <div className="h-3 w-24 rounded-sm bg-beige2 animate-pulse" style={{ animationDelay: `${i * 60}ms` }} />
                </div>
              ))}
              <div className="h-px bg-gris-cl/50 my-2" />
              <div className="flex justify-between">
                <div className="h-4 w-16 rounded-sm bg-beige2 animate-pulse" />
                <div className="h-6 w-32 rounded-sm bg-beige3 animate-pulse" />
              </div>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}
