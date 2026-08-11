/** Where a body service is applied — hands or feet. */
export type BodyPart = "hand" | "foot";

export type ServiceTierKey = "simple" | "complex";

/** A price/duration tier within a service (e.g. nail art simple vs complex). */
export interface ServiceTier {
  key: ServiceTierKey;
  label: string;
  priceFrom: number;
  durationMinutes: number;
}

export interface Service {
  id: string;
  slug: string;
  name: string;
  shortDescription: string;
  description: string;
  priceFrom: number;
  /**
   * Optional note shown next to the price when the final price is not
   * fixed upfront (e.g. nail art depends on the design tier / custom
   * request, quoted by the artist via WhatsApp).
   */
  priceNote?: string;
  durationMinutes: number;
  /**
   * Difficulty tiers (harga mulai + durasi per tingkat kesulitan) for
   * services like fake-nail and nail art. Empty for flat-priced services.
   */
  tiers: ServiceTier[];
  /** Whether the service is fulfilled via pickup/delivery instead of an appointment slot. */
  requiresPickup: boolean;
  /**
   * Runtime-only: the tier chosen by the customer during booking (e.g. "Complex").
   * Not part of the catalog data — set by the booking flow on the in-memory copy.
   */
  tierLabel?: string;
  /**
   * Runtime-only: the body part chosen by the customer during booking
   * (e.g. nail art on hands vs feet). Not part of the catalog data.
   */
  bodyPart?: BodyPart;
  heroImage: string;
  gallerySeeds: string[];
  faq: { question: string; answer: string }[];
  depositApplicable: boolean;
  /**
   * Whether the service is bookable and shown publicly. Owner deactivates
   * instead of deleting so existing appointments keep their context.
   */
  active: boolean;
}

export type DesignStyle =
  | "minimalist"
  | "korean"
  | "french"
  | "chrome"
  | "ombre"
  | "3d-art";

export type DesignColor =
  | "nude"
  | "pink"
  | "red"
  | "white"
  | "black"
  | "pastel"
  | "gold";

export type DesignOccasion = "daily" | "wedding" | "party" | "festive" | "graduation";

export type DesignShape = "almond" | "square" | "coffin" | "round" | "stiletto";

/**
 * Difficulty tier of a nail-art design, assigned by the studio when the
 * design is curated — never chosen by the customer. Drives the design price.
 */
export type DesignDifficulty = "easy" | "medium" | "complex" | "very-complex";

export type GalleryAspect = "portrait" | "square" | "landscape" | "tall";

export interface GalleryDesign {
  id: string;
  slug: string;
  title: string;
  description: string;
  imageSeeds: string[];
  aspect: GalleryAspect;
  style: DesignStyle;
  color: DesignColor;
  occasion: DesignOccasion;
  shape: DesignShape;
  difficulty: DesignDifficulty;
  /** Owner-set custom price (Rp per set, 10 jari). */
  price: number;
}

export interface Review {
  id: string;
  customerName: string;
  rating: 1 | 2 | 3 | 4 | 5;
  serviceSlug: string;
  visitDate: string;
  comment: string;
  photoSeed?: string;
  /** The booking code this review belongs to (server-populated for ownership checks). */
  bookingCode?: string;
}

/** A message submitted through the public "Kirim Pesan" contact form. */
export interface ContactMessage {
  id: string;
  name: string;
  phone: string;
  email: string;
  instagram?: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export type DiscountType = "percentage" | "fixed";

/** Derivable state of a promotion (Epic 6 admin status). */
export type PromotionStatus = "active" | "scheduled" | "expired" | "inactive";

export interface Promotion {
  id: string;
  code: string;
  title: string;
  description: string;
  discountType: DiscountType;
  discountValue: number;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  /** 0 or negative = unlimited usage. */
  usageLimit: number;
  usedCount: number;
  minimumSpend?: number;
  /** Omit (or empty array) = applies to all services. */
  applicableServiceSlugs?: string[];
  /** Cap applied only when discountType is "percentage". */
  maximumDiscount?: number;
  imageSeed?: string;
  active: boolean;
}

export type DepositType = "fixed" | "percentage";

export interface PaymentMethod {
  id: string;
  type: "bank" | "ewallet" | "other";
  name: string;
  accountNumber: string;
  accountName: string;
}

export interface DepositConfig {
  enabled: boolean;
  type: DepositType;
  value: number;
  bankAccount: { bank: string; accountNumber: string; accountName: string };
  eWallet: { provider: string; number: string; accountName: string };
  paymentMethods: PaymentMethod[];
  notes: string;
}

export interface TimeRange {
  start: string;
  end: string;
}

export type AvailabilityWeekday = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export interface AvailabilityConfig {
  weeklyTemplate: Record<AvailabilityWeekday, TimeRange[]>;
  overrides: Record<string, TimeRange[]>;
  vacations: { start: string; end: string; reason: string }[];
  blockedTimes: { date: string; range: TimeRange; reason: string }[];
  bookingRules: {
    bookingWindowDays: number;
    minimumNoticeHours: number;
    maxBookingsPerDay: number;
    bufferMinutes: number;
  };
}

export type DayAvailabilityStatus =
  | "available"
  | "limited"
  | "full"
  | "closed"
  | "past"
  | "outside-window";

export type SlotStatus = "available" | "limited" | "full";

export interface TimeSlot {
  time: string;
  status: SlotStatus;
}

export interface SlotGroup {
  label: string;
  status: SlotStatus;
  slots: TimeSlot[];
}

export interface MockAppointment {
  date: string;
  start: string;
  end: string;
}

export type BookingStatus =
  | "pending_deposit"
  | "waiting_verification"
  | "pending"
  | "confirmed"
  | "completed"
  | "cancelled"
  | "no_show";

export type DepositVerificationStatus = "waiting_verification" | "approved" | "rejected";

export interface CustomerInfo {
  name: string;
  phone: string;
  email?: string;
  notes?: string;
}
