/**
 * browser — Singleton Playwright Chromium pour le scraping server-side
 *
 * ⚠️  Fichier SERVER-ONLY — ne jamais importer côté client.
 *
 * Pattern : on réutilise le même browser process entre les requêtes
 * pour éviter de relancer Chromium à chaque appel API.
 * Le browser est fermé automatiquement après 10 min d'inactivité.
 */

import { chromium, type Browser, type BrowserContext, type Page } from 'playwright';

// ─── Singleton ────────────────────────────────────────────────────────────────

let _browser:     Browser | null    = null;
let _lastUsed:    number            = 0;
let _idleTimer:   ReturnType<typeof setTimeout> | null = null;

const IDLE_TIMEOUT_MS = 10 * 60 * 1000; // 10 minutes

async function getBrowser(): Promise<Browser> {
  if (_browser && _browser.isConnected()) {
    refreshIdleTimer();
    return _browser;
  }

  console.log('[scraping/browser] Lancement de Chromium…');
  _browser = await chromium.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--no-first-run',
      '--no-zygote',
      '--disable-gpu',
      '--disable-blink-features=AutomationControlled',
    ],
  });

  refreshIdleTimer();
  return _browser;
}

function refreshIdleTimer() {
  if (_idleTimer) clearTimeout(_idleTimer);
  _lastUsed = Date.now();
  _idleTimer = setTimeout(async () => {
    if (_browser) {
      console.log('[scraping/browser] Fermeture Chromium (inactivité 10 min)');
      await _browser.close().catch(() => {});
      _browser = null;
    }
  }, IDLE_TIMEOUT_MS);
}

// ─── User-agent pool ──────────────────────────────────────────────────────────

const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
];

function randomUserAgent(): string {
  return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
}

// ─── withPage ─────────────────────────────────────────────────────────────────

/**
 * Helper pour obtenir une page Playwright isolée (contexte incognito),
 * l'utiliser et la fermer proprement.
 */
export async function withPage<T>(
  fn: (page: Page) => Promise<T>,
  options?: { timeout?: number },
): Promise<T> {
  const browser = await getBrowser();
  const timeout = options?.timeout ?? 30_000;

  const context: BrowserContext = await browser.newContext({
    userAgent: randomUserAgent(),
    viewport:  { width: 1440, height: 900 },
    locale:    'fr-FR',
    extraHTTPHeaders: {
      'Accept-Language': 'fr-FR,fr;q=0.9,en;q=0.8',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
    },
    ignoreHTTPSErrors: true,
  });

  const page = await context.newPage();
  page.setDefaultTimeout(timeout);
  page.setDefaultNavigationTimeout(timeout);

  // Bloquer les ressources inutiles pour accélérer le scraping
  await page.route('**/*', (route) => {
    const type = route.request().resourceType();
    if (['font', 'media', 'websocket', 'manifest'].includes(type)) {
      route.abort();
    } else {
      route.continue();
    }
  });

  try {
    return await fn(page);
  } finally {
    await page.close().catch(() => {});
    await context.close().catch(() => {});
  }
}

// ─── withPageRetry ────────────────────────────────────────────────────────────

/**
 * Variante avec retry automatique (3 tentatives max).
 */
export async function withPageRetry<T>(
  fn: (page: Page) => Promise<T>,
  options?: { timeout?: number; retries?: number },
): Promise<T> {
  const retries = options?.retries ?? 3;
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await withPage(fn, options);
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      console.warn(`[scraping/browser] Tentative ${attempt}/${retries} échouée :`, lastError.message);
      if (attempt < retries) {
        await new Promise((r) => setTimeout(r, attempt * 1_500));
      }
    }
  }

  throw lastError ?? new Error('Scraping failed after retries');
}
