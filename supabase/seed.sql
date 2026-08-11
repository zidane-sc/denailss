-- Idempotent development seed for the current Denailss catalog and availability configuration.
--
-- Covers the dev catalog (services, availability template/overrides/blocked).
-- The remaining config tables (availability vacations + booking rules,
-- deposit_config, settings + FAQ/SEO, promotions, instagram_posts) are seeded
-- idempotently by their own migrations (supabase/migrations/0005…0017), so
-- they are not duplicated here.
--
-- The gallery catalog is NOT seeded here — it is populated from the scraped
-- Instagram portfolio by `npm run seed:gallery` (scripts/seed-gallery.ts),
-- which uploads images to Supabase Storage and inserts gallery + gallery_images
-- rows.
--
-- Synthetic appointment/customer history is intentionally excluded — the app
-- runs on real bookings only (real-data-only decision).

BEGIN;

-- Services catalog
INSERT INTO public.services (id, slug, name, short_description, description, price_from, duration_minutes, tiers, requires_pickup, deposit_applicable, active, hero_image, gallery_seeds, faq, price_note) VALUES
('svc-gel-extension', 'gel-extension', 'Gel Extension', 'Extension gel tahan lama dengan bentuk custom sesuai request kamu.', 'Gel extension jadi andalan buat kamu yang mau kuku panjang instan tanpa nunggu proses tumbuh alami. Kami sculpting satu-satu secara presisi pakai gel premium yang ringan dan tahan chip sampai 3-4 minggu, lalu kamu bisa lanjut nail art di atasnya.', 250000, 120, '[]'::jsonb, false, true, true, 'denailss-gel-extension-hero', '["denailss-gel-1","denailss-gel-2","denailss-gel-3","denailss-gel-4"]'::jsonb, '[{"question":"Gel extension tahan berapa lama?","answer":"Rata-rata 3-4 minggu sebelum perlu fill-in, tergantung kecepatan tumbuh kuku dan cara pemakaian sehari-hari."},{"question":"Apakah bisa request bentuk dan panjang custom?","answer":"Bisa banget. Kamu bisa pilih bentuk almond, square, coffin, round, atau stiletto, dan tentukan panjang saat konsultasi di awal sesi."}]'::jsonb, NULL),
('svc-removal', 'removal', 'Nail Removal', 'Pelepasan gel atau extension yang aman tanpa merusak kuku asli.', 'Proses soak-off yang lembut untuk melepas gel polish atau extension sebelumnya. Kami selalu cek kondisi kuku asli dulu dan kasih rekomendasi perawatan setelahnya biar kuku tetap sehat.', 75000, 30, '[]'::jsonb, false, false, true, 'denailss-removal-hero', '["denailss-removal-1","denailss-removal-2"]'::jsonb, '[{"question":"Removal di tempat lain bisa dilanjut di sini?","answer":"Bisa, tim kami akan cek dulu kondisi produk sebelumnya supaya proses pelepasan tetap aman untuk kuku asli."}]'::jsonb, NULL),
('svc-manicure', 'manicure', 'Manicure', 'Perawatan tangan lengkap, dari kutikula sampai polish akhir.', 'Sesi manicure klasik yang mencakup pembersihan kutikula, shaping, hand massage singkat, dan finishing polish pilihanmu (reguler atau gel). Cocok jadi self-care rutin bulanan.', 90000, 45, '[]'::jsonb, false, false, true, 'denailss-manicure-hero', '["denailss-manicure-1","denailss-manicure-2","denailss-manicure-3"]'::jsonb, '[{"question":"Bedanya polish reguler dan gel apa?","answer":"Polish reguler kering lebih cepat dikerjakan tapi daya tahan 3-5 hari, sedangkan gel butuh curing lampu UV namun tahan hingga 2 minggu."}]'::jsonb, NULL),
('svc-pedicure', 'pedicure', 'Pedicure', 'Spa kaki menenangkan plus perawatan kuku dari ujung ke ujung.', 'Pedicure spa dengan rendaman aromatik, scrub kaki, pemijatan, dan finishing kuku rapi. Sesi ini dirancang buat kamu yang butuh waktu relaks sekaligus kaki yang terawat.', 110000, 60, '[]'::jsonb, false, false, true, 'denailss-pedicure-hero', '["denailss-pedicure-1","denailss-pedicure-2"]'::jsonb, '[{"question":"Apakah pedicure termasuk pijat kaki?","answer":"Iya, setiap sesi pedicure sudah termasuk pemijatan kaki singkat sekitar 10 menit sebelum finishing polish."}]'::jsonb, NULL),
('svc-fake-nail', 'fake-nail', 'Fake Nail (Press-On)', 'Kuku palsu custom-fit yang bisa dipasang dan dilepas sendiri.', 'Alternatif tanpa komitmen jangka panjang, press-on nails yang di-custom sesuai ukuran kukumu, lengkap dengan desain pilihan. Cocok untuk acara khusus atau kamu yang mau ganti-ganti tampilan.', 180000, 75, '[{"key":"simple","label":"Simple","priceFrom":180000,"durationMinutes":60},{"key":"complex","label":"Complex","priceFrom":280000,"durationMinutes":90}]'::jsonb, true, false, true, 'denailss-fakenail-hero', '["denailss-fakenail-1","denailss-fakenail-2","denailss-fakenail-3"]'::jsonb, '[{"question":"Berapa lama press-on ini bisa dipakai ulang?","answer":"Dengan perawatan yang benar, satu set press-on bisa dipakai ulang 3-5 kali sebelum perlu diganti."}]'::jsonb, NULL),
('svc-nail-art', 'nail-art', 'Nail Art', 'Hand-painted nail art detail, dari minimalis sampai 3D charm.', 'Layanan tambahan di atas manicure/gel base untuk desain hand-painted, ombre, chrome, sampai 3D charm. Setiap desain dikerjakan manual sesuai referensi dari gallery atau ide kamu sendiri.', 120000, 60, '[{"key":"simple","label":"Simple","priceFrom":120000,"durationMinutes":45},{"key":"complex","label":"Complex","priceFrom":220000,"durationMinutes":90}]'::jsonb, false, true, true, 'denailss-nailart-hero', '["denailss-nailart-1","denailss-nailart-2","denailss-nailart-3","denailss-nailart-4"]'::jsonb, '[{"question":"Harga nail art dihitung per kuku atau per set?","answer":"Harga dasar untuk satu set (10 jari), dengan tambahan biaya untuk desain 3D charm atau detail extra rumit."}]'::jsonb, NULL)

