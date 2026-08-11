"use client";

import { useMemo, useState, type ReactNode } from "react";
import { CaretLeftIcon, CaretRightIcon, ProhibitIcon } from "@phosphor-icons/react/dist/ssr";
import { getMonthAvailability } from "@/features/booking/logic/availability";
import { useAvailabilityConfig, useOccupiedSlotsByDate } from "@/features/booking/components/availability-provider";
import { monthLabelId, toDateKey } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { DayAvailabilityStatus } from "@/types";

const WEEKDAY_LABELS = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

export function StepDate({
  durationMinutes,
  selectedDateKey,
  onSelect,
}: {
  durationMinutes: number;
  selectedDateKey: string | null;
  onSelect: (dateKey: string) => void;
}) {
  const today = useMemo(() => new Date(), []);
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const config = useAvailabilityConfig();
  const occupiedSlotsByDate = useOccupiedSlotsByDate();

  const availability = useMemo(
    () => (config ? getMonthAvailability(viewYear, viewMonth, durationMinutes, config, today, occupiedSlotsByDate) : new Map<string, DayAvailabilityStatus>()),
    [viewYear, viewMonth, durationMinutes, config, today, occupiedSlotsByDate]
  );

  const firstOfMonth = new Date(viewYear, viewMonth, 1);
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const leadingBlanks = firstOfMonth.getDay();

  const isCurrentMonth = viewYear === today.getFullYear() && viewMonth === today.getMonth();
  const maxWindowDate = new Date(today);
  maxWindowDate.setDate(maxWindowDate.getDate() + (config?.bookingRules.bookingWindowDays ?? 30));
  const nextMonthStart = new Date(viewYear, viewMonth + 1, 1);
  const canGoNext = nextMonthStart <= maxWindowDate;

  const goPrevMonth = () => {
    if (isCurrentMonth) return;
    const prev = new Date(viewYear, viewMonth - 1, 1);
    setViewYear(prev.getFullYear());
    setViewMonth(prev.getMonth());
  };

  const goNextMonth = () => {
    if (!canGoNext) return;
    const next = new Date(viewYear, viewMonth + 1, 1);
    setViewYear(next.getFullYear());
    setViewMonth(next.getMonth());
  };

  return (
    <div>
      <h2 className="text-2xl font-semibold tracking-tight text-foreground">Pilih Tanggal</h2>
      <p className="mt-1.5 text-sm text-muted-foreground">
        Slot yang tersedia berubah tiap minggu, cek kalender di bawah untuk jadwal terbaru.
      </p>

      <div className="mt-6 rounded-3xl border border-border bg-card p-4 sm:p-5">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={goPrevMonth}
            disabled={isCurrentMonth}
            aria-label="Bulan sebelumnya"
            className="flex size-9 items-center justify-center rounded-full border border-border text-foreground disabled:opacity-30"
          >
            <CaretLeftIcon className="size-4" />
          </button>
          <p className="text-sm font-semibold text-foreground">{monthLabelId(viewYear, viewMonth)}</p>
          <button
            type="button"
            onClick={goNextMonth}
            disabled={!canGoNext}
            aria-label="Bulan berikutnya"
            className="flex size-9 items-center justify-center rounded-full border border-border text-foreground disabled:opacity-30"
          >
            <CaretRightIcon className="size-4" />
          </button>
        </div>

        <div className="mt-4 grid grid-cols-7 gap-1 text-center text-xs font-medium text-muted-foreground">
          {WEEKDAY_LABELS.map((label) => (
            <div key={label}>{label}</div>
          ))}
        </div>

        <div className="mt-1.5 grid grid-cols-7 gap-1.5">
          {Array.from({ length: leadingBlanks }).map((_, i) => (
            <div key={`blank-${i}`} />
          ))}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const date = new Date(viewYear, viewMonth, day);
            const dateKey = toDateKey(date);
            const status = availability.get(dateKey) as DayAvailabilityStatus;
            const isToday = dateKey === toDateKey(today);
            const isSelected = dateKey === selectedDateKey;
            const disabled = status === "past" || status === "closed" || status === "full" || status === "outside-window";

            return (
              <button
                key={dateKey}
                type="button"
                disabled={disabled}
                onClick={() => onSelect(dateKey)}
                title={STATUS_LABEL[status]}
                className={cn(
                  "relative flex aspect-square flex-col items-center justify-center rounded-xl text-sm font-medium transition-colors",
                  disabled && "cursor-not-allowed text-muted-foreground/50",
                  status === "closed" && "pattern-hatch",
                  status === "full" && "bg-muted",
                  !disabled && !isSelected && "text-foreground hover:bg-muted",
                  isSelected && "bg-primary text-primary-foreground",
                  isToday && !isSelected && "ring-1 ring-accent"
                )}
              >
                {day}
                {status === "limited" && !isSelected && (
                  <span className="absolute bottom-1 size-1.5 rounded-full bg-secondary" />
                )}
                {status === "full" && (
                  <ProhibitIcon className="absolute bottom-0.5 size-2.5 text-muted-foreground/60" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs text-muted-foreground">
        <LegendItem swatch="bg-card border border-border" label="Tersedia" />
        <LegendItem swatch="bg-card border border-border" dot label="Terbatas" />
        <LegendItem swatch="bg-muted" label="Penuh" icon={<ProhibitIcon className="size-2.5" />} />
        <LegendItem swatch="pattern-hatch border border-border" label="Tutup" />
        <LegendItem swatch="bg-primary" label="Terpilih" />
      </div>
    </div>
  );
}

const STATUS_LABEL: Record<DayAvailabilityStatus, string> = {
  available: "Tersedia",
  limited: "Sisa sedikit slot",
  full: "Penuh, coba tanggal lain",
  closed: "Tutup (Libur)",
  past: "Tanggal sudah lewat",
  "outside-window": "Di luar jangka booking",
};

function LegendItem({
  swatch,
  label,
  dot,
  icon,
}: {
  swatch: string;
  label: string;
  dot?: boolean;
  icon?: ReactNode;
}) {
  return (
    <span className="flex items-center gap-1.5">
      <span className={cn("relative flex size-4 items-center justify-center rounded-md", swatch)}>
        {dot && <span className="absolute bottom-0 size-1.5 rounded-full bg-secondary" />}
        {icon}
      </span>
      {label}
    </span>
  );
}
