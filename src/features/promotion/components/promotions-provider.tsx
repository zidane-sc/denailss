"use client";

import React, { useCallback, useEffect, useState } from "react";
import type { Promotion } from "@/types";

/**
 * Client-only boundary for the DB-backed promotion catalog. Fetches
 * `GET /api/v1/promotions` on mount + window focus so admin edits (and usage
 * increments from new bookings) show up across the site.
 */
const PromotionsContext = React.createContext<Promotion[]>([]);
const PromotionsRefreshContext = React.createContext<() => void>(() => {});

export function PromotionsProvider({ children }: { children: React.ReactNode }) {
  const [promotions, setPromotions] = useState<Promotion[]>([]);

  const refresh = useCallback(() => {
    fetch("/api/v1/promotions", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .then((payload: { data?: Promotion[] } | null) => {
        if (payload?.data) setPromotions(payload.data);
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
    <PromotionsRefreshContext.Provider value={refresh}>
      <PromotionsContext.Provider value={promotions}>
        {children}
      </PromotionsContext.Provider>
    </PromotionsRefreshContext.Provider>
  );
}

export function useLivePromotions() {
  return React.useContext(PromotionsContext);
}

export function usePromotionsRefresh() {
  return React.useContext(PromotionsRefreshContext);
}

/** Active promos for the given reference date (booking flow / landing banner). */
export function useActivePromotions(referenceDate: Date = new Date()) {
  const promotions = useLivePromotions();
  return promotions.filter(
    (promo) =>
      promo.active &&
      new Date(promo.startDate) <= referenceDate &&
      referenceDate <= new Date(`${promo.endDate}T23:59:59`)
  );
}

/** Case-insensitive, trim-normalized code lookup over the live catalog. */
export function usePromotionByCode(code: string | null): Promotion | undefined {
  const promotions = useLivePromotions();
  if (!code) return undefined;
  const normalized = code.trim().toLowerCase();
  return promotions.find((promo) => promo.code.toLowerCase() === normalized);
}
