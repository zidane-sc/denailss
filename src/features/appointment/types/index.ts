import type { BookingStatus, DepositVerificationStatus } from "@/types";
import type { FulfillmentMethod } from "@/features/booking/types";

export interface AppointmentCustomer {
  name: string;
  phone: string;
  email?: string;
  notes?: string;
}

export interface AppointmentService {
  slug: string;
  name: string;
}

export interface Appointment {
  id: string;
  date: string; // YYYY-MM-DD ("" for product-only press-on orders)
  time: string; // HH:MM ("" for product-only)
  durationMinutes: number;
  services: AppointmentService[];
  designSlug?: string;
  designTitle?: string;
  fulfillment?: FulfillmentMethod;
  price: number;
  customer: AppointmentCustomer;
  depositRequired: boolean;
  depositAmount?: number;
  depositProofUrl?: string;
  depositStatus?: DepositVerificationStatus;
  depositRejectReason?: string;
  status: BookingStatus;
  notes?: string;
}
