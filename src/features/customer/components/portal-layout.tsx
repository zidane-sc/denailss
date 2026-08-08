"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { HouseIcon, CalendarBlankIcon, HeartIcon, UserIcon } from "@phosphor-icons/react/dist/ssr";
import { cn } from "@/lib/utils";
import { PortalHeader } from "./portal-header";
import { PortalMobileNav } from "./portal-mobile-nav";

const NAV_ITEMS = [
  { href: "/customer", label: "Beranda", icon: HouseIcon },
  { href: "/customer/bookings", label: "Riwayat Booking", icon: CalendarBlankIcon },
  { href: "/customer/favorites", label: "Favorit Saya", icon: HeartIcon },
  { href: "/customer/profile", label: "Profil Akun", icon: UserIcon },
];

export function PortalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen flex-col bg-background-tint/30">
      <PortalHeader />
      
      <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col md:flex-row px-4 py-6 sm:px-6 md:gap-8 md:py-10 lg:px-8">
        <aside className="hidden w-64 shrink-0 md:block">
          <nav className="sticky top-24 flex flex-col gap-2">
            {NAV_ITEMS.map((item) => {
              const isActive =
                item.href === "/customer"
                  ? pathname === "/customer"
                  : pathname.startsWith(item.href);
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-foreground hover:bg-muted"
                  )}
                >
                  <Icon weight={isActive ? "fill" : "regular"} className="size-5" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </aside>
        
        <main className="flex-1 pb-24 md:pb-12">{children}</main>
      </div>

      <PortalMobileNav />
    </div>
  );
}
