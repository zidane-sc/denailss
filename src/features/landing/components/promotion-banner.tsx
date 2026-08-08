"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import { ArrowRightIcon, CaretLeftIcon, CaretRightIcon } from "@phosphor-icons/react/dist/ssr";
import { Reveal } from "@/components/motion/reveal";
import { getActivePromotions } from "@/features/promotion/data/promotions.mock";
import { formatDateId, formatIDR } from "@/lib/format";
import { picsumUrl } from "@/lib/images";
import type { ReactNode } from "react";
import type { Promotion } from "@/types";

const AUTOPLAY_MS = 6000;

function discountLabel(promotion: Promotion) {
  return promotion.discountType === "percentage"
    ? `${promotion.discountValue}%`
    : formatIDR(promotion.discountValue);
}

function MetaItem({ label, children }: { label: string; children: ReactNode }) {
  return (
    <span className="flex items-baseline gap-1.5">
      <span className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground/80">{label}</span>
      <b className="font-semibold text-foreground">{children}</b>
    </span>
  );
}

function PromotionSlide({ promotion }: { promotion: Promotion }) {
  const remaining = Math.max(promotion.usageLimit - promotion.usedCount, 0);

  return (
    <div className="grid w-full shrink-0 md:grid-cols-2">
      <div className="flex flex-col gap-2.5 p-6 sm:p-10 md:p-12">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
          Promo bulan ini
        </p>

        <div className="mt-2 flex items-baseline gap-2.5">
          <p className="font-heading text-5xl font-semibold leading-[1.05] tracking-tight text-foreground tabular-nums sm:text-6xl">
            {discountLabel(promotion)}
          </p>
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            potongan harga
          </p>
        </div>

        <h3 className="mt-2 text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
          {promotion.title}
        </h3>
        <p className="mt-1 max-w-[46ch] text-sm leading-relaxed text-muted-foreground sm:text-base">
          {promotion.description}
        </p>

        <div className="mt-auto flex flex-col gap-5 pt-6">
          <dl className="flex flex-wrap gap-x-6 gap-y-2 border-t border-border/70 pt-4 font-mono text-xs tabular-nums">
            <MetaItem label="kode">{promotion.code}</MetaItem>
            <MetaItem label="berlaku s.d.">{formatDateId(new Date(promotion.endDate))}</MetaItem>
            <MetaItem label="sisa kuota">
              {remaining > 0
                ? `${remaining} dari ${promotion.usageLimit}`
                : "hampir habis"}
            </MetaItem>
          </dl>

          <Link
            href={`/booking?promo=${promotion.code}`}
            className="inline-flex h-11 w-full items-center justify-center gap-1.5 rounded-full bg-primary text-sm font-semibold text-primary-foreground transition-[background-color,transform] duration-300 hover:-translate-y-0.5 hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring active:scale-[0.98] sm:w-auto sm:px-7"
          >
            Pakai Promo
            <ArrowRightIcon className="size-4" />
          </Link>
        </div>
      </div>

      <div className="relative min-h-52 h-full md:min-h-[22rem]">
        <Image
          src={picsumUrl(promotion.imageSeed ?? "promo-default", "landscape", 1.2)}
          alt={`Hasil nail art untuk promo ${promotion.title}`}
          fill
          sizes="(min-width: 768px) 50vw, 100vw"
          className="object-cover"
        />
      </div>
    </div>
  );
}

export function PromotionBanner() {
  const promotions = getActivePromotions();
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const reduce = useReducedMotion();

  const count = promotions.length;
  const goTo = useCallback(
    (next: number) => setIndex(((next % count) + count) % count),
    [count]
  );

  useEffect(() => {
    if (paused || reduce || count <= 1) return;
    const timer = setInterval(() => setIndex((i) => (i + 1) % count), AUTOPLAY_MS);
    return () => clearInterval(timer);
  }, [paused, reduce, count]);

  if (count === 0) return null;

  return (
    <section className="py-2 sm:py-4" aria-label="Daftar promo">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal>
          <div
            className="relative overflow-hidden rounded-[2.5rem] border border-border/70 bg-card shadow-[0_20px_40px_-15px_rgba(23,21,21,0.08)]"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
          >
            <div className="flex overflow-hidden">
              <motion.div
                className="flex"
                animate={{ x: reduce ? 0 : `-${index * 100}%` }}
                transition={{ type: "spring", stiffness: 100, damping: 20 }}
              >
                {promotions.map((promotion) => (
                  <PromotionSlide key={promotion.id} promotion={promotion} />
                ))}
              </motion.div>
            </div>

            {count > 1 && (
              <div className="flex items-center justify-center gap-1.5 border-t border-border/70 bg-muted/40 py-2">
                <button
                  type="button"
                  aria-label="Promo sebelumnya"
                  onClick={() => goTo(index - 1)}
                  className="flex size-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground active:scale-[0.95]"
                >
                  <CaretLeftIcon className="size-4" />
                </button>
                {promotions.map((promotion, i) => (
                  <button
                    key={promotion.id}
                    type="button"
                    aria-label={`Lihat promo ${i + 1}: ${promotion.title}`}
                    aria-current={i === index}
                    onClick={() => goTo(i)}
                    className={`size-1.5 rounded-full transition-all duration-300 ${
                      i === index ? "w-4 bg-primary" : "bg-primary/30 hover:bg-primary/50"
                    }`}
                  />
                ))}
                <button
                  type="button"
                  aria-label="Promo berikutnya"
                  onClick={() => goTo(index + 1)}
                  className="flex size-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground active:scale-[0.95]"
                >
                  <CaretRightIcon className="size-4" />
                </button>
              </div>
            )}
          </div>
        </Reveal>
      </div>
    </section>
  );
}