-- Deposit upload tracking table (hand-authored, matches 0001/0003 style).
--
-- Tracks deposit-proof uploads that are not yet attached to an appointment
-- (uploaded in the booking form but abandoned/replaced/removed before submit).
-- A periodic cleanup deletes storage objects older than a retention window and
-- clears their rows. Rows for proofs attached to an appointment are deleted
-- when the appointment is created or the proof is rejected.

CREATE TABLE IF NOT EXISTS public.deposit_uploads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  reference text NOT NULL,
  file_name text NOT NULL,
  content_type text NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS deposit_uploads_created_at_idx ON public.deposit_uploads(created_at);

-- Insert/delete by the API (service-role); no RLS policy needed for anon/customers.
ALTER TABLE public.deposit_uploads ENABLE ROW LEVEL SECURITY;

CREATE POLICY deposit_uploads_owner_all ON public.deposit_uploads
  FOR ALL TO authenticated
  USING (public.current_user_role() = 'owner')
  WITH CHECK (public.current_user_role() = 'owner');
