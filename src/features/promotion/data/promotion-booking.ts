import type { Promotion } from "@/types";
import {
  getLivePromotions,
  subscribePromotions,
} from "./promotions.mock";

/**
 * Booking-flow promotion access — Epic 1.
 *
 * These helpers now delegate to the Epic 6 promotion admin store
 * (`promotions.mock.ts`, localStorage-backed) so a promo created in the
 * backoffice is immediately valid in the booking flow. Server components get
 * the seed; client components get the live persisted list.
 *
 * The discount math itself stays in `src/features/booking/logic/pricing.ts`
 * (`checkPromotion`) — one source of truth for how a promo behaves.
 */

export function getActivePromotions(referenceDate: Date = new Date()) {
  return getLivePromotions().filter(
    (promo) =>
      promo.active &&
      new Date(promo.startDate) <= referenceDate &&
      referenceDate <= new Date(`${promo.endDate}T23:59:59`)
  );
}

export function getActivePromotion(referenceDate: Date = new Date()) {
  return getActivePromotions(referenceDate)[0];
}

export function findPromotionByCode(code: string): Promotion | undefined {
  const normalized = code.trim().toLowerCase();
  return getLivePromotions().find((promo) => promo.code.toLowerCase() === normalized);
}

/** Subscribe to promotion changes (e.g. admin edits) from client components. */
export function subscribePromotionChanges(cb: () => void): () => void {
  return subscribePromotions(cb);
}
