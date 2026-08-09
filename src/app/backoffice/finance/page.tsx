import type { Metadata } from "next";
import { FinanceDashboardView } from "@/features/finance/components/finance-dashboard-view";

export const metadata: Metadata = {
  title: "Keuangan | Backoffice Denailss",
  description: "Pemasukan, pengeluaran, dan profit Denailss.",
};

export default function BackofficeFinancePage() {
  return <FinanceDashboardView />;
}
