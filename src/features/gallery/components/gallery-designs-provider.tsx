"use client";

import React, { useEffect, useState } from "react";
import type { GalleryDesign } from "@/types";
import { getLiveGalleryDesigns, subscribeLiveGalleryDesigns } from "../data/gallery-admin.mock";

/**
 * Client-only boundary that makes the admin-managed catalog (localStorage)
 * available to server-rendered pages. Wrap any server component that renders
 * designs — gallery, landing, booking — and read via `useLiveGalleryDesigns`.
 */
const GalleryDesignsContext = React.createContext<GalleryDesign[]>([]);

export function GalleryDesignsProvider({ children }: { children: React.ReactNode }) {
  const [designs, setDesigns] = useState<GalleryDesign[]>(() => getLiveGalleryDesigns());

  useEffect(() => {
    return subscribeLiveGalleryDesigns(() => {
      setDesigns(getLiveGalleryDesigns());
    });
  }, []);

  return (
    <GalleryDesignsContext.Provider value={designs}>
      {children}
    </GalleryDesignsContext.Provider>
  );
}

export function useLiveGalleryDesigns() {
  return React.useContext(GalleryDesignsContext);
}
