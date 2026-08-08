import Image from "next/image";
import Link from "next/link";
import { aspectRatioClass, imageUrl } from "@/lib/images";
import type { GalleryDesign } from "@/types";

export function GalleryCard({ design }: { design: GalleryDesign }) {
  return (
    <Link
      href={`/gallery/${design.slug}`}
      className="group mb-4 block break-inside-avoid overflow-hidden rounded-3xl"
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
      </div>
    </Link>
  );
}
