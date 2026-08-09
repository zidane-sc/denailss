import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Shared analytics section shell. Sections are deliberately not all cards:
 * the page mixes card-style metric blocks with plain content blocks that
 * lean on typography, matching the existing backoffice rhythm.
 */
export function AnalyticsSection({
  children,
  className,
  eyebrow,
  title,
  description,
}: {
  children: ReactNode;
  className?: string;
  eyebrow?: string;
  title: string;
  description?: string;
}) {
  return (
    <section className={cn("min-w-0", className)} aria-labelledby={title}>
      <div className="mb-4">
        {eyebrow && (
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            {eyebrow}
          </p>
        )}
        <h3
          id={title}
          className={cn(
            "font-heading font-semibold tracking-tight text-foreground/90",
            description ? "text-lg" : "text-base"
          )}
        >
          {title}
        </h3>
        {description && (
          <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      {children}
    </section>
  );
}
