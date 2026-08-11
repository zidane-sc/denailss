import "server-only";
import { desc, eq } from "drizzle-orm";
import { getDb } from "@/db/client";
import { expenses } from "@/db/schema";
import { ApiError } from "@/lib/api/errors";
import type { Expense } from "../types";
import type { CreateExpenseInput, UpdateExpenseInput } from "../schemas/api";

export async function listExpenses(): Promise<Expense[]> {
  const rows = await getDb().select().from(expenses).orderBy(desc(expenses.date));
  return rows.map((row) => ({
    id: row.id,
    description: row.description,
    amount: row.amount,
    category: row.category as Expense["category"],
    date: row.date,
    notes: row.notes ?? undefined,
  }));
}

export async function createExpense(input: CreateExpenseInput): Promise<Expense> {
  const db = getDb();
  const [inserted] = await db
    .insert(expenses)
    .values({
      id: `exp-${crypto.randomUUID().slice(0, 8)}`,
      description: input.description,
      amount: input.amount,
      category: input.category,
      date: input.date,
      notes: input.notes ?? null,
    })
    .returning();
  if (!inserted) throw new ApiError("INTERNAL_ERROR", "Pengeluaran tidak dapat disimpan.", 500);
  return {
    id: inserted.id,
    description: inserted.description,
    amount: inserted.amount,
    category: inserted.category as Expense["category"],
    date: inserted.date,
    notes: inserted.notes ?? undefined,
  };
}

export async function updateExpense(id: string, input: UpdateExpenseInput): Promise<Expense> {
  const db = getDb();
  const [current] = await db.select().from(expenses).where(eq(expenses.id, id));
  if (!current) throw new ApiError("NOT_FOUND", "Pengeluaran tidak ditemukan.", 404);
  const [updated] = await db
    .update(expenses)
    .set({ description: input.description, amount: input.amount, category: input.category, date: input.date, notes: input.notes ?? null })
    .where(eq(expenses.id, id))
    .returning();
  if (!updated) throw new ApiError("INTERNAL_ERROR", "Pengeluaran tidak dapat disimpan.", 500);
  return {
    id: updated.id,
    description: updated.description,
    amount: updated.amount,
    category: updated.category as Expense["category"],
    date: updated.date,
    notes: updated.notes ?? undefined,
  };
}

export async function deleteExpense(id: string): Promise<{ id: string }> {
  const db = getDb();
  const [current] = await db.select({ id: expenses.id }).from(expenses).where(eq(expenses.id, id));
  if (!current) throw new ApiError("NOT_FOUND", "Pengeluaran tidak ditemukan.", 404);
  await db.delete(expenses).where(eq(expenses.id, id));
  return { id };
}
