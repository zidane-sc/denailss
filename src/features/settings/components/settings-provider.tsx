"use client";

import React, { useCallback, useEffect, useState } from "react";
import type { Settings } from "../types";

/**
 * Client-only boundary for the DB-backed settings row. Fetches
 * `GET /api/v1/settings` on mount and re-fetches on window focus so backoffice
 * edits (business profile, logo, social links) show up on the public site
 * without a full reload. Read via `useLiveSettings()`.
 */
const SettingsContext = React.createContext<Settings | null>(null);
const SettingsLoadingContext = React.createContext(true);
const SettingsRefreshContext = React.createContext<() => void>(() => {});

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(() => {
    fetch("/api/v1/settings", { cache: "no-cache" })
      .then((res) => (res.ok ? res.json() : null))
      .then((payload: { data?: Settings } | null) => {
        if (payload?.data) setSettings(payload.data);
      })
      .catch(() => {
        // keep the current value; next focus/refresh retries
      })
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    refresh();
    window.addEventListener("focus", refresh);
    return () => window.removeEventListener("focus", refresh);
  }, [refresh]);

  return (
    <SettingsLoadingContext.Provider value={isLoading}>
      <SettingsRefreshContext.Provider value={refresh}>
        <SettingsContext.Provider value={settings}>
          {children}
        </SettingsContext.Provider>
      </SettingsRefreshContext.Provider>
    </SettingsLoadingContext.Provider>
  );
}

export function useLiveSettings() {
  return React.useContext(SettingsContext);
}

export function useSettingsLoading() {
  return React.useContext(SettingsLoadingContext);
}

export function useSettingsRefresh() {
  return React.useContext(SettingsRefreshContext);
}
