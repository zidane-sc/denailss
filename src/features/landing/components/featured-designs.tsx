"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowUpRightIcon } from "@phosphor-icons/react/dist/ssr";
import { Reveal, RevealGroup, RevealItem } from "@/components/motion/reveal";
import { imageUrl } from "@/lib/images";
import { DIFFICULTY_LABELS } from "@/features/gallery/constants";
import { useLiveGalleryDesigns } from "@/features/gallery/components/gallery-designs-provider";
import type { GalleryDesign } from "@/types";

const STYLE_LABELS: Record<GalleryDesign["style"], string> = {
  korean: "Korean Look",
  french: "French Tip",
  chrome: "Chrome",
  ombre: "Ombre",
  "3d-art": "3D Art Nail",
  minimalist: "Minimalis",
};

interface DesignTileProps {
  design: GalleryDesign;
  className?: string;
  aspectClass: string;
  index?: number;
}

function DesignTile({ design, className, aspectClass, index }: DesignTileProps) {
  const label = STYLE_LABELS[design.style] ?? "Nail Art";
  return (
    <RevealItem className={className}>
      <Link
        href={`/gallery/${design.slug}`}
        className="group relative block w-full overflow-hidden rounded-[1.75rem] border border-border/40 bg-card"
      >
        <div className={`relative w-full overflow-hidden ${aspectClass}`}>
          <Image
            src={imageUrl(design.imageSeeds[0] ?? "denailss-fallback")}
            alt={design.title}
            fill
            sizes="(min-width: 1024px) 50vw, (min-width: 640px) 50vw, 90vw"
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06]"
          />

          <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/10 to-black/5" />
          {index !== undefined && (
            <span className="absolute left-4 top-4 text-[11px] font-semibold uppercase tracking-[0.22em] text-white/85 tabular-nums">
              {String(index).padStart(2, "0")}
            </span>
          )}
          <span className="absolute right-4 top-4 rounded-full border border-white/25 bg-black/25 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-white/85 backdrop-blur-sm">
            {label}
          </span>
          <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-4 sm:p-5">
            <div className="min-w-0">
              <span className="mb-1.5 inline-block rounded-full bg-primary px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-white shadow-sm">
                {DIFFICULTY_LABELS[design.difficulty]}
              </span>
              <p className="truncate text-base font-semibold text-white sm:text-lg">{design.title}</p>
            </div>
            <span className="flex size-9 shrink-0 translate-y-1 items-center justify-center rounded-full bg-primary text-white opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
              <ArrowUpRightIcon className="size-4" />
            </span>
          </div>
        </div>
      </Link>
    </RevealItem>
  );
}

export function FeaturedDesigns({ initialDesigns = [] }: { initialDesigns?: GalleryDesign[] }) {
  const designs = useLiveGalleryDesigns();
  const featured = (designs.length > 0 ? designs : initialDesigns).slice(0, 6);

  if (featured.length === 0) {
    return null;
  }

  const [hero, ...rest] = featured;

  return (
    <section className="relative overflow-hidden py-16 sm:py-20 lg:py-24">
      <div className="absolute inset-0 -z-10 pattern-hatch opacity-[0.16] [mask-image:linear-gradient(to_bottom,transparent,black_25%,black_75%,transparent)]" />
      <div className="absolute right-[-8rem] top-1/3 -z-10 size-96 rounded-full bg-primary/5 blur-3xl" />

      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal className="flex flex-wrap items-end justify-between gap-4 border-b border-border/60 pb-6 sm:pb-7">
          <div className="max-w-xl">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
              Pilihan editor
            </p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              Desain yang lagi banyak dipakai
            </h2>
            <p className="mt-3 text-base text-muted-foreground sm:text-base">
              Kumpulan hasil kuku favorit pelanggan — dari tren Korea sampai aksen 3D, semuanya
              dikerjakan satu-satu.
            </p>
          </div>
          <Link
            href="/gallery"
            className="group inline-flex shrink-0 items-center gap-1.5 rounded-full border border-border bg-card px-5 py-2.5 text-sm font-semibold text-foreground transition-colors hover:border-primary hover:text-primary"
          >
            Lihat semua desain
            <ArrowUpRightIcon className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
        </Reveal>

        <RevealGroup className="mt-8 grid gap-4 sm:mt-10 sm:grid-cols-2 lg:grid-cols-12 lg:gap-5">
          <DesignTile
            design={hero}
            className="sm:col-span-2 lg:col-span-8"
            aspectClass="aspect-[4/3] sm:aspect-[2/1]"
          />
          <DesignTile
            design={rest[0]}
            index={2}
            className="lg:col-span-4"
            aspectClass="aspect-square"
          />
          <DesignTile design={rest[1]} index={3} className="lg:col-span-3" aspectClass="aspect-[4/3]" />
          <DesignTile design={rest[2]} index={4} className="lg:col-span-3" aspectClass="aspect-[4/3]" />
          <DesignTile design={rest[3]} index={5} className="lg:col-span-3" aspectClass="aspect-[4/3]" />
          <DesignTile design={rest[4]} index={6} className="sm:col-span-2 lg:col-span-3" aspectClass="aspect-[4/3]" />
        </RevealGroup>
      </div>
    </section>
  );
}