/**
 * Analytics types — Epic 8. The analytics view is a pure derivation over the
 * shared domain mocks (appointments, finance, gallery). These types describe
 * the derived results only; no new domain models live here.
 */

/** Period presets offered by the analytics period selector. */
export type AnalyticsPeriodKey = "7d" | "30d" | "3m" | "6m" | "1y";

/** One bucket of the booking trend, sized to the selected period. */
export interface BookingTrendPoint {
  key: string;
  label: string;
  count: number;
}

/** One bucket of the revenue trend (per day / week / month). */
export interface RevenueTrendPoint {
  key: string;
  label: string;
  amount: number;
}

/** A ranked bar entry: services or peak booking periods. */
export interface RankedItem {
  key: string;
  label: string;
  count: number;
}

/** Time-of-day bucket for peak booking time (matches availability groups). */
export type PeakPeriodKey = "pagi" | "siang" | "malam";
