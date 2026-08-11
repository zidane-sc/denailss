import "server-only";
import { asc } from "drizzle-orm";
import { getDb } from "@/db/client";
import {
  availabilityOverrides,
  availabilityTemplates,
  availabilityVacations,
  blockedTimes,
  bookingRules,
} from "@/db/schema";
import type { AvailabilityConfig, AvailabilityWeekday, TimeRange } from "@/types";

const DEFAULT_RULES: AvailabilityConfig["bookingRules"] = {
  bookingWindowDays: 30,
  minimumNoticeHours: 3,
  maxBookingsPerDay: 6,
  bufferMinutes: 15,
};

/** Assemble the full `AvailabilityConfig` shape from the five DB sources. */
export async function getAvailabilityConfig(): Promise<AvailabilityConfig> {
  const db = getDb();
  const [templateRows, overrideRows, blockedRows, vacationRows, ruleRows] = await Promise.all([
    db.select().from(availabilityTemplates).orderBy(asc(availabilityTemplates.weekday), asc(availabilityTemplates.startTime)),
    db.select().from(availabilityOverrides),
    db.select().from(blockedTimes),
    db.select().from(availabilityVacations),
    db.select().from(bookingRules),
  ]);

  const weeklyTemplate = {} as Record<AvailabilityWeekday, TimeRange[]>;
  for (let day = 0; day <= 6; day++) weeklyTemplate[day as AvailabilityWeekday] = [];
  for (const row of templateRows) {
    weeklyTemplate[row.weekday as AvailabilityWeekday].push({ start: row.startTime, end: row.endTime });
  }

  const overrides: Record<string, TimeRange[]> = {};
  for (const row of overrideRows) {
    overrides[row.date] = (row.ranges as TimeRange[]) ?? [];
  }

  const ruleRow = ruleRows[0];
  return {
    weeklyTemplate,
    overrides,
    vacations: vacationRows.map((v) => ({ start: v.startDate, end: v.endDate, reason: v.reason })),
    blockedTimes: blockedRows.map((b) => ({ date: b.date, range: { start: b.startTime, end: b.endTime }, reason: b.reason })),
    bookingRules: ruleRow
      ? {
          bookingWindowDays: ruleRow.bookingWindowDays,
          minimumNoticeHours: ruleRow.minimumNoticeHours,
          maxBookingsPerDay: ruleRow.maxBookingsPerDay,
          bufferMinutes: ruleRow.bufferMinutes,
        }
      : DEFAULT_RULES,
  };
}

/** Transactional full-write of the availability config (replace-all per section). */
export async function saveAvailabilityConfig(input: AvailabilityConfig): Promise<AvailabilityConfig> {
  const db = getDb();
  await db.transaction(async (tx) => {
    await tx.delete(availabilityTemplates);
    const templateValues: { weekday: number; startTime: string; endTime: string }[] = [];
    for (const [day, ranges] of Object.entries(input.weeklyTemplate)) {
      for (const range of ranges) {
        templateValues.push({ weekday: Number(day), startTime: range.start, endTime: range.end });
      }
    }
    if (templateValues.length > 0) await tx.insert(availabilityTemplates).values(templateValues);

    await tx.delete(availabilityOverrides);
    if (Object.keys(input.overrides).length > 0) {
      await tx.insert(availabilityOverrides).values(
        Object.entries(input.overrides).map(([date, ranges]) => ({ date, ranges }))
      );
    }

    await tx.delete(blockedTimes);
    if (input.blockedTimes.length > 0) {
      await tx.insert(blockedTimes).values(
        input.blockedTimes.map((b) => ({ date: b.date, startTime: b.range.start, endTime: b.range.end, reason: b.reason }))
      );
    }

    await tx.delete(availabilityVacations);
    if (input.vacations.length > 0) {
      await tx.insert(availabilityVacations).values(
        input.vacations.map((v) => ({ startDate: v.start, endDate: v.end, reason: v.reason }))
      );
    }

    await tx
      .insert(bookingRules)
      .values({ id: "rules", ...input.bookingRules, updatedAt: new Date() })
      .onConflictDoUpdate({
        target: bookingRules.id,
        set: { ...input.bookingRules, updatedAt: new Date() },
      });
  });

  return getAvailabilityConfig();
}
