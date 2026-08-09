import type { CustomerProfile, CustomerBooking } from "../types";

export const CUSTOMER_PROFILE: CustomerProfile = {
  id: "cust-01",
  name: "Alya Putri",
  phone: "081234567890",
  email: "alya.putri@example.com",
  notes: "Kuku cenderung tipis, mohon pelan-pelan saat shaping.",
};

export const CUSTOMER_FAVORITES: string[] = [
  "korean-milk-nail",
  "sunset-ombre-coral",
  "3d-bow-charm-pink",
  "milky-french-almond",
  "pastel-cloud-korean"
];

// Based on today: 2026-08-09
export const CUSTOMER_BOOKINGS: CustomerBooking[] = [
  {
    id: "BKG-2608-012",
    services: [{ slug: "gel-extension", name: "Gel Extension" }],
    designSlug: "korean-milk-nail",
    designTitle: "Korean Milk Nail",
    date: "2026-08-15",
    time: "14:00",
    status: "confirmed",
    depositStatus: "approved",
    totalPrice: 400000,
    hasReview: false,
  },
  {
    id: "BKG-2608-013",
    services: [{ slug: "nail-art", name: "Nail Art" }],
    designSlug: "3d-bow-charm-pink",
    designTitle: "3D Bow Charm Pink",
    date: "2026-08-20",
    time: "10:00",
    status: "pending_deposit",
    totalPrice: 195000,
    hasReview: false,
  },
  {
    id: "BKG-2608-014",
    services: [{ slug: "manicure", name: "Manicure" }],
    date: "2026-08-22",
    time: "13:00",
    status: "waiting_verification",
    depositStatus: "waiting_verification",
    totalPrice: 90000,
    hasReview: false,
  },
  {
    id: "BKG-2607-088",
    services: [{ slug: "gel-extension", name: "Gel Extension" }],
    designSlug: "sunset-ombre-coral",
    designTitle: "Sunset Ombre Coral",
    date: "2026-07-15",
    time: "16:00",
    status: "completed",
    depositStatus: "approved",
    totalPrice: 410000,
    promoCode: "SUMMERNAILS",
    hasReview: true,
  },
  {
    id: "BKG-2606-045",
    services: [{ slug: "pedicure", name: "Pedicure" }],
    date: "2026-06-20",
    time: "11:00",
    status: "completed",
    totalPrice: 110000,
    hasReview: false,
  },
  {
    id: "BKG-2605-021",
    services: [{ slug: "manicure", name: "Manicure" }],
    designSlug: "minimalist-line-art",
    designTitle: "Minimalist Line Art",
    date: "2026-05-10",
    time: "14:30",
    status: "completed",
    totalPrice: 230000,
    hasReview: true,
  },
  {
    id: "BKG-2604-099",
    services: [{ slug: "gel-extension", name: "Gel Extension" }],
    date: "2026-04-05",
    time: "09:00",
    status: "cancelled",
    totalPrice: 250000,
    hasReview: false,
  }
];
