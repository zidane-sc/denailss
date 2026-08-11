"use client";

import { useEffect, useState } from "react";
import { StorefrontIcon, PackageIcon, CheckCircleIcon } from "@phosphor-icons/react/dist/ssr";
import { SITE } from "@/constants/site";
import type { Settings } from "@/features/settings/types";
import { cn } from "@/lib/utils";
import type { FulfillmentMethod } from "@/features/booking/types";

export function StepPickup({
  value,
  onSelect,
}: {
  value: FulfillmentMethod | null;
  onSelect: (method: FulfillmentMethod) => void;
}) {
  const [address, setAddress] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/v1/settings", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .then((payload: { data?: Settings } | null) => {
        if (payload?.data?.businessProfile?.address) {
          setAddress(payload.data.businessProfile.address);
        }
      })
      .catch(() => {
        // keep the SITE fallback
      });
  }, []);

  const pickupAddress = address ?? SITE.address;

  const OPTIONS: {
    value: FulfillmentMethod;
    title: string;
    description: string;
    icon: typeof StorefrontIcon;
  }[] = [
    {
      value: "pickup",
      title: "Ambil di Lokasi",
      description: `Ambil langsung di ${pickupAddress}. Siap dalam 1-2 hari.`,
      icon: StorefrontIcon,
    },
    {
      value: "delivery",
      title: "Dikirim via Kurir",
      description: "Dikirim ke alamatmu (ongkir sesuai ekspedisi, dikonfirmasi via WhatsApp).",
      icon: PackageIcon,
    },
  ];

  return (
    <div>
      <h2 className="text-2xl font-semibold tracking-tight text-foreground">
        Cara Pengambilan <span className="text-base font-normal text-muted-foreground">(kuku palsu)</span>
      </h2>
      <p className="mt-1.5 text-sm text-muted-foreground">
        Press-on dibuat custom sesuai ukuran kukumu — mau diambil langsung atau dikirim?
      </p>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {OPTIONS.map((option) => {
          const active = value === option.value;
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onSelect(option.value)}
              className={cn(
                "flex flex-col items-start gap-3 rounded-2xl border-2 bg-card p-5 text-left transition-colors",
                active ? "border-primary" : "border-border hover:border-primary/40"
              )}
            >
              <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <option.icon weight="duotone" className="size-6" />
              </span>
              <span>
                <span className="block text-sm font-semibold text-foreground">{option.title}</span>
                <span className="mt-1 block text-xs leading-relaxed text-muted-foreground">
                  {option.description}
                </span>
              </span>
              {active && <CheckCircleIcon weight="fill" className="absolute right-4 top-4 size-5 text-primary" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}