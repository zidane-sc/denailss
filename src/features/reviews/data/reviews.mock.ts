import type { Review } from "@/types";

export const REVIEWS: Review[] = [
  {
    id: "rev-01",
    customerName: "Aulia Rahmadhani",
    rating: 5,
    serviceSlug: "gel-extension",
    visitDate: "2026-07-30",
    comment:
      "Hasil gel extension-nya rapi banget, bentuknya presisi sama kiri kanan. Udah 3 minggu masih kuat nggak ada yang lepas sama sekali.",
    photoSeed: "review-aulia",
  },
  {
    id: "rev-02",
    customerName: "Kezia Winarto",
    rating: 5,
    serviceSlug: "nail-art",
    visitDate: "2026-07-22",
    comment:
      "Request desain dari Pinterest langsung dibuatin mirip banget sama referensinya. Kak Dena teliti banget sama detail kecil.",
  },
  {
    id: "rev-03",
    customerName: "Nadya Prasetyo",
    rating: 4,
    serviceSlug: "manicure",
    visitDate: "2026-07-18",
    comment:
      "Suka sama pelayanannya yang ramah, tempatnya juga bersih. Cuma antre agak lama karena lagi ramai pas weekend.",
  },
  {
    id: "rev-04",
    customerName: "Salsabila Putri",
    rating: 5,
    serviceSlug: "gel-extension",
    visitDate: "2026-07-10",
    comment:
      "Ini kesekian kalinya booking di Denailss, selalu konsisten hasilnya. Booking online-nya juga gampang banget, nggak perlu chat bolak-balik.",
    photoSeed: "review-salsa",
  },
  {
    id: "rev-05",
    customerName: "Intan Maharani",
    rating: 5,
    serviceSlug: "pedicure",
    visitDate: "2026-06-28",
    comment:
      "Pedicure-nya relaxing banget, ada pijat kaki juga. Worth it buat self-reward abis kerja seminggu.",
  },
  {
    id: "rev-06",
    customerName: "Devina Kusuma",
    rating: 4,
    serviceSlug: "fake-nail",
    visitDate: "2026-06-15",
    comment:
      "Press-on-nya pas banget di ukuran kuku, nggak perlu dipotong lagi. Desainnya juga sesuai request buat acara kondangan.",
  },
  {
    id: "rev-07",
    customerName: "Farah Amelia",
    rating: 5,
    serviceSlug: "nail-art",
    visitDate: "2026-06-02",
    comment:
      "Detail 3D bow-nya lucu banget, awet juga nggak gampang copot padahal aku sering pakai tangan buat kerja.",
    photoSeed: "review-farah",
  },
  {
    id: "rev-08",
    customerName: "Clarissa Halim",
    rating: 5,
    serviceSlug: "gel-extension",
    visitDate: "2026-05-20",
    comment:
      "Konsultasi bentuk kuku dijelasin dengan sabar sampai aku yakin sama pilihan almond shape. Recommended banget buat first-timer.",
  },
  {
    id: "rev-09",
    customerName: "Bunga Anggraini",
    rating: 3,
    serviceSlug: "manicure",
    visitDate: "2026-05-08",
    comment:
      "Hasilnya bagus, cuma waktu itu jadwalku sedikit mundur dari jam booking. Overall masih puas sama hasil akhirnya.",
  },
  {
    id: "rev-10",
    customerName: "Michelle Tanoto",
    rating: 5,
    serviceSlug: "nail-art",
    visitDate: "2026-04-25",
    comment:
      "Chrome mirror-nya kece parah, difoto dari sudut mana pun tetap kelihatan mengilap. Bakal balik lagi buat desain lain.",
    photoSeed: "review-michelle",
  },
];

export function getReviewSummary() {
  const total = REVIEWS.length;
  const average = REVIEWS.reduce((sum, review) => sum + review.rating, 0) / total;
  return { total, average: Math.round(average * 10) / 10 };
}
