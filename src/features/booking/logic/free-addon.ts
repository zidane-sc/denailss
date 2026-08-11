import type { BodyPart, Service } from "@/types";

/** The nail-art service slug that triggers free add-on bundling. */
export const NAIL_ART_SLUG = "nail-art";

/** Which free service is bundled with a body part. */
export const FREE_ADDON_BY_BODY_PART: Record<BodyPart, { slug: string; name: string }> = {
  hand: { slug: "manicure", name: "Manicure" },
  foot: { slug: "pedicure", name: "Pedicure" },
};

export interface FreeAddOn {
  slug: string;
  name: string;
  bodyPart: BodyPart;
}

/**
 * Resolve the free add-on bundled with a service. Nail art on hands gets a
 * free manicure; nail art on feet gets a free pedicure. Any other service
 * (or nail art without a chosen body part) has no add-on.
 *
 * The add-on is always free (Rp0); its duration is resolved from the catalog
 * service by slug at booking time, not here.
 */
export function freeAddonForService(service: Service): FreeAddOn | null {
  if (service.slug !== NAIL_ART_SLUG) return null;
  const part = service.bodyPart;
  if (!part) return null;
  return {
    ...FREE_ADDON_BY_BODY_PART[part],
    bodyPart: part,
  };
}
