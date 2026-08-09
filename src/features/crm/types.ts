import type {
  BookingStatus,
  DesignColor,
  DesignShape,
} from "@/types";

/**
 * CRM domain types — Epic 4.
 *
 * These are the customer-facing "little book" of Denailss: a personal,
 * warm customer profile with useful history. Stands in for the future
 * `customers`, `customer_notes`, `customer_reviews` tables (TRD §4).
 */

export type CustomerStatus = "new" | "active" | "inactive";
export type CustomerSegment = "new" | "repeat" | "inactive";
export type PreferredTime = "pagi" | "siang" | "sore";

export interface CrmCustomer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  /** First ever contact with Denailss (first booking). */
  since: string; // YYYY-MM-DD
  notes?: string;
  preferences?: {
    preferredTime?: PreferredTime;
    preferredShapes?: DesignShape[];
    preferredColors?: DesignColor[];
  };
}

export interface CrmAppointment {
  id: string;
  /** YYYY-MM-DD; kept empty for online product (press-on) orders. */
  date: string;
  time: string;
  serviceSlug: string;
  serviceName: string;
  designSlug?: string;
  designTitle?: string;
  price: number;
  status: BookingStatus;
  cancellationReason?: string;
  /** Link back into the backoffice appointment detail, when this booking exists there. */
  appointmentUrl?: string;
  /** Tiny human note worth remembering inside history. */
  note?: string;
}

export interface CrmReview {
  id: string;
  rating: 1 | 2 | 3 | 4 | 5;
  comment: string;
  date: string; // YYYY-MM-DD
  serviceName: string;
  designSlug?: string;
  designTitle?: string;
  photoSeed?: string;
}

/** Pure derived summary, computed from a customer's appointments. */
export interface CustomerStats {
  totalVisits: number;
  totalSpending: number;
  favoriteServiceName: string | null;
  favoriteDesignSlug: string | null;
  favoriteDesignTitle: string | null;
  lastVisit: string | null; // YYYY-MM-DD
  daysSinceLastVisit: number | null;
  nextAppointment: CrmAppointment | null;
}

/** A customer joined with its pre-computed bookkeeping. */
export interface CustomerRow {
  customer: CrmCustomer;
  appointments: CrmAppointment[];
  reviews: CrmReview[];
  stats: CustomerStats;
  status: CustomerStatus;
  segment: CustomerSegment;
}