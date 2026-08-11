import type { MetadataRoute } from "next";
import { SITE } from "@/constants/site";
import { listCatalogServicesAll } from "@/features/services/services/service-service";
import { listCatalogGalleryWithImages } from "@/features/gallery/services/gallery-service";

/**
 * SEO sitemap (TRD §9 NFR). Lists the public-facing routes only — backoffice
 * and customer portal are intentionally excluded (see robots.ts).
 *
 * Dynamic routes come from the DB-backed catalogs (services + gallery
 * designs), so owner edits and uploads are reflected here.
 */

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes = [
    { path: "/", priority: 1, changeFrequency: "weekly" as const },
    { path: "/gallery", priority: 0.9, changeFrequency: "weekly" as const },
    { path: "/services", priority: 0.9, changeFrequency: "monthly" as const },
    { path: "/reviews", priority: 0.6, changeFrequency: "monthly" as const },
    { path: "/contact", priority: 0.7, changeFrequency: "monthly" as const },
    { path: "/booking", priority: 0.8, changeFrequency: "monthly" as const },
  ];

  const [allServices, galleryDesigns] = await Promise.all([
    listCatalogServicesAll(),
    listCatalogGalleryWithImages(),
  ]);

  const serviceRoutes = allServices.map((service) => ({
    path: `/services/${service.slug}`,
    priority: 0.8,
    changeFrequency: "monthly" as const,
  }));

  const galleryRoutes = galleryDesigns.map((design) => ({
    path: `/gallery/${design.slug}`,
    priority: 0.7,
    changeFrequency: "weekly" as const,
  }));

  return [...staticRoutes, ...serviceRoutes, ...galleryRoutes].map(
    ({ path, priority, changeFrequency }) => ({
      url: `${SITE.url}${path}`,
      lastModified: new Date(),
      changeFrequency,
      priority,
    })
  );
}
