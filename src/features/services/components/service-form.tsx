"use client";

import React, { useState } from "react";
import { PlusIcon, TrashIcon, UploadSimpleIcon } from "@phosphor-icons/react/dist/ssr";
import { cn } from "@/lib/utils";
import { imageUrl } from "@/lib/images";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { Service, ServiceTier } from "@/types";

export function ServiceForm({
  open,
  onOpenChange,
  initial,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initial: Service;
  onSubmit: (service: Service) => void;
}) {
  const [name, setName] = useState(initial.name);
  const [priceText, setPriceText] = useState(String(initial.priceFrom));
  const [durationText, setDurationText] = useState(String(initial.durationMinutes));
  const [shortDescription, setShortDescription] = useState(initial.shortDescription);
  const [description, setDescription] = useState(initial.description);
  const [priceNote, setPriceNote] = useState(initial.priceNote ?? "");
  const [heroImage, setHeroImage] = useState<string | null>(initial.heroImage);
  const [tiered, setTiered] = useState(initial.tiers.length > 0);
  const [tiers, setTiers] = useState<ServiceTier[]>(
    initial.tiers.length > 0
      ? initial.tiers
      : [
          { key: "simple", label: "Simple", priceFrom: initial.priceFrom, durationMinutes: initial.durationMinutes },
          { key: "complex", label: "Complex", priceFrom: initial.priceFrom, durationMinutes: initial.durationMinutes },
        ]
  );
  const [requiresPickup, setRequiresPickup] = useState(initial.requiresPickup);
  const [faq, setFaq] = useState<{ question: string; answer: string }[]>(initial.faq);
  const [depositApplicable, setDepositApplicable] = useState(initial.depositApplicable);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);

  const handleHeroUpload = async (file: File) => {
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
      const res = await fetch("/api/upload", { method: "POST", body });
      const data = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !data.url) {
        setError(data.error ?? "Gagal mengunggah gambar.");
        return;
      }
      const seed = `upload:${data.url.replace("/images/uploads/", "")}`;
      setHeroImage(seed);
    } catch {
      setError("Gagal mengunggah gambar. Coba lagi.");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName) {
      setError("Nama layanan wajib diisi.");
      return;
    }

    const finalTiers = tiered
      ? tiers
          .map((t) => ({
            ...t,
            label: t.label.trim() || t.key,
            priceFrom: Math.round(Number(t.priceFrom)),
            durationMinutes: Math.round(Number(t.durationMinutes)),
          }))
          .filter((t) => Number.isFinite(t.priceFrom) && t.priceFrom > 0 && Number.isFinite(t.durationMinutes) && t.durationMinutes > 0)
      : [];

    if (tiered && finalTiers.length === 0) {
      setError("Isi harga dan durasi minimal satu tingkat kesulitan.");
      return;
    }

    const flatPrice = Number(priceText);
    if (!tiered && (!priceText.trim() || !Number.isFinite(flatPrice) || flatPrice <= 0)) {
      setError("Harga mulai wajib diisi dengan angka lebih dari 0.");
      return;
    }
    const flatDuration = Number(durationText);
    if (!tiered && (!durationText.trim() || !Number.isFinite(flatDuration) || flatDuration <= 0)) {
      setError("Durasi wajib diisi dengan angka menit lebih dari 0.");
      return;
    }
    if (!heroImage) {
      setError("Pilih foto utama layanan.");
      return;
    }

    const minTierPrice = finalTiers.length > 0 ? Math.min(...finalTiers.map((t) => t.priceFrom)) : 0;

    onSubmit({
      id: initial.id,
      slug: initial.slug,
      name: trimmedName,
      shortDescription: shortDescription.trim(),
      description: description.trim(),
      priceFrom: tiered ? minTierPrice : Math.round(flatPrice),
      priceNote: priceNote.trim() || undefined,
      durationMinutes: tiered ? (finalTiers[0]?.durationMinutes ?? initial.durationMinutes) : Math.round(flatDuration),
      tiers: finalTiers,
      requiresPickup,
      heroImage,
      gallerySeeds: [heroImage],
      faq: faq
        .map((f) => ({ question: f.question.trim(), answer: f.answer.trim() }))
        .filter((f) => f.question && f.answer),
      depositApplicable,
      active: initial.active,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto bg-card sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="font-heading text-lg font-semibold text-foreground/90">
            Edit Layanan
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-5 py-2">
          {error && (
            <div className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3">
              <p className="text-sm font-semibold text-destructive">{error}</p>
            </div>
          )}

          <div className="grid gap-2">
            <Label htmlFor="svc-name" className="font-medium text-foreground/90">
              Nama Layanan *
            </Label>
            <Input
              id="svc-name"
              placeholder="Contoh: Gel Extension"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <p className="text-[11px] text-muted-foreground">
              Slug: <span className="font-mono text-foreground/70">{initial.slug}</span>
            </p>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="svc-short" className="font-medium text-foreground/90">
              Deskripsi Singkat *
            </Label>
            <Textarea
              id="svc-short"
              placeholder="Satu-dua kalimat yang tampil di kartu layanan."
              value={shortDescription}
              onChange={(e) => setShortDescription(e.target.value)}
              rows={2}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="svc-desc" className="font-medium text-foreground/90">
              Deskripsi Lengkap
            </Label>
            <Textarea
              id="svc-desc"
              placeholder="Cerita detail layanannya untuk halaman detail."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          {/* Pricing mode */}
          <div className="grid gap-2">
            <Label className="font-medium text-foreground/90">Harga &amp; Durasi</Label>
            <label className="flex cursor-pointer items-center gap-2.5">
              <input
                type="checkbox"
                checked={tiered}
                onChange={(e) => setTiered(e.target.checked)}
                className="size-4 accent-primary"
              />
              <span className="text-sm font-medium text-foreground/90">
                Bertingkat sesuai tingkat kesulitan (contoh: Simple / Complex)
              </span>
            </label>

            {!tiered ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="svc-price" className="font-medium text-foreground/90">
                    Harga Mulai (Rp) *
                  </Label>
                  <Input
                    id="svc-price"
                    type="number"
                    min={0}
                    step={1000}
                    value={priceText}
                    onChange={(e) => setPriceText(e.target.value)}
                    placeholder="contoh: 150000"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="svc-duration" className="font-medium text-foreground/90">
                    Durasi (menit) *
                  </Label>
                  <Input
                    id="svc-duration"
                    type="number"
                    min={1}
                    step={5}
                    value={durationText}
                    onChange={(e) => setDurationText(e.target.value)}
                    placeholder="contoh: 60"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {tiers.map((tier, i) => (
                  <div key={tier.key} className="grid gap-2 rounded-xl border border-border/70 bg-background/40 p-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        {tier.key === "simple" ? "Simple" : "Complex"}
                      </Label>
                      {i > 0 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          aria-label="Hapus tingkat"
                          className="rounded-full text-muted-foreground hover:text-destructive"
                          onClick={() => setTiers((prev) => prev.filter((_, j) => j !== i))}
                        >
                          <TrashIcon className="size-4" />
                        </Button>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="grid gap-1.5">
                        <Label htmlFor={`tier-${tier.key}-price`} className="text-[11px] text-muted-foreground">
                          Harga Mulai (Rp)
                        </Label>
                        <Input
                          id={`tier-${tier.key}-price`}
                          type="number"
                          min={0}
                          step={1000}
                          value={tier.priceFrom}
                          onChange={(e) =>
                            setTiers((prev) =>
                              prev.map((t, j) => (j === i ? { ...t, priceFrom: Number(e.target.value) } : t))
                            )
                          }
                        />
                      </div>
                      <div className="grid gap-1.5">
                        <Label htmlFor={`tier-${tier.key}-durasi`} className="text-[11px] text-muted-foreground">
                          Durasi (menit)
                        </Label>
                        <Input
                          id={`tier-${tier.key}-durasi`}
                          type="number"
                          min={1}
                          step={5}
                          value={tier.durationMinutes}
                          onChange={(e) =>
                            setTiers((prev) =>
                              prev.map((t, j) => (j === i ? { ...t, durationMinutes: Number(e.target.value) } : t))
                            )
                          }
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="svc-note" className="font-medium text-foreground/90">
              Catatan Harga (opsional)
            </Label>
            <Input
              id="svc-note"
              placeholder="contoh: Estimasi, harga final sesuai desain"
              value={priceNote}
              onChange={(e) => setPriceNote(e.target.value)}
            />
          </div>

          {/* Hero photo */}
          <div className="grid gap-2">
            <Label className="font-medium text-foreground/90">
              Foto Utama <span className="text-destructive">*</span>
            </Label>
            <div className="flex flex-wrap items-center gap-3">
              {heroImage ? (
                <div className="relative size-20 overflow-hidden rounded-xl border border-border bg-muted/30">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={imageUrl(heroImage)}
                    alt="Foto utama layanan"
                    className="size-full object-cover"
                  />
                </div>
              ) : (
                <div className="flex size-20 items-center justify-center rounded-xl border border-dashed border-border bg-background/40 text-muted-foreground">
                  <UploadSimpleIcon className="size-5" />
                </div>
              )}
              <label
                className={cn(
                  "flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-primary/40 bg-primary/5 px-4 py-2.5 text-sm font-semibold text-primary transition-colors hover:bg-primary/10",
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
                    {heroImage ? "Ganti Foto" : "Upload Foto"}
                  </>
                )}
                <input
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  disabled={uploading}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) void handleHeroUpload(file);
                    e.target.value = "";
                  }}
                />
              </label>
              {heroImage && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-9 gap-1.5 rounded-full px-3.5 text-xs text-muted-foreground hover:text-destructive"
                  onClick={() => setHeroImage(null)}
                >
                  <TrashIcon className="size-3.5" />
                  Hapus
                </Button>
              )}
            </div>
          </div>

          {/* Pickup / delivery */}
          <label className="flex cursor-pointer items-center gap-2.5">
            <input
              type="checkbox"
              checked={requiresPickup}
              onChange={(e) => setRequiresPickup(e.target.checked)}
              className="size-4 accent-primary"
            />
            <span className="text-sm font-medium text-foreground/90">
              Pengerjaan dikirim (ambil di lokasi / kurir)
            </span>
          </label>

          {/* FAQ */}
          <div className="grid gap-2">
            <div className="flex items-center justify-between">
              <Label className="font-medium text-foreground/90">FAQ Layanan</Label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 gap-1 rounded-full px-2.5 text-xs text-primary"
                onClick={() => setFaq((prev) => [...prev, { question: "", answer: "" }])}
              >
                <PlusIcon className="size-3.5" />
                Tambah
              </Button>
            </div>
            {faq.map((item, i) => (
              <div key={i} className="grid gap-2 rounded-xl border border-border/70 bg-background/40 p-3">
                <div className="flex items-center gap-2">
                  <Input
                    aria-label={`Pertanyaan FAQ ${i + 1}`}
                    placeholder="Pertanyaan"
                    value={item.question}
                    onChange={(e) =>
                      setFaq((prev) =>
                        prev.map((f, j) => (j === i ? { ...f, question: e.target.value } : f))
                      )
                    }
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    aria-label="Hapus FAQ"
                    className="shrink-0 rounded-full text-muted-foreground hover:text-destructive"
                    onClick={() => setFaq((prev) => prev.filter((_, j) => j !== i))}
                  >
                    <TrashIcon className="size-4" />
                  </Button>
                </div>
                <Textarea
                  aria-label={`Jawaban FAQ ${i + 1}`}
                  placeholder="Jawaban"
                  value={item.answer}
                  onChange={(e) =>
                    setFaq((prev) =>
                      prev.map((f, j) => (j === i ? { ...f, answer: e.target.value } : f))
                    )
                  }
                  rows={2}
                />
              </div>
            ))}
          </div>

          <label className="flex cursor-pointer items-center gap-2.5">
            <input
              type="checkbox"
              checked={depositApplicable}
              onChange={(e) => setDepositApplicable(e.target.checked)}
              className="size-4 accent-primary"
            />
            <span className="text-sm font-medium text-foreground/90">
              Layanan ini wajib deposit
            </span>
          </label>

          <div className="flex items-center justify-end gap-2 border-t border-border/60 pt-4">
            <Button
              type="button"
              variant="ghost"
              className="gap-1.5 rounded-full text-muted-foreground"
              onClick={() => onOpenChange(false)}
            >
              Batal
            </Button>
            <Button type="submit" className="gap-1.5 rounded-full">
              <PlusIcon className="size-4" />
              Simpan Perubahan
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
