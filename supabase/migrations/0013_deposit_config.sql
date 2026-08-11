-- Deposit configuration persistence (hand-authored): single-row deposit engine config.
--
-- ADR-005: manual verification, no payment gateway in V1. Holds the deposit
-- enabled/type/value, bank + e-wallet account details, payment methods, and the
-- informational notes shown to customers.

CREATE TABLE IF NOT EXISTS public.deposit_config (
  id text PRIMARY KEY NOT NULL,
  enabled boolean NOT NULL DEFAULT true,
  type text NOT NULL,
  value integer NOT NULL,
  bank_account jsonb NOT NULL,
  e_wallet jsonb NOT NULL,
  payment_methods jsonb NOT NULL DEFAULT '[]'::jsonb,
  notes text NOT NULL DEFAULT '',
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE public.deposit_config ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS deposit_config_public_read ON public.deposit_config;
CREATE POLICY deposit_config_public_read ON public.deposit_config
  FOR SELECT TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS deposit_config_owner_write ON public.deposit_config;
CREATE POLICY deposit_config_owner_write ON public.deposit_config
  FOR ALL TO authenticated
  USING (public.current_user_role() = 'owner')
  WITH CHECK (public.current_user_role() = 'owner');

-- Seed the current values (idempotent).
INSERT INTO public.deposit_config (id, enabled, type, value, bank_account, e_wallet, payment_methods, notes, updated_at)
VALUES (
  'config',
  true,
  'percentage',
  30,
  '{"bank":"BCA","accountNumber":"1234567890","accountName":"Dela Denailss"}'::jsonb,
  '{"provider":"DANA","number":"0812-3456-7890","accountName":"Dela Denailss"}'::jsonb,
  '[{"id":"pm-1","type":"bank","name":"Mandiri","accountNumber":"987-654-3210","accountName":"Dela Denailss"},{"id":"pm-2","type":"ewallet","name":"DANA","accountNumber":"0812-3456-7890","accountName":"Dela Denailss"}]'::jsonb,
  'Deposit wajib ditransfer dalam 1 jam setelah booking untuk mengamankan slot. Deposit akan dipotong dari total pembayaran setelah treatment selesai.',
  now()
)
ON CONFLICT (id) DO NOTHING;
