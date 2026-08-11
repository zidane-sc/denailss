-- Settings maps link (hand-authored): editable Google Maps URL used by the
-- public footer "Lihat lokasi di Maps" link and the contact page directions.

ALTER TABLE public.settings
  ADD COLUMN IF NOT EXISTS maps_url text;
