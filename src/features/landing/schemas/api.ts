import { z } from "zod";

export const addInstagramPostSchema = z.object({
  shortcode: z
    .string()
    .trim()
    .min(1, "Link embed Instagram tidak dikenali.")
    .regex(/^[A-Za-z0-9_-]{6,20}$/, "Link embed Instagram tidak dikenali."),
});

export type AddInstagramPostInput = z.infer<typeof addInstagramPostSchema>;
