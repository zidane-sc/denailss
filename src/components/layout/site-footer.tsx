"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  InstagramLogoIcon,
  TiktokLogoIcon,
  WhatsappLogoIcon,
  MapPinIcon,
} from "@phosphor-icons/react/dist/ssr";
import { SITE, whatsappLink } from "@/constants/site";

const EXPLORE_LINKS = [
  { href: "/gallery", label: "Gallery" },
  { href: "/services", label: "Layanan" },
  { href: "/reviews", label: "Ulasan" },
  { href: "/booking", label: "Booking Sekarang" },
];

const SERVICE_LINKS = [
  { href: "/services/gel-extension", label: "Gel Extension" },
  { href: "/services/nail-art", label: "Nail Art" },
  { href: "/services/manicure", label: "Manicure" },
  { href: "/services/pedicure", label: "Pedicure" },
];

export function SiteFooter() {
  const pathname = usePathname();
  
  if (pathname.startsWith("/customer") || pathname.startsWith("/backoffice")) return null;

  return (
    <footer className="border-t border-border bg-background-tint">
      <div className="mx-auto grid w-full max-w-7xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[1.4fr_1fr_1fr_1.2fr] lg:px-8 lg:py-16">
        <div className="max-w-sm">
          <Image
            src="/images/logo-horizontal.png"
            alt="Denailss"
            width={130}
            height={52}
            className="h-9.5 w-auto object-contain"
          />
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            {SITE.description}
          </p>
          <div className="mt-5 flex items-center gap-3">
            <a
              href={SITE.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram Denailss"
              className="flex size-9 items-center justify-center rounded-full border border-border bg-card text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
            >
              <InstagramLogoIcon className="size-4" />
            </a>
            <a
              href={SITE.tiktokUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="TikTok Denailss"
              className="flex size-9 items-center justify-center rounded-full border border-border bg-card text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
            >
              <TiktokLogoIcon className="size-4" />
            </a>
            <a
              href={whatsappLink("Halo Denailss, aku mau tanya-tanya~")}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="WhatsApp Denailss"
              className="flex size-9 items-center justify-center rounded-full border border-border bg-card text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
            >
              <WhatsappLogoIcon className="size-4" />
            </a>
          </div>
        </div>

        <div>
          <p className="text-sm font-semibold text-foreground">Jelajahi</p>
          <ul className="mt-4 space-y-2.5">
            {EXPLORE_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-sm text-muted-foreground transition-colors hover:text-primary"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="text-sm font-semibold text-foreground">Layanan</p>
          <ul className="mt-4 space-y-2.5">
            {SERVICE_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-sm text-muted-foreground transition-colors hover:text-primary"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="text-sm font-semibold text-foreground">Lokasi Kami</p>
          <div className="mt-4 flex items-start gap-2 text-sm text-muted-foreground">
            <MapPinIcon className="mt-0.5 size-4 shrink-0 text-primary" />
            <span>{SITE.address}</span>
          </div>
          <p className="mt-3 text-sm text-muted-foreground">{SITE.hoursNote}</p>
          <a
            href={SITE.mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-block text-sm font-medium text-primary underline-offset-4 hover:underline"
          >
            Lihat lokasi di Maps
          </a>
        </div>
      </div>

      <div className="border-t border-border/70">
        <div className="mx-auto flex w-full max-w-7xl flex-col items-center justify-between gap-2 px-4 py-5 text-xs text-muted-foreground sm:flex-row sm:px-6 lg:px-8">
          <p>&copy; {new Date().getFullYear()} Denailss. Semua hak dilindungi.</p>
          <p>Dibuat dengan cinta di Jakarta Selatan.</p>
        </div>
      </div>
    </footer>
  );
}
