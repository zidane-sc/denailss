import type { SettingsDraft } from "../types";

/**
 * Settings validation — pure manual checks with Indonesian messages, matching
 * the promotion/expense form conventions. Business name is required; social
 * media values are validated lightly (plausible, not strict) so the owner does
 * not have to fight the form; policies are optional free text.
 */

export type SettingsErrors = {
  name?: string;
  instagram?: string;
  tiktok?: string;
  whatsapp?: string;
  latitude?: string;
  longitude?: string;
};

export function validateSettings(draft: SettingsDraft): SettingsErrors {
  const errors: SettingsErrors = {};

  if (!draft.businessProfile.name.trim()) {
    errors.name = "Nama bisnis wajib diisi.";
  }

  const { latitude, longitude } = draft.businessProfile;
  if (latitude !== null && (Number.isNaN(latitude) || latitude < -90 || latitude > 90)) {
    errors.latitude = "Latitude antara -90 dan 90.";
  }
  if (longitude !== null && (Number.isNaN(longitude) || longitude < -180 || longitude > 180)) {
    errors.longitude = "Longitude antara -180 dan 180.";
  }

  const instagram = draft.socialMedia.instagram.trim().replace(/^@/, "").replace(/\/+$/, "");
  if (instagram && !/^[a-zA-Z0-9._]{1,30}$/.test(instagram)) {
    errors.instagram = "Gunakan username Instagram tanpa spasi (contoh: denailss_9).";
  }

  const tiktok = draft.socialMedia.tiktok.trim().replace(/^@/, "").replace(/\/+$/, "");
  if (tiktok && !/^[a-zA-Z0-9._]{1,24}$/.test(tiktok)) {
    errors.tiktok = "Gunakan username TikTok tanpa spasi (contoh: denails10).";
  }

  const whatsapp = draft.socialMedia.whatsapp.trim();
  if (whatsapp) {
    const digits = whatsapp.replace(/[^\d]/g, "");
    if (!/^(?:\+?62|0)?8\d{7,12}$/.test(digits) || digits.length < 9 || digits.length > 15) {
      errors.whatsapp = "Nomor WhatsApp tidak valid, contoh: 081234567890.";
    }
  }

  return errors;
}
