import type { SettingsDraft } from "../types";

/**
 * Settings normalization helpers — pure functions used before persisting.
 */

export function normalizeInstagram(input: string): string {
  return input.trim().replace(/^@/, "").replace(/\/+$/, "");
}

export function normalizeTiktok(input: string): string {
  return input.trim().replace(/^@/, "").replace(/\/+$/, "");
}

/** Normalize social fields back into the stored form (username, no @ or URL). */
export function normalizeSocialMedia(draft: SettingsDraft): SettingsDraft {
  return {
    ...draft,
    socialMedia: {
      instagram: normalizeInstagram(draft.socialMedia.instagram),
      tiktok: normalizeTiktok(draft.socialMedia.tiktok),
      whatsapp: draft.socialMedia.whatsapp.trim().replace(/[^\d+]/g, ""),
    },
  };
}
