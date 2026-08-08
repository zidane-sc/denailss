"use client";

import Image from "next/image";
import { useState } from "react";
import { CaretLeftIcon, CaretRightIcon } from "@phosphor-icons/react/dist/ssr";
import { aspectRatioClass, imageUrl } from "@/lib/images";
import { cn } from "@/lib/utils";
import type { GalleryAspect } from "@/types";

export function PhotoCarousel({
  seeds,
  aspect,
  alt,
}: {
  seeds: string[];
  aspect: GalleryAspect;
  alt: string;
}) {
  const [active, setActive] = useState(0);
  const photos = seeds.length > 0 ? seeds : ["denailss-fallback"];

  return (
    <div>
      <div className={cn("relative w-full overflow-hidden rounded-[2rem]", aspectRatioClass(aspect))}>
        <Image
          key={photos[active]}
          src={imageUrl(photos[active])}
          alt={`${alt} - foto ${active + 1}`}
          fill
          priority
          sizes="(min-width: 1024px) 34rem, 100vw"
          className="object-cover"
        />
        {photos.length > 1 && (
          <>
            <button
              aria-label="Foto sebelumnya"
              onClick={() => setActive((i) => (i - 1 + photos.length) % photos.length)}
              className="absolute left-3 top-1/2 flex size-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-foreground shadow-md transition-transform hover:scale-105"
            >
              <CaretLeftIcon className="size-4" />
            </button>
            <button
              aria-label="Foto berikutnya"
              onClick={() => setActive((i) => (i + 1) % photos.length)}
              className="absolute right-3 top-1/2 flex size-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-foreground shadow-md transition-transform hover:scale-105"
            >
              <CaretRightIcon className="size-4" />
            </button>
          </>
        )}
      </div>

      {photos.length > 1 && (
        <div className="mt-3 flex gap-2">
          {photos.map((seed, i) => (
            <button
              key={seed}
              onClick={() => setActive(i)}
              aria-label={`Lihat foto ${i + 1}`}
              className={cn(
                "relative size-16 shrink-0 overflow-hidden rounded-xl border-2 transition-colors",
                active === i ? "border-primary" : "border-transparent"
              )}
            >
              <Image src={imageUrl(seed)} alt="" fill sizes="4rem" className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
