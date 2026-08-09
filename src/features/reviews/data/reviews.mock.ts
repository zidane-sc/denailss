import type { Review } from "@/types";
import { REVIEWS } from "./reviews.seed";

/**
 * Reviews store — mock-first seam standing in for the future `reviews`
 * repository (TRD §4). Customers submit reviews from the portal; the public
 * reviews page and landing section read the live list through
 * `getLiveReviews()` so new reviews show up immediately.
 *
 * State persists to localStorage (`denailss.reviews`); the seeded REVIEWS
 * array (in `reviews.seed.ts`) is the fallback until the first submission.
 * Swap this module for a real API call without touching consumers.
 */

const STORAGE_KEY = "denailss.reviews";

let cached: Review[] | null = null;

function load(): Review[] {
  if (cached) return cached;
  if (typeof window !== "undefined") {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Review[];
        if (Array.isArray(parsed)) {
          cached = parsed;
          return cached;
        }
      }
    } catch {
      // fall through to seed
    }
  }
  cached = [...REVIEWS];
  return cached;
}

/** SSR-safe reactive read: server gets the seed, client gets persisted + live. */
export function getLiveReviews(): Review[] {
  if (typeof window !== "undefined") return load();
  return [...REVIEWS];
}

/** Subscriber set for reactive (live) reads of the review list. */
const subscribers = new Set<() => void>();

export function subscribeReviews(cb: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  subscribers.add(cb);
  return () => {
    subscribers.delete(cb);
  };
}

function notify() {
  subscribers.forEach((cb) => cb());
}

function save(list: Review[]) {
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

/** Prepend a new review; the newest reviews appear first on the public page. */
export function addReview(review: Review): Review[] {
  const next = [review, ...load()];
  save(next);
  return next;
}

/** Aggregate rating summary for a list of reviews (SSR-safe via getLiveReviews). */
export function getReviewSummary(list: Review[] = getLiveReviews()) {
  const total = list.length;
  const average = total > 0 ? list.reduce((sum, r) => sum + r.rating, 0) / total : 0;
  return { total, average: Math.round(average * 10) / 10 };
}
