import { Hero } from "@/features/landing/components/hero";
import { FeaturedDesigns } from "@/features/landing/components/featured-designs";
import { ServicesSection } from "@/features/landing/components/services-section";
import { PromotionBanner } from "@/features/landing/components/promotion-banner";
import { ReviewsSection } from "@/features/landing/components/reviews-section";
import { AboutSection } from "@/features/landing/components/about-section";
import { FaqSection } from "@/features/landing/components/faq-section";
import { InstagramSection } from "@/features/landing/components/instagram-section";
import { ContactSection } from "@/features/landing/components/contact-section";
import {
  JsonLdScript,
  faqJsonLd,
  localBusinessJsonLd,
  websiteJsonLd,
} from "@/lib/seo";
import {
  BOOKING_FAQ,
  SERVICE_FAQ,
} from "@/features/landing/data/faq.mock";

export default function Home() {
  const faqLd = faqJsonLd([...BOOKING_FAQ, ...SERVICE_FAQ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(localBusinessJsonLd()).replace(/</g, "\\u003c"),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(websiteJsonLd()).replace(/</g, "\\u003c"),
        }}
      />
      {faqLd && (
        <JsonLdScript data={faqLd} />
      )}
      <Hero />
      <FeaturedDesigns />
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
