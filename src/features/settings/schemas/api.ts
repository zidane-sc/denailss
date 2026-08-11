import { z } from "zod";

export const updateSettingsSchema = z.object({
  businessProfile: z.object({
    name: z.string().trim().min(1, "Nama bisnis wajib diisi."),
    logo: z.string().trim().min(1).nullable(),
    description: z.string().trim().default(""),
    address: z.string().trim().default(""),
    mapsUrl: z.string().trim().min(1).nullable().optional(),
    latitude: z.number().min(-90).max(90).nullable().optional(),
    longitude: z.number().min(-180).max(180).nullable().optional(),
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
  seo: z.object({
    metaTitle: z.string().trim().default(""),
    metaDescription: z.string().trim().default(""),
    ogImage: z.string().trim().min(1).nullable().optional(),
  }),
  faqs: z.array(
    z.object({
      section: z.enum(["booking", "service"]),
      q: z.string().trim().min(1, "Pertanyaan wajib diisi."),
      a: z.string().trim().min(1, "Jawaban wajib diisi."),
    })
  ).default([]),
});

export type UpdateSettingsInput = z.infer<typeof updateSettingsSchema>;
