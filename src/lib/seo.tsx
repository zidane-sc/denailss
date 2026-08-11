import type { Service } from "@/types";
import { SITE, whatsappLink } from "@/constants/site";
import { imageUrl } from "@/lib/images";
import type { Settings } from "@/features/settings/types";

/**
 * JSON-LD structured data helpers (TRD §9 NFR — SEO).
 *
 * All payloads are built with a shared `jsonLdStringify` that escapes `<` the
 * same way Next.js's own docs recommend, so user/owner-provided strings can
 * never break out of the `<script type="application/ld+json">` block.
 *
 * Owner-editable values (business name, description, address, social handles,
 * policies) flow from the persisted settings (with a SITE-constant fallback).
 * This module is client-safe: server callers pass the settings they fetch.
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

function resolveValues(settings: Settings) {
  const businessName = settings.businessProfile.name || SITE.name;
  const description = settings.businessProfile.description || SITE.description;
  const address = settings.businessProfile.address || SITE.address;
  const mapsUrl = settings.businessProfile.mapsUrl || SITE.mapsUrl;
  const latitude = settings.businessProfile.latitude ?? SITE.latitude;
  const longitude = settings.businessProfile.longitude ?? SITE.longitude;
  const instagramHandle = settings.socialMedia.instagram || SITE.instagramHandle;
  const tiktokHandle = settings.socialMedia.tiktok || SITE.tiktokHandle;
  const whatsappNumber = settings.socialMedia.whatsapp || SITE.whatsappNumber;
  return {
    name: businessName,
    description,
    address,
    mapsUrl,
    latitude,
    longitude,
    instagramUrl: `https://www.instagram.com/${instagramHandle}/`,
    tiktokUrl: `https://www.tiktok.com/@${tiktokHandle}`,
    whatsappLink: whatsappLink("Halo Denailss, aku mau tanya-tanya~", whatsappNumber),
  };
}

/** Organization + LocalBusiness description of Denailss (used on the landing page). */
export function localBusinessJsonLd(settings: Settings) {
  const v = resolveValues(settings);
  return {
    "@context": "https://schema.org",
    "@type": ["LocalBusiness", "NailSalon", "BeautySalon"],
    "@id": SITE.url,
    name: v.name,
    description: v.description,
    url: SITE.url,
    telephone: `+${settings.socialMedia.whatsapp || SITE.whatsappNumber}`,
    image: `${SITE.url}/images/logo-horizontal.png`,
    logo: `${SITE.url}/images/logo-horizontal.png`,
    address: {
      "@type": "PostalAddress",
      streetAddress: v.address,
      addressCountry: "ID",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: v.latitude,
      longitude: v.longitude,
    },
    hasMap: v.mapsUrl,
    sameAs: [v.instagramUrl, v.tiktokUrl, v.whatsappLink],
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
export function serviceJsonLd(service: Service, settings: Settings) {
  const businessName = settings.businessProfile.name || SITE.name;
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: service.name,
    description: service.description,
    url: url(`/services/${service.slug}`),
    image: imagePath(service.heroImage),
    provider: {
      "@type": "LocalBusiness",
      name: businessName,
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
  // Resolve storage refs / seed-map keys to the actual asset, then make the
  // URL absolute so crawlers can fetch it from the JSON-LD payload.
  const resolved = imageUrl(seed);
  return resolved.startsWith("http") ? resolved : `${SITE.url}${resolved}`;
}
