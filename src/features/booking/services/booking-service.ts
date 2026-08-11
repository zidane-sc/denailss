import { and, eq, inArray, isNull, ne, sql } from "drizzle-orm";
import type { ApiAuthContext } from "@/lib/supabase/api-auth";
import { calculateDeposit, checkPromotion } from "@/features/booking/logic/pricing";
import { FREE_ADDON_BY_BODY_PART, NAIL_ART_SLUG } from "@/features/booking/logic/free-addon";
import { getAvailabilityConfig } from "@/features/booking/services/availability-service";
import { getDepositConfig } from "@/features/booking/services/deposit-service";
import { incrementPromotionUsage, getPromotionByCode } from "@/features/promotion/services/promotion-service";
import { ApiError } from "@/lib/api/errors";
import { getDb } from "@/db/client";
import { removeStorageReference } from "@/lib/storage";
import { appointmentAddOns, appointmentServices, appointments, customers, gallery, services } from "@/db/schema";
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

function toAppointment(
  row: typeof appointments.$inferSelect,
  customer: typeof customers.$inferSelect,
  items: typeof appointmentServices.$inferSelect[],
  addOns: typeof appointmentAddOns.$inferSelect[] = []
): Appointment {
  return {
    id: row.bookingCode,
    date: row.date ?? "",
    time: row.time ?? "",
    durationMinutes: row.durationMinutes,
    services: items.map((item) => ({
      slug: item.serviceSlug,
      name: item.serviceName,
      tierLabel: item.tierLabel ?? undefined,
      bodyPart: (item.bodyPart as "hand" | "foot" | undefined) ?? undefined,
    })),
    addOns: addOns.map((item) => ({
      slug: item.serviceSlug,
      name: item.serviceName,
      bodyPart: (item.bodyPart as "hand" | "foot"),
      price: 0,
    })),
    designSlug: row.designSlug ?? undefined,
    designTitle: row.designTitle ?? undefined,
    fulfillment: row.fulfillment ?? undefined,
    promoCode: row.promoCode ?? undefined,
    price: row.price,
    customerId: row.customerId ?? undefined,
    customer: { name: customer.name, phone: customer.phone, email: customer.email ?? undefined, instagram: customer.instagram ?? undefined, notes: customer.notes ?? undefined },
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
    const bodyPart = input.bodyPartByServiceSlug[service.slug] as "hand" | "foot" | undefined;
    if (service.slug === NAIL_ART_SLUG && !service.requiresPickup && !bodyPart) {
      throw new ApiError("VALIDATION_ERROR", "Pilih bagian tubuh untuk Nail Art (tangan/kaki).", 422);
    }
    return {
      service,
      tier,
      bodyPart,
      price: tier?.priceFrom ?? service.priceFrom,
      duration: tier?.durationMinutes ?? service.durationMinutes,
    };
  });

  // Free add-ons: nail art on hands bundles a manicure, nail art on feet a
  // pedicure. The add-on is always Rp0; its duration counts toward the slot.
  const addOns = resolved.flatMap((item) => {
    if (item.service.slug !== NAIL_ART_SLUG || !item.bodyPart) return [];
    const freebie = FREE_ADDON_BY_BODY_PART[item.bodyPart];
    const catalog = selected.find((s) => s?.slug === freebie.slug);
    if (!catalog) return [];
    return [{
      ...freebie,
      bodyPart: item.bodyPart,
      service: catalog,
      price: 0,
      duration: catalog.durationMinutes,
    }];
  });

  const durationMinutes = resolved.reduce((sum, item) => sum + item.duration, 0) +
    addOns.reduce((sum, item) => sum + item.duration, 0);
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

    // Resolve which customer row this booking binds to:
    //   1. Logged-in user → their account row (user_id = auth.userId).
    //   2. Anonymous guest → the anon row with this email (guests reusing an
    //      email across visits stay on one row, even if they later sign up).
    //   3. Fallback → the anon row with this phone (legacy/mock rows).
    //   4. Otherwise → create a fresh row.
    let customer: typeof customers.$inferSelect | undefined;
    if (auth.kind === "customer") {
      const [byUser] = await tx.select().from(customers).where(eq(customers.userId, auth.userId));
      if (byUser) customer = byUser;
    }
    if (!customer) {
      const [byEmail] = await tx.select().from(customers).where(and(eq(customers.email, input.customer.email ?? ""), isNull(customers.userId)));
      if (byEmail) customer = byEmail;
    }
    if (!customer) {
      const [byPhone] = await tx.select().from(customers).where(and(eq(customers.phone, input.customer.phone), isNull(customers.userId)));
      if (byPhone) customer = byPhone;
    }
    if (!customer) {
      const [created] = await tx.insert(customers).values({ userId: auth.kind === "customer" ? auth.userId : null, name: input.customer.name, phone: input.customer.phone, email: input.customer.email || null, instagram: input.customer.instagram || null, notes: input.customer.notes || null }).returning();
      customer = created;
    } else {
      const [updated] = await tx.update(customers).set({ name: input.customer.name, phone: input.customer.phone, email: input.customer.email || null, instagram: input.customer.instagram || null, notes: input.customer.notes || null, updatedAt: new Date() }).where(eq(customers.id, customer.id)).returning();
      if (updated) customer = updated;
    }
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
      bodyPart: item.bodyPart || null,
      price: item.price,
      durationMinutes: item.duration,
    }))).returning();

    const addOnRows = addOns.length > 0
      ? await tx.insert(appointmentAddOns).values(addOns.map((addOn) => ({
          appointmentId: appointment.id,
          serviceId: addOn.service.id,
          serviceSlug: addOn.slug,
          serviceName: addOn.name,
          bodyPart: addOn.bodyPart,
          price: 0,
        }))).returning()
      : [];

    if (input.deposit?.storagePath) {
      await forgetDepositUpload(input.deposit.storagePath);
    }

    return toAppointment(appointment, customer, items, addOnRows);
  });
}

