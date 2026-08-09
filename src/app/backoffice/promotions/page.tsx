import type { Metadata } from "next";
import { PromotionListView } from "@/features/promotion/components/promotion-list-view";

export const metadata: Metadata = {
  title: "Promosi | Backoffice Denailss",
  description: "Kelola promo dan penawaran untuk customer Denailss.",
};

export default function BackofficePromotionsPage() {
  return <PromotionListView />;
}
