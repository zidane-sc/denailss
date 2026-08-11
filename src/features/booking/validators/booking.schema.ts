import { z } from "zod";

export const customerInfoSchema = z.object({
  name: z.string().trim().min(3, "Nama minimal 3 karakter."),
  phone: z
    .string()
    .trim()
    .min(9, "Nomor WhatsApp tidak valid.")
    .regex(/^(\+62|62|0)8[0-9]{7,12}$/, "Gunakan format nomor Indonesia, contoh 08123456789."),
  email: z.string().trim().email("Format email tidak valid."),
  instagram: z.string().trim().max(60, "Instagram maksimal 60 karakter.").optional(),
  notes: z.string().trim().max(300, "Catatan maksimal 300 karakter.").optional(),
});

export type CustomerInfoFormValues = z.infer<typeof customerInfoSchema>;
