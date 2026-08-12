"use client";

import React, { useState, useEffect } from "react";
import { useBackoffice } from "@/features/appointment/context/backoffice-context";
import { dayNamesId, toDateKey, parseDateKey, formatDateId } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  CalendarXIcon,
  ClockIcon,
  InfoIcon,
  LockSimpleIcon,
  SlidersIcon,
  TrashIcon,
  PlusIcon,
} from "@phosphor-icons/react/dist/ssr";
import type { TimeRange, PaymentMethod, AvailabilityWeekday, AvailabilityConfig, DepositConfig } from "@/types";

type TabName = "weekly" | "overrides" | "blocked" | "rules";

export function AvailabilityView() {
  const {
    availabilityConfig,
    depositConfig,
    updateWeeklyTemplate,
    addOverride,
    removeOverride,
    addVacation,
    removeVacation,
    addBlockedTime,
    removeBlockedTime,
    updateBookingRules,
    updateDepositConfig,
  } = useBackoffice();

  const [activeTab, setActiveTab] = useState<TabName>("weekly");

  // Weekly Editing states
  const [editingDay, setEditingDay] = useState<number | null>(null);
  const [tempRanges, setTempRanges] = useState<TimeRange[]>([]);
  const [newRangeStart, setNewRangeStart] = useState("09:00");
  const [newRangeEnd, setNewRangeEnd] = useState("12:00");

  // Add Override form states
  const [overrideDate, setOverrideDate] = useState("2026-08-17");
  const [overrideStart, setOverrideStart] = useState("08:00");
  const [overrideEnd, setOverrideEnd] = useState("17:00");

  // Add Vacation form states
  const [vacationStart, setVacationStart] = useState("2026-08-20");
  const [vacationEnd, setVacationEnd] = useState("2026-08-25");
  const [vacationReason, setVacationReason] = useState("");

  // Add Blocked Time form states
  const [blockDate, setBlockDate] = useState("2026-08-12");
  const [blockStart, setBlockStart] = useState("15:00");
  const [blockEnd, setBlockEnd] = useState("17:00");
  const [blockReason, setBlockReason] = useState("");

  // Booking Rules editing states
  const [rulesMinNotice, setRulesMinNotice] = useState(availabilityConfig?.bookingRules.minimumNoticeHours ?? 3);
  const [rulesWindow, setRulesWindow] = useState(availabilityConfig?.bookingRules.bookingWindowDays ?? 30);
  const [rulesMaxBookings, setRulesMaxBookings] = useState(availabilityConfig?.bookingRules.maxBookingsPerDay ?? 6);
  const [rulesBuffer, setRulesBuffer] = useState(availabilityConfig?.bookingRules.bufferMinutes ?? 15);

  // Deposit Config editing states
  const [depEnabled, setDepEnabled] = useState(depositConfig?.enabled ?? true);
  const [depType, setDepType] = useState(depositConfig?.type ?? "percentage");
  const [depValue, setDepValue] = useState(depositConfig?.value ?? 30);
  const [depNotes, setDepNotes] = useState(depositConfig?.notes ?? "");

  // Dynamic Payment Methods list
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>(depositConfig?.paymentMethods || []);

  // Add payment method form states
  const [newPmType, setNewPmType] = useState<"bank" | "ewallet" | "other">("bank");
  const [newPmName, setNewPmName] = useState("");
  const [newPmNumber, setNewPmNumber] = useState("");
  const [newPmOwner, setNewPmOwner] = useState("");

  // Re-sync the rules/deposit form fields whenever the configs hydrate or change,
  // so the forms never pin themselves to stale defaults from the initial mount.
  const syncRulesForm = (cfg: AvailabilityConfig) => {
    setRulesMinNotice(cfg.bookingRules.minimumNoticeHours);
    setRulesWindow(cfg.bookingRules.bookingWindowDays);
    setRulesMaxBookings(cfg.bookingRules.maxBookingsPerDay);
    setRulesBuffer(cfg.bookingRules.bufferMinutes);
  };

  const syncDepositForm = (cfg: DepositConfig) => {
    setDepEnabled(cfg.enabled);
    setDepType(cfg.type);
    setDepValue(cfg.value);
    setDepNotes(cfg.notes ?? "");
    setPaymentMethods(cfg.paymentMethods || []);
  };

  useEffect(() => {
    if (!availabilityConfig) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    syncRulesForm(availabilityConfig);
  }, [availabilityConfig]);

  useEffect(() => {
    if (!depositConfig) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    syncDepositForm(depositConfig);
  }, [depositConfig]);

  // Availability + deposit configs hydrate from the API on mount; guard before any use.
  if (!availabilityConfig || !depositConfig) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto">
        <p className="py-16 text-center text-sm text-muted-foreground">Memuat pengaturan ketersediaan...</p>
      </div>
    );
  }
  const config = availabilityConfig;

  // --- Derived summary metrics (for the header stat band + helper info) ---
  const weekdaysAll = Object.keys(config.weeklyTemplate).map(Number) as AvailabilityWeekday[];
  const openDays: number[] = weekdaysAll.filter((d) => (config.weeklyTemplate[d as AvailabilityWeekday] || []).length > 0);
  const closedDays: number[] = weekdaysAll.filter((d) => (config.weeklyTemplate[d as AvailabilityWeekday] || []).length === 0);
  const weeklyOpenCount = openDays.length;
  const weeklyClosedCount = closedDays.length;

  const totalWeeklyMinutes = openDays.reduce((sum, d) => {
    const dayRanges = config.weeklyTemplate[d as AvailabilityWeekday] || [];
    return (
      sum +
      dayRanges.reduce((s, r) => {
        const [sh, sm] = r.start.split(":").map(Number);
        const [eh, em] = r.end.split(":").map(Number);
        return s + (eh * 60 + em - (sh * 60 + sm));
      }, 0)
    );
  }, 0);

  const formatHours = (minutes: number) => {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    if (h === 0) return `${m} mnt`;
    if (m === 0) return `${h} jam`;
    return `${h} jam ${m} mnt`;
  };

  const overrideCount = Object.keys(config.overrides).length;
  const vacationCount = config.vacations.length;
  const blockedCount = config.blockedTimes.length;

  const todayKey = toDateKey(new Date());
  const todayOverride = config.overrides[todayKey];
  const todayClosed = config.vacations.some((v) => todayKey >= v.start && todayKey <= v.end);
  const todayWeekday = new Date().getDay() as AvailabilityWeekday;
  const todayTemplate = config.weeklyTemplate[todayWeekday] || [];
  const todayStatus = todayClosed
    ? "libur"
    : todayOverride
      ? "buka (override)"
      : todayTemplate.length > 0
        ? "buka"
        : "libur";

  const precedenceItems = [
    {
      icon: LockSimpleIcon,
      label: "Cuti",
      desc: "Memblokir seluruh hari pada rentang tanggal. Tidak ada sesi yang bisa dibooking.",
      tone: "text-destructive",
    },
    {
      icon: CalendarXIcon,
      label: "Override Tanggal Khusus",
      desc: "Mengganti jam kerja hari itu sepenuhnya dengan jam yang kamu set, termasuk hari yang biasanya libur.",
      tone: "text-primary",
    },
    {
      icon: ClockIcon,
      label: "Blokir Waktu",
      desc: "Menyembunyikan slot tertentu di hari yang tetap buka (misal untuk istirahat atau keperluan lain).",
      tone: "text-amber-600",
    },
    {
      icon: SlidersIcon,
      label: "Templat Mingguan",
      desc: "Jam kerja standar per hari, dipakai kalau tidak ada aturan khusus di atas.",
      tone: "text-muted-foreground",
    },
  ];

  const formatEffectiveDate = (dateKey: string) => {
    const date = parseDateKey(dateKey);
    return `${formatDateId(date, { withWeekday: true })}`;
  };

  // Weekly edit trigger
  const handleStartEditDay = (day: number) => {
    setEditingDay(day);
    setTempRanges([...(config.weeklyTemplate[day as 0 | 1 | 2 | 3 | 4 | 5 | 6] || [])]);
  };

  const handleAddTempRange = () => {
    if (newRangeStart >= newRangeEnd) {
      toast.error("Waktu mulai harus lebih awal dari waktu selesai!");
      return;
    }
    const overlaps = tempRanges.some(
      (r) => newRangeStart < r.end && r.start < newRangeEnd
    );
    if (overlaps) {
      toast.error("Sesi waktu bertabrakan dengan sesi yang sudah ada!");
      return;
    }
    const updated = [...tempRanges, { start: newRangeStart, end: newRangeEnd }].sort((a, b) =>
      a.start.localeCompare(b.start)
    );
    setTempRanges(updated);
  };

  const handleRemoveTempRange = (idx: number) => {
    setTempRanges(tempRanges.filter((_, i) => i !== idx));
  };

  const handleSaveWeeklyDay = () => {
    if (editingDay === null) return;
    updateWeeklyTemplate(editingDay, tempRanges);
    toast.success(`Jadwal hari ${dayNamesId[editingDay]} berhasil disimpan! 💅`);
    setEditingDay(null);
  };

  // Add handlers
  const handleAddOverride = (e: React.FormEvent) => {
    e.preventDefault();
    if (overrideStart >= overrideEnd) {
      toast.error("Waktu mulai harus lebih awal!");
      return;
    }
    addOverride(overrideDate, [{ start: overrideStart, end: overrideEnd }]);
    toast.success(`Override tanggal ${overrideDate} berhasil ditambahkan! 📅`);
  };

  const handleAddVacation = (e: React.FormEvent) => {
    e.preventDefault();
    if (vacationStart > vacationEnd) {
      toast.error("Tanggal cuti tidak valid!");
      return;
    }
    if (!vacationReason) {
      toast.error("Alasan cuti wajib diisi!");
      return;
    }
    addVacation({ start: vacationStart, end: vacationEnd, reason: vacationReason });
    toast.success("Periode cuti berhasil ditambahkan! 🏖️");
    setVacationReason("");
  };

  const handleAddBlockedTime = (e: React.FormEvent) => {
    e.preventDefault();
    if (blockStart >= blockEnd) {
      toast.error("Waktu mulai harus lebih awal!");
      return;
    }
    if (!blockReason) {
      toast.error("Alasan blokir waktu wajib diisi!");
      return;
    }
    addBlockedTime({
      date: blockDate,
      range: { start: blockStart, end: blockEnd },
      reason: blockReason,
    });
    toast.success("Waktu istirahat/blokir berhasil ditambahkan! 🔒");
    setBlockReason("");
  };

  const handleSaveRules = (e: React.FormEvent) => {
    e.preventDefault();
    updateBookingRules({
      minimumNoticeHours: Number(rulesMinNotice),
      bookingWindowDays: Number(rulesWindow),
      maxBookingsPerDay: Number(rulesMaxBookings),
      bufferMinutes: Number(rulesBuffer),
    });
    toast.success("Aturan booking berhasil diperbarui! 💅");
  };

  const handleSaveDepositConfig = (e: React.FormEvent) => {
    e.preventDefault();
    updateDepositConfig({
      enabled: depEnabled,
      type: depType,
      value: Number(depValue),
      paymentMethods,
      notes: depNotes,
    });
    toast.success("Konfigurasi deposit global berhasil diperbarui! 💅");
  };

  const handleAddPaymentMethod = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPmName || !newPmNumber || !newPmOwner) {
      toast.error("Semua field rekening/e-wallet wajib diisi!");
      return;
    }
    const newPm: PaymentMethod = {
      id: `pm-${Date.now()}`,
      type: newPmType,
      name: newPmName,
      accountNumber: newPmNumber,
      accountName: newPmOwner,
    };
    setPaymentMethods([...paymentMethods, newPm]);
    toast.success(`Metode pembayaran ${newPmName} berhasil ditambahkan ke daftar draft! ✨`);
    
    // Reset form
    setNewPmName("");
    setNewPmNumber("");
    setNewPmOwner("");
  };

  const handleRemovePaymentMethod = (id: string) => {
    setPaymentMethods(paymentMethods.filter((pm) => pm.id !== id));
    toast.info("Metode pembayaran dihapus dari daftar draft.");
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Subpage Header info */}
      <div className="border-b border-border/50 pb-4">
        <p className="text-xs text-muted-foreground font-medium">Pengaturan Command Center</p>
        <h2 className="font-heading text-xl font-bold text-foreground/90 mt-1">
          Ketersediaan Jam Kerja &amp; Aturan Operasional
        </h2>
        <p className="text-xs text-muted-foreground mt-0.5">
          Atur jadwal mingguan, tandai hari cuti, override tanggal merah, dan buat pemblokiran waktu.
        </p>
      </div>

      {/* Summary stat band */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-card border border-border/70 rounded-2xl p-4 shadow-xs">
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Hari Buka per Minggu</p>
          <p className="font-heading text-2xl font-bold text-foreground/90 mt-1">
            {weeklyOpenCount}<span className="text-sm font-semibold text-muted-foreground">/7</span>
          </p>
          <p className="text-[10px] text-muted-foreground mt-0.5">
            {weeklyOpenCount === 0
              ? "Belum ada hari yang diatur."
              : weeklyClosedCount > 0
                ? `Libur: ${weeklyClosedCount} hari.`
                : "Buka setiap hari."}
          </p>
        </div>

        <div className="bg-card border border-border/70 rounded-2xl p-4 shadow-xs">
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Total Jam Buka</p>
          <p className="font-heading text-2xl font-bold text-foreground/90 mt-1">
            {formatHours(totalWeeklyMinutes)}
          </p>
          <p className="text-[10px] text-muted-foreground mt-0.5">Gabungan semua sesi dalam seminggu.</p>
        </div>

        <div className="bg-card border border-border/70 rounded-2xl p-4 shadow-xs">
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Hari Ini</p>
          <p className="font-heading text-2xl font-bold text-foreground/90 mt-1 capitalize">
            {todayStatus}
          </p>
          <p className="text-[10px] text-muted-foreground mt-0.5">
            {todayStatus === "buka (override)"
              ? `${formatEffectiveDate(todayKey)} punya jadwal khusus.`
              : todayStatus === "libur"
                ? "Tidak ada sesi yang bisa dibooking hari ini."
                : "Sesi aktif sesuai templat mingguan."}
          </p>
        </div>

        <div className="bg-card border border-border/70 rounded-2xl p-4 shadow-xs">
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Aturan Khusus</p>
          <p className="font-heading text-2xl font-bold text-foreground/90 mt-1">
            {overrideCount + vacationCount + blockedCount}
          </p>
          <p className="text-[10px] text-muted-foreground mt-0.5">
            {overrideCount} override · {vacationCount} cuti · {blockedCount} blokir
          </p>
        </div>
      </div>

      {/* Precedence explainer */}
      <div className="bg-primary/5 border border-primary/15 rounded-2xl p-4 shadow-xs">
        <div className="flex items-start gap-3">
          <InfoIcon className="size-4 text-primary mt-0.5 shrink-0" weight="fill" />
          <div className="space-y-2.5 flex-1 min-w-0">
            <div>
              <p className="text-xs font-bold text-foreground/90">Bagaimana jam kerja ditentukan?</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                Setiap hari, sistem memakai aturan paling spesifik yang berlaku. Urutan prioritas dari paling tinggi:
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {precedenceItems.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.label} className="flex items-start gap-2 bg-background/60 border border-border/50 rounded-xl px-3 py-2">
                    <Icon className={cn("size-3.5 mt-0.5 shrink-0", item.tone)} weight="fill" />
                    <div className="min-w-0">
                      <p className="text-[11px] font-bold text-foreground/90">{item.label}</p>
                      <p className="text-[10px] text-muted-foreground leading-snug">{item.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs list */}
      <div className="flex border-b border-border/75 gap-6">
        {(["weekly", "overrides", "blocked", "rules"] as TabName[]).map((tab) => (
          <button
            key={tab}
            className={cn(
              "pb-3 text-xs font-semibold border-b-2 transition-all relative top-[1px]",
              activeTab === tab
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
            onClick={() => setActiveTab(tab)}
          >
            {tab === "weekly"
              ? "Jadwal Mingguan"
              : tab === "overrides"
              ? "Hari Cuti & Override"
              : tab === "blocked"
              ? "Blokir Waktu Spesifik"
              : "Aturan Booking"}
          </button>
        ))}
      </div>

      {/* Tab 1: Weekly schedule */}
      {activeTab === "weekly" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          {/* Days List */}
          <section className="bg-card border border-border/70 rounded-2xl p-5 shadow-xs space-y-4">
            <div>
              <h3 className="font-heading text-sm font-semibold text-foreground/90">
                Templat Sesi Mingguan
              </h3>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                Jam kerja standar tiap hari. Hari tanpa sesi otomatis dianggap libur, kecuali ada override.
              </p>
            </div>
            
            <div className="divide-y divide-border/60">
              {dayNamesId.map((name, idx) => {
                const ranges = availabilityConfig.weeklyTemplate[idx as 0 | 1 | 2 | 3 | 4 | 5 | 6] || [];
                const isEditingThis = editingDay === idx;
                const dayMinutes = ranges.reduce((s, r) => {
                  const [sh, sm] = r.start.split(":").map(Number);
                  const [eh, em] = r.end.split(":").map(Number);
                  return s + (eh * 60 + em - (sh * 60 + sm));
                }, 0);

                return (
                  <div key={idx} className={cn("py-3.5 first:pt-0 last:pb-0 flex items-center justify-between gap-4", ranges.length === 0 && "opacity-75")}>
                    <div className="flex flex-col gap-1">
                      <span className="font-heading text-sm font-bold text-foreground">{name}</span>
                      <div className="flex flex-wrap gap-1.5 mt-1">
                        {ranges.length === 0 ? (
                          <span className="text-xs font-medium text-muted-foreground italic">Libur / Tidak Buka</span>
                        ) : (
                          ranges.map((range, rIdx) => (
                            <Badge key={rIdx} variant="outline" className="bg-background font-medium text-[10px]">
                              {range.start} - {range.end}
                            </Badge>
                          ))
                        )}
                      </div>
                      {dayMinutes > 0 && (
                        <p className="text-[10px] text-muted-foreground mt-1">
                          Total {formatHours(dayMinutes)}.
                        </p>
                      )}
                    </div>

                    <Button
                      size="sm"
                      variant="outline"
                      className="rounded-full text-xs font-semibold px-4 shrink-0"
                      onClick={() => handleStartEditDay(idx)}
                    >
                      {isEditingThis ? "Mengedit..." : "Edit"}
                    </Button>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Session editor side column */}
          {editingDay !== null ? (
            <section className="bg-card border border-primary/20 rounded-2xl p-5 shadow-xs space-y-4 animate-in fade-in duration-200">
              <h3 className="font-heading text-sm font-semibold text-primary">
                Edit Sesi Hari {dayNamesId[editingDay]}
              </h3>

              <div className="space-y-3">
                <p className="text-[10px] text-muted-foreground">
                  Kamu bisa mengatur beberapa sesi terpisah (misal untuk jeda istirahat).
                </p>

                {tempRanges.length === 0 ? (
                  <div className="py-6 text-center border border-dashed rounded-xl text-muted-foreground italic text-xs">
                    Tidak ada sesi kerja. Rumah tidak beroperasi pada hari ini.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {tempRanges.map((range, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2 bg-muted/30 border rounded-lg">
                        <span className="text-xs font-semibold">{range.start} &rarr; {range.end}</span>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          className="text-destructive hover:bg-destructive/5"
                          onClick={() => handleRemoveTempRange(idx)}
                        >
                          <TrashIcon className="size-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Add range form */}
                <div className="bg-muted/15 border border-border/70 rounded-xl p-3.5 space-y-3">
                  <span className="text-xs font-bold text-foreground/80">Tambah Sesi Kerja</span>
                  <div className="grid grid-cols-2 gap-3.5">
                    <div className="grid gap-1">
                      <Label htmlFor="tstart" className="text-[10px]">Mulai</Label>
                      <Input
                        id="tstart"
                        type="time"
                        value={newRangeStart}
                        onChange={(e) => setNewRangeStart(e.target.value)}
                      />
                    </div>
                    <div className="grid gap-1">
                      <Label htmlFor="tend" className="text-[10px]">Selesai</Label>
                      <Input
                        id="tend"
                        type="time"
                        value={newRangeEnd}
                        onChange={(e) => setNewRangeEnd(e.target.value)}
                      />
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full gap-1"
                    size="sm"
                    onClick={handleAddTempRange}
                  >
                    <PlusIcon className="size-3.5" /> Tambah Sesi
                  </Button>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button className="flex-1" onClick={handleSaveWeeklyDay}>Simpan Perubahan</Button>
                  <Button variant="ghost" onClick={() => setEditingDay(null)}>Batal</Button>
                </div>
              </div>
            </section>
          ) : (
            <div className="hidden md:flex flex-col items-center justify-center p-12 text-center bg-muted/10 border border-dashed rounded-2xl h-64">
              <ClockIcon className="size-8 text-muted-foreground/45" />
              <p className="text-xs font-medium text-muted-foreground mt-2">Pilih &quot;Edit&quot; pada salah satu hari untuk mengatur jam sesi kerjanya.</p>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Overrides & Vacations */}
      {activeTab === "overrides" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          {/* Vacations section */}
          <div className="space-y-6">
            <section className="bg-card border border-border/70 rounded-2xl p-5 shadow-xs space-y-4">
              <div>
                <h3 className="font-heading text-sm font-semibold text-foreground/90 flex items-center gap-1.5">
                  <span className="text-base">🏖️</span> Jadwal Cuti
                </h3>
                <p className="text-[10px] text-muted-foreground mt-1">
                  Tutup sepenuhnya untuk satu rentang tanggal, misal libur Lebaran atau renovasi. Semua hari di dalamnya dianggap tidak beroperasi, dan ini mengalahkan override.
                </p>
              </div>

              {availabilityConfig.vacations.length === 0 ? (
                <div className="py-5 text-center text-xs text-muted-foreground italic bg-muted/10 border border-dashed rounded-xl">
                  Belum ada cuti terdaftar. Tambahkan di bawah kalau ada periode tutup.
                </div>
              ) : (
                <div className="space-y-2">
                  {availabilityConfig.vacations.map((vac, idx) => (
                    <div key={idx} className="p-3 bg-muted/20 border border-border/50 rounded-xl flex items-center justify-between gap-4">
                      <div>
                        <span className="text-xs font-bold text-foreground">
                          {vac.start} s/d {vac.end}
                        </span>
                        <p className="text-[10px] text-muted-foreground mt-0.5 font-medium">Alasan: {vac.reason}</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5 italic">Memblokir seluruh hari di rentang ini.</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        className="text-destructive hover:bg-destructive/5"
                        onClick={() => {
                          removeVacation(idx);
                          toast.info("Periode cuti dihapus.");
                        }}
                      >
                        <TrashIcon className="size-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              {/* Add vacation form */}
              <form onSubmit={handleAddVacation} className="bg-muted/15 border rounded-xl p-4 space-y-3 pt-3 border-t">
                <span className="text-xs font-bold text-foreground/80">Daftarkan Cuti Baru</span>
                <div className="grid grid-cols-2 gap-3">
                  <div className="grid gap-1">
                    <Label htmlFor="vstart" className="text-[10px]">Tanggal Mulai</Label>
                    <Input
                      id="vstart"
                      type="date"
                      value={vacationStart}
                      onChange={(e) => setVacationStart(e.target.value)}
                      required
                    />
                  </div>
                  <div className="grid gap-1">
                    <Label htmlFor="vend" className="text-[10px]">Tanggal Selesai</Label>
                    <Input
                      id="vend"
                      type="date"
                      value={vacationEnd}
                      onChange={(e) => setVacationEnd(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className="grid gap-1">
                  <Label htmlFor="vreason" className="text-[10px]">Keterangan Cuti</Label>
                  <Input
                    id="vreason"
                    placeholder="Contoh: Libur Lebaran / Renovasi"
                    value={vacationReason}
                    onChange={(e) => setVacationReason(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" size="sm" className="w-full">Tambahkan Cuti</Button>
              </form>
            </section>
          </div>

          {/* Overrides section */}
          <div className="space-y-6">
            <section className="bg-card border border-border/70 rounded-2xl p-5 shadow-xs space-y-4">
              <div>
                <h3 className="font-heading text-sm font-semibold text-foreground/90 flex items-center gap-1.5">
                  <span className="text-base">📅</span> Override Tanggal Khusus
                </h3>
                <p className="text-[10px] text-muted-foreground mt-1">
                  Beri jam kerja khusus untuk satu tanggal tertentu, termasuk hari yang biasanya libur. Mengganti total jadwal mingguan hari itu.
                </p>
              </div>

              {Object.keys(availabilityConfig.overrides).length === 0 ? (
                <div className="py-5 text-center text-xs text-muted-foreground italic bg-muted/10 border border-dashed rounded-xl">
                  Belum ada override tanggal khusus. Contoh: buka di hari Sabtu yang biasanya libur.
                </div>
              ) : (
                <div className="space-y-2">
                  {Object.entries(availabilityConfig.overrides).map(([dateKey, ranges]) => {
                    const weekday = parseDateKey(dateKey).getDay() as AvailabilityWeekday;
                    const normallyClosed = (availabilityConfig.weeklyTemplate[weekday] || []).length === 0;
                    return (
                      <div key={dateKey} className="p-3 bg-muted/20 border border-border/50 rounded-xl flex items-center justify-between gap-4">
                        <div>
                          <span className="text-xs font-bold text-foreground">
                            {formatEffectiveDate(dateKey)}
                          </span>
                          <div className="flex flex-wrap items-center gap-1.5 mt-1">
                            {ranges.map((r, ri) => (
                              <Badge key={ri} variant="outline" className="text-[9px] bg-background">
                                {r.start} - {r.end}
                              </Badge>
                            ))}
                            {normallyClosed && (
                              <Badge variant="secondary" className="text-[9px]">
                                Hari ini biasanya libur
                              </Badge>
                            )}
                          </div>
                          <p className="text-[10px] text-muted-foreground mt-0.5 italic">
                            {normallyClosed
                              ? "Override ini membuka hari yang biasanya libur."
                              : "Override ini mengganti jam kerja standar hari itu."}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          className="text-destructive hover:bg-destructive/5"
                          onClick={() => {
                            removeOverride(dateKey);
                            toast.info("Override tanggal khusus dihapus.");
                          }}
                        >
                          <TrashIcon className="size-4" />
                        </Button>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Add override form */}
              <form onSubmit={handleAddOverride} className="bg-muted/15 border rounded-xl p-4 space-y-3 pt-3 border-t">
                <span className="text-xs font-bold text-foreground/80">Override Tanggal Baru</span>
                <div className="grid gap-1">
                  <Label htmlFor="odate" className="text-[10px]">Pilih Tanggal</Label>
                  <Input
                    id="odate"
                    type="date"
                    value={overrideDate}
                    onChange={(e) => setOverrideDate(e.target.value)}
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="grid gap-1">
                    <Label htmlFor="ostart" className="text-[10px]">Buka Mulai</Label>
                    <Input
                      id="ostart"
                      type="time"
                      value={overrideStart}
                      onChange={(e) => setOverrideStart(e.target.value)}
                      required
                    />
                  </div>
                  <div className="grid gap-1">
                    <Label htmlFor="oend" className="text-[10px]">Tutup Jam</Label>
                    <Input
                      id="oend"
                      type="time"
                      value={overrideEnd}
                      onChange={(e) => setOverrideEnd(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <Button type="submit" size="sm" className="w-full">Tambahkan Override</Button>
              </form>
            </section>
          </div>
        </div>
      )}

      {/* Tab 3: Blocked Times */}
      {activeTab === "blocked" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          {/* List of blocked times */}
          <section className="bg-card border border-border/70 rounded-2xl p-5 shadow-xs space-y-4">
            <div>
              <h3 className="font-heading text-sm font-semibold text-foreground/90 flex items-center gap-1.5">
                <span className="text-base">🔒</span> Daftar Waktu Diblokir
              </h3>
              <p className="text-[10px] text-muted-foreground mt-1">
                Sembunyikan slot tertentu di hari yang tetap buka, misal untuk istirahat atau keperluan pribadi.
              </p>
            </div>

            {availabilityConfig.blockedTimes.length === 0 ? (
              <div className="py-5 text-center text-xs text-muted-foreground italic bg-muted/10 border border-dashed rounded-xl">
                Belum ada waktu yang diblokir. Slot tetap mengikuti jam kerja normal.
              </div>
            ) : (
              <div className="space-y-2">
                {availabilityConfig.blockedTimes.map((block, idx) => (
                  <div key={idx} className="p-3 bg-muted/20 border border-border/50 rounded-xl flex items-center justify-between gap-4">
                    <div>
                      <span className="text-xs font-bold text-foreground">
                        {formatEffectiveDate(block.date)} · {block.range.start} - {block.range.end}
                      </span>
                      <p className="text-[10px] text-muted-foreground mt-0.5 font-medium">Alasan: {block.reason}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      className="text-destructive hover:bg-destructive/5"
                      onClick={() => {
                        removeBlockedTime(idx);
                        toast.info("Pemblokiran waktu dihapus.");
                      }}
                    >
                      <TrashIcon className="size-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Form to add blocked time */}
          <section className="bg-card border border-border/70 rounded-2xl p-5 shadow-xs space-y-4">
            <h3 className="font-heading text-sm font-semibold text-foreground/90">
              Blokir Waktu Baru
            </h3>
            
            <form onSubmit={handleAddBlockedTime} className="space-y-3.5">
              <div className="grid gap-1">
                <Label htmlFor="bdate" className="text-xs">Pilih Tanggal</Label>
                <Input
                  id="bdate"
                  type="date"
                  value={blockDate}
                  onChange={(e) => setBlockDate(e.target.value)}
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-3.5">
                <div className="grid gap-1">
                  <Label htmlFor="bstart" className="text-[10px]">Mulai Blokir</Label>
                  <Input
                    id="bstart"
                    type="time"
                    value={blockStart}
                    onChange={(e) => setBlockStart(e.target.value)}
                    required
                  />
                </div>
                <div className="grid gap-1">
                  <Label htmlFor="bend" className="text-[10px]">Selesai Blokir</Label>
                  <Input
                    id="bend"
                    type="time"
                    value={blockEnd}
                    onChange={(e) => setBlockEnd(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="grid gap-1">
                <Label htmlFor="breason" className="text-xs">Keperluan / Keterangan</Label>
                <Input
                  id="breason"
                  placeholder="Contoh: Meeting Tim / Jam Makan Siang / Acara Keluarga"
                  value={blockReason}
                  onChange={(e) => setBlockReason(e.target.value)}
                  required
                />
              </div>

              <Button type="submit" className="w-full">Simpan Pemblokiran</Button>
            </form>
          </section>
        </div>
      )}

      {/* Tab 4: Booking Rules & Deposit Settings */}
      {activeTab === "rules" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start animate-in fade-in duration-200">
          {/* Column 1: Online Booking Rules */}
          <section className="bg-card border border-border/70 rounded-2xl p-6 shadow-xs">
            <div className="mb-4">
              <h3 className="font-heading text-base font-semibold text-foreground/90 flex items-center gap-2">
                <SlidersIcon className="size-4 text-primary" />
                Aturan Reservasi Online
              </h3>
              <p className="text-[10px] text-muted-foreground mt-1">
                Batasan umum yang berlaku untuk semua layanan di alur booking customer.
              </p>
            </div>

            <form onSubmit={handleSaveRules} className="space-y-4">
              <div className="grid gap-1.5">
                <Label htmlFor="minNotice" className="text-xs font-semibold text-foreground/80">Pemberitahuan Minimum (Jam)</Label>
                <Input
                  id="minNotice"
                  type="number"
                  value={rulesMinNotice}
                  onChange={(e) => setRulesMinNotice(Number(e.target.value))}
                  required
                />
                <p className="text-[10px] text-muted-foreground">Minimal jarak jam terdekat customer boleh membuat janji temu online dari jam saat ini.</p>
              </div>

              <div className="grid gap-1.5">
                <Label htmlFor="windowDays" className="text-xs font-semibold text-foreground/80">Batas Jendela Reservasi (Hari)</Label>
                <Input
                  id="windowDays"
                  type="number"
                  value={rulesWindow}
                  onChange={(e) => setRulesWindow(Number(e.target.value))}
                  required
                />
                <p className="text-[10px] text-muted-foreground">Berapa hari ke depan customer bisa memesan jadwal sesi.</p>
              </div>

              <div className="grid gap-1.5">
                <Label htmlFor="maxBook" className="text-xs font-semibold text-foreground/80">Maksimum Booking Per Hari</Label>
                <Input
                  id="maxBook"
                  type="number"
                  value={rulesMaxBookings}
                  onChange={(e) => setRulesMaxBookings(Number(e.target.value))}
                  required
                />
                <p className="text-[10px] text-muted-foreground">Batas jumlah janji temu maksimum yang bisa dilayani dalam satu hari.</p>
              </div>

              <div className="grid gap-1.5">
                <Label htmlFor="bufferMin" className="text-xs font-semibold text-foreground/80">Waktu Penyangga Sesi / Buffer (Menit)</Label>
                <Input
                  id="bufferMin"
                  type="number"
                  value={rulesBuffer}
                  onChange={(e) => setRulesBuffer(Number(e.target.value))}
                  required
                />
                <p className="text-[10px] text-muted-foreground">Jeda waktu istirahat/pembersihan alat antar sesi pengerjaan kuku.</p>
              </div>

              <Button type="submit" className="w-full mt-3">Simpan Aturan Reservasi</Button>
            </form>
          </section>

          {/* Column 2: Deposit Configuration */}
          <section className="bg-card border border-border/70 rounded-2xl p-6 shadow-xs">
            <h3 className="font-heading text-base font-semibold text-foreground/90 mb-4 flex items-center gap-2">
              <span className="text-sm">🛡️</span>
              Pengaturan Deposit Global
            </h3>

            <form onSubmit={handleSaveDepositConfig} className="space-y-4">
              <div className="flex items-center gap-2 border-b border-border/55 pb-3 mb-2">
                <input
                  type="checkbox"
                  id="depEnableCheck"
                  className="size-4 accent-primary"
                  checked={depEnabled}
                  onChange={(e) => setDepEnabled(e.target.checked)}
                />
                <Label htmlFor="depEnableCheck" className="font-semibold select-none cursor-pointer text-xs">Aktifkan Deposit Secara Global</Label>
              </div>

              {depEnabled && (
                <div className="space-y-4 animate-in fade-in duration-200">
                  <div className="grid grid-cols-2 gap-3.5">
                    <div className="grid gap-1.5">
                      <Label htmlFor="depTypeSelect" className="text-xs font-semibold text-foreground/80">Tipe Uang Muka</Label>
                      <select
                        id="depTypeSelect"
                        className="flex h-9 w-full rounded-xl border border-input bg-card px-3 py-1 text-sm shadow-xs focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring"
                        value={depType}
                        onChange={(e) => setDepType(e.target.value as "fixed" | "percentage")}
                      >
                        <option value="percentage">Persentase (%)</option>
                        <option value="fixed">Nominal Tetap (Rp)</option>
                      </select>
                    </div>
                    <div className="grid gap-1.5">
                      <Label htmlFor="depValueNum" className="text-xs font-semibold text-foreground/80">Nilai Deposit</Label>
                      <Input
                        id="depValueNum"
                        type="number"
                        value={depValue}
                        onChange={(e) => setDepValue(Number(e.target.value))}
                        required
                      />
                    </div>
                  </div>

                  {/* List of current payment methods */}
                  <div className="space-y-2.5">
                    <span className="text-xs font-bold text-foreground/85">Daftar Metode Transfer Aktif</span>
                    {paymentMethods.length === 0 ? (
                      <p className="text-xs text-muted-foreground italic bg-muted/20 p-3 rounded-xl border border-dashed text-center">
                        Belum ada metode transfer yang ditambahkan.
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {paymentMethods.map((pm) => (
                          <div key={pm.id} className="flex items-center justify-between p-2.5 bg-muted/30 border border-border/50 rounded-xl">
                            <div>
                              <span className="text-xs font-bold text-foreground capitalize">
                                {pm.type === "bank" ? `Bank ${pm.name}` : `E-Wallet ${pm.name}`}
                              </span>
                              <p className="text-[10px] text-muted-foreground mt-0.5 font-medium">
                                No: {pm.accountNumber} a.n {pm.accountName}
                              </p>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon-sm"
                              className="text-destructive hover:bg-destructive/5 shrink-0"
                              onClick={() => handleRemovePaymentMethod(pm.id)}
                            >
                              <TrashIcon className="size-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Form to add a new method */}
                  <div className="bg-muted/15 border border-border/75 rounded-xl p-3.5 space-y-3">
                    <span className="text-xs font-bold text-foreground/80 block">Tambah Rekening / E-Wallet</span>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div className="grid gap-1">
                        <Label htmlFor="newPmType" className="text-[10px]">Tipe</Label>
                        <select
                          id="newPmType"
                          className="flex h-9 w-full rounded-xl border border-input bg-card px-2.5 py-1 text-xs shadow-xs focus-visible:outline-hidden"
                          value={newPmType}
                          onChange={(e) => setNewPmType(e.target.value as "bank" | "ewallet" | "other")}
                        >
                          <option value="bank">Bank Transfer</option>
                          <option value="ewallet">E-Wallet</option>
                          <option value="other">Lainnya</option>
                        </select>
                      </div>
                      <div className="grid gap-1">
                        <Label htmlFor="newPmName" className="text-[10px]">Penyedia (BCA/DANA/dll)</Label>
                        <Input
                          id="newPmName"
                          placeholder="Contoh: BCA, DANA"
                          value={newPmName}
                          onChange={(e) => setNewPmName(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="grid gap-1">
                        <Label htmlFor="newPmNumber" className="text-[10px]">Nomor Rekening / HP</Label>
                        <Input
                          id="newPmNumber"
                          placeholder="Nomor rekening/HP"
                          value={newPmNumber}
                          onChange={(e) => setNewPmNumber(e.target.value)}
                        />
                      </div>
                      <div className="grid gap-1">
                        <Label htmlFor="newPmOwner" className="text-[10px]">Atas Nama</Label>
                        <Input
                          id="newPmOwner"
                          placeholder="Nama pemilik akun"
                          value={newPmOwner}
                          onChange={(e) => setNewPmOwner(e.target.value)}
                        />
                      </div>
                    </div>

                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="w-full gap-1.5"
                      onClick={handleAddPaymentMethod}
                    >
                      <PlusIcon className="size-3.5" />
                      Tambah Rekening
                    </Button>
                  </div>

                  {/* Notes */}
                  <div className="grid gap-1.5">
                    <Label htmlFor="depNotesArea" className="text-xs font-semibold text-foreground/80">Catatan Transfer Deposit</Label>
                    <textarea
                      id="depNotesArea"
                      className="flex min-h-[60px] w-full rounded-xl border border-input bg-card px-3 py-2 text-sm shadow-xs focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring"
                      value={depNotes}
                      onChange={(e) => setDepNotes(e.target.value)}
                      rows={2}
                    />
                  </div>
                </div>
              )}

              <Button type="submit" className="w-full mt-3">Simpan Pengaturan Deposit</Button>
            </form>
          </section>
        </div>
      )}
    </div>
  );
}
