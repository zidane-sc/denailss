"use client";

import { useMemo, useState } from "react";
import { formatIDR } from "@/lib/format";
import { useBackoffice } from "@/features/appointment/context/backoffice-context";
import {
  analyticsAnchorDate,
  analyticsPeriodStart,
  calculateBookingStats,
  calculateCancellationRate,
  calculateNoShowRate,
  calculateRepeatCustomerRate,
  calculateRevenue,
  filterAppointmentsByPeriod,
  getBookingTrend,
  getPeakBookingTimes,
  getPopularDesigns,
  getPopularServices,
  getRevenueTrend,
  hasAnyBookingInPeriod,
} from "../logic/analytics";
import type { AnalyticsPeriodKey } from "../types";
import { AnalyticsSection } from "./analytics-section";
import { AnalyticsPeriodSelector } from "./analytics-period-selector";
import { AnalyticsEmpty } from "./analytics-empty";
import { MetricList } from "./metric-block";
import { RevenueTrendChart } from "./revenue-trend-chart";
import { BookingTrendChart } from "./booking-trend-chart";
import {
  PeakBookingTimes,
  PopularDesignsList,
  PopularServicesList,
} from "./analytics-lists";

/**
 * Analytics — Epic 8. A business overview answering "what is actually
 * happening at Denailss?" over a selectable period. All figures derive from
 * the shared appointment seam (same source as Finance and Appointment
 * Management), so a completed appointment always produces one revenue row
 * and one booking count. Pure logic lives in `../logic/analytics.ts`;
 * components only render.
 */
