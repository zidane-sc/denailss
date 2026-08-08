"use client";

import Link from "next/link";
import { useState } from "react";
import { WhatsappLogoIcon, ListIcon } from "@phosphor-icons/react/dist/ssr";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { whatsappLink } from "@/constants/site";

const NAV_LINKS = [
  { href: "/gallery", label: "Gallery" },
  { href: "/#layanan", label: "Layanan" },
  { href: "/#ulasan", label: "Ulasan" },
  { href: "/#kontak", label: "Kontak" },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 flex h-16 w-full items-center border-b border-border/70 bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="font-heading text-xl font-semibold tracking-tight text-primary"
        >
          denailss
        </Link>

        <nav className="hidden items-center gap-7 lg:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-foreground/80 transition-colors hover:text-primary"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          <Button
            variant="outline"
            size="icon"
            aria-label="Chat WhatsApp"
            nativeButton={false}
            render={
              <a href={whatsappLink("Halo Denailss, aku mau tanya-tanya~")} target="_blank" rel="noopener noreferrer" />
            }
          >
            <WhatsappLogoIcon weight="fill" className="size-4 text-primary" />
          </Button>
          <Button
            size="lg"
            className="rounded-full px-5"
            nativeButton={false}
            render={<Link href="/booking" />}
          >
            Booking Sekarang
          </Button>
        </div>

        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger
            render={
              <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Buka menu" />
            }
          >
            <ListIcon className="size-5" />
          </SheetTrigger>
          <SheetContent side="right" className="w-[280px] bg-background">
            <SheetTitle className="px-4 pt-4 font-heading text-lg text-primary">
              denailss
            </SheetTitle>
            <nav className="mt-6 flex flex-col gap-1 px-4">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="rounded-xl px-3 py-3 text-base font-medium text-foreground/80 transition-colors hover:bg-muted hover:text-primary"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
            <div className="mt-6 flex flex-col gap-2 px-4">
              <Button
                size="lg"
                className="rounded-full"
                nativeButton={false}
                render={<Link href="/booking" onClick={() => setOpen(false)} />}
              >
                Booking Sekarang
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="rounded-full"
                nativeButton={false}
                render={
                  <a
                    href={whatsappLink("Halo Denailss, aku mau tanya-tanya~")}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setOpen(false)}
                  />
                }
              >
                <WhatsappLogoIcon weight="fill" className="size-4" />
                Chat WhatsApp
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
