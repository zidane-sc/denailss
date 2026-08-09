import type { Promotion } from "@/types";

/**
 * Promotion seed data — the fallback list used before the owner makes their
 * first edit, and what server components render (SSR) for the detail page.
 *
 * These promotions are the same shape the booking flow validates against
 * (`checkPromotion` in `src/features/booking/logic/pricing.ts`).
 */
export const PROMOTION_SEEDS: Promotion[] = [
  {
    id: "promo-17an",
    code: "PROMO17",
    title: "Promo Kemerdekaan",
    description: "Diskon 17% untuk semua layanan Nail Art & Gel Extension sepanjang Agustus.",
    discountType: "percentage",
    discountValue: 17,
    startDate: "2026-08-01",
    endDate: "2026-08-31",
    usageLimit: 100,
    usedCount: 34,
    minimumSpend: 150000,
    applicableServiceSlugs: ["nail-art", "gel-extension"],
    maximumDiscount: 75000,
    imageSeed: "promo-17an-nailart",
    active: true,
  },
  {
    id: "promo-weekend",
    code: "WEEKEND20",
    title: "Weekend Nail Date",
    description: "Diskon 20% untuk semua layanan, khusus weekend sepanjang Agustus.",
    discountType: "percentage",
    discountValue: 20,
    startDate: "2026-08-10",
    endDate: "2026-08-31",
    usageLimit: 50,
    usedCount: 12,
    minimumSpend: 200000,
    maximumDiscount: 50000,
    active: true,
  },
  {
    id: "promo-newset",
    code: "NEWSET30",
    title: "Potongan Set Baru",
    description: "Potongan Rp30.000 untuk setiap set gel extension atau press-on baru.",
    discountType: "fixed",
    discountValue: 30000,
    startDate: "2026-08-15",
    endDate: "2026-09-30",
    usageLimit: 0,
    usedCount: 0,
    minimumSpend: 180000,
    applicableServiceSlugs: ["gel-extension", "fake-nail"],
    active: true,
  },
  {
    id: "promo-earlybird",
    code: "PAGI20",
    title: "Early Bird Pagi",
    description: "Diskon 20% untuk booking pertama di hari itu sebelum pukul 11.00.",
    discountType: "percentage",
    discountValue: 20,
    startDate: "2026-09-01",
    endDate: "2026-10-31",
    usageLimit: 30,
    usedCount: 0,
    maximumDiscount: 40000,
    active: true,
  },
  {
    id: "promo-haritani",
    code: "HARITANI",
    title: "Promo Hari Tani",
    description: "Diskon 25% untuk semua layanan, khusus tanggal 24 September.",
    discountType: "percentage",
    discountValue: 25,
    startDate: "2026-09-24",
    endDate: "2026-09-24",
    usageLimit: 100,
    usedCount: 0,
    maximumDiscount: 100000,
    active: true,
  },
  {
    id: "promo-mayday",
    code: "MAYDAY10",
    title: "Promo Hari Buruh",
    description: "Diskon 10% khusus periode Mei.",
    discountType: "percentage",
    discountValue: 10,
    startDate: "2026-05-01",
    endDate: "2026-05-31",
    usageLimit: 50,
    usedCount: 50,
    imageSeed: "promo-mayday-flowers",
    active: true,
  },
  {
    id: "promo-newclient",
    code: "NEWCLIENT",
    title: "Welcome, First-Timer!",
    description: "Potongan langsung Rp25.000 untuk booking pertamamu di Denailss.",
    discountType: "fixed",
    discountValue: 25000,
    startDate: "2026-07-01",
    endDate: "2026-09-30",
    usageLimit: 200,
    usedCount: 128,
    imageSeed: "promo-newclient-presson",
    active: true,
  },
];

/** Server-safe read of the seed (used by the detail page before hydration). */
export function getPromotionSeedById(id: string): Promotion | undefined {
  return PROMOTION_SEEDS.find((p) => p.id === id);
}
