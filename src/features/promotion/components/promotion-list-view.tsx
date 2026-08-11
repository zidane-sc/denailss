"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  MagnifyingGlassIcon,
  PencilSimpleIcon,
  PlusIcon,
  TicketIcon,
} from "@phosphor-icons/react/dist/ssr";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion, useReducedMotion, AnimatePresence } from "motion/react";
import { useLivePromotions } from "./promotions-provider";
import {
  discountSummary,
  getPromotionStatus,
  promotionPeriodLabel,
  usageLabel,
} from "../logic/promotion";
import {
  PromotionStatusBadge,
  PromoCodeChip,
  STATUS_LABELS,
} from "./promotion-shared";
import type { PromotionStatus } from "@/types";

type StatusFilter = "semua" | PromotionStatus;

const FILTERS: { value: StatusFilter; label: string }[] = [
  { value: "semua", label: "Semua" },
  { value: "active", label: STATUS_LABELS.active },
  { value: "scheduled", label: STATUS_LABELS.scheduled },
  { value: "expired", label: STATUS_LABELS.expired },
  { value: "inactive", label: STATUS_LABELS.inactive },
];

const STATUS_ORDER: Record<PromotionStatus, number> = {
  active: 0,
  scheduled: 1,
  inactive: 2,
  expired: 3,
};

