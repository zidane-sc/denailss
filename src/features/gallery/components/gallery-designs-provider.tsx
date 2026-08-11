"use client";

import React, { useCallback, useEffect, useState } from "react";
import type { GalleryDesign } from "@/types";

/**
 * Client-only boundary that makes the DB-backed admin catalog available to
 * server-rendered pages. Fetches `GET /api/v1/gallery` on mount and re-fetches
 * on window focus so backoffice edits show up on the public site without a
 * full reload. Read via `useLiveGalleryDesigns()`.
 */
const GalleryDesignsContext = React.createContext<GalleryDesign[]>([]);
const GalleryDesignsLoadingContext = React.createContext(true);
const GalleryDesignsRefreshContext = React.createContext<() => void>(() => {});

export function GalleryDesignsProvider({ children }: { children: React.ReactNode }) {
  const [designs, setDesigns] = useState<GalleryDesign[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(() => {
    fetch("/api/v1/gallery", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .then((payload: { data?: GalleryDesign[] } | null) => {
        if (payload?.data) setDesigns(payload.data);
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
    <GalleryDesignsLoadingContext.Provider value={isLoading}>
      <GalleryDesignsRefreshContext.Provider value={refresh}>
        <GalleryDesignsContext.Provider value={designs}>
          {children}
        </GalleryDesignsContext.Provider>
      </GalleryDesignsRefreshContext.Provider>
    </GalleryDesignsLoadingContext.Provider>
  );
}

export function useLiveGalleryDesigns() {
  return React.useContext(GalleryDesignsContext);
}

export function useGalleryDesignsLoading() {
  return React.useContext(GalleryDesignsLoadingContext);
}

export function useGalleryDesignsRefresh() {
  return React.useContext(GalleryDesignsRefreshContext);
}
