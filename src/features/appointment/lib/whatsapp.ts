import { formatDateId, parseDateKey } from "@/lib/format";
import type { Appointment } from "../types";

export function waCustomerChatLink(phone: string, message?: string) {
  const digits = phone.replace(/\D/g, "");
  const intl = digits.startsWith("0") ? `62${digits.slice(1)}` : digits;
  const base = `https://wa.me/${intl}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}

export function formatApptSchedule(appt: Appointment) {
  if (!appt.date) return "Pesanan Produk (Online)";
  return `${formatDateId(parseDateKey(appt.date))} · ${appt.time || "-"} WIB`;
}

export function depositApprovedWaMessage(appt: Appointment) {
  return `Halo ${appt.customer.name.split(" ")[0]}! 🖊️

Deposit kamu untuk booking ${appt.id} sudah kami TERIMA dan verifikasi ✅

Detail booking:
• ${formatApptSchedule(appt)}
• Layanan: ${appt.services.map((s) => s.name).join(", ")}
• Total: Rp${appt.price.toLocaleString("id-ID")}

Sampai jumpa di sesi nail art kamu! 💅`;
}

export function depositRejectedWaMessage(appt: Appointment, reason: string) {
  return `Halo ${appt.customer.name.split(" ")[0]}! ⚠️

Mohon maaf, bukti transfer untuk booking ${appt.id} belum bisa kami TERIMA.

Alasan: ${reason}

Silakan kirim ulang bukti transfer yang jelas ya, atau hubungi kami kalau ada kendala. 💅`;
}

export function rescheduledWaMessage(appt: Appointment, oldDate: string, oldTime: string) {
  const firstName = appt.customer.name.split(" ")[0];
  const oldSchedule = appt.date ? `${formatDateId(parseDateKey(oldDate))} · ${oldTime || "-"} WIB` : "Pesanan Produk (Online)";
  return `Halo ${firstName}! 📅

Jadwal booking ${appt.id} kamu sudah kami ATUR ULANG.

Jadwal lama:
• ${oldSchedule}

Jadwal baru:
• ${formatApptSchedule(appt)}

Konfirmasi balik ya kalau sudah oke! 💅`;
}
