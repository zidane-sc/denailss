"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { MagnifyingGlassIcon, SlidersHorizontalIcon, XIcon } from "@phosphor-icons/react/dist/ssr";
import { GalleryCard } from "@/features/gallery/components/gallery-card";
import { useLiveGalleryDesigns, useGalleryDesignsLoading } from "@/features/gallery/components/gallery-designs-provider";
import {
  COLOR_LABELS,
  DIFFICULTY_LABELS,
  GALLERY_PAGE_SIZE,
  OCCASION_LABELS,
  SHAPE_LABELS,
  STYLE_LABELS,
} from "@/features/gallery/constants";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import type {
  DesignColor,
  DesignDifficulty,
  DesignOccasion,
  DesignShape,
  DesignStyle,
  GalleryDesign,
} from "@/types";

type FilterKey = "style" | "color" | "occasion" | "shape" | "difficulty";

const FILTER_GROUPS: { key: FilterKey; label: string; options: Record<string, string> }[] = [
  { key: "style", label: "Style", options: STYLE_LABELS },
  { key: "color", label: "Warna", options: COLOR_LABELS },
  { key: "occasion", label: "Acara", options: OCCASION_LABELS },
  { key: "shape", label: "Bentuk", options: SHAPE_LABELS },
  { key: "difficulty", label: "Kesulitan", options: DIFFICULTY_LABELS },
];

