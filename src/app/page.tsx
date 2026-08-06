import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Hero from "@/features/landing-page/components/Hero";
import About from "@/features/landing-page/components/About";
import Services from "@/features/landing-page/components/Services";
import GalleryPreview from "@/features/landing-page/components/GalleryPreview";
import ReviewsPreview from "@/features/landing-page/components/ReviewsPreview";
import FAQ from "@/features/landing-page/components/FAQ";
import BookingCTA from "@/features/landing-page/components/BookingCTA";

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="flex-grow">
        <Hero />
        <About />
        <Services />
        <GalleryPreview />
        <ReviewsPreview />
        <FAQ />
        <BookingCTA />
      </main>
      <Footer />
    </>
  );
}
