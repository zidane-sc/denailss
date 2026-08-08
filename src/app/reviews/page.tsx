import type { Metadata } from "next";
import { ReviewsExplorer } from "@/features/reviews/components/reviews-explorer";

export const metadata: Metadata = {
  title: "Ulasan Pelanggan | Denailss",
  description:
    "Lihat testimoni jujur dan rating kepuasan dari pelanggan setia yang telah merasakan treatment kuku premium di Denailss.",
};

export default function ReviewsPage() {
  return <ReviewsExplorer />;
}
