"use client";

import {
  InstagramLogoIcon,
  TiktokLogoIcon,
  WhatsappLogoIcon,
} from "@phosphor-icons/react/dist/ssr";
import { Input } from "@/components/ui/input";
import type { SettingsDraft } from "../types";
import type { SettingsErrors } from "../validators/settings";
import { SettingsField, SettingsSection } from "./settings-shared";

/**
 * Social media settings — Instagram, TikTok, WhatsApp. Values are usernames
 * (or a full URL) for Instagram/TikTok and a phone number for WhatsApp, seeded
 * from the shared business constants. Validation stays light on purpose.
 */
export function SocialMediaForm({
  draft,
  error,
  onChange,
}: {
  draft: SettingsDraft;
  error: SettingsErrors;
  onChange: (draft: SettingsDraft) => void;
}) {
  const { socialMedia } = draft;

  return (
    <SettingsSection
      title="Social Media"
      description="Akun yang tampil di footer dan halaman kontak website."
    >
      <SettingsField
        label="Instagram"
        hint={error.instagram ? undefined : "Username tanpa @, atau tempel link profil."}
        error={error.instagram}
      >
        <div className="relative">
          <InstagramLogoIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={socialMedia.instagram}
            onChange={(e) =>
              onChange({
                ...draft,
                socialMedia: { ...socialMedia, instagram: e.target.value },
              })
            }
            placeholder="denailss_9"
            className="h-10 pl-9"
            aria-invalid={Boolean(error.instagram)}
          />
        </div>
        {!socialMedia.instagram.trim() && !error.instagram && (
          <p className="text-[11px] text-muted-foreground">Belum diatur.</p>
        )}
      </SettingsField>

      <SettingsField
        label="TikTok"
        hint={error.tiktok ? undefined : "Username tanpa @, atau tempel link profil."}
        error={error.tiktok}
      >
        <div className="relative">
          <TiktokLogoIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={socialMedia.tiktok}
            onChange={(e) =>
              onChange({
                ...draft,
                socialMedia: { ...socialMedia, tiktok: e.target.value },
              })
            }
            placeholder="denails10"
            className="h-10 pl-9"
            aria-invalid={Boolean(error.tiktok)}
          />
        </div>
        {!socialMedia.tiktok.trim() && !error.tiktok && (
          <p className="text-[11px] text-muted-foreground">Belum diatur.</p>
        )}
      </SettingsField>

      <SettingsField
        label="WhatsApp"
        hint={error.whatsapp ? undefined : "Nomor untuk chat customer, contoh 081234567890."}
        error={error.whatsapp}
      >
        <div className="relative">
          <WhatsappLogoIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="tel"
            inputMode="tel"
            value={socialMedia.whatsapp}
            onChange={(e) =>
              onChange({
                ...draft,
                socialMedia: { ...socialMedia, whatsapp: e.target.value },
              })
            }
            placeholder="081234567890"
            className="h-10 pl-9"
            aria-invalid={Boolean(error.whatsapp)}
          />
        </div>
        {!socialMedia.whatsapp.trim() && !error.whatsapp && (
          <p className="text-[11px] text-muted-foreground">Belum diatur.</p>
        )}
      </SettingsField>
    </SettingsSection>
  );
}
