import { z } from "zod";

export const updateCustomerProfileSchema = z.object({
  name: z.string().trim().min(3, "Nama minimal 3 karakter."),
  phone: z.string().trim().min(9, "Nomor WhatsApp tidak valid."),
  notes: z.string().trim().max(300, "Catatan maksimal 300 karakter.").optional(),
});

export type UpdateCustomerProfileInput = z.infer<typeof updateCustomerProfileSchema>;
