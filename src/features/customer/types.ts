import type { BookingStatus, DepositVerificationStatus, ServiceCategory } from "@/types";

export interface CustomerProfile {
  id: string;
  name: string;
  phone: string;
  email: string;
  notes?: string;
}

export interface CustomerBooking {
  id: string;
  serviceSlug: string;
  serviceName: string;
  serviceCategory: ServiceCategory;
  designSlug?: string;
  designTitle?: string;
  date: string;
  time: string;
  status: BookingStatus;
  depositStatus?: DepositVerificationStatus;
  totalPrice: number;
  promoCode?: string;
  hasReview: boolean;
}
