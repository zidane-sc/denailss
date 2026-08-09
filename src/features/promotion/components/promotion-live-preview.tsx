"use client";

import { TicketIcon } from "@phosphor-icons/react/dist/ssr";
import { cn } from "@/lib/utils";
import { motion, useReducedMotion } from "motion/react";
import { formatRp, promoDaysBetween, promotionPeriodLabel, shortDateId } from "../logic/promotion";

/**
 * Draft promotion preview — the small customer-facing card that updates live
 * as the create/edit form changes. Shows exactly what a customer would see.
 */
export function PromotionLivePreview({
  code,
  title,
  discountType,
  discountValue,
  maximumDiscount,
  minimumSpend,
  startDate,
  endDate,
  usedCount,
  usageLimit,
  active,
  errors,
}: {
  code: string;
  title: string;
  discountType: "percentage" | "fixed";
  discountValue: string;
  maximumDiscount: string;
  minimumSpend: string;
  startDate: string;
  endDate: string;
  usedCount: number;
  usageLimit: string;
  active: boolean;
  errors: Record<string, string>;
}) {
  const reduce = useReducedMotion();

  const parsedDiscount = Number(discountValue);
  const parsedMax = Number(maximumDiscount);
  const parsedMinSpend = Number(minimumSpend);
  const parsedLimit = Number(usageLimit);

  const summary =
    discountType === "percentage" && Number.isFinite(parsedDiscount) && parsedDiscount > 0
      ? `${parsedDiscount}%`
      : discountType === "fixed" && Number.isFinite(parsedDiscount) && parsedDiscount > 0
        ? formatRp(parsedDiscount)
        : "—";

  const maxLine =
    discountType === "percentage" && Number.isFinite(parsedMax) && parsedMax > 0
      ? `Maks. ${formatRp(parsedMax)}`
      : null;

  const minSpendLine =
    Number.isFinite(parsedMinSpend) && parsedMinSpend > 0
      ? `Min. transaksi ${formatRp(parsedMinSpend)}`
      : null;

  const periodLine =
    startDate && endDate
      ? endDate < startDate
        ? "Periode belum valid"
        : `Berlaku ${promotionPeriodLabel({ startDate, endDate } as never)}`
      : null;

  const hasEnd = Boolean(endDate);
  const limitUnlimited = parsedLimit <= 0;

  const valid = !Object.values(errors).some(Boolean) && Boolean(code) && Boolean(title);
  const todayKey = "2026-08-09";
  const isActive =
    valid &&
    active &&
    Boolean(startDate && endDate) &&
    startDate <= todayKey &&
    endDate >= todayKey &&
    promoDaysBetween(startDate, endDate) >= 0;

  const status = valid
    ? isActive
      ? { label: "Promo aktif", tone: "bg-emerald-50 text-emerald-700 border-emerald-200" }
      : active && Boolean(startDate && endDate) && startDate > todayKey
        ? { label: "Terjadwal", tone: "bg-secondary-soft text-secondary-foreground border-secondary/30" }
        : { label: "Belum aktif", tone: "bg-muted text-muted-foreground border-border" }
    : { label: "Menunggu diisi", tone: "bg-muted text-muted-foreground border-border" };

  return (
    <div className="relative">
      <motion.div
        key={`${code}-${summary}-${maxLine}-${minSpendLine}-${periodLine}-${status.label}`}
        initial={reduce ? false : { opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="overflow-hidden rounded-2xl border border-border/70 bg-card shadow-xs"
      >
        <div className="flex items-center justify-between gap-2 border-b border-border/60 bg-muted/30 px-4 py-2.5">
          <span className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            <TicketIcon weight="bold" className="size-3.5 text-primary" />
            Pratinjau promo
          </span>
          <span
            className={cn(
              "inline-flex h-5 items-center rounded-full border px-2 text-[10px] font-semibold",
              status.tone
            )}
          >
            {status.label}
          </span>
        </div>

        <div className="flex flex-col gap-3 px-4 py-4">
          <div className="flex items-center justify-between gap-2">
            <p className="font-mono text-sm font-bold tracking-wide text-primary">
              {code || "KODE"}
            </p>
            <p className="text-[10px] text-muted-foreground">
              {hasEnd && limitUnlimited ? "Tanpa batas pemakaian" : ""}
            </p>
          </div>

          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
            <p className="font-heading text-2xl font-semibold tracking-tight text-foreground">
              {summary}
            </p>
            {maxLine && (
              <p className="text-xs font-medium text-muted-foreground">{maxLine}</p>
            )}
          </div>

          <p className="text-sm font-semibold text-foreground/90">{title || "Judul promo"}</p>

          <div className="space-y-1 text-[11px] text-foreground/75">
            {minSpendLine && (
              <p className="flex items-center justify-between gap-2">
                <span className="text-muted-foreground">Min. transaksi</span>
                <span className="font-semibold">{minSpendLine.replace("Min. transaksi ", "")}</span>
              </p>
            )}
            {periodLine && (
              <p className="flex items-center justify-between gap-2">
                <span className="text-muted-foreground">Berlaku</span>
                <span className="font-semibold">{periodLine.replace("Berlaku ", "")}</span>
              </p>
            )}
            {usedCount > 0 && (
              <p className="flex items-center justify-between gap-2">
                <span className="text-muted-foreground">Sudah dipakai</span>
                <span className="font-semibold">{usedCount} kali</span>
              </p>
            )}
            {!hasEnd && (
              <p className="flex items-center justify-between gap-2">
                <span className="text-muted-foreground">Berlaku</span>
                <span className="font-semibold">Pilih periode dulu</span>
              </p>
            )}
          </div>
        </div>
      </motion.div>

      <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">
        Tampilan yang sama akan dilihat customer di situs &amp; halaman booking. Periode mengikuti
        tanggal hari ini ({shortDateId("2026-08-09")}).
      </p>
    </div>
  );
}
