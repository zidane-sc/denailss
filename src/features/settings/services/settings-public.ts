import "server-only";
import { SITE } from "@/constants/site";
import { getSettings } from "./settings-service";
import type { Settings } from "../types";

/** Default landing FAQ copy (mirrors the original static content). */
export const DEFAULT_FAQS: Settings["faqs"] = [
  {
    section: "booking",
    q: "Gimana cara booking di Denailss?",
    a: "Klik tombol Booking Sekarang, pilih layanan dan desain (opsional), lalu pilih tanggal dan jam yang tersedia di kalender. Semua bisa selesai dari HP tanpa perlu chat dulu.",
  },
  {
    section: "booking",
    q: "Apakah semua booking butuh deposit?",
    a: "Untuk layanan tertentu seperti gel extension dan nail art, kami minta deposit untuk mengamankan slot. Nominal dan cara bayarnya akan muncul jelas di step booking sebelum kamu konfirmasi.",
  },
  {
    section: "booking",
    q: "Bisa reschedule kalau berhalangan?",
    a: "Bisa, hubungi kami lewat WhatsApp minimal 3 jam sebelum jadwal untuk reschedule tanpa kehilangan deposit yang sudah dibayar.",
  },
  {
    section: "service",
    q: "Berapa lama waktu pengerjaan rata-rata?",
    a: "Tergantung layanan, mulai dari 30 menit untuk removal sampai 2 jam untuk gel extension lengkap dengan nail art. Estimasi durasi selalu ditampilkan di setiap layanan.",
  },
  {
    section: "service",
    q: "Apakah bisa bawa referensi desain sendiri?",
    a: "Tentu, kamu bisa kirim referensi lewat WhatsApp atau upload saat proses booking supaya nail artist bisa siapkan warna dan tools yang sesuai.",
  },
  {
    section: "service",
    q: "Produk yang dipakai aman untuk kuku sensitif?",
    a: "Kami menggunakan gel dan polish grade profesional yang sudah teruji, dan selalu cek kondisi kuku dulu sebelum treatment untuk kuku yang sensitif.",
  },
];

/**
 * Public settings read for server components / metadata / SSG.
 *
 * Returns the persisted `settings` row when available, otherwise a default
 * derived from the single-source business constants (`@/constants/site`), so
 * the public site never breaks when the DB is unreachable at build time.
 */
export async function getPublicSettings(): Promise<Settings> {
  try {
    const persisted = await getSettings();
    if (persisted) return persisted;
  } catch {
    // fall through to the constants default
  }
  return {
    businessProfile: {
      name: SITE.name,
      logo: null,
      description: SITE.description,
      address: SITE.address,
    },
    socialMedia: {
      instagram: SITE.instagramHandle,
      tiktok: SITE.tiktokHandle,
      whatsapp: SITE.whatsappNumber,
    },
    policies: {
      cancellation: "",
      deposit: "",
    },
    seo: {
      metaTitle: `${SITE.name} · ${SITE.tagline}`,
      metaDescription: SITE.description,
      ogImage: "/images/logo-horizontal.png",
    },
    faqs: DEFAULT_FAQS,
  };
}
