import { z } from "zod";

const serviceTierSchema = z.object({
  key: z.enum(["simple", "complex"]),
  label: z.string().trim().min(1, "Label tingkat wajib diisi."),
  priceFrom: z.number().int().positive("Harga tingkat harus lebih dari 0."),
  durationMinutes: z.number().int().positive("Durasi tingkat harus lebih dari 0."),
});

export const updateServiceSchema = z.object({
  name: z.string().trim().min(1, "Nama layanan wajib diisi."),
  shortDescription: z.string().trim().min(1, "Deskripsi singkat wajib diisi."),
  description: z.string().trim().default(""),
  priceFrom: z.number().int().nonnegative("Harga mulai tidak boleh negatif."),
  priceNote: z.string().trim().max(160).nullable().optional(),
  durationMinutes: z.number().int().positive("Durasi harus lebih dari 0."),
  tiers: z.array(serviceTierSchema).default([]),
  requiresPickup: z.boolean().default(false),
  depositApplicable: z.boolean().default(false),
  heroImage: z.string().trim().min(1, "Foto utama layanan wajib diisi."),
  gallerySeeds: z.array(z.string()).default([]),
  faq: z.array(z.object({ question: z.string().trim().min(1), answer: z.string().trim().min(1) })).default([]),
  active: z.boolean().default(true),
});

export const setServiceActiveSchema = z.object({
  active: z.boolean(),
});

export type UpdateServiceInput = z.infer<typeof updateServiceSchema>;
export type SetServiceActiveInput = z.infer<typeof setServiceActiveSchema>;
