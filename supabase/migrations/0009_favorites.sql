-- Customer favorites table + RLS (hand-authored).

CREATE TABLE IF NOT EXISTS public.customer_favorites (
  customer_id uuid NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  design_slug text NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  PRIMARY KEY (customer_id, design_slug)
);

CREATE INDEX IF NOT EXISTS customer_favorites_customer_idx ON public.customer_favorites(customer_id);

ALTER TABLE public.customer_favorites ENABLE ROW LEVEL SECURITY;

CREATE POLICY favorites_owner_write ON public.customer_favorites
  FOR ALL TO authenticated
  USING (public.current_user_role() = 'owner')
  WITH CHECK (public.current_user_role() = 'owner');

CREATE POLICY favorites_select_self ON public.customer_favorites
  FOR SELECT TO authenticated
  USING (customer_id = auth.uid());

CREATE POLICY favorites_insert_delete_self ON public.customer_favorites
  FOR INSERT TO authenticated
  WITH CHECK (customer_id = auth.uid());
