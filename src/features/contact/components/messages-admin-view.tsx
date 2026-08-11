"use client";

import React, { useEffect, useState } from "react";
import { EnvelopeIcon, WhatsappLogoIcon, CheckCircleIcon, InstagramLogoIcon } from "@phosphor-icons/react/dist/ssr";
import { toast } from "sonner";
import type { ContactMessage } from "@/types";
import { whatsappLink } from "@/constants/site";
import { Button } from "@/components/ui/button";
import { formatDateId } from "@/lib/format";
import { cn } from "@/lib/utils";

export function MessagesAdminView() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [markingId, setMarkingId] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    fetch("/api/v1/contact-messages", { cache: "no-store" })
      .then(async (res) => {
        if (!res.ok) return;
        const payload = (await res.json()) as { data?: ContactMessage[] };
        if (active && payload.data) setMessages(payload.data);
      })
      .catch(() => {
        if (active) toast.error("Gagal memuat pesan.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const unread = messages.filter((m) => !m.isRead).length;

  const markRead = async (id: string) => {
    if (markingId) return;
    setMarkingId(id);
    try {
      const res = await fetch(`/api/v1/contact-messages/${id}`, { method: "PATCH" });
      if (!res.ok) throw new Error();
      setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, isRead: true } : m)));
    } catch {
      toast.error("Gagal menandai pesan.");
    } finally {
      setMarkingId(null);
    }
  };

  return (
    <div className="mx-auto w-full max-w-5xl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-heading text-xl font-bold text-foreground">Pesan Masuk</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Pesan dari formulir &quot;Kirim Pesan&quot; di halaman kontak.
          </p>
        </div>
        {unread > 0 && (
          <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            {unread} belum dibaca
          </span>
        )}
      </div>

      <div className="mt-6 space-y-3">
        {loading ? (
          <p className="py-12 text-center text-sm text-muted-foreground">Memuat pesan...</p>
        ) : messages.length === 0 ? (
          <div className="rounded-3xl border border-border bg-card px-6 py-16 text-center">
            <EnvelopeIcon className="mx-auto size-8 text-muted-foreground/50" />
            <p className="mt-3 text-sm font-medium text-foreground">Belum ada pesan masuk.</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Pesan dari formulir kontak akan muncul di sini.
            </p>
          </div>
        ) : (
          messages.map((message) => {
            const isExpanded = expandedId === message.id;
            return (
              <div
                key={message.id}
                className={cn(
                  "rounded-2xl border bg-card p-5 transition-colors",
                  message.isRead ? "border-border" : "border-primary/40"
                )}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-sm font-semibold text-foreground">{message.name}</p>
                      {!message.isRead && (
                        <span className="size-2 shrink-0 rounded-full bg-primary" aria-label="Belum dibaca" />
                      )}
                    </div>
                    <p className="mt-0.5 flex flex-wrap items-center gap-x-1.5 text-xs text-muted-foreground">
                      {message.phone} · {message.email}
                      {message.instagram && (
                        <>
                          {" · "}
                          <a
                            href={`https://www.instagram.com/${message.instagram.replace(/^@/, "")}/`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 font-medium text-primary hover:underline"
                          >
                            <InstagramLogoIcon weight="fill" className="size-3.5" />
                            {message.instagram}
                          </a>
                        </>
                      )}{" "}
                      · {formatDateId(new Date(message.createdAt))}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1.5 rounded-xl text-xs"
                      nativeButton={false}
                      render={
                        <a
                          href={whatsappLink(
                            `Halo ${message.name}, ini Denailss membalas pesan Kakak: "${message.message}"`,
                            message.phone
                          )}
                          target="_blank"
                          rel="noopener noreferrer"
                        />
                      }
                    >
                      <WhatsappLogoIcon weight="fill" className="size-3.5 text-emerald-600" />
                      Balas
                    </Button>
                    {!message.isRead && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="gap-1.5 rounded-xl text-xs"
                        disabled={markingId === message.id}
                        onClick={() => markRead(message.id)}
                      >
                        <CheckCircleIcon className="size-3.5" />
                        Tandai dibaca
                      </Button>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setExpandedId(isExpanded ? null : message.id)}
                  className="mt-3 block w-full cursor-pointer text-left text-sm leading-relaxed text-foreground/85"
                >
                  <span className={cn("line-clamp-2", isExpanded && "line-clamp-none")}>
                    {message.message}
                  </span>
                  <span className="mt-1 inline-block text-xs font-medium text-primary">
                    {isExpanded ? "Sembunyikan" : "Baca selengkapnya"}
                  </span>
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
