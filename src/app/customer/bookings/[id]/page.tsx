import Link from "next/link";
import { notFound } from "next/navigation";
import { Reveal } from "@/components/motion/reveal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CUSTOMER_BOOKINGS } from "@/features/customer/data/customer.mock";
import { formatIDR, formatDateId, parseDateKey } from "@/lib/format";
import { ArrowLeftIcon, ClockIcon, MapPinIcon, WarningCircleIcon } from "@phosphor-icons/react/dist/ssr";
import { SITE, whatsappLink } from "@/constants/site";

export default async function BookingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const booking = CUSTOMER_BOOKINGS.find((b) => b.id === id);

  if (!booking) {
    notFound();
  }

  function getStatusBadge() {
    if (booking?.status === "cancelled") return <Badge variant="destructive">Dibatalkan</Badge>;
    if (booking?.status === "completed") return <Badge variant="outline">Selesai</Badge>;
    if (booking?.status === "confirmed") return <Badge variant="default">Dikonfirmasi</Badge>;
    if (booking?.status === "pending_deposit") return <Badge variant="destructive">Menunggu Pembayaran</Badge>;
    if (booking?.status === "waiting_verification") return <Badge variant="secondary">Menunggu Verifikasi</Badge>;
    return <Badge variant="outline">{booking?.status}</Badge>;
  }

  return (
    <div className="space-y-8 max-w-2xl mx-auto">
      <Reveal>
        <Link 
          href="/customer/bookings" 
          className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          <ArrowLeftIcon className="size-4" />
          Kembali ke riwayat
        </Link>
        <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="font-heading text-2xl font-bold text-foreground">Detail Booking</h1>
            <p className="mt-1 text-sm text-muted-foreground">ID: {booking.id}</p>
          </div>
          {getStatusBadge()}
        </div>
      </Reveal>

      <Reveal delay={0.1}>
        <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-sm">
          <div className="border-b border-border/50 bg-muted/30 p-6">
            <h2 className="font-heading text-xl font-semibold">{booking.serviceName}</h2>
            {booking.designTitle && (
              <p className="mt-1 text-sm text-muted-foreground">Desain: {booking.designTitle}</p>
            )}
            
            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-6">
              <div className="flex items-center gap-2 text-sm font-medium">
                <ClockIcon className="size-5 text-primary" />
                {formatDateId(parseDateKey(booking.date), { withWeekday: true })}, {booking.time} WIB
              </div>
            </div>
          </div>
          
          <div className="p-6">
            <h3 className="font-semibold mb-4">Rincian Pembayaran</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Harga Layanan (Estimasi)</span>
                <span className="font-medium">{formatIDR(booking.totalPrice)}</span>
              </div>
              {booking.promoCode && (
                <div className="flex justify-between text-primary">
                  <span>Promo Dipakai</span>
                  <span className="font-medium uppercase">{booking.promoCode}</span>
                </div>
              )}
              <div className="my-4 border-t border-border/50"></div>
              <div className="flex justify-between font-semibold text-lg">
                <span>Total Estimasi</span>
                <span className="text-primary">{formatIDR(booking.totalPrice)}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-2 text-right">
                *Total harga final mungkin disesuaikan di studio jika ada penambahan layanan.
              </p>
            </div>
          </div>
          
          {(booking.status === "pending_deposit" || booking.status === "waiting_verification") && (
            <div className="border-t border-border/50 p-6 bg-accent-soft/30">
              <div className="flex items-start gap-3">
                {booking.status === "pending_deposit" ? (
                  <WarningCircleIcon className="size-6 text-destructive shrink-0 mt-0.5" />
                ) : (
                  <ClockIcon className="size-6 text-secondary shrink-0 mt-0.5" />
                )}
                <div>
                  <h3 className="font-semibold">
                    {booking.status === "pending_deposit" ? "Menunggu Pembayaran Deposit" : "Deposit Sedang Diverifikasi"}
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {booking.status === "pending_deposit" 
                      ? "Harap segera mengunggah bukti transfer deposit agar jadwalmu tidak otomatis dibatalkan." 
                      : "Bukti transfer telah diterima dan sedang kami verifikasi. Status akan diperbarui segera."}
                  </p>
                  
                  {booking.status === "pending_deposit" && (
                    <Button
                      size="lg"
                      className="mt-5 w-full sm:w-auto"
                    >
                      Upload Bukti Transfer
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}
          
          <div className="border-t border-border/50 p-6">
            <h3 className="font-semibold mb-4">Lokasi Studio</h3>
            <div className="flex items-start gap-3 text-sm text-muted-foreground">
              <MapPinIcon className="mt-0.5 size-5 shrink-0 text-primary" />
              <div>
                <p className="font-medium text-foreground">{SITE.name}</p>
                <p className="mt-1">{SITE.address}</p>
                <a
                  href={SITE.mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-block font-medium text-primary hover:underline"
                >
                  Buka di Google Maps
                </a>
              </div>
            </div>
          </div>
        </div>
      </Reveal>
      
      <Reveal delay={0.2}>
        <div className="flex flex-col gap-3">
          {booking.status === "completed" && !booking.hasReview && (
            <Button size="lg" className="w-full">
              Beri Ulasan
            </Button>
          )}
          {(booking.status === "confirmed" || booking.status === "waiting_verification") && (
            <Button
              variant="secondary"
              size="lg"
              className="w-full"
              nativeButton={false}
              render={<a href={whatsappLink(`Halo Denailss, aku mau reschedule booking dengan ID ${booking.id}`)} target="_blank" rel="noopener noreferrer" />}
            >
              Minta Reschedule
            </Button>
          )}
          <Button
            variant="outline"
            size="lg"
            className="w-full"
            nativeButton={false}
            render={<a href={whatsappLink(`Halo Denailss, aku mau tanya tentang booking ID ${booking.id}`)} target="_blank" rel="noopener noreferrer" />}
          >
            Hubungi Admin
          </Button>
        </div>
      </Reveal>
    </div>
  );
}
