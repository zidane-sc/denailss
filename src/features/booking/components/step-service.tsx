"use client";

import Image from "next/image";
import { CheckCircleIcon } from "@phosphor-icons/react/dist/ssr";
import { useLiveServices } from "@/features/services/components/services-provider";
import { NAIL_ART_SLUG } from "@/features/booking/logic/free-addon";
import { formatIDR, formatDuration } from "@/lib/format";
import { imageUrl } from "@/lib/images";
import { cn } from "@/lib/utils";
import type { BodyPart } from "@/types";

const BODY_PART_OPTIONS: { key: BodyPart; label: string; freebie: string }[] = [
  { key: "hand", label: "Tangan", freebie: "Gratis Manicure" },
  { key: "foot", label: "Kaki", freebie: "Gratis Pedicure" },
];

export function StepService({
  selectedSlugs,
  tierByServiceSlug,
  bodyPartByServiceSlug,
  onToggle,
  onSelectTier,
  onSelectBodyPart,
}: {
  selectedSlugs: string[];
  tierByServiceSlug: Record<string, string>;
  bodyPartByServiceSlug: Record<string, BodyPart>;
  onToggle: (slug: string) => void;
  onSelectTier: (slug: string, tierKey: string) => void;
  onSelectBodyPart: (slug: string, bodyPart: BodyPart) => void;
}) {
  const activeServices = useLiveServices().filter((s) => s.active);
  return (
    <div>
      <h2 className="text-2xl font-semibold tracking-tight text-foreground">Pilih Layanan</h2>
      <p className="mt-1.5 text-sm text-muted-foreground">
        Pilih satu atau lebih layanan yang ingin kamu booking hari ini.
      </p>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {activeServices.map((service) => {
          const active = selectedSlugs.includes(service.slug);
          const isTiered = service.tiers.length > 0;
          const activeTierKey =
            tierByServiceSlug[service.slug] ?? service.tiers[0]?.key ?? "";
          return (
            <div
              key={service.slug}
              className={cn(
                "rounded-2xl border-2 bg-card p-3 transition-colors",
                active ? "border-primary" : "border-border"
              )}
            >
              <button
                type="button"
                onClick={() => onToggle(service.slug)}
                className="flex w-full items-center gap-3 text-left"
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
                  {!isTiered && service.priceNote && (
                    <p className="mt-0.5 text-[11px] leading-snug text-muted-foreground/80">
                      {service.priceNote}
                    </p>
                  )}
                </div>
                {active && (
                  <CheckCircleIcon weight="fill" className="size-5 shrink-0 text-primary" />
                )}
              </button>

              {active && isTiered && (
                <div className="mt-3 grid grid-cols-2 gap-1.5 border-t border-border/50 pt-3">
                  {service.tiers.map((tier) => {
                    const selected = tier.key === activeTierKey;
                    return (
                      <button
                        key={tier.key}
                        type="button"
                        aria-pressed={selected}
                        onClick={() => onSelectTier(service.slug, tier.key)}
                        className={cn(
                          "flex flex-col items-start gap-0.5 rounded-xl border px-3 py-2 text-left transition-colors",
                          selected
                            ? "border-primary bg-primary/5"
                            : "border-border bg-background/40 hover:border-primary/40"
                        )}
                      >
                        <span
                          className={cn(
                            "text-xs font-semibold",
                            selected ? "text-primary" : "text-foreground"
                          )}
                        >
                          {tier.label}
                        </span>
                        <span className="text-[11px] text-muted-foreground">
                          {formatIDR(tier.priceFrom)} · {formatDuration(tier.durationMinutes)}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}

              {active && service.slug === NAIL_ART_SLUG && (
                <div className="mt-3 border-t border-border/50 pt-3">
                  <p className="text-xs font-semibold text-foreground">Pilih bagian tubuh</p>
                  <div className="mt-2 grid grid-cols-2 gap-1.5">
                    {BODY_PART_OPTIONS.map((option) => {
                      const selected = bodyPartByServiceSlug[service.slug] === option.key;
                      return (
                        <button
                          key={option.key}
                          type="button"
                          aria-pressed={selected}
                          onClick={() => onSelectBodyPart(service.slug, option.key)}
                          className={cn(
                            "flex flex-col items-start gap-0.5 rounded-xl border px-3 py-2 text-left transition-colors",
                            selected
                              ? "border-primary bg-primary/5"
                              : "border-border bg-background/40 hover:border-primary/40"
                          )}
                        >
                          <span
                            className={cn(
                              "text-xs font-semibold",
                              selected ? "text-primary" : "text-foreground"
                            )}
                          >
                            {option.label}
                          </span>
                          <span className="text-[11px] text-muted-foreground">{option.freebie}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
