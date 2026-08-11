import { describe, expect, it } from "vitest";
import { getDayStatus, getDayTimeSlots } from "@/features/booking/logic/availability";
import type { AvailabilityConfig } from "@/types";

function makeConfig(overrides: Partial<AvailabilityConfig> = {}): AvailabilityConfig {
  return {
    weeklyTemplate: {
      0: [{ start: "09:00", end: "17:00" }],
      1: [],
      2: [{ start: "18:00", end: "22:00" }],
      3: [{ start: "09:00", end: "17:00" }],
      4: [{ start: "09:00", end: "17:00" }],
      5: [{ start: "09:00", end: "17:00" }],
      6: [{ start: "09:00", end: "21:00" }],
    },
    overrides: {},
    vacations: [],
    blockedTimes: [],
    bookingRules: { bookingWindowDays: 30, minimumNoticeHours: 3, maxBookingsPerDay: 6, bufferMinutes: 15 },
    ...overrides,
  };
}

const now = new Date("2026-08-09T10:00:00");

describe("getDayStatus", () => {
  it("marks past dates", () => {
    const status = getDayStatus(new Date("2026-08-08"), 60, makeConfig(), now);
    expect(status).toBe("past");
  });

  it("marks dates outside the booking window", () => {
    const status = getDayStatus(new Date("2026-09-15"), 60, makeConfig(), now);
    expect(status).toBe("outside-window");
  });

  it("marks vacation days closed", () => {
    const config = makeConfig({ vacations: [{ start: "2026-08-10", end: "2026-08-12", reason: "Cuti" }] });
    const status = getDayStatus(new Date("2026-08-11"), 60, config, now);
    expect(status).toBe("closed");
  });

  it("marks a closed weekday (no ranges) closed", () => {
    const status = getDayStatus(new Date("2026-08-10"), 60, makeConfig(), now); // Monday = closed
    expect(status).toBe("closed");
  });

  it("marks an open day available", () => {
    const status = getDayStatus(new Date("2026-08-13"), 60, makeConfig(), now); // Thursday
    expect(status).toBe("available");
  });

  it("applies an override for a specific date", () => {
    const config = makeConfig({ overrides: { "2026-08-13": [{ start: "08:00", end: "15:00" }] } });
    const status = getDayStatus(new Date("2026-08-13"), 60, config, now);
    expect(status).toBe("available");
  });
});

describe("getDayTimeSlots", () => {
  it("returns no slots on a closed day", () => {
    const groups = getDayTimeSlots(new Date("2026-08-10"), 60, makeConfig(), now); // Monday closed
    expect(groups).toEqual([]);
  });

  it("returns no slots during a vacation", () => {
    const config = makeConfig({ vacations: [{ start: "2026-08-10", end: "2026-08-12", reason: "Cuti" }] });
    const groups = getDayTimeSlots(new Date("2026-08-11"), 60, config, now);
    expect(groups).toEqual([]);
  });

  it("returns slot groups for an open day", () => {
    const groups = getDayTimeSlots(new Date("2026-08-13"), 60, makeConfig(), now);
    expect(groups.length).toBeGreaterThan(0);
    const total = groups.reduce((sum, g) => sum + g.slots.length, 0);
    expect(total).toBeGreaterThan(0);
  });

  it("respects minimum notice on today's slots", () => {
    // Now = 10:00, notice 3h → earliest bookable 13:00. A 09:00-17:00 template
    // should have no slots before 13:00.
    const groups = getDayTimeSlots(now, 60, makeConfig(), now);
    const times = groups.flatMap((g) => g.slots.map((s) => s.time));
    for (const time of times) {
      const [h] = time.split(":").map(Number);
      expect(h).toBeGreaterThanOrEqual(13);
    }
  });
});
