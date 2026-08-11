import { z } from "zod";

const dateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Tanggal harus dalam format YYYY-MM-DD.");

const promotionFields = {
  code: z
    .string()
    .trim()
    .min(2, "Kode promo minimal 2 karakter.")
    .max(20, "Kode promo maksimal 20 karakter.")
    .regex(/^[A-Z0-9]+$/, "Kode promo hanya boleh huruf besar dan angka."),
  title: z.string().trim().min(1, "Judul promo wajib diisi."),
  description: z.string().trim().default(""),
  discountType: z.enum(["percentage", "fixed"]),
  discountValue: z.number().int().positive("Nilai diskon harus lebih dari 0."),
  maximumDiscount: z.number().int().nonnegative().nullable().optional(),
  startDate: dateSchema,
  endDate: dateSchema,
  usageLimit: z.number().int().nonnegative().default(0),
  minimumSpend: z.number().int().nonnegative().nullable().optional(),
  applicableServiceSlugs: z.array(z.string().trim().min(1)).default([]),
  imageSeed: z.string().trim().min(1).nullable().optional(),
  active: z.boolean().default(true),
};

const dateOrderRefine = (value: { startDate: string; endDate: string }) =>
  value.endDate >= value.startDate;

export const createPromotionSchema = z
  .object({
    id: z.string().trim().min(1, "ID promo tidak valid."),
    ...promotionFields,
  })
  .refine(dateOrderRefine, "Tanggal berakhir harus setelah tanggal mulai.");

export const updatePromotionSchema = z
  .object(promotionFields)
  .refine(dateOrderRefine, "Tanggal berakhir harus setelah tanggal mulai.");

export const setPromotionActiveSchema = z.object({
  active: z.boolean(),
});

export type CreatePromotionInput = z.infer<typeof createPromotionSchema>;
export type UpdatePromotionInput = z.infer<typeof updatePromotionSchema>;
export type SetPromotionActiveInput = z.infer<typeof setPromotionActiveSchema>;
