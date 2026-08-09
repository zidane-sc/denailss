ALTER TABLE public.users
  ADD CONSTRAINT users_id_auth_users_fk
  FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;

CREATE UNIQUE INDEX customers_user_id_unique
  ON public.customers(user_id)
  WHERE user_id IS NOT NULL;

CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.users (id, role, name)
  VALUES (
    NEW.id,
    'customer',
    COALESCE(NULLIF(NEW.raw_user_meta_data ->> 'full_name', ''), NULLIF(NEW.raw_user_meta_data ->> 'name', ''), COALESCE(NEW.email, 'Pengguna Denailss'))
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_auth_user();

CREATE OR REPLACE FUNCTION public.current_user_role()
RETURNS public.user_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.users WHERE id = auth.uid();
$$;

REVOKE ALL ON FUNCTION public.current_user_role() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.current_user_role() TO anon, authenticated;

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointment_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY users_select_self_or_owner ON public.users
  FOR SELECT TO authenticated
  USING (id = auth.uid() OR public.current_user_role() = 'owner');

CREATE POLICY users_update_self_safe ON public.users
  FOR UPDATE TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid() AND role = public.current_user_role());

CREATE POLICY users_owner_all ON public.users
  FOR ALL TO authenticated
  USING (public.current_user_role() = 'owner')
  WITH CHECK (public.current_user_role() = 'owner');

CREATE POLICY customers_owner_all ON public.customers
  FOR ALL TO authenticated
  USING (public.current_user_role() = 'owner')
  WITH CHECK (public.current_user_role() = 'owner');

CREATE POLICY customers_select_self ON public.customers
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY customers_update_self_safe ON public.customers
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY appointments_owner_all ON public.appointments
  FOR ALL TO authenticated
  USING (public.current_user_role() = 'owner')
  WITH CHECK (public.current_user_role() = 'owner');

CREATE POLICY appointments_select_self ON public.appointments
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.customers
      WHERE customers.id = appointments.customer_id
        AND customers.user_id = auth.uid()
    )
  );

CREATE POLICY appointment_services_owner_all ON public.appointment_services
  FOR ALL TO authenticated
  USING (public.current_user_role() = 'owner')
  WITH CHECK (public.current_user_role() = 'owner');

CREATE POLICY appointment_services_select_self ON public.appointment_services
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.appointments
      JOIN public.customers ON customers.id = appointments.customer_id
      WHERE appointments.id = appointment_services.appointment_id
        AND customers.user_id = auth.uid()
    )
  );

CREATE POLICY services_public_active_read ON public.services
  FOR SELECT TO anon, authenticated
  USING (active = true OR public.current_user_role() = 'owner');

CREATE POLICY services_owner_write ON public.services
  FOR ALL TO authenticated
  USING (public.current_user_role() = 'owner')
  WITH CHECK (public.current_user_role() = 'owner');

CREATE POLICY gallery_public_read ON public.gallery
  FOR SELECT TO anon, authenticated
  USING (true);

CREATE POLICY gallery_owner_write ON public.gallery
  FOR ALL TO authenticated
  USING (public.current_user_role() = 'owner')
  WITH CHECK (public.current_user_role() = 'owner');

CREATE POLICY gallery_images_public_read ON public.gallery_images
  FOR SELECT TO anon, authenticated
  USING (true);

CREATE POLICY gallery_images_owner_write ON public.gallery_images
  FOR ALL TO authenticated
  USING (public.current_user_role() = 'owner')
  WITH CHECK (public.current_user_role() = 'owner');
