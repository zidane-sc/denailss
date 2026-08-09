"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { ImageIcon, TrashIcon, UploadSimpleIcon } from "@phosphor-icons/react/dist/ssr";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { SettingsDraft } from "../types";
import type { SettingsErrors } from "../validators/settings";
import { SettingsField, SettingsSection } from "./settings-shared";

/**
 * Business profile settings — name (required), logo (local preview only, FE),
 * short description, and the address used by the public website contact.
 */
export function BusinessProfileForm({
  draft,
  error,
  onChange,
}: {
  draft: SettingsDraft;
  error: SettingsErrors;
  onChange: (draft: SettingsDraft) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const { logo } = draft.businessProfile;

  // Revoke the previous object URL when the logo is replaced or removed.
  useEffect(() => {
    return () => {
      if (logo && logo.startsWith("blob:")) URL.revokeObjectURL(logo);
    };
  }, [logo]);

  const handleFile = (file: File | undefined) => {
    if (!file) return;
    const previewUrl = URL.createObjectURL(file);
    onChange({
      ...draft,
      businessProfile: { ...draft.businessProfile, logo: previewUrl },
    });
  };

  const removeLogo = () => {
    if (logo && logo.startsWith("blob:")) URL.revokeObjectURL(logo);
    onChange({
      ...draft,
      businessProfile: { ...draft.businessProfile, logo: null },
    });
  };

  return (
    <SettingsSection
      title="Profil Bisnis"
      description="Informasi dasar tentang Denailss yang tampil di website."
    >
      <SettingsField
        label="Nama Bisnis"
        required
        error={error.name}
        hint={error.name ? undefined : "Nama yang muncul di website dan konfirmasi booking."}
      >
        <Input
          value={draft.businessProfile.name}
          onChange={(e) =>
            onChange({
              ...draft,
              businessProfile: { ...draft.businessProfile, name: e.target.value },
            })
          }
          placeholder="contoh: Denailss"
          className="h-10"
          aria-invalid={Boolean(error.name)}
        />
      </SettingsField>

      <SettingsField
        label="Logo"
        hint="Gambar persegi atau transparan. Logo tersimpan lokal untuk pratinjau (belum diunggah)."
      >
        <div className="flex flex-wrap items-center gap-3">
          {logo ? (
            <div className="relative size-16 overflow-hidden rounded-xl border border-border bg-background/40">
              <Image
                src={logo}
                alt="Logo Denailss saat ini"
                fill
                sizes="4rem"
                className="object-contain"
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
              {logo ? "Ganti" : "Pilih Logo"}
            </Button>
            {logo && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-9 gap-1.5 rounded-full px-3.5 text-xs text-muted-foreground hover:text-destructive"
                onClick={removeLogo}
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
              aria-label="Pilih file logo"
              onChange={(e) => {
                handleFile(e.target.files?.[0]);
                e.target.value = "";
              }}
            />
          </div>
        </div>
        {!logo && (
          <p className="text-[11px] text-muted-foreground">Belum ada logo.</p>
        )}
      </SettingsField>

      <SettingsField
        label="Deskripsi"
        hint={draft.businessProfile.description ? undefined : "Tambahkan deskripsi singkat tentang Denailss."}
      >
        <Textarea
          value={draft.businessProfile.description}
          onChange={(e) =>
            onChange({
              ...draft,
              businessProfile: { ...draft.businessProfile, description: e.target.value },
            })
          }
          placeholder="Deskripsi singkat tentang Denailss."
          rows={3}
        />
      </SettingsField>

      <SettingsField
        label="Alamat"
        hint="Alamat lokasi treatment yang tampil di halaman kontak."
      >
        <Input
          value={draft.businessProfile.address}
          onChange={(e) =>
            onChange({
              ...draft,
              businessProfile: { ...draft.businessProfile, address: e.target.value },
            })
          }
          placeholder="contoh: Jl. Petojo Binatu, Jakarta Pusat"
          className="h-10"
        />
      </SettingsField>
    </SettingsSection>
  );
}
