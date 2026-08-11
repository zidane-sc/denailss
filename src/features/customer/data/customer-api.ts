import type { Appointment } from "@/features/appointment/types";
import type { CustomerBooking, CustomerProfile } from "../types";

export function appointmentToCustomerBooking(appointment: Appointment): CustomerBooking {
  return {
    id: appointment.id,
    services: appointment.services,
    designSlug: appointment.designSlug,
    designTitle: appointment.designTitle,
    fulfillment: appointment.fulfillment,
    date: appointment.date,
    time: appointment.time,
    status: appointment.status,
    depositStatus: appointment.depositStatus,
    depositRejectReason: appointment.depositRejectReason,
    totalPrice: appointment.price,
    hasReview: false,
  };
}

export function customerProfileFromApi(profile: { id: string; name: string; phone: string; email: string | null; notes: string | null }): CustomerProfile {
  return {
    id: profile.id,
    name: profile.name,
    phone: profile.phone,
    email: profile.email ?? "",
    notes: profile.notes ?? undefined,
  };
}

export async function fetchCustomerProfile() {
  const response = await fetch("/api/v1/customer/profile");
  if (!response.ok) throw new Error("profile");
  const payload = (await response.json()) as { data: Parameters<typeof customerProfileFromApi>[0] };
  return customerProfileFromApi(payload.data);
}

export async function fetchCustomerBookings() {
  const response = await fetch("/api/v1/customer/bookings");
  if (!response.ok) throw new Error("bookings");
  const payload = (await response.json()) as { data: Appointment[] };
  return payload.data.map(appointmentToCustomerBooking);
}

export async function updateCustomerProfile(profile: Pick<CustomerProfile, "name" | "phone" | "notes">) {
  const response = await fetch("/api/v1/customer/profile", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(profile),
  });
  if (!response.ok) throw new Error("profile");
  const payload = (await response.json()) as { data: Parameters<typeof customerProfileFromApi>[0] };
  return customerProfileFromApi(payload.data);
}
