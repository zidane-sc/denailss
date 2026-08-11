-- Promotions table + RLS + seed (hand-authored, matches 0001/0003 style).
--
-- usage_limit = 0 means unlimited. used_count is incremented atomically inside
-- the booking transaction when a promo is applied, so quota enforcement is
-- real (previously display-only).

CREATE TABLE IF NOT EXISTS public.promotions (
  id text PRIMARY KEY NOT NULL,
  code text NOT NULL,
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  discount_type text NOT NULL,
  discount_value integer NOT NULL,
  maximum_discount integer,
  start_date date NOT NULL,
  end_date date NOT NULL,
  usage_limit integer NOT NULL DEFAULT 0,
  used_count integer NOT NULL DEFAULT 0,
  minimum_spend integer,
  applicable_service_slugs jsonb NOT NULL DEFAULT '[]'::jsonb,
  image_seed text,
  active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS promotions_code_unique ON public.promotions(code);

ALTER TABLE public.promotions ENABLE ROW LEVEL SECURITY;

CREATE POLICY promotions_public_read ON public.promotions
  FOR SELECT TO anon, authenticated
  USING (true);

CREATE POLICY promotions_owner_write ON public.promotions
  FOR ALL TO authenticated
  USING (public.current_user_role() = 'owner')
  WITH CHECK (public.current_user_role() = 'owner');

-- Seed the existing promotions (idempotent).
INSERT INTO public.promotions (id, code, title, description, discount_type, discount_value, maximum_discount, start_date, end_date, usage_limit, used_count, minimum_spend, applicable_service_slugs, image_seed, active, created_at, updated_at) VALUES
  ('promo-17an', 'PROMO17', 'Promo Kemerdekaan', 'Diskon 17% untuk semua layanan Nail Art & Gel Extension sepanjang Agustus.', 'percentage', 17, 75000, '2026-08-01', '2026-08-31', 100, 34, 150000, '["nail-art","gel-extension"]', 'promo-17an-nailart', true, now(), now()),
  ('promo-weekend', 'WEEKEND20', 'Weekend Nail Date', 'Diskon 20% untuk semua layanan, khusus weekend sepanjang Agustus.', 'percentage', 20, 50000, '2026-08-10', '2026-08-31', 50, 12, 200000, '[]', NULL, true, now(), now()),
  ('promo-newset', 'NEWSET30', 'Potongan Set Baru', 'Potongan Rp30.000 untuk setiap set gel extension atau press-on baru.', 'fixed', 30000, NULL, '2026-08-15', '2026-09-30', 0, 0, 180000, '["gel-extension","fake-nail"]', NULL, true, now(), now()),
  ('promo-earlybird', 'PAGI20', 'Early Bird Pagi', 'Diskon 20% untuk booking pertama di hari itu sebelum pukul 11.00.', 'percentage', 20, 40000, '2026-09-01', '2026-10-31', 30, 0, NULL, '[]', NULL, true, now(), now()),
  ('promo-haritani', 'HARITANI', 'Promo Hari Tani', 'Diskon 25% untuk semua layanan, khusus tanggal 24 September.', 'percentage', 25, 100000, '2026-09-24', '2026-09-24', 100, 0, NULL, '[]', NULL, true, now(), now()),
  ('promo-mayday', 'MAYDAY10', 'Promo Hari Buruh', 'Diskon 10% khusus periode Mei.', 'percentage', 10, NULL, '2026-05-01', '2026-05-31', 50, 50, NULL, '[]', 'promo-mayday-flowers', true, now(), now()),
  ('promo-newclient', 'NEWCLIENT', 'Welcome, First-Timer!', 'Potongan langsung Rp25.000 untuk booking pertamamu di Denailss.', 'fixed', 25000, NULL, '2026-07-01', '2026-09-30', 200, 128, NULL, '[]', 'promo-newclient-presson', true, now(), now())
ON CONFLICT (id) DO NOTHING;
