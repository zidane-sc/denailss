import type { Metadata } from "next";
import { Suspense } from "react";
import { ExpenseCreateView } from "@/features/finance/components/expense-create-view";

export const metadata: Metadata = {
  title: "Catat Pengeluaran | Backoffice Denailss",
  description: "Catat pengeluaran operasional Denailss.",
};

export default function BackofficeFinanceExpenseNewPage() {
  return (
    <Suspense>
      <ExpenseCreateView />
    </Suspense>
  );
}
