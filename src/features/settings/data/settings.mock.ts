import { SITE } from "@/constants/site";
import { DEPOSIT_CONFIG } from "@/features/booking/data/deposit-config.mock";
import type { Settings } from "../types";

/**
 * Settings mock store — Epic 9 mock-first seam, standing in for the future
 * `settings` repository (TRD §4). Business profile + social media seed from the
 * single-source business constants (`@/constants/site`) and the booking
 * deposit config, so there are no duplicate hardcoded values. Swap this module
 * for a real repository/API later without touching the UI.
 *
 * State persists to localStorage (`denailss.settings`) so the owner's edits
 * survive refresh; the seed below is the fallback until the first save.
 */

const STORAGE_KEY = "denailss.settings";

export const SETTINGS_SEED: Settings = {
  businessProfile: {
    name: SITE.name,
    logo: null,
    description:
      "Nail art rumahan untuk kamu yang suka detail kecil yang bikin penampilan terasa lebih spesial.",
    address: SITE.address,
  },
  socialMedia: {
    instagram: SITE.instagramHandle,
    tiktok: SITE.tiktokHandle,
    whatsapp: SITE.whatsappNumber,
  },
  policies: {
    cancellation:
      "Pembatalan atau reschedule kurang dari 24 jam sebelum jadwal dikenakan ketentuan pembatalan. Kabari lewat WhatsApp secepatnya supaya slot bisa dipakai customer lain.",
    deposit: DEPOSIT_CONFIG.notes,
  },
};

let cached: Settings | null = null;

function load(): Settings {
  if (cached) return cached;
  if (typeof window !== "undefined") {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Settings;
        if (parsed && parsed.businessProfile && parsed.socialMedia && parsed.policies) {
          cached = parsed;
          return cached;
        }
      }
    } catch {
      // corrupted storage — fall through to seed
    }
  }
  cached = SETTINGS_SEED;
  return cached;
}

/** SSR-safe reactive read. Server components get the seed; client gets the persisted value. */
export function getLiveSettings(): Settings {
  if (typeof window !== "undefined") return load();
  return SETTINGS_SEED;
}

/** Persist settings edits. FE-only: no backend, localStorage is the mock seam. */
export function saveSettings(settings: Settings) {
  cached = settings;
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch {
      // storage unavailable (private mode etc.) — keep in-memory state
    }
  }
}
