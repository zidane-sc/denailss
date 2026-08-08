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
  ArrowUpRightIcon,
} from "@phosphor-icons/react/dist/ssr";
import type { Icon } from "@phosphor-icons/react";
import { Reveal, RevealGroup, RevealItem } from "@/components/motion/reveal";
import { imageUrl } from "@/lib/images";
import { formatDuration, formatIDR } from "@/lib/format";
import { SERVICES } from "@/features/services/data/services.mock";
import type { Service, ServiceCategory } from "@/types";

const ICONS: Record<ServiceCategory, Icon> = {
  "gel-extension": SparkleIcon,
  "nail-art": MagicWandIcon,
  "fake-nail": PaintBrushIcon,
  manicure: HeartIcon,
  pedicure: FootprintsIcon,
  removal: EraserIcon,
};

const CATEGORY_LABELS: Record<ServiceCategory, string> = {
  "gel-extension": "Gel Extension",
  "nail-art": "Nail Art",
  "fake-nail": "Press-On",
  manicure: "Manicure",
  pedicure: "Pedicure Spa",
  removal: "Removal",
};

function priceLine(service: Service) {
  const timing =
    service.category === "fake-nail"
      ? "1-2 Hari Pembuatan"
      : formatDuration(service.durationMinutes);
  const price = `Mulai ${formatIDR(service.priceFrom)} · ${timing}`;
  return service.priceNote ? `${price} · estimasi` : price;
}

function PhotoTile({ slug, className }: { slug: string; className: string }) {
  const service = SERVICES.find((s) => s.slug === slug)!;
  return (
    <RevealItem className={className}>
      <Link
        href={`/services/${service.slug}`}
        className="group relative flex h-full flex-col justify-end overflow-hidden rounded-3xl p-5 text-white sm:p-6"
      >
        <Image
          src={imageUrl(service.heroImage)}
          alt={service.name}
          fill
          sizes="(min-width: 1024px) 40rem, 100vw"
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.05]"
        />
        <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent" />

        <span className="absolute right-4 top-4 rounded-full border border-white/25 bg-black/25 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/85 backdrop-blur-sm transition-colors duration-300 group-hover:border-primary/40 group-hover:bg-primary/30">
          {CATEGORY_LABELS[service.category]}
        </span>

        <div className="relative">
          <p className="text-lg font-semibold sm:text-xl">{service.name}</p>
          <p className="mt-1 text-sm font-medium text-white/80 tabular-nums">
            {priceLine(service)}
          </p>
        </div>

        <span className="absolute bottom-5 right-5 flex size-9 translate-y-1 items-center justify-center rounded-full bg-primary text-white opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
          <ArrowUpRightIcon className="size-4" />
        </span>
      </Link>
    </RevealItem>
  );
}

type TileTint = "surface" | "secondary-soft" | "accent-soft";

const TILE_SURFACES: Record<TileTint, string> = {
  surface: "border-border/70 bg-card hover:border-primary/40",
  "secondary-soft": "border-border/60 bg-secondary-soft hover:border-primary/40",
  "accent-soft": "border-border/60 bg-accent-soft hover:border-primary/40",
};

function TintedTile({ slug, tint, className }: { slug: string; tint: TileTint; className?: string }) {
  const service = SERVICES.find((s) => s.slug === slug)!;
  const Icon = ICONS[service.category];
  return (
    <RevealItem className={className}>
      <Link
        href={`/services/${service.slug}`}
        className={`group flex h-full min-h-44 flex-col justify-between rounded-3xl border p-5 transition-all duration-300 hover:-translate-y-1 active:scale-[0.99] sm:min-h-48 sm:p-6 ${
          TILE_SURFACES[tint]
        }`}
      >
        <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-primary/12 text-primary transition-colors duration-300 group-hover:bg-primary group-hover:text-primary-foreground">
          <Icon weight="duotone" className="size-6" />
        </span>
        <div>
          <p className="text-base font-semibold text-foreground">{service.name}</p>
          <p className="mt-1 text-sm text-muted-foreground tabular-nums">{priceLine(service)}</p>
          <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-primary">
            Lihat detail
            <ArrowRightIcon className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
          </span>
        </div>
      </Link>
    </RevealItem>
  );
}

export function ServicesSection() {
  return (
    <section id="layanan" className="relative overflow-hidden bg-background-tint py-16 sm:py-20 lg:py-24">
      <div className="absolute inset-0 -z-10 pattern-hatch opacity-[0.14] [mask-image:linear-gradient(to_bottom,transparent,black_20%,black_80%,transparent)]" />
      <div className="absolute left-[-8rem] top-1/4 -z-10 size-80 rounded-full bg-primary/5 blur-3xl" />

      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal className="flex flex-wrap items-end justify-between gap-4 border-b border-border/60 pb-6 sm:pb-7">
          <div className="max-w-xl">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
              Layanan
            </p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              Pilih layanan, detailnya biar kami yang urus
            </h2>
            <p className="mt-2 text-base text-muted-foreground sm:text-base">
              Dari gel extension sampai pedicure spa, semua dikerjakan satu-satu sesuai requestmu.
            </p>
          </div>
          <Link
            href="/services"
            className="group inline-flex shrink-0 items-center gap-1.5 rounded-full border border-border bg-card px-5 py-2.5 text-sm font-semibold text-foreground transition-colors hover:border-primary hover:text-primary"
          >
            Lihat semua layanan
            <ArrowUpRightIcon className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
        </Reveal>

        <RevealGroup className="mt-8 grid gap-4 sm:grid-cols-3 sm:[grid-template-rows:repeat(2,minmax(11rem,1fr))] lg:grid-cols-12 lg:[grid-template-rows:repeat(2,minmax(14rem,1fr))]">
          <PhotoTile
            slug="gel-extension"
            className="h-64 sm:h-auto sm:col-span-2 sm:row-span-2 lg:col-span-7"
          />
          <TintedTile slug="manicure" tint="surface" className="lg:col-span-5" />
          <TintedTile slug="pedicure" tint="secondary-soft" className="lg:col-span-5" />
        </RevealGroup>

        <RevealGroup className="mt-4 grid gap-4 sm:grid-cols-3">
          <PhotoTile slug="nail-art" className="h-44 sm:h-52" />
          <PhotoTile slug="fake-nail" className="h-44 sm:h-52" />
          <TintedTile slug="removal" tint="accent-soft" className="h-44 sm:h-52" />
        </RevealGroup>
      </div>
    </section>
  );
}