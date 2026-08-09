"use client";

import type { GalleryDesign } from "@/types";
import { GALLERY_DESIGNS } from "./designs.mock";

/**
 * Gallery admin store — Epic 5 mock-first seam standing in for the future
 * `gallery` + `gallery_images` repository (TRD §4). Swap for a real API call
 * without touching consumers.
 *
 * State persists to localStorage (`denailss.gallery.admin`) so the owner's
 * catalog edits survive refresh, same as the CRM notes store. The seeded
 * GALLERY_DESIGNS array is the fallback until the first edit.
 */
const STORAGE_KEY = "denailss.gallery.admin";

const SEED: GalleryDesign[] = GALLERY_DESIGNS;

/** Legacy fallback price per difficulty tier for designs saved before the custom `price` field existed. */
const LEGACY_TIER_PRICES: Record<GalleryDesign["difficulty"], number> = {
  easy: 100000,
  medium: 140000,
  complex: 190000,
  "very-complex": 240000,
};

let cached: GalleryDesign[] | null = null;

/** Migrates persisted designs so every entry has a valid numeric `price`. */
function migrate(list: GalleryDesign[]): GalleryDesign[] {
  return list.map((design) => {
    if (typeof design.price === "number" && Number.isFinite(design.price) && design.price > 0) {
      return design;
    }
    const legacy =
      typeof (design as GalleryDesign & { priceFrom?: number }).priceFrom === "number"
        ? (design as GalleryDesign & { priceFrom?: number }).priceFrom!
        : LEGACY_TIER_PRICES[design.difficulty];
    return { ...design, price: legacy };
  });
}

function load(): GalleryDesign[] {
  if (cached) return cached;
  if (typeof window !== "undefined") {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as GalleryDesign[];
        if (Array.isArray(parsed)) {
          cached = migrate(parsed);
          return cached;
        }
      }
    } catch {
      // fall through to seed
    }
  }
  cached = migrate([...SEED]);
  return cached;
}

/**
 * Client-safe read of the live catalog. Server components cannot run this
 * (it touches localStorage), so they must render a client-side "catalog
 * provider" boundary instead. Client components may call it directly.
 */
export function getGalleryDesigns(): GalleryDesign[] {
  return load();
}

/**
 * Reactive, SSR-safe catalog store. Works in server components (returns the
 * seed) and on the client (returns the owner's persisted catalog, and
 * re-renders subscribers when it changes). This is the seam the public
 * gallery/booking/landing surfaces read from so admin edits show up live.
 */
const subscribers = new Set<() => void>();

export function subscribeGalleryDesigns(cb: () => void): () => void {
  subscribers.add(cb);
  return () => {
    subscribers.delete(cb);
  };
}

function notify() {
  subscribers.forEach((cb) => cb());
}

export function getLiveGalleryDesigns(): GalleryDesign[] {
  if (typeof window !== "undefined") {
    return load();
  }
  return [...SEED];
}

export function subscribeLiveGalleryDesigns(cb: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  subscribers.add(cb);
  return () => {
    subscribers.delete(cb);
  };
}

function save(list: GalleryDesign[]) {
  cached = list;
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    } catch {
      // storage unavailable (private mode etc.) — keep in-memory state
    }
  }
  notify();
}

export function getGalleryDesignById(id: string): GalleryDesign | undefined {
  return load().find((d) => d.id === id);
}

export function upsertGalleryDesign(
  design: GalleryDesign,
  mode: "create" | "update"
): GalleryDesign[] {
  const list = load();
  if (mode === "update") {
    const idx = list.findIndex((d) => d.id === design.id);
    if (idx === -1) return list;
    const next = [...list];
    next[idx] = design;
    save(next);
    return next;
  }
  const next = [design, ...list];
  save(next);
  return next;
}

export function deleteGalleryDesign(id: string): GalleryDesign[] {
  const next = load().filter((d) => d.id !== id);
  save(next);
  return next;
}
