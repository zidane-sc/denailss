import { describe, expect, it } from "vitest";
import { calculateDeposit, checkPromotion } from "@/features/booking/logic/pricing";
import type { DepositConfig, Promotion } from "@/types";

const basePromotion: Promotion = {
  id: "promo-test",
  code: "TEST10",
  title: "Test",
  description: "",
  discountType: "percentage",
  discountValue: 10,
  startDate: "2026-01-01",
  endDate: "2026-12-31",
  usageLimit: 100,
  usedCount: 0,
  active: true,
};

const now = new Date("2026-06-15T10:00:00");

describe("checkPromotion", () => {
  it("applies a percentage discount", () => {
    const result = checkPromotion({ ...basePromotion }, { serviceSlugs: ["manicure"], subtotal: 200000, now });
    expect(result).toEqual({ valid: true, discount: 20000 });
  });

  it("applies a fixed discount", () => {
    const result = checkPromotion(
      { ...basePromotion, discountType: "fixed", discountValue: 25000 },
      { serviceSlugs: ["manicure"], subtotal: 200000, now }
    );
    expect(result).toEqual({ valid: true, discount: 25000 });
  });

  it("caps the discount at maximumDiscount", () => {
    const result = checkPromotion(
      { ...basePromotion, maximumDiscount: 15000 },
      { serviceSlugs: ["manicure"], subtotal: 200000, now }
    );
    expect(result).toEqual({ valid: true, discount: 15000 });
  });

  it("rejects an inactive promotion", () => {
    const result = checkPromotion({ ...basePromotion, active: false }, { serviceSlugs: ["manicure"], subtotal: 200000, now });
    expect(result.valid).toBe(false);
    expect(result.reason).toBe("Promo ini sudah tidak aktif.");
    expect(result.discount).toBe(0);
  });

  it("rejects a promotion outside its period", () => {
    const result = checkPromotion(
      { ...basePromotion, startDate: "2026-01-01", endDate: "2026-01-31" },
      { serviceSlugs: ["manicure"], subtotal: 200000, now }
    );
    expect(result.valid).toBe(false);
    expect(result.reason).toBe("Promo ini sudah tidak berlaku pada periode ini.");
  });

  it("rejects an exhausted quota", () => {
    const result = checkPromotion(
      { ...basePromotion, usageLimit: 5, usedCount: 5 },
      { serviceSlugs: ["manicure"], subtotal: 200000, now }
    );
    expect(result.valid).toBe(false);
    expect(result.reason).toBe("Kuota promo ini sudah habis digunakan.");
  });

  it("treats usageLimit 0 as unlimited (regression: was rejected before the fix)", () => {
    const result = checkPromotion(
      { ...basePromotion, usageLimit: 0, usedCount: 0 },
      { serviceSlugs: ["manicure"], subtotal: 200000, now }
    );
    expect(result.valid).toBe(true);
  });

  it("rejects when no applicable service is selected", () => {
    const result = checkPromotion(
      { ...basePromotion, applicableServiceSlugs: ["nail-art"] },
      { serviceSlugs: ["manicure"], subtotal: 200000, now }
    );
    expect(result.valid).toBe(false);
    expect(result.reason).toBe("Promo ini tidak berlaku untuk layanan yang kamu pilih.");
  });

  it("allows when an applicable service is selected", () => {
    const result = checkPromotion(
      { ...basePromotion, applicableServiceSlugs: ["nail-art", "manicure"] },
      { serviceSlugs: ["manicure"], subtotal: 200000, now }
    );
    expect(result.valid).toBe(true);
  });

  it("rejects when the minimum spend is not met", () => {
    const result = checkPromotion(
      { ...basePromotion, minimumSpend: 250000 },
      { serviceSlugs: ["manicure"], subtotal: 200000, now }
    );
    expect(result.valid).toBe(false);
    expect(result.reason).toContain("Minimal booking");
  });
});

describe("calculateDeposit", () => {
  const config: DepositConfig = {
    enabled: true,
    type: "percentage",
    value: 30,
    bankAccount: { bank: "BCA", accountNumber: "1", accountName: "a" },
    eWallet: { provider: "DANA", number: "2", accountName: "a" },
    paymentMethods: [],
    notes: "",
  };

  it("calculates a percentage deposit", () => {
    expect(calculateDeposit(200000, config)).toBe(60000);
  });

  it("calculates a fixed deposit", () => {
    expect(calculateDeposit(200000, { ...config, type: "fixed", value: 50000 })).toBe(50000);
  });

  it("returns 0 when deposits are disabled", () => {
    expect(calculateDeposit(200000, { ...config, enabled: false })).toBe(0);
  });
});
