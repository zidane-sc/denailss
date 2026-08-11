import "server-only";
import { desc, eq, sql } from "drizzle-orm";
import { getDb } from "@/db/client";
import { appointmentServices, appointments, customers, reviews } from "@/db/schema";
import { rowToReview } from "@/db/dto";
import { ApiError } from "@/lib/api/errors";
import type { Review } from "@/types";
import { BASELINE_REVIEW_COUNT, DEFAULT_REVIEWS } from "../constants/review-baseline";

/** Public review list (newest first), customer name + booking code + visit date joined. */
export async function listReviews(): Promise<Review[]> {
  const rows = await getDb()
    .select({
      review: reviews,
      customerName: customers.name,
      bookingCode: appointments.bookingCode,
      visitDate: appointments.date,
    })
    .from(reviews)
    .innerJoin(customers, eq(customers.id, reviews.customerId))
    .innerJoin(appointments, eq(appointments.id, reviews.appointmentId))
    .orderBy(desc(reviews.createdAt));
  const live = rows.map((r) => rowToReview(r.review, r.customerName, r.visitDate ?? r.review.createdAt.toISOString().slice(0, 10), r.bookingCode));
  return [...live, ...DEFAULT_REVIEWS.map((r) => ({ ...r, id: `default-${r.customerName.toLowerCase()}` }))];
}

export async function getReviewSummary() {
  const db = getDb();
  const [row] = await db
    .select({ total: sql<number>`count(*)::int`, average: sql<number>`avg(rating)::float` })
    .from(reviews);
  const liveTotal = row?.total ?? 0;
  const liveAverage = liveTotal > 0 ? (row?.average as number) ?? 0 : 0;
  // Baseline is a fixed 300 five-star reviews, merged with the live average.
  const total = liveTotal + BASELINE_REVIEW_COUNT;
  const average = total > 0 ? (liveTotal * liveAverage + BASELINE_REVIEW_COUNT * 5) / total : 5;
  return { total, average: Math.round(average * 10) / 10 };
}

/**
 * Create a review for a completed booking owned by the authenticated customer.
 */
export async function createReview(input: { bookingCode: string; rating: number; comment: string; photoSeed?: string | null }, customerId: string): Promise<Review> {
  const db = getDb();
  const [appointment] = await db
    .select({ id: appointments.id, customerId: appointments.customerId, status: appointments.status, date: appointments.date })
    .from(appointments)
    .where(eq(appointments.bookingCode, input.bookingCode));

  if (!appointment) throw new ApiError("NOT_FOUND", "Booking tidak ditemukan.", 404);
  if (appointment.customerId !== customerId) {
    throw new ApiError("FORBIDDEN", "Ulasan hanya bisa dibuat untuk booking milikmu.", 403);
  }
  if (appointment.status !== "completed") {
    throw new ApiError("VALIDATION_ERROR", "Ulasan hanya bisa diberikan untuk booking yang sudah selesai.", 422);
  }

  const [existing] = await db
    .select({ id: reviews.id })
    .from(reviews)
    .where(eq(reviews.appointmentId, appointment.id))
    .limit(1);
  if (existing) throw new ApiError("CONFLICT", "Booking ini sudah pernah diulas.", 409);

  const serviceRows = await db
    .select({ serviceSlug: appointmentServices.serviceSlug })
    .from(appointmentServices)
    .where(eq(appointmentServices.appointmentId, appointment.id))
    .limit(1);
  const serviceSlug = serviceRows[0]?.serviceSlug ?? "manicure";

  const [inserted] = await db
    .insert(reviews)
    .values({
      appointmentId: appointment.id,
      customerId,
      serviceSlug,
      rating: input.rating,
      comment: input.comment.trim(),
      photoSeed: input.photoSeed ?? null,
    })
    .returning();
  if (!inserted) throw new ApiError("INTERNAL_ERROR", "Ulasan tidak dapat disimpan.", 500);

  const [customer] = await db.select({ name: customers.name }).from(customers).where(eq(customers.id, customerId));
  return rowToReview(inserted, customer?.name ?? "Customer", appointment.date ?? inserted.createdAt.toISOString().slice(0, 10), input.bookingCode);
}
