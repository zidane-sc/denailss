import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { STATUS_LABELS } from "../logic/customer-stats";
import type { CustomerStatus } from "../types";

const AVATAR_TINTS = [
  "bg-primary/12 text-primary",
  "bg-secondary-soft text-secondary",
  "bg-accent-soft text-accent",
  "bg-muted text-muted-foreground",
];

export function CustomerAvatar({
  name,
  size = "md",
  className,
}: {
  name: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
  const tint = AVATAR_TINTS[Math.abs(name.charCodeAt(0)) % AVATAR_TINTS.length];
  const sizeClass =
    size === "lg"
      ? "size-14 text-lg"
      : size === "sm"
        ? "size-8 text-xs"
        : "size-10 text-sm";

  return (
    <div
      className={cn(
        "flex shrink-0 select-none items-center justify-center rounded-full font-heading font-semibold",
        tint,
        sizeClass,
        className
      )}
      aria-hidden="true"
    >
      {initials}
    </div>
  );
}

export function CustomerStatusBadge({
  status,
  className,
}: {
  status: CustomerStatus;
  className?: string;
}) {
  const styles: Record<CustomerStatus, string> = {
    new: "bg-accent-soft text-accent border-accent/20",
    active: "bg-emerald-50 text-emerald-700 border-emerald-100",
    inactive: "bg-muted text-muted-foreground border-border",
  };
  return (
    <span
      className={cn(
        "inline-flex h-6 w-fit items-center gap-1.5 rounded-full border px-2.5 text-xs font-semibold",
        styles[status],
        className
      )}
    >
      {status === "active" && (
        <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
      )}
      {STATUS_LABELS[status]}
    </span>
  );
}

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      {icon && (
        <span className="flex size-12 items-center justify-center rounded-2xl bg-muted/60 text-primary [&>svg]:size-6">
          {icon}
        </span>
      )}
      <p className="mt-3 text-sm font-semibold text-foreground/85">{title}</p>
      {description && (
        <p className="mt-1 max-w-xs text-xs text-muted-foreground leading-relaxed">
          {description}
        </p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}