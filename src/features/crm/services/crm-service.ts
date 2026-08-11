import "server-only";
import { asc, eq } from "drizzle-orm";
import { getDb } from "@/db/client";
import { appointmentServices, appointments, customerNotes, customers, reviews } from "@/db/schema";
import { ApiError } from "@/lib/api/errors";
import type { CrmAppointment, CrmCustomer, CrmReview, CustomerPreferences } from "../types";

interface AppointmentRow {
  id: string;
  bookingCode: string;
  date: string | null;
  time: string | null;
  designSlug: string | null;
  designTitle: string | null;
  price: number;
  status: string;
  cancellationReason: string | null;
  notes: string | null;
  customerId: string;
  serviceSlug: string;
  serviceName: string;
}

function toCrmAppointment(row: AppointmentRow): CrmAppointment {
  return {
    id: row.bookingCode,
    date: row.date ?? "",
    time: row.time ?? "",
    serviceSlug: row.serviceSlug,
    serviceName: row.serviceName,
    designSlug: row.designSlug ?? undefined,
    designTitle: row.designTitle ?? undefined,
    price: row.price,
    status: row.status as CrmAppointment["status"],
    cancellationReason: row.cancellationReason ?? undefined,
    appointmentUrl: `/backoffice/appointments/${row.bookingCode}`,
    note: row.notes ?? undefined,
  };
}

function toCrmReview(row: typeof reviews.$inferSelect, serviceName: string): CrmReview {
  return {
    id: row.id,
    rating: row.rating as CrmReview["rating"],
    comment: row.comment,
    date: row.createdAt.toISOString().slice(0, 10),
    serviceName,
    photoSeed: row.photoSeed ?? undefined,
  };
}

export type CrmCustomerWithData = CrmCustomer & {
  appointments: CrmAppointment[];
  reviews: CrmReview[];
};

/** All DB customers with their appointment history, reviews, notes, preferences. */
export async function listCrmCustomers(): Promise<CrmCustomerWithData[]> {
  const db = getDb();
  const customerRows = await db.select().from(customers).orderBy(asc(customers.name));

  const notesRows = await db.select().from(customerNotes);
  const notesByCustomer = new Map(notesRows.map((n) => [n.customerId, n.content]));

  const reviewRows = await db.select().from(reviews);
  const reviewsByCustomer = new Map<string, typeof reviews.$inferSelect[]>();
  for (const r of reviewRows) {
    const list = reviewsByCustomer.get(r.customerId) ?? [];
    list.push(r);
    reviewsByCustomer.set(r.customerId, list);
  }

  const serviceNames = new Map(
    (await db.select({ id: appointmentServices.serviceId, name: appointmentServices.serviceName }).from(appointmentServices)).map((s) => [s.id, s.name])
  );

  const apptRows = await db
    .select({
      id: appointments.id,
      bookingCode: appointments.bookingCode,
      date: appointments.date,
      time: appointments.time,
      designSlug: appointments.designSlug,
      designTitle: appointments.designTitle,
      price: appointments.price,
      status: appointments.status,
      cancellationReason: appointments.notes,
      notes: appointments.notes,
      customerId: appointments.customerId,
      serviceSlug: appointmentServices.serviceSlug,
      serviceName: appointmentServices.serviceName,
    })
    .from(appointments)
    .innerJoin(appointmentServices, eq(appointmentServices.appointmentId, appointments.id))
    .orderBy(asc(appointments.date));

  const appointmentsByCustomer = new Map<string, AppointmentRow[]>();
  for (const row of apptRows) {
    const list = appointmentsByCustomer.get(row.customerId) ?? [];
    list.push(row as AppointmentRow);
    appointmentsByCustomer.set(row.customerId, list);
  }

  return customerRows.map((c) => {
    const customerAppointments = (appointmentsByCustomer.get(c.id) ?? []).map(toCrmAppointment);
    const customerReviews = (reviewsByCustomer.get(c.id) ?? []).map((r) => toCrmReview(r, serviceNames.get(r.serviceSlug) ?? r.serviceSlug));
    const since = customerAppointments.map((a) => a.date).filter(Boolean).sort()[0];
    return {
      id: c.id,
      name: c.name,
      phone: c.phone,
      email: c.email ?? undefined,
      instagram: c.instagram ?? undefined,
      since: since ?? new Date(c.createdAt).toISOString().slice(0, 10),
      notes: notesByCustomer.get(c.id) ?? c.notes ?? undefined,
      preferences: (c.preferences as CustomerPreferences | null) ?? undefined,
      appointments: customerAppointments,
      reviews: customerReviews,
    };
  });
}

export async function getCrmCustomer(id: string): Promise<CrmCustomerWithData | null> {
  const all = await listCrmCustomers();
  return all.find((c) => c.id === id) ?? null;
}

export async function updateCustomerNotes(customerId: string, content: string) {
  const db = getDb();
  const [customer] = await db.select({ id: customers.id }).from(customers).where(eq(customers.id, customerId));
  if (!customer) throw new ApiError("NOT_FOUND", "Pelanggan tidak ditemukan.", 404);
  await db
    .insert(customerNotes)
    .values({ customerId, content, updatedAt: new Date() })
    .onConflictDoUpdate({ target: customerNotes.customerId, set: { content, updatedAt: new Date() } });
  return { content };
}

export async function updateCustomerPreferences(customerId: string, preferences: CustomerPreferences) {
  const db = getDb();
  const [customer] = await db.select({ id: customers.id }).from(customers).where(eq(customers.id, customerId));
  if (!customer) throw new ApiError("NOT_FOUND", "Pelanggan tidak ditemukan.", 404);
  await db.update(customers).set({ preferences, updatedAt: new Date() }).where(eq(customers.id, customerId));
  return preferences;
}
