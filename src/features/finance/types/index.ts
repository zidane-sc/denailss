/**
 * Expense category — Epic 7. Kept deliberately small; this is a bookkeeping
 * notebook, not accounting software. Adding a category is a one-line change
 * here + in the mock seed, no category-management system.
 */
export const EXPENSE_CATEGORIES = [
  "supplies",
  "equipment",
  "studio",
  "marketing",
  "other",
] as const;

export type ExpenseCategory = (typeof EXPENSE_CATEGORIES)[number];

export const EXPENSE_CATEGORY_LABELS: Record<ExpenseCategory, string> = {
  supplies: "Bahan & Supplies",
  equipment: "Peralatan",
  studio: "Operasional Rumah",
  marketing: "Marketing",
  other: "Lainnya",
};

/** A manually recorded business expense. */
export interface Expense {
  id: string;
  description: string;
  amount: number;
  category: ExpenseCategory;
  /** YYYY-MM-DD */
  date: string;
  notes?: string;
}

/**
 * One income entry derived from a completed appointment. Finance never stores
 * income itself — it reads from the existing appointment seam (see
 * `src/features/finance/logic/finance.ts`).
 */
export interface IncomeEntry {
  appointmentId: string;
  date: string;
  customerName: string;
  serviceName: string;
  appointmentTime: string;
  amount: number;
}

/** Simple month key "YYYY-MM" used for period selection & grouping. */
export type MonthKey = string;
