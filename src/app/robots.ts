import type { MetadataRoute } from "next";
import { SITE } from "@/constants/site";

/**
 * robots.txt (TRD §9 NFR). The public website is fully crawlable; the
 * backoffice command center and customer portal are private (auth comes later)
 * and stay out of the index. Sitemap is advertised for crawlers.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/backoffice", "/customer", "/api/"],
    },
    sitemap: `${SITE.url}/sitemap.xml`,
  };
}
