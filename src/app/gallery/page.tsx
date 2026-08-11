import { Suspense } from "react";
import type { Metadata } from "next";
import { GalleryExplorer } from "@/features/gallery/components/gallery-explorer";
import { listCatalogGalleryWithImages } from "@/features/gallery/services/gallery-service";

export const metadata: Metadata = {
  title: "Gallery",
  description:
    "Jelajahi koleksi nail art Denailss, cari berdasarkan style, warna, acara, bentuk, sampai rentang harga.",
  alternates: {
    canonical: "/gallery",
  },
};

export default async function GalleryPage() {
  const initialDesigns = await listCatalogGalleryWithImages();
  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
      <div className="max-w-xl">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          Gallery Desain
        </h1>
        <p className="mt-3 text-base text-muted-foreground">
          Cari inspirasi nail art favoritmu, lalu langsung booking desain yang cocok.
        </p>
      </div>

      <div className="mt-8">
        <Suspense fallback={null}>
          <GalleryExplorer initialDesigns={initialDesigns} />
        </Suspense>
      </div>
    </div>
  );
}
