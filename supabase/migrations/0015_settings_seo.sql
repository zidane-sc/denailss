-- Settings SEO fields (hand-authored): editable meta title/description/OG image.

ALTER TABLE public.settings
  ADD COLUMN IF NOT EXISTS meta_title text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS meta_description text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS og_image text;
