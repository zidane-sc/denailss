import { z } from "zod";

export const createContactMessageSchema = z.object({
  name: z.string().trim().min(1, "Nama wajib diisi.").max(120),
  phone: z.string().trim().min(1, "No. WhatsApp wajib diisi.").max(30),
  email: z.string().trim().email("Alamat email tidak valid.").max(200),
  instagram: z.string().trim().max(60).optional(),
  message: z.string().trim().min(1, "Pesan wajib diisi.").max(2000),
});

export type CreateContactMessageInput = z.infer<typeof createContactMessageSchema>;