async function mapRows(rows: (typeof appointments.$inferSelect)[]) {
  const db = getDb();
  const result: Appointment[] = [];
  for (const row of rows) {
    const [customer] = await db.select().from(customers).where(eq(customers.id, row.customerId));
    const items = await db.select().from(appointmentServices).where(eq(appointmentServices.appointmentId, row.id));
    const addOns = await db.select().from(appointmentAddOns).where(eq(appointmentAddOns.appointmentId, row.id));
    if (customer) result.push(toAppointment(row, customer, items, addOns));
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

/** Count of completed (fulfilled) appointments — feeds the hero trust counter. */
export async function countCompletedBookings(): Promise<number> {
  const db = getDb();
  const [row] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(appointments)
    .where(eq(appointments.status, "completed"));
  return row?.count ?? 0;
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

/**
 * Real booked slots grouped by date, for the customer booking availability
 * engine. Includes every slot-reserving status (confirmed, waiting
 * verification, pending deposit, pending) — an appointment's [start, end]
 * occupies that window.
 */
export async function getBookedSlotsByDate(): Promise<Record<string, { start: string; end: string }[]>> {
  const db = getDb();
  const rows = await db.select({
    date: appointments.date,
    startTime: appointments.time,
    durationMinutes: appointments.durationMinutes,
  }).from(appointments).where(
    inArray(appointments.status, ["confirmed", "waiting_verification", "pending_deposit", "pending"])
  );

  const byDate: Record<string, { start: string; end: string }[]> = {};
  for (const row of rows) {
    if (!row.date || !row.startTime) continue;
    const end = toMinutes(row.startTime) + (row.durationMinutes ?? 0);
    const endTime = `${String(Math.floor(end / 60)).padStart(2, "0")}:${String(end % 60).padStart(2, "0")}`;
    (byDate[row.date] ??= []).push({ start: row.startTime, end: endTime });
  }
  return byDate;
}
