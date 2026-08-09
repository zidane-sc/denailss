import type { Appointment } from "@/features/appointment/types";

/**
 * Income source data — Epic 7. Income is NEVER stored in Finance: it is
 * derived from completed appointments. `FINANCE_SEED_APPOINTMENTS` extends
 * the existing appointment mock with the historical months needed to make
 * monthly navigation and the month-over-month comparison feel real.
 *
 * This array is merged with the live backoffice appointments by
 * `getAllAppointments()` (in this file), so a completion made in the
 * dashboard/calendar shows up in Finance immediately. Swap for a real
 * repository call later without touching components.
 */
export const FINANCE_SEED_APPOINTMENTS: Appointment[] = [
  // ---- June 2026 (4 completed) ----
  { id: "BKG-2026-101", date: "2026-06-03", time: "10:00", durationMinutes: 90, services: [{ slug: "gel-extension", name: "Gel Extension" }], designSlug: "korean-milk-nail", designTitle: "Korean Milk Nail", price: 250000, customer: { name: "Alya Putri", phone: "081234567890" }, depositRequired: true, depositAmount: 50000, depositStatus: "approved", status: "completed" },
  { id: "BKG-2026-102", date: "2026-06-07", time: "13:00", durationMinutes: 60, services: [{ slug: "nail-art", name: "Nail Art" }], price: 165000, customer: { name: "Saskia Wijaya", phone: "081211223344" }, depositRequired: true, depositAmount: 50000, depositStatus: "approved", status: "completed" },
  { id: "BKG-2026-103", date: "2026-06-14", time: "15:30", durationMinutes: 45, services: [{ slug: "manicure", name: "Manicure" }], price: 90000, customer: { name: "Nadia Kusuma", phone: "081255667788" }, depositRequired: false, status: "completed" },
  { id: "BKG-2026-104", date: "2026-06-21", time: "11:00", durationMinutes: 120, services: [{ slug: "gel-extension", name: "Gel Extension" }], designSlug: "chrome-mirror-silver", designTitle: "Chrome Mirror Silver", price: 380000, customer: { name: "Fira Maharani", phone: "081298765432" }, depositRequired: true, depositAmount: 100000, depositStatus: "approved", status: "completed" },
  { id: "BKG-2026-105", date: "2026-06-28", time: "14:00", durationMinutes: 90, services: [{ slug: "fake-nail", name: "Fake Nail (Press-On)" }], designSlug: "sunset-ombre-coral", designTitle: "Sunset Ombre Coral", price: 300000, customer: { name: "Nadia Kusuma", phone: "081255667788" }, fulfillment: "pickup", depositRequired: false, status: "completed" },

  // ---- July 2026 (6 completed) ----
  { id: "BKG-2026-106", date: "2026-07-04", time: "09:30", durationMinutes: 60, services: [{ slug: "pedicure", name: "Pedicure" }], price: 110000, customer: { name: "Dian Sastrowardoyo", phone: "081122334455" }, depositRequired: false, status: "completed" },
  { id: "BKG-2026-107", date: "2026-07-08", time: "16:00", durationMinutes: 90, services: [{ slug: "gel-extension", name: "Gel Extension" }], designSlug: "3d-bow-charm-pink", designTitle: "3D Bow Charm Pink", price: 350000, customer: { name: "Bunga Citra Lestari", phone: "081288889999" }, depositRequired: true, depositAmount: 75000, depositStatus: "approved", status: "completed" },
  { id: "BKG-2026-108", date: "2026-07-13", time: "10:00", durationMinutes: 45, services: [{ slug: "manicure", name: "Manicure" }], price: 90000, customer: { name: "Pevita Pearce", phone: "081399990000" }, depositRequired: false, status: "completed" },
  { id: "BKG-2026-109", date: "2026-07-18", time: "13:30", durationMinutes: 60, services: [{ slug: "nail-art", name: "Nail Art" }], price: 195000, customer: { name: "Chelsea Islan", phone: "081344445555" }, depositRequired: true, depositAmount: 50000, depositStatus: "approved", status: "completed" },
  { id: "BKG-2026-110", date: "2026-07-22", time: "17:00", durationMinutes: 120, services: [{ slug: "gel-extension", name: "Gel Extension" }], designSlug: "korean-milk-nail", designTitle: "Korean Milk Nail", price: 400000, customer: { name: "Raisa Andriana", phone: "081155556666" }, depositRequired: true, depositAmount: 100000, depositStatus: "approved", status: "completed" },
  { id: "BKG-2026-111", date: "2026-07-26", time: "14:00", durationMinutes: 90, services: [{ slug: "fake-nail", name: "Fake Nail (Press-On)" }], designSlug: "chrome-mirror-silver", designTitle: "Chrome Mirror Silver", price: 180000, customer: { name: "Isyana Sarasvati", phone: "081266667777" }, fulfillment: "delivery", depositRequired: false, status: "completed" },
  { id: "BKG-2026-112", date: "2026-07-30", time: "11:00", durationMinutes: 90, services: [{ slug: "gel-extension", name: "Gel Extension" }], designSlug: "sunset-ombre-coral", designTitle: "Sunset Ombre Coral", price: 320000, customer: { name: "Alya Putri", phone: "081234567890" }, depositRequired: true, depositAmount: 100000, depositStatus: "approved", status: "completed" },

  // ---- August 2026 (8 completed; complements the live backoffice seed) ----
  { id: "BKG-2026-113", date: "2026-08-01", time: "10:00", durationMinutes: 90, services: [{ slug: "gel-extension", name: "Gel Extension" }], designSlug: "korean-milk-nail", designTitle: "Korean Milk Nail", price: 400000, customer: { name: "Fira Maharani", phone: "081298765432" }, depositRequired: true, depositAmount: 100000, depositStatus: "approved", status: "completed" },
  { id: "BKG-2026-114", date: "2026-08-02", time: "09:00", durationMinutes: 45, services: [{ slug: "manicure", name: "Manicure" }], price: 90000, customer: { name: "Nadia Kusuma", phone: "081255667788" }, depositRequired: false, status: "completed" },
  { id: "BKG-2026-115", date: "2026-08-02", time: "13:30", durationMinutes: 60, services: [{ slug: "nail-art", name: "Nail Art" }], designSlug: "3d-bow-charm-pink", designTitle: "3D Bow Charm Pink", price: 220000, customer: { name: "Saskia Wijaya", phone: "081211223344" }, depositRequired: true, depositAmount: 50000, depositStatus: "approved", status: "completed" },
  { id: "BKG-2026-116", date: "2026-08-05", time: "15:00", durationMinutes: 60, services: [{ slug: "pedicure", name: "Pedicure" }], price: 110000, customer: { name: "Bunga Citra Lestari", phone: "081288889999" }, depositRequired: false, status: "completed" },
  { id: "BKG-2026-117", date: "2026-08-06", time: "11:00", durationMinutes: 120, services: [{ slug: "gel-extension", name: "Gel Extension" }], designSlug: "3d-bow-charm-pink", designTitle: "3D Bow Charm Pink", price: 350000, customer: { name: "Pevita Pearce", phone: "081399990000" }, depositRequired: true, depositAmount: 100000, depositStatus: "approved", status: "completed" },
  { id: "BKG-2026-118", date: "2026-08-07", time: "16:30", durationMinutes: 90, services: [{ slug: "fake-nail", name: "Fake Nail (Press-On)" }], designSlug: "sunset-ombre-coral", designTitle: "Sunset Ombre Coral", price: 300000, customer: { name: "Raisa Andriana", phone: "081155556666" }, fulfillment: "pickup", depositRequired: false, status: "completed" },
  { id: "BKG-2026-119", date: "2026-08-08", time: "13:00", durationMinutes: 45, services: [{ slug: "manicure", name: "Manicure" }], price: 90000, customer: { name: "Chelsea Islan", phone: "081344445555" }, depositRequired: false, status: "completed" },
  { id: "BKG-2026-120", date: "2026-08-10", time: "10:30", durationMinutes: 120, services: [{ slug: "gel-extension", name: "Gel Extension" }], designSlug: "chrome-mirror-silver", designTitle: "Chrome Mirror Silver", price: 380000, customer: { name: "Isyana Sarasvati", phone: "081266667777" }, depositRequired: true, depositAmount: 100000, depositStatus: "approved", status: "completed" },
];

/**
 * All appointments finance reads from: the live backoffice list (which
 * already merges mock + same-session bookings) plus the historical finance
 * seed. Deduped by id so a completed appointment is never counted twice.
 */
export function getAllAppointments(liveAppointments: Appointment[]): Appointment[] {
  const byId = new Map<string, Appointment>();
  for (const a of [...liveAppointments, ...FINANCE_SEED_APPOINTMENTS]) {
    byId.set(a.id, a);
  }
  return Array.from(byId.values());
}
