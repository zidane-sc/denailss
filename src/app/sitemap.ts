import type { MetadataRoute } from "next";
import { SITE } from "@/constants/site";
import { SERVICES } from "@/features/services/data/services.seed";
import { GALLERY_DESIGNS } from "@/features/gallery/data/designs.mock";

/**
 * SEO sitemap (TRD §9 NFR). Lists the public-facing routes only — backoffice
 * and customer portal are intentionally excluded (see robots.ts).
 *
 * Dynamic routes come from the seed catalogs (services + gallery designs).
 * Uploaded-only gallery designs don't have a detail page yet, so they are not
 * listed here; once the catalog becomes backend-driven this file swaps to the
 * same repository seam as the rest of the app.
 */

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = [
    { path: "/", priority: 1, changeFrequency: "weekly" as const },
    { path: "/gallery", priority: 0.9, changeFrequency: "weekly" as const },
    { path: "/services", priority: 0.9, changeFrequency: "monthly" as const },
    { path: "/reviews", priority: 0.6, changeFrequency: "monthly" as const },
    { path: "/contact", priority: 0.7, changeFrequency: "monthly" as const },
    { path: "/booking", priority: 0.8, changeFrequency: "monthly" as const },
  ];

  const serviceRoutes = SERVICES.map((service) => ({
    path: `/services/${service.slug}`,
    priority: 0.8,
    changeFrequency: "monthly" as const,
  }));

  const galleryRoutes = GALLERY_DESIGNS.map((design) => ({
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
