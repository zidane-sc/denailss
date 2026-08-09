"use client";

import type { Promotion } from "@/types";
import { PROMOTION_SEEDS } from "./promotions.seed";

/**
 * Promotion admin store — Epic 6 mock-first seam standing in for the future
 * `promotions` repository (TRD §4). Swap for a real API call without touching
 * consumers.
 *
 * State persists to localStorage (`denailss.promotion.admin`) so the owner's
 * promotions survive refresh, same as the gallery admin store. The seeded
 * `PROMOTION_SEEDS` array (in `promotions.seed.ts`) is the fallback until the
 * first edit.
 */

const STORAGE_KEY = "denailss.promotion.admin";

/** Legacy fallback for promotions saved before the `active` flag existed. */
function migrateActive(promotion: Promotion): Promotion {
  if (typeof (promotion as Partial<Promotion>).active === "boolean") return promotion;
  return { ...promotion, active: true };
}

let cached: Promotion[] | null = null;

function load(): Promotion[] {
  if (cached) return cached;
  if (typeof window !== "undefined") {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Promotion[];
        if (Array.isArray(parsed)) {
          cached = parsed.map(migrateActive);
          return cached;
        }
      }
    } catch {
      // fall through to seed
    }
  }
  cached = PROMOTION_SEEDS.map(migrateActive);
  return cached;
}

/** Subscriber set for reactive (live) reads of the promotion list. */
const subscribers = new Set<() => void>();

function notify() {
  subscribers.forEach((cb) => cb());
}

/**
 * SSR-safe reactive read. Server components get the seed; client components
 * get the persisted list and re-render when it changes. This is the seam the
 * booking flow / public banner read from so admin edits show up live.
 */
export function getLivePromotions(): Promotion[] {
  if (typeof window !== "undefined") return load();
  return PROMOTION_SEEDS;
}

export function subscribePromotions(cb: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  subscribers.add(cb);
  return () => {
    subscribers.delete(cb);
  };
}

function save(list: Promotion[]) {
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

export function getPromotionById(id: string): Promotion | undefined {
  return load().find((p) => p.id === id);
}

export function getPromotionByCode(code: string): Promotion | undefined {
  const normalized = code.trim().toLowerCase();
  return load().find((p) => p.code.toLowerCase() === normalized);
}

export function upsertPromotion(
  promotion: Promotion,
  mode: "create" | "update"
): Promotion[] {
  const list = load();
  if (mode === "update") {
    const idx = list.findIndex((p) => p.id === promotion.id);
    if (idx === -1) return list;
    const next = [...list];
    next[idx] = promotion;
    save(next);
    return next;
  }
  const next = [promotion, ...list];
  save(next);
  return next;
}
