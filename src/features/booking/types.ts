import type { CustomerInfoFormValues } from "@/features/booking/validators/booking.schema";
import type { DepositVerificationStatus } from "@/types";

export const BOOKING_STEP_IDS = [
  "service",
  "design",
  "date",
  "time",
  "pickup",
  "customer",
  "promo",
  "deposit",
  "confirmation",
] as const;

export type BookingStepId = (typeof BOOKING_STEP_IDS)[number];

export interface DepositUpload {
  fileName: string;
  previewUrl: string;
  status: DepositVerificationStatus;
}

/** How a press-on / fake-nail order is fulfilled. */
export type FulfillmentMethod = "pickup" | "delivery";

export interface BookingSelections {
  serviceSlugs: string[];
  /** Chosen difficulty tier per service slug (Simple/Complex). */
  tierByServiceSlug: Record<string, string>;
  designSlug: string | null;
  dateKey: string | null;
  time: string | null;
  fulfillment: FulfillmentMethod | null;
  customer: CustomerInfoFormValues | null;
  promoCode: string | null;
  deposit: DepositUpload | null;
}

export const INITIAL_SELECTIONS: BookingSelections = {
  serviceSlugs: [],
  tierByServiceSlug: {},
  designSlug: null,
  dateKey: null,
  time: null,
  fulfillment: null,
  customer: null,
  promoCode: null,
  deposit: null,
};
