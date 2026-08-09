"use client";

import { useMemo, useState } from "react";
import {
  CaretLeftIcon,
  CaretRightIcon,
  CalendarBlankIcon,
} from "@phosphor-icons/react/dist/ssr";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { monthKeyInfo } from "../logic/finance";

/**
 * Period selector — previous / next month + a native month picker. Kept to a
 * single compact control; this is a bookkeeping notebook, not an analytics
 * date-range tool.
 */
export function PeriodSelector({
  value,
  onChange,
}: {
  value: string;
  onChange: (monthKey: string) => void;
}) {
  const reduce = useReducedMotion();
  const [pickerValue, setPickerValue] = useState(() => value.slice(0, 7));
  const { key, label } = useMemo(() => monthKeyInfo(value), [value]);

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        aria-label="Bulan sebelumnya"
        onClick={() => onChange(shiftMonth(value, -1))}
        className="flex size-9 items-center justify-center rounded-full border border-border/70 bg-card text-foreground/70 transition-colors hover:border-primary/40 hover:text-primary"
      >
        <CaretLeftIcon weight="bold" className="size-4" />
      </button>

      <label className="relative flex h-9 cursor-pointer items-center gap-2 rounded-full border border-border/70 bg-card px-4 text-sm font-semibold text-foreground/90 transition-colors hover:border-primary/40">
        <CalendarBlankIcon weight="regular" className="size-4 text-muted-foreground" />
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={key}
            initial={reduce ? false : { opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduce ? undefined : { opacity: 0, y: -6 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            className="min-w-24 text-center"
          >
            {label}
          </motion.span>
        </AnimatePresence>
        <input
          type="month"
          aria-label="Pilih bulan"
          value={pickerValue}
          onChange={(e) => {
            if (e.target.value) {
              setPickerValue(e.target.value);
              onChange(e.target.value);
            }
          }}
          onBlur={() => setPickerValue(value.slice(0, 7))}
          className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
        />
      </label>

      <button
        type="button"
        aria-label="Bulan berikutnya"
        onClick={() => onChange(shiftMonth(value, 1))}
        className="flex size-9 items-center justify-center rounded-full border border-border/70 bg-card text-foreground/70 transition-colors hover:border-primary/40 hover:text-primary"
      >
        <CaretRightIcon weight="bold" className="size-4" />
      </button>
    </div>
  );
}

function shiftMonth(monthKey: string, delta: number): string {
  const [year, month] = monthKey.split("-").map(Number);
  const d = new Date(year, month - 1 + delta, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}
