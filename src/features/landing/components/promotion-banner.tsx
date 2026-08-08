import Link from "next/link";
import { TicketIcon } from "@phosphor-icons/react/dist/ssr";
import { Reveal } from "@/components/motion/reveal";
import { getActivePromotion } from "@/features/promotion/data/promotions.mock";
import { formatDateId } from "@/lib/format";

export function PromotionBanner() {
  const promotion = getActivePromotion();
  if (!promotion) return null;

  return (
    <section className="py-4 sm:py-6">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal>
          <div className="relative overflow-hidden rounded-3xl bg-primary px-6 py-8 text-primary-foreground sm:px-10 sm:py-10">
            <TicketIcon
              weight="duotone"
              className="pointer-events-none absolute -right-4 -top-6 size-32 rotate-12 text-white/15 sm:size-44"
            />
            <div className="relative flex flex-col items-start gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="max-w-md">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/80">
                  Promo berlaku sampai {formatDateId(new Date(promotion.endDate))}
                </p>
                <h3 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
                  {promotion.title}
                </h3>
                <p className="mt-2 text-sm text-white/85 sm:text-base">{promotion.description}</p>
              </div>
              <Link
                href={`/booking?promo=${promotion.code}`}
                className="inline-flex h-12 shrink-0 items-center justify-center rounded-full bg-white px-6 text-base font-semibold text-primary transition-transform hover:scale-[1.03]"
              >
                Pakai Promo
              </Link>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
