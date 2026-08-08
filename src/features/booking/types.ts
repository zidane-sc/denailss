import type { CustomerInfoFormValues } from "@/features/booking/validators/booking.schema";
import type { DepositVerificationStatus } from "@/types";

export const BOOKING_STEP_IDS = [
  "service",
  "design",
  "date",
  "time",
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

export interface BookingSelections {
  serviceSlug: string | null;
  designSlug: string | null;
  dateKey: string | null;
  time: string | null;
  customer: CustomerInfoFormValues | null;
  promoCode: string | null;
  deposit: DepositUpload | null;
}

export const INITIAL_SELECTIONS: BookingSelections = {
  serviceSlug: null,
  designSlug: null,
  dateKey: null,
  time: null,
  customer: null,
  promoCode: null,
  deposit: null,
};
