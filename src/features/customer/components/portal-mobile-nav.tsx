"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { HouseIcon, CalendarBlankIcon, HeartIcon, UserIcon } from "@phosphor-icons/react/dist/ssr";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/customer", label: "Beranda", icon: HouseIcon },
  { href: "/customer/bookings", label: "Booking", icon: CalendarBlankIcon },
  { href: "/customer/favorites", label: "Favorit", icon: HeartIcon },
  { href: "/customer/profile", label: "Profil", icon: UserIcon },
];

export function PortalMobileNav() {
  const pathname = usePathname();

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background pb-safe md:hidden">
      <nav className="flex h-16 items-center justify-around px-2">
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
                "flex flex-col items-center justify-center gap-1 px-3 py-2",
                isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon weight={isActive ? "fill" : "regular"} className="size-6" />
              <span className="text-[10px] font-medium leading-none">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
