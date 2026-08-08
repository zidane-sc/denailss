import type { DepositConfig, Promotion } from "@/types";

export interface PromotionCheckResult {
  valid: boolean;
  reason?: string;
  discount: number;
}

export function checkPromotion(
  promotion: Promotion,
  params: { serviceSlugs: string[]; subtotal: number; now?: Date }
): PromotionCheckResult {
  const now = params.now ?? new Date();

  if (!promotion.active) {
    return { valid: false, reason: "Promo ini sudah tidak aktif.", discount: 0 };
  }
  if (now < new Date(promotion.startDate) || now > new Date(`${promotion.endDate}T23:59:59`)) {
    return { valid: false, reason: "Promo ini sudah tidak berlaku pada periode ini.", discount: 0 };
  }
  if (promotion.usedCount >= promotion.usageLimit) {
    return { valid: false, reason: "Kuota promo ini sudah habis digunakan.", discount: 0 };
  }
  if (
    promotion.applicableServiceSlugs &&
    !promotion.applicableServiceSlugs.some((slug) => params.serviceSlugs.includes(slug))
  ) {
    return {
      valid: false,
      reason: "Promo ini tidak berlaku untuk layanan yang kamu pilih.",
      discount: 0,
    };
  }
  if (promotion.minimumSpend && params.subtotal < promotion.minimumSpend) {
    return {
      valid: false,
      reason: `Minimal booking Rp${promotion.minimumSpend.toLocaleString("id-ID")} untuk pakai promo ini.`,
      discount: 0,
    };
  }

  const rawDiscount =
    promotion.discountType === "percentage"
      ? Math.round((params.subtotal * promotion.discountValue) / 100)
      : promotion.discountValue;

  const discount = promotion.maximumDiscount
    ? Math.min(rawDiscount, promotion.maximumDiscount)
    : rawDiscount;

  return { valid: true, discount };
}

export function calculateDeposit(totalAfterDiscount: number, config: DepositConfig) {
  if (!config.enabled) return 0;
  if (config.type === "fixed") return config.value;
  return Math.round((totalAfterDiscount * config.value) / 100);
}
