import type { Metadata } from "next";
import { AnalyticsDashboardView } from "@/features/analytics/components/analytics-dashboard-view";

export const metadata: Metadata = {
  title: "Analytics | Backoffice Denailss",
  description: "Perkembangan dan pola booking Denailss.",
};

export default function BackofficeAnalyticsPage() {
  return <AnalyticsDashboardView />;
}
