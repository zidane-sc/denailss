import Image from "next/image";
import {
  WhatsappLogoIcon,
  InstagramLogoIcon,
  TiktokLogoIcon,
  MapPinIcon,
  ClockIcon,
} from "@phosphor-icons/react/dist/ssr";
import { Reveal } from "@/components/motion/reveal";
import { imageUrl } from "@/lib/images";
import { SITE, whatsappLink } from "@/constants/site";
import type { Settings } from "@/features/settings/types";

export async function ContactSection({ settings }: { settings: Settings }) {
  const social = settings.socialMedia;
  const address = settings.businessProfile.address || SITE.address;
  const mapsUrl = settings.businessProfile.mapsUrl || SITE.mapsUrl;
  const instagramHandle = social.instagram || SITE.instagramHandle;
  const tiktokHandle = social.tiktok || SITE.tiktokHandle;
  const whatsappNumber = social.whatsapp || SITE.whatsappNumber;

  const CHANNELS = [
    {
      icon: WhatsappLogoIcon,
      label: "WhatsApp",
      value: whatsappNumber,
      href: whatsappLink("Halo Denailss, aku mau tanya-tanya~", whatsappNumber),
    },
    {
      icon: InstagramLogoIcon,
      label: "Instagram",
      value: `@${instagramHandle}`,
      href: `https://www.instagram.com/${instagramHandle}/`,
    },
    {
      icon: TiktokLogoIcon,
      label: "TikTok",
      value: `@${tiktokHandle}`,
      href: `https://www.tiktok.com/@${tiktokHandle}`,
    },
    {
      icon: MapPinIcon,
      label: "Google Maps",
      value: address,
      href: mapsUrl,
    },
  ];

  return (
    <section id="kontak" className="py-16 sm:py-20 lg:py-24">
      <div className="mx-auto grid w-full max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[1fr_0.85fr] lg:items-center lg:gap-16 lg:px-8">
        <Reveal>
          <h2 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Ngobrol dulu atau langsung datang
          </h2>
          <p className="mt-3 max-w-md text-base text-muted-foreground">
            Ada pertanyaan sebelum booking? Sapa kami lewat channel favoritmu, atau langsung datang ke lokasi.
          </p>

          <div className="mt-7 grid gap-3 sm:grid-cols-2">
            {CHANNELS.map((channel) => (
              <a
                key={channel.label}
                href={channel.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-start gap-3 rounded-2xl border border-border bg-card p-4 transition-colors hover:border-primary/50"
              >
                <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-muted text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  <channel.icon className="size-4.5" />
                </span>
                <span>
                  <span className="block text-sm font-semibold text-foreground">{channel.label}</span>
                  <span className="block text-sm text-muted-foreground">{channel.value}</span>
                </span>
              </a>
            ))}
          </div>

          <div className="mt-5 flex items-start gap-2.5 rounded-2xl bg-secondary-soft px-4 py-3 text-sm text-foreground/80">
            <ClockIcon className="mt-0.5 size-4 shrink-0 text-primary" />
            <span>{SITE.hoursNote}</span>
          </div>
        </Reveal>

        <Reveal delay={0.1} className="relative order-first lg:order-last">
          <div className="relative aspect-[5/4] w-full overflow-hidden rounded-[2.5rem]">
            <Image
              src={imageUrl("denailss-contact-studio")}
              alt="Interior ruang kuku Denailss"
              fill
              loading="lazy"
              sizes="(min-width: 1024px) 32rem, 100vw"
              className="object-cover"
            />
          </div>
        </Reveal>
      </div>
    </section>
  );
}
