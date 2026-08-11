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
import {
  JsonLdScript,
  faqJsonLd,
  localBusinessJsonLd,
  websiteJsonLd,
} from "@/lib/seo";

export default async function Home() {
  const [designs, settings] = await Promise.all([
    listCatalogGalleryWithImages(),
    getPublicSettings(),
  ]);
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
      <ReviewsSection />
      <AboutSection />
      <FaqSection />
      <InstagramSection />
      <ContactSection />
    </>
  );
}
