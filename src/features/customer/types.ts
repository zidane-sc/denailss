import type { BookingStatus, DepositVerificationStatus } from "@/types";
import type { AppointmentService } from "@/features/appointment/types";
import type { FulfillmentMethod } from "@/features/booking/types";

export interface CustomerProfile {
  id: string;
  name: string;
  phone: string;
  email: string;
  notes?: string;
}

export interface CustomerBooking {
  id: string;
  services: AppointmentService[];
  designSlug?: string;
  designTitle?: string;
  fulfillment?: FulfillmentMethod;
  date: string;
  time: string;
  status: BookingStatus;
  depositStatus?: DepositVerificationStatus;
  depositRejectReason?: string;
  totalPrice: number;
  promoCode?: string;
  hasReview: boolean;
}
