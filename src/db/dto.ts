import type { GalleryDesign, Promotion, Review, Service } from "@/types";
import type { gallery, galleryImages, promotions, reviews, services } from "@/db/schema";

type GalleryRow = typeof gallery.$inferSelect;
type GalleryImageRow = typeof galleryImages.$inferSelect;
type ServiceRow = typeof services.$inferSelect;
type PromotionRow = typeof promotions.$inferSelect;
type ReviewRow = typeof reviews.$inferSelect;

/** Map a gallery row + its ordered images to the frontend `GalleryDesign`. */
export function rowToGalleryDesign(
  row: GalleryRow,
  images: GalleryImageRow[]
): GalleryDesign {
  const ordered = [...images].sort((a, b) => a.sortOrder - b.sortOrder);
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    description: row.description,
    imageSeeds: ordered.map((image) => image.storagePath),
    aspect: row.aspect as GalleryDesign["aspect"],
    style: row.style as GalleryDesign["style"],
    color: row.color as GalleryDesign["color"],
    occasion: row.occasion as GalleryDesign["occasion"],
    shape: row.shape as GalleryDesign["shape"],
    difficulty: row.difficulty as GalleryDesign["difficulty"],
    price: row.price,
  };
}

/** Gallery row values for insert/update (metadata only; images are separate rows). */
export function galleryDesignToRow(design: GalleryDesign) {
  return {
    id: design.id,
    slug: design.slug,
    title: design.title,
    description: design.description,
    aspect: design.aspect,
    style: design.style,
    color: design.color,
    occasion: design.occasion,
    shape: design.shape,
    difficulty: design.difficulty,
    price: design.price,
    updatedAt: new Date(),
  };
}

/** Map a services row to the frontend `Service` (JSONB columns decoded). */
export function rowToService(row: ServiceRow): Service {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    shortDescription: row.shortDescription,
    description: row.description,
    priceFrom: row.priceFrom,
    priceNote: row.priceNote ?? undefined,
    durationMinutes: row.durationMinutes,
    tiers: (row.tiers as Service["tiers"]) ?? [],
    requiresPickup: row.requiresPickup,
    heroImage: row.heroImage,
    gallerySeeds: (row.gallerySeeds as string[]) ?? [],
    faq: (row.faq as Service["faq"]) ?? [],
    depositApplicable: row.depositApplicable,
    active: row.active,
  };
}

/** Encoded service values for update (JSONB columns stringified by Drizzle). */
export function serviceToRow(service: Service) {
  return {
    name: service.name,
    shortDescription: service.shortDescription,
    description: service.description,
    priceFrom: service.priceFrom,
    priceNote: service.priceNote ?? null,
    durationMinutes: service.durationMinutes,
    tiers: service.tiers,
    requiresPickup: service.requiresPickup,
    heroImage: service.heroImage,
    gallerySeeds: service.gallerySeeds,
    faq: service.faq,
    depositApplicable: service.depositApplicable,
    active: service.active,
    updatedAt: new Date(),
  };
}

/** Map a promotions row to the frontend `Promotion` (JSONB + nullable → undefined). */
export function rowToPromotion(row: PromotionRow): Promotion {
  return {
    id: row.id,
    code: row.code,
    title: row.title,
    description: row.description,
    discountType: row.discountType as Promotion["discountType"],
    discountValue: row.discountValue,
    maximumDiscount: row.maximumDiscount ?? undefined,
    startDate: row.startDate,
    endDate: row.endDate,
    usageLimit: row.usageLimit,
    usedCount: row.usedCount,
    minimumSpend: row.minimumSpend ?? undefined,
    applicableServiceSlugs: (row.applicableServiceSlugs as string[]) ?? [],
    imageSeed: row.imageSeed ?? undefined,
    active: row.active,
  };
}

/** Encoded promotion values for insert/update (code normalized uppercase). */
export function promotionToRow(promotion: Promotion) {
  return {
    id: promotion.id,
    code: promotion.code.toUpperCase().trim(),
    title: promotion.title,
    description: promotion.description,
    discountType: promotion.discountType,
    discountValue: promotion.discountValue,
    maximumDiscount: promotion.maximumDiscount ?? null,
    startDate: promotion.startDate,
    endDate: promotion.endDate,
    usageLimit: promotion.usageLimit,
    usedCount: promotion.usedCount,
    minimumSpend: promotion.minimumSpend ?? null,
    applicableServiceSlugs: promotion.applicableServiceSlugs ?? [],
    imageSeed: promotion.imageSeed ?? null,
    active: promotion.active,
    updatedAt: new Date(),
  };
}

/** Map a reviews row to the frontend `Review` (customer name supplied by the caller). */
export function rowToReview(row: ReviewRow, customerName: string, visitDate: string, bookingCode?: string): Review {
  return {
    id: row.id,
    customerName,
    rating: row.rating as Review["rating"],
    serviceSlug: row.serviceSlug,
    visitDate,
    comment: row.comment,
    photoSeed: row.photoSeed ?? undefined,
    ...(bookingCode ? { bookingCode } : {}),
  };
}
