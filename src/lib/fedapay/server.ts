/**
 * FedaPay server-side configuration
 *
 * FedaPay uses static singleton classes — setApiKey / setEnvironment must be
 * called before any API operation. Call initFedaPay() at the start of every
 * Route Handler that uses the SDK.
 *
 * Mobile-money modes for Benin:
 *   'mtn-benin'  → MTN Mobile Money
 *   'moov-benin' → Moov Money
 *   'wave-benin' → Wave (if available on FedaPay for BJ)
 */

import { FedaPay, Transaction, Customer, Webhook } from 'fedapay';

export { FedaPay, Transaction, Customer, Webhook };

/** Operator slug → FedaPay mode string */
export const FEDAPAY_MODES: Record<'mtn' | 'moov' | 'wave', string> = {
  mtn:  'mtn-benin',
  moov: 'moov-benin',
  wave: 'wave-benin',
};

/** FedaPay transaction status values */
export type FedaPayStatus =
  | 'pending'
  | 'approved'
  | 'declined'
  | 'cancelled'
  | 'refunded'
  | 'partially_refunded';

/**
 * Configure the FedaPay SDK singleton.
 * Must be called at the top of every Route Handler.
 */
export function initFedaPay(): void {
  FedaPay.setApiKey(process.env.FEDAPAY_SECRET_KEY!);
  FedaPay.setEnvironment(
    process.env.NODE_ENV === 'production' ? 'live' : 'sandbox',
  );
}
