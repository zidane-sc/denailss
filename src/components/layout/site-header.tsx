"use client";

import Link from "next/link";
import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { WhatsappLogoIcon, ListIcon, UserCircleIcon } from "@phosphor-icons/react/dist/ssr";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { whatsappLink } from "@/constants/site";
import { cn } from "@/lib/utils";
import { SiteLogo } from "./site-logo";

const NAV_LINKS = [
  { href: "/gallery", label: "Gallery" },
  { href: "/services", label: "Layanan" },
  { href: "/reviews", label: "Ulasan" },
  { href: "/contact", label: "Kontak" },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [activeHash, setActiveHash] = useState("");
  const pathname = usePathname();

  useEffect(() => {
    const handleHashChange = () => {
      setActiveHash(window.location.hash);
    };
    handleHashChange();
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  if (pathname.startsWith("/customer") || pathname.startsWith("/backoffice")) return null;

  return (
    <header className="sticky top-0 z-40 flex h-16 w-full items-center border-b border-border/70 bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="flex items-center shrink-0"
        >
          <SiteLogo
            width={120}
            height={48}
            className="h-8.5 w-auto object-contain"
            priority
          />
        </Link>

        <nav className="hidden items-center gap-7 lg:flex">
          {NAV_LINKS.map((link) => {
            const active = link.href.startsWith("/#")
              ? pathname === "/" && activeHash === link.href.substring(1)
              : pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href + "/"));
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-primary",
                  active ? "text-primary font-semibold" : "text-foreground/80"
                )}
              >
                {link.label}
              </Link>
            );
          })}
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
            variant="ghost"
            size="sm"
            className="gap-1.5"
            nativeButton={false}
            render={<Link href="/customer" />}
          >
            <UserCircleIcon className="size-4" />
            Portal Saya
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
            <SheetTitle className="px-4 pt-4 select-none">
              <SiteLogo
                width={100}
                height={40}
                className="h-7.5 w-auto object-contain"
              />
            </SheetTitle>
            <nav className="mt-6 flex flex-col gap-1 px-4">
              {NAV_LINKS.map((link) => {
                const active = link.href.startsWith("/#")
                  ? pathname === "/" && activeHash === link.href.substring(1)
                  : pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href + "/"));
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "rounded-xl px-3 py-3 text-base font-medium transition-colors hover:bg-muted hover:text-primary",
                      active ? "bg-muted text-primary font-semibold" : "text-foreground/80"
                    )}
                  >
                    {link.label}
                  </Link>
                );
              })}
              <Link
                href="/customer"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2 rounded-xl px-3 py-3 text-base font-medium text-foreground/80 transition-colors hover:bg-muted hover:text-primary"
              >
                <UserCircleIcon className="size-5" />
                Portal Saya
              </Link>
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
