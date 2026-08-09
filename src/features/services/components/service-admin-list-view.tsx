"use client";

import React, { useMemo, useState } from "react";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  CheckCircleIcon,
  MagnifyingGlassIcon,
  PauseIcon,
  PencilSimpleIcon,
  PlayIcon,
  SparkleIcon,
} from "@phosphor-icons/react/dist/ssr";
import { cn } from "@/lib/utils";
import { imageUrl } from "@/lib/images";
import { formatIDR, formatDuration } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { motion, useReducedMotion, AnimatePresence } from "motion/react";
import {
  getLiveServices,
  setActiveService,
  updateService,
} from "../data/services-admin.mock";
import { ServiceForm } from "./service-form";
import type { Service } from "@/types";

type StatusFilter = "all" | "active" | "inactive";

const FILTERS: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "Semua" },
  { value: "active", label: "Aktif" },
  { value: "inactive", label: "Nonaktif" },
];

export function ServiceAdminListView() {
  const reduce = useReducedMotion();
  const [services, setServices] = useState<Service[]>(() => getLiveServices());
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<StatusFilter>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Service | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return services.filter((s) => {
      if (filter === "active" && !s.active) return false;
      if (filter === "inactive" && s.active) return false;
      if (!q) return true;
      return (
        s.name.toLowerCase().includes(q) ||
        s.shortDescription.toLowerCase().includes(q) ||
        s.slug.includes(q)
      );
    });
  }, [services, query, filter]);

  const activeCount = services.filter((s) => s.active).length;
  const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage));
  const safePage = Math.min(currentPage, totalPages);
  const sorted = useMemo(() => {
    const list = [...filtered].sort((a, b) => Number(b.active) - Number(a.active) || a.name.localeCompare(b.name));
    const from = (safePage - 1) * itemsPerPage;
    return list.slice(from, from + itemsPerPage);
  }, [filtered, safePage, itemsPerPage]);

  const tierSummary = (service: Service) =>
    service.tiers.length > 0
      ? service.tiers.map((t) => t.label).join(" / ")
      : "Flat";

  const handleSubmit = (service: Service) => {
    const next = updateService(service);
    setServices(next);
    toast.success("Perubahan layanan disimpan.", {
      description: `"${service.name}" sekarang dipakai di seluruh website.`,
    });
  };

  const handleToggleActive = (service: Service) => {
    const next = setActiveService(service.id, !service.active);
    setServices(next);
    toast.success(
      service.active ? `"${service.name}" dinonaktifkan.` : `"${service.name}" diaktifkan kembali.`,
      {
        description: service.active
          ? "Layanan tidak tampil di website dan tidak bisa dibooking."
          : "Layanan kembali tampil dan bisa dibooking customer.",
      }
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col gap-4 border-b border-border/50 pb-5 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="font-heading text-2xl font-semibold tracking-tight text-foreground/90">
            Kelola Layanan
          </h2>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Perbarui layanan yang tampil di website. Layanan yang dinonaktifkan tetap
            tersimpan untuk riwayat booking.
          </p>
        </div>
      </div>

      {/* Summary band */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="flex items-center gap-3 rounded-2xl border border-border/60 bg-card p-4 shadow-xs">
          <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <SparkleIcon weight="fill" className="size-5" />
          </span>
          <div>
            <p className="font-heading text-xl font-semibold text-foreground/90">
              {services.length}
            </p>
            <p className="text-[11px] text-muted-foreground">Total Layanan</p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-2xl border border-border/60 bg-card p-4 shadow-xs">
          <span className="flex size-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
            <CheckCircleIcon weight="fill" className="size-5" />
          </span>
          <div>
            <p className="font-heading text-xl font-semibold text-foreground/90">
              {activeCount}
            </p>
            <p className="text-[11px] text-muted-foreground">Layanan Aktif</p>
          </div>
        </div>
      </div>

      {/* Search + filter */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative w-full lg:max-w-sm">
          <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Cari nama layanan..."
            className="h-10 pl-9"
            aria-label="Cari layanan"
          />
        </div>
        <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label="Filter status layanan">
          {FILTERS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => {
                setFilter(option.value);
                setCurrentPage(1);
              }}
              className={cn(
                "inline-flex h-8 items-center rounded-full border px-3.5 text-xs font-semibold transition-all duration-200",
                filter === option.value
                  ? "border-primary bg-primary text-primary-foreground shadow-sm shadow-primary/20"
                  : "border-border bg-card text-muted-foreground hover:text-foreground hover:border-foreground/20"
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Empty state */}
      {filtered.length === 0 ? (
        <section className="rounded-2xl border border-border/70 bg-card shadow-xs">
          <div className="flex flex-col items-center justify-center py-14 text-center">
            <span className="flex size-12 items-center justify-center rounded-2xl bg-muted/60 text-primary">
              <MagnifyingGlassIcon className="size-6" />
            </span>
            <p className="mt-3 text-sm font-semibold text-foreground/85">
              {query || filter !== "all"
                ? "Layanan tidak ditemukan."
                : "Daftar layanan masih kosong."}
            </p>
            <p className="mt-1 max-w-xs text-xs text-muted-foreground leading-relaxed">
              {query || filter !== "all"
                ? "Coba ubah kata kunci atau filter untuk melihat layanan lain."
                : "Layanan akan muncul di sini begitu tersedia."}
            </p>
          </div>
        </section>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden overflow-hidden rounded-2xl border border-border/60 bg-card shadow-xs md:block">
            <table className="w-full border-collapse text-left text-xs text-foreground/95">
              <thead>
                <tr className="border-b bg-muted/40 font-semibold text-muted-foreground">
                  <th className="p-3">Layanan</th>
                  <th className="p-3">Tingkat</th>
                  <th className="p-3">Harga Mulai</th>
                  <th className="p-3">Durasi</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {sorted.map((service) => (
                  <tr
                    key={service.id}
                    className={cn(
                      "group transition-colors hover:bg-muted/15",
                      !service.active && "opacity-60"
                    )}
                  >
                    <td className="p-3">
                      <div className="flex items-center gap-3">
                        <div className="relative size-11 shrink-0 overflow-hidden rounded-lg border border-border/60 bg-muted/30">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={imageUrl(service.heroImage)}
                            alt={service.name}
                            className="size-full object-cover"
                          />
                        </div>
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-foreground transition-colors group-hover:text-primary">
                            {service.name}
                          </p>
                          <p className="mt-0.5 font-mono text-[10px] text-muted-foreground">
                            {service.slug}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="p-3">{tierSummary(service)}</td>
                    <td className="p-3 font-medium text-foreground">
                      {formatIDR(service.priceFrom)}
                    </td>
                    <td className="p-3 text-muted-foreground">
                      {formatDuration(service.durationMinutes)}
                    </td>
                    <td className="p-3">
                      {service.active ? (
                        <span className="inline-flex h-6 items-center rounded-full border border-emerald-200 bg-emerald-50 px-2.5 text-[11px] font-semibold text-emerald-700">
                          Aktif
                        </span>
                      ) : (
                        <span className="inline-flex h-6 items-center rounded-full border border-muted bg-muted/50 px-2.5 text-[11px] font-semibold text-muted-foreground">
                          Nonaktif
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-center">
                      <div className="inline-flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 gap-1 rounded-full px-2.5 text-[11px] font-semibold text-muted-foreground hover:text-primary"
                          onClick={() => {
                            setEditing(service);
                            setFormOpen(true);
                          }}
                        >
                          <PencilSimpleIcon className="size-3.5" />
                          Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 gap-1 rounded-full px-2.5 text-[11px] font-semibold text-muted-foreground hover:text-emerald-700"
                          onClick={() => handleToggleActive(service)}
                        >
                          {service.active ? (
                            <>
                              <PauseIcon className="size-3.5" />
                              Nonaktifkan
                            </>
                          ) : (
                            <>
                              <PlayIcon className="size-3.5" />
                              Aktifkan
                            </>
                          )}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="space-y-3 md:hidden">
            <AnimatePresence initial={false} mode="popLayout">
              {sorted.map((service) => (
                <motion.div
                  key={service.id}
                  layout
                  initial={reduce ? false : { opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={reduce ? undefined : { opacity: 0, y: -8 }}
                  transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                  className={cn(
                    "rounded-2xl border border-border/60 bg-card p-4 shadow-xs",
                    !service.active && "opacity-70"
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div className="relative size-14 shrink-0 overflow-hidden rounded-xl border border-border/60 bg-muted/30">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={imageUrl(service.heroImage)}
                        alt={service.name}
                        className="size-full object-cover"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-foreground">
                        {service.name}
                      </p>
                      <p className="mt-0.5 text-[11px] text-muted-foreground">
                        {tierSummary(service)} · {formatIDR(service.priceFrom)}
                      </p>
                      <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                        <span
                          className={cn(
                            "inline-flex h-5 items-center rounded-full border px-2 text-[10px] font-semibold",
                            service.active
                              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                              : "border-muted bg-muted/50 text-muted-foreground"
                          )}
                        >
                          {service.active ? "Aktif" : "Nonaktif"}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center justify-between border-t border-border/40 pt-3">
                    <span className="text-[11px] text-muted-foreground">
                      {formatDuration(service.durationMinutes)}
                    </span>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 gap-1 rounded-full px-2 text-[11px] text-muted-foreground hover:text-primary"
                        onClick={() => {
                          setEditing(service);
                          setFormOpen(true);
                        }}
                      >
                        <PencilSimpleIcon className="size-3.5" />
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 gap-1 rounded-full px-2 text-[11px] text-muted-foreground hover:text-emerald-700"
                        onClick={() => handleToggleActive(service)}
                      >
                        {service.active ? (
                          <>
                            <PauseIcon className="size-3.5" />
                            Nonaktifkan
                          </>
                        ) : (
                          <>
                            <PlayIcon className="size-3.5" />
                            Aktifkan
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
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
                {Math.min(safePage * itemsPerPage, filtered.length)} dari {filtered.length} layanan
              </span>
            </div>
            {totalPages > 1 && (
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 gap-1 rounded-lg text-xs"
                  disabled={safePage === 1}
                  onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                >
                  <ArrowLeftIcon className="size-3.5" />
                  Sebelumnya
                </Button>
                <span className="px-2 text-xs font-semibold text-foreground">
                  {safePage} / {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 gap-1 rounded-lg text-xs"
                  disabled={safePage === totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                >
                  Berikutnya
                  <ArrowRightIcon className="size-3.5" />
                </Button>
              </div>
            )}
          </div>
        </>
      )}

      {/* Edit dialog */}
      {editing && (
        <ServiceForm
          open={formOpen}
          onOpenChange={setFormOpen}
          initial={editing}
          onSubmit={handleSubmit}
        />
      )}
    </div>
  );
}
