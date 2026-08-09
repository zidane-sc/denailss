import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Shared settings section shell. Sections use soft rounded card surfaces like
 * the rest of the backoffice, but stay quiet: no step chips, no icons, no
 * decorative chrome. Hierarchy comes from typography and spacing.
 */
export function SettingsSection({
  title,
  description,
  children,
  className,
}: {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn("rounded-2xl border border-border/70 bg-card p-5 shadow-xs sm:p-6", className)}
    >
      <div className="mb-5">
        <h3 className="font-heading text-base font-semibold tracking-tight text-foreground/90">
          {title}
        </h3>
        {description && (
          <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      <div className="space-y-5">{children}</div>
    </section>
  );
}

/** Settings form field: label above control, hint below, error below input. */
export function SettingsField({
  label,
  hint,
  error,
  required,
  children,
}: {
  label: string;
  hint?: string;
  error?: string;
  required?: boolean;
  children: ReactNode;
}) {
  return (
    <div className="grid gap-1.5">
      <div className="flex items-baseline justify-between gap-2">
        <label className="text-sm font-medium text-foreground/90">
          {label}
          {required && <span className="text-primary"> *</span>}
        </label>
        {error && <p className="text-[11px] font-medium text-destructive">{error}</p>}
      </div>
      {children}
      {hint && !error && <p className="text-[11px] text-muted-foreground">{hint}</p>}
    </div>
  );
}
