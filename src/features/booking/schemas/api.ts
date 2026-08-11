import { z } from "zod";
import { customerInfoSchema } from "@/features/booking/validators/booking.schema";

export const createBookingSchema = z.object({
  serviceSlugs: z.array(z.string().trim().min(1)).min(1),
  tierByServiceSlug: z.record(z.string(), z.string()).default({}),
  designSlug: z.string().trim().min(1).nullable().optional(),
  dateKey: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable().optional(),
  time: z.string().regex(/^\d{2}:\d{2}$/).nullable().optional(),
  fulfillment: z.enum(["pickup", "delivery"]).nullable().optional(),
  customer: customerInfoSchema,
  promoCode: z.string().trim().min(1).nullable().optional(),
  deposit: z
    .object({ fileName: z.string().trim().min(1), storagePath: z.string().trim().regex(/^storage:deposit-proofs\//), status: z.enum(["waiting_verification"]) })
    .nullable()
    .optional(),
});

export const updateBookingSchema = z.object({
  status: z.enum([
    "pending_deposit",
    "waiting_verification",
    "pending",
    "confirmed",
    "completed",
    "cancelled",
    "no_show",
  ]).optional(),
  dateKey: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable().optional(),
  time: z.string().regex(/^\d{2}:\d{2}$/).nullable().optional(),
  depositStatus: z.enum(["waiting_verification", "approved", "rejected"]).optional(),
  depositRejectReason: z.string().trim().max(300).nullable().optional(),
}).refine((value) => Object.keys(value).length > 0, "Setidaknya satu perubahan harus dikirim.");

export type CreateBookingInput = z.infer<typeof createBookingSchema>;
export type UpdateBookingInput = z.infer<typeof updateBookingSchema>;
