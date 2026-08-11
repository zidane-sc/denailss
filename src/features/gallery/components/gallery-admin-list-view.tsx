"use client";

import React, { useMemo, useState } from "react";
import Image from "next/image";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  CameraIcon,
  CoinsIcon,
  ImagesIcon,
  MagnifyingGlassIcon,
  PencilSimpleIcon,
  PlusIcon,
  SparkleIcon,
  TrashIcon,
  XIcon,
} from "@phosphor-icons/react/dist/ssr";
import { cn } from "@/lib/utils";
import { imageUrl } from "@/lib/images";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { useReducedMotion, motion, AnimatePresence } from "motion/react";
import {
  createGalleryDesignApi,
  deleteGalleryDesignApi,
  updateGalleryDesignApi,
} from "../services/gallery-admin-api";
import {
  useGalleryDesignsLoading,
  useGalleryDesignsRefresh,
  useLiveGalleryDesigns,
} from "./gallery-designs-provider";
import { GalleryDesignForm } from "./gallery-design-form";
import {
  COLOR_LABELS,
  DIFFICULTY_LABELS,
  OCCASION_LABELS,
  SHAPE_LABELS,
  STYLE_LABELS,
} from "../constants";
import type { GalleryDesign, DesignDifficulty } from "@/types";

type FilterKey = "style" | "color" | "occasion" | "shape" | "difficulty";

const FILTER_GROUPS: { key: FilterKey; label: string; options: Record<string, string> }[] = [
  { key: "style", label: "Style", options: STYLE_LABELS },
  { key: "color", label: "Warna", options: COLOR_LABELS },
  { key: "occasion", label: "Acara", options: OCCASION_LABELS },
  { key: "shape", label: "Bentuk", options: SHAPE_LABELS },
  { key: "difficulty", label: "Kesulitan", options: DIFFICULTY_LABELS },
];

const DIFFICULTY_STYLES: Record<DesignDifficulty, string> = {
  easy: "bg-emerald-50 text-emerald-700 border-emerald-100",
  medium: "bg-secondary-soft text-secondary-foreground border-secondary/25",
  complex: "bg-accent-soft text-accent border-accent/25",
  "very-complex": "bg-primary/10 text-primary border-primary/25",
};

const COLUMNS: {
  field?: "title";
  label: string;
  align?: "left" | "center" | "right";
  pad?: "left" | "right";
}[] = [
  { field: "title", label: "Desain", pad: "left" as const },
  { label: "Style" },
  { label: "Acara" },
  { label: "Warna" },
  { label: "Bentuk" },
  { label: "Kesulitan" },
  { label: "Aksi", align: "center" },
];

