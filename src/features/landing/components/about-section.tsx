import Image from "next/image";
import { GsapReveal, GsapParallax } from "@/components/motion/gsap-reveal";
import { imageUrl } from "@/lib/images";

const STATS = [
  { value: "4+", label: "tahun melayani nail art di Jakarta Pusat" },
  { value: "1.500+", label: "desain sudah dikerjakan satu-satu" },
];

export function AboutSection() {
  return (
    <section className="py-16 sm:py-20 lg:py-24">
      <div className="mx-auto grid w-full max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:gap-16 lg:px-8">
        <GsapReveal className="relative order-2 lg:order-1">
          <GsapParallax speed={0.08}>
            <div className="relative mx-auto aspect-[4/5] w-full max-w-sm overflow-hidden rounded-[2.5rem] lg:max-w-none">
              <Image
                src={imageUrl("denailss-about-studio")}
                alt="Dela, owner dan nail artist Denailss, sedang mengerjakan nail art"
                fill
                loading="lazy"
                sizes="(min-width: 1024px) 28rem, 22rem"
                className="object-cover"
              />
            </div>
          </GsapParallax>
          <div className="absolute -bottom-6 right-4 grid grid-cols-2 gap-3 sm:right-8">
            {STATS.map((stat) => (
              <div
                key={stat.label}
                className="w-32 rounded-2xl border border-border bg-card px-4 py-3 text-center shadow-lg sm:w-36"
              >
                <p className="font-heading text-2xl font-semibold text-primary">{stat.value}</p>
                <p className="mt-1 text-[11px] leading-tight text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </GsapReveal>

        <GsapReveal delay={0.1} className="order-1 lg:order-2">
          <h2 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Tentang Denailss
          </h2>
          <p className="mt-5 text-base leading-relaxed text-muted-foreground sm:text-lg">
            Denailss lahir dari kecintaan Dela sama detail kecil di ujung jari. Berawal sebagai nail art
            rumah di Petojo Binatu, Jakarta Pusat, sekarang Denailss jadi tempat langganan buat siapa pun yang mau
            nail art rapi, tahan lama, dan sesuai mood mereka hari itu.
          </p>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground sm:text-lg">
            Setiap booking dikerjakan satu artist, satu klien, jadi hasilnya selalu personal dan sesuai
            request, bukan sekadar template dari katalog.
          </p>
        </GsapReveal>
      </div>
    </section>
  );
}
