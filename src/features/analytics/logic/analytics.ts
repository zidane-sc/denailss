import type { Appointment } from "@/features/appointment/types";
import type {
  AnalyticsPeriodKey,
  BookingTrendPoint,
  PeakPeriodKey,
  RankedItem,
  RevenueTrendPoint,
} from "../types";

/**
 * Analytics logic — Epic 8. Pure, deterministic calculations over the shared
 * appointment seam (see `data/appointments-analytics.mock.ts`). No React, no
 * storage, no randomness. Components only map these results into UI.
 *
 * The reference "today" mirrors the mock timeline (2026-08-09, same date the
 * backoffice/CRM mocks use) so all Epics agree on which period is "now".
 */
export const ANALYTICS_TODAY = "2026-08-09";

/** "2026-08-09" → { date: Date, weekKey: "2026-W32", monthKey: "2026-08" } */
export function analyticsDateInfo(dateKey: string): {
  date: Date;
  weekKey: string;
  monthKey: string;
} {
  const [y, m, d] = dateKey.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  const firstDay = new Date(date.getFullYear(), 0, 1);
  const weekNo = Math.ceil(
    ((date.getTime() - firstDay.getTime()) / 86400000 + firstDay.getDay() + 1) / 7
  );
  return {
    date,
    weekKey: `${date.getFullYear()}-W${String(weekNo).padStart(2, "0")}`,
    monthKey: dateKey.slice(0, 7),
  };
}

/** The anchor date (today) analytics buckets are measured against. */
export function analyticsAnchorDate(): Date {
  const [y, m, d] = ANALYTICS_TODAY.split("-").map(Number);
  return new Date(y, m - 1, d);
}

/**
 * Start date for a period preset, inclusive. "3m" means the last 3 calendar
 * months ending with the current month (August) — i.e. June 1.
 */
export function analyticsPeriodStart(key: AnalyticsPeriodKey): Date {
  const anchor = analyticsAnchorDate();
  switch (key) {
    case "7d":
      return new Date(anchor.getFullYear(), anchor.getMonth(), anchor.getDate() - 6);
    case "30d":
      return new Date(anchor.getFullYear(), anchor.getMonth(), anchor.getDate() - 29);
    case "3m":
      return new Date(anchor.getFullYear(), anchor.getMonth() - 2, 1);
    case "6m":
      return new Date(anchor.getFullYear(), anchor.getMonth() - 5, 1);
    case "1y":
      return new Date(anchor.getFullYear() - 1, anchor.getMonth(), anchor.getDate() + 1);
  }
}

/** Human label for a period preset, shown in the selector. */
export function analyticsPeriodLabel(key: AnalyticsPeriodKey): string {
  switch (key) {
    case "7d":
      return "7 Hari";
    case "30d":
      return "30 Hari";
    case "3m":
      return "3 Bulan";
    case "6m":
      return "6 Bulan";
    case "1y":
      return "1 Tahun";
  }
}

/** Appointments dated within a period (inclusive of both bounds). */
export function filterAppointmentsByPeriod(
  appointments: Appointment[],
  start: Date,
  end: Date
): Appointment[] {
  const startKey = `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, "0")}-${String(start.getDate()).padStart(2, "0")}`;
  const endKey = `${end.getFullYear()}-${String(end.getMonth() + 1).padStart(2, "0")}-${String(end.getDate()).padStart(2, "0")}`;
  return appointments.filter((a) => a.date && a.date >= startKey && a.date <= endKey);
}

/** Whether a period contains any dated appointment at all. */
export function hasAnyBookingInPeriod(appointments: Appointment[]): boolean {
  return appointments.some((a) => a.date !== "");
}

/* ------------------------------------------------------------------ */
/* Revenue                                                             */
/* ------------------------------------------------------------------ */

/** Total revenue = sum of completed appointments in the period (same source Finance uses). */
export function calculateRevenue(appointments: Appointment[]): number {
  return appointments
    .filter((a) => a.status === "completed")
    .reduce((sum, a) => sum + a.price, 0);
}

/** Revenue bucketed per day / week / month, sized to the period. */
export function getRevenueTrend(
  appointments: Appointment[],
  key: AnalyticsPeriodKey,
  start: Date,
  end: Date
): RevenueTrendPoint[] {
  const points = emptyTrendPoints(key, start, end);
  const bucketOf = trendBucketFn(key);
  const byBucket = new Map<string, { label: string; amount: number }>();
  for (const a of appointments) {
    if (a.status !== "completed" || !a.date) continue;
    const { key: bk, label } = bucketOf(a.date);
    if (!byBucket.has(bk)) byBucket.set(bk, { label, amount: 0 });
    byBucket.get(bk)!.amount += a.price;
  }
  for (const point of points) {
    const hit = byBucket.get(point.key);
    if (hit) point.amount = hit.amount;
  }
  return points;
}

