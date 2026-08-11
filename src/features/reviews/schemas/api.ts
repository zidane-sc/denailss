import { z } from "zod";

export const createReviewSchema = z.object({
  bookingCode: z.string().trim().min(1, "Booking code wajib diisi."),
  rating: z.number().int().min(1).max(5),
  comment: z.string().trim().min(1, "Tulis dulu ulasan singkatmu."),
  photoSeed: z.string().trim().min(1).nullable().optional(),
});

export type CreateReviewInput = z.infer<typeof createReviewSchema>;
