import type {
  DesignColor,
  DesignDifficulty,
  DesignOccasion,
  DesignShape,
  DesignStyle,
} from "@/types";

export const STYLE_LABELS: Record<DesignStyle, string> = {
  minimalist: "Minimalis",
  korean: "Korean",
  french: "French",
  chrome: "Chrome",
  ombre: "Ombre",
  "3d-art": "3D Art",
};

export const DIFFICULTY_LABELS: Record<DesignDifficulty, string> = {
  easy: "Mudah",
  medium: "Sedang",
  complex: "Rumit",
  "very-complex": "Sangat Rumit",
};

/** Studio-set price per difficulty tier (per set, 10 jari) — see Ever Nails price list tiers. */
export const DIFFICULTY_PRICES: Record<DesignDifficulty, number> = {
  easy: 100000,
  medium: 140000,
  complex: 190000,
  "very-complex": 240000,
};

export const COLOR_LABELS: Record<DesignColor, string> = {
  nude: "Nude",
  pink: "Pink",
  red: "Merah",
  white: "Putih",
  black: "Hitam",
  pastel: "Pastel",
  gold: "Gold",
};

export const OCCASION_LABELS: Record<DesignOccasion, string> = {
  daily: "Harian",
  wedding: "Wedding",
  party: "Party",
  festive: "Festive",
  graduation: "Wisuda",
};

export const SHAPE_LABELS: Record<DesignShape, string> = {
  almond: "Almond",
  square: "Square",
  coffin: "Coffin",
  round: "Round",
  stiletto: "Stiletto",
};

export const GALLERY_PAGE_SIZE = 8;
export const PRICE_RANGE_BOUNDS: [number, number] = [100000, 250000];
