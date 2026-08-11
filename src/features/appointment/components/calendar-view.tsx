"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useBackoffice } from "../context/backoffice-context";
import {
  formatIDR,
  formatDateId,
  toDateKey,
  parseDateKey,
  dayNamesId,
  monthNamesId,
} from "@/lib/format";
import { serviceNamesLabel, addOnsLabel } from "@/features/appointment/lib/labels";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  CaretLeftIcon,
  CaretRightIcon,
  UserIcon,
  PhoneIcon,
  ClockIcon,
  XIcon,
  ArrowRightIcon,
  WhatsappLogoIcon,
} from "@phosphor-icons/react/dist/ssr";
import type { BookingStatus } from "@/types";
import type { Appointment } from "../types";
import { DepositProofImage } from "./deposit-proof-image";
import {
  waCustomerChatLink,
  depositApprovedWaMessage,
  rescheduledWaMessage,
} from "../lib/whatsapp";

type ViewMode = "day" | "week" | "month";

export function CalendarView() {
  const {
    appointments,
    availabilityConfig,
    updateAppointmentStatus,
    rescheduleAppointment,
    approveDeposit,
    rejectDeposit,
  } = useBackoffice();

  const [currentDate, setCurrentDate] = useState<Date>(() => new Date());
  const [viewMode, setViewMode] = useState<ViewMode>("week");
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  
  // Reschedule Form states
  const [isRescheduling, setIsRescheduling] = useState(false);
  const [reschedDate, setReschedDate] = useState("");
  const [reschedTime, setReschedTime] = useState("");
  
  // Reject Deposit states inside detail pane
  const [isRejecting, setIsRejecting] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  // WhatsApp notify panel after approve / reschedule
  const [notifWa, setNotifWa] = useState<{ type: "approved" | "rescheduled"; oldDate?: string; oldTime?: string } | null>(null);

  // CRM customer detail link for the selected appointment (if it has a DB customer).
  const selectedCrmCustomer = selectedAppointment?.customerId
    ? { id: selectedAppointment.customerId }
    : undefined;

  const todayKey = toDateKey(new Date()); // real today

  // Availability config hydrates from the API on mount; guard before any use.
  if (!availabilityConfig) {
    return <p className="py-16 text-center text-sm text-muted-foreground">Memuat kalender...</p>;
  }
  const config = availabilityConfig;

  // Week helper: start of the week (Sunday)
  const getStartOfWeek = (d: Date) => {
    const date = new Date(d);
    const day = date.getDay();
    const diff = date.getDate() - day;
    return new Date(date.setDate(diff));
  };

  const startOfWeek = getStartOfWeek(currentDate);
  const weekDates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(startOfWeek);
    d.setDate(startOfWeek.getDate() + i);
    return d;
  });

  // Navigation handlers
  const handlePrevPeriod = () => {
    const newD = new Date(currentDate);
    if (viewMode === "week") {
      newD.setDate(currentDate.getDate() - 7);
    } else if (viewMode === "day") {
      newD.setDate(currentDate.getDate() - 1);
    } else {
      newD.setMonth(currentDate.getMonth() - 1);
    }
    setCurrentDate(newD);
  };

  const handleNextPeriod = () => {
    const newD = new Date(currentDate);
    if (viewMode === "week") {
      newD.setDate(currentDate.getDate() + 7);
    } else if (viewMode === "day") {
      newD.setDate(currentDate.getDate() + 1);
    } else {
      newD.setMonth(currentDate.getMonth() + 1);
    }
    setCurrentDate(newD);
  };

  const handleJumpToToday = () => {
    setCurrentDate(new Date());
  };

  // Check if date falls in vacation
  const checkIsVacation = (dateKey: string) => {
    return config.vacations.find(
      (v) => dateKey >= v.start && dateKey <= v.end
    );
  };

  // Check if date is closed (weekly template has no ranges)
  const checkIsWeeklyClosed = (date: Date) => {
    const weekday = date.getDay();
    return config.weeklyTemplate[weekday as keyof typeof config.weeklyTemplate]?.length === 0;
  };

  // Get blocked ranges
  const getBlockedForDate = (dateKey: string) => {
    return config.blockedTimes.filter((b) => b.date === dateKey);
  };

  // Formatter for heading
  const getPeriodHeading = () => {
    if (viewMode === "day") {
      return formatDateId(currentDate, { withWeekday: true });
    }
    if (viewMode === "week") {
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      if (startOfWeek.getMonth() === endOfWeek.getMonth()) {
        return `${startOfWeek.getDate()} - ${endOfWeek.getDate()} ${monthNamesId[startOfWeek.getMonth()]} ${startOfWeek.getFullYear()}`;
      }
      return `${startOfWeek.getDate()} ${monthNamesId[startOfWeek.getMonth()]} - ${endOfWeek.getDate()} ${monthNamesId[endOfWeek.getMonth()]} ${startOfWeek.getFullYear()}`;
    }
    return `${monthNamesId[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
  };

  const getStatusBadge = (status: BookingStatus) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-emerald-50 text-emerald-700 border-emerald-100 font-medium">Selesai</Badge>;
      case "confirmed":
        return <Badge className="bg-primary text-primary-foreground font-medium">Dikonfirmasi</Badge>;
      case "waiting_verification":
        return <Badge className="bg-amber-50 text-amber-700 border-amber-100 font-medium">Verifikasi</Badge>;
      case "pending_deposit":
        return <Badge className="bg-secondary-soft text-secondary-foreground border-secondary/20 font-medium">DP Pending</Badge>;
      case "cancelled":
        return <Badge variant="destructive" className="font-medium">Batal</Badge>;
      case "no_show":
        return <Badge variant="destructive" className="font-medium">No Show</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Reschedule submit handler
  const handleRescheduleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reschedDate || !reschedTime) {
      toast.error("Tanggal dan Waktu wajib ditentukan!");
      return;
    }
    if (!selectedAppointment) return;

    const oldDate = selectedAppointment.date;
    const oldTime = selectedAppointment.time;
    rescheduleAppointment(selectedAppointment.id, reschedDate, reschedTime);
    toast.success("Jadwal janji temu berhasil dipindahkan! 📅");
    
    // update current selected representation
    setSelectedAppointment({
      ...selectedAppointment,
      date: reschedDate,
      time: reschedTime,
      status: selectedAppointment.status === "cancelled" || selectedAppointment.status === "no_show" ? "confirmed" : selectedAppointment.status,
    });
    setIsRescheduling(false);
    setNotifWa({ type: "rescheduled", oldDate, oldTime });
  };

  /** Drag & drop reschedule: move an appointment to another day (keeps its time). */
  const handleDropOnDay = (e: React.DragEvent, dateKey: string) => {
    e.preventDefault();
    const appointmentId = e.dataTransfer.getData("text/plain");
    if (!appointmentId) return;
    const target = appointments.find((a) => a.id === appointmentId);
    if (!target || target.date === dateKey) return;
    rescheduleAppointment(target.id, dateKey, target.time);
    toast.success("Jadwal dipindahkan ke hari lain! 📅");
  };

  const handleDragOverDay = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  return (
    <div className="space-y-6">
      {/* Calendar Control Bar */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b border-border/50 pb-5">
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="icon"
            onClick={handlePrevPeriod}
            aria-label="Periode sebelumnya"
          >
            <CaretLeftIcon className="size-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={handleNextPeriod}
            aria-label="Periode berikutnya"
          >
            <CaretRightIcon className="size-4" />
          </Button>
          <Button variant="outline" size="sm" className="ml-1 text-xs font-semibold" onClick={handleJumpToToday}>
            Hari Ini
          </Button>
          <span className="text-sm font-heading font-semibold text-foreground/90 ml-3 hidden sm:inline-block">
            {getPeriodHeading()}
          </span>
        </div>

        {/* Small Screen Heading representation */}
        <span className="text-sm font-heading font-semibold text-foreground/90 sm:hidden">
          {getPeriodHeading()}
        </span>

        {/* View Mode Tabs */}
        <div className="flex rounded-xl border border-border/75 bg-muted/40 p-1 w-fit">
          {(["day", "week", "month"] as ViewMode[]).map((mode) => (
            <button
              key={mode}
              className={cn(
                "rounded-lg px-3 py-1.5 text-xs font-semibold capitalize transition-all",
                viewMode === mode
                  ? "bg-card text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              )}
              onClick={() => setViewMode(mode)}
            >
              {mode === "day" ? "Hari" : mode === "week" ? "Minggu" : "Bulan"}
            </button>
          ))}
        </div>
      </div>

      {/* 1. WEEK VIEW (Default) */}
      {viewMode === "week" && (
        <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
          {weekDates.map((date) => {
            const dateKey = toDateKey(date);
            const isToday = dateKey === todayKey;
            const dayAppts = appointments
              .filter((a) => a.date === dateKey)
              .sort((a, b) => a.time.localeCompare(b.time));
            
            const vacation = checkIsVacation(dateKey);
            const isClosed = checkIsWeeklyClosed(date);
            const blockedTimes = getBlockedForDate(dateKey);

            return (
              <div
                key={dateKey}
                onDrop={(e) => handleDropOnDay(e, dateKey)}
                onDragOver={handleDragOverDay}
                className={cn(
                  "rounded-2xl border bg-card p-4 min-h-[300px] flex flex-col gap-3 transition-colors",
                  isToday ? "border-primary/50 shadow-sm shadow-primary/5 bg-background-tint/10" : "border-border/60",
                  isClosed || vacation ? "bg-muted/10 border-dashed" : ""
                )}
              >
                {/* Date header inside column */}
                <div className="border-b border-border/45 pb-2">
                  <div className="flex items-baseline justify-between">
                    <span className="text-xs font-semibold text-muted-foreground">
                      {dayNamesId[date.getDay()]}
                    </span>
                    {isToday && (
                      <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[9px] font-bold text-primary">
                        Hari Ini
                      </span>
                    )}
                  </div>
                  <h4 className="font-heading text-lg font-bold text-foreground mt-0.5">
                    {date.getDate()}
                  </h4>
                </div>

                {/* Column Content */}
                <div className="flex-1 flex flex-col gap-2.5">
                  {/* Vacation message */}
                  {vacation && (
                    <div className="rounded-xl border border-dashed border-rose-200/50 bg-rose-50/20 p-2 text-center">
                      <span className="text-[10px] font-semibold text-rose-600">🏖️ Tim Cuti</span>
                      <p className="text-[9px] text-muted-foreground mt-0.5 leading-tight">{vacation.reason}</p>
                    </div>
                  )}

                  {/* Regular Closed days */}
                  {!vacation && isClosed && (
                    <div className="rounded-xl border border-dashed border-border/80 bg-muted/20 p-3 text-center my-auto">
                      <span className="text-xs font-semibold text-muted-foreground">Tutup 🌸</span>
                    </div>
                  )}

                  {/* Blocked Times */}
                  {!vacation && blockedTimes.map((block, idx) => (
                    <div
                      key={idx}
                      className="rounded-xl border border-border/60 bg-muted/30 pattern-hatch p-2 text-left"
                    >
                      <div className="flex items-center gap-1 text-[10px] font-semibold text-muted-foreground">
                        <ClockIcon className="size-3" />
                        <span>{block.range.start} - {block.range.end}</span>
                      </div>
                      <p className="text-[10px] font-bold text-foreground/80 mt-0.5 truncate">
                        🔒 {block.reason}
                      </p>
                    </div>
                  ))}

                  {/* Appointments */}
                  {!vacation && dayAppts.length === 0 && !isClosed && (
                    <div className="flex-1 flex items-center justify-center py-8 border border-dashed border-border/30 rounded-xl">
                      <span className="text-[10px] font-medium text-muted-foreground/60 italic">Kosong</span>
                    </div>
                  )}

                  {!vacation && dayAppts.map((appt) => (
                    <button
                      key={appt.id}
                      draggable
                      onDragStart={(e) => {
                        e.dataTransfer.setData("text/plain", appt.id);
                        e.dataTransfer.effectAllowed = "move";
                      }}
                      className={cn(
                        "rounded-xl border p-2.5 text-left transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xs scale-[0.99] active:scale-[0.97] cursor-grab",
                        appt.status === "completed"
                          ? "bg-muted/30 border-border/40 text-muted-foreground"
                          : appt.status === "confirmed"
                          ? "bg-primary-foreground/30 border-primary/25 text-foreground hover:bg-primary-foreground/50"
                          : "bg-amber-50/20 border-amber-200/50 hover:bg-amber-50/40 text-foreground"
                      )}
                      onClick={() => {
                        setSelectedAppointment(appt);
                        setIsRescheduling(false);
                        setIsRejecting(false);
                      }}
                    >
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-[10px] font-bold text-primary font-heading">
                          {appt.time}
                        </span>
                        <span className="text-[9px] text-muted-foreground font-medium shrink-0">
                          {appt.durationMinutes}m
                        </span>
                      </div>
                      <p className="text-xs font-semibold text-foreground/90 mt-1 truncate">
                        {appt.customer.name}
                      </p>
                      <p className="text-[10px] text-muted-foreground truncate">
                        {serviceNamesLabel(appt.services)}
                        {appt.addOns.length > 0 && (
                          <span className="text-secondary font-semibold"> · + {addOnsLabel(appt.addOns)}</span>
                        )}
                      </p>
                      <div className="flex items-center justify-between gap-1 mt-2 pt-1.5 border-t border-border/40">
                        <span className="text-[9px] font-bold text-foreground/70">
                          {formatIDR(appt.price)}
                        </span>
                        <span className="text-[9px] font-medium scale-90 origin-right">
                          {appt.status === "completed" ? "Selesai" : appt.status === "waiting_verification" ? "Verify" : "Ready"}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 2. DAY VIEW */}
      {viewMode === "day" && (
        <div className="bg-card rounded-2xl border border-border/60 p-6 shadow-xs max-w-2xl mx-auto">
          <div className="flex items-center justify-between border-b border-border/50 pb-4 mb-4">
            <h3 className="font-heading text-base font-semibold text-foreground/90">
              Agenda Hari Ini
            </h3>
            <span className="text-xs font-medium text-muted-foreground">
              {checkIsWeeklyClosed(currentDate) ? "🌸 Hari Libur" : "📅 Hari Kerja"}
            </span>
          </div>

          {/* List of times or message */}
          {(() => {
            const dateKey = toDateKey(currentDate);
            const dayAppts = appointments
              .filter((a) => a.date === dateKey)
              .sort((a, b) => a.time.localeCompare(b.time));
            const vacation = checkIsVacation(dateKey);
            const isClosed = checkIsWeeklyClosed(currentDate);
            const blockedTimes = getBlockedForDate(dateKey);

            if (vacation) {
              return (
                <div className="py-16 text-center">
                  <span className="text-4xl">🏖️</span>
                  <p className="text-sm font-semibold text-rose-600 mt-2">Tutup (Cuti)</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{vacation.reason}</p>
                </div>
              );
            }

            if (isClosed) {
              return (
                <div className="py-16 text-center">
                  <span className="text-4xl">🌸</span>
                  <p className="text-sm font-semibold text-muted-foreground mt-2">Tidak Buka</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Sesuai template operasional mingguan.</p>
                </div>
              );
            }

            return (
              <div className="space-y-4">
                {/* Blocked Times first */}
                {blockedTimes.map((block, idx) => (
                  <div key={idx} className="flex gap-4 p-3 bg-muted/20 border border-dashed rounded-xl pattern-hatch">
                    <span className="text-xs font-semibold text-muted-foreground">{block.range.start} - {block.range.end}</span>
                    <div>
                      <p className="text-xs font-bold text-foreground/80">🔒 Waktu Diblokir</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">{block.reason}</p>
                    </div>
                  </div>
                ))}

                {dayAppts.length === 0 ? (
                  <div className="py-16 text-center">
                    <span className="text-2xl">✨</span>
                    <p className="text-sm font-semibold text-muted-foreground mt-2">Tidak ada janji temu</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Belum ada booking terjadwal untuk hari ini.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {dayAppts.map((appt) => (
                      <div
                        key={appt.id}
                        draggable
                        onDragStart={(e) => {
                          e.dataTransfer.setData("text/plain", appt.id);
                          e.dataTransfer.effectAllowed = "move";
                        }}
                        className={cn(
                          "flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 p-3.5 rounded-xl border cursor-pointer hover:bg-muted/10 transition-all",
                          appt.status === "completed" ? "bg-muted/10 border-border/50 text-muted-foreground" : "border-border bg-card"
                        )}
                        onClick={() => {
                          setSelectedAppointment(appt);
                          setIsRescheduling(false);
                          setIsRejecting(false);
                        }}
                      >
                        {/* Top Row on mobile / Left column on desktop */}
                        <div className="flex items-center gap-3">
                          <div className="flex flex-col items-center justify-center bg-muted/60 text-foreground w-12 h-12 rounded-lg shrink-0 text-xs font-bold">
                            {appt.time}
                          </div>
                          
                          <div className="flex-1 min-w-0 sm:hidden">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="font-semibold text-sm text-foreground">{appt.customer.name}</span>
                              {getStatusBadge(appt.status)}
                            </div>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {serviceNamesLabel(appt.services)}
                              {appt.addOns.length > 0 && <span className="text-secondary font-semibold"> · + {addOnsLabel(appt.addOns)}</span>}
                              {appt.designTitle && ` · ${appt.designTitle}`}
                            </p>
                          </div>
                        </div>

                        {/* Middle Column (only on desktop) */}
                        <div className="hidden sm:block flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-semibold text-sm truncate text-foreground">{appt.customer.name}</span>
                            {getStatusBadge(appt.status)}
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            {serviceNamesLabel(appt.services)}
                            {appt.addOns.length > 0 && <span className="text-secondary font-semibold"> · + {addOnsLabel(appt.addOns)}</span>}
                            {appt.designTitle && ` · ${appt.designTitle}`}
                          </p>
                        </div>

                        {/* Price details: aligned right on desktop, inline flex row on mobile */}
                        <div className="flex items-center justify-between sm:justify-end border-t border-border/40 sm:border-0 pt-2.5 sm:pt-0 mt-1 sm:mt-0">
                          <span className="text-[10px] text-muted-foreground font-semibold sm:hidden">Biaya:</span>
                          <span className="text-sm font-bold font-heading text-foreground">
                            {formatIDR(appt.price)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })()}
        </div>
      )}

      {/* 3. MONTH VIEW */}
      {viewMode === "month" && (
        <div className="bg-card rounded-2xl border border-border/60 p-4 shadow-xs">
          {/* Weekday labels */}
          <div className="grid grid-cols-7 gap-1 text-center font-heading text-xs font-semibold text-muted-foreground pb-2 border-b border-border/40 mb-1">
            {dayNamesId.map((name) => (
              <span key={name}>{name.slice(0, 3)}</span>
            ))}
          </div>

          {/* Month grid days */}
          {(() => {
            const year = currentDate.getFullYear();
            const month = currentDate.getMonth();
            
            const firstDayIndex = new Date(year, month, 1).getDay();
            const totalDays = new Date(year, month + 1, 0).getDate();
            
            const cells = [];
            // empty cells before 1st of month
            for (let i = 0; i < firstDayIndex; i++) {
              cells.push(<div key={`empty-${i}`} className="min-h-[80px] bg-muted/5 border border-transparent rounded-lg" />);
            }

            // days of month
            for (let d = 1; d <= totalDays; d++) {
              const dDate = new Date(year, month, d);
              const dKey = toDateKey(dDate);
              const isToday = dKey === todayKey;
              
              const dayAppts = appointments.filter((a) => a.date === dKey);
              const vacation = checkIsVacation(dKey);
              const isClosed = checkIsWeeklyClosed(dDate);

              cells.push(
                <div
                  key={dKey}
                  onDrop={(e) => handleDropOnDay(e, dKey)}
                  onDragOver={handleDragOverDay}
                  className={cn(
                    "min-h-[80px] border border-border/40 p-1.5 rounded-lg flex flex-col justify-between hover:bg-muted/15 cursor-pointer transition-colors",
                    isToday ? "bg-background-tint/15 border-primary/50" : "bg-card",
                    isClosed || vacation ? "bg-muted/10 text-muted-foreground" : ""
                  )}
                  onClick={() => {
                    setCurrentDate(dDate);
                    setViewMode("day");
                  }}
                >
                  <div className="flex items-center justify-between">
                    <span className={cn(
                      "text-xs font-bold font-heading",
                      isToday ? "text-primary bg-primary/10 w-5 h-5 rounded-full flex items-center justify-center" : "text-foreground"
                    )}>
                      {d}
                    </span>
                    {dayAppts.length > 0 && (
                      <span className="size-1.5 rounded-full bg-primary" />
                    )}
                  </div>

                  {/* Micro list of appts */}
                  <div className="flex-1 mt-1 flex flex-col gap-0.5 overflow-hidden justify-end">
                    {vacation ? (
                      <span className="text-[7.5px] font-bold text-rose-500 truncate leading-none">🏖️ Cuti</span>
                    ) : isClosed ? (
                      <span className="text-[7.5px] text-muted-foreground/60 truncate leading-none">Tutup</span>
                    ) : (
                      dayAppts.slice(0, 2).map((appt) => (
                        <div key={appt.id} className="text-[8.5px] font-medium bg-muted/65 px-1 py-0.5 rounded-sm truncate text-foreground/80 leading-none">
                          {appt.time} {appt.customer.name.split(" ")[0]}
                        </div>
                      ))
                    )}
                    {dayAppts.length > 2 && (
                      <span className="text-[8px] text-muted-foreground font-semibold text-right leading-none pr-1">
                        +{dayAppts.length - 2} lagi
                      </span>
                    )}
                  </div>
                </div>
              );
            }

            return <div className="grid grid-cols-7 gap-1">{cells}</div>;
          })()}
        </div>
      )}

      {/* Appointment Detail & Actions Sheet */}
      <Sheet open={!!selectedAppointment} onOpenChange={(open) => !open && setSelectedAppointment(null)}>
        {selectedAppointment && (
          <SheetContent className="sm:max-w-md bg-card h-full overflow-y-auto">
            <SheetHeader className="border-b border-border/55 px-6 pt-6 pb-4">
              <SheetTitle className="font-heading text-lg font-semibold text-primary flex items-center gap-2">
                <span>Appointment Detail</span>
                <span className="text-xs font-normal text-muted-foreground">({selectedAppointment.id})</span>
              </SheetTitle>
            </SheetHeader>
            
            <div className="px-6 py-5 space-y-6">
              {/* Customer info card */}
              <div className="rounded-xl border border-border bg-background-tint/5 p-4 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                  <UserIcon className="size-3.5" /> Profil Customer
                </h4>
                <div>
                  <p className="font-heading text-sm font-semibold text-foreground">
                    {selectedAppointment.customer.name}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                    <PhoneIcon className="size-3" /> {selectedAppointment.customer.phone}
                  </p>
                  {selectedAppointment.customer.email && (
                    <p className="text-xs text-muted-foreground mt-0.5">
                      ✉️ {selectedAppointment.customer.email}
                    </p>
                  )}
                  {selectedAppointment.customer.instagram && (
                    <p className="text-xs text-muted-foreground mt-0.5">
                      📷 {selectedAppointment.customer.instagram}
                    </p>
                  )}
                </div>
                {selectedAppointment.customer.notes && (
                  <div className="bg-secondary-soft/50 border border-secondary/20 p-2.5 rounded-lg text-xs text-secondary-foreground">
                    <span className="font-bold">Catatan Kuku:</span> {selectedAppointment.customer.notes}
                  </div>
                )}
                <div className="text-[10px] text-muted-foreground pt-1 border-t border-border/40">
                  📋 Status Customer: <span className="font-semibold text-primary">Customer Setia (3 booking selesai)</span>
                </div>
                <div className="flex flex-wrap gap-2 pt-1">
                  <Button
                    size="sm"
                    className="gap-1.5 rounded-full bg-emerald-600 px-3.5 text-white hover:bg-emerald-700"
                    nativeButton={false}
                    render={
                      <a
                        href={waCustomerChatLink(
                          selectedAppointment.customer.phone,
                          `Halo ${selectedAppointment.customer.name.split(" ")[0]}! Ini Denailss 🖊️`
                        )}
                        target="_blank"
                        rel="noopener noreferrer"
                      />
                    }
                  >
                    <WhatsappLogoIcon weight="fill" className="size-3.5" />
                    WhatsApp
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-1.5 rounded-full px-3.5"
                    nativeButton={false}
                    render={<Link href={`/backoffice/appointments/${selectedAppointment.id}`} />}
                  >
                    <ArrowRightIcon className="size-3.5" />
                    Lihat Detail
                  </Button>
                  {selectedCrmCustomer && (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="gap-1.5 rounded-full px-3.5 text-muted-foreground"
                      nativeButton={false}
                      render={<Link href={`/backoffice/customers/${selectedCrmCustomer.id}`} />}
                    >
                      <UserIcon className="size-3.5" />
                      Lihat Customer
                    </Button>
                  )}
                </div>
              </div>

              {/* Appointment info card */}
              <div className="space-y-2 text-xs">
                <h4 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Informasi Booking
                </h4>
                <div className="grid grid-cols-2 gap-3.5 bg-muted/15 border rounded-xl p-3.5">
                  <div>
                    <p className="text-muted-foreground">Tanggal</p>
                    <p className="font-semibold mt-0.5">{formatDateId(parseDateKey(selectedAppointment.date))}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Waktu &amp; Durasi</p>
                    <p className="font-semibold mt-0.5">{selectedAppointment.time} · {selectedAppointment.durationMinutes}m</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Layanan</p>
                    <p className="font-semibold text-primary mt-0.5">{serviceNamesLabel(selectedAppointment.services)}</p>
                    {selectedAppointment.addOns.length > 0 && (
                      <p className="text-secondary font-semibold mt-0.5 text-[11px]">
                        + {addOnsLabel(selectedAppointment.addOns)}
                      </p>
                    )}
                  </div>
                  <div>
                    <p className="text-muted-foreground">Desain Seni</p>
                    <p className="font-semibold mt-0.5">{selectedAppointment.designTitle || "Polos"}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Status Booking</p>
                    <div className="mt-0.5">{getStatusBadge(selectedAppointment.status)}</div>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Total Biaya</p>
                    <p className="font-semibold text-foreground mt-0.5">{formatIDR(selectedAppointment.price)}</p>
                  </div>
                </div>
              </div>

              {/* Deposit Section */}
              {selectedAppointment.depositRequired && (
                <div className="space-y-2 text-xs">
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    Verifikasi Deposit
                  </h4>
                  <div className="border rounded-xl p-3.5 bg-muted/10 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-muted-foreground">Jumlah Deposit</p>
                        <p className="text-sm font-bold text-secondary-foreground mt-0.5">
                          {formatIDR(selectedAppointment.depositAmount || 50000)}
                        </p>
                      </div>
                      <Badge className={cn(
                        selectedAppointment.depositStatus === "approved"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : selectedAppointment.depositStatus === "rejected"
                          ? "bg-rose-50 text-rose-700 border-rose-200"
                          : "bg-amber-50 text-amber-700 border-amber-200"
                      )}>
                        {selectedAppointment.depositStatus === "approved"
                          ? "Lunas"
                          : selectedAppointment.depositStatus === "rejected"
                          ? "Ditolak"
                          : "Verifikasi Tertunda"}
                      </Badge>
                    </div>

                    {selectedAppointment.depositRejectReason && (
                      <p className="text-xs font-semibold text-destructive mt-1 bg-destructive/5 p-2 rounded-lg border border-destructive/10">
                        Alasan Tolak: {selectedAppointment.depositRejectReason}
                      </p>
                    )}

                    {selectedAppointment.depositProofUrl && (
                      <div className="space-y-1">
                        <p className="text-[10px] text-muted-foreground">Bukti Pengiriman:</p>
                        <div className="relative aspect-video w-full max-w-[200px] rounded-lg overflow-hidden border">
                          <DepositProofImage reference={selectedAppointment.depositProofUrl} />
                        </div>
                      </div>
                    )}

                    {/* Pending actions */}
                    {selectedAppointment.depositStatus === "waiting_verification" && !isRejecting && (
                      <div className="flex gap-2 pt-2">
                        <Button
                          size="sm"
                          className="bg-emerald-600 hover:bg-emerald-700 text-white"
                          onClick={() => {
                            approveDeposit(selectedAppointment.id);
                            toast.success("Deposit berhasil diverifikasi dan disetujui! 💅");
                            setSelectedAppointment({
                              ...selectedAppointment,
                              status: "confirmed",
                              depositStatus: "approved",
                            });
                            setNotifWa({ type: "approved" });
                          }}
                        >
                          Setujui Deposit
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => setIsRejecting(true)}
                        >
                          Tolak
                        </Button>
                      </div>
                    )}

                    {isRejecting && (
                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          if (!rejectReason) return;
                          rejectDeposit(selectedAppointment.id, rejectReason);
                          toast.info("Deposit ditolak.");
                          setSelectedAppointment({
                            ...selectedAppointment,
                            status: "pending_deposit",
                            depositStatus: "rejected",
                            depositRejectReason: rejectReason,
                          });
                          setIsRejecting(false);
                          setRejectReason("");
                        }}
                        className="space-y-2 pt-2 border-t"
                      >
                        <Label htmlFor="rej" className="text-xs font-semibold text-destructive">Masukkan Alasan Penolakan</Label>
                        <Input
                          id="rej"
                          placeholder="Bukti buram / nominal salah..."
                          value={rejectReason}
                          onChange={(e) => setRejectReason(e.target.value)}
                          required
                        />
                        <div className="flex gap-2">
                          <Button type="submit" size="sm" variant="destructive">Kirim Alasan</Button>
                          <Button type="button" size="sm" variant="ghost" onClick={() => setIsRejecting(false)}>Batal</Button>
                        </div>
                      </form>
                    )}
                  </div>
                </div>
              )}

              {/* Reschedule Inline Form */}
              {isRescheduling ? (
                <form onSubmit={handleRescheduleSubmit} className="border border-primary/20 rounded-xl p-4 bg-primary-foreground/10 space-y-3 animate-in fade-in duration-200">
                  <h4 className="text-xs font-bold text-primary">Reschedule Appointment</h4>
                  <div className="grid grid-cols-2 gap-3.5">
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
                      <Label htmlFor="resTime" className="text-[10px]">Waktu Baru</Label>
                      <Input
                        id="resTime"
                        type="time"
                        value={reschedTime}
                        onChange={(e) => setReschedTime(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <div className="flex gap-2 pt-1">
                    <Button type="submit" size="sm" className="px-4">Simpan Reschedule</Button>
                    <Button type="button" size="sm" variant="ghost" onClick={() => setIsRescheduling(false)}>Batal</Button>
                  </div>
                </form>
              ) : (
                /* Action buttons based on status */
                <div className="border-t border-border/50 pt-4 flex flex-wrap gap-2.5">
                  {selectedAppointment.status === "confirmed" && (
                    <>
                      <Button
                        size="sm"
                        className="bg-emerald-600 hover:bg-emerald-700 text-white"
                        onClick={() => {
                          updateAppointmentStatus(selectedAppointment.id, "completed");
                          toast.success("Appointment ditandai selesai! 💅");
                          setSelectedAppointment({ ...selectedAppointment, status: "completed" });
                        }}
                      >
                        Tandai Selesai
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setIsRescheduling(true);
                          setReschedDate(selectedAppointment.date);
                          setReschedTime(selectedAppointment.time);
                        }}
                      >
                        Reschedule
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-destructive hover:bg-destructive/5"
                        onClick={() => {
                          updateAppointmentStatus(selectedAppointment.id, "no_show");
                          toast.info("Appointment ditandai No Show.");
                          setSelectedAppointment({ ...selectedAppointment, status: "no_show" });
                        }}
                      >
                        No Show
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-destructive hover:bg-destructive/5"
                        onClick={() => {
                          updateAppointmentStatus(selectedAppointment.id, "cancelled");
                          toast.warning("Appointment dibatalkan.");
                          setSelectedAppointment({ ...selectedAppointment, status: "cancelled" });
                        }}
                      >
                        Batalkan Booking
                      </Button>
                    </>
                  )}

                  {selectedAppointment.status === "pending" && (
                    <>
                      <Button
                        size="sm"
                        onClick={() => {
                          updateAppointmentStatus(selectedAppointment.id, "confirmed");
                          toast.success("Appointment dikonfirmasi! 📅");
                          setSelectedAppointment({ ...selectedAppointment, status: "confirmed" });
                        }}
                      >
                        Konfirmasi Booking
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-destructive hover:bg-destructive/5"
                        onClick={() => {
                          updateAppointmentStatus(selectedAppointment.id, "cancelled");
                          toast.warning("Appointment dibatalkan.");
                          setSelectedAppointment({ ...selectedAppointment, status: "cancelled" });
                        }}
                      >
                        Tolak &amp; Batalkan
                      </Button>
                    </>
                  )}

                  {(selectedAppointment.status === "cancelled" || selectedAppointment.status === "no_show") && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setIsRescheduling(true);
                        setReschedDate(selectedAppointment.date);
                        setReschedTime(selectedAppointment.time);
                      }}
                    >
                      Jadwalkan Ulang (Reschedule)
                    </Button>
                  )}

                  {selectedAppointment.status === "completed" && (
                    <div className="flex flex-col gap-1 w-full bg-muted/30 border p-3 rounded-lg text-xs">
                      <p className="font-semibold">Ulasan Dari Pelanggan:</p>
                      <p className="italic mt-1 text-muted-foreground">&quot;Pengerjaannya rapi sekali, nail art 3D-nya lucu banget! Rekomen salon ini.&quot; ⭐️⭐️⭐️⭐️⭐️</p>
                    </div>
                  )}
                </div>
              )}

              {/* WhatsApp notify panel */}
              {notifWa && (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 shadow-xs animate-in fade-in duration-200">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white">
                        <WhatsappLogoIcon weight="fill" className="size-5" />
                      </span>
                      <div>
                        <p className="text-sm font-semibold text-emerald-900">
                          {notifWa.type === "approved" ? "Deposit disetujui!" : "Jadwal berhasil diubah!"}
                        </p>
                        <p className="mt-0.5 text-xs text-emerald-800/80 leading-relaxed">
                          Kirim pemberitahuan ke {selectedAppointment.customer.name} lewat WhatsApp?
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      aria-label="Tutup pemberitahuan"
                      className="rounded-full p-1 text-emerald-700 transition-colors hover:bg-emerald-100"
                      onClick={() => setNotifWa(null)}
                    >
                      <XIcon className="size-4" />
                    </button>
                  </div>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <Button
                      size="sm"
                      className="gap-1.5 rounded-full bg-emerald-600 px-4 text-white hover:bg-emerald-700"
                      nativeButton={false}
                      render={
                        <a
                          href={waCustomerChatLink(
                            selectedAppointment.customer.phone,
                            notifWa.type === "approved"
                              ? depositApprovedWaMessage(selectedAppointment)
                              : rescheduledWaMessage(
                                  selectedAppointment,
                                  notifWa.oldDate || selectedAppointment.date,
                                  notifWa.oldTime || selectedAppointment.time
                                )
                          )}
                          target="_blank"
                          rel="noopener noreferrer"
                        />
                      }
                    >
                      <WhatsappLogoIcon weight="fill" className="size-4" />
                      Beri Tahu di WhatsApp
                    </Button>
                    <Button size="sm" variant="ghost" className="rounded-full text-emerald-800" onClick={() => setNotifWa(null)}>
                      Nanti saja
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </SheetContent>
        )}
      </Sheet>
    </div>
  );
}
