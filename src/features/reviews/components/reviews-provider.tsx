"use client";

import React, { useCallback, useEffect, useState } from "react";
import type { Review } from "@/types";

/**
 * Client-only boundary for the DB-backed review list. Fetches
 * `GET /api/v1/reviews` on mount + window focus so new customer submissions
 * appear on the site without a full reload.
 */
const ReviewsContext = React.createContext<Review[]>([]);
const ReviewsRefreshContext = React.createContext<() => void>(() => {});

export function ReviewsProvider({ children }: { children: React.ReactNode }) {
  const [reviews, setReviews] = useState<Review[]>([]);

  const refresh = useCallback(() => {
    fetch("/api/v1/reviews", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .then((payload: { data?: Review[] } | null) => {
        if (payload?.data) setReviews(payload.data);
      })
      .catch(() => {
        // keep the current list; next focus/refresh retries
      });
  }, []);

  useEffect(() => {
    refresh();
    window.addEventListener("focus", refresh);
    return () => window.removeEventListener("focus", refresh);
  }, [refresh]);

  return (
    <ReviewsRefreshContext.Provider value={refresh}>
      <ReviewsContext.Provider value={reviews}>
        {children}
      </ReviewsContext.Provider>
    </ReviewsRefreshContext.Provider>
  );
}

export function useLiveReviews() {
  return React.useContext(ReviewsContext);
}

export function useReviewsRefresh() {
  return React.useContext(ReviewsRefreshContext);
}
