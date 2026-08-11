import type { Metadata } from "next";
import { ReviewsExplorer } from "@/features/reviews/components/reviews-explorer";
import { listReviews, getReviewSummary } from "@/features/reviews/services/review-service";
import { DEFAULT_REVIEWS, BASELINE_REVIEW_COUNT } from "@/features/reviews/constants/review-baseline";

export const metadata: Metadata = {
  title: "Ulasan Pelanggan | Denailss",
  description:
    "Lihat testimoni jujur dan rating kepuasan dari pelanggan setia yang telah merasakan treatment kuku premium di Denailss.",
  alternates: {
    canonical: "/reviews",
  },
};

export default async function ReviewsPage() {
  // Seed the explorer server-side (defaults + live) so stats, distribution,
  // and the review grid render on first paint; the client provider refreshes.
  let initialReviews: Awaited<ReturnType<typeof listReviews>> = [];
  let initialSummary: { total: number; average: number } | null = null;
  try {
    const [reviews, summary] = await Promise.all([listReviews(), getReviewSummary()]);
    initialReviews = reviews;
    initialSummary = summary;
  } catch {
    initialReviews = DEFAULT_REVIEWS.map((r) => ({ ...r, id: `default-${r.customerName.toLowerCase()}` }));
    initialSummary = { total: BASELINE_REVIEW_COUNT, average: 5 };
  }

  return <ReviewsExplorer initialReviews={initialReviews} initialSummary={initialSummary} />;
}
