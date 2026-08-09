"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { PlusIcon } from "@phosphor-icons/react/dist/ssr";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useBackoffice } from "@/features/appointment/context/backoffice-context";
import { getAllAppointments } from "../data/finance-appointments.mock";
import { deleteExpense, getLiveExpenses, subscribeExpenses } from "../data/expenses.mock";
import {
  addMonths,
  calculateMonthlyExpense,
  calculateMonthlyIncome,
  getMonthlyExpenseEntries,
  getMonthlyIncomeEntries,
  getMonthlyReport,
  getRecentMonthTrend,
  profitChangeVsPreviousMonth,
} from "../logic/finance";
import { PeriodSelector } from "./period-selector";
import { FinanceSummary } from "./finance-summary";
import { IncomeList } from "./income-list";
import { ExpenseList } from "./expense-list";
import { MonthlyReportCard } from "./monthly-report-card";
import { FinanceTrendChart } from "./finance-trend-chart";

/**
 * Finance dashboard — Epic 7. Answers "how is the business doing this month?"
 * with a balanced summary, the month's transactions, the monthly report, and
 * one small trend. All state is client-side over the mock seams.
 */
export function FinanceDashboardView() {
  const { appointments } = useBackoffice();
  const [expenses, setExpenses] = useState(() => getLiveExpenses());
  const [monthKey, setMonthKey] = useState(() => currentMonthKey());

  // Reflect expense edits made on the expense form route back into the list.
  useEffect(() => {
    return subscribeExpenses(() => setExpenses(getLiveExpenses()));
  }, []);

  const allAppointments = useMemo(() => getAllAppointments(appointments), [appointments]);
  const income = useMemo(
    () => calculateMonthlyIncome(allAppointments, monthKey),
    [allAppointments, monthKey]
  );
  const expense = useMemo(
    () => calculateMonthlyExpense(expenses, monthKey),
    [expenses, monthKey]
  );
  const incomeEntries = useMemo(
    () => getMonthlyIncomeEntries(allAppointments, monthKey),
    [allAppointments, monthKey]
  );
  const expenseEntries = useMemo(
    () => getMonthlyExpenseEntries(expenses, monthKey),
    [expenses, monthKey]
  );
  const report = useMemo(
    () => getMonthlyReport(allAppointments, expenses, monthKey),
    [allAppointments, expenses, monthKey]
  );
  const previousReport = useMemo(
    () => getMonthlyReport(allAppointments, expenses, addMonths(monthKey, -1)),
    [allAppointments, expenses, monthKey]
  );
  const profitComparison = useMemo(
    () => profitChangeVsPreviousMonth(report, previousReport),
    [report, previousReport]
  );
  const trend = useMemo(
    () => getRecentMonthTrend(allAppointments, expenses, currentMonthKey(), 6),
    [allAppointments, expenses]
  );

  const handleDelete = (id: string) => {
    const target = expenses.find((e) => e.id === id);
    const next = deleteExpense(id);
    setExpenses(next);
    toast.success(target ? `"${target.description}" dihapus.` : "Pengeluaran dihapus.");
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col gap-4 border-b border-border/50 pb-5 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="font-heading text-2xl font-semibold tracking-tight text-foreground/90">
            Keuangan
          </h2>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Pemasukan, pengeluaran, dan profit usaha rumahan dalam satu pandangan.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <PeriodSelector value={monthKey} onChange={setMonthKey} />
          <Button
            size="sm"
            className="gap-1.5 rounded-full"
            nativeButton={false}
            render={<Link href="/backoffice/finance/expenses/new" />}
          >
            <PlusIcon weight="bold" className="size-4" />
            Tambah Pengeluaran
          </Button>
        </div>
      </div>

      {/* Financial summary */}
      <FinanceSummary
        income={income}
        expense={expense}
        profit={income - expense}
        monthKey={monthKey}
        profitComparison={profitComparison}
      />

      {/* Transactions */}
      <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-2">
        <IncomeList entries={incomeEntries} />
        <ExpenseList expenses={expenseEntries} onDelete={handleDelete} />
      </div>

      {/* Report + trend */}
      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-2">
        <MonthlyReportCard report={report} />
        <FinanceTrendChart points={trend} />
      </div>
    </div>
  );
}

function currentMonthKey() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}
