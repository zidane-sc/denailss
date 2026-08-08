import Image from "next/image";
import Link from "next/link";
import {
  SparkleIcon,
  MagicWandIcon,
  PaintBrushIcon,
  HeartIcon,
  FootprintsIcon,
  EraserIcon,
  ArrowRightIcon,
} from "@phosphor-icons/react/dist/ssr";
import type { Icon } from "@phosphor-icons/react";
import { Reveal, RevealGroup, RevealItem } from "@/components/motion/reveal";
import { picsumUrl } from "@/lib/images";
import { formatDuration, formatIDR } from "@/lib/format";
import { SERVICES } from "@/features/services/data/services.mock";
import type { ServiceCategory } from "@/types";

const ICONS: Record<ServiceCategory, Icon> = {
  "gel-extension": SparkleIcon,
  "nail-art": MagicWandIcon,
  "fake-nail": PaintBrushIcon,
  manicure: HeartIcon,
  pedicure: FootprintsIcon,
  removal: EraserIcon,
};

function PhotoTile({ slug, className }: { slug: string; className: string }) {
  const service = SERVICES.find((s) => s.slug === slug)!;
  return (
    <RevealItem className={className}>
      <Link
        href={`/services/${service.slug}`}
        className="group relative flex h-full flex-col justify-end overflow-hidden rounded-3xl p-5 text-white sm:p-6"
      >
        <Image
          src={picsumUrl(service.heroImage, "landscape", 1.1)}
          alt={service.name}
          fill
          sizes="(min-width: 1024px) 40rem, 100vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
        <div className="relative">
          <p className="text-lg font-semibold sm:text-xl">{service.name}</p>
          <p className="mt-1 text-sm text-white/85">
            Mulai {formatIDR(service.priceFrom)} · {formatDuration(service.durationMinutes)}
          </p>
        </div>
      </Link>
    </RevealItem>
  );
}

function TintedTile({ slug, tint }: { slug: string; tint: "muted" | "secondary-soft" }) {
  const service = SERVICES.find((s) => s.slug === slug)!;
  const Icon = ICONS[service.category];
  return (
    <RevealItem>
      <Link
        href={`/services/${service.slug}`}
        className={`group flex h-full min-h-44 flex-col justify-between rounded-3xl p-5 transition-colors sm:min-h-48 sm:p-6 ${
          tint === "muted" ? "bg-muted" : "bg-secondary-soft"
        }`}
      >
        <Icon weight="duotone" className="size-7 text-primary" />
        <div>
          <p className="text-base font-semibold text-foreground">{service.name}</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Mulai {formatIDR(service.priceFrom)} · {formatDuration(service.durationMinutes)}
          </p>
          <span className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100">
            Lihat detail <ArrowRightIcon className="size-3.5" />
          </span>
        </div>
      </Link>
    </RevealItem>
  );
}

export function ServicesSection() {
  return (
    <section id="layanan" className="bg-background-tint py-16 sm:py-20 lg:py-24">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal className="max-w-lg">
          <h2 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Layanan yang bisa kamu pilih
          </h2>
          <p className="mt-3 text-base text-muted-foreground">
            Dari gel extension sampai pedicure spa, semua dikerjakan satu-satu dengan detail.
          </p>
        </Reveal>

        <RevealGroup className="mt-8 grid gap-4 sm:grid-cols-3 sm:[grid-template-rows:repeat(2,minmax(11rem,1fr))]">
          <PhotoTile slug="gel-extension" className="sm:col-span-2 sm:row-span-2" />
          <TintedTile slug="manicure" tint="muted" />
          <TintedTile slug="pedicure" tint="secondary-soft" />
        </RevealGroup>

        <RevealGroup className="mt-4 grid gap-4 sm:grid-cols-3">
          <PhotoTile slug="nail-art" className="h-44 sm:h-48" />
          <PhotoTile slug="fake-nail" className="h-44 sm:h-48" />
          <TintedTile slug="removal" tint="muted" />
        </RevealGroup>
      </div>
    </section>
  );
}
