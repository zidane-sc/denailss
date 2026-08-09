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
