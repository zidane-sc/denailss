import type { MockAppointment } from "@/types";

/**
 * Seeded existing bookings so the Availability Engine has real capacity to
 * subtract from, so some days legitimately read as "limited" or "full"
 * instead of everything being trivially open. Stands in for a real query
 * against the future `appointments` table.
 */
export const MOCK_APPOINTMENTS: MockAppointment[] = [
  // 2026-08-09 (Sun): morning + afternoon mostly taken, evening still open.
  { date: "2026-08-09", start: "09:00", end: "10:00" },
  { date: "2026-08-09", start: "10:15", end: "11:15" },
  { date: "2026-08-09", start: "13:00", end: "14:00" },
  { date: "2026-08-09", start: "14:15", end: "15:15" },

  // 2026-08-11 (Tue): single evening session, one long booking eats most of it.
  { date: "2026-08-11", start: "18:00", end: "19:30" },

  // 2026-08-15 (Sat): hits maxBookingsPerDay (6) even though the day is long,
  // showing the booking-rule engine (not just raw time math) at work.
  { date: "2026-08-15", start: "09:00", end: "10:00" },
  { date: "2026-08-15", start: "10:15", end: "11:15" },
  { date: "2026-08-15", start: "11:30", end: "12:30" },
  { date: "2026-08-15", start: "14:00", end: "15:00" },
  { date: "2026-08-15", start: "16:00", end: "17:00" },
  { date: "2026-08-15", start: "18:00", end: "19:00" },
];
