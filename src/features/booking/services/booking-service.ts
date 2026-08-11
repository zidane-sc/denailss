import { and, eq, inArray, ne } from "drizzle-orm";
import type { ApiAuthContext } from "@/lib/supabase/api-auth";
import { calculateDeposit, checkPromotion } from "@/features/booking/logic/pricing";
import { getAvailabilityConfig } from "@/features/booking/services/availability-service";
import { getDepositConfig } from "@/features/booking/services/deposit-service";
import { incrementPromotionUsage, getPromotionByCode } from "@/features/promotion/services/promotion-service";
import { ApiError } from "@/lib/api/errors";
import { getDb } from "@/db/client";
import { removeStorageReference } from "@/lib/storage";
import { appointmentServices, appointments, customers, gallery, services } from "@/db/schema";
import { forgetDepositUpload } from "./deposit-proof-service";
import type { Appointment } from "@/features/appointment/types";
import type { CreateBookingInput, UpdateBookingInput } from "../schemas/api";

function bookingCode() {
  const date = new Date().toISOString().slice(0, 10).replaceAll("-", "");
  return `DNL-${date}-${crypto.randomUUID().slice(0, 4).toUpperCase()}`;
}

/** "HH:MM" → minutes since midnight. */
function toMinutes(time: string) {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

/** Slot-conflict check: an existing appointment blocks [start - buffer, end + buffer] and conflicts with [newStart, newEnd]. */
function hasSlotConflict(
  occupied: { id: string; startTime: string | null; durationMinutes: number }[],
  newStart: number,
  newEnd: number,
  bufferMinutes: number,
  excludeId?: string
) {
  return occupied.some((appt) => {
    if (!appt.startTime || appt.id === excludeId) return false;
    const existingStart = toMinutes(appt.startTime);
    const existingEnd = existingStart + (appt.durationMinutes ?? 0);
    return newStart < existingEnd + bufferMinutes && existingStart - bufferMinutes < newEnd;
  });
}

function toAppointment(row: typeof appointments.$inferSelect, customer: typeof customers.$inferSelect, items: typeof appointmentServices.$inferSelect[]): Appointment {
  return {
    id: row.bookingCode,
    date: row.date ?? "",
    time: row.time ?? "",
    durationMinutes: row.durationMinutes,
    services: items.map((item) => ({ slug: item.serviceSlug, name: item.serviceName, tierLabel: item.tierLabel ?? undefined })),
    designSlug: row.designSlug ?? undefined,
    designTitle: row.designTitle ?? undefined,
    fulfillment: row.fulfillment ?? undefined,
    promoCode: row.promoCode ?? undefined,
    price: row.price,
    customerId: row.customerId ?? undefined,
    customer: { name: customer.name, phone: customer.phone, email: customer.email ?? undefined, notes: customer.notes ?? undefined },
    depositRequired: row.depositRequired,
    depositAmount: row.depositAmount ?? undefined,
    depositProofUrl: row.depositProofUrl ?? undefined,
    depositStatus: row.depositStatus ?? undefined,
    depositRejectReason: row.depositRejectReason ?? undefined,
    status: row.status,
    notes: row.notes ?? undefined,
  };
}

function assertSchedule(
  input: CreateBookingInput,
  durationMinutes: number,
  requiresPickup: boolean,
  minimumNoticeHours: number
) {
  if (requiresPickup) {
    if (!input.fulfillment) throw new ApiError("VALIDATION_ERROR", "Pilih metode pengambilan pesanan.", 422);
    return;
  }
  if (!input.dateKey || !input.time) throw new ApiError("VALIDATION_ERROR", "Tanggal dan waktu wajib dipilih.", 422);
  const date = new Date(`${input.dateKey}T${input.time}:00`);
  if (Number.isNaN(date.valueOf())) throw new ApiError("VALIDATION_ERROR", "Tanggal atau waktu tidak valid.", 422);
  const now = new Date();
  const diffHours = (date.valueOf() - now.valueOf()) / 3_600_000;
  if (diffHours < minimumNoticeHours) {
    throw new ApiError("CONFLICT", "Waktu booking sudah terlalu dekat dengan jam sekarang.", 409);
  }
  if (durationMinutes <= 0) throw new ApiError("VALIDATION_ERROR", "Durasi booking tidak valid.", 422);
}

export async function createBooking(input: CreateBookingInput, auth: ApiAuthContext = { kind: "anonymous" }) {
  if (auth.kind === "owner") throw new ApiError("FORBIDDEN", "Owner tidak dapat membuat booking customer.", 403);
  const db = getDb();
  const [availability, deposit] = await Promise.all([getAvailabilityConfig(), getDepositConfig()]);
  const { minimumNoticeHours, maxBookingsPerDay } = availability.bookingRules;
  const catalog = await db.select().from(services).where(eq(services.active, true));
  const selected = input.serviceSlugs.map((slug) => catalog.find((service) => service.slug === slug));
  if (selected.some((service) => !service)) throw new ApiError("VALIDATION_ERROR", "Ada layanan yang sudah tidak tersedia.", 422);

  const resolved = selected.map((service) => {
    if (!service) throw new ApiError("VALIDATION_ERROR", "Layanan tidak ditemukan.", 422);
    const tiers = (service.tiers as { key: string; label: string; priceFrom: number; durationMinutes: number }[]) ?? [];
    const tierKey = input.tierByServiceSlug[service.slug];
    const tier = tierKey ? tiers.find((item) => item.key === tierKey) : undefined;
    if (tiers.length > 0 && !tier) throw new ApiError("VALIDATION_ERROR", `Pilih tingkat untuk ${service.name}.`, 422);
    return {
      service,
      tier,
      price: tier?.priceFrom ?? service.priceFrom,
      duration: tier?.durationMinutes ?? service.durationMinutes,
    };
  });

  const durationMinutes = resolved.reduce((sum, item) => sum + item.duration, 0);
  const requiresPickup = resolved.some((item) => item.service.requiresPickup);
  assertSchedule(input, durationMinutes, requiresPickup, minimumNoticeHours);

  let designTitle: string | undefined;
  if (input.designSlug) {
    const [design] = await db.select().from(gallery).where(eq(gallery.slug, input.designSlug));
    if (!design) throw new ApiError("VALIDATION_ERROR", "Desain yang dipilih tidak ditemukan.", 422);
    designTitle = design.title;
  }

  const subtotal = resolved.reduce((sum, item) => sum + item.price, 0);
  const promotion = input.promoCode ? await getPromotionByCode(input.promoCode) : null;
  const promoResult = promotion ? checkPromotion(promotion, { serviceSlugs: input.serviceSlugs, subtotal }) : null;
  if (input.promoCode && (!promotion || !promoResult?.valid)) {
    throw new ApiError("VALIDATION_ERROR", promoResult?.reason ?? "Kode promo tidak valid.", 422);
  }
  const discount = promoResult?.discount ?? 0;
  const price = Math.max(subtotal - discount, 0);
  const depositRequired = deposit.enabled && resolved.some((item) => item.service.depositApplicable);
  const depositAmount = depositRequired ? calculateDeposit(price, deposit) : undefined;
  const status = depositRequired ? (input.deposit ? "waiting_verification" : "pending_deposit") : "confirmed";

  return db.transaction(async (tx) => {
    if (input.dateKey && input.time) {
      const { bufferMinutes } = availability.bookingRules;
      const newStart = toMinutes(input.time);
      const newEnd = newStart + durationMinutes;

      // Occupied statuses: everything that reserves a slot on the day.
      const occupied = await tx.select({
        id: appointments.id,
        startTime: appointments.time,
        durationMinutes: appointments.durationMinutes,
      }).from(appointments).where(
        and(
          eq(appointments.date, input.dateKey),
          inArray(appointments.status, ["confirmed", "waiting_verification", "pending_deposit", "pending"])
        )
      );

      // Day capacity: the daily cap counts every occupied slot, overlapping or not.
      if (occupied.length >= maxBookingsPerDay) {
        throw new ApiError("CONFLICT", "Tanggal booking sudah penuh.", 409);
      }

      // Per-slot overlap: an existing appointment blocks [start - buffer, end + buffer]
      // and conflicts if it intersects [newStart, newEnd].
      if (hasSlotConflict(occupied, newStart, newEnd, bufferMinutes)) {
        throw new ApiError("CONFLICT", "Slot yang dipilih bertabrakan dengan booking lain.", 409);
      }
    }

    const [existingCustomer] = auth.kind === "customer"
      ? await tx.select().from(customers).where(eq(customers.userId, auth.userId))
      : await tx.select().from(customers).where(eq(customers.phone, input.customer.phone));
    const [customer] = existingCustomer
      ? await tx.update(customers).set({ name: input.customer.name, phone: input.customer.phone, email: input.customer.email || null, notes: input.customer.notes || null, updatedAt: new Date() }).where(eq(customers.id, existingCustomer.id)).returning()
      : await tx.insert(customers).values({ userId: auth.kind === "customer" ? auth.userId : null, name: input.customer.name, phone: input.customer.phone, email: input.customer.email || null, notes: input.customer.notes || null }).returning();
    if (!customer) throw new ApiError("INTERNAL_ERROR", "Customer tidak dapat disimpan.", 500);

    const [appointment] = await tx.insert(appointments).values({
      bookingCode: bookingCode(),
      customerId: customer.id,
      date: input.dateKey || null,
      time: input.time || null,
      durationMinutes,
      designSlug: input.designSlug || null,
      designTitle: designTitle ?? null,
      fulfillment: input.fulfillment ?? null,
      promoCode: promotion?.code ?? null,
      subtotal,
      discount,
      price,
      depositRequired,
      depositAmount: depositAmount ?? null,
      depositProofUrl: input.deposit?.storagePath ?? null,
      depositStatus: input.deposit ? "waiting_verification" : null,
      status,
      notes: input.customer.notes || null,
    }).returning();
    if (!appointment) throw new ApiError("INTERNAL_ERROR", "Booking tidak dapat disimpan.", 500);

    if (promotion) {
      await incrementPromotionUsage(promotion.code);
    }

    const items = await tx.insert(appointmentServices).values(resolved.map((item) => ({
      appointmentId: appointment.id,
      serviceId: item.service.id,
      serviceSlug: item.service.slug,
      serviceName: item.service.name,
      tierKey: input.tierByServiceSlug[item.service.slug] || null,
      tierLabel: item.tier?.label || null,
      price: item.price,
      durationMinutes: item.duration,
    }))).returning();

    if (input.deposit?.storagePath) {
      await forgetDepositUpload(input.deposit.storagePath);
    }

    return toAppointment(appointment, customer, items);
  });
}

async function mapRows(rows: (typeof appointments.$inferSelect)[]) {
  const db = getDb();
  const result: Appointment[] = [];
  for (const row of rows) {
    const [customer] = await db.select().from(customers).where(eq(customers.id, row.customerId));
    const items = await db.select().from(appointmentServices).where(eq(appointmentServices.appointmentId, row.id));
    if (customer) result.push(toAppointment(row, customer, items));
  }
  return result;
}

export async function listBookings(auth: ApiAuthContext) {
  if (auth.kind === "anonymous") throw new ApiError("UNAUTHORIZED", "Silakan masuk terlebih dahulu.", 401);
  const db = getDb();
  if (auth.kind === "owner") {
    return mapRows(await db.select().from(appointments).orderBy(appointments.createdAt));
  }
  if (!auth.customerId) throw new ApiError("FORBIDDEN", "Profil customer belum siap.", 403);
  return mapRows(await db.select().from(appointments).where(eq(appointments.customerId, auth.customerId)).orderBy(appointments.createdAt));
}

export async function listOwnerBookings() {
  return listBookings({ kind: "owner", userId: "system" });
}

export async function listCustomerBookings(customerId: string) {
  const db = getDb();
  return mapRows(await db.select().from(appointments).where(eq(appointments.customerId, customerId)).orderBy(appointments.createdAt));
}

export async function getBooking(bookingCodeValue: string, auth: ApiAuthContext) {
  if (auth.kind === "anonymous") throw new ApiError("UNAUTHORIZED", "Silakan masuk terlebih dahulu.", 401);
  const db = getDb();
  const conditions = [eq(appointments.bookingCode, bookingCodeValue)];
  if (auth.kind === "customer") {
    if (!auth.customerId) throw new ApiError("FORBIDDEN", "Profil customer belum siap.", 403);
    conditions.push(eq(appointments.customerId, auth.customerId));
  }
  const [current] = await db.select().from(appointments).where(and(...conditions));
  if (!current) throw new ApiError("NOT_FOUND", "Booking tidak ditemukan.", 404);
  const mapped = await mapRows([current]);
  return mapped[0];
}

export async function updateBooking(bookingCodeValue: string, input: UpdateBookingInput, auth: ApiAuthContext) {
  if (auth.kind !== "owner") throw new ApiError("FORBIDDEN", "Akses owner diperlukan.", 403);
  const db = getDb();
  const [current] = await db.select().from(appointments).where(eq(appointments.bookingCode, bookingCodeValue));
  if (!current) throw new ApiError("NOT_FOUND", "Booking tidak ditemukan.", 404);

  // Reschedule conflict check: the new slot must not overlap another booking on that day.
  const newDate = input.dateKey === undefined ? current.date : input.dateKey;
  const newTime = input.time === undefined ? current.time : input.time;
  if (newDate && newTime && (input.dateKey !== undefined || input.time !== undefined)) {
    const availability = await getAvailabilityConfig();
    const { bufferMinutes } = availability.bookingRules;
    const newStart = toMinutes(newTime);
    const newEnd = newStart + current.durationMinutes;
    const occupied = await db.select({
      id: appointments.id,
      startTime: appointments.time,
      durationMinutes: appointments.durationMinutes,
    }).from(appointments).where(
      and(
        eq(appointments.date, newDate),
        inArray(appointments.status, ["confirmed", "waiting_verification", "pending_deposit", "pending"]),
        ne(appointments.id, current.id)
      )
    );
    if (hasSlotConflict(occupied, newStart, newEnd, bufferMinutes)) {
      throw new ApiError("CONFLICT", "Slot yang dipilih bertabrakan dengan booking lain.", 409);
    }
  }

  const [updated] = await db.update(appointments).set({
    status: input.status ?? current.status,
    date: input.dateKey === undefined ? current.date : input.dateKey,
    time: input.time === undefined ? current.time : input.time,
    depositStatus: input.depositStatus ?? current.depositStatus,
    depositRejectReason: input.depositRejectReason === undefined ? current.depositRejectReason : input.depositRejectReason,
    updatedAt: new Date(),
  }).where(eq(appointments.id, current.id)).returning();

  // Rejection cleanup: remove the proof storage object and clear its reference
  // so a rejected proof is not kept on the appointment forever.
  if (input.depositStatus === "rejected" && current.depositProofUrl) {
    await removeStorageReference(current.depositProofUrl).catch(() => {});
    await db.update(appointments).set({ depositProofUrl: null }).where(eq(appointments.id, current.id));
  }

  const mapped = updated ? await mapRows([updated]) : [];
  if (!mapped[0]) throw new ApiError("INTERNAL_ERROR", "Booking tidak dapat diperbarui.", 500);
  return mapped[0];
}
