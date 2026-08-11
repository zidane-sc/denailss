import "server-only";
import { desc, eq, sql } from "drizzle-orm";
import { getDb } from "@/db/client";
import { appointmentServices, appointments, customers, reviews } from "@/db/schema";
import { rowToReview } from "@/db/dto";
import { ApiError } from "@/lib/api/errors";
import type { Review } from "@/types";

/** Public review list (newest first), customer name + booking code joined. */
export async function listReviews(): Promise<Review[]> {
  const rows = await getDb()
    .select({
      review: reviews,
      customerName: customers.name,
      bookingCode: appointments.bookingCode,
    })
    .from(reviews)
    .innerJoin(customers, eq(customers.id, reviews.customerId))
    .innerJoin(appointments, eq(appointments.id, reviews.appointmentId))
    .orderBy(desc(reviews.createdAt));
  return rows.map((r) => rowToReview(r.review, r.customerName, r.bookingCode));
}

export async function getReviewSummary() {
  const db = getDb();
  const [row] = await db
    .select({ total: sql<number>`count(*)::int`, average: sql<number>`avg(rating)::float` })
    .from(reviews);
  const total = row?.total ?? 0;
  const average = total > 0 ? Math.round(((row?.average as number) ?? 0) * 10) / 10 : 0;
  return { total, average };
}

/**
 * Create a review for a completed booking owned by the authenticated customer.
 */
export async function createReview(input: { bookingCode: string; rating: number; comment: string }, customerId: string): Promise<Review> {
  const db = getDb();
  const [appointment] = await db
    .select({ id: appointments.id, customerId: appointments.customerId, status: appointments.status })
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
    })
    .returning();
  if (!inserted) throw new ApiError("INTERNAL_ERROR", "Ulasan tidak dapat disimpan.", 500);

  const [customer] = await db.select({ name: customers.name }).from(customers).where(eq(customers.id, customerId));
  return rowToReview(inserted, customer?.name ?? "Customer");
}
