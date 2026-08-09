import { formatIDR } from "@/lib/format";
import type { IncomeEntry } from "../types";
import { shortDayMonth } from "../logic/finance";

/**
 * Income list — recent completed-appointment income for the selected month.
 * Lightweight rows (date, customer, service, appointment, amount). This is a
 * notebook, not an accounting ledger.
 */
export function IncomeList({ entries }: { entries: IncomeEntry[] }) {
  return (
    <section className="rounded-2xl border border-border/70 bg-card shadow-xs">
      <div className="flex items-center justify-between border-b border-border/50 px-5 py-4">
        <h3 className="font-heading text-sm font-semibold text-foreground/90">Pemasukan</h3>
        <span className="text-[11px] text-muted-foreground">
          {entries.length} transaksi
        </span>
      </div>

      {entries.length === 0 ? (
        <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
          <p className="text-sm font-semibold text-foreground/85">
            Belum ada pemasukan bulan ini.
          </p>
          <p className="mt-1 max-w-xs text-xs text-muted-foreground leading-relaxed">
            Pemasukan dihitung dari appointment yang sudah selesai dikerjakan.
          </p>
        </div>
      ) : (
        <ul className="divide-y divide-border/40">
          {entries.map((entry) => (
            <li
              key={entry.appointmentId}
              className="flex items-center gap-3 px-5 py-3 sm:gap-4"
            >
              <div className="w-12 shrink-0">
                <p className="text-sm font-semibold text-foreground">{shortDayMonth(entry.date)}</p>
                <p className="text-[10px] text-muted-foreground">{entry.appointmentTime}</p>
              </div>

              <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 font-heading text-xs font-semibold text-primary">
                {entry.customerName.trim().charAt(0)}
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-foreground">{entry.customerName}</p>
                <p className="truncate text-[11px] text-muted-foreground">{entry.serviceName}</p>
              </div>

              <p className="shrink-0 text-sm font-semibold text-foreground tabular-nums">
                {formatIDR(entry.amount)}
              </p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
