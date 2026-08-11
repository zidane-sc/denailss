"use client";

import React, { useCallback, useEffect, useState } from "react";
import type { AvailabilityConfig } from "@/types";

/**
 * Client-only boundary for the DB-backed availability config. Fetches
 * `GET /api/v1/availability` on mount + window focus so the booking slot
 * engine and backoffice editor stay in sync.
 */
const AvailabilityContext = React.createContext<AvailabilityConfig | null>(null);
const AvailabilityRefreshContext = React.createContext<() => void>(() => {});

export function AvailabilityProvider({ children }: { children: React.ReactNode }) {
  const [config, setConfig] = useState<AvailabilityConfig | null>(null);

  const refresh = useCallback(() => {
    fetch("/api/v1/availability", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .then((payload: { data?: AvailabilityConfig } | null) => {
        if (payload?.data) setConfig(payload.data);
      })
      .catch(() => {
        // keep the current config; next focus/refresh retries
      });
  }, []);

  useEffect(() => {
    refresh();
    window.addEventListener("focus", refresh);
    return () => window.removeEventListener("focus", refresh);
  }, [refresh]);

  return (
    <AvailabilityRefreshContext.Provider value={refresh}>
      <AvailabilityContext.Provider value={config}>
        {children}
      </AvailabilityContext.Provider>
    </AvailabilityRefreshContext.Provider>
  );
}

export function useAvailabilityConfig() {
  return React.useContext(AvailabilityContext);
}

export function useAvailabilityRefresh() {
  return React.useContext(AvailabilityRefreshContext);
}
