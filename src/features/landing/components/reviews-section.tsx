"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { StarIcon } from "@phosphor-icons/react/dist/ssr";
import { Reveal, RevealGroup, RevealItem } from "@/components/motion/reveal";
import { useLiveReviews, useReviewSummary } from "@/features/reviews/components/reviews-provider";
import { useLiveServices } from "@/features/services/components/services-provider";
import { imageUrl } from "@/lib/images";
import { formatDateId } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Review } from "@/types";

const ROTATIONS = ["-rotate-1", "rotate-1", "rotate-0", "-rotate-2", "rotate-2", "rotate-0"];

export function ReviewsSection({
  initialReviews = [],
  initialSummary = null,
}: {
  initialReviews?: Review[];
  initialSummary?: { total: number; average: number } | null;
}) {
  const [filter, setFilter] = useState<string>("all");
  const services = useLiveServices();
  const reviews = useLiveReviews();
  const providerSummary = useReviewSummary();
  // Use server-provided data until the client provider hydrates/fetches.
  const summary = providerSummary ?? initialSummary;
  const reviewList = reviews.length > 0 ? reviews : initialReviews;
  const total = summary?.total ?? reviewList.length;
  const average = summary?.average ?? (total > 0 ? reviewList.reduce((sum, r) => sum + r.rating, 0) / total : 0);

  const filtered = useMemo(
    () => (filter === "all" ? reviewList : reviewList.filter((r) => r.serviceSlug === filter)).slice(0, 6),
    [reviewList, filter]
  );

  const usedServiceSlugs = useMemo(
    () => Array.from(new Set(reviewList.map((r) => r.serviceSlug))),
    [reviewList]
  );

  return (
    <section id="ulasan" className="py-16 sm:py-20 lg:py-24">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Ulasan</p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              Kata mereka soal Denailss
            </h2>
          </div>
          <div className="flex items-center gap-2 rounded-2xl bg-muted px-4 py-2.5">
            <StarIcon weight="fill" className="size-5 text-secondary" />
            <span className="text-sm font-semibold text-foreground">
              {average.toFixed(1)} / 5
            </span>
            <span className="text-sm text-muted-foreground">dari {total} ulasan</span>
          </div>
        </Reveal>

        <div className="mt-6 flex flex-wrap gap-2">
          <button
            onClick={() => setFilter("all")}
            className={cn(
              "rounded-full border px-4 py-2 text-sm font-medium transition-colors",
              filter === "all"
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card text-foreground/80 hover:border-primary/50"
            )}
          >
            Semua
          </button>
          {usedServiceSlugs.map((slug) => {
            const service = services.find((s) => s.slug === slug && s.active);
            if (!service) return null;
            return (
              <button
                key={slug}
                onClick={() => setFilter(slug)}
                className={cn(
                  "rounded-full border px-4 py-2 text-sm font-medium transition-colors",
                  filter === slug
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-card text-foreground/80 hover:border-primary/50"
                )}
              >
                {service.name}
              </button>
            );
          })}
        </div>

        <RevealGroup className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((review, index) => (
            <RevealItem
              key={review.id}
              className={cn(
                "rounded-3xl border border-border bg-card p-5 shadow-sm transition-transform hover:-translate-y-1 hover:rotate-0",
                ROTATIONS[index % ROTATIONS.length]
              )}
            >
              <div className="flex items-center gap-3">
                {review.photoSeed ? (
                  <div className="relative size-11 shrink-0 overflow-hidden rounded-full">
                    <Image
                      src={imageUrl(review.photoSeed)}
                      alt={review.customerName}
                      fill
                      sizes="2.75rem"
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-semibold text-primary">
                    {review.customerName.charAt(0)}
                  </div>
                )}
                <div>
                  <p className="text-sm font-semibold text-foreground">{review.customerName}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatDateId(new Date(review.visitDate))}
                  </p>
                </div>
              </div>
              <div className="mt-3 flex gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <StarIcon
                    key={i}
                    weight="fill"
                    className={cn("size-4", i < review.rating ? "text-secondary" : "text-border")}
                  />
                ))}
              </div>
              <p className="mt-3 text-sm leading-relaxed text-foreground/85">{review.comment}</p>
            </RevealItem>
          ))}
        </RevealGroup>
      </div>
    </section>
  );
}
