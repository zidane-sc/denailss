import "server-only";
import { SITE } from "@/constants/site";
import { getSettings } from "./settings-service";
import type { Settings } from "../types";

/**
 * Public settings read for server components / metadata / SSG.
 *
 * Returns the persisted `settings` row when available, otherwise a default
 * derived from the single-source business constants (`@/constants/site`), so
 * the public site never breaks when the DB is unreachable at build time.
 */
export async function getPublicSettings(): Promise<Settings> {
  try {
    const persisted = await getSettings();
    if (persisted) return persisted;
  } catch {
    // fall through to the constants default
  }
  return {
    businessProfile: {
      name: SITE.name,
      logo: null,
      description: SITE.description,
      address: SITE.address,
    },
    socialMedia: {
      instagram: SITE.instagramHandle,
      tiktok: SITE.tiktokHandle,
      whatsapp: SITE.whatsappNumber,
    },
    policies: {
      cancellation: "",
      deposit: "",
    },
  };
}
