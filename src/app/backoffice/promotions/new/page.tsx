import type { Metadata } from "next";
import { PromotionCreateView } from "@/features/promotion/components/promotion-create-view";

export const metadata: Metadata = {
  title: "Buat Promo | Backoffice Denailss",
  description: "Buat promo baru untuk customer Denailss.",
};

export default function BackofficePromotionNewPage() {
  return <PromotionCreateView />;
}
