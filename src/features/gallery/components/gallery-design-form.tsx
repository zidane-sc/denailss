"use client";

import React, { useMemo, useState } from "react";
import Image from "next/image";
import {
  PlusIcon,
  CheckIcon,
  XIcon,
  TrashIcon,
  UploadSimpleIcon,
  DotsSixIcon,
} from "@phosphor-icons/react/dist/ssr";
import { cn } from "@/lib/utils";
import { imageUrl } from "@/lib/images";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  COLOR_LABELS,
  DIFFICULTY_LABELS,
  OCCASION_LABELS,
  SHAPE_LABELS,
  STYLE_LABELS,
} from "@/features/gallery/constants";
import type {
  GalleryAspect,
  GalleryDesign,
  DesignColor,
  DesignDifficulty,
  DesignOccasion,
  DesignShape,
  DesignStyle,
} from "@/types";

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const ASPECT_OPTIONS: { value: GalleryAspect; label: string }[] = [
  { value: "portrait", label: "Portrait 4:5" },
  { value: "tall", label: "Tall 3:4.6" },
  { value: "square", label: "Square 1:1" },
  { value: "landscape", label: "Landscape 16:11" },
];

export function GalleryDesignForm({
  open,
  onOpenChange,
  initial,
  onSubmit,
  saving = false,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Pass an existing design to edit; omit for create mode. */
  initial?: GalleryDesign | null;
  onSubmit: (design: GalleryDesign, mode: "create" | "update") => void;
  saving?: boolean;
}) {
  const editing = Boolean(initial);
  const [title, setTitle] = useState(initial?.title ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [style, setStyle] = useState<DesignStyle>(initial?.style ?? "minimalist");
  const [color, setColor] = useState<DesignColor>(initial?.color ?? "nude");
  const [occasion, setOccasion] = useState<DesignOccasion>(initial?.occasion ?? "daily");
  const [shape, setShape] = useState<DesignShape>(initial?.shape ?? "almond");
  const [difficulty, setDifficulty] = useState<DesignDifficulty>(initial?.difficulty ?? "easy");
  const [aspect, setAspect] = useState<GalleryAspect>(initial?.aspect ?? "portrait");
  const [priceText, setPriceText] = useState(initial ? String(initial.price) : "");
  const [imageSeeds, setImageSeeds] = useState<string[]>(initial?.imageSeeds ?? []);
  const [previewSeed, setPreviewSeed] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);

  const usedCount = useMemo(() => {
    const current = imageSeeds.filter((s) => s !== "").length;
    return current;
  }, [imageSeeds]);

  const handleUpload = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      setError("File harus berupa gambar (JPG/PNG/WebP).");
      return;
    }
    if (file.size > 6 * 1024 * 1024) {
      setError("Ukuran file maksimal 6 MB.");
      return;
    }
    setUploading(true);
    setError("");
    try {
      const body = new FormData();
      body.append("file", file);
      body.append("category", "gallery");
      const res = await fetch("/api/upload", { method: "POST", body });
      const data = (await res.json()) as { data?: { reference?: string }; error?: { message?: string } };
      if (!res.ok || !data.data?.reference) {
        setError(data.error?.message ?? "Gagal mengunggah gambar.");
        return;
      }
      const seed = data.data.reference;
      setImageSeeds((prev) => (prev.includes(seed) ? prev : [...prev, seed]));
    } catch {
      setError("Gagal mengunggah gambar. Coba lagi.");
    } finally {
      setUploading(false);
    }
  };

  const handleUploadChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) void handleUpload(file);
    e.target.value = "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedTitle = title.trim();
    const slug = slugify(trimmedTitle);
    if (!trimmedTitle) {
      setError("Judul desain wajib diisi.");
      return;
    }
    if (!slug) {
      setError("Judul harus mengandung huruf agar bisa dijadikan slug.");
      return;
    }
    if (imageSeeds.length === 0) {
      setError("Pilih minimal satu foto katalog.");
      return;
    }
    const price = Number(priceText);
    if (!priceText.trim() || !Number.isFinite(price) || price <= 0) {
      setError("Harga wajib diisi dengan angka lebih dari 0.");
      return;
    }

    setError("");
    try {
      await onSubmit(
        {
          id: initial?.id ?? `des-${Date.now()}`,
          slug: editing ? initial!.slug : slug,
          title: trimmedTitle,
          description: description.trim(),
          imageSeeds,
          aspect,
          style,
          color,
          occasion,
          shape,
          difficulty,
          price: Math.round(price),
        },
        editing ? "update" : "create"
      );
      onOpenChange(false);
    } catch (submitError) {
      setError(
        submitError instanceof Error ? submitError.message : "Gagal menyimpan desain. Coba lagi."
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl bg-card max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-heading text-lg font-semibold text-foreground/90">
            {editing ? "Edit Desain" : "Tambah Desain Baru"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-5 py-2">
          {/* Title */}
          <div className="grid gap-2">
            <Label htmlFor="design-title" className="font-medium text-foreground/90">
              Judul Desain *
            </Label>
            <Input
              id="design-title"
              placeholder="Contoh: Korean Milk Nail"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          {editing && (
            <p className="text-[11px] text-muted-foreground">
              Slug: <span className="font-mono text-foreground/70">{initial!.slug}</span>
            </p>
          )}

          <div className="grid gap-2">
            <Label htmlFor="design-desc" className="font-medium text-foreground/90">
              Deskripsi
            </Label>
            <Textarea
              id="design-desc"
              placeholder="Cerita singkat desainnya, tone-nya seperti apa, cocok untuk acara apa..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          {/* Photo uploader (upload-only) */}
          <div className="grid gap-2">
            <div className="flex items-center justify-between">
              <Label className="font-medium text-foreground/90">
                Foto Desain <span className="text-destructive">*</span>
              </Label>
              <span className="text-[11px] text-muted-foreground">
                {usedCount} dipilih · foto diambil dari upload
              </span>
            </div>

            {/* Upload button */}
            <label
              className={cn(
                "flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-primary/40 bg-primary/5 px-4 py-3 text-sm font-semibold text-primary transition-colors hover:bg-primary/10",
                uploading && "pointer-events-none opacity-60"
              )}
            >
              {uploading ? (
                <>
                  <span className="size-4 animate-spin rounded-full border-2 border-primary/30 border-t-primary" />
                  Mengunggah...
                </>
              ) : (
                <>
                  <UploadSimpleIcon className="size-4" weight="bold" />
                  Upload Foto Baru
                </>
              )}
              <input
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={handleUploadChange}
                disabled={uploading}
              />
            </label>

            {/* Uploaded images (compact grid, drag to reorder, click to preview) */}
            {imageSeeds.length > 0 ? (
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
                {imageSeeds.map((seed, index) => (
                  <button
                    key={seed}
                    type="button"
                    draggable
                    onDragStart={(e) => {
                      e.dataTransfer.effectAllowed = "move";
                      e.dataTransfer.setData("text/plain", seed);
                    }}
                    onDragOver={(e) => {
                      if (e.dataTransfer.types.includes("text/plain")) {
                        e.preventDefault();
                      }
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      const from = e.dataTransfer.getData("text/plain");
                      if (!from || from === seed) return;
                      setImageSeeds((prev) => {
                        const next = [...prev];
                        const fromIndex = next.indexOf(from);
                        if (fromIndex === -1) return prev;
                        next.splice(fromIndex, 1);
                        next.splice(index, 0, from);
                        return next;
                      });
                    }}
                    onClick={() => setPreviewSeed(seed)}
                    className={cn(
                      "group relative aspect-square overflow-hidden rounded-lg border bg-muted/20 transition-all",
                      "border-border/60 hover:border-primary/50 hover:ring-2 hover:ring-primary/30"
                    )}
                  >
                    <Image
                      src={imageUrl(seed)}
                      alt={`Foto desain ${index + 1}`}
                      fill
                      sizes="(min-width: 1024px) 7rem, 30vw"
                      className="size-full object-cover"
                    />
                    <span className="absolute left-1 top-1 rounded bg-black/60 px-1.5 text-[10px] font-semibold text-white">
                      {index + 1}
                    </span>
                    {index === 0 && (
                      <span className="absolute right-1 top-1 rounded bg-primary px-1.5 text-[10px] font-semibold text-white">
                        Utama
                      </span>
                    )}
                    <span className="absolute inset-x-0 bottom-0 flex items-center justify-center gap-1 bg-black/50 py-1 text-[10px] font-semibold text-white opacity-0 transition-opacity group-hover:opacity-100">
                      <DotsSixIcon className="size-3.5" />
                      Seret · Klik
                    </span>
                    <span
                      role="button"
                      tabIndex={-1}
                      aria-label="Hapus foto"
                      onClick={(e) => {
                        e.stopPropagation();
                        setImageSeeds((prev) => prev.filter((s) => s !== seed));
                      }}
                      className="absolute -right-1.5 -top-1.5 flex size-5 items-center justify-center rounded-full bg-destructive text-white shadow-sm transition-transform hover:scale-110"
                    >
                      <XIcon className="size-3" />
                    </span>
                  </button>
                ))}
              </div>
            ) : (
              <p className="rounded-xl border border-dashed border-border/70 bg-background/40 px-4 py-6 text-center text-xs text-muted-foreground">
                Belum ada foto. Upload foto desain untuk mulai.
              </p>
            )}

            {/* Lightbox preview (plain overlay, avoids nested dialog) */}
            {previewSeed && (
              <div
                role="dialog"
                aria-modal="true"
                aria-label="Pratinjau foto desain"
                onClick={() => setPreviewSeed(null)}
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
              >
                <div
                  onClick={(e) => e.stopPropagation()}
                  className="flex w-full max-w-lg flex-col gap-3 rounded-2xl bg-card p-3 shadow-xl"
                >
                  <Image
                    src={imageUrl(previewSeed)}
                    alt="Pratinjau foto desain"
                    width={512}
                    height={512}
                    className="max-h-[70vh] w-full rounded-xl object-contain bg-muted/20"
                  />
                  <div className="flex items-center justify-between px-1">
                    <span className="text-xs text-muted-foreground">
                      {imageSeeds.indexOf(previewSeed) + 1} / {imageSeeds.length} · foto pertama = foto utama
                    </span>
                    <div className="flex items-center gap-1.5">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="gap-1.5 rounded-full text-xs text-muted-foreground hover:text-destructive"
                        onClick={() => {
                          setImageSeeds((prev) => prev.filter((s) => s !== previewSeed));
                          setPreviewSeed(null);
                        }}
                      >
                        <TrashIcon className="size-3.5" />
                        Hapus
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        aria-label="Tutup pratinjau"
                        className="rounded-full text-muted-foreground hover:text-foreground"
                        onClick={() => setPreviewSeed(null)}
                      >
                        <XIcon className="size-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Taxonomy: 2-col grid of selects */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <div className="grid gap-1.5">
              <Label htmlFor="design-style" className="font-medium text-foreground/90">
                Style
              </Label>
              <select
                id="design-style"
                className="flex h-9 w-full rounded-lg border border-input bg-card px-2.5 text-sm shadow-xs focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring"
                value={style}
                onChange={(e) => setStyle(e.target.value as DesignStyle)}
              >
                {Object.entries(STYLE_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="design-color" className="font-medium text-foreground/90">
                Warna
              </Label>
              <select
                id="design-color"
                className="flex h-9 w-full rounded-lg border border-input bg-card px-2.5 text-sm shadow-xs focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring"
                value={color}
                onChange={(e) => setColor(e.target.value as DesignColor)}
              >
                {Object.entries(COLOR_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="design-occasion" className="font-medium text-foreground/90">
                Acara
              </Label>
              <select
                id="design-occasion"
                className="flex h-9 w-full rounded-lg border border-input bg-card px-2.5 text-sm shadow-xs focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring"
                value={occasion}
                onChange={(e) => setOccasion(e.target.value as DesignOccasion)}
              >
                {Object.entries(OCCASION_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="design-shape" className="font-medium text-foreground/90">
                Bentuk
              </Label>
              <select
                id="design-shape"
                className="flex h-9 w-full rounded-lg border border-input bg-card px-2.5 text-sm shadow-xs focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring"
                value={shape}
                onChange={(e) => setShape(e.target.value as DesignShape)}
              >
                {Object.entries(SHAPE_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="design-difficulty" className="font-medium text-foreground/90">
                Tingkat Kesulitan
              </Label>
              <select
                id="design-difficulty"
                className="flex h-9 w-full rounded-lg border border-input bg-card px-2.5 text-sm shadow-xs focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring"
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as DesignDifficulty)}
              >
                {Object.entries(DIFFICULTY_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="design-aspect" className="font-medium text-foreground/90">
                Rasio Foto
              </Label>
              <select
                id="design-aspect"
                className="flex h-9 w-full rounded-lg border border-input bg-card px-2.5 text-sm shadow-xs focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring"
                value={aspect}
                onChange={(e) => setAspect(e.target.value as GalleryAspect)}
              >
                {ASPECT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Price (custom) */}
          <div className="grid gap-2">
            <Label htmlFor="design-price" className="font-medium text-foreground/90">
              Harga (Rp) <span className="text-destructive">*</span>
            </Label>
            <div className="relative">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-muted-foreground">
                Rp
              </span>
              <Input
                id="design-price"
                type="number"
                min={0}
                step={1000}
                placeholder="contoh: 150000"
                value={priceText}
                onChange={(e) => setPriceText(e.target.value)}
                className="h-10 pl-10"
              />
            </div>
            <p className="text-[11px] text-muted-foreground">
              Harga per set (10 jari). Bebas diisi sesuai kebutuhan.
            </p>
          </div>

          {error && (
            <p role="alert" className="rounded-lg bg-destructive/10 px-3 py-2 text-xs font-medium text-destructive">
              {error}
            </p>
          )}

          <div className="flex items-center justify-end gap-2 border-t border-border/55 pt-4">
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              className="gap-1.5 rounded-full text-muted-foreground"
            >
              <XIcon className="size-4" />
              Batal
            </Button>
            <Button type="submit" className="gap-1.5 rounded-full" disabled={saving}>
              {saving ? (
                <span className="size-4 animate-spin rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground" />
              ) : editing ? (
                <>
                  <CheckIcon className="size-4" />
                  Simpan Perubahan
                </>
              ) : (
                <>
                  <PlusIcon className="size-4" />
                  Tambah Desain
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
