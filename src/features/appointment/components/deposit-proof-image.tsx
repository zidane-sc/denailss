"use client";

import { useEffect, useState } from "react";
import { imageUrl } from "@/lib/images";

export function DepositProofImage({ reference }: { reference: string }) {
  const [src, setSrc] = useState<string | null>(reference.startsWith("storage:deposit-proofs/") ? null : imageUrl(reference));

  useEffect(() => {
    if (!reference.startsWith("storage:deposit-proofs/")) return;
    fetch("/api/v1/bookings/deposit-proof/url", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reference }),
    })
      .then(async (response) => {
        if (!response.ok) return;
        const payload = (await response.json()) as { data?: { url?: string } };
        setSrc(payload.data?.url ?? null);
      })
      .catch(() => setSrc(null));
  }, [reference]);

  if (!src) return <p className="text-xs text-muted-foreground">Bukti transfer sedang dimuat...</p>;
  // Signed storage URLs can't go through the image optimizer; lazy-load instead.
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt="Bukti Transfer"
      loading="lazy"
      decoding="async"
      className="h-full w-full cursor-zoom-in object-cover"
      onClick={() => window.open(src, "_blank")}
    />
  );
}
