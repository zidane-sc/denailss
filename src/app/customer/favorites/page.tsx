"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Reveal } from "@/components/motion/reveal";
import { GalleryCard } from "@/features/gallery/components/gallery-card";
import { HeartIcon } from "@phosphor-icons/react/dist/ssr";
import { Button } from "@/components/ui/button";
import type { GalleryDesign } from "@/types";

export default function FavoritesPage() {
  const [designs, setDesigns] = useState<GalleryDesign[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    Promise.all([
      fetch("/api/v1/gallery", { cache: "no-store" }).then((r) => (r.ok ? r.json() : null)),
      fetch("/api/v1/customer/favorites", { cache: "no-store" }).then((r) => (r.ok ? r.json() : null)),
    ])
      .then(([galleryPayload, favPayload]) => {
        if (!active) return;
        const all = (galleryPayload?.data as GalleryDesign[] | undefined) ?? [];
        const slugs = new Set<string>((favPayload?.data as { slugs?: string[] } | undefined)?.slugs ?? []);
        setDesigns(all.filter((d) => slugs.has(d.slug)));
      })
      .catch(() => {
        // leave empty
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const favoriteDesigns = designs;

  return (
    <div className="space-y-8">
      <Reveal>
        <h1 className="font-heading text-2xl font-bold text-foreground">Favorit Saya</h1>
        <p className="mt-1 text-muted-foreground">Desain kuku yang kamu simpan untuk inspirasi.</p>
      </Reveal>

      {loading ? (
        <p className="py-16 text-center text-sm text-muted-foreground">Memuat favorit...</p>
      ) : favoriteDesigns.length > 0 ? (
        <Reveal delay={0.1}>
          <div className="columns-2 gap-4 sm:columns-3 lg:columns-4">
            {favoriteDesigns.map((design) => (
              <GalleryCard key={design.id} design={design} />
            ))}
          </div>
        </Reveal>
      ) : (
        <Reveal delay={0.1}>
          <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-border bg-card py-20 text-center">
            <div className="flex size-16 items-center justify-center rounded-full bg-muted text-muted-foreground">
              <HeartIcon className="size-8" />
            </div>
            <p className="mt-4 font-heading text-lg font-semibold">Belum ada favorit</p>
            <p className="mt-2 text-sm text-muted-foreground max-w-sm">
              Kamu belum menyimpan desain apapun. Yuk jelajahi gallery dan simpan inspirasi kuku impianmu!
            </p>
            <Button
              className="mt-6"
              nativeButton={false}
              render={<Link href="/gallery" />}
            >
              Jelajahi Gallery
            </Button>
          </div>
        </Reveal>
      )}
    </div>
  );
}
