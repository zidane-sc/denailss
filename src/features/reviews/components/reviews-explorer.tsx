"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { StarIcon } from "@phosphor-icons/react/dist/ssr";
import { useLiveReviews } from "./reviews-provider";
import { useLiveServices } from "@/features/services/components/services-provider";
import { formatDateId } from "@/lib/format";
import { imageUrl } from "@/lib/images";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export function ReviewsExplorer() {
  const [ratingFilter, setRatingFilter] = useState("all");
  const [serviceFilter, setServiceFilter] = useState("all");
  const services = useLiveServices();

  const reviews = useLiveReviews();

  const { average, total, counts } = useMemo(() => {
    const totalCount = reviews.length;
    const avg = totalCount > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / totalCount : 0;

    // Distribution of stars
    const dist = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach((r) => {
      const rate = r.rating as 1 | 2 | 3 | 4 | 5;
      if (dist[rate] !== undefined) {
        dist[rate]++;
      }
    });

    return {
      average: avg.toFixed(1),
      total: totalCount,
      counts: dist,
    };
  }, [reviews]);

  const filteredReviews = useMemo(() => {
    return reviews.filter((r) => {
      if (ratingFilter !== "all" && r.rating !== Number(ratingFilter)) {
        return false;
      }
      if (serviceFilter !== "all" && r.serviceSlug !== serviceFilter) {
        return false;
      }
      return true;
    });
  }, [reviews, ratingFilter, serviceFilter]);

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
      {/* Header */}
      <div className="max-w-2xl text-left border-l-4 border-primary pl-4 sm:pl-5">
        <h1 className="font-heading text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Ulasan Kepuasan Pelanggan
        </h1>
        <p className="mt-3 text-base leading-relaxed text-muted-foreground">
          Kebahagiaan kami adalah menghadirkan senyuman indah pada kuku Kakak. Baca cerita pengalaman jujur dari ribuan customer setia yang telah melakukan treatment di Denailss.
        </p>
      </div>

      {/* Summary and Stats Card */}
      <div className="mt-10 grid gap-6 md:grid-cols-[1fr_2fr] border border-border bg-card p-6 rounded-3xl shadow-xs">
        {/* Left Side: Big Rating */}
        <div className="flex flex-col items-center justify-center text-center border-b md:border-b-0 md:border-r border-border/60 pb-6 md:pb-0 md:pr-6">
          <span className="text-5xl font-extrabold text-foreground font-heading">{average}</span>
          <div className="flex items-center gap-1 mt-3">
            {[...Array(5)].map((_, i) => (
              <StarIcon
                key={i}
                weight="fill"
                className={cn(
                  "size-5",
                  i < Math.round(Number(average)) ? "text-secondary" : "text-border"
                )}
              />
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-2 font-medium">Berdasarkan {total} ulasan terverifikasi</p>
        </div>

        {/* Right Side: Star Distribution Bars */}
        <div className="flex flex-col justify-center space-y-2.5">
          {([5, 4, 3, 2, 1] as const).map((star) => {
            const count = counts[star] || 0;
            const percentage = total > 0 ? (count / total) * 100 : 0;
            return (
              <div key={star} className="flex items-center gap-3 text-xs text-foreground/80 font-medium">
                <span className="w-12 text-left">{star} Bintang</span>
                <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full bg-secondary rounded-full"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="w-8 text-right text-muted-foreground">{count}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="mt-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-muted/20 border border-border/40 p-4 rounded-2xl">
        <p className="text-xs font-semibold text-foreground/85">
          Menampilkan <span className="text-primary font-bold">{filteredReviews.length}</span> ulasan
        </p>

        <div className="flex gap-2">
          {/* Rating filter */}
          <select
            value={ratingFilter}
            onChange={(e) => setRatingFilter(e.target.value)}
            className="flex h-9 rounded-xl border border-input bg-card px-3 py-1 text-xs shadow-xs focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring focus-visible:border-primary cursor-pointer"
          >
            <option value="all">Semua Rating</option>
            <option value="5">5 Bintang</option>
            <option value="4">4 Bintang</option>
            <option value="3">3 Bintang</option>
          </select>

          {/* Service filter */}
          <select
            value={serviceFilter}
            onChange={(e) => setServiceFilter(e.target.value)}
            className="flex h-9 rounded-xl border border-input bg-card px-3 py-1 text-xs shadow-xs focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring focus-visible:border-primary cursor-pointer"
          >
            <option value="all">Semua Layanan</option>
            {services.filter((s) => s.active).map((s) => (
              <option key={s.slug} value={s.slug}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Reviews Grid */}
      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filteredReviews.length === 0 ? (
          <div className="col-span-full py-16 text-center bg-card rounded-3xl border border-dashed border-border/80">
            <span className="text-2xl">💅</span>
            <p className="mt-2 text-sm font-semibold text-muted-foreground">Ulasan tidak ditemukan</p>
            <p className="text-xs text-muted-foreground mt-0.5">Cobalah mengubah saringan rating atau layanan.</p>
          </div>
        ) : (
          filteredReviews.map((review) => {
            const service = services.find((s) => s.slug === review.serviceSlug && s.active);
            return (
              <div
                key={review.id}
                className="flex flex-col justify-between border border-border bg-card p-5 rounded-3xl shadow-xs hover:border-primary/30 transition-all duration-300"
              >
                <div>
                  <div className="flex items-center gap-3">
                    {/* Avatar */}
                    {review.photoSeed ? (
                      <div className="relative size-10 overflow-hidden rounded-full border border-border bg-muted shrink-0">
                        <Image
                          src={imageUrl(review.photoSeed)}
                          alt={review.customerName}
                          fill
                          sizes="2.5rem"
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary font-bold shrink-0">
                        {review.customerName.charAt(0)}
                      </div>
                    )}
                    
                    {/* Name & Date */}
                    <div>
                      <p className="text-sm font-semibold text-foreground leading-tight">{review.customerName}</p>
                      <p className="text-[10px] text-muted-foreground mt-1">
                        Kunjungan: {formatDateId(new Date(review.visitDate))}
                      </p>
                    </div>
                  </div>

                  {/* Stars Rating */}
                  <div className="flex items-center gap-0.5 mt-3.5">
                    {[...Array(5)].map((_, i) => (
                      <StarIcon
                        key={i}
                        weight="fill"
                        className={cn("size-3.5", i < review.rating ? "text-secondary" : "text-border")}
                      />
                    ))}
                  </div>

                  {/* Comment */}
                  <p className="mt-3 text-xs leading-relaxed text-foreground/80 italic">
                    &ldquo;{review.comment}&rdquo;
                  </p>
                </div>

                {/* Tagged Service */}
                {service && (
                  <div className="mt-5 border-t border-border/40 pt-3 flex items-center justify-between">
                    <Badge className="bg-primary/5 text-primary text-[10px] rounded-lg border-transparent px-2.5 py-0.5">
                      {service.name}
                    </Badge>
                    <Link
                      href={`/services/${service.slug}`}
                      className="text-[10px] font-semibold text-muted-foreground hover:text-primary transition-colors"
                    >
                      Lihat Treatment &rarr;
                    </Link>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
