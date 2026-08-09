"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  HouseIcon,
  CalendarBlankIcon,
  ClockIcon,
  UsersThreeIcon,
  ImagesIcon,
  TicketIcon,
  ArrowLeftIcon,
  ListIcon,
  WalletIcon,
  ChartLineUpIcon,
  GearIcon,
  SparkleIcon,
  InstagramLogoIcon,
} from "@phosphor-icons/react/dist/ssr";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { BackofficeProvider } from "../context/backoffice-context";
import { LogoutDialog } from "@/features/auth/components/logout-dialog";

const NAV_ITEMS = [
  { href: "/backoffice", label: "Dashboard", icon: HouseIcon },
  { href: "/backoffice/calendar", label: "Kalender", icon: CalendarBlankIcon },
  { href: "/backoffice/availability", label: "Pengaturan Jadwal", icon: ClockIcon },
  { href: "/backoffice/gallery", label: "Katalog Galeri", icon: ImagesIcon },
  { href: "/backoffice/services", label: "Layanan", icon: SparkleIcon },
  { href: "/backoffice/instagram", label: "Grid Instagram", icon: InstagramLogoIcon },
  { href: "/backoffice/promotions", label: "Promosi", icon: TicketIcon },
  { href: "/backoffice/finance", label: "Keuangan", icon: WalletIcon },
  { href: "/backoffice/analytics", label: "Analytics", icon: ChartLineUpIcon },
  { href: "/backoffice/settings", label: "Pengaturan", icon: GearIcon },
  { href: "/backoffice/customers", label: "Pelanggan", icon: UsersThreeIcon },
];

function BackofficeSidebar({ className }: { className?: string }) {
  const pathname = usePathname();

  return (
    <aside className={cn("w-64 shrink-0 border-r border-border/60 bg-background/50 backdrop-blur-sm p-6 hidden md:block", className)}>
      <div className="sticky top-10 flex flex-col gap-8">
        <div>
          <Link href="/backoffice" className="flex items-center">
            <Image
              src="/images/logo-horizontal.png"
              alt="Denailss"
              width={140}
              height={56}
              className="h-8 w-auto object-contain"
            />
          </Link>
          <p className="mt-1 text-xs text-muted-foreground font-medium">Command Center · Owner</p>
        </div>

        <nav className="flex flex-col gap-1.5">
          {NAV_ITEMS.map((item) => {
            const isActive =
              item.href === "/backoffice"
                ? pathname === "/backoffice"
                : pathname.startsWith(item.href);
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-sm shadow-primary/20 scale-[1.02]"
                    : "text-foreground/80 hover:bg-muted hover:text-foreground"
                )}
              >
                <Icon weight={isActive ? "fill" : "regular"} className="size-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto border-t border-border/60 pt-6">
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start gap-2 text-muted-foreground hover:text-foreground"
            nativeButton={false}
            render={<Link href="/" />}
          >
            <ArrowLeftIcon className="size-4" />
            Website Utama
          </Button>
          <div className="mt-1">
            <LogoutDialog />
          </div>
        </div>
      </div>
    </aside>
  );
}

export function BackofficeLayoutContent({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  const getPageTitle = () => {
    if (pathname === "/backoffice") return "Overview";
    if (pathname.startsWith("/backoffice/calendar")) return "Kalender Kerja";
    if (pathname.startsWith("/backoffice/availability")) return "Pengaturan Jadwal";
    if (pathname.startsWith("/backoffice/appointments")) return "Detail Appointment";
    if (pathname.startsWith("/backoffice/gallery")) return "Katalog Galeri";
    if (pathname.startsWith("/backoffice/services")) return "Kelola Layanan";
    if (pathname.startsWith("/backoffice/instagram")) return "Grid Instagram";
    if (pathname.startsWith("/backoffice/promotions")) return "Promosi";
    if (pathname.startsWith("/backoffice/finance")) return "Keuangan";
    if (pathname.startsWith("/backoffice/analytics")) return "Analytics";
    if (pathname.startsWith("/backoffice/settings")) return "Pengaturan";
    if (pathname.startsWith("/backoffice/customers")) return "Buku Pelanggan";
    return "Backoffice";
  };

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      {/* Sidebar on Desktop */}
      <BackofficeSidebar />

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col">
        {/* Header on Mobile & Desktop */}
        <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-border/70 bg-background/80 px-4 backdrop-blur-md sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            {/* Mobile Sheet Trigger */}
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger
                render={
                  <Button variant="ghost" size="icon" className="md:hidden" aria-label="Buka menu" />
                }
              >
                <ListIcon className="size-5" />
              </SheetTrigger>
              <SheetContent side="left" className="w-[280px] bg-background p-6">
                <SheetTitle className="w-fit select-none">
                  <Image
                    src="/images/logo-horizontal.png"
                    alt="Denailss"
                    width={120}
                    height={48}
                    className="h-7.5 w-auto object-contain"
                  />
                </SheetTitle>
                <nav className="mt-8 flex flex-col gap-1.5">
                  {NAV_ITEMS.map((item) => {
                    const isActive =
                      item.href === "/backoffice"
                        ? pathname === "/backoffice"
                        : pathname.startsWith(item.href);
                    const Icon = item.icon;

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMobileOpen(false)}
                        className={cn(
                          "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors",
                          isActive
                            ? "bg-primary text-primary-foreground"
                            : "text-foreground/80 hover:bg-muted hover:text-foreground"
                        )}
                      >
                        <Icon weight={isActive ? "fill" : "regular"} className="size-5" />
                        {item.label}
                      </Link>
                    );
                  })}
                </nav>
                <div className="mt-8 border-t border-border/60 pt-6">
                  <Link
                    href="/"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    <ArrowLeftIcon className="size-4" />
                    Kembali ke Web Utama
                  </Link>
                  <div className="mt-3">
                    <LogoutDialog />
                  </div>
                </div>
              </SheetContent>
            </Sheet>

            <h1 className="font-heading text-lg font-semibold tracking-tight md:text-xl">
              {getPageTitle()}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 md:flex">
              <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Operasional Aktif
            </span>
            <div className="h-4 w-px bg-border/80 hidden md:block" />
            <div className="flex items-center gap-2">
              <div className="size-8 rounded-full bg-secondary-soft text-secondary flex items-center justify-center font-heading text-sm font-semibold">
                O
              </div>
              <span className="text-sm font-medium hidden md:inline-block">Owner Denailss</span>
            </div>
          </div>
        </header>

        {/* Workspace Area */}
        <main className="flex-1 overflow-y-auto px-4 py-6 sm:px-6 md:py-8 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  );
}

export function BackofficeLayout({ children }: { children: React.ReactNode }) {
  return (
    <BackofficeProvider>
      <BackofficeLayoutContent>{children}</BackofficeLayoutContent>
    </BackofficeProvider>
  );
}
