"use client";

import { useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeftIcon } from "@phosphor-icons/react/dist/ssr";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { getExpenseById, upsertExpense } from "../data/expenses.mock";
import { ExpenseForm, draftFromExpense, emptyDraft } from "./expense-form";
import type { Expense } from "../types";

/**
 * Create + edit expense — one route (/backoffice/finance/expenses/new),
 * editing via ?edit=<id>. Mirrors the promotion create-view pattern.
 */
export function ExpenseCreateView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("edit");

  const initial = useMemo(() => {
    if (editId) {
      const existing = getExpenseById(editId);
      if (existing) return draftFromExpense(existing);
    }
    return emptyDraft();
  }, [editId]);

  const editing = Boolean(initial.id);

  const handleSubmit = (expense: Expense, mode: "create" | "update") => {
    upsertExpense(expense, mode);
    toast.success(mode === "create" ? "Pengeluaran dicatat." : "Perubahan disimpan.", {
      description: `"${expense.description}" ${mode === "create" ? "ditambahkan" : "diperbarui"} ke buku keuangan.`,
    });
    router.push("/backoffice/finance");
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6 animate-in fade-in duration-300">
      <Button
        variant="ghost"
        size="sm"
        className="h-8 gap-1.5 rounded-full pl-2 pr-3 text-muted-foreground hover:text-foreground [&>svg]:size-4"
        nativeButton={false}
        render={<Link href="/backoffice/finance" />}
      >
        <ArrowLeftIcon />
        Keuangan
      </Button>

      <div>
        <h2 className="font-heading text-2xl font-semibold tracking-tight text-foreground/90">
          {editing ? "Edit Pengeluaran" : "Catat Pengeluaran"}
        </h2>
        <p className="mt-0.5 text-sm text-muted-foreground">
          {editing
            ? "Perbaiki detail catatan pengeluaran ini."
            : "Catat biaya operasional supaya profit bulan ini tetap akurat."}
        </p>
      </div>

      <ExpenseForm
        initial={initial}
        onSubmit={handleSubmit}
        onCancel={() => router.push("/backoffice/finance")}
      />
    </div>
  );
}
