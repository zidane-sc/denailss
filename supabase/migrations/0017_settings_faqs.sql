-- Settings landing FAQ (hand-authored): a faqs JSONB column holding the two
-- landing FAQ groups ([{ section: "booking"|"service", q, a }]) editable from
-- /backoffice/settings.

ALTER TABLE public.settings
  ADD COLUMN IF NOT EXISTS faqs jsonb NOT NULL DEFAULT '[]'::jsonb;

-- Backfill the single settings row with the current landing FAQ copy
-- (idempotent: only fills when the column is still empty).
UPDATE public.settings
SET faqs = '[
  {"section":"booking","q":"Gimana cara booking di Denailss?","a":"Klik tombol Booking Sekarang, pilih layanan dan desain (opsional), lalu pilih tanggal dan jam yang tersedia di kalender. Semua bisa selesai dari HP tanpa perlu chat dulu."},
  {"section":"booking","q":"Apakah semua booking butuh deposit?","a":"Untuk layanan tertentu seperti gel extension dan nail art, kami minta deposit untuk mengamankan slot. Nominal dan cara bayarnya akan muncul jelas di step booking sebelum kamu konfirmasi."},
  {"section":"booking","q":"Bisa reschedule kalau berhalangan?","a":"Bisa, hubungi kami lewat WhatsApp minimal 3 jam sebelum jadwal untuk reschedule tanpa kehilangan deposit yang sudah dibayar."},
  {"section":"service","q":"Berapa lama waktu pengerjaan rata-rata?","a":"Tergantung layanan, mulai dari 30 menit untuk removal sampai 2 jam untuk gel extension lengkap dengan nail art. Estimasi durasi selalu ditampilkan di setiap layanan."},
  {"section":"service","q":"Apakah bisa bawa referensi desain sendiri?","a":"Tentu, kamu bisa kirim referensi lewat WhatsApp atau upload saat proses booking supaya nail artist bisa siapkan warna dan tools yang sesuai."},
  {"section":"service","q":"Produk yang dipakai aman untuk kuku sensitif?","a":"Kami menggunakan gel dan polish grade profesional yang sudah teruji, dan selalu cek kondisi kuku dulu sebelum treatment untuk kuku yang sensitif."}
]'::jsonb
WHERE id = 'site' AND (faqs IS NULL OR jsonb_array_length(faqs) = 0);

