import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import {
  SparkleIcon,
  MagicWandIcon,
  PaintBrushIcon,
  HeartIcon,
  FootprintsIcon,
  EraserIcon,
  ArrowRightIcon,
  ClockIcon,
} from "@phosphor-icons/react/dist/ssr";
import type { Icon } from "@phosphor-icons/react";
import { SERVICES } from "@/features/services/data/services.mock";
import { formatDuration, formatIDR } from "@/lib/format";
import { imageUrl } from "@/lib/images";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { ServiceCategory } from "@/types";

export const metadata: Metadata = {
  title: "Layanan Treatment & Kuku Palsu | Denailss",
  description:
    "Pilihan lengkap layanan manicure, pedicure, gel extension, nail art, removal, dan custom press-on kuku palsu berkualitas premium di Denailss.",
};

const ICONS: Record<ServiceCategory, Icon> = {
  "gel-extension": SparkleIcon,
  "nail-art": MagicWandIcon,
  "fake-nail": PaintBrushIcon,
  manicure: HeartIcon,
  pedicure: FootprintsIcon,
  removal: EraserIcon,
};

export default function ServicesPage() {
  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
      {/* Header */}
      <div className="max-w-2xl text-left border-l-4 border-primary pl-4 sm:pl-5">
        <h1 className="font-heading text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Menu Layanan &amp; Treatment
        </h1>
        <p className="mt-3 text-base leading-relaxed text-muted-foreground">
          Kami menghadirkan pilihan treatment kuku terlengkap dengan standar sanitasi tinggi, dikerjakan secara presisi oleh nail artist berpengalaman menggunakan produk premium berkualitas tinggi.
        </p>
      </div>

      {/* Services Grid */}
      <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {SERVICES.map((service) => {
          const Icon = ICONS[service.category];
          const isFakeNail = service.category === "fake-nail";

          return (
            <div
              key={service.id}
              className="group flex flex-col justify-between overflow-hidden rounded-3xl border border-border bg-card p-5 transition-all duration-300 hover:border-primary/40 hover:shadow-md"
            >
              <div>
                {/* Hero Photo */}
                <div className="relative aspect-[16/10] w-full overflow-hidden rounded-2xl bg-muted">
                  <Image
                    src={imageUrl(service.heroImage)}
                    alt={service.name}
                    fill
                    sizes="(min-width: 1024px) 24rem, (min-width: 640px) 45vw, 95vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  {service.depositApplicable && (
                    <Badge className="absolute right-3 top-3 bg-secondary-soft text-secondary-foreground border-secondary/20 shadow-xs">
                      Perlu Deposit
                    </Badge>
                  )}
                </div>

                {/* Title & Icon */}
                <div className="mt-5 flex items-center gap-3">
                  <span className="flex size-9 items-center justify-center rounded-xl bg-primary-foreground text-primary border border-primary/10">
                    <Icon className="size-4.5" weight="duotone" />
                  </span>
                  <h2 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors">
                    {service.name}
                  </h2>
                </div>

                {/* Short Description */}
                <p className="mt-3 text-xs leading-relaxed text-muted-foreground min-h-[48px]">
                  {service.shortDescription}
                </p>

                {/* Price & Duration details */}
                <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-border/40 pt-4 text-xs">
                  <div>
                    <span className="text-[10px] text-muted-foreground uppercase tracking-wider block font-medium">Harga Mulai</span>
                    <span className="text-sm font-bold text-foreground">{formatIDR(service.priceFrom)}</span>
                  </div>
                  <div className="ml-auto flex items-center gap-1.5 rounded-full bg-muted/60 px-3 py-1.5 font-medium text-foreground/80">
                    {isFakeNail ? (
                      <>
                        <span className="text-[11px]">📦</span>
                        <span>1-2 Hari Pembuatan</span>
                      </>
                    ) : (
                      <>
                        <ClockIcon className="size-3.5 text-muted-foreground" />
                        <span>{formatDuration(service.durationMinutes)}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 rounded-xl h-9"
                  nativeButton={false}
                  render={<Link href={`/services/${service.slug}`} />}
                >
                  Detail
                </Button>
                <Button
                  size="sm"
                  className="flex-1 rounded-xl h-9 gap-1"
                  nativeButton={false}
                  render={<Link href={`/booking?service=${service.slug}`} />}
                >
                  Booking
                  <ArrowRightIcon className="size-3.5" />
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
