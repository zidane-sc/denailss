-- Availability config persistence (hand-authored): vacations + booking rules.
--
-- availability_templates / availability_overrides / blocked_times already exist
-- (0000). This adds the two missing pieces of the AvailabilityConfig shape.

CREATE TABLE IF NOT EXISTS public.availability_vacations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  start_date date NOT NULL,
  end_date date NOT NULL,
  reason text NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS availability_vacations_start_idx ON public.availability_vacations(start_date);

ALTER TABLE public.availability_vacations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS availability_vacations_public_read ON public.availability_vacations;
CREATE POLICY availability_vacations_public_read ON public.availability_vacations
  FOR SELECT TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS availability_vacations_owner_write ON public.availability_vacations;
CREATE POLICY availability_vacations_owner_write ON public.availability_vacations
  FOR ALL TO authenticated
  USING (public.current_user_role() = 'owner')
  WITH CHECK (public.current_user_role() = 'owner');

-- Single-row booking rules config.
CREATE TABLE IF NOT EXISTS public.booking_rules (
  id text PRIMARY KEY NOT NULL,
  booking_window_days integer NOT NULL DEFAULT 30,
  minimum_notice_hours integer NOT NULL DEFAULT 3,
  max_bookings_per_day integer NOT NULL DEFAULT 6,
  buffer_minutes integer NOT NULL DEFAULT 15,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE public.booking_rules ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS booking_rules_public_read ON public.booking_rules;
CREATE POLICY booking_rules_public_read ON public.booking_rules
  FOR SELECT TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS booking_rules_owner_write ON public.booking_rules;
CREATE POLICY booking_rules_owner_write ON public.booking_rules
  FOR ALL TO authenticated
  USING (public.current_user_role() = 'owner')
  WITH CHECK (public.current_user_role() = 'owner');

-- Seed (idempotent).
INSERT INTO public.availability_vacations (start_date, end_date, reason, created_at, updated_at)
VALUES ('2026-08-20', '2026-08-25', 'Cuti tahunan tim Denailss', now(), now());

INSERT INTO public.booking_rules (id, booking_window_days, minimum_notice_hours, max_bookings_per_day, buffer_minutes, updated_at)
VALUES ('rules', 30, 3, 6, 15, now())
ON CONFLICT (id) DO NOTHING;
