export type ServiceCategory =
  | "gel-extension"
  | "removal"
  | "manicure"
  | "pedicure"
  | "fake-nail"
  | "nail-art";

export interface Service {
  id: string;
  slug: string;
  name: string;
  category: ServiceCategory;
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
  heroImage: string;
  gallerySeeds: string[];
  faq: { question: string; answer: string }[];
  depositApplicable: boolean;
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
}

export type DiscountType = "percentage" | "fixed";

export interface Promotion {
  id: string;
  code: string;
  title: string;
  description: string;
  discountType: DiscountType;
  discountValue: number;
  startDate: string;
  endDate: string;
  usageLimit: number;
  usedCount: number;
  minimumSpend?: number;
  applicableServiceSlugs?: string[];
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
