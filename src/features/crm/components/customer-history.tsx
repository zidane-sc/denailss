"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  StarIcon,
  ArrowUpRightIcon,
  CalendarBlankIcon,
  XCircleIcon,
} from "@phosphor-icons/react/dist/ssr";
import { cn } from "@/lib/utils";
import { formatIDR } from "@/lib/format";
import { imageUrl } from "@/lib/images";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { shortDateId } from "../logic/customer-stats";
import type { CrmAppointment, CrmReview } from "../types";
import { EmptyState } from "./customer-shared";
import type { BookingStatus } from "@/types";

function bookingStatusInfo(status: BookingStatus) {
  switch (status) {
    case "completed":
      return { label: "Selesai", className: "bg-emerald-50 text-emerald-700 border-emerald-100" };
    case "confirmed":
      return { label: "Dikonfirmasi", className: "bg-primary text-primary-foreground border-transparent" };
    case "pending_deposit":
      return { label: "Menunggu Deposit", className: "bg-secondary-soft text-secondary-foreground border-secondary/20" };
    case "waiting_verification":
      return { label: "Butuh Verifikasi", className: "bg-amber-50 text-amber-700 border-amber-100" };
    case "pending":
      return { label: "Menunggu Konfirmasi", className: "bg-muted text-muted-foreground border-border" };
    case "cancelled":
      return { label: "Dibatalkan", className: "bg-destructive/10 text-destructive border-destructive/15" };
    case "no_show":
      return { label: "No Show", className: "bg-rose-50 text-rose-700 border-rose-200" };
  }
}

function AppointmentTimelineEntry({
  entry,
  isLast,
}: {
  entry: CrmAppointment;
  isLast: boolean;
}) {
  const info = bookingStatusInfo(entry.status);
  const isCancellation = entry.status === "cancelled" || entry.status === "no_show";

  return (
    <li className="relative pl-8 pb-5 last:pb-0">
      <span
        aria-hidden="true"
        className={cn(
          "absolute left-[4px] top-6 bottom-0 w-px bg-border/70",
          isLast && "bg-transparent"
        )}
      />
      <span
        aria-hidden="true"
        className={cn(
          "absolute left-0 top-1.5 size-2.5 rounded-full ring-4 ring-background",
          isCancellation ? "bg-destructive/40" : "bg-primary/50"
        )}
      />

      <div className="rounded-xl border border-border/50 bg-background/40 px-4 py-3.5">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <p className="text-xs font-semibold text-foreground">
            {entry.date ? shortDateId(entry.date) : "Pesanan Online"}
            {entry.time ? ` · ${entry.time} WIB` : ""}
          </p>
          <Badge className={cn("font-medium", info.className)}>{info.label}</Badge>
        </div>

        <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
          <div>
            <p className="text-sm font-semibold text-foreground/90">{entry.serviceName}</p>
            {entry.designTitle && (
              <p className="mt-0.5 text-xs text-primary">Design · {entry.designTitle}</p>
            )}
          </div>
          <p className="font-heading text-sm font-semibold text-foreground/90">
            {formatIDR(entry.price)}
          </p>
        </div>

        {entry.note && (
          <p className="mt-2 rounded-lg bg-muted/30 px-2.5 py-1.5 text-[11px] leading-relaxed text-muted-foreground">
            {entry.note}
          </p>
        )}

        {(entry.appointmentUrl || entry.designSlug) && (
          <div className="mt-2.5 flex flex-wrap gap-2">
            {entry.appointmentUrl && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 gap-1 rounded-full px-2.5 text-[11px] text-primary [&>svg]:size-3.5"
                nativeButton={false}
                render={<Link href={entry.appointmentUrl} />}
              >
                <ArrowUpRightIcon />
                Detail Appointment
              </Button>
            )}
            {entry.designSlug && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 gap-1 rounded-full px-2.5 text-[11px] text-foreground/70 [&>svg]:size-3.5"
                nativeButton={false}
                render={<Link href={`/gallery/${entry.designSlug}`} />}
              >
                <ArrowUpRightIcon />
                Lihat Design
              </Button>
            )}
          </div>
        )}
      </div>
    </li>
  );
}

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5" aria-label={`${rating} dari 5 bintang`}>
      {Array.from({ length: 5 }, (_, index) => (
        <StarIcon
          key={index}
          weight={index < rating ? "fill" : "regular"}
          className={cn("size-3.5", index < rating ? "text-secondary" : "text-border")}
        />
      ))}
    </div>
  );
}

