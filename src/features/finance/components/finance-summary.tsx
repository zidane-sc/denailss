import { formatIDR } from "@/lib/format";
import { monthKeyInfo } from "../logic/finance";

/**
 * Financial summary — the three numbers that answer "how is the business
 * doing this month?". Strong typography, a visible income → expense → profit
 * relationship, and one accent color. Not a KPI wall.
 */
export function FinanceSummary({
  income,
  expense,
  profit,
  monthKey,
  profitComparison,
}: {
  income: number;
  expense: number;
  profit: number;
  monthKey: string;
  profitComparison?: { pct: number; previousProfit: number } | null;
}) {
  const { label } = monthKeyInfo(monthKey);

  return (
    <section className="rounded-2xl border border-border/70 bg-card p-5 shadow-xs sm:p-6">
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
        Ringkasan · {label}
      </p>

      <div className="mt-5 grid grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-3">
        <SummaryBlock label="Pemasukan" value={formatIDR(income)} tone="primary" />
        <SummaryBlock label="Pengeluaran" value={formatIDR(expense)} tone="muted" />
        <SummaryBlock
          label="Profit"
          value={formatIDR(profit)}
          tone={profit >= 0 ? "positive" : "negative"}
          comparison={profitComparison}
        />
      </div>
    </section>
  );
}

function SummaryBlock({
  label,
  value,
  tone,
  comparison,
}: {
  label: string;
  value: string;
  tone: "primary" | "muted" | "positive" | "negative";
  comparison?: { pct: number; previousProfit: number } | null;
}) {
  return (
    <div className="relative pl-4">
      <span
        className={
          tone === "primary"
            ? "absolute inset-y-1 left-0 w-0.5 rounded-full bg-primary"
            : tone === "positive"
              ? "absolute inset-y-1 left-0 w-0.5 rounded-full bg-emerald-500"
              : tone === "negative"
                ? "absolute inset-y-1 left-0 w-0.5 rounded-full bg-rose-500"
                : "absolute inset-y-1 left-0 w-0.5 rounded-full bg-border"
        }
      />
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p
        className={
          "mt-1 font-heading text-2xl font-semibold tracking-tight sm:text-[1.7rem] " +
          (tone === "positive" ? "text-emerald-700" : tone === "negative" ? "text-rose-600" : "text-foreground/90")
        }
      >
        {value}
      </p>
      {comparison && (
        <p className="mt-1 text-[11px] text-muted-foreground">
          {comparison.pct >= 0 ? (
            <span className="font-semibold text-emerald-700">
              +{comparison.pct.toLocaleString("id-ID", { maximumFractionDigits: 0 })}%
            </span>
          ) : (
            <span className="font-semibold text-rose-600">
              {comparison.pct.toLocaleString("id-ID", { maximumFractionDigits: 0 })}%
            </span>
          )}{" "}
          vs bulan lalu
        </p>
      )}
    </div>
  );
}
