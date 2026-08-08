import type { Promotion } from "@/types";

export const PROMOTIONS: Promotion[] = [
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
    active: false,
  },
];

export function getActivePromotion(referenceDate: Date = new Date()) {
  return PROMOTIONS.find(
    (promo) =>
      promo.active &&
      new Date(promo.startDate) <= referenceDate &&
      referenceDate <= new Date(`${promo.endDate}T23:59:59`)
  );
}

export function findPromotionByCode(code: string) {
  return PROMOTIONS.find((promo) => promo.code.toLowerCase() === code.trim().toLowerCase());
}
