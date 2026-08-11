import { z } from "zod";

export const updateCustomerProfileSchema = z.object({
  name: z.string().trim().min(1, "Nama wajib diisi."),
  phone: z.string().trim().min(1, "Nomor WhatsApp wajib diisi."),
  instagram: z.string().trim().max(60).optional(),
  notes: z.string().trim().max(500).optional(),
});

export type UpdateCustomerProfileInput = z.infer<typeof updateCustomerProfileSchema>;

export const favoriteDesignSchema = z.object({
  designSlug: z.string().trim().min(1, "Slug desain wajib diisi."),
});

export type FavoriteDesignInput = z.infer<typeof favoriteDesignSchema>;
