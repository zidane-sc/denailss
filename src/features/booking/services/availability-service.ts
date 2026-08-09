import { asc } from "drizzle-orm";
import { getDb } from "@/db/client";
import { availabilityOverrides, availabilityTemplates, blockedTimes } from "@/db/schema";

export async function getAvailabilityConfig() {
  const db = getDb();
  const [weeklyTemplate, overrides, blockedTimesRows] = await Promise.all([
    db.select().from(availabilityTemplates).orderBy(asc(availabilityTemplates.weekday), asc(availabilityTemplates.startTime)),
    db.select().from(availabilityOverrides),
    db.select().from(blockedTimes),
  ]);
  return { weeklyTemplate, overrides, blockedTimes: blockedTimesRows };
}
