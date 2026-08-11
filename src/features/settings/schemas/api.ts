import { z } from "zod";

export const updateSettingsSchema = z.object({
  businessProfile: z.object({
    name: z.string().trim().min(1, "Nama bisnis wajib diisi."),
    logo: z.string().trim().min(1).nullable(),
    description: z.string().trim().default(""),
    address: z.string().trim().default(""),
  }),
  socialMedia: z.object({
    instagram: z.string().trim().default(""),
    tiktok: z.string().trim().default(""),
    whatsapp: z.string().trim().default(""),
  }),
  policies: z.object({
    cancellation: z.string().trim().default(""),
    deposit: z.string().trim().default(""),
  }),
});

export type UpdateSettingsInput = z.infer<typeof updateSettingsSchema>;
