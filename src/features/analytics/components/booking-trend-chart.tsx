import type { BookingTrendPoint } from "../types";

/**
 * Booking trend — one compact bar chart answering "when is the shop busy?".
 * Buckets are sized to the period (daily / weekly / monthly). A zero-count
 * bar gets a tiny stub so an empty period is visible but never faked as data.
 */
export function BookingTrendChart({ points }: { points: BookingTrendPoint[] }) {
  const width = 520;
  const height = 150;
  const padX = 8;
  const padTop = 14;
  const padBottom = 26;
  const chartW = width - padX * 2;
  const chartH = height - padTop - padBottom;
  const max = Math.max(1, ...points.map((p) => p.count));

  const slotW = points.length > 0 ? chartW / points.length : chartW;
  const barW = Math.min(26, Math.max(4, slotW * 0.62));
  const maxIndex = points.reduce(
    (best, p, i) => (p.count > points[best].count ? i : best),
    0
  );

  return (
    <figure className="rounded-2xl border border-border/70 bg-card p-5 shadow-xs">
      <div className="flex items-baseline justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            Booking per {points.length > 45 ? "minggu" : points.length > 20 ? "hari" : points.length > 8 ? "minggu" : "hari"}
          </p>
          <h3 className="mt-1 font-heading text-sm font-semibold text-foreground/90">
            Kapan customer booking?
          </h3>
        </div>
        <p className="text-right text-xs leading-relaxed text-muted-foreground">
          {points[0]?.label}
          <br />
          {points[points.length - 1]?.label}
        </p>
      </div>

      <div className="mt-4 overflow-x-auto">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          role="img"
          aria-label={`Grafik jumlah booking dari ${points[0]?.label} sampai ${points[points.length - 1]?.label}.`}
          className="mx-auto w-full min-w-80 max-w-[520px]"
        >
          {points.map((p, i) => {
            const x = padX + i * slotW + (slotW - barW) / 2;
            const barH = p.count > 0 ? Math.max(2, (p.count / max) * chartH) : 2;
            const y = padTop + chartH - barH;
            const showLabel =
              p.count > 0 &&
              (points.length <= 20 ||
                i === maxIndex ||
                i === 0 ||
                i === points.length - 1);
            return (
              <g key={p.key}>
                <title>{`${p.label}: ${p.count} booking`}</title>
                <rect
                  x={x}
                  y={y}
                  width={barW}
                  height={barH}
                  rx={2.5}
                  className={p.count > 0 ? "fill-primary" : "fill-primary/25"}
                />
                {showLabel && (
                  <text
                    x={x + barW / 2}
                    y={y - 5}
                    textAnchor="middle"
                    className="fill-muted-foreground text-[9px] font-semibold"
                  >
                    {p.count}
                  </text>
                )}
              </g>
            );
          })}

          {/* X labels: first, middle, last */}
          {[0, Math.floor((points.length - 1) / 2), points.length - 1]
            .filter((idx, i, arr) => arr.indexOf(idx) === i)
            .map((idx) => (
              <text
                key={points[idx].key}
                x={padX + idx * slotW + slotW / 2}
                y={height - 8}
                textAnchor="middle"
                className="fill-muted-foreground text-[9px] font-medium"
              >
                {points[idx].label}
              </text>
            ))}
        </svg>
      </div>
    </figure>
  );
}
