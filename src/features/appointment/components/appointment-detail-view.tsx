"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useBackoffice } from "../context/backoffice-context";
import { formatIDR, formatDateId, parseDateKey } from "@/lib/format";
import { serviceNamesLabel, FULFILLMENT_LABELS } from "@/features/appointment/lib/labels";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  ArrowLeftIcon,
  UserIcon,
  PhoneIcon,
  CalendarBlankIcon,
  ClockIcon,
  CheckIcon,
  XIcon,
  InfoIcon,
  CheckCircleIcon,
  XCircleIcon,
} from "@phosphor-icons/react/dist/ssr";
import type { BookingStatus, DepositVerificationStatus } from "@/types";

interface AppointmentDetailViewProps {
  id: string;
}

export function AppointmentDetailView({ id }: AppointmentDetailViewProps) {
  const {
    appointments,
    updateAppointmentStatus,
    rescheduleAppointment,
    approveDeposit,
    rejectDeposit,
  } = useBackoffice();

  const appt = appointments.find((a) => a.id === id);

  const [isRescheduling, setIsRescheduling] = useState(false);
  const [reschedDate, setReschedDate] = useState("");
  const [reschedTime, setReschedTime] = useState("");

  const [isRejecting, setIsRejecting] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  if (!appt) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <span className="text-4xl">🔍</span>
        <h3 className="font-heading text-lg font-semibold text-foreground/90 mt-2">
          Appointment Tidak Ditemukan
        </h3>
        <p className="text-sm text-muted-foreground mt-1">
          Janji temu dengan ID <span className="font-mono text-primary">{id}</span> tidak terdaftar di sistem.
        </p>
        <Button variant="outline" className="mt-6 rounded-xl" nativeButton={false} render={<Link href="/backoffice" />}>
          <ArrowLeftIcon className="size-4 mr-2" /> Kembali ke Dashboard
        </Button>
      </div>
    );
  }

  const handleRescheduleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reschedDate || !reschedTime) {
      toast.error("Tanggal dan Waktu wajib ditentukan!");
      return;
    }
    rescheduleAppointment(appt.id, reschedDate, reschedTime);
    toast.success("Jadwal janji temu berhasil dipindahkan! 📅");
    setIsRescheduling(false);
  };

  const handleApproveDeposit = () => {
    approveDeposit(appt.id);
    toast.success("Deposit berhasil diverifikasi dan disetujui! 💅");
  };

  const handleRejectDepositSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectReason) {
      toast.error("Alasan penolakan wajib diisi!");
      return;
    }
    rejectDeposit(appt.id, rejectReason);
    toast.info("Deposit ditolak. Status booking dikembalikan.");
    setIsRejecting(false);
    setRejectReason("");
  };

  const getStatusBadge = (status: BookingStatus) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-emerald-50 text-emerald-700 border-emerald-100 font-medium">Selesai</Badge>;
      case "confirmed":
        return <Badge className="bg-primary text-primary-foreground font-medium">Dikonfirmasi</Badge>;
      case "waiting_verification":
        return <Badge className="bg-amber-50 text-amber-700 border-amber-100 font-medium animate-pulse">Butuh Verifikasi</Badge>;
      case "pending_deposit":
        return <Badge className="bg-secondary-soft text-secondary-foreground border-secondary/20 font-medium">Menunggu Deposit</Badge>;
      case "cancelled":
        return <Badge variant="destructive" className="font-medium">Dibatalkan</Badge>;
      case "no_show":
        return <Badge variant="destructive" className="font-medium">No Show</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Back button */}
      <div>
        <Button
          variant="ghost"
          size="sm"
          className="text-muted-foreground hover:text-foreground pl-0 gap-1.5"
          nativeButton={false}
          render={<Link href="/backoffice" />}
        >
          <ArrowLeftIcon className="size-4" />
          Kembali ke Dashboard
        </Button>
      </div>

      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-border/50 pb-5 gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="font-heading text-xl font-bold tracking-tight text-foreground/90">
              Booking {appt.id}
            </h2>
            {getStatusBadge(appt.status)}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Dibuat secara online via Customer Booking Flow.
          </p>
        </div>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-[1.2fr_1fr] gap-8">
        
        {/* Left Column: Customer and Deposit details */}
        <div className="space-y-6">
          
          {/* Customer Card */}
          <section className="bg-card rounded-2xl border border-border/70 p-5 space-y-4 shadow-xs">
            <h3 className="font-heading text-sm font-semibold text-foreground/90 flex items-center gap-2 pb-2 border-b border-border/50">
              <span className="flex size-5 items-center justify-center rounded-md bg-secondary-soft text-secondary text-xs">
                👤
              </span>
              Profil Customer
            </h3>
            
            <div className="space-y-3">
              <div>
                <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Nama Lengkap</p>
                <p className="text-sm font-semibold text-foreground mt-0.5">{appt.customer.name}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">No. WhatsApp</p>
                  <p className="text-sm font-semibold text-foreground mt-0.5 flex items-center gap-1.5">
                    <PhoneIcon className="size-4 text-primary" />
                    {appt.customer.phone}
                  </p>
                </div>
                {appt.customer.email && (
                  <div>
                    <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Email</p>
                    <p className="text-sm font-semibold text-foreground mt-0.5 truncate">{appt.customer.email}</p>
                  </div>
                )}
              </div>

              {appt.customer.notes && (
                <div className="bg-secondary-soft/50 border border-secondary/20 p-3 rounded-xl text-xs text-secondary-foreground">
                  <span className="font-bold">Catatan Khusus Kuku:</span>
                  <p className="mt-1 leading-relaxed">{appt.customer.notes}</p>
                </div>
              )}
            </div>

            <div className="bg-muted/30 border border-border/60 rounded-xl p-3 text-xs space-y-2">
              <span className="font-bold text-foreground/80">Ringkasan Riwayat Booking:</span>
              <ul className="space-y-1 text-muted-foreground">
                <li className="flex items-center justify-between">
                  <span>Booking Selesai</span>
                  <span className="font-semibold text-foreground">3 kali</span>
                </li>
                <li className="flex items-center justify-between">
                  <span>Loyalitas</span>
                  <span className="font-semibold text-primary">Customer Setia (⭐ 5.0)</span>
                </li>
              </ul>
            </div>
          </section>

          {/* Deposit Verification Card */}
          {appt.depositRequired && (
            <section className="bg-card rounded-2xl border border-border/70 p-5 space-y-4 shadow-xs">
              <h3 className="font-heading text-sm font-semibold text-foreground/90 flex items-center gap-2 pb-2 border-b border-border/50">
                <span className="flex size-5 items-center justify-center rounded-md bg-accent-soft text-accent text-xs">
                  🛡️
                </span>
                Verifikasi Pembayaran Uang Muka (Deposit)
              </h3>

              <div className="space-y-3.5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Jumlah Tagihan</p>
                    <p className="text-base font-bold text-secondary-foreground mt-0.5">
                      {formatIDR(appt.depositAmount || 50000)}
                    </p>
                  </div>
                  <Badge className={cn(
                    appt.depositStatus === "approved"
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                      : appt.depositStatus === "rejected"
                      ? "bg-rose-50 text-rose-700 border-rose-200"
                      : "bg-amber-50 text-amber-700 border-amber-200"
                  )}>
                    {appt.depositStatus === "approved"
                      ? "Deposit Lunas"
                      : appt.depositStatus === "rejected"
                      ? "Deposit Ditolak"
                      : "Verifikasi Tertunda"}
                  </Badge>
                </div>

                {appt.depositRejectReason && (
                  <div className="bg-destructive/5 border border-destructive/10 p-3 rounded-lg text-xs text-destructive">
                    <span className="font-bold">Alasan Penolakan:</span> {appt.depositRejectReason}
                  </div>
                )}

                {appt.depositProofUrl && (
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-muted-foreground">Gambar Bukti Pengiriman:</p>
                    <div className="relative aspect-[3/4] w-full max-w-[200px] rounded-lg overflow-hidden border">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={appt.depositProofUrl}
                        alt="Bukti Transfer"
                        className="object-cover w-full h-full cursor-zoom-in hover:scale-105 transition-transform duration-300"
                        onClick={() => window.open(appt.depositProofUrl, "_blank")}
                      />
                    </div>
                    <span className="text-[10px] text-muted-foreground italic block">Klik gambar untuk membuka tab baru.</span>
                  </div>
                )}

                {appt.depositStatus === "waiting_verification" && !isRejecting && (
                  <div className="flex gap-2 pt-2">
                    <Button
                      size="sm"
                      className="bg-emerald-600 hover:bg-emerald-700 text-white"
                      onClick={handleApproveDeposit}
                    >
                      Setujui Pembayaran
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => setIsRejecting(true)}
                    >
                      Tolak Bukti
                    </Button>
                  </div>
                )}

                {isRejecting && (
                  <form onSubmit={handleRejectDepositSubmit} className="space-y-3.5 pt-3 border-t border-border/50">
                    <div className="grid gap-2">
                      <Label htmlFor="rejectReason" className="text-xs font-semibold text-destructive">Alasan Penolakan</Label>
                      <Input
                        id="rejectReason"
                        placeholder="Contoh: Bukti transfer terpotong / nominal tidak pas"
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                        required
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button type="submit" size="sm" variant="destructive">Kirim Penolakan</Button>
                      <Button type="button" size="sm" variant="ghost" onClick={() => setIsRejecting(false)}>Batal</Button>
                    </div>
                  </form>
                )}
              </div>
            </section>
          )}

        </div>

        {/* Right Column: Appointment Parameters & Reschedule / Status change actions */}
        <div className="space-y-6">
          
          {/* Appointment Specs Card */}
          <section className="bg-card rounded-2xl border border-border/70 p-5 space-y-4 shadow-xs">
            <h3 className="font-heading text-sm font-semibold text-foreground/90 flex items-center gap-2 pb-2 border-b border-border/50">
              <span className="flex size-5 items-center justify-center rounded-md bg-primary-foreground text-primary border border-primary/20 text-xs">
                💅
              </span>
              Layanan &amp; Waktu
            </h3>

            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-muted-foreground">Layanan</p>
                  <p className="text-sm font-semibold text-primary mt-0.5">{serviceNamesLabel(appt.services)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Desain Seni</p>
                  <p className="text-sm font-semibold text-foreground mt-0.5">{appt.designTitle || "Polos (Tidak Ada)"}</p>
                </div>
                {appt.fulfillment && (
                  <div>
                    <p className="text-muted-foreground">Pengambilan</p>
                    <p className="text-sm font-semibold text-foreground mt-0.5">{FULFILLMENT_LABELS[appt.fulfillment]}</p>
                  </div>
                )}
                <div>
                  <p className="text-muted-foreground">Tanggal Booking</p>
                  <p className="text-sm font-semibold text-foreground mt-0.5">
                    {appt.date ? formatDateId(parseDateKey(appt.date)) : "Pesanan Produk (Online)"}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Jam &amp; Durasi</p>
                  <p className="text-sm font-semibold text-foreground mt-0.5">
                    {appt.time ? `${appt.time} (${appt.durationMinutes} menit)` : "Pengiriman / Penjemputan"}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Biaya Sesi</p>
                  <p className="text-sm font-semibold text-foreground mt-0.5">
                    {formatIDR(appt.price)}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Status Deposit</p>
                  <p className="text-sm font-semibold text-foreground mt-0.5">
                    {appt.depositRequired ? (appt.depositStatus === "approved" ? "Lunas" : "Belum Lunas") : "Tidak Ada"}
                  </p>
                </div>
              </div>

              {/* Action Flow Section */}
              <div className="border-t border-border/55 pt-4 space-y-4">
                {isRescheduling ? (
                  <form onSubmit={handleRescheduleSubmit} className="space-y-3.5 bg-muted/20 p-3 rounded-xl border border-border/60">
                    <p className="font-semibold text-primary">Atur Ulang Jadwal (Reschedule)</p>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="grid gap-1">
                        <Label htmlFor="resDate" className="text-[10px]">Tanggal Baru</Label>
                        <Input
                          id="resDate"
                          type="date"
                          value={reschedDate}
                          onChange={(e) => setReschedDate(e.target.value)}
                          required
                        />
                      </div>
                      <div className="grid gap-1">
                        <Label htmlFor="resTime" className="text-[10px]">Jam Baru</Label>
                        <Input
                          id="resTime"
                          type="time"
                          value={reschedTime}
                          onChange={(e) => setReschedTime(e.target.value)}
                          required
                        />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button type="submit" size="sm">Simpan Jadwal</Button>
                      <Button type="button" size="sm" variant="ghost" onClick={() => setIsRescheduling(false)}>Batal</Button>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-2">
                    <p className="font-semibold text-foreground/80">Tindakan Cepat</p>
                    
                    <div className="flex flex-col gap-2">
                      {appt.status === "confirmed" && (
                        <>
                          <Button
                            className="bg-emerald-600 hover:bg-emerald-700 text-white w-full"
                            onClick={() => {
                              updateAppointmentStatus(appt.id, "completed");
                              toast.success("Appointment ditandai selesai! 💅");
                            }}
                          >
                            Tandai Selesai (Completed)
                          </Button>
                          <Button
                            variant="outline"
                            className="w-full"
                            onClick={() => {
                              setIsRescheduling(true);
                              setReschedDate(appt.date);
                              setReschedTime(appt.time);
                            }}
                          >
                            Reschedule Appointment
                          </Button>
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              className="text-destructive hover:bg-destructive/5 flex-1"
                              onClick={() => {
                                updateAppointmentStatus(appt.id, "no_show");
                                toast.info("Ditandai sebagai No Show.");
                              }}
                            >
                              No Show
                            </Button>
                            <Button
                              variant="ghost"
                              className="text-destructive hover:bg-destructive/5 flex-1"
                              onClick={() => {
                                updateAppointmentStatus(appt.id, "cancelled");
                                toast.warning("Appointment dibatalkan.");
                              }}
                            >
                              Batalkan
                            </Button>
                          </div>
                        </>
                      )}

                      {appt.status === "pending" && (
                        <>
                          <Button
                            className="w-full"
                            onClick={() => {
                              updateAppointmentStatus(appt.id, "confirmed");
                              toast.success("Appointment dikonfirmasi! 📅");
                            }}
                          >
                            Konfirmasi Booking
                          </Button>
                          <Button
                            variant="destructive"
                            className="w-full"
                            onClick={() => {
                              updateAppointmentStatus(appt.id, "cancelled");
                              toast.warning("Appointment ditolak & dibatalkan.");
                            }}
                          >
                            Tolak &amp; Batalkan Booking
                          </Button>
                        </>
                      )}

                      {appt.status === "waiting_verification" && (
                        <div className="bg-amber-50 border border-amber-200 text-amber-800 p-3 rounded-lg text-xs leading-relaxed">
                          ⚠️ Selesaikan verifikasi manual deposit di kolom kiri terlebih dahulu sebelum melanjutkan tindakan booking.
                        </div>
                      )}

                      {appt.status === "pending_deposit" && (
                        <div className="space-y-2">
                          <div className="bg-secondary-soft border border-secondary/20 text-secondary-foreground p-3 rounded-lg text-xs leading-relaxed">
                            ⏰ Menunggu customer mengirimkan bukti transfer uang muka / deposit.
                          </div>
                          <Button
                            variant="outline"
                            className="w-full"
                            onClick={() => {
                              // Simulate manual verification bypass
                              updateAppointmentStatus(appt.id, "confirmed");
                              toast.success("Bypass deposit: Booking dikonfirmasi! 📅");
                            }}
                          >
                            Bypass &amp; Konfirmasi Manual
                          </Button>
                        </div>
                      )}

                      {(appt.status === "cancelled" || appt.status === "no_show") && (
                        <Button
                          variant="outline"
                          className="w-full"
                          onClick={() => {
                            setIsRescheduling(true);
                            setReschedDate(appt.date);
                            setReschedTime(appt.time);
                          }}
                        >
                          Reschedule / Aktifkan Kembali
                        </Button>
                      )}

                      {appt.status === "completed" && (
                        <div className="bg-emerald-50 border border-emerald-100 text-emerald-800 p-3 rounded-lg text-xs leading-relaxed">
                          ✨ Booking telah selesai. Customer memberikan ulasan bintang 5 terhadap pengerjaan ini.
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

            </div>
          </section>

        </div>

      </div>
    </div>
  );
}
