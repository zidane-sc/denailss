import Image from "next/image";
import Link from "next/link";
import { ArrowRightIcon } from "@phosphor-icons/react/dist/ssr";
import { Reveal } from "@/components/motion/reveal";
import { aspectRatioClass, picsumUrl } from "@/lib/images";
import { GALLERY_DESIGNS } from "@/features/gallery/data/designs.mock";

export function FeaturedDesigns() {
  const featured = [...GALLERY_DESIGNS]
    .sort((a, b) => (a.publishedAt < b.publishedAt ? 1 : -1))
    .slice(0, 8);

  return (
    <section className="py-16 sm:py-20 lg:py-24">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Gallery</p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              Desain terbaru dari studio kami
            </h2>
          </div>
          <Link
            href="/gallery"
            className="flex items-center gap-1.5 text-sm font-semibold text-primary underline-offset-4 hover:underline"
          >
            Lihat semua desain
            <ArrowRightIcon className="size-4" />
          </Link>
        </Reveal>
      </div>

      <Reveal delay={0.08} className="mt-8">
        <div className="no-scrollbar flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 sm:px-6 lg:px-8">
          {featured.map((design) => (
            <Link
              key={design.id}
              href={`/gallery/${design.slug}`}
              className="group relative shrink-0 snap-start overflow-hidden rounded-3xl"
              style={{ width: design.aspect === "portrait" || design.aspect === "tall" ? "15rem" : "19rem" }}
            >
              <div className={`relative w-full ${aspectRatioClass(design.aspect)}`}>
                <Image
                  src={picsumUrl(design.imageSeeds[0], design.aspect, 1)}
                  alt={design.title}
                  fill
                  sizes="19rem"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/0 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                <p className="absolute bottom-3 left-3 text-sm font-medium text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  {design.title}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </Reveal>
    </section>
  );
}
