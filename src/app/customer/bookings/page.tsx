"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Reveal, RevealGroup, RevealItem } from "@/components/motion/reveal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CalendarBlankIcon, ClockIcon } from "@phosphor-icons/react/dist/ssr";
import { formatDateId, parseDateKey, formatIDR } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { CustomerBooking } from "@/features/customer/types";

type TabState = "upcoming" | "past" | "cancelled";
const UPCOMING_STATUSES = ["confirmed", "pending_deposit", "waiting_verification", "pending"];

export default function BookingsPage() {
  const [activeTab, setActiveTab] = useState<TabState>("upcoming");
  const [bookings, setBookings] = useState<CustomerBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch("/api/v1/customer/bookings")
      .then(async (response) => {
        if (!response.ok) throw new Error("bookings");
        const payload = (await response.json()) as { data: CustomerBooking[] };
        setBookings(payload.data);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  const filteredBookings = bookings.filter((booking) => {
    if (activeTab === "cancelled") return booking.status === "cancelled";
    if (activeTab === "past") return booking.status === "completed" || booking.status === "no_show";
    return UPCOMING_STATUSES.includes(booking.status);
  }).sort((a, b) => {
    const timeA = parseDateKey(a.date).getTime();
    const timeB = parseDateKey(b.date).getTime();
    return activeTab === "upcoming" ? timeA - timeB : timeB - timeA;
  });

  function getStatusBadge(booking: CustomerBooking) {
    if (booking.status === "cancelled") return <Badge variant="destructive">Dibatalkan</Badge>;
    if (booking.status === "completed") return <Badge variant="outline">Selesai</Badge>;
    if (booking.status === "confirmed") return <Badge variant="default">Dikonfirmasi</Badge>;
    if (booking.status === "pending_deposit") return <Badge variant="destructive">Menunggu Pembayaran</Badge>;
    if (booking.status === "waiting_verification") return <Badge variant="secondary">Menunggu Verifikasi</Badge>;
    return <Badge variant="outline">{booking.status}</Badge>;
  }

  return (
    <div className="space-y-8">
      <Reveal>
        <h1 className="font-heading text-2xl font-bold text-foreground">Riwayat Booking</h1>
        <p className="mt-1 text-muted-foreground">Kelola jadwal dan riwayat perawatanmu.</p>
      </Reveal>
      <Reveal>
        <div className="flex gap-2 overflow-x-auto border-b border-border pb-px no-scrollbar">
          {(["upcoming", "past", "cancelled"] as const).map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={cn("whitespace-nowrap border-b-2 px-4 py-2 text-sm font-medium transition-colors", activeTab === tab ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground")}>
              {tab === "upcoming" ? "Akan Datang" : tab === "past" ? "Selesai" : "Dibatalkan"}
            </button>
          ))}
        </div>
      </Reveal>
      {loading ? <p className="py-16 text-center text-sm text-muted-foreground">Memuat riwayat booking...</p> : error ? <p className="py-16 text-center text-sm text-destructive">Riwayat booking belum dapat dimuat. Coba refresh halaman.</p> : (
        <RevealGroup key={activeTab} className="flex flex-col gap-4">
          {filteredBookings.length > 0 ? filteredBookings.map((booking) => (
            <RevealItem key={booking.id}>
              <div className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-4">
                  <div className="mt-1 flex size-12 shrink-0 items-center justify-center rounded-full bg-secondary-soft text-secondary-foreground"><CalendarBlankIcon className="size-6" /></div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2"><p className="font-heading text-lg font-semibold">{booking.services.map((s) => s.name).join(", ")}</p>{getStatusBadge(booking)}</div>
                    <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground"><ClockIcon className="size-4" />{booking.date ? `${formatDateId(parseDateKey(booking.date), { withWeekday: true })} · ${booking.time} WIB` : "Pesanan press-on"}</p>
                    <p className="mt-2 text-sm font-medium text-foreground">{formatIDR(booking.totalPrice)}</p>
                  </div>
                </div>
                <Button variant="outline" nativeButton={false} render={<Link href={`/customer/bookings/${booking.id}`} />}>Lihat Detail</Button>
              </div>
            </RevealItem>
          )) : <RevealItem><div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-border bg-card py-16 text-center"><CalendarBlankIcon className="size-8 text-muted-foreground" /><p className="mt-4 font-medium">Belum ada booking</p><p className="mt-1 text-sm text-muted-foreground">Kamu belum memiliki riwayat booking untuk kategori ini.</p>{activeTab === "upcoming" && <Button className="mt-6" nativeButton={false} render={<Link href="/booking" />}>Booking Sekarang</Button>}</div></RevealItem>}
        </RevealGroup>
      )}
    </div>
  );
}
