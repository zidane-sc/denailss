"use client";

import React, { useCallback, useEffect, useState } from "react";
import type { Service } from "@/types";

/**
 * Client-only boundary for the DB-backed service catalog. Fetches
 * `GET /api/v1/services` (active + inactive) on mount and re-fetches on window
 * focus so owner edits/toggles show up across the site. Public surfaces filter
 * `active` themselves.
 */
const ServicesContext = React.createContext<Service[]>([]);
const ServicesLoadingContext = React.createContext(true);
const ServicesRefreshContext = React.createContext<() => void>(() => {});

export function ServicesProvider({ children }: { children: React.ReactNode }) {
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(() => {
    fetch("/api/v1/services", { cache: "no-cache" })
      .then((res) => (res.ok ? res.json() : null))
      .then((payload: { data?: Service[] } | null) => {
        if (payload?.data) setServices(payload.data);
      })
      .catch(() => {
        // keep the current list; next focus/refresh retries
      })
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    refresh();
    window.addEventListener("focus", refresh);
    return () => window.removeEventListener("focus", refresh);
  }, [refresh]);

  return (
    <ServicesLoadingContext.Provider value={isLoading}>
      <ServicesRefreshContext.Provider value={refresh}>
        <ServicesContext.Provider value={services}>
          {children}
        </ServicesContext.Provider>
      </ServicesRefreshContext.Provider>
    </ServicesLoadingContext.Provider>
  );
}

export function useLiveServices() {
  return React.useContext(ServicesContext);
}

export function useServicesLoading() {
  return React.useContext(ServicesLoadingContext);
}

export function useServicesRefresh() {
  return React.useContext(ServicesRefreshContext);
}
