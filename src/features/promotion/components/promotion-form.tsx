"use client";

import { useMemo, useState } from "react";
import {
  CheckIcon,
  SparkleIcon,
  XIcon,
} from "@phosphor-icons/react/dist/ssr";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { getActiveServices } from "@/features/services/data/services-admin.mock";
import { generatePromoCode, promoDaysBetween, shortDateId } from "../logic/promotion";
import { PromotionLivePreview } from "./promotion-live-preview";
import type { Promotion } from "@/types";

export interface PromotionDraft {
  id?: string;
  code: string;
  title: string;
  description: string;
  discountType: "percentage" | "fixed";
  discountValue: string;
  maximumDiscount: string;
  startDate: string;
  endDate: string;
  usageLimit: string;
  minimumSpend: string;
  applicableServiceSlugs: string[];
  active: boolean;
}

export function draftFromPromotion(promotion: Promotion): PromotionDraft {
  return {
    id: promotion.id,
    code: promotion.code,
    title: promotion.title,
    description: promotion.description,
    discountType: promotion.discountType,
    discountValue: String(promotion.discountValue),
    maximumDiscount: promotion.maximumDiscount ? String(promotion.maximumDiscount) : "",
    startDate: promotion.startDate,
    endDate: promotion.endDate,
    usageLimit: promotion.usageLimit > 0 ? String(promotion.usageLimit) : "",
    minimumSpend: promotion.minimumSpend ? String(promotion.minimumSpend) : "",
    applicableServiceSlugs: promotion.applicableServiceSlugs ?? [],
    active: promotion.active,
  };
}

export function emptyDraft(): PromotionDraft {
  return {
    code: "",
    title: "",
    description: "",
    discountType: "percentage",
    discountValue: "",
    maximumDiscount: "",
    startDate: "",
    endDate: "",
    usageLimit: "",
    minimumSpend: "",
    applicableServiceSlugs: [],
    active: true,
  };
}

