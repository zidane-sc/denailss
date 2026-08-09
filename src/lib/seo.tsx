import type { Service } from "@/types";
import { SITE, whatsappLink } from "@/constants/site";

/**
 * JSON-LD structured data helpers (TRD §9 NFR — SEO).
 *
 * All payloads are built with a shared `jsonLdStringify` that escapes `<` the
 * same way Next.js's own docs recommend, so user/owner-provided strings can
 * never break out of the `<script type="application/ld+json">` block.
 *
 * The owner-editable values (business name, description, address, social
 * handles, policies) will eventually flow from the settings feature; today
 * they are read from the single-source business constants.
 */

function jsonLdStringify(data: object): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

const url = (path: string) => `${SITE.url}${path}`;

/** Render a JSON-LD block. Safe against XSS via escaped `<`. */
export function JsonLdScript({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: jsonLdStringify(data) }}
    />
  );
}

/** Organization + LocalBusiness description of Denailss (used on the landing page). */
export function localBusinessJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": ["LocalBusiness", "NailSalon", "BeautySalon"],
    "@id": SITE.url,
    name: SITE.name,
    description: SITE.description,
    url: SITE.url,
    telephone: `+${SITE.whatsappNumber}`,
    image: `${SITE.url}/images/logo-horizontal.png`,
    logo: `${SITE.url}/images/logo-horizontal.png`,
    address: {
      "@type": "PostalAddress",
      streetAddress: SITE.address,
      addressCountry: "ID",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: -6.2088,
      longitude: 106.8456,
    },
    hasMap: SITE.mapsUrl,
    sameAs: [
      SITE.instagramUrl,
      SITE.tiktokUrl,
      whatsappLink("Halo Denailss, aku mau tanya-tanya~"),
    ],
    priceRange: "Rp",
    openingHoursSpecification: {
      "@type": "OpeningHoursSpecification",
      description: SITE.hoursNote,
    },
  };
}

/** BreadcrumbList for a gallery design detail page. */
export function designBreadcrumbJsonLd(slug: string, title: string) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Beranda", item: SITE.url },
      { "@type": "ListItem", position: 2, name: "Gallery", item: url("/gallery") },
      { "@type": "ListItem", position: 3, name: title, item: url(`/gallery/${slug}`) },
    ],
  };
}

/** BreadcrumbList for a service detail page. */
export function serviceBreadcrumbJsonLd(slug: string, name: string) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Beranda", item: SITE.url },
      { "@type": "ListItem", position: 2, name: "Layanan", item: url("/services") },
      { "@type": "ListItem", position: 3, name, item: url(`/services/${slug}`) },
    ],
  };
}

/** Service offering description (price + duration) for a service detail page. */
export function serviceJsonLd(service: Service) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: service.name,
    description: service.description,
    url: url(`/services/${service.slug}`),
    image: url(imagePath(service.heroImage)),
    provider: {
      "@type": "LocalBusiness",
      name: SITE.name,
      url: SITE.url,
    },
    offers: {
      "@type": "Offer",
      price: service.priceFrom,
      priceCurrency: "IDR",
      description: "Harga mulai",
    },
    ...(service.durationMinutes
      ? {
          additionalProperty: {
            "@type": "PropertyValue",
            name: "Durasi",
            value: `${service.durationMinutes} menit`,
          },
        }
      : {}),
  };
}

/** FAQPage for a list of question/answer pairs (landing FAQ + service FAQs). */
export function faqJsonLd(
  questions: { q?: string; a?: string; question?: string; answer?: string }[]
): object | null {
  const items = questions
    .map((item) => ({
      name: item.q ?? item.question ?? "",
      answer: item.a ?? item.answer ?? "",
    }))
    .filter((item) => item.name && item.answer);
  if (items.length === 0) return null;
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.name,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };
}

/** WebSite + SearchAction (landing page). */
export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE.name,
    url: SITE.url,
    description: SITE.description,
    inLanguage: "id-ID",
  };
}

function imagePath(seed: string): string {
  if (seed.startsWith("upload:")) {
    return seed.replace(/^upload:/, "/images/uploads/");
  }
  return `/images/instagram/glazed-french-ombre.jpg`;
}
