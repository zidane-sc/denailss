-- Idempotent development seed for the current Denailss catalog and availability configuration.
-- Gallery image files remain local semantic seeds until Supabase Storage is implemented.
-- Vacations, global deposit settings, promotions, and synthetic appointment fixtures are intentionally excluded.

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

-- Gallery metadata; imageSeeds stay in the frontend until Storage migration.
INSERT INTO public.gallery (id, slug, title, description, aspect, style, color, occasion, shape, difficulty, price) VALUES
('des-01', 'korean-milk-nail', 'Korean Milk Nail', 'Base putih susu translucent dengan sedikit shimmer di ujung kuku. Simple tapi tetap terlihat premium, cocok dipakai harian.', 'portrait', 'korean', 'white', 'daily', 'almond', 'easy', 100000),
('des-02', 'classic-french-tip', 'Classic French Tip', 'French tip klasik dengan garis putih bersih di atas base nude natural.', 'square', 'french', 'nude', 'daily', 'square', 'easy', 100000),
('des-03', 'chrome-mirror-silver', 'Chrome Mirror Silver', 'Efek chrome mengilap seperti cermin, favorit anak Y2K revival.', 'tall', 'chrome', 'white', 'party', 'coffin', 'medium', 140000),
('des-04', 'sunset-ombre-coral', 'Sunset Ombre Coral', 'Gradasi oranye ke pink coral yang lembut, terinspirasi warna langit senja.', 'landscape', 'ombre', 'pink', 'daily', 'almond', 'medium', 140000),
('des-05', '3d-bow-charm-pink', '3D Bow Charm Pink', 'Pita 3D lucu di atas base pink pastel, girly banget buat acara spesial.', 'portrait', '3d-art', 'pastel', 'party', 'almond', 'complex', 190000),
('des-06', 'minimalist-line-art', 'Minimalist Line Art', 'Garis-garis halus abstrak di atas base nude, cocok untuk daily look yang tetap artsy.', 'square', 'minimalist', 'nude', 'daily', 'round', 'medium', 140000),
('des-07', 'wedding-pearl-french', 'Wedding Pearl French', 'French tip elegan dengan aksen pearl kecil, dibuat khusus untuk hari pernikahan.', 'tall', 'french', 'white', 'wedding', 'almond', 'very-complex', 240000),
('des-08', 'gold-foil-luxe', 'Gold Foil Luxe', 'Serpihan gold foil di atas base merah marun, terasa mewah untuk acara formal.', 'landscape', '3d-art', 'gold', 'festive', 'coffin', 'very-complex', 240000),
('des-09', 'cherry-red-glossy', 'Cherry Red Glossy', 'Merah cherry glossy klasik yang selalu terlihat chic di semua kesempatan.', 'square', 'minimalist', 'red', 'party', 'square', 'easy', 100000),
('des-10', 'pastel-cloud-korean', 'Pastel Cloud Korean', 'Motif awan lembut warna pastel biru dan pink, super cute buat sehari-hari.', 'portrait', 'korean', 'pastel', 'daily', 'round', 'very-complex', 240000),
('des-11', 'graduation-star-charm', 'Graduation Star Charm', 'Aksen bintang emas kecil dengan base putih bersih, spesial untuk momen wisuda.', 'tall', '3d-art', 'white', 'graduation', 'almond', 'very-complex', 240000),
('des-12', 'black-chrome-edge', 'Black Chrome Edge', 'Base hitam matte dengan tepi chrome tajam, bold dan edgy.', 'square', 'chrome', 'black', 'party', 'stiletto', 'complex', 190000),
('des-13', 'milky-french-almond', 'Milky French Almond', 'Versi lembut dari french tip dengan base milky semi-transparan.', 'landscape', 'french', 'nude', 'daily', 'almond', 'medium', 140000),
('des-14', 'festive-red-gold-flake', 'Festive Red Gold Flake', 'Merah cerah dengan taburan gold flake, cocok untuk perayaan tahun baru atau lebaran.', 'portrait', '3d-art', 'red', 'festive', 'coffin', 'complex', 190000),
('des-15', 'sky-blue-ombre', 'Sky Blue Ombre', 'Gradasi biru langit yang menyegarkan, populer buat liburan pantai.', 'square', 'ombre', 'pastel', 'daily', 'round', 'medium', 140000),
('des-16', 'matte-nude-minimal', 'Matte Nude Minimal', 'Base nude matte polos tanpa dekorasi berlebihan, clean girl aesthetic.', 'tall', 'minimalist', 'nude', 'daily', 'square', 'easy', 100000),
('des-17', 'party-glitter-fuchsia', 'Party Glitter Fuchsia', 'Fuchsia cerah dengan glitter chunky, siap menyala di lantai dansa.', 'landscape', '3d-art', 'pink', 'party', 'stiletto', 'complex', 190000),
('des-18', 'wedding-lace-white', 'Wedding Lace White', 'Motif lace putih halus yang menyerupai detail gaun pengantin.', 'portrait', '3d-art', 'white', 'wedding', 'almond', 'very-complex', 240000),
('des-19', 'korean-jelly-pink', 'Korean Jelly Pink', 'Tekstur jelly transparan warna pink lembut, tren dari Seoul yang sedang naik.', 'square', 'korean', 'pink', 'daily', 'round', 'easy', 100000),
('des-20', 'graduation-navy-gold', 'Graduation Navy Gold', 'Navy tua dipadukan garis emas tipis, elegan untuk momen kelulusan.', 'tall', 'minimalist', 'gold', 'graduation', 'square', 'complex', 190000)

ON CONFLICT (id) DO UPDATE SET slug = EXCLUDED.slug, title = EXCLUDED.title, description = EXCLUDED.description, aspect = EXCLUDED.aspect, style = EXCLUDED.style, color = EXCLUDED.color, occasion = EXCLUDED.occasion, shape = EXCLUDED.shape, difficulty = EXCLUDED.difficulty, price = EXCLUDED.price, updated_at = now();

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
