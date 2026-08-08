import Image from "next/image";
import { ClockIcon } from "@phosphor-icons/react/dist/ssr";
import { formatDateId, formatDuration, formatIDR, parseDateKey } from "@/lib/format";
import { imageUrl } from "@/lib/images";
import { DIFFICULTY_LABELS } from "@/features/gallery/constants";
import type { GalleryDesign, Service } from "@/types";

export interface SummaryData {
  services: Service[];
  design: GalleryDesign | null;
  dateKey: string | null;
  time: string | null;
  subtotal: number;
  discount: number;
  total: number;
  depositAmount: number;
  depositRequired: boolean;
  promoCode: string | null;
}

export function BookingSummary({ data }: { data: SummaryData }) {
  const { services, design, dateKey, time, subtotal, discount, total, depositAmount, depositRequired, promoCode } =
    data;

  const hasEstimate = services.some((s) => s.priceNote && !design);

  return (
    <div className="rounded-3xl border border-border bg-card p-5">
      <p className="text-sm font-semibold text-foreground">Ringkasan Booking</p>

      {services.length === 0 ? (
        <p className="mt-3 text-sm text-muted-foreground">Pilih layanan untuk melihat ringkasan.</p>
      ) : (
        <div className="mt-4 space-y-4">
          <div className="space-y-3">
            {services.map((service) => (
              <div key={service.slug} className="flex items-center gap-3 border-b border-border/40 pb-3 last:border-b-0 last:pb-0">
                <div className="relative size-12 shrink-0 overflow-hidden rounded-xl bg-muted">
                  <Image
                    src={imageUrl(service.heroImage)}
                    alt={service.name}
                    fill
                    sizes="3rem"
                    className="object-cover"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-foreground">{service.name}</p>
                  <p className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                    <ClockIcon className="size-3.5" />
                    {formatDuration(service.durationMinutes)}
                  </p>
                  {service.priceNote && !design && (
                    <p className="mt-0.5 text-[11px] leading-snug text-muted-foreground/80">
                      {service.priceNote}
                    </p>
                  )}
                </div>
                <span className="text-xs font-semibold text-foreground shrink-0">
                  {service.priceNote && !design ? `± ${formatIDR(service.priceFrom)}` : formatIDR(service.priceFrom)}
                </span>
              </div>
            ))}
          </div>

          {design && (
            <div className="flex items-center gap-3 border-t border-border pt-4">
              <div className="relative size-12 shrink-0 overflow-hidden rounded-xl">
                <Image
                  src={imageUrl(design.imageSeeds[0])}
                  alt={design.title}
                  fill
                  sizes="3rem"
                  className="object-cover"
                />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">Desain</p>
                <p className="truncate text-sm font-medium text-foreground">{design.title}</p>
                <p className="text-[11px] text-muted-foreground">
                  Tingkat kesulitan: {DIFFICULTY_LABELS[design.difficulty]}
                </p>
              </div>
              <span className="shrink-0 text-xs font-semibold text-foreground">{formatIDR(design.priceFrom)}</span>
            </div>
          )}

          {(dateKey || time) && (
            <div className="rounded-xl bg-muted px-3 py-2.5 text-sm text-foreground/80">
              {dateKey && <p>{formatDateId(parseDateKey(dateKey), { withWeekday: true })}</p>}
              {time && <p className="mt-0.5 font-medium text-foreground">{time} WIB</p>}
            </div>
          )}

          <div className="space-y-1.5 border-t border-border pt-4 text-sm">
            {hasEstimate && (
              <p className="text-[11px] leading-snug text-muted-foreground">
                Estimasi harga — final dikonfirmasi via WhatsApp sesuai desain/request.
              </p>
            )}
            <div className="flex items-center justify-between text-muted-foreground">
              <span>{hasEstimate ? "Estimasi" : "Subtotal"}</span>
              <span>{formatIDR(subtotal)}</span>
            </div>
            {discount > 0 && (
              <div className="flex items-center justify-between text-primary">
                <span>Diskon {promoCode ? `(${promoCode})` : ""}</span>
                <span>-{formatIDR(discount)}</span>
              </div>
            )}
            <div className="flex items-center justify-between pt-1 text-base font-semibold text-foreground">
              <span>{hasEstimate ? "Total estimasi" : "Total"}</span>
              <span>{formatIDR(total)}</span>
            </div>
            {depositRequired && (
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Deposit yang dibayar sekarang</span>
                <span className="font-medium text-foreground">{formatIDR(depositAmount)}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