export function PromotionListView() {
  const reduce = useReducedMotion();
  const router = useRouter();
  const promotions = useLivePromotions();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<StatusFilter>("semua");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const openDetail = (id: string) => {
    router.push(`/backoffice/promotions/${id}`);
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return promotions
      .filter((p) => {
        if (filter !== "semua" && getPromotionStatus(p) !== filter) return false;
        if (q && !(p.title.toLowerCase().includes(q) || p.code.toLowerCase().includes(q)))
          return false;
        return true;
      })
      .sort((a, b) => {
        const statusDiff = STATUS_ORDER[getPromotionStatus(a)] - STATUS_ORDER[getPromotionStatus(b)];
        if (statusDiff !== 0) return statusDiff;
        return b.startDate.localeCompare(a.startDate);
      });
  }, [promotions, query, filter]);

  const activeCount = promotions.filter((p) => getPromotionStatus(p) === "active").length;
  const scheduledCount = promotions.filter((p) => getPromotionStatus(p) === "scheduled").length;

  const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage));
  const safePage = Math.min(currentPage, totalPages);
  const pageRows = filtered.slice((safePage - 1) * itemsPerPage, safePage * itemsPerPage);

  const emptyReason =
    promotions.length === 0
      ? { title: "Belum ada promo.", body: "Buat promo pertamamu untuk mulai menawarkan penawaran spesial ke customer." }
      : filter !== "semua" || query
        ? { title: "Tidak ada promo yang cocok.", body: "Coba ubah kata kunci atau filter untuk melihat promo lain." }
        : { title: "Belum ada promo yang sedang berjalan.", body: "Buat promo baru atau aktifkan promo terjadwal untuk mulai menawarkan penawaran spesial." };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col gap-4 border-b border-border/50 pb-5 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="font-heading text-2xl font-semibold tracking-tight text-foreground/90">
            Promosi
          </h2>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Kelola penawaran yang sedang berjalan dan buat promo baru untuk customer.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            size="sm"
            className="gap-1.5 rounded-full"
            nativeButton={false}
            render={<Link href="/backoffice/promotions/new" />}
          >
            <PlusIcon weight="bold" className="size-4" />
            Buat Promo
          </Button>
        </div>
      </div>

      {/* Summary band */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="flex items-center gap-3 rounded-2xl border border-border/60 bg-card p-4 shadow-xs">
          <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <TicketIcon weight="fill" className="size-5" />
          </span>
          <div>
            <p className="font-heading text-xl font-semibold text-foreground/90">{activeCount}</p>
            <p className="text-[11px] text-muted-foreground">Promo Aktif Sekarang</p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-2xl border border-border/60 bg-card p-4 shadow-xs">
          <span className="flex size-10 items-center justify-center rounded-xl bg-accent-soft text-accent">
            <span className="font-heading text-sm font-semibold">J</span>
          </span>
          <div>
            <p className="font-heading text-xl font-semibold text-foreground/90">{scheduledCount}</p>
            <p className="text-[11px] text-muted-foreground">Terjadwal</p>
          </div>
        </div>
      </div>

      {/* Search + filters */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div className="relative w-full lg:max-w-sm">
          <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Cari judul atau kode promo..."
            className="h-10 pl-9"
            aria-label="Cari promo"
          />
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              type="button"
              onClick={() => {
                setFilter(f.value);
                setCurrentPage(1);
              }}
              className={cn(
                "h-8 rounded-full border px-3.5 text-xs font-semibold transition-colors",
                filter === f.value
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground"
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Result count */}
      <p className="text-[11px] text-muted-foreground">
        Menampilkan {filtered.length} dari {promotions.length} promo
      </p>

      {filtered.length === 0 ? (
        <section className="rounded-2xl border border-border/70 bg-card shadow-xs">
          <div className="flex flex-col items-center justify-center py-14 text-center">
            <span className="flex size-12 items-center justify-center rounded-2xl bg-muted/60 text-primary">
              <TicketIcon className="size-6" />
            </span>
            <p className="mt-3 text-sm font-semibold text-foreground/85">{emptyReason.title}</p>
            <p className="mt-1 max-w-xs text-xs text-muted-foreground leading-relaxed">
              {emptyReason.body}
            </p>
            {promotions.length === 0 && (
              <Button
                size="sm"
                className="mt-4 gap-1.5 rounded-full"
                nativeButton={false}
                render={<Link href="/backoffice/promotions/new" />}
              >
                <PlusIcon className="size-4" />
                Buat Promo
              </Button>
            )}
          </div>
        </section>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden overflow-hidden rounded-2xl border border-border/60 bg-card shadow-xs md:block">
            <table className="w-full border-collapse text-left text-xs text-foreground/95">
              <thead>
                <tr className="border-b bg-muted/40 font-semibold text-muted-foreground">
                  <th className="p-3">Promo</th>
                  <th className="p-3">Diskon</th>
                  <th className="p-3">Periode</th>
                  <th className="p-3">Pemakaian</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {pageRows.map((promotion) => {
                  const status = getPromotionStatus(promotion);
                  const summary = discountSummary(promotion);
                  return (
                    <tr
                      key={promotion.id}
                      className="group cursor-pointer transition-colors hover:bg-muted/15"
                      onClick={() => openDetail(promotion.id)}
                    >
                      <td className="p-3">
                        <div className="flex items-center gap-3">
                          <div className="min-w-0">
                            <p className="truncate font-semibold text-foreground transition-colors group-hover:text-primary">
                              {promotion.title}
                            </p>
                            <div className="mt-0.5">
                              <PromoCodeChip code={promotion.code} />
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="p-3">
                        <p className="font-semibold text-foreground">{summary.primary}</p>
                        {summary.secondary && (
                          <p className="text-[10px] text-muted-foreground">{summary.secondary}</p>
                        )}
                      </td>
                      <td className="p-3 whitespace-nowrap text-foreground/80">
                        {promotionPeriodLabel(promotion)}
                      </td>
                      <td className="p-3 whitespace-nowrap text-foreground/80">
                        {usageLabel(promotion)}
                      </td>
                      <td className="p-3">
                        <PromotionStatusBadge status={status} />
                      </td>
                      <td className="p-3 text-center">
                        <div className="inline-flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            aria-label={`Edit ${promotion.title}`}
                            className="rounded-full text-muted-foreground hover:text-primary"
                            nativeButton={false}
                            render={<Link href={`/backoffice/promotions/${promotion.id}`} />}
                          >
                            <PencilSimpleIcon className="size-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="space-y-3 md:hidden">
            <AnimatePresence initial={false} mode="popLayout">
              {pageRows.map((promotion) => {
                const status = getPromotionStatus(promotion);
                const summary = discountSummary(promotion);
                return (
                  <motion.div
                    key={promotion.id}
                    layout
                    initial={reduce ? false : { opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={reduce ? undefined : { opacity: 0, y: -8 }}
                    transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                    className="rounded-2xl border border-border/60 bg-card p-4 shadow-xs"
                  >
                    <Link
                      href={`/backoffice/promotions/${promotion.id}`}
                      className="flex items-start justify-between gap-3"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-foreground">
                          {promotion.title}
                        </p>
                        <p className="mt-0.5 font-mono text-[11px] text-primary">
                          {promotion.code}
                        </p>
                      </div>
                      <PromotionStatusBadge status={status} />
                    </Link>
                    <div className="mt-3 flex items-center justify-between border-t border-border/40 pt-3">
                      <div>
                        <p className="text-sm font-semibold text-foreground">{summary.primary}</p>
                        <p className="text-[10px] text-muted-foreground">
                          {summary.secondary
                            ? `${summary.secondary} · ${usageLabel(promotion)}`
                            : usageLabel(promotion)}
                        </p>
                      </div>
                      <span className="text-[10px] text-muted-foreground">
                        {promotionPeriodLabel(promotion)}
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          {/* Pagination */}
          <div className="flex flex-col gap-3 border-t border-border/40 pt-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <span className="text-[11px] text-muted-foreground">Tampilkan</span>
              <select
                aria-label="Jumlah item per halaman"
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="h-8 rounded-lg border border-border bg-card px-2 text-xs font-semibold shadow-xs focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring"
              >
                {[5, 10, 15, 25, 50].map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
              <span className="text-[11px] text-muted-foreground">per halaman</span>
              <span className="ml-1 text-[11px] text-muted-foreground">
                · Menampilkan {(safePage - 1) * itemsPerPage + 1}-
                {Math.min(safePage * itemsPerPage, filtered.length)} dari {filtered.length} promo
              </span>
            </div>
            {totalPages > 1 && (
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 rounded-lg text-xs"
                  disabled={safePage === 1}
                  onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                >
                  Sebelumnya
                </Button>
                <span className="px-2 text-xs font-semibold text-foreground">
                  {safePage} / {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 rounded-lg text-xs"
                  disabled={safePage === totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                >
                  Berikutnya
                </Button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
