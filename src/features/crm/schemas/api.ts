import { z } from "zod";

export const updateCustomerNotesSchema = z.object({
  content: z.string().trim().max(1000).default(""),
});

export const updateCustomerPreferencesSchema = z.object({
  preferences: z.object({
    preferredTime: z.enum(["pagi", "siang", "sore"]).nullable().optional().transform((v) => v ?? undefined),
    preferredShapes: z.array(z.enum(["almond", "square", "coffin", "round", "stiletto"])).default([]),
    preferredColors: z.array(z.enum(["nude", "pink", "red", "white", "black", "pastel", "gold"])).default([]),
  }),
});

export type UpdateCustomerNotesInput = z.infer<typeof updateCustomerNotesSchema>;
export type UpdateCustomerPreferencesInput = z.infer<typeof updateCustomerPreferencesSchema>;
