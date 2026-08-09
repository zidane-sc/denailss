"use client";

import { useState } from "react";
import Link from "next/link";
import {
  PlusIcon,
  PencilSimpleIcon,
  TrashIcon,
} from "@phosphor-icons/react/dist/ssr";
import { formatIDR } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { Expense } from "../types";
import { shortDayMonth } from "../logic/finance";
import { ExpenseCategoryBadge } from "./expense-category-badge";

/**
 * Expense list — the month's recorded expenses with add / edit / delete.
 * Delete uses a concise confirmation dialog (same pattern as the gallery
 * admin). Mobile rows collapse to compact cards.
 */
export function ExpenseList({
  expenses,
  onDelete,
}: {
  expenses: Expense[];
  onDelete: (id: string) => void;
}) {
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const pending = expenses.find((e) => e.id === confirmDeleteId);

  return (
    <section className="rounded-2xl border border-border/70 bg-card shadow-xs">
      <div className="flex items-center justify-between gap-3 border-b border-border/50 px-5 py-4">
        <div className="flex items-center gap-2">
          <h3 className="font-heading text-sm font-semibold text-foreground/90">Pengeluaran</h3>
          <span className="text-[11px] text-muted-foreground">{expenses.length} catatan</span>
        </div>
        <Button
          size="sm"
          className="h-7 gap-1.5 rounded-full px-3 text-xs"
          nativeButton={false}
          render={<Link href="/backoffice/finance/expenses/new" />}
        >
          <PlusIcon weight="bold" className="size-3.5" />
          Catat
        </Button>
      </div>

      {expenses.length === 0 ? (
        <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
          <p className="text-sm font-semibold text-foreground/85">
            Belum ada pengeluaran bulan ini.
          </p>
          <p className="mt-1 max-w-xs text-xs text-muted-foreground leading-relaxed">
            Catat pengeluaran kecil sekalipun supaya profitmu tetap akurat.
          </p>
          <Button
            size="sm"
            className="mt-4 gap-1.5 rounded-full"
            nativeButton={false}
            render={<Link href="/backoffice/finance/expenses/new" />}
          >
            <PlusIcon className="size-4" />
            Catat Pengeluaran
          </Button>
        </div>
      ) : (
        <>
          {/* Desktop rows */}
          <ul className="hidden divide-y divide-border/40 md:block">
            {expenses.map((expense) => (
              <li
                key={expense.id}
                className="flex items-center gap-4 px-5 py-3 transition-colors hover:bg-muted/15"
              >
                <div className="w-16 shrink-0">
                  <p className="text-sm font-semibold text-foreground">
                    {shortDayMonth(expense.date)}
                  </p>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">
                    {expense.description}
                  </p>
                  {expense.notes && (
                    <p className="truncate text-[11px] text-muted-foreground">{expense.notes}</p>
                  )}
                </div>
                <ExpenseCategoryBadge category={expense.category} />
                <p className="w-28 shrink-0 text-right text-sm font-semibold text-foreground tabular-nums">
                  {formatIDR(expense.amount)}
                </p>
                <div className="flex shrink-0 items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label={`Edit ${expense.description}`}
                    className="rounded-full text-muted-foreground hover:text-primary"
                    nativeButton={false}
                    render={<Link href={`/backoffice/finance/expenses/new?edit=${expense.id}`} />}
                  >
                    <PencilSimpleIcon className="size-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label={`Hapus ${expense.description}`}
                    className="rounded-full text-muted-foreground hover:text-destructive"
                    onClick={() => setConfirmDeleteId(expense.id)}
                  >
                    <TrashIcon className="size-4" />
                  </Button>
                </div>
              </li>
            ))}
          </ul>

          {/* Mobile rows */}
          <ul className="divide-y divide-border/40 md:hidden">
            {expenses.map((expense) => (
              <li key={expense.id} className="px-5 py-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-foreground">{expense.description}</p>
                    <p className="mt-0.5 text-[11px] text-muted-foreground">
                      {shortDayMonth(expense.date)}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label={`Edit ${expense.description}`}
                      className="rounded-full text-muted-foreground hover:text-primary"
                      nativeButton={false}
                      render={<Link href={`/backoffice/finance/expenses/new?edit=${expense.id}`} />}
                    >
                      <PencilSimpleIcon className="size-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label={`Hapus ${expense.description}`}
                      className="rounded-full text-muted-foreground hover:text-destructive"
                      onClick={() => setConfirmDeleteId(expense.id)}
                    >
                      <TrashIcon className="size-4" />
                    </Button>
                  </div>
                </div>
                <div className="mt-2 flex items-center justify-between gap-3">
                  <ExpenseCategoryBadge category={expense.category} />
                  <p className="text-sm font-semibold text-foreground tabular-nums">
                    {formatIDR(expense.amount)}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </>
      )}

      <Dialog open={Boolean(confirmDeleteId)} onOpenChange={(open) => !open && setConfirmDeleteId(null)}>
        <DialogContent className="sm:max-w-md bg-card">
          <DialogHeader>
            <DialogTitle className="font-heading text-lg font-semibold text-foreground/90">
              Hapus pengeluaran ini?
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground leading-relaxed">
              {pending ? (
                <>
                  &ldquo;{pending.description}&rdquo; sebesar{" "}
                  <span className="font-semibold text-foreground">{formatIDR(pending.amount)}</span>{" "}
                  akan dihapus. Tindakan ini tidak bisa dibatalkan.
                </>
              ) : (
                "Catatan pengeluaran akan dihapus permanen."
              )}
            </p>
            <div className="flex items-center justify-end gap-2">
              <Button
                variant="ghost"
                className="gap-1.5 rounded-full text-muted-foreground"
                onClick={() => setConfirmDeleteId(null)}
              >
                Batal
              </Button>
              <Button
                variant="destructive"
                className="gap-1.5 rounded-full"
                onClick={() => {
                  if (confirmDeleteId) onDelete(confirmDeleteId);
                  setConfirmDeleteId(null);
                }}
              >
                <TrashIcon className="size-4" />
                Hapus
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}
