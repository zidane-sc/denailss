-- Settings map coordinates (hand-authored): latitude/longitude used to build
-- the embedded Google Map on the contact page. Editable from the backoffice.

ALTER TABLE public.settings
  ADD COLUMN IF NOT EXISTS latitude double precision,
  ADD COLUMN IF NOT EXISTS longitude double precision;