function ReviewCard({ review }: { review: CrmReview }) {
  return (
    <div className="rounded-xl border border-border/60 bg-background/40 px-4 py-3.5">
      <div className="flex items-center justify-between gap-2">
        <Stars rating={review.rating} />
        <p className="text-[11px] text-muted-foreground">{shortDateId(review.date)}</p>
      </div>
      <p className="mt-2 text-sm leading-relaxed text-foreground/85">{review.comment}</p>
      <div className="mt-3 flex items-center gap-3">
        {review.photoSeed && (
          <span className="size-12 shrink-0 overflow-hidden rounded-lg border border-border/60">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imageUrl(review.photoSeed)}
              alt="Foto hasil nail art dalam review"
              className="size-full object-cover"
            />
          </span>
        )}
        <div className="text-[11px] text-muted-foreground">
          <p className="font-semibold text-foreground/75">{review.serviceName}</p>
          {review.designSlug ? (
            <Button
              variant="ghost"
              size="sm"
              className="mt-0.5 h-5 gap-1 rounded-full p-0 px-1.5 text-[11px] text-primary [&>svg]:size-3"
              nativeButton={false}
              render={<Link href={`/gallery/${review.designSlug}`} />}
            >
              {review.designTitle ?? review.designSlug} <ArrowUpRightIcon />
            </Button>
          ) : (
            <p className="mb-0.5">{review.designTitle ?? "Terkait kunjungan ini"}</p>
          )}
        </div>
      </div>
    </div>
  );
}

export function CustomerHistory({
  appointments,
  reviews,
}: {
  appointments: CrmAppointment[];
  reviews: CrmReview[];
}) {
  const [tab, setTab] = useState("riwayat");

  const sorted = [...appointments].sort((a, b) =>
    `${b.date}${b.time}`.localeCompare(`${a.date}${a.time}`)
  );
  const cancellations = sorted.filter(
    (a) => a.status === "cancelled" || a.status === "no_show"
  );

  return (
    <section className="rounded-2xl border border-border/70 bg-card p-6 shadow-xs">
      <div className="flex items-center gap-2">
        <span className="flex size-6 items-center justify-center rounded-md bg-accent-soft text-accent [&>svg]:size-3.5">
          <CalendarBlankIcon />
        </span>
        <h3 className="font-heading text-sm font-semibold text-foreground/90">Riwayat</h3>
      </div>

      <Tabs value={tab} onValueChange={setTab} className="mt-4">
        <TabsList className="rounded-xl">
          <TabsTrigger value="riwayat">Riwayat ({appointments.length})</TabsTrigger>
          <TabsTrigger value="pembatalan">Pembatalan ({cancellations.length})</TabsTrigger>
          <TabsTrigger value="ulasan">Ulasan ({reviews.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="riwayat" className="mt-5">
          {sorted.length === 0 ? (
            <EmptyState
              title="Belum ada riwayat kunjungan."
              description="Booking pertama customer ini bakal tercatat di sini."
            />
          ) : (
            <ol className="list-none space-y-1 animate-in fade-in duration-300">
              {sorted.map((entry, index) => (
                <AppointmentTimelineEntry
                  key={entry.id}
                  entry={entry}
                  isLast={index === sorted.length - 1}
                />
              ))}
            </ol>
          )}
        </TabsContent>

        <TabsContent value="pembatalan" className="mt-5">
          {cancellations.length === 0 ? (
            <EmptyState
              title="Aman, belum ada pembatalan ✨"
              description="Tidak ada janji temu yang batal atau hangus."
            />
          ) : (
            <div className="space-y-2.5 animate-in fade-in duration-300">
              {cancellations.map((entry) => (
                <div
                  key={entry.id}
                  className="flex items-start gap-3 rounded-xl border border-border/50 bg-background/40 px-4 py-3"
                >
                  <XCircleIcon className="mt-0.5 size-4 shrink-0 text-destructive/70" />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-xs font-semibold text-foreground/85">
                        {entry.date ? shortDateId(entry.date) : "Pesanan Online"}
                      </p>
                      <Badge className="border-destructive/15 bg-destructive/10 font-medium text-destructive">
                        {entry.status === "no_show" ? "No Show" : "Dibatalkan"}
                      </Badge>
                    </div>
                    <p className="mt-0.5 text-sm text-foreground/80">{entry.serviceName}</p>
                    {entry.cancellationReason && (
                      <p className="mt-1 text-[11px] italic text-muted-foreground">
                        {entry.cancellationReason}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="ulasan" className="mt-5">
          {reviews.length === 0 ? (
            <EmptyState
              title="Belum ada review dari pelanggan ini."
              description="Ulasan bakal muncul setelah pelanggan menilai kunjungannya."
            />
          ) : (
            <div className="space-y-3 animate-in fade-in duration-300">
              {reviews.map((review) => (
                <ReviewCard key={review.id} review={review} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </section>
  );
}