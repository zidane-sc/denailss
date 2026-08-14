"use client";

import React, { useCallback, useEffect, useState } from "react";
import type { DepositConfig } from "@/types";

/**
 * Client-only boundary for the DB-backed deposit configuration. Fetches
 * `GET /api/v1/deposit-config` on mount + window focus so the booking deposit
 * step and backoffice editor stay in sync.
 */
const DepositConfigContext = React.createContext<DepositConfig | null>(null);
const DepositConfigRefreshContext = React.createContext<() => void>(() => {});

export function DepositConfigProvider({ children }: { children: React.ReactNode }) {
  const [config, setConfig] = useState<DepositConfig | null>(null);

  const refresh = useCallback(() => {
    fetch("/api/v1/deposit-config")
      .then((res) => (res.ok ? res.json() : null))
      .then((payload: { data?: DepositConfig } | null) => {
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
    <DepositConfigRefreshContext.Provider value={refresh}>
      <DepositConfigContext.Provider value={config}>
        {children}
      </DepositConfigContext.Provider>
    </DepositConfigRefreshContext.Provider>
  );
}

export function useDepositConfig() {
  return React.useContext(DepositConfigContext);
}

export function useDepositConfigRefresh() {
  return React.useContext(DepositConfigRefreshContext);
}
