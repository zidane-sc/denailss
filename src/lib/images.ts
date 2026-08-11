import type { GalleryAspect } from "@/types";

/**
 * Real nail-art photos from the Denailss Instagram (@denailss_9),
 * downloaded into `public/images/instagram/`.
 *
 * The helper maps the semantic mock seeds (which previously produced
 * picsum.photos placeholders) to these local assets so every consumer
 * keeps working unchanged. Unknown seeds fall back to a branded default.
 */
const ASSET_ROOT = "/images/instagram/";

const SEED_MAP: Record<string, string> = {
  // Landing hero
  "denailss-hero-main": "glazed-french-ombre.jpg",
  "denailss-hero-detail": "yellow-french-flowers.jpg",
  "denailss-about-studio": "../dela-1.jpg",
  "denailss-contact-studio": "../dela-2.jpg",

  // Services
  "denailss-gel-extension-hero": "blue-chrome-pearl.jpg",
  "denailss-nailart-hero": "yellow-french-flowers.jpg",
  "denailss-fakenail-hero": "burgundy-stars-dots.jpg",
  "denailss-manicure-hero": "glazed-french-ombre.jpg",
  "denailss-pedicure-hero": "grey-pink-chrome-stars.jpg",
  "denailss-removal-hero": "grey-ombre-cross.jpg",
  "denailss-gel-1": "blue-chrome-pearl.jpg",
  "denailss-gel-2": "grey-ombre-cross.jpg",
  "denailss-gel-3": "glazed-french-ombre.jpg",
  "denailss-gel-4": "grid-9.jpg",
  "denailss-nailart-1": "yellow-french-flowers.jpg",
  "denailss-nailart-2": "grid-1.jpg",
  "denailss-nailart-3": "grid-3.jpg",
  "denailss-nailart-4": "grid-10.jpg",
  "denailss-fakenail-1": "burgundy-stars-dots.jpg",
  "denailss-fakenail-2": "grid-12.jpg",
  "denailss-fakenail-3": "grid-7.jpg",
  "denailss-manicure-1": "glazed-french-ombre.jpg",
  "denailss-manicure-2": "grid-4.jpg",
  "denailss-manicure-3": "grid-2.jpg",
  "denailss-pedicure-1": "grey-pink-chrome-stars.jpg",
  "denailss-pedicure-2": "grid-6.jpg",
  "denailss-removal-1": "grey-ombre-cross.jpg",
  "denailss-removal-2": "grid-5.jpg",

  // Gallery designs
  "den-milk-1": "glazed-french-ombre.jpg",
  "den-milk-2": "grid-1.jpg",
  "den-french-1": "yellow-french-flowers.jpg",
  "den-french-2": "grid-4.jpg",
  "den-chrome-1": "blue-chrome-pearl.jpg",
  "den-ombre-1": "grey-ombre-cross.jpg",
  "den-ombre-2": "grid-6.jpg",
  "den-bow-1": "yellow-french-flowers.jpg",
  "den-bow-2": "grid-10.jpg",
  "den-line-1": "grey-pink-chrome-stars.jpg",
  "den-wedding-1": "glazed-french-ombre.jpg",
  "den-wedding-2": "grid-9.jpg",
  "den-gold-1": "burgundy-stars-dots.jpg",
  "den-red-1": "burgundy-stars-dots.jpg",
  "den-red-2": "grid-12.jpg",
  "den-cloud-1": "grid-1.jpg",
  "den-grad-1": "grid-2.jpg",
  "den-grad-2": "grid-3.jpg",
  "den-black-1": "grid-11.jpg",
  "den-milkyfrench-1": "glazed-french-ombre.jpg",
  "den-milkyfrench-2": "grid-4.jpg",
  "den-festive-1": "grid-8.jpg",
  "den-skyblue-1": "blue-chrome-pearl.jpg",
  "den-skyblue-2": "grid-6.jpg",
  "den-mattenude-1": "grey-pink-chrome-stars.jpg",
  "den-fuchsia-1": "grid-10.jpg",
  "den-fuchsia-2": "grid-7.jpg",
  "den-lace-1": "grid-9.jpg",
  "den-jelly-1": "grid-1.jpg",
  "den-jelly-2": "grid-2.jpg",
  "den-navy-1": "grid-11.jpg",

  // Reviews (avatars)
  "review-aulia": "grid-1.jpg",
  "review-salsa": "grid-2.jpg",
  "review-farah": "grid-3.jpg",
  "review-michelle": "grid-4.jpg",

  // Deposit proof placeholders
  proof1: "../bukti-transfer-dummy.jpg",
  proof2: "../bukti-transfer-dummy.jpg",
  proof3: "../bukti-transfer-dummy.jpg",
  proof13: "../bukti-transfer-dummy.jpg",
  "transfer-proof": "../bukti-transfer-dummy.jpg",
  newproof: "../bukti-transfer-dummy.jpg",

  // Photo carousel fallback
  "denailss-fallback": "glazed-french-ombre.jpg",
};

export function imageUrl(seed: string) {
  if (seed.startsWith("storage:")) {
    const [bucket, ...pathParts] = seed.slice("storage:".length).split("/");
    return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${bucket}/${pathParts.join("/")}`;
  }
  // Legacy uploaded files remain supported during migration.
  if (seed.startsWith("upload:")) {
    return seed.replace(/^upload:/, "/images/uploads/");
  }
  const file = SEED_MAP[seed] ?? "glazed-french-ombre.jpg";
  if (file.startsWith("../")) {
    return `/images/${file.substring(3)}`;
  }
  return `${ASSET_ROOT}${file}`;
}

export function aspectRatioClass(aspect: GalleryAspect) {
  switch (aspect) {
    case "portrait":
      return "aspect-[4/5]";
    case "tall":
      return "aspect-[3/4.6]";
    case "landscape":
      return "aspect-[16/11]";
    default:
      return "aspect-square";
  }
}
