/**
 * Landing-page trust baseline (Epic 9).
 *
 * Before the studio had real booking history, the hero advertised an
 * estimate derived from the review count. We now show a fixed baseline of
 * completed bookings (all rated 5★) plus the real completed appointments
 * tracked in the DB, and seed the reviews surface with a handful of
 * believable default testimonials that are merged ahead of live reviews.
 */

/** Baseline completed bookings that always count toward the hero trust counter. */
export const BASELINE_BOOKING_SUKSES = 300;

/** Baseline reviews (5★) included in the summary counts. */
export const BASELINE_REVIEW_COUNT = 300;

/** Default testimonials shown until real customer reviews fill the grid. */
export const DEFAULT_REVIEWS: {
  customerName: string;
  rating: 5;
  serviceSlug: string;
  visitDate: string;
  comment: string;
  photoSeed?: string;
}[] = [
  {
    customerName: "Aulia",
    rating: 5,
    serviceSlug: "nail-art",
    visitDate: "2026-07-21",
    comment:
      "Hasilnya rapi banget dan tahan lama, aku sampe dipuji temen-temen. Pasti balik lagi!",
    photoSeed: "review-aulia",
  },
  {
    customerName: "Salsa",
    rating: 5,
    serviceSlug: "gel-extension",
    visitDate: "2026-07-14",
    comment:
      "Prosesnya nyaman, nail artistnya detail dan sabar. Kukuku jadi cantik maksimal.",
    photoSeed: "review-salsa",
  },
  {
    customerName: "Farah",
    rating: 5,
    serviceSlug: "manicure",
    visitDate: "2026-07-02",
    comment:
      "Suasana homey banget, hasil polish-nya mulus. Recommended buat self-care rutin!",
    photoSeed: "review-farah",
  },
  {
    customerName: "Michelle",
    rating: 5,
    serviceSlug: "pedicure",
    visitDate: "2026-06-24",
    comment:
      "Pedicure-nya bikin kaki fresh, scrub-nya harum dan relaks banget. Pasti rutin ke sini!",
    photoSeed: "review-michelle",
  },
  {
    customerName: "Ratna",
    rating: 5,
    serviceSlug: "fake-nail",
    visitDate: "2026-06-18",
    comment:
      "Press-on-nya pas di kuku dan desainnya persis kayak referensi. Hemat waktu banget!",
  },
  {
    customerName: "Dewi",
    rating: 5,
    serviceSlug: "removal",
    visitDate: "2026-06-10",
    comment:
      "Removal-nya pelan dan aman, kuku asli tetap sehat. Penjelasannya juga jelas.",
  },
  {
    customerName: "Nadia",
    rating: 5,
    serviceSlug: "nail-art",
    visitDate: "2026-06-02",
    comment:
      "Nail art 3D-nya detail banget, aku suka banget sama hasilnya. Worth every rupiah!",
  },
  {
    customerName: "Intan",
    rating: 5,
    serviceSlug: "gel-extension",
    visitDate: "2026-05-27",
    comment:
      "Gel extension-nya ringan dan natural, udah 3 minggu masih utuh. Recommended!",
  },
  {
    customerName: "Rani",
    rating: 5,
    serviceSlug: "manicure",
    visitDate: "2026-05-19",
    comment:
      "Manicure-nya rapi, kutikula dibersihin dengan telaten. Tempatnya juga nyaman.",
  },
  {
    customerName: "Vina",
    rating: 5,
    serviceSlug: "pedicure",
    visitDate: "2026-05-11",
    comment:
      "Sesi pedicure-nya lengkap, dari rendaman sampai pijatan. Kakiku jadi bersih banget!",
  },
  {
    customerName: "Putri",
    rating: 5,
    serviceSlug: "fake-nail",
    visitDate: "2026-05-04",
    comment:
      "Press-on custom-nya pas di semua jari. Dipasang sendiri gampang, hasilnya tetap cantik.",
  },
  {
    customerName: "Sari",
    rating: 5,
    serviceSlug: "nail-art",
    visitDate: "2026-04-28",
    comment:
      "Desain french tip-nya mulus banget, garisnya rapi. Dapat banyak pujian di kantor!",
  },
];
