"use client";

import React, { useCallback, useEffect, useState } from "react";
import type { AvailabilityConfig } from "@/types";
import type { OccupiedSlot } from "@/features/booking/logic/availability";

/**
 * Client-only boundary for the DB-backed availability config + real booked
 * slots. Fetches `GET /api/v1/availability` on mount + window focus so the
 * booking slot engine and backoffice editor stay in sync.
 */
const AvailabilityContext = React.createContext<AvailabilityConfig | null>(null);
const OccupiedSlotsContext = React.createContext<Record<string, OccupiedSlot[]>>({});
const AvailabilityRefreshContext = React.createContext<() => void>(() => {});

export function AvailabilityProvider({ children }: { children: React.ReactNode }) {
  const [config, setConfig] = useState<AvailabilityConfig | null>(null);
  const [occupiedSlotsByDate, setOccupiedSlotsByDate] = useState<Record<string, OccupiedSlot[]>>({});

  const refresh = useCallback(() => {
    fetch("/api/v1/availability", { cache: "no-cache" })
      .then((res) => (res.ok ? res.json() : null))
      .then((payload: { data?: { config?: AvailabilityConfig; occupiedSlotsByDate?: Record<string, OccupiedSlot[]> } } | null) => {
        if (payload?.data?.config) setConfig(payload.data.config);
        if (payload?.data?.occupiedSlotsByDate) setOccupiedSlotsByDate(payload.data.occupiedSlotsByDate);
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
      <OccupiedSlotsContext.Provider value={occupiedSlotsByDate}>
        <AvailabilityContext.Provider value={config}>
          {children}
        </AvailabilityContext.Provider>
      </OccupiedSlotsContext.Provider>
    </AvailabilityRefreshContext.Provider>
  );
}

export function useAvailabilityConfig() {
  return React.useContext(AvailabilityContext);
}

export function useOccupiedSlotsByDate() {
  return React.useContext(OccupiedSlotsContext);
}

export function useAvailabilityRefresh() {
  return React.useContext(AvailabilityRefreshContext);
}