export function GalleryExplorer({ initialDesigns = [] }: { initialDesigns?: GalleryDesign[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const designs = useLiveGalleryDesigns();
  const isLoading = useGalleryDesignsLoading();

  // Server-provided catalog renders on first paint so the page never shows a
  // loading state; the client provider takes over once it hydrates.
  const liveDesigns = designs.length > 0 ? designs : initialDesigns;
  const showSkeleton = isLoading && designs.length === 0 && initialDesigns.length === 0;

  const [search, setSearch] = useState(searchParams.get("q") ?? "");
  const [style, setStyle] = useState<DesignStyle | null>(
    (searchParams.get("style") as DesignStyle) || null
  );
  const [color, setColor] = useState<DesignColor | null>(
    (searchParams.get("color") as DesignColor) || null
  );
  const [occasion, setOccasion] = useState<DesignOccasion | null>(
    (searchParams.get("occasion") as DesignOccasion) || null
  );
  const [shape, setShape] = useState<DesignShape | null>(
    (searchParams.get("shape") as DesignShape) || null
  );
  const [difficulty, setDifficulty] = useState<DesignDifficulty | null>(
    (searchParams.get("difficulty") as DesignDifficulty) || null
  );
  const [visibleCount, setVisibleCount] = useState(GALLERY_PAGE_SIZE);
  const [filtersOpen, setFiltersOpen] = useState(false);

  // Skip the URL-sync effect on first mount: the URL already reflects the
  // initial filters, and dispatching a router action before the App Router
  // queue is initialized (during hydration) throws "Router action dispatched
  // before initialization".
  const isFirstRender = useRef(true);

  const activeValues: Record<FilterKey, string | null> = { style, color, occasion, shape, difficulty };
  const setters: Record<FilterKey, (value: never) => void> = {
    style: setStyle as (value: never) => void,
    color: setColor as (value: never) => void,
    occasion: setOccasion as (value: never) => void,
    shape: setShape as (value: never) => void,
    difficulty: setDifficulty as (value: never) => void,
  };

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    const params = new URLSearchParams();
    if (search) params.set("q", search);
    if (style) params.set("style", style);
    if (color) params.set("color", color);
    if (occasion) params.set("occasion", occasion);
    if (shape) params.set("shape", shape);
    if (difficulty) params.set("difficulty", difficulty);
    const query = params.toString();
    router.replace(query ? `/gallery?${query}` : "/gallery", { scroll: false });
  }, [search, style, color, occasion, shape, difficulty, router]);

  const filterSignature = JSON.stringify([search, style, color, occasion, shape, difficulty]);
  const [appliedSignature, setAppliedSignature] = useState(filterSignature);
  if (filterSignature !== appliedSignature) {
    setAppliedSignature(filterSignature);
    setVisibleCount(GALLERY_PAGE_SIZE);
  }

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return liveDesigns.filter((design) => {
      if (style && design.style !== style) return false;
      if (color && design.color !== color) return false;
      if (occasion && design.occasion !== occasion) return false;
      if (shape && design.shape !== shape) return false;
      if (difficulty && design.difficulty !== difficulty) return false;
      if (query) {
        const haystack = `${design.title} ${design.description}`.toLowerCase();
        if (!haystack.includes(query)) return false;
      }
      return true;
    });
  }, [liveDesigns, search, style, color, occasion, shape, difficulty]);

  const visible = filtered.slice(0, visibleCount);
  const hasMore = visibleCount < filtered.length;

  const sentinelRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!hasMore) return;
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setVisibleCount((count) => count + GALLERY_PAGE_SIZE);
        }
      },
      { rootMargin: "300px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasMore]);

  const activeFilterCount = [style, color, occasion, shape, difficulty].filter(Boolean).length;

  const resetAll = () => {
    setSearch("");
    setStyle(null);
    setColor(null);
    setOccasion(null);
    setShape(null);
    setDifficulty(null);
  };

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <MagnifyingGlassIcon className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari desain, misalnya chrome atau french tip"
            className="h-12 w-full rounded-full border border-border bg-card pl-11 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
          />
        </div>
        <button
          onClick={() => setFiltersOpen((v) => !v)}
          className={cn(
            "flex h-12 shrink-0 items-center justify-center gap-2 rounded-full border px-5 text-sm font-semibold transition-colors",
            filtersOpen || activeFilterCount > 0
              ? "border-primary bg-primary text-primary-foreground"
              : "border-border bg-card text-foreground hover:border-primary/50"
          )}
        >
          <SlidersHorizontalIcon className="size-4" />
          Filter
          {activeFilterCount > 0 && (
            <span className="flex size-5 items-center justify-center rounded-full bg-white/25 text-xs">
              {activeFilterCount}
            </span>
          )}
        </button>
      </div>

      {filtersOpen && (
        <div className="mt-4 space-y-4 rounded-3xl border border-border bg-card p-5">
          {FILTER_GROUPS.map((group) => (
            <div key={group.key}>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                {group.label}
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {Object.entries(group.options).map(([value, label]) => {
                  const active = activeValues[group.key] === value;
                  return (
                    <button
                      key={value}
                      onClick={() => setters[group.key](active ? (null as never) : (value as never))}
                      className={cn(
                        "rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors",
                        active
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border bg-background text-foreground/80 hover:border-primary/50"
                      )}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          {(activeFilterCount > 0 || search) && (
            <button
              onClick={resetAll}
              className="flex items-center gap-1.5 text-sm font-semibold text-primary"
            >
              <XIcon className="size-3.5" />
              Reset semua filter
            </button>
          )}
        </div>
      )}

      <p className="mt-5 text-sm text-muted-foreground">
        {showSkeleton
          ? "Memuat desain..."
          : `Menampilkan ${visible.length} dari ${filtered.length} desain`}
      </p>

      {showSkeleton ? (
        <div className="mt-4 columns-1 gap-4 sm:columns-2 lg:columns-3">
          {Array.from({ length: GALLERY_PAGE_SIZE }).map((_, index) => (
            <div
              key={index}
              className="mb-4 break-inside-avoid overflow-hidden rounded-3xl"
            >
              <Skeleton
                className={cn(
                  "w-full rounded-3xl",
                  index % 3 === 0 && "aspect-[4/5]",
                  index % 3 === 1 && "aspect-square",
                  index % 3 === 2 && "aspect-[16/11]"
                )}
              />
            </div>
          ))}
        </div>
      ) : visible.length > 0 ? (
        <div className="mt-4 columns-1 gap-4 sm:columns-2 lg:columns-3">
          {visible.map((design) => (
            <GalleryCard key={design.id} design={design} />
          ))}
        </div>
      ) : (
        <div className="mt-10 flex flex-col items-center rounded-3xl border border-dashed border-border py-16 text-center">
          <p className="text-base font-semibold text-foreground">Belum ada desain yang cocok</p>
          <p className="mt-1 max-w-xs text-sm text-muted-foreground">
            Coba ubah kata kunci atau reset filter untuk melihat desain lainnya.
          </p>
          <button onClick={resetAll} className="mt-4 text-sm font-semibold text-primary underline-offset-4 hover:underline">
            Reset filter
          </button>
        </div>
      )}

      {hasMore && <div ref={sentinelRef} className="h-1" />}
    </div>
  );
}
