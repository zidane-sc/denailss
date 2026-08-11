"use client";

import { useMemo } from "react";
import { getDayTimeSlots } from "@/features/booking/logic/availability";
import { useAvailabilityConfig, useOccupiedSlotsByDate } from "@/features/booking/components/availability-provider";
import { formatDateId, parseDateKey } from "@/lib/format";
import { cn } from "@/lib/utils";

const GROUP_STATUS_LABEL: Record<string, string> = {
  available: "Tersedia",
  limited: "Sisa sedikit",
  full: "Penuh",
};

export function StepTime({
  dateKey,
  durationMinutes,
  selectedTime,
  onSelect,
}: {
  dateKey: string;
  durationMinutes: number;
  selectedTime: string | null;
  onSelect: (time: string) => void;
}) {
  const date = useMemo(() => parseDateKey(dateKey), [dateKey]);
  const config = useAvailabilityConfig();
  const occupiedSlotsByDate = useOccupiedSlotsByDate();
  const groups = useMemo(
    () => (config ? getDayTimeSlots(date, durationMinutes, config, new Date(), occupiedSlotsByDate[dateKey] ?? []) : []),
    [date, durationMinutes, config, occupiedSlotsByDate, dateKey]
  );

  return (
    <div>
      <h2 className="text-2xl font-semibold tracking-tight text-foreground">Pilih Waktu</h2>
      <p className="mt-1.5 text-sm text-muted-foreground">
        {formatDateId(date, { withWeekday: true })}
      </p>

      {groups.length === 0 ? (
        <p className="mt-6 rounded-2xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
          Tidak ada slot tersedia untuk tanggal ini. Coba pilih tanggal lain.
        </p>
      ) : (
        <div className="mt-6 space-y-6">
          {groups.map((group) => (
            <div key={group.label}>
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold text-foreground">{group.label}</p>
                <span
                  className={cn(
                    "rounded-full px-2 py-0.5 text-[11px] font-medium",
                    group.status === "available" && "bg-muted text-foreground/70",
                    group.status === "limited" && "bg-secondary-soft text-foreground/80",
                    group.status === "full" && "bg-muted text-muted-foreground"
                  )}
                >
                  {GROUP_STATUS_LABEL[group.status]}
                </span>
              </div>
              <div className="mt-2.5 grid grid-cols-3 gap-2 sm:grid-cols-4">
                {group.slots.map((slot) => {
                  const active = selectedTime === slot.time;
                  const disabled = slot.status === "full";
                  return (
                    <button
                      key={slot.time}
                      type="button"
                      disabled={disabled}
                      onClick={() => onSelect(slot.time)}
                      className={cn(
                        "rounded-xl border py-2.5 text-sm font-medium transition-colors",
                        disabled && "cursor-not-allowed border-border/70 text-muted-foreground/50 line-through",
                        !disabled && !active && "border-border text-foreground hover:border-primary/50",
                        active && "border-primary bg-primary text-primary-foreground"
                      )}
                    >
                      {slot.time}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
