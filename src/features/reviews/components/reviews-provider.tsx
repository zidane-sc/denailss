"use client";

import React, { useCallback, useEffect, useState } from "react";
import type { Review } from "@/types";

/**
 * Client-only boundary for the DB-backed review list. Fetches
 * `GET /api/v1/reviews` on mount + window focus so new customer submissions
 * appear on the site without a full reload. Also exposes the server-computed
 * summary (live + baseline 300 five-star reviews). Pages seed their sections
 * with server-rendered initial data via props on ReviewsSection/ReviewsExplorer.
 */
const ReviewsContext = React.createContext<Review[]>([]);
const ReviewsSummaryContext = React.createContext<{ total: number; average: number } | null>(null);
const ReviewsRefreshContext = React.createContext<() => void>(() => {});

export function ReviewsProvider({ children }: { children: React.ReactNode }) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [summary, setSummary] = useState<{ total: number; average: number } | null>(null);

  const refresh = useCallback(() => {
    fetch("/api/v1/reviews")
      .then((res) => (res.ok ? res.json() : null))
      .then((payload: { data?: Review[]; meta?: { summary?: { total: number; average: number } } } | null) => {
        if (payload?.data) setReviews(payload.data);
        if (payload?.meta?.summary) setSummary(payload.meta.summary);
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
      <ReviewsSummaryContext.Provider value={summary}>
        <ReviewsContext.Provider value={reviews}>
          {children}
        </ReviewsContext.Provider>
      </ReviewsSummaryContext.Provider>
    </ReviewsRefreshContext.Provider>
  );
}

export function useLiveReviews() {
  return React.useContext(ReviewsContext);
}

export function useReviewSummary() {
  return React.useContext(ReviewsSummaryContext);
}

export function useReviewsRefresh() {
  return React.useContext(ReviewsRefreshContext);
}
