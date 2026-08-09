import type { MonthTrendPoint } from "../logic/finance";
import { shortMonthLabel } from "../logic/finance";

/**
 * Simple financial trend — income / expense / profit over the recent months.
 * A minimal dependency-free SVG bar chart: one chart type, three bars per
 * month, nothing decorative. Deliberately small.
 */
export function FinanceTrendChart({ points }: { points: MonthTrendPoint[] }) {
  const max = Math.max(1, ...points.map((p) => Math.max(p.income, p.expense, 0)));
  const chartHeight = 120;
  const chartWidth = 340;
  const barGap = 3;
  const monthWidth = chartWidth / points.length;
  const barWidth = Math.min(14, monthWidth / 3 - barGap);

  return (
    <section className="rounded-2xl border border-border/70 bg-card p-5 shadow-xs">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            Tren Keuangan
          </p>
          <h3 className="mt-1 font-heading text-sm font-semibold text-foreground/90">
            6 bulan terakhir
          </h3>
        </div>
        <div className="hidden items-center gap-3 text-[10px] font-medium text-muted-foreground sm:flex">
          <LegendDot className="bg-primary" label="Pemasukan" />
          <LegendDot className="bg-border" label="Pengeluaran" />
          <LegendDot className="bg-accent" label="Profit" />
        </div>
      </div>

      <div className="mt-5 overflow-x-auto">
        <svg
          viewBox={`0 0 ${chartWidth} ${chartHeight + 22}`}
          role="img"
          aria-label="Grafik pemasukan, pengeluaran, dan profit 6 bulan terakhir"
          className="mx-auto w-full min-w-72 max-w-[340px]"
        >
          {points.map((point, i) => {
            const centerX = i * monthWidth + monthWidth / 2;
            return (
              <g key={point.monthKey}>
                <title>{`${point.monthLabel}: Pemasukan ${point.income}, Pengeluaran ${point.expense}, Profit ${point.profit}`}</title>
                <rect
                  x={centerX - barWidth * 1.5 - barGap}
                  y={chartHeight - (point.income / max) * chartHeight}
                  width={barWidth}
                  height={Math.max(1, (point.income / max) * chartHeight)}
                  rx={2}
                  className="fill-primary"
                />
                <rect
                  x={centerX - barWidth * 0.5}
                  y={chartHeight - (point.expense / max) * chartHeight}
                  width={barWidth}
                  height={Math.max(1, (point.expense / max) * chartHeight)}
                  rx={2}
                  className="fill-border"
                />
                <rect
                  x={centerX + barWidth * 0.5 + barGap}
                  y={chartHeight - (Math.max(point.profit, 0) / max) * chartHeight}
                  width={barWidth}
                  height={Math.max(1, (Math.max(point.profit, 0) / max) * chartHeight)}
                  rx={2}
                  className="fill-accent"
                />
                <text
                  x={centerX}
                  y={chartHeight + 16}
                  textAnchor="middle"
                  className="fill-muted-foreground text-[9px] font-medium"
                >
                  {shortMonthLabel(point.monthKey)}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </section>
  );
}

function LegendDot({ className, label }: { className: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5">
      <span className={`size-2 rounded-sm ${className}`} />
      {label}
    </span>
  );
}