export function GalleryAdminListView() {
  const reduce = useReducedMotion();
  const isLoading = useGalleryDesignsLoading();
  const designs = useLiveGalleryDesigns();
  const refreshDesigns = useGalleryDesignsRefresh();
  const [saving, setSaving] = useState(false);
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState<Partial<Record<FilterKey, string>>>({});
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<GalleryDesign | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const stats = useMemo(() => {
    const total = designs.length;
    const complexCount = designs.filter(
      (d) => d.difficulty === "complex" || d.difficulty === "very-complex"
    ).length;
    const premiumCount = designs.filter((d) => d.price >= 200000).length;
    const totalPhotos = designs.reduce((sum, d) => sum + d.imageSeeds.length, 0);
    return { total, complexCount, premiumCount, totalPhotos };
  }, [designs]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return designs.filter((d) => {
      if (
        q &&
        !(
          d.title.toLowerCase().includes(q) ||
          d.description.toLowerCase().includes(q) ||
          d.slug.includes(q)
        )
      ) {
        return false;
      }
      for (const key of Object.keys(FILTER_GROUPS) as FilterKey[]) {
        const value = filters[key];
        if (value && d[key] !== value) return false;
      }
      return true;
    });
  }, [designs, query, filters]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage));
  const safePage = Math.min(currentPage, totalPages);

  const sorted = useMemo(() => {
    const list = [...filtered].sort((a, b) =>
      a.title.localeCompare(b.title) * (sortDirection === "asc" ? 1 : -1)
    );
    const from = (safePage - 1) * itemsPerPage;
    return list.slice(from, from + itemsPerPage);
  }, [filtered, sortDirection, safePage, itemsPerPage]);

  const toggleFilter = (key: FilterKey, value: string) => {
    setFilters((prev) => (prev[key] === value ? { ...prev, [key]: undefined } : { ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const activeFilterCount = Object.values(filters).filter(Boolean).length;

  const toggleTitleSort = () => {
    setSortDirection((d) => (d === "asc" ? "desc" : "asc"));
    setCurrentPage(1);
  };

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const openEdit = (design: GalleryDesign) => {
    setEditing(design);
    setFormOpen(true);
  };

  const handleSubmit = async (design: GalleryDesign, mode: "create" | "update") => {
    setSaving(true);
    try {
      if (mode === "create") {
        await createGalleryDesignApi(design);
        toast.success("Desain baru ditambahkan.");
      } else {
        await updateGalleryDesignApi(design);
        toast.success("Perubahan desain disimpan.");
      }
      refreshDesigns();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Gagal menyimpan desain.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    const design = designs.find((d) => d.id === id);
    setSaving(true);
    try {
      await deleteGalleryDesignApi(id);
      setConfirmDeleteId(null);
      toast.success(`"${design?.title}" dihapus dari katalog.`);
      refreshDesigns();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Gagal menghapus desain.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col gap-4 border-b border-border/50 pb-5 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="font-heading text-2xl font-semibold tracking-tight text-foreground/90">
            Kelola Katalog
          </h2>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Kurasi desain nail art yang tampil di galeri website.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button size="sm" className="gap-1.5 rounded-full" onClick={openCreate} disabled={isLoading || saving}>
            <PlusIcon weight="bold" className="size-4" />
            Tambah Desain
          </Button>
        </div>
      </div>

      {/* Summary band */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="flex items-center gap-3 rounded-2xl border border-border/60 bg-card p-4 shadow-xs">
          <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <ImagesIcon weight="fill" className="size-5" />
          </span>
          <div>
            <p className="font-heading text-xl font-semibold text-foreground/90">{stats.total}</p>
            <p className="text-[11px] text-muted-foreground">Total Desain</p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-2xl border border-border/60 bg-card p-4 shadow-xs">
          <span className="flex size-10 items-center justify-center rounded-xl bg-accent-soft text-accent">
            <SparkleIcon className="size-5" />
          </span>
          <div>
            <p className="font-heading text-xl font-semibold text-foreground/90">{stats.complexCount}</p>
            <p className="text-[11px] text-muted-foreground">Kesulitan Tinggi</p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-2xl border border-border/60 bg-card p-4 shadow-xs">
          <span className="flex size-10 items-center justify-center rounded-xl bg-secondary-soft text-secondary">
            <CoinsIcon weight="fill" className="size-5" />
          </span>
          <div>
            <p className="font-heading text-xl font-semibold text-foreground/90">{stats.premiumCount}</p>
            <p className="text-[11px] text-muted-foreground">Desain Premium</p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-2xl border border-border/60 bg-card p-4 shadow-xs">
          <span className="flex size-10 items-center justify-center rounded-xl bg-primary-foreground text-primary border border-primary/20">
            <CameraIcon weight="fill" className="size-5" />
          </span>
          <div>
            <p className="font-heading text-xl font-semibold text-foreground/90">{stats.totalPhotos}</p>
            <p className="text-[11px] text-muted-foreground">Total Foto</p>
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
            placeholder="Cari judul, deskripsi..."
            className="h-10 pl-9"
            aria-label="Cari desain"
          />
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap items-center gap-1.5">
            {FILTER_GROUPS.map((group) => (
              <div key={group.key} className="flex items-center gap-1.5">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  {group.label}
                </span>
                <select
                  aria-label={`Filter ${group.label}`}
                  value={filters[group.key] ?? ""}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value) toggleFilter(group.key, value);
                    else setFilters((prev) => ({ ...prev, [group.key]: undefined }));
                    setCurrentPage(1);
                  }}
                  className={cn(
                    "flex h-8 rounded-full border bg-card px-3 text-xs font-semibold shadow-xs focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring",
                    filters[group.key]
                      ? "border-primary text-primary"
                      : "border-border text-muted-foreground"
                  )}
                >
                  <option value="">{group.label}</option>
                  {Object.entries(group.options).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>
          {activeFilterCount > 0 && (
            <button
              type="button"
              onClick={() => {
                setFilters({});
                setCurrentPage(1);
              }}
              className="self-start text-[11px] font-medium text-primary hover:underline"
            >
              Hapus semua filter ({activeFilterCount})
            </button>
          )}
        </div>
      </div>

      {/* Result count */}
      <p className="text-[11px] text-muted-foreground">
        Menampilkan {sorted.length} dari {filtered.length} desain
        {activeFilterCount > 0 && ` · ${activeFilterCount} filter aktif`}
      </p>

      {/* Empty states */}
      {filtered.length === 0 ? (
        <section className="rounded-2xl border border-border/70 bg-card shadow-xs">
          <div className="flex flex-col items-center justify-center py-14 text-center">
            <span className="flex size-12 items-center justify-center rounded-2xl bg-muted/60 text-primary">
              <MagnifyingGlassIcon className="size-6" />
            </span>
            <p className="mt-3 text-sm font-semibold text-foreground/85">
              {query || activeFilterCount > 0 ? "Desain tidak ditemukan." : "Katalog masih kosong."}
            </p>
            <p className="mt-1 max-w-xs text-xs text-muted-foreground leading-relaxed">
              {query || activeFilterCount > 0
                ? "Coba ubah kata kunci atau filter untuk melihat desain lain."
                : "Tambahkan desain pertama untuk mulai mengisi galeri."}
            </p>
            {!query && activeFilterCount === 0 && (
              <Button size="sm" className="mt-4 gap-1.5 rounded-full" onClick={openCreate}>
                <PlusIcon className="size-4" />
                Tambah Desain
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
                  {COLUMNS.map((col) => {
                    const field = col.field;
                    return field ? (
                      <th
                        key={field}
                        className={cn(
                          "cursor-pointer select-none p-3 transition-colors hover:bg-muted/70",
                          col.align === "center" && "text-center",
                          col.align === "right" && "text-right"
                        )}
                        onClick={toggleTitleSort}
                      >
                        <span
                          className={cn(
                            "inline-flex items-center gap-1",
                            col.align === "center" && "justify-center",
                            col.align === "right" && "justify-end"
                          )}
                        >
                          {col.label}
                          <span className="text-[10px] text-primary">
                            {sortDirection === "asc" ? "▲" : "▼"}
                          </span>
                        </span>
                      </th>
                    ) : (
                      <th
                        key={col.label}
                        className={cn("p-3", col.align === "center" && "text-center", col.align === "right" && "text-right")}
                      >
                        {col.label}
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {sorted.map((design) => (
                  <tr key={design.id} className="group transition-colors hover:bg-muted/15">
                    <td className="p-3">
                      <div className="flex items-center gap-3">
                        <div className="relative size-11 shrink-0 overflow-hidden rounded-lg border border-border/60 bg-muted/30">
                          <Image
                            src={imageUrl(design.imageSeeds[0] ?? "denailss-fallback")}
                            alt={design.title}
                            fill
                            sizes="2.75rem"
                            className="size-full object-cover"
                          />
                        </div>
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-foreground transition-colors group-hover:text-primary">
                            {design.title}
                          </p>
                          <p className="mt-0.5 font-mono text-[10px] text-muted-foreground">
                            {design.slug}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="p-3">{STYLE_LABELS[design.style]}</td>
                    <td className="p-3">{OCCASION_LABELS[design.occasion]}</td>
                    <td className="p-3">{COLOR_LABELS[design.color]}</td>
                    <td className="p-3">{SHAPE_LABELS[design.shape]}</td>
                    <td className="p-3">
                      <span
                        className={cn(
                          "inline-flex h-6 items-center rounded-full border px-2.5 text-[11px] font-semibold",
                          DIFFICULTY_STYLES[design.difficulty]
                        )}
                      >
                        {DIFFICULTY_LABELS[design.difficulty]}
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      <div className="inline-flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          aria-label={`Edit ${design.title}`}
                          className="rounded-full text-muted-foreground hover:text-primary"
                          onClick={() => openEdit(design)}
                        >
                          <PencilSimpleIcon className="size-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          aria-label={`Hapus ${design.title}`}
                          className="rounded-full text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                          onClick={() => setConfirmDeleteId(design.id)}
                        >
                          <TrashIcon className="size-4" />
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
              {sorted.map((design) => (
                <motion.div
                  key={design.id}
                  layout
                  initial={reduce ? false : { opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={reduce ? undefined : { opacity: 0, y: -8 }}
                  transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                  className="rounded-2xl border border-border/60 bg-card p-4 shadow-xs"
                >
                  <div className="flex items-start gap-3">
                    <div className="relative size-14 shrink-0 overflow-hidden rounded-xl border border-border/60 bg-muted/30">
                      <Image
                        src={imageUrl(design.imageSeeds[0] ?? "denailss-fallback")}
                        alt={design.title}
                        fill
                        sizes="3.5rem"
                        className="size-full object-cover"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-foreground">{design.title}</p>
                      <p className="mt-0.5 text-[11px] text-muted-foreground">
                        {STYLE_LABELS[design.style]} · {OCCASION_LABELS[design.occasion]} ·{" "}
                        {SHAPE_LABELS[design.shape]}
                      </p>
                      <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                        <span
                          className={cn(
                            "inline-flex h-5 items-center rounded-full border px-2 text-[10px] font-semibold",
                            DIFFICULTY_STYLES[design.difficulty]
                          )}
                        >
                          {DIFFICULTY_LABELS[design.difficulty]}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center justify-between border-t border-border/40 pt-3">
                    {design.imageSeeds.length > 1 ? (
                      <span className="text-[11px] text-muted-foreground">
                        {design.imageSeeds.length} foto
                      </span>
                    ) : (
                      <span />
                    )}
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 gap-1 rounded-full px-2 text-[11px] text-muted-foreground hover:text-primary"
                        onClick={() => openEdit(design)}
                      >
                        <PencilSimpleIcon className="size-3.5" />
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 gap-1 rounded-full px-2 text-[11px] text-muted-foreground hover:text-destructive"
                        onClick={() => setConfirmDeleteId(design.id)}
                      >
                        <TrashIcon className="size-3.5" />
                        Hapus
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
                {Math.min(safePage * itemsPerPage, filtered.length)} dari {filtered.length} desain
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

      {/* Create / edit dialog — key remounts the form so its state re-initializes per design */}
      <GalleryDesignForm
        key={editing?.id ?? "create"}
        open={formOpen}
        onOpenChange={setFormOpen}
        initial={editing}
        onSubmit={handleSubmit}
        saving={saving}
      />

      {/* Delete confirm */}
      <Dialog open={Boolean(confirmDeleteId)} onOpenChange={(open) => !open && setConfirmDeleteId(null)}>
        <DialogContent className="sm:max-w-md bg-card">
          <DialogHeader>
            <DialogTitle className="font-heading text-lg font-semibold text-foreground/90">
              Hapus desain ini?
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground leading-relaxed">
              Desain akan dihapus dari katalog galeri. Tindakan ini tidak bisa dibatalkan.
            </p>
            <div className="flex items-center justify-end gap-2">
              <Button
                variant="ghost"
                className="gap-1.5 rounded-full text-muted-foreground"
                onClick={() => setConfirmDeleteId(null)}
              >
                <XIcon className="size-4" />
                Batal
              </Button>
              <Button
                variant="destructive"
                className="gap-1.5 rounded-full"
                disabled={saving}
                onClick={() => confirmDeleteId && void handleDelete(confirmDeleteId)}
              >
                <TrashIcon className="size-4" />
                Hapus
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
