"use client";

import Image from "next/image";
import Link from "next/link";
import { aspectRatioClass, imageUrl } from "@/lib/images";
import { formatIDR } from "@/lib/format";
import { DIFFICULTY_LABELS } from "@/features/gallery/constants";
import { FavoriteButton } from "@/features/customer/components/favorite-button";
import type { GalleryDesign } from "@/types";

export function GalleryCard({ design }: { design: GalleryDesign }) {
  return (
    <div className="group relative mb-4 block break-inside-avoid overflow-hidden rounded-3xl">
      <Link
        href={`/gallery/${design.slug}`}
        className="group block"
      >
        <div className={`relative w-full ${aspectRatioClass(design.aspect)}`}>
          <Image
            src={imageUrl(design.imageSeeds[0])}
            alt={design.title}
            fill
            sizes="(min-width: 1024px) 24rem, (min-width: 640px) 40vw, 90vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/70 via-black/0 to-transparent p-4 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            <p className="text-sm font-semibold text-white">{design.title}</p>
            <span className="mt-2 inline-flex w-fit items-center rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-primary">
              Lihat Desain
            </span>
          </div>
          <span className="absolute left-3 top-3 rounded-full bg-black/45 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-white/90 backdrop-blur-sm">
            {formatIDR(design.price)}
          </span>
          <span className="absolute right-3 top-3 rounded-full bg-black/45 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-white/90 backdrop-blur-sm">
            {DIFFICULTY_LABELS[design.difficulty]}
          </span>
        </div>
      </Link>
      <FavoriteButton
        designSlug={design.slug}
        className="absolute bottom-3 right-3 z-10"
      />
    </div>
  );
}
