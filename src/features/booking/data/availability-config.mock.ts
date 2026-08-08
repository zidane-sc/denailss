import type { AvailabilityConfig } from "@/types";

/**
 * Mock stand-in for the future `availability_templates`, `availability_overrides`
 * and `blocked_times` tables (TRD §4 / ADR-004: Availability Engine, not fixed
 * working hours). Jam operasional Denailss berubah setiap minggu, jadi setiap
 * hari punya sesi sendiri, ada override tanggal spesifik, dan periode cuti.
 */
export const AVAILABILITY_CONFIG: AvailabilityConfig = {
  weeklyTemplate: {
    0: [
      { start: "09:00", end: "12:00" },
      { start: "13:00", end: "17:00" },
      { start: "19:00", end: "22:00" },
    ],
    1: [],
    2: [{ start: "18:00", end: "22:00" }],
    3: [{ start: "13:00", end: "20:00" }],
    4: [{ start: "13:00", end: "20:00" }],
    5: [{ start: "13:00", end: "21:00" }],
    6: [{ start: "09:00", end: "21:00" }],
  },
  overrides: {
    "2026-08-17": [{ start: "08:00", end: "21:00" }],
  },
  vacations: [{ start: "2026-08-20", end: "2026-08-25", reason: "Cuti tahunan tim Denailss" }],
  blockedTimes: [
    { date: "2026-08-12", range: { start: "15:00", end: "17:00" }, reason: "Family event" },
  ],
  bookingRules: {
    bookingWindowDays: 30,
    minimumNoticeHours: 3,
    maxBookingsPerDay: 6,
    bufferMinutes: 15,
  },
};
