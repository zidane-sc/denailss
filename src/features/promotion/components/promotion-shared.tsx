import { cn } from "@/lib/utils";
import type { PromotionStatus } from "@/types";
import type { Promotion } from "@/types";

export const STATUS_LABELS: Record<PromotionStatus, string> = {
  active: "Aktif",
  scheduled: "Terjadwal",
  expired: "Berakhir",
  inactive: "Nonaktif",
};

/**
 * Subtle status chip: a small filled dot + label. Only `Aktif` gets the
 * soft-emerald treatment; everything else is quiet gray/neutral.
 */
export function PromotionStatusBadge({ status }: { status: PromotionStatus }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-medium",
        status === "active"
          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
          : "border-border bg-muted/40 text-muted-foreground"
      )}
    >
      <span
        className={cn(
          "size-1.5 rounded-full",
          status === "active" ? "bg-emerald-500" : "bg-muted-foreground/60"
        )}
      />
      {STATUS_LABELS[status]}
    </span>
  );
}

export function PromoCodeChip({ code }: { code: string }) {
  return (
    <span className="inline-flex h-5 items-center rounded-md border border-border bg-muted/40 px-1.5 font-mono text-[10px] font-semibold tracking-wide text-foreground/80">
      {code}
    </span>
  );
}

/** The compact customer-facing promo card — also used as the admin preview. */
export function PromotionCard({
  promotion,
  status,
  className,
}: {
  promotion: Promotion;
  status: PromotionStatus;
  className?: string;
}) {
  const summary = promotion.discountType === "percentage"
    ? `${promotion.discountValue}%`
    : `Rp${promotion.discountValue.toLocaleString("id-ID")}`;

  return (
    <div
      className={cn(
        "flex flex-col gap-4 rounded-2xl border bg-card p-4 shadow-xs",
        className
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="font-mono text-[11px] font-semibold tracking-wide text-primary">
          {promotion.code}
        </span>
        <PromotionStatusBadge status={status} />
      </div>

      <div>
        <p className="font-heading text-2xl font-semibold tracking-tight text-foreground">
          {summary}
        </p>
        <p className="mt-0.5 text-xs text-muted-foreground">potongan harga</p>
      </div>

      <p className="text-sm font-semibold text-foreground/90">{promotion.title}</p>
      {promotion.description && (
        <p className="text-xs leading-relaxed text-muted-foreground">{promotion.description}</p>
      )}

      <div className="mt-auto space-y-1.5 border-t border-border/60 pt-3 text-[11px] text-foreground/70">
        {promotion.minimumSpend ? (
          <p className="flex items-center justify-between gap-2">
            <span className="text-muted-foreground">Min. transaksi</span>
            <span className="font-semibold">Rp{promotion.minimumSpend.toLocaleString("id-ID")}</span>
          </p>
        ) : null}
        <p className="flex items-center justify-between gap-2">
          <span className="text-muted-foreground">Berlaku</span>
          <span className="font-semibold">
            {promotion.startDate === promotion.endDate
              ? shortDateId(promotion.startDate)
              : `${shortDateId(promotion.startDate)} – ${shortDateId(promotion.endDate)}`}
          </span>
        </p>
      </div>
    </div>
  );
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

function shortDateId(dateKey: string) {
  if (!dateKey) return "";
  const [year, month, day] = dateKey.split("-").map(Number);
  return `${day} ${SHORT_MONTHS[month - 1]} ${year}`;
}
