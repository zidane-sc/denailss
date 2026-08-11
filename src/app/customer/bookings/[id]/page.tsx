"use client";

import React, { useState, use, useEffect } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Reveal } from "@/components/motion/reveal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { appointmentToCustomerBooking } from "@/features/customer/data/customer-api";
import type { CustomerBooking } from "@/features/customer/types";
import type { Review } from "@/types";
import { formatIDR, formatDateId, parseDateKey } from "@/lib/format";
import {
  ArrowLeftIcon,
  CheckCircleIcon,
  ClockIcon,
  MapPinIcon,
  WarningCircleIcon,
  XCircleIcon,
  StarIcon,
} from "@phosphor-icons/react/dist/ssr";
import { SITE, whatsappLink } from "@/constants/site";
import type { Settings } from "@/features/settings/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";

export default function BookingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [booking, setBooking] = useState<CustomerBooking | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/v1/customer/bookings/${id}`)
      .then(async (response) => {
        if (!response.ok) throw new Error("booking");
        const payload = (await response.json()) as { data: Parameters<typeof appointmentToCustomerBooking>[0] };
        setBooking(appointmentToCustomerBooking(payload.data));
      })
      .catch(() => setBooking(null))
      .finally(() => setLoading(false));
  }, [id]);

  const [hasReview, setHasReview] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [rating, setRating] = useState<number>(5);
  const [comment, setComment] = useState("");
  const [settings, setSettings] = useState<Settings | null>(null);

  // Check whether this booking already has a review (from the live reviews list).
  useEffect(() => {
    let active = true;
    fetch("/api/v1/reviews", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .then((payload: { data?: Review[] } | null) => {
        if (active && payload?.data) {
          const bookingCode = id;
          setHasReview(payload.data.some((r) => (r as Review & { bookingCode?: string }).bookingCode === bookingCode));
        }
      })
      .catch(() => {
        // keep hasReview false
      });
    return () => {
      active = false;
    };
  }, [id]);

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

  const businessName = settings?.businessProfile.name ?? SITE.name;
  const businessAddress = settings?.businessProfile.address ?? SITE.address;
  const whatsappNumber = settings?.socialMedia.whatsapp || SITE.whatsappNumber;

  const handleSendReview = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedComment = comment.trim();
    if (!trimmedComment) {
      toast.error("Tulis dulu ulasan singkatmu sebelum dikirim.");
      return;
    }
    if (!booking) return;
    try {
      const response = await fetch("/api/v1/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingCode: booking.id,
          rating: rating as 1 | 2 | 3 | 4 | 5,
          comment: trimmedComment,
        }),
      });
      const payload = (await response.json().catch(() => ({}))) as { error?: { message?: string } };
      if (!response.ok) throw new Error(payload.error?.message ?? "Ulasan gagal dikirim.");
      setHasReview(true);
      setDialogOpen(false);
      setComment("");
      toast.success("Ulasan Kakak berhasil dikirim! Terima kasih banyak! 💖", {
        description: "Ulasanmu sekarang tampil di halaman ulasan Denailss.",
      });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Ulasan gagal dikirim.");
    }
  };

  function getStatusBadge() {
    if (booking?.status === "cancelled") return <Badge variant="destructive">Dibatalkan</Badge>;
    if (booking?.status === "completed") return <Badge variant="outline">Selesai</Badge>;
    if (booking?.status === "confirmed") return <Badge variant="default">Dikonfirmasi</Badge>;
    if (booking?.status === "pending_deposit") return <Badge variant="destructive">Menunggu Pembayaran</Badge>;
    if (booking?.status === "waiting_verification") return <Badge variant="secondary">Menunggu Verifikasi</Badge>;
    return <Badge variant="outline">{booking?.status}</Badge>;
  }

  if (loading) return <p className="py-16 text-center text-sm text-muted-foreground">Memuat detail booking...</p>;
  if (!booking) return <p className="py-16 text-center text-sm text-destructive">Booking tidak ditemukan atau bukan milik akun ini.</p>;

  return (
    <div className="space-y-8 max-w-2xl mx-auto px-1 animate-in fade-in duration-300">
      <Reveal>
        <Link 
          href="/customer/bookings" 
          className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          <ArrowLeftIcon className="size-4" />
          Kembali ke riwayat
        </Link>
        <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="font-heading text-2xl font-bold text-foreground">Detail Booking</h1>
            <p className="mt-1 text-sm text-muted-foreground">ID: {booking.id}</p>
          </div>
          {getStatusBadge()}
        </div>
      </Reveal>

      <Reveal delay={0.1}>
        <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-sm">
          <div className="border-b border-border/50 bg-muted/30 p-6">
            <h2 className="font-heading text-xl font-semibold">{booking.services.map((s) => s.name).join(", ")}</h2>
            {booking.designTitle && (
              <p className="mt-1 text-sm text-muted-foreground">Desain: {booking.designTitle}</p>
            )}
            {booking.fulfillment && (
              <p className="mt-1 text-sm text-muted-foreground">
                Pengambilan: {booking.fulfillment === "pickup" ? "Ambil di lokasi" : "Dikirim via kurir"}
              </p>
            )}
            
            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-6">
              <div className="flex items-center gap-2 text-sm font-medium">
                <ClockIcon className="size-5 text-primary" />
                {formatDateId(parseDateKey(booking.date), { withWeekday: true })}, {booking.time} WIB
              </div>
            </div>
          </div>
          
          <div className="p-6">
            <h3 className="font-semibold mb-4">Rincian Pembayaran</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Harga Layanan (Estimasi)</span>
                <span className="font-medium">{formatIDR(booking.totalPrice)}</span>
              </div>
              {booking.promoCode && (
                <div className="flex justify-between text-primary">
                  <span>Promo Dipakai</span>
                  <span className="font-medium uppercase">{booking.promoCode}</span>
                </div>
              )}
              <div className="my-4 border-t border-border/50"></div>
              <div className="flex justify-between font-semibold text-lg">
                <span>Total Estimasi</span>
                <span className="text-primary">{formatIDR(booking.totalPrice)}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-2 text-right">
                *Total harga final mungkin disesuaikan di lokasi jika ada penambahan layanan.
              </p>
            </div>
          </div>
          
          {booking.status === "pending_deposit" || booking.status === "waiting_verification" ? (
            <div className="border-t border-border/50 p-6 bg-accent-soft/30">
              <div className="flex items-start gap-3">
                {booking.status === "pending_deposit" ? (
                  <WarningCircleIcon className="size-6 text-destructive shrink-0 mt-0.5" />
                ) : (
                  <ClockIcon className="size-6 text-secondary shrink-0 mt-0.5" />
                )}
                <div>
                  <h3 className="font-semibold">
                    {booking.status === "pending_deposit" ? "Menunggu Pembayaran Deposit" : "Deposit Sedang Diverifikasi"}
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {booking.status === "pending_deposit" 
                      ? "Harap segera mengunggah bukti transfer deposit agar jadwalmu tidak otomatis dibatalkan." 
                      : "Bukti transfer telah diterima dan sedang kami verifikasi. Status akan diperbarui segera."}
                  </p>
                </div>
              </div>
            </div>
          ) : booking.depositStatus === "approved" ? (
            <div className="border-t border-border/50 p-6 bg-emerald-50">
              <div className="flex items-start gap-3">
                <CheckCircleIcon className="size-6 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-emerald-800">Deposit Diterima</h3>
                  <p className="mt-1 text-sm text-emerald-700/80">
                    Bukti transfer deposit kamu sudah diverifikasi. Slot booking aman.
                  </p>
                </div>
              </div>
            </div>
          ) : booking.depositStatus === "rejected" ? (
            <div className="border-t border-border/50 p-6 bg-destructive/5">
              <div className="flex items-start gap-3">
                <XCircleIcon className="size-6 text-destructive shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-destructive">Deposit Ditolak</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {booking.depositRejectReason
                      ? `Alasan: ${booking.depositRejectReason}`
                      : "Bukti transfer belum bisa diverifikasi. Silakan unggah ulang bukti deposit."}
                  </p>
                </div>
              </div>
            </div>
          ) : null}
          
          <div className="border-t border-border/50 p-6">
            <h3 className="font-semibold mb-4">Lokasi Treatment</h3>
            <div className="flex items-start gap-3 text-sm text-muted-foreground">
              <MapPinIcon className="mt-0.5 size-5 shrink-0 text-primary" />
              <div>
                <p className="font-medium text-foreground">{businessName}</p>
                <p className="mt-1">{businessAddress}</p>
                <a
                  href={SITE.mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-block font-medium text-primary hover:underline"
                >
                  Buka di Google Maps
                </a>
              </div>
            </div>
          </div>
        </div>
      </Reveal>
      
      <Reveal delay={0.2}>
        <div className="flex flex-col gap-3">
          {booking.status === "completed" && !hasReview && (
            <Button size="lg" className="w-full" onClick={() => setDialogOpen(true)}>
              Beri Ulasan
            </Button>
          )}
          {booking.status === "completed" && hasReview && (
            <div className="bg-emerald-50 border border-emerald-100 text-emerald-800 p-4 rounded-3xl text-sm text-center font-medium">
              ✨ Terima kasih! Ulasan Kakak sudah tersimpan untuk booking ini.
            </div>
          )}
          {(booking.status === "confirmed" || booking.status === "waiting_verification") && (
            <Button
              variant="secondary"
              size="lg"
              className="w-full"
              nativeButton={false}
              render={<a href={whatsappLink(`Halo Denailss, aku mau reschedule booking dengan ID ${booking.id}`, whatsappNumber)} target="_blank" rel="noopener noreferrer" />}
            >
              Minta Reschedule
            </Button>
          )}
          <Button
            variant="outline"
            size="lg"
            className="w-full"
            nativeButton={false}
            render={<a href={whatsappLink(`Halo Denailss, aku mau tanya tentang booking ID ${booking.id}`, whatsappNumber)} target="_blank" rel="noopener noreferrer" />}
          >
            Hubungi Admin
          </Button>
        </div>
      </Reveal>

      {/* Review Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md bg-card">
          <DialogHeader>
            <DialogTitle className="font-heading text-lg font-semibold text-primary">
              Bagikan Pengalamanmu 💅
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSendReview} className="space-y-5 py-3">
            {/* Stars rating selection */}
            <div className="flex flex-col items-center justify-center gap-2 border-b border-border/40 pb-4">
              <span className="text-xs font-semibold text-muted-foreground">Bagaimana kualitas layanan kami?</span>
              <div className="flex items-center gap-1.5 mt-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    className="transition-transform duration-200 hover:scale-125 focus:outline-hidden"
                    onClick={() => setRating(star)}
                    aria-label={`Beri bintang ${star}`}
                  >
                    <StarIcon
                      weight={star <= rating ? "fill" : "regular"}
                      className={`size-8 ${star <= rating ? "text-secondary" : "text-muted-foreground/30"}`}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Comment area */}
            <div className="grid gap-2">
              <Label htmlFor="reviewComment" className="text-xs font-bold text-foreground/80">Tulis Ulasan Kakak</Label>
              <Textarea
                id="reviewComment"
                placeholder="Bagikan kepuasanmu tentang nail art, kenyamanan tempat, atau pelayanan kami..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={4}
                required
              />
            </div>

            <DialogFooter>
              <Button type="submit" className="w-full">Kirim Ulasan</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