/* ------------------------------------------------------------------ */
/* Booking health                                                      */
/* ------------------------------------------------------------------ */

export interface BookingStats {
  total: number;
  completed: number;
  cancelled: number;
  noShow: number;
}

/** Booking overview counts by existing appointment status. */
export function calculateBookingStats(appointments: Appointment[]): BookingStats {
  return appointments.reduce<BookingStats>(
    (stats, a) => {
      stats.total += 1;
      if (a.status === "completed") stats.completed += 1;
      else if (a.status === "cancelled") stats.cancelled += 1;
      else if (a.status === "no_show") stats.noShow += 1;
      return stats;
    },
    { total: 0, completed: 0, cancelled: 0, noShow: 0 }
  );
}

/** Cancellation rate = cancelled / total × 100. 0 when there are no bookings. */
export function calculateCancellationRate(stats: Pick<BookingStats, "total" | "cancelled">): number {
  if (stats.total === 0) return 0;
  return (stats.cancelled / stats.total) * 100;
}

/** No-show rate = no-show / total × 100. 0 when there are no bookings. */
export function calculateNoShowRate(stats: Pick<BookingStats, "total" | "noShow">): number {
  if (stats.total === 0) return 0;
  return (stats.noShow / stats.total) * 100;
}

/* ------------------------------------------------------------------ */
/* Customer retention                                                  */
/* ------------------------------------------------------------------ */

export interface RetentionStats {
  uniqueCustomers: number;
  repeatCustomers: number;
  repeatRate: number;
}

/**
 * Repeat customers = customers with more than one completed appointment
 * within the period. Repeat rate = repeat / unique × 100.
 */
export function calculateRepeatCustomerRate(appointments: Appointment[]): RetentionStats {
  const completedByCustomer = new Map<string, number>();
  for (const a of appointments) {
    if (a.status !== "completed") continue;
    const key = a.customerId ?? a.customer.name;
    completedByCustomer.set(key, (completedByCustomer.get(key) ?? 0) + 1);
  }
  const uniqueCustomers = completedByCustomer.size;
  const repeatCustomers = Array.from(completedByCustomer.values()).filter((n) => n > 1).length;
  return {
    uniqueCustomers,
    repeatCustomers,
    repeatRate: uniqueCustomers > 0 ? (repeatCustomers / uniqueCustomers) * 100 : 0,
  };
}

/* ------------------------------------------------------------------ */
/* Popularity                                                          */
/* ------------------------------------------------------------------ */

/**
 * Most-booked services. A multi-service appointment counts once per service
 * (each service was actually performed), matching how appointments render
 * joined names elsewhere.
 */
export function getPopularServices(appointments: Appointment[], limit = 5): RankedItem[] {
  const counts = new Map<string, RankedItem>();
  for (const a of appointments) {
    for (const s of a.services) {
      const existing = counts.get(s.slug);
      if (existing) existing.count += 1;
      else counts.set(s.slug, { key: s.slug, label: s.name, count: 1 });
    }
  }
  return Array.from(counts.values())
    .sort((x, y) => y.count - x.count || x.label.localeCompare(y.label))
    .slice(0, limit);
}

export interface DesignPopularityItem {
  slug: string;
  title: string;
  count: number;
}

/**
 * Most-booked designs by slug. The count is a pure derivation over
 * appointments; title/thumbnail resolution happens in the UI so the logic
 * layer never touches the catalog (server-only repository).
 */
export function getPopularDesigns(appointments: Appointment[], limit = 4): DesignPopularityItem[] {
  const counts = new Map<string, number>();
  for (const a of appointments) {
    if (!a.designSlug) continue;
    counts.set(a.designSlug, (counts.get(a.designSlug) ?? 0) + 1);
  }
  return Array.from(counts.entries())
    .sort((x, y) => y[1] - x[1] || x[0].localeCompare(y[0]))
    .slice(0, limit)
    .map(([slug, count]) => ({
      slug,
      title: slug,
      count,
    }));
}

/* ------------------------------------------------------------------ */
/* Peak booking time                                                   */
/* ------------------------------------------------------------------ */

/**
 * Time-of-day buckets, same definitions as the availability engine
 * (Pagi < 12:00, Siang 12:00-17:59, Malam ≥ 18:00).
 */
const PEAK_GROUPS: { key: PeakPeriodKey; label: string; test: (m: number) => boolean }[] = [
  { key: "pagi", label: "Pagi", test: (m) => m < 12 * 60 },
  { key: "siang", label: "Siang", test: (m) => m >= 12 * 60 && m < 18 * 60 },
  { key: "malam", label: "Malam", test: (m) => m >= 18 * 60 },
];

export const PEAK_PERIOD_LABELS: Record<PeakPeriodKey, string> = {
  pagi: "Pagi",
  siang: "Siang",
  malam: "Malam",
};

