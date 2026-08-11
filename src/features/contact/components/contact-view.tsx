"use client";

import React, { useEffect, useState } from "react";
import {
  WhatsappLogoIcon,
  InstagramLogoIcon,
  TiktokLogoIcon,
  MapPinIcon,
  PhoneIcon,
  EnvelopeIcon,
  ArrowRightIcon,
} from "@phosphor-icons/react/dist/ssr";
import { SITE, whatsappLink } from "@/constants/site";
import type { Settings } from "@/features/settings/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

export function ContactView() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [instagram, setInstagram] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [settings, setSettings] = useState<Settings | null>(null);

  useEffect(() => {
    fetch("/api/v1/settings", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .then((payload: { data?: Settings } | null) => {
        if (payload?.data) setSettings(payload.data);
      })
      .catch(() => {
        // keep the SITE fallback
      });
  }, []);

  const address = settings?.businessProfile.address ?? SITE.address;
  const mapsUrl = settings?.businessProfile.mapsUrl ?? SITE.mapsUrl;
  const whatsappNumber = settings?.socialMedia.whatsapp || SITE.whatsappNumber;
  const instagramHandle = settings?.socialMedia.instagram || SITE.instagramHandle;
  const tiktokHandle = settings?.socialMedia.tiktok || SITE.tiktokHandle;

  // Build the embedded map from the managed coordinates; fall back to the
  // original static embed when they aren't configured yet.
  const latitude = settings?.businessProfile.latitude ?? SITE.latitude;
  const longitude = settings?.businessProfile.longitude ?? SITE.longitude;
  const mapEmbedSrc =
    latitude !== null && longitude !== null
      ? `https://www.google.com/maps?q=${latitude},${longitude}&z=16&output=embed`
      : "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3966.1557999824634!2d106.812345!3d-6.245678!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNsKwMTQnNDQuNCJTIDEwNsKwNDgnNDQuNCJF!5e0!3m2!1sid!2sid!4v1700000000000!5m2!1sid!2sid";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/v1/contact-messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone, email, instagram, message }),
      });
      const payload = (await res.json().catch(() => null)) as
        | { error?: { message?: string } }
        | null;
      if (!res.ok) {
        throw new Error(payload?.error?.message ?? "Pesan gagal terkirim. Coba lagi.");
      }
      toast.success("Pesan Kakak berhasil terkirim! Tim kami akan segera merespon via email/WhatsApp. ✨");
      setName("");
      setPhone("");
      setEmail("");
      setInstagram("");
      setMessage("");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Pesan gagal terkirim. Coba lagi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
      {/* Header */}
      <div className="max-w-2xl text-left border-l-4 border-primary pl-4 sm:pl-5">
        <h1 className="font-heading text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Hubungi Kami &amp; Lokasi Kami
        </h1>
        <p className="mt-3 text-base leading-relaxed text-muted-foreground">
          Punya pertanyaan seputar treatment, pemesanan kuku palsu kustom, atau kemitraan khusus? Hubungi tim Denailss atau kunjungi lokasi kami langsung.
        </p>
      </div>

      <div className="mt-12 grid gap-10 lg:grid-cols-2 lg:gap-14">
        {/* Left Column: Contact details & Map */}
        <div className="space-y-8">

          {/* Lokasi & Alamat */}
          <div className="bg-card border border-border p-6 rounded-3xl shadow-xs space-y-4">
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              <MapPinIcon className="size-5 text-primary" />
              Alamat Lengkap
            </h2>
            <p className="text-sm font-medium text-foreground/80 leading-relaxed">
              {address}
            </p>

            {/* Google Map Iframe */}
            <div className="relative aspect-[16/9] w-full overflow-hidden rounded-2xl border border-border/80 bg-muted mt-4">
              <iframe
                src={mapEmbedSrc}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen={false}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="absolute inset-0 grayscale contrast-110 opacity-85 hover:grayscale-0 hover:opacity-100 transition-all duration-300"
              />
            </div>
            
            <Button
              variant="outline"
              size="sm"
              className="w-full rounded-xl text-xs gap-1.5 mt-2 h-9"
              nativeButton={false}
              render={<a href={mapsUrl} target="_blank" rel="noopener noreferrer" />}
            >
              Petunjuk Arah Google Maps
              <ArrowRightIcon className="size-3.5" />
            </Button>
          </div>

          {/* Social Media & Direct Contact */}
          <div className="bg-card border border-border p-6 rounded-3xl shadow-xs space-y-4">
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              <PhoneIcon className="size-5 text-primary" />
              Kontak &amp; Media Sosial
            </h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs text-foreground/85">
              <a
                href={whatsappLink(undefined, whatsappNumber)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 border border-border/60 hover:border-primary/45 p-3 rounded-2xl hover:bg-muted/15 transition-all"
              >
                <span className="flex size-8 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                  <WhatsappLogoIcon weight="fill" className="size-4.5" />
                </span>
                <div>
                  <p className="text-[10px] text-muted-foreground leading-none">WhatsApp</p>
                  <p className="font-semibold text-foreground mt-1">{whatsappNumber}</p>
                </div>
              </a>

              <a
                href={`https://www.instagram.com/${instagramHandle}/`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 border border-border/60 hover:border-primary/45 p-3 rounded-2xl hover:bg-muted/15 transition-all"
              >
                <span className="flex size-8 items-center justify-center rounded-xl bg-pink-50 text-pink-600">
                  <InstagramLogoIcon weight="fill" className="size-4.5" />
                </span>
                <div>
                  <p className="text-[10px] text-muted-foreground leading-none">Instagram</p>
                  <p className="font-semibold text-foreground mt-1">@{instagramHandle}</p>
                </div>
              </a>

              <a
                href={`https://www.tiktok.com/@${tiktokHandle}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 border border-border/60 hover:border-primary/45 p-3 rounded-2xl hover:bg-muted/15 transition-all"
              >
                <span className="flex size-8 items-center justify-center rounded-xl bg-neutral-100 text-neutral-800">
                  <TiktokLogoIcon weight="fill" className="size-4.5" />
                </span>
                <div>
                  <p className="text-[10px] text-muted-foreground leading-none">TikTok</p>
                  <p className="font-semibold text-foreground mt-1">@{tiktokHandle}</p>
                </div>
              </a>

              <div className="flex items-center gap-3 border border-border/60 p-3 rounded-2xl">
                <span className="flex size-8 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <EnvelopeIcon className="size-4.5" />
                </span>
                <div>
                  <p className="text-[10px] text-muted-foreground leading-none">Email</p>
                  <p className="font-semibold text-foreground mt-1">hello@denailss.beauty</p>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Right Column: Customer Inquiry / Feedback Form */}
        <div className="bg-card border border-border p-6 sm:p-8 rounded-3xl shadow-xs h-fit">
          <h2 className="text-xl font-bold text-foreground/90 font-heading">Kirimkan Pesan</h2>
          <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
            Apakah Kakak ingin berkonsultasi, mengajukan penawaran, atau sekadar memberikan masukan? Tulis pesan di bawah ini.
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="name" className="text-xs font-semibold text-foreground/80">Nama Lengkap *</Label>
              <Input
                id="name"
                required
                placeholder="Contoh: Alya Putri"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="rounded-xl text-xs h-9.5"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="phone" className="text-xs font-semibold text-foreground/80">No. WhatsApp *</Label>
                <Input
                  id="phone"
                  required
                  placeholder="0812xxxx"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="rounded-xl text-xs h-9.5"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email" className="text-xs font-semibold text-foreground/80">Alamat Email *</Label>
                <Input
                  id="email"
                  type="email"
                  required
                  placeholder="alya@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="rounded-xl text-xs h-9.5"
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="instagram" className="text-xs font-semibold text-foreground/80">Instagram <span className="font-normal text-muted-foreground">(opsional)</span></Label>
              <Input
                id="instagram"
                placeholder="@alya.xx"
                value={instagram}
                onChange={(e) => setInstagram(e.target.value)}
                className="rounded-xl text-xs h-9.5"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="message" className="text-xs font-semibold text-foreground/80">Pesan Kakak *</Label>
              <Textarea
                id="message"
                required
                placeholder="Tulis detail pertanyaan atau masukan Kakak di sini..."
                rows={5}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="rounded-2xl text-xs p-3 leading-relaxed"
              />
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-4 rounded-full h-10.5 font-semibold text-sm gap-1.5"
            >
              {isSubmitting ? "Mengirim..." : "Kirim Pesan Sekarang"}
              <ArrowRightIcon className="size-4" />
            </Button>
          </form>
        </div>

      </div>
    </div>
  );
}
