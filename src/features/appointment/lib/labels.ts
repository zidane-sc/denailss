import type { AppointmentAddOn, AppointmentService } from "@/features/appointment/types";
import type { BodyPart } from "@/types";
import type { FulfillmentMethod } from "@/features/booking/types";

const BODY_PART_LABELS: Record<BodyPart, string> = {
  hand: "Tangan",
  foot: "Kaki",
};

/** Joined, comma-separated service names (multi-service booking). */
export function serviceNamesLabel(services: AppointmentService[]): string {
  return services
    .map((s) => {
      const parts = [s.name];
      if (s.tierLabel) parts.push(s.tierLabel);
      if (s.bodyPart) parts.push(BODY_PART_LABELS[s.bodyPart]);
      return parts.length > 1 ? `${s.name} (${parts.slice(1).join(", ")})` : s.name;
    })
    .join(", ");
}

/** Joined free add-on names, e.g. "+ Manicure (Gratis)". */
export function addOnsLabel(addOns: AppointmentAddOn[]): string {
  return addOns.map((a) => `${a.name} (Gratis)`).join(" + ");
}

export const FULFILLMENT_LABELS: Record<FulfillmentMethod, string> = {
  pickup: "Ambil di lokasi",
  delivery: "Dikirim via kurir",
};