/** Bookings per time-of-day group, plus the single most-booked time slot. */
export function getPeakBookingTimes(appointments: Appointment[]): {
  groups: RankedItem[];
  mostPopularSlot: string | null;
} {
  const groupCounts: Record<PeakPeriodKey, number> = { pagi: 0, siang: 0, malam: 0 };
  const slotCounts = new Map<string, number>();
  for (const a of appointments) {
    if (!a.time) continue;
    const [h, min] = a.time.split(":").map(Number);
    const minutes = h * 60 + (min ?? 0);
    const group = PEAK_GROUPS.find((g) => g.test(minutes));
    if (group) groupCounts[group.key] += 1;
    const slot = `${String(h).padStart(2, "0")}:00`;
    slotCounts.set(slot, (slotCounts.get(slot) ?? 0) + 1);
  }
  const groups: RankedItem[] = PEAK_GROUPS.map((g) => ({
    key: g.key,
    label: g.label,
    count: groupCounts[g.key],
  }));
  const mostPopularSlot =
    Array.from(slotCounts.entries()).sort((x, y) => y[1] - x[1] || x[0].localeCompare(y[0]))[0]?.[0] ??
    null;
  return { groups, mostPopularSlot };
}

/* ------------------------------------------------------------------ */
/* Booking trend                                                       */
/* ------------------------------------------------------------------ */

/** Booking volume per day / week / month, sized to the period. */
export function getBookingTrend(
  appointments: Appointment[],
  key: AnalyticsPeriodKey,
  start: Date,
  end: Date
): BookingTrendPoint[] {
  const points = emptyTrendPoints(key, start, end);
  const bucketOf = trendBucketFn(key);
  const byBucket = new Map<string, number>();
  for (const a of appointments) {
    if (!a.date) continue;
    const { key: bk } = bucketOf(a.date);
    byBucket.set(bk, (byBucket.get(bk) ?? 0) + 1);
  }
  for (const point of points) {
    point.count = byBucket.get(point.key) ?? 0;
  }
  return points;
}

/* ------------------------------------------------------------------ */
/* Internal trend bucketing                                            */
/* ------------------------------------------------------------------ */

function emptyTrendPoints(
  key: AnalyticsPeriodKey,
  start: Date,
  end: Date
): (BookingTrendPoint & RevenueTrendPoint)[] {
  const points: (BookingTrendPoint & RevenueTrendPoint)[] = [];
  if (key === "7d" || key === "30d") {
    const days = Math.round((end.getTime() - start.getTime()) / 86400000) + 1;
    for (let i = 0; i < days; i++) {
      const date = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i);
      points.push({
        key: dateKeyOf(date),
        label: `${date.getDate()} ${MONTH_SHORT[date.getMonth()]}`,
        count: 0,
        amount: 0,
      });
    }
  } else if (key === "3m" || key === "6m") {
    const months =
      key === "3m"
        ? 3
        : (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth()) + 1;
    for (let i = 0; i < months; i++) {
      const date = new Date(start.getFullYear(), start.getMonth() + i, 1);
      points.push({
        key: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`,
        label: MONTH_SHORT[date.getMonth()],
        count: 0,
        amount: 0,
      });
    }
  } else {
    // 1y: bucket by ISO week so the trend stays readable (52 daily points are too dense).
    const startInfo = analyticsDateInfo(dateKeyOf(start));
    const endInfo = analyticsDateInfo(dateKeyOf(end));
    const weekCount = endInfo.weekKey === startInfo.weekKey
      ? 1
      : (() => {
          const endWeekNum = Number(endInfo.weekKey.split("-W")[1]);
          const startWeekNum = Number(startInfo.weekKey.split("-W")[1]);
          const yearDelta = Number(endInfo.weekKey.slice(0, 4)) - Number(startInfo.weekKey.slice(0, 4));
          return yearDelta * 52 + (endWeekNum - startWeekNum) + 1;
        })();
    for (let i = 0; i < weekCount; i++) {
      const date = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i * 7);
      const info = analyticsDateInfo(dateKeyOf(date));
      points.push({
        key: info.weekKey,
        label: info.weekKey.slice(5),
        count: 0,
        amount: 0,
      });
    }
  }
  return points;
}

function trendBucketFn(key: AnalyticsPeriodKey) {
  return (dateKey: string): { key: string; label: string } => {
    const info = analyticsDateInfo(dateKey);
    if (key === "7d" || key === "30d") {
      const [, m, d] = dateKey.split("-").map(Number);
      return {
        key: dateKey,
        label: `${d} ${MONTH_SHORT[m - 1]}`,
      };
    }
    if (key === "3m" || key === "6m") {
      return { key: info.monthKey, label: MONTH_SHORT[info.date.getMonth()] };
    }
    return { key: info.weekKey, label: info.weekKey.slice(5) };
  };
}

function dateKeyOf(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

const MONTH_SHORT = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
