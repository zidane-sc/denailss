import type { BookingStatus, DepositVerificationStatus } from "@/types";

export interface AppointmentCustomer {
  name: string;
  phone: string;
  email?: string;
  notes?: string;
}

export interface Appointment {
  id: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  durationMinutes: number;
  serviceSlug: string;
  serviceName: string;
  designSlug?: string;
  designTitle?: string;
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
