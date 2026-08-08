"use client";

import Image from "next/image";
import { CheckCircleIcon } from "@phosphor-icons/react/dist/ssr";
import { GALLERY_DESIGNS } from "@/features/gallery/data/designs.mock";
import { aspectRatioClass, picsumUrl } from "@/lib/images";
import { formatIDR } from "@/lib/format";
import { cn } from "@/lib/utils";

export function StepDesign({
  serviceSlug,
  selectedSlug,
  onSelect,
}: {
  serviceSlug: string | null;
  selectedSlug: string | null;
  onSelect: (slug: string | null) => void;
}) {
  const designs = serviceSlug
    ? GALLERY_DESIGNS.filter((design) => design.relatedServiceSlugs.includes(serviceSlug))
    : GALLERY_DESIGNS;

  return (
    <div>
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-foreground">
            Pilih Desain <span className="text-base font-normal text-muted-foreground">(opsional)</span>
          </h2>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Kasih tau nail artist desain seperti apa yang kamu mau, atau lewati langkah ini.
          </p>
        </div>
        {selectedSlug && (
          <button
            type="button"
            onClick={() => onSelect(null)}
            className="text-sm font-semibold text-primary underline-offset-4 hover:underline"
          >
            Hapus pilihan
          </button>
        )}
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {designs.map((design) => {
          const active = selectedSlug === design.slug;
          return (
            <button
              key={design.id}
              type="button"
              onClick={() => onSelect(active ? null : design.slug)}
              className={cn(
                "group relative overflow-hidden rounded-2xl border-2 transition-colors",
                active ? "border-primary" : "border-transparent"
              )}
            >
              <div className={cn("relative w-full", aspectRatioClass(design.aspect))}>
                <Image
                  src={picsumUrl(design.imageSeeds[0], design.aspect, 0.7)}
                  alt={design.title}
                  fill
                  sizes="16rem"
                  className="object-cover"
                />
                <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/70 via-black/10 to-transparent p-2.5">
                  <p className="text-xs font-semibold text-white">{design.title}</p>
                  <p className="text-[11px] text-white/85">Mulai {formatIDR(design.priceFrom)}</p>
                </div>
                {active && (
                  <span className="absolute right-2 top-2 flex size-6 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    <CheckCircleIcon weight="fill" className="size-4" />
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