export function AnalyticsDashboardView() {
  const { appointments: liveAppointments } = useBackoffice();
  const [period, setPeriod] = useState<AnalyticsPeriodKey>("30d");

  const allAppointments = liveAppointments;
  const start = useMemo(() => analyticsPeriodStart(period), [period]);
  const end = useMemo(() => analyticsAnchorDate(), []);
  const periodAppointments = useMemo(
    () => filterAppointmentsByPeriod(allAppointments, start, end),
    [allAppointments, start, end]
  );

  const hasBookings = useMemo(() => hasAnyBookingInPeriod(periodAppointments), [periodAppointments]);
  const revenue = useMemo(() => calculateRevenue(periodAppointments), [periodAppointments]);
  const revenueTrend = useMemo(
    () => getRevenueTrend(periodAppointments, period, start, end),
    [periodAppointments, period, start, end]
  );
  const bookingStats = useMemo(
    () => calculateBookingStats(periodAppointments),
    [periodAppointments]
  );
  const cancellationRate = useMemo(
    () => calculateCancellationRate(bookingStats),
    [bookingStats]
  );
  const noShowRate = useMemo(() => calculateNoShowRate(bookingStats), [bookingStats]);
  const retention = useMemo(
    () => calculateRepeatCustomerRate(periodAppointments),
    [periodAppointments]
  );
  const popularServices = useMemo(
    () => getPopularServices(periodAppointments),
    [periodAppointments]
  );
  const popularDesigns = useMemo(
    () => getPopularDesigns(periodAppointments),
    [periodAppointments]
  );
  const peakTimes = useMemo(
    () => getPeakBookingTimes(periodAppointments),
    [periodAppointments]
  );
  const bookingTrend = useMemo(
    () => getBookingTrend(periodAppointments, period, start, end),
    [periodAppointments, period, start, end]
  );

  const pct = (n: number) =>
    `${n.toLocaleString("id-ID", { maximumFractionDigits: 1 })}%`;

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="flex flex-col gap-4 border-b border-border/50 pb-5 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="font-heading text-2xl font-semibold tracking-tight text-foreground/90">
            Analytics
          </h2>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Lihat perkembangan Denailss dan pahami pola booking customer.
          </p>
          <p className="mt-1 text-xs text-muted-foreground/80">
            Periode mengacu pada data booking nyata
          </p>
        </div>
        <AnalyticsPeriodSelector value={period} onChange={setPeriod} />
      </div>

      {!hasBookings ? (
        <AnalyticsEmpty message="Belum ada booking untuk periode ini." detail="Coba periode lain untuk melihat ringkasan bisnis." />
      ) : (
        <>
          {/* Revenue */}
          <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-3">
            <AnalyticsSection title="Pemasukan" description="Total pemasukan dari booking selesai di periode ini.">
              {revenue > 0 ? (
                <div className="border-t border-border/70 pt-3">
                  <p className="text-xs font-medium text-muted-foreground">Total pemasukan</p>
                  <p className="mt-1 font-heading text-3xl font-semibold tracking-tight text-primary">
                    {formatIDR(revenue)}
                  </p>
                  <p className="mt-1 text-[11px] text-muted-foreground">
                    Dari {bookingStats.completed} booking selesai
                  </p>
                </div>
              ) : (
                <AnalyticsEmpty message="Belum ada pemasukan pada periode ini." detail="Booking yang selesai akan muncul di sini." />
              )}
            </AnalyticsSection>

            <div className="lg:col-span-2">
              {revenueTrend.some((p) => p.amount > 0) ? (
                <RevenueTrendChart points={revenueTrend} total={revenue} />
              ) : (
                <AnalyticsEmpty message="Belum ada pemasukan pada periode ini." />
              )}
            </div>
          </div>

          {/* Booking health */}
          <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-2">
            <AnalyticsSection title="Ringkasan Booking" description="Semua status booking di periode ini.">
              <MetricList
                items={[
                  { label: "Total booking", value: String(bookingStats.total) },
                  { label: "Selesai", value: String(bookingStats.completed), tone: "positive" },
                  { label: "Dibatalkan", value: String(bookingStats.cancelled), tone: "negative" },
                  { label: "No show", value: String(bookingStats.noShow), tone: "muted" },
                ]}
              />
            </AnalyticsSection>

            <AnalyticsSection title="Kesehatan Booking" description="Dua masalah berbeda, dihitung terpisah.">
              <MetricList
                className="sm:grid-cols-2"
                items={[
                  {
                    label: "Tingkat pembatalan",
                    value: pct(cancellationRate),
                    detail: `${bookingStats.cancelled} dari ${bookingStats.total} booking dibatalkan`,
                    tone: bookingStats.cancelled > 0 ? "negative" : "positive",
                  },
                  {
                    label: "Tingkat no show",
                    value: pct(noShowRate),
                    detail: `${bookingStats.noShow} dari ${bookingStats.total} booking tidak hadir`,
                    tone: bookingStats.noShow > 0 ? "accent" : "positive",
                  },
                ]}
              />
            </AnalyticsSection>
          </div>

          {/* Retention */}
          <AnalyticsSection title="Customer Berulang" description="Customer dengan lebih dari satu booking selesai di periode ini.">
            {retention.uniqueCustomers > 0 ? (
              <MetricList
                items={[
                  { label: "Customer unik", value: String(retention.uniqueCustomers) },
                  {
                    label: "Customer berulang",
                    value: String(retention.repeatCustomers),
                    tone: "primary",
                  },
                  {
                    label: "Tingkat kunjungan ulang",
                    value: pct(retention.repeatRate),
                    detail: `${retention.repeatCustomers} dari ${retention.uniqueCustomers} customer kembali`,
                  },
                ]}
              />
            ) : (
              <AnalyticsEmpty message="Belum ada customer berulang di periode ini." detail="Customer yang kembali setelah booking pertama akan muncul di sini." />
            )}
          </AnalyticsSection>

          {/* Popularity */}
          <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-2">
            <AnalyticsSection title="Layanan Terpopuler" description="Layanan yang paling sering dibooking.">
              {popularServices.length > 0 ? (
                <PopularServicesList items={popularServices} />
              ) : (
                <AnalyticsEmpty message="Belum ada layanan yang dibooking di periode ini." />
              )}
            </AnalyticsSection>

            <AnalyticsSection title="Desain Terpopuler" description="Desain dengan booking terbanyak.">
              {popularDesigns.length > 0 ? (
                <PopularDesignsList items={popularDesigns} />
              ) : (
                <AnalyticsEmpty message="Belum cukup data untuk melihat desain terpopuler." detail="Desain akan muncul saat ada booking dengan desain terpilih." />
              )}
            </AnalyticsSection>
          </div>

          {/* Peak time */}
          <AnalyticsSection title="Jam Booking Favorit" description="Kapan customer paling sering memilih slot.">
            {peakTimes.groups.some((g) => g.count > 0) ? (
              <PeakBookingTimes
                groups={peakTimes.groups}
                mostPopularSlot={peakTimes.mostPopularSlot}
              />
            ) : (
              <AnalyticsEmpty message="Belum ada data jam booking di periode ini." />
            )}
          </AnalyticsSection>

          {/* Booking trend */}
          <div>
            {bookingTrend.some((p) => p.count > 0) ? (
              <BookingTrendChart points={bookingTrend} />
            ) : (
              <AnalyticsSection title="Tren Booking">
                <AnalyticsEmpty message="Belum ada booking di periode ini." />
              </AnalyticsSection>
            )}
          </div>
        </>
      )}
    </div>
  );
}
