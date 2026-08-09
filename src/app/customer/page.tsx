"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Reveal, RevealGroup, RevealItem } from "@/components/motion/reveal";
import { CalendarCheckIcon, ClockIcon, ArrowRightIcon } from "@phosphor-icons/react/dist/ssr";
import { formatDateId, parseDateKey } from "@/lib/format";
import { fetchCustomerBookings, fetchCustomerProfile } from "@/features/customer/data/customer-api";
import type { CustomerBooking, CustomerProfile } from "@/features/customer/types";

export default function CustomerDashboardPage() {
  const [profile, setProfile] = useState<CustomerProfile | null>(null);
  const [bookings, setBookings] = useState<CustomerBooking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([fetchCustomerProfile(), fetchCustomerBookings()])
      .then(([nextProfile, nextBookings]) => {
        setProfile(nextProfile);
        setBookings(nextBookings);
      })
      .finally(() => setLoading(false));
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
          </Reveal>
        </div>
      )}
    </div>
  );
}
