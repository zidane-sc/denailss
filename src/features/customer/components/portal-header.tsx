"use client";

import Image from "next/image";
import Link from "next/link";
import { UserCircleIcon, ArrowLeftIcon } from "@phosphor-icons/react/dist/ssr";
import { Button } from "@/components/ui/button";
import { CUSTOMER_PROFILE } from "../data/customer.mock";

export function PortalHeader() {
  return (
    <header className="sticky top-0 z-40 flex h-16 w-full items-center border-b border-border/70 bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex w-full max-w-3xl items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            nativeButton={false}
            render={<Link href="/" />}
            aria-label="Kembali ke web utama"
          >
            <ArrowLeftIcon className="size-5" />
          </Button>
          <Link
            href="/customer"
            className="flex items-center shrink-0"
          >
            <Image
              src="/images/logo-horizontal.png"
              alt="Denailss"
              width={120}
              height={48}
              className="h-8 w-auto object-contain"
              priority
            />
          </Link>
        </div>
        
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            className="hidden md:flex text-muted-foreground"
            nativeButton={false}
            render={<Link href="/" />}
          >
            Kembali ke web utama
          </Button>
          <div className="flex items-center gap-2 rounded-full border border-border bg-card py-1.5 pl-3 pr-1.5 shadow-sm">
            <span className="text-sm font-medium">{CUSTOMER_PROFILE.name.split(" ")[0]}</span>
            <div className="flex size-7 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <UserCircleIcon weight="fill" className="size-5" />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
