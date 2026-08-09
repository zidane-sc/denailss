"use client";

import Image from "next/image";
import { CheckCircleIcon } from "@phosphor-icons/react/dist/ssr";
import { getActiveServices } from "@/features/services/data/services-admin.mock";
import { formatIDR, formatDuration } from "@/lib/format";
import { imageUrl } from "@/lib/images";
import { cn } from "@/lib/utils";

export function StepService({
  selectedSlugs,
  onToggle,
}: {
  selectedSlugs: string[];
  onToggle: (slug: string) => void;
}) {
  return (
    <div>
      <h2 className="text-2xl font-semibold tracking-tight text-foreground">Pilih Layanan</h2>
      <p className="mt-1.5 text-sm text-muted-foreground">
        Pilih satu atau lebih layanan yang ingin kamu booking hari ini.
      </p>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {getActiveServices().map((service) => {
          const active = selectedSlugs.includes(service.slug);
          const isTiered = service.tiers.length > 0;
          return (
            <button
              key={service.slug}
              type="button"
              onClick={() => onToggle(service.slug)}
              className={cn(
                "flex items-center gap-3 rounded-2xl border-2 bg-card p-3 text-left transition-colors",
                active ? "border-primary" : "border-border hover:border-primary/40"
              )}
            >
              <div className="relative size-16 shrink-0 overflow-hidden rounded-xl">
                <Image
                  src={imageUrl(service.heroImage)}
                  alt={service.name}
                  fill
                  sizes="4rem"
                  className="object-cover"
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-foreground">{service.name}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {isTiered ? (
                    <>Mulai {formatIDR(service.priceFrom)} &middot; sesuai tingkat kesulitan</>
                  ) : (
                    <>
                      Mulai {formatIDR(service.priceFrom)} &middot;{" "}
                      {service.requiresPickup
                        ? "1-2 Hari Pembuatan"
                        : formatDuration(service.durationMinutes)}
                    </>
                  )}
                </p>
                {isTiered && (
                  <p className="mt-0.5 text-[11px] text-muted-foreground/80">
                    {service.tiers.map((t) => `${t.label} ${formatIDR(t.priceFrom)}`).join(" · ")}
                  </p>
                )}
                {service.priceNote && (
                  <p className="mt-0.5 text-[11px] leading-snug text-muted-foreground/80">
                    {service.priceNote}
                  </p>
                )}
              </div>
              {active && <CheckCircleIcon weight="fill" className="size-5 shrink-0 text-primary" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}
