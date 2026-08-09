import Link from "next/link";
import {
  CalendarCheckIcon,
  CheckCircleIcon,
  ClockIcon,
  MapPinIcon,
  WhatsappLogoIcon,
} from "@phosphor-icons/react/dist/ssr";
import { Button } from "@/components/ui/button";
import { formatDateId, formatIDR, parseDateKey } from "@/lib/format";
import { SITE, whatsappLink } from "@/constants/site";
import { DIFFICULTY_LABELS } from "@/features/gallery/constants";
import type { FulfillmentMethod } from "@/features/booking/types";
import type { Service, GalleryDesign } from "@/types";

const FULFILLMENT_LABELS: Record<FulfillmentMethod, string> = {
  pickup: "Ambil di lokasi",
  delivery: "Dikirim via kurir",
};

export function StepConfirmation({
  bookingCode,
  services,
  design,
  dateKey,
  time,
  fulfillment,
  total,
  depositAmount,
  depositRequired,
}: {
  bookingCode: string;
  services: Service[];
  design: GalleryDesign | null;
  dateKey: string | null;
  time: string | null;
  fulfillment: FulfillmentMethod | null;
  total: number;
  depositAmount: number;
  depositRequired: boolean;
}) {
  const hasEstimate = services.some((s) => s.priceNote);

  return (
    <div className="text-center">
      <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-secondary-soft">
        <CheckCircleIcon weight="fill" className="size-9 text-primary" />
      </div>
      <h2 className="mt-5 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
        Booking berhasil dibuat!
      </h2>
      <p className="mt-2 text-sm text-muted-foreground">
        Kode booking-mu: <span className="font-semibold text-foreground">{bookingCode}</span>
      </p>

      <div className="mx-auto mt-6 max-w-md rounded-2xl border border-border bg-card p-5 text-left">
        {dateKey && (
          <div className="flex items-center gap-2.5">
            <CalendarCheckIcon className="size-4.5 text-primary" />
            <span className="text-sm text-foreground">
              {formatDateId(parseDateKey(dateKey), { withWeekday: true })}
            </span>
          </div>
        )}
        {time && (
          <div className="mt-2.5 flex items-center gap-2.5">
            <ClockIcon className="size-4.5 text-primary" />
            <span className="text-sm text-foreground">{time} WIB</span>
          </div>
        )}
        {dateKey ? (
          <div className="mt-2.5 flex items-center gap-2.5">
            <MapPinIcon className="size-4.5 text-primary" />
            <span className="text-sm text-foreground">{SITE.address}</span>
          </div>
        ) : (
          <div className="flex items-start gap-2.5">
            <span className="text-sm">📦</span>
            <div>
              <p className="text-sm font-semibold text-emerald-600">Pesanan Kuku Palsu (Custom Press-On)</p>
              {fulfillment && (
                <p className="text-xs font-medium text-foreground mt-0.5">
                  {FULFILLMENT_LABELS[fulfillment]}
                </p>
              )}
              <p className="text-[11px] text-muted-foreground mt-0.5">Bisa diambil langsung ke lokasi atau opsi pengiriman paket.</p>
            </div>
          </div>
        )}

        <div className="mt-4 border-t border-border pt-4">
          <div className="flex items-start justify-between gap-4 text-sm">
            <span className="text-muted-foreground shrink-0">Layanan</span>
            <span className="font-medium text-foreground text-right">{services.map((s) => s.name).join(", ")}</span>
          </div>
          {design && (
            <div className="mt-1.5 flex items-center justify-between gap-4 text-sm">
              <span className="text-muted-foreground shrink-0">Desain</span>
              <span className="font-medium text-foreground text-right">
                {design.title}
                <span className="block text-[11px] text-muted-foreground">
                  Kesulitan {DIFFICULTY_LABELS[design.difficulty]}
                </span>
              </span>
            </div>
          )}
          <div className="mt-1.5 flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Total {hasEstimate ? "estimasi" : ""}</span>
            <span className="font-medium text-foreground">{formatIDR(total)}</span>
          </div>
          {hasEstimate && (
            <p className="mt-1.5 text-[11px] leading-snug text-muted-foreground">
              Harga final sesuai desain yang kamu pilih atau request — dikonfirmasi via WhatsApp sebelum dikerjakan.
            </p>
          )}
          {depositRequired && (
            <>
              <div className="mt-1.5 flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Deposit dibayar</span>
                <span className="font-medium text-foreground">{formatIDR(depositAmount)}</span>
              </div>
              <div className="mt-1.5 flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Status deposit</span>
                <span className="font-medium text-secondary-foreground/80">Menunggu verifikasi</span>
              </div>
            </>
          )}
        </div>
      </div>

      <p className="mx-auto mt-5 max-w-md text-sm text-muted-foreground">
        {!dateKey
          ? "Tim kami akan menghubungi Kakak lewat WhatsApp untuk konfirmasi ukuran kuku palsu (custom sizing) dan detail pengiriman/penjemputan."
          : depositRequired
          ? "Tim kami akan verifikasi bukti transfer deposit-mu dan mengonfirmasi jadwal lewat WhatsApp dalam 1 jam."
          : "Simpan kode booking ini. Kami akan kirim pengingat lewat WhatsApp sehari sebelum jadwalmu."}
      </p>

      <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
        <Button size="lg" className="h-12 w-full rounded-full sm:w-auto sm:px-8" nativeButton={false} render={<Link href="/" />}>
          Selesai
        </Button>
        <Button
          variant="outline"
          size="lg"
          className="h-12 w-full rounded-full sm:w-auto sm:px-8"
          nativeButton={false}
          render={
            <a
              href={whatsappLink(`Halo Denailss, aku sudah booking dengan kode ${bookingCode}`)}
              target="_blank"
              rel="noopener noreferrer"
            />
          }
        >
          <WhatsappLogoIcon weight="fill" className="size-4" />
          Chat WhatsApp
        </Button>
      </div>
    </div>
  );
}
