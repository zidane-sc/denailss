"use client";

import Link from "next/link";
import { ArrowRightIcon } from "@phosphor-icons/react/dist/ssr";
import { PhotoCarousel } from "@/features/gallery/components/photo-carousel";
import { GalleryCard } from "@/features/gallery/components/gallery-card";
import { useLiveGalleryDesigns } from "@/features/gallery/components/gallery-designs-provider";
import {
  COLOR_LABELS,
  DIFFICULTY_LABELS,
  OCCASION_LABELS,
  SHAPE_LABELS,
  STYLE_LABELS,
} from "@/features/gallery/constants";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatIDR } from "@/lib/format";
import { JsonLdScript, designBreadcrumbJsonLd } from "@/lib/seo";

/**
 * Gallery design detail — reads the LIVE admin catalog (seed + uploaded
 * designs from the owner's backoffice) via the provider, so a design created
 * in `/backoffice/gallery` gets a real detail page (previously seed-only
 * designs had one and uploaded ones 404'd).
 */
export function DesignDetailView({ slug }: { slug: string }) {
  const designs = useLiveGalleryDesigns();
  const design = designs.find((d) => d.slug === slug);

  if (!design) {
    return (
      <div className="mx-auto w-full max-w-7xl px-4 py-24 text-center sm:px-6">
        <p className="font-heading text-2xl font-semibold text-foreground">
          Desain tidak ditemukan.
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          Desain mungkin sudah dihapus dari katalog.
        </p>
        <Button
          className="mt-6 rounded-full"
          nativeButton={false}
          render={<Link href="/gallery" />}
        >
          Kembali ke Gallery
        </Button>
      </div>
    );
  }

  const relatedDesigns = designs
    .filter(
      (d) =>
        d.id !== design.id &&
        (d.style === design.style ||
          d.occasion === design.occasion ||
          d.color === design.color)
    )
    .slice(0, 4);

  const bookingHref = `/booking?design=${design.slug}`;

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
      <JsonLdScript data={designBreadcrumbJsonLd(design.slug, design.title)} />
      <Link href="/gallery" className="text-sm font-medium text-muted-foreground hover:text-primary">
        &larr; Kembali ke Gallery
      </Link>

      <div className="mt-6 grid gap-10 lg:grid-cols-[1.05fr_1fr] lg:gap-14">
        <PhotoCarousel seeds={design.imageSeeds} aspect={design.aspect} alt={design.title} />

        <div>
          <div className="flex flex-wrap gap-1.5">
            <Badge className="bg-muted text-foreground/80">{STYLE_LABELS[design.style]}</Badge>
            <Badge className="bg-muted text-foreground/80">{COLOR_LABELS[design.color]}</Badge>
            <Badge className="bg-muted text-foreground/80">{OCCASION_LABELS[design.occasion]}</Badge>
            <Badge className="bg-muted text-foreground/80">{SHAPE_LABELS[design.shape]}</Badge>
            <Badge className="bg-primary/10 text-primary">{DIFFICULTY_LABELS[design.difficulty]}</Badge>
          </div>

          <h1 className="mt-4 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            {design.title}
          </h1>
          <p className="mt-3 text-base leading-relaxed text-muted-foreground">{design.description}</p>

          <div className="mt-5 flex items-baseline gap-2">
            <span className="text-2xl font-semibold text-primary">{formatIDR(design.price)}</span>
            <span className="text-xs text-muted-foreground">per set, 10 jari</span>
          </div>

          <Button size="lg" className="mt-6 h-12 w-full rounded-full text-base sm:w-auto sm:px-8" render={<Link href={bookingHref} />} nativeButton={false}>
            Booking Desain Ini
            <ArrowRightIcon className="size-4" />
          </Button>
        </div>
      </div>

      {relatedDesigns.length > 0 && (
        <div className="mt-16">
          <h2 className="text-2xl font-semibold tracking-tight text-foreground">Desain serupa</h2>
          <div className="no-scrollbar mt-5 flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2">
            {relatedDesigns.map((related) => (
              <div key={related.id} className="w-56 shrink-0 snap-start sm:w-64">
                <GalleryCard design={related} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
