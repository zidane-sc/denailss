"use client";

import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
        hint="Gambar yang tampil saat link dibagikan di media sosial."
      >
        <div className="flex items-center gap-3">
          {seo.ogImage ? (
            <div className="relative size-16 overflow-hidden rounded-xl border border-border bg-background/40">
              <Image
                src={imageUrl(seo.ogImage)}
                alt="Gambar Open Graph"
                fill
                sizes="4rem"
                className="object-cover"
              />
            </div>
          ) : (
            <div className="flex size-16 items-center justify-center rounded-xl border border-dashed border-border bg-background/40 text-muted-foreground">
              <span className="text-[10px] font-semibold">OG</span>
            </div>
          )}
          <Input
            value={seo.ogImage ?? ""}
            onChange={(e) => onChange({ ...draft, seo: { ...seo, ogImage: e.target.value || null } })}
            placeholder="/images/logo-horizontal.png atau storage:..."
            className="h-10"
          />
        </div>
      </SettingsField>
    </SettingsSection>
  );
}
