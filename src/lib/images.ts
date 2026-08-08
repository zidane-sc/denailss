import type { GalleryAspect } from "@/types";

const ASPECT_DIMENSIONS: Record<GalleryAspect, { width: number; height: number }> = {
  portrait: { width: 480, height: 620 },
  square: { width: 520, height: 520 },
  landscape: { width: 640, height: 440 },
  tall: { width: 440, height: 700 },
};

export function picsumUrl(seed: string, aspect: GalleryAspect = "square", scale = 1) {
  const { width, height } = ASPECT_DIMENSIONS[aspect];
  return `https://picsum.photos/seed/${encodeURIComponent(seed)}/${Math.round(
    width * scale
  )}/${Math.round(height * scale)}`;
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
