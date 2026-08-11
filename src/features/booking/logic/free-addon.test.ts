import { describe, expect, it } from "vitest";
import { freeAddonForService } from "@/features/booking/logic/free-addon";
import type { Service } from "@/types";

const baseService: Service = {
  id: "svc-test",
  slug: "test",
  name: "Test",
  shortDescription: "",
  description: "",
  priceFrom: 100000,
  durationMinutes: 60,
  tiers: [],
  requiresPickup: false,
  heroImage: "seed",
  gallerySeeds: [],
  faq: [],
  depositApplicable: false,
  active: true,
};

describe("freeAddonForService", () => {
  it("bundles a free manicure for nail art on hands", () => {
    const result = freeAddonForService({ ...baseService, slug: "nail-art", bodyPart: "hand" });
    expect(result).toEqual({ slug: "manicure", name: "Manicure", bodyPart: "hand" });
  });

  it("bundles a free pedicure for nail art on feet", () => {
    const result = freeAddonForService({ ...baseService, slug: "nail-art", bodyPart: "foot" });
    expect(result).toEqual({ slug: "pedicure", name: "Pedicure", bodyPart: "foot" });
  });

  it("returns null for non-nail-art services", () => {
    expect(freeAddonForService(baseService)).toBeNull();
    expect(freeAddonForService({ ...baseService, bodyPart: "hand" })).toBeNull();
  });

  it("returns null for nail art without a chosen body part", () => {
    expect(freeAddonForService({ ...baseService, slug: "nail-art" })).toBeNull();
  });
});
