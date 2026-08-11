import { z } from "zod";
import { EXPENSE_CATEGORIES } from "../types";

const expenseFields = {
  description: z.string().trim().min(1, "Deskripsi wajib diisi."),
  amount: z.number().int().positive("Nominal harus lebih dari 0."),
  category: z.enum(EXPENSE_CATEGORIES),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Tanggal harus dalam format YYYY-MM-DD."),
  notes: z.string().trim().max(500).nullable().optional(),
};

export const createExpenseSchema = z.object(expenseFields);

export const updateExpenseSchema = z.object(expenseFields);

export type CreateExpenseInput = z.infer<typeof createExpenseSchema>;
export type UpdateExpenseInput = z.infer<typeof updateExpenseSchema>;
