import type { BookingStatus, DepositVerificationStatus, BodyPart } from "@/types";
import type { FulfillmentMethod } from "@/features/booking/types";

export interface AppointmentCustomer {
  name: string;
  phone: string;
  email?: string;
  instagram?: string;
  notes?: string;
}

export interface AppointmentService {
  slug: string;
  name: string;
  /** Chosen difficulty tier label when the service is priced by tier. */
  tierLabel?: string;
  /** Chosen body part (hand/foot) when the service can be applied to either. */
  bodyPart?: BodyPart;
}

/** A service bundled for free with another service (e.g. manicure with nail art on hands). */
export interface AppointmentAddOn {
  slug: string;
  name: string;
  bodyPart: BodyPart;
  /** Always 0 — the add-on is free. */
  price: 0;
}

export interface Appointment {
  id: string;
  date: string; // YYYY-MM-DD ("" for product-only press-on orders)
  time: string; // HH:MM ("" for product-only)
  durationMinutes: number;
  services: AppointmentService[];
  /** Free add-ons bundled into this appointment (e.g. manicure/pedicure with nail art). */
  addOns: AppointmentAddOn[];
  designSlug?: string;
  designTitle?: string;
  fulfillment?: FulfillmentMethod;
  promoCode?: string;
  price: number;
  customerId?: string;
  customer: AppointmentCustomer;
  depositRequired: boolean;
  depositAmount?: number;
  depositProofUrl?: string;
  depositStatus?: DepositVerificationStatus;
  depositRejectReason?: string;
  status: BookingStatus;
  notes?: string;
}
