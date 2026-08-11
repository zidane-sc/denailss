-- Backfill gallery_images for the 20 seeded gallery designs.
--
-- The seed designs (des-01..des-20) were created before the gallery_images
-- table existed; their photos lived only in the frontend seed (semantic keys
-- resolved by imageUrl()). This migration persists each design's ordered
-- image list as gallery_images rows so the DB catalog is the source of truth.
--
-- storage_path stores the legacy semantic key (e.g. "den-milk-1") — the API
-- treats non-"storage:" references as opaque, and imageUrl() still resolves
-- them to the bundled assets under public/images.
--
-- Idempotent: re-running only fills gaps (ON CONFLICT DO NOTHING is not
-- possible without a unique constraint, so we guard per-row with NOT EXISTS).

INSERT INTO public.gallery_images (gallery_id, storage_path, sort_order, created_at, updated_at)
SELECT g.id, v.path, v.sort_order, now(), now()
FROM public.gallery g
JOIN (VALUES
  ('korean-milk-nail',        'den-milk-1', 0),
  ('korean-milk-nail',        'den-milk-2', 1),
  ('classic-french-tip',      'den-french-1', 0),
  ('classic-french-tip',      'den-french-2', 1),
  ('chrome-mirror-silver',    'den-chrome-1', 0),
  ('sunset-ombre-coral',      'den-ombre-1', 0),
  ('sunset-ombre-coral',      'den-ombre-2', 1),
  ('3d-bow-charm-pink',       'den-bow-1', 0),
  ('3d-bow-charm-pink',       'den-bow-2', 1),
  ('minimalist-line-art',     'den-line-1', 0),
  ('wedding-pearl-french',    'den-wedding-1', 0),
  ('wedding-pearl-french',    'den-wedding-2', 1),
  ('gold-foil-luxe',          'den-gold-1', 0),
  ('cherry-red-glossy',       'den-red-1', 0),
  ('cherry-red-glossy',       'den-red-2', 1),
  ('pastel-cloud-korean',     'den-cloud-1', 0),
  ('graduation-star-charm',   'den-grad-1', 0),
  ('graduation-star-charm',   'den-grad-2', 1),
  ('black-chrome-edge',       'den-black-1', 0),
  ('milky-french-almond',     'den-milkyfrench-1', 0),
  ('milky-french-almond',     'den-milkyfrench-2', 1),
  ('festive-red-gold-flake',  'den-festive-1', 0),
  ('sky-blue-ombre',          'den-skyblue-1', 0),
  ('sky-blue-ombre',          'den-skyblue-2', 1),
  ('matte-nude-minimal',      'den-mattenude-1', 0),
  ('party-glitter-fuchsia',   'den-fuchsia-1', 0),
  ('party-glitter-fuchsia',   'den-fuchsia-2', 1),
  ('wedding-lace-white',      'den-lace-1', 0),
  ('korean-jelly-pink',       'den-jelly-1', 0),
  ('korean-jelly-pink',       'den-jelly-2', 1),
  ('graduation-navy-gold',    'den-navy-1', 0)
) AS v(slug, path, sort_order) ON g.slug = v.slug
WHERE NOT EXISTS (
  SELECT 1 FROM public.gallery_images gi
  WHERE gi.gallery_id = g.id AND gi.storage_path = v.path
);
