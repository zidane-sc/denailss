import type { Appointment } from "@/features/appointment/types";
import type { Expense, IncomeEntry, MonthKey } from "../types";
import { EXPENSE_CATEGORY_LABELS } from "../types";

/**
 * Finance logic — Epic 7. Pure functions only: no React, no storage. The
 * components consume these helpers, so swapping the mock seam for a real
 * repository later never touches the UI.
 *
 * Income derives from completed appointments; expense comes from the finance
 * expense store. Profit = income - expense.
 */

/** "2026-08" — the month key used for period selection and grouping. */
export function toMonthKey(dateKey: string): MonthKey {
  return dateKey.slice(0, 7);
}

/** "2026-08-09" → { key: "2026-08", label: "Agustus 2026" } */
export function monthKeyInfo(monthKey: MonthKey): { key: MonthKey; label: string } {
  const [year, month] = monthKey.split("-").map(Number);
  const label = new Intl.DateTimeFormat("id-ID", {
    month: "long",
    year: "numeric",
  }).format(new Date(year, month - 1, 1));
  return { key: monthKey, label };
}

export function addMonths(monthKey: MonthKey, delta: number): MonthKey {
  const [year, month] = monthKey.split("-").map(Number);
  const d = new Date(year, month - 1 + delta, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

/** Shifted month key so navigation stays on the 1st (safe for month borders). */
export function currentMonthKey(): MonthKey {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

export function compareMonthKeys(a: MonthKey, b: MonthKey): number {
  return a.localeCompare(b);
}

/**
 * Income entries for a month, derived from completed appointments.
 * Products-only press-on orders (empty date) are excluded — no event date,
 * no income month.
 */
export function getMonthlyIncomeEntries(
  appointments: Appointment[],
  monthKey: MonthKey
): IncomeEntry[] {
  return appointments
    .filter((a) => a.status === "completed" && a.date && toMonthKey(a.date) === monthKey)
    .sort((a, b) => (a.date === b.date ? a.time.localeCompare(b.time) : b.date.localeCompare(a.date)))
    .map((a) => ({
      appointmentId: a.id,
      date: a.date,
      customerName: a.customer.name,
      serviceName: a.services.map((s) => s.name).join(" + "),
      appointmentTime: a.time,
      amount: a.price,
    }));
}

export function calculateMonthlyIncome(appointments: Appointment[], monthKey: MonthKey): number {
  return getMonthlyIncomeEntries(appointments, monthKey).reduce((sum, e) => sum + e.amount, 0);
}

export function getMonthlyExpenses(expenses: Expense[], monthKey: MonthKey): Expense[] {
  return expenses
    .filter((e) => toMonthKey(e.date) === monthKey)
    .sort((a, b) => b.date.localeCompare(a.date));
}

export function calculateMonthlyExpense(expenses: Expense[], monthKey: MonthKey): number {
  return getMonthlyExpenses(expenses, monthKey).reduce((sum, e) => sum + e.amount, 0);
}

/** Alias kept for readability at call sites that only need the month's list. */
export { getMonthlyExpenses as getMonthlyExpenseEntries };

export function calculateProfit(income: number, expense: number): number {
  return income - expense;
}

export function calculateAverageTransaction(income: number, completedCount: number): number {
  return completedCount > 0 ? income / completedCount : 0;
}

export interface MonthlyReport {
  monthKey: MonthKey;
  monthLabel: string;
  income: number;
  expense: number;
  profit: number;
  completedAppointments: number;
  averageTransaction: number;
}

/**
 * Full monthly report. `completedAppointments` counts unique completed
 * appointments (products-only press-on orders excluded, they carry no date).
 */
export function getMonthlyReport(
  appointments: Appointment[],
  expenses: Expense[],
  monthKey: MonthKey
): MonthlyReport {
  const entries = getMonthlyIncomeEntries(appointments, monthKey);
  const income = entries.reduce((sum, e) => sum + e.amount, 0);
  const expense = getMonthlyExpenses(expenses, monthKey).reduce((sum, e) => sum + e.amount, 0);
  const completedCount = entries.length;
  return {
    monthKey,
    monthLabel: monthKeyInfo(monthKey).label,
    income,
    expense,
    profit: income - expense,
    completedAppointments: completedCount,
    averageTransaction: completedCount > 0 ? income / completedCount : 0,
  };
}

export interface MonthTrendPoint {
  monthKey: MonthKey;
  monthLabel: string;
  income: number;
  expense: number;
  profit: number;
}

/**
 * Income/expense/profit for the last `count` months ending at `endMonth`.
 * Empty months appear as zero so the trend stays continuous.
 */
export function getRecentMonthTrend(
  appointments: Appointment[],
  expenses: Expense[],
  endMonth: MonthKey,
  count = 6
): MonthTrendPoint[] {
  const points: MonthTrendPoint[] = [];
  for (let i = count - 1; i >= 0; i--) {
    const key = addMonths(endMonth, -i);
    const report = getMonthlyReport(appointments, expenses, key);
    points.push({
      monthKey: key,
      monthLabel: monthKeyInfo(key).label,
      income: report.income,
      expense: report.expense,
      profit: report.profit,
    });
  }
  return points;
}

/** Profit change vs the previous month, as a signed percent. */
export function profitChangeVsPreviousMonth(
  report: MonthlyReport,
  previous: MonthlyReport
): { pct: number; previousProfit: number } | null {
  if (previous.profit === 0) return null;
  const pct = ((report.profit - previous.profit) / Math.abs(previous.profit)) * 100;
  return { pct, previousProfit: previous.profit };
}

/** "Rp2.450.000" — compact, used across finance lists. */
export function formatRp(amount: number): string {
  return `Rp${Math.round(amount).toLocaleString("id-ID")}`;
}

const SHORT_MONTHS = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];

/** "2026-08-03" → "3 Agu" — compact date for finance rows. */
export function shortDayMonth(dateKey: string): string {
  const [, month, day] = dateKey.split("-").map(Number);
  return `${day} ${SHORT_MONTHS[month - 1]}`;
}

/** "2026-08" → "Agu 2026" — compact label for the trend chart axis. */
export function shortMonthLabel(monthKey: MonthKey): string {
  const [year, month] = monthKey.split("-").map(Number);
  return `${SHORT_MONTHS[month - 1]} ${year}`;
}

/** Category badge label for an expense row. */
export function categoryLabel(category: Expense["category"]): string {
  return EXPENSE_CATEGORY_LABELS[category];
}
