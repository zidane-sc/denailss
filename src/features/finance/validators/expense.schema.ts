import { z } from "zod";
import { EXPENSE_CATEGORIES } from "../types";

/**
 * Expense form validation — Epic 7. Same conventions as the booking
 * customer-info schema: zod + Indonesian messages, no technical errors shown.
 */
export const expenseSchema = z.object({
  description: z
    .string({ error: "Deskripsi wajib diisi." })
    .trim()
    .min(1, "Deskripsi wajib diisi."),
  amount: z
    .string({ error: "Nominal wajib diisi." })
    .trim()
    .min(1, "Nominal wajib diisi.")
    .refine((v) => {
      const n = Number(v.replace(/\./g, ""));
      return Number.isFinite(n) && n > 0;
    }, "Nominal harus lebih besar dari Rp0."),
  category: z.enum(EXPENSE_CATEGORIES as unknown as [string, ...string[]], {
    error: "Kategori wajib dipilih.",
  }) as z.ZodType<ExpenseCategory>,
  date: z.string({ error: "Tanggal wajib diisi." }).min(1, "Tanggal wajib diisi."),
  notes: z.string().trim().optional(),
});

export type ExpenseFormValues = z.infer<typeof expenseSchema>;

import type { ExpenseCategory } from "../types";
