-- Reviews table + RLS (hand-authored). One review per completed appointment.

CREATE TABLE IF NOT EXISTS public.reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  appointment_id uuid NOT NULL REFERENCES public.appointments(id) ON DELETE CASCADE,
  customer_id uuid NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  service_slug text NOT NULL,
  rating integer NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment text NOT NULL,
  photo_seed text,
  created_at timestamp with time zone DEFAULT now() NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS reviews_appointment_unique ON public.reviews(appointment_id);
CREATE INDEX IF NOT EXISTS reviews_customer_idx ON public.reviews(customer_id);
CREATE INDEX IF NOT EXISTS reviews_service_idx ON public.reviews(service_slug);

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY reviews_public_read ON public.reviews
  FOR SELECT TO anon, authenticated
  USING (true);

CREATE POLICY reviews_owner_write ON public.reviews
  FOR ALL TO authenticated
  USING (public.current_user_role() = 'owner')
  WITH CHECK (public.current_user_role() = 'owner');

-- Customers can review their own completed bookings.
CREATE POLICY reviews_insert_self ON public.reviews
  FOR INSERT TO authenticated
  WITH CHECK (customer_id = auth.uid());
