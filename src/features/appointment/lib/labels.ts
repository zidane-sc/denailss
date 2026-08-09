import type { AppointmentService } from "@/features/appointment/types";
import type { FulfillmentMethod } from "@/features/booking/types";

/** Joined, comma-separated service names (multi-service booking). */
export function serviceNamesLabel(services: AppointmentService[]): string {
  return services.map((s) => s.name).join(", ");
}

export const FULFILLMENT_LABELS: Record<FulfillmentMethod, string> = {
  pickup: "Ambil di lokasi",
  delivery: "Dikirim via kurir",
};
