"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Reveal, RevealGroup, RevealItem } from "@/components/motion/reveal";
import { CalendarCheckIcon, ClockIcon, HeartIcon, ArrowRightIcon } from "@phosphor-icons/react/dist/ssr";
import { formatDateId, parseDateKey } from "@/lib/format";
import { imageUrl } from "@/lib/images";
import { fetchCustomerBookings, fetchCustomerProfile } from "@/features/customer/data/customer-api";
import type { CustomerBooking, CustomerProfile } from "@/features/customer/types";
import type { GalleryDesign } from "@/types";

export default function CustomerDashboardPage() {
  const [profile, setProfile] = useState<CustomerProfile | null>(null);
  const [bookings, setBookings] = useState<CustomerBooking[]>([]);
  const [favoriteDesigns, setFavoriteDesigns] = useState<GalleryDesign[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetchCustomerProfile(),
      fetchCustomerBookings(),
      fetch("/api/v1/customer/favorites", { cache: "no-store" })
        .then((r) => (r.ok ? r.json() : null))
        .then(async (fav) => {
          const slugs = new Set<string>(fav?.data?.slugs ?? []);
          if (slugs.size === 0) return [];
          const gallery = await fetch("/api/v1/gallery", { cache: "no-store" }).then((g) => (g.ok ? g.json() : null));
          return ((gallery?.data as GalleryDesign[] | undefined) ?? []).filter((d) => slugs.has(d.slug)).slice(0, 4);
        })
        .catch(() => [] as GalleryDesign[]),
    ]).then(([nextProfile, nextBookings, favorites]) => {
      setProfile(nextProfile);
      setBookings(nextBookings);
      setFavoriteDesigns(favorites);
      setLoading(false);
    });
  }, []);

  const now = new Date();
  const upcoming = bookings
    .filter((booking) => booking.date && new Date(`${booking.date}T${booking.time || "00:00"}`) >= now && booking.status !== "cancelled")
    .sort((a, b) => a.date.localeCompare(b.date));
  const past = bookings
    .filter((booking) => booking.date && new Date(`${booking.date}T${booking.time || "00:00"}`) < now)
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 3);
  const nextAppointment = upcoming[0];

  return (
    <div className="space-y-8">
      <Reveal>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-heading text-3xl font-bold text-foreground">
              Halo, {profile?.name.split(" ")[0] ?? "kamu"}! ✨
            </h1>
            <p className="mt-1 text-muted-foreground">Selamat datang kembali di area personal kamu.</p>
          </div>
          <Button size="lg" className="w-full sm:w-auto" nativeButton={false} render={<Link href="/booking" />}>
            Booking Baru
          </Button>
        </div>
      </Reveal>

      {loading ? (
        <p className="py-16 text-center text-sm text-muted-foreground">Memuat data personalmu...</p>
      ) : (
        <div className="grid gap-6 lg:grid-cols-3 lg:gap-8">
          <RevealGroup className="flex flex-col gap-6 lg:col-span-2">
            {nextAppointment ? (
              <RevealItem>
                <div className="rounded-3xl border border-border bg-card p-6 shadow-sm sm:p-8">
                  <div className="mb-4 flex items-center gap-2">
                    <div className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <CalendarCheckIcon weight="fill" className="size-5" />
                    </div>
                    <h2 className="font-heading text-xl font-semibold">Jadwal Terdekat</h2>
                  </div>
                  <div className="mt-6 flex flex-col gap-6 rounded-2xl bg-muted/50 p-6 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="font-medium text-primary">{formatDateId(parseDateKey(nextAppointment.date), { withWeekday: true })}</p>
                      <p className="mt-1 font-heading text-2xl font-bold">{nextAppointment.time || "-"} WIB</p>
                      <p className="mt-2 text-sm text-muted-foreground">
                        {nextAppointment.services.map((service) => service.name).join(", ")}
                        {nextAppointment.designTitle && ` · ${nextAppointment.designTitle}`}
                      </p>
                    </div>
                    <div className="flex flex-col gap-3 sm:items-end">
                      <Badge variant={nextAppointment.status === "confirmed" ? "default" : nextAppointment.status === "pending_deposit" ? "destructive" : "secondary"}>
                        {nextAppointment.status === "confirmed" ? "Dikonfirmasi" : nextAppointment.status === "pending_deposit" ? "Menunggu Pembayaran" : "Menunggu Verifikasi"}
                      </Badge>
                      <Button variant="outline" size="sm" nativeButton={false} render={<Link href={`/customer/bookings/${nextAppointment.id}`} />}>
                        Lihat Detail
                      </Button>
                    </div>
                  </div>
                </div>
              </RevealItem>
            ) : (
              <RevealItem>
                <div className="rounded-3xl border border-border bg-card p-8 text-center shadow-sm">
                  <CalendarCheckIcon className="mx-auto size-6 text-muted-foreground" />
                  <h3 className="mt-4 font-heading text-lg font-semibold">Belum ada jadwal</h3>
                  <p className="mt-2 text-sm text-muted-foreground">Kamu belum punya jadwal booking mendatang. Yuk booking sekarang!</p>
                </div>
              </RevealItem>
            )}
          </RevealGroup>

          <Reveal className="flex flex-col gap-6">
            <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <h2 className="font-heading text-lg font-semibold">Riwayat Terakhir</h2>
                <Link href="/customer/bookings" className="text-sm text-primary hover:underline">Semua</Link>
              </div>
              <div className="mt-6 space-y-4">
                {past.length > 0 ? past.map((booking) => (
                  <Link key={booking.id} href={`/customer/bookings/${booking.id}`} className="group flex items-start gap-4 rounded-xl p-3 hover:bg-muted/30">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-secondary-soft text-secondary-foreground"><ClockIcon className="size-5" /></div>
                    <div className="flex-1 overflow-hidden">
                      <p className="truncate font-medium">{booking.services.map((service) => service.name).join(", ")}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">{formatDateId(parseDateKey(booking.date))}</p>
                    </div>
                    <ArrowRightIcon className="mt-2 size-4 shrink-0 text-muted-foreground opacity-0 group-hover:opacity-100" />
                  </Link>
                )) : <p className="text-sm text-muted-foreground">Belum ada riwayat booking.</p>}
              </div>
            </div>

            <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <h2 className="font-heading text-lg font-semibold">Desain Favorit</h2>
                <Link href="/customer/favorites" className="text-sm text-primary hover:underline">Semua</Link>
              </div>
              {favoriteDesigns.length > 0 ? (
                <div className="mt-6 grid grid-cols-4 gap-2">
                  {favoriteDesigns.map((design) => (
                    <div key={design.id} className="group relative">
                      <Link href={`/gallery/${design.slug}`} className="block">
                        <div className="relative aspect-square overflow-hidden rounded-xl border border-border/60 bg-muted">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={imageUrl(design.imageSeeds[0] ?? "denailss-fallback")} alt={design.title} className="size-full object-cover" />
                        </div>
                      </Link>
                      <Link
                        href={`/booking?design=${design.slug}`}
                        title={`Booking ${design.title}`}
                        className="absolute inset-0 flex items-center justify-center rounded-xl bg-black/0 opacity-0 transition-all group-hover:bg-black/50 group-hover:opacity-100"
                      >
                        <span className="rounded-full bg-primary px-2.5 py-1 text-[10px] font-semibold text-white">Booking</span>
                      </Link>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="mt-6 flex flex-col items-center gap-2 rounded-xl bg-muted/40 py-6 text-center">
                  <HeartIcon className="size-5 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Belum ada desain favorit.</p>
                  <Link href="/gallery" className="text-sm font-medium text-primary hover:underline">Jelajahi Gallery</Link>
                </div>
              )}
            </div>
          </Reveal>
        </div>
      )}
    </div>
  );
}
