import type { Appointment } from "@/features/appointment/types";

/**
 * Session-only store that bridges bookings made through `/booking` into
 * the backoffice. There is no backend yet, so this is a module-level
 * in-memory list with a tiny subscriber list — the backoffice provider
 * seeds from it and re-renders when a new booking is pushed.
 *
 * Swap for a real repository/API call later without touching consumers.
 */
let bookings: Appointment[] = [];

const subscribers = new Set<() => void>();

function notify() {
  subscribers.forEach((cb) => cb());
}

export function subscribeBookings(cb: () => void): () => void {
  subscribers.add(cb);
  return () => subscribers.delete(cb);
}

export function getBookings(): Appointment[] {
  return bookings;
}

export function addBooking(booking: Appointment) {
  bookings = [...bookings, booking];
  notify();
}
