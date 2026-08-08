import type { Service } from "@/types";

/**
 * Mock data standing in for the future `services` table + repository layer
 * (see TRD §4 Database Design). Swap for a real repository call without
 * touching any component that imports `SERVICES`.
 */
export const SERVICES: Service[] = [
  {
    id: "svc-gel-extension",
    slug: "gel-extension",
    name: "Gel Extension",
    category: "gel-extension",
    shortDescription: "Extension gel tahan lama dengan bentuk custom sesuai request kamu.",
    description:
      "Gel extension jadi andalan buat kamu yang mau kuku panjang instan tanpa nunggu proses tumbuh alami. Kami sculpting satu-satu di studio pakai gel premium yang ringan dan tahan chip sampai 3-4 minggu, lalu kamu bisa lanjut nail art di atasnya.",
    priceFrom: 250000,
    durationMinutes: 120,
    heroImage: "denailss-gel-extension-hero",
    gallerySeeds: ["denailss-gel-1", "denailss-gel-2", "denailss-gel-3", "denailss-gel-4"],
    faq: [
      {
        question: "Gel extension tahan berapa lama?",
        answer: "Rata-rata 3-4 minggu sebelum perlu fill-in, tergantung kecepatan tumbuh kuku dan cara pemakaian sehari-hari.",
      },
      {
        question: "Apakah bisa request bentuk dan panjang custom?",
        answer: "Bisa banget. Kamu bisa pilih bentuk almond, square, coffin, round, atau stiletto, dan tentukan panjang saat konsultasi di awal sesi.",
      },
    ],
    depositApplicable: true,
  },
  {
    id: "svc-removal",
    slug: "removal",
    name: "Nail Removal",
    category: "removal",
    shortDescription: "Pelepasan gel atau extension yang aman tanpa merusak kuku asli.",
    description:
      "Proses soak-off yang lembut untuk melepas gel polish atau extension sebelumnya. Kami selalu cek kondisi kuku asli dulu dan kasih rekomendasi perawatan setelahnya biar kuku tetap sehat.",
    priceFrom: 75000,
    durationMinutes: 30,
    heroImage: "denailss-removal-hero",
    gallerySeeds: ["denailss-removal-1", "denailss-removal-2"],
    faq: [
      {
        question: "Removal di tempat lain bisa dilanjut di sini?",
        answer: "Bisa, tim kami akan cek dulu kondisi produk sebelumnya supaya proses pelepasan tetap aman untuk kuku asli.",
      },
    ],
    depositApplicable: false,
  },
  {
    id: "svc-manicure",
    slug: "manicure",
    name: "Manicure",
    category: "manicure",
    shortDescription: "Perawatan tangan lengkap, dari kutikula sampai polish akhir.",
    description:
      "Sesi manicure klasik yang mencakup pembersihan kutikula, shaping, hand massage singkat, dan finishing polish pilihanmu (reguler atau gel). Cocok jadi self-care rutin bulanan.",
    priceFrom: 90000,
    durationMinutes: 45,
    heroImage: "denailss-manicure-hero",
    gallerySeeds: ["denailss-manicure-1", "denailss-manicure-2", "denailss-manicure-3"],
    faq: [
      {
        question: "Bedanya polish reguler dan gel apa?",
        answer: "Polish reguler kering lebih cepat dikerjakan tapi daya tahan 3-5 hari, sedangkan gel butuh curing lampu UV namun tahan hingga 2 minggu.",
      },
    ],
    depositApplicable: false,
  },
  {
    id: "svc-pedicure",
    slug: "pedicure",
    name: "Pedicure",
    category: "pedicure",
    shortDescription: "Spa kaki menenangkan plus perawatan kuku dari ujung ke ujung.",
    description:
      "Pedicure spa dengan rendaman aromatik, scrub kaki, pemijatan, dan finishing kuku rapi. Sesi ini dirancang buat kamu yang butuh waktu relaks sekaligus kaki yang terawat.",
    priceFrom: 110000,
    durationMinutes: 60,
    heroImage: "denailss-pedicure-hero",
    gallerySeeds: ["denailss-pedicure-1", "denailss-pedicure-2"],
    faq: [
      {
        question: "Apakah pedicure termasuk pijat kaki?",
        answer: "Iya, setiap sesi pedicure sudah termasuk pemijatan kaki singkat sekitar 10 menit sebelum finishing polish.",
      },
    ],
    depositApplicable: false,
  },
  {
    id: "svc-fake-nail",
    slug: "fake-nail",
    name: "Fake Nail (Press-On)",
    category: "fake-nail",
    shortDescription: "Kuku palsu custom-fit yang bisa dipasang dan dilepas sendiri.",
    description:
      "Alternatif tanpa komitmen jangka panjang, press-on nails yang di-custom sesuai ukuran kukumu, lengkap dengan desain pilihan. Cocok untuk acara khusus atau kamu yang mau ganti-ganti tampilan.",
    priceFrom: 180000,
    durationMinutes: 75,
    heroImage: "denailss-fakenail-hero",
    gallerySeeds: ["denailss-fakenail-1", "denailss-fakenail-2", "denailss-fakenail-3"],
    faq: [
      {
        question: "Berapa lama press-on ini bisa dipakai ulang?",
        answer: "Dengan perawatan yang benar, satu set press-on bisa dipakai ulang 3-5 kali sebelum perlu diganti.",
      },
    ],
    depositApplicable: false,
  },
  {
    id: "svc-nail-art",
    slug: "nail-art",
    name: "Nail Art",
    category: "nail-art",
    shortDescription: "Hand-painted nail art detail, dari minimalis sampai 3D charm.",
    description:
      "Layanan tambahan di atas manicure/gel base untuk desain hand-painted, ombre, chrome, sampai 3D charm. Setiap desain dikerjakan manual sesuai referensi dari gallery atau ide kamu sendiri.",
    priceFrom: 120000,
    durationMinutes: 60,
    heroImage: "denailss-nailart-hero",
    gallerySeeds: ["denailss-nailart-1", "denailss-nailart-2", "denailss-nailart-3", "denailss-nailart-4"],
    faq: [
      {
        question: "Harga nail art dihitung per kuku atau per set?",
        answer: "Harga dasar untuk satu set (10 jari), dengan tambahan biaya untuk desain 3D charm atau detail extra rumit.",
      },
    ],
    depositApplicable: true,
  },
];

export function getServiceBySlug(slug: string) {
  return SERVICES.find((service) => service.slug === slug);
}
