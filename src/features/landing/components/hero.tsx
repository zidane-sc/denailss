import Image from "next/image";
import Link from "next/link";
import { ArrowRightIcon, StarIcon, WhatsappLogoIcon } from "@phosphor-icons/react/dist/ssr";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/motion/reveal";
import { picsumUrl } from "@/lib/images";
import { whatsappLink } from "@/constants/site";
import { getReviewSummary } from "@/features/reviews/data/reviews.mock";

export function Hero() {
  const { average, total } = getReviewSummary();

  return (
    <section className="relative overflow-hidden pt-8 pb-16 sm:pt-10 lg:pt-16 lg:pb-24">
      <div className="mx-auto grid w-full max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-[1.05fr_1fr] lg:items-center lg:gap-10 lg:px-8">
        <Reveal>
          <h1 className="max-w-xl text-4xl font-semibold leading-[1.08] tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            Nail art yang bikin kamu <span className="text-primary italic">pede</span> tiap hari.
          </h1>
          <p className="mt-5 max-w-md text-base leading-relaxed text-muted-foreground sm:text-lg">
            Booking gel extension, nail art, sampai perawatan tangan-kaki langsung dari HP, tanpa chat bolak-balik.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Button
              size="lg"
              className="h-12 rounded-full px-6 text-base"
              nativeButton={false}
              render={<Link href="/booking" />}
            >
              Booking Sekarang
              <ArrowRightIcon className="size-4" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="h-12 rounded-full px-6 text-base"
              nativeButton={false}
              render={
                <a href={whatsappLink("Halo Denailss, aku mau tanya-tanya~")} target="_blank" rel="noopener noreferrer" />
              }
            >
              <WhatsappLogoIcon weight="fill" className="size-4 text-primary" />
              Chat WhatsApp
            </Button>
          </div>
        </Reveal>

        <Reveal delay={0.12} className="relative">
          <div className="relative mx-auto aspect-[4/5] w-full max-w-sm lg:max-w-none">
            <div className="absolute inset-0 -rotate-2 overflow-hidden rounded-[2.5rem] shadow-[0_30px_60px_-30px_rgba(46,36,48,0.35)]">
              <Image
                src={picsumUrl("denailss-hero-main", "portrait", 1.4)}
                alt="Hasil nail art Denailss dengan detail French tip dan chrome finish"
                fill
                priority
                sizes="(min-width: 1024px) 32rem, 22rem"
                className="object-cover"
              />
            </div>
            <div className="absolute -right-6 -top-6 aspect-square w-36 rotate-6 overflow-hidden rounded-[1.75rem] border-4 border-background shadow-xl sm:w-44">
              <Image
                src={picsumUrl("denailss-hero-detail", "square", 1.2)}
                alt="Detail close-up nail art bunga sakura"
                fill
                sizes="11rem"
                className="object-cover"
              />
            </div>
            <div className="absolute -bottom-5 -left-4 flex items-center gap-2 rounded-2xl border border-border bg-card/95 px-4 py-3 shadow-lg backdrop-blur-sm sm:-left-8">
              <StarIcon weight="fill" className="size-5 text-secondary" />
              <div className="leading-tight">
                <p className="text-sm font-semibold text-foreground">{average} dari 5</p>
                <p className="text-xs text-muted-foreground">{total * 12}+ booking selesai</p>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
