-- Instagram handle (e.g. "@alya.xx") collected from customers and contact
-- messages (hand-authored, idempotent for re-runs).

ALTER TABLE public.customers
  ADD COLUMN IF NOT EXISTS instagram text;

ALTER TABLE public.contact_messages
  ADD COLUMN IF NOT EXISTS instagram text;
