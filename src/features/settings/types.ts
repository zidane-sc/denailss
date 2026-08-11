/**
 * Settings domain types — Epic 9.
 *
 * This model is the FE-only stand-in for the future `settings` repository
 * (TRD §4). Business Profile and Social Media are intentionally shaped to be
 * consumed later by the public website (footer / contact / social links),
 * and the Policies text feeds the customer-facing booking/contact copy.
 */

export interface SettingsBusinessProfile {
  name: string;
  /** Local preview logo. Persisted as a data URL so refresh keeps it (FE-only). */
  logo: string | null;
  description: string;
  address: string;
}

export interface SettingsSocialMedia {
  /** Instagram username (no leading @) or full URL. */
  instagram: string;
  /** TikTok username (no leading @) or full URL. */
  tiktok: string;
  /** WhatsApp number in a dialable form (e.g. 6281234567890). */
  whatsapp: string;
}

export interface SettingsPolicies {
  cancellation: string;
  deposit: string;
}

export interface SettingsSeo {
  /** Page title suffix/brand (e.g. "Denailss · Nail art & beauty space"). */
  metaTitle: string;
  /** Meta description shown in search results. */
  metaDescription: string;
  /** Open Graph / social share image (storage ref or path). */
  ogImage: string | null;
}

export interface Settings {
  businessProfile: SettingsBusinessProfile;
  socialMedia: SettingsSocialMedia;
  policies: SettingsPolicies;
  seo: SettingsSeo;
}

/** Settings draft mirrors the persisted model; text inputs are all strings. */
export type SettingsDraft = Settings;
