import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArrowRightIcon, ClockIcon } from "@phosphor-icons/react/dist/ssr";
import { getServiceBySlug, listCatalogServicesAll } from "@/features/services/services/service-service";
import { getPublicSettings } from "@/features/settings/services/settings-public";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { formatDuration, formatIDR } from "@/lib/format";
import { imageUrl } from "@/lib/images";
import {
  JsonLdScript,
  faqJsonLd,
  serviceBreadcrumbJsonLd,
  serviceJsonLd,
} from "@/lib/seo";

export async function generateStaticParams() {
  const services = await listCatalogServicesAll();
  return services.map((service) => ({ slug: service.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/services/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const service = await getServiceBySlug(slug);
  if (!service) return {};
  return {
    title: service.name,
    description: service.shortDescription,
    alternates: {
      canonical: `/services/${service.slug}`,
    },
    openGraph: {
      title: service.name,
      description: service.shortDescription,
      url: `/services/${service.slug}`,
      type: "article",
      images: [
        {
          url: imageUrl(service.heroImage),
          alt: service.name,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: service.name,
      description: service.shortDescription,
      images: [imageUrl(service.heroImage)],
    },
  };
}

export default async function ServiceDetailPage({ params }: PageProps<"/services/[slug]">) {
  const { slug } = await params;
  const service = await getServiceBySlug(slug);
  if (!service) notFound();

  const bookingHref = `/booking?service=${service.slug}`;
  const serviceFaqLd = faqJsonLd(service.faq);
  const settings = await getPublicSettings();
  const breadcrumbLd = serviceBreadcrumbJsonLd(service.slug, service.name);
  const serviceLd = serviceJsonLd(service, settings);
  const inactive = !service.active;

  return (
    <div>
      <JsonLdScript data={breadcrumbLd} />
      <JsonLdScript data={serviceLd} />
      {serviceFaqLd && <JsonLdScript data={serviceFaqLd} />}
      <div className="mx-auto w-full max-w-7xl px-4 pt-8 sm:px-6 lg:px-8">
        <Link href="/services" className="text-sm font-medium text-muted-foreground hover:text-primary">
          &larr; Kembali ke Layanan
        </Link>
        {inactive && (
          <div className="mt-4 rounded-xl border border-secondary/30 bg-secondary-soft px-4 py-3">
            <p className="text-sm font-semibold text-secondary-foreground">
              Layanan ini sedang nonaktif.
            </p>
            <p className="mt-0.5 text-xs text-secondary-foreground/80">
              Belum bisa dibooking sampai diaktifkan kembali dari backoffice.
            </p>
          </div>
        )}
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
            {service.priceNote && (
              <span className="rounded-full bg-secondary-soft px-3 py-1.5 text-xs text-foreground/80">
                {service.priceNote}
              </span>
            )}
            <span className="flex items-center gap-1.5 rounded-full bg-muted px-3 py-1.5 text-sm text-foreground/80">
              {service.requiresPickup ? (
                <>
                  <span className="text-xs">📦</span>
                  <span>Estimasi 1-2 Hari Pembuatan</span>
                </>
              ) : (
                <>
                  <ClockIcon className="size-4" />
                  <span>
                    {service.tiers.length > 0
                      ? "Durasi sesuai tingkat kesulitan"
                      : formatDuration(service.durationMinutes)}
                  </span>
                </>
              )}
            </span>
            {service.depositApplicable && (
              <span className="rounded-full bg-secondary-soft px-3 py-1.5 text-sm text-foreground/80">
                Perlu deposit
              </span>
            )}
          </div>

          {service.tiers.length > 0 && (
            <div className="mt-5 overflow-hidden rounded-2xl border border-border/70 bg-card">
              <table className="w-full border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b bg-muted/40 text-xs font-semibold text-muted-foreground">
                    <th className="px-4 py-2.5">Tingkat Kesulitan</th>
                    <th className="px-4 py-2.5">Harga Mulai</th>
                    <th className="px-4 py-2.5">Durasi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {service.tiers.map((tier) => (
                    <tr key={tier.key}>
                      <td className="px-4 py-2.5 font-medium text-foreground">{tier.label}</td>
                      <td className="px-4 py-2.5 text-foreground">{formatIDR(tier.priceFrom)}</td>
                      <td className="px-4 py-2.5 text-muted-foreground">
                        {formatDuration(tier.durationMinutes)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <Button
            size="lg"
            className="mt-7 h-12 w-full rounded-full text-base sm:w-auto sm:px-8"
            disabled={inactive}
            nativeButton={false}
            render={inactive ? undefined : <Link href={bookingHref} />}
          >
            {inactive ? "Layanan Nonaktif" : "Booking Sekarang"}
            {!inactive && <ArrowRightIcon className="size-4" />}
          </Button>
        </div>

        <div className="relative aspect-[5/4] w-full overflow-hidden rounded-[2.5rem]">
          <Image
            src={imageUrl(service.heroImage)}
            alt={service.name}
            fill
            priority
            sizes="(min-width: 1024px) 32rem, 100vw"
            className="object-cover"
          />
        </div>
      </div>

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
