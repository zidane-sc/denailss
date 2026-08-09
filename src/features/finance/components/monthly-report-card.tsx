import { formatIDR } from "@/lib/format";
import type { MonthlyReport } from "../logic/finance";

/**
 * Monthly report — a compact, readable snapshot of the selected month:
 * totals, completed appointments, average transaction. No charts needed here.
 */
export function MonthlyReportCard({ report }: { report: MonthlyReport }) {
  return (
    <section className="rounded-2xl border border-border/70 bg-card p-5 shadow-xs sm:p-6">
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
        Laporan Bulanan
      </p>
      <h3 className="mt-1 font-heading text-lg font-semibold tracking-tight text-foreground/90">
        {report.monthLabel}
      </h3>

      <dl className="mt-5 space-y-2.5 text-sm">
        <div className="flex items-center justify-between gap-4">
          <dt className="text-muted-foreground">Pemasukan</dt>
          <dd className="font-semibold text-foreground tabular-nums">{formatIDR(report.income)}</dd>
        </div>
        <div className="flex items-center justify-between gap-4">
          <dt className="text-muted-foreground">Pengeluaran</dt>
          <dd className="font-semibold text-foreground tabular-nums">{formatIDR(report.expense)}</dd>
        </div>
        <div className="flex items-center justify-between gap-4 border-t border-border/50 pt-2.5">
          <dt className="font-medium text-foreground/85">Profit</dt>
          <dd
            className={
              "font-heading text-lg font-semibold tabular-nums " +
              (report.profit >= 0 ? "text-emerald-700" : "text-rose-600")
            }
          >
            {formatIDR(report.profit)}
          </dd>
        </div>
      </dl>

      <div className="mt-5 grid grid-cols-2 gap-3 border-t border-border/50 pt-5">
        <div>
          <p className="font-heading text-xl font-semibold text-foreground/90 tabular-nums">
            {report.completedAppointments}
          </p>
          <p className="text-[11px] text-muted-foreground">Appointment selesai</p>
        </div>
        <div>
          <p className="font-heading text-xl font-semibold text-foreground/90 tabular-nums">
            {formatIDR(report.averageTransaction)}
          </p>
          <p className="text-[11px] text-muted-foreground">Rata-rata transaksi</p>
        </div>
      </div>
    </section>
  );
}
