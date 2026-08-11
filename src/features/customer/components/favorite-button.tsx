"use client";

import { useCallback, useEffect, useState } from "react";
import { HeartIcon } from "@phosphor-icons/react/dist/ssr";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

/**
 * Save-to-favorites toggle for a gallery design. Renders only when a customer
 * session exists (the API 401s otherwise). Optimistic toggle with rollback.
 */
export function FavoriteButton({ designSlug, className }: { designSlug: string; className?: string }) {
  const [saved, setSaved] = useState(false);
  const [enabled, setEnabled] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let active = true;
    fetch("/api/v1/customer/favorites", { cache: "no-store" })
      .then(async (res) => {
        if (res.status === 401) return; // anonymous — no button
        if (!res.ok) return;
        const payload = (await res.json()) as { data?: { slugs?: string[] } };
        if (active && payload.data?.slugs) {
          setSaved(payload.data.slugs.includes(designSlug));
          setEnabled(true);
        }
      })
      .catch(() => {
        // keep disabled on network error
      });
    return () => {
      active = false;
    };
  }, [designSlug]);

  const toggle = useCallback(async () => {
    if (busy) return;
    setBusy(true);
    const previous = saved;
    setSaved((value) => !value);
    try {
      const res = await fetch("/api/v1/customer/favorites", {
        method: saved ? "DELETE" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ designSlug }),
      });
      if (!res.ok) {
        const payload = (await res.json().catch(() => ({}))) as { error?: { message?: string } };
        throw new Error(payload.error?.message ?? "Gagal menyimpan favorit.");
      }
    } catch (error) {
      setSaved(previous);
      toast.error(error instanceof Error ? error.message : "Gagal menyimpan favorit.");
    } finally {
      setBusy(false);
    }
  }, [busy, saved, designSlug]);

  if (!enabled) return null;

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={busy}
      aria-pressed={saved}
      aria-label={saved ? "Hapus dari favorit" : "Simpan ke favorit"}
      className={cn(
        "pointer-events-auto flex size-8 items-center justify-center rounded-full backdrop-blur-sm transition-all",
        saved
          ? "bg-primary text-white shadow-sm"
          : "bg-black/45 text-white/90 hover:bg-primary hover:text-white",
        className
      )}
    >
      <HeartIcon weight={saved ? "fill" : "regular"} className="size-4" />
    </button>
  );
}
