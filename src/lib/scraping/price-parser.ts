/**
 * price-parser — Parsing et conversion de prix vers XOF (FCFA)
 *
 * Taux de change approximatifs (Mai 2026)
 * Sources : BCEAO, BNB, estimations marché
 */

// ─── Taux de change vers XOF ─────────────────────────────────────────────────

const RATES_TO_XOF: Record<string, number> = {
  XOF:  1,
  FCFA: 1,
  CFA:  1,
  EUR:  655.957,   // Taux fixe zone franc CFA
  USD:  605,
  GBP:  770,
  CHF:  665,
  CAD:  445,
  AUD:  390,
  JPY:  4.15,
  CNY:  83,
  HKD:  77,
  SGD:  450,
  AED:  165,
  SAR:  161,
  QAR:  166,
  KWD:  1_970,
  MAD:  61,         // Dirham marocain
  DZD:  4.45,       // Dinar algérien
  TND:  190,        // Dinar tunisien
  EGP:  12.5,       // Livre égyptienne
  NGN:  0.38,       // Naira nigérian
  GHS:  38,         // Cedi ghanéen
  KES:  4.65,       // Shilling kényan
  TZS:  0.23,       // Shilling tanzanien
  ZAR:  33,         // Rand sud-africain
};

// ─── Symboles de devises ──────────────────────────────────────────────────────

const SYMBOL_MAP: Record<string, string> = {
  '$':    'USD',
  '€':    'EUR',
  '£':    'GBP',
  '¥':    'CNY',
  '₦':    'NGN',
  'GH₵':  'GHS',
  'KSh':  'KES',
  'R':    'ZAR',
  'MAD':  'MAD',
  'DZD':  'DZD',
  'EGP':  'EGP',
  'AED':  'AED',
  'SAR':  'SAR',
  'CNY':  'CNY',
  'RMB':  'CNY',
  'USD':  'USD',
  'EUR':  'EUR',
  'GBP':  'GBP',
  'XOF':  'XOF',
  'FCFA': 'XOF',
  'CFA':  'XOF',
};

// ─── Fonctions ────────────────────────────────────────────────────────────────

/**
 * Extrait un montant numérique depuis une chaîne de texte.
 * Gère les formats : "1,234.56", "1.234,56", "12 345", "12345"
 */
export function extractAmount(raw: string): number | null {
  // Supprimer les espaces insécables et espaces
  const cleaned = raw.replace(/\s+/g, '').replace(/ /g, '');

  // Format "1.234,56" (notation européenne)
  const euMatch = cleaned.match(/^[\D]*(\d{1,3}(?:\.\d{3})*(?:,\d{1,2})?)[\D]*$/);
  if (euMatch) {
    const n = parseFloat(euMatch[1].replace(/\./g, '').replace(',', '.'));
    if (!isNaN(n)) return n;
  }

  // Format "1,234.56" (notation US)
  const usMatch = cleaned.match(/^[\D]*(\d{1,3}(?:,\d{3})*(?:\.\d{1,2})?)[\D]*$/);
  if (usMatch) {
    const n = parseFloat(usMatch[1].replace(/,/g, ''));
    if (!isNaN(n)) return n;
  }

  // Extraction directe d'un nombre
  const direct = cleaned.match(/(\d+(?:[.,]\d+)?)/);
  if (direct) {
    const n = parseFloat(direct[1].replace(',', '.'));
    if (!isNaN(n)) return n;
  }

  return null;
}

/**
 * Détecte la devise depuis une chaîne de prix.
 */
export function detectCurrency(raw: string): string {
  const upper = raw.toUpperCase().trim();

  // Chercher les codes ISO 4217 en premier
  for (const [code] of Object.entries(RATES_TO_XOF)) {
    if (upper.includes(code)) return code;
  }

  // Chercher les symboles
  for (const [symbol, code] of Object.entries(SYMBOL_MAP)) {
    if (raw.includes(symbol)) return code;
  }

  return 'USD'; // Défaut : Alibaba/AliExpress sont majoritairement en USD
}

/**
 * Convertit un montant en XOF.
 * Retourne null si la devise est inconnue.
 */
export function toXOF(amount: number, devise: string): number | null {
  const rate = RATES_TO_XOF[devise.toUpperCase()];
  if (!rate) return null;
  return Math.round(amount * rate);
}

/**
 * Parse une chaîne de prix et retourne { montant, devise, xof }.
 * Exemple : parsePrice("$45.99") → { montant: 45.99, devise: 'USD', xof: 27824 }
 */
export function parsePrice(raw: string): {
  montant:  number;
  devise:   string;
  xof:      number;
} | null {
  const amount = extractAmount(raw);
  if (!amount) return null;

  const devise = detectCurrency(raw);
  const xof    = toXOF(amount, devise);
  if (!xof) return null;

  return { montant: amount, devise, xof };
}

/**
 * Formatte un montant XOF pour l'affichage.
 * Exemple : formatXOF(27500) → "27 500 FCFA"
 */
export function formatXOF(amount: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'XOF',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}
