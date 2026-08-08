export const SITE = {
  name: "Denailss",
  tagline: "Nail art studio & beauty space",
  taglineId: "Nail art studio langgananmu",
  description:
    "Booking nail art, gel extension, dan perawatan tangan-kaki di Denailss, nail studio favorit yang bisa kamu book langsung dari HP.",
  url: "https://denailss.id",
  whatsappNumber: "6281234567890",
  whatsappDisplay: "+62 812-3456-7890",
  instagramHandle: "denailss.id",
  instagramUrl: "https://instagram.com/denailss.id",
  tiktokHandle: "denailss.id",
  tiktokUrl: "https://tiktok.com/@denailss.id",
  mapsUrl: "https://maps.google.com/?q=Denailss+Nail+Studio+Jakarta+Selatan",
  address: "Jl. Kemang Raya No. 21, Jakarta Selatan",
  hoursNote: "Jadwal buka berubah tiap minggu, cek kalender booking untuk slot terbaru",
} as const;

export function whatsappLink(message?: string) {
  const base = `https://wa.me/${SITE.whatsappNumber}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}
