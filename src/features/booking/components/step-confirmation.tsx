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
import type { Service, GalleryDesign } from "@/types";

export function StepConfirmation({
  bookingCode,
  service,
  design,
  dateKey,
  time,
  total,
  depositAmount,
  depositRequired,
}: {
  bookingCode: string;
  service: Service;
  design: GalleryDesign | null;
  dateKey: string;
  time: string;
  total: number;
  depositAmount: number;
  depositRequired: boolean;
}) {
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
        <div className="flex items-center gap-2.5">
          <CalendarCheckIcon className="size-4.5 text-primary" />
          <span className="text-sm text-foreground">
            {formatDateId(parseDateKey(dateKey), { withWeekday: true })}
          </span>
        </div>
        <div className="mt-2.5 flex items-center gap-2.5">
          <ClockIcon className="size-4.5 text-primary" />
          <span className="text-sm text-foreground">{time} WIB</span>
        </div>
        <div className="mt-2.5 flex items-center gap-2.5">
          <MapPinIcon className="size-4.5 text-primary" />
          <span className="text-sm text-foreground">{SITE.address}</span>
        </div>

        <div className="mt-4 border-t border-border pt-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Layanan</span>
            <span className="font-medium text-foreground">{service.name}</span>
          </div>
          {design && (
            <div className="mt-1.5 flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Desain</span>
              <span className="font-medium text-foreground">{design.title}</span>
            </div>
          )}
          <div className="mt-1.5 flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Total estimasi</span>
            <span className="font-medium text-foreground">{formatIDR(total)}</span>
          </div>
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
        {depositRequired
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
