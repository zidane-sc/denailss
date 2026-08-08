import Image from "next/image";
import Link from "next/link";
import { ArrowRightIcon, CheckCircleIcon, StarIcon, WhatsappLogoIcon } from "@phosphor-icons/react/dist/ssr";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/motion/reveal";
import { picsumUrl } from "@/lib/images";
import { whatsappLink } from "@/constants/site";
import { getReviewSummary } from "@/features/reviews/data/reviews.mock";

export function Hero() {
  const { average, total } = getReviewSummary();

  return (
    <section className="relative overflow-hidden pt-10 pb-20 sm:pt-16 lg:pt-24 lg:pb-32 bg-linear-to-b from-background via-background-tint/10 to-background">
      {/* Premium ambient background pattern & glow blobs */}
      <div className="absolute inset-0 -z-20 pattern-hatch opacity-[0.25] [mask-image:radial-gradient(ellipse_at_center,black_50%,transparent_100%)]" />
      <div className="absolute top-1/4 left-1/10 -z-10 size-80 rounded-full bg-primary/8 blur-3xl opacity-70 animate-pulse duration-[8000ms]" />
      <div className="absolute bottom-1/4 right-1/10 -z-10 size-96 rounded-full bg-secondary-soft/45 blur-3xl opacity-80" />

      <div className="mx-auto grid w-full max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-[1.1fr_1fr] lg:items-center lg:gap-14 lg:px-8">
        <Reveal>
          {/* Accent Editorial Label */}
          <p className="text-[10px] font-extrabold uppercase tracking-widest text-primary/80 mb-5 flex items-center gap-2 select-none">
            <span className="h-[1px] w-6 bg-primary/40 shrink-0" />
            Nail Art &amp; Beauty Space
          </p>

          <h1 className="max-w-xl text-4xl font-semibold leading-[1.05] tracking-tight text-foreground sm:text-5xl lg:text-7xl font-heading text-wrap-balance">
            Nail art yang bikin kamu{" "}
            <span className="relative inline-block text-primary italic font-heading pr-2">
              pede
              <span className="absolute -bottom-1.5 left-0 w-full h-[6px] bg-primary/15 rounded-full -rotate-1" />
            </span>{" "}
            tiap hari.
          </h1>
          
          <p className="mt-5 max-w-md text-base leading-relaxed text-muted-foreground sm:text-lg">
            Booking gel extension, manicure-pedicure, hingga custom press-on kuku palsu berkualitas tinggi secara instan langsung dari HP Anda.
          </p>

          {/* Action buttons with active hover shadow styling */}
          <div className="mt-8 flex flex-wrap items-center gap-3.5">
            <Button
              size="lg"
              className="h-12 rounded-full px-7 text-base shadow-md hover:shadow-lg hover:shadow-primary/10 active:scale-[0.98] transition-all duration-300"
              nativeButton={false}
              render={<Link href="/booking" />}
            >
              Booking Sekarang
              <ArrowRightIcon className="size-4.5" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="h-12 rounded-full px-7 text-base hover:bg-muted/30 active:scale-[0.98] transition-all duration-300"
              nativeButton={false}
              render={
                <a href={whatsappLink("Halo Denailss, aku mau tanya-tanya~")} target="_blank" rel="noopener noreferrer" />
              }
            >
              <WhatsappLogoIcon weight="fill" className="size-4.5 text-primary" />
              Chat WhatsApp
            </Button>
          </div>

          {/* Trust points list with customized icons */}
          <div className="mt-12 grid grid-cols-2 gap-y-3.5 gap-x-6 border-t border-border/60 pt-8 max-w-md text-xs text-muted-foreground font-semibold">
            <div className="flex items-center gap-2.5">
              <CheckCircleIcon weight="fill" className="size-5 text-primary/60" />
              Standar Steril &amp; Higienis
            </div>
            <div className="flex items-center gap-2.5">
              <CheckCircleIcon weight="fill" className="size-5 text-primary/60" />
              Kutek Vegan &amp; Premium Gel
            </div>
            <div className="flex items-center gap-2.5">
              <CheckCircleIcon weight="fill" className="size-5 text-primary/60" />
              Nail Artist Bersertifikat
            </div>
            <div className="flex items-center gap-2.5">
              <CheckCircleIcon weight="fill" className="size-5 text-primary/60" />
              Custom Desain Suka-Suka
            </div>
          </div>
        </Reveal>

        <Reveal delay={0.12} className="relative lg:pl-4">
          <div className="relative mx-auto aspect-[4/5] w-full max-w-sm lg:max-w-none">
            
            {/* Background offset frame shadow - editorial style */}
            <div className="absolute inset-0 -rotate-2 rounded-[2.5rem] bg-primary/10 border border-primary/20 translate-x-3.5 translate-y-3.5" />

            {/* Main Image Frame */}
            <div className="absolute inset-0 -rotate-2 overflow-hidden rounded-[2.5rem] shadow-[0_35px_65px_-30px_rgba(46,36,48,0.5)] border border-border/70 bg-card">
              <Image
                src={picsumUrl("denailss-hero-main", "portrait", 1.4)}
                alt="Hasil nail art Denailss dengan detail French tip dan chrome finish"
                fill
                priority
                sizes="(min-width: 1024px) 32rem, 22rem"
                className="object-cover transition-transform duration-700 hover:scale-105"
              />
            </div>

            {/* Small Floating Detail Frame */}
            <div className="absolute -right-6 -top-6 aspect-square w-36 rotate-6 overflow-hidden rounded-[1.75rem] border-4 border-background shadow-xl sm:w-44 transition-all duration-300 hover:scale-105 hover:rotate-12">
              <Image
                src={picsumUrl("denailss-hero-detail", "square", 1.2)}
                alt="Detail close-up nail art bunga sakura"
                fill
                sizes="11rem"
                className="object-cover"
              />
            </div>

            {/* Left Social Proof Card */}
            <div className="absolute -bottom-5 -left-4 flex items-center gap-3 rounded-2xl border border-border bg-card/95 px-4 py-3 shadow-lg backdrop-blur-sm sm:-left-8 transition-transform duration-300 hover:scale-105">
              <div className="flex -space-x-2 shrink-0">
                <div className="relative size-6 overflow-hidden rounded-full ring-2 ring-background">
                  <Image src={picsumUrl("review-aulia", "square", 0.1)} alt="Client 1" fill className="object-cover" />
                </div>
                <div className="relative size-6 overflow-hidden rounded-full ring-2 ring-background">
                  <Image src={picsumUrl("review-salsa", "square", 0.1)} alt="Client 2" fill className="object-cover" />
                </div>
                <div className="relative size-6 overflow-hidden rounded-full ring-2 ring-background">
                  <Image src={picsumUrl("review-farah", "square", 0.1)} alt="Client 3" fill className="object-cover" />
                </div>
              </div>
              <div className="leading-tight">
                <div className="flex items-center gap-0.5">
                  <span className="text-xs font-bold text-foreground">{average}</span>
                  <StarIcon weight="fill" className="size-3.5 text-secondary" />
                </div>
                <p className="text-[9px] text-muted-foreground font-semibold leading-none mt-0.5">{total * 12}+ booking sukses</p>
              </div>
            </div>

            {/* Right Guarantee Card */}
            <div className="absolute -right-4 bottom-14 flex flex-col gap-0.5 rounded-2xl border border-border bg-card/95 px-4 py-3 shadow-lg backdrop-blur-sm transition-transform duration-300 hover:scale-105">
              <p className="text-[9px] text-muted-foreground font-extrabold uppercase tracking-widest leading-none">Garansi Retensi</p>
              <p className="text-xs font-extrabold text-primary mt-1.5">7 Hari Bebas Kelupas</p>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
