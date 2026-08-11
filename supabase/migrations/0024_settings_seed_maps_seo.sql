-- Settings seed/backfill (hand-authored): the maps_url / latitude / longitude
-- columns (0021/0022) and the SEO columns (0015) were added by migrations but
-- never populated on the single 'site' row, so the app has been falling back to
-- the SITE constants (src/constants/site.ts). Backfill them so the owner sees
-- real editable values in /backoffice/settings and the public site consumes the
-- persisted row. Idempotent: fills each column only while it is still empty.

UPDATE public.settings
SET
  maps_url = COALESCE(maps_url, 'https://maps.google.com/?q=Denailss+Nail+Art+Jakarta+Selatan'),
  latitude = COALESCE(latitude, -6.2088),
  longitude = COALESCE(longitude, 106.8456),
  meta_title = COALESCE(NULLIF(meta_title, ''), 'Denailss · Nail art & beauty space'),
  meta_description = COALESCE(NULLIF(meta_description, ''), 'Booking nail art, gel extension, dan perawatan tangan-kaki di Denailss, tempat nail art favorit yang bisa kamu book langsung dari HP.'),
  og_image = COALESCE(og_image, '/images/logo-horizontal.png'),
  updated_at = now()
WHERE id = 'site';
