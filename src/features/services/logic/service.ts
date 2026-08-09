import type { Service, ServiceTier } from "@/types";
import { formatIDR, formatDuration } from "@/lib/format";

/**
 * Shared service display helpers. Centralize how a service's price and
 * duration are presented, so tiered services (fake-nail, nail art) read the
 * same everywhere: flat services show one price/duration, tiered services show
 * "Mulai RpX" plus a tier legend.
 */

/** The lowest starting price across tiers (or the flat price). */
export function serviceMinPrice(service: Service): number {
  if (service.tiers.length === 0) return service.priceFrom;
  return Math.min(...service.tiers.map((t) => t.priceFrom));
}

/** One-line price + timing label for cards. */
export function servicePriceLine(service: Service): string {
  if (service.tiers.length > 0) {
    return `Mulai ${formatIDR(serviceMinPrice(service))} · sesuai tingkat kesulitan`;
  }
  const timing = service.requiresPickup
    ? "1-2 Hari Pembuatan"
    : formatDuration(service.durationMinutes);
  const price = `Mulai ${formatIDR(service.priceFrom)} · ${timing}`;
  return service.priceNote ? `${price} · estimasi` : price;
}

/** Whether the service is priced by difficulty tier. */
export function isTieredService(service: Service): boolean {
  return service.tiers.length > 0;
}

/** Default label for a tier key. */
export function tierLabel(tier: ServiceTier): string {
  return tier.label;
}
