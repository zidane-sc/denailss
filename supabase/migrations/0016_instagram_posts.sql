-- Instagram posts table + RLS + seed (hand-authored).
-- Owner-curated shortcodes rendered on the landing grid; public read, owner write.

CREATE TABLE IF NOT EXISTS public.instagram_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  shortcode text NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone DEFAULT now() NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS instagram_posts_shortcode_unique ON public.instagram_posts(shortcode);
CREATE INDEX IF NOT EXISTS instagram_posts_order_idx ON public.instagram_posts(sort_order);

ALTER TABLE public.instagram_posts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS instagram_posts_public_read ON public.instagram_posts;
CREATE POLICY instagram_posts_public_read ON public.instagram_posts
  FOR SELECT TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS instagram_posts_owner_write ON public.instagram_posts;
CREATE POLICY instagram_posts_owner_write ON public.instagram_posts
  FOR ALL TO authenticated
  USING (public.current_user_role() = 'owner')
  WITH CHECK (public.current_user_role() = 'owner');

-- Seed the current grid (idempotent).
INSERT INTO public.instagram_posts (shortcode, sort_order, created_at) VALUES
  ('Dbu1XBck4up', 0, now()),
  ('Dbu1FShk7lj', 1, now()),
  ('Dbpbb8EE_hT', 2, now()),
  ('DbpbQa0k0lz', 3, now()),
  ('DbD0iUDE5mm', 4, now()),
  ('DbAvYO6k4g5', 5, now())
ON CONFLICT (shortcode) DO NOTHING;
