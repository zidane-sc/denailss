import { Hero } from "@/features/landing/components/hero";
import { FeaturedDesigns } from "@/features/landing/components/featured-designs";
import { ServicesSection } from "@/features/landing/components/services-section";
import { PromotionBanner } from "@/features/landing/components/promotion-banner";
import { ReviewsSection } from "@/features/landing/components/reviews-section";
import { AboutSection } from "@/features/landing/components/about-section";
import { FaqSection } from "@/features/landing/components/faq-section";
import { InstagramSection } from "@/features/landing/components/instagram-section";
import { ContactSection } from "@/features/landing/components/contact-section";
import { listCatalogGalleryWithImages } from "@/features/gallery/services/gallery-service";
import { getPublicSettings } from "@/features/settings/services/settings-public";
import { listReviews, getReviewSummary } from "@/features/reviews/services/review-service";
import { DEFAULT_REVIEWS, BASELINE_REVIEW_COUNT } from "@/features/reviews/constants/review-baseline";
import {
  JsonLdScript,
  faqJsonLd,
  localBusinessJsonLd,
  websiteJsonLd,
} from "@/lib/seo";

// Rebuild the cached static landing page in the background every 5 minutes so
// gallery/review/promo/settings edits surface without a full redeploy, while
// still serving the last known-good page instantly to every visitor.
export const revalidate = 300;

export default async function Home() {
  const [designs, settings] = await Promise.all([
    listCatalogGalleryWithImages(),
    getPublicSettings(),
  ]);
  // Seed the reviews section server-side (defaults + live) so cards and
  // filter buttons render on first paint; the client provider refreshes after.
  let initialReviews: Awaited<ReturnType<typeof listReviews>> = [];
  let initialSummary: { total: number; average: number } | null = null;
  try {
    const [reviews, summary] = await Promise.all([listReviews(), getReviewSummary()]);
    initialReviews = reviews;
    initialSummary = summary;
  } catch {
    initialReviews = DEFAULT_REVIEWS.map((r) => ({ ...r, id: `default-${r.customerName.toLowerCase()}` }));
    initialSummary = { total: BASELINE_REVIEW_COUNT, average: 5 };
  }
  const faqLd = faqJsonLd(
    settings.faqs.map((f) => ({ q: f.q, a: f.a }))
  );
  const businessLd = localBusinessJsonLd(settings);
  const siteLd = websiteJsonLd();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(businessLd).replace(/</g, "\\u003c"),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(siteLd).replace(/</g, "\\u003c"),
        }}
      />
      {faqLd && (
        <JsonLdScript data={faqLd} />
      )}
      <Hero />
      <FeaturedDesigns initialDesigns={designs} />
      <ServicesSection />
      <PromotionBanner />
      <ReviewsSection initialReviews={initialReviews} initialSummary={initialSummary} />
      <AboutSection />
      <FaqSection settings={settings} />
      <InstagramSection settings={settings} />
      <ContactSection settings={settings} />
    </>
  );
}
