import type { Appointment } from "@/features/appointment/types";
import { FINANCE_SEED_APPOINTMENTS } from "@/features/finance/data/finance-appointments.mock";

/**
 * Analytics appointment source — Epic 8.
 *
 * Analytics reads the same shared appointment seam as Finance (Epic 7):
 * the live backoffice list + the finance historical seed, deduped by id.
 * That guarantees a completed appointment produces exactly one income row
 * and one analytics revenue figure — no separate numbers for the same event.
 *
 * The finance seed already covers completed bookings across June-August 2026.
 * This file only adds the extra records the analytics view needs to be
 * meaningful: cancellations, no-shows, and completed bookings for repeat
 * customers — all reusing existing services/designs/prices. Nothing here
 * duplicates an appointment that already exists.
 */
export const ANALYTICS_SEED_APPOINTMENTS: Appointment[] = [
  // ---- Cancellations (May-August) ----
  { id: "BKG-2026-201", date: "2026-05-02", time: "14:00", durationMinutes: 60, services: [{ slug: "nail-art", name: "Nail Art" }], designSlug: "korean-jelly-pink", designTitle: "Korean Jelly Pink", price: 165000, customer: { name: "Saskia Wijaya", phone: "081211223344" }, depositRequired: false, status: "cancelled" },
  { id: "BKG-2026-202", date: "2026-05-17", time: "10:00", durationMinutes: 120, services: [{ slug: "gel-extension", name: "Gel Extension" }], price: 250000, customer: { name: "Kirana Purnama", phone: "081845566778" }, depositRequired: false, status: "cancelled" },
  { id: "BKG-2026-203", date: "2026-05-23", time: "19:00", durationMinutes: 60, services: [{ slug: "manicure", name: "Manicure" }], price: 90000, customer: { name: "Saskia Wijaya", phone: "081211223344" }, depositRequired: false, status: "cancelled" },
  { id: "BKG-2026-204", date: "2026-06-06", time: "16:00", durationMinutes: 60, services: [{ slug: "nail-art", name: "Nail Art" }], designSlug: "party-glitter-fuchsia", designTitle: "Party Glitter Fuchsia", price: 190000, customer: { name: "Dianita Ramadhani", phone: "081377778945" }, depositRequired: false, status: "cancelled" },
  { id: "BKG-2026-205", date: "2026-06-11", time: "13:00", durationMinutes: 60, services: [{ slug: "manicure", name: "Manicure" }], price: 90000, customer: { name: "Fajar Ramadhan", phone: "081922233445" }, depositRequired: false, status: "cancelled" },
  { id: "BKG-2026-206", date: "2026-06-27", time: "15:30", durationMinutes: 120, services: [{ slug: "gel-extension", name: "Gel Extension" }], designSlug: "milky-french-almond", designTitle: "Milky French Almond", price: 400000, customer: { name: "Dianita Ramadhani", phone: "081377778945" }, depositRequired: false, status: "cancelled" },
  { id: "BKG-2026-207", date: "2026-07-11", time: "09:00", durationMinutes: 45, services: [{ slug: "manicure", name: "Manicure" }], price: 90000, customer: { name: "Nadia Kusuma", phone: "081255667788" }, depositRequired: false, status: "cancelled" },
  { id: "BKG-2026-208", date: "2026-07-19", time: "17:00", durationMinutes: 60, services: [{ slug: "fake-nail", name: "Fake Nail (Press-On)" }], designSlug: "black-chrome-edge", designTitle: "Black Chrome Edge", price: 190000, customer: { name: "Fajar Ramadhan", phone: "081922233445" }, fulfillment: "delivery", depositRequired: false, status: "cancelled" },
  { id: "BKG-2026-209", date: "2026-08-03", time: "11:30", durationMinutes: 60, services: [{ slug: "pedicure", name: "Pedicure" }], price: 110000, customer: { name: "Dianita Ramadhani", phone: "081377778945" }, depositRequired: false, status: "cancelled" },
  { id: "BKG-2026-210", date: "2026-08-08", time: "14:30", durationMinutes: 90, services: [{ slug: "gel-extension", name: "Gel Extension" }], designSlug: "classic-french-tip", designTitle: "Classic French Tip", price: 350000, customer: { name: "Kirana Purnama", phone: "081845566778" }, depositRequired: false, status: "cancelled" },
  { id: "BKG-2026-211", date: "2026-08-14", time: "10:00", durationMinutes: 120, services: [{ slug: "gel-extension", name: "Gel Extension" }], price: 250000, customer: { name: "Fajar Ramadhan", phone: "081922233445" }, depositRequired: false, status: "cancelled" },
  { id: "BKG-2026-212", date: "2026-08-22", time: "16:00", durationMinutes: 60, services: [{ slug: "nail-art", name: "Nail Art" }], designSlug: "pastel-cloud-korean", designTitle: "Pastel Cloud Korean", price: 240000, customer: { name: "Dianita Ramadhani", phone: "081377778945" }, depositRequired: false, status: "cancelled" },

  // ---- No-shows ----
  { id: "BKG-2026-213", date: "2026-05-09", time: "18:00", durationMinutes: 60, services: [{ slug: "nail-art", name: "Nail Art" }], price: 120000, customer: { name: "Kirana Purnama", phone: "081845566778" }, depositRequired: false, status: "no_show" },
  { id: "BKG-2026-214", date: "2026-06-19", time: "15:00", durationMinutes: 45, services: [{ slug: "manicure", name: "Manicure" }], price: 90000, customer: { name: "Saskia Wijaya", phone: "081211223344" }, depositRequired: false, status: "no_show" },
  { id: "BKG-2026-215", date: "2026-07-16", time: "13:30", durationMinutes: 60, services: [{ slug: "fake-nail", name: "Fake Nail (Press-On)" }], designSlug: "sky-blue-ombre", designTitle: "Sky Blue Ombre", price: 240000, customer: { name: "Dianita Ramadhani", phone: "081377778945" }, fulfillment: "pickup", depositRequired: false, status: "no_show" },
  { id: "BKG-2026-216", date: "2026-08-13", time: "19:30", durationMinutes: 60, services: [{ slug: "nail-art", name: "Nail Art" }], price: 165000, customer: { name: "Nadia Kusuma", phone: "081255667788" }, depositRequired: false, status: "no_show" },
  { id: "BKG-2026-217", date: "2026-08-20", time: "11:00", durationMinutes: 60, services: [{ slug: "pedicure", name: "Pedicure" }], price: 110000, customer: { name: "Saskia Wijaya", phone: "081211223344" }, depositRequired: false, status: "no_show" },

  // ---- Extra completed bookings for repeat customers (their 2nd+ visit) ----
  { id: "BKG-2026-218", date: "2026-05-06", time: "09:30", durationMinutes: 120, services: [{ slug: "gel-extension", name: "Gel Extension" }], designSlug: "black-chrome-edge", designTitle: "Black Chrome Edge", price: 380000, customer: { name: "Raisa Andriana", phone: "081155556666" }, depositRequired: true, depositAmount: 100000, depositStatus: "approved", status: "completed" },
  { id: "BKG-2026-219", date: "2026-05-13", time: "13:00", durationMinutes: 60, services: [{ slug: "nail-art", name: "Nail Art" }], designSlug: "3d-bow-charm-pink", designTitle: "3D Bow Charm Pink", price: 195000, customer: { name: "Alya Putri", phone: "081234567890" }, depositRequired: false, status: "completed" },
  { id: "BKG-2026-220", date: "2026-06-09", time: "10:00", durationMinutes: 60, services: [{ slug: "nail-art", name: "Nail Art" }], designSlug: "korean-jelly-pink", designTitle: "Korean Jelly Pink", price: 220000, customer: { name: "Saskia Wijaya", phone: "081211223344" }, depositRequired: false, status: "completed" },
  { id: "BKG-2026-221", date: "2026-06-25", time: "16:30", durationMinutes: 45, services: [{ slug: "manicure", name: "Manicure" }], price: 90000, customer: { name: "Dianita Ramadhani", phone: "081377778945" }, depositRequired: false, status: "completed" },
  { id: "BKG-2026-222", date: "2026-07-01", time: "09:30", durationMinutes: 120, services: [{ slug: "gel-extension", name: "Gel Extension" }], designSlug: "gold-foil-luxe", designTitle: "Gold Foil Luxe", price: 400000, customer: { name: "Dianita Ramadhani", phone: "081377778945" }, depositRequired: true, depositAmount: 100000, depositStatus: "approved", status: "completed" },
  { id: "BKG-2026-223", date: "2026-07-05", time: "11:30", durationMinutes: 45, services: [{ slug: "manicure", name: "Manicure" }], price: 90000, customer: { name: "Saskia Wijaya", phone: "081211223344" }, depositRequired: false, status: "completed" },
  { id: "BKG-2026-224", date: "2026-07-17", time: "15:00", durationMinutes: 60, services: [{ slug: "fake-nail", name: "Fake Nail (Press-On)" }], designSlug: "cherry-red-glossy", designTitle: "Cherry Red Glossy", price: 200000, customer: { name: "Nadia Kusuma", phone: "081255667788" }, fulfillment: "pickup", depositRequired: false, status: "completed" },
  { id: "BKG-2026-225", date: "2026-08-04", time: "09:30", durationMinutes: 120, services: [{ slug: "gel-extension", name: "Gel Extension" }], designSlug: "classic-french-tip", designTitle: "Classic French Tip", price: 350000, customer: { name: "Raisa Andriana", phone: "081155556666" }, depositRequired: true, depositAmount: 100000, depositStatus: "approved", status: "completed" },
  { id: "BKG-2026-226", date: "2026-08-09", time: "15:30", durationMinutes: 60, services: [{ slug: "nail-art", name: "Nail Art" }], designSlug: "milky-french-almond", designTitle: "Milky French Almond", price: 190000, customer: { name: "Alya Putri", phone: "081234567890" }, depositRequired: false, status: "completed" },
  { id: "BKG-2026-227", date: "2026-08-21", time: "14:00", durationMinutes: 60, services: [{ slug: "fake-nail", name: "Fake Nail (Press-On)" }], designSlug: "korean-jelly-pink", designTitle: "Korean Jelly Pink", price: 240000, customer: { name: "Saskia Wijaya", phone: "081211223344" }, fulfillment: "pickup", depositRequired: false, status: "completed" },
  { id: "BKG-2026-228", date: "2026-08-27", time: "13:30", durationMinutes: 120, services: [{ slug: "gel-extension", name: "Gel Extension" }], designSlug: "wedding-pearl-french", designTitle: "Wedding Pearl French", price: 400000, customer: { name: "Nadia Kusuma", phone: "081255667788" }, depositRequired: true, depositAmount: 100000, depositStatus: "approved", status: "completed" },
  { id: "BKG-2026-229", date: "2026-05-20", time: "17:30", durationMinutes: 60, services: [{ slug: "fake-nail", name: "Fake Nail (Press-On)" }], designSlug: "festive-red-gold-flake", designTitle: "Festive Red Gold Flake", price: 190000, customer: { name: "Fajar Ramadhan", phone: "081922233445" }, fulfillment: "delivery", depositRequired: false, status: "completed" },
  { id: "BKG-2026-230", date: "2026-06-17", time: "12:30", durationMinutes: 45, services: [{ slug: "manicure", name: "Manicure" }], price: 90000, customer: { name: "Nadia Kusuma", phone: "081255667788" }, depositRequired: false, status: "completed" },
  { id: "BKG-2026-231", date: "2026-07-25", time: "10:30", durationMinutes: 90, services: [{ slug: "gel-extension", name: "Gel Extension" }], designSlug: "korean-milk-nail", designTitle: "Korean Milk Nail", price: 250000, customer: { name: "Bunga Citra Lestari", phone: "081288889999" }, depositRequired: false, status: "completed" },
  { id: "BKG-2026-232", date: "2026-06-30", time: "18:30", durationMinutes: 60, services: [{ slug: "nail-art", name: "Nail Art" }], designSlug: "sky-blue-ombre", designTitle: "Sky Blue Ombre", price: 140000, customer: { name: "Kirana Purnama", phone: "081845566778" }, depositRequired: false, status: "completed" },
];

/**
 * All appointments analytics reads from: the live backoffice list (already
 * merged with same-session bookings) + the finance seed + this analytics
 * seed. Deduped by id so one appointment is never counted twice across
 * Revenue, Booking Overview, and Finance.
 */
export function getAllAnalyticsAppointments(liveAppointments: Appointment[]): Appointment[] {
  const byId = new Map<string, Appointment>();
  for (const a of [...liveAppointments, ...FINANCE_SEED_APPOINTMENTS, ...ANALYTICS_SEED_APPOINTMENTS]) {
    byId.set(a.id, a);
  }
  return Array.from(byId.values());
}
