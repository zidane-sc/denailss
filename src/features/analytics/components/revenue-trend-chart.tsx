import { formatIDR } from "@/lib/format";
import type { RevenueTrendPoint } from "../types";

/**
 * Revenue trend — a single minimal SVG area+line chart answering "is revenue
 * going up or down?". No chart library: plain viewBox geometry like the
 * finance trend chart. Every point carries a `<title>` so hover/touch shows
 * the exact value, and the whole chart has an accessible summary.
 */
export function RevenueTrendChart({
  points,
  total,
}: {
  points: RevenueTrendPoint[];
  total: number;
}) {
  const width = 520;
  const height = 150;
  const padX = 8;
  const padTop = 14;
  const padBottom = 26;
  const chartW = width - padX * 2;
  const chartH = height - padTop - padBottom;
  const max = Math.max(1, ...points.map((p) => p.amount));

  const stepX = points.length > 1 ? chartW / (points.length - 1) : 0;
  const coords = points.map((p, i) => ({
    x: padX + i * stepX,
    y: padTop + chartH - (p.amount / max) * chartH,
  }));
  const linePath = coords
    .map((c, i) => `${i === 0 ? "M" : "L"}${c.x.toFixed(1)},${c.y.toFixed(1)}`)
    .join(" ");
  const areaPath =
    coords.length > 0
      ? `${linePath} L${coords[coords.length - 1].x.toFixed(1)},${(padTop + chartH).toFixed(1)} L${coords[0].x.toFixed(1)},${(padTop + chartH).toFixed(1)} Z`
      : "";
  const maxLabelIndex = points.reduce(
    (best, p, i) => (p.amount > points[best].amount ? i : best),
    0
  );

  return (
    <figure className="rounded-2xl border border-border/70 bg-card p-5 shadow-xs">
      <div className="flex items-baseline justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            Pemasukan
          </p>
          <h3 className="mt-1 font-heading text-2xl font-semibold tracking-tight text-foreground/90">
            {formatIDR(total)}
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
          aria-label={`Grafik tren pemasukan dari ${points[0]?.label} sampai ${points[points.length - 1]?.label}. Total ${formatIDR(total)}.`}
          className="mx-auto w-full min-w-80 max-w-[520px]"
        >
          {/* Baseline */}
          <line
            x1={padX}
            y1={padTop + chartH}
            x2={width - padX}
            y2={padTop + chartH}
            className="stroke-border/80"
            strokeWidth={1}
          />
          {/* Dotted mid guide so the shape reads without gridlines */}
          {max > 0 && (
            <line
              x1={padX}
              y1={padTop + chartH / 2}
              x2={width - padX}
              y2={padTop + chartH / 2}
              strokeDasharray="3 5"
              strokeWidth={1}
              className="stroke-border/50"
            />
          )}

          {areaPath && <path d={areaPath} className="fill-primary/10" />}
          {coords.length > 1 && (
            <path
              d={linePath}
              fill="none"
              strokeWidth={2.5}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="stroke-primary"
            />
          )}
          {coords.length === 1 && (
            <circle
              cx={coords[0].x}
              cy={coords[0].y}
              r={4}
              className="fill-primary"
            />
          )}

          {coords.map((c, i) => (
            <g key={points[i].key}>
              <title>
                {points[i].label}: {formatIDR(points[i].amount)}
              </title>
              <circle
                cx={c.x}
                cy={c.y}
                r={3}
                className="fill-card stroke-primary"
                strokeWidth={1.5}
              />
            </g>
          ))}

          {/* Highest point label */}
          {points[maxLabelIndex]?.amount > 0 && (
            <text
              x={coords[maxLabelIndex].x}
              y={Math.max(10, coords[maxLabelIndex].y - 8)}
              textAnchor="middle"
              className="fill-muted-foreground text-[9px] font-semibold"
            >
              {formatIDR(points[maxLabelIndex].amount)}
            </text>
          )}

          {/* X labels: first, middle, last to stay readable */}
          {[0, Math.floor((points.length - 1) / 2), points.length - 1]
            .filter((i, idx, arr) => arr.indexOf(i) === idx)
            .map((i) => (
              <text
                key={points[i].key}
                x={coords[i].x}
                y={height - 8}
                textAnchor="middle"
                className="fill-muted-foreground text-[9px] font-medium"
              >
                {points[i].label}
              </text>
            ))}
        </svg>
      </div>
    </figure>
  );
}
