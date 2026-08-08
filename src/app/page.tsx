import { Hero } from "@/features/landing/components/hero";
import { FeaturedDesigns } from "@/features/landing/components/featured-designs";
import { ServicesSection } from "@/features/landing/components/services-section";
import { PromotionBanner } from "@/features/landing/components/promotion-banner";
import { ReviewsSection } from "@/features/landing/components/reviews-section";
import { AboutSection } from "@/features/landing/components/about-section";
import { FaqSection } from "@/features/landing/components/faq-section";
import { InstagramSection } from "@/features/landing/components/instagram-section";
import { ContactSection } from "@/features/landing/components/contact-section";

export default function Home() {
  return (
    <>
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