ON CONFLICT (id) DO UPDATE SET slug = EXCLUDED.slug, name = EXCLUDED.name, short_description = EXCLUDED.short_description, description = EXCLUDED.description, price_from = EXCLUDED.price_from, duration_minutes = EXCLUDED.duration_minutes, tiers = EXCLUDED.tiers, requires_pickup = EXCLUDED.requires_pickup, deposit_applicable = EXCLUDED.deposit_applicable, active = EXCLUDED.active, hero_image = EXCLUDED.hero_image, gallery_seeds = EXCLUDED.gallery_seeds, faq = EXCLUDED.faq, price_note = EXCLUDED.price_note, updated_at = now();

-- Weekly availability templates. Seed-owned rows are replaced before insertion for reruns.
DELETE FROM public.availability_templates;
INSERT INTO public.availability_templates (weekday, start_time, end_time) VALUES
(0, '09:00', '12:00'),
(0, '13:00', '17:00'),
(0, '19:00', '22:00'),
(2, '18:00', '22:00'),
(3, '13:00', '20:00'),
(4, '13:00', '20:00'),
(5, '13:00', '21:00'),
(6, '09:00', '21:00');

INSERT INTO public.availability_overrides (date, ranges) VALUES ('2026-08-17', '[{"start":"08:00","end":"21:00"}]'::jsonb) ON CONFLICT (date) DO UPDATE SET ranges = EXCLUDED.ranges, updated_at = now();

DELETE FROM public.blocked_times WHERE date = '2026-08-12' AND reason = 'Family event';
INSERT INTO public.blocked_times (date, start_time, end_time, reason) VALUES ('2026-08-12', '15:00', '17:00', 'Family event');

COMMIT;
