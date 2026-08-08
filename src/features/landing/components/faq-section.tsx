import { Reveal } from "@/components/motion/reveal";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const BOOKING_FAQ = [
  {
    q: "Gimana cara booking di Denailss?",
    a: "Klik tombol Booking Sekarang, pilih layanan dan desain (opsional), lalu pilih tanggal dan jam yang tersedia di kalender. Semua bisa selesai dari HP tanpa perlu chat dulu.",
  },
  {
    q: "Apakah semua booking butuh deposit?",
    a: "Untuk layanan tertentu seperti gel extension dan nail art, kami minta deposit untuk mengamankan slot. Nominal dan cara bayarnya akan muncul jelas di step booking sebelum kamu konfirmasi.",
  },
  {
    q: "Bisa reschedule kalau berhalangan?",
    a: "Bisa, hubungi kami lewat WhatsApp minimal 3 jam sebelum jadwal untuk reschedule tanpa kehilangan deposit yang sudah dibayar.",
  },
];

const SERVICE_FAQ = [
  {
    q: "Berapa lama waktu pengerjaan rata-rata?",
    a: "Tergantung layanan, mulai dari 30 menit untuk removal sampai 2 jam untuk gel extension lengkap dengan nail art. Estimasi durasi selalu ditampilkan di setiap layanan.",
  },
  {
    q: "Apakah bisa bawa referensi desain sendiri?",
    a: "Tentu, kamu bisa kirim referensi lewat WhatsApp atau upload saat proses booking supaya nail artist bisa siapkan warna dan tools yang sesuai.",
  },
  {
    q: "Produk yang dipakai aman untuk kuku sensitif?",
    a: "Kami menggunakan gel dan polish grade profesional yang sudah teruji, dan selalu cek kondisi kuku dulu sebelum treatment untuk kuku yang sensitif.",
  },
];

export function FaqSection() {
  return (
    <section className="py-16 sm:py-20 lg:py-24">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal className="max-w-lg">
          <h2 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Pertanyaan yang sering ditanyakan
          </h2>
        </Reveal>

        <div className="mt-10 grid gap-10 lg:grid-cols-2 lg:gap-16">
          <Reveal>
            <p className="text-sm font-semibold text-foreground">Seputar Booking</p>
            <Accordion className="mt-3">
              {BOOKING_FAQ.map((item, i) => (
                <AccordionItem key={item.q} value={`booking-${i}`}>
                  <AccordionTrigger className="text-base">{item.q}</AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">{item.a}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </Reveal>

          <Reveal delay={0.1}>
            <p className="text-sm font-semibold text-foreground">Seputar Layanan</p>
            <Accordion className="mt-3">
              {SERVICE_FAQ.map((item, i) => (
                <AccordionItem key={item.q} value={`service-${i}`}>
                  <AccordionTrigger className="text-base">{item.q}</AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">{item.a}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
