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

/**
 * In-process cache for the availability config. The config is admin-configured
 * and changes rarely, but `GET /api/v1/availability` is called by many client
 * providers at once; caching it keeps the endpoint at ~1 cheap DB read instead
 * of 5 and prevents connection-pool exhaustion under concurrent loads.
 */
const CONFIG_TTL_MS = 30_000;
let cachedConfig: { value: AvailabilityConfig; expiresAt: number } | undefined;
let configLoad: Promise<AvailabilityConfig> | undefined;

/** Postgres `time` columns come back as "HH:MM:SS"; the API schema wants "HH:MM". */
function toHhMm(value: string): string {
  return value.slice(0, 5);
}

/** Assemble the full `AvailabilityConfig` shape from the five DB sources. */
export async function getAvailabilityConfig(): Promise<AvailabilityConfig> {
  if (cachedConfig && cachedConfig.expiresAt > Date.now()) {
    return cachedConfig.value;
  }
  // Deduplicate concurrent misses: while a cold-cache load is in flight, all
  // callers share the same promise so only one request hits the DB.
  if (!configLoad) {
    configLoad = loadAvailabilityConfig();
  }
  try {
    return await configLoad;
  } finally {
    configLoad = undefined;
  }
}

async function loadAvailabilityConfig(): Promise<AvailabilityConfig> {
  const db = getDb();
  // Run sequentially (not Promise.all): each request then holds one pool
  // connection at a time, so concurrent requests can't exhaust the pooler.
  const templateRows = await db.select().from(availabilityTemplates).orderBy(asc(availabilityTemplates.weekday), asc(availabilityTemplates.startTime));
  const overrideRows = await db.select().from(availabilityOverrides);
  const blockedRows = await db.select().from(blockedTimes);
  const vacationRows = await db.select().from(availabilityVacations);
  const ruleRows = await db.select().from(bookingRules);

  const weeklyTemplate = {} as Record<AvailabilityWeekday, TimeRange[]>;
  for (let day = 0; day <= 6; day++) weeklyTemplate[day as AvailabilityWeekday] = [];
  for (const row of templateRows) {
    weeklyTemplate[row.weekday as AvailabilityWeekday].push({ start: toHhMm(row.startTime), end: toHhMm(row.endTime) });
  }

  const overrides: Record<string, TimeRange[]> = {};
  for (const row of overrideRows) {
    overrides[row.date] = (row.ranges as TimeRange[]) ?? [];
  }

  const ruleRow = ruleRows[0];
  const value: AvailabilityConfig = {
    weeklyTemplate,
    overrides,
    vacations: vacationRows.map((v) => ({ start: v.startDate, end: v.endDate, reason: v.reason })),
    blockedTimes: blockedRows.map((b) => ({ date: b.date, range: { start: toHhMm(b.startTime), end: toHhMm(b.endTime) }, reason: b.reason })),
    bookingRules: ruleRow
      ? {
          bookingWindowDays: ruleRow.bookingWindowDays,
          minimumNoticeHours: ruleRow.minimumNoticeHours,
          maxBookingsPerDay: ruleRow.maxBookingsPerDay,
          bufferMinutes: ruleRow.bufferMinutes,
        }
      : DEFAULT_RULES,
  };
  cachedConfig = { value, expiresAt: Date.now() + CONFIG_TTL_MS };
  return value;
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

  // Invalidate the cache so the next read reflects the new config.
  cachedConfig = undefined;
  return getAvailabilityConfig();
}
