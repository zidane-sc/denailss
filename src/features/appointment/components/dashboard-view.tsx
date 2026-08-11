"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useBackoffice } from "../context/backoffice-context";
import { formatIDR, formatDateId, toDateKey, formatDuration } from "@/lib/format";
import { imageUrl } from "@/lib/images";
import { useLiveServices } from "@/features/services/components/services-provider";
import { serviceNamesLabel, FULFILLMENT_LABELS } from "@/features/appointment/lib/labels";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  CalendarBlankIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  FileTextIcon,
  PlusIcon,
  WarningIcon,
  ShieldCheckIcon,
  UserIcon,
  MagnifyingGlassIcon,
  WhatsappLogoIcon,
} from "@phosphor-icons/react/dist/ssr";
import type { BookingStatus, DepositVerificationStatus } from "@/types";
import type { Appointment } from "../types";
import { DepositProofImage } from "./deposit-proof-image";
import {
  waCustomerChatLink,
  depositApprovedWaMessage,
  depositRejectedWaMessage,
} from "../lib/whatsapp";

export function DashboardView() {
  const {
    appointments,
    addAppointment,
    approveDeposit,
    rejectDeposit,
    updateAppointmentStatus,
  } = useBackoffice();

  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [dbSearch, setDbSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [serviceFilter, setServiceFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [sortField, setSortField] = useState<"id" | "customer" | "service" | "date" | "price">("id");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  // Reset page when filters or sorting change
  React.useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCurrentPage(1);
  }, [dbSearch, statusFilter, serviceFilter, sortField, sortDirection]);

  const handleSort = (field: typeof sortField) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const filteredDbAppts = React.useMemo(() => {
    const q = dbSearch.trim().toLowerCase();
    const list = [...appointments].filter((a) => {
      if (q) {
        const serviceText = a.services.map((s) => s.name).join(" ").toLowerCase();
        const matches =
          a.id.toLowerCase().includes(q) ||
          a.customer.name.toLowerCase().includes(q) ||
          a.customer.phone.includes(q) ||
          serviceText.includes(q);
        if (!matches) return false;
      }
      if (statusFilter !== "all" && a.status !== statusFilter) return false;
      if (serviceFilter !== "all" && !a.services.some((s) => s.slug === serviceFilter)) return false;
      return true;
    });

    list.sort((a, b) => {
      let comparison = 0;
      if (sortField === "id") {
        comparison = a.id.localeCompare(b.id);
      } else if (sortField === "customer") {
        comparison = a.customer.name.localeCompare(b.customer.name);
      } else if (sortField === "service") {
        comparison = (a.services[0]?.name ?? "").localeCompare(b.services[0]?.name ?? "");
      } else if (sortField === "price") {
        comparison = a.price - b.price;
      } else if (sortField === "date") {
        const dateA = a.date ? new Date(a.date).getTime() : 0;
        const dateB = b.date ? new Date(b.date).getTime() : 0;
        comparison = dateA - dateB;
      }
      return sortDirection === "asc" ? comparison : -comparison;
    });

    return list;
  }, [appointments, dbSearch, statusFilter, serviceFilter, sortField, sortDirection]);

  const totalPages = Math.ceil(filteredDbAppts.length / itemsPerPage);
  const paginatedAppts = React.useMemo(() => {
    return filteredDbAppts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  }, [filteredDbAppts, currentPage, itemsPerPage]);
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  // WhatsApp notify modal after deposit approve / reject
  const [notifyAppt, setNotifyAppt] = useState<{ appt: Appointment; type: "approved" | "rejected"; reason?: string } | null>(null);

  // Form states for new appointment
  const [newCustomerName, setNewCustomerName] = useState("");
  const [newCustomerPhone, setNewCustomerPhone] = useState("");
  const [newCustomerEmail, setNewCustomerEmail] = useState("");
  const [newServiceSlugs, setNewServiceSlugs] = useState<string[]>(["gel-extension"]);
  const [newDesignSlug, setNewDesignSlug] = useState("");
  const [newDesignTitle, setNewDesignTitle] = useState("");
  const [newFulfillment, setNewFulfillment] = useState<"pickup" | "delivery" | "">("");
  const [newDate, setNewDate] = useState(() => toDateKey(new Date()));
  const [newTime, setNewTime] = useState("13:00");
  const [newDuration, setNewDuration] = useState(60);
  const [newPrice, setNewPrice] = useState(120000);
  const [newDepositRequired, setNewDepositRequired] = useState(false);
  const [newDepositAmount, setNewDepositAmount] = useState(50000);
  const [newNotes, setNewNotes] = useState("");

  // Today's details
  const todayKey = toDateKey(new Date());
  const todayDateObj = new Date();

  const todayAppts = appointments
    .filter((a) => a.date === todayKey)
    .sort((a, b) => a.time.localeCompare(b.time));

  const pendingVerificationAppts = appointments.filter(
    (a) => a.status === "waiting_verification" || a.depositStatus === "waiting_verification"
  );

  const nextAppt = todayAppts.find((a) => {
    // Show first confirmed or pending appointment after 11:00 (since 09:00 and 10:15 are completed)
    return a.status !== "completed" && a.status !== "cancelled" && a.status !== "no_show";
  });

  // Pulse Stats
  const todayBookingsCount = todayAppts.length;
  const thisWeekStart = new Date();
  thisWeekStart.setDate(thisWeekStart.getDate() - thisWeekStart.getDay()); // Sunday
  const thisWeekEnd = new Date(thisWeekStart);
  thisWeekEnd.setDate(thisWeekStart.getDate() + 6);
  const thisWeekBookingsCount = appointments.filter((a) => {
    return a.date >= toDateKey(thisWeekStart) && a.date <= toDateKey(thisWeekEnd);
  }).length;
  const pendingDepositsCount = pendingVerificationAppts.length;

  const handleCreateAppointment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustomerName || !newCustomerPhone) {
      toast.error("Nama dan Nomor Telepon wajib diisi!");
      return;
    }
    if (newServiceSlugs.length === 0) {
      toast.error("Pilih minimal satu layanan!");
      return;
    }

    const serviceNameMap: Record<string, string> = {
      "gel-extension": "Gel Extension",
      removal: "Nail Removal",
      manicure: "Manicure",
      pedicure: "Pedicure",
      "fake-nail": "Fake Nail (Press-On)",
      "nail-art": "Nail Art",
    };

    addAppointment({
      date: newDate,
      time: newTime,
      durationMinutes: Number(newDuration),
      services: newServiceSlugs.map((slug) => ({
        slug,
        name: serviceNameMap[slug] || slug,
      })),
      designSlug: newDesignSlug || undefined,
      designTitle: newDesignTitle || undefined,
      fulfillment: newFulfillment || undefined,
      price: Number(newPrice),
      customer: {
        name: newCustomerName,
        phone: newCustomerPhone,
        email: newCustomerEmail || undefined,
        notes: newNotes || undefined,
      },
      depositRequired: newDepositRequired,
      depositAmount: newDepositRequired ? Number(newDepositAmount) : undefined,
      depositStatus: newDepositRequired ? "waiting_verification" : undefined,
      depositProofUrl: newDepositRequired ? "/images/bukti-transfer-dummy.jpg" : undefined,
      status: newDepositRequired ? "waiting_verification" : "confirmed",
      notes: newNotes || undefined,
    });

    toast.success("Appointment baru berhasil ditambahkan! ✨");
    setAddDialogOpen(false);
    // Reset form
    setNewCustomerName("");
    setNewCustomerPhone("");
    setNewCustomerEmail("");
    setNewDesignSlug("");
    setNewDesignTitle("");
    setNewFulfillment("");
    setNewNotes("");
  };

  const handleApproveDeposit = (id: string) => {
    const appt = appointments.find((a) => a.id === id);
    approveDeposit(id);
    toast.success("Deposit berhasil diverifikasi dan disetujui! 💅");
    if (appt) setNotifyAppt({ appt, type: "approved" });
  };

  const handleRejectDepositSubmit = (e: React.FormEvent, id: string) => {
    e.preventDefault();
    if (!rejectReason) {
      toast.error("Alasan penolakan wajib diisi!");
      return;
    }
    const appt = appointments.find((a) => a.id === id);
    rejectDeposit(id, rejectReason);
    toast.info("Deposit ditolak. Status dikembalikan ke pending deposit.");
    setRejectId(null);
    setRejectReason("");
    if (appt) setNotifyAppt({ appt, type: "rejected", reason: rejectReason });
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
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Welcome Banner */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b border-border/50 pb-6">
        <div>
          <p className="text-sm font-medium text-muted-foreground">
            {formatDateId(todayDateObj, { withWeekday: true })}
          </p>
          <h2 className="font-heading text-2xl font-semibold tracking-tight text-foreground/90 mt-1">
            Halo Kak! 💅
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Hari ini kamu memiliki <span className="font-semibold text-primary">{todayBookingsCount}</span> janji temu.
            {nextAppt && (
              <>
                {" "}Appointment berikutnya pukul <span className="font-semibold text-primary">{nextAppt.time}</span>.
              </>
            )}
          </p>
        </div>

        {/* Quick Actions at Top */}
        <div className="flex flex-wrap gap-2.5">
          <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
            <DialogTrigger render={<Button className="gap-2 shadow-sm"><PlusIcon weight="bold" className="size-4" />Tambah Booking</Button>} />
            <DialogContent className="sm:max-w-md bg-card max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="font-heading text-lg font-semibold text-primary">
                  Tambah Appointment Baru
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateAppointment} className="space-y-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="customerName" className="font-medium text-foreground/90">Nama Customer *</Label>
                  <Input
                    id="customerName"
                    placeholder="Contoh: Alya Putri"
                    value={newCustomerName}
                    onChange={(e) => setNewCustomerName(e.target.value)}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="grid gap-2">
                    <Label htmlFor="customerPhone" className="font-medium text-foreground/90">No. WhatsApp *</Label>
                    <Input
                      id="customerPhone"
                      placeholder="0812xxxx"
                      value={newCustomerPhone}
                      onChange={(e) => setNewCustomerPhone(e.target.value)}
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="customerEmail" className="font-medium text-foreground/90">Email (Opsional)</Label>
                    <Input
                      id="customerEmail"
                      type="email"
                      placeholder="alya@example.com"
                      value={newCustomerEmail}
                      onChange={(e) => setNewCustomerEmail(e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label className="font-medium text-foreground/90">Layanan (bisa pilih lebih dari satu)</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {useLiveServices().map((svc) => {
                      const active = newServiceSlugs.includes(svc.slug);
                      return (
                        <button
                          key={svc.slug}
                          type="button"
                          onClick={() => {
                            setNewServiceSlugs((prev) =>
                              active
                                ? prev.filter((s) => s !== svc.slug)
                                : [...prev, svc.slug]
                            );
                          }}
                          className={cn(
                            "flex items-center justify-between gap-1 rounded-xl border px-3 py-2 text-xs font-medium transition-colors",
                            active
                              ? "border-primary bg-primary/10 text-primary"
                              : "border-border bg-card text-foreground/80 hover:border-primary/40"
                          )}
                        >
                          <span>{svc.name}</span>
                          <span className="shrink-0 text-[10px] text-muted-foreground">
                            {formatDuration(svc.durationMinutes)}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="grid gap-2">
                    <Label htmlFor="duration" className="font-medium text-foreground/90">Durasi (Menit)</Label>
                    <Input
                      id="duration"
                      type="number"
                      value={newDuration}
                      onChange={(e) => setNewDuration(Number(e.target.value))}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="price" className="font-medium text-foreground/90">Total Harga (Rp)</Label>
                    <Input
                      id="price"
                      type="number"
                      value={newPrice}
                      onChange={(e) => setNewPrice(Number(e.target.value))}
                    />
                  </div>
                </div>

                {newServiceSlugs.includes("fake-nail") && (
                  <div className="grid gap-2">
                    <Label htmlFor="fulfillment" className="font-medium text-foreground/90">Cara Pengambilan (Kuku Palsu)</Label>
                    <select
                      id="fulfillment"
                      className="flex h-9 w-full rounded-xl border border-input bg-card px-3 py-1 text-sm shadow-xs focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring"
                      value={newFulfillment}
                      onChange={(e) => setNewFulfillment(e.target.value as "pickup" | "delivery" | "")}
                    >
                      <option value="">Pilih...</option>
                      <option value="pickup">Ambil di Lokasi</option>
                      <option value="delivery">Dikirim via Kurir</option>
                    </select>
                  </div>
                )}

                <div className="grid gap-2">
                  <Label htmlFor="designTitle" className="font-medium text-foreground/90">Desain (Opsional)</Label>
                  <Input
                    id="designTitle"
                    placeholder="Korean Milk / Sunset Ombre"
                    value={newDesignTitle}
                    onChange={(e) => {
                      setNewDesignTitle(e.target.value);
                      setNewDesignSlug(e.target.value.toLowerCase().replace(/ /g, "-"));
                    }}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="grid gap-2">
                    <Label htmlFor="date" className="font-medium text-foreground/90">Tanggal</Label>
                    <Input
                      id="date"
                      type="date"
                      value={newDate}
                      onChange={(e) => setNewDate(e.target.value)}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="time" className="font-medium text-foreground/90">Waktu</Label>
                    <Input
                      id="time"
                      type="time"
                      value={newTime}
                      onChange={(e) => setNewTime(e.target.value)}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 border-t border-border/55 pt-3">
                  <input
                    type="checkbox"
                    id="depositRequired"
                    className="size-4 accent-primary"
                    checked={newDepositRequired}
                    onChange={(e) => setNewDepositRequired(e.target.checked)}
                  />
                  <Label htmlFor="depositRequired" className="font-medium select-none cursor-pointer">Membutuhkan Deposit Uang muka</Label>
                </div>

                {newDepositRequired && (
                  <div className="grid gap-2 animate-in fade-in duration-200">
                    <Label htmlFor="depositAmount" className="font-medium text-foreground/90">Jumlah Deposit (Rp)</Label>
                    <Input
                      id="depositAmount"
                      type="number"
                      value={newDepositAmount}
                      onChange={(e) => setNewDepositAmount(Number(e.target.value))}
                    />
                  </div>
                )}

                <div className="grid gap-2">
                  <Label htmlFor="notes" className="font-medium text-foreground/90">Catatan Tambahan</Label>
                  <Textarea
                    id="notes"
                    placeholder="Detail tambahan kuku atau request khusus..."
                    value={newNotes}
                    onChange={(e) => setNewNotes(e.target.value)}
                    rows={2}
                  />
                </div>

                <DialogFooter className="pt-2">
                  <Button type="submit" className="w-full">Simpan Appointment</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-[1.8fr_1fr] gap-8">
        
        {/* Left Column: Today's Appointments & Deposit Verifications */}
        <div className="space-y-8">
          
          {/* Today's Appointments Section */}
          <section className="bg-card rounded-2xl border border-border/75 p-6 shadow-xs">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-heading text-lg font-semibold flex items-center gap-2 text-foreground/90">
                <span className="flex size-6 items-center justify-center rounded-md bg-secondary-soft text-secondary">
                  📅
                </span>
                Jadwal Hari Ini
              </h3>
              <Link href="/backoffice/calendar" className="text-xs font-semibold text-primary hover:underline">
                Lihat Kalender Lengkap &rarr;
              </Link>
            </div>

            {todayAppts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <span className="text-3xl">✨</span>
                <p className="mt-2 text-sm font-medium text-muted-foreground">Hari ini masih kosong ✨</p>
                <p className="text-xs text-muted-foreground mt-0.5">Semua staf bisa bersantai sejenak.</p>
              </div>
            ) : (
              <div className="divide-y divide-border/60">
                {todayAppts.map((appt) => (
                  <div key={appt.id} className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all hover:bg-muted/10 px-1 rounded-xl">
                    <div className="flex items-start gap-4">
                      {/* Time box */}
                      <div className="flex flex-col items-center justify-center bg-muted/60 text-foreground w-16 h-16 rounded-xl border border-border/50 shrink-0">
                        <span className="text-base font-semibold leading-none">{appt.time}</span>
                        <span className="text-[10px] text-muted-foreground mt-1 font-medium">{appt.durationMinutes}m</span>
                      </div>
                      
                      {/* Booking details */}
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-heading text-sm font-semibold text-foreground">{appt.customer.name}</span>
                          {getStatusBadge(appt.status)}
                        </div>
                        <p className="text-xs font-medium text-muted-foreground mt-1">
                          Layanan: <span className="text-foreground/80 font-semibold">{serviceNamesLabel(appt.services)}</span>
                          {appt.designTitle && (
                            <> · Desain: <span className="text-primary font-semibold">{appt.designTitle}</span></>
                          )}
                          {appt.fulfillment && (
                            <> · {FULFILLMENT_LABELS[appt.fulfillment]}</>
                          )}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Harga: <span className="font-semibold text-foreground/80">{formatIDR(appt.price)}</span>
                          {appt.depositRequired && (
                            <span className="ml-1 text-emerald-600 font-medium">
                              (Deposit {appt.depositStatus === "approved" ? "Lunas" : "Menunggu"})
                            </span>
                          )}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <Button
                        variant="outline"
                        size="sm"
                        className="rounded-full text-xs font-semibold px-4"
                        nativeButton={false}
                        render={<Link href={`/backoffice/appointments/${appt.id}`} />}
                      >
                        Detail &amp; Aksi
                      </Button>
                      
                      {appt.status === "confirmed" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="rounded-full text-xs text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                          onClick={() => {
                            updateAppointmentStatus(appt.id, "completed");
                            toast.success("Appointment ditandai Selesai! ✨");
                          }}
                        >
                          Selesai
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Deposit Verification Section */}
          <section className="bg-card rounded-2xl border border-border/75 p-6 shadow-xs">
            <h3 className="font-heading text-lg font-semibold flex items-center gap-2 text-foreground/90 mb-5">
              <span className="flex size-6 items-center justify-center rounded-md bg-accent-soft text-accent">
                🛡️
              </span>
              Verifikasi Manual Deposit
            </h3>

            {pendingVerificationAppts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center bg-muted/20 border border-dashed border-border/80 rounded-xl">
                <span className="text-2xl">💅</span>
                <p className="mt-2 text-sm font-medium text-muted-foreground">Semua deposit sudah beres 💅</p>
                <p className="text-xs text-muted-foreground mt-0.5">Tidak ada verifikasi deposit yang tertunda.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingVerificationAppts.map((appt) => (
                  <div
                    key={appt.id}
                    className="border border-border/80 rounded-xl p-4 bg-muted/10 grid grid-cols-1 md:grid-cols-[1.5fr_1fr] gap-4"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-heading font-semibold text-foreground">{appt.customer.name}</span>
                        <span className="text-xs text-muted-foreground">({appt.id})</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Jadwal: <span className="font-semibold text-foreground/80">{appt.date ? `${formatDateId(new Date(appt.date))} · ${appt.time}` : "Pesanan Produk (Online)"}</span>
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Layanan: <span className="font-semibold text-foreground/80">{serviceNamesLabel(appt.services)}</span>
                        {appt.fulfillment && (
                          <> · {FULFILLMENT_LABELS[appt.fulfillment]}</>
                        )}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Total Harga: <span className="font-semibold text-foreground/80">{formatIDR(appt.price)}</span>
                      </p>
                      
                      <div className="mt-3 p-3 bg-secondary-soft/50 rounded-lg border border-secondary/15 flex items-center justify-between">
                        <div>
                          <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Uang Muka / Deposit</p>
                          <p className="text-sm font-bold text-secondary-foreground">{formatIDR(appt.depositAmount || 50000)}</p>
                        </div>
                        <Badge className="bg-amber-50 text-amber-700 border-amber-200">Menunggu Persetujuan</Badge>
                      </div>

                      {/* Reject Form */}
                      {rejectId === apppt_id_selector(appt.id) ? (
                        <form onSubmit={(e) => handleRejectDepositSubmit(e, appt.id)} className="mt-4 space-y-2.5 pt-3 border-t border-border/60">
                          <Label htmlFor={`reason-${appt.id}`} className="text-xs font-semibold text-destructive">Alasan Penolakan</Label>
                          <Input
                            id={`reason-${appt.id}`}
                            placeholder="Contoh: Bukti transfer tidak jelas / nominal salah"
                            value={rejectReason}
                            onChange={(e) => setRejectReason(e.target.value)}
                            required
                          />
                          <div className="flex gap-2">
                            <Button type="submit" size="sm" variant="destructive">Kirim Penolakan</Button>
                            <Button type="button" size="sm" variant="ghost" onClick={() => setRejectId(null)}>Batal</Button>
                          </div>
                        </form>
                      ) : (
                        <div className="mt-4 flex gap-2">
                          <Button
                            size="sm"
                            className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5"
                            onClick={() => handleApproveDeposit(appt.id)}
                          >
                            <CheckCircleIcon className="size-4" />
                            Setujui
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            className="gap-1.5"
                            onClick={() => {
                              setRejectId(appt.id);
                              setRejectReason("");
                            }}
                          >
                            <XCircleIcon className="size-4" />
                            Tolak
                          </Button>
                        </div>
                      )}
                    </div>

                    {/* Proof Image Box */}
                    <div className="flex flex-col gap-2">
                      <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Bukti Transfer:</span>
                      <div className="relative aspect-[3/4] w-full max-w-[140px] rounded-lg overflow-hidden border border-border bg-muted/30">
                        {appt.depositProofUrl ? <DepositProofImage reference={appt.depositProofUrl} /> : <img src={imageUrl("transfer-proof")} alt="Bukti Transfer" className="h-full w-full object-cover" />}
                      </div>
                      <span className="text-[9px] text-muted-foreground italic">Klik gambar untuk memperbesar</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

        </div>

        {/* Right Column: Pulse Stats & Quick Action Menu */}
        <div className="space-y-8">
          
          {/* Quick Actions Panel */}
          <section className="bg-card rounded-2xl border border-border/75 p-6 shadow-xs">
            <h3 className="font-heading text-base font-semibold text-foreground/90 mb-4">
              Aksi Cepat
            </h3>
            <div className="flex flex-col gap-2">
              <Button
                variant="outline"
                className="w-full justify-start gap-3 rounded-xl py-5"
                onClick={() => setAddDialogOpen(true)}
              >
                <span className="flex size-8 items-center justify-center rounded-lg bg-primary-foreground text-primary border border-primary/20">
                  ➕
                </span>
                <span className="flex flex-col items-start">
                  <span className="text-sm font-semibold">Tambah Booking</span>
                  <span className="text-[10px] text-muted-foreground">Catat manual janji temu customer</span>
                </span>
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start gap-3 rounded-xl py-5"
                nativeButton={false}
                render={<Link href="/backoffice/calendar" />}
              >
                <span className="flex size-8 items-center justify-center rounded-lg bg-primary-foreground text-primary border border-primary/20">
                  📅
                </span>
                <span className="flex flex-col items-start">
                  <span className="text-sm font-semibold">Buka Kalender</span>
                  <span className="text-[10px] text-muted-foreground">Lihat dan atur jadwal mingguan</span>
                </span>
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start gap-3 rounded-xl py-5"
                nativeButton={false}
                render={<Link href="/backoffice/availability" />}
              >
                <span className="flex size-8 items-center justify-center rounded-lg bg-primary-foreground text-primary border border-primary/20">
                  ⏰
                </span>
                <span className="flex flex-col items-start">
                  <span className="text-sm font-semibold">Kelola Ketersediaan</span>
                  <span className="text-[10px] text-muted-foreground">Edit jam operasional dan cuti</span>
                </span>
              </Button>
            </div>
          </section>

          {/* Pulse Stats Panel (Metrics) */}
          <section className="bg-card rounded-2xl border border-border/75 p-6 shadow-xs">
            <h3 className="font-heading text-base font-semibold text-foreground/90 mb-4">
              Aktivitas Hari Ini
            </h3>
            
            <div className="space-y-3.5">
              <div className="flex items-center justify-between p-3 rounded-xl border border-border/50 bg-background/30">
                <div className="flex items-center gap-3">
                  <span className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    💅
                  </span>
                  <div>
                    <p className="text-xs font-semibold text-foreground/80">Janji Temu Hari Ini</p>
                    <p className="text-[10px] text-muted-foreground">Total booking tanggal ini</p>
                  </div>
                </div>
                <span className="text-lg font-bold text-primary font-heading">{todayBookingsCount}</span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl border border-border/50 bg-background/30">
                <div className="flex items-center gap-3">
                  <span className="flex size-8 items-center justify-center rounded-lg bg-secondary-soft text-secondary">
                    📅
                  </span>
                  <div>
                    <p className="text-xs font-semibold text-foreground/80">Booking Minggu Ini</p>
                    <p className="text-[10px] text-muted-foreground">Siklus Aug 9 - Aug 15</p>
                  </div>
                </div>
                <span className="text-lg font-bold text-foreground font-heading">{thisWeekBookingsCount}</span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl border border-border/50 bg-background/30">
                <div className="flex items-center gap-3">
                  <span className="flex size-8 items-center justify-center rounded-lg bg-accent-soft text-accent">
                    🛡️
                  </span>
                  <div>
                    <p className="text-xs font-semibold text-foreground/80">Tertunda Verifikasi</p>
                    <p className="text-[10px] text-muted-foreground">Deposit butuh konfirmasi</p>
                  </div>
                </div>
                <span className={cn(
                  "text-lg font-bold font-heading",
                  pendingDepositsCount > 0 ? "text-amber-600" : "text-muted-foreground"
                )}>
                  {pendingDepositsCount}
                </span>
              </div>
            </div>
          </section>

        </div>
      </div>

      {/* Master Transaction & Order List Section */}
      <section className="bg-card rounded-2xl border border-border/75 p-6 shadow-xs mt-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h3 className="font-heading text-lg font-semibold flex items-center gap-2 text-foreground/90">
              <span className="flex size-6 items-center justify-center rounded-md bg-primary-foreground text-primary border border-primary/20 text-sm">
                📋
              </span>
              Master Database Janji Temu &amp; Pesanan
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Daftar lengkap seluruh transaksi booking salon dan pemesanan kuku palsu online.
            </p>
          </div>
          
          {/* Filters controls bar */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Search */}
            <div className="relative w-full sm:w-56">
              <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={dbSearch}
                onChange={(e) => setDbSearch(e.target.value)}
                placeholder="Cari ID, nama, HP..."
                className="h-9 pl-9 text-xs"
              />
            </div>
            
            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="flex h-9 w-full sm:w-36 rounded-xl border border-input bg-card px-2.5 py-1 text-xs shadow-xs focus-visible:outline-hidden"
            >
              <option value="all">Semua Status</option>
              <option value="confirmed">Dikonfirmasi</option>
              <option value="waiting_verification">Butuh Verifikasi</option>
              <option value="pending_deposit">Menunggu Deposit</option>
              <option value="completed">Selesai</option>
              <option value="cancelled">Dibatalkan</option>
              <option value="no_show">No Show</option>
            </select>

            {/* Service Filter */}
            <select
              value={serviceFilter}
              onChange={(e) => setServiceFilter(e.target.value)}
              className="flex h-9 w-full sm:w-40 rounded-xl border border-input bg-card px-2.5 py-1 text-xs shadow-xs focus-visible:outline-hidden"
            >
              <option value="all">Semua Layanan</option>
              <option value="gel-extension">Gel Extension</option>
              <option value="nail-art">Nail Art</option>
              <option value="fake-nail">Fake Nail (Press-On)</option>
              <option value="manicure">Manicure</option>
              <option value="pedicure">Pedicure</option>
              <option value="removal">Removal</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto rounded-xl border border-border/50">
          <table className="w-full border-collapse text-left text-xs text-foreground/95">
            <thead>
              <tr className="border-b bg-muted/40 font-semibold text-muted-foreground select-none">
                <th className="p-3 cursor-pointer hover:bg-muted/70 transition-colors" onClick={() => handleSort("id")}>
                  <div className="flex items-center gap-1">
                    ID Booking
                    <span className="text-[10px] text-primary">{sortField === "id" ? (sortDirection === "asc" ? "▲" : "▼") : "↕"}</span>
                  </div>
                </th>
                <th className="p-3 cursor-pointer hover:bg-muted/70 transition-colors" onClick={() => handleSort("customer")}>
                  <div className="flex items-center gap-1">
                    Customer
                    <span className="text-[10px] text-primary">{sortField === "customer" ? (sortDirection === "asc" ? "▲" : "▼") : "↕"}</span>
                  </div>
                </th>
                <th className="p-3 cursor-pointer hover:bg-muted/70 transition-colors" onClick={() => handleSort("service")}>
                  <div className="flex items-center gap-1">
                    Layanan
                    <span className="text-[10px] text-primary">{sortField === "service" ? (sortDirection === "asc" ? "▲" : "▼") : "↕"}</span>
                  </div>
                </th>
                <th className="p-3 cursor-pointer hover:bg-muted/70 transition-colors" onClick={() => handleSort("date")}>
                  <div className="flex items-center gap-1">
                    Tanggal &amp; Waktu
                    <span className="text-[10px] text-primary">{sortField === "date" ? (sortDirection === "asc" ? "▲" : "▼") : "↕"}</span>
                  </div>
                </th>
                <th className="p-3 text-center">Status</th>
                <th className="p-3 text-right cursor-pointer hover:bg-muted/70 transition-colors" onClick={() => handleSort("price")}>
                  <div className="flex items-center justify-end gap-1">
                    Nominal
                    <span className="text-[10px] text-primary">{sortField === "price" ? (sortDirection === "asc" ? "▲" : "▼") : "↕"}</span>
                  </div>
                </th>
                <th className="p-3 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {paginatedAppts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-muted-foreground italic">
                    Tidak ada data transaksi yang cocok dengan kriteria filter.
                  </td>
                </tr>
              ) : (
                paginatedAppts.map((appt) => (
                  <tr key={appt.id} className="hover:bg-muted/15 transition-colors">
                    <td className="p-3 font-mono font-bold text-primary">{appt.id}</td>
                    <td className="p-3">
                      <p className="font-semibold">{appt.customer.name}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">{appt.customer.phone}</p>
                    </td>
                    <td className="p-3 font-medium">
                      {serviceNamesLabel(appt.services)}
                      {appt.designTitle && (
                        <span className="block text-[10px] text-primary mt-0.5 font-semibold">({appt.designTitle})</span>
                      )}
                      {appt.fulfillment && (
                        <span className="block text-[10px] text-muted-foreground mt-0.5">
                          {FULFILLMENT_LABELS[appt.fulfillment]}
                        </span>
                      )}
                    </td>
                    <td className="p-3">
                      {appt.date ? (
                        <>
                          <p className="font-semibold">{formatDateId(new Date(appt.date))}</p>
                          <p className="text-[10px] text-muted-foreground mt-0.5">{appt.time} WIB</p>
                        </>
                      ) : (
                        <div className="inline-flex items-center gap-1 bg-emerald-50 border border-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full text-[9px] font-bold">
                          📦 Product (Online)
                        </div>
                      )}
                    </td>
                    <td className="p-3 text-center">{getStatusBadge(appt.status)}</td>
                    <td className="p-3 text-right font-bold font-heading">{formatIDR(appt.price)}</td>
                    <td className="p-3 text-center">
                      <Button
                        variant="outline"
                        size="sm"
                        className="rounded-full text-[10px] font-semibold h-7 px-3.5"
                        nativeButton={false}
                        render={<Link href={`/backoffice/appointments/${appt.id}`} />}
                      >
                        Detail
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination controls */}
        <div className="flex flex-col gap-3 mt-4 pt-4 border-t border-border/40 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className="text-[11px] text-muted-foreground">Tampilkan</span>
            <select
              aria-label="Jumlah item per halaman"
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="h-8 rounded-lg border border-border bg-card px-2 text-xs font-semibold shadow-xs focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring"
            >
              {[5, 10, 15, 25, 50].map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
            <span className="text-[11px] text-muted-foreground">per halaman</span>
            <span className="ml-1 text-[11px] text-muted-foreground">
              · Menampilkan {Math.min(filteredDbAppts.length, (currentPage - 1) * itemsPerPage + 1)}-
              {Math.min(filteredDbAppts.length, currentPage * itemsPerPage)} dari {filteredDbAppts.length} data
            </span>
          </div>
          {totalPages > 1 && (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="h-8 rounded-lg text-xs"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              >
                Sebelumnya
              </Button>
              <span className="text-xs text-foreground font-semibold px-2">
                {currentPage} / {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                className="h-8 rounded-lg text-xs"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              >
                Berikutnya
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Notify customer via WhatsApp modal */}
      <Dialog open={Boolean(notifyAppt)} onOpenChange={(open) => !open && setNotifyAppt(null)}>
        <DialogContent className="sm:max-w-md bg-card">
          <DialogHeader>
            <DialogTitle className="font-heading text-lg font-semibold text-foreground/90 flex items-center gap-2">
              <span className="flex size-8 items-center justify-center rounded-full bg-emerald-600 text-white">
                <WhatsappLogoIcon weight="fill" className="size-4" />
              </span>
              Beri Tahu Customer
            </DialogTitle>
          </DialogHeader>
          {notifyAppt && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground leading-relaxed">
                Deposit untuk booking{" "}
                <span className="font-mono font-semibold text-foreground">{notifyAppt.appt.id}</span>{" "}
                sudah{" "}
                <span className={cn("font-semibold", notifyAppt.type === "approved" ? "text-emerald-600" : "text-destructive")}>
                  {notifyAppt.type === "approved" ? "disetujui" : "ditolak"}
                </span>
                . Beri tahu <span className="font-semibold text-foreground">{notifyAppt.appt.customer.name}</span> lewat
                WhatsApp?
              </p>

              <div className="rounded-xl border border-border/60 bg-muted/30 p-3 text-xs text-muted-foreground leading-relaxed">
                <p className="font-semibold text-foreground/80">Pratinjau pesan:</p>
                <p className="mt-1 whitespace-pre-line">
                  {notifyAppt.type === "approved"
                    ? depositApprovedWaMessage(notifyAppt.appt)
                    : depositRejectedWaMessage(notifyAppt.appt, notifyAppt.reason || "")}
                </p>
              </div>

              <div className="flex items-center justify-end gap-2">
                <Button
                  variant="ghost"
                  className="gap-1.5 rounded-full text-muted-foreground"
                  onClick={() => setNotifyAppt(null)}
                >
                  Nanti saja
                </Button>
                <Button
                  size="sm"
                  className="gap-1.5 rounded-full bg-emerald-600 px-4 text-white hover:bg-emerald-700"
                  nativeButton={false}
                  render={
                    <a
                      href={waCustomerChatLink(
                        notifyAppt.appt.customer.phone,
                        notifyAppt.type === "approved"
                          ? depositApprovedWaMessage(notifyAppt.appt)
                          : depositRejectedWaMessage(notifyAppt.appt, notifyAppt.reason || "")
                      )}
                      target="_blank"
                      rel="noopener noreferrer"
                    />
                  }
                >
                  <WhatsappLogoIcon weight="fill" className="size-4" />
                  Kirim WhatsApp
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// helper to avoid ts error
function apppt_id_selector(val: string) {
  return val;
}
