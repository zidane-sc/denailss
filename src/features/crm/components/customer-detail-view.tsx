"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeftIcon,
  ArrowUpRightIcon,
  CalendarBlankIcon,
  CoinsIcon,
  ClockIcon,
  EnvelopeIcon,
  InstagramLogoIcon,
  PaletteIcon,
  PhoneIcon,
  PlusIcon,
  SparkleIcon,
  SunHorizonIcon,
  WhatsappLogoIcon,
} from "@phosphor-icons/react/dist/ssr";
import { cn } from "@/lib/utils";
import { formatIDR, formatDateId, parseDateKey } from "@/lib/format";
import { imageUrl } from "@/lib/images";
import { useLiveGalleryDesigns } from "@/features/gallery/components/gallery-designs-provider";
import { COLOR_LABELS, SHAPE_LABELS } from "@/features/gallery/constants";
import { Button } from "@/components/ui/button";
import { motion, useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";
import type { CrmCustomerWithData } from "./use-crm-customers";
import {
  computeCustomerStats,
  getCustomerStatus,
  relativeTimeId,
  shortDateId,
  waCustomerLink,
} from "../logic/customer-stats";
import type { CustomerStats } from "../types";
import { CustomerAvatar, CustomerStatusBadge } from "./customer-shared";
import { CustomerNotes } from "./customer-notes";
import { CustomerHistory } from "./customer-history";
import type { DesignColor } from "@/types";

const TIME_LABELS: Record<string, string> = {
  pagi: "Pagi",
  siang: "Siang",
  sore: "Sore",
};

const SWATCH: Record<DesignColor, string> = {
  nude: "#e7d0bd",
  pink: "#f6c1cf",
  red: "#c8455a",
  white: "#f7f7f7",
  black: "#2e2430",
  pastel: "#fbd3e2",
  gold: "#d9b45c",
};

export function CustomerDetailView({ id }: { id: string }) {
  const reduce = useReducedMotion();
  const galleryDesigns = useLiveGalleryDesigns();
  const [customer, setCustomer] = useState<CrmCustomerWithData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    fetch(`/api/v1/crm/customers/${encodeURIComponent(id)}`, { cache: "no-store" })
      .then(async (res) => {
        if (!res.ok) return;
        const payload = (await res.json()) as { data?: CrmCustomerWithData };
        if (active && payload.data) setCustomer(payload.data);
      })
      .catch(() => {
        // leave null
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl space-y-6 animate-in fade-in duration-300">
        <p className="py-16 text-center text-sm text-muted-foreground">Memuat profil pelanggan...</p>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <span className="text-4xl">🔍</span>
        <h3 className="mt-2 font-heading text-lg font-semibold text-foreground/90">
          Pelanggan Tidak Ditemukan
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Profil pelanggan tersebut tidak terdaftar di buku catatan.
        </p>
        <Button
          variant="outline"
          className="mt-6 rounded-xl"
          nativeButton={false}
          render={<Link href="/backoffice/customers" />}
        >
          <ArrowLeftIcon className="mr-2 size-4" /> Kembali ke Daftar Pelanggan
        </Button>
      </div>
    );
  }

  const appointments = customer.appointments;
  const reviews = customer.reviews;
  const stats: CustomerStats = computeCustomerStats(appointments);
  const status = getCustomerStatus(stats);

  const next = stats.nextAppointment;
  const favoriteDesign = stats.favoriteDesignSlug
    ? galleryDesigns.find((d) => d.slug === stats.favoriteDesignSlug)
    : undefined;

  return (
    <div className="mx-auto max-w-5xl space-y-6 animate-in fade-in duration-300">
      {/* Back */}
      <Button
        variant="ghost"
        size="sm"
        className="h-8 gap-1.5 rounded-full pl-2 pr-3 text-muted-foreground hover:text-foreground [&>svg]:size-4"
        nativeButton={false}
        render={<Link href="/backoffice/customers" />}
      >
        <ArrowLeftIcon />
        Daftar Pelanggan
      </Button>

      {/* Header / identity */}
      <motion.div
        initial={reduce ? false : { opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="flex flex-col gap-5 border-b border-border/50 pb-6 md:flex-row md:items-start md:justify-between">
          <div className="flex items-start gap-4">
            <CustomerAvatar name={customer.name} size="lg" />
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <h2 className="font-heading text-2xl font-semibold tracking-tight text-foreground/90">
                  {customer.name}
                </h2>
                <CustomerStatusBadge status={status} />
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                Pelanggan sejak {formatDateId(parseDateKey(customer.since))}
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-foreground/70">
                <span className="inline-flex items-center gap-1.5">
                  <PhoneIcon className="size-3.5 text-primary/70" />
                  {customer.phone}
                </span>
                {customer.email && (
                  <span className="inline-flex items-center gap-1.5">
                    <EnvelopeIcon className="size-3.5 text-primary/70" />
                    {customer.email}
                  </span>
                )}
                {customer.instagram && (
                  <a
                    href={`https://www.instagram.com/${customer.instagram.replace(/^@/, "")}/`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 hover:text-primary transition-colors"
                  >
                    <InstagramLogoIcon className="size-3.5 text-primary/70" />
                    {customer.instagram}
                  </a>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              size="sm"
              className="gap-2 rounded-full px-4 shadow-sm"
              nativeButton={false}
              render={
                <a
                  href={waCustomerLink(
                    customer.phone,
                    `Halo ${customer.name.split(" ")[0]}! Ini Denailss 🖊️`
                  )}
                  target="_blank"
                  rel="noreferrer"
                />
              }
            >
              <WhatsappLogoIcon weight="fill" className="size-4" />
              Chat WhatsApp
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="gap-2 rounded-full px-4"
              nativeButton={false}
              render={<Link href="/backoffice" />}
            >
              <PlusIcon className="size-4" />
              Tambah Booking
            </Button>
          </div>
        </div>

        {/* Next appointment highlight */}
        {next && (
          <div className="mt-5 flex items-center justify-between gap-3 rounded-xl border border-primary/20 bg-primary/5 px-4 py-3">
            <div className="flex items-center gap-3">
              <CalendarBlankIcon className="size-4 shrink-0 text-primary" />
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wide text-primary/80">
                  Janji temu berikutnya
                </p>
                <p className="mt-0.5 text-sm font-semibold text-foreground/85">
                  {shortDateId(next.date)} · {next.time || "jadwal menyusul"} —{" "}
                  {next.serviceName}
                  {next.designTitle ? ` · ${next.designTitle}` : ""}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 gap-1 rounded-full px-2.5 text-[11px] text-primary [&>svg]:size-3.5"
              nativeButton={false}
              render={
                next.appointmentUrl ? <Link href={next.appointmentUrl} /> : <span />
              }
            >
              {next.appointmentUrl ? "Buka Detail" : "Beli berikutnya"}
              {next.appointmentUrl ? <ArrowUpRightIcon /> : null}
            </Button>
          </div>
        )}

        {/* Summary band */}
        <div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatCell
            icon={<CalendarBlankIcon />}
            label="Total Kunjungan"
            value={`${stats.totalVisits}`}
            hint={stats.totalVisits === 0 ? "belum pernah datang" : "kali datang"}
          />
          <StatCell
            icon={<CoinsIcon />}
            label="Total Belanja"
            value={formatIDR(stats.totalSpending)}
            hint="nilai kunjungan selesai"
          />
          <StatCell
            icon={<SparkleIcon />}
            label="Layanan Favorit"
            value={stats.favoriteServiceName ?? "Belum ada"}
            hint={stats.favoriteDesignTitle ? `biasanya ${stats.favoriteDesignTitle}` : undefined}
          />
          <StatCell
            icon={<ClockIcon />}
            label="Kunjungan Terakhir"
            value={stats.lastVisit ? shortDateId(stats.lastVisit) : "Belum ada"}
            hint={
              stats.lastVisit
                ? stats.daysSinceLastVisit === 0
                  ? "Hari ini"
                  : `${relativeTimeId(stats.lastVisit)} lalu`
                : undefined
            }
          />
        </div>
      </motion.div>

      {/* Main grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.6fr_1fr]">
        {/* Left: notes + history */}
        <div className="space-y-6">
          <CustomerNotes customerId={customer.id} initialNotes={customer.notes} />
          <CustomerHistory appointments={appointments} reviews={reviews} />
        </div>

        {/* Right: preferences */}
        <PrefsCard
          favoriteDesignSlug={favoriteDesign?.slug}
          favoriteDesignSeed={favoriteDesign?.imageSeeds[0]}
          preferredTime={customer.preferences?.preferredTime}
          preferredColors={customer.preferences?.preferredColors}
          preferredShapes={customer.preferences?.preferredShapes}
        />
      </div>
    </div>
  );
}

function StatCell({
  icon,
  label,
  value,
  hint,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="rounded-xl border border-border/50 bg-card px-4 py-3.5 shadow-xs">
      <div className="flex items-center gap-2 text-muted-foreground">
        <span className="flex size-6 items-center justify-center rounded-md bg-muted/70 [&>svg]:size-3.5">
          {icon}
        </span>
        <span className="text-[11px] font-semibold">{label}</span>
      </div>
      <p className={cn("mt-2 font-heading text-lg font-semibold text-foreground/90", !value && "text-muted-foreground")}>
        {value}
      </p>
      {hint && <p className="mt-0.5 text-[10px] text-muted-foreground">{hint}</p>}
    </div>
  );
}

function PrefsCard({
  favoriteDesignSlug,
  favoriteDesignSeed,
  preferredTime,
  preferredColors,
  preferredShapes,
}: {
  favoriteDesignSlug?: string;
  favoriteDesignSeed?: string;
  preferredTime?: string;
  preferredColors?: DesignColor[];
  preferredShapes?: string[];
}) {
  const hasAnything =
    favoriteDesignSlug || preferredTime || (preferredColors?.length ?? 0) > 0 || (preferredShapes?.length ?? 0) > 0;

  return (
    <section className="h-fit rounded-2xl border border-border/70 bg-card p-6 shadow-xs">
      <div className="flex items-center gap-2">
        <span className="flex size-6 items-center justify-center rounded-md bg-primary/10 text-primary [&>svg]:size-3.5">
          <PaletteIcon />
        </span>
        <h3 className="font-heading text-sm font-semibold text-foreground/90">Kesukaan &amp; Ciri Khas</h3>
      </div>

      {!hasAnything ? (
        <p className="mt-4 text-sm text-muted-foreground">
          Belum ada data kesukaan untuk pelanggan ini.
        </p>
      ) : (
        <div className="mt-4 space-y-5">
          {favoriteDesignSeed && (
            <Link href={`/gallery/${favoriteDesignSlug}`} className="group block">
              <div className="relative aspect-[4/5] w-full overflow-hidden rounded-xl border border-border/60">
                <Image
                  src={imageUrl(favoriteDesignSeed)}
                  alt={favoriteDesignSlug ?? "Desain favorit"}
                  fill
                  sizes="(min-width: 1024px) 320px, 90vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/60 via-transparent to-transparent p-3">
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-white/75">
                    Desain favorit
                  </p>
                  <p className="flex items-center gap-1 text-sm font-semibold text-white">
                    {favoriteDesignSlug}
                    <ArrowUpRightIcon className="size-3.5" />
                  </p>
                </div>
              </div>
            </Link>
          )}

          {preferredTime && (
            <div className="flex items-center justify-between rounded-xl border border-border/50 bg-muted/25 px-3.5 py-2.5">
              <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                <SunHorizonIcon className="size-4 text-secondary" />
                Sering booking
              </span>
              <span className="text-xs font-semibold text-foreground/80">
                {TIME_LABELS[preferredTime] ?? preferredTime}
              </span>
            </div>
          )}

          {preferredColors && preferredColors.length > 0 && (
            <div>
              <p className="text-[11px] font-semibold text-muted-foreground">Warna Kesukaan</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {preferredColors.map((color) => (
                  <span
                    key={color}
                    className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-background/40 px-2.5 py-1 text-[11px] font-medium text-foreground/75"
                  >
                    <span
                      className="size-2.5 rounded-full ring-1 ring-foreground/15"
                      style={{ backgroundColor: SWATCH[color] }}
                    />
                    {COLOR_LABELS[color]}
                  </span>
                ))}
              </div>
            </div>
          )}

          {preferredShapes && preferredShapes.length > 0 && (
            <div>
              <p className="text-[11px] font-semibold text-muted-foreground">Bentuk Kuku</p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {preferredShapes.map((shape) => (
                  <span
                    key={shape}
                    className="rounded-full border border-border/60 bg-background/40 px-2.5 py-1 text-[11px] font-medium text-foreground/75"
                  >
                    {SHAPE_LABELS[shape as keyof typeof SHAPE_LABELS] ?? shape}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
}