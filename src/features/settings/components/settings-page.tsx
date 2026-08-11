"use client";

import { useEffect, useRef, useState } from "react";
import { CheckIcon, FloppyDiskIcon, WarningCircleIcon } from "@phosphor-icons/react/dist/ssr";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { normalizeSocialMedia } from "../logic/normalize";
import { validateSettings, type SettingsErrors } from "../validators/settings";
import type { SettingsDraft } from "../types";
import { BusinessProfileForm } from "./business-profile-form";
import { SocialMediaForm } from "./social-media-form";
import { PoliciesForm } from "./policies-form";
import { SeoForm } from "./seo-form";
import { FaqForm } from "./faq-form";

/**
 * Settings page — Epic 9. One focused workspace for the owner to maintain the
 * business profile, social media, and booking policies. Edits persist through
 * `GET/PUT /api/v1/settings` (owner-gated, Supabase-backed).
 */
export function SettingsPageView() {
  const reduce = useReducedMotion();
  const [draft, setDraft] = useState<SettingsDraft | null>(null);
  const [errors, setErrors] = useState<SettingsErrors>({});
  const [showSaved, setShowSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const savedTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dirty = useRef(false);

  // Load persisted settings on mount.
  useEffect(() => {
    let active = true;
    fetch("/api/v1/settings", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .then((payload: { data?: SettingsDraft } | null) => {
        if (active && payload?.data) setDraft(payload.data);
      })
      .catch(() => {
        // leave the draft null; the empty state below shows a retry
      });
    return () => {
      active = false;
    };
  }, []);

  // Warn the owner before leaving with unsaved changes (tab close / reload).
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (!dirty.current) return;
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, []);

  // Clean up any pending save-feedback timer on unmount.
  useEffect(() => {
    return () => {
      if (savedTimer.current) clearTimeout(savedTimer.current);
    };
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft) return;
    const nextErrors = validateSettings(draft);
    setErrors(nextErrors);
    if (Object.values(nextErrors).some(Boolean)) {
      toast.error("Ada beberapa hal yang perlu diperbaiki dulu.", {
        description: "Periksa kembali isian yang ditandai di bawah.",
      });
      return;
    }

    const normalized = normalizeSocialMedia(draft);
    setDraft(normalized);
    setSaving(true);
    try {
      const res = await fetch("/api/v1/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(normalized),
      });
      const payload = (await res.json().catch(() => ({}))) as {
        data?: SettingsDraft;
        error?: { message?: string };
      };
      if (!res.ok) throw new Error(payload.error?.message ?? "Gagal menyimpan pengaturan.");
      if (payload.data) setDraft(payload.data);
      dirty.current = false;
      setShowSaved(true);
      if (savedTimer.current) clearTimeout(savedTimer.current);
      savedTimer.current = setTimeout(() => setShowSaved(false), 2500);
      toast.success("Pengaturan berhasil disimpan.", {
        description: "Perubahan akan dipakai di seluruh website Denailss.",
      });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Gagal menyimpan pengaturan.");
    } finally {
      setSaving(false);
    }
  };

  if (!draft) {
    return (
      <div className="mx-auto max-w-3xl space-y-6 animate-in fade-in duration-300">
        <div className="flex flex-col gap-1 border-b border-border/50 pb-5">
          <h2 className="font-heading text-2xl font-semibold tracking-tight text-foreground/90">
            Pengaturan
          </h2>
          <p className="text-sm text-muted-foreground">
            Atur informasi dan kebijakan yang digunakan Denailss.
          </p>
        </div>
        <section className="rounded-2xl border border-border/70 bg-card p-10 text-center shadow-xs">
          <p className="text-sm font-medium text-foreground/80">Memuat pengaturan...</p>
        </section>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col gap-1 border-b border-border/50 pb-5">
        <h2 className="font-heading text-2xl font-semibold tracking-tight text-foreground/90">
          Pengaturan
        </h2>
        <p className="text-sm text-muted-foreground">
          Atur informasi dan kebijakan yang digunakan Denailss.
        </p>
      </div>

      <form onSubmit={handleSave} noValidate className="space-y-6">
        <BusinessProfileForm draft={draft} error={errors} onChange={setDraft} />
        <SocialMediaForm draft={draft} error={errors} onChange={setDraft} />
        <PoliciesForm draft={draft} onChange={setDraft} />
        <SeoForm draft={draft} onChange={setDraft} />
        <FaqForm draft={draft} onChange={setDraft} />

        {/* Save bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border/70 bg-card p-4 shadow-xs sm:p-5">
          <div className="min-w-0">
            <AnimatePresence mode="wait" initial={false}>
              {showSaved ? (
                <motion.p
                  key="saved"
                  initial={reduce ? false : { opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={reduce ? undefined : { opacity: 0, y: -4 }}
                  transition={{ duration: 0.2 }}
                  className="flex items-center gap-1.5 text-sm font-medium text-emerald-700"
                >
                  <CheckIcon weight="bold" className="size-4" />
                  Pengaturan berhasil disimpan.
                </motion.p>
              ) : (
                <motion.p
                  key="idle"
                  initial={reduce ? false : { opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={reduce ? undefined : { opacity: 0, y: 4 }}
                  transition={{ duration: 0.2 }}
                  className="flex items-center gap-1.5 text-sm text-muted-foreground"
                >
                  <WarningCircleIcon className="size-4" />
                  Perubahan tersimpan di server. File logo disimpan di Supabase Storage.
                </motion.p>
              )}
            </AnimatePresence>
          </div>

          <Button
            type="submit"
            className="gap-1.5 rounded-full"
            disabled={saving}
            onClick={() => {
              dirty.current = true;
            }}
          >
            {saving ? (
              <span className="size-4 animate-spin rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground" />
            ) : (
              <FloppyDiskIcon className="size-4" />
            )}
            Simpan Perubahan
          </Button>
        </div>
      </form>
    </div>
  );
}
