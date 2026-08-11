import "server-only";
import { eq } from "drizzle-orm";
import { getDb } from "@/db/client";
import { settings } from "@/db/schema";
import { ApiError } from "@/lib/api/errors";
import { removeStorageReference } from "@/lib/storage";
import type { Settings } from "../types";
import type { UpdateSettingsInput } from "../schemas/api";

const SETTINGS_ID = "site";

function rowToSettings(row: typeof settings.$inferSelect): Settings {
  return {
    businessProfile: {
      name: row.businessName,
      logo: row.logo ?? null,
      description: row.description,
      address: row.address,
    },
    socialMedia: {
      instagram: row.instagram,
      tiktok: row.tiktok,
      whatsapp: row.whatsapp,
    },
    policies: {
      cancellation: row.cancellationPolicy,
      deposit: row.depositPolicy,
    },
    seo: {
      metaTitle: row.metaTitle,
      metaDescription: row.metaDescription,
      ogImage: row.ogImage ?? null,
    },
  };
}

export async function getSettings(): Promise<Settings | null> {
  const [row] = await getDb().select().from(settings).where(eq(settings.id, SETTINGS_ID));
  return row ? rowToSettings(row) : null;
}

export async function updateSettings(input: UpdateSettingsInput): Promise<Settings> {
  const db = getDb();
  const [current] = await db.select().from(settings).where(eq(settings.id, SETTINGS_ID));
  if (!current) throw new ApiError("NOT_FOUND", "Pengaturan tidak ditemukan.", 404);

  const row = {
    businessName: input.businessProfile.name,
    logo: input.businessProfile.logo ?? null,
    description: input.businessProfile.description,
    address: input.businessProfile.address,
    instagram: input.socialMedia.instagram,
    tiktok: input.socialMedia.tiktok,
    whatsapp: input.socialMedia.whatsapp,
    cancellationPolicy: input.policies.cancellation,
    depositPolicy: input.policies.deposit,
    metaTitle: input.seo.metaTitle,
    metaDescription: input.seo.metaDescription,
    ogImage: input.seo.ogImage ?? null,
    updatedAt: new Date(),
  };

  await db.update(settings).set(row).where(eq(settings.id, SETTINGS_ID));

  // Best-effort cleanup of a replaced logo that is no longer referenced.
  if (current.logo && current.logo !== row.logo) {
    await removeStorageReference(current.logo).catch(() => {});
  }

  return rowToSettings({ ...current, ...row });
}
