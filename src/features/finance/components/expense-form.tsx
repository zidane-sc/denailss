"use client";

import { useState } from "react";
import { CheckIcon, XIcon } from "@phosphor-icons/react/dist/ssr";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { Expense } from "../types";
import { EXPENSE_CATEGORIES, EXPENSE_CATEGORY_LABELS } from "../types";

export interface ExpenseDraft {
  id?: string;
  description: string;
  amount: string;
  category: Expense["category"] | "";
  date: string;
  notes: string;
}

export function emptyDraft(): ExpenseDraft {
  return {
    description: "",
    amount: "",
    category: "",
    date: new Date().toISOString().slice(0, 10),
    notes: "",
  };
}

export function draftFromExpense(expense: Expense): ExpenseDraft {
  return {
    id: expense.id,
    description: expense.description,
    amount: String(expense.amount),
    category: expense.category,
    date: expense.date,
    notes: expense.notes ?? "",
  };
}

/**
 * Expense form — used for both create (/backoffice/finance/expenses/new) and
 * edit (same route with ?edit=<id>). Manual validation with Indonesian
 * messages, mirroring the promotion form conventions.
 */
export function ExpenseForm({
  initial,
  onSubmit,
  onCancel,
}: {
  initial: ExpenseDraft;
  onSubmit: (expense: Expense, mode: "create" | "update") => void;
  onCancel: () => void;
}) {
  const editing = Boolean(initial.id);
  const [draft, setDraft] = useState<ExpenseDraft>(initial);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const set = <K extends keyof ExpenseDraft>(key: K, value: ExpenseDraft[K]) => {
    setDraft((d) => ({ ...d, [key]: value }));
  };

  const validate = (): Record<string, string> => {
    const e: Record<string, string> = {};
    if (!draft.description.trim()) e.description = "Deskripsi wajib diisi.";
    if (!draft.amount.trim()) e.amount = "Nominal wajib diisi.";
    else {
      const n = Number(draft.amount.replace(/\./g, ""));
      if (!Number.isFinite(n) || n <= 0) e.amount = "Nominal harus lebih besar dari Rp0.";
    }
    if (!draft.category) e.category = "Kategori wajib dipilih.";
    if (!draft.date) e.date = "Tanggal wajib diisi.";
    return e;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const nextErrors = validate();
    setErrors(nextErrors);
    if (Object.values(nextErrors).some(Boolean)) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    onSubmit(
      {
        id: draft.id ?? `exp-${Date.now()}`,
        description: draft.description.trim(),
        amount: Number(draft.amount.replace(/\./g, "")),
        category: draft.category as Expense["category"],
        date: draft.date,
        notes: draft.notes.trim() || undefined,
      },
      editing ? "update" : "create"
    );
  };

  const renderErrors = (key: string) => errors[key];

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-6">
      {Object.keys(errors).length > 0 && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3">
          <p className="text-sm font-semibold text-destructive">
            Ada beberapa hal yang perlu diperbaiki dulu.
          </p>
          <p className="mt-0.5 text-xs text-destructive/90">
            Periksa kembali isian yang ditandai di bawah.
          </p>
        </div>
      )}

      <section className="rounded-2xl border border-border/70 bg-card p-5 shadow-xs sm:p-6">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <div className="grid gap-1.5">
              <Label className="font-medium text-foreground/90">Deskripsi *</Label>
              <Input
                value={draft.description}
                onChange={(e) => set("description", e.target.value)}
                placeholder="Contoh: Nail gel refill"
                className="h-10"
                aria-invalid={Boolean(errors.description)}
              />
              {renderErrors("description") && (
                <p className="text-[11px] font-medium text-destructive">{errors.description}</p>
              )}
            </div>
          </div>

          <div className="grid gap-1.5">
            <Label className="font-medium text-foreground/90">Nominal (Rp) *</Label>
            <div className="relative flex items-center">
              <span className="pointer-events-none absolute left-3 text-sm font-semibold text-muted-foreground">
                Rp
              </span>
              <Input
                type="text"
                inputMode="numeric"
                value={draft.amount}
                onChange={(e) => set("amount", e.target.value)}
                placeholder="contoh: 180000"
                className="h-10 w-full pl-10"
                aria-invalid={Boolean(errors.amount)}
              />
            </div>
            {renderErrors("amount") && (
              <p className="text-[11px] font-medium text-destructive">{errors.amount}</p>
            )}
          </div>

          <div className="grid gap-1.5">
            <Label className="font-medium text-foreground/90">Kategori *</Label>
            <div className="flex flex-wrap gap-1.5">
              {EXPENSE_CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  aria-pressed={draft.category === cat}
                  onClick={() => set("category", cat)}
                  className={cn(
                    "h-9 rounded-full border px-3.5 text-xs font-semibold transition-colors",
                    draft.category === cat
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border bg-background/40 text-muted-foreground hover:border-primary/40 hover:text-foreground"
                  )}
                >
                  {EXPENSE_CATEGORY_LABELS[cat]}
                </button>
              ))}
            </div>
            {renderErrors("category") && (
              <p className="text-[11px] font-medium text-destructive">{errors.category}</p>
            )}
          </div>

          <div className="grid gap-1.5">
            <Label className="font-medium text-foreground/90">Tanggal *</Label>
            <Input
              type="date"
              value={draft.date}
              max={new Date().toISOString().slice(0, 10)}
              onChange={(e) => set("date", e.target.value)}
              className="h-10"
              aria-invalid={Boolean(errors.date)}
            />
            {renderErrors("date") && (
              <p className="text-[11px] font-medium text-destructive">{errors.date}</p>
            )}
          </div>

          <div className="grid gap-1.5 sm:col-span-2">
            <Label className="font-medium text-foreground/90">Catatan</Label>
            <Textarea
              value={draft.notes}
              onChange={(e) => set("notes", e.target.value)}
              placeholder="Opsional. Contoh: beli di toko X, sekalian stok 2 bulan."
              rows={3}
            />
            <p className="text-[11px] text-muted-foreground">
              Detail tambahan yang perlu diingat nanti.
            </p>
          </div>
        </div>
      </section>

      <div className="rounded-2xl border border-border/70 bg-card p-5 shadow-xs">
        <div className="flex flex-wrap items-center justify-end gap-2">
          <Button
            type="button"
            variant="ghost"
            className="gap-1.5 rounded-full text-muted-foreground"
            onClick={onCancel}
          >
            <XIcon className="size-4" />
            Batal
          </Button>
          <Button type="submit" className="gap-1.5 rounded-full">
            <CheckIcon className="size-4" />
            {editing ? "Simpan Perubahan" : "Simpan Pengeluaran"}
          </Button>
        </div>
      </div>
    </form>
  );
}
