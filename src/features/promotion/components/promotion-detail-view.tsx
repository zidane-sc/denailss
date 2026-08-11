"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeftIcon,
  CheckIcon,
  PencilSimpleIcon,
  PlayIcon,
  StopIcon,
  XIcon,
} from "@phosphor-icons/react/dist/ssr";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { motion, useReducedMotion } from "motion/react";
import { useLiveServices } from "@/features/services/components/services-provider";
import { setPromotionActiveApi, updatePromotionApi } from "../services/promotion-admin-api";
import { usePromotionsRefresh } from "./promotions-provider";
import {
  formatRp,
  getPromotionStatus,
  promotionPeriodLabel,
  promoDaysBetween,
} from "../logic/promotion";
import { PromotionForm, draftFromPromotion } from "./promotion-form";
import { PromotionCard, PromotionStatusBadge } from "./promotion-shared";
import type { Promotion } from "@/types";

function InfoRow({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-2.5">
      <dt className="shrink-0 text-xs text-muted-foreground">{label}</dt>
      <dd
        className={cn(
          "text-right text-sm font-medium text-foreground/90",
          mono && "font-mono tracking-wide"
        )}
      >
        {value}
      </dd>
    </div>
  );
}

export function PromotionDetailView({ promotion }: { promotion: Promotion }) {
  const reduce = useReducedMotion();
  const services = useLiveServices();
  const refreshPromotions = usePromotionsRefresh();
  const [draft, setDraft] = useState(promotion);
  const [editing, setEditing] = useState(false);
  const [confirmAction, setConfirmAction] = useState<"deactivate" | "activate" | null>(null);

  const status = getPromotionStatus(draft);

  const handleToggle = async () => {
    const next = { ...draft, active: !draft.active };
    try {
      await setPromotionActiveApi(draft.id, next.active);
      setDraft(next);
      setConfirmAction(null);
      refreshPromotions();
      toast.success(
        next.active ? "Promo diaktifkan." : "Promo dinonaktifkan.",
        {
          description: next.active
            ? "Customer sekarang bisa memakai kode ini untuk booking baru."
            : "Customer tidak akan bisa memakai kode ini untuk booking baru.",
        }
      );
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Gagal mengubah status promo.");
    }
  };

  const handleSave = async (saved: Promotion) => {
    try {
      await updatePromotionApi(saved);
      setDraft(saved);
      setEditing(false);
      refreshPromotions();
      toast.success("Perubahan promo disimpan.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Gagal menyimpan promo.");
    }
  };

  const servicesLabel = !draft.applicableServiceSlugs?.length
    ? "Semua layanan"
    : services
        .filter((s) => s.active)
        .filter((s) => draft.applicableServiceSlugs!.includes(s.slug))
        .map((s) => s.name)
        .join(", ");

  const dayCount =
    draft.startDate && draft.endDate && draft.endDate >= draft.startDate
      ? promoDaysBetween(draft.startDate, draft.endDate) + 1
      : 0;

  return (
    <div className="mx-auto max-w-5xl space-y-6 animate-in fade-in duration-300">
      {/* Back */}
      <Button
        variant="ghost"
        size="sm"
        className="h-8 gap-1.5 rounded-full pl-2 pr-3 text-muted-foreground hover:text-foreground [&>svg]:size-4"
        nativeButton={false}
        render={<Link href="/backoffice/promotions" />}
      >
        <ArrowLeftIcon />
        Daftar Promo
      </Button>

      {editing ? (
        <div className="space-y-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="font-heading text-2xl font-semibold tracking-tight text-foreground/90">
                Edit Promo
              </h2>
              <p className="mt-0.5 text-sm text-muted-foreground">
                Ubah detail promo ini. Perubahan langsung terlihat oleh customer.
              </p>
            </div>
            <PromotionStatusBadge status={status} />
          </div>
          <PromotionForm
            initial={draftFromPromotion(draft)}
            usedCount={draft.usedCount}
            onSubmit={handleSave}
            onCancel={() => setEditing(false)}
          />
        </div>
      ) : (
        <>
          {/* Header / identity */}
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="flex flex-col gap-4 border-b border-border/50 pb-6 md:flex-row md:items-start md:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <h2 className="font-heading text-2xl font-semibold tracking-tight text-foreground/90">
                    {draft.title}
                  </h2>
                  <PromotionStatusBadge status={status} />
                </div>
                {draft.description && (
                  <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                    {draft.description}
                  </p>
                )}
                <p className="mt-3 font-mono text-sm font-bold tracking-wide text-primary">
                  {draft.code}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {status !== "expired" && (
                  <Button
                    size="sm"
                    className={cn(
                      "gap-1.5 rounded-full px-4 shadow-sm",
                      draft.active && "bg-secondary text-secondary-foreground hover:bg-secondary/90"
                    )}
                    onClick={() => setConfirmAction(draft.active ? "deactivate" : "activate")}
                  >
                    {draft.active ? (
                      <>
                        <StopIcon weight="fill" className="size-4" />
                        Nonaktifkan
                      </>
                    ) : (
                      <>
                        <PlayIcon weight="fill" className="size-4" />
                        Aktifkan
                      </>
                    )}
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5 rounded-full px-4"
                  onClick={() => setEditing(true)}
                >
                  <PencilSimpleIcon className="size-4" />
                  Edit
                </Button>
              </div>
            </div>
          </motion.div>

          {/* Main grid */}
          <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[1fr_300px]">
            <div className="space-y-6">
              {/* Discount + period + usage */}
              <section className="rounded-2xl border border-border/70 bg-card p-5 shadow-xs">
                <h3 className="font-heading text-sm font-semibold text-foreground/90">
                  Penawaran
                </h3>
                <dl className="mt-2 divide-y divide-border/50">
                  <InfoRow
                    label="Jenis Diskon"
                    value={draft.discountType === "percentage" ? "Persen" : "Nominal"}
                  />
                  <InfoRow
                    label="Nilai Diskon"
                    value={
                      draft.discountType === "percentage"
                        ? `${draft.discountValue}%`
                        : formatRp(draft.discountValue)
                    }
                  />
                  {draft.maximumDiscount !== undefined && draft.discountType === "percentage" && (
                    <InfoRow label="Maksimal Diskon" value={formatRp(draft.maximumDiscount)} />
                  )}
                  <InfoRow
                    label="Periode"
                    value={`${promotionPeriodLabel(draft)}${dayCount > 0 ? ` · ${dayCount} hari` : ""}`}
                  />
                  <InfoRow
                    label="Pemakaian"
                    value={
                      draft.usageLimit > 0
                        ? `${draft.usedCount} / ${draft.usageLimit}`
                        : `${draft.usedCount} kali (tanpa batas)`
                    }
                  />
                </dl>
              </section>

              {/* Rules */}
              <section className="rounded-2xl border border-border/70 bg-card p-5 shadow-xs">
                <h3 className="font-heading text-sm font-semibold text-foreground/90">Aturan</h3>
                <dl className="mt-2 divide-y divide-border/50">
                  <InfoRow
                    label="Minimum Transaksi"
                    value={draft.minimumSpend ? formatRp(draft.minimumSpend) : "Tanpa minimal"}
                  />
                  <InfoRow label="Layanan yang Berlaku" value={servicesLabel} />
                </dl>
              </section>

              {/* Usage note */}
              <section className="rounded-2xl border border-border/70 bg-card p-5 shadow-xs">
                <h3 className="font-heading text-sm font-semibold text-foreground/90">
                  Info Pemakaian
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  Kode ini dipakai {draft.usedCount} kali
                  {draft.usageLimit > 0
                    ? ` dari ${draft.usageLimit} pemakaian yang tersedia`
                    : " tanpa batas pemakaian"}
                  .
                  {draft.usedCount > 0 &&
                    " Jika kamu mengubah diskonnya, pemakaian lama tetap tercatat seperti sekarang."}
                </p>
              </section>
            </div>

            {/* Customer-facing card */}
            <div className="lg:sticky lg:top-24">
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                Tampilan untuk customer
              </p>
              <PromotionCard promotion={draft} status={status} />
              <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">
                Kartu ini adalah representasi kecil dari promo yang customer lihat di situs &amp;
                halaman booking.
              </p>
            </div>
          </div>
        </>
      )}

      {/* Activate / deactivate confirm */}
      <Dialog
        open={Boolean(confirmAction)}
        onOpenChange={(open) => !open && setConfirmAction(null)}
      >
        <DialogContent className="sm:max-w-md bg-card">
          <DialogHeader>
            <DialogTitle className="font-heading text-lg font-semibold text-foreground/90">
              {confirmAction === "deactivate" ? "Nonaktifkan promo ini?" : "Aktifkan promo ini?"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm leading-relaxed text-muted-foreground">
              {confirmAction === "deactivate"
                ? `Customer tidak akan bisa menggunakan kode ${draft.code} untuk booking baru.`
                : `Customer akan langsung bisa menggunakan kode ${draft.code} untuk booking baru.`}
            </p>
            <div className="flex items-center justify-end gap-2">
              <Button
                variant="ghost"
                className="gap-1.5 rounded-full text-muted-foreground"
                onClick={() => setConfirmAction(null)}
              >
                <XIcon className="size-4" />
                Batal
              </Button>
              <Button
                className={cn(
                  "gap-1.5 rounded-full",
                  confirmAction === "deactivate" && "bg-secondary text-secondary-foreground hover:bg-secondary/90"
                )}
                onClick={handleToggle}
              >
                {confirmAction === "deactivate" ? (
                  <>
                    <StopIcon weight="fill" className="size-4" />
                    Nonaktifkan
                  </>
                ) : (
                  <>
                    <CheckIcon className="size-4" />
                    Aktifkan
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
