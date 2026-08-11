-- Settings table + RLS + seed row (hand-authored, matches 0001/0003 style).
--
-- Business profile, social media, and policy text owned by the studio. A
-- single row (id = 'site') holds the current settings; the owner edits it
-- through GET/PUT /api/v1/settings.

CREATE TABLE IF NOT EXISTS public.settings (
  id text PRIMARY KEY NOT NULL,
  business_name text NOT NULL,
  logo text,
  description text NOT NULL DEFAULT '',
  address text NOT NULL DEFAULT '',
  instagram text NOT NULL DEFAULT '',
  tiktok text NOT NULL DEFAULT '',
  whatsapp text NOT NULL DEFAULT '',
  cancellation_policy text NOT NULL DEFAULT '',
  deposit_policy text NOT NULL DEFAULT '',
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS settings_id_idx ON public.settings(id);

ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

-- Public read (anon + authenticated) so the public site can consume settings
-- later without auth; owner can read/write.
CREATE POLICY settings_public_read ON public.settings
  FOR SELECT TO anon, authenticated
  USING (true);

CREATE POLICY settings_owner_write ON public.settings
  FOR ALL TO authenticated
  USING (public.current_user_role() = 'owner')
  WITH CHECK (public.current_user_role() = 'owner');

-- Seed the single row from the current business constants (idempotent).
INSERT INTO public.settings (id, business_name, logo, description, address, instagram, tiktok, whatsapp, cancellation_policy, deposit_policy, created_at, updated_at)
VALUES (
  'site',
  'Denailss',
  NULL,
  'Nail art rumahan untuk kamu yang suka detail kecil yang bikin penampilan terasa lebih spesial.',
  'Jl. Petojo Binatu, Jakarta Pusat',
  'denailss_9',
  'denails10',
  '6281234567890',
  'Pembatalan atau reschedule kurang dari 24 jam sebelum jadwal dikenakan ketentuan pembatalan. Kabari lewat WhatsApp secepatnya supaya slot bisa dipakai customer lain.',
  'Deposit wajib ditransfer dalam 1 jam setelah booking untuk mengamankan slot. Deposit akan dipotong dari total pembayaran setelah treatment selesai.',
  now(),
  now()
)
ON CONFLICT (id) DO NOTHING;
