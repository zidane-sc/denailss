import { useActivePromotions, useLivePromotions, usePromotionByCode } from "@/features/promotion/components/promotions-provider";
import type { Promotion } from "@/types";

/**
 * Booking-flow promotion access — Epic 1.
 *
 * Delegates to the DB-backed promotion catalog (`PromotionsProvider`), so a
 * promo created in the backoffice is immediately valid in the booking flow and
 * usage counts reflect real bookings. Client components only.
 */

/** Active promos for the landing banner (client components). */
export function useActivePromotionBanners(referenceDate: Date = new Date()) {
  return useActivePromotions(referenceDate);
}

/** Find a promo by code (case/trim-insensitive) for the booking promo step. */
export function useFindPromotionByCode(code: string | null): Promotion | undefined {
  return usePromotionByCode(code);
}

/** Full live promotion list (client components that need everything). */
export function useLivePromotionList() {
  return useLivePromotions();
}