function SectionCard({
  title,
  step,
  children,
}: {
  title: string;
  step: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-border/70 bg-card p-5 shadow-xs">
      <div className="mb-4 flex items-center gap-2.5">
        <span className="flex size-6 items-center justify-center rounded-full bg-primary/10 font-mono text-[11px] font-bold text-primary">
          {step}
        </span>
        <h3 className="font-heading text-sm font-semibold text-foreground/90">{title}</h3>
      </div>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

function Field({
  label,
  hint,
  error,
  children,
}: {
  label: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid gap-1.5">
      <Label className="font-medium text-foreground/90">{label}</Label>
      {children}
      {hint && !error && <p className="text-[11px] text-muted-foreground">{hint}</p>}
      {error && <p className="text-[11px] font-medium text-destructive">{error}</p>}
    </div>
  );
}

export function PromotionForm({
  initial,
  usedCount = 0,
  onSubmit,
  onCancel,
}: {
  initial: PromotionDraft;
  usedCount?: number;
  onSubmit: (promotion: Promotion, mode: "create" | "update") => void;
  onCancel: () => void;
}) {
  const editing = Boolean(initial.id);
  const [draft, setDraft] = useState<PromotionDraft>(initial);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const set = <K extends keyof PromotionDraft>(key: K, value: PromotionDraft[K]) => {
    setDraft((d) => ({ ...d, [key]: value }));
  };

  const toggleService = (slug: string) => {
    setDraft((d) => {
      const has = d.applicableServiceSlugs.includes(slug);
      return {
        ...d,
        applicableServiceSlugs: has
          ? d.applicableServiceSlugs.filter((s) => s !== slug)
          : [...d.applicableServiceSlugs, slug],
      };
    });
  };

  const validate = (): Record<string, string> => {
    const e: Record<string, string> = {};

    if (!draft.title.trim()) e.title = "Judul promo wajib diisi.";

    const code = draft.code.trim().toUpperCase();
    if (!code) e.code = "Kode promo wajib diisi.";
    else if (!/^[A-Z0-9]{2,20}$/.test(code))
      e.code = "Gunakan huruf dan angka saja, tanpa spasi (contoh: WEEKEND20).";

    const discount = Number(draft.discountValue);
    if (!draft.discountValue.trim()) {
      e.discount = draft.discountType === "percentage" ? "Diskon wajib diisi." : "Potongan wajib diisi.";
    } else if (!Number.isFinite(discount) || discount <= 0) {
      e.discount = "Nilai diskon harus lebih dari 0.";
    } else if (draft.discountType === "percentage" && discount > 90) {
      e.discount = "Diskon maksimal 90%.";
    }

    if (draft.discountType === "percentage" && draft.maximumDiscount.trim()) {
      const max = Number(draft.maximumDiscount);
      if (!Number.isFinite(max) || max < 0)
        e.maximumDiscount = "Maksimal diskon harus angka yang valid.";
    }

    if (!draft.startDate) e.startDate = "Tanggal mulai wajib diisi.";
    if (!draft.endDate) e.endDate = "Tanggal berakhir wajib diisi.";
    if (draft.startDate && draft.endDate && draft.endDate < draft.startDate) {
      e.endDate = "Tanggal berakhir harus setelah tanggal mulai.";
    }

    if (draft.usageLimit.trim() && Number(draft.usageLimit) <= 0) {
      e.usageLimit = "Batasan pemakaian harus lebih dari 0.";
    }

    if (draft.minimumSpend.trim() && Number(draft.minimumSpend) < 0) {
      e.minimumSpend = "Minimum transaksi tidak boleh negatif.";
    }

    return e;
  };

  const errorsMemo = useMemo(
    () => validate(),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [draft]
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const nextErrors = validate();
    setErrors(nextErrors);
    if (Object.values(nextErrors).some(Boolean)) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    const code = draft.code.trim().toUpperCase();
    const serviceSlugs =
      draft.applicableServiceSlugs.length > 0
        ? draft.applicableServiceSlugs
        : undefined;
    const usageLimit = Number(draft.usageLimit) > 0 ? Number(draft.usageLimit) : 0;
    const minimumSpend = Number(draft.minimumSpend) > 0 ? Number(draft.minimumSpend) : undefined;
    const maximumDiscount =
      draft.discountType === "percentage" && Number(draft.maximumDiscount) > 0
        ? Number(draft.maximumDiscount)
        : undefined;

    onSubmit(
      {
        id: draft.id ?? `promo-${Date.now()}`,
        code,
        title: draft.title.trim(),
        description: draft.description.trim(),
        discountType: draft.discountType,
        discountValue: Number(draft.discountValue),
        startDate: draft.startDate,
        endDate: draft.endDate,
        usageLimit,
        usedCount,
        minimumSpend,
        applicableServiceSlugs: serviceSlugs,
        maximumDiscount,
        active: draft.active,
      },
      editing ? "update" : "create"
    );
  };

  const renderErrors = (key: string) => errors[key];

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-6">
      {/* Global error summary */}
      {Object.keys(errors).length > 0 && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3">
          <p className="text-sm font-semibold text-destructive">
            Ada beberapa hal yang perlu diperbaiki dulu.
          </p>
          <p className="mt-0.5 text-xs text-destructive/90">
            Periksa kembali isian yang ditandai di bawah.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          {/* Basic info */}
          <SectionCard title="Informasi Dasar" step="1">
            <Field label="Judul Promo *" error={renderErrors("title")}>
              <Input
                value={draft.title}
                onChange={(e) => set("title", e.target.value)}
                placeholder="Contoh: Weekend Nail Date"
                className="h-10"
                aria-invalid={Boolean(errors.title)}
              />
            </Field>
            <Field label="Deskripsi" hint="Cerita singkat yang akan dilihat customer.">
              <Textarea
                value={draft.description}
                onChange={(e) => set("description", e.target.value)}
                placeholder="Contoh: Diskon 20% untuk semua layanan, khusus weekend."
                rows={3}
              />
            </Field>
            <Field label="Kode Promo *" error={renderErrors("code")}>
              <div className="flex gap-2">
                <Input
                  value={draft.code}
                  onChange={(e) =>
                    set(
                      "code",
                      e.target.value
                        .toUpperCase()
                        .replace(/[^A-Z0-9]/g, "")
                        .slice(0, 20)
                    )
                  }
                  placeholder="WEEKEND20"
                  className="h-10 font-mono uppercase"
                  aria-invalid={Boolean(errors.code)}
                />
                <Button
                  type="button"
                  variant="outline"
                  className="h-10 shrink-0 gap-1.5 rounded-full px-3 text-xs"
                  onClick={() => {
                    const generated = generatePromoCode(draft.title);
                    if (generated) set("code", generated);
                  }}
                >
                  <SparkleIcon className="size-3.5" />
                  Generate
                </Button>
              </div>
              <p className="text-[11px] text-muted-foreground">
                Auto-normalisasi: huruf besar, tanpa spasi.
              </p>
            </Field>
          </SectionCard>

          {/* Discount */}
          <SectionCard title="Diskon" step="2">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="grid gap-1.5">
                <Label className="font-medium text-foreground/90">Jenis Diskon</Label>
                <div className="flex gap-2">
                  {(
                    [
                      { value: "percentage", label: "Persen" },
                      { value: "fixed", label: "Nominal" },
                    ] as const
                  ).map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      aria-pressed={draft.discountType === opt.value}
                      onClick={() => set("discountType", opt.value)}
                      className={cn(
                        "flex h-10 flex-1 items-center justify-center rounded-lg border text-sm font-medium transition-colors",
                        draft.discountType === opt.value
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground"
                      )}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
              <Field
                label={draft.discountType === "percentage" ? "Diskon (%) *" : "Potongan (Rp) *"}
                error={renderErrors("discount")}
              >
                <div className="relative">
                  {draft.discountType === "percentage" ? (
                    <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-muted-foreground">
                      %
                    </span>
                  ) : (
                    <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-muted-foreground">
                      Rp
                    </span>
                  )}
                  <Input
                    type="number"
                    min={0}
                    step={draft.discountType === "percentage" ? 1 : 1000}
                    value={draft.discountValue}
                    onChange={(e) => set("discountValue", e.target.value)}
                    placeholder={draft.discountType === "percentage" ? "20" : "30000"}
                    className={cn("h-10", draft.discountType === "percentage" ? "pr-8" : "pl-10")}
                    aria-invalid={Boolean(errors.discount)}
                  />
                </div>
              </Field>
            </div>

            {draft.discountType === "percentage" && (
              <Field
                label="Maksimal Diskon (Rp)"
                hint="Opsional. Batas atas potongan untuk promo persen."
                error={renderErrors("maximumDiscount")}
              >
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-muted-foreground">
                    Rp
                  </span>
                  <Input
                    type="number"
                    min={0}
                    step={1000}
                    value={draft.maximumDiscount}
                    onChange={(e) => set("maximumDiscount", e.target.value)}
                    placeholder="contoh: 50000"
                    className="h-10 pl-10"
                    aria-invalid={Boolean(errors.maximumDiscount)}
                  />
                </div>
              </Field>
            )}
          </SectionCard>

          {/* Period */}
          <SectionCard title="Periode Promo" step="3">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Tanggal Mulai *" error={renderErrors("startDate")}>
                <Input
                  type="date"
                  value={draft.startDate}
                  onChange={(e) => {
                    set("startDate", e.target.value);
                    if (draft.endDate && e.target.value > draft.endDate) set("endDate", "");
                  }}
                  className="h-10"
                  aria-invalid={Boolean(errors.startDate)}
                />
              </Field>
              <Field label="Tanggal Berakhir *" error={renderErrors("endDate")}>
                <Input
                  type="date"
                  min={draft.startDate || undefined}
                  value={draft.endDate}
                  onChange={(e) => set("endDate", e.target.value)}
                  className="h-10"
                  aria-invalid={Boolean(errors.endDate)}
                />
              </Field>
            </div>
            {draft.startDate && draft.endDate && draft.endDate >= draft.startDate && (
              <p className="text-[11px] text-muted-foreground">
                Berlaku{" "}
                {promoDaysBetween(draft.startDate, draft.endDate) === 0
                  ? "1 hari"
                  : `${promoDaysBetween(draft.startDate, draft.endDate) + 1} hari`}{" "}
                · {shortDateId(draft.startDate)} – {shortDateId(draft.endDate)}
              </p>
            )}
          </SectionCard>

          {/* Usage limit */}
          <SectionCard title="Batasan Pemakaian" step="4">
            <Field
              label="Jumlah Maksimal Pemakaian"
              hint="Kosongkan untuk tanpa batas (unlimited)."
              error={renderErrors("usageLimit")}
            >
              <Input
                type="number"
                min={0}
                step={1}
                value={draft.usageLimit}
                onChange={(e) => set("usageLimit", e.target.value)}
                placeholder="contoh: 50"
                className="h-10"
                aria-invalid={Boolean(errors.usageLimit)}
              />
            </Field>
          </SectionCard>

          {/* Rules */}
          <SectionCard title="Aturan" step="5">
            <Field
              label="Minimum Transaksi (Rp)"
              hint="Kosongkan jika tanpa minimal transaksi."
              error={renderErrors("minimumSpend")}
            >
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-muted-foreground">
                  Rp
                </span>
                <Input
                  type="number"
                  min={0}
                  step={1000}
                  value={draft.minimumSpend}
                  onChange={(e) => set("minimumSpend", e.target.value)}
                  placeholder="contoh: 200000"
                  className="h-10 pl-10"
                  aria-invalid={Boolean(errors.minimumSpend)}
                />
              </div>
            </Field>

            <div className="grid gap-2">
              <div className="flex items-center justify-between">
                <Label className="font-medium text-foreground/90">Layanan yang Berlaku</Label>
                {draft.applicableServiceSlugs.length > 0 && (
                  <button
                    type="button"
                    onClick={() => set("applicableServiceSlugs", [])}
                    className="text-[11px] font-medium text-primary hover:underline"
                  >
                    Berlaku untuk semua
                  </button>
                )}
              </div>
              <p className="text-[11px] text-muted-foreground">
                Kosongkan untuk semua layanan.
              </p>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {getActiveServices().map((service) => {
                  const selected = draft.applicableServiceSlugs.includes(service.slug);
                  return (
                    <label
                      key={service.slug}
                      className={cn(
                        "flex cursor-pointer items-center justify-between gap-2 rounded-lg border px-3 py-2.5 text-sm transition-colors",
                        selected
                          ? "border-primary bg-primary/5 text-foreground"
                          : "border-border bg-background/40 text-muted-foreground hover:border-primary/40 hover:text-foreground"
                      )}
                    >
                      <span className="font-medium">{service.name}</span>
                      <input
                        type="checkbox"
                        checked={selected}
                        onChange={() => toggleService(service.slug)}
                        className="size-4 accent-primary"
                      />
                    </label>
                  );
                })}
              </div>
            </div>
          </SectionCard>
        </div>

        {/* Live preview */}
        <div className="lg:sticky lg:top-24">
          <PromotionLivePreview
            code={draft.code}
            title={draft.title}
            discountType={draft.discountType}
            discountValue={draft.discountValue}
            maximumDiscount={draft.maximumDiscount}
            minimumSpend={draft.minimumSpend}
            startDate={draft.startDate}
            endDate={draft.endDate}
            usedCount={usedCount}
            usageLimit={draft.usageLimit}
            active={draft.active}
            errors={errorsMemo}
          />
        </div>
      </div>

      {/* Status + actions */}
      <div className="rounded-2xl border border-border/70 bg-card p-5 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <label className="flex cursor-pointer items-center gap-2.5">
            <input
              type="checkbox"
              checked={draft.active}
              onChange={(e) => set("active", e.target.checked)}
              className="size-4 accent-primary"
            />
            <span className="text-sm font-medium text-foreground/90">
              Langsung aktifkan promo ini
            </span>
          </label>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              className="gap-1.5 rounded-full text-muted-foreground"
              onClick={onCancel}
            >
              <XIcon className="size-4" />
              Batal
            </Button>
            <Button type="submit" className="gap-1.5 rounded-full">
              <CheckIcon className="size-4" />
              {editing ? "Simpan Perubahan" : "Simpan Promo"}
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
}
