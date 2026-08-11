import type { BookingStatus } from "@/types";
import type {
  CrmAppointment,
  CustomerRow,
  CustomerSegment,
  CustomerStats,
  CustomerStatus,
} from "../types";

/**
 * Pure customer bookkeeping for the CRM. Everything here is derived from a
 * customer's appointments — no calculated values are ever hardcoded inside
 * the UI components.
 *
 * `todayKey` defaults to the real current date so computed statuses and
 * last-visits always reflect "now".
 */

/** Today's date as YYYY-MM-DD (real clock, no frozen mock anchor). */
export function crmTodayKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/** Backwards-compatible helper: today's key at module call time. */
export const CRM_TODAY = crmTodayKey();

const UPCOMING_STATUSES: BookingStatus[] = [
  "pending_deposit",
  "waiting_verification",
  "pending",
  "confirmed",
];

/* ---------------------------------- math --------------------------------- */

function toTimestamp(dateKey: string) {
  const [year, month, day] = dateKey.split("-").map(Number);
  return Date.UTC(year, month - 1, day);
}

/** Whole days between `earlier` and `later` (YYYY-MM-DD). */
export function daysBetween(earlier: string, later: string) {
  return Math.round((toTimestamp(later) - toTimestamp(earlier)) / 86_400_000);
}

const SHORT_MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "Mei",
  "Jun",
  "Jul",
  "Agu",
  "Sep",
  "Okt",
  "Nov",
  "Des",
];

/** "2026-08-03" → "3 Agu 2026" — compact date for dense lists. */
export function shortDateId(dateKey: string) {
  if (!dateKey) return "";
  const [year, month, day] = dateKey.split("-").map(Number);
  return `${day} ${SHORT_MONTHS[month - 1]} ${year}`;
}

/** Local indicator: "3 hari lalu", "2 bulan lalu", or a friendly "Baru ini". */
export function relativeTimeId(dateKey: string, today = CRM_TODAY) {
  if (!dateKey) return "";
  const days = daysBetween(dateKey, today);
  if (days <= 1) return days <= 0 ? "Hari ini" : "Kemarin";
  if (days < 30) return `${days} hari lalu`;
  const months = Math.floor(days / 30);
  return `${months} bulan lalu`;
}

function mostFrequent<T>(items: T[]): T | null {
  if (items.length === 0) return null;
  const counts = new Map<T, number>();
  for (const item of items) counts.set(item, (counts.get(item) ?? 0) + 1);
  let best: T | null = null;
  let bestCount = -1;
  for (const [key, count] of counts) {
    if (count > bestCount) {
      bestCount = count;
      best = key;
    }
  }
  return best;
}

/** Last date among appointments; null when there's nothing dated. */
function latestDate(items: CrmAppointment[]) {
  const dated = items
    .map((a) => a.date)
    .filter(Boolean)
    .sort((a, b) => b.localeCompare(a));
  return dated[0] ?? null;
}

export function computeCustomerStats(
  appointments: CrmAppointment[],
  today = CRM_TODAY
): CustomerStats {
  const completed = appointments.filter((a) => a.status === "completed");

  const favoritePool = completed.length > 0 ? completed : appointments;

  const favoriteServiceName = mostFrequent(favoritePool.map((a) => a.serviceName));
  const designed = favoritePool.filter((a) => a.designSlug);
  const favoriteDesignSlug = mostFrequent(designed.map((a) => a.designSlug!));
  const favoriteDesign =
    designed.find((a) => a.designSlug === favoriteDesignSlug) ?? null;

  const lastVisit = latestDate(completed);

  const upcoming = appointments
    .filter(
      (a) =>
        UPCOMING_STATUSES.includes(a.status) &&
        Boolean(a.date) &&
        a.date >= today
    )
    .sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`))[0] ?? null;

  return {
    totalVisits: completed.length,
    totalSpending: completed.reduce((sum, a) => sum + a.price, 0),
    favoriteServiceName,
    favoriteDesignSlug,
    favoriteDesignTitle: favoriteDesign?.designTitle ?? null,
    lastVisit,
    daysSinceLastVisit: lastVisit ? daysBetween(lastVisit, today) : null,
    nextAppointment: upcoming,
  };
}

/** Simple derived status; loyalty tiers are intentionally out of scope. */
export function getCustomerStatus(stats: CustomerStats): CustomerStatus {
  if (stats.totalVisits === 0 && !stats.nextAppointment) return "inactive";
  if (stats.totalVisits === 0) return "new";
  if (stats.nextAppointment) return "active";
  if ((stats.daysSinceLastVisit ?? Number.POSITIVE_INFINITY) > 60) return "inactive";
  return "active";
}

/** Filter-segment for the list: New / Repeat ("berulang") / Inactive. */
export function getCustomerSegment(
  stats: CustomerStats,
  status: CustomerStatus
): CustomerSegment {
  if (status === "inactive") return "inactive";
  if (stats.totalVisits === 0) return "new";
  return "repeat";
}

export function waCustomerLink(phone: string, message?: string) {
  const digits = phone.replace(/\D/g, "");
  const intl = digits.startsWith("0") ? `62${digits.slice(1)}` : digits;
  const base = `https://wa.me/${intl}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}

export function matchesCustomerQuery(
  name: string,
  phone: string,
  email: string | undefined,
  query: string,
  instagram?: string
) {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return (
    name.toLowerCase().includes(q) ||
    phone.replace(/\D/g, "").includes(q.replace(/\D/g, "")) ||
    (email ?? "").toLowerCase().includes(q) ||
    (instagram ?? "").toLowerCase().includes(q)
  );
}

export const SEGMENT_LABELS: Record<CustomerSegment, string> = {
  new: "Pelanggan Baru",
  repeat: "Pelanggan Berulang",
  inactive: "Tidak Aktif",
};

export const STATUS_LABELS: Record<CustomerStatus, string> = {
  new: "Baru",
  active: "Aktif",
  inactive: "Tidak Aktif",
};

export type CustomerSortField = "name" | "visits" | "spending" | "lastVisit" | "status";

function statusOrder(status: CustomerStatus): number {
  return status === "new" ? 0 : status === "active" ? 1 : 2;
}

/** Stable sort for the customer list; null dates always sink to the end. */
export function sortCustomers(
  rows: CustomerRow[],
  field: CustomerSortField,
  direction: "asc" | "desc"
): CustomerRow[] {
  const order = direction === "asc" ? 1 : -1;

  const compare = (a: CustomerRow, b: CustomerRow): number => {
    switch (field) {
      case "name":
        return a.customer.name.localeCompare(b.customer.name, "id");
      case "visits":
        return a.stats.totalVisits - b.stats.totalVisits;
      case "spending":
        return a.stats.totalSpending - b.stats.totalSpending;
      case "lastVisit":
        if (!a.stats.lastVisit && !b.stats.lastVisit) return 0;
        if (!a.stats.lastVisit) return 1; // nulls always last
        if (!b.stats.lastVisit) return -1;
        return a.stats.lastVisit.localeCompare(b.stats.lastVisit);
      case "status":
        if (a.status !== b.status) {
          return statusOrder(a.status) - statusOrder(b.status);
        }
        return a.customer.name.localeCompare(b.customer.name, "id");
    }
  };

  return [...rows].sort((a, b) => order * compare(a, b));
}