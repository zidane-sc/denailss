import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Reveal, RevealGroup, RevealItem } from "@/components/motion/reveal";
import { CUSTOMER_PROFILE, CUSTOMER_BOOKINGS, CUSTOMER_FAVORITES } from "@/features/customer/data/customer.mock";
import { getDesignBySlug } from "@/features/gallery/data/designs.mock";
import { GalleryCard } from "@/features/gallery/components/gallery-card";
import { CalendarCheckIcon, ClockIcon, ArrowRightIcon } from "@phosphor-icons/react/dist/ssr";
import { formatDateId } from "@/lib/format";
import { parseDateKey } from "@/lib/format";

export default function CustomerDashboardPage() {
  const firstName = CUSTOMER_PROFILE.name.split(" ")[0];
  
  // Sort bookings newest first
  const sortedBookings = [...CUSTOMER_BOOKINGS].sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );
  
  // Find next upcoming
  const now = new Date("2026-08-09T00:00:00");
  const upcomingBookings = sortedBookings.filter(b => new Date(b.date) >= now && b.status !== "cancelled");
  const nextAppointment = upcomingBookings.length > 0 ? upcomingBookings[0] : null;
  
  // Recent past bookings (descending)
  const pastBookings = [...CUSTOMER_BOOKINGS]
    .filter(b => new Date(b.date) < now)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 3);
    
  // Favorite designs
  const favoriteDesigns = CUSTOMER_FAVORITES
    .map(slug => getDesignBySlug(slug))
    .filter((d): d is NonNullable<typeof d> => Boolean(d))
    .slice(0, 3);

  return (
    <div className="space-y-8">
      <Reveal>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-heading text-3xl font-bold text-foreground">
              Halo, {firstName}! ✨
            </h1>
            <p className="mt-1 text-muted-foreground">
              Selamat datang kembali di area personal kamu.
            </p>
          </div>
          <Button 
            size="lg" 
            className="w-full sm:w-auto"
            nativeButton={false}
            render={<Link href="/booking" />}
          >
            Booking Baru
          </Button>
        </div>
      </Reveal>

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
                    <p className="mt-1 font-heading text-2xl font-bold">{nextAppointment.time} WIB</p>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {nextAppointment.serviceName} {nextAppointment.designTitle && `· ${nextAppointment.designTitle}`}
                    </p>
                  </div>
                  
                  <div className="flex flex-col gap-3 sm:items-end">
                    <Badge 
                      variant={
                        nextAppointment.status === "confirmed" ? "default" :
                        nextAppointment.status === "pending_deposit" ? "destructive" : "secondary"
                      }
                      className="w-fit"
                    >
                      {nextAppointment.status === "confirmed" ? "Dikonfirmasi" : 
                       nextAppointment.status === "pending_deposit" ? "Menunggu Pembayaran" : 
                       "Menunggu Verifikasi"}
                    </Badge>
                    <Button 
                      variant="outline" 
                      size="sm"
                      nativeButton={false}
                      render={<Link href={`/customer/bookings/${nextAppointment.id}`} />}
                    >
                      Lihat Detail
                    </Button>
                  </div>
                </div>
              </div>
            </RevealItem>
          ) : (
            <RevealItem>
              <div className="rounded-3xl border border-border bg-card p-8 text-center shadow-sm">
                <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
                  <CalendarCheckIcon className="size-6" />
                </div>
                <h3 className="mt-4 font-heading text-lg font-semibold">Belum ada jadwal</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Kamu belum punya jadwal booking mendatang. Yuk booking sekarang!
                </p>
              </div>
            </RevealItem>
          )}

          <RevealItem>
            <div className="flex items-center justify-between">
              <h2 className="font-heading text-xl font-semibold">Desain Favorit</h2>
              <Link href="/customer/favorites" className="text-sm font-medium text-primary hover:underline">
                Lihat semua
              </Link>
            </div>
            {favoriteDesigns.length > 0 ? (
              <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3">
                {favoriteDesigns.map((design) => (
                  <GalleryCard key={design.id} design={design} />
                ))}
              </div>
            ) : (
              <div className="mt-4 rounded-2xl border border-border bg-card p-8 text-center">
                <p className="text-sm text-muted-foreground">Belum ada desain favorit disimpan.</p>
              </div>
            )}
          </RevealItem>
        </RevealGroup>

        <Reveal className="flex flex-col gap-6">
          <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="font-heading text-lg font-semibold">Riwayat Terakhir</h2>
              <Link href="/customer/bookings" className="text-sm text-primary hover:underline">
                Semua
              </Link>
            </div>
            
            <div className="mt-6 space-y-4">
              {pastBookings.length > 0 ? pastBookings.map((booking) => (
                <Link 
                  key={booking.id}
                  href={`/customer/bookings/${booking.id}`}
                  className="group flex items-start gap-4 rounded-xl border border-transparent p-3 transition-colors hover:border-border hover:bg-muted/30"
                >
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-secondary-soft text-secondary-foreground">
                    <ClockIcon className="size-5" />
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <p className="truncate font-medium">{booking.serviceName}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {formatDateId(parseDateKey(booking.date))}
                    </p>
                  </div>
                  <ArrowRightIcon className="mt-2 size-4 shrink-0 text-muted-foreground opacity-0 transition-all group-hover:translate-x-1 group-hover:opacity-100" />
                </Link>
              )) : (
                <p className="text-sm text-muted-foreground">Belum ada riwayat booking.</p>
              )}
            </div>
          </div>
        </Reveal>
      </div>
    </div>
  );
}
