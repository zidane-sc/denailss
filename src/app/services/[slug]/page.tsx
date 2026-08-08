import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArrowRightIcon, ClockIcon } from "@phosphor-icons/react/dist/ssr";
import { SERVICES, getServiceBySlug } from "@/features/services/data/services.mock";
import { GALLERY_DESIGNS } from "@/features/gallery/data/designs.mock";
import { GalleryCard } from "@/features/gallery/components/gallery-card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { formatDuration, formatIDR } from "@/lib/format";
import { picsumUrl } from "@/lib/images";

export function generateStaticParams() {
  return SERVICES.map((service) => ({ slug: service.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/services/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const service = getServiceBySlug(slug);
  if (!service) return {};
  return { title: service.name, description: service.shortDescription };
}

export default async function ServiceDetailPage({ params }: PageProps<"/services/[slug]">) {
  const { slug } = await params;
  const service = getServiceBySlug(slug);
  if (!service) notFound();

  const relatedDesigns = GALLERY_DESIGNS.filter((design) =>
    design.relatedServiceSlugs.includes(service.slug)
  ).slice(0, 6);

  const bookingHref = `/booking?service=${service.slug}`;

  return (
    <div>
      <div className="mx-auto w-full max-w-7xl px-4 pt-8 sm:px-6 lg:px-8">
        <Link href="/services" className="text-sm font-medium text-muted-foreground hover:text-primary">
          &larr; Kembali ke Layanan
        </Link>
      </div>

      <div className="mx-auto mt-6 grid w-full max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[1fr_0.95fr] lg:items-center lg:gap-14 lg:px-8">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            {service.name}
          </h1>
          <p className="mt-3 text-base leading-relaxed text-muted-foreground sm:text-lg">
            {service.description}
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-4">
            <p className="text-2xl font-semibold text-primary">{formatIDR(service.priceFrom)}</p>
            <span className="flex items-center gap-1.5 rounded-full bg-muted px-3 py-1.5 text-sm text-foreground/80">
              {service.category === "fake-nail" ? (
                <>
                  <span className="text-xs">📦</span>
                  <span>Estimasi 1-2 Hari Pembuatan</span>
                </>
              ) : (
                <>
                  <ClockIcon className="size-4" />
                  <span>{formatDuration(service.durationMinutes)}</span>
                </>
              )}
            </span>
            {service.depositApplicable && (
              <span className="rounded-full bg-secondary-soft px-3 py-1.5 text-sm text-foreground/80">
                Perlu deposit
              </span>
            )}
          </div>

          <Button
            size="lg"
            className="mt-7 h-12 w-full rounded-full text-base sm:w-auto sm:px-8"
            nativeButton={false}
            render={<Link href={bookingHref} />}
          >
            Booking Sekarang
            <ArrowRightIcon className="size-4" />
          </Button>
        </div>

        <div className="relative aspect-[5/4] w-full overflow-hidden rounded-[2.5rem]">
          <Image
            src={picsumUrl(service.heroImage, "landscape", 1.4)}
            alt={service.name}
            fill
            priority
            sizes="(min-width: 1024px) 32rem, 100vw"
            className="object-cover"
          />
        </div>
      </div>

      {relatedDesigns.length > 0 && (
        <div className="mx-auto mt-16 w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-semibold tracking-tight text-foreground">
            Contoh hasil {service.name}
          </h2>
          <div className="mt-5 columns-2 gap-4 sm:columns-3 lg:columns-4">
            {relatedDesigns.map((design) => (
              <GalleryCard key={design.id} design={design} />
            ))}
          </div>
        </div>
      )}

      <div className="mx-auto mt-16 w-full max-w-3xl px-4 pb-20 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-semibold tracking-tight text-foreground">
          Pertanyaan seputar {service.name}
        </h2>
        <Accordion className="mt-4">
          {service.faq.map((item, i) => (
            <AccordionItem key={item.question} value={`faq-${i}`}>
              <AccordionTrigger className="text-base">{item.question}</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">{item.answer}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </div>
  );
}
