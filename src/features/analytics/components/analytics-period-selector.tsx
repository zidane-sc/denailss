"use client";

import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import type { AnalyticsPeriodKey } from "../types";
import { analyticsPeriodLabel } from "../logic/analytics";

/**
 * Period selector — the five presets (7 Hari … 1 Tahun) as a segmented
 * pill control. Horizontally scrollable on mobile so it never squeezes.
 * The selected label animates on change (honors prefers-reduced-motion).
 */
const PERIODS: AnalyticsPeriodKey[] = ["7d", "30d", "3m", "6m", "1y"];

export function AnalyticsPeriodSelector({
  value,
  onChange,
}: {
  value: AnalyticsPeriodKey;
  onChange: (value: AnalyticsPeriodKey) => void;
}) {
  const reduce = useReducedMotion();

  return (
    <div
      role="group"
      aria-label="Periode laporan"
      className="flex max-w-full items-center gap-1 overflow-x-auto rounded-full border border-border/70 bg-card p-1 shadow-xs"
    >
      {PERIODS.map((key) => {
        const isActive = value === key;
        return (
          <button
            key={key}
            type="button"
            aria-pressed={isActive}
            onClick={() => onChange(key)}
            className={
              "relative shrink-0 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors sm:text-sm " +
              (isActive
                ? "text-primary-foreground"
                : "text-muted-foreground hover:text-foreground")
            }
          >
            {isActive && (
              <motion.span
                layoutId="analytics-period-pill"
                transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 420, damping: 34 }}
                className="absolute inset-0 rounded-full bg-primary"
              />
            )}
            <span className="relative">
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={key + (isActive ? "-a" : "-i")}
                  initial={reduce ? false : { opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={reduce ? undefined : { opacity: 0, y: -5 }}
                  transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
                  className="block whitespace-nowrap"
                >
                  {analyticsPeriodLabel(key)}
                </motion.span>
              </AnimatePresence>
            </span>
          </button>
        );
      })}
    </div>
  );
}
