"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import { CheckCircleIcon } from "@phosphor-icons/react/dist/ssr";
import { GALLERY_DESIGNS } from "@/features/gallery/data/designs.mock";
import { STYLE_LABELS, COLOR_LABELS, OCCASION_LABELS } from "@/features/gallery/constants";
import { aspectRatioClass, imageUrl } from "@/lib/images";
import { cn } from "@/lib/utils";

export function StepDesign({
  serviceSlugs,
  selectedSlug,
  onSelect,
}: {
  serviceSlugs: string[];
  selectedSlug: string | null;
  onSelect: (slug: string | null) => void;
}) {
  const [search, setSearch] = useState("");
  const [style, setStyle] = useState("all");
  const [color, setColor] = useState("all");
  const [occasion, setOccasion] = useState("all");

  const designs = useMemo(() => {
    const base = serviceSlugs.length > 0
      ? GALLERY_DESIGNS.filter((design) =>
          design.relatedServiceSlugs.some((slug) => serviceSlugs.includes(slug))
        )
      : GALLERY_DESIGNS;

    return base.filter((d) => {
      if (search.trim()) {
        const q = search.trim().toLowerCase();
        if (!d.title.toLowerCase().includes(q)) return false;
      }
      if (style !== "all" && d.style !== style) return false;
      if (color !== "all" && d.color !== color) return false;
      if (occasion !== "all" && d.occasion !== occasion) return false;
      return true;
    });
  }, [serviceSlugs, search, style, color, occasion]);

  return (
    <div>
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-foreground">
            Pilih Desain <span className="text-base font-normal text-muted-foreground">(opsional)</span>
          </h2>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Kasih tau nail artist desain kuku yang kamu inginkan, atau lewati langkah ini.
          </p>
        </div>
        {selectedSlug && (
          <button
            type="button"
            onClick={() => onSelect(null)}
            className="text-sm font-semibold text-primary underline-offset-4 hover:underline"
          >
            Hapus pilihan
          </button>
        )}
      </div>

      {/* Search & Filter Controls */}
      <div className="mt-5 flex flex-col gap-2.5 lg:flex-row lg:items-center">
        {/* Search */}
        <div className="relative flex-1">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama desain..."
            className="flex h-10 w-full rounded-xl border border-input bg-card px-4 py-2 text-xs shadow-xs transition-colors placeholder:text-muted-foreground focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring focus-visible:border-primary"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-muted-foreground hover:text-foreground"
            >
              Bersihkan
            </button>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          {/* Style Filter */}
          <select
            value={style}
            onChange={(e) => setStyle(e.target.value)}
            className="flex h-10 rounded-xl border border-input bg-card px-2.5 py-1 text-xs shadow-xs focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring focus-visible:border-primary cursor-pointer"
          >
            <option value="all">Semua Style</option>
            {Object.entries(STYLE_LABELS).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>

          {/* Color Filter */}
          <select
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="flex h-10 rounded-xl border border-input bg-card px-2.5 py-1 text-xs shadow-xs focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring focus-visible:border-primary cursor-pointer"
          >
            <option value="all">Semua Warna</option>
            {Object.entries(COLOR_LABELS).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>

          {/* Occasion Filter */}
          <select
            value={occasion}
            onChange={(e) => setOccasion(e.target.value)}
            className="flex h-10 rounded-xl border border-input bg-card px-2.5 py-1 text-xs shadow-xs focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring focus-visible:border-primary cursor-pointer"
          >
            <option value="all">Semua Acara</option>
            {Object.entries(OCCASION_LABELS).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Scrollable Grid Box */}
      <div className="mt-4 max-h-[360px] overflow-y-auto pr-1.5 border border-border/40 rounded-2xl p-3 bg-muted/10">
        {designs.length === 0 ? (
          <div className="py-12 text-center">
            <span className="text-xl">💅</span>
            <p className="mt-2 text-xs text-muted-foreground italic">Tidak ada desain kuku yang cocok.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
            {designs.map((design) => {
              const active = selectedSlug === design.slug;
              return (
                <button
                  key={design.id}
                  type="button"
                  onClick={() => onSelect(active ? null : design.slug)}
                  className={cn(
                    "group relative overflow-hidden rounded-xl border-2 transition-all bg-card",
                    active ? "border-primary" : "border-transparent hover:border-border-hover"
                  )}
                >
                  <div className={cn("relative w-full", aspectRatioClass(design.aspect))}>
                    <Image
                      src={imageUrl(design.imageSeeds[0])}
                      alt={design.title}
                      fill
                      sizes="16rem"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/85 via-black/10 to-transparent p-2.5 text-left">
                      <p className="text-[11px] font-semibold text-white leading-tight">{design.title}</p>
                    </div>
                    {active && (
                      <span className="absolute right-2 top-2 flex size-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
                        <CheckCircleIcon weight="fill" className="size-3.5" />
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
