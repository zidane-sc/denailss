import type { Metadata } from "next";
import { BookingFlow } from "@/features/booking/components/booking-flow";

export const metadata: Metadata = {
  title: "Booking",
  description: "Booking appointment nail art di Denailss dalam beberapa langkah mudah.",
  alternates: {
    canonical: "/booking",
  },
};

export default async function BookingPage({ searchParams }: PageProps<"/booking">) {
  const params = await searchParams;
  const service = typeof params.service === "string" ? params.service : null;
  const design = typeof params.design === "string" ? params.design : null;
  const promo = typeof params.promo === "string" ? params.promo : null;

  return (
    <BookingFlow initialServiceSlug={service} initialDesignSlug={design} initialPromoCode={promo} />
  );
}
