"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { ImageIcon, TrashIcon, UploadSimpleIcon } from "@phosphor-icons/react/dist/ssr";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import type { SettingsDraft } from "../types";
import { SettingsField, SettingsSection } from "./settings-shared";
import { imageUrl } from "@/lib/images";

/**
 * SEO settings — the meta title/description/OG image shown in search results
 * and social shares. Fills the PRD Epic 9 "SEO" gap.
 */
export function SeoForm({
  draft,
  onChange,
}: {
  draft: SettingsDraft;
  onChange: (draft: SettingsDraft) => void;
}) {
  const { seo } = draft;
  const inputRef = useRef<HTMLInputElement>(null);

  // Revoke the previous object URL when the OG image is replaced or removed.
  useEffect(() => {
    return () => {
      if (seo.ogImage && seo.ogImage.startsWith("blob:")) URL.revokeObjectURL(seo.ogImage);
    };
  }, [seo.ogImage]);

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) return;
    if (file.size > 6 * 1024 * 1024) return;
    const previewUrl = URL.createObjectURL(file);
    onChange({ ...draft, seo: { ...seo, ogImage: previewUrl } });
    try {
      const body = new FormData();
      body.append("file", file);
      body.append("category", "settings");
      const response = await fetch("/api/upload", { method: "POST", body });
      const payload = (await response.json()) as { data?: { reference?: string } };
      if (!response.ok || !payload.data?.reference) throw new Error("upload");
      URL.revokeObjectURL(previewUrl);
      onChange({ ...draft, seo: { ...seo, ogImage: payload.data.reference } });
    } catch {
      URL.revokeObjectURL(previewUrl);
      toast.error("Gagal mengunggah gambar Open Graph.");
      onChange({ ...draft, seo: { ...seo, ogImage: seo.ogImage } });
    }
  };

  const removeOgImage = () => {
    if (seo.ogImage && seo.ogImage.startsWith("blob:")) URL.revokeObjectURL(seo.ogImage);
    onChange({ ...draft, seo: { ...seo, ogImage: null } });
  };

  return (
    <SettingsSection
      title="SEO"
      description="Judul dan deskripsi yang tampil di hasil pencarian dan saat link dibagikan."
    >
      <SettingsField
        label="Meta Title"
        hint="Judul tab browser + hasil pencarian (pakai format: Nama Bisnis · Tagline)."
      >
        <Input
          value={seo.metaTitle}
          onChange={(e) => onChange({ ...draft, seo: { ...seo, metaTitle: e.target.value } })}
          placeholder="Denailss · Nail art & beauty space"
          className="h-10"
        />
      </SettingsField>

      <SettingsField
        label="Meta Description"
        hint="Deskripsi singkat yang tampil di bawah judul hasil pencarian."
      >
        <Textarea
          value={seo.metaDescription}
          onChange={(e) => onChange({ ...draft, seo: { ...seo, metaDescription: e.target.value } })}
          placeholder="Deskripsi singkat tentang Denailss."
          rows={3}
        />
      </SettingsField>

      <SettingsField
        label="Gambar Open Graph"
        hint="Gambar yang tampil saat link dibagikan di media sosial. Ukuran ideal 1200×630 px."
      >
        <div className="flex flex-wrap items-center gap-3">
          {seo.ogImage ? (
            <div className="relative size-16 overflow-hidden rounded-xl border border-border bg-background/40">
              <Image
                src={seo.ogImage.startsWith("blob:") ? seo.ogImage : imageUrl(seo.ogImage)}
                alt="Gambar Open Graph"
                fill
                sizes="4rem"
                className="object-cover"
              />
            </div>
          ) : (
            <div className="flex size-16 items-center justify-center rounded-xl border border-dashed border-border bg-background/40 text-muted-foreground">
              <ImageIcon className="size-5" />
            </div>
          )}

          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-9 gap-1.5 rounded-full px-3.5 text-xs"
              onClick={() => inputRef.current?.click()}
            >
              <UploadSimpleIcon className="size-3.5" />
              {seo.ogImage ? "Ganti" : "Pilih Gambar"}
            </Button>
            {seo.ogImage && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-9 gap-1.5 rounded-full px-3.5 text-xs text-muted-foreground hover:text-destructive"
                onClick={removeOgImage}
              >
                <TrashIcon className="size-3.5" />
                Hapus
              </Button>
            )}
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              className="sr-only"
              aria-label="Pilih file gambar Open Graph"
              onChange={(e) => {
                handleFile(e.target.files?.[0]);
                e.target.value = "";
              }}
            />
          </div>

          <Input
            value={seo.ogImage ?? ""}
            onChange={(e) => onChange({ ...draft, seo: { ...seo, ogImage: e.target.value || null } })}
            placeholder="/images/logo-horizontal.png atau storage:..."
            className="h-10 min-w-52 flex-1"
          />
        </div>
      </SettingsField>
    </SettingsSection>
  );
}
