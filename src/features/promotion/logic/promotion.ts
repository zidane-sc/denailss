import type { Promotion, PromotionStatus } from "@/types";

/**
 * Promotion admin logic — Epic 6. Pure helpers shared by the promotion
 * backoffice pages. The actual discount math stays in
 * `src/features/booking/logic/pricing.ts` (one source of truth, used by the
 * booking flow); this module only derives presentation facts about a promo.
 */

/**
 * Simulated "today" used across the mock phase (matches CRM_TODAY) so the
 * active/scheduled/expired statuses stay stable until a real backend exists.
 */
export const PROMO_TODAY = "2026-08-09";

function parseDateKey(dateKey: string) {
  const [year, month, day] = dateKey.split("-").map(Number);
  return new Date(year, month - 1, day);
}

/** Whole days between two YYYY-MM-DD keys (positive when later > earlier). */
export function promoDaysBetween(earlier: string, later: string) {
  return Math.round(
    (parseDateKey(later).getTime() - parseDateKey(earlier).getTime()) / 86_400_000
  );
}

/** Derive the admin status of a promotion from its fields + "today". */
export function getPromotionStatus(promotion: Promotion, today = PROMO_TODAY): PromotionStatus {
  if (!promotion.active) return "inactive";
  if (promotion.endDate < today) return "expired";
  if (promotion.startDate > today) return "scheduled";
  return "active";
}

/** Active period of a promo: "10 Agu – 31 Agu 2026" (single date when equal). */
export function promotionPeriodLabel(promotion: Promotion) {
  if (promotion.startDate === promotion.endDate) {
    return shortDateId(promotion.startDate);
  }
  return `${shortDateId(promotion.startDate)} – ${shortDateId(promotion.endDate)}`;
}

/** "20%", "Rp30.000", with the optional "Maks. Rp50.000" line for percentages. */
export function discountSummary(promotion: Promotion) {
  if (promotion.discountType === "percentage") {
    return {
      primary: `${promotion.discountValue}%`,
      secondary: promotion.maximumDiscount
        ? `Maks. ${formatRp(promotion.maximumDiscount)}`
        : undefined,
    };
  }
  return { primary: formatRp(promotion.discountValue), secondary: undefined };
}

/** "Rp50.000" without the currency prefix — for compact list cells. */
export function formatRp(amount: number) {
  return `Rp${Math.round(amount).toLocaleString("id-ID")}`;
}

/** Usage cell: "12 / 50 digunakan" or "12 digunakan" when unlimited. */
export function usageLabel(promotion: Promotion) {
  if (promotion.usageLimit <= 0) return `${promotion.usedCount} digunakan`;
  return `${promotion.usedCount} / ${promotion.usageLimit} digunakan`;
}

const SHORT_MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "Mei",
  "Jun",
  "Jul",
  "Agu",
  "Sep",
  "Okt",
  "Nov",
  "Des",
];

/** "2026-08-03" → "3 Agu 2026" — compact date for dense admin lists. */
export function shortDateId(dateKey: string) {
  if (!dateKey) return "";
  const [year, month, day] = dateKey.split("-").map(Number);
  return `${day} ${SHORT_MONTHS[month - 1]} ${year}`;
}

/** Generate a readable promo code from a title, e.g. "Weekend Nail Date" → "WEEKEND". */
export function generatePromoCode(title: string) {
  const words = title
    .trim()
    .toUpperCase()
    .split(/[^A-Z0-9]+/)
    .filter(Boolean);
  if (words.length === 0) return "";
  const base =
    words.length === 1
      ? words[0].slice(0, 8)
      : words
          .slice(0, 3)
          .map((w) => w[0])
          .join("");
  return base || "";
}
