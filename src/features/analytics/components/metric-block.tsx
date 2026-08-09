import { cn } from "@/lib/utils";

/**
 * Metric blocks for the analytics page. Deliberately plain: strong numbers
 * over hairlines, one accent accent-color per block, no KPI card wall.
 */
export function MetricBlock({
  label,
  value,
  detail,
  tone = "default",
}: {
  label: string;
  value: string;
  detail?: string;
  tone?: "default" | "primary" | "accent" | "positive" | "negative" | "muted";
}) {
  return (
    <div className="border-t border-border/70 py-3 first:border-t-0">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p
        className={cn(
          "mt-1 font-heading text-2xl font-semibold tracking-tight",
          tone === "primary" && "text-primary",
          tone === "accent" && "text-accent",
          tone === "positive" && "text-emerald-700",
          tone === "negative" && "text-rose-600",
          tone === "muted" && "text-muted-foreground",
          (tone === "default" || !tone) && "text-foreground/90"
        )}
      >
        {value}
      </p>
      {detail && <p className="mt-0.5 text-[11px] text-muted-foreground">{detail}</p>}
    </div>
  );
}

/** Plain two-column metric list used by Revenue, Booking, and Retention. */
export function MetricList({
  items,
  className,
}: {
  items: { label: string; value: string; detail?: string; tone?: "primary" | "accent" | "positive" | "negative" | "muted" | "default" }[];
  className?: string;
}) {
  return (
    <div className={cn("grid grid-cols-1 gap-x-8 sm:grid-cols-2", className)}>
      {items.map((item) => (
        <MetricBlock key={item.label} {...item} />
      ))}
    </div>
  );
}
