import type { ReactNode } from "react";

/**
 * Empty state for an analytics section with not enough data. Every empty
 * message names exactly what is missing — no invented numbers, no fake
 * zero-looking charts.
 */
export function AnalyticsEmpty({
  message,
  detail,
  children,
}: {
  message: string;
  detail?: string;
  children?: ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-border/70 bg-muted/20 px-5 py-8 text-center">
      <p className="text-sm font-medium text-foreground/80">{message}</p>
      {detail && <p className="mt-1 text-xs text-muted-foreground">{detail}</p>}
      {children}
    </div>
  );
}
