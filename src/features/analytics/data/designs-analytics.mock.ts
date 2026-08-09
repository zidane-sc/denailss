import type { GalleryDesign } from "@/types";
import { GALLERY_DESIGNS } from "@/features/gallery/data/designs.mock";

/**
 * Analytics design source — Epic 8.
 *
 * Popular designs resolve designSlug → title + thumbnail through the shared
 * gallery seed (Epic 5). Owner-uploaded designs are not eligible for the
 * popularity ranking because the historical appointment mock predates them;
 * analytics only counts designs it can actually show. Swap for the live
 * catalog repository later without touching components.
 */
const DESIGN_BY_SLUG = new Map<string, GalleryDesign>(
  GALLERY_DESIGNS.map((d) => [d.slug, d])
);

/** Resolve a design slug to the shared gallery seed entry, if it exists. */
export function getAnalyticsDesignBySlug(slug: string): GalleryDesign | undefined {
  return DESIGN_BY_SLUG.get(slug);
}
