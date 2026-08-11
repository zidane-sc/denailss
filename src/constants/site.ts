export const SITE = {
  name: "Denailss",
  tagline: "Nail art & beauty space",
  taglineId: "Nail art rumahan langgananmu",
  description:
    "Booking nail art, gel extension, dan perawatan tangan-kaki di Denailss, tempat nail art favorit yang bisa kamu book langsung dari HP.",
  url: "https://denailss.beauty",
  whatsappNumber: "6281234567890",
  whatsappDisplay: "+62 812-3456-7890",
  instagramHandle: "denailss_9",
  instagramUrl: "https://www.instagram.com/denailss_9/",
  tiktokHandle: "denails10",
  tiktokUrl: "https://www.tiktok.com/@denails10",
  mapsUrl: "https://maps.google.com/?q=Denailss+Nail+Art+Jakarta+Selatan",
  latitude: -6.2088,
  longitude: 106.8456,
  address: "Jl. Petojo Binatu, Jakarta Pusat",
  hoursNote: "Jadwal buka berubah tiap minggu, cek kalender booking untuk slot terbaru",
} as const;

export function whatsappLink(message?: string, number?: string) {
  const base = `https://wa.me/${number ?? SITE.whatsappNumber}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}
