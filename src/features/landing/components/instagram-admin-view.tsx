"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import {
  ArrowUpRightIcon,
  InstagramLogoIcon,
  LinkSimpleIcon,
  PlusIcon,
  TrashIcon,
} from "@phosphor-icons/react/dist/ssr";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { parseInstagramShortcode, INSTAGRAM_POST_URL } from "@/features/landing/logic/instagram";

/**
 * Instagram grid manager — Epic addition. The owner pastes an embed link or
 * embed code from Instagram (post → ⋯ → Embed → Copy embed code), the
 * shortcode is parsed and stored (DB-backed), and the landing grid renders
 * the post photo through the existing `/api/instagram/[shortcode]` proxy.
 */
export function InstagramAdminView() {
  const [posts, setPosts] = useState<string[]>([]);
  const [embedInput, setEmbedInput] = useState("");
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    fetch("/api/v1/instagram", { cache: "no-store" })
      .then(async (res) => {
        if (!res.ok) return;
        const payload = (await res.json()) as { data?: { shortcodes?: string[] } };
        if (active && payload.data?.shortcodes) setPosts(payload.data.shortcodes);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const handleInput = (value: string) => {
    setEmbedInput(value);
    setPreview(parseInstagramShortcode(value));
  };

  const handleAdd = async () => {
    if (!preview) {
      toast.error("Link embed Instagram tidak dikenali.", {
        description: "Tempel URL post atau kode embed dari Instagram.",
      });
      return;
    }
    try {
      const res = await fetch("/api/v1/instagram", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ shortcode: preview }),
      });
      const payload = (await res.json().catch(() => ({}))) as { data?: { list?: string[]; added?: boolean }; error?: { message?: string } };
      if (!res.ok) throw new Error(payload.error?.message ?? "Gagal menambahkan postingan.");
      if (payload.data?.list) setPosts(payload.data.list);
      if (!payload.data?.added) {
        toast.info("Postingan ini sudah ada di grid.");
      } else {
        toast.success("Postingan ditambahkan ke grid.");
      }
      setEmbedInput("");
      setPreview(null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Gagal menambahkan postingan.");
    }
  };

  const handleRemove = async (shortcode: string) => {
    try {
      const res = await fetch("/api/v1/instagram", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ shortcode }),
      });
      const payload = (await res.json().catch(() => ({}))) as { data?: { shortcodes?: string[] }; error?: { message?: string } };
      if (!res.ok) throw new Error(payload.error?.message ?? "Gagal menghapus postingan.");
      if (payload.data?.shortcodes) setPosts(payload.data.shortcodes);
      toast.success("Postingan dihapus dari grid.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Gagal menghapus postingan.");
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl space-y-6 animate-in fade-in duration-300">
        <p className="py-16 text-center text-sm text-muted-foreground">Memuat grid Instagram...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col gap-1 border-b border-border/50 pb-5">
        <h2 className="font-heading text-2xl font-semibold tracking-tight text-foreground/90">
          Grid Instagram
        </h2>
        <p className="text-sm text-muted-foreground">
          Kelola postingan terbaru yang tampil di bagian Instagram halaman utama.
        </p>
      </div>

      {/* Add form */}
      <section className="rounded-2xl border border-border/70 bg-card p-5 shadow-xs sm:p-6">
        <div className="flex items-center gap-2.5">
          <span className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <InstagramLogoIcon weight="fill" className="size-5" />
          </span>
          <div>
            <h3 className="font-heading text-base font-semibold tracking-tight text-foreground/90">
              Tambah Postingan
            </h3>
            <p className="text-xs text-muted-foreground">
              Tempel link post atau kode embed dari Instagram.
            </p>
          </div>
        </div>

        <div className="mt-4 grid gap-2 sm:grid-cols-[1fr_auto]">
          <div className="relative">
            <LinkSimpleIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={embedInput}
              onChange={(e) => handleInput(e.target.value)}
              placeholder="https://www.instagram.com/p/... atau kode embed"
              className="h-11 pl-9"
              aria-label="Link atau kode embed Instagram"
            />
          </div>
          <Button className="h-11 gap-1.5 rounded-full" onClick={handleAdd}>
            <PlusIcon weight="bold" className="size-4" />
            Tambah
          </Button>
        </div>

        {embedInput && (
          <div className="mt-3 flex items-center gap-2 text-[11px]">
            {preview ? (
              <>
                <span className="inline-flex h-5 items-center rounded-full bg-emerald-50 px-2 font-semibold text-emerald-700">
                  Shortcode terdeteksi
                </span>
                <code className="font-mono text-muted-foreground">{preview}</code>
              </>
            ) : (
              <span className="inline-flex h-5 items-center rounded-full bg-destructive/10 px-2 font-semibold text-destructive">
                Link tidak dikenali
              </span>
            )}
          </div>
        )}

        <p className="mt-3 text-[11px] text-muted-foreground">
          Cara ambil embed: buka post di Instagram → ⋯ → Embed → Copy embed code.
        </p>
      </section>

      {/* Grid preview */}
      <section className="rounded-2xl border border-border/70 bg-card p-5 shadow-xs sm:p-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h3 className="font-heading text-base font-semibold tracking-tight text-foreground/90">
              Grid Saat Ini
            </h3>
            <p className="text-xs text-muted-foreground">
              {posts.length} postingan · foto diambil langsung dari Instagram.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="h-9 gap-1.5 rounded-full text-xs"
            nativeButton={false}
            render={<a href="https://www.instagram.com/" target="_blank" rel="noopener noreferrer" />}
          >
            Buka Instagram
            <ArrowUpRightIcon className="size-3.5" />
          </Button>
        </div>

        {posts.length === 0 ? (
          <div className="mt-4 flex flex-col items-center justify-center rounded-2xl border border-dashed border-border py-12 text-center">
            <span className="flex size-12 items-center justify-center rounded-2xl bg-muted/60 text-primary">
              <InstagramLogoIcon className="size-6" />
            </span>
            <p className="mt-3 text-sm font-semibold text-foreground/85">Grid masih kosong.</p>
            <p className="mt-1 max-w-xs text-xs leading-relaxed text-muted-foreground">
              Tambahkan postingan pertama lewat form di atas supaya grid Instagram tampil di
              halaman utama.
            </p>
          </div>
        ) : (
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {posts.map((shortcode) => (
              <div
                key={shortcode}
                className="group relative aspect-square overflow-hidden rounded-2xl border border-border/60 bg-muted/30"
              >
                <Image
                  src={`/api/instagram/${shortcode}`}
                  alt="Postingan Instagram Denailss"
                  fill
                  sizes="(min-width: 1024px) 16rem, 45vw"
                  unoptimized
                  className="object-cover"
                />
                <div className="absolute inset-0 flex items-end justify-between bg-black/0 p-2 transition-colors duration-300 group-hover:bg-black/45">
                  <a
                    href={INSTAGRAM_POST_URL(shortcode)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex size-8 items-center justify-center rounded-full bg-white/90 text-foreground opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                    aria-label="Buka postingan di Instagram"
                  >
                    <ArrowUpRightIcon className="size-4" />
                  </a>
                  <button
                    type="button"
                    onClick={() => handleRemove(shortcode)}
                    className="flex size-8 items-center justify-center rounded-full bg-white/90 text-destructive opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                    aria-label="Hapus postingan"
                  >
                    <TrashIcon className="size-4" />
                  </button>
                </div>
                <code className="absolute bottom-2 left-2 hidden max-w-[80%] truncate rounded-full bg-black/50 px-2 py-0.5 font-mono text-[10px] text-white/90 sm:block">
                  {shortcode}
                </code>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
