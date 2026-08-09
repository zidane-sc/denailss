import type { Expense } from "../types";

/**
 * Expense store — Epic 7 mock-first seam standing in for the future
 * `expenses` repository (TRD §4). Swap for a real API call without touching
 * consumers.
 *
 * State persists to localStorage (`denailss.finance.expenses`) so the owner's
 * expenses survive refresh, same as the gallery/promotion admin stores.
 * `EXPENSE_SEEDS` is the fallback until the first edit.
 */
export const EXPENSE_SEEDS: Expense[] = [
  { id: "exp-2026-06-01", description: "Nail gel refill", amount: 180000, category: "supplies", date: "2026-06-05" },
  { id: "exp-2026-06-02", description: "Marketing Instagram", amount: 150000, category: "marketing", date: "2026-06-12" },
  { id: "exp-2026-06-03", description: "Nail tips", amount: 95000, category: "supplies", date: "2026-06-19" },
  { id: "exp-2026-06-04", description: "Perlengkapan operasional", amount: 250000, category: "studio", date: "2026-06-27" },
  { id: "exp-2026-07-01", description: "Beli lampu UV baru", amount: 480000, category: "equipment", date: "2026-07-02" },
  { id: "exp-2026-07-02", description: "Base & top coat gel", amount: 210000, category: "supplies", date: "2026-07-08" },
  { id: "exp-2026-07-03", description: "Iklan TikTok", amount: 100000, category: "marketing", date: "2026-07-15" },
  { id: "exp-2026-07-04", description: "Dekorasi ruang treatment", amount: 190000, category: "studio", date: "2026-07-20" },
  { id: "exp-2026-07-05", description: "Spidol & aksesori nail art", amount: 130000, category: "supplies", date: "2026-07-26" },
  { id: "exp-2026-08-01", description: "Nail gel refill", amount: 180000, category: "supplies", date: "2026-08-03" },
  { id: "exp-2026-08-02", description: "Marketing Instagram", amount: 150000, category: "marketing", date: "2026-08-05" },
  { id: "exp-2026-08-03", description: "Nail tips", amount: 95000, category: "supplies", date: "2026-08-07" },
  { id: "exp-2026-08-04", description: "Listrik & WiFi bulanan", amount: 300000, category: "studio", date: "2026-08-08" },
];

const STORAGE_KEY = "denailss.finance.expenses";

let cached: Expense[] | null = null;

function load(): Expense[] {
  if (cached) return cached;
  if (typeof window !== "undefined") {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Expense[];
        if (Array.isArray(parsed)) {
          cached = parsed;
          return cached;
        }
      }
    } catch {
      // fall through to seed
    }
  }
  cached = [...EXPENSE_SEEDS];
  return cached;
}

/** SSR-safe read of the expense list (server components get the seed). */
export function getLiveExpenses(): Expense[] {
  if (typeof window !== "undefined") return load();
  return EXPENSE_SEEDS;
}

const subscribers = new Set<() => void>();

export function subscribeExpenses(cb: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  subscribers.add(cb);
  return () => {
    subscribers.delete(cb);
  };
}

function save(list: Expense[]) {
  cached = list;
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    } catch {
      // storage unavailable (private mode etc.) — keep in-memory state
    }
  }
  notify();
}

function notify() {
  subscribers.forEach((cb) => cb());
}

export function getExpenseById(id: string): Expense | undefined {
  return load().find((e) => e.id === id);
}

/** Create or update an expense; returns the updated list. */
export function upsertExpense(expense: Expense, mode: "create" | "update"): Expense[] {
  const list = load();
  if (mode === "update") {
    const idx = list.findIndex((e) => e.id === expense.id);
    if (idx === -1) return list;
    const next = [...list];
    next[idx] = expense;
    save(next);
    return next;
  }
  const next = [expense, ...list];
  save(next);
  return next;
}

/** Delete an expense; returns the updated list. */
export function deleteExpense(id: string): Expense[] {
  const next = load().filter((e) => e.id !== id);
  save(next);
  return next;
}
