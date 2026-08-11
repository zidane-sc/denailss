"use client";

import Image from "next/image";
import { imageUrl } from "@/lib/images";
import { useLiveGalleryDesigns } from "@/features/gallery/components/gallery-designs-provider";
import type { DesignPopularityItem } from "../logic/analytics";
import type { RankedItem } from "../types";

/**
 * Popular services — a plain horizontal ranking with relative bars, no card
 * chrome. Answers "which treatments do customers actually book?".
 */
export function PopularServicesList({ items }: { items: RankedItem[] }) {
  const max = Math.max(1, ...items.map((i) => i.count));
  return (
    <ol className="space-y-3">
      {items.map((item, idx) => (
        <li key={item.key} className="flex min-w-0 items-center gap-3">
          <span className="w-5 shrink-0 font-heading text-sm font-semibold text-muted-foreground tabular-nums">
            {idx + 1}
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex min-w-0 items-baseline justify-between gap-3">
              <p className="min-w-0 truncate text-sm font-medium text-foreground/90">{item.label}</p>
              <p className="shrink-0 text-sm font-semibold text-foreground/90 tabular-nums">
                {item.count}
                <span className="ml-1 text-xs font-medium text-muted-foreground">booking</span>
              </p>
            </div>
            <div
              role="img"
              aria-label={`${item.label}: ${item.count} booking (${Math.round((item.count / max) * 100)}% dari layanan terlaris)`}
              className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-muted"
            >
              <div
                className="h-full rounded-full bg-primary"
                style={{ width: `${(item.count / max) * 100}%` }}
              />
            </div>
          </div>
        </li>
      ))}
    </ol>
  );
}

/**
 * Popular designs — the one place analytics shows photos, because nail art is
 * a visual business. Ranked list with the live gallery thumbnail; designs that
 * don't resolve through the catalog render without a visual.
 */
export function PopularDesignsList({ items }: { items: DesignPopularityItem[] }) {
  const designs = useLiveGalleryDesigns();
  return (
    <ol className="space-y-3">
      {items.map((item, idx) => {
        const design = designs.find((d) => d.slug === item.slug);
        const src = design ? imageUrl(design.imageSeeds[0] ?? "denailss-fallback") : null;
        return (
          <li key={item.slug} className="flex items-center gap-3">
            <span className="w-5 shrink-0 font-heading text-sm font-semibold text-muted-foreground tabular-nums">
              {idx + 1}
            </span>
            {src ? (
              <Image
                src={src}
                alt={design?.title ?? item.title}
                width={48}
                height={48}
                className="size-11 shrink-0 rounded-xl object-cover"
              />
            ) : (
              <span className="size-11 shrink-0 rounded-xl bg-muted" aria-hidden="true" />
            )}
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-foreground/90">
                {design?.title ?? item.title}
              </p>
              <p className="text-xs text-muted-foreground">
                {item.count} booking
              </p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

/** Peak booking time — the three time-of-day groups with relative bars. */
export function PeakBookingTimes({
  groups,
  mostPopularSlot,
}: {
  groups: RankedItem[];
  mostPopularSlot: string | null;
}) {
  const max = Math.max(1, ...groups.map((g) => g.count));
  return (
    <div>
      <ol className="space-y-3">
        {groups.map((group) => (
          <li key={group.key} className="flex min-w-0 items-center gap-3">
            <span className="w-14 shrink-0 text-sm font-medium text-foreground/90">
              {group.label}
            </span>
            <div className="h-2 min-w-0 flex-1 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-accent"
                style={{ width: `${(group.count / max) * 100}%` }}
              />
            </div>
            <span className="w-8 shrink-0 text-right text-sm font-semibold text-foreground/90 tabular-nums">
              {group.count}
            </span>
          </li>
        ))}
      </ol>

      {mostPopularSlot && (
        <div className="mt-5 border-t border-border/70 pt-4">
          <p className="text-xs font-medium text-muted-foreground">Jam paling ramai</p>
          <p className="mt-1 font-heading text-2xl font-semibold tracking-tight text-foreground/90">
            {mostPopularSlot}
          </p>
          <p className="mt-0.5 text-[11px] text-muted-foreground">
            Slot booking yang paling sering dipilih
          </p>
        </div>
      )}
    </div>
  );
}
