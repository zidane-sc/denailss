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
 * Business profile settings — name (required), owner-managed Storage logo,
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

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) return;
    if (file.size > 6 * 1024 * 1024) return;
    const previewUrl = URL.createObjectURL(file);
    onChange({ ...draft, businessProfile: { ...draft.businessProfile, logo: previewUrl } });
    try {
      const body = new FormData();
      body.append("file", file);
      body.append("category", "settings");
      const response = await fetch("/api/upload", { method: "POST", body });
      const payload = (await response.json()) as { data?: { reference?: string } };
      if (!response.ok || !payload.data?.reference) throw new Error("upload");
      URL.revokeObjectURL(previewUrl);
      onChange({ ...draft, businessProfile: { ...draft.businessProfile, logo: payload.data.reference } });
    } catch {
      URL.revokeObjectURL(previewUrl);
      onChange({ ...draft, businessProfile: { ...draft.businessProfile, logo: logo ?? null } });
    }
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
        hint="Gambar persegi atau transparan. Logo akan disimpan di Supabase Storage."
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

      <SettingsField
        label="Link Google Maps"
        hint={draft.businessProfile.mapsUrl ? undefined : "Tempel link Maps untuk tombol \"Lihat lokasi di Maps\" di footer dan halaman kontak."}
      >
        <Input
          type="url"
          value={draft.businessProfile.mapsUrl ?? ""}
          onChange={(e) =>
            onChange({
              ...draft,
              businessProfile: { ...draft.businessProfile, mapsUrl: e.target.value },
            })
          }
          placeholder="https://maps.google.com/?q=Denailss+Nail+Art"
          className="h-10"
        />
        {!draft.businessProfile.mapsUrl?.trim() && (
          <p className="text-[11px] text-muted-foreground">Belum diatur.</p>
        )}
      </SettingsField>

      <div className="grid gap-5 sm:grid-cols-2">
        <SettingsField
          label="Latitude"
          hint={error.latitude ? undefined : "Koordinat peta yang tampil di halaman kontak, contoh -6.2088."}
          error={error.latitude}
        >
          <Input
            type="number"
            step="any"
            value={draft.businessProfile.latitude ?? ""}
            onChange={(e) => {
              const raw = e.target.value;
              onChange({
                ...draft,
                businessProfile: {
                  ...draft.businessProfile,
                  latitude: raw === "" ? null : Number(raw),
                },
              });
            }}
            placeholder="-6.2088"
            className="h-10"
            aria-invalid={Boolean(error.latitude)}
          />
        </SettingsField>

        <SettingsField
          label="Longitude"
          hint={error.longitude ? undefined : "Koordinat peta yang tampil di halaman kontak, contoh 106.8456."}
          error={error.longitude}
        >
          <Input
            type="number"
            step="any"
            value={draft.businessProfile.longitude ?? ""}
            onChange={(e) => {
              const raw = e.target.value;
              onChange({
                ...draft,
                businessProfile: {
                  ...draft.businessProfile,
                  longitude: raw === "" ? null : Number(raw),
                },
              });
            }}
            placeholder="106.8456"
            className="h-10"
            aria-invalid={Boolean(error.longitude)}
          />
        </SettingsField>
      </div>
    </SettingsSection>
  );
}
