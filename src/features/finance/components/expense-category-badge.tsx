"use client";

import { cn } from "@/lib/utils";
import type { ExpenseCategory } from "../types";
import { EXPENSE_CATEGORY_LABELS } from "../types";

/**
 * Small category badge used in expense rows and the form. Color is a subtle
 * brand-tinted chip per category — finance states stay readable first.
 */
const CATEGORY_CHIP: Record<ExpenseCategory, string> = {
  supplies: "bg-rose-50 text-rose-700",
  equipment: "bg-violet-50 text-violet-700",
  studio: "bg-amber-50 text-amber-700",
  marketing: "bg-sky-50 text-sky-700",
  other: "bg-muted text-muted-foreground",
};

export function ExpenseCategoryBadge({ category }: { category: ExpenseCategory }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold",
        CATEGORY_CHIP[category]
      )}
    >
      {EXPENSE_CATEGORY_LABELS[category]}
    </span>
  );
}
